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
  if (!isAdmin) return { success: false, error: 'No autorizado' }

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
