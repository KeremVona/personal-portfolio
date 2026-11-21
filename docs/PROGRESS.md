# Progress

_Last updated: 2026-11-21_

## Done

| Piece | Spec | Plan | Notes |
|---|---|---|---|
| Foundation and scaffold | `specs/2026-11-20-portfolio-foundation-design.md` | `plans/2026-11-20-portfolio-scaffold.md` | Tokens, fonts, typed content, page shell, metadata, manual deploy workflow |
| Hero and nav | `specs/2026-11-21-hero-design.md` | `plans/2026-11-21-hero.md` | Notes below |
| About | `specs/2026-11-21-about-design.md` | `plans/2026-11-21-about.md` | Notes below |
| Projects | `specs/2026-11-21-projects-design.md` | `plans/2026-11-21-projects.md` | Notes below |

**Hero and nav notes:**
- A five-layer WebGL meadow with wind sway, phone crops, and flowers that fade in after the sky.
- A fixed nav that hides and shows, with a phone menu.
- An Open Graph image.

**About notes:**
- Kerem's koi watercolour (`reference/671.png`) shown as a tilted print beside short placeholder text and fact pills.
- Section headings now have an eyebrow (`SectionHeading`).
- A native scroll `Reveal` component (no animation library).
- Deep links like `/#projects` now scroll to their section.

**Projects notes:**
- A card grid (up to three columns, never more columns than projects). Each card opens a native `<dialog>`: a side panel on desktop, a bottom sheet on phones.
- Painted bouquets from the hero clusters sit in the section's bottom corners (`npm run art:projects`).
- Placeholder media ("Screenshots coming soon") until Kerem adds screenshots. The panel supports images and one self-hosted video.
- The hero's meadow now fades softly into the cream page at its bottom edge.

**Lighthouse on mobile, with the hero, About and Projects:** Performance 91; Accessibility, Best Practices and SEO 100; CLS 0.

All spec and plan paths are under `docs/superpowers/`.

## Next: Experience section

Start a brainstorm: mockups in the browser, agree the design with Kerem, write a section spec, plan, build inline, review with Opus, and merge.

Experience and Contact are still unstyled placeholders that render from `src/content/`. They already use the eyebrow heading.

## Then

- **Experience:** five roles as a timeline, with the numbers up front.
- **Footer:**
  - Contact links (email, LinkedIn, GitHub, résumé).
  - The meadow returns, either as flowers growing from the bottom or as a wordmark filled with the painting.
  - LinkedIn has no Simple Icons logo, so use an inline SVG.
- **Launch:** follow the README checklist.
  - Buy the domain.
  - Set the repo variable `SITE_URL`.
  - Set Settings → Pages → Custom domain.
  - Add the `push` trigger to the workflow.
  - Update the link on the résumé.

## Waiting on Kerem

- **Projects content:** HOI4 screenshots or a short recording, the HOI4 tech stack, and the third project. Until then the cards show placeholders (on the README launch checklist).
- **Agriculture project name:** the résumé says "Agricultural Management and Platform"; the site uses "Agricultural Management Platform".
- **Headline size:** the hero headline is `clamp(2.25rem, 5.6vw, 5.75rem)` in a 62% column, to match the approved mockup. The spec said about 88–92px in a 58% column. He needs to confirm.
- **All copy is placeholder.** Kerem rewrites it at the end, including the headline "Rooted in the back end. Blooming on the front."

## Known small issues (deferred from reviews)

**Hero and nav:**
- A mouse click on a nav link counts as "focus inside", so the nav stops auto-hiding until focus leaves. Fix: count only `:focus-visible`.
- Pressing Escape in the phone menu while a link is focused drops focus to `body`. Fix: return focus to the menu button.
- `useNavState`'s `lastY` starts at 0, so a deep link (`/#contact`) or restored scroll starts with the nav hidden. Fix: initialise it to `window.scrollY`.
- No `failIfMajorPerformanceCaveat` on the WebGL context, so software WebGL still animates.
- Textures are cached per `<img>`, so on wide screens the shared stems image uploads twice. Fix: cache by `currentSrc`.
- `setLayers` on a just-destroyed renderer starts harmless `decode()` calls. Fix: return early if destroyed.
- The DPR is read only on render, so moving to a monitor with a different pixel density keeps the old canvas resolution.

**About:**
- Content not yet revealed prints invisible. Fix: add `print:opacity-100 print:translate-y-0` to `Reveal`.
- The print's hover can flicker at its bottom edge, because the lifted element is the one being hovered. Fix: `group` on the wrapper and `group-hover:` on the image.
- `useInitialHashScroll` smooth-scrolls on load, and overrides scroll restoration on reload/back. Fix: `behavior: 'instant'`, and skip for `reload`/`back_forward` navigations.
- The koi `width`/`height` are hardcoded (1200×1599) rather than taken from the image metadata.

**Projects:**
- On Windows the open side panel stops 15px short of the right edge (the price of `scrollbar-gutter: stable`, which stops the page jumping). Nearly invisible, since the panel and gutter are both cream.
- For when media is added: pause any video when the panel closes; use the first *image* (not `media[0]`) as the card cover; derive the cover `sizes` from the project count; show panel images uncropped (`object-contain`); make content entries go through the sorted-variants helper (thumbnails use `variants[0]` without a srcset).
- Reopening the same project keeps the last gallery item shown.
- The 760w bouquet variants are ~190–210 KB (lazy, desktop only).
- The slide-out is only checked in Chromium. Safari and Firefox should now close cleanly (explicit fixed positioning), but check on an iPhone before launch.

**Scaffold:**
- The deploy workflow's `SITE_URL` guard accepts `http://` and a trailing slash.
- The Pages permissions could be limited to the deploy job.
- The résumé filename is repeated in three places.
- New-tab footer links have no screen-reader cue.
