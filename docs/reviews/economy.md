# Ekonomi Incelemesi (Economy Review)

Method: headless Playwright bot (real `update()` loop via `__game.sim`, greedy buy order, only the goal pad unlocked), plus formula analysis of `CFG`/`UPG`. Scripts: scratchpad `econ/bot.js`, `run.py`. Post-Sera bot play is weak (orchid hauling), so Sera/Minibus figures are partly extrapolated.

## Mevcut sayılar
| Item | Value |
|---|---|
| Ticket | bouquet 10, pot 25; avg want 2.21 (pot max 2); VIP every 6th x3; tip 25% x20% |
| Effective $/bouquet at counter | ~13.8 (pot ~34.7); van pays x3 (30 / 75 per item) |
| Upgrade bases (geo x1.25) | cap 40, speed 60, pack 70, cashSpd 150, carSpd 160, carCap 180, helpSpd 200 |
| Flat | cashier 120, carrier 250, bed 150, helper 300, Sera 500, Van 1500 (whole tree = 10,410) |
| Timings | grow 4s (orchid 8s), pack 1.0s x0.75/lvl (pot x1.4), cashier 1.2s x0.8/lvl, spawn 2.75s (1.0s if queue<3) |

## Zaman çizelgesi (baseline, good player)
First buy cap 26s; cashier 42; bed 63-85; helper 130; carrier 160-190; Sera 314-332 (~5.4 min); Van 437 (~7.3 min); entire tree bought by ~12.5 min, then money piles up unspent (12k at 20 min). Income: ~5/s (0-2 min), ~10-12/s (3-6 min), ~16/s (8-15 min), ~26/s with Van.

## Aykırılıklar / ölü bölgeler
- 15 of ~40 purchases come <10s apart (t=165-280); only floor is walk+pay (~7s). Cheap bases vs income.
- Van wait 105-126s; otherwise no >90s gaps. After ~12 min: nothing to buy (dead end).
- **Demand ceiling:** sales stay at ~0.36 customers/s (spawn 2.75s). Income flat at ~12/s from 3 to 7 min; speed/pack/cashSpd upgrades after ~200s add almost nothing. Input pile (24) and output pile (16) sit full.
- Pack upgrade also speeds pots (shared `packInterval`).

## Dejenere stratejiler / hatalar
1. **SOFTLOCK (critical):** with cashier hired, the player can only load the shelf (8 slots, shared). If shelf is full of bouquets and queue[0] wants a pot, nobody can serve; carrier idles (shelfFree=0), customers never leave, income = 0 forever. Reproduced: `q0=pot, shelf=8 bouquet, potOut=8`. Happens right after Sera.
2. Van x3 payout: 2.2x per item vs counter (pots 2.2x); optimal play sends only pots to van.
3. Pads sit on walking routes; accidental purchases happen (bot bought cashSpd3 before cashier).

## Darboğazlar
0-120s: player loop (harvest + walking). 120-300s: customer spawn/cashier. Packing is never binding after pack lvl 2; harvest is never binding once helper exists.

## Öncelikli değişiklikler
1. Code: fix softlock. Cap each product to 4 shelf slots, or let player hand-serve queue[0] when shelf lacks its product.
2. `CFG.spawnEvery` 2.75 -> **2.0**; `spawnShortEvery` 1.0 -> **0.8**.
3. Code: spawn interval x `0.88^S.lv.cashSpd` (demand scales with upgrades).
4. `geo` multiplier 1.25 -> **1.5**.
5. Bases: cap 40->**70**, speed 60->**100**, pack 70->**130**.
6. Bases: cashSpd 150->**300**, carSpd 160->**300**, carCap 180->**350**, helpSpd 200->**400**.
7. cashier 120->**150**, carrier 250->**450**, helper 300->**450**, bed 150->**300**.
8. Sera 500 -> **1800**.
9. Minibus 1500 -> **6000**.
10. Van payout `VAN.sum * 3` -> **x2**.
11. Code: pot interval independent of pack level (`packBase*1.4` fixed) or own upgrade.
12. Move upgrade pad rows off the harvest/pack paths, or add 0.5s dwell before paying.

## Doğrulama (changes 2-10 simulated)
First buy 28s; gaps 8-46s to 6 min (helper 76s); Sera ~10 min (with 1800: ~9.5); mid-game gaps 40-90s; tree not exhausted by 26 min; Van ~22-25 min if bought after core upgrades. Mid-game gaps (2-5 min) still short: add 2-3 more levels to late upgrades (`geo(...,7)`).
