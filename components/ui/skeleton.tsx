type Props = {
  className?: string
}

export function Skeleton({ className = '' }: Props) {
  return (
    <div className={`animate-pulse rounded-xl bg-gana-border/50 ${className}`} />
  )
}
