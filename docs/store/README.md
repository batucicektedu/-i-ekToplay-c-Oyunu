# Mağaza yayın rehberi (Çiçek Bahçesi)

Oyun statik bir PWA'dır (3 bölüm: kök, `sahil/`, `ciftlik/`). Tüm bağımlılıklar `vendor/` altındadır; internet olmadan çalışır
(service worker `sw.js`, önbellek `cicek-v5`). Önce siteyi HTTPS ile bir yere yayınlayın (örn. GitHub Pages: `https://KULLANICI.github.io/REPO/`).
Kontrol: `node tests/offline.js` (ağ kapalıyken 3 bölüm de açılmalı).

Ön koşullar: manifest (`manifest.webmanifest`) geçerli, 192/512/maskable ikonlar `icons/` altında, gizlilik sayfası `privacy.html`
(yayın URL'si: `https://.../privacy.html`; mağaza formlarına bu adresi girin).

## Yönetici paneli notu (ekran görüntüleri)
Gizli yönetici paneli oyunda duruyor ama **PIN arkasında gizli**dir; normal oyuncuya hiçbir düğme/ipucu göstermez. Mağaza
ekran görüntüleri panel açılmadan alındı (`tests/store_shots.js`); panel hiçbir görüntüde görünmemelidir. Yayın öncesi PIN'i
değiştirmek isterseniz `index.html` içindeki `ADMIN` bloğundaki `PIN` sabitine bakın.

## A) Google Play: TWA (Bubblewrap)
1. Gereksinimler: Node 18+, JDK 17, Android SDK (Bubblewrap ilk çalıştırmada indirmeyi önerir).
2. `npm i -g @bubblewrap/cli`
3. Boş klasörde: `bubblewrap init --manifest=https://ALANADI/yol/manifest.webmanifest`
   - Package ID: örn. `com.sizinadiniz.cicekbahcesi`; başlangıç URL'si `/yol/`; ikonlar manifestten gelir.
   - Anahtar deposu (keystore) oluşturulur: **yedekleyin**, kaybederseniz güncelleme yayınlayamazsınız.
4. `bubblewrap build` → `app-release-bundle.aab` (Play'e yüklenen) ve `app-release-signed.apk` (cihazda deneme) üretilir.
5. Digital Asset Links: `https://ALANADI/.well-known/assetlinks.json` yayınlayın (alan adı köküne; GitHub Pages alt yolunda
   çalışmaz, özel alan adı veya kök sitede yayınlayın). Parmak izini `bubblewrap fingerprint` veya Play Console >
   Uygulama bütünlüğü > Uygulama imzalama bölümünden alın (Play App Signing kullanıyorsanız **Play'in** SHA-256'sı):
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.sizinadiniz.cicekbahcesi",
    "sha256_cert_fingerprints": ["AA:BB:CC:...:FF"]
  }
}]
```
6. Play Console: yeni uygulama > .aab yükle > mağaza girişi (aşağıda) > İçerik derecelendirme > Veri güvenliği
   ("Veri toplanmıyor / paylaşılmıyor") > Gizlilik politikası URL'si > Hedef kitle (13+ veya tüm yaşlar) > yayın (önce iç test).
7. Doğrulama: `adb install app-release-signed.apk`; adres çubuğu görünüyorsa assetlinks yanlıştır.

## B) App Store: Capacitor
Gereksinim: macOS + Xcode + Apple Developer hesabı. Not: Apple, sadece web sitesini saran uygulamaları reddedebilir; oyun
yerel paketlendiği (çevrimdışı, 3D, uygulama içi içerik) için uygundur.
1. Bu repo kökünde: `npm init -y && npm i @capacitor/core @capacitor/cli @capacitor/ios`
2. `npx cap init "Çiçek Bahçesi" com.sizinadiniz.cicekbahcesi --web-dir=www`
3. Web dosyalarını `www/` altına kopyalayın (`index.html sahil ciftlik vendor icons safety.js privacy.html manifest.webmanifest sw.js`;
   `tests/`, `docs/`, `klasik/` hariç). Örn: `mkdir www && cp -r index.html sahil ciftlik vendor icons safety.js privacy.html manifest.webmanifest sw.js www/`
4. `npx cap add ios && npx cap sync ios && npx cap open ios`
5. Xcode: Signing & Capabilities > Team; Deployment Info > Portrait yalnızca; ikon: 1024x1024 (`icons/icon-512.png` büyütülerek, alfa kanalsız);
   Info.plist'e ek izin gerekmez. Launch screen arka planını `#8fd8ff` yapın.
6. `capacitor://localhost` / `https://localhost` altında service worker çalışır; yine de dosyalar pakette olduğu için çevrimdışıdır.
7. Product > Archive > App Store Connect'e yükle; mağaza girişi, gizlilik ("Veri toplanmıyor") ve yaş derecesini doldurun.
8. Aynı `www/` içeriğiyle `@capacitor/android` da kullanılabilir (TWA yerine).

## Mağaza metinleri
**Başlık (TR, ≤30):** Çiçek Bahçesi: Boş Zaman Oyunu  
**Title (EN, ≤30):** Flower Garden: Idle Tycoon

**Kısa açıklama (TR, ≤80):** Çiçek topla, buket yap, sat. Bahçeni, sahilini ve çiftliğini büyüt!  
**Short description (EN, ≤80):** Pick flowers, make bouquets, sell. Grow your garden, beach and farm!

**Uzun açıklama (TR):**
Çiçek Bahçesi, sakin ve renkli bir 3D "boş zaman" (idle) oyunudur. Parmağınla kaydır, çiçekleri topla, buketlere dönüştür ve müşterilere sat.
Kazandığın parayla yeni tarlalar, seralar ve dükkanlar aç; yardımcılar tut, taşıyıcıları hızlandır.

- 3 bölüm: Çiçek Bahçesi, Sahil Balıkçısı, Hayvan Çiftliği; her bölümün kendi ekonomisi ve hikayesi var
- Tek parmakla kolay kontrol, kısa oturumlarda bile ilerleme
- Gardırop ve kozmetikler, görevler, koleksiyon
- İnternetsiz oynanır, reklam yok, uygulama içi satın alma yok
- Verilerin yalnızca cihazında kalır; hiçbir veri toplanmaz

**Long description (EN):**
Flower Garden is a calm, colorful 3D idle game. Swipe to move, pick flowers, turn them into bouquets and sell them to customers.
Spend your earnings on new fields, greenhouses and shops, hire helpers and speed up your carriers.

- 3 chapters: Flower Garden, Seaside Fisherman, Animal Farm, each with its own economy and story
- Easy one-finger controls, progress even in short sessions
- Wardrobe and cosmetics, quests, collection
- Plays fully offline, no ads, no in-app purchases
- Your data stays on your device; nothing is collected

## Yaş derecesi önerisi
- Google Play (IARC): şiddet yok, cinsellik yok, kumar yok, küfür yok, kullanıcı etkileşimi/konum paylaşımı yok, satın alma yok → **Herkes / 3+** (PEGI 3).
- App Store: tüm sorulara "Hiçbiri" → **4+**.
- Çocuklara yönelik değilse bile "Aile" politikalarıyla uyumludur (reklam/izleme yok).

## Ekran görüntüleri (1080x1920, portre)
`node tests/store_shots.js` ile üretilir (kayıt örnekleri `tests/saves/` ve `tests/*/saves/`; yönetici paneli yok).
1. `shot_1_bahce.png`: Çiçek Bahçesi, orta oyun
2. `shot_2_bahce_buyuk.png`: Çiçek Bahçesi, geç oyun
3. `shot_3_sahil.png`: Sahil Balıkçısı
4. `shot_4_sahil_liman.png`: Sahil, ileri aşama
5. `shot_5_ciftlik.png`: Hayvan Çiftliği
Play ayrıca 512x512 ikon (`icons/icon-512.png`) ve 1024x500 öne çıkan görsel ister (ekran görüntülerinden hazırlayın).

## Yayın öncesi kontrol listesi
- [ ] `node tests/offline.js`, saves testleri (`tests/saves/check.js`, `tests/sahil/saves.js`, `tests/ciftlik/saves.js`) geçti
- [ ] `privacy.html` herkese açık URL'de
- [ ] assetlinks.json doğru parmak izi ile yayında
- [ ] Gerçek cihazda uçak modunda üç bölüm de açılıyor
