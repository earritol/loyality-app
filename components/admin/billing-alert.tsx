'use client'

import { useState, useEffect } from 'react'

type Props = {
  status: string
  billingCutoffDay: number | null
  businessId: string
}

export function BillingAlert({ status, billingCutoffDay, businessId }: Props) {
  const [dismissed, setDismissed] = useState(true) // start hidden to avoid flash

  useEffect(() => {
    if (status === 'active') { setDismissed(true); return }
    const cookieKey = `billing_alert_${businessId}`
    const today = new Date().toISOString().split('T')[0]
    const stored = document.cookie.match(new RegExp(`${cookieKey}=([^;]+)`))
    if (stored?.[1] === today) {
      setDismissed(true)
    } else {
      setDismissed(false)
    }
  }, [status, businessId])

  function dismiss() {
    const cookieKey = `billing_alert_${businessId}`
    const today = new Date().toISOString().split('T')[0]
    document.cookie = `${cookieKey}=${today};path=/;max-age=86400`
    setDismissed(true)
  }

  if (dismissed || status === 'active') return null

  return (
    <div className={`mt-4 rounded-xl p-3 text-sm font-medium flex items-start justify-between ${
      status === 'suspended'
        ? 'bg-gana-error/10 text-gana-error'
        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    }`}>
      <div>
        {status === 'suspended' && (
          <p>🚫 Tu cuenta está suspendida. Contacta al administrador para reactivarla.</p>
        )}
        {status === 'past_due' && (
          <>
            <p>⚠️ Tu cuenta está vencida</p>
            {billingCutoffDay && (
              <p className="text-xs opacity-80 mt-0.5">Tu fecha de corte es el día {billingCutoffDay}</p>
            )}
          </>
        )}
      </div>
      <button onClick={dismiss} className="ml-3 flex-shrink-0 text-xs opacity-60 hover:opacity-100">✕</button>
    </div>
  )
}
