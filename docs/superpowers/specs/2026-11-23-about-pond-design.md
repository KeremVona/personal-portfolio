# About Pond: Design

**Date:** 2026-11-23
**Status:** Approved by Kerem (2026-11-23) after two throwaway prototypes he clicked through and a builder check.
**Changes:** the image in `2026-11-21-about-design.md`. Its layout, text, pills, heading and reveal still apply.
**Prototypes:**
- `.superpowers/brainstorm/546-1795374022/content/about-aquarium.html`: option A of three.
- `.superpowers/brainstorm/184-1795451883/content/koi-motion.html`: the approved swimming (the "after" side).
- The prototype's art scripts (git-ignored, local only): `.superpowers/brainstorm/184-1795451883/scripts/`.
  - `pond-cut.cjs` cuts the fish, paints them out and cuts the lily pads.
  - `pond-body.cjs` makes the fish without fins.
  - Their output in the two content folders (`pond.webp`, `pads.webp`, `body-*.webp`) is the look Kerem approved by eye.

---

## 1. Intent

The About painting becomes a small living pond. The koi in Kerem's watercolour swim, and when someone clicks a fish it bolts away. Kerem saw this kind of detail on shwn.design and wants the same feeling: a micro-interaction that makes the page feel alive and hand-made. A recruiter who finds it should smile. It is a quiet surprise in the About section, not a game, and it must never get in the way of reading.

## 2. Decided by Kerem

- **Option A, "your painting comes alive".** The framed, tilted watercolour stays exactly where it is and looks the same. Its own koi swim in it and pass under the lily pads. Option B (a wide, soft-edged pond window closest to shwn.design) and option C (a side-on glass tank drawn in code) were not chosen.
- **Clicking a fish makes it swim away.** It darts out of the painting, then comes back a few seconds later.
- **"Realistic" means how the fish move.** Kerem approved the "after" side of the motion prototype after it fixed the bending:
  - **Stiff front:** the front quarter of the body stays straight along the heading. The side-to-side swing is tiny at the head and grows towards the tail.
  - **Limited bending:** the body follows the path its head has travelled, and is never bent more than about 50° while cruising, or about 110° during a startle turn.
  - **Glide and kick:** a few strong tail beats (about 0.6–1.3s), then a glide that slows down (about 1–2.6s), each fish at its own rhythm.
  - **Speed-limited turns:** fish turn only as tightly as their speed allows (a turning radius of about half a body length), so they swim in arcs.
  - **Startle:** a fast C-shaped turn away from the click (about 0.2s), then fast tail beats.
  - **Side fins:** spread and paddling when slow, folded back when fast.
  - **Shadow:** each fish casts a soft shadow on the pond floor, offset down and to the right.
- **The fish keep the painting's look.** They are cut from the watercolour itself, so they stay as soft as the painting. Sharper, newly painted fish were offered and set aside.

## 3. Behaviour

**At rest**
- Five koi (the painting's three distinct fish, two of them used twice at smaller sizes) wander the pond, keep apart, and steer away from the edges of the painted area. They stay inside the painted area and are hidden by its paper border.
- Lily pads are drawn above the fish, so fish swim under them.

**Clicking or tapping**
- **On a fish:** that fish bolts away from the point, leaves the painted area, waits 2–4s out of sight, then swims back in from the nearest edge.
- **On the water (or a fish):** a soft ripple spreads from the point, and fish within about a body length dart away but stay in the pond.
- A fish that is already fleeing or away ignores further clicks.
- Over a fish, the cursor is a pointer.

**Keyboard**
- The pond is focusable. Enter or Space startles every fish at once, from the centre. It has the site's normal focus ring.

**Pause**
- A small round pause/play button sits in a corner of the painting, so anyone can stop the motion. WCAG 2.2.2 requires this for motion that runs for more than 5 seconds next to other content.
- When paused, the fish stop where they are.

**Reduced motion, no WebGL or JavaScript failures**
- The current painting (`koi.webp`) shows exactly as it does today. Nothing moves and there is no pause button.
- The static painting is also what shows before the pond is ready.
- **Switching to the pond (Claude's call):** a short crossfade of about 0.4s. The fish start roughly where they are painted, but needn't match it exactly. Two of the five are reused, smaller sprites.

**Running cost**
- Nothing loads or runs until the section is near the screen.
- The animation runs only while the pond is on screen and the tab is visible.
- The canvas is sized to its box, with the pixel ratio capped at 2.

## 4. How it is built (Claude's calls)

- **Art:** `npm run art:about` gains the pond pieces, cut from the private `reference/671.png`, as committed WebP files in `src/assets/about/`. Port the prototype's scripts (above) and reproduce their output, which is the approved look. Kerem doesn't need to sign off the art again unless it visibly changes.
  - The painting with the fish painted out (the water filled with watercolour-like washes).
  - The lily pads as a separate layer with soft edges.
  - Each fish as a straight sprite, tail to head, with the painted side fins removed.
  - `koi.webp` stays as the static fallback.
- **Rendering: WebGL1.** Each fish is drawn as one smooth bent strip of triangles, the shadow as a blurred shape, then the pads on top.
  - The prototype's Canvas 2D slicing showed faint stripes where translucent parts overlap; a triangle strip has no overlaps.
  - If WebGL is unavailable or its context is lost, the static painting stays.
- **The tilt:** the canvas sits inside the existing tilted print, keeping its −1.6° rotation and shadow. Clicks are mapped through the rotation.
- **The hover lift is removed (Claude's call).** The print straightening and lifting on hover would fight with clicking fish.
- **Code layout:** the swimming model (steering, glide and kick, centreline, bend limits, modes) is pure TypeScript with unit tests. The renderer and the React component are separate from it.
- **Alt text:** the canvas is a labelled image, for example "Watercolour koi pond. The koi swim; click one and it darts away." It keeps the painting's description.

## 5. Quality bar

- **Lighthouse (mobile):** Performance ≥ 90; Accessibility, Best Practices and SEO ≥ 95. Today's score is 100.
- **Weight (Claude's call):** the pond images get the same responsive widths as the painting (480 / 720 / 960), so they stay as sharp as it.
  - That's about 110 KB extra at 720px (measured from the prototype at q≈76). It's more on high-resolution screens, where the full-size art is about 470 KB.
  - All of it loads lazily, along with a small script, only when the section is near the screen.
  - The hard limit is Lighthouse, not a byte count.
- **Smoothness:** no visible slice lines, stripes or gaps on the fish, at DPR 1, 2 and 3.
- **Speed:** a steady frame rate on a mid-range phone.
- **Layout:** no layout shift, and no horizontal scroll at 360px.
- **Touch:** scrolling over the pond still scrolls the page. A tap startles, and never selects text or zooms.
- **Tests (pure logic):** the bend limits hold (cruising and startle), fish stay inside the pond unless fleeing, a fleeing fish comes back, and the startle only affects fish within reach.
- **Real devices:** check on an iPhone and an Android phone before merging.

## 6. Not doing

- Fish newly painted for this.
- Light moving on the water, or the soft-edged window (option B).
- Sound, feeding, or fish that follow the cursor.
- Changing the About text, layout or pills.

## 7. Left to the builder

- File and component names, and how the WebGL renderer is organised.
- Exact constants within the ranges above (speeds, timings, fin and shadow strength), tuned to match the approved prototype.
- The pause button's exact look and corner.
- How the fish are painted out of the background, provided the result looks like part of the painting.
