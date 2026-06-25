// public/sw.js — Service Worker (apenas Notificações Push, cache desativado)

const CACHE_NAME = 'bolao-v3';

// ─── INSTALL: ativação imediata ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// ─── ACTIVATE: limpa absolutamente TODOS os caches antigos do navegador ────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ─── PUSH NOTIFICATIONS ───────────────────────────────────────────────────────
self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body || 'Alguém confirmou presença no seu evento!',
        icon: '/logo.png',
        badge: '/favicon.svg',
        data: data.data || {},
        vibrate: [100, 50, 100],
        actions: [
          { action: 'open', title: 'Ver Painel' }
        ]
      };
      event.waitUntil(
        self.registration.showNotification(data.title || '⚽ Bolão & Churras', options)
      );
    } catch (e) {
      const options = {
        body: event.data.text(),
        icon: '/logo.png',
        badge: '/favicon.svg'
      };
      event.waitUntil(
        self.registration.showNotification('⚽ Bolão & Churras', options)
      );
    }
  }
});

// ─── NOTIFICATION CLICK ───────────────────────────────────────────────────────
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/dashboard');
      }
    })
  );
});

