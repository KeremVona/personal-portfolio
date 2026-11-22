# Experience Section: Design

**Date:** 2026-11-21
**Status:** Agreed in conversation with Kerem. This builds on the foundation spec (`2026-11-20-portfolio-foundation-design.md`) and follows the patterns of the About and Projects specs.
**Mockup:** `.superpowers/brainstorm/868-1795245819/content/experience-layouts.html`, option **C** ("Cards, biggest numbers first").

---

## 1. Intent

Show Kerem's work history so a recruiter sees real, shipped work with numbers in a few seconds: four internships and freelance work in about two years. The foundation spec asked for "the numbers up front". Option C does that by leading with the role that has the biggest numbers, shown in a wide card with those numbers beside it.

## 2. Decisions made by Kerem

- **Layout C:** one wide featured card first, then the other roles as cards in a two-column grid. Options A (a vine timeline) and B (a row of numbers, then a list) were shown and not chosen.
- **Agreed in playback:**
  - The featured card is **Dijital Varlıklar**, with **~2.5M** monthly visits and **13+** news portals tracked.
  - The others follow newest first: Ihlas Holding, OBSS, InfinitumIT, Freelance.
  - Two highlights show at first; "Show N more" reveals the rest inside the card.
  - Current roles get a "Now" pill.
  - No flowers in this section. Projects has the corner bouquets, and the footer brings the meadow back (since 2026-11-22 as a grassy hill; see `2026-11-22-footer-sky-design.md`).
- **Copy is a placeholder.** Kerem rewrites it at the end.

## 3. Layout

**Section frame**
- The shared `Section` (`id="experience"`) with the standard `SectionHeading`: the eyebrow "Experience", then the `h2` "Where I've worked" (placeholder).
- Uses the existing vertical rhythm and the `max-w-6xl` container.

**The grid**
- **Phones (< 768px):** one column.
- **768px and up:** two columns. The featured card spans both.
- **Gap:** about 18–24px.
- **Order:** the featured role first, then the remaining roles in content order (newest first).
- **Cards align to the top** (`align-items: start`), so expanding one card doesn't stretch its neighbour.

**A card** (all roles)
- A white card (`--radius-card`, `--shadow-card`), padded about 20–24px.
- **Top row:**
  - The **company name** (Inter Tight 600, ~18px) on the left. It's a link to `companyUrl` that opens in a new tab, when there is one. Freelance has none, so it's plain text.
  - The **dates** on the right (~12.5px, `ink` at ~62–70% opacity, at least AA). They wrap under the name on narrow cards.
- **Role** below (~14px, `ink-soft`).
- **Meta pills** (outlined, small):
  - a **"Now"** pill (`meadow-tint` background, `meadow-deep` text) when the role is ongoing (`end` is null);
  - one pill with the place and work mode, e.g. "Istanbul · Onsite". **Claude's call:** the place is the city only (the text before the first comma, so "Istanbul, Türkiye" becomes "Istanbul"). When the location already is "Remote", show just "Remote".
- **Highlights:** a bulleted list (~13.5–14px, line-height ~1.6) showing the first **2**.
  - When there are more, a **"Show N more"** text button follows.
  - Pressing it reveals the rest in place, and the label becomes "Show less".
  - It is a real `<button>` with `aria-expanded` and `aria-controls`.
- **Tech tags:** small `meadow-tint` pills, like Projects. All tags are shown; there are at most ~4–5 per role.
- **Not clickable, and no hover lift.** Only the company link and the "Show more" button are interactive.

**The featured card**
- Spans both columns.
- **≥ 768px:** two inner columns. The card content on the left; on the right, a **numbers column** about 180–200px wide, separated by a 1px hairline (`ink` at ~10%).
- **Each number:**
  - the value (Inter Tight 700, ~28–32px, `meadow-deep`);
  - a short label under it (~12px, `ink-soft`);
  - stacked with ~14px between them.
- **Phones:** the numbers sit under the card content in a two-up row, separated by a hairline above.

## 4. Content

- Roles stay in `src/content/experience.ts`, typed in `types.ts`. Adding a role is one entry.
- `ExperienceItem` gains:
  - `featured?: boolean`: **Claude's call.** Which card is wide is chosen in content, not hard-coded. At most one should be featured. If none is, the grid simply has no wide card.
  - `stats?: { value: string; label: string }[]`: the featured card's numbers. Dijital Varlıklar gets `~2.5M` / "monthly visits" and `13+` / "news portals tracked".
- **Date formatting (Claude's call):**
  - Same year: "Jul – Aug 2026".
  - Different years: "Dec 2025 – Feb 2026".
  - Ongoing: "Oct 2026 – Present".
  - Uses an en dash with spaces, and the existing month names in short form.
- **Highlights stay plain strings (Claude's call).** There's no bold markup inside them, as there was in the mockup; the numbers column carries the emphasis.
- The highlights in `experience.ts` are verbatim from the résumé and long. Leave them as they are; Kerem rewrites the copy at the end.

## 5. Motion

- **Scroll reveal:** each card fades up once with the existing `Reveal`, staggered about 0.08s per card. The featured card comes first.
- **"Show more":** the extra highlights appear without animating height (Claude's call). That keeps it simple and avoids layout jank.
- **Reduced motion:** as `Reveal` already handles it (fade only).

## 6. Quality bar

- **Lighthouse (mobile):** keep the targets: Performance ≥ 90; Accessibility, Best Practices and SEO ≥ 95. Currently 91 and 100.
- **No horizontal scroll at 360px.**
- **Text contrast meets AA**, including the dates and meta pills.
- **Keyboard:** the company links and "Show more" buttons are reachable with Tab and have visible focus.
- **Screen readers:**
  - The `h2` labels the section.
  - Each card's company name is a heading (`h3`), so roles can be navigated by heading.
  - "Show more" announces its expanded state.
- **No layout shift (CLS 0):** the section has no images.
- **Tests (pure logic):**
  - the date range formatter (same year, different years, ongoing);
  - the place label;
  - how highlights split into shown and hidden;
  - ordering (featured first);
  - content sanity (at most one featured, featured has stats).

## 7. Not doing

- A timeline line, flowers or other decoration in this section.
- Company logos.
- Filtering or sorting.
- Animating the "Show more" height.

## 8. Left to the builder

- File and component names.
- Exact sizes and gaps within the ranges above.
- Where the date helper lives (it may extend `src/content/format.ts`).
- The wording of the external-link cue, if any.
