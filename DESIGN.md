# Çiçek Bahçesi – Tasarım Dokümanı

## Son sürüm (C6 – görsel cila + boşluklar)
- **Pad'ler:** tüm pad adları ve alt yazıları pad genişliğine sığacak şekilde otomatik büyütülür (`fitT`); etkisi belli olmayan her pad alt yazı gösterir (Kapasite "Taşıma 25 → 35", Ödül "Ödül +%15", Bilet "Bilet +%25", Yeni Kovan "Kovan 2 → 3", hız pad'leri "Daha hızlı …"; tablo `PADSUB`, index.html "restore progress" öncesi).
- **+1 Eleman (en çok 3 kişi):** Düğün Görevlisi (`wedN`; her turda +1 ürün, ek görevli karakterleri), Garson (`waitN`; masa talebi `claimed` ile çakışmaz), Şube Kasiyeri (`cityN`; servis süresi /(1+N)), Liman Hamalı (`portN`; ortak `held`/`taken` ile aynı ürünü iki hamal almaz), Arıcı (`beeN`; başka arıcının kovanı cezalı). Kayıt `ver` 6: yalnız yeni `lv` anahtarları (varsayılan 0); `tests/saves/c6-v6.json`.
- **Otobüs:** yeni model (gövde+krem şerit, pencereler, far, tampon, TESLİMAT yan etiketi; tek birleşik geometri + 4 tekerlek), park yeri sokağa alındı (`BUS_DEPOT` -14); çatı yığını yükseltildi. Taşıyıcılar, otobüs bir çıkışı rezerve ettiyse (stok <6) o ürüne dokunmaz (`srcRes`); otobüs de bir taşıyıcının yöneldiği ürünü planlamaz. Ana buket/saksı çıkışları (plaza) otobüs güzergahının dışında olduğu için otobüse eklenmedi.
- **Bölgeler:** Liman: dalgalı + ışıltılı deniz (`onBeforeCompile` ile köşe dalgası/parıltı, tek çağrı), kıyı köpüğü, 4 martı (instancing), geminin bacasından duman, tahta güverte, mevcut fener/vinç/bollard; Arıcılık: peteksi kıvrımlı çizgili kovanlar, bal rengi altıgen yol, dev dekoratif kovan; Japon: iki büyük taş fener (torii/köprü/kiraz/koi/yaprak zaten vardı); Festival: 4 balon demeti; Müze: 6 sütunlu ön cephe, basamaklı taç, büyük tabela, kapı sütunları; Şehir Çiçekçisi: zemin karoları + büyük tabela.
- **Çizim çağrısı (geç oyun, aynı kamera):** meydan 1048 → 1070, sokak 658 → 674, geniş bakış 892 → 904; yeni/yenilenen bölgelerde +%3–10 (hepsi `mergeStatic`/instancing).

## Son sürüm (C5 – yönetici turu)
- **Otomasyon:** her ürün zinciri çalışanla kapanır. Girdi: Lavanta/Gül/Ayçiçeği/Bonsai/Çay Bahçıvanı (yeni, cafe), ana bahçe Yardımcı; çıktı taşıma: Taşıyıcı (+ Teslimat Otobüsü); satış: Kasiyer, Şube Kasiyeri, Garson, Düğün Görevlisi, Liman Hamalı. Para yığınları (dükkân, minibüs, liman) artık Kasiyer/Taşıyıcı/Hamal varken kendiliğinden toplanır. Parfüm istasyonu hem gül hem lavanta alır (Gül Bahçıvanı ikisini de getirir).
- **Şehir Çiçekçisi hatası:** yığın tek türle dolup parfüm hiç gelmiyordu ve kuyruk tıkanıyordu. Artık tür başına en çok 4 ürün, müşteri yalnız stoğu olan/tedarik edilen türü ister, Taşıyıcı (ve otobüs) şubeyi besler, 40 sn bekleyen müşteri ayrılır (kuyruk tıkanmaz).
- **Toplayıcı rolleri:** Kapasite (4 seviye), +1 Eleman (en çok 3), Traktör Yap (hız 2. seviyeden sonra). Evrimde "TRAKTÖR!" yazısı + konfeti; traktör kapasitesi 30+, hızı x1.5, bölge renginde. Ayçiçeği traktörü eskisi gibi tek alımla gelir (`sunW`), kapasite/eleman pad'leri eklendi. Boşta kalan toplayıcı 3 sn sonra başka istasyonun ihtiyacı olan türü (yalnızca o istasyonun kullandığı tür) toplar; kendi bölgesinde iş çıkınca eve döner. Talep (claim) ve bekçi sistemi aynı.
- **Hız pad'leri:** Düğün Görevlisi Hızı, Saksı Hızı eklendi; +1 Taşıyıcı / +1 Kasiyer.
- **Teslimat Otobüsü:** Parfüm açılınca; sokakta döngü, istasyon çıkışlarından alır, raf/şehir/düğün/gemi/minibüse bırakır; hız, kapasite, +1 otobüs. İstasyon başına rezervasyon (`busRes`).
- **Pad'ler:** yerleşim denetimi artık sokak, patika, çiçek yatağı ve pad'lerle çakışmayı da önler (`tests/padoverlap.js`: 0); pad'ler yolun üstünde de görünür çizilir. Yıldız pad'i "Tüm satışlar +%X" alt yazısı gösterir.
- **Kamera:** yalnız önemli ilk olaylarda (yeni bölge, ilk işçi, traktör, ilk gemi) ve her tür bir kez (`S.seen`), sıraya girer, oyuncu hareket ederken bekler.
- **Kayıt:** SAVE_VER 5; yalnız yeni alanlar (`lv` anahtarları, `seen`). `tests/saves/c5-v5.json` eklendi.

## Son sürüm (C4 – sadeleştirme turu)
- **Sade ekran:** HUD'da yalnızca para, kapasite, hedef çubuğu, tam ekran ve ayarlar. Görevler / Koleksiyon / Gardırop ayar menüsünde, açılınca görünür. Güzellik göstergesi ve satın alınmamış dekor hayaletleri/pad'leri kaldırıldı (alınmış dekor ve bonusları korunur). Küçük fenerler kaldırıldı.
- **Pad'ler:** daha büyük, büyük yazı; aynı anda en çok 4 pad (sıradaki hedef + işçi alımları + parası %40'a ulaşanlar, üst üste binenler gizlenir). Görünen pad'e basınca her zaman tepki verir: para yetmezse "Yetersiz para: X" uyarısı. Pad çakışma denetimi (`fixPads`, `tests/padoverlap.js`) pad'leri prop/collider'dan uzaklaştırır; `tests/padpay.js` her görünür pad'in parayı çektiğini doğrular.
- **Geç içerik:** C2 (mekan seviyesi, gardırop, gece-gündüz) ve C3 bölgeleri Şehir Çiçekçisi alınmadan görünmez; sonra zincir halinde (Arıcılık → Japon → Defter → Liman → Festival → Müze). C3 fiyatları artırıldı (Japon 105K, Defter 75K, Liman 230K, Festival 320K, Müze 600K). Eski kayıtlarda açılmış her şey açık kalır.
- **Minibüs:** her sefer farklı istek; Bisiklet (3), Araba (5), Kamyonet (8), Kamyon (12) – büyük balon ürün simgeleri ve sayaçla ne istediğini söyler; ödeme türe göre çarpılır (2.0/2.3/2.6/3.0). Taşıyıcı artık minibüse de sırayla servis yapar.
- **Düğün:** büyük "DÜĞÜN SİPARİŞİ" pad'i, büyük sipariş panosu, en çok 2 ürün türü, iz/ok yönlendirmesi; Düğün Görevlisi (7.500) siparişi çıkış yığınlarından otomatik besler.
- **Liman:** Hamal Hızı ve Hamal Kapasitesi pad'leri.
- **Hata düzeltmeleri:** kapasite taşması (HUD kırpma, taşınan ürünler kayda eklendi), festival hedefi gerçek satış hızından (%70, 3 dk), bekçi meşru beklemeleri saymıyor (30 dk boşta: 0 takılma; tüm ürünler üretilip satılıyor).
- **Performans:** bu turda yeni optimizasyon yapılmadı (yönerge: yeni özellik yok); önceki sayılar geçerli (Yüksek 490-800 çağrı geç oyunda).

## Faz B

Kaynak: idle arcade / hybrid-casual araştırması (Supersonic, Homa, Azur Games "My Mini Mart" analizi, Burger Please! incelemeleri, genel idle ekonomi kuralları).

## Temel ilkeler
- İlk satın alma 30–60 sn içinde; erken döngü 15–25 sn.
- Metin okutma yok: ok + ikon ile yönlendirme.
- Her yeni bölge **tek** yeni istasyon/ürün getirir.
- Satın almalar arası süre: başta 20–60 sn, orta oyunda 2–5 dk.
- Her etkileşim geri bildirim verir: yay animasyonu, pop, ses, titreşim, "+$" yazısı.
- Bölge açılışı: ~1.5 sn kamera kaydırma + konfeti + pop-in animasyonu.

## Ekonomi
- Seviye maliyeti: `taban × 1.5^seviye` (hız/kapasite 5–8 seviye).
- Bölge / çalışan açılışları önceki alıma göre 2–4 kat pahalı.
- Ödeme süresi: küçük fiyatlar ~1 sn, büyükler en fazla ~2.5 sn; seviyeler arası bekleme (pad'den çıkıp tekrar basma).

## Çalışanlar (otomasyon)
| Çalışan | Ne yapar | Açılış | Geliştirmeler |
|---|---|---|---|
| Kasiyer | Tezgah rafındaki ürünlerle müşterilere otomatik satış yapar | 150 | Servis hızı |
| Taşıyıcı | Atölye çıkışından ürünleri alıp tezgah rafına (ürün başına ayrı şerit) götürür | 450 | Hız, kapasite |
| Bahçıvan (Yardımcı) | Çiçek ve orkide biçip atölyelere bırakır (ihtiyaca göre) | 450 | Hız, kapasite |

Tezgah rafı: oyuncu da ürünleri buraya bırakabilir; kasiyer yoksa oyuncu tezgahta durarak satış yapar.

## Bölgeler
1. **Bahçe + Paketleme Atölyesi + Çiçekçi** (başlangıç) – Buket, 10$.
2. **Sera** (açılış 1800) – Orkide yetişir (yavaş büyür) → **Saksı Atölyesi** orkideyi saksıya diker → *Saksı Orkide*, 25$. Müşteri baloncuğu hangi ürünü istediğini gösterir.
3. **Teslimat Minibüsü** (açılış 6000) – Minibüse 8 ürün yüklenir, minibüs yola çıkar, ~20 sn sonra 2x değerinde büyük para yığınıyla döner.

Kilitli bölgeler gri zemin + çit + "KİLİTLİ" tabelası ve önünde fiyat pad'i ile görünür. Harita büyüdükçe kamera biraz uzaklaşır.

## Müşteriler
- Her 6 müşteriden biri **VIP** (taç, parlak kıyafet): 3 kat öder, konfeti ile ayrılır.
- Mutlu müşteri bahşiş bırakabilir (küçük ek para).

## Sonraya bırakılanlar
- Çevrimdışı kazanç, günlük hedefler, reklam/IAP.


## Güncel sayılar (oynanabilir reklam turu + 60 dk uzun kuyruk)
Kaynak: `CFG`, `UPG`, `PRICE`, `ECON`, `GOALS` (index.html). Tüm sayılar bot simülasyonuyla (`window.__game.sim/bot/objective`) doğrulandı.

**Çekirdek**
- Çarpan 1.3, 5 seviye (bazlar: Hız 25, Paketleme 40, Kapasite 50, Kasiyer Hızı 100, Bahçıvan Hızı 120, Taşıyıcı Hızı 140, Taşıyıcı Kapasite 160). Düz fiyatlar: Kasiyer 90, Yeni Bahçe 150, Yardımcı 220, Taşıyıcı 320, Sera 1800, Minibüs 2500.
- Sırt: taban 25, +10/seviye (korundu). Yenilenme: lale/gül 10 sn, orkide 18 sn (korundu). Yataklar 7x5 = 35 çiçek (daha yoğun, bekleme yok).
- Banknot 15$, buket 15$, saksı 45$, müşteri 2–6 ürün (saksı/parfüm/… en çok 3/2), VIP x3. Paketleme 0.5 sn (x0.75/seviye), kasiyer 0.6 sn (x0.8/seviye), doğma 1.4/0.6 sn.
- Aktarım: 0.04 sn/ürün, uçuş 0.15–0.3 sn. Pad: bekleme yok, küçük fiyat 0.6 sn, büyük en çok 1.2 sn; seviyeler arası "pad'den çık" kilidi (0.3 sn) duruyor.

**Yönlendirme / geri bildirim**
- İlk 5 sn: el + "Kaydır ve oyna" (ilk sürüklemeye kadar, başka metin yok). Sonra: üstte "sıradaki hedef" çubuğu (ikon, ad, %), yere A* yol bulmalı parlak ok izi + zıplayan 3B ok, hedef pad'in kamera kaydırmasıyla (<=1 sn, hareketle atlanır) belirmesi.
- Para sayacı geri sayım, jeton uçuşu, "+$" yazıları, konfeti, flaş, "Harika!/Süper!/Müthiş!" övgüsü, bölge açılışında büyük banner.

**Hedef sırası (bot, 390x844, ilk 8 dk)**: Hız 0:17, Paketleme 0:18, Kapasite 0:27, Kasiyer 0:29, Yeni Bahçe 0:45, Yardımcı 1:10, Taşıyıcı 1:28, Sera 2:38, Minibüs 4:20, tüm 5'er seviyeler ~7:00.

## Genişleme bölgeleri (kuzey caddesi, üretim -> işleme -> satış)
Kilitli alan = turuncu/beyaz inşaat çiti + KİLİTLİ tabelası + fiyat pad'i (caddede); açılışta çit düşer, konfeti, kamera kaydırma, hedef çubuğu. Her bölge tek yeni ürün/istasyon getirir. Hepsi `buildExpansion()` ile kurulur, statik parçalar birleştirilir, çiçek tarlaları instancing.

| # | Bölge | Fiyat | Yeni ürün | Notlar | Bot zamanı |
|---|---|---|---|---|---|
| 1 | Lavanta Tarlası + Kese Atölyesi | 4500 | Lavanta Kesesi (70$) | 2 tarla (70 bitki), Bahçıvan 1500, Kese Hızı 7 sv (taban 700) | ~9:30 |
| 2 | Parfüm Atölyesi | 15500 | Parfüm (250$) | Gül tarlası + iki girdi tezgâhı (gül + lavanta, sayaç levhası), Gül Bahçıvanı 2500, Hız 7 sv (1000) | ~15:20 |
| 3 | Çiçek Kafe | 33000 | Çiçek Çayı (45$) | 6 masa, çay ocağı (orkide veya lavanta), misafir oturur/sipariş/bahşiş, Garson 4000, Çay Hızı 7 sv (1500) | ~22:00 |
| 4 | Düğün Organizasyonu | 50000 | Sipariş (ürün x ~14 ödül) | Pano: örn. 12 buket + 6 saksı + 2 parfüm (+kese/ayçiçeği), 8 dk süre, kemer + havai fişek, 25 sn bekleme sonra daha büyük sipariş; Düğün Ödülü 5 sv (+%15) | ~30:00 |
| 5 | Ayçiçeği Tarlası | 48000 | Ayçiçeği Buketi (120$) | 3 tarla (105 bitki), Traktör (sürücü) 9000 otomatik hasat+taşıma, Hız 7 sv (3000) | ~49:00 |
| 6 | Şehir Çiçekçisi | 45000 | Şube satışı (x1.5) | Ayrı kuyruk, Şube Kasiyeri 6000, Hız 7 sv (2000) | ~55:00 |
| - | Dükkan Yıldızları | 18000 taban x1.3, 5 sv | Tüm fiyatlar +%20/yıldız | Havai fişek + banner; HUD'da yıldız rozeti | 35:30, 40:40, 57:40 ... |

Müşteri istekleri en yeni ürünlere doğru ağırlıklı (bouquet 3, diğerleri 1.5+1.2*sıra), stok/üretim yoksa nadiren istenir; VIP siparişleri de yeni ürünleri içerir. Kamera her açık bölgede biraz uzaklaşır (+%3).
**Hedef**: 60 dk boyunca açılışlar arası 4-9 dk, aralarda 30-90 sn'de bir geliştirme (Hız seviyeleri ve Yıldızlar araya serpiştirildi).

## Performans (Düşük/Yüksek)
Statik dünya `mergeStatic`, tarlalar `InstancedMesh`. Çizim çağrısı kare başına ~140-340 (Düşük 170-240), ~200-250k üçgen; tüm bölgeler açıkken bile aynı aralıkta.


## C2 – Kozmetik, mekan seviyeleri, güzellik, gün-gece (60–180 dk uzun kuyruk para çıkışı)
Kaynak: index.html bölüm "17. C2". Hepsi `S.lv` dışında yeni kayıt alanlarına yazılır: `S.tier`, `S.decor`, `S.cos`, `S.dn` (kayıt `ver` 3; eski kayıtlar varsayılanla yüklenir, hiçbir şey azalmaz).

**Görünürlük / ritim.** Tüm C2 pad'leri ilk genişleme (Lavanta) alındıktan sonra (~9:30) görünür; istasyon/bölge açıksa kendi pad'i çıkar. Pad: tam fiyat gerekir (kısmi ödeme yok), üzerinde 0.45 sn durunca öder, aynı pad'e tekrar basmak için çıkıp girmek gerekir. **Önce ana hedef:** oyuncu şu anki hedef pad'ini satın alabiliyorsa kozmetik pad'ler beklemede (kırmızı fiyat), böylece ilerleme yavaşlamaz. Pad'ler oyuncuya 26 birimden uzaktaysa gizlenir.

**1. Mekan Seviyeleri (Ahşap -> Boyalı Dükkan -> Lüks Butik).** 9 istasyon, her biri 2 satın alma; kademe başına +%25 (Boyalı +%25, Lüks toplam +%50).
| İstasyon | Bonus | Boyalı | Lüks |
|---|---|---|---|
| Paketleme Atölyesi | paketleme hızı | 6.000 | 24.000 |
| Çiçekçi dükkanı | müşteri ödemesi | 8.000 | 32.000 |
| Saksı Atölyesi | saksılama hızı | 10.000 | 40.000 |
| Minibüs bayi | minibüs kazancı | 12.000 | 48.000 |
| Kese | üretim hızı | 16.000 | 64.000 |
| Parfüm | üretim hızı | 22.000 | 88.000 |
| Kafe | çay fiyatı | 30.000 | 120.000 |
| Düğün | sipariş ödülü | 40.000 | 160.000 |
| Şehir | satış fiyatı | 50.000 | 200.000 |
Toplam 194K (Boyalı) + 776K (Lüks) = 970K. Görünüm: Boyalı = yeni renkli tente + kıvrımlı saçak, bayrak girlandı, ışık dizisi, çiçek kutuları, saksılar, boyalı tabela, damalı zemin; Lüks = bordo/krem çift tente + altın detaylar, mermer sütunlar, avizeler, asma sepetler, altın çerçeveli koyu tabela, "AÇIK" neon, mermer zemin. Her kademe tek seferde birleştirilmiş (`mergeStatic`) gruptur; eski tente/tabela gizlenir, önceki kademe atılır (bellek sızıntısı yok). Yapım animasyonu: iskele pop, toz, konfeti, havai fişek, banner.

**2. Dekorasyon + Güzellik Puanı.** 28 sabit yuva (meydan/güney park 8, sera 3, minibüs 2, Lavanta 3, Parfüm 2, Kafe 3, Düğün 3, Ayçiçeği 2, Şehir 2); soluk hayalet önizleme + pad. 9 süs: çiçek kemeri 12 puan (10K), fener 3 (1.5K), heykel 14 (14K), havuz 10 (8K), bank 4 (2.2K), kelebek bahçesi 9 (6.5K), çiçekli çit 5 (3.2K), şekilli çalı 7 (4.5K; tavşan/kuğu/spiral), çardak 18 (20K). Fiyat bölgeye göre çarpılır (meydan x1, sera/minibüs x1.2, Lavanta/Parfüm x1.5, Kafe/Düğün x2, Ayçiçeği/Şehir x2.5). Toplam 311.6K, 246 puan.
Eşikler (HUD'da çiçek rozeti + çubuk; satın alırken geçilirse kutlama: banner, havai fişek, konfeti): 25 müşteri gelişi +%10; 60 bahşiş şansı %25->%45 ve tutar x1.5; 110 VIP şansı +%6; 170 müşteri gelişi +%25 toplam; 215 "Çiçek Cenneti" VIP +%12, bahşiş şansı %60, tutar x2.

**3. Kozmetik (Gardırop).** Ayarlar menüsü veya HUD askı düğmesi. Saf görsel: şapka (hasır/şapkasız ücretsiz; kasket 1.5K, bere 2.5K, güneş şapkası 4K, çiçek tacı 6K, ressam bereti 9K, silindir 14K), kıyafet (klasik ücretsiz; 2K, 3.5K, 5K elbise, 8K, 25K altın), çalışan üniforması (6K, 12K, 20K, 45K; tüm işçiler/gardiyanlar/garson/şube kasiyeri), meydan zemini (taş ücretsiz, tuğla 8K, mozaik 30K, mermer 60K; plaza + güney yol + kuzey cadde). Toplam ~262K. Karakter parçaları `reskin()` ile değiştirilir (yığın/bekleme durumu korunur).

**4. Gün-gece.** 360 sn döngü (gün %40, akşam %10, geçiş, gece %24+). Saat `S.dn`'de saklanır, sadece Lavanta açıldıktan sonra ilerler (ilk dakikalar hep gündüz). Hemisfer/güneş/dolgu rengi-şiddeti, gökyüzü gradyanı, sis, (Yüksek) bloom + renk tonu anahtar karelerle karıştırılır; geceyi bile okunaklı tutmak için ambiyans düşürülmez (hemi 0.52, ay 0.46). Fener topları ve ışık dizileri `LAMPM/GLOWM` paylaşımlı malzemesiyle parlar (Yüksek: bloom), yere tek `InstancedMesh` toplamsal ışık havuzları, Yüksek modda 46 ateşböceği (Points). Düşük mod: bloom/ateşböceği yok, sadece ışık tonu + parlayan malzeme + ışık havuzları. Ayarlardan "Gece: Açık/Kapalı".

**Performans (390x844, geç oyun, tüm bölgeler açık).** Çizim çağrısı/kare (Yüksek / Düşük): C2 öğesi yokken meydan 392 / 350; 9 istasyon Lüks + 28 süs + gece ile meydan 475 / 428, geniş bakış 660 / 606. Kademe başına ~17 çağrı (görünürse), süs başına ~2.5, gece ~+3 (havuz + ateşböcekleri).


## C3 – Yeni içerik (60–180 dk): Arıcılık, Japon Bahçesi, Nadir Çiçekler, İhracat, Festival, Müze, Görevler, Çevrimdışı
Kaynak: index.html bölüm "18. C3" (`/*C3-BEGIN*/ … /*C3-END*/`). Kayıt `ver` 4: eklenen alanlar `S.lv.{bee,beeW,hiveN,hiveSpd,honSpd,jap,bonW,bonSpd,coll,port,portW,portBonus,fest,festBonus,mus,musTkt}`, `S.tier.{hon,bon}`, `S.cb` (koleksiyon sayıları), `S.cs` (tamamlanan setler), `S.pt` (ihracat: n, cur, pile), `S.fe` (festival: n, t), `S.q` (görevler), `S.bx` (ekstra güzellik), `S.ts` (son kayıt zamanı), `S.op` (bekleyen çevrimdışı kazanç), `S.mv` (müze ziyaretçisi). Eski kayıtlar varsayılanla yüklenir; hiçbir şey azalmaz (`tests/saves/c3-v4.json` yeni örnek kayıt).

**Harita.** Kuzey cadde 3 bant uzadı (z -92 … -168): bant 4 Arıcılık (batı) / Japon Bahçesi (doğu), bant 5 İhracat Limanı (batı) / Çiçek Festivali (doğu), bant 6 Botanik Müzesi (batı). Koleksiyon Defteri bölge değil, meydanda (güney) bir pad. Kamera her açık bölgede +%3 uzaklaşır; yol bulma ızgarası ve oyuncu sınırları z -172'ye uzatıldı.

| # | İçerik | Açılış (taban fiyat) | Yeni ürün / sistem |
|---|---|---|---|
| 1 | **Arıcılık** | 20.000 | 6 kovan yuvası (2 + Yeni Kovan 4 sv), arılar (InstancedMesh, çiçek-kovan uçuşu), kovan peteği biriktirir (aralık 12 sn / (1+%25 × yakındaki çiçek bölgesi) / 1,3^Kovan Hızı) → oyuncu veya **Arıcı** (3.000) peteği alır → **Bal Kavanozu** istasyonu (2 petek → 1 kavanoz, 3 sn) → **Bal** 420$ (rafta ayrı şerit). Pad'ler: Arıcı, Yeni Kovan 3.000 x1,3 (4 sv), Kovan Hızı 2.500 (5 sv), Bal Hızı 2.000 (7 sv) |
| 2 | **Japon Bahçesi** | 80.000 | Kiraz ağaçları (düşen taç yaprakları), koi havuzu + kırmızı köprü (oyuncu köprüde yükselir), taş fenerler, torii kapısı; fidan tarlası → **Bonsai Atölyesi** (2 fidan → 1 bonsai, 3,8 sn) → **Bonsai** 1.100$ (premium). Bonsai Ustası 8.000, Bonsai Hızı 3.500 (7 sv) |
| 3 | **Nadir Çiçekler + Koleksiyon Defteri** | 60.000 | Hasat zamanı gelen çiçekte ~%0,4–1 şansla altın / gökkuşağı / kristal mücevher parıltısı; toplayınca deftere (6 tür x 3 varyant = 18). Kopyalar "Kopyaları Sat" ile 1.200 / 3.000 / 8.000$ x fiyat çarpanı. Setler (kalıcı): tür aileleri +%2 fiyat (6), Altın +%6, Gökkuşağı +%8, Kristal +%8 hız, Büyük Koleksiyon +%10 fiyat +%10 hız. Tamamlanınca banner + havai fişek |
| 4 | **İhracat Limanı** | 180.000 | Dok, büyük kargo gemisi (tek birleşik geometri + instancing sandıklar), sözleşme panosu (örn. 30 buket + 10 bal + 5 bonsai; her seviyede büyür, 3. seviyeden perfüm/saksı/ayçiçeği eklenir). Oyuncu veya **Liman Hamalı** (15.000) yükler; tamamlanınca gemi ~60 sn sefere çıkar (yolculuk animasyonu, kayıtta kalır), dönünce ürün değerinin ~3,6 katı (+%5/seviye, +%15/İhracat Ödülü sv) iskele para yığınında |
| 5 | **Çiçek Festivali** | 300.000 | Sahne, çadırlar, flama, balonlar, dans eden kalabalık. ~8 dk'da bir 3 dk'lık etkinlik ("3 dk'da 40 buket sat", bal/bonsai/parfüm/ayçiçeği/herhangi ürün; hedef etkinlik sayısıyla büyür). HUD'da ilerleme çubuğu; ödül: para (gelir tahmini x 4 dk), Güzellik puanı, ilk tamamlayışta **Festival Şapkası**, 3.'de **Festival Elbisesi** (Gardırop, sadece etkinlikle), havai fişek. Başarısızlıkta ceza yok (200 sn sonra yeni etkinlik) |
| 6 | **Botanik Müzesi** | 560.000 | Cam müze; koleksiyondaki nadir çiçekler vitrinlerde (instancing). Ziyaretçiler bilet öder: bilet = 90 x (1 + 3 x tamamlanma) x (1 + %25 x Bilet Fiyatı sv) x fiyat çarpanı, sıklık 9 sn / (1 + tamamlanma). Oyuncu uzaktayken sanal ziyaretçi (karakter çizilmez, para aynı). **Dükkan Yıldızları 6–10** açılır (her biri +%10) |
| 7 | **Görevler** | - | HUD sağ düğmesi. Her zaman 3 kısa görev ("30 bal sat", "2 dekor al", "1 ihracat tamamla"…), ilerleme `stats` farklarından, bitince otomatik ödül (para = gelir tahmini x 0,8–2,5 dk, +1–3 Güzellik), yenisi gelir. Sadece açık içerikten görev üretilir |
| 8 | **Çevrimdışı kazanç** | - | Açılışta (ve sekme geri gelince) `S.ts`'e göre ≥90 sn uzak kalındıysa: kazanç = gelir tahmini (işçi zinciri: yardımcı+kasiyer+taşıyıcı, bahçıvan/Arıcı/müze, taşıyıcı hızıyla sınırlı) x %50 x süre (en fazla 2 sa). "Sen yokken X kazandın" kartı + Topla düğmesi, kutlama. Bekleyen tutar `S.op` olarak kayıtlıdır (çift sayım yok); NaN/negatif/gelecek zaman damgası yok sayılır |

Müşteri istekleri yeni ürünlere ağırlıklıdır (sıra ağırlığı 1,5+1,2·i: bal ve bonsai en yüksek). Düğün siparişine bal/bonsai eklenir. Yeni mekan seviyeleri: Bal 60K/240K, Bonsai 110K/440K; yeni dekor yuvaları: 18 (Arıcılık 4, Japon 4, Liman 3, Festival 3, Müze 3 yuvadan oluşan toplam).

**Performans.** Statik bölge parçaları `mergeStatic` ile birleşir; arılar, koi, balonlar, sandıklar, nadir çiçek mücevherleri, müze örnekleri `InstancedMesh`; küçük dinamik süsler (arı, koi, kalabalık, gemi) oyuncu uzaktaysa gizlenir/güncellenmez; instanceColor kullanan örnekler ayrı malzeme (`vcMatI`) kullanır (three r128'de paylaşılan malzeme/geometri "program değişimi" çökmesine yol açıyordu).

**Zaman çizelgesi (bot, 60 dk'lık kayıttan 181 dk'ya, kozmetik almadan; `tests` dışı betik).** Bal/Arıcılık 66:30, Japon Bahçesi 81:40, Koleksiyon Defteri 97:30, İhracat Limanı 116:25, Çiçek Festivali 131:40, Botanik Müzesi 142:30, Yıldızlar 6–10 145–171. Aralarda Kovan/Bal/Bonsai/İhracat/Festival/Bilet geliştirmeleri her 1–3 dk. Bot Mekan Seviyesi/Dekor/Gardırop satın almadığı için 4 dk'yı aşan boşluklar (en çok 10–15 dk, jap ve port öncesi) gerçek oyunda bu pad'lerle (C2) dolar; bot kozmetik alırsa zincir ~40 dk uzar. Sonuç: 120 dk'da 3,3M kazanç, 6 ihracat, 13 nadir çiçek, 14 görev, 356 müze ziyaretçisi, konsol hatası yok. **İşçi durma izleyicisi** (Arıcı, fidan bahçıvanı, hamal; iş varken ve çıkış dolu değilken 25 sn kıpırdamama): 15 dk'da 0 durma.

**Çizim çağrısı (390x844, geç oyun, tüm bölgeler açık; önce -> sonra).** Yüksek: meydan 456 -> 494, geniş bakış 618 -> 729, cadde (z -70) 185 -> 297 (yeni bölgeler görünür). Düşük: 414 -> 446, 570 -> 682, 150 -> 278. Yeni bölge görünümleri (Yüksek): Arıcılık 260, Japon 257, Liman 222, Festival 233, Müze 170 (C2 öğeleriyle +~45). Kilitliyken yeni içerik ~+16 çağrı.

## Bölüm 2 – Sahil Balıkçısı (v2: yeni koy tasarımı)
`sahil/index.html` (kayıt `bolum2_sahil`, motor Bölüm 1'den; içerik ve yerleşim yeni). Palet: turkuaz, beyaz, kum, lacivert, mercan.
- Yerleşim: merkez = beyaz kireç taşı yürüyüş yolu (promenade); batıda denize uzanan tahta İSKELE (hub). Balık noktaları iskelenin iki yanında (açık deniz, köpüren/fışkıran balıklar, açık turkuaz "balık sahası"); kilitli üçüncü saha şamandıra halkasıyla çevrili. Kuzeyde beyaz Ege evleri (mavi/mercan kapı-panjur, begonvil), palmiye, mavi-beyaz şemsiyeler, ufukta yelkenliler, uzakta fener adası.
- Çekirdek mekanik: OLTA. Oyuncu iskelede durunca (yürürken değil) otomatik olta tutar, atış animasyonu, ~0.3-0.6 sn'de bir balık yakalar (Hız yükseltmesiyle hızlanır), sıçrama/su sıçraması, balık sırta uçar. Yardımcı balıkçılar iskele kenarında durup aynı şekilde olta atar; "Tekne Yap" evrimi tekne olur. Midye/karides/yengeç/yosun/istiridye yürüyerek toplanır.
- Zincir: Balık (olta) → Temizleme Tezgâhı → Buzlu Kasa → Balık Tezgâhı (müşteri kuyruğu) → para.
- Midye Kayalığı: GELGİT. 36 sn'lik döngü; su çekilince (alçak gelgit) kayalar ve midyeler ortaya çıkar, sadece o zaman toplanır (oyuncu ve işçiler); su yükselince midyeler suyun altında kalır.
- Diğer bölgeler (Karides Kafesi, Konserve, Izgara Restoranı, Düğün/Mezat, Suşi, Tuz Tavası, İnci, Liman/İhracat, Festival, Müze, Şehir büfesi) hâlâ Bölüm 1 bölge altyapısının deniz temalı uyarlamasıdır; sıradaki iş: her birine kendi mekaniği (tekneler denize açılıp dönsün, kafes çekme, mezat zili, fener adası finali).
- Bölümler: ◀ ÖNCEKİ BÖLÜM kapısı, SIRADAKİ BÖLÜME GEÇ (750K pad, `cicek_bolumler`), ayar menüsünde Bölümler.
- Testler: `tests/sahil/` (smoke, bot, padoverlap, padpay, idle30+osc, hints, saves). Kayıt örnekleri: `tests/sahil/saves/`.

## Bölüm 3 – Hayvan Çiftliği
`ciftlik/index.html` (kayıt `bolum3_ciftlik`, `SAVE_VER 8`). Yerleşim: organik toprak yollar + yumuşak kenarlı avlu lekeleri, kırmızı ahır/silo/yel değirmeni arka planda, tüm çitler ahşap. Merkez avlu (Çiftlik Dükkânı, yumurta folluklar, İnek Ahırı, Süt Kamyonu) → kuzey yolu At Çiftliği'ne, güney-batı Koyun Çayırı, güney-doğu Sevimli Hayvanlar + Meyve Bahçesi.
- **At Çiftliği** (14K; vitrin): beyaz çitli oval pist, ahır (5 bölme), padok, bilet kulübesi, havuç tarlası, saman, Engelli Parkur sahası, gölet. 5 at (kestane, kar, gece, altın, benek), kutu/küre modelli; yürüyüş/tırıs/dörtnala (diz bükmeli), otlama, kulak/kuyruk. Biniciler kuyruğa girer, hoca yoksa oyuncu biniş pad'inde başlatır; atın sevgisi (havuç/elma/saman ile artar, her binişte azalır) bilet ve bahşişi etkiler. Yükseltmeler: +At (4), Biniş Hızı, Bilet Fiyatı, Binicilik Hocası (otomasyon), Tay (anneyi izler, bahşiş şansı), Engelli Parkur (periyodik gösteri, büyük ödül), Ata Bin (oyuncu kendi atına biner, 1.75x hız, aynı pad ile iner).
- **Koyun Çayırı**: yün yeniden büyür, kırkınca yün → Örgü Atölyesi kazak, Peynirhane (2 süt şişesi → peynir) → Çiftlik Pazarı'nda satış. Sevimli Hayvanlar: kuzu/keçi/tavşan, ziyaretçiler bilet öder. Meyve Bahçesi: elma (atlara yem). Hepsi alınınca "Çiftlik tamamlandı" kutlaması + "Yeni bölümler yakında" kartı.
- Ekonomi sırası: Süt Kamyonu → Meyve Bahçesi 4K → Koyun 6.5K → Örgü 5K → At Çiftliği 14K → atlar/biniş/bilet → Tay, Gösteri, Peynirhane, Zoo.
- Kural: pad'ler etkileşim bölgelerinden ≥0.8 uzakta (tests/ciftlik/padoverlap.js), bölgedeyken pad para çekmez.
- Testler: `tests/ciftlik/{smoke,padoverlap,ranch,saves}.js` (http sunucu ile: `GAME=http://localhost:8765/ciftlik/index.html`), fixture'lar `tests/ciftlik/*.json`, `saves/`.
- Yapılmadı/sonra: merkez avlunun (yumurta-dükkân) koordinatlarının tam yeniden yerleşimi, Seyis (havuç/yem işçisi), idle30 benzeri uzun dengesizlik testi.
