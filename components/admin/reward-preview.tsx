'use client'

type Props = {
  name: string
  description: string
  requiredVisits: number
}

export function RewardPreview({ name, description, requiredVisits }: Props) {
  const hasContent = name || description || requiredVisits > 0

  if (!hasContent) {
    return (
      <div className="rounded-2xl border border-dashed border-gana-border p-5 text-center">
        <p className="text-sm text-gana-muted">Vista previa del premio</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gana-border bg-gana-card p-5">
      <p className="text-xs text-gana-muted uppercase tracking-wide mb-2">Así lo verán tus clientes</p>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold text-gana-text">{name || 'Nombre del premio'}</p>
          {description && <p className="mt-0.5 text-sm text-gana-muted">{description}</p>}
          <p className="mt-1 text-xs text-gana-muted">
            {requiredVisits > 0 ? `${requiredVisits} visitas requeridas` : '— visitas requeridas'}
          </p>
        </div>
        <span className="ml-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-gana-green/10 text-gana-green">
          🎁
        </span>
      </div>
    </div>
  )
}
