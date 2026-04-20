type Props = {
  current: number
  total: number
}

export function ProgressBar({ current, total }: Props) {
  const pct = Math.min(100, (current / total) * 100)

  return (
    <div className="h-2 w-full rounded-full" style={{ backgroundColor: '#E5E7EB' }}>
      <div
        className="h-2 rounded-full transition-all duration-300"
        style={{ width: `${pct}%`, backgroundColor: '#22C55E' }}
      />
    </div>
  )
}
