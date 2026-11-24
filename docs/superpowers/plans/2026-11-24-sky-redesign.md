# Sky Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The page lives in the footer's world. It gets the footer picture's palette, one sky that deepens down to the footer, Projects as classic '80s windows, and Experience as one straight timeline.

**Architecture:**
- **Tokens:** the palette lives as Tailwind v4 tokens in `src/index.css` `@theme`. A Vitest test parses those tokens and pins every text/background pairing to WCAG AA, so the palette can't drift into failure.
- **The sky:** each section owns one stretch of the gradient (CSS classes in `index.css`), and the stretches meet edge to edge. The steep darkening sits only in the padding between Projects and Experience.
- **Projects and Experience:** both are restyled in place. The bouquets and their scroll logic are deleted.

**Tech Stack:** React 19, TypeScript 7 (strict), Tailwind v4 (`@tailwindcss/vite`, no config file), Vitest, Oxlint, Prettier. Pixel checks use headless Chrome over CDP against `npm run preview`.

**Spec:** `docs/superpowers/specs/2026-11-24-sky-redesign-design.md`

## Global Constraints

- **Palette (spec §3), exact hex:**
  - sky: deep sky `#3A64AC`, sky `#5D85C0`, light sky `#82A7CD`, haze `#C9DBEB` / `#E3EDF7`;
  - neutrals: cream `#FBF7EE`, night ink `#15264A`, computer cream `#ECE2CC`, paper `#FFFDF8`;
  - grass `#3D5A1A` / `#18210C` / `#8FAE3A`, dandelion `#DAAC17`;
  - screen bars `#FBF26E #7CEDF9 #7FED74 #EB71F6 #EA6251 #5369EE`: tiny accents only.
- **Retired tokens:** no class may use them after Task 1: `meadow`, `meadow-deep`, `meadow-tint`, `poppy`, `cornflower`, `sky` (the old `#a9c6dc`).
- **Contrast:**
  - Small text needs 4.5:1, large text 3:1.
  - No text sits on a background between about `#6A8FC6` and `#4C76B7`.
  - Experience's text sits on `#4C76B7` or darker. Projects' text sits on `#B9CFE6` or lighter.
- **Retro stays in Projects:** the '80s window look (pinstripes, hard outline, offset shadow) appears only in Projects and its panel. Experience stays modern.
- **Monospace:** `ui-monospace, 'Cascadia Mono', Consolas, monospace`, with no new font file.
- **Motion:** with reduced motion, nothing moves; fades only.
- **Unchanged:** the footer, the hero picture and copy, Reveal, the About painting and pond (recolour only), the section order, the nav behaviour.
- **Copy is placeholder.** Don't polish wording.
- **The gate before every commit:** `npm test && npm run typecheck && npm run lint && npm run format:check && npm run build`.
- **Work on the branch `feat/sky-redesign`, cut from `main`.**
  - Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
  - Never commit `reference/` or raw PNGs.
- **Final review:** one fresh reviewer subagent on **Sonnet** (Kerem: no Opus subagents).

## Review Focus

1. **Experience with every card expanded**, on desktop and on a 360px phone: each date, dot and card stay level with each other, and the line is unbroken. Pinned by the Task 5 pixel check.
2. **Contrast where a section stretches the gradient**: long phones (360×800, 390×844) and short wide screens (1280×720). The eyebrow, the dates and small text pass on real pixels. Pinned by the Task 2 and Task 5 pixel checks.
3. **The project panel after the restyle**:
   - the close button can be reached with Tab;
   - Escape closes the panel;
   - focus returns to the window that opened it.

   Pinned by the Task 4 scripted check.
4. **A window's hover lift with reduced motion**: it must not move. Pinned by the Task 4 check (computed `translate` is `none` under emulated reduced motion while hovered).
5. **The nav over each part of the page** (hero, pale sky, deep Experience, footer): its text passes AA everywhere. Pinned by the Task 2 pixel check.

---

### Task 1: Palette tokens, pinned by a contrast test

**Files:**

- Create: `src/theme/contrast.ts`, `src/theme/contrast.test.ts`, `src/theme/palette.test.ts`
- Modify: `src/index.css` (the `@theme` colours), plus every `.tsx` that uses a retired token: `Nav.tsx`, `SectionHeading.tsx`, `SkipLink.tsx`, `About.tsx`, `Hero.tsx`, `Footer.tsx`, `CopyEmailButton.tsx`, `LivePond.tsx`, `ExperienceCard.tsx`, `ProjectCard.tsx`, `ProjectPanel.tsx`, `MediaPlaceholder.tsx`

**Interfaces:**

- Produces:
  - `contrastRatio(foreground: string, background: string): number`. It takes `#rrggbb` and follows the WCAG 2 relative-luminance formula.
  - **Tokens (Tailwind colour names):**
    - neutrals: `ink #15264A`, `ink-soft #2B3C5F`, `cream #FBF7EE`, `paper #FFFDF8`, `computer #ECE2CC`;
    - sky: `haze #E3EDF7`, `haze-deep #C9DBEB`, `sky-light #82A7CD`, `sky #5D85C0`, `sky-deep #3A64AC`;
    - accents: `grass #3D5A1A`, `dandelion #DAAC17`.
    - `footer-sky` stays as an alias of `sky-deep`, because `.sky-footer` uses it.
  - **Gradient stops as CSS variables in `@theme`:**
    - `--color-sky-projects-end: #B9CFE6`
    - `--color-sky-gap: #7C9DCB`, the meeting colour at the Projects/Experience edge
    - `--color-sky-experience-top: #4A72B4`

- [ ] **Step 1: Write the failing tests.**
  - `contrast.test.ts`:
    - `contrastRatio('#000000', '#ffffff')` is close to 21 (2 decimals);
    - `contrastRatio('#ffffff', '#ffffff')` is 1;
    - the result is the same with the arguments swapped.
  - `palette.test.ts`: read `src/index.css` with `node:fs`, parse every `--color-NAME: #hex;` inside `@theme` into a map, and assert these pairs are ≥ 4.5:
    - `ink` on `cream`, `haze`, `haze-deep`, `sky-projects-end`, `computer` and `paper`;
    - `ink-soft` on `sky-projects-end`, `computer` and `paper`;
    - `sky-deep` on `cream` and `haze` (the eyebrow);
    - `cream` on `sky-experience-top` and `sky-deep`.

    Also assert that no retired name (`meadow`, `meadow-deep`, `meadow-tint`, `poppy`, `cornflower`) is defined.

- [ ] **Step 2: Run the tests and see them fail.**

  Run: `npx vitest run src/theme`

  Expected: FAIL. `contrast.ts` doesn't exist, and the palette names are missing.

- [ ] **Step 3: Implement.**
  - Write `contrastRatio`.
  - Swap the `@theme` colours to the list above.
  - Replace every retired-token class in the files listed, keeping each one's role:
    - text: `meadow-deep` → `sky-deep`;
    - tints: `meadow-tint` → `haze`;
    - bullets: `marker:text-meadow` → `marker:text-sky`;
    - focus: `cornflower` → `sky-deep`.
  - Update the global `:focus-visible` outline in `index.css` to `var(--color-sky-deep)`.

  If a pair fails the test, nudge only `ink-soft` or the gradient stops, and keep the spec's named hexes.

- [ ] **Step 4: Run the tests and see them pass; then the grep and the gate.**
  - Run: `npx vitest run src/theme`. Expected: PASS.
  - Run: `grep -rnE "meadow|poppy|cornflower" src`. Expected: no output.
  - Run the gate. Expected: green.

- [ ] **Step 5: Commit** `feat: footer palette tokens, pinned by a contrast test`.

### Task 2: The sky gradient, the nav and the focus colours

**Files:**

- Modify: `src/index.css`, `src/components/Section.tsx` (only if a class hook is needed), `src/sections/About.tsx`, `src/sections/Projects.tsx`, `src/sections/Experience.tsx`, `src/components/SectionHeading.tsx`, `src/components/Nav.tsx`, `src/sections/Hero.tsx` (check the fade only)

**Interfaces:**

- Consumes: the Task 1 tokens.
- Produces:
  - CSS classes `sky-about`, `sky-projects` and `sky-experience` in `index.css`.
  - A custom property `--section-pad` equal to the Section's vertical padding: `4rem`, or `6rem` from `sm` up.
  - `SectionHeading`'s `tone`: `'light'` gives a `sky-deep` eyebrow, `'dark'` gives a cream eyebrow and cream title.

- [ ] **Step 1: Add the three section backgrounds.** The stops:
  - `sky-about`: `cream` → `haze` (top to bottom).
  - `sky-projects`: `haze` at 0 → `sky-projects-end` at `calc(100% - var(--section-pad))` → `sky-gap` at 100%.
  - `sky-experience`: `sky-gap` at 0 → `sky-experience-top` at `var(--section-pad)` → `sky-deep` at 100%.

  The colours meet exactly at each edge. Experience ends on `#3A64AC`, the footer's first row.

- [ ] **Step 2: Apply the backgrounds and text colours.**
  - About: ink text, `sky-deep` eyebrow, and `haze`/`ink` tags.
  - Projects: ink text.
  - Experience: `tone="dark"`, so the heading and eyebrow are cream.
  - Nav bar: `bg-haze/88` with backdrop blur and ink text. The phone menu stays an ink panel with cream text.
  - Focus outlines: cream inside `#experience`, the same way the footer does it now.
  - `html` keeps cream at the top. The `at-footer` deep sky at the bottom stays.

- [ ] **Step 3: Pixel check (scratchpad script, headless Chrome over CDP against `npm run preview`).**

  Sizes: the 26 sizes of the hero check, plus 360×800 and 390×844.

  At each size, for every visible text node in About, Projects, Experience and the nav (the nav scrolled over each section and the footer):
  - sample the real background pixels behind the text's box, with the text hidden by `color: transparent`;
  - compute the ratio against the text's colour.

  Expected: 0 failures; the worst pair is printed per size. The hero still passes AA (rerun `hero-check.mjs`).

- [ ] **Step 4: Gate.** Expected: green.
- [ ] **Step 5: Commit** `feat: one sky from the hero to the footer`.

### Task 3: Remove the corner bouquets

**Files:**

- Delete: `src/assets/projects/bouquet-left.webp`, `src/assets/projects/bouquet-right.webp`, `scripts/prepare-projects-art.mjs`
- Modify:
  - `src/sections/Projects.tsx`: remove `Bouquets`, `useCornerBouquets`, `decoration`, the section `ref`, `pb-40 sm:pb-48` and `overflow-x-clip`;
  - `src/sections/projects/art.ts`: keep only `srcSet` and `largest`;
  - `src/sections/projects/ProjectPanel.tsx`: remove the foot bouquet `<img>`;
  - `src/sections/projects/projectLogic.ts`: remove `sinkBy`, `RISE_*` and `SINK_SCROLL`;
  - `projectLogic.test.ts`: remove the `sinkBy` block;
  - `package.json`: remove `art:projects`;
  - `CLAUDE.md`: drop the `art:projects` row.
- Keep `Section`'s `decoration` and `ref` props. They're harmless and generic.

- [ ] **Step 1: Delete and edit as listed.**
- [ ] **Step 2: Gate.** Expected: green, with 4 fewer tests.
- [ ] **Step 3: Check that nothing is left.**

  Run: `grep -rnE "BOUQUET|sinkBy|bouquet" src scripts package.json CLAUDE.md`

  Expected: no output.

- [ ] **Step 4: Commit** `refactor: remove the Projects corner bouquets`.

### Task 4: Projects as classic windows

**Files:**

- Create: `src/components/labelStyle.ts`
- Modify: `src/sections/projects/ProjectCard.tsx`, `src/sections/projects/MediaPlaceholder.tsx`, `src/sections/projects/ProjectPanel.tsx`, `src/index.css`

**Interfaces:**

- Consumes: the tokens.
- Produces:
  - `export const TAG_LABEL: string` in `labelStyle.ts`, a class string: rectangular, 1px border, `font-mono`, about 11.5px, small padding, no rounding, colour inherited. Task 5 reuses it.
  - The CSS classes `.window`, `.window-bar` and `.window-title` in `index.css`.
  - The `--font-mono` token in `@theme`.

- [ ] **Step 1: Add the window styles.**
  - **`.window`:** `paper` background, `2px solid ink`, `border-radius: 0`, `box-shadow: 5px 5px 0 var(--color-ink)`.
  - **`.window-bar`:** about 26px tall, with a 2px ink bottom border.
    - Horizontal pinstripes: a repeating 3px gradient of paper and ink, inset 4px top and bottom.
    - A 12px square close box on the left: 2px ink border, paper fill, decorative only (`aria-hidden`).
  - **`.window-title`:** monospace, 12px, bold, ink, on a paper patch centred over the stripes.
  - **Hover lift:** under `prefers-reduced-motion: no-preference` only, hover and `:has(:focus-visible)` move it by `translate: -2px -2px` and grow the shadow to `7px 7px 0`. The transition is about 150ms.

- [ ] **Step 2: Restyle `ProjectCard`.**
  - The `<article>` gets `.window`, and the stretched button and ring behaviour are kept: the focus outline is drawn on the article in `sky-deep`.
  - The bar's title is `project.slug`.
  - The cover keeps `aspect-[16/10]` and sits under the bar with no rounding.
  - Below the cover, on paper: the name, the summary (`ink-soft`), the tags in `TAG_LABEL` (the "+N" uses the same style), and the footer row. In that row the source label is in monospace, and "Read more →" becomes `open ↗`, in `sky-deep`, monospace.
  - **`MediaPlaceholder`:** every tone becomes `bg-linear-135 from-haze to-sky-light`, with monospace ink/60 text. The tones may collapse to one, but keep `ProjectTone` in the content types.

- [ ] **Step 3: Restyle `ProjectPanel`.**
  - The dialog gets the window frame on its open edge only:
    - side panel: a 2px ink left border;
    - phone sheet: a 2px ink top border;
    - the offset shadow, square corners and a paper background.
  - At its top, a sticky `.window-bar` with the project slug as title. The real close button (an `aria-label` that says close) is the close box at the bar's left, at least 40×40 hit area, keyboard reachable.
  - Tags use `TAG_LABEL`. Gallery thumbnails use the ring in `sky-deep`.
  - Slide and fade are unchanged.

- [ ] **Step 4: Scripted checks (scratchpad, CDP).**
  - **Keyboard:** Tab to the first window and press Enter. The dialog opens. Tab reaches the close button, Escape closes the dialog, and `document.activeElement` is the window's button again.
  - **Reduced motion:** with reduced motion emulated and the first window hovered, the computed `translate` is `none`.
  - **Screenshots:** 1440×900 and 390×844, with the panel closed and with it open.

  Expected: all assertions pass.

- [ ] **Step 5: Gate**, then **commit** `feat: Projects as classic computer windows`.

### Task 5: Experience as one straight timeline

**Files:**

- Modify: `src/sections/experience/experienceLogic.ts`, `experienceLogic.test.ts`, `src/content/types.ts` (drop `featured`), `src/content/experience.ts` (drop `featured: true`), `src/sections/Experience.tsx`, `src/sections/experience/ExperienceCard.tsx`

**Interfaces:**

- Consumes: `TAG_LABEL` and the tokens.
- Produces: `orderRoles(items: ExperienceItem[]): ExperienceItem[]`, newest first.
  - The current role (`end === null`) comes first.
  - Then the rest by `end` descending, then by `start` descending.
  - Ties keep content order.

- [ ] **Step 1: Write the failing tests** in `experienceLogic.test.ts`. Replace the `orderRoles` and content tests:
  - `it('puts the current role first, then the rest by end date')`:
    - roles A (end `'2025-02'`), B (end `null`) and C (end `'2026-08'`) give `['B', 'C', 'A']`;
    - two roles with the same end are ordered by later `start` first;
    - identical dates keep content order.
  - `it('orders the real content newest first')`: `orderRoles(EXPERIENCE)` companies are `['Ihlas Holding', 'Dijital Varlıklar', 'OBSS', 'InfinitumIT', 'Freelance']`.
  - `it('keeps the Dijital Varlıklar numbers')`: its `stats` values are `['~2.5M', '13+']`.

  Drop the `featured` argument from the `role()` helper.

- [ ] **Step 2: Run them and see them fail.**

  Run: `npx vitest run src/sections/experience`

  Expected: FAIL. With the content's current order, `orderRoles` can't give B, C, A.

- [ ] **Step 3: Implement `orderRoles`, and remove `featured`** from the type, the content and the test helper.

- [ ] **Step 4: Run them and see them pass.** Expected: PASS.

- [ ] **Step 5: Build the timeline.**
  - **`Experience.tsx`:**
    - One `<ol>` in reading order.
    - On `md` and up, each `<li>` is a 3-column grid: a date column (about 120px, monospace, cream, right-aligned), a rail column (about 28px) and the card.
    - The rail: one continuous `cream/50` 2px line down the `<ol>`, absolutely positioned at the rail column's centre, with a 14px dot per item, aligned to the first line of the card's heading. The dot is cream with a `sky-deep` 3px ring; the current role's dot is `dandelion`.
    - Below `md`: the date goes above the card, and the line and dots move to a left gutter of about 20px.
  - **`ExperienceCard`:**
    - `bg-computer`, ink text, `rounded-[10px]`, no `shadow-card`.
    - The dates leave the card; they're in the timeline column now. On phones the card's own date line is shown only if the column version is hidden, so don't render both.
    - The "Now" marker and the place use `TAG_LABEL`.
    - Bullet markers use `sky-deep`. "Show more" is `sky-deep`.
    - Stats render for any role that has `stats`, as a row of up to 2 numbers at the card's top right on `md+` and above the bullets on phones (`font-display`, about 1.75rem, `sky-deep`).
    - The focus-on-reveal behaviour stays exactly as it is.

- [ ] **Step 6: Pixel check (CDP).** At 1440×900, 1280×720, 768×1024, 390×844 and 360×800, collapsed and with every "Show more" clicked:
  - each dot's vertical centre is within 2px of its card heading's first-line centre;
  - each date's top is within 4px of its card's top (on `md+`);
  - the line runs from the first dot to the last.

  Rerun the Task 2 contrast check for Experience, expanded. Expected: 0 failures.

- [ ] **Step 7: Gate**, then **commit** `feat: Experience as one straight timeline`.

### Task 6: Docs, review, merge

**Files:**

- Modify:
  - `docs/PROGRESS.md`: the redesign is done; the open items now include judging the About painting and pond on the new sky, and the future sky hero art;
  - `CLAUDE.md`: the "Look" line and the `src/sections/projects/` and `experience/` notes;
  - `docs/superpowers/specs/2026-11-21-projects-design.md` and `2026-11-21-experience-design.md`: one line at the top pointing to the sky redesign spec for their look;
  - the foundation spec §4.1: one line saying its tokens were replaced.

- [ ] **Step 1: Edit the docs**, then run the gate and **commit** `docs: record the sky redesign`.
- [ ] **Step 2: Final review.** One fresh reviewer subagent with `model: sonnet` reviews `git diff main...feat/sky-redesign` against the spec and this plan's Review Focus. Fix Critical and Important findings test-first; list the Minor ones.
- [ ] **Step 3: Merge and push.** Merge into `main` with `--no-ff` and run the gate on `main`. Confirm no `reference/` or PNG is tracked: `git ls-files | grep -E "^reference/|\.png$"` gives no output. Then `git push origin refs/heads/main:refs/heads/main`. Kerem's standing permission covers this.
