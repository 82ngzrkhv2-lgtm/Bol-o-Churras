import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import webpush from 'web-push'

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  const env: Record<string, string> = {};
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    for (let line of lines) {
      line = line.replace(/^\uFEFF/, '').trim();
      if (line && !line.startsWith('#')) {
        const idx = line.indexOf('=');
        if (idx > 0) {
          const key = line.slice(0, idx).trim();
          const val = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
          env[key] = val;
        }
      }
    }
  }
  return env;
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'push-notifications-api',
      configureServer(server) {
        server.middlewares.use('/api/send-push', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Method Not Allowed' }));
            return;
          }

          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });

          req.on('end', async () => {
            try {
              const { organizer_id, participant_name, status, group_name } = JSON.parse(body);

              if (!organizer_id || !participant_name || group_name === undefined) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Missing required fields' }));
                return;
              }

              const env = loadEnv();
              const supabaseUrl = env['VITE_SUPABASE_URL'];
              const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY'];
              if (!serviceRoleKey) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY not set in .env (dev only)' }));
                return;
              }

              if (!supabaseUrl) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Supabase URL not configured' }));
                return;
              }

              // Fetch the organizer's profile to get the push subscription
              const response = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${organizer_id}&select=push_subscription`, {
                headers: {
                  "apikey": serviceRoleKey,
                  "Authorization": `Bearer ${serviceRoleKey}`
                }
              });

              if (!response.ok) {
                const errText = await response.text();
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: `Failed to fetch organizer profile: ${errText}` }));
                return;
              }

              const profiles = (await response.json()) as any[];
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

              const vapidEmail = env['VAPID_EMAIL'] || 'mailto:admin@bolaonochurras.com';
              const publicKey = env['VITE_VAPID_PUBLIC_KEY'];
              const privateKey = env['VAPID_PRIVATE_KEY'];

              if (!publicKey || !privateKey) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'VAPID keys not configured in server .env' }));
                return;
              }

              webpush.setVapidDetails(vapidEmail, publicKey, privateKey);

              const payload = JSON.stringify({
                title: status ? '🥩 Presença Confirmada!' : '😢 Presença Cancelada',
                body: status 
                  ? `${participant_name} confirmou presença no grupo "${group_name}"!`
                  : `${participant_name} cancelou a presença no grupo "${group_name}".`,
                data: { url: '/dashboard' }
              });

              await webpush.sendNotification(subscription, payload);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err: any) {
              console.error('Error sending push notification:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
            }
          });
        });
      }
    }
  ],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor'
          }
          if (id.includes('node_modules/@supabase')) {
            return 'supabase-vendor'
          }
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/react-hot-toast')) {
            return 'ui-vendor'
          }
        },
      },
    },
  },
})
