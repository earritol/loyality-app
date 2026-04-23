'use client'

import { useState, useActionState } from 'react'
import { updateBusinessFromBackoffice } from '@/lib/actions/backoffice'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { ActionResult, Business } from '@/lib/types'

const initial: ActionResult = { success: false }

type Props = {
  business: Business
  onClose: () => void
}

export function EditBusinessForm({ business, onClose }: Props) {
  const [state, formAction, isPending] = useActionState(updateBusinessFromBackoffice, initial)

  if (state.success) {
    setTimeout(() => onClose(), 0)
  }

  return (
    <form action={formAction} className="mt-3 space-y-3 p-3 rounded-xl border border-gana-border bg-gana-bg">
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

      <Input label="Día de corte (1-31, opcional)" id={`edit-cutoff-${business.id}`} name="billingCutoffDay"
        type="number" min="1" max="31" defaultValue={business.billing_cutoff_day?.toString() ?? ''} placeholder="Sin fecha de corte" />

      {state.error && <p className="text-xs text-gana-error">{state.error}</p>}

      <div className="flex gap-2">
        <Button type="submit" loading={isPending} className="w-auto px-4">Guardar</Button>
        <Button type="button" variant="secondary" onClick={onClose} className="w-auto px-4">Cancelar</Button>
      </div>
    </form>
  )
}
