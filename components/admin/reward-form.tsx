'use client'

import { useState, useActionState } from 'react'
import { createReward, updateReward } from '@/lib/actions/rewards'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RewardPreview } from '@/components/admin/reward-preview'
import type { ActionResult, Reward } from '@/lib/types'

type Props = {
  businessId: string
  slug: string
  reward?: Reward
  onClose: () => void
}

const initial: ActionResult = { success: false }

export function RewardForm({ businessId, slug, reward, onClose }: Props) {
  const isEdit = !!reward
  const action = isEdit ? updateReward : createReward

  const [state, formAction, isPending] = useActionState(action, initial)
  const [name, setName] = useState(reward?.name ?? '')
  const [description, setDescription] = useState(reward?.description ?? '')
  const [visits, setVisits] = useState(reward?.required_visits?.toString() ?? '')
  const [expiresAt, setExpiresAt] = useState(reward?.expires_at ? reward.expires_at.split('T')[0] : '')
  const [maxRedemptions, setMaxRedemptions] = useState(reward?.max_redemptions_per_user?.toString() ?? '')

  // Close on success
  if (state.success) {
    setTimeout(() => onClose(), 0)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gana-text">{isEdit ? 'Editar premio' : 'Nuevo premio'}</h3>
        <button type="button" onClick={onClose} className="text-sm text-gana-muted hover:text-gana-text">✕</button>
      </div>

      {!isEdit && (
        <div className="rounded-xl bg-gana-green/5 border border-gana-green/20 p-3 text-xs text-gana-muted">
          💡 Ejemplos: "Por cada 10 visitas recibe una orden de papas gratis" · "Acumula 5 visitas y obtén un 30% de descuento"
        </div>
      )}

      <RewardPreview name={name} description={description} requiredVisits={Number(visits) || 0} />

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="businessId" value={businessId} />
        <input type="hidden" name="slug" value={slug} />
        {isEdit && <input type="hidden" name="rewardId" value={reward.id} />}

        <Input label="Nombre del premio" id="name" name="name" value={name}
          onChange={(e) => setName(e.target.value)} placeholder="Ej: Orden de papas gratis" maxLength={100} />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gana-text mb-1">Descripción (opcional)</label>
          <textarea id="description" name="description" value={description}
            onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Válido en cualquier sucursal" maxLength={500} rows={2}
            className="block w-full rounded-xl border border-gana-border bg-gana-input-bg text-gana-input-text px-4 py-2.5 text-sm placeholder:text-gana-placeholder focus:outline-none focus:ring-2 focus:ring-gana-green/20" />
        </div>

        <Input label="Visitas requeridas" id="requiredVisits" name="requiredVisits" type="number" min="1" step="1"
          value={visits} onChange={(e) => setVisits(e.target.value)} placeholder="Ej: 10" />

        <Input label="Fecha de expiración (opcional)" id="expiresAt" name="expiresAt" type="date"
          value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />

        <Input label="Máximo de canjes por usuario (opcional)" id="maxRedemptionsPerUser" name="maxRedemptionsPerUser"
          type="number" min="1" step="1" value={maxRedemptions}
          onChange={(e) => setMaxRedemptions(e.target.value)} placeholder="Sin límite" />

        {state.error && <p className="text-xs text-gana-error">{state.error}</p>}

        <div className="flex gap-2">
          <Button type="submit" loading={isPending} className="flex-1">
            {isEdit ? 'Guardar cambios' : 'Crear premio'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
