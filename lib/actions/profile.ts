'use server'

import { createClient } from '@/lib/supabase/server'
import { updateProfileSchema } from '@/lib/validations/profile'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/types'

export async function updateProfile(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  const raw = {
    firstName: formData.get('firstName') as string | null,
    lastName: formData.get('lastName') as string | null,
    phone: formData.get('phone') as string | null,
  }

  const parsed = updateProfileSchema.safeParse(raw)

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos'
    return { success: false, error: firstError }
  }

  const { firstName, lastName, phone } = parsed.data

  const { error } = await supabase
    .from('users')
    .update({
      first_name: firstName,
      last_name: lastName,
      phone,
    })
    .eq('id', user.id)

  if (error) {
    return { success: false, error: 'Error al actualizar el perfil' }
  }

  revalidatePath('/perfil')
  revalidatePath('/inicio')
  return { success: true }
}
