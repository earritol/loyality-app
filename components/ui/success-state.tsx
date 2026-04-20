type Props = {
  title?: string
  description?: string
}

export function SuccessState({
  title = '¡Ya ganaste!',
  description = 'Tu recompensa está lista para canjear.',
}: Props) {
  return (
    <div
      className="rounded-2xl p-6 text-center"
      style={{ backgroundColor: '#FEF9C3', border: '1px solid #FDE68A' }}
    >
      <span className="text-4xl">🎉</span>
      <p className="mt-2 text-lg font-bold" style={{ color: '#111827' }}>{title}</p>
      <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>{description}</p>
    </div>
  )
}
