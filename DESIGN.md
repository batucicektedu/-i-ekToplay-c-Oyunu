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


## Güncel sayılar (denge turu)
- Çarpan 1.5; bazlar: Kapasite 70, Hız 100, Paketleme 130 (7 seviye); Kasiyer/Taşıyıcı/Kapasite/Bahçıvan hızı 300/300/350/400 (7 seviye).
- Düz fiyatlar: Kasiyer 150, Taşıyıcı 450, Yardımcı 450, Yeni Bahçe 300, Sera 1800, Minibüs 6000.
- Müşteri doğma 2.0 sn (kuyruk<3 iken 0.8), Kasiyer hızı seviyesi başına ×0.88. Saksı süresi sabit 1.4 sn. Minibüs ödemesi ×2. Pad'de ödeme öncesi 0.5 sn bekleme.
