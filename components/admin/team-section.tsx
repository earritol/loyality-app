'use client'

import { useState, useEffect, useActionState } from 'react'
import { addTeamMember, removeTeamMember, getTeamMembers } from '@/lib/actions/business'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import type { ActionResult, TeamMember } from '@/lib/types'

type Props = {
  businessId: string
  slug: string
  isOwner: boolean
}

const initial: ActionResult = { success: false }

export function TeamSection({ businessId, slug, isOwner }: Props) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [addState, addAction, addPending] = useActionState(addTeamMember, initial)
  const [removeState, removeAction, removePending] = useActionState(removeTeamMember, initial)

  async function loadMembers() {
    setLoading(true)
    const data = await getTeamMembers(businessId)
    setMembers(data)
    setLoading(false)
  }

  useEffect(() => { loadMembers() }, [businessId])

  // Reload after add/remove
  useEffect(() => {
    if (addState.success || removeState.success) loadMembers()
  }, [addState.success, removeState.success])

  const staffMembers = members.filter(m => m.role === 'staff')
  const ownerMembers = members.filter(m => m.role === 'owner')

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gana-text">Equipo</h3>

      {/* Add member form — only for owners */}
      {isOwner && (
        <form action={addAction} className="flex gap-2">
          <input type="hidden" name="businessId" value={businessId} />
          <input type="hidden" name="slug" value={slug} />
          <input type="email" name="email" required placeholder="email@ejemplo.com"
            className="flex-1 rounded-xl border border-gana-border bg-gana-input-bg text-gana-input-text px-4 py-2.5 text-sm placeholder:text-gana-placeholder focus:outline-none focus:ring-2 focus:ring-gana-green/20" />
          <Button type="submit" loading={addPending} className="w-auto px-4">
            Agregar
          </Button>
        </form>
      )}

      {addState.error && <p className="text-xs text-gana-error">{addState.error}</p>}
      {addState.success && <p className="text-xs text-gana-success">Miembro agregado al equipo</p>}
      {removeState.error && <p className="text-xs text-gana-error">{removeState.error}</p>}
      {removeState.success && <p className="text-xs text-gana-success">Miembro eliminado del equipo</p>}

      {/* Team list */}
      {loading ? (
        <p className="text-sm text-gana-muted">Cargando equipo...</p>
      ) : members.length === 0 ? (
        <EmptyState icon="👥" title="Sin miembros" description="Agrega miembros a tu equipo para delegar operaciones." />
      ) : (
        <div className="space-y-2">
          {/* Owners */}
          {ownerMembers.map((m) => (
            <Card key={m.id} className="flex items-center justify-between py-3 px-4">
              <div>
                <p className="text-sm font-medium text-gana-text">
                  {m.firstName ? `${m.firstName} ${m.lastName ?? ''}`.trim() : m.email}
                </p>
                {m.firstName && <p className="text-xs text-gana-muted">{m.email}</p>}
              </div>
              <Badge variant="visits">Owner</Badge>
            </Card>
          ))}

          {/* Staff */}
          {staffMembers.length === 0 && ownerMembers.length > 0 && (
            <p className="text-xs text-gana-muted mt-2">Aún no hay miembros staff en el equipo.</p>
          )}
          {staffMembers.map((m) => (
            <Card key={m.id} className="flex items-center justify-between py-3 px-4">
              <div>
                <p className="text-sm font-medium text-gana-text">
                  {m.firstName ? `${m.firstName} ${m.lastName ?? ''}`.trim() : m.email}
                </p>
                {m.firstName && <p className="text-xs text-gana-muted">{m.email}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="locked">Staff</Badge>
                {isOwner && (
                  <form action={removeAction}>
                    <input type="hidden" name="businessId" value={businessId} />
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="userId" value={m.userId} />
                    <button type="submit" disabled={removePending}
                      className="text-xs text-gana-error hover:underline disabled:opacity-50">
                      Eliminar
                    </button>
                  </form>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
