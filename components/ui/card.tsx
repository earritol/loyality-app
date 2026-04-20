import { type HTMLAttributes } from 'react'

type Props = HTMLAttributes<HTMLDivElement>

export function Card({ children, className = '', ...props }: Props) {
  return (
    <div
      className={`rounded-2xl shadow-sm p-5 ${className}`}
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
      {...props}
    >
      {children}
    </div>
  )
}
