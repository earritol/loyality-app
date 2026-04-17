'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ActionResult } from '@/lib/types'

export async function sendOtp(
  _prevState: ActionResult<{ email: string }>,
  formData: FormData
): Promise<ActionResult<{ email: string }>> {
  const email = formData.get('email') as string
  console.log('ENV URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log(email)
  if (!email) {
    return { success: false, error: 'Email is required.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({ email })

  if (error) {
    console.warn('OTP send warning:', error.message)
    // no bloquees el flujo
  }

  redirect(`/verify?email=${encodeURIComponent(email)}`)
}

export async function verifyOtp(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get('email') as string
  const token = formData.get('token') as string
  console.log('email:', email)
  console.log('token:', token)
  if (!email || !token) {
    return { success: false, error: 'Email and OTP code are required.' }
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
      error: 'The code you entered is invalid or expired. Please try again.',
    }
  }

  // Upsert user record on first login
  if (data.user) {
    const { error: upsertError } = await supabase.from('users').upsert(
      {
        id: data.user.id,
        email: data.user.email!,
      },
      { onConflict: 'id' }
    )

    if (upsertError) {
      return {
        success: false,
        error: 'Account verified but failed to create user profile. Please try again.',
      }
    }
  }

  redirect('/dashboard')
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
