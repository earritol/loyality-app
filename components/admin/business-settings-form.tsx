'use client'

import { useState, useActionState } from 'react'
import { updateBusiness } from '@/lib/actions/business'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BusinessLogo } from '@/components/ui/business-logo'
import type { ActionResult, Business } from '@/lib/types'

const initial: ActionResult = { success: false }

export function BusinessSettingsForm({ business, slug }: { business: Business; slug: string }) {
  const [state, formAction, isPending] = useActionState(updateBusiness, initial)
  const [preview, setPreview] = useState<string | null>(business.logo_url)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="businessId" value={business.id} />
      <input type="hidden" name="slug" value={slug} />

      <div className="flex items-center gap-4">
        <BusinessLogo logoUrl={preview} name={business.name} size="lg" />
        <div className="flex-1">
          <label className="block text-sm font-medium text-gana-text mb-1">Logo del negocio</label>
          <input
            type="file"
            name="logo"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gana-muted file:mr-3 file:rounded-lg file:border-0 file:bg-gana-green/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gana-green hover:file:bg-gana-green/20"
          />
          <p className="mt-1 text-xs text-gana-muted">Máximo 2MB. Se ajustará automáticamente.</p>
        </div>
      </div>

      <Input label="Nombre" id="name" name="name" defaultValue={business.name} maxLength={100} required />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gana-text mb-1">Descripción</label>
        <textarea id="description" name="description" defaultValue={business.description ?? ''} rows={3} maxLength={500}
          className="block w-full rounded-xl border border-gana-border bg-gana-input-bg text-gana-input-text px-4 py-2.5 text-sm placeholder:text-gana-placeholder focus:outline-none focus:ring-2 focus:ring-gana-green/20" />
      </div>

      {state.error && <p className="text-xs text-gana-error">{state.error}</p>}
      {state.success && <p className="text-xs text-gana-success">Negocio actualizado correctamente</p>}

      <Button type="submit" loading={isPending}>Guardar cambios</Button>
    </form>
  )
}
