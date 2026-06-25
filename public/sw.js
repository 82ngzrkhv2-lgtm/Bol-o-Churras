// public/sw.js
// Service Worker para processar notificações push em background

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
      // Fallback para texto plano
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

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Trata clique nas ações ou na notificação em si
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Se já houver uma aba aberta, foca nela
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      // Caso contrário, abre uma nova aba
      if (clients.openWindow) {
        return clients.openWindow('/dashboard');
      }
    })
  );
});
