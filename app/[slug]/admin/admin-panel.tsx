'use client'

import { useState } from 'react'
import { recordVisitForBusiness } from '@/lib/actions/visits'
import { getUserLoyaltyStats } from '@/lib/actions/redemptions'
import QRScanner from '@/components/admin/QRScanner'
import { Card } from '@/components/ui/card'
import { LoyaltyStatsCard } from '@/components/admin/loyalty-stats-card'
import { RewardClassifier } from '@/components/admin/reward-classifier'
import { CustomerSearch } from '@/components/admin/customer-search'
import type { Business, Reward, LoyaltyStats } from '@/lib/types'

type Props = {
  business: Business
  rewards: Reward[]
}

type IdentifiedUser = {
  userId: string
  name: string
  email: string
  stats: LoyaltyStats
}

export function AdminPanel({ business, rewards }: Props) {
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [identifiedUser, setIdentifiedUser] = useState<IdentifiedUser | null>(null)

  async function handleIdentifyAndRecord(userId: string, userName: string, userEmail: string) {
    setLoading(true)
    setMessage(null)
    const result = await recordVisitForBusiness(userId, business.id)
    if (result.success) {
      setMessage({ text: '✓ Cliente registrado y visita agregada', type: 'success' })
    } else {
      setMessage({ text: result.error ?? 'Algo salió mal.', type: 'error' })
    }
    const stats = await getUserLoyaltyStats(userId, business.id)
    setIdentifiedUser({ userId, name: userName, email: userEmail, stats })
    setLoading(false)
  }

  async function handleQRScan({ userId }: { userId: string }) {
    if (loading) return
    setShowScanner(false)
    await handleIdentifyAndRecord(userId, '', '')
  }

  async function handleCustomerSelect(user: { userId: string; name: string; email: string }) {
    await handleIdentifyAndRecord(user.userId, user.name, user.email)
  }

  function handleRedeemed(result: { rewardName: string; visitsRemaining: number; visitsUsed: number }) {
    setMessage({
      text: `🎉 Canje realizado: ${result.rewardName} — Le quedan ${result.visitsRemaining} visitas al cliente`,
      type: 'success',
    })
    if (identifiedUser) {
      setIdentifiedUser({
        ...identifiedUser,
        stats: {
          ...identifiedUser.stats,
          usedVisits: identifiedUser.stats.usedVisits + result.visitsUsed,
          availableVisits: result.visitsRemaining,
        },
      })
    }
  }

  function handleReset() {
    setIdentifiedUser(null)
    setMessage(null)
  }

  const displayName = identifiedUser?.name || identifiedUser?.email || 'Cliente'

  return (
    <div className="min-h-screen bg-gana-bg">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gana-text">{business.name}</h1>
        <p className="text-xs font-semibold text-gana-green uppercase tracking-wide">Registrar visita</p>

        {message && (
          <div className={`mt-4 rounded-xl p-3 text-sm font-medium transition-all ${message.type === 'success' ? 'bg-gana-green/20 text-gana-green' : 'bg-gana-error/20 text-gana-error'}`}>
            {message.text}
            {message.text.includes('Canje realizado') && (
              <p className="mt-1 text-xs opacity-80">El cliente comienza de nuevo para esta recompensa.</p>
            )}
          </div>
        )}

        {identifiedUser ? (
          <div className="mt-6 space-y-4">
            <LoyaltyStatsCard stats={identifiedUser.stats} userName={displayName} />

            <h3 className="text-sm font-bold text-gana-text">Recompensas</h3>
            <RewardClassifier
              rewards={rewards.filter(r => r.is_active)}
              availableVisits={identifiedUser.stats.availableVisits}
              userId={identifiedUser.userId}
              businessId={business.id}
              onRedeemed={handleRedeemed}
            />

            <button onClick={handleReset}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-gana-muted bg-gana-bg border border-gana-border hover:opacity-90">
              ← Buscar otro cliente
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <Card className="px-4">
              <h2 className="font-bold text-gana-text">📷 Escanear QR</h2>
              <p className="mt-1 text-sm text-gana-muted">Escanea el código QR del cliente para registrar su visita.</p>
              <div className="mt-4">
                {showScanner ? (
                  <div className="space-y-3">
                    <QRScanner onScan={handleQRScan} />
                    <button onClick={() => setShowScanner(false)}
                      className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-gana-muted bg-gana-bg border border-gana-border hover:opacity-90">
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setShowScanner(true); setMessage(null) }} disabled={loading}
                    className="w-full rounded-xl bg-gana-green px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                    Abrir escáner
                  </button>
                )}
              </div>
            </Card>

            <Card className="px-4">
              <h2 className="font-bold text-gana-text">🔍 Buscar cliente</h2>
              <p className="mt-1 text-sm text-gana-muted">Busca por email o teléfono. Si no existe, puedes registrarlo al instante.</p>
              <div className="mt-4">
                <CustomerSearch onSelect={handleCustomerSelect} />
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
