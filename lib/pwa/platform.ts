/**
 * Utilidades centralizadas de detección de plataforma para PWA.
 * Evita dispersar lógica de user-agent en componentes.
 */

/** Detecta si la app se ejecuta en modo standalone (instalada) */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  )
}

/** Detecta si el navegador es Safari en iOS (no soporta beforeinstallprompt) */
export function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)
}

/** Detecta si el navegador soporta el evento beforeinstallprompt */
export function supportsInstallPrompt(): boolean {
  if (typeof window === 'undefined') return false
  return 'BeforeInstallPromptEvent' in window || 'onbeforeinstallprompt' in window
}
