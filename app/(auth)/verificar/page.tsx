'use client'

import { Suspense } from 'react'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { verifyOtp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import type { ActionResult } from '@/lib/types'

const initialState: ActionResult = { success: false }

function VerifyForm() {
  const [state, action, pending] = useActionState(verifyOtp, initialState)
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''

  return (
    <Card className="w-full max-w-[400px]">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gana-text">Revisa tu email</h1>
        <p className="mt-1 text-sm text-gana-muted">
          Ingresa el código que enviamos a{' '}
          {email ? <span className="font-semibold text-gana-text">{email}</span> : 'tu email'}.
        </p>
      </div>
      <form action={action} className="space-y-4">
        <input type="hidden" name="email" value={email} />
        <Input
          id="token"
          name="token"
          type="text"
          inputMode="numeric"
          label="Código"
          placeholder="123456"
          required
          autoFocus
          error={state.error}
          className="text-center text-lg tracking-widest"
        />
        <Button type="submit" loading={pending}>
          Verificar
        </Button>
      </form>
    </Card>
  )
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gana-bg flex items-center justify-center px-4">
      <Suspense fallback={
        <Card className="w-full max-w-[400px] text-center">
          <p className="text-gana-muted">Cargando...</p>
        </Card>
      }>
        <VerifyForm />
      </Suspense>
    </div>
  )
}
