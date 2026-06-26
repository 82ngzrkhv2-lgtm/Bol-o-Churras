// api/create-pix.js
// Vercel Serverless Function para gerar PIX copia e cola via Mercado Pago
import crypto from 'crypto';

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
    const { groupId, amount, description, payerEmail } = req.body || {};

    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

    if (!MP_ACCESS_TOKEN) {
      console.error('[create-pix] MP_ACCESS_TOKEN is missing');
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Server configuration error: MP_ACCESS_TOKEN missing in Vercel settings.' }));
      return;
    }

    const idempotencyKey = crypto.randomUUID();

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
        external_reference: groupId
      })
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('Mercado Pago Error:', mpData);
      res.statusCode = mpResponse.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: mpData.message || 'Erro ao gerar PIX no Mercado Pago' }));
      return;
    }

    const qrCode = mpData.point_of_interaction?.transaction_data?.qr_code;
    const qrCodeBase64 = mpData.point_of_interaction?.transaction_data?.qr_code_base64;
    const paymentId = mpData.id;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ qrCode, qrCodeBase64, paymentId }));

  } catch (error) {
    console.error('[create-pix] Unexpected error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message || 'Internal server error' }));
  }
}
