# Experience Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Experience placeholder with layout C: a wide featured card with a numbers column, then the other roles as cards in a two-column grid, each with "Show N more" highlights.

**Architecture:**
- Roles stay in typed content, which gains `featured` and `stats`.
- Pure helpers (date range, place label, highlight split, ordering) are unit-tested.
- One `ExperienceCard` component renders both the featured and the regular layout.
- No new dependencies, images or decoration.

**Tech Stack:** what's already there (React 19, TS 7, Tailwind v4, Vitest).

**Spec:** `docs/superpowers/specs/2026-11-21-experience-design.md`

## Global Constraints

- **Grid:** 1 column below `md`; `md:grid-cols-2` with the featured card at `md:col-span-2`; `items-start`; gap ~20px.
- **Card:** white, `rounded-card`, `shadow-card`, padding ~22px, no hover lift.
- **Card contents:**
  - **Top row:** the `h3` company name, linked to `companyUrl` (`target="_blank" rel="noreferrer"`), Inter Tight 600, ~18px. The dates on the right, `text-ink/70`, ~12.5px.
  - **Role:** ~14px, `ink-soft`.
  - **Meta pills:** outlined (`border-ink/14`, `text-ink/70`, ~11.5px). "Now" is `bg-meadow-tint text-meadow-deep`.
  - **Highlights:** first 2 shown. A `<button aria-expanded aria-controls>` reads "Show N more" / "Show less" and reveals the rest in place, with no height animation.
  - **Tags:** `bg-meadow-tint text-meadow-deep`, small; all shown.
- **Featured card, ≥ md:** `grid-cols-[1fr_190px]` with a left hairline on the numbers column (`border-ink/10`). Each value is Inter Tight 700, ~30px, `meadow-deep`; each label ~12px, `ink-soft`. On phones the numbers form a two-up row under a top hairline.
- **Dates:** "Jul – Aug 2026", "Dec 2025 – Feb 2026", "Oct 2026 – Present". Uses an en dash (U+2013) with spaces and short month names.
- **Place label:** city only (the text before the first comma), then " · " and the work mode. A location of "Remote" gives "Remote".
- **Reveal:** each card in `Reveal` with `delay = index * 0.08`, the featured card first.
- **Copy:** the title is "Where I've worked" (placeholder).
- **Gate before each commit:** `npm test && npm run typecheck && npm run lint && npm run format:check && npm run build`

## Review Focus

1. **"Show more" in a two-column row:** expanding one card must not stretch or shift its neighbour (`items-start`). Collapsing returns to exactly 2 items.
2. **Keyboard and screen readers:** Tab reaches the company links and "Show more" buttons with a visible ring. The button's `aria-expanded` flips, and `aria-controls` points at an id that exists.
3. **At 360px:** no horizontal scroll. A long company name and the dates wrap without overlapping.
4. **No featured role, or one without stats:** the grid still renders, and no empty numbers column appears.
5. **AA contrast** for the dates and outlined pills on white.

Items 1–3 and 5 are checked in the Browser pane in Task 2 (Vitest covers pure logic only). Item 4 is covered by `orderRoles` and the content-sanity tests in Task 1, plus a render guard in Task 2.

---

### Task 1: Content model and pure helpers

**Files:**
- Modify: `src/content/types.ts`, `src/content/experience.ts`, `src/content/format.ts`
- Create: `src/sections/experience/experienceLogic.ts`, `src/sections/experience/experienceLogic.test.ts`
- Modify: `src/content/format.test.ts`

**Interfaces:**
- Produces:
  ```ts
  // types.ts: ExperienceItem gains
  featured?: boolean
  stats?: { value: string; label: string }[]
  // format.ts
  export function formatDateRange(start: string, end: string | null): string
  // experienceLogic.ts
  export function placeLabel(item: Pick<ExperienceItem, 'location' | 'workMode'>): string
  export function splitHighlights(highlights: string[], visible?: number): { shown: string[]; hidden: string[] }  // visible defaults to 2
  export function orderRoles(items: ExperienceItem[]): ExperienceItem[]  // featured first, the rest in content order
  ```

- [ ] **Step 1: Write the failing tests.**
  - **`format.test.ts`:**
    - `formatDateRange('2026-07', '2026-08')` → `'Jul – Aug 2026'`
    - `('2025-12', '2026-02')` → `'Dec 2025 – Feb 2026'`
    - `('2026-10', null)` → `'Oct 2026 – Present'`
    - `('2025-04', '2025-04')` → `'Apr 2025'`
  - **`experienceLogic.test.ts`:**
    - `placeLabel`:
      - `{ location: 'Istanbul, Türkiye', workMode: 'Onsite' }` → `'Istanbul · Onsite'`
      - `{ location: 'Remote', workMode: 'Remote' }` → `'Remote'`
      - `{ location: 'Berlin', workMode: 'Hybrid' }` → `'Berlin · Hybrid'`
    - `splitHighlights`:
      - 4 items → 2 shown, 2 hidden
      - 2 items → 2 shown, 0 hidden
      - `visible` = 1 respected
    - `orderRoles`:
      - the featured item moves first and the others keep their order
      - with none featured, the order is unchanged
    - Content sanity over `EXPERIENCE`:
      - at most one `featured`;
      - a featured role has at least one stat;
      - the featured role is Dijital Varlıklar with stats `~2.5M` and `13+`.
- [ ] **Step 2: Run `npx vitest run`.** Expected: the new tests FAIL (missing exports and fields).
- [ ] **Step 3: Implement.**
  - Add the fields in `types.ts`.
  - Mark Dijital Varlıklar `featured: true` with `stats: [{ value: '~2.5M', label: 'monthly visits' }, { value: '13+', label: 'news portals tracked' }]`.
  - Add `formatDateRange` to `format.ts`, reusing `MONTHS` with `.slice(0, 3)`.
  - Add the helpers in `experienceLogic.ts`.
- [ ] **Step 4: Run `npx vitest run`.** Expected: all tests pass.
- [ ] **Step 5: Run the gate and commit** with the message `feat: experience content model and pure helpers`.

### Task 2: The section and cards

**Files:**
- Create: `src/sections/experience/ExperienceCard.tsx`
- Modify: `src/sections/Experience.tsx`

**Interfaces:**
- Consumes: Task 1's helpers and fields.
- Produces: `export function ExperienceCard(props: { item: ExperienceItem }): JSX.Element`. It renders the featured layout when `item.featured && item.stats?.length`.

- [ ] **Step 1: Build `ExperienceCard`** per Global Constraints.
  - **"Show more":** `useState(false)`. The hidden highlights get their own `<ul id={useId()}>` with the `hidden` attribute while collapsed, and the button's `aria-controls` points at it.
  - **"Now" pill:** shown when `end === null`.
  - **Company:** an `<a>` only when `companyUrl` is set.
  - **Numbers column:** rendered only when there are stats.
- [ ] **Step 2: Rewrite `Experience.tsx`.**
  - `Section` + `SectionHeading` (title "Where I've worked").
  - A `<ul className="grid items-start gap-5 md:grid-cols-2">` over `orderRoles(EXPERIENCE)`.
  - Each `<li>`, with `md:col-span-2` for the featured one, wraps `<Reveal delay={i * 0.08}>`.
- [ ] **Step 3: Check in the Browser pane** at 1280×800 and 360×740. Finish CSS animations by script (`document.getAnimations().forEach(a => a.finish())`), since the hidden pane freezes them.
  - **Layout:** the featured card spans both columns with its numbers column; then a 2×2 grid; one column at 360px with `scrollWidth === innerWidth`.
  - **Review Focus 1:** expand OBSS and check InfinitumIT's height is unchanged; collapse and count 2 visible `li`.
  - **Review Focus 2:** Tab to a "Show more" and screenshot the ring. Check `aria-expanded` flips and `document.getElementById(aria-controls)` exists.
  - **Review Focus 4:** in the console, temporarily render without `featured` (or just reason from the guard) and confirm no empty column. The unit test covers the ordering.
  - **Review Focus 5:** compute the contrast of `text-ink/70` and the pill text on white (≥ 4.5:1).
- [ ] **Step 4: Run the gate and commit** with the message `feat: Experience cards with a featured role`.

### Task 3: Final checks and docs

- [ ] **Step 1: Run Lighthouse on mobile** twice against `npm run build` + preview. Expected: Performance ≥ 90; Accessibility, Best Practices and SEO ≥ 95.
- [ ] **Step 2: Update the docs.**
  - `docs/PROGRESS.md`: Experience ✅ in the done table, with notes; next is the Footer; remove the "timeline" line.
  - `CLAUDE.md`: Experience ✅; the spec in the read-first list; `src/sections/experience/` in "Where things live".
- [ ] **Step 3: Run the gate and commit** with the message `docs: record the Experience section`.
