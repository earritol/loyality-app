'use client'

import { useState, useEffect, useCallback } from 'react'
import { isStandalone, isIOSSafari } from '@/lib/pwa/platform'
import { X, Share, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'pwa-install-dismissed'
const DISMISS_DURATION_MS = 2 * 24 * 60 * 60 * 1000 // 2 días

function isDismissed(): boolean {
  try {
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (!dismissed) return false
    const timestamp = parseInt(dismissed, 10)
    return Date.now() - timestamp < DISMISS_DURATION_MS
  } catch {
    return false
  }
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSBanner, setShowIOSBanner] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Don't show if already installed or recently dismissed
    if (isStandalone() || isDismissed()) return

    // Android/Desktop: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS Safari: show manual instructions
    if (isIOSSafari()) {
      setShowIOSBanner(true)
      setVisible(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
    }
    setDeferredPrompt(null)
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString())
    } catch {
      // localStorage not available — banner will show again next session
    }
  }, [])

  if (!visible) return null

  return (
    <div
      role="banner"
      className="fixed bottom-4 left-4 right-4 z-50 rounded-xl border border-gana-border bg-gana-card p-4 shadow-lg animate-in slide-in-from-bottom-2"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Download className="h-5 w-5 text-gana-green" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gana-text text-sm">
            Instala GanaMás
          </p>
          {showIOSBanner ? (
            <p className="mt-1 text-xs text-gana-muted leading-relaxed">
              Toca{' '}
              <Share className="inline h-3.5 w-3.5 -mt-0.5" />{' '}
              y luego &quot;Agregar a pantalla de inicio&quot;
            </p>
          ) : (
            <p className="mt-1 text-xs text-gana-muted">
              Accede más rápido desde tu pantalla de inicio
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!showIOSBanner && (
            <button
              type="button"
              onClick={handleInstall}
              className="rounded-lg bg-gana-green px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Instalar
            </button>
          )}
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-md p-1 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Cerrar banner de instalación"
          >
            <X className="h-4 w-4 text-gana-muted" />
          </button>
        </div>
      </div>
    </div>
  )
}
