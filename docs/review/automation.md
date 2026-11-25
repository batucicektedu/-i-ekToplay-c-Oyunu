# Automation audit: can every chain run without the player?

Design goal (docs/bolumler.md): past the middle of the game the player is only a manager; every production chain can run with workers or machines.
Question: "Can every area run fully automated?" Short answer: **Chapter 1 yes. Chapter 2: no (4 of 8 chains are manual). Chapter 3: no (egg chain is dead when the tractor evolution is bought, parkur show is manual).**

## Method (read-only audit, game files untouched)
- Fixtures: ch1 `tests/max.json`, ch2 `tests/sahil/saves/sahil-end-v8.json`, ch3 `tests/ciftlik/auto.json` (same result with `saves/c3-v10-auto.json`).
- "Everything bought": every `upPads[k]` set to `max()` in the loaded save (`lv[k]=max`, no save-format change), except `gate` (chapter door). Money also topped up so nothing is price-limited.
- The player is teleported to a corner, his back-stack is emptied, and the position is re-pinned every sim second. Nothing else is done for 1200 sim seconds (30 fps fixed step, `__game.sim`), sampled every 30 s. `player.inZone` stayed 0 and `carry` stayed 0 in all runs.
- Every `S.money` increase is attributed to a call stack (instrumentation only, `Object.defineProperty` on `__game.S`).
- Tests: `tests/auto/ch1.js`, `sahil.js`, `ciftlik.js` (+ shared `_h.js`). Run: `NODE_PATH=/opt/node22/lib/node_modules node tests/auto/<chapter>.js` (`DUMP=file.json` writes all series; exit 1 if a chain is not OK). ~1-2 min each, runs are random (Math.random), counts vary a few %.
- Measured on HEAD c41c67a (tests/auto only reads the game). NOTE: `sahil/index.html` had uncommitted edits by another agent (pads/hall) while measuring; ch2 numbers are for that working tree.
- Status words: OK = produced and sold, no uncollected cash. STALLED = the chain has an automating role but it does not run. MANUAL = no role exists, the player must carry/collect/trigger.

---
## Chapter 1: Çiçek Bahçesi (index.html), 20 idle minutes: 25.0 M earned, 0 watchdog stalls, 0 console errors

| Chain (input > station > output > cash) | Automating role (pad, price) | 20-min idle output | Status | Suggested fix |
|---|---|---|---|---|
| Buket: beds > Yardımcı > packing table > Taşıyıcı > shelf > Kasiyer > money pile | Yardımcı 220 (+1 Çiftçi 900/1170, Traktör Yap 3500), Taşıyıcı 320 (+1 1200/1560), Kasiyer 90 (+1 600/780); machine packs itself | 2736 packed, 211 sold to customers (141 shop + 70 city); rest consumed by weddings (2430 items). Money pile peak 32-47/60, always drained | OK (transport-limited) | none. Note: shelf empty 40-55% of samples while outputPile is 14-16/16, so carrier capacity (not production) caps shop sales |
| Saksı: Sera orchids > Yardımcı > pot workshop > Taşıyıcı > pot shelf | same Yardımcı (switches to orchid by `helperKind`), Saksı Hızı | 493 potted, 67 sold | OK | none |
| Minibüs delivery | Taşıyıcı/Otobüs load, Taşıyıcı collects `vanPile` | 24 trips | OK | none |
| Lavanta kesesi | Lavanta Bahçıvanı 1500 (Kapasite 900.., +1 4500/5850, Traktör 6000) | 266 made, 137 sold | OK | none |
| Parfüm | Gül Bahçıvanı 2500 (+1 7500/9750, Traktör 15000) | 398 made, 138 sold | OK | none |
| Çay (Kafe) | Çay Bahçıvanı 4500 + Garson 4000 (+1 7000/9100) | 172 made, 156 served | OK | none |
| Düğün | Düğün Görevlisi 7500 (+1 9000/11700) | 28 weddings, 2430 items, about 15 M (60% of all income) | OK | balance flag: wedding reward dwarfs every shop chain at max level |
| Ayçiçeği buketi | Traktör 9000 (+1 15000/19500) | 426 made, 213 sold | OK | none |
| Şehir Şubesi | Şube Kasiyeri 6000 (+1 12000/15600); Taşıyıcı/Otobüs feed stock | 222 served, queue 2-4, stock 13-28 | OK | none |
| Bal (hives > Arıcı > jar station) | Arıcı 3000 (+1 4500/5850) | 519 made, 199 sold | OK | none |
| Bonsai | Bonsai Ustası 8000 (+1 20000/26000, Traktör 30000) | 385 made, 128 sold | OK | none |
| İhracat (export contracts) | Liman Hamalı 15000 (+1 12000/15600) | 9 contracts | OK | none |
| Teslimat Otobüsü (3 buses) | Otobüs 20000 (+1 15000/19500) | 157 trips, 1117 items | OK | none |
| Nadir çiçek toplama | gardeners claim gems themselves | 39 gems, 6 sets | OK | none |
| **Koleksiyon: "Kopyaları Sat" (duplicates > cash)** | **none** (book menu button `bSell`) | 0 sold; "+153K" is waiting after 20 min | **MANUAL** (minor: 0.6% of income) | auto-sell duplicates: e.g. Botanik Müzesi pays out duplicates every 5 min, or a "Küratör" pad about 25,000 |
| Festival / Müze / Görevler | automatic (events, virtual visitors, quest rewards) | 1 festival (246K), 227 visitors (417K), 8 quests (405K) | OK | none |

Chapter 1 non-automated list: only the collection duplicate sale. Everything else runs unattended.

---
## Chapter 2: Sahil Balıkçısı (sahil/index.html), 20 idle minutes: only 228,805 collected automatically; 303K more sits uncollected in the Fener Kafe pile; 0 watchdog stalls

| Chain | Automating role (pad, price) | 20-min idle output | Status | Suggested fix |
|---|---|---|---|---|
| Ana: fish spots > Yardımcı/Balıkçı > cleaning table > Taşıyıcı > shelf > Kasiyer | Yardımcı 220 (+1 900/1170, Usta Balıkçı 3500), Taşıyıcı 320 (+1 1200/1560), Kasiyer 90 (+1 600/780) | 1280 cleaned, 1119 sold (560 customers) | OK (transport-limited: inputPile 24/24, outputPile 15.5/16, cleaning machine idle 90%) | none |
| Midye kayalığı > pot station > pot shelf | Yardımcı + Taşıyıcı (Midye Hızı 300..) | 887 made, 720 sold | OK | none |
| Teslimat Aracı (van) | Taşıyıcı loads and collects | 42 trips | OK | none |
| Tekne > Rıhtım (DOCK 24) > Hamal > cleaning input | Balıkçı Teknesi 3500 (+1 7000/14000), El Arabalı Hamal 2800 (+1 4500/5850) | 3 boats, 3 hamals, 359 crate loads moved; DOCK 23.6/24 full, boats wait moored 90% of the time | OK (over-supplied) | none; cleaning/shelf side is the cap |
| **Balık-Ekmek Teknesi (gboat): crate > grill > customers > money pile** | **none.** `E.input` is filled only while the player stands in `inZone` (`updateEatery`, line ~3636); money only while the player is in `monZone`. `autoCollect` pulls only `moneyPile` and `vanPile` | 0 grilled; 7-8 customers queue forever, input 0, pile 0 | **MANUAL** | pad "Tezgâhtar" ~3,500 (zone costs 9,000): carries `bouquet` from outputPile to the crate (only when outputPile >= 8, so the shelf keeps priority), collects `E.pile`; "+1 Eleman" 4,500/5,850 |
| **Karides & Yengeç kafes > Deniz Tabağı kiosk** | **none.** Crane fills `C.tray` (cap 16) but only the player (`C.zone.inside`) moves trays to the kiosk crate and collects money | trays stuck full (shrimp 16/16, crab 16/16) so cranes stop; 0 plates; 7-8 customers queue | **MANUAL** (crane output blocked) | pad "Kafes Çırağı" ~4,500 (zone 11,000): trays > kiosk crate, collects `E.pile`; +1 6,000/7,800 |
| **Balık Hali / Mezat** | **none.** `HALL.stock` is filled only by the player in `HALL.zone`; auction needs >=3 crates, money only in `monZone` | 0 auctions (`state` stays `wait`), stock 0 | **MANUAL** | pad "Mezat Hamalı" ~5,000 (zone 12,000): outputPile > `HALL.stock` (cap 40, never starve shelf), collects `HALL.pile`; or let the existing Hamal also serve the hall |
| **Fener Kafe (income is automatic, cash is not)** | **none for the cash.** Tables pay into `FIN.pile` by themselves; it is collected only when the player is in `FIN.monZone` | `FIN.pile` 36/36 full, **302,769 overflow uncollected after 20 min** (more than all collected income, 228,805) | **MANUAL** (cash pile grows uncollected, biggest single leak) | add FIN.pile to `autoCollect` with a hired "Kafe Kasiyeri" ~8,000 (zone 30,000), or make Kasiyer/Taşıyıcı pull it as they already pull `moneyPile`/`vanPile` |
| Köprü / Hayvan Çiftliği kapısı | progression pads, not production | n/a | n/a | n/a |

Chapter 2 non-automated list: Balık-Ekmek Teknesi, Karides & Yengeç (+ Deniz Tabağı), Balık Hali/Mezat, Fener Kafe cash. Design note: these four consume or earn from the clean-fish `bouquet`; the main shop already over-produces (outputPile full, machine idle 90%), so a second consumer fits without starving the shelf if workers only take stock above a threshold.

---
## Chapter 3: Hayvan Çiftliği (ciftlik/index.html), 20 idle minutes: 259,666 earned, **320 watchdog stalls**

| Chain | Automating role (pad, price) | 20-min idle output | Status | Suggested fix |
|---|---|---|---|---|
| **Yumurta (egg): folluk > Çiftçi > packing > Taşıyıcı > shelf > Kasiyer** | Çiftçi/Yumurta Arabası (`helper` 220, +1 900/1170, `helperT` 3500), Taşıyıcı (+Süt Traktörü `carT` 4200), Kasiyer | only **54 packed, 48 sold**; `inputPile` empty 95% of samples, egg shelf empty 97%, 6 customers permanently queued; van only 2 trips (its load is eggs) | **STALLED** | two defects in the tractor ("Yumurta Arabası") gardeners, see below. Workaround proven: with `helperT=0` the same save packs 666 in 10 min |
| Süt: Ahır > milk > Süt Traktörü/Taşıyıcı > milk shelf | Çiftçi (orchid role), Taşıyıcı, Kasiyer | 560 made, 428 sold | OK | none |
| Süt kamyonu | Taşıyıcı | 2 trips | STALLED (symptom of the egg chain: the van wants eggs) | resolves with the egg fix |
| At binişi (ranch) | Binicilik Hocası 6000 starts rides and takes the money (`ranchPile` pulled to the instructor); Seyis 5000 (+6000/14000) feeds | 127 rides, 347 feedings, min love 49, pile 0 | OK | none |
| At bakımı (hay/carrot/apple) | Seyis, Elma Bahçesi 4000 | 347 fed | OK | none |
| **Engelli Parkur gösterisi** | **none.** `updateShow`: state `ready` waits for the player to step into `showZone`; 200 s cooldown then repeats | 0 shows in 20 min, `SHOW.state` stays `ready` | **MANUAL** (the best payout per event: 700 x horses x love) | let Binicilik Hocası auto-start the show when `ready` (no new pad), or a "Gösteri Sorumlusu" pad ~8,000 (zone 24,000) |
| Koyun > yün > Örgü > kazak > pazar | Çoban 4500 (+5500/13000) + Pazarcı 4000 (+5000/12000) | 551 sheared, 273 sweaters sold, no resets | OK | none |
| Süt > Peynirhane > pazar | Pazarcı fetches milk from `potOutput` and sells | cheese 64 sold | OK (milk-limited) | none |
| Sevimli Hayvanlar (visitors) | automatic visitors pay by `payDirect` | counted in income | OK | none |

### Root cause of the egg stall (evidence from `/tmp` debug runs, reproducible with `tests/auto/ciftlik.js`)
1. **Deliver deadlock** (`updateGardener`, ciftlik/index.html ~3398): after `resetGardener` (called by the watchdog and by the flip counter) `h.ctype = null` while the tractor still carries 1 item. `deliver` then only drops `h.stack.count(h.ctype)`, `count(null)` is always 0, so it stands on the drop pad at (-6.3, 0.9) forever; the watchdog resets it again every 10 s (113 `main|deliver` log lines). Tested in memory (page route, repo untouched): inserting `if (!h.ctype) h.ctype = h.stack.items[h.stack.items.length-1].type;` at the start of the `deliver` branch removes the deadlock.
2. **Tractor path stuck**: the second tractor stays in `seek` with a target at (-5.6, 4.8) for the whole run (target bed 2 around (-12, 7)); it never moves (113 `main|seek` + 94 `flower|seek` watchdog lines). This appeared with commit 39de335 ("arabalar yataklarin icinden gecmiyor", `vehTarget`/`vehAvoid`/`vehNear`): vehicle approach points and `wayPt` disagree. After fix 1 alone both tractors end in `seekTt` stalled, so both fixes are needed. Interim safety net: if a tractor makes no progress for ~20 s, drop back to walking mode (`tr=false`) for that trip.
3. The original `helper` (also a tractor) works, but it prefers orchids (`helperKind` picks orchid when pots < 6), so eggs are the starved chain. After the tractor fix, re-run `tests/auto/ciftlik.js`: expect packed in the hundreds, shelf not empty, van trips more than 2.

Chapter 3 non-automated/stalled list: egg chain (tractor workers stuck, van starved with it), Engelli Parkur show.

---
## Summary

| Chapter | Fully automated? | Non-automated / stalled chains |
|---|---|---|
| 1 Çiçek Bahçesi | Yes (every chain but one runs, 0 stalls) | Koleksiyon duplicate sale (minor, menu button) |
| 2 Sahil | No | Balık-Ekmek, Karides & Yengeç > Deniz Tabağı, Balık Hali/Mezat, Fener Kafe cash pile (303K uncollected in 20 min) |
| 3 Çiftlik | No | Egg chain STALLED (tractor deadlock + stuck path, and the van with it), Engelli Parkur show MANUAL |

Priorities: (1) ch3 egg tractors (a regression that breaks the main shop of the chapter, one-line deadlock fix plus path fix); (2) ch2 Fener Kafe cash and the three eateries/hall (new hire pads, prices follow the ch1 rule worker = 0.3-0.4 x zone price); (3) ch3 show auto-start; (4) ch1 duplicate auto-sale.
