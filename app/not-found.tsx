import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gana-bg flex items-center justify-center px-4">
      <div className="text-center">
        <span className="text-4xl">🔍</span>
        <h1 className="mt-4 text-xl font-bold text-gana-text">Página no encontrada</h1>
        <p className="mt-2 text-sm text-gana-muted">La página que buscas no existe.</p>
        <Link
          href="/inicio"
          className="mt-4 inline-block rounded-xl bg-gana-green px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
