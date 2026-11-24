# Projects Section: Design

> **2026-11-24:** the look (cards, tags, bouquets) is replaced by `2026-11-24-sky-redesign-design.md` §6: classic computer windows, no bouquets. Behaviour (grid, panel, media) still stands.

**Date:** 2026-11-21
**Status:** Agreed in conversation with Kerem. This builds on the foundation spec, `2026-11-20-portfolio-foundation-design.md`, and follows the patterns set by the hero and About specs.
**Mockup:** `.superpowers/brainstorm/868-1795245819/content/projects-cards.html`, flower treatment **B**. (The mockup's dashed "third project?" slot and the poppy/cornflower sprigs from option A are not part of the design.)

---

## 1. Intent

Show Kerem's projects as full-stack work, quickly scannable. A reader scanning the page sees a few cards and can tell at a glance what each project is and what it's built with. Anyone curious opens a project for the longer story, screenshots and links without leaving the page.

The section keeps the Meadow look: the cream page, with the hero's painted flowers returning quietly in the corners.

## 2. Decisions made by Kerem

- **A card grid.** Clicking a card opens a **side panel** with a longer description of the project.
- **Flowers in the corners (option B):** the cards stay plain. Small bouquets from the hero painting sit in the section's bottom corners, and the panel has one at its foot. Option A (a flower peeking from behind each card) was shown and not chosen.
- **"Without overdoing it."** The flowers are an accent, never in the way of the content.
- **Three projects for now:** the HOI4 Multiplayer Platform, the Agricultural Management Platform, and a third that Kerem adds later. More may follow, so adding a project must not need layout changes.
- **No HOI4 screenshots or recording yet.** Kerem provides them later, along with the HOI4 tech stack.
- **Copy is a placeholder.** Kerem rewrites it at the end.

## 3. Layout

**Section frame**
- Uses the shared `Section` (`id="projects"`) with the standard `SectionHeading`: the eyebrow "Projects", then the `h2` "Things I've built" (placeholder).
- The section must be `relative` with clipped overflow on the x-axis so the corner bouquets can't cause horizontal scroll.

**The grid**
- Phones (< 768px): one column.
- 768px and up: two columns.
- 1024px and up: **up to three columns**, never more.
- **Claude's call:** the column count never exceeds the number of projects. With two projects, the grid is two wider columns, not three with a hole. A fourth project starts a new row.
- No empty or "coming soon" slot is ever shown.
- Gap: about 24–32px.
- Order: the content file's order. HOI4 is first.

**A card**
- A white card (`--radius-card`, `--shadow-card`) on the cream page:
  1. A **cover** at the top: the project's first image at 16:10, or the placeholder (see §5).
  2. The project **name** (an `h3`, Inter Tight 600, ~18px).
  3. A **one-line summary** (Inter, ~14px, `ink-soft`).
  4. **Tech tags:** small pills in the About style (`meadow-tint` background, `meadow-deep` text). Up to about 4, then "+N" (Claude's call).
  5. A **footer row:** "Open source" or "Closed source" on the left, and "Read more →" on the right.
- **The whole card is clickable** and opens that project's panel.
  - HTML forbids headings inside `<button>`, so use a **stretched button**: the card is an `<article>` with the `h3` containing a `<button>` whose `::after` covers the whole card. The button's accessible name is the project name. It has `aria-haspopup="dialog"`.
- **Hover** (devices that can hover): the card lifts ~4px and its shadow deepens over ~300ms. Disabled with reduced motion.
- **Keyboard focus:** a visible focus ring around the whole card (the existing cornflower ring, `:focus-visible`).

**The corner bouquets**
- Two bouquets cut from the hero's painted flower clusters: **left** from the left cluster, **right** from the right cluster. They match the hero's style because they're the same painting.
- They sit in the **section's bottom-left and bottom-right corners**, anchored to the section edges (not the `max-w-6xl` container), **behind** the cards.
- **Changed 2026-11-23 (Kerem's choice):** their stems end in a straight cut, which looked wrong at the section's bottom. They are now pinned to the **screen's** bottom corners while Projects is on screen, rising once the section is 160px into view and sinking below the screen edge just before it ends (`sinkBy`). With reduced motion they stay still and fade instead. The cards paint above them.
- Size: about `clamp(150px, 22vw, 340px)` wide on wide screens.
- **Phones get only the left bouquet**, a little smaller (about 40–46% of the screen width).
- **They must never cover card text, tags or the footer row.** Give the section enough bottom padding, and keep the bouquets mostly in the space below and beside the grid. Overlapping a card's lower corner slightly, behind it, is fine.
- **Still, not swaying (Claude's call).** The hero already moves; the rest of the page stays calm.
- Decorative: `alt=""`, `aria-hidden`.

## 4. The project panel

**What it is**
- A **native `<dialog>`** opened with `showModal()`. That gives the focus trap, Escape to close and the top layer (it covers the fixed nav) for free, with no library.
- It is labelled by its own heading (`aria-labelledby`).
- **Closing:** the × button, Escape, or a click on the dimmed page outside the panel.
- **Focus** goes into the panel when it opens (to the × button or the heading; builder's call), and **returns to the card's button** when it closes.
- The page behind **doesn't scroll** while the panel is open.
- One dialog element for all projects, filled with the chosen project, or one per project; builder's call.

**Desktop and tablets (≥ 768px): a side panel**
- Fixed to the right edge, full height, about `min(520px, 92vw)` wide.
- Cream background (`cream`), a soft shadow on its left edge, and the page behind dimmed (about `rgb(28 42 30 / 0.3)`).
- It **slides in from the right** over ~350ms with an ease-out curve, and the dim fades in. Closing reverses it.

**Phones (< 768px): a bottom sheet**
- Anchored to the bottom, full width, up to about 92% of the screen height, with rounded top corners.
- It **slides up** from the bottom.
- **No drag-to-close and no grab handle (Claude's call).** A handle suggests dragging, which isn't supported. Close with × or by tapping the dimmed area above.

**Reduced motion:** the panel and dim **fade only**, with no slide.

**Inside the panel, in order**
1. The **× close button**, top right, at least 40×40px, labelled "Close".
2. The project **name** as the panel heading (Inter Tight 600, ~26–28px).
3. A **longer description**: a short paragraph, longer than the card's one-liner.
4. **Media** (see §5): the main image or video, with thumbnails below when there's more than one item.
5. **"What I built":** a small uppercase label in the eyebrow style, then a bulleted list (the project's highlights).
6. **"Built with":** the full list of tech pills.
7. **Links:**
   - "View on GitHub" (primary pill button, `ink` background) when the project has a repo.
   - "Live site" when it has one.
   - "Closed source" as quiet text when it has no repo.
   - External links open in a new tab.
8. A **small bouquet** at the panel's foot, aligned to the bottom-right, decorative.

The panel scrolls internally when its content is taller than the screen.

## 5. Media and placeholders

**Until real screenshots exist**
- The card cover and the panel's main media show a **placeholder**: a soft gradient in the project's tone (HOI4: warm parchment; Agriculture: meadow green; builder picks a third tone) with a faint label such as "Screenshots coming soon".
- No fake thumbnails.
- **Launch checklist:** add "Replace the Projects placeholders with real screenshots" to `README.md` so placeholders can't ship by accident.

**When media is added**
- A project can have **images** and **at most one short video**.
- **Images:** WebP variants via vite-imagetools, with `srcset`/`sizes`, explicit `width`/`height` and `loading="lazy"`. The first image is the card cover, cropped to 16:10 with `object-fit: cover`. Every image has alt text written for that screenshot.
- **Gallery:** the panel shows one main item. With more than one item, thumbnails sit below it, and clicking a thumbnail shows it in the main slot.
- **Video (Claude's call):**
  - **Self-hosted** in the repo (an MP4, ideally under ~5 MB, plus a poster image).
  - **Not YouTube**, whose player adds a lot of download weight and third-party tracking.
  - It never autoplays. It's muted, with native controls and `preload="none"`, and only loads when someone presses play.
- **Panel media loads only when the panel opens.** Nothing in a closed panel costs the first page load.
- Adding media is a content change: new files plus entries in the project's content. No component changes.

## 6. Content

- Projects stay in `src/content/projects.ts`, typed in `types.ts`. Adding a project means adding one entry (and its media).
- `ProjectItem` grows to cover the design. The builder chooses the exact shape, but it needs:
  - `summary`: the card's one line (exists).
  - `description`: the panel's longer paragraph (new).
  - `highlights`: the "What I built" list (exists).
  - `stack` (exists), `repoUrl?` (exists), `liveUrl?` (new), `closedSource` (exists).
  - `media`: images and an optional video, empty for now (new).
  - `tone`: the placeholder colour (new).
- **HOI4's `stack` is empty until Kerem supplies it.** The card then shows no tag row rather than fake tags, and the panel leaves out "Built with".
- **Agriculture name:** keep "Agricultural Management Platform". The résumé's "Agricultural Management and Platform" looks like a typo; Kerem confirms when he rewrites copy.
- The panel descriptions are short placeholders written from the résumé.
- **Claude's call: two projects at launch.** The section ships with HOI4 and Agriculture only. There's no placeholder third entry; the third tone is defined so Kerem's entry can use it.
- **Claude's call: open or closed source comes from `repoUrl`.** The "Open source / Closed source" label and the links derive from whether `repoUrl` is set. The redundant `closedSource` flag is dropped, so the two can't disagree.

## 7. Motion summary

- **Scroll reveal:** each card fades up once with the existing `Reveal`, staggered by about 0.08s per card.
- **Card hover:** a ~4px lift, disabled for reduced motion.
- **Panel:** slides from the right (desktop) or bottom (phones) in ~350ms; fade only with reduced motion.
- **Bouquets:** still.

## 8. Quality bar

- **Lighthouse (mobile):** keep the foundation targets: Performance ≥ 90; Accessibility, Best Practices and SEO ≥ 95. Today's scores are 92 and 100.
- **Weight:** the bouquets are lazy-loaded WebP at sizes that fit their slots (a few tens of KB each on phones). The panel adds no images to the first load.
- **No horizontal scroll at 360px**, including from the bouquets and an open panel.
- **Keyboard:** Tab reaches each card; Enter or Space opens the panel; focus stays inside the panel; Escape closes it and focus returns to the card.
- **Screen readers:** each card is announced by its project name as a button that opens a dialog; the panel is announced as a dialog with its heading.
- **Text contrast** meets AA. The pills and body colours are already checked in the About spec.
- **No layout shift** (CLS 0): covers and bouquets reserve their space.
- **Tests:** pure logic gets unit tests, for example the column count for a number of projects, tag truncation ("+N"), and which links a project shows.

## 9. Not doing (for now)

Claude's call, agreed in conversation as "leave out for now":
- A separate page per project.
- A shareable link that opens one project's panel.
- Filtering or sorting projects by technology.
- Drag-to-close on the phone sheet.

## 10. Left to the builder

- File and component names.
- Exact sizes, gaps and font sizes within the ranges above.
- How the bouquet art is cut. A small script, like the hero's and About's, that writes committed WebP masters to `src/assets/projects/`. It can cut from the private `reference/hero/` PNGs or from the committed hero cluster masters.
- How the panel's open and close animation is done (for example `@starting-style` plus `allow-discrete` transitions, or a class toggled around `showModal()`/`close()`), as long as closing also animates and reduced motion fades only.
- How the page behind is kept from scrolling while the panel is open.
- The third placeholder tone.
- Small plumbing changes to `Section` (for example accepting a class, and content outside the `max-w-6xl` container) so the bouquets can sit against the section edges.
