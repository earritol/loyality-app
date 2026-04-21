'use client'

import { useState } from 'react'
import { recordVisitForBusiness } from '@/lib/actions/visits'
import QRScanner from '@/components/admin/QRScanner'
import { Card } from '@/components/ui/card'
import type { Business } from '@/lib/types'

export function AdminPanel({ business }: { business: Business }) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  async function recordVisit(userId: string) {
    setLoading(true)
    setMessage(null)
    const result = await recordVisitForBusiness(userId, business.id)
    if (result.success) {
      setMessage({ text: '✓ Visita registrada', type: 'success' })
      setEmail('')
    } else {
      setMessage({ text: result.error ?? 'Algo salió mal.', type: 'error' })
    }
    setLoading(false)
  }

  async function handleManualVisit() {
    if (!email.trim()) {
      setMessage({ text: 'Ingresa el email del cliente.', type: 'error' })
      return
    }
    setMessage(null)
    setLoading(true)
    const res = await fetch(`/api/user-lookup?email=${encodeURIComponent(email)}`)
    const data = await res.json()
    if (!data.userId) {
      setMessage({ text: 'Cliente no encontrado. Debe registrarse primero.', type: 'error' })
      setLoading(false)
      return
    }
    await recordVisit(data.userId)
  }

  async function handleQRScan({ userId }: { userId: string }) {
    if (loading) return
    setShowScanner(false)
    await recordVisit(userId)
  }

  return (
    <div className="min-h-screen bg-gana-bg">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gana-text">{business.name}</h1>
        <p className="text-xs font-semibold text-gana-green uppercase tracking-wide">Registrar visita</p>

        {message && (
          <div className={`mt-4 rounded-xl p-3 text-sm font-medium ${message.type === 'success' ? 'bg-gana-green/20 text-gana-green' : 'bg-gana-error/20 text-gana-error'}`}>
            {message.text}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <Card>
            <h2 className="font-bold text-gana-text">📷 Escanear QR</h2>
            <p className="mt-1 text-sm text-gana-muted">Escanea el código QR del cliente.</p>
            <div className="mt-4">
              {showScanner ? (
                <div className="space-y-3">
                  <QRScanner onScan={handleQRScan} />
                  <button onClick={() => setShowScanner(false)}
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-gana-muted bg-gana-bg border border-gana-border transition-opacity hover:opacity-90">
                    Cancelar
                  </button>
                </div>
              ) : (
                <button onClick={() => { setShowScanner(true); setMessage(null) }} disabled={loading}
                  className="w-full rounded-xl bg-gana-green px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50">
                  Abrir escáner
                </button>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="font-bold text-gana-text">✏️ Registro manual</h2>
            <p className="mt-1 text-sm text-gana-muted">Ingresa el email del cliente.</p>
            <div className="mt-4 space-y-3">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@ejemplo.com"
                className="block w-full rounded-xl border border-gana-border bg-gana-input-bg text-gana-input-text px-4 py-2.5 text-sm placeholder:text-gana-placeholder focus:outline-none focus:ring-2 focus:ring-gana-green/20" />
              <button onClick={handleManualVisit} disabled={loading}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold bg-gana-bg border border-gana-border text-gana-text transition-opacity hover:opacity-90 disabled:opacity-50">
                {loading ? 'Cargando...' : 'Registrar visita'}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
