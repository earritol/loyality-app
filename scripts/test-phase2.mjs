import { createClient } from '@supabase/supabase-js'

// ============ CONFIGURACIÓN ============
const BUSINESS_ID = 'aa09c3fd-b8b4-42f5-84ef-12758de51a39'
const USER_ID = 'f95706d8-6f60-4817-9c75-a220172cdde1'
const ADMIN_USER_ID = 'f95706d8-6f60-4817-9c75-a220172cdde1' // el admin que ejecuta el canje

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
// ========================================

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Necesitas NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function testLoyaltyStats() {
  console.log('\n=== Test: getUserLoyaltyStats ===')

  const { count: totalVisits } = await supabase
    .from('visits')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', USER_ID)
    .eq('business_id', BUSINESS_ID)

  const { data: redemptions } = await supabase
    .from('redemptions')
    .select('visits_used')
    .eq('user_id', USER_ID)
    .eq('business_id', BUSINESS_ID)

  const usedVisits = (redemptions ?? []).reduce((sum, r) => sum + (r.visits_used ?? 0), 0)
  const available = (totalVisits ?? 0) - usedVisits

  console.log(`  Total visitas: ${totalVisits}`)
  console.log(`  Visitas usadas: ${usedVisits}`)
  console.log(`  Visitas disponibles: ${available}`)
  return available
}

async function testDashboardMetrics() {
  console.log('\n=== Test: getAdminDashboardData (métricas) ===')

  const { count: totalVisits } = await supabase
    .from('visits')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', BUSINESS_ID)

  const { count: totalRedemptions } = await supabase
    .from('redemptions')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', BUSINESS_ID)

  const { data: visitors } = await supabase
    .from('visits')
    .select('user_id')
    .eq('business_id', BUSINESS_ID)

  const uniqueCustomers = new Set((visitors ?? []).map(v => v.user_id)).size

  const { count: activeRewards } = await supabase
    .from('rewards')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', BUSINESS_ID)
    .eq('is_active', true)

  console.log(`  Total visitas: ${totalVisits}`)
  console.log(`  Total canjes: ${totalRedemptions}`)
  console.log(`  Clientes únicos: ${uniqueCustomers}`)
  console.log(`  Rewards activas: ${activeRewards}`)
}

async function testRedemptionRPC() {
  console.log('\n=== Test: create_admin_redemption (RPC) ===')

  // Get first active reward
  const { data: rewards } = await supabase
    .from('rewards')
    .select('id, name, required_visits')
    .eq('business_id', BUSINESS_ID)
    .eq('is_active', true)
    .limit(1)

  if (!rewards?.length) {
    console.log('  ⚠ No hay rewards activas para probar. Crea una primero.')
    return
  }

  const reward = rewards[0]
  console.log(`  Reward: "${reward.name}" (requiere ${reward.required_visits} visitas)`)

  const available = await testLoyaltyStats()

  if (available < reward.required_visits) {
    console.log(`  ⚠ Visitas insuficientes (${available} < ${reward.required_visits}). Probando que falle correctamente...`)

    const { data, error } = await supabase.rpc('create_admin_redemption', {
      p_user_id: USER_ID,
      p_business_id: BUSINESS_ID,
      p_reward_id: reward.id,
      p_redeemed_by: ADMIN_USER_ID,
    })

    if (error?.message?.includes('INSUFFICIENT_VISITS')) {
      console.log(`  ✓ Correctamente rechazado: ${error.message}`)
    } else {
      console.log(`  ✗ Error inesperado:`, error)
    }
    return
  }

  console.log(`  Ejecutando canje (${available} visitas disponibles)...`)

  const { data, error } = await supabase.rpc('create_admin_redemption', {
    p_user_id: USER_ID,
    p_business_id: BUSINESS_ID,
    p_reward_id: reward.id,
    p_redeemed_by: ADMIN_USER_ID,
  })

  if (error) {
    console.log(`  ✗ Error: ${error.message}`)
  } else {
    const result = Array.isArray(data) ? data[0] : data
    console.log(`  ✓ Canje exitoso!`)
    console.log(`    Visitas restantes: ${result?.visits_remaining}`)
    console.log(`    Visitas consumidas: ${result?.visits_consumed}`)
  }
}

async function main() {
  console.log('Probando Phase 2 — Server Actions')
  console.log(`Business: ${BUSINESS_ID}`)
  console.log(`User: ${USER_ID}`)

  await testDashboardMetrics()
  await testLoyaltyStats()
  await testRedemptionRPC()

  console.log('\n✓ Tests completados')
}

main().catch(console.error)
