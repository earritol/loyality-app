import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getBusinessBySlug, checkIsBusinessAdmin } from '@/lib/actions/business'
import { AdminPanel } from '@/app/[slug]/admin/admin-panel'
import QRScanner from '@/components/admin/QRScanner'

export default async function BusinessAdminPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/entrar')
  }

  const business = await getBusinessBySlug(slug)

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Not Found</h1>
          <p className="mt-2 text-gray-500">This business does not exist.</p>
        </div>
      </div>
    )
  }

  const isAdmin = await checkIsBusinessAdmin(user.id, business.id)

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Unauthorized</h1>
          <p className="mt-2 text-gray-500">You are not an admin of this business.</p>
        </div>
      </div>
    )
  }

  return <AdminPanel business={business} />
}
