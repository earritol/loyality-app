'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/types'

type QuickRegisterResult = {
  userId: string
  email: string
}

export async function quickRegisterUser(
  email: string
): Promise<ActionResult<QuickRegisterResult>> {
  const trimmed = email.trim().toLowerCase()

  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { success: false, error: 'Email inválido' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  // Check if already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', trimmed)
    .maybeSingle()

  if (existing) {
    return { success: false, error: 'Este email ya está registrado' }
  }

  // Create user with a generated UUID (they'll link to auth on first OTP login)
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ id: crypto.randomUUID(), email: trimmed })
    .select('id, email')
    .single()

  if (error) {
    console.error('quickRegisterUser error', { error })
    return { success: false, error: 'Error al registrar el cliente' }
  }

  return {
    success: true,
    data: { userId: newUser.id, email: newUser.email },
  }
}
