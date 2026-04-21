type Props = {
  icon?: string
  title: string
  description?: string
}

export function EmptyState({ icon = '📭', title, description }: Props) {
  return (
    <div className="rounded-2xl p-8 text-center shadow-sm bg-gana-card border border-gana-border">
      <span className="text-3xl">{icon}</span>
      <p className="mt-2 font-semibold text-gana-text">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-gana-muted">{description}</p>
      )}
    </div>
  )
}
