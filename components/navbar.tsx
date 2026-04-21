import { createClient } from '@/lib/supabase/server'
import { NavbarClient } from '@/components/navbar-client'
import type { AdminBusiness } from '@/lib/nav-utils'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('first_name')
    .eq('id', user.id)
    .single()

  const { data: adminRows } = await supabase
    .from('business_admins')
    .select('business_id, businesses(id, name, slug)')
    .eq('user_id', user.id)

  const adminBusinesses: AdminBusiness[] = (adminRows ?? [])
    .map((row) => {
      const biz = row.businesses as unknown as { id: string; name: string; slug: string } | null
      if (!biz || !biz.slug) return null
      return { id: biz.id, name: biz.name, slug: biz.slug }
    })
    .filter((b): b is AdminBusiness => b !== null)

  return (
    <NavbarClient
      user={{
        id: user.id,
        email: user.email ?? '',
        firstName: profile?.first_name ?? null,
      }}
      adminBusinesses={adminBusinesses}
    />
  )
}
