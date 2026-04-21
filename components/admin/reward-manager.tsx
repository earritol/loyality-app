'use client'

import { useState, useActionState } from 'react'
import { toggleRewardStatus } from '@/lib/actions/rewards'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { RewardForm } from '@/components/admin/reward-form'
import type { ActionResult, Reward } from '@/lib/types'

type Props = {
  businessId: string
  slug: string
  rewards: Reward[]
}

type SortBy = 'date' | 'visits'

const initial: ActionResult = { success: false }

export function RewardManager({ businessId, slug, rewards }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | undefined>()
  const [sortBy, setSortBy] = useState<SortBy>('date')

  const sorted = [...rewards].sort((a, b) => {
    if (sortBy === 'visits') return a.required_visits - b.required_visits
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  function openCreate() {
    setEditingReward(undefined)
    setShowForm(true)
  }

  function openEdit(r: Reward) {
    setEditingReward(r)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingReward(undefined)
  }

  if (showForm) {
    return (
      <Card>
        <RewardForm businessId={businessId} slug={slug} reward={editingReward} onClose={closeForm} />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gana-muted">Ordenar:</span>
          <button type="button" onClick={() => setSortBy('date')}
            className={`text-xs px-2 py-1 rounded-lg ${sortBy === 'date' ? 'bg-gana-green/10 text-gana-green font-semibold' : 'text-gana-muted'}`}>
            Fecha
          </button>
          <button type="button" onClick={() => setSortBy('visits')}
            className={`text-xs px-2 py-1 rounded-lg ${sortBy === 'visits' ? 'bg-gana-green/10 text-gana-green font-semibold' : 'text-gana-muted'}`}>
            Visitas
          </button>
        </div>
        <Button onClick={openCreate} className="w-auto px-4">+ Nuevo premio</Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon="🎁" title="Sin premios" description="Crea tu primer premio para empezar a recompensar a tus clientes." />
      ) : (
        sorted.map((r) => (
          <RewardCard key={r.id} reward={r} businessId={businessId} slug={slug} onEdit={() => openEdit(r)} />
        ))
      )}
    </div>
  )
}

function RewardCard({ reward, businessId, slug, onEdit }: {
  reward: Reward; businessId: string; slug: string; onEdit: () => void
}) {
  const [toggleState, toggleAction, isToggling] = useActionState(toggleRewardStatus, initial)

  return (
    <Card className={`${!reward.is_active ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gana-text">{reward.name}</p>
            <Badge variant={reward.is_active ? 'visits' : 'locked'}>
              {reward.is_active ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
          {reward.description && <p className="mt-0.5 text-sm text-gana-muted">{reward.description}</p>}
          <p className="mt-1 text-xs text-gana-muted">{reward.required_visits} visitas requeridas</p>
        </div>
      </div>

      {toggleState.error && <p className="mt-2 text-xs text-gana-error">{toggleState.error}</p>}
      {toggleState.success && (
        <p className="mt-2 text-xs text-gana-success">
          {reward.is_active ? 'Premio activado' : 'Premio desactivado'}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button type="button" onClick={onEdit}
          className="text-xs text-gana-green hover:underline">Editar</button>
        <form action={toggleAction}>
          <input type="hidden" name="rewardId" value={reward.id} />
          <input type="hidden" name="businessId" value={businessId} />
          <input type="hidden" name="slug" value={slug} />
          <button type="submit" disabled={isToggling}
            className="text-xs text-gana-muted hover:text-gana-text disabled:opacity-50">
            {isToggling ? '...' : reward.is_active ? 'Desactivar' : 'Activar'}
          </button>
        </form>
      </div>
    </Card>
  )
}
