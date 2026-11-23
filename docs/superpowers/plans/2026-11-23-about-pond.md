# About Pond Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the About koi painting into a living pond. The painting's own koi swim with the approved motion, and a clicked fish bolts away and comes back.

**Architecture:**
- **Art:** a script cuts the pond pieces from the private painting into committed WebP files.
- **Swimming model:** a pure, tested TypeScript module runs the fish in painting coordinates (1200×1599).
- **Drawing:** a WebGL1 renderer draws the background, the shadows, the fish as bent triangle strips, the fins, the pads and the ripples.
- **Loading:** a lazily loaded React component puts the canvas over the existing `<img>` and crossfades to it. The `<img>` stays as the fallback.

**Tech Stack:** React 19, TypeScript 7, WebGL1, vite-imagetools, sharp (art script), Vitest. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-23-about-pond-design.md`

**Reference implementation:** the approved motion is the `Koi` class (the "after" side) in `.superpowers/brainstorm/184-1795451883/content/koi-motion.html`. The art is from `.superpowers/brainstorm/184-1795451883/scripts/pond-cut.cjs` and `pond-body.cjs`. Port them; don't redesign them.

## Global Constraints

**Pond coordinates.** Pond units are the painting's pixels: the view is `{x:0, y:0, w:1200, h:1599}`, and fish stay in `POND_BOX = {x:72, y:72, w:1056, h:1454}` unless leaving.

**Fish.** Five, as `[x, y, heading, length, sprite]`:
- `[555,1010,0.6,360,0]`
- `[520,1215,0.35,385,1]`
- `[750,1140,-0.9,350,2]`
- `[670,670,2.5,250,0]`
- `[800,480,0.8,220,1]`

**Swimming** (from the prototype):
- **Speed:** cruise 60–85 pond units/s, with drag 0.85.
- **Rhythm:** kick 0.6–1.3s, then glide 1–2.6s.
- **Thrust:** 1 when kicking, 0 when gliding, 9 when leaving, 5 after a nearby startle, 1.6 when returning.
- **Turning:** at most `min(2.4, speed / (0.55 × length))` rad/s, ×0.6 while gliding. A startle turn (C-start) allows 11 rad/s for 0.2s.
- **Body:**
  - The front is rigid by `smoothstep(0.16, 0.5, u)`.
  - The total bend is ≤ 0.85 rad cruising and ≤ 1.9 rad within 0.5s of a startle.
  - The swing is `amp × (0.1 + 0.9u²)`, with `amp = L × (0.01 + 0.045·min(thrust,1) + 0.012·min(max(thrust−1,0),4))`.

**Clicks:**
- **Hit:** within 0.16 × length of the centreline.
- **Startle reach:** 330 pond units.
- **Away:** 2–4s out of sight, then the fish returns at speed 110.
- **Ripple:** lasts 1.8s.
- **Keyboard:** Enter or Space startles every fish from (600, 800).

**Look:**
- **Shadow:** offset (0.07L, 0.13L), 50% `rgb(12 32 44)`, blur ≈ 0.04L.
- **Fins:** at u = 0.27, spread when slow and folded when fast (`smoothstep(70, 260, speed)`), with a pale peach gradient, as in the prototype.

**Rendering and running:**
- WebGL1, DPR capped at 2, `dt` capped at 0.05s.
- Runs only while on screen, with the tab visible and not paused.
- **Static fallback:** today's `<img>` (`koi.webp`). It stays for reduced motion, no WebGL, context loss, failed loads, and before the pond is ready.
- **Crossfade:** 0.4s between the `<img>` and the canvas.
- **Print:** keeps the −1.6° tilt and its shadow. The hover lift is removed.
- **Pause:** a pause/play button inside the print. While paused, clicks do nothing.

**Performance:**
- Lighthouse mobile: Performance ≥ 90; Accessibility, Best Practices and SEO ≥ 95.
- No layout shift, and no horizontal scroll at 360px.
- Pond images use the painting's widths: 480 / 720 / 960.

**Gate before each commit:** `npm test && npm run typecheck && npm run lint && npm run format:check && npm run build`. Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Scroll over the pond on a phone:** a swipe scrolls the page and startles nothing; only a tap (a `click`) does. The canvas keeps `touch-action: manipulation`.
2. **Coming back after minutes away** (a hidden tab or the section scrolled off): fish continue from where they were and don't jump. `dt` is capped. Pause survives scrolling away and back.
3. **Resizing or rotating the device while it runs:** the canvas re-sizes and clicks still land on the fish under the finger. Mapping goes through the tilt, from the box centre.
4. **WebGL context lost, or `prefers-reduced-motion` switched on, while it runs:** it fades back to the still painting and stops. It doesn't freeze half-drawn.
5. **A click while paused or on a fish that is already away:** nothing happens. There is no ripple and no state change.

Items 2 and 3 have pure tests in Task 2. Items 1, 4 and 5 are scripted headless checks in Task 4.

---

### Task 1: Pond art

**Files:**
- Modify: `scripts/prepare-about-art.mjs`
- Create: `src/assets/about/pond.webp`, `pads.webp`, `koi-body-{0,1,2}.webp`, `koi-shadow-{0,1,2}.webp`

**Interfaces:**
- **Produces:**
  - `pond.webp` (1200×1599, fish painted out, opaque).
  - `pads.webp` (1200×1599, lily pads with alpha).
  - `koi-body-N.webp`: a straight fish, tail at x=0 and head at the right, rows = lateral offset, without painted side fins.
  - `koi-shadow-N.webp`: the same size as `koi-body-N`, a dark blurred silhouette.
  - `koi.webp` is unchanged.

- [ ] **Step 1: Port the prototype cut into `prepare-about-art.mjs`.** As ESM, reading `reference/671.png` resized to 1200 wide, as `koi.webp` is now.
  - Keep `FISH`, `HALF`, `PADS`, the fill-and-dab paint-over and the body-only `PROFILE` from `pond-body.cjs`.
  - Write only fish 0–2.
  - Masters at WebP q≈85.
- [ ] **Step 2: Run `npm run art:about`.** Expected: 8 new files.
  - Compare `pond.webp`, `pads.webp` and `koi-body-{0,1,2}.webp` with the prototype's files in `.superpowers/brainstorm/184-1795451883/content/`.
  - Expected: a mean absolute difference under 3 per channel. View them side by side; the look is the approved one.
- [ ] **Step 3: Run the gate and commit** with the message `feat: pond art for the About painting`.

### Task 2: Swimming model

**Files:**
- Create: `src/sections/about/pond/swim.ts`, `src/sections/about/pond/swim.test.ts`

**Interfaces:**
- **Produces:**
  ```ts
  export interface Point { x: number; y: number }
  export interface Box { x: number; y: number; w: number; h: number }
  export type Mode = 'swim' | 'leave' | 'away' | 'return'
  export interface Fish { /* port of the prototype Koi state */ sprite: number; length: number; head: Point; heading: number; speed: number; thrust: number; phase: number; mode: Mode; line: Point[] /* 49 points, head → tail */ }
  export const POND_VIEW: Box, POND_BOX: Box, FISH_START: readonly [number, number, number, number, number][]
  export function createFish(start: (typeof FISH_START)[number], random?: () => number): Fish
  export function stepFish(fish: Fish, dt: number, time: number, box: Box, all: readonly Fish[], random?: () => number): void
  export function hitFish(fishes: readonly Fish[], at: Point): Fish | undefined   // topmost, mode ≠ away
  export function poke(fishes: readonly Fish[], at: Point, everyone?: boolean, random?: () => number): void  // startle rules from Global Constraints
  export function bendAngle(line: readonly Point[]): number   // head-direction vs tail-direction angle, radians
  export function frameDelta(now: number, last: number | null): number  // seconds, ≤ 0.05
  export function toPond(client: Point, centre: Point, size: { w: number; h: number }, tiltDeg: number, view?: Box): Point
  ```
  - `random` is injectable so tests are deterministic.
  - `toPond` undoes the tilt around the box centre. `size` is the canvas's untransformed CSS size (`offsetWidth`/`offsetHeight`).

- [ ] **Step 1: Write the failing tests in `swim.test.ts`.** Use a seeded `random`.
  - `bend stays within limits`: run 5 fish for 60s at dt 1/60, plus a startle every 3s. Assert `bendAngle(f.line) ≤ 0.85 + swing` while cruising and `≤ 1.9 + swing` within 0.5s of a startle, where swing is the wave's share (compute the limit with `amp = 0` or allow 0.35 rad).
  - `fish stay in the pond`: no startles, 120s. Every head stays inside `POND_BOX` inset by −10.
  - `a clicked fish leaves and comes back`: `poke(fishes, fish.line[10])`. Modes go `leave` → `away` within 4s → `return` → `swim` within 12s.
  - `only fish within reach dart`: a fish whose centreline is > 330 away keeps `mode === 'swim'` and its thrust unchanged.
  - `a fish that is away ignores clicks`: `hitFish` skips it, and `poke` at its position doesn't change it.
  - `frameDelta caps long gaps`: `frameDelta(10_000, 1_000) === 0.05`, `frameDelta(1016, 1000) ≈ 0.016`, and `frameDelta(5, null) === 1/60`.
  - `toPond undoes the tilt`:
    - The centre maps to (600, 799.5).
    - A point 100px right of centre on a 420×560 box tilted −1.6° maps to `x ≈ 600 + 100·cos(1.6°)·(1200/420)` and `y ≈ 799.5 + 100·sin(1.6°)·(1599/560)`, each within 0.5.
- [ ] **Step 2: Run `npx vitest run src/sections/about`.** Expected: FAIL (the module is missing).
- [ ] **Step 3: Implement `swim.ts`** by porting the prototype's `Koi`, `steer`, `comeBack` and `centreline`, with the constants from Global Constraints. There is no DOM in this file.
- [ ] **Step 4: Run `npx vitest run`.** Expected: all tests pass.
- [ ] **Step 5: Run the gate and commit** with the message `feat: koi swimming model`.

### Task 3: WebGL renderer

**Files:**
- Create: `src/sections/about/pond/renderer.ts`

**Interfaces:**
- **Consumes:** `Fish`, `Point`, `POND_VIEW` from Task 2.
- **Produces:**
  ```ts
  export interface PondArt { pond: HTMLImageElement; pads: HTMLImageElement; bodies: HTMLImageElement[]; shadows: HTMLImageElement[] }
  export interface Ripple { at: Point; age: number }
  export interface PondRenderer { resize(cssWidth: number, cssHeight: number, dpr: number): void; draw(fishes: readonly Fish[], ripples: readonly Ripple[]): void; destroy(): void }
  export function createPondRenderer(canvas: HTMLCanvasElement, art: PondArt, onLost: () => void): PondRenderer | null  // null if WebGL1 is unavailable or a shader fails
  ```

- [ ] **Step 1: Implement the renderer.** It maps pond units to clip space with `POND_VIEW` and draws, in order:
  1. The pond quad.
  2. Each fish's shadow: the `shadows[sprite]` texture on a triangle strip built from `fish.line` at the shadow offset.
  3. The fins.
  4. Each fish's body: `bodies[sprite]` on a triangle strip. Each of the 49 points gives two vertices at ±half the sprite height along the local normal, with u = 1 − i/48.
  5. The pads quad.
  6. The ripples: three rings each, as in the prototype.
  - Everything outside `POND_BOX` is scissored or clipped, except the pads and pond, which are full size.
  - Alpha is premultiplied (`UNPACK_PREMULTIPLY_ALPHA_WEBGL`).
  - `onLost` fires on `webglcontextlost`.
- [ ] **Step 2: Check it in headless Chrome over CDP** with a temporary harness page in the scratchpad. It mounts the renderer with the art and a fixed frame of five fish bent to the cruise limit.
  - Screenshot at DPR 1, 2 and 3, and zoom on a tail.
  - Expected: no stripes, seams or gaps along the bodies, and the look matches the prototype's "after" frame.
- [ ] **Step 3: Run the gate and commit** with the message `feat: WebGL pond renderer`.

### Task 4: The living pond in About

**Files:**
- Create: `src/sections/about/pond/LivePond.tsx`, `src/sections/about/PondLayer.tsx`
- Modify: `src/sections/About.tsx`, `src/content/about.ts` (the `pondLabel` string)

**Interfaces:**
- **Consumes:** Tasks 2 and 3.
- **Produces:**
  - `PondLayer` (no props), rendered inside the print's wrapper over the `<img>`. It decides whether and when to load `LivePond` with `lazy(() => import('./pond/LivePond'))`.
  - `LivePond({ onReady, onFail })`: the canvas, the loop and the pause button.

- [ ] **Step 1: Update `About.tsx`.**
  - The print's wrapper becomes `relative` and keeps the tilt and shadow.
  - Remove the hover straighten-and-lift classes.
  - Render `<PondLayer />` after the `<img>`.
- [ ] **Step 2: Build `PondLayer`.** It mounts `LivePond` only when all of these hold:
  - an IntersectionObserver with `rootMargin: '600px'` has fired;
  - `prefers-reduced-motion` is not `reduce`;
  - `!!document.createElement('canvas').getContext('webgl')`.
  - When `LivePond` calls `onReady`, the canvas fades in over 0.4s (the `<img>` stays underneath).
  - When it calls `onFail` (context lost, art load error, or reduced motion switched on later), the canvas fades out and unmounts.
- [ ] **Step 3: Build `LivePond`.**
  - **Art:** load the pond art variants through vite-imagetools at `?w=480;720;960&format=webp&quality=76&as=metadata` for `pond` and `pads`, and `?w=260;390&…` for bodies and shadows. Pick the smallest width ≥ CSS width × min(DPR, 2).
  - **Canvas:** fills the print box. `role="img"`, `aria-label={ABOUT.pondLabel}` ("Watercolour koi pond. The koi swim; click one and it darts away."), `tabIndex={0}`, `touch-action: manipulation`.
  - **Clicks:** `click` → `poke(fishes, toPond(…))` plus a ripple, ignored while paused.
  - **Keyboard:** Enter or Space → `poke(fishes, {x:600, y:800}, true)`.
  - **Cursor:** `pointermove` sets the pointer cursor over a fish, for `pointerType === 'mouse'` only.
  - **Running:** the loop runs only while intersecting, `!document.hidden` and not paused, using `frameDelta`. A `ResizeObserver` calls `renderer.resize`.
  - **Pause button:** a 36px round button in the print's bottom-right corner, inside the paper border. `aria-pressed`, with the label "Pause the pond" / "Play the pond". The site's focus ring.
- [ ] **Step 4: Check headlessly** (CDP against `npm run build && npm run preview`), with a check for each Review Focus item:
  1. A touch swipe over the pond scrolls the page with no fish mode change; a tap makes the hit fish `leave`.
  2. Hide the page for 60s with `Page.setWebLifecycleState` frozen, or scroll the pond away and back: no head moves more than 0.05s × 900 units in one frame. Pause stays on.
  3. Resize 1280→390 wide while running: a click on a fish's centreline still hits it.
  4. Force context loss (`WEBGL_lose_context`), and emulate reduced motion during the run: the canvas fades out and the `<img>` is what's visible.
  5. A click while paused, and a click on an away fish's last position: no state change and no ripple.
  - **Also check:**
    - the crossfade has no layout shift (CLS 0);
    - no horizontal scroll at 360px;
    - the keyboard startle and the focus ring work;
    - the frame rate at a 4× CPU throttle is ≥ 50fps.
- [ ] **Step 5: Run the gate and commit** with the message `feat: living koi pond in About`.

### Task 5: Final checks, docs and review

**Files:**
- Modify: `docs/PROGRESS.md`, `CLAUDE.md`, `docs/superpowers/specs/2026-11-21-about-design.md` (a note that the image is now the pond)

- [ ] **Step 1: Run Lighthouse on mobile** three times. Expected: Performance ≥ 90; the other three ≥ 95; CLS 0. Note the bytes the pond adds once scrolled to.
- [ ] **Step 2: Update the docs.**
  - **PROGRESS:** About notes on the pond; deferred items. Remove the now-fixed "print hover flicker" item.
  - **CLAUDE.md:** what `art:about` makes; `src/sections/about/` in "Where things live"; the pond's agreed motion as one of the rules that need Kerem's say-so.
- [ ] **Step 3: Get the final review from a fresh Opus reviewer** on the branch. Fix what it finds.
- [ ] **Step 4: Ask Kerem to try it on an iPhone and an Android phone** (the spec's quality bar). Use `npm run dev -- --host` on the same Wi-Fi, or a pushed preview if he prefers.
- [ ] **Step 5: Run the gate, commit and merge to `main`** with the message `docs: record the About pond`.
