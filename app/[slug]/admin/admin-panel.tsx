'use client'

import { useState } from 'react'
import { recordVisitForBusiness } from '@/lib/actions/visits'
import QRScanner from '@/components/admin/QRScanner'
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
      setMessage({ text: 'Visita registrada.', type: 'success' })
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-12">
        <h1 className="text-2xl font-semibold text-gray-900">{business.name}</h1>
        <p className="mt-1 text-sm text-gray-500">Panel de administración</p>

        {message && (
          <div className={`mt-4 rounded-md p-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="mt-8 space-y-6">
          {/* QR Scanner */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900">Escanear QR del cliente</h2>
            <p className="mt-1 text-sm text-gray-500">
              Escanea el código QR del cliente para registrar su visita.
            </p>
            <div className="mt-4">
              {showScanner ? (
                <div className="space-y-3">
                  <QRScanner onScan={handleQRScan} />
                  <button
                    onClick={() => setShowScanner(false)}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setShowScanner(true); setMessage(null) }}
                  disabled={loading}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Abrir escáner QR
                </button>
              )}
            </div>
          </div>

          {/* Manual Visit Registration */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900">Registro manual</h2>
            <p className="mt-1 text-sm text-gray-500">Ingresa el email del cliente para registrar una visita.</p>
            <div className="mt-4 space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@ejemplo.com"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleManualVisit}
                disabled={loading}
                className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registrando...' : 'Registrar visita manualmente'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
