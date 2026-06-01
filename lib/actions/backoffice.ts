'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createBusinessSchema, addPaymentSchema, updateStatusSchema } from '@/lib/validations/backoffice'
import type { ActionResult, Business } from '@/lib/types'

export async function checkIsPlatformAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('id', userId)
    .single()
  return data?.is_platform_admin === true
}

export async function getAllBusinesses(): Promise<ActionResult<(Business & { ownerEmail?: string })[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const isAdmin = await checkIsPlatformAdmin(user.id)
  if (!isAdmin) return { success: false, error: 'No tienes permisos para realizar esta acción' }

  const { data, error } = await supabase
    .from('businesses')
    .select('*, business_admins(user_id, role, users(email))')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getAllBusinesses error', { userId: user.id, error })
    return { success: false, error: 'Error al obtener los negocios' }
  }

  // Attach owner email to each business
  const enriched = (data ?? []).map((biz) => {
    const admins = biz.business_admins as unknown as Array<{ user_id: string; role: string; users: { email: string } | null }> | null
    const owner = admins?.find((a) => a.role === 'owner')
    const { business_admins, ...rest } = biz
    return { ...rest, ownerEmail: owner?.users?.email ?? undefined }
  })

  return { success: true, data: enriched }
}

export async function createBusinessWithOwner(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    name: formData.get('name') as string,
    slug: (formData.get('slug') as string)?.trim().toLowerCase(),
    ownerEmail: (formData.get('ownerEmail') as string)?.trim().toLowerCase(),
  }

  const parsed = createBusinessSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const isAdmin = await checkIsPlatformAdmin(user.id)
  if (!isAdmin) return { success: false, error: 'No tienes permisos para realizar esta acción' }

  // Create business
  const { data: newBiz, error: bizError } = await supabase
    .from('businesses')
    .insert({ name: parsed.data.name, slug: parsed.data.slug, status: 'active' })
    .select('id')
    .single()

  if (bizError) {
    if (bizError.code === '23505') {
      return { success: false, error: 'Este slug ya está en uso' }
    }
    console.error('createBusinessWithOwner biz error', { userId: user.id, error: bizError })
    return { success: false, error: 'Error al crear el negocio' }
  }

  // Find or create owner user
  // NOTE: In rare race conditions, duplicate users could be created.
  // Acceptable for MVP. Future improvement: enforce UNIQUE(email) at DB level.
  let ownerId: string
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', parsed.data.ownerEmail)
    .maybeSingle()

  if (existingUser) {
    ownerId = existingUser.id
  } else {
    const newId = crypto.randomUUID()
    const { error: userError } = await supabase
      .from('users')
      .insert({ id: newId, email: parsed.data.ownerEmail, first_name: null, last_name: null })
    if (userError) {
      // Cleanup: delete the business we just created
      await supabase.from('businesses').delete().eq('id', newBiz.id)
      console.error('createBusinessWithOwner user error', { userId: user.id, error: userError })
      return { success: false, error: 'Error al crear el usuario dueño' }
    }
    ownerId = newId
  }

  // Link owner
  const { error: linkError } = await supabase
    .from('business_admins')
    .insert({ business_id: newBiz.id, user_id: ownerId, role: 'owner' })

  if (linkError) {
    // Cleanup: delete the business
    await supabase.from('businesses').delete().eq('id', newBiz.id)
    if (linkError.code === '23505') {
      return { success: false, error: 'Este usuario ya es administrador de este negocio' }
    }
    console.error('createBusinessWithOwner link error', { userId: user.id, error: linkError })
    return { success: false, error: 'Error al vincular el dueño. El negocio no fue creado.' }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function addPayment(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    businessId: formData.get('businessId') as string,
    amount: Number(formData.get('amount')),
    paymentDate: formData.get('paymentDate') as string,
    method: formData.get('method') as string,
    notes: formData.get('notes') as string | null,
  }

  const parsed = addPaymentSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const isAdmin = await checkIsPlatformAdmin(user.id)
  if (!isAdmin) return { success: false, error: 'No tienes permisos para realizar esta acción' }

  // Check for duplicate payment (application-level)
  const { data: existing } = await supabase
    .from('payments')
    .select('id')
    .eq('business_id', parsed.data.businessId)
    .eq('payment_date', parsed.data.paymentDate)
    .eq('amount', parsed.data.amount)
    .maybeSingle()

  if (existing) {
    return { success: false, error: 'Este pago ya fue registrado' }
  }

  // Insert payment
  const { error: payError } = await supabase.from('payments').insert({
    business_id: parsed.data.businessId,
    amount: parsed.data.amount,
    payment_date: parsed.data.paymentDate,
    method: parsed.data.method,
    notes: parsed.data.notes,
  })

  if (payError) {
    console.error('addPayment error', { userId: user.id, businessId: parsed.data.businessId, error: payError })
    return { success: false, error: 'Error al registrar el pago' }
  }

  // Update business status + last_payment_date
  const { error: updateError } = await supabase
    .from('businesses')
    .update({ status: 'active', last_payment_date: parsed.data.paymentDate })
    .eq('id', parsed.data.businessId)

  if (updateError) {
    console.error('addPayment update error', { userId: user.id, businessId: parsed.data.businessId, error: updateError })
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function updateBusinessStatus(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    businessId: formData.get('businessId') as string,
    status: formData.get('status') as string,
  }

  const parsed = updateStatusSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Estatus inválido' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const isAdmin = await checkIsPlatformAdmin(user.id)
  if (!isAdmin) return { success: false, error: 'No tienes permisos para realizar esta acción' }

  const { error } = await supabase
    .from('businesses')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.businessId)

  if (error) {
    console.error('updateBusinessStatus error', { userId: user.id, businessId: parsed.data.businessId, error })
    return { success: false, error: 'Error al actualizar el estatus' }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function updateBusinessFromBackoffice(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const businessId = formData.get('businessId') as string
  const name = (formData.get('name') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim().toLowerCase()
  const description = (formData.get('description') as string)?.trim() || null
  const billingCutoffDay = formData.get('billingCutoffDay') ? Number(formData.get('billingCutoffDay')) : null

  if (!name) return { success: false, error: 'El nombre es obligatorio' }
  if (!slug) return { success: false, error: 'El slug es obligatorio' }
  if (billingCutoffDay !== null && (billingCutoffDay < 1 || billingCutoffDay > 31)) {
    return { success: false, error: 'El día de corte debe ser entre 1 y 31' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const isAdmin = await checkIsPlatformAdmin(user.id)
  if (!isAdmin) return { success: false, error: 'No tienes permisos para realizar esta acción' }

  const { error } = await supabase
    .from('businesses')
    .update({
      name,
      slug,
      description,
      billing_cutoff_day: billingCutoffDay,
    })
    .eq('id', businessId)

  if (error) {
    if (error.code === '23505') return { success: false, error: 'Este slug ya está en uso' }
    console.error('updateBusinessFromBackoffice error', { userId: user.id, businessId, error })
    return { success: false, error: 'Error al actualizar el negocio' }
  }

  revalidatePath('/admin')
  return { success: true }
}


export async function updateBusinessOwner(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const businessId = formData.get('businessId') as string
  const ownerEmail = (formData.get('ownerEmail') as string)?.trim().toLowerCase()

  if (!businessId || !ownerEmail) {
    return { success: false, error: 'Negocio y email del dueño son requeridos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const isAdmin = await checkIsPlatformAdmin(user.id)
  if (!isAdmin) return { success: false, error: 'No tienes permisos para realizar esta acción' }

  // Find or create the new owner user
  let ownerId: string
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', ownerEmail)
    .maybeSingle()

  if (existingUser) {
    ownerId = existingUser.id
  } else {
    const newId = crypto.randomUUID()
    const { error: userError } = await supabase
      .from('users')
      .insert({ id: newId, email: ownerEmail, first_name: null, last_name: null })
    if (userError) {
      console.error('updateBusinessOwner user error', { userId: user.id, error: userError })
      return { success: false, error: 'Error al crear el usuario dueño' }
    }
    ownerId = newId
  }

  // Remove current owner(s)
  const { error: deleteError } = await supabase
    .from('business_admins')
    .delete()
    .eq('business_id', businessId)
    .eq('role', 'owner')

  if (deleteError) {
    console.error('updateBusinessOwner delete error', { userId: user.id, error: deleteError })
    return { success: false, error: 'Error al remover el dueño anterior' }
  }

  // Insert new owner
  const { error: insertError } = await supabase
    .from('business_admins')
    .insert({ business_id: businessId, user_id: ownerId, role: 'owner' })

  if (insertError) {
    if (insertError.code === '23505') {
      // User is already an admin, just update their role
      await supabase
        .from('business_admins')
        .update({ role: 'owner' })
        .eq('business_id', businessId)
        .eq('user_id', ownerId)
    } else {
      console.error('updateBusinessOwner insert error', { userId: user.id, error: insertError })
      return { success: false, error: 'Error al asignar el nuevo dueño' }
    }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/negocios')
  return { success: true }
}
