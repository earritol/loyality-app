'use client'

import { type HTMLAttributes, type MouseEvent, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type SheetProps = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  side?: 'left' | 'right' | 'bottom'
  className?: string
}

const sideStyles = {
  left: 'inset-y-0 left-0 w-[85%] max-w-sm rounded-r-2xl',
  right: 'inset-y-0 right-0 w-[85%] max-w-sm rounded-l-2xl',
  bottom: 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl',
}

export function Sheet({ open, onClose, children, side = 'bottom', className }: SheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  function handleOverlayClick(e: MouseEvent) {
    if (e.target === overlayRef.current) onClose()
  }

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/50 animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'fixed bg-gana-card border border-gana-border p-6 shadow-lg overflow-y-auto',
          sideStyles[side],
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-md p-1 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  )
}

export function SheetTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('text-lg font-semibold text-gana-text', className)}
      {...props}
    />
  )
}

export function SheetDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('mt-1 text-sm text-gana-muted', className)}
      {...props}
    />
  )
}
