'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/lib/actions/profile'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { ActionResult } from '@/lib/types'

type Props = {
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
}

const initialState: ActionResult = { success: false }

export function ProfileForm({ email, firstName, lastName, phone }: Props) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <Input
        label="Correo electrónico"
        value={email}
        disabled
        className="opacity-60"
      />
      {!email && (
        <p className="text-xs text-gana-muted -mt-2">
          <a href="/perfil" className="underline underline-offset-2">Agregar correo</a> para recibir notificaciones
        </p>
      )}

      <Input
        label="Nombre(s)"
        id="firstName"
        name="firstName"
        placeholder="Ej: Juan Carlos"
        defaultValue={firstName ?? ''}
      />

      <Input
        label="Apellido(s)"
        id="lastName"
        name="lastName"
        placeholder="Ej: García López"
        defaultValue={lastName ?? ''}
      />

      <Input
        label="Teléfono"
        id="phone"
        name="phone"
        type="tel"
        placeholder="+521234567890"
        defaultValue={phone ?? ''}
      />
      {!phone && (
        <p className="text-xs text-gana-muted -mt-2">
          Agrega tu teléfono para iniciar sesión más rápido en el futuro
        </p>
      )}

      {state.error && (
        <p className="text-xs text-gana-error">{state.error}</p>
      )}

      {state.success && (
        <p className="text-xs text-gana-success">Perfil actualizado correctamente</p>
      )}

      <Button type="submit" loading={isPending}>
        Guardar cambios
      </Button>
    </form>
  )
}
