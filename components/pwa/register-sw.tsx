'use client'

import { useEffect } from 'react'

/**
 * Registers the service worker on mount.
 * Renders nothing — purely a side-effect component.
 * Failures are silently caught (PWA is progressive enhancement).
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration failed — app continues normally
      })
    }
  }, [])

  return null
}
