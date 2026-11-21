# Çiçek Bahçesi – Claude Code çalışma rehberi

Tek dosyalık Three.js (r128, cdnjs) mobil "idle arcade" oyunu: `index.html`. Tasarım: `DESIGN.md`.

## Çalışma şekli
- Ana oturum mimar gibi çalışır: planlar, işi Sonnet alt ajanlara yazdırır, sonucu ekran görüntüleriyle kontrol eder.
- Her adımdan sonra commit + push (`claude/...` geliştirme dalı).
- Alt ajan brief'lerinde `docs/studio/` altındaki rolleri ve kontrol listelerini kullan.

## docs/studio (Claude Code Game Studios'tan alındı, MIT – `LICENSE-ccgs.txt`, kaynak commit abc0de7)
Sadece referans metinler; hook/script/settings alınmadı.
- `agents/` – rol tanımları. Alt ajana brief verirken ilgili dosyayı okumasını söyle:
  - Ekonomi/denge: `economy-designer.md`, `systems-designer.md`
  - Döngü/mekanik: `game-designer.md`; bölge yerleşimi: `level-designer.md`
  - Görsel: `art-director.md`, `technical-artist.md`; arayüz/FTUE: `ux-designer.md`
  - Test: `qa-tester.md`; performans: `performance-analyst.md`
- `genres/` – tür kontrol listeleri: `idle-incremental.md`, `management-tycoon.md`, `farming-life-sim.md`, `factory-automation.md`, `mashups.md`, `art-direction.md`.
- `checklists/` – iş akışları: `balance-check.md`, `playtest-report.md`, `team-polish.md`, `ux-review.md`, `perf-profile.md`.

Not: Bu dosyalar çerçevenin kendi klasör yapısına (production/, design/gdd/, project.yaml) atıf yapabilir; o kısımları yok say, içerikteki tasarım ilkelerini ve kontrol maddelerini uygula.

## Kayıt uyumluluğu (ZORUNLU)
Oyuncunun ilerlemesi hiçbir güncellemede kaybolmamalı.
- localStorage anahtarını değiştirme; kayıt formatına sadece alan **ekle**, var olanı silme/yeniden adlandırma. Gerekirse sürüm numarası (`ver`) ve göç (migration) fonksiyonu yaz.
- Yüklemede eksik alanlar varsayılanla doldurulur, bozuk/NaN değerler düzeltilir, seviyeler yeni maksimuma kırpılır ama **para ve açılmış bölgeler asla azaltılmaz/kilitlenmez**.
- Fiyat/denge değişse bile oyuncunun sahip olduğu her şey korunur.
- Yüklemede geçici durumlar (işçi hedefleri, rezervasyonlar) temizlenir.
- Her değişiklikten sonra `tests/saves/` altındaki tüm örnek kayıtlar yeni sürümde yüklenip kontrol edilir (para, seviyeler, açılmış bölgeler aynı; konsol hatası yok). Yeni kayıt alanı eklendiğinde o sürümden yeni bir örnek kayıt eklenir.
- Yazma: kayıt önce geçici anahtara, doğrulanınca asıl anahtara yazılır; okuma başarısızsa eski kayıt silinmez (yedek anahtar).

## Test
Playwright + chromium hazır. cdnjs bu ortamda kapalı: `npm i three@0.128.0` ile yerel kopyayı `page.route('**/three.min.js', ...)` ile ver. `window.__game` test kancaları (tp, sim, render, zoom) mevcut.
