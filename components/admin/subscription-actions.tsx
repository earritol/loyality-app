'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Props = {
  businessId: string
  billingMode: string
  subscriptionStatus: string | null
  status: string
  monthlyPrice: number
}

export function SubscriptionActions({ businessId, billingMode, subscriptionStatus, status, monthlyPrice }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isSubscriptionActive = billingMode === 'subscription' && subscriptionStatus === 'active'
  const needsPayment = status === 'past_due' || status === 'suspended'

  async function handlePayment() {
    setLoading('payment'); setError(null); setSuccess(null)
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      })
      const data = await res.json()
      if (data.init_point) { window.location.href = data.init_point } 
      else { setError(data.error || 'Error al crear el pago') }
    } catch { setError('Error de conexión') }
    setLoading(null)
  }

  async function handleSubscription() {
    setLoading('subscription'); setError(null); setSuccess(null)
    try {
      const res = await fetch('/api/subscriptions/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      })
      const data = await res.json()
      if (data.init_point) { window.location.href = data.init_point }
      else { setError(data.error || 'Error al crear la suscripción') }
    } catch { setError('Error de conexión') }
    setLoading(null)
  }

  async function handleCancel() {
    if (!confirm('¿Estás seguro de cancelar el pago automático?')) return
    setLoading('cancel'); setError(null); setSuccess(null)
    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('Pago automático cancelado')
        setTimeout(() => window.location.reload(), 1500)
      } else { setError(data.error || 'Error al cancelar') }
    } catch { setError('Error de conexión') }
    setLoading(null)
  }

  return (
    <Card className="space-y-3">
      <h3 className="font-bold text-gana-text">Opciones de pago</h3>

      {needsPayment && (
        <Button onClick={handlePayment} loading={loading === 'payment'} className="w-full">
          Pagar este mes (${monthlyPrice} MXN)
        </Button>
      )}

      {!isSubscriptionActive ? (
        <Button onClick={handleSubscription} loading={loading === 'subscription'} variant={needsPayment ? 'secondary' : 'primary'} className="w-full">
          Activar pago automático ✨
        </Button>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gana-green">✓ Pago automático activo — se cobra ${monthlyPrice} MXN cada mes</p>
          <button onClick={handleCancel} disabled={loading === 'cancel'}
            className="text-xs text-gana-error hover:underline disabled:opacity-50">
            {loading === 'cancel' ? 'Cancelando...' : 'Cancelar pago automático'}
          </button>
        </div>
      )}

      {error && <p className="text-xs text-gana-error">{error}</p>}
      {success && <p className="text-xs text-gana-success">{success}</p>}
    </Card>
  )
}
