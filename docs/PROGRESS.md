# Progress

_Last updated: 2026-11-21_

## Done

| Piece | Spec | Plan | Notes |
|---|---|---|---|
| Foundation and scaffold | `specs/2026-11-20-portfolio-foundation-design.md` | `plans/2026-11-20-portfolio-scaffold.md` | Tokens, fonts, typed content, page shell, metadata, manual deploy workflow |
| Hero and nav | `specs/2026-11-21-hero-design.md` | `plans/2026-11-21-hero.md` | Notes below |
| About | `specs/2026-11-21-about-design.md` | `plans/2026-11-21-about.md` | Notes below |

**Hero and nav notes:**
- A five-layer WebGL meadow with wind sway, phone crops, and flowers that fade in after the sky.
- A fixed nav that hides and shows, with a phone menu.
- An Open Graph image.

**About notes:**
- Kerem's koi watercolour (`reference/671.png`) shown as a tilted print beside short placeholder text and fact pills.
- Section headings now have an eyebrow (`SectionHeading`).
- A native scroll `Reveal` component (no animation library).
- Deep links like `/#projects` now scroll to their section.

**Lighthouse on mobile, with the hero and About:** Performance 92; Accessibility, Best Practices and SEO 100.

All spec and plan paths are under `docs/superpowers/`.

## Next: Projects section

Start a brainstorm: mockups in the browser, agree the design with Kerem, write a section spec, plan, build inline, review with Opus, and merge.

Experience and Contact are still unstyled placeholders that render from `src/content/`. They already use the eyebrow heading.

## Then

- **Projects:**
  - HOI4 Multiplayer Platform first. It's closed source, so it needs screenshots or a short video from Kerem, and its tech stack, which isn't on the résumé.
  - Agricultural Management Platform: confirm the name. The résumé says "Agricultural Management and Platform", which looks like a typo.
  - Decide the card layout.
- **Experience:** five roles as a timeline, with the numbers up front.
- **Footer:**
  - Contact links (email, LinkedIn, GitHub, résumé).
  - The meadow returns, either as flowers growing from the bottom or as a wordmark filled with the painting.
  - LinkedIn has no Simple Icons logo, so use an inline SVG.
- **Scroll reveals:** add `motion` and follow the foundation spec §5.
- **Launch:** follow the README checklist.
  - Buy the domain.
  - Set the repo variable `SITE_URL`.
  - Set Settings → Pages → Custom domain.
  - Add the `push` trigger to the workflow.
  - Update the link on the résumé.

## Waiting on Kerem

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

**Scaffold:**
- The deploy workflow's `SITE_URL` guard accepts `http://` and a trailing slash.
- The Pages permissions could be limited to the deploy job.
- The résumé filename is repeated in three places.
- New-tab footer links have no screen-reader cue.
