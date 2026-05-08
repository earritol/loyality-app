import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserQR } from '@/components/user-qr'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { BusinessLogo } from '@/components/ui/business-logo'
import { IncompleteProfileBanner } from '@/components/banners/incomplete-profile'
import { AddPhoneBanner } from '@/components/banners/add-phone'
import Link from 'next/link'
import Image from 'next/image'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/entrar')

  // Fetch user profile, visits and redemptions in parallel
  const [profileRes, visitsRes, redemptionsRes] = await Promise.all([
    supabase
      .from('users')
      .select('first_name, last_name, phone, email')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('visits')
      .select('business_id, businesses(name, slug, logo_url)')
      .eq('user_id', user.id),
    supabase
      .from('redemptions')
      .select('business_id, visits_used')
      .eq('user_id', user.id),
  ])

  // Count total visits per business
  const businessMap = new Map<string, { name: string; slug: string | null; logoUrl: string | null; totalVisits: number }>()

  for (const visit of visitsRes.data ?? []) {
    const biz = visit.businesses as unknown as { name: string; slug: string | null; logo_url: string | null } | null
    if (!biz) continue
    const existing = businessMap.get(visit.business_id)
    if (existing) {
      existing.totalVisits++
    } else {
      businessMap.set(visit.business_id, { name: biz.name, slug: biz.slug, logoUrl: biz.logo_url, totalVisits: 1 })
    }
  }

  // Sum used visits per business
  const usedMap = new Map<string, number>()
  for (const r of redemptionsRes.data ?? []) {
    usedMap.set(r.business_id, (usedMap.get(r.business_id) ?? 0) + (r.visits_used ?? 0))
  }

  // Build list with available visits
  const businessList = Array.from(businessMap.entries()).map(([id, biz]) => {
    const used = usedMap.get(id) ?? 0
    const available = Math.max(0, biz.totalVisits - used)
    return { id, ...biz, available }
  })

  return (
    <div className="min-h-screen bg-gana-bg">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* replaced by Navbar — logo and signOut button removed */}

        {/* Banners informativos */}
        <div className="space-y-3 mb-6">
          <IncompleteProfileBanner
            firstName={profileRes.data?.first_name ?? null}
            lastName={profileRes.data?.last_name ?? null}
            phone={profileRes.data?.phone ?? null}
            email={profileRes.data?.email ?? null}
          />
          <AddPhoneBanner
            hasEmail={!!profileRes.data?.email}
            hasPhone={!!profileRes.data?.phone}
          />
        </div>

        <Card className="text-center" style={{ backgroundColor: '#FFFFFF' }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tu código QR</p>
          <div className="mt-3">
            <UserQR userId={user.id} />
          </div>
          <p className="mt-2 text-xs text-gray-500">Muéstralo al negocio para registrar tu visita</p>
        </Card>

        <div className="mt-8">
          <div className="flex items-center gap-2">
            <Image src="/icon-star.png" alt="" width={28} height={28} />
            <h2 className="text-lg font-bold text-gana-text">Tus visitas</h2>
          </div>

          {businessList.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon="🏪"
                title="Aún no tienes visitas"
                description="Visita un negocio y muestra tu QR para empezar a ganar."
              />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {businessList.map((biz) => (
                <Link key={biz.id} href={`/local/${biz.slug ?? biz.id}`}>
                  <Card className="flex items-center gap-3 hover:border-gana-green/30 transition-colors cursor-pointer">
                    <BusinessLogo logoUrl={biz.logoUrl} name={biz.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gana-text">{biz.name}</p>
                      <p className="text-xs text-gana-muted">Ver recompensas →</p>
                    </div>
                    <Badge variant="visits">
                      {biz.available} {biz.available === 1 ? 'visita' : 'visitas'}
                    </Badge>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
