import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-gana-bg flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <Image
          src="/logo-gana.png"
          alt="GANA"
          width={280}
          height={93}
          className="mx-auto dark:hidden"
          priority
        />
        <Image
          src="/logo-gana-dark.png"
          alt="GANA"
          width={280}
          height={93}
          className="mx-auto hidden dark:block"
          priority
        />
        <p className="mt-4 text-gana-muted">
          Gana recompensas por tus visitas
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
