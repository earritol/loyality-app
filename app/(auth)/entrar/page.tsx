'use client'

import { useActionState } from 'react'
import { sendOtp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import type { ActionResult } from '@/lib/types'

const initialState: ActionResult<{ email: string }> = { success: false }

export default function LoginPage() {
  const [state, action, pending] = useActionState(sendOtp, initialState)

  return (
    <div className="min-h-screen bg-gana-bg flex items-center justify-center px-4">
      <Card className="w-full max-w-[400px]">
        <div className="text-center mb-6">
          <Image
            src="/logo-gana.png"
            alt="GANA"
            width={220}
            height={73}
            className="mx-auto dark:hidden"
            priority
          />
          <Image
            src="/logo-gana-dark.png"
            alt="GANA"
            width={220}
            height={73}
            className="mx-auto hidden dark:block"
            priority
          />
          <p className="mt-3 text-sm text-gana-muted">
            Gana recompensas por tus visitas
          </p>
        </div>
        <form action={action} className="space-y-4">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="tu@ejemplo.com"
            required
            error={state.error}
          />
          <Button type="submit" loading={pending}>
            Enviar código
          </Button>
        </form>
      </Card>
    </div>
  )
}
