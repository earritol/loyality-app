import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getBusinessBySlug, checkIsBusinessAdmin } from '@/lib/actions/business'
import { Navbar } from '@/components/navbar'
import Link from 'next/link'

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/entrar')

  const business = await getBusinessBySlug(slug)
  if (!business) notFound()

  const isAdmin = await checkIsBusinessAdmin(user.id, business.id)
  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gana-bg flex items-center justify-center">
          <div className="text-center px-4">
            <span className="text-4xl">🔒</span>
            <h1 className="mt-4 text-xl font-bold text-gana-text">Sin acceso</h1>
            <p className="mt-2 text-sm text-gana-muted">No eres administrador de este negocio.</p>
            <Link href="/inicio" className="mt-4 inline-block text-sm text-gana-green hover:underline">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
