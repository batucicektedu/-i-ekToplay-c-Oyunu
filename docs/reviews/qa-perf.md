# QA + Perf Review: index.html (Three.js r128)

Method: Playwright, headless Chromium with SwiftShader, `window.__game`, `sim()`, a scripted bot, a 1500-step pad fuzz and 20 simulated minutes. index.html was not modified. No console errors in any run.

## Passed
Fresh loop, all 25 upgrades to max, 1500-step pad fuzz with everything unlocked (zero cap/`pend`/NaN violations), bounds and fences at max speed, localStorage throwing, 8 corrupt saves, resize 100x40 to 2000x500, mouse and 2-finger touch joystick. Heap flat over 20 sim-minutes (20.8 to 21.4 MB, 0.03 ms per update).

## Bugs
**B1 HIGH: permanent queue soft-lock (sera + cashier).**
- Repro: unlock sera, cashier and carrier, leave the player idle, wait about 30 s.
- Result: the 8-slot shared shelf (L1132) fills with bouquets. The head customer wants a pot. The cashier serves only the matching product (L1602). The player can add to the shelf only if `shelfFree()>0` (L1992-1994). The carrier keeps loading bouquets (L1611/1620). `sold` stuck at 7 for 300 s, queue `p0/2,b0/4,...`. Customers never leave.
- Fix: per-product shelf slots (4+4), or let the counter pad serve from the player's stack when the shelf is full. Have the carrier load `queue[0].prod`. Add customer patience.

**B2 MED: pots starve.** 40% of customers want a pot (L1649), but pots exist only if the player hand-harvests orchids (nohelp bed, L1171). The carrier drains the bouquet pile first (L1620). The first pot customer stalls the queue.

**B3 MED: reload loses money.** Only money, `lv` and `tut` are saved (L122-134).
- Reload mid van trip: the payout is gone and so is the cargo (8 bouquets lost 240; L1339/1395).
- Uncollected bills in moneyPile and vanPile are gone.
- A partial pad payment is deducted but `u.paid` is not saved (measured: 21 lost).
- Fix: save `VAN.sum`/state, pile bill counts and `paid`, or bank pile value into money on save.

**B4 LOW:** Saves run on `beforeunload` plus a 2 s timer (L1874). iOS often skips that event. Add `pagehide` and `visibilitychange`.

**B5 LOW:** `blur` clears keys but not the joystick (L1834). Repro: drag, dispatch `blur`, and the player keeps walking.

**B6 LOW: geometry leak.** Dress customers create `new CylinderGeometry` (L745) and `removeCustomer` (L1701) never disposes it. Geometries grew 97 to 114 over 500 customers. Cache one shared geometry.

**B7 LOW, unverified race:** Reset guards only `beforeunload` (L1871-1874). The timer save or `purchase()` could rewrite the save before reload. Make `writeSave` a no-op when `__resetting`.

## Perf (renderer.info, 390x780, DPR 1)
| State | Main-pass calls | Main-pass tris | With shadow pass |
|---|---|---|---|
| Start | 362 | 77k | 648 calls / 118k tris |
| Fully unlocked | 639 | 396k | 996 calls / 456k tris |

- Item meshes dominate triangles: bouquet 7,312, flower item 3,696, bed flower about 1.5k. Output pile (16) plus shelf (8) is about 175k. The 24-flower input pile is about 89k. The van load (8) adds about 58k.
- Each character has about 25 meshes, so 12 characters is about 300 calls.
- GPU draw calls and fill rate are the phone risk, not JS.

## Ranked optimizations (estimates)
1. **Low-poly item LOD: about -250k tris.** In `bouquetGeo`/`itemGeo`/`potGeo` (L640-700), use 4x3 spheres or cones for petals. Target 1.2k tris per bouquet and 500 per flower. Keep hi-res only on the player's back.
2. **Merge static world: about -250 of 362 calls at start.** Fences, hedges, trees, bushes, decor, tables and signs go into vertex-colored meshes per zone with `mergeParts` (L576). Merge zone 2/3 content on unlock.
3. **Shadows: -280 to -360 calls, -40 to -60k tris.** Set `castShadow=false` on items, bed flowers, small props and small character parts. Switch `PCFSoftShadowMap` to `PCFShadowMap`, or 512 on low-end.
4. **Instancing.** One `InstancedMesh` per geometry per pile (output, shelf, van, input), with matrices set in `Stack.update`. Bed flowers go from 120 meshes to about 4. Bills (shared geometry and material) become one InstancedMesh of 120.
5. **Pixel ratio cap 1.5** (L172, L188). About -44% fill on DPR 3 phones. Add an adaptive resolution step on frame-time EMA.
6. **Characters.** Merge static torso, hair and leg parts. Reduce `G.sph` from 16x12 to 10x8 (352 to 144 tris, about -20k).
7. **GC hot spots.** `popText` (L551) allocates a canvas, texture and material per pop, so pool 8. `outSources()` and `.some` closures allocate every frame (L1611). `updateTutorial` creates a `new Vector3` per frame. `updateParticles` loops 460 particles and flags 5 attributes every frame, so skip when none are active.
