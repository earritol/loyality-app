type Props = {
  icon?: string
  title: string
  description?: string
}

export function EmptyState({ icon = '📭', title, description }: Props) {
  return (
    <div
      className="rounded-2xl p-8 text-center shadow-sm"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
    >
      <span className="text-3xl">{icon}</span>
      <p className="mt-2 font-semibold" style={{ color: '#111827' }}>{title}</p>
      {description && (
        <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>{description}</p>
      )}
    </div>
  )
}
