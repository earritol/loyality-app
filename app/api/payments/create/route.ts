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

  // Fetch business slug for back_urls
  const { data: business } = await supabase
    .from('businesses')
    .select('slug')
    .eq('id', businessId)
    .single()

  const slug = business?.slug ?? businessId
  const domain = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const backUrl = `${domain}/${slug}/admin`

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) {
    console.error('MERCADOPAGO_ACCESS_TOKEN not configured')
    return Response.json({ error: 'Pagos no configurados' }, { status: 500 })
  }

  try {
    const preferenceBody = {
      items: [{
        title: 'GanaMas Club mensual',
        quantity: 1,
        unit_price: 300,
        currency_id: 'MXN',
      }],
      metadata: { business_id: businessId },
      external_reference: businessId,
      back_urls: {
        success: `${backUrl}?payment=success`,
        failure: `${backUrl}?payment=error`,
        pending: `${backUrl}?payment=pending`,
      },
      auto_return: 'approved',
    }

    console.log('[MP Payment] Creating preference', { businessId, userId: user.id })
    console.log('[MP Payment] Request body:', JSON.stringify(preferenceBody, null, 2))
    console.log('[MP Payment] Token prefix:', accessToken.substring(0, 20) + '...')

    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferenceBody),
    })

    const data = await res.json()
    console.log('[MP Payment] Response status:', res.status)
    console.log('[MP Payment] Response:', JSON.stringify(data, null, 2))

    if (!res.ok) {
      console.error('[MP Payment] Preference error', { businessId, status: res.status, error: data })
      return Response.json({ error: 'Error al crear el pago' }, { status: 500 })
    }

    console.log('[MP Payment] Success! init_point:', data.init_point)
    return Response.json({ init_point: data.init_point })
  } catch (err) {
    console.error('MercadoPago create payment error', { businessId, error: err })
    return Response.json({ error: 'Error al conectar con MercadoPago' }, { status: 500 })
  }
}
