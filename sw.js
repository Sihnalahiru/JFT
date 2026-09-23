const CACHE_NAME = "irodori-master-v5";

const APP_SHELL = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./js/progress.js",
  "./manifest.json",
  "./data/books.json",
  "./data/lessons.json",
  "./data/canDos-starter.json",
  "./data/canDos-e1.json",
  "./data/canDos-e2.json",
  "./data/canDos-pi.json"
];

/* =========================================================
   INSTALL
========================================================= */

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );

  self.skipWaiting();
});

/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

/* =========================================================
   FETCH
========================================================= */

self.addEventListener("fetch", (event) => {
  const request = event.request;

  /*
   * Only handle GET requests.
   */
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  /*
   * Only cache same-origin application resources.
   * External websites/resources are left alone.
   */
  if (url.origin !== self.location.origin) {
    return;
  }

  /*
   * HTML, JavaScript, CSS and JSON use
   * NETWORK-FIRST behavior.
   *
   * This prevents stale GitHub Pages code/data
   * from surviving after a new deployment.
   */
  const pathname = url.pathname;

  const isAppResource =
    pathname.endsWith(".html") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".json") ||
    pathname.endsWith(".webmanifest") ||
    pathname.endsWith(".json");

  if (isAppResource) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200
          ) {
            const responseClone =
              networkResponse.clone();

            caches
              .open(CACHE_NAME)
              .then((cache) => {
                cache.put(
                  request,
                  responseClone
                );
              })
              .catch((error) => {
                console.warn(
                  "Unable to update cache:",
                  error
                );
              });
          }

          return networkResponse;
        })
        .catch(() => {
          return caches.match(request);
        })
    );

    return;
  }

  /*
   * Other same-origin resources:
   * cache-first with network fallback.
   */
  event.respondWith(
    caches
      .match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            if (
              networkResponse &&
              networkResponse.status === 200
            ) {
              const responseClone =
                networkResponse.clone();

              caches
                .open(CACHE_NAME)
                .then((cache) => {
                  cache.put(
                    request,
                    responseClone
                  );
                })
                .catch((error) => {
                  console.warn(
                    "Unable to cache resource:",
                    error
                  );
                });
            }

            return networkResponse;
          });
      })
  );
});
