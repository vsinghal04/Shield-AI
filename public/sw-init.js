// This file is NOT used in production build.
// It is a minimal test to verify service worker registration works.
// Delete after confirming the main SW works.

self.addEventListener('message', (event) => {
  event.source.postMessage({ type: 'PONG', received: event.data });
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => clients.claim());
