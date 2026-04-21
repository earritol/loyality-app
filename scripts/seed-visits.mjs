import { createClient } from '@supabase/supabase-js'

// ============ CONFIGURACIÓN ============
const NUM_VISITS = 10
const BUSINESS_ID = '27fb1e06-979f-42d6-a516-0a4dbf1d6fa7'
const USER_ID = '84c2a077-0bf5-4ef7-9d68-25b128227901'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// ========================================

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.')
  console.error('Ejecuta: node --env-file=.env.local scripts/seed-visits.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function main() {
  // Buscar la visita más antigua del usuario para este negocio
  const { data: oldest } = await supabase
    .from('visits')
    .select('created_at')
    .eq('user_id', USER_ID)
    .eq('business_id', BUSINESS_ID)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  // Si no hay visitas, usar hoy como referencia
  const baseDate = oldest ? new Date(oldest.created_at) : new Date()

  const visits = []
  for (let i = 0; i < NUM_VISITS; i++) {
    const date = new Date(baseDate)
    // Cada visita es un día antes que la anterior
    date.setUTCDate(date.getUTCDate() - (i + 1))
    date.setUTCHours(12, 0, 0, 0) // mediodía UTC para evitar edge cases

    visits.push({
      user_id: USER_ID,
      business_id: BUSINESS_ID,
      method: 'manual',
      created_at: date.toISOString(),
    })
  }

  console.log(`Insertando ${visits.length} visitas para user=${USER_ID} business=${BUSINESS_ID}`)
  console.log(`Rango: ${visits[visits.length - 1].created_at} → ${visits[0].created_at}`)

  const { data, error } = await supabase.from('visits').insert(visits).select('id, created_at')

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log(`✓ ${data.length} visitas insertadas`)
  data.forEach((v) => console.log(`  ${v.id} — ${v.created_at}`))
}

main()
