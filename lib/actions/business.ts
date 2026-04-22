'use server'

import { createClient } from '@/lib/supabase/server'
import type { Business } from '@/lib/types'

export async function getBusinessBySlug(
  slug: string
): Promise<Business | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single()

  return data
}

export async function checkIsBusinessAdmin(
  userId: string,
  businessId: string
): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_admins')
    .select('id')
    .eq('user_id', userId)
    .eq('business_id', businessId)
    .maybeSingle()

  return !!data
}

import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/types'

export async function updateBusiness(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const businessId = formData.get('businessId') as string
  const slug = formData.get('slug') as string
  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const logoFile = formData.get('logo') as File | null

  if (!name) return { success: false, error: 'El nombre es obligatorio' }
  if (name.length > 100) return { success: false, error: 'El nombre no puede tener más de 100 caracteres' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const isAdmin = await checkIsBusinessAdmin(user.id, businessId)
  if (!isAdmin) return { success: false, error: 'No tienes permisos para realizar esta acción' }

  let logoUrl: string | undefined

  // Upload logo if provided
  if (logoFile && logoFile.size > 0) {
    if (logoFile.size > 2 * 1024 * 1024) {
      return { success: false, error: 'La imagen no puede pesar más de 2MB' }
    }

    const ext = logoFile.name.split('.').pop()?.toLowerCase() ?? 'png'
    const path = `logos/${businessId}_${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('business-images')
      .upload(path, logoFile, { contentType: logoFile.type })

    if (uploadError) {
      console.error('Logo upload error', { userId: user.id, businessId, error: uploadError })
      return { success: false, error: 'Error al subir la imagen' }
    }

    const { data: urlData } = supabase.storage
      .from('business-images')
      .getPublicUrl(path)

    logoUrl = urlData.publicUrl
  }

  const updateData: Record<string, unknown> = { name, description }
  if (logoUrl) updateData.logo_url = logoUrl

  const { error } = await supabase
    .from('businesses')
    .update(updateData)
    .eq('id', businessId)

  if (error) {
    console.error('updateBusiness error', { userId: user.id, businessId, error })
    return { success: false, error: 'Error al actualizar el negocio' }
  }

  revalidatePath(`/${slug}/admin`)
  revalidatePath('/inicio')
  return { success: true }
}

import { businessSettingsSchema, addTeamMemberSchema, removeTeamMemberSchema } from '@/lib/validations/business'
import type { TeamMember } from '@/lib/types'

export async function updateBusinessSettings(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    businessId: formData.get('businessId') as string,
    programName: formData.get('programName') as string | null,
    rulesText: formData.get('rulesText') as string | null,
    termsText: formData.get('termsText') as string | null,
    maxVisitsPerDay: Number(formData.get('maxVisitsPerDay')),
  }

  const parsed = businessSettingsSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const isAdmin = await checkIsBusinessAdmin(user.id, parsed.data.businessId)
  if (!isAdmin) return { success: false, error: 'No tienes permisos para realizar esta acción' }

  const { error } = await supabase
    .from('businesses')
    .update({
      program_name: parsed.data.programName,
      rules_text: parsed.data.rulesText,
      terms_text: parsed.data.termsText,
      max_visits_per_day: parsed.data.maxVisitsPerDay,
    })
    .eq('id', parsed.data.businessId)

  if (error) {
    console.error('updateBusinessSettings error', { userId: user.id, error })
    return { success: false, error: 'Error al actualizar la configuración' }
  }

  const slug = formData.get('slug') as string
  revalidatePath(`/${slug}/admin/configurar`)
  return { success: true }
}

export async function addTeamMember(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    businessId: formData.get('businessId') as string,
    email: (formData.get('email') as string)?.trim().toLowerCase(),
  }

  const parsed = addTeamMemberSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  // Verify caller is owner
  const { data: callerAdmin } = await supabase
    .from('business_admins')
    .select('role')
    .eq('user_id', user.id)
    .eq('business_id', parsed.data.businessId)
    .single()

  if (!callerAdmin || callerAdmin.role !== 'owner') {
    return { success: false, error: 'No tienes permisos para realizar esta acción' }
  }

  // Find or create user
  let targetUserId: string
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', parsed.data.email)
    .maybeSingle()

  if (existingUser) {
    targetUserId = existingUser.id
  } else {
    const newId = crypto.randomUUID()
    const { error: createError } = await supabase
      .from('users')
      .insert({ id: newId, email: parsed.data.email, first_name: null, last_name: null })
    if (createError) {
      console.error('addTeamMember create user error', { error: createError })
      return { success: false, error: 'Error al crear el usuario' }
    }
    targetUserId = newId
  }

  // Link to business as staff
  const { error: linkError } = await supabase
    .from('business_admins')
    .insert({
      business_id: parsed.data.businessId,
      user_id: targetUserId,
      role: 'staff',
    })

  if (linkError) {
    if (linkError.code === '23505') {
      return { success: false, error: 'Este usuario ya forma parte del negocio' }
    }
    console.error('addTeamMember link error', { error: linkError })
    return { success: false, error: 'Error al agregar al equipo' }
  }

  const slug = formData.get('slug') as string
  revalidatePath(`/${slug}/admin/configurar`)
  return { success: true }
}

export async function removeTeamMember(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    businessId: formData.get('businessId') as string,
    userId: formData.get('userId') as string,
  }

  const parsed = removeTeamMemberSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: 'Datos inválidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  // Prevent self-removal
  if (parsed.data.userId === user.id) {
    return { success: false, error: 'No puedes eliminarte a ti mismo del negocio' }
  }

  // Verify caller is owner
  const { data: callerAdmin } = await supabase
    .from('business_admins')
    .select('role')
    .eq('user_id', user.id)
    .eq('business_id', parsed.data.businessId)
    .single()

  if (!callerAdmin || callerAdmin.role !== 'owner') {
    return { success: false, error: 'No tienes permisos para realizar esta acción' }
  }

  // Only remove staff, not owners
  const { error } = await supabase
    .from('business_admins')
    .delete()
    .eq('business_id', parsed.data.businessId)
    .eq('user_id', parsed.data.userId)
    .eq('role', 'staff')

  if (error) {
    console.error('removeTeamMember error', { error })
    return { success: false, error: 'Error al eliminar del equipo' }
  }

  const slug = formData.get('slug') as string
  revalidatePath(`/${slug}/admin/configurar`)
  return { success: true }
}

export async function getTeamMembers(businessId: string): Promise<TeamMember[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Use SECURITY DEFINER function to bypass RLS and get all team members
  const { data, error } = await supabase.rpc('get_team_members', {
    p_business_id: businessId,
  })

  if (error || !data) return []

  return (data as Array<{
    id: string; user_id: string; role: string; created_at: string
    email: string; first_name: string | null; last_name: string | null
  }>).map((row) => ({
    id: row.id,
    userId: row.user_id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role as 'owner' | 'staff',
    createdAt: row.created_at,
  }))
}
