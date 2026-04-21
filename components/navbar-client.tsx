'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { signOut } from '@/lib/actions/auth'
import { getNavItems, isActiveRoute } from '@/lib/nav-utils'
import type { AdminBusiness, NavItem } from '@/lib/nav-utils'
import { ThemeToggle } from '@/components/theme-toggle'

type Props = {
  user: { id: string; email: string; firstName: string | null }
  adminBusinesses: AdminBusiness[]
}

export function NavbarClient({ user, adminBusinesses }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [bizMenuOpen, setBizMenuOpen] = useState(false)
  const [openBizIndex, setOpenBizIndex] = useState<number | null>(0)

  const navItems = getNavItems(adminBusinesses)
  const displayName = user.firstName || user.email

  useEffect(() => {
    setMobileOpen(false)
    setBizMenuOpen(false)
  }, [pathname])

  return (
    <nav className="sticky top-0 z-50 border-b border-gana-border bg-gana-card">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/inicio" className="flex-shrink-0">
          <Image src="/logo-gana.png" alt="GANA" width={120} height={40} className="h-8 w-auto dark:hidden" priority />
          <Image src="/logo-gana-dark.png" alt="GANA" width={120} height={40} className="h-8 w-auto hidden dark:block" priority />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) =>
            item.businessGroups ? (
              <BizDropdown
                key={item.label}
                item={item}
                pathname={pathname}
                open={bizMenuOpen}
                onToggle={() => setBizMenuOpen(!bizMenuOpen)}
                onClose={() => setBizMenuOpen(false)}
                openBizIndex={openBizIndex}
                onToggleBiz={(i) => setOpenBizIndex(openBizIndex === i ? null : i)}
              />
            ) : (
              <Link key={item.href} href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActiveRoute(pathname, item.href) ? 'text-gana-green bg-gana-green/10' : 'text-gana-muted hover:text-gana-text hover:bg-gana-bg'
                }`}>
                {item.label}
              </Link>
            )
          )}
          <div className="ml-2 pl-2 border-l border-gana-border flex items-center gap-2">
            <ThemeToggle />
            <span className="text-xs text-gana-muted">{displayName}</span>
            <form action={signOut}>
              <button type="submit" className="text-xs text-gana-muted hover:text-gana-text">Salir</button>
            </form>
          </div>
        </div>

        {/* Hamburger */}
        <button type="button" onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gana-muted" aria-label="Menú">
          {mobileOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gana-border px-4 py-2 bg-gana-card">
          {navItems.map((item) =>
            item.businessGroups ? (
              <MobileBizSection key={item.label} item={item} pathname={pathname}
                open={bizMenuOpen} onToggle={() => setBizMenuOpen(!bizMenuOpen)}
                openBizIndex={openBizIndex} onToggleBiz={(i) => setOpenBizIndex(openBizIndex === i ? null : i)} />
            ) : (
              <Link key={item.href} href={item.href}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActiveRoute(pathname, item.href) ? 'text-gana-green bg-gana-green/10' : 'text-gana-muted'
                }`}>
                {item.label}
              </Link>
            )
          )}
          <div className="border-t border-gana-border mt-2 pt-2 px-3 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <span className="text-xs text-gana-muted">{displayName}</span>
            </div>
            <form action={signOut}>
              <button type="submit" className="text-xs text-gana-muted hover:text-gana-text">Cerrar sesión</button>
            </form>
          </div>
        </div>
      )}
    </nav>
  )
}

function BizDropdown({ item, pathname, open, onToggle, onClose, openBizIndex, onToggleBiz }: {
  item: NavItem; pathname: string; open: boolean
  onToggle: () => void; onClose: () => void
  openBizIndex: number | null; onToggleBiz: (i: number) => void
}) {
  const groups = item.businessGroups ?? []
  const single = groups.length === 1
  return (
    <div className="relative">
      <button type="button" onClick={onToggle}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActiveRoute(pathname, item.href) ? 'text-gana-green bg-gana-green/10' : 'text-gana-muted hover:text-gana-text hover:bg-gana-bg'
        }`}>
        {item.label} <span className="text-sm">▾</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <div className="absolute right-0 mt-1 w-60 rounded-xl shadow-lg border border-gana-border py-1 bg-gana-card z-50">
            {groups.map((g, i) => (
              <div key={g.businessName}>
                {!single ? (
                  <button type="button" onClick={() => onToggleBiz(i)}
                    className="w-full text-left px-4 py-1.5 text-xs font-semibold text-gana-muted uppercase tracking-wide hover:bg-gana-bg flex items-center justify-between">
                    {g.businessName}
                    <span className="text-sm">{openBizIndex === i ? '▴' : '▾'}</span>
                  </button>
                ) : (
                  <p className="px-4 py-1.5 text-xs font-semibold text-gana-muted uppercase tracking-wide">{g.businessName}</p>
                )}
                {(single || openBizIndex === i) && g.items.map((s) => (
                  <Link key={s.href} href={s.href} onClick={onClose}
                    className={`block px-4 py-2 text-sm ${isActiveRoute(pathname, s.href) ? 'text-gana-green bg-gana-green/5' : 'text-gana-text hover:bg-gana-bg'}`}>
                    {s.label}
                  </Link>
                ))}
                {i < groups.length - 1 && <div className="my-1 border-t border-gana-border/50" />}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function MobileBizSection({ item, pathname, open, onToggle, openBizIndex, onToggleBiz }: {
  item: NavItem; pathname: string; open: boolean
  onToggle: () => void; openBizIndex: number | null; onToggleBiz: (i: number) => void
}) {
  const groups = item.businessGroups ?? []
  const single = groups.length === 1
  return (
    <div>
      <button type="button" onClick={onToggle}
        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
          isActiveRoute(pathname, item.href) ? 'text-gana-green bg-gana-green/10' : 'text-gana-muted'
        }`}>
        {item.label} <span className="text-sm">{open ? '▴' : '▾'}</span>
      </button>
      {open && groups.map((g, i) => {
        const isOpen = single || openBizIndex === i
        return (
          <div key={g.businessName} className="ml-3 mb-1">
            {!single ? (
              <button type="button" onClick={() => onToggleBiz(i)}
                className="w-full text-left px-3 py-1.5 text-xs font-semibold text-gana-muted uppercase tracking-wide flex items-center justify-between">
                {g.businessName}
                <span className="text-sm">{isOpen ? '▴' : '▾'}</span>
              </button>
            ) : (
              <p className="px-3 py-1 text-xs font-semibold text-gana-muted uppercase tracking-wide">{g.businessName}</p>
            )}
            {isOpen && g.items.map((s) => (
              <Link key={s.href} href={s.href}
                className={`block pl-6 pr-3 py-2 text-sm rounded-lg ${isActiveRoute(pathname, s.href) ? 'text-gana-green bg-gana-green/5' : 'text-gana-text'}`}>
                {s.label}
              </Link>
            ))}
          </div>
        )
      })}
    </div>
  )
}
