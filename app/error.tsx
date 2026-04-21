'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gana-bg flex items-center justify-center px-4">
      <div className="text-center">
        <span className="text-4xl">⚠️</span>
        <h1 className="mt-4 text-xl font-bold text-gana-text">Algo salió mal</h1>
        <p className="mt-2 text-sm text-gana-muted">Ocurrió un error inesperado. Intenta de nuevo.</p>
        <button
          onClick={reset}
          className="mt-4 rounded-xl bg-gana-green px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
