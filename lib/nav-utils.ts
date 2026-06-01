export type NavSubItem = { label: string; href: string }

export type NavBusinessGroup = {
  businessName: string
  items: NavSubItem[]
}

export type NavItem = {
  label: string
  href: string
  businessGroups?: NavBusinessGroup[]
}

export type AdminBusiness = {
  id: string
  name: string
  slug: string
}

export function getNavItems(adminBusinesses: AdminBusiness[], isPlatformAdmin = false): NavItem[] {
  const items: NavItem[] = [
    { label: 'Inicio', href: '/inicio' },
    { label: 'Perfil', href: '/perfil' },
  ]

  if (adminBusinesses.length > 0) {
    items.push({
      label: 'Mi Negocio',
      href: '#',
      businessGroups: adminBusinesses.map((biz) => ({
        businessName: biz.name,
        items: [
          { label: 'Dashboard', href: `/${biz.slug}/admin` },
          { label: 'Registrar visita', href: `/${biz.slug}/admin/registrar` },
          { label: 'Premios', href: `/${biz.slug}/admin/premios` },
          { label: 'Configurar', href: `/${biz.slug}/admin/configurar` },
          { label: 'Suscripción', href: `/${biz.slug}/admin/suscripcion` },
        ],
      })),
    })
  }

  if (isPlatformAdmin) {
    items.push({ label: 'Backoffice', href: '/admin' })
  }

  return items
}

export function isActiveRoute(pathname: string, href: string): boolean {
  if (href === '/inicio') return pathname === '/inicio'
  if (href === '/perfil') return pathname === '/perfil'
  if (href === '/admin') return pathname.startsWith('/admin')
  if (href === '#') return /^\/[^/]+\/admin/.test(pathname)
  return pathname.startsWith(href)
}
