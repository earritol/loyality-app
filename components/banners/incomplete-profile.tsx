'use client'

import { SystemAlert } from '@/components/ui/system-alert'

type Props = {
  firstName: string | null
  lastName: string | null
  phone: string | null
  email: string | null
}

/**
 * Shows a non-blocking banner when the user's profile is missing important data.
 * Dismissible — does not block navigation.
 */
export function IncompleteProfileBanner({ firstName, lastName, phone, email }: Props) {
  const missingFields: string[] = []

  if (!firstName && !lastName) missingFields.push('nombre')
  if (!phone) missingFields.push('teléfono')
  if (!email) missingFields.push('correo')

  // Don't show if profile is complete or only missing one optional field
  if (missingFields.length === 0) return null

  return (
    <SystemAlert
      variant="info"
      title="Perfil incompleto"
      description="Completa tus datos para mejorar tu experiencia y asegurar tu cuenta."
      dismissible
      dismissKey="incomplete_profile"
      action={{
        label: 'Completar perfil',
        href: '/perfil',
      }}
    />
  )
}
