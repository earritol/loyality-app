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

  // Fetch business slug + price for back_url
  const { data: business } = await supabase
    .from('businesses')
    .select('slug, monthly_price')
    .eq('id', businessId)
    .single()

  const slug = business?.slug ?? businessId
  const price = business?.monthly_price ?? 300
  const domain = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const backUrl = `${domain}/${slug}/admin`

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) {
    console.error('MERCADOPAGO_ACCESS_TOKEN not configured')
    return Response.json({ error: 'Suscripciones no configuradas' }, { status: 500 })
  }

  try {
    const res = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        reason: 'GanaMas Club mensual',
        external_reference: businessId,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: price,
          currency_id: 'MXN',
        },
        back_url: `${backUrl}?subscription=success`,
        status: 'pending',
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      console.error('MercadoPago subscription error', { businessId, error: data })
      return Response.json({ error: 'Error al crear la suscripción' }, { status: 500 })
    }

    // Save subscription_id
    await supabase
      .from('businesses')
      .update({
        subscription_id: data.id,
        subscription_status: 'pending',
        billing_mode: 'subscription',
      })
      .eq('id', businessId)

    return Response.json({ init_point: data.init_point })
  } catch (err) {
    console.error('MercadoPago create subscription error', { businessId, error: err })
    return Response.json({ error: 'Error al conectar con MercadoPago' }, { status: 500 })
  }
}
