'use client'

import { useState, useActionState } from 'react'
import { updateBusiness, updateBusinessSettings } from '@/lib/actions/business'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BusinessLogo } from '@/components/ui/business-logo'
import type { ActionResult, Business } from '@/lib/types'

const initial: ActionResult = { success: false }

export function BusinessSettingsForm({ business, slug }: { business: Business; slug: string }) {
  const [logoState, logoAction, logoPending] = useActionState(updateBusiness, initial)
  const [settingsState, settingsAction, settingsPending] = useActionState(updateBusinessSettings, initial)
  const [preview, setPreview] = useState<string | null>(business.logo_url)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  return (
    <div className="space-y-8">
      {/* Section 1: Basic info + logo */}
      <form action={logoAction} className="space-y-4">
        <input type="hidden" name="businessId" value={business.id} />
        <input type="hidden" name="slug" value={slug} />

        <h3 className="font-bold text-gana-text">Información del negocio</h3>

        <div className="flex items-center gap-4">
          <BusinessLogo logoUrl={preview} name={business.name} size="lg" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gana-text mb-1">Logo</label>
            <input type="file" name="logo" accept="image/*" onChange={handleFileChange}
              className="block w-full text-sm text-gana-muted file:mr-3 file:rounded-lg file:border-0 file:bg-gana-green/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gana-green hover:file:bg-gana-green/20" />
            <p className="mt-1 text-xs text-gana-muted">Máximo 2MB</p>
          </div>
        </div>

        <Input label="Nombre" id="name" name="name" defaultValue={business.name} maxLength={100} required />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gana-text mb-1">Descripción</label>
          <textarea id="description" name="description" defaultValue={business.description ?? ''} rows={2} maxLength={500}
            className="block w-full rounded-xl border border-gana-border bg-gana-input-bg text-gana-input-text px-4 py-2.5 text-sm placeholder:text-gana-placeholder focus:outline-none focus:ring-2 focus:ring-gana-green/20" />
        </div>

        {logoState.error && <p className="text-xs text-gana-error">{logoState.error}</p>}
        {logoState.success && <p className="text-xs text-gana-success">Información actualizada</p>}
        <Button type="submit" loading={logoPending}>Guardar información</Button>
      </form>

      <hr className="border-gana-border" />

      {/* Section 2: Program settings */}
      <form action={settingsAction} className="space-y-4">
        <input type="hidden" name="businessId" value={business.id} />
        <input type="hidden" name="slug" value={slug} />

        <h3 className="font-bold text-gana-text">Programa de lealtad</h3>

        <Input label="Nombre del programa (opcional)" id="programName" name="programName"
          defaultValue={business.program_name ?? ''} maxLength={100} placeholder="Ej: Club de Recompensas" />

        <div>
          <label htmlFor="rulesText" className="block text-sm font-medium text-gana-text mb-1">Reglas del programa</label>
          <textarea id="rulesText" name="rulesText" defaultValue={business.rules_text ?? ''} rows={3} maxLength={2000}
            placeholder="Ej: Acumula visitas y canjea premios. Máximo una visita por día."
            className="block w-full rounded-xl border border-gana-border bg-gana-input-bg text-gana-input-text px-4 py-2.5 text-sm placeholder:text-gana-placeholder focus:outline-none focus:ring-2 focus:ring-gana-green/20" />
        </div>

        <div>
          <label htmlFor="termsText" className="block text-sm font-medium text-gana-text mb-1">Términos y condiciones</label>
          <textarea id="termsText" name="termsText" defaultValue={business.terms_text ?? ''} rows={4} maxLength={5000}
            placeholder="Ej: Los premios no son transferibles. El negocio se reserva el derecho..."
            className="block w-full rounded-xl border border-gana-border bg-gana-input-bg text-gana-input-text px-4 py-2.5 text-sm placeholder:text-gana-placeholder focus:outline-none focus:ring-2 focus:ring-gana-green/20" />
        </div>

        <Input label="Visitas máximas por día" id="maxVisitsPerDay" name="maxVisitsPerDay" type="number" min="1" step="1"
          defaultValue={business.max_visits_per_day?.toString() ?? '1'} />

        {settingsState.error && <p className="text-xs text-gana-error">{settingsState.error}</p>}
        {settingsState.success && <p className="text-xs text-gana-success">Configuración del programa actualizada</p>}
        <Button type="submit" loading={settingsPending}>Guardar configuración</Button>
      </form>
    </div>
  )
}
