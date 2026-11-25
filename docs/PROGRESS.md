# Progress

_Last updated: 2026-11-25_

## Done

| Piece | Spec | Plan | Notes |
|---|---|---|---|
| Foundation and scaffold | `specs/2026-11-20-portfolio-foundation-design.md` | `plans/2026-11-20-portfolio-scaffold.md` | Tokens, fonts, typed content, page shell, metadata, manual deploy workflow |
| Hero and nav | `specs/2026-11-21-hero-design.md` | `plans/2026-11-21-hero.md` | Notes below |
| About | `specs/2026-11-21-about-design.md`, pond: `specs/2026-11-23-about-pond-design.md` | `plans/2026-11-21-about.md`, `plans/2026-11-23-about-pond.md` | Notes below |
| Projects | `specs/2026-11-21-projects-design.md` | `plans/2026-11-21-projects.md` | Notes below |
| Experience | `specs/2026-11-21-experience-design.md` | `plans/2026-11-21-experience.md` | Notes below |
| Sky redesign | `specs/2026-11-24-sky-redesign-design.md` | `plans/2026-11-24-sky-redesign.md` | Footer palette everywhere, one sky, Projects windows, Experience timeline |
| Night mode | `specs/2026-11-25-night-mode-design.md` | `plans/2026-11-25-night-mode.md` | Night art for hero and footer, option C in between, TV glow; follows the device, sun/moon button |
| Footer (Contact) | `specs/2026-11-21-footer-design.md`, look replaced by `specs/2026-11-22-footer-sky-design.md` | `plans/2026-11-21-footer.md`, `plans/2026-11-22-footer-sky.md` | Notes below |

**Hero and nav notes:**
- **Since 2026-11-24 (`specs/2026-11-24-sky-hero-design.md`):** Kerem's computer on a floating cloud (`reference/647386481.png`). `npm run art:hero` cuts the cloud out into its own layer, refills the sky behind it and deepens the sky so the cream copy passes AA (26 sizes measured). The cloud sits about 64% across, clear of the copy (under it on narrow screens), and shies away from a nearby mouse. Before this: a watercolour meadow still (`specs/2026-11-22-hero-still-design.md`).
- A fixed nav that hides and shows, with a phone menu.
- An Open Graph image.

**About notes:**
- Kerem's koi watercolour (`reference/671.png`) shown as a tilted print beside short placeholder text and fact pills.
- **The pond (2026-11-23):** the painting's own koi swim in it, drawn with WebGL over the still painting.
  - **Clicks:** clicking a fish makes it dart out and come back after 2–4s. Clicking the water ripples and scares fish nearby. Enter or Space scares them all.
  - **Controls:** a pause button; reduced motion, no WebGL or any failure leaves the still painting.
  - **Cost:** about 85 KB extra on a phone, loaded after the page.
  - **Code:** `src/sections/about/` (swimming in `pond/swim.ts`, tested; drawing in `pond/renderer.ts`); art from `npm run art:about`.
  - **Changed from the prototype:** fish now brake and turn harder near the edge, because the approved prototype let them drift out of the pond.
- Section headings now have an eyebrow (`SectionHeading`).
- A native scroll `Reveal` component (no animation library).
- Deep links like `/#projects` now scroll to their section.

**Projects notes:**
- A card grid (up to three columns, never more columns than projects). Each card opens a native `<dialog>`: a side panel on desktop, a bottom sheet on phones.
- **Since 2026-11-24 (sky redesign):** each project is a classic '80s computer window (pinstriped title bar, hard ink outline, flat offset shadow), and the panel matches. The painted corner bouquets were removed at Kerem's request.
- Placeholder media ("Screenshots coming soon") until Kerem adds screenshots. The panel supports images and one self-hosted video.
- The hero's meadow now fades softly into the cream page at its bottom edge.

**Experience notes:**
- **Since 2026-11-24 (sky redesign):** one straight timeline, newest first, on the deep blue: dates on the left (above each card on phones), a line with a dot per role (dandelion for the current one), computer-cream cards. Dijital Varlıklar keeps its numbers (~2.5M, 13+) inside its card. This replaced layout C (a featured card and a two-column grid).
- Two highlights per role, with "Show N more" for the rest. A "Now" pill marks the current role.
- Numbers are set per role in `src/content/experience.ts` (`stats`).

**Footer notes:**
- Kerem's hilltop-computer image is the background (`specs/2026-11-22-footer-sky-design.md`). It replaced the first "Night meadow" footer and its flower band on 2026-11-22.
- The contact content is centred in the sky. `npm run art:footer` deepens the upper sky so cream text passes AA (worst measured 4.70:1); the computer is masked out of that.
- Nothing sits under the image: Kerem removed the copyright and "Back to top" strip.
- The geometry is `.sky-footer` in `index.css`: text ends above 32% of the image, and up to 15% (grass, and some hills at the sides) is cropped to fit short screens.
- Lazy-loaded: 26/53/105 KB on phones (square crop), 43/81/152 KB on wider screens.

**Lighthouse on mobile, whole page:** 100 in Performance, Accessibility, Best Practices and SEO; CLS 0; about 636 KB with the pond. The LCP (0.8s) is the headline: Chrome doesn't count a full-screen background picture, so watch the hero picture's weight (235 KB on phones) by eye as well.

All spec and plan paths are under `docs/superpowers/`.

## Open after the sky redesign

- **Kerem judges the night mode by eye:** the starfield refilled behind the night cloud (a very faint edge in the Milky Way left of the computer's old spot), how strong the TV glow should be, and the koi painting at night.

- **Kerem judges the About painting and pond on the new sky.** They are watercolour; if they look out of place, he may ask for them to be removed.

## Next: copy pass and launch

All five sections are built. What's left:
1. **Kerem's copy pass:** every heading, paragraph and project or role description is placeholder text.
2. **Content Kerem owes** (see "Waiting on Kerem").
3. **The README launch checklist:** domain, `SITE_URL`, Pages custom domain, the `push` trigger, and the résumé link.
4. Optionally, work through the deferred items below.

**Testing tip:** when the Browser pane is hidden it can freeze CSS animations *and* IntersectionObserver, so `Reveal` content stays hidden. Use headless Chrome over CDP against `npm run preview` for screenshots instead. To judge the page's last pixel row, use Chrome's `--force-device-scale-factor`: emulated metrics with a fractional device height draw a false light line there.

## Then

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
- **Footer image rights:** confirm where `674561874.png` came from and that it may be published.
- **Pond on real phones:** try the About pond on an iPhone and an Android phone (taps, scrolling over it, the pause button).
- **Hero image rights:** confirm where `647386481.png` came from and that it may be published.
- **All copy is placeholder.** Kerem rewrites it at the end, including the headline "Rooted in the back end. Blooming on the front."

## Known small issues (deferred from reviews)

**Hero and nav:**
- A mouse click on a nav link counts as "focus inside", so the nav stops auto-hiding until focus leaves. Fix: count only `:focus-visible`.
- Pressing Escape in the phone menu while a link is focused drops focus to `body`. Fix: return focus to the menu button.
- `useNavState`'s `lastY` starts at 0, so a deep link (`/#contact`) or restored scroll starts with the nav hidden. Fix: initialise it to `window.scrollY`.

**About:**
- Content not yet revealed prints invisible. Fix: add `print:opacity-100 print:translate-y-0` to `Reveal`.
- `useInitialHashScroll` smooth-scrolls on load, and overrides scroll restoration on reload/back. Fix: `behavior: 'instant'`, and skip for `reload`/`back_forward` navigations.
- The koi `width`/`height` are hardcoded (1200×1599) rather than taken from the image metadata.

**About pond:**
- The art size is picked once, when the pond loads. If the print grows later (rotating a tablet, widening a window), the pond can look softer than the still painting. Fix: reload the textures when the needed width passes the next size.
- `poke` takes a `random` parameter it doesn't use. Drop it.
- `getUniformLocation` runs on every draw call. Cache the locations once (negligible at 5 fish).
- Pausing freezes a ripple mid-spread. Clear ripples on pause if that looks odd.
- The frame rate was only measured in headless Chrome, which says nothing about real phones. The real-phone check covers it.

**Projects:**
- On Windows the open side panel stops 15px short of the right edge (the price of `scrollbar-gutter: stable`, which stops the page jumping). Nearly invisible, since the panel and gutter are both cream.
- For when media is added: pause any video when the panel closes; use the first *image* (not `media[0]`) as the card cover; derive the cover `sizes` from the project count; show panel images uncropped (`object-contain`); make content entries go through the sorted-variants helper (thumbnails use `variants[0]` without a srcset).
- Reopening the same project keeps the last gallery item shown.
- The 760w bouquet variants are ~190–210 KB (lazy, desktop only).
- The slide-out is only checked in Chromium. Safari and Firefox should now close cleanly (explicit fixed positioning), but check on an iPhone before launch.

**Experience:**
- The "is this the wide card?" rule (`featured` + stats) is written in both `Experience.tsx` and `ExperienceCard.tsx`. Fold it into one `isWide()` helper.
- Linked company names and "Show more" don't look clickable until hovered. Consider a small ↗ after linked names (with "opens in a new tab" for screen readers) and an underline or ▾ on the button.
- The "Show more" button is only 20px tall. `py-1 -my-1` would give a bigger tap target without moving anything.
- The content test pins the featured role to Dijital Varlıklar and its exact numbers. That's deliberate for now, but it will need updating if Kerem changes them.

**Footer:**
- A failed clipboard write (denied permission, some iframes) gives no feedback. Could show "Couldn't copy" for 2s.
- The image helpers (sort variants, srcset, largest) are repeated in About, Projects and Footer. Move them to one shared module.
- "Copied ✓": screen readers read the glyph aloud. Wrap it in an `aria-hidden` span.
- At some odd widths the outermost pixel column of the sky image blends ~20% of the blue background over the grass (the centring lands on a half pixel). Fix: from 901px wide, `width: calc(var(--art-w) + 2px)`.
- `--text-room` is approximate: at 426–500px wide it crops up to 76px of grass needlessly (23rem would suit that range), and a few sizes at 320px and below overflow by ~19px.
- The sky footer is only checked in Chromium. Check it on an iPhone before launch (container units, `svh`).

**Scaffold:**
- The deploy workflow's `SITE_URL` guard accepts `http://` and a trailing slash.
- The Pages permissions could be limited to the deploy job.
- The résumé filename is repeated in three places.
- New-tab footer links have no screen-reader cue.
