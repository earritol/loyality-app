'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { quickRegisterUser } from '@/lib/actions/users'

type SearchResult = {
  id: string
  email: string
  name: string | null
  phone: string | null
}

type Props = {
  onSelect: (user: { userId: string; name: string; email: string }) => void
}

export function CustomerSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [searching, setSearching] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setShowDropdown(false); return }
    setSearching(true)
    try {
      const res = await fetch(`/api/user-search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.users ?? [])
      setShowDropdown(true)
      setActiveIndex(-1)
    } catch { setResults([]) }
    setSearching(false)
  }, [])

  function handleChange(value: string) {
    setQuery(value)
    setShowRegister(false)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(value), 300)
  }

  function selectUser(u: SearchResult) {
    setShowDropdown(false)
    setQuery('')
    onSelect({ userId: u.id, name: u.name ?? '', email: u.email })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); selectUser(results[activeIndex]) }
    if (e.key === 'Escape') { setShowDropdown(false) }
  }

  async function handleQuickRegister() {
    if (!registerEmail.trim()) return
    setRegistering(true)
    setRegisterError(null)
    const result = await quickRegisterUser(registerEmail)
    setRegistering(false)
    if (result.success && result.data) {
      onSelect({ userId: result.data.userId, name: '', email: result.data.email })
      setRegisterEmail('')
      setShowRegister(false)
    } else {
      if (result.error?.includes('ya está registrado')) {
        setRegisterError('Este cliente ya existe. Selecciónalo de la lista.')
        setQuery(registerEmail)
        setShowRegister(false)
        setTimeout(() => { inputRef.current?.focus(); search(registerEmail) }, 100)
      } else {
        setRegisterError(result.error ?? 'Error al registrar')
      }
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function close(e: MouseEvent) {
      if (inputRef.current && !inputRef.current.parentElement?.contains(e.target as Node)) {
        setTimeout(() => setShowDropdown(false), 150)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  function highlightMatch(text: string) {
    if (!query) return text
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <span className="font-bold text-gana-green">{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder="Buscar cliente por email o teléfono"
          className="block w-full rounded-xl border border-gana-border bg-gana-input-bg text-gana-input-text px-4 py-2.5 text-sm placeholder:text-gana-placeholder focus:outline-none focus:ring-2 focus:ring-gana-green/20"
        />
        {searching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gana-muted">...</span>
        )}

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute z-50 left-0 right-0 mt-1 rounded-xl border border-gana-border bg-gana-card shadow-lg overflow-hidden">
            {results.length > 0 ? (
              results.map((u, i) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => selectUser(u)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    i === activeIndex ? 'bg-gana-green/10' : 'hover:bg-gana-bg'
                  }`}
                >
                  <p className="font-medium text-gana-text">
                    {u.name ? highlightMatch(u.name) : <span className="text-gana-muted">Cliente sin nombre</span>}
                  </p>
                  <p className="text-xs text-gana-muted">
                    {highlightMatch(u.email)}
                    {u.phone && <> · {highlightMatch(u.phone)}</>}
                  </p>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-center">
                <p className="text-sm text-gana-muted">No encontramos coincidencias</p>
                <button
                  type="button"
                  onClick={() => { setShowDropdown(false); setShowRegister(true); setRegisterEmail(query.includes('@') ? query : '') }}
                  className="mt-2 text-sm font-semibold text-gana-green hover:underline"
                >
                  + Registrar nuevo cliente
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick register form */}
      {showRegister && (
        <Card>
          <h3 className="font-bold text-gana-text text-sm">Registrar nuevo cliente</h3>
          <p className="text-xs text-gana-muted mt-1">Registra al cliente en segundos con su email.</p>
          <div className="mt-3 space-y-2">
            <input
              type="email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              className="block w-full rounded-xl border border-gana-border bg-gana-input-bg text-gana-input-text px-4 py-2.5 text-sm placeholder:text-gana-placeholder focus:outline-none focus:ring-2 focus:ring-gana-green/20"
              autoFocus
            />
            {registerError && <p className="text-xs text-gana-error">{registerError}</p>}
            <div className="flex gap-2">
              <button onClick={handleQuickRegister} disabled={registering}
                className="flex-1 rounded-xl bg-gana-green px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                {registering ? 'Registrando...' : 'Registrar cliente'}
              </button>
              <button onClick={() => setShowRegister(false)}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-gana-muted bg-gana-bg border border-gana-border hover:opacity-90">
                Cancelar
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
