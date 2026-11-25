# Kerem Can Bas: personal portfolio

A single-page portfolio for Kerem, a final-year Software Engineering student (graduating June 2027) aiming for **full-stack web roles**.

**Look:** the page lives in the footer's world (`docs/superpowers/specs/2026-11-24-sky-redesign-design.md`). The hero is Kerem's old computer on a floating cloud in a deep sky (`2026-11-24-sky-hero-design.md`); the cloud shies away from a nearby cursor. Below it the page is one sky that deepens from cream to the footer's deep blue, where a hilltop computer sits. Projects are classic '80s computer windows; Experience is one straight timeline. Colours come from the footer picture. **Night mode** (`2026-11-25-night-mode-design.md`): the same world at night from Kerem's night art, following the device by default with a sun/moon button in the nav; the TV glows.

**Read these before doing anything:**

1. `docs/PROGRESS.md`: what's done, what's next, and the open/deferred items.
2. `docs/superpowers/specs/2026-11-20-portfolio-foundation-design.md`: the binding foundation (goals, stack, tokens, quality bar, hosting).
3. `docs/superpowers/specs/2026-11-21-hero-design.md` (its background and motion are replaced by `2026-11-22-hero-still-design.md`, then by `2026-11-24-sky-hero-design.md`), `2026-11-21-about-design.md`, `2026-11-21-projects-design.md`, `2026-11-21-experience-design.md` and `2026-11-21-footer-design.md` (its look is replaced by `2026-11-22-footer-sky-design.md`): the hero, nav, About, Projects, Experience and footer designs (built). The colours and the Projects and Experience look are replaced by `2026-11-24-sky-redesign-design.md`.
4. Any newer spec in `docs/superpowers/specs/`. Each section gets its own spec before it is built.

## How we work (Kerem's preferences)

- **Section by section:** Hero ✅ → About ✅ → Projects ✅ → Experience ✅ → Footer ✅. Next: Kerem's copy pass and the launch checklist. A blog is out of scope for now.
- **Each section follows the same loop:**
  1. Brainstorm, with mockups in the browser so Kerem can react to real visuals.
  2. Agree the design.
  3. Write a short section spec in `docs/superpowers/specs/`.
  4. Write a plan in `docs/superpowers/plans/`.
  5. Build it with checks; Kerem chose to run plans inline in the session ("Native").
  6. A final review by a fresh reviewer on Sonnet (Kerem: no Opus subagents).
  7. Merge to `main`.
- **Plan before code.** Nothing gets built until Kerem approves the design. Show options visually when the choice is visual.
- **Copy is a placeholder.** Kerem rewrites all text at the end, so don't polish wording; focus on layout and behaviour.
- **Explain in plain words, and give a recommendation** rather than a neutral list of options.
- **Commits stay local** unless Kerem asks to push. Commit messages end with a `Co-Authored-By` line for the model that wrote them.

## Stack and commands

The stack: Vite 8 · React 19 · TypeScript 7 (strict) · **Tailwind CSS v4 via `@tailwindcss/vite`, with no PostCSS and no `tailwind.config`** · Oxlint · Prettier (with `prettier-plugin-tailwindcss`) · Vitest · vite-imagetools. Scroll reveals use a small native `Reveal` (IntersectionObserver + CSS). `motion` was tried and removed because it cost too much mobile performance.

| Command                                                       | What it does                                                                                                                |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                                                 | Start the dev server (http://localhost:5173)                                                                                |
| `npm run build`                                               | Type-check and build to `dist/`                                                                                             |
| `npm run preview`                                             | Serve the production build (http://localhost:4173)                                                                          |
| `npm test`                                                    | Run Vitest (pure logic only)                                                                                                |
| `npm run typecheck` · `npm run lint` · `npm run format:check` | Static checks                                                                                                               |
| `npm run art:hero`                                            | Regenerate the hero layers (day and night), cloud box and share image (needs `reference/647386481.png` and `hero-dark.png`) |
| `npm run art:about`                                           | Regenerate the About painting and its pond pieces (needs `reference/671.png`)                                               |
| `npm run art:footer`                                          | Regenerate the footer sky, day and night (needs the private `reference/674561874.png` and `footer-dark.png`)                |

**The gate before every commit:** `npm test && npm run typecheck && npm run lint && npm run format:check && npm run build`

## Where things live

```
src/index.css           Tailwind import + footer-palette tokens in @theme (pinned by src/theme/palette.test.ts), the .sky-* section gradients, .window and .timeline
src/theme/              themeLogic (pure, tested), useTheme (data-theme on <html>, set before paint by index.html), contrast + palette tests
src/content/            Typed site content (profile, links, experience, projects, SECTIONS)
src/components/         Nav (fixed, hide/show, phone menu), ThemeToggle, ThemedLayers (current theme's picture only, crossfade on switch), navState (pure + tests), Section + SectionHeading (eyebrow + h2), Reveal, SkipLink
src/hooks/              useNavState, useInitialHashScroll
src/sections/Hero.tsx   Hero copy and layout; hero/ holds cloudLogic.ts (pure, tested: placement, shy target, spring), useCloudPlacement, useShyCloud, heroArt.ts
src/sections/about/     PondLayer (loads the pond lazily over the painting); pond/swim.ts (pure, tested), pond/renderer.ts (WebGL1), pond/LivePond.tsx
src/sections/projects/  projectLogic.ts (pure, tested), ProjectCard (a .window), ProjectPanel (native <dialog>; CSS in index.css), art.ts
src/sections/experience/ experienceLogic.ts (pure, tested; newest first), ExperienceCard (a card on the timeline)
src/sections/footer/    footerLogic.ts (pure, tested), CopyEmailButton; Footer.tsx is the contact section over the hilltop-computer sky (geometry: .sky-footer in index.css)
src/assets/hero/        Committed sky background (+ portrait crop), the cloud layer and its box (made by scripts/prepare-hero-art.mjs)
public/                 Résumé PDF (published as is, phone number included, by Kerem's choice), og-image.jpg, favicon, robots.txt
docs/superpowers/       Specs (decisions) and plans (how each piece was built)
```

## Things that will bite you

- **`reference/` is git-ignored and is not in the repo.** It holds the raw art and the private style references. Kerem copies it between machines by hand if needed. Only the `npm run art:*` scripts require it; the built art is already committed.
- **Tailwind v4 `translate-*` utilities set the CSS `translate` property, not `transform`.** Transition `translate` and read `getComputedStyle(el).translate`.
- **vite-imagetools ships no TypeScript types.** `src/imagetools.d.ts` declares the `?…&as=metadata` imports.
- **The linter is Oxlint, not ESLint.** The Vite template ships Oxlint, and typescript-eslint doesn't support TS 7.
- **Windows:** `.gitattributes` forces LF, so Prettier stays happy with `core.autocrlf=true`.
- **The About pond's motion is agreed with Kerem** (stiff head, swinging tail, glide and kick, bend limits; constants in `pond/swim.ts`). Changes need his say-so. Its scripted checks expose `window.__pond` in development only.
- **The hero rules are agreed with Kerem.** These need his say-so to change:
  - the picture is still, except the cloud's shy reaction to a nearby mouse (radius 1.3× its half-width, up to 28px at 1440px wide, 2° tilt, a soft critically damped spring; only with a hovering mouse, motion allowed and the wide layout), agreed 2026-11-24,
  - the cloud's place: about 64% across on wide screens, clear of the copy; centred under the copy on narrow ones.
- **Text over the hero:** the copy is cream; `npm run art:hero` deepens the sky behind it (step 6 of the script) and the secondary button has a deep-blue fill, which is what makes it pass AA. Re-measure on real pixels if the copy or the picture changes.
- **Night mode works by re-pointing the day colour tokens inside the sections** (`[data-theme='night'] :is(#about, #projects, #experience)` in index.css), so most classes need no `night:` variant. The nav, hero and footer handle night themselves. Headless Chrome follows the OS colour scheme: checks must emulate `prefers-color-scheme` explicitly.
- **Browser testing in the Claude desktop app:** when the Browser pane is hidden, animation frames are throttled or frozen, and IntersectionObserver may not fire (so `Reveal` content stays hidden). Use headless Chrome over CDP against `npm run preview` for screenshots and scripted checks.
- **Subagents on Claude Fable 5.2 failed** because the account needs usage credits. Kerem also said no Opus subagents (2026-11-24): use Sonnet for reviewer subagents.

## Hosting

- GitHub Pages on a custom domain. The domain isn't bought yet.
- The deploy workflow (`.github/workflows/deploy.yml`) runs **only when started by hand** until launch.
- The launch checklist is in `README.md`. The site URL comes from `VITE_SITE_URL` (in `.env` locally, and from the repo variable `SITE_URL` in CI).
