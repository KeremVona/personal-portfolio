# Pond Water Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (Kerem's choice: Native). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the About pond read as water: shimmer, drifting light, ripples that bend, wakes behind fast fish.

**Architecture:** The renderer draws the pond floor, shadows, fins and fish into a framebuffer texture, then draws that texture through a water shader (displacement + light) to the canvas, then the lily pads and rings on top. The wake rule lives in `swim.ts` (pure, tested); `LivePond` turns it into ripples.

**Tech Stack:** WebGL1, React 19, TypeScript 7, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-27-pond-water-design.md`

## Global Constraints

- Water strengths: shimmer 4.5, light 0.11, ripple bend 7 (pond units / brightness).
- Wake: speed > 95, not `away`, a ring every 0.14s, size `min(0.4, 0.18 + (speed − 95) / 600)`, pace 2.2, at `fish.line[1]`.
- Up to 24 ripples; the shader fades shimmer and light over the outer 40 units of `POND_BOX`.
- Time passed to the shader wraps every 3600s.
- Fish, swimming, pads, click rings: unchanged. Gate before every commit.

## Review Focus

1. Resizing the canvas (rotating a phone) re-allocates the scene texture; the pond must not go black or stretched.
2. A lost WebGL context still falls back to the still painting.
3. Many fast fish at once (Enter on the pond) must not push the click ring out of the 24 kept ripples before it fades.
4. The paper border never wavers, lights up or shows fish.
5. Pausing, then resizing, redraws one correct still frame.

---

### Task 1: The wake rule

**Files:** Modify `src/sections/about/pond/swim.ts`; Test `src/sections/about/pond/swim.test.ts`

**Interfaces:**
- Produces: `WAKE_SPEED = 95`, `WAKE_GAP = 0.14`, `stepWake(fish: Fish, due: number, dt: number): { due: number; size: number }` (size 0 = no ring this frame).

- [ ] Write failing tests: slow fish → size 0; fast fish with `due > dt` → size 0 and `due` reduced by `dt`; fast fish once `due` runs out → size `0.18 + (speed − 95)/600` and `due === WAKE_GAP`; size capped at 0.4; an `away` fish → size 0.
- [ ] Run `npx vitest run src/sections/about/pond/swim.test.ts`. Expected: FAIL, `stepWake` not exported.
- [ ] Implement `stepWake`.
- [ ] Run again. Expected: PASS.

### Task 2: Renderer and loop clean-up

**Files:** Modify `renderer.ts`, `LivePond.tsx`; Test `src/sections/about/pond/renderer.test.ts` (new)

**Interfaces:**
- Consumes: `stepWake`, `WAKE_GAP` from Task 1.
- Produces: `Ripple { at; age; size?; pace? }`, `rippleDone(r: Ripple): boolean` (true once `age × pace > RIPPLE_LIFE`), `draw(fishes, ripples, time)`.

- [ ] Write failing tests for `rippleDone`: a click ripple at age 1.7 is live, at 1.9 done; a wake (pace 2.2) at age 0.9 is done.
- [ ] Run `npx vitest run src/sections/about/pond/renderer.test.ts`. Expected: FAIL until `rippleDone` matches (it exists from the spike; if it passes at once, check the test against a deliberately broken `rippleDone` once).
- [ ] Look up every uniform location once per program (a small cache), not per draw.
- [ ] Remove the SPIKE notes; `LivePond` uses `stepWake`, wraps time with `% 3600`, and keeps the click ripple when trimming to 24 (newest first is fine as long as review focus 3 holds).
- [ ] Gate passes.

### Task 3: Checks and docs

- [ ] Dev server: About section shows shimmer, light, crisp pads; console clean; day and night.
- [ ] Headless Chrome against `npm run preview`, phone size (390×844, DPR 3 capped to 2), CPU throttled 4×: count pond frames over 5s, with and without this change (main). Record both.
- [ ] Resize the window while running and while paused (review focus 1, 5).
- [ ] Update `docs/PROGRESS.md` (About pond notes) and spec pointer in CLAUDE.md if needed.
- [ ] Commit on `feat/pond-water`. Sonnet reviewer over `main..feat/pond-water`. Fix Critical/Important with a failing test first. Do not merge or push.
