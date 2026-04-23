import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { checkIsPlatformAdmin } from '@/lib/actions/backoffice'
import { Navbar } from '@/components/navbar'
import Link from 'next/link'

export default async function BackofficeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/entrar')

  const isAdmin = await checkIsPlatformAdmin(user.id)
  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gana-bg flex items-center justify-center">
          <div className="text-center px-4">
            <span className="text-4xl">🔒</span>
            <h1 className="mt-4 text-xl font-bold text-gana-text">Acceso restringido</h1>
            <p className="mt-2 text-sm text-gana-muted">No tienes permisos para acceder al backoffice.</p>
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
