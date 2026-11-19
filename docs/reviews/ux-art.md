# UX / Art Review: Çiçek Bahçesi

Screenshots: `/tmp/claude-0/-home-user--i-ekToplay-c-Oyunu/6b93401d-9332-57b8-8dd6-38b9980f733e/scratchpad/ux/` (`m-*` = 390x844, `d-*` = 1280x720). Playwright with swiftshader; no JS errors.

## Blocker
1. **First target is off-screen at 390x844** (`m-01-ftue-0s`). The player starts in the plaza and the hint says "Çiçekleri topla", but the garden and the 3D arrow are outside the frame. The only guidance is a small arrow inside the pill. Desktop (`d-01-ftue-0s`) shows the arrow, so this is a portrait-framing problem.

## Major
2. **Hint pill covers the capacity pill** (`m-02`, `m-03`, `m-05`, `m-07`). "0/10" and "4/15" are half hidden. Fix: move the hint below the HUD or shift it.
3. **Tutorial stops after step 6, so nothing guides new features** (`m-10`, `m-12`, `m-16`). TUT has 6 entries and then the hint and arrow are hidden. Workers, Sera, the pot workshop and the van get no arrow, no "new" pointer and no camera pan. The first purchase (120) is also not guided to the cheapest pad.
4. **Phone text is too small.** Pad names and prices are about 9-10px on screen, and "Sera 500" is the smallest on the map (`m-12`). The van "Yükle 0/8" label and the "Sıfırla" button are also tiny (`m-16`). The reset button sits in the thumb zone with no confirmation of what it does.
5. **Spend choices are cluttered from second 0** (`m-01`, `d-01`). About 8 pads are visible with 0 money, and Yeni Bahçe / Yardımcı (150 / 300) are shown before the 120 Kasiyer. DESIGN.md asks for one new thing at a time (progressive disclosure).
6. **Camera does not frame the new area.** On the Sera purchase the greenhouse stays off-screen on the right (`m-13`, `m-14`). The van pad sits on the bottom edge (`m-15`) and the van is clipped (`m-16`).

## Minor
7. Purchased-pad checkmarks cover the "Kapasite / Seviye 1" text (`m-09`, `m-10`, `d-14`). Maxed pads stay in the walking area and still read as buttons.
8. The overall look is consistent, but the grey locked slabs (`m-12`, `d-01` left) look like unfinished ground. The padlock is clipped at the screen edge (`d-01`).
9. Pot products sit on the grass outside the Sera as small flowerpots with no clear owner (`d-14`, bottom). They look like scattered decor or floating props. Pad icons are sometimes too small to tell apart (`m-12`).
10. Feedback gaps: unlocking Sera and the van shows no screen-level "new area" moment in the screenshots (the DESIGN.md pan and confetti are not visible). The money counter bumps, but there is no floating "+$" number and no visible rate indicator.
11. Queue and customers are readable. Speech bubbles are good but overlap the arrow and the "Çiçekçi" sign when the line is long (`m-07`).
12. The hint is not removed during the "Müşterilere sat" step even when the player holds nothing sellable. Players stuck on an earlier step see no arrow change (`m-08` to `m-12`).

## Prioritized fix list
1. In portrait, raise the camera distance and shift the framing so the garden, the player and the first target are in view at start. Scale `camMul` by `innerHeight/innerWidth`.
2. At FTUE start, hide all upgrade pads except the 120 Kasiyer. Reveal the rest by `S.money` or `S.tut` thresholds (progressive disclosure).
3. Move `#hint` to `top:92px` on screens narrower than 480px, or move the capacity pill below it. Drop the hint to 17px and keep `white-space:nowrap`.
4. Extend `TUT` with steps 6 to 9 (buy Kasiyer, buy Taşıyıcı, Sera, Minibüs). Each step gets the bouncing 3D arrow, and the hint appears only on first visibility of the target.
5. On unlock, pan the camera for 1.5s to the new area. Spawn confetti and a "Yeni!" billboard.
6. Increase pad label canvas resolution and font size by about 1.4x. Enforce a minimum of 14 CSS px on phone. Enlarge the Sera and van prices.
7. Place the Sera and van pads away from screen edges, or make the camera follow the player with a lookahead toward the nearest locked pad.
8. Hide or fade maxed pads (opacity 0.5, no icon crowding) and keep the "Seviye N" text readable (checkmark drawn at the corner, not centered).
9. Replace the grey locked slab with a decorated fenced field (grass tint, dirt patch) plus a lock icon. Keep the "KİLİTLİ" sign.
10. Spawn floating "+$N" text at the money pile and the register, and let the HUD pulse rate-up after each upgrade.
11. Keep the pots in a pot-pickup station rather than loose on the grass. Add a pickup marker or shelf for them.
12. Shrink the reset button into a settings gear with a confirm, placed at the top-right.
13. Clamp customer speech bubbles so they do not overlap the arrow or the sign (offset by queue index).
14. Give the van loading label and progress bar 1.5x size and a tick or pulse each time an item is loaded.
15. Run one phone-portrait regression pass (390x844 and 360x640) after these changes and re-check the hint/HUD overlap.
