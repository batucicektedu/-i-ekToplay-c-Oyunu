# Çiçek Bahçesi – Tasarım Dokümanı (Faz B)

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
