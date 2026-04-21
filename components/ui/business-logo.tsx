type Size = 'sm' | 'md' | 'lg'

const sizes: Record<Size, string> = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
}

type Props = {
  logoUrl: string | null
  name: string
  size?: Size
  className?: string
}

export function BusinessLogo({ logoUrl, name, size = 'md', className = '' }: Props) {
  const sizeClass = sizes[size]

  if (!logoUrl) {
    return (
      <div className={`${sizeClass} rounded-xl bg-gana-green/10 flex items-center justify-center flex-shrink-0 ${className}`}>
        <span className={size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl'}>
          🏪
        </span>
      </div>
    )
  }

  return (
    <div className={`${sizeClass} rounded-xl overflow-hidden bg-gana-card border border-gana-border flex-shrink-0 ${className}`}>
      <img
        src={logoUrl}
        alt={name}
        className="w-full h-full object-contain"
      />
    </div>
  )
}
