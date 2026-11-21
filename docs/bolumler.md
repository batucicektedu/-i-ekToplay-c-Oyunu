# Bölümler (chapters) – ortak sözleşme

Oyun birden çok bölümden oluşur. Her bölüm ayrı bir HTML sayfası, kendi kaydı ve kendi ekonomisi vardır. Bölüm 1 kodu ve kaydı hiç bozulmaz.

| Bölüm | Yol (GitHub Pages) | Dosya | Kayıt anahtarı |
|---|---|---|---|
| 1 Çiçek Bahçesi | `./` | `index.html` | mevcut (değişmez) |
| 2 Sahil Balıkçısı | `./sahil/` | `sahil/index.html` | `bolum2_sahil` (+ `_tmp`, `_bak`, `_corrupt`) |
| 3 Hayvan Çiftliği | `./ciftlik/` | `ciftlik/index.html` | `bolum3_ciftlik` (+ `_tmp`, `_bak`, `_corrupt`) |

## Ortak kayıt: `cicek_bolumler`
```json
{ "v": 1, "open": [1, 2], "last": 2 }
```
- `open`: geçiş kapısı parası ödenmiş (açılmış) bölümler. 1 her zaman açık.
- `last`: en son oynanan bölüm (bilgi amaçlı; otomatik yönlendirme YOK).
- Okurken bozuksa `{v:1, open:[1], last:1}` varsay; yazarken sadece ekle (open'dan asla çıkarma).

## Geçiş kapısı ("SIRADAKİ BÖLÜME GEÇ")
- Her bölümün sonunda (bölümün son bölgesi açıldıktan sonra görünür), haritadaki ana yolun sonunda: büyük kemer/kapı, yerde akan ok şeritleri, büyük tabela "SIRADAKİ BÖLÜME GEÇ" + alt yazı bölüm adı.
- Önünde bir ödeme pad'i (normal pad gibi para çeker). Ödenince `open`'a sonraki bölüm eklenir, kutlama yapılır. Ödendikten sonra kapı ücretsizdir.
- Kapıya yürüyünce büyük onay kartı: "Sahil Balıkçısı'na geç? İlerlemen burada kayıtlı kalır." [Geç] [Kal]. Geç → önce mevcut bölüm kaydı yazılır, sonra `location.href` ile sonraki bölüm sayfası.
- Bölüm 2 ve 3'te başlangıç noktasının yanında "◀ ÖNCEKİ BÖLÜM" kapısı (ücretsiz) aynı onay kartıyla geri götürür. Ayar (dişli) menüsünde de "Bölümler" listesi: açık bölümlere geçiş.
- Göreli yollar: kökten `sahil/`, sahilden `../` ve `../ciftlik/`, çiftlikten `../sahil/` ve `../`.
- Bir bölüm sayfası `open` içinde değilse yine de açılır (kayıt kaybı riski yok), ama ilk açılışta oyuncuya bir şey kaybettirmez.

## Kurallar
- CLAUDE.md'deki kayıt uyumluluğu kuralları her bölüm için geçerli (SAVE_VER, migrateSave, tmp/bak yazma, tests/saves fixture'ları).
- Bölüm 2/3, Bölüm 1 motorunun (index.html) kopyasından türetilir; içerik değişir, motor/altyapı (karakter, sırt yığını, pad, istasyon, müşteri kuyruğu, işçi talep sistemi, bekçi, otobüs, traktör evrimi, kamera kuyruğu, kalite ayarı, PWA) aynı kalır.
- Her bölüm baştan playable-reklam hızında başlar ve sadedir; 2–3 saatlik içerik; ortadan sonra oyuncu yönetici olur (her zincir işçi/makineyle otomatikleşebilir, +1 Eleman, hız, kapasite).

## İş sırası (öncelik)
1. Bölüm 2 Sahil: oynanabilir sürümü hemen yayınla, sonra küçük test edilmiş adımlarla bölgeleri tamamla.
2. Bölüm 3 Hayvan Çiftliği (at çiftliği vitrin bölge, oyuncu ata binebilir) – Sahil yayından sonra başlar.
3. Bölüm 1: Çardak süsünün pasta görünümü, otobüsün meydan ürünlerini taşıması (isteğe bağlı).
