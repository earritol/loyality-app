import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'
import { UserQR } from '@/components/user-qr'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get visits grouped by business
  const { data: visits } = await supabase
    .from('visits')
    .select('business_id, businesses(name, slug)')
    .eq('user_id', user.id)

  // Aggregate visit counts per business
  const businessMap = new Map<string, { name: string; slug: string | null; count: number }>()

  for (const visit of visits ?? []) {
    const biz = visit.businesses as unknown as { name: string; slug: string | null } | null
    if (!biz) continue
    const existing = businessMap.get(visit.business_id)
    if (existing) {
      existing.count++
    } else {
      businessMap.set(visit.business_id, { name: biz.name, slug: biz.slug, count: 1 })
    }
  }

  const businessList = Array.from(businessMap.entries())

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">{user.email}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="mt-8">
          <UserQR userId={user.id} />
          <h2 className="text-lg font-medium text-gray-900">Your Visits</h2>

          {businessList.length === 0 ? (
            <div className="mt-4 bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-500">No visits recorded yet.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {businessList.map(([id, biz]) => (
                <div key={id} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{biz.name}</p>
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    {biz.count} {biz.count === 1 ? 'visit' : 'visits'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
