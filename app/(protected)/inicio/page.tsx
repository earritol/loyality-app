import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserQR } from '@/components/user-qr'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { BusinessLogo } from '@/components/ui/business-logo'
import Link from 'next/link'
import Image from 'next/image'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/entrar')

  const { data: visits } = await supabase
    .from('visits')
    .select('business_id, businesses(name, slug, logo_url)')
    .eq('user_id', user.id)

  const businessMap = new Map<string, { name: string; slug: string | null; logoUrl: string | null; count: number }>()

  for (const visit of visits ?? []) {
    const biz = visit.businesses as unknown as { name: string; slug: string | null; logo_url: string | null } | null
    if (!biz) continue
    const existing = businessMap.get(visit.business_id)
    if (existing) {
      existing.count++
    } else {
      businessMap.set(visit.business_id, { name: biz.name, slug: biz.slug, logoUrl: biz.logo_url, count: 1 })
    }
  }

  const businessList = Array.from(businessMap.entries())

  return (
    <div className="min-h-screen bg-gana-bg">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* replaced by Navbar — logo and signOut button removed */}

        <Card className="text-center">
          <p className="text-xs font-semibold text-gana-muted uppercase tracking-wide">Tu código QR</p>
          <div className="mt-3">
            <UserQR userId={user.id} />
          </div>
          <p className="mt-2 text-xs text-gana-muted">Muéstralo al negocio para registrar tu visita</p>
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
              {businessList.map(([id, biz]) => (
                <Link key={id} href={`/local/${biz.slug ?? id}`}>
                  <Card className="flex items-center gap-3 hover:border-gana-green/30 transition-colors cursor-pointer">
                    <BusinessLogo logoUrl={biz.logoUrl} name={biz.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gana-text">{biz.name}</p>
                      <p className="text-xs text-gana-muted">Ver recompensas →</p>
                    </div>
                    <Badge variant="visits">
                      {biz.count} {biz.count === 1 ? 'visita' : 'visitas'}
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
