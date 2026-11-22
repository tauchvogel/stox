'use strict';
// Beim Ändern von Dateien die Versionsnummer erhöhen (aktuell App 2.2 = notvorrat-v7), damit Handys die neue Version laden.
const CACHE = 'notvorrat-v7';
const ASSETS = [
  './',
  './style.css',
  './app.js',
  './data.js',
  './LICENSES.txt',
  './manifest.webmanifest',
  './lib/jsQR.js',
  './lib/qrcode.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache zuerst (funktioniert ohne Netz), im Hintergrund aktualisieren.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      const net = fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => null);
      if (hit) { e.waitUntil(net); return hit; }
      return net.then(res => res || (req.mode === 'navigate' ? caches.match('./') : Response.error()));
    })
  );
});
