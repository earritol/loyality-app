import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 })

  const { businessId } = await request.json()
  if (!businessId) return Response.json({ error: 'businessId requerido' }, { status: 400 })

  // Verify ownership
  const { data: admin } = await supabase
    .from('business_admins')
    .select('role')
    .eq('user_id', user.id)
    .eq('business_id', businessId)
    .single()

  if (!admin || admin.role !== 'owner') {
    return Response.json({ error: 'No tienes permisos' }, { status: 403 })
  }

  // Get subscription_id
  const { data: business } = await supabase
    .from('businesses')
    .select('subscription_id')
    .eq('id', businessId)
    .single()

  if (!business?.subscription_id) {
    return Response.json({ error: 'No hay suscripción activa' }, { status: 400 })
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) {
    return Response.json({ error: 'No configurado' }, { status: 500 })
  }

  try {
    // Cancel subscription in MercadoPago
    const res = await fetch(`https://api.mercadopago.com/preapproval/${business.subscription_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ status: 'cancelled' }),
    })

    const data = await res.json()
    console.log('[MP Cancel] Response:', { status: res.status, data })

    if (!res.ok) {
      console.error('[MP Cancel] Error', { businessId, error: data })
      return Response.json({ error: 'Error al cancelar la suscripción' }, { status: 500 })
    }

    // Update business
    await supabase.from('businesses').update({
      subscription_status: 'cancelled',
      billing_mode: 'manual',
    }).eq('id', businessId)

    return Response.json({ success: true })
  } catch (err) {
    console.error('[MP Cancel] Error', { businessId, error: err })
    return Response.json({ error: 'Error al conectar con MercadoPago' }, { status: 500 })
  }
}
