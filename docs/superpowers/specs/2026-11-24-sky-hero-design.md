# Sky hero: the computer on a shy cloud

_Agreed with Kerem on 2026-11-24. Replaces the hero picture and the "the picture is still" rule from `2026-11-22-hero-still-design.md`. Follows the sky redesign (`2026-11-24-sky-redesign-design.md`)._

## 1. Why

The page now lives in the footer's world (one sky, the hilltop computer), but the hero is still a watercolour meadow. Kerem has a new picture in the footer's 3D style, `reference/647386481.png` (2730×1536): the same old computer sitting on a floating cloud with daisies and dandelions, a deep blue sky, a cloud bank and hills far below. With it, the top and the bottom of the page match.

He wants one touch of play: **the cloud with the computer is shy**. When the cursor comes near, it drifts a little away from it, then floats back.

## 2. Goals, non-goals, anti-goals

**Goals**

- The new picture is the hero, with the copy on the left of the sky.
- The cloud (computer, plants and all) sits **a little right of centre** on wide screens, so it doesn't crowd the copy on the left.
- The cloud shies away from a nearby cursor and drifts back.

**Non-goals**

- "Follow the cursor" behaviour (Kerem: shy only).
- Motion on phones and tablets, which have no hovering cursor.
- Copy changes. The text is still placeholder; the "Rooted / Blooming" headline stays until Kerem's copy pass.

**Anti-goals**

- A cut-out that looks cut out: hard edges, a halo, a hole or ghost left where the cloud was, a band of horizon dragged along with it.
- Motion that feels like it's tracking you, jittering, or moving far. It should feel like a cloud being nudged.
- Text that fails AA, or a hero that loads noticeably slower than today's.

## 3. The art

- `npm run art:hero` (`scripts/prepare-hero-art.mjs`, rewritten) makes everything from `reference/647386481.png`, which is git-ignored like all of `reference/`:
  1. **The cloud layer:** the floating cloud, computer, daisies and dandelion plants on transparency, cropped to their bounding box.
  2. **The background layer:** the picture with the cloud removed and the sky filled in. The sky there is a smooth gradient, so a row-by-row fill between the sky on either side works.
  3. **A portrait crop** of the background for phones, plus the cloud layer reused.
  4. `public/og-image.jpg` from the **original** picture (the cloud in its real place).
- **The cut-out is automatic; a throwaway spike on 2026-11-24 proved it works.**
  - **Alpha:** each pixel is scored on how far it is from that row's sky colour, by blueness and by distance.
  - **Solid core:** a fill of the main shape makes the inside fully solid, so the bluish shadows on the cloud's right side aren't see-through. Only a rim about 14px wide keeps soft edges.
  - **What the real script must also do:**
    - leave out the pale horizon sky under the cloud;
    - fill a wide enough margin in the background, so no trace of the computer's edge stays;
    - leave the loose dandelion seeds in the background, not in the cloud layer.
- The old `valley*.webp` files go.
- `reference/hero-background.png` is no longer used by any script.
- PROGRESS's image-rights item now names `647386481.png`.

## 4. Layout

- **Wide screens:**
  - The background covers the hero as now.
  - The cloud layer is placed on top with its centre **about 64% across the hero** (Kerem: "a little to the right"; the exact value is the builder's call between about 60% and 68%), at roughly its original height.
  - **The copy and the cloud never overlap; the cloud gives way (my call, from Kerem's reason for moving it: the text is on the left).**
    - The copy keeps a left column of at most about 50% of the hero's width; the headline's size and width are capped so it fits.
    - The cloud's left edge stays right of that column.
    - Its size is the smaller of "its share of the picture at the background's scale" and what fits between the copy column and the right edge, and below the nav, with some margin. So on short wide screens and on 4:3 screens it gets smaller or sits further right, never under the text.
    - Cream text never sits over the beige computer or the white cloud.
- **Phones and portrait screens** (the existing `narrow` variant):
  - A portrait crop of the background, with the cloud centred horizontally and in the lower part of the screen.
  - The copy sits above it in the sky, as the current narrow layout does.
- The bottom fade into the cream page stays, retuned if needed so the cloud bank dissolves softly.

## 5. Text on the new sky

- **The current ink text won't pass on mid-blue sky.** The upper-left sky is deep blue, which is good for cream text, and it lightens towards the horizon.
- **My call:** the hero copy turns **cream**, like the footer.
- **Contrast comes mainly from the art script (my call; the footer does the same, `art:footer` deepens its upper sky).** It deepens the sky in the background layer over the copy area (the left and upper part, fading smoothly), so cream passes where the paragraph and buttons sit. The deepening must look like natural sky, not a blotch.
- A light CSS shade behind the copy is allowed on top only if the graded sky alone falls short at some sizes.
- `og-image.jpg` comes from the original, ungraded picture.
- **Buttons:** the primary button becomes cream with ink text, and the secondary one gets a cream outline.
- **The nav over the hero** keeps its haze bar once scrolled. While transparent at the very top, it must also pass AA, with cream text or a shade, whichever is simpler.
- Measure AA on real pixels at the same 26 sizes as the existing hero check.

## 6. The shy cloud

- **Only with a hovering, precise pointer and motion allowed, and only in the wide layout:** `(hover: hover) and (pointer: fine)`, `prefers-reduced-motion: no-preference`, and not the `narrow` aspect ratio. In the narrow layout the cloud is large and the copy sits right above it, so it stays still there (my call). Everywhere else the cloud is simply still in its place.
- **The offset is clamped** so the pushed cloud never reaches the copy column or leaves the hero.
- **Reaction:**
  - When the cursor is within a radius of the cloud's centre, about 1.3× the cloud's half-width, the cloud's target offset points **away from the cursor**.
  - The offset is largest when the cursor is close: up to about **28px** at a 1440px-wide hero, scaling with the hero's size, plus a slight tilt away (up to about 2°).
  - Outside the radius, the target is zero.
- **Feel:** the cloud eases toward its target with a soft spring, so it never snaps. It floats back when the cursor leaves the radius or the window.
- **Cost:**
  - one `requestAnimationFrame` loop, running only while the cloud is away from rest or the pointer is near, and only while the hero is on screen;
  - the motion is a `translate`/`rotate` on the cloud layer;
  - no library.
- **Pure logic, tested:** the target offset as a function of cursor, centre, radius and maximum, and the spring step.
- **Untouched by the cloud:** the copy and the buttons. The cloud layer ignores clicks (`pointer-events: none`), so it never blocks a link.
- The dandelion seeds stay put. No idle bobbing (my call): with the cursor away, the hero is as still as before.

## 7. Rules that change (CLAUDE.md)

- "The picture is still: no swaying" becomes: **the hero picture is still except the cloud's shy reaction to a nearby cursor** (agreed with Kerem 2026-11-24). Its feel (radius, maximum offset, tilt, spring) needs his say-so to change.
- **The portrait crop** is re-agreed: the cloud centred.
- The hero AA note now refers to the cream text and its shade.

## 8. Quality bar

- **Contrast:** AA on real pixels at the 26 hero sizes.
- **No layout shift:** the cloud layer reserves its space with `width`/`height`.
- **Weight:** the hero's total image weight on a phone stays near today's (about 235 KB). The cloud layer adds its own WebP with alpha; the background loses detail, so it should shrink.
- **Cut-out check:** screenshots with the cloud at rest and pushed to its maximum offset in four directions show no halo, hole or band.
- **Behaviour checks** (headless Chrome against `npm run preview`):
  - a cursor near the cloud moves it away;
  - a cursor far away or a touch device leaves it at rest;
  - with reduced motion it never moves.
- **The gate**, and a fresh **Sonnet** reviewer before merging (Kerem: no Opus subagents).

## 9. Left to the builder

- The exact cloud position (60–68% across).
- The spring constants within "soft, no snap".
- The shade's exact shape behind the copy.
- How the art script finds the cloud's region (fixed bounds or detected).
- WebP qualities.
