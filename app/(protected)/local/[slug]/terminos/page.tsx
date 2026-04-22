import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import Link from 'next/link'

export default async function TerminosPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/entrar')

  const { data: business } = await supabase
    .from('businesses')
    .select('name, program_name, rules_text, terms_text')
    .eq('slug', slug)
    .single()

  if (!business) {
    return (
      <div className="min-h-screen bg-gana-bg flex items-center justify-center">
        <EmptyState icon="🔍" title="No encontrado" description="Este negocio no existe." />
      </div>
    )
  }

  const title = business.program_name || business.name
  const hasContent = business.rules_text || business.terms_text

  return (
    <div className="min-h-screen bg-gana-bg">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gana-text">{title}</h1>

        {!hasContent ? (
          <div className="mt-6">
            <EmptyState icon="📄" title="Sin información" description="Este negocio aún no ha configurado reglas ni términos." />
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {business.rules_text && (
              <div>
                <h2 className="text-lg font-bold text-gana-text">Reglas del programa</h2>
                <Card className="mt-3">
                  <p className="text-sm text-gana-text whitespace-pre-line">{business.rules_text}</p>
                </Card>
              </div>
            )}

            {business.terms_text && (
              <div>
                <h2 className="text-lg font-bold text-gana-text">Términos y condiciones</h2>
                <Card className="mt-3">
                  <p className="text-sm text-gana-text whitespace-pre-line">{business.terms_text}</p>
                </Card>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href={`/local/${slug}`} className="text-sm text-gana-green hover:underline">
            ← Volver al negocio
          </Link>
        </div>
      </div>
    </div>
  )
}
