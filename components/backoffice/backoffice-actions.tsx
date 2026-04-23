'use client'

import { useState, useActionState } from 'react'
import { updateBusinessStatus, addPayment } from '@/lib/actions/backoffice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EditBusinessForm } from '@/components/backoffice/edit-business-form'
import type { ActionResult, Business } from '@/lib/types'

const initial: ActionResult = { success: false }

type Props = {
  business: Business
  currentStatus: string
}

export function BackofficeActions({ business, currentStatus }: Props) {
  const [showPayment, setShowPayment] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [statusState, statusAction, statusPending] = useActionState(updateBusinessStatus, initial)
  const [payState, payAction, payPending] = useActionState(addPayment, initial)

  const businessId = business.id

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        {/* Status change */}
        <form action={statusAction} className="flex items-center gap-2">
          <input type="hidden" name="businessId" value={businessId} />
          <select name="status" defaultValue={currentStatus}
            className="rounded-lg border border-gana-border bg-gana-input-bg text-gana-input-text px-2 py-1.5 text-xs">
            <option value="active">Activa</option>
            <option value="past_due">Pago pendiente</option>
            <option value="suspended">Suspendida</option>
          </select>
          <Button type="submit" variant="secondary" loading={statusPending} className="w-auto px-3 py-1.5 text-xs">
            Cambiar
          </Button>
        </form>

        <button type="button" onClick={() => setShowPayment(!showPayment)}
          className="text-xs text-gana-green hover:underline">
          {showPayment ? 'Cancelar pago' : '+ Registrar pago'}
        </button>

        <button type="button" onClick={() => setShowEdit(!showEdit)}
          className="text-xs text-gana-muted hover:text-gana-text">
          {showEdit ? 'Cancelar edición' : '✏️ Editar'}
        </button>
      </div>

      {statusState.error && <p className="text-xs text-gana-error">{statusState.error}</p>}
      {statusState.success && <p className="text-xs text-gana-success">Estatus actualizado</p>}

      {/* Payment form */}
      {showPayment && (
        <form action={payAction} className="mt-2 p-3 rounded-xl border border-gana-border bg-gana-bg space-y-2">
          <input type="hidden" name="businessId" value={businessId} />
          <div className="grid grid-cols-2 gap-2">
            <Input label="Monto" id={`amount-${businessId}`} name="amount" type="number" min="1" step="0.01" required placeholder="500" />
            <Input label="Fecha" id={`date-${businessId}`} name="paymentDate" type="date" required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gana-text mb-1">Método</label>
              <select name="method" required
                className="w-full rounded-xl border border-gana-border bg-gana-input-bg text-gana-input-text px-4 py-2.5 text-sm">
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>
            <Input label="Notas (opcional)" id={`notes-${businessId}`} name="notes" placeholder="Referencia..." />
          </div>
          {payState.error && <p className="text-xs text-gana-error">{payState.error}</p>}
          {payState.success && <p className="text-xs text-gana-success">Pago registrado</p>}
          <Button type="submit" loading={payPending} className="w-auto px-4">Registrar pago</Button>
        </form>
      )}

      {/* Edit form */}
      {showEdit && (
        <EditBusinessForm business={business} onClose={() => setShowEdit(false)} />
      )}
    </div>
  )
}
