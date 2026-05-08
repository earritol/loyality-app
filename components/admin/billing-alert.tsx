'use client'

import { SystemAlert } from '@/components/ui/system-alert'

type Props = {
  status: string
  billingCutoffDay: number | null
  businessId: string
}

export function BillingAlert({ status, billingCutoffDay, businessId }: Props) {
  if (status === 'active') return null

  if (status === 'suspended') {
    return (
      <SystemAlert
        variant="error"
        title="Tu cuenta está suspendida"
        description="Contacta al administrador para reactivarla."
        dismissible
        dismissKey={`billing_${businessId}`}
        className="mt-4"
      />
    )
  }

  if (status === 'past_due') {
    const desc = billingCutoffDay
      ? `Tu fecha de corte es el día ${billingCutoffDay}`
      : undefined

    return (
      <SystemAlert
        variant="warning"
        title="Tu cuenta está vencida"
        description={desc}
        dismissible
        dismissKey={`billing_${businessId}`}
        className="mt-4"
      />
    )
  }

  return null
}
