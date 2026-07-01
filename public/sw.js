// public/sw.js — Service Worker
// Estratégia: App Shell Cache (offline-first para assets estáticos)
//             + Network-first para APIs e dados dinâmicos
//             + Push Notifications

const SHELL_CACHE = 'bolao-shell-v1'
const DYNAMIC_CACHE = 'bolao-dynamic-v1'

// Assets do shell que queremos em cache para funcionamento offline
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
]

// Origens que NUNCA devem ser interceptadas (APIs externas e Supabase)
const BYPASS_ORIGINS = [
  'supabase.co',
  'mercadopago.com',
  'football.api-sports.io',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
]

// ─── INSTALL: pré-cache do shell ────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      return cache.addAll(SHELL_ASSETS).catch(() => {
        // Silencioso: em dev os assets podem não existir ainda
      })
    })
  )
})

// ─── ACTIVATE: limpa caches antigos ──────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== DYNAMIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ─── FETCH: estratégia por tipo de recurso ────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 1. Ignora requisições não-GET
  if (request.method !== 'GET') return

  // 2. Ignora APIs externas e Supabase (sempre network)
  if (BYPASS_ORIGINS.some((origin) => url.hostname.includes(origin))) return

  // 3. Ignora extensões de browser e chrome-extension
  if (!url.protocol.startsWith('http')) return

  // 4. Para navegação (HTML): Network-first com fallback para cache
  //    Isso garante que o app sempre tente buscar o HTML mais recente,
  //    mas funciona offline mostrando o shell em cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(SHELL_CACHE).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(() => caches.match('/index.html'))
    )
    return
  }

  // 5. Para assets estáticos (JS, CSS, imagens): Cache-first
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.match(/\.(js|css|png|svg|ico|woff2?)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
      })
    )
    return
  }
})

// ─── PUSH NOTIFICATIONS ───────────────────────────────────────────────────────
self.addEventListener('push', function (event) {
  if (event.data) {
    try {
      const data = event.data.json()
      const options = {
        body: data.body || 'Alguém confirmou presença no seu evento!',
        icon: '/logo.png',
        badge: '/favicon.svg',
        data: data.data || {},
        vibrate: [100, 50, 100],
        actions: [{ action: 'open', title: 'Ver Painel' }],
      }
      event.waitUntil(
        self.registration.showNotification(data.title || '⚽ Bolão & Churras', options)
      )
    } catch {
      const options = {
        body: event.data.text(),
        icon: '/logo.png',
        badge: '/favicon.svg',
      }
      event.waitUntil(
        self.registration.showNotification('⚽ Bolão & Churras', options)
      )
    }
  }
})

// ─── NOTIFICATION CLICK ───────────────────────────────────────────────────────
self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          if (client.url.includes('/dashboard') && 'focus' in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/dashboard')
        }
      })
  )
})
