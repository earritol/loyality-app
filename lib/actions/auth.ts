'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ActionResult } from '@/lib/types'

export async function sendOtp(
  _prevState: ActionResult<{ email: string }>,
  formData: FormData
): Promise<ActionResult<{ email: string }>> {
  const email = formData.get('email') as string

  if (!email) {
    return { success: false, error: 'El email es requerido.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({ email })

  if (error) {
    console.warn('OTP send warning:', error.message)
  }

  redirect(`/verificar?email=${encodeURIComponent(email)}`)
}

export async function verifyOtp(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get('email') as string
  const token = formData.get('token') as string

  if (!email || !token) {
    return { success: false, error: 'El email y el código son requeridos.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) {
    return {
      success: false,
      error: 'El código es inválido o ha expirado. Intenta de nuevo.',
    }
  }

  if (data.user) {
    const { error: upsertError } = await supabase.from('users').upsert(
      {
        id: data.user.id,
        email: data.user.email!,
      },
      { onConflict: 'id' }
    )

    if (upsertError) {
      console.error('User upsert error:', upsertError)
      return {
        success: false,
        error: 'Cuenta verificada pero no se pudo crear el perfil. Intenta de nuevo.',
      }
    }
  }

  redirect('/inicio')
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/entrar')
}
