'use client'

import { useActionState } from 'react'
import { createBusinessWithOwner } from '@/lib/actions/backoffice'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { ActionResult } from '@/lib/types'

const initial: ActionResult = { success: false }

export function CreateBusinessForm() {
  const [state, formAction, isPending] = useActionState(createBusinessWithOwner, initial)

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input label="Nombre" id="name" name="name" required placeholder="Mi Negocio" maxLength={100} />
        <Input label="Slug (URL)" id="slug" name="slug" required placeholder="mi-negocio" maxLength={50} />
        <Input label="Email del dueño" id="ownerEmail" name="ownerEmail" type="email" required placeholder="dueño@email.com" />
      </div>
      {state.error && <p className="text-xs text-gana-error">{state.error}</p>}
      {state.success && <p className="text-xs text-gana-success">Negocio creado correctamente</p>}
      <Button type="submit" loading={isPending} className="w-auto px-6">Crear negocio</Button>
    </form>
  )
}
