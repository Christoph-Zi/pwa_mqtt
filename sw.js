// Variablen für den Cache und MQTT-Endpunkt
const CACHE_NAME = 'pwa-cache-v1';
const CACHE_FILES = [
    '/',
    '/index.html',
    '/script.js',
    '/manifest.json',
    '/icons/icon192.png',
    '/icons/icon512.png',
    '/favicon.ico',
    '/offline.html'
];
const MQTT_BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt'; // URL des MQTT-Brokers

// Service Worker installieren und Dateien cachen
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CACHE_FILES);
        })
    );
    console.log('[Service Worker] Installiert und Dateien gecacht.');
});

// Alte Caches entfernen
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log(`[Service Worker] Entfernt alten Cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    console.log('[Service Worker] Aktiviert.');
});

// Netzwerkanfragen abfangen
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    // Prüfe, ob die Anfrage an den MQTT-Broker geht
    if (requestUrl.origin === new URL(MQTT_BROKER_URL).origin) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    console.log('[Service Worker] Verbindung zum MQTT-Broker fehlgeschlagen. Zeige Offline-Seite.');
                    return caches.match('/offline.html');
                })
                .then((response) => response || new Response('Offline-Seite nicht gefunden.', { status: 404 }))
        );
        return;
    }

    // Allgemeiner Cache- und Netzwerk-Handler
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request)
                .catch(() => {
                    // Fallback auf Offline-Seite bei HTML-Dateien
                    if (event.request.headers.get('accept')?.includes('text/html')) {
                        return caches.match('/offline.html');
                    }

                    // Rückgabe eines generischen 404-Responses, falls nichts passt
                    return new Response('Ressource nicht gefunden und offline.', { status: 404 });
                });
        })
    );
});