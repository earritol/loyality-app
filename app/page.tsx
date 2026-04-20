import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gana-bg flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <span className="text-5xl">🎁</span>
        <h1 className="mt-4 text-4xl font-bold text-gana-text">GANA</h1>
        <p className="mt-1 text-sm font-semibold text-gana-green">GanaMás Club</p>
        <p className="mt-4 text-gana-muted">
          Gana recompensas en tus negocios locales favoritos. Registra visitas, canjea premios.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/entrar"
            className="inline-block w-full rounded-xl bg-gana-green px-6 py-3 text-sm font-semibold text-white hover:bg-gana-green-dark transition-colors"
          >
            Comenzar
          </Link>
          <Link
            href="/entrar"
            className="text-sm text-gana-muted hover:text-gana-text transition-colors"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
