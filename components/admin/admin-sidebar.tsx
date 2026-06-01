'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Store, Users, CreditCard, Gift, Activity } from 'lucide-react'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/negocios', label: 'Negocios', icon: Store },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/admin/canjes', label: 'Canjes', icon: Gift },
  { href: '/admin/actividad', label: 'Actividad', icon: Activity },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r bg-card flex-shrink-0">
      <nav className="p-4 space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-3">
          Administración
        </p>
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href))
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
