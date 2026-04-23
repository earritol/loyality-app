import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS — webhook has no user session
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const body = await request.json()
  console.log('[MP Webhook] Received:', JSON.stringify(body, null, 2))

  const { type, data } = body

  if (!type || !data?.id) {
    console.log('[MP Webhook] Ignored — no type or data.id')
    return Response.json({ received: true })
  }

  console.log('[MP Webhook] Processing:', { type, id: data.id })

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) {
    console.error('Webhook: MERCADOPAGO_ACCESS_TOKEN not configured')
    return Response.json({ error: 'Not configured' }, { status: 500 })
  }

  const supabase = getServiceClient()

  try {
    if (type === 'payment') {
      // Fetch payment details from MercadoPago API (don't trust webhook payload)
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      })
      const payment = await res.json()

      if (!res.ok) {
        console.error('Webhook: failed to fetch payment', { id: data.id, error: payment })
        return Response.json({ error: 'Failed to verify' }, { status: 500 })
      }

      const businessId = payment.metadata?.business_id || payment.external_reference
      if (!businessId) {
        console.error('[MP Webhook] No business_id in payment', { id: data.id, metadata: payment.metadata, external_reference: payment.external_reference })
        return Response.json({ received: true })
      }

      // Fetch current business state for logging
      const { data: currentBiz } = await supabase
        .from('businesses')
        .select('status, last_payment_date')
        .eq('id', businessId)
        .single()

      console.log('[MP Webhook] Payment details:', {
        paymentId: data.id,
        businessId,
        paymentStatus: payment.status,
        amount: payment.transaction_amount,
        currentBusinessStatus: currentBiz?.status ?? 'unknown',
        currentLastPayment: currentBiz?.last_payment_date ?? 'none',
      })

      if (payment.status === 'approved') {
        const today = new Date().toISOString().split('T')[0]

        // Reactivate business — works for active, past_due, or suspended
        const { error: updateErr } = await supabase.from('businesses').update({
          status: 'active',
          last_payment_date: today,
        }).eq('id', businessId)

        if (updateErr) {
          console.error('[MP Webhook] Failed to update business', { businessId, error: updateErr })
        } else {
          console.log('[MP Webhook] Business reactivated', {
            businessId,
            previousStatus: currentBiz?.status,
            newStatus: 'active',
            lastPaymentDate: today,
          })
        }

        // Register payment in payments table
        const { error: payErr } = await supabase.from('payments').insert({
          business_id: businessId,
          amount: payment.transaction_amount || 300,
          payment_date: today,
          method: 'transfer',
          notes: `MercadoPago #${data.id}`,
        })

        if (payErr) {
          console.error('[MP Webhook] Failed to insert payment record', { businessId, error: payErr })
        } else {
          console.log('[MP Webhook] Payment recorded', { businessId, amount: payment.transaction_amount })
        }
      } else if (['rejected', 'cancelled', 'refunded'].includes(payment.status)) {
        // Mark as past_due — do NOT suspend automatically
        const { error: updateErr } = await supabase.from('businesses').update({
          status: 'past_due',
        }).eq('id', businessId)

        if (updateErr) {
          console.error('[MP Webhook] Failed to update business to past_due', { businessId, error: updateErr })
        }

        console.log('[MP Webhook] Payment failed/cancelled', {
          businessId,
          paymentStatus: payment.status,
          previousStatus: currentBiz?.status,
        })
      } else {
        console.log('[MP Webhook] Payment status not handled:', { businessId, status: payment.status })
      }
    }

    if (type === 'subscription_preapproval' || type === 'preapproval') {
      // Fetch subscription details
      const res = await fetch(`https://api.mercadopago.com/preapproval/${data.id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      })
      const sub = await res.json()

      if (!res.ok) {
        console.error('Webhook: failed to fetch subscription', { id: data.id, error: sub })
        return Response.json({ error: 'Failed to verify' }, { status: 500 })
      }

      const businessId = sub.external_reference
      if (!businessId) {
        console.error('Webhook: no business_id in subscription', { id: data.id })
        return Response.json({ received: true })
      }

      if (sub.status === 'authorized') {
        await supabase.from('businesses').update({
          subscription_status: 'active',
          billing_mode: 'subscription',
        }).eq('id', businessId)

        console.log('Webhook: subscription authorized', { businessId })
      } else if (['paused', 'cancelled'].includes(sub.status)) {
        await supabase.from('businesses').update({
          subscription_status: 'inactive',
        }).eq('id', businessId)

        console.log('Webhook: subscription paused/cancelled', { businessId, status: sub.status })
      }
    }
  } catch (err) {
    console.error('[MP Webhook] Processing error', { type, id: data.id, error: err })
    // Always return 200 to MercadoPago to prevent retries
    return Response.json({ received: true, error: 'Processing error' })
  }

  return Response.json({ received: true })
}
