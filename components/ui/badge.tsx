type Variant = 'visits' | 'pending' | 'redeemed' | 'locked' | 'success'

const styles: Record<Variant, React.CSSProperties> = {
  visits: { backgroundColor: '#DCFCE7', color: '#16A34A' },
  pending: { backgroundColor: '#FEF9C3', color: '#A16207' },
  redeemed: { backgroundColor: '#DCFCE7', color: '#15803D' },
  locked: { backgroundColor: '#F3F4F6', color: '#6B7280' },
  success: { backgroundColor: '#FEF9C3', color: '#111827' },
}

type Props = {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'visits', children, className = '' }: Props) {
  return (
    <span
      style={styles[variant]}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  )
}
