import { type HTMLAttributes } from 'react'

type Props = HTMLAttributes<HTMLDivElement>

export function Card({ children, className = '', ...props }: Props) {
  return (
    <div
      className={`rounded-2xl shadow-sm p-5 bg-gana-card border border-gana-border ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
