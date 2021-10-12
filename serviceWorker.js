const staticDevCoffee = "dev-coffee-site-v1";
const assets = [
  "/",
  "/index.html",
  "/base.css",
  "/daycon.css",
  "/login.css",
  "/settings.css",
  "/topbar.css",
  "/app.js",
  "/event.js",
  "/login.js",
  "/pages.js",
  "/images/logo.png",
];

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticDevCoffee).then(cache => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request);
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.waitUntil(self.clients.matchAll().then(clients => {
    if (event.notification.data.link != null && event.notification.data.link != ''){
      self.clients.openWindow(event.notification.data.link);
    }
    if (clients.length) { // check if at least one tab is already open
      clients[0].focus();
      clients[0].postMessage('Window refocused');
    }
  }));
});

// listen to the notification close
self.addEventListener('notificationclose', event => {
  event.waitUntil(self.clients.matchAll().then(clients => {
    if (clients.length) { // check if at least one tab is already open
      clients[0].postMessage('Push notification clicked!');
    }
  }));
});
