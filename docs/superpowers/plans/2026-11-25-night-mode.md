# Night Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A night version of the whole page. It follows the device by default, a sun/moon button switches it, and the choice is remembered. It uses Kerem's night hero and footer art, a glowing TV, and option C in between.

**Architecture:**
- **The theme** is `data-theme` on `<html>`, set before first paint by an inline script. React reads it through a tiny external store (`useSyncExternalStore`).
- **CSS:** a `night` custom variant plus custom-property overrides under `[data-theme=night]`.
- **Art scripts** write the night layers next to the day ones. The hero and footer render only the current theme's pictures and crossfade on a switch.

**Tech Stack:** React 19, TypeScript 7 (strict), Tailwind v4, vite-imagetools, sharp (scripts), Vitest. Checks use headless Chrome over CDP against `npm run preview`.

**Spec:** `docs/superpowers/specs/2026-11-25-night-mode-design.md` (§8 holds the settled answers).

## Global Constraints

- **Theme values:** `data-theme="day" | "night"`.
- **Storage:** the `localStorage` key is `theme`. Every access sits in try/catch, and with no storage the site follows the device.
- **First view:** a saved choice, else `prefers-color-scheme`. With no saved choice, it follows the device live.
- **Switching:** colours change at once; pictures crossfade in about 400ms when loaded; instant with reduced motion.
- **Loading:** only the current theme's hero and footer pictures are requested on load.
- **The TV glow flicker:** a few percent of opacity, fewer than 3 changes per second, no strobe, off with reduced motion. Night only.
- **Unchanged:** the day look, the share image, the favicon, the koi painting, and the shy cloud's logic and constants.
- **Contrast:** AA in both themes on real pixels.
- **The gate before every commit.** Branch `feat/night-mode`. A **Sonnet** final reviewer. `reference/` is never committed.

## Review Focus

1. **A saved "day" on a dark device, and the reverse:** the first frame shows the saved theme. Pinned by the Task 1 CDP check (emulate `prefers-color-scheme`, preset `localStorage`, screenshot the first paint).
2. **Storage blocked** (`localStorage` throws): the page follows the device, and the button still switches for that visit. Pinned by a Task 1 unit test with a throwing storage.
3. **Switching while the cloud is pushed:** the night wrapper keeps the same translate, with no jump. Pinned by the Task 4 check.
4. **Picture requests on load:** night assets aren't requested in day, and the reverse. Pinned by the Task 4 network check.
5. **Night contrast in Experience with every card expanded, and in the panel:** pinned by rerunning the sky check and the windows check at night in Task 5.

---

### Task 1: Theme state, the button, no flash

**Files:**

- Create: `src/theme/themeLogic.ts` with `themeLogic.test.ts`, `src/theme/useTheme.ts`, `src/components/ThemeToggle.tsx`
- Modify: `index.html` (the inline script, `<meta name="theme-color">`), `src/components/Nav.tsx`

**Interfaces:**

- **`type Theme = 'day' | 'night'`**
- **`initialTheme(saved: string | null, prefersDark: boolean): Theme`**: a valid saved value wins; otherwise the device decides.
- **`readSaved(storage: Pick<Storage, 'getItem'> | null): string | null`** and **`save(storage, theme): void`**: never throw.
- **`useTheme(): { theme: Theme; toggle: () => void }`**
  - It reads `document.documentElement.dataset.theme` through `useSyncExternalStore`.
  - `toggle` writes the attribute, saves the choice and updates `<meta name="theme-color">` (`#FBF7EE` by day, `#081224` at night).
  - It also listens to the `prefers-color-scheme` change while nothing is saved.
- **The inline script** in `index.html` duplicates `initialTheme` in a few lines. It's plain JS, kept in step by a test that reads `index.html` and checks that the key `theme` and both values appear.

- [ ] **Step 1: Tests.**
  - `initialTheme`:
    - `('night', false)` gives night;
    - `('day', true)` gives day;
    - `(null, true)` gives night;
    - `('bogus', false)` gives day.
  - `readSaved` with a storage whose `getItem` throws gives null.
  - `save` with a throwing storage doesn't throw.
  - `index.html` contains `localStorage.getItem('theme')` and `prefers-color-scheme: dark`.

  Run them and see them fail.
- [ ] **Step 2: Implement** the logic, the hook, the script and the meta tag.
- [ ] **Step 3: `ThemeToggle`:**
  - a round 36px icon button: a `Moon` in day and a `Sun` at night;
  - `aria-label` "Switch to night" / "Switch to day";
  - colours follow the nav's `onSky` state (cream over the hero) and the solid state.

  It goes in `Nav` before the Résumé button, on all sizes.
- [ ] **Step 4: CDP check.**
  - Emulate dark with nothing saved: `data-theme` is `night` at the first `DOMContentLoaded`.
  - Saved `day` with dark emulated: day.
  - Clicking the button flips it, and a reload keeps the choice.
- [ ] **Step 5: Gate,** then **commit** `feat: theme state, switch button, no flash`.

### Task 2: Night art

**Files:**

- Modify: `scripts/prepare-hero-art.mjs`, `scripts/prepare-footer-art.mjs`
- Create, generated: `src/assets/hero/sky-night.webp`, `src/assets/hero/sky-night-portrait.webp`, `src/assets/hero/cloud-night.webp`, `src/assets/footer/sky-night.webp`, `src/assets/footer/sky-night-phone.webp`, `src/assets/footer/night.json` (`{ "top": "#rrggbb" }`, the night picture's top-row colour)

- [ ] **Step 1: Hero.**
  - After the day outputs, read `reference/hero-dark.png`.
  - The cloud layer is the night pixels within `box`, with the **day alpha**.
  - The background is refilled with the spike's technique, in `night-fill.mjs` in the session scratchpad, and copied into the script:
    - a blur with sigma 14;
    - a per-row interpolated base between the blurred columns just outside the refill reach;
    - star detail = picture − blur, from 1250px to the left on the same rows;
    - the same `FILL_GROW`/`FEATHER` distance weights as day.
  - No deepening at first.
  - The portrait crop is the same as day.
- [ ] **Step 2: Footer.** The same crops from `reference/footer-dark.png`. Deepen only if the Task 5 check fails. Write `night.json` with the averaged top row.
- [ ] **Step 3: Look at the results.** Placed-at-64% composites of the night hero, and the footer at a phone and a desktop crop. Expected: no seam, no fringe.
- [ ] **Step 4: Gate,** then **commit** `feat: night art for the hero and footer`.

### Task 3: Night colours and option C

**Files:**

- Modify: `src/index.css`, `src/theme/palette.test.ts`, and the section and components whose classes need a night variant: `SectionHeading`, `About`, `Nav`, `ProjectCard`, `ProjectPanel`, `MediaPlaceholder`, `Experience`, `ExperienceCard`, `labelStyle`.

**Interfaces:**

- **`@custom-variant night (&:where([data-theme=night], [data-theme=night] *));`**
- **Night tokens in `@theme`:**
  - `--color-night-1: #1a2c46`, `--color-night-2: #142540`, `--color-night-3: #0c1a33`;
  - `--color-night-footer`, from `night.json`, about `#060f21`;
  - `--color-night-card: #16284a`, `--color-night-window: #0f1d36`;
  - `--color-night-line: #c9dbeb`, `--color-night-link: #9cc2f0`.

  Adjust them so the palette test passes.

- [ ] **Step 1: Palette test.** Add these pairs and see them fail first:
  - `cream` on each night background;
  - `night-link` on `night-1`, `night-card` and `night-window`;
  - `night-line` on `night-window`.
- [ ] **Step 2: Tokens and gradients.**
  - Under `[data-theme=night]`, `.sky-about`, `.sky-projects` and `.sky-experience` get the night stops, meeting edge to edge and ending at `--color-night-footer`.
  - `html` and `body` turn dark at night, and so do `html.at-footer`, the hero's bottom fade and the `--color-footer-sky` override.
- [ ] **Step 3: Classes.** Option C:
  - **windows:** a navy body, pale lines, pinstripes, close box and title patch;
  - **window glow:** the shadow becomes `0 0 18px` in a bar colour per card (by index: cyan, magenta, yellow, green), with `0 0 4px` pale;
  - **the hover lift** keeps working;
  - **the panel** turns navy with cream text;
  - **timeline cards** are `night-card` with cream text; the dandelion dot gets `box-shadow: 0 0 10px #daac17`;
  - **text:** the eyebrows, tags and links use night tokens;
  - **nav:** the solid bar is `night-1` at 88% with cream text, and the phone menu is a navy card;
  - **focus rings** are cream or `night-link` everywhere at night.
- [ ] **Step 4: Gate,** then **commit** `feat: night colours, glowing windows, night timeline`.

### Task 4: Night pictures, crossfade, TV glow

**Files:**

- Modify: `src/sections/Hero.tsx`, `src/sections/Footer.tsx`, `src/sections/hero/useCloudPlacement.ts`, `src/sections/hero/useShyCloud.ts` (the hooks take the wrapper's ref; their types become `HTMLElement`), `src/index.css` (`.tv-glow`, `.theme-fade`)
- Create: `src/components/ThemedPicture.tsx`

**Interfaces:**

- **`ThemedPicture({ day, night, ...imgProps })`** renders the current theme's `<img>`/`<picture>`.
  - On a switch it keeps the previous one on top and fades it out once the new one has fired `load` (opacity transition, 400ms; none with reduced motion), then removes it.
  - The hero background, the cloud image and the footer picture use it.
- **The cloud wrapper:** a `div` with `ref={cloudRef}`, positioned and moved by the hooks, `aspect-ratio` from `CLOUD_BOX`. It holds the `ThemedPicture` cloud (`w-full h-auto`) and, at night only, a `span.tv-glow`.
- **`.tv-glow`:**
  - absolute, centred at `left: 47%; top: 22%`, size about 70% × 55% of the wrapper, translated −50%;
  - its background is a radial-gradient in the bar colours at low alpha, fading to transparent;
  - `mix-blend-mode: screen`, peak opacity about 0.5;
  - the flicker is `@keyframes tv-flicker` over 6s with irregular stops between 0.88 and 1, inside `prefers-reduced-motion: no-preference` only.

- [ ] **Step 1: Implement** `ThemedPicture`, the wrapper and the glow, and switch the hooks to the wrapper.
- [ ] **Step 2: CDP checks.**
  - **Network:** with day emulated, no request URL contains `-night`. With night emulated, no day hero, cloud or footer request.
  - **Switch while pushed:** the wrapper's `translate` stays the same before and after the switch.
  - **Flicker:** the computed opacity samples of `.tv-glow` over 3s stay between 0.85 and 1, and with reduced motion the animation is `none`.
  - Rerun `shy-check.mjs` at night.
- [ ] **Step 3: Gate,** then **commit** `feat: night pictures with a crossfade, and the TV glow`.

### Task 5: Checks in both themes, docs, review, merge

- [ ] **Step 1: Rerun at night** (emulating `prefers-color-scheme: dark`):
  - `hero-check.mjs` (26 sizes);
  - `sky-check.mjs`, collapsed and expanded;
  - `timeline-check.mjs`, `windows-check.mjs`, `focus-check.mjs`, `fix-check.mjs`.

  Expected: 0 failures. If the night hero copy fails, add a gentle deepening step to the night background in `art:hero`, then rerun.
- [ ] **Step 2: Rerun the same checks by day.** Expected: 0 failures (no regressions).
- [ ] **Step 3: Docs.**
  - `CLAUDE.md`: the look line, the night mode, the art script notes, and the theme files under "Where things live".
  - `docs/PROGRESS.md`: the entry, and an open item for Kerem to judge the koi painting at night and the starfield.

  Then the gate and **commit** `docs: record night mode`.
- [ ] **Step 4: Review.** A fresh **Sonnet** reviewer on `git diff main...feat/night-mode` against the spec and this Review Focus. Fix Critical and Important findings test-first.
- [ ] **Step 5: Merge** into `main` with `--no-ff` and run the gate. Confirm no `reference/` or PNG is tracked. Then `git push origin refs/heads/main:refs/heads/main`.
