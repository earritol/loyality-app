import { type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export function Input({ label, error, id, className = '', ...props }: Props) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gana-text mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`block w-full rounded-xl border px-4 py-2.5 text-sm bg-gana-input-bg text-gana-input-text placeholder:text-gana-placeholder focus:outline-none focus:ring-2 focus:ring-gana-green/20 ${error ? 'border-gana-error' : 'border-gana-border'} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-gana-error">{error}</p>}
    </div>
  )
}
