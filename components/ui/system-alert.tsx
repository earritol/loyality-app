'use client'

import { useState } from 'react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'info' | 'success' | 'warning' | 'error'

const icons: Record<Variant, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
}

const variantStyles: Record<Variant, string> = {
  info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
  success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-800',
  error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800',
}

type Props = {
  variant: Variant
  title: string
  description?: string
  dismissible?: boolean
  /** Unique key for persisting dismissal in localStorage */
  dismissKey?: string
  className?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export function SystemAlert({
  variant,
  title,
  description,
  dismissible = false,
  dismissKey,
  className,
  action,
}: Props) {
  const [dismissed, setDismissed] = useState(() => {
    if (!dismissible || !dismissKey) return false
    if (typeof window === 'undefined') return false
    try {
      return localStorage.getItem(`alert_dismissed_${dismissKey}`) === 'true'
    } catch {
      return false
    }
  })

  if (dismissed) return null

  const Icon = icons[variant]

  function handleDismiss() {
    setDismissed(true)
    if (dismissKey) {
      try {
        localStorage.setItem(`alert_dismissed_${dismissKey}`, 'true')
      } catch {
        // localStorage not available
      }
    }
  }

  return (
    <Alert className={cn('rounded-xl', variantStyles[variant], className)}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
      {action && (
        <div className="mt-2 col-start-2">
          {action.href ? (
            <a
              href={action.href}
              className="inline-flex items-center text-xs font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              {action.label}
            </a>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-flex items-center text-xs font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 rounded-md p-0.5 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </Alert>
  )
}
