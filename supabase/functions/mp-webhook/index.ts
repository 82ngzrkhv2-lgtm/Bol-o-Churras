import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  try {
    const url = new URL(req.url)
    
    // Mercado Pago envia notificações tanto via query param (topic/id) quanto via body (action/data.id)
    let paymentId = url.searchParams.get('data.id') || url.searchParams.get('id')
    
    if (!paymentId) {
      const body = await req.json().catch(() => null)
      if (body?.data?.id) {
        paymentId = body.data.id
      }
    }

    if (!paymentId) {
      return new Response('No payment ID found', { status: 200 })
    }

    if (!MP_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Environment variables missing')
    }

    // Buscar detalhes do pagamento no MP
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
      }
    })

    if (!mpResponse.ok) {
      throw new Error('Failed to fetch payment from Mercado Pago')
    }

    const paymentData = await mpResponse.json()

    // Verificar se o pagamento foi aprovado
    if (paymentData.status === 'approved') {
      const groupId = paymentData.external_reference

      if (groupId) {
        // Inicializar cliente Supabase com Service Role para bypass RLS
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        const { error } = await supabase
          .from('groups')
          .update({ platform_fee_paid: true })
          .eq('id', groupId)

        if (error) {
          console.error('Error updating group in Supabase:', error)
          throw error
        }
        
        console.log(`Group ${groupId} marked as paid successfully.`)
      }
    }

    return new Response('OK', { status: 200 })
  } catch (error: any) {
    console.error('Webhook Error:', error.message)
    // Always return 200 to MP so it stops retrying, unless it's a fatal transient error
    return new Response('Error processed', { status: 200 })
  }
})
