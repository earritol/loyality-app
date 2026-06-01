'use client'

import { useActionState } from 'react'
import { updateBusinessFromBackoffice, updateBusinessOwner } from '@/lib/actions/backoffice'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { ActionResult, Business } from '@/lib/types'

const initial: ActionResult = { success: false }

type Props = {
  business: Business & { ownerEmail?: string }
  onClose: () => void
}

export function EditBusinessForm({ business, onClose }: Props) {
  const [state, formAction, isPending] = useActionState(updateBusinessFromBackoffice, initial)
  const [ownerState, ownerAction, ownerPending] = useActionState(updateBusinessOwner, initial)

  if (state.success) {
    setTimeout(() => onClose(), 0)
  }

  return (
    <div className="mt-3 space-y-4 p-3 rounded-xl border border-gana-border bg-gana-bg">
      {/* Business details form */}
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="businessId" value={business.id} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Nombre" id={`edit-name-${business.id}`} name="name" defaultValue={business.name} required maxLength={100} />
          <Input label="Slug (URL)" id={`edit-slug-${business.id}`} name="slug" defaultValue={business.slug ?? ''} required maxLength={50} />
        </div>

        <div>
          <label htmlFor={`edit-desc-${business.id}`} className="block text-sm font-medium text-gana-text mb-1">Descripción</label>
          <textarea id={`edit-desc-${business.id}`} name="description" defaultValue={business.description ?? ''} rows={2} maxLength={500}
            className="block w-full rounded-xl border border-gana-border bg-gana-input-bg text-gana-input-text px-4 py-2.5 text-sm placeholder:text-gana-placeholder focus:outline-none focus:ring-2 focus:ring-gana-green/20" />
        </div>

        <Input label="Día de pago (1-31, opcional)" id={`edit-cutoff-${business.id}`} name="billingCutoffDay"
          type="number" min="1" max="31" defaultValue={business.billing_cutoff_day?.toString() ?? ''} placeholder="Sin fecha de pago" />

        {state.error && <p className="text-xs text-gana-error">{state.error}</p>}
        {state.success && <p className="text-xs text-gana-success">Negocio actualizado</p>}

        <div className="flex gap-2">
          <Button type="submit" loading={isPending} className="w-auto px-4">Guardar</Button>
          <Button type="button" variant="secondary" onClick={onClose} className="w-auto px-4">Cancelar</Button>
        </div>
      </form>

      {/* Owner change form (separate action) */}
      <form action={ownerAction} className="pt-3 border-t border-gana-border space-y-3">
        <input type="hidden" name="businessId" value={business.id} />
        <Input
          label="Dueño (email)"
          id={`edit-owner-${business.id}`}
          name="ownerEmail"
          type="email"
          defaultValue={business.ownerEmail ?? ''}
          placeholder="dueño@email.com"
          required
        />
        {ownerState.error && <p className="text-xs text-gana-error">{ownerState.error}</p>}
        {ownerState.success && <p className="text-xs text-gana-success">Dueño actualizado</p>}
        <Button type="submit" variant="secondary" loading={ownerPending} className="w-auto px-4">
          Cambiar dueño
        </Button>
      </form>
    </div>
  )
}
