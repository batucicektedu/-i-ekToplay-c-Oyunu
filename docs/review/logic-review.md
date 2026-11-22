# Mantık / Akış İncelemesi (3 bölüm)

Yöntem: Playwright + `window.__game` kancaları; erken/orta/geç kayıtlar (`tests/saves`, `tests/sahil/saves`, `tests/ciftlik/ranch.json`, `tests/max.json`) ve tüm yükseltmeleri açılmış sentetik kayıt. Konum örneklemesi: her 1 sn'de teknelerin, işçilerin, müşterilerin, otobüs/minibüsün (x,z) değeri kara/su haritasıyla (`tests/sahil/shore.js` `water()` fonksiyonu) karşılaştırıldı. Ekran görüntüleri 390x844, `docs/review/*.jpg`.
Not: inceleme sırasında çalışma ağacında başkaları `sahil/` ve `ciftlik/` dosyalarını düzenliyordu (rıhtım yığını `DOCK` + el arabalı hamal, ata çiftliği, koyun çayırı hedefi). Bulgular o anki ağaç içindir; satır numaraları kayabilir (fonksiyon adı esas).

Doğrulanan DOĞRU davranışlar (sorun yok): Sahil teknelerinin 300 örnekte tamamı suda, iskele kutusuna girmedi; müşteri/otobüs/hamal 0 kez suda; Bölüm 1'de 60 sn x (240 işçi + 376 müşteri örneği) kara dışına/denize çıkma 0; konsol hatası yok (yalnızca `navigator.vibrate` uyarısı).

---

## Bölüm 2 – Sahil Balıkçısı (`sahil/index.html`)

### P1 (mutlaka)
1. **Teslimat minibüsü denize sürüyor.** `updateVan` (satır ~2012 ve ~2017): `VAN.path = [[10,24],[10,70]]`, dönüşte `VAN.z = 70`. Sahilde `z > 44.2` deniz; araç ~z 44-70 arasında suyun üstünde görünür (tekne sorununun aynısı, araç versiyonu). Neden: yol Bölüm 1'den kopyalandı. Çözüm: yolu kıyıya paralel (örn. `[[10,24],[44,24],[44,6]]`, x>10 karasında kalan) çevir ya da `VAN.group.visible=false` yapılacak mesafeyi `z>=40` yap; dönüşte aynı noktadan gir. Görüntü: `docs/review/sahil_v2_van_away.jpg` (yol suya akıyor).
2. **Minibüs istek türü etiketleri araçla uyuşmuyor ("Bisiklet 0/3" yazan küçültülmüş kamyon).** `VKINDS` (satır 1886) ve HUD `otext(... rq.k.n ...)` (~1959). Tek model `sc` ile ölçekleniyor (0.45/0.75/1.0/1.3) ama adlar Bisiklet/Araba/Kamyonet/Kamyon. Çözüm: adları ölçekli kamyona uyar: `Küçük Sipariş / Orta Sipariş / Büyük Sipariş / Toptan Sipariş` (veya Sepet/Kasa/Palet/Konteyner) ve ikonu balık kasası yap. Aynısı Bölüm 3'te de var (aşağıda).
3. **"Yardımcı" (main rol) denizde yürüyerek balık topluyor.** `POS.beds` (satır 201: `{-15.8,-3.8},{-15.8,3.8},{-24,-3.8}`) iskele (|z|<1.7) dışında, yani deniz; `gFlower`/`updateGardener` işçiyi hedefin üstüne yürütür. Örneklemede 100 sn'de 8 kez `(-19.3,3.5)`, `(-25.2,-2.3)`, `(-14.5,-3.7)` konumunda suda. Çözüm: `updateGardener`'da `h.role.id==='main'` için duruş noktası = hedefin iskeleye izdüşümü (`z` yi ±1.2'ye kıs, `x` aynı), olta animasyonu; ya da balık noktalarını (kare/ızgara) iskelenin sağ-sol kenarına (|z|≈1.2) taşı ve su halkasını `z=±3.8`'de bırak (oyuncu zaten iskeleden tutuyor).
4. **(HEAD'de) tekne balığı doğrudan tezgâha uçuruyordu – taşıyıcı yok.** Eski `updateBoats`: `fly(it, … inputPile …)` ile 15+ birim öteye ışınlanma. Çalışma ağacında `DOCK` yığını + "El Arabalı Hamal" (`updateHamal`) eklenmiş; bunu koru ve şunları doğrula: (a) tekne `moored` iken yük `DOCK`a iniyor, (b) oyuncu da `DOCK.zone`dan alabiliyor, (c) hamal `inputPile` dolu iken bekliyor (watchdog var). Görüntü: `sahil_m_quay2.jpg` (3 tekne rıhtımda, yığın "MAX"). Örneklemede hamal olmadan `DOCK.n=24` doluyor, tekneler 11/16/21 balıkla sonsuza kadar `moored` kalıyor: geçerli geri basınç, ama bkz. P2-1 (oyuncuya ipucu yok).

### P2
1. **Rıhtım tıkanınca yönlendirme yok.** `objective()` (satır ~2757) `DOCK` dolu ve hamal yokken oyuncuya "Rıhtımdan balık al" hedefi vermiyor; hamal pad'i (`hamal`, 2800) `vis=boat>0` ile hemen çıkıyor ama hedef çubuğunda yok. Çözüm: `DOCK.stack.length>=12 && !S.lv.hamal` → `objective` = DOCK zone, etiket `Rıhtımdan al` (LABELS'e ekle); ilk dolumda tek seferlik toast "Hamal tut: balıkları tezgâha o taşısın".
2. **Çiçek bahçesi artıkları (yazı).** `otext(ctx,'DÜĞÜN SİPARİŞİ')` (3491) → `OTEL SİPARİŞİ`; `tierSign('DÜĞÜN SALONU')` (3853) → `OTEL`; `praise('Yeni düğün siparişi!')` (3470) → `Yeni otel siparişi!`; tier pad alt yazıları `d.short`: `Çiçekçi/Saksı/Düğün/Şehir` (tdef, ~3745-3760) → `Pazar/Midye/Otel/Büfe`; dekor adları `Çiçek Kemeri/Çiçekli Çit/Çardak` (3915) → `Deniz Kemeri/Halatlı Çit/Şemsiye Çardağı`. Görüntü: `sahil_m_wed.jpg` (otel: kırmızı halı + balon kemeri düğün kalıntısı, tabela "OTEL SİPARİŞİ", pano "DÜĞÜN SİPARİŞİ").
3. **İnci Koyu'nda Japon bahçesi.** `buildJapan` (4438; `torii` 4324 çağrısı 4445): torii kapısı, kırmızı kemer köprü, koi göleti, pembe kiraz ağaçları kıyıda/kumda. Çözüm: torii'yi sil, köprüyü ahşap iskeleye, kirazları mercan/deniz kabuğu kümelerine çevir (renk ve geometri hazır). Görüntü: `sahil_m_jap.jpg`.
4. **Plazadaki koyu "çukur".** `carpet1/carpet2` (satır 2054-2056, `lc(0x1b5f7a)`) Bölüm 1 halısı; bu paletle `021d31`'e çıkıp kum plazada siyah-lacivert delik gibi görünüyor, ok izi üstüne biniyor. Çözüm: renk `0xc9a876` (ahşap iskele tahtası) ya da kaldır. Görüntü: `sahil_p_plaza_dark.jpg`, `sahil_s1_wide.jpg`.
5. **"Önceki Bölüm" kapısı plazanın ortasında** (`buildGate x:-6 z:13.4`) halının üstünde; kapı + karpet birlikte karmaşık. Kapıyı kıyıya (x:-30 batı ucu) ya da yola yakın tek başına bırak.

### P3
- Tuz Tavası yolu bal peteği altıgen deseni (Bölüm 1 arıcılığından): `sahil_m_bee.jpg`; tuz kristali/ahşap tahta deseni.

---

## Bölüm 3 – Hayvan Çiftliği (`ciftlik/index.html`)

### P1
1. **"Bisiklet 0/3" etiketi, küçültülmüş süt kamyonunda.** `VKINDS` (1934), `vanNewReq` (1938): ilk iki sefer `Bisiklet` (pool=[0]). Görüntü: `ciftlik_v3_van_parked.jpg`. Çözüm: `Küçük Sipariş/Orta/Büyük/Toptan` + yumurta kolisi ikonu; hud'daki başlık "Süt Kamyonu · Küçük Sipariş 0/3".
2. **Bölüm sonu yok.** `initChapters`: "son bölüm: sonraki kapı yok", ranch zinciri bittikten sonra hedef çubuğu boş/ödül yok; `initGatePad()` (4096-4107) hâlâ çağrılıyor, `unlockedZ('mus')` hiç doğru olmadığı için ölü pad (750000 "Hayvan Çiftliği" bile adı yanlış). Çözüm: ölü pad'i sil; ata/parkur/gösteri hedefleri bitince "Çiftlik Şenliği" tek seferlik finale (havai fişek + kart "Üç bahçe, bir aile… Oynamaya devam et") ve kaydı `S.seen.fin`e yaz (alan ekle, silme yok).

### P2
1. **Ekonomi boşluğu: Süt Kamyonu (2.5K) → At Çiftliği (20K).** Bot 360 sn'de: sera 1:30, kamyon 4:30, sonra 20K'ya kadar sadece küçük yükseltme (para 140 → 1705 / 90 sn ≈ 17$/sn): ~17 dk yeni bir şey görünmüyor. Çözüm: araya 6-8K'lık "Koyun Çayırı" (çalışma ağacında başlamış, çubukta görünüyor) ya da ranch fiyatını 9-12K'ya çek; yarım yol hedefi (`GOALS` sonuna) ekle. Kayıt: fiyat düşürmek oyuncunun sahip olduğunu bozmaz.
2. **Önceki Bölüm kemeri yumurta tarlasına/çite oturuyor** (`buildGate x:-6 z:13.4`): `ciftlik_f_t360.jpg`. Kemeri patika üstünde bir kare kuzeye/doğuya (x:-3) al.
3. Yumurta toplayıcı oyuncu 55/55 doluyken `objective` "harvest" hedefinde kalıyor (bot 30 sn satış yapmadı, `sold` 85→85). Doluyken hedef "sat/teslim et" olmalı: `objective` içinde `P.free()==0` → tezgâh/kasa.
4. Arka plan: Bölüm 2 kalıntı kodu (`iconTractor` tekne, `makeBoatModel`, `Tekne Yap` `extPad` ~3305, `LABELS.comb='Balı al'`, `tea='Peyniri ver'`) oyunda tetiklenmeyen ölü kod; kayıt anahtarları (`lav`, `parf`, … `S.lv`) migrasyon için kalmalı, kodu temizle.

### P3
- At çiftliği (`ciftlik_m_r_track.jpg`, `ciftlik_m_hub.jpg`): görsel çok iyi. Yarış/gösteri alanı boşken ("showF") boş çit; küçük bir tabela "Gösteri 24K'da açılır" + önizleme atı koy.

---

## Bölüm 1 – Çiçek Bahçesi (`index.html`)

Konum örneklemesi temiz (0 anomali). Minibüs türlerinin kendi modeli var (bisiklet/araba/kamyonet) – burada etiket doğru.

### P2
1. **Giriş hikâyesi yok.** Bölüm 2/3 `chapShow` giriş kartı gösteriyor, Bölüm 1 doğrudan "Kaydır ve oyna". Aynı kartı ekle (kayıt `S.ic` zaten var).
2. İhracat Limanı gemisi dar bir nehir şeridinde (`cicek_k2_port.jpg`): gemi "yola çıkınca" nereye gittiği belli değil. Şeridi doğuya/batıya açık denize bağla veya gemiyi şeridin ucunda sis içinde silinecek şekilde (fade) bitir.
3. Düğün alanı (`cicek_k2_wed.jpg`) iyi; ilk açılışta büyük "DÜĞÜN SİPARİŞİ" pano yazısı kısa açıklama (1 satır: "Siparişi doldur → büyük ödül") alsın.

### P3
- Bölüm sonu kapısı sonrası kutlama var; bölüm kapısı onay kartına "Teyzen sahilde seni bekliyor" gibi tek satır ekle (hikâye bölümüne bak).

---

## Hikâye / his önerileri (küçük, kalabalık yapmadan)

Çerçeve: oyuncu "Deniz" adlı genç; büyükannesinin/amcasının mirasını sırayla ayağa kaldırıyor. Mevcut araçlar yeterli: `chapShow(html, buttons)` kartı, `toast`, `praise`, `S.seen` bayrakları (kayıt uyumlu: yalnızca yeni anahtar ekle). Her bölümde 1 mentor, 4-5 satır, hiçbiri oyunu durdurmadan (toast 3.5 sn).

| Bölüm | Mentor | Giriş kartı | Kilometre taşları (toast) | Geçiş |
|---|---|---|---|---|
| 1 Bahçe | Nene Gül | "Bahçe artık senin. Çiçekleri topla, buket yap, ilk müşteri bekliyor!" | ilk satış "İlk müşterin!"; ilk işçi "Artık yalnız değilsin"; Sera "Orkideler nene'nin sırrıydı"; Müze "Bahçen şehrin gururu oldu" | Kapı kartı: "Nene'den mektup: Sahildeki kulübem seni bekliyor." |
| 2 Sahil | Kaptan Selim | "Kulübe eski ama tekneler hazır. Balık tut, temizle, sat!" | ilk tekne "Selim: Denize açıl!"; ilk hamal "Rıhtım artık işliyor"; İhracat ilk sefer "Balıklarımız yurt dışına gidiyor"; Akvaryum "Selim'in hayali gerçek" | "Selim'in kuzeni çiftlikte yardım istiyor." |
| 3 Çiftlik | Ayşe Hala | "Yumurtalar, inekler ve atlar… hepsi sende. Önce tavuklara bak!" | ilk koli "Tavuklar mutlu"; ahır "Süt de senin"; ilk at "İlk atın! Ona bir isim ver"; gösteri "Çiftlik Şenliği!" | Final kartı: "Üç bahçe, bir aile. Teşekkürler!" + Oynamaya devam |

Ek "his" dokunuşları: (1) her bölge açılışında mentorun tek cümlelik yorumu (1 dizi, `S.seen` ile bir kez), (2) oyuncu 3 dk boşta kalırsa hedef çubuğunun altında ipucu satırı, (3) bölüm kapısı kartında önceki bölümden toplam kazanç ("Bahçeden 1,2M kazandın").
