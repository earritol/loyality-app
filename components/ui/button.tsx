import { type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'success' | 'ghost'

const styles: Record<Variant, React.CSSProperties> = {
  primary: { backgroundColor: '#22C55E', color: '#FFFFFF' },
  secondary: { backgroundColor: '#FFFFFF', color: '#111827', border: '1px solid #E5E7EB' },
  success: { backgroundColor: '#FACC15', color: '#111827' },
  ghost: { backgroundColor: 'transparent', color: '#6B7280' },
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  loading?: boolean
}

export function Button({
  variant = 'primary',
  loading,
  disabled,
  children,
  className = '',
  ...props
}: Props) {
  return (
    <button
      disabled={disabled || loading}
      style={styles[variant]}
      className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gana-green disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 ${className}`}
      {...props}
    >
      {loading ? 'Cargando...' : children}
    </button>
  )
}
