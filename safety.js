/* Ortak güvenlik katmanı (tüm bölümler): hata yakalama, WebGL denetimi, sekme gizlenince döngü/ses duraklatma.
   Oyundan ÖNCE yüklenir; oyun mantığına dokunmaz. */
(function () {
  'use strict';
  var shown = false;
  function fatal(title, text, retry) {
    if (shown) return; shown = true;
    function build() {
      var d = document.createElement('div'); d.id = 'fatalBox';
      d.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;text-align:center;background:#8fd8ff;color:#16324a;font:700 18px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
      var h = document.createElement('div'); h.style.cssText = 'font:900 24px/1.2 inherit;font-family:inherit'; h.textContent = title;
      var p = document.createElement('div'); p.style.maxWidth = '320px'; p.textContent = text;
      d.appendChild(h); d.appendChild(p);
      if (retry !== false) {
        var b = document.createElement('button'); b.textContent = 'Yeniden dene';
        b.style.cssText = 'font:900 18px/1 inherit;font-family:inherit;border:0;border-radius:14px;padding:14px 26px;color:#fff;background:linear-gradient(#4aa8ff,#2f7bff);box-shadow:0 4px 0 #1d4fb0';
        b.onclick = function () { location.reload(); }; d.appendChild(b);
      }
      (document.body || document.documentElement).appendChild(d);
    }
    if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
  }
  window.__fatal = fatal;

  // 1) Hatalar: yalnızca günlük, oyun çökmez.
  window.addEventListener('error', function (e) {
    var t = e && e.target;
    if (t && t !== window && t.tagName === 'SCRIPT') { console.warn('[yükleme]', t.src); return; }
    console.warn('[hata]', e && e.message);
  }, true);
  window.addEventListener('unhandledrejection', function (e) { console.warn('[söz reddi]', e && e.reason); e.preventDefault(); });

  // 2) WebGL var mı?
  var gl = null;
  try { var c = document.createElement('canvas'); gl = c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl'); } catch (e) {}
  window.__noWebGL = !gl;
  if (!gl) fatal('Cihazın 3D desteklemiyor', 'Bu oyun WebGL gerektiriyor. Tarayıcını/sistem WebView bileşenini güncelleyip tekrar dene.');
  else { try { var x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); } catch (e) {} }

  // 3) Dosyalar yüklenemedi (three.js yok)
  window.addEventListener('load', function () {
    if (typeof THREE === 'undefined') fatal('Oyun yüklenemedi', 'Dosyalar okunamadı. Bağlantını kontrol edip tekrar dene.');
  });

  // 4) Sekme gizlenince: animasyon döngüsünü ve sesi duraklat; dönünce devam. Kayıt yazımına dokunmaz.
  var raf = window.requestAnimationFrame.bind(window), queue = [], ctxs = [];
  window.requestAnimationFrame = function (cb) {
    if (document.hidden) { queue.push(cb); return 0; }
    return raf(cb);
  };
  ['AudioContext', 'webkitAudioContext'].forEach(function (n) {
    var A = window[n]; if (!A) return;
    function W(o) { var a = new A(o); ctxs.push(a); return a; }
    W.prototype = A.prototype; try { Object.setPrototypeOf(W, A); } catch (e) {}
    window[n] = W;
  });
  document.addEventListener('visibilitychange', function () {
    var hid = document.hidden;
    ctxs.forEach(function (a) { try { if (hid) { if (a.state === 'running') { a.__wasRun = true; a.suspend(); } } else if (a.__wasRun) { a.__wasRun = false; a.resume(); } } catch (e) {} });
    if (!hid && queue.length) { var q = queue; queue = []; raf(function (t) { q.forEach(function (f) { try { f(t); } catch (e) { console.warn(e); } }); }); }
  });
})();
