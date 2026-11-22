# Footer (Contact) Section: Design

**Date:** 2026-11-21
**Status:** Agreed in conversation with Kerem. This builds on the foundation spec (`2026-11-20-portfolio-foundation-design.md`, which says "the meadow returns at the footer") and follows the patterns of the earlier section specs.
**Superseded in part (2026-11-22):** the look (ink background, flower band, left alignment, colours, bottom strip with copyright and "Back to top") is replaced by `2026-11-22-footer-sky-design.md`. The content and behaviour still apply.
**Mockup:** `.superpowers/brainstorm/922-1795263385/content/footer-layouts.html`, option **A** ("Night meadow").

---

## 1. Intent

The footer is the Contact section and the last thing a recruiter sees, so it makes one clear ask: email Kerem. It also gives the page a definite ending: a dark "night meadow" with the hero's painted flowers growing along the bottom, bookending the painted hero at the top.

## 2. Decisions made by Kerem

- **Option A, "Night meadow".** A dark green footer with the painted flowers along the bottom, closest to his reference (`reference/1.jpg`) but in the hero's painted style. Options B (cream meadow) and C (his name filled with the painting) were shown and not chosen.
- **Agreed in playback:**
  - an email button plus "Copy email";
  - LinkedIn and GitHub links that open in a new tab;
  - a Résumé (PDF) link that downloads the file;
  - a bottom strip with the copyright and "Back to top";
  - flowers edge to edge, cropped on phones;
  - the flowers stay still;
  - the nav is unchanged.
- **Copy is a placeholder.** Kerem rewrites it at the end.

## 3. Layout

**Frame**
- `<footer>` holds the `#contact` section, as it does today. The whole footer has an **`ink` background** (`#1c2a1e`) with cream text.
- **A clean, hard edge** after the cream Experience section, with no fade (Claude's call): a clear ending.
- The content sits in the usual `max-w-6xl` container, left-aligned, with generous top padding (about 64–96px).

**Content, in order**
1. **Eyebrow** "Contact": the same style as other sections, but in `meadow` (`#9fbf73`) for contrast on dark (about 7:1).
2. **Heading** `h2` "Let's build something together." (placeholder): Inter Tight 600, about `clamp(2rem, 5vw, 3.75rem)`, tight leading, max ~14ch, cream.
   - It keeps `id="contact-title"`, which the section's `aria-labelledby` points at.
3. **Lead** (placeholder): "I'm open to full-stack roles from 2027, and happy to talk about internships before then. Email is the fastest way to reach me." Cream at ~78% opacity, ~16–17px, max ~46ch.
4. **Actions row:**
   - **Email button:** a cream pill with ink text, a mail icon and the address (`keremvona@gmail.com`, from `PROFILE.email`). Its `href` is `LINKS.email` (`mailto:`).
   - **"Copy email" button:** an outlined pill (cream at ~30% border, cream text).
     - It copies the address with `navigator.clipboard.writeText`.
     - On success its label changes to "Copied ✓" for about 2s, and a polite live region announces "Email address copied".
     - **Claude's call:** if the Clipboard API isn't available, the button isn't rendered. The email button and the visible address remain.
5. **Links row:** LinkedIn · GitHub · Résumé (PDF), from `LINKS`.
   - Cream text with a 2px `meadow` underline, offset ~4px.
   - LinkedIn and GitHub use `target="_blank" rel="noreferrer"`.
   - The résumé keeps today's `download="Kerem-Can-Bas-Resume.pdf"`.
6. **The flower band:** see below.
7. **Bottom strip:**
   - A slightly darker band (about `#16221a`) across the full width.
   - "© {current year} {PROFILE.name}" on the left and "Back to top ↑" on the right. "Back to top" is a link to `#top`; the hero's id is `top`, and smooth scrolling is already global.
   - Cream at ~62–70% opacity, ~12.5–13px, at least AA.
   - On phones the two items stack.

**The flower band**
- **Art:** the hero's painted stems, left cluster and right cluster layers, composited and cropped to their flowering part: **y 560 to 1536** of the 2730×1536 art (the painted content starts at about y 572, so no flower head is cut). The flowers sit along both sides, with an open middle.
- **Placement:** full width, edge to edge (not the container), directly above the bottom strip, so the flowers appear to grow from it.
- **Size:**
  - Wide screens: the full width at its natural ratio (about 3:1). **Claude's call:** the height is capped at about **700px**, so the cap only applies on screens wider than about 2000px (it never applies at 1920px or below). Above that it crops from the top, so the bottom never cuts.
  - **Phones:** the band is never narrower than ~720px and is centred. A 360px phone sees the middle half, with flowers at both edges, as in the mockup.
- **Treatment:**
  - **Still** (no sway).
  - Decorative: `alt=""`, `aria-hidden`.
  - Lazy-loaded WebP with `srcset`/`sizes`, and explicit `width`/`height`, so there's no layout shift.

## 4. Content and assets

- Contact data stays in `src/content/links.ts` and `profile.ts`. The heading and lead are placeholder strings in a small footer content object (Claude's call: `src/content/contact.ts`, like `about.ts`).
- **Art pipeline (Claude's call):**
  - A script, `npm run art:footer`, composites the band from the private `reference/hero/` PNGs (`5`, `2`, `1`, back to front) and writes the committed master `src/assets/footer/band.webp` at full width.
  - Variants come from vite-imagetools.
- `SectionHeading` needs a dark variant, so the eyebrow can use `meadow` instead of `meadow-deep`. The builder decides how (for example a `tone` prop).

## 5. Motion

- **Reveal:** the content block fades up once with `Reveal`, like the other sections. The band doesn't animate.
- **"Copy email":** the label swap only, with no animation.
- **Reduced motion:** handled by `Reveal`.

## 6. Quality bar

- **Lighthouse (mobile):** keep the targets (Performance ≥ 90; Accessibility, Best Practices and SEO ≥ 95). Currently 91 and 100.
- **AA contrast on dark** for the eyebrow, lead, links and bottom strip.
- **No horizontal scroll at 360px** (the wide band must be clipped).
- **Keyboard:** every link and button reachable, with a visible focus ring on dark. The global cornflower ring is too dark on ink, so use a light ring (cream or `meadow`) inside the footer.
- **Screen readers:** the section is labelled by its `h2`; "Copy email" announces success; the band is hidden.
- **No layout shift (CLS 0).**
- **Tests (pure logic):** the copyright line (the year from a passed-in date), and any helper the builder adds (for example the clipboard-availability check).

## 7. Not doing

- A contact form (foundation non-goal), social icons beyond the three links, a newsletter, or a sitemap-style link grid.
- Swaying footer flowers.
- Changing the nav over the footer.

## 8. Left to the builder

- File and component names.
- Exact paddings and sizes within the ranges above.
- How `SectionHeading` gets its dark variant.
- The band's variant widths and `sizes`.
