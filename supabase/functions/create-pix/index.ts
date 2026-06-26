const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { groupId, amount, description, payerEmail, deviceId } = await req.json()

    if (!MP_ACCESS_TOKEN) {
      throw new Error('MP_ACCESS_TOKEN not configured')
    }

    const idempotencyKey = crypto.randomUUID()

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({
        transaction_amount: amount,
        description: description || 'Taxa Bolão e Churras',
        payment_method_id: 'pix',
        payer: {
          email: payerEmail || 'nao-informado@bolaoechurras.com.br'
        },
        external_reference: groupId,
        // Device ID obrigatório pelo Mercado Pago (anti-fraude)
        ...(deviceId ? { device_id: deviceId } : {}),
        items: [
          {
            id: groupId || 'bolao-churras',
            title: description || 'Taxa Bolão e Churras',
            description: description || 'Pagamento de taxa de organização do bolão e churras via plataforma BolãoeChurras',
            quantity: 1,
            unit_price: amount,
            currency_id: 'BRL'
          }
        ]
      })
    })

    const mpData = await mpResponse.json()

    if (!mpResponse.ok) {
      console.error('Mercado Pago Error:', mpData)
      throw new Error(mpData.message || 'Erro ao gerar PIX no Mercado Pago')
    }

    const qrCode = mpData.point_of_interaction?.transaction_data?.qr_code
    const qrCodeBase64 = mpData.point_of_interaction?.transaction_data?.qr_code_base64
    const paymentId = mpData.id

    return new Response(
      JSON.stringify({ qrCode, qrCodeBase64, paymentId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
