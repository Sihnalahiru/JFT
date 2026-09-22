const CACHE_NAME = "irodori-master-v4";


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



/* =========================================
   INSTALL
   ========================================= */

self.addEventListener(
  "install",
  (event) => {

    event.waitUntil(

      caches
        .open(CACHE_NAME)
        .then(
          (cache) => {

            return cache.addAll(
              APP_SHELL
            );

          }
        )

    );


    self.skipWaiting();

  }
);



/* =========================================
   ACTIVATE
   ========================================= */

self.addEventListener(
  "activate",
  (event) => {

    event.waitUntil(

      caches
        .keys()
        .then(
          (cacheNames) => {

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

          }
        )

    );


    self.clients.claim();

  }
);



/* =========================================
   FETCH
   ========================================= */

self.addEventListener(
  "fetch",
  (event) => {

    event.respondWith(

      caches
        .match(event.request)
        .then(
          (cachedResponse) => {

            if (cachedResponse) {

              return cachedResponse;

            }


            return fetch(
              event.request
            )

              .then(
                (networkResponse) => {

                  if (

                    !networkResponse ||

                    networkResponse.status !==
                      200 ||

                    networkResponse.type ===
                      "opaque"

                  ) {

                    return networkResponse;

                  }


                  const responseClone =
                    networkResponse.clone();


                  caches
                    .open(CACHE_NAME)
                    .then(
                      (cache) => {

                        cache.put(
                          event.request,
                          responseClone
                        );

                      }
                    );


                  return networkResponse;

                }
              );

          }
        )

    );

  }
);
