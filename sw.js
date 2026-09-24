const CACHE_NAME = "irodori-master-v6";

const APP_SHELL = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/progress.js",
  "./js/app.js",
  "./manifest.json",

  /* MASTER DATA */

  "./data/master.json",
  "./data/books.json",
  "./data/lessons.json",

  /* CAN-DO DATA */

  "./data/canDos-starter.json",
  "./data/canDos-e1.json",
  "./data/canDos-e2.json",
  "./data/canDos-pi.json",

  /* AUDIO METADATA */

  "./data/audio-main.json",
  "./data/audio-wordlist.json",
  "./data/audio-grammar.json"
];


/* =========================================================
   INSTALL
========================================================= */

self.addEventListener(
  "install",
  (event) => {

    event.waitUntil(

      caches
        .open(CACHE_NAME)
        .then((cache) => {

          return cache.addAll(
            APP_SHELL
          );

        })

    );

    self.skipWaiting();

  }
);


/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener(
  "activate",
  (event) => {

    event.waitUntil(

      caches
        .keys()
        .then((cacheNames) => {

          return Promise.all(

            cacheNames
              .filter(
                (name) =>
                  name !== CACHE_NAME
              )
              .map(
                (name) =>
                  caches.delete(name)
              )

          );

        })
        .then(() => {

          return self.clients.claim();

        })

    );

  }
);


/* =========================================================
   FETCH
========================================================= */

self.addEventListener(
  "fetch",
  (event) => {

    const request =
      event.request;


    /*
     * Only handle GET requests.
     */

    if (
      request.method !== "GET"
    ) {

      return;

    }


    const url =
      new URL(
        request.url
      );


    /*
     * Only handle same-origin
     * application resources.
     */

    if (
      url.origin !==
      self.location.origin
    ) {

      return;

    }


    const pathname =
      url.pathname;


    /*
     * HTML, JavaScript, CSS,
     * JSON and Web Manifest use
     * NETWORK-FIRST behavior.
     *
     * This allows newly deployed
     * GitHub Pages files to update
     * while retaining offline fallback.
     */

    const isAppResource =
      pathname.endsWith(".html") ||
      pathname.endsWith(".js") ||
      pathname.endsWith(".css") ||
      pathname.endsWith(".json") ||
      pathname.endsWith(".webmanifest");


    if (isAppResource) {

      event.respondWith(

        fetch(request)

          .then(
            (networkResponse) => {

              if (
                networkResponse &&
                networkResponse.status === 200
              ) {

                const responseClone =
                  networkResponse.clone();


                caches
                  .open(CACHE_NAME)
                  .then(
                    (cache) => {

                      return cache.put(
                        request,
                        responseClone
                      );

                    }
                  )
                  .catch(
                    (error) => {

                      console.warn(
                        "Unable to update cache:",
                        error
                      );

                    }
                  );

              }


              return networkResponse;

            }
          )

          .catch(
            () => {

              return caches.match(
                request
              );

            }
          )

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

        .then(
          (cachedResponse) => {

            if (
              cachedResponse
            ) {

              return cachedResponse;

            }


            return fetch(request)

              .then(
                (networkResponse) => {

                  if (
                    networkResponse &&
                    networkResponse.status === 200
                  ) {

                    const responseClone =
                      networkResponse.clone();


                    caches
                      .open(CACHE_NAME)
                      .then(
                        (cache) => {

                          return cache.put(
                            request,
                            responseClone
                          );

                        }
                      )
                      .catch(
                        (error) => {

                          console.warn(
                            "Unable to cache resource:",
                            error
                          );

                        }
                      );

                  }


                  return networkResponse;

                }
              );

          }
        )

    );

  }
);
