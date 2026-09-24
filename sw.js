const CACHE_NAME =
  "irodori-master-v7";


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


  /* ACTIVITY DATA */

  "./data/activities.json",

  "./data/activities-e1.json",

  "./data/activities-e2.json",

  "./data/activities-pi.json",


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
        .then(
          (cache) =>
            cache.addAll(APP_SHELL)
        )

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
        .then(
          (cacheNames) =>
            Promise.all(
              cacheNames
                .filter(
                  (name) =>
                    name !== CACHE_NAME
                )
                .map(
                  (name) =>
                    caches.delete(name)
                )
            )
        )
        .then(
          () =>
            self.clients.claim()
        )

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


    if (
      request.method !== "GET"
    ) {

      return;

    }


    const url =
      new URL(request.url);


    if (
      url.origin !==
      self.location.origin
    ) {

      return;

    }


    const pathname =
      url.pathname;


    /*
     * Application resources use NETWORK-FIRST.
     * This keeps GitHub deployments updateable while
     * retaining an offline fallback.
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
                    (cache) =>
                      cache.put(
                        request,
                        responseClone
                      )
                  )
                  .catch(
                    (error) =>
                      console.warn(
                        "Unable to update cache:",
                        error
                      )
                  );

              }

              return networkResponse;

            }
          )
          .catch(
            () =>
              caches.match(request)
          )

      );

      return;

    }


    /*
     * Other same-origin resources use CACHE-FIRST.
     * Official IRODORI MP3 files are external-origin and
     * therefore are intentionally not handled here.
     */

    event.respondWith(

      caches
        .match(request)
        .then(
          (cachedResponse) => {

            if (cachedResponse) {

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
                        (cache) =>
                          cache.put(
                            request,
                            responseClone
                          )
                      )
                      .catch(
                        (error) =>
                          console.warn(
                            "Unable to cache resource:",
                            error
                          )
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
