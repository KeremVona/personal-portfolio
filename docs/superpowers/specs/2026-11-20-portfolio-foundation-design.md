# Personal Portfolio: Foundation Design

**Date:** 2026-11-20
**Status:** Foundation agreed in conversation. Each section (Hero, About, Projects, Experience, Footer) is designed in its own session and added to this document before it is built.

---

## 1. Intent

Kerem Can Bas is a final-year Software Engineering student (Fatih Sultan Mehmet Vakıf University, graduating June 2027) aiming for **full-stack web development roles**. The site supports new-grad and junior applications.

**Audience:** recruiters and engineers hiring for full-stack web roles.

**What a visitor should take away:** *he already ships real software, and he cares about how it's made.*

- *Ships real software:* production work (browser games on a site with ~2.5M monthly visits, a news-intelligence platform across 13+ portals) and deep personal projects. Content puts this up front, with numbers.
- *Cares about craft:* the botanical look and the polish of the site itself carry this.

**The site is itself a code sample.** A technical visitor may open DevTools, run Lighthouse, or read the repo. Speed, accessibility, clean code and smooth motion count as much as the visuals.

## 2. Goals, non-goals, anti-goals

**Goals**
- A single page with five sections in order: **Hero → About → Projects → Experience → Footer**.
- A clean, botanical, meadow-themed look (direction "A · Meadow", §4).
- Subtle motion: content reveals softly on scroll. (The wind sway was removed at Kerem's request on 2026-11-22.)
- Content (jobs, projects, links) is easy to update without touching layout code.
- Fast, accessible and responsive (targets in §8).

**Non-goals for the MVP:** blog, backend, contact form, dark mode, Turkish version, analytics, CMS. A blog may come later and would be the point where routing is added.

**Anti-goals (failures even if it technically works)**
- It reads like a designer's portfolio: flowers that hide the engineering. The botanical art frames the page; the words stay plain and specific.
- Motion that is busy, janky, or slows the page down. No scroll-jacking.
- It looks like a template.
- Mixed illustration styles (for example, pixel-art flowers next to the painted meadow).

## 3. Constraints (decided by Kerem)

- **React + TypeScript**, **Vite** for bundling.
- **Tailwind CSS only:** Tailwind v4 through its Vite plugin (`@tailwindcss/vite`), with **no PostCSS config** and no separate CSS framework.
- **No backend.** A static site.
- The reference files in `reference/` are **starting points to improve on, not final assets**.

## 4. Design direction: "A · Meadow" (chosen)

Chosen from three mockups (Meadow / Herbarium / Night Garden). The mockup is at `.superpowers/brainstorm/39-1795204904/content/directions.html`, option A.

**Feel:** bright, airy and modern. The painted landscape does the atmospheric work, with a clean modern sans-serif on top. Closer to a well-made product site (the "Roma" references `reference/2.jpg`, `reference/3.jpg`) than to a vintage editorial look.

**Hero (starting point; finalised in the hero session):**
- A full-bleed painted meadow (starting art: `reference/hero-background.png`).
- The headline sits in the sky area: Inter Tight, ink colour, tight letter-spacing.
- A soft cream radial wash behind the text keeps it legible over the painting.
- A small pill above the headline ("Open to full-stack roles · 2027").
- Two buttons: primary filled ink, secondary translucent white.
- Copy pattern: a memorable line plus a plain statement of role. The mockup headline "Rooted in the back end. Blooming on the front." is a **placeholder**.

**Rest of the page (Claude's starting proposal; confirmed per section):**
- Cream page background.
- White cards with ~14px radius and a soft, slightly green-tinted shadow.
- Pill-shaped tags.
- Painted flower accents between sections, so the meadow carries through the page.
- The meadow returns at the footer. (Since 2026-11-22 as a grassy hill under a blue sky: see `2026-11-22-footer-sky-design.md`.)

**One illustration style everywhere: painterly.** The pixel/cross-stitch flowers in the footer reference (`reference/1.jpg`) are not used as-is. Any footer flowers are painted in the meadow's style. **Exception (2026-11-22):** Kerem chose a rendered hilltop-computer image as the footer's background; see `2026-11-22-footer-sky-design.md`.

### 4.1 Design tokens (starting values, tuned during section work)

> **2026-11-24:** these colours are replaced by the footer palette in `2026-11-24-sky-redesign-design.md` §3.

Defined CSS-first in Tailwind v4's `@theme` block in `src/index.css`. There is no `tailwind.config.js`.

| Token | Value | Use |
|---|---|---|
| `ink` | `#1C2A1E` | Primary text, primary buttons |
| `ink-soft` | `#2F3D30` | Secondary text |
| `cream` | `#FBF7EE` | Page background |
| `white` | `#FFFFFF` | Cards |
| `meadow` | `#9FBF73` | Natural accent |
| `meadow-deep` | `#3D5A2A` | Tag text, small accents |
| `meadow-tint` | `#EEF3E6` | Tag backgrounds |
| `sky` | `#A9C6DC` | Soft accent |
| `poppy` | `#E0603A` | Sparing highlight; decoration only, never body text |
| `cornflower` | `#4A6FA5` | Links and interactive accents |

**Type**
- Headings: **Inter Tight** (weight ~600, letter-spacing −0.03em to −0.045em).
- Body: **Inter** (400/500).
- Both are self-hosted variable fonts via Fontsource; no request to Google Fonts.
- The type scale is fluid (`clamp()`).

Every text/background pair must meet WCAG AA contrast.

## 5. Motion principles

- **Wind sway (removed on 2026-11-22 at Kerem's request; see `2026-11-22-hero-still-design.md`):** flowers sway as if a light wind passes through. It is **very subtle and must not be overdone**: slow, small bends (on the order of 1–2°), each flower out of step with its neighbours, with an occasional soft gust rolling across.
  - *How* it is built is decided in the hero session. The two candidates are (a) painting the hero as separate transparent layers (sky, hills, back flowers, front flowers or individual stems) and animating them with CSS transforms, or (b) a WebGL displacement effect on the flat painting.
  - This choice determines how the art is produced.
- **Scroll reveals:** fade plus a small rise (≈16–24px), once per element, ~0.5–0.7s ease-out, with a light stagger on groups.
- **Parallax:** light, hero only, if at all.
- **No scroll-jacking** and no smooth-scroll library in the MVP (Lenis could be trialled later).
- **`prefers-reduced-motion`:** the sway stops and reveals become instant or opacity-only.
- **Performance:** animate only `transform` and `opacity`, and pause off-screen looping animations.

## 6. Tech stack and libraries

All of these are Claude's recommendations, accepted in conversation. Use the latest stable versions at scaffold time, pinned by the lockfile.

| Purpose | Choice | Notes |
|---|---|---|
| Build | Vite + React + TypeScript | `strict` TypeScript |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` | No PostCSS config. No component library: components are hand-built. |
| Animation | Native `Reveal` (IntersectionObserver + CSS transitions) | Changed during the About build: `motion` was tried and removed, because it cost about 14–31 KB of JS and dropped mobile Performance to 90. Add a library only if a later section needs animation that CSS can't do. |
| Sway | Plain CSS keyframes | Cheapest for the browser. If the hero session chooses option (b), a small WebGL setup is added then. |
| UI icons | `lucide-react` | |
| Tech logos | Simple Icons | Check that needed logos exist (e.g. .NET); fall back to inline SVG |
| Fonts | `@fontsource-variable/inter`, `@fontsource-variable/inter-tight` | Self-hosted |
| Images | `vite-imagetools` | Outputs AVIF/WebP at several widths with `srcset`. The current hero PNG is 7.8 MB; the delivered hero should be a few hundred KB. |
| Lint / format | Oxlint (the current Vite template's linter), Prettier + `prettier-plugin-tailwindcss` | Tailwind class sorting. Changed from ESLint at planning time: the Vite template now ships Oxlint, and `typescript-eslint` doesn't support TypeScript 7 yet. |
| Package manager | npm | |

## 7. Architecture

A single page. Navigation uses anchor links (`#about`, `#projects`, `#experience`, `#contact`). There is no router until a blog exists.

```
src/
  main.tsx, App.tsx, index.css        # index.css holds @theme tokens + font imports
  sections/   Hero.tsx  About.tsx  Projects.tsx  Experience.tsx  Footer.tsx
  components/ shared UI (Button, Tag, Card, SectionHeading, Reveal, Nav …)
  content/    types.ts  profile.ts  projects.ts  experience.ts  links.ts
  assets/     art and images (processed by vite-imagetools)
public/       résumé PDF, favicon, Open Graph image
```

**Content lives in typed TypeScript files** in `src/content/`. Sections render from that data, so adding a job means editing one file. The source of truth for the initial content is `reference/resume.pdf`.

## 8. Quality bar

- **Lighthouse (mobile):** Performance ≥ 90; Accessibility, Best Practices and SEO ≥ 95.
- **Responsive and accessible:**
  - Responsive from 360px wide upward.
  - Fully keyboard-navigable, with visible focus styles.
  - Semantic landmarks and headings, and alt text on meaningful images.
- **Meta and favicon:** title, description, Open Graph/Twitter image, canonical URL, and a flower favicon.
- **Checks:** type-check, lint, production build, and a Lighthouse/accessibility pass per section. There is no unit-test suite unless real logic appears (then Vitest).

## 9. Hosting and deploy

- **GitHub Pages on a custom domain** (decided by Kerem), deployed by a GitHub Actions workflow.
  - The site lives in a **new repo**. Because the domain serves it at the root, Vite's `base` is `/`.
  - **The domain name is not chosen yet.** Kerem buys it before launch.
  - Until then, the site URL is one constant (e.g. `SITE_URL` in `src/content/links.ts` or a Vite env variable). The canonical URL and the absolute Open Graph URLs read from that constant.
  - At cutover, set the domain in the repo's Settings → Pages → Custom domain. GitHub ignores a `CNAME` file for deploys from a workflow. Then point DNS at GitHub Pages and enable "Enforce HTTPS". Optionally verify the domain on the account first, to prevent takeover.
  - The old `portfolio-2` site is left alone. The résumé link is updated once the new domain is live.
- **Résumé download (decided by Kerem):** the PDF is published as is, phone number included. It is copied from `reference/resume.pdf` into `public/` and kept up to date there.
- **Nothing goes live until the site is ready (Claude's call).**
  - The deploy workflow is created during scaffolding, but it runs only when triggered manually (`workflow_dispatch`) until cutover. Push-to-`main` deploys are switched on only after that.
  - The existing site at the résumé link stays up until then.
- **Git-ignored:**
  - `.superpowers/` (brainstorm mockups).
  - `reference/` (Claude's call). It holds third-party inspiration images, the raw 7.8 MB hero PNG and the private résumé, none of which belong in a public repo. Any art the site uses is copied into `src/assets/` and optimised there.

## 10. Process

1. **Foundation:** this document.
2. **Scaffold:** a plan via the writing-plans step. It sets up the project with tokens, fonts and a page shell (nav plus empty, anchored sections) with the tooling and deploy workflow working.
3. **Section by section,** in order Hero, About, Projects, Experience, Footer:
   - Show mockups in the browser and agree on the design.
   - Add the section's decisions to this document (or a section spec next to it).
   - Build the section, then review it.

## 11. Sections: intent only (details decided in each section's session)

- **Hero:** a memorable line plus a plain role statement over the meadow, with the wind sway.
  - *Open:* headline copy, nav behaviour (sticky or not), the layered-art vs. WebGL sway approach, and how the art is produced.
- **About:** short and personal: who Kerem is, where he studies, what he enjoys building.
  - *Open:* photo or not, length, whether skills live here.
- **Projects:** framed as full-stack work.
  - The HOI4 Multiplayer Platform likely leads (web app, desktop client, save parsing, rankings, anti-cheat). It is closed source, so it needs screenshots or a short demo video instead of a repo link.
  - The Agricultural Management Platform shows depth: a React/TypeScript WebGL viewer on an ML pipeline, with a GitHub link.
  - *Open:* which other projects (if any) appear, and the card layout.
- **Experience:** all five roles as a timeline with the numbers up front: Ihlas Holding, Dijital Varlıklar, OBSS, InfinitumIT, and the freelance web work.
  - *Open:* layout and how much detail to show per role.
- **Footer:** the ways to reach Kerem: email, LinkedIn, GitHub and a résumé download. The meadow returns to close the page (since 2026-11-22 as a grassy hill under a blue sky).
  - *Open:* the visual treatment, e.g. flowers growing from the bottom edge, or a large wordmark filled with the painting.

## 12. Left to the builder

- Exact folder and component names beyond §7, spacing scale, breakpoints, and shadow/radius fine-tuning within the direction in §4.
- Library minor choices that don't change the look or behaviour.
- How the `base` path is configured, once the repo name is known.
