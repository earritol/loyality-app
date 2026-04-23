'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Props = {
  businessId: string
  billingMode: string
  subscriptionStatus: string | null
}

export function BillingSection({ businessId, billingMode, subscriptionStatus }: Props) {
  const [loading, setLoading] = useState<'payment' | 'subscription' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handlePayment() {
    setLoading('payment')
    setError(null)
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      })
      const data = await res.json()
      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        setError(data.error || 'Error al crear el pago')
      }
    } catch {
      setError('Error de conexión')
    }
    setLoading(null)
  }

  async function handleSubscription() {
    setLoading('subscription')
    setError(null)
    try {
      const res = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      })
      const data = await res.json()
      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        setError(data.error || 'Error al crear la suscripción')
      }
    } catch {
      setError('Error de conexión')
    }
    setLoading(null)
  }

  return (
    <Card>
      <h3 className="font-bold text-gana-text">Facturación</h3>
      <p className="text-xs text-gana-muted mt-1">$300 MXN / mes</p>

      {billingMode === 'subscription' && subscriptionStatus === 'active' && (
        <div className="mt-3">
          <Badge variant="visits">Suscripción activa</Badge>
          <p className="text-xs text-gana-muted mt-1">Tu pago se renueva automáticamente cada mes.</p>
        </div>
      )}

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <Button onClick={handlePayment} loading={loading === 'payment'} variant="secondary" className="flex-1">
          Pagar este mes
        </Button>
        {billingMode !== 'subscription' || subscriptionStatus !== 'active' ? (
          <Button onClick={handleSubscription} loading={loading === 'subscription'} className="flex-1">
            Activar pago automático ✨
          </Button>
        ) : null}
      </div>

      {error && <p className="mt-2 text-xs text-gana-error">{error}</p>}
    </Card>
  )
}
