'use client'

import { SystemAlert } from '@/components/ui/system-alert'

type Props = {
  hasEmail: boolean
  hasPhone: boolean
}

/**
 * Shows a banner for email-only users suggesting they add a phone number.
 * Dismissible — does not block navigation.
 * NOTE: The "Agregar teléfono" action is UI-only for now.
 * Phone linking flow will be implemented in a future phase.
 */
export function AddPhoneBanner({ hasEmail, hasPhone }: Props) {
  // Only show for users who have email but no phone
  if (!hasEmail || hasPhone) return null

  return (
    <SystemAlert
      variant="info"
      title="Agrega tu teléfono"
      description="Agrega tu teléfono para iniciar sesión más rápido."
      dismissible
      dismissKey="add_phone_banner"
      action={{
        label: 'Agregar teléfono',
        href: '/perfil',
      }}
    />
  )
}
