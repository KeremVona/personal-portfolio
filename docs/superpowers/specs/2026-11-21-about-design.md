# About Section: Design

**Date:** 2026-11-21
**Status:** Agreed in conversation with Kerem. This builds on the foundation spec, `2026-11-20-portfolio-foundation-design.md`.
**Changed (2026-11-23):** the painting is now a living pond; see `2026-11-23-about-pond-design.md`. The hover lift is gone.
**Mockup:** `.superpowers/brainstorm/868-1795245819/content/about-layouts.html`, option **A**.

---

## 1. Intent

A short, personal pause between the hero and the work. It tells the reader who Kerem is in a few sentences, and gives the page a human, hand-made touch through a painting he chose. It is not a CV: no skills list, no timeline.

## 2. Decisions made by Kerem

- **Brief.** A few sentences about himself.
- **No skills list.** The tech appears per project in the Projects section instead. This closes the foundation spec's open "do skills live here?" question.
- **No portrait photo.** The image is a **watercolour of koi among lily pads** (`reference/671.png`, 1792×2388, about 3:4, painted on cream paper with rough edges). It is used as a framed piece of art.
- **Layout A, "split with a tilted print"** (chosen from three mockups):
  - The painting sits on the left, shown **whole, with its paper edges**, tilted slightly with a soft shadow, like a print propped on a desk.
  - The text sits on the right.
  - On phones the print goes on top.
- **The hero stays as it is.** The suggested soft fade from the meadow into the cream was offered and not taken up.
- **Copy is a placeholder.** Kerem rewrites it at the end.

## 3. Layout

**Section frame**
- Uses the shared `Section` (`id="about"`) on the cream page, with the existing vertical rhythm (`py-16 sm:py-24`) and the `max-w-6xl` container.
- **Heading (Claude's call; sets the pattern for later sections):**
  - A small uppercase eyebrow with the section's nav label ("About"): Inter Tight 600, about 13px, letter-spacing ~0.08em, colour `meadow-deep`.
  - Then the `h2` with the section's own title: "A little about me" (placeholder).
  - The `h2` keeps the existing `id` and `aria-labelledby` wiring. The eyebrow is decorative text above it.
  - Layout A puts the heading **inside the text column**, below the print on phones, so `Section` must let a section place its own heading. One way: a `SectionHeading` the section renders itself, while `Section` still owns `id`/`aria-labelledby`.
  - Projects, Experience and Contact (still placeholders) must keep working. Giving them the eyebrow now is optional.

**Wide screens (≥ 768px)**
- Two columns: the print column about **38%** wide, then the text column.
- A gap of about 6% of the container width.
- The columns are **vertically centred** against each other.
- The text column's paragraphs are max ~58ch wide.

**Phones (< 768px)**
- One column: the print on top, at about **68%** of the column width, left-aligned, then the eyebrow, heading, text and pills.
- The print is **capped at about 320px wide**, so on wide phones and small tablets (600–767px) it doesn't grow to ~650px tall before any text shows.
- The 768px switch point is Claude's call, made at build time.

**The print**
- Shown whole: the full image including its cream paper border. It is **not cropped**.
- `rotate(-1.6deg)`.
- A soft two-part shadow: about `0 14px 30px -12px rgb(30 50 30 / .35)` plus `0 2px 6px rgb(30 50 30 / .08)`.
- **Claude's call, as a small hover touch:** on devices that can hover, it straightens to 0° and lifts slightly over ~300ms. This is disabled for reduced motion.
- **Alt text (Claude's call):** "Watercolour painting of koi fish swimming among lily pads". It's real content rather than decoration, so it gets a description.

**Text column**
- **Body:** Inter, ~15–17px, line-height ~1.65, `ink-soft`. There are three short placeholder paragraphs:
  1. Who and where: final-year Software Engineering student at Fatih Sultan Mehmet Vakıf University, Istanbul, graduating June 2027.
  2. What he's been doing: four internships (news-intelligence platform, browser games for a 2.5M-visit site, decision-making-AI benchmarking), and a line about liking to own the whole thing, from the data to the interface.
  3. Something personal: "[a hobby or two]", a visible placeholder slot for Kerem.
- **Fact pills:** location ("Istanbul, Türkiye"), "Graduating June 2027", and languages ("English · Turkish"). Small rounded pills on a `meadow-tint` background with `meadow-deep` text, wrapping on narrow screens.
  - Location and graduation are **derived from `PROFILE`** (`location`, `graduation` formatted as "June 2027"), not repeated as strings.
  - Languages is new profile data.

## 4. Content

- The About text lives in typed content, like the rest of the site.
- Add to `src/content/profile.ts`, or a new `about.ts`:
  - the title,
  - the paragraphs (`string[]`),
  - the facts (`string[]`).
- Languages come from the résumé: English (fluent) and Turkish (native). The pill shows just "English · Turkish".

## 5. Image pipeline (Claude's call)

- A committed WebP master at `src/assets/about/koi.webp` (q≈90, about 1200px wide), cut from `reference/671.png` by a small script like the hero's.
- The raw 9.5 MB PNG stays in the git-ignored `reference/`.
- Variants via vite-imagetools, about **480 / 720 / 960** px wide WebP at q≈80, served with `srcset` and `sizes` that match the column widths above.
- `loading="lazy"` and `decoding="async"` (it's below the fold), with explicit `width`/`height` so nothing shifts as it loads.

## 6. Motion

- **The foundation spec's scroll reveal arrives with this section (Claude's call).** It follows foundation §5:
  - The print and the text column fade in and rise about 16–24px **once**, as they enter the viewport.
  - ~0.5–0.7s ease-out, with a light stagger (print first, then text).
  - Nothing moves with reduced motion.
- **Built without a library (changed at build time).** It is a small shared `Reveal` component: an IntersectionObserver plus a CSS transition on `opacity` and `translate`.
  - `motion` was tried first, as the foundation spec planned. It added about 14–31 KB of JavaScript, and Lighthouse mobile Performance fell to exactly 90 (LCP 3.6s).
  - The lazily loaded variant also risked content staying invisible if its chunk failed to load.
  - The native version restores Performance to 92 (LCP 3.4s) with no extra request.
- **Reveal wraps the print's wrapper, not the `<img>`.** That keeps the reveal's `translate` separate from the print's tilt and hover. The image may still be loading lazily when the wrapper reveals; its reserved space and paper-coloured background (~#F2EAD8) mean it never shows as an empty hole.
- **Deep links:** loading the page at `/#about` (or any `#section`) scrolls to that section after the first render. The browser can't do it alone, because React renders after the browser looks for the target.

## 7. Quality bar

- **Lighthouse (mobile):** keep the foundation targets (Performance ≥ 90; Accessibility, Best Practices and SEO ≥ 95).
- **Layout:** no horizontal scroll at 360px. The tilted print never overflows its column or causes horizontal scroll.
- **Text contrast:** `ink-soft` on cream and `meadow-deep` on `meadow-tint` both meet AA (already checked: 10.7:1 and 6.9:1).
- **Layout shift:** the image reserves its space (CLS 0).

## 8. Left to the builder

- File and component names.
- Exact gaps and font sizes within the ranges above.
- Whether the About content lives in `profile.ts` or a new `about.ts`.
- How the native `Reveal` is built (IntersectionObserver options, transition classes, reduced-motion handling).
