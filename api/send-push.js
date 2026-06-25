// api/send-push.js
// Vercel Serverless Function para envio de notificações push em produção

import webpush from 'web-push';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://bolaoechurras.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    const { organizer_id, participant_name, status, group_name } = req.body || {};

    if (!organizer_id || !participant_name || group_name === undefined) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Missing required fields: organizer_id, participant_name, group_name' }));
      return;
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const publicKey = process.env.VITE_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@bolaonochurras.com';

    // Valida variáveis de ambiente — NUNCA fallback para chaves hardcoded
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[send-push] Missing Supabase env vars');
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Server misconfiguration: configure VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no painel da Vercel' }));
      return;
    }

    if (!publicKey || !privateKey) {
      console.error('[send-push] Missing VAPID env vars');
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Server misconfiguration: configure VITE_VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY no painel da Vercel' }));
      return;
    }

    // Fetch com timeout de 8s
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let profileRes;
    try {
      profileRes = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(organizer_id)}&select=push_subscription`,
        {
          headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
          signal: controller.signal,
        }
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!profileRes.ok) {
      console.error('[send-push] Supabase error:', await profileRes.text());
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to fetch organizer profile' }));
      return;
    }

    const profiles = await profileRes.json();
    if (!profiles || profiles.length === 0) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Organizer profile not found' }));
      return;
    }

    const subscription = profiles[0].push_subscription;
    if (!subscription) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true, message: 'Organizer has no push subscription' }));
      return;
    }

    webpush.setVapidDetails(vapidEmail, publicKey, privateKey);

    const payload = JSON.stringify({
      title: status ? '🥩 Presença Confirmada!' : '😢 Presença Cancelada',
      body: status
        ? `${participant_name} confirmou presença no grupo "${group_name}"!`
        : `${participant_name} cancelou a presença no grupo "${group_name}".`,
      data: { url: '/dashboard' },
    });

    await webpush.sendNotification(subscription, payload);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true }));
  } catch (err) {
    console.error('[send-push] Unexpected error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
