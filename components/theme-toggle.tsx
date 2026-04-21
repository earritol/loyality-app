'use client'

import { useCallback, useEffect, useState } from 'react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
    setMounted(true)
  }, [])

  const toggle = useCallback(() => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    document.cookie = `theme=${next ? 'dark' : 'light'};path=/;max-age=31536000`
  }, [dark])

  if (!mounted) {
    return <span className="inline-block w-5 h-5" />
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="text-sm text-gana-muted hover:text-gana-text transition-colors"
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  )
}
