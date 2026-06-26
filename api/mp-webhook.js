// api/mp-webhook.js
// Vercel Serverless Function para receber notificações de pagamento do Mercado Pago e atualizar o banco

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    const query = req.query || {};
    const body = req.body || {};

    // Obtém o ID do pagamento enviado pelo Mercado Pago (pode vir no query param ou no body)
    let paymentId = query['data.id'] || query['id'] || body?.data?.id;

    if (!paymentId) {
      res.statusCode = 200;
      res.end('No payment ID found');
      return;
    }

    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!MP_ACCESS_TOKEN || !supabaseUrl || !serviceRoleKey) {
      console.error('[mp-webhook] Environment variables missing on Vercel');
      res.statusCode = 500;
      res.end('Environment variables missing');
      return;
    }

    // Busca os detalhes do pagamento diretamente na API do Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
      }
    });

    if (!mpResponse.ok) {
      console.error('[mp-webhook] Failed to fetch payment details:', await mpResponse.text());
      res.statusCode = 200; // Sempre retorna 200 para o Mercado Pago não tentar reenviar
      res.end('Failed to fetch payment details');
      return;
    }

    const paymentData = await mpResponse.json();

    // Se o pagamento foi aprovado, libera o grupo/evento correspondente
    if (paymentData.status === 'approved') {
      const groupId = paymentData.external_reference;

      if (groupId) {
        // Atualiza a tabela 'groups' marcando a taxa da plataforma como paga
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/groups?id=eq.${encodeURIComponent(groupId)}`, {
          method: 'PATCH',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            platform_fee_paid: true
          })
        });

        if (!updateResponse.ok) {
          console.error('[mp-webhook] Failed to update group on Supabase:', await updateResponse.text());
          throw new Error('Supabase update failed');
        }

        console.log(`[mp-webhook] Group ${groupId} marked as paid successfully.`);
      }
    }

    res.statusCode = 200;
    res.end('OK');
  } catch (error) {
    console.error('[mp-webhook] Webhook error:', error);
    res.statusCode = 200; // Sempre retorna 200 para evitar retentativas infinitas
    res.end('Error processed');
  }
}
