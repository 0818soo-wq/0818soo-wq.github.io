// 오프라인 대비 캐시 (2027 BALI 전용 — 이 페이지에만 적용되도록 좁은 scope로 등록됨)
// 섬·보트 이동 중에는 인터넷이 끊기거나 느릴 수 있습니다.
// 온라인이면 항상 최신을 받아오고, 통신이 끊겼을 때만 캐시된 일정을 보여줍니다.
var CACHE = 'bali2027-v1';

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(['./2027bali.html']); })
      .then(function () { return self.skipWaiting(); })
      .catch(function () {})
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (k) {
          if (k !== CACHE) return caches.delete(k);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }

  // 지도 링크는 캐시해도 의미가 없으므로 그대로 통과
  if (/google\.com|tile\.openstreetmap\.org/.test(url.hostname)) return;

  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.status === 200 && res.type === 'basic') {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (r) {
        return r || caches.match('./2027bali.html');
      });
    })
  );
});
