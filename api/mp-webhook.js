// api/mp-webhook.js
// Vercel Serverless Function para receber notificações de pagamento do Mercado Pago

export default async function handler(req, res) {
  // ── CORS ───────────────────────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-signature, x-request-id');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // O Mercado Pago pode enviar GET com query params para validação inicial
  if (req.method === 'GET') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  // ── Sempre retorna 200 para evitar retentativas infinitas do MP ───────────
  // O processamento é feito de forma "best-effort"
  try {
    const query = req.query || {};
    const body = req.body || {};

    console.log('[mp-webhook] Received webhook:', {
      query,
      body,
      headers: {
        'x-signature': req.headers['x-signature'],
        'x-request-id': req.headers['x-request-id'],
      }
    });

    // O MP pode enviar o ID de pagamento de várias formas:
    // 1. Query param: ?data.id=123 (notificação IPN antiga)
    // 2. Query param: ?id=123&topic=payment (notificação IPN)
    // 3. Body JSON: { data: { id: "123" }, type: "payment" } (notificação Webhook v2)
    let paymentId = query['data.id'] || query['id'] || body?.data?.id;
    const topic = query['topic'] || query['type'] || body?.type || body?.action;

    console.log(`[mp-webhook] paymentId=${paymentId}, topic=${topic}`);

    // Ignora notificações que não são de pagamento
    if (topic && !String(topic).includes('payment')) {
      console.log(`[mp-webhook] Ignoring non-payment notification: ${topic}`);
      res.statusCode = 200;
      res.end('OK');
      return;
    }

    // Sem ID de pagamento → aceita e ignora (pode ser ping de validação)
    if (!paymentId) {
      console.log('[mp-webhook] No payment ID, returning OK (ping/validation)');
      res.statusCode = 200;
      res.end('OK');
      return;
    }

    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!MP_ACCESS_TOKEN || !supabaseUrl || !serviceRoleKey) {
      console.error('[mp-webhook] Environment variables missing');
      // Retorna 200 para evitar retentativas, mas loga o erro
      res.statusCode = 200;
      res.end('OK');
      return;
    }

    // Busca os detalhes do pagamento na API do Mercado Pago para confirmar
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
      }
    });

    if (!mpResponse.ok) {
      const errText = await mpResponse.text();
      console.error('[mp-webhook] Failed to fetch payment details:', errText);
      res.statusCode = 200;
      res.end('OK');
      return;
    }

    const paymentData = await mpResponse.json();
    console.log(`[mp-webhook] Payment ${paymentId} status: ${paymentData.status}`);

    // Só processa pagamentos aprovados
    if (paymentData.status === 'approved') {
      const groupId = paymentData.external_reference;

      if (groupId) {
        const updateResponse = await fetch(
          `${supabaseUrl}/rest/v1/groups?id=eq.${encodeURIComponent(groupId)}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': serviceRoleKey,
              'Authorization': `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ platform_fee_paid: true })
          }
        );

        if (!updateResponse.ok) {
          const errText = await updateResponse.text();
          console.error('[mp-webhook] Supabase update failed:', errText);
        } else {
          console.log(`[mp-webhook] ✅ Group ${groupId} marked as paid.`);
        }
      }
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ received: true }));

  } catch (error) {
    console.error('[mp-webhook] Unexpected error:', error);
    // IMPORTANTE: sempre retorna 200 para o MP não reenviar infinitamente
    res.statusCode = 200;
    res.end('OK');
  }
}
