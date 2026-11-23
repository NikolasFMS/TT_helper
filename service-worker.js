const APP_CACHE_PREFIX = 'topten-helper-cache-';
const LEGACY_APP_CACHES = ['TopTenV1', 'TopTenV2', 'TopTenV3', 'TopTenV4'];
const CACHE_NAME = `${APP_CACHE_PREFIX}v10`;

const URLS_TO_CACHE = [
    './',
    './index.html',
    './audio/click.mp3',
    './css/styles.css',
    './manifest.json',
    './scripts/cards-data.js',
    './scripts/cards-18-en.js',
    './scripts/script.js',
    './ico/favicon.ico',
    './ico/icon_x48.png',
    './ico/icon_x72.png',
    './ico/icon_x96.png',
    './ico/icon_x128.png',
    './ico/icon_x192.png',
    './ico/icon_x384.png',
    './ico/icon_x512.png',
    './ico/icon_x1024.png',
    './img/logo.svg',
    './img/logo-18.svg',
    './img/inkblot.svg',
    './img/logo-18.svg'
];

const FONT_ORIGINS = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];

function isOwnCache(cacheName) {
    return cacheName.startsWith(APP_CACHE_PREFIX) || LEGACY_APP_CACHES.includes(cacheName);
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>
            Promise.all(
                URLS_TO_CACHE.map((url) =>
                    cache.add(new Request(url, { cache: 'reload' })).catch((error) => {
                        console.warn(`Не удалось кэшировать ресурс: ${url}`, error);
                    })
                )
            )
        )
    );
    self.skipWaiting();
});

async function fetchWithTimeout(request, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(request, { signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

async function handleNavigationRequest(request) {
    const cache = await caches.open(CACHE_NAME);
    try {
        const networkResponse = await fetchWithTimeout(request, 3500);
        if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone()).catch(() => {});
            cache.put('./index.html', networkResponse.clone()).catch(() => {});
        }
        return networkResponse;
    } catch (_) {
        const directMatch = await cache.match(request, { ignoreSearch: true });
        if (directMatch) return directMatch;
        const indexMatch = await cache.match('./index.html');
        if (indexMatch) return indexMatch;
        const rootMatch = await cache.match('./');
        if (rootMatch) return rootMatch;
        return Response.error();
    }
}

async function handleAssetRequest(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });

    const networkPromise = fetch(request)
        .then((response) => {
            if (response && (response.ok || response.type === 'opaque')) {
                cache.put(request, response.clone()).catch(() => {});
            }
            return response;
        })
        .catch(() => null);

    if (cached) {
        return cached;
    }

    const fresh = await networkPromise;
    return fresh || Response.error();
}

// Strictly scoped fetch handler:
// - Handles ONLY requests inside THIS app's GitHub Pages folder scope (+ Google Fonts)
// - Never reads from or writes to sibling GitHub Pages apps' caches
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const requestUrl = event.request.url;
    const urlObj = new URL(requestUrl);

    // Optional offline caching for Google Fonts only (stored strictly in our own CACHE_NAME)
    if (FONT_ORIGINS.includes(urlObj.origin)) {
        event.respondWith(handleAssetRequest(event.request));
        return;
    }

    // Strictly ignore sibling apps on the same GitHub Pages domain
    const scopeUrl = self.registration.scope;
    if (!requestUrl.startsWith(scopeUrl)) {
        return;
    }

    // Bypass cache for intentional reinstall cache-buster
    if (urlObj.searchParams.has('_reinstall')) {
        event.respondWith(fetch(event.request));
        return;
    }

    if (event.request.mode === 'navigate') {
        event.respondWith(handleNavigationRequest(event.request));
        return;
    }

    event.respondWith(handleAssetRequest(event.request));
});

// Only remove outdated caches owned by THIS app — never touch other GitHub Pages apps' caches!
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map((cacheName) => {
                    if (isOwnCache(cacheName) && cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                    return Promise.resolve();
                })
            )
        )
    );
    self.clients.claim();
});
