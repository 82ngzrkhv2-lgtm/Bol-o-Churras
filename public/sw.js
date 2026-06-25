// public/sw.js — Service Worker com estratégias de cache otimizadas

const CACHE_NAME = 'bolao-v2';
const STATIC_ASSETS = [
  '/',
  '/logo.png',
  '/favicon.svg',
  '/manifest.json',
];

// ─── INSTALL: pré-cache dos assets críticos ───────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ─── ACTIVATE: limpa caches antigos ──────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ─── FETCH: estratégia por tipo de request ────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requests não-GET e chrome-extension
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // Network-First para Supabase e API Football (dados sempre frescos)
  if (url.hostname.includes('supabase.co') || url.hostname.includes('api-sports.io')) {
    event.respondWith(
      fetch(request)
        .then((res) => res)
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-First para assets estáticos buildados (hash no nome = imutáveis)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          return res;
        });
      })
    );
    return;
  }

  // Stale-While-Revalidate para demais requests (logo, manifest, etc.)
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        }
        return res;
      });
      return cached || networkFetch;
    })
  );
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

