if (!self.define) {
  let e, s = {};
  const a = (a, n) => (a = new URL(a + ".js", n).href, s[a] || new Promise((s => {
    if ("document" in self) {
      const e = document.createElement("script");
      e.src = a, e.onload = s, document.head.appendChild(e)
    } else e = a, importScripts(a), s()
  })).then((() => {
    let e = s[a];
    if (!e) throw new Error(`Module ${a} didn’t register its module`);
    return e
  })));
  self.define = (n, c) => {
    const t = e || ("document" in self ? document.currentScript.src : "") || location.href;
    if (s[t]) return;
    let i = {};
    const r = e => a(e, t),
      o = {
        module: {
          uri: t
        },
        exports: i,
        require: r
      };
    s[t] = Promise.all(n.map((e => o[e] || r(e)))).then((e => (c(...e), i)))
  }
}
define(["./workbox-f1770938"], (function (e) {
  "use strict";
  importScripts();
  self.skipWaiting();
  e.clientsClaim();
  e.precacheAndRoute([{
      url: "/_next/static/app2OzROajImF1ro7xFcW/_buildManifest.js",
      revision: "4e34caed4f3f22f28745892ec2c28fff"
    },
    {
      url: "/_next/static/app2OzROajImF1ro7xFcW/_ssgManifest.js",
      revision: "b6652df95db52feb4daf4eca35380933"
    },
    // ... pozostałe pliki do pre-cache
  ], {
    ignoreURLParametersMatching: [/^utm_/, /^fbclid$/]
  });
  e.cleanupOutdatedCaches();

  e.registerRoute("/", new e.NetworkFirst({
    cacheName: "start-url",
    plugins: [{
      cacheWillUpdate: async ({ response }) => {
        return response && response.status === 200 ? response : null;
      }
    }]
  }), "GET");

  e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i, new e.CacheFirst({
    cacheName: "google-fonts-webfonts",
    plugins: [new e.ExpirationPlugin({
      maxEntries: 4,
      maxAgeSeconds: 31536e3
    })]
  }), "GET");

  e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i, new e.StaleWhileRevalidate({
    cacheName: "google-fonts-stylesheets",
    plugins: [new e.ExpirationPlugin({
      maxEntries: 4,
      maxAgeSeconds: 604800
    })]
  }), "GET");

  e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i, new e.StaleWhileRevalidate({
    cacheName: "static-font-assets",
    plugins: [new e.ExpirationPlugin({
      maxEntries: 4,
      maxAgeSeconds: 604800
    })]
  }), "GET");

  e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i, new e.StaleWhileRevalidate({
    cacheName: "static-image-assets",
    plugins: [new e.ExpirationPlugin({
      maxEntries: 64,
      maxAgeSeconds: 2592e3
    })]
  }), "GET");

  e.registerRoute(/\/_next\/static.+\.js$/i, new e.CacheFirst({
    cacheName: "next-static-js-assets",
    plugins: [new e.ExpirationPlugin({
      maxEntries: 64,
      maxAgeSeconds: 86400
    })]
  }), "GET");

  e.registerRoute(/\/_next\/image\?url=.+$/i, new e.StaleWhileRevalidate({
    cacheName: "next-image",
    plugins: [new e.ExpirationPlugin({
      maxEntries: 64,
      maxAgeSeconds: 86400
    })]
  }), "GET");

  e.registerRoute(/\.(?:mp3|wav|ogg)$/i, new e.CacheFirst({
    cacheName: "static-audio-assets",
    plugins: [new e.RangeRequestsPlugin, new e.ExpirationPlugin({
      maxEntries: 32,
      maxAgeSeconds: 86400
    })]
  }), "GET");

  e.registerRoute(/\.(?:mp4|webm)$/i, new e.CacheFirst({
    cacheName: "static-video-assets",
    plugins: [new e.RangeRequestsPlugin, new e.ExpirationPlugin({
      maxEntries: 32,
      maxAgeSeconds: 86400
    })]
  }), "GET");

  e.registerRoute(/\.(?:js)$/i, new e.StaleWhileRevalidate({
    cacheName: "static-js-assets",
    plugins: [new e.ExpirationPlugin({
      maxEntries: 48,
      maxAgeSeconds: 86400
    })]
  }), "GET");

  e.registerRoute(/\.(?:css|less)$/i, new e.StaleWhileRevalidate({
    cacheName: "static-style-assets",
    plugins: [new e.ExpirationPlugin({
      maxEntries: 32,
      maxAgeSeconds: 86400
    })]
  }), "GET");

  e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i, new e.StaleWhileRevalidate({
    cacheName: "next-data",
    plugins: [new e.ExpirationPlugin({
      maxEntries: 32,
      maxAgeSeconds: 86400
    })]
  }), "GET");

  e.registerRoute(/\.(?:json|xml|csv)$/i, new e.NetworkFirst({
    cacheName: "static-data-assets",
    plugins: [new e.ExpirationPlugin({
      maxEntries: 32,
      maxAgeSeconds: 86400
    })]
  }), "GET");

  e.registerRoute((function (e) {
    var s = e.sameOrigin,
      a = e.url.pathname;
    return !(!s || a.startsWith("/api/auth/callback") || !a.startsWith("/api/"))
  }), new e.NetworkFirst({
    cacheName: "apis",
    networkTimeoutSeconds: 10,
    plugins: [new e.ExpirationPlugin({
      maxEntries: 16,
      maxAgeSeconds: 86400
    })]
  }), "GET");

  e.registerRoute((function (e) {
    var s = e.request,
      a = e.url.pathname,
      n = e.sameOrigin;
    return "1" === s.headers.get("RSC") && "1" === s.headers.get("Next-Router-Prefetch") && n && !a.startsWith("/api/")
  }), new e.NetworkFirst({
    cacheName: "pages-rsc-prefetch",
    plugins: [new e.ExpirationPlugin({
      maxEntries: 32,
      maxAgeSeconds: 86400
    })]
  }), "GET");

  e.registerRoute((function (e) {
    var s = e.request,
      a = e.url.pathname,
      n = e.sameOrigin;
    return "1" === s.headers.get("RSC") && n && !a.startsWith("/api/")
  }), new e.NetworkFirst({
    cacheName: "pages-rsc",
    plugins: [new e.ExpirationPlugin({
      maxEntries: 32,
      maxAgeSeconds: 86400
    })]
  }), "GET");

  e.registerRoute((function (e) {
    var s = e.url.pathname;
    return e.sameOrigin && !s.startsWith("/api/")
  }), new e.NetworkFirst({
    cacheName: "pages",
    plugins: [new e.ExpirationPlugin({
      maxEntries: 32,
      maxAgeSeconds: 86400
    })]
  }), "GET");

  e.registerRoute((function (e) {
    return !e.sameOrigin
  }), new e.NetworkFirst({
    cacheName: "cross-origin",
    networkTimeoutSeconds: 10,
    plugins: [new e.ExpirationPlugin({
      maxEntries: 32,
      maxAgeSeconds: 3600
    })]
  }), "GET");

  self.__WB_DISABLE_DEV_LOGS = !0;
}));
