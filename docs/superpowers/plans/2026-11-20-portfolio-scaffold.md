# Portfolio Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A working, committed project with the agreed tooling, design tokens, fonts and typed résumé content. The page shell has a nav, a placeholder hero and anchored empty sections. Metadata, favicon and a manual-only GitHub Pages workflow are in place. It is ready for section-by-section work.

**Architecture:** A single-page Vite + React + TypeScript app styled only with Tailwind v4 (CSS-first `@theme` tokens, no config files). Content lives in typed files in `src/content/`, and sections render from it. Nav links and section ids come from one `SECTIONS` list, so they can't drift apart.

**Tech Stack:**
- Vite 8, React 19, TypeScript 7 (versions from the `create-vite@9.3.4` `react-ts` template)
- Tailwind CSS 4.3 via `@tailwindcss/vite`
- `lucide-react`
- `@fontsource-variable/inter` and `@fontsource-variable/inter-tight`
- Oxlint, Prettier 3 with `prettier-plugin-tailwindcss`
- GitHub Actions: checkout v7, setup-node v7, configure-pages v6, upload-pages-artifact v5, deploy-pages v5

**Spec:** `docs/superpowers/specs/2026-11-20-portfolio-foundation-design.md`

## Global Constraints

- Tailwind v4 through `@tailwindcss/vite`: **no `postcss.config.*`, no `tailwind.config.*`**, no component library.
- No backend. Static output in `dist/`. Vite `base` is `/` (custom domain).
- TypeScript `strict: true`. Package manager: npm.
- Colour tokens are exact:
  - `ink #1C2A1E`, `ink-soft #2F3D30`, `cream #FBF7EE`
  - `meadow #9FBF73`, `meadow-deep #3D5A2A`, `meadow-tint #EEF3E6`
  - `sky #A9C6DC`, `poppy #E0603A` (decoration only, never text), `cornflower #4A6FA5`
- Fonts: headings Inter Tight (~600, letter-spacing −0.03em to −0.045em); body Inter (400/500). Both self-hosted via Fontsource.
- Every text/background pair meets WCAG AA (≥ 4.5:1 for body text).
- Respect `prefers-reduced-motion`. No scroll-jacking and no smooth-scroll library.
- Works from 360px wide. Keyboard-navigable with visible focus.
- Lighthouse (mobile): Performance ≥ 90; Accessibility, Best Practices and SEO ≥ 95.
- `reference/` and `.superpowers/` are git-ignored and never committed.
- Deploy runs on `workflow_dispatch` only until cutover. Nothing is pushed or deployed by this plan; commits are local only.
- The résumé is published as is, at `public/Kerem-Can-Bas-Resume.pdf`.
- **Linting deviates from the spec's wording** ("ESLint (Vite template config)"). The current Vite template ships **Oxlint**, and `typescript-eslint` does not support TypeScript 7 yet (its peer range is `<6.1.0`). Use the template's Oxlint. The spec §6 row is updated to match.
- **Deferred to section plans (do not install here):** `motion`, Simple Icons, `vite-imagetools`, Open Graph image.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **360px phone:** there is no horizontal scroll, and the nav still shows the name and the résumé link. *(Task 4, Step 4b)*
2. **Keyboard-only visitor:** the first Tab reaches a visible "Skip to content" link, and every link shows a cornflower focus ring. *(Task 4, Step 4c)*
3. **Anchor jumps:** clicking a nav link lands with the section heading fully visible. *(Task 4, Step 4a)*
4. **Visitor with reduced motion:** anchor jumps don't smooth-scroll. *(Task 2, Step 4)*
5. **Fresh clone on Windows:** `npm run format:check` passes and isn't broken by CRLF line endings. *(Task 1, Step 6)*

---

### Task 1: Scaffold and tooling

**Files:**
- Create (from template): `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `.oxlintrc.json`, `.gitignore`, `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Create: `.gitattributes`, `.prettierrc.json`, `.prettierignore`
- Delete (template demo): `src/App.css`, `src/assets/hero.png`, `src/assets/react.svg`, `src/assets/vite.svg`, `public/icons.svg`

**Interfaces:**
- Produces: npm scripts `dev`, `build`, `preview`, `lint`, `typecheck` (`tsc -b`), `format` (`prettier --write .`), `format:check` (`prettier --check .`).

- [ ] **Step 1: Generate the template into a temp folder** (never use `--overwrite` on the project root; it deletes `reference/` and `docs/`)

Run: `npx -y create-vite@9.3.4 .scaffold-tmp --template react-ts --no-interactive --no-immediate`
Expected: `.scaffold-tmp/` contains `package.json`, `src/`, `public/` and `.gitignore`.

- [ ] **Step 2: Move it into the root and strip the demo**

Run: `cp -r .scaffold-tmp/. . && rm -rf .scaffold-tmp && rm src/App.css src/assets/hero.png src/assets/react.svg src/assets/vite.svg public/icons.svg`

Set `"name": "kerem-portfolio"` in `package.json`. Keep `public/favicon.svg` until Task 5 replaces it.

- [ ] **Step 3: Install dependencies**

Run:
- `npm install`
- `npm install tailwindcss @tailwindcss/vite lucide-react @fontsource-variable/inter @fontsource-variable/inter-tight`
- `npm install -D prettier prettier-plugin-tailwindcss`

Expected: all three exit 0.

- [ ] **Step 4: Configure the files**

- **`vite.config.ts`:** `plugins: [react(), tailwindcss()]`, with `tailwindcss` imported from `@tailwindcss/vite`.
- **`src/index.css`:** exactly `@import 'tailwindcss';` (Task 2 adds the rest).
- **`src/App.tsx`:** a temporary `App()` returning `<h1 className="font-display">Kerem Can Bas</h1>`. Task 4 replaces it.
- **`tsconfig.app.json`:** add `"strict": true`.
- **`package.json`:** add the `typecheck`, `format` and `format:check` scripts.
- **`.prettierrc.json`:** `{ "semi": false, "singleQuote": true, "plugins": ["prettier-plugin-tailwindcss"], "tailwindStylesheet": "./src/index.css" }`
- **`.prettierignore`:** `dist`, `node_modules`, `package-lock.json`, `reference`, `.superpowers`, `docs`, one per line.
- **`.gitignore`:** append `reference/` and `.superpowers/`.
- **`.gitattributes`:**
  ```
  * text=auto eol=lf
  *.pdf binary
  *.png binary
  *.jpg binary
  *.webp binary
  *.avif binary
  *.woff2 binary
  ```

- [ ] **Step 5: Verify the toolchain**

Run: `npm run format && npm run format:check && npm run lint && npm run build && ls postcss.config.* tailwind.config.* 2>&1`

Expected:
- Prettier reports "All matched files use Prettier code style!"
- Oxlint reports 0 errors.
- The build writes `dist/index.html`.
- `ls` reports "No such file" for both config patterns.

- [ ] **Step 6: Initialise git and check what is ignored and the line endings**

Run: `git init -b main && git add -A && git check-ignore -v reference/resume.pdf .superpowers && git status --short | grep -E "reference/|\.superpowers" ; git ls-files --eol | grep -v -E "i/lf|i/-text|i/none"`

Expected:
- `check-ignore` lists both paths.
- Both `grep` commands print nothing (nothing from `reference/` or `.superpowers/` is staged, and every text file is LF in the index).

- [ ] **Step 7: Commit**

```bash
git commit -m "chore: scaffold Vite + React + TS with Tailwind v4, Oxlint and Prettier"
```

---

### Task 2: Design tokens, fonts and global styles

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Produces these Tailwind utilities for every later task:
  - Colours (`text-*`, `bg-*`, `border-*`): `ink`, `ink-soft`, `cream`, `meadow`, `meadow-deep`, `meadow-tint`, `sky`, `poppy`, `cornflower`
  - `font-sans` (Inter) and `font-display` (Inter Tight)
  - `rounded-card` (14px) and `shadow-card`

- [ ] **Step 1: Write `src/index.css`**

- **Imports, in order:**
  - `@import 'tailwindcss';`
  - `@import '@fontsource-variable/inter';`
  - `@import '@fontsource-variable/inter-tight';`
- **`@theme` block:**
  - `--font-sans: 'Inter Variable', ui-sans-serif, system-ui, sans-serif`
  - `--font-display: 'Inter Tight Variable', 'Inter Variable', ui-sans-serif, system-ui, sans-serif`
  - `--color-<name>: <hex>` for the nine colours in Global Constraints. Don't redefine `white`; Tailwind already has it.
  - `--radius-card: 14px`
  - `--shadow-card: 0 6px 24px rgb(30 50 30 / 0.12)`
- **`@layer base`:**
  - `html`: `bg-cream text-ink font-sans antialiased`
  - `:focus-visible`: `outline: 2px solid var(--color-cornflower); outline-offset: 3px`
  - `@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth } }`. This is the only place smooth scrolling is turned on.

- [ ] **Step 2: Check the computed styles in the browser**

Start `npm run dev`, open it in the browser pane, and run in the page:

```js
await document.fonts.ready
;({
  bg: getComputedStyle(document.documentElement).backgroundColor,
  h1Font: getComputedStyle(document.querySelector('h1')).fontFamily,
  tightLoaded: document.fonts.check('600 16px "Inter Tight Variable"'),
})
```

Expected: `bg` is `"rgb(251, 247, 238)"`, `h1Font` starts with `"Inter Tight Variable"`, and `tightLoaded` is `true`.

- [ ] **Step 3: Contrast check** (one-off, not committed)

Run:

```bash
node -e "const L=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};const r=(a,b)=>{const[x,y]=[L(a),L(b)].sort((m,n)=>n-m);return((x+.05)/(y+.05)).toFixed(2)};for(const[f,b]of[['#1C2A1E','#FBF7EE'],['#2F3D30','#FBF7EE'],['#3D5A2A','#EEF3E6'],['#4A6FA5','#FBF7EE'],['#4A6FA5','#FFFFFF'],['#1C2A1E','#FFFFFF']])console.log(f,'on',b,r(f,b))"
```

Expected: every ratio is ≥ 4.5. The lowest is cornflower on cream, at ≈ 4.8.

- [ ] **Step 4: Reduced-motion check**

Run: `npm run build && grep -o "@media[^{]*prefers-reduced-motion[^{]*{[^}]*scroll-behavior:smooth" dist/assets/*.css && grep -o "scroll-behavior:smooth" dist/assets/*.css | wc -l`

Expected: the first `grep` prints one match, and the count is `1`. Smooth scrolling exists only inside the `no-preference` media block.

- [ ] **Step 5: Commit**

```bash
git add src/index.css && git commit -m "feat: add Meadow design tokens, self-hosted fonts and base styles"
```

---

### Task 3: Typed content from the résumé

**Files:**
- Create: `src/content/types.ts`, `src/content/sections.ts`, `src/content/profile.ts`, `src/content/links.ts`, `src/content/experience.ts`, `src/content/projects.ts`

**Interfaces:**
- Produces (`types.ts`):

```ts
export type SectionId = 'about' | 'projects' | 'experience' | 'contact'
export interface SectionLink { id: SectionId; label: string }
export interface Profile { name: string; role: string; location: string; school: string; graduation: string /* YYYY-MM */; availability: string; email: string }
export interface ExternalLink { label: string; href: string }
export type WorkMode = 'Onsite' | 'Hybrid' | 'Remote'
export interface ExperienceItem { company: string; companyUrl?: string; role: string; start: string /* YYYY-MM */; end: string | null /* null = present */; location: string; workMode: WorkMode; stack: string[]; highlights: string[] }
export interface ProjectItem { slug: string; name: string; summary: string; highlights: string[]; stack: string[]; repoUrl?: string; closedSource: boolean }
```

- Produces (values; each file exports one constant typed with `satisfies` or an annotation):
  - **`SECTIONS: readonly SectionLink[]`:** in order `about`/About, `projects`/Projects, `experience`/Experience, `contact`/Contact.
  - **`PROFILE: Profile`:**
    `{ name: 'Kerem Can Bas', role: 'Full-stack engineer', location: 'Istanbul, Türkiye', school: 'Fatih Sultan Mehmet Vakıf University', graduation: '2027-06', availability: 'Open to full-stack roles · 2027', email: 'keremvona@gmail.com' }`
  - **`LINKS: Record<'email' | 'github' | 'linkedin' | 'resume', ExternalLink>`:**
    - `email`: `mailto:keremvona@gmail.com`
    - `github`: `https://github.com/KeremVona`
    - `linkedin`: `https://linkedin.com/in/kerem-can-bas`
    - `resume`: `/Kerem-Can-Bas-Resume.pdf`, label `Résumé`
  - **`EXPERIENCE: ExperienceItem[]`:** newest first, five entries transcribed **verbatim** from `reference/resume.pdf` page 1.
    - `highlights` are the bullets. `stack` is the italic tech line split on `, `. `start`/`end` use `YYYY-MM`.
    - `companyUrl` values (taken from the PDF's link targets):
      - Ihlas Holding: `https://ihlas.com.tr/`
      - Dijital Varlıklar: `https://dijitalvarliklar.com.tr/`
      - OBSS: `https://obss.tech/`
      - InfinitumIT: `https://www.infinitumit.com.tr`
      - Freelance: none
  - **`PROJECTS: ProjectItem[]`:** HOI4 first.
    - **HOI4 Multiplayer Platform:**
      - `slug: 'hoi4-multiplayer'`, `closedSource: true`, no `repoUrl`
      - `stack: []`. The résumé doesn't list it; Kerem supplies it in the Projects session.
      - `summary: 'Ranked matches, save-file parsing and anti-cheat for Hearts of Iron IV.'`
      - `highlights`: the résumé bullets, verbatim.
    - **Agricultural Management Platform:**
      - `slug: 'agritech'`, `closedSource: false`, `repoUrl: 'https://github.com/KeremVona/agritech'`
      - `stack: ['PyTorch Lightning', 'DINOv2', 'Stable Diffusion', 'React', 'TypeScript', 'WebGL', 'GLSL']`
      - `summary: 'A vision-transformer pipeline for crop disease detection, with a real-time WebGL viewer for disease progression.'`
      - `highlights`: the résumé bullets, verbatim.
      - The résumé reads "Agricultural Management and Platform"; this plan drops the "and". Flag it for confirmation in the Projects session.

- [ ] **Step 1: Write `types.ts`**, exactly as in the Interfaces block.
- [ ] **Step 2: Write the five data files** with the values above.
- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run lint && npm run format:check`
Expected: all three exit 0.

Then compare `experience.ts` against résumé page 1, bullet by bullet. Expected: no wording differences.

- [ ] **Step 4: Commit**

```bash
git add src/content && git commit -m "feat: add typed profile, links, experience and project content"
```

---

### Task 4: Page shell (nav, placeholder hero, anchored sections, footer)

**Files:**
- Create:
  - `src/components/Section.tsx`, `src/components/SkipLink.tsx`, `src/components/Nav.tsx`
  - `src/sections/Hero.tsx`, `src/sections/About.tsx`, `src/sections/Projects.tsx`, `src/sections/Experience.tsx`, `src/sections/Footer.tsx`
  - `public/Kerem-Can-Bas-Resume.pdf` (copied from `reference/resume.pdf`)
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `SECTIONS`, `PROFILE`, `LINKS`, `EXPERIENCE`, `PROJECTS`, `SectionId` (Task 3); the token utilities (Task 2).
- Produces:
  - **`Section({ id, title, children }: { id: SectionId; title: string; children?: ReactNode })`:**
    - Renders `<section id={id} aria-labelledby={`${id}-title`}>` with class `scroll-mt-24`.
    - Contains `<h2 id={`${id}-title`} className="font-display …">`.
    - The content sits in the shared container `mx-auto max-w-6xl px-4 sm:px-6`. The 16px mobile gutter is Claude's call.
  - **`SkipLink()`:** `<a href="#main">Skip to content</a>`, using `sr-only` until focused (`focus:not-sr-only` plus a fixed, visible position).
  - **`Nav()`:**
    - `<header>` containing `<nav aria-label="Primary">`.
    - The name links to `#top`.
    - `SECTIONS` render as anchor links, `hidden sm:flex`. Hiding them below 640px is Claude's call, revisited in the hero session.
    - The résumé link uses `href={LINKS.resume.href}` with `download="Kerem-Can-Bas-Resume.pdf"`, shows the lucide `Download` icon (`aria-hidden`), and is labelled "Résumé".
    - The nav is not sticky (decided in the hero session).
  - **`Hero()`:**
    - `<section id="top" aria-labelledby="hero-title">` on cream, with no art yet.
    - The `PROFILE.availability` pill.
    - `<h1 id="hero-title" className="font-display">Rooted in the back end. Blooming on the front.</h1>` (a placeholder).
    - The sub line: "I'm Kerem, a full-stack engineer finishing my Software Engineering degree in Istanbul."
  - **About / Projects / Experience:**
    - Each uses `Section`, with `SECTIONS` labels as titles.
    - About shows `PROFILE.school`.
    - Projects lists `PROJECTS` names.
    - Experience lists `role — company` for each `EXPERIENCE` item.
    - These are plain lists; styling comes in the section plans.
  - **`Footer()`:**
    - `<footer>` wrapping `Section id="contact"`.
    - A list of the four `LINKS`. External links use `rel="noopener noreferrer"`.
    - A `© {new Date().getFullYear()} Kerem Can Bas` line.
  - **`App()`:** `<SkipLink/><Nav/><main id="main" tabIndex={-1}><Hero/><About/><Projects/><Experience/></main><Footer/>`

- [ ] **Step 1: Copy the résumé:** `cp reference/resume.pdf public/Kerem-Can-Bas-Resume.pdf`
- [ ] **Step 2: Write the components, sections and `App.tsx`** as specified.
- [ ] **Step 3: Static checks**

Run: `npm run typecheck && npm run lint && npm run format:check && npm run build`
Expected: all exit 0.

- [ ] **Step 4: Browser checks** (dev server, browser pane, desktop size first)
  - **4a, anchors:** for each `SECTIONS` id, click its nav link and run `document.getElementById(id + '-title').getBoundingClientRect().top`. Expected: `>= 0` for every id, and `location.hash` equals `#<id>`.
  - **4b, 360px:** resize to 360×800 and run `document.documentElement.scrollWidth <= 360`. Expected: `true`. The name and the "Résumé" link are both visible in a screenshot.
  - **4c, keyboard:** reload and press Tab once. Expected: `document.activeElement.textContent === 'Skip to content'` and its `getBoundingClientRect().width > 1`. Press Enter, then Tab through the nav. Expected: each focused link shows the cornflower outline in a screenshot.
  - **4d, résumé:** run `(await fetch('/Kerem-Can-Bas-Resume.pdf')).headers.get('content-type')`. Expected: `"application/pdf"`.
  - Reset the viewport to desktop afterwards.

- [ ] **Step 5: Commit**

```bash
git add public/Kerem-Can-Bas-Resume.pdf src && git commit -m "feat: add page shell with nav, skip link, placeholder hero and anchored sections"
```

---

### Task 5: Head metadata, site URL and favicon

**Files:**
- Modify: `index.html`
- Create: `.env`
- Replace: `public/favicon.svg`

**Interfaces:**
- Produces: `VITE_SITE_URL`, the single site-URL setting. `.env` holds the local value; CI overrides it from the repo variable `SITE_URL` (Task 6). Process env beats `.env` in Vite.

- [ ] **Step 1: Write `.env`:** `VITE_SITE_URL=http://localhost:4173`

- [ ] **Step 2: Write the `index.html` head**
  - `lang="en"`
  - `<title>Kerem Can Bas — Full-stack engineer</title>`
  - `meta description`: "Kerem Can Bas is a full-stack engineer and final-year Software Engineering student in Istanbul, building web apps with .NET, React and TypeScript."
  - `meta theme-color #FBF7EE`
  - `<link rel="canonical" href="%VITE_SITE_URL%/">`
  - `og:type website`, `og:title` (same as `<title>`), `og:description` (same as the description), `og:url %VITE_SITE_URL%/`
  - `twitter:card summary` (becomes `summary_large_image` when the hero plan adds `og:image`)
  - `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`

- [ ] **Step 3: Write `public/favicon.svg`:** a five-petal flower: cream petals and a poppy centre, both with ink outlines.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><g fill="#FBF7EE" stroke="#1C2A1E" stroke-width="1.4"><ellipse cx="16" cy="8.5" rx="4.2" ry="6.5"/><ellipse cx="16" cy="8.5" rx="4.2" ry="6.5" transform="rotate(72 16 16)"/><ellipse cx="16" cy="8.5" rx="4.2" ry="6.5" transform="rotate(144 16 16)"/><ellipse cx="16" cy="8.5" rx="4.2" ry="6.5" transform="rotate(216 16 16)"/><ellipse cx="16" cy="8.5" rx="4.2" ry="6.5" transform="rotate(288 16 16)"/></g><circle cx="16" cy="16" r="4" fill="#E0603A" stroke="#1C2A1E" stroke-width="1.4"/></svg>
```

- [ ] **Step 4: Verify the URL substitution, including the CI override**

Run: `npm run build && grep -c "%VITE_SITE_URL%" dist/index.html ; VITE_SITE_URL=https://example.dev npm run build && grep -o 'rel="canonical" href="[^"]*"' dist/index.html`

Expected:
- The first count is `0`.
- The second build prints `rel="canonical" href="https://example.dev/"`.

Then run `npm run build` again so `dist/` holds the local values.

- [ ] **Step 5: Commit**

```bash
git add index.html .env public/favicon.svg && git commit -m "feat: add page metadata, site URL setting and flower favicon"
```

---

### Task 6: Manual deploy workflow and README

**Files:**
- Create: `.github/workflows/deploy.yml`
- Replace: `README.md`

- [ ] **Step 1: Write `deploy.yml`**
  - `on: workflow_dispatch` only, with the comment `# Cutover: add "push: branches: [main]"`.
  - `permissions: { contents: read, pages: write, id-token: write }`
  - `concurrency: { group: pages, cancel-in-progress: false }`
  - **`build` job** (`ubuntu-latest`):
    - `actions/checkout@v7`
    - `actions/setup-node@v7` with `node-version: 24`, `cache: npm`
    - `npm ci`, `npm run lint`, `npm run format:check`
    - A guard step that fails with "Repo variable SITE_URL is not set" when `${{ vars.SITE_URL }}` is empty, so a build can never ship localhost or empty URLs.
    - `npm run build` with `env: { VITE_SITE_URL: ${{ vars.SITE_URL }} }`
    - `actions/configure-pages@v6`
    - `actions/upload-pages-artifact@v5` with `path: dist`
  - **`deploy` job:**
    - `needs: build`
    - `environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }`
    - `actions/deploy-pages@v5` with `id: deployment`

- [ ] **Step 2: Write `README.md`**

Sections: one paragraph on what the site is, a link to the spec, the npm scripts table, the folder map (spec §7), and a **Launch checklist**:
1. Buy the domain.
2. Create the GitHub repo and push.
3. Settings → Pages → Source: GitHub Actions.
4. Set the repo variable `SITE_URL=https://<domain>`.
5. Add `public/CNAME` containing the domain.
6. Add the DNS records from GitHub's custom-domain docs.
7. Run the Deploy workflow manually.
8. Enable "Enforce HTTPS".
9. Add the `push` trigger.
10. Update the résumé link.

- [ ] **Step 3: Validate**

Run: `npx -y @action-validator/cli@0.6.0 .github/workflows/deploy.yml && npm run format:check`
Expected: the validator exits 0 with no errors, and Prettier passes.

- [ ] **Step 4: Commit**

```bash
git add .github README.md && git commit -m "ci: add manual GitHub Pages deploy workflow and launch checklist"
```

---

### Task 7: Whole-shell verification

- [ ] **Step 1: Run Lighthouse against the production build**

Start `npm run preview` (port 4173) in the background, then run:

`npx -y lighthouse@13.6.0 http://localhost:4173 --form-factor=mobile --chrome-flags="--headless=new" --output=json --output-path="$TEMP/lh-scaffold.json" --quiet && node -e "const r=require(process.env.TEMP+'/lh-scaffold.json');for(const[k,v]of Object.entries(r.categories))console.log(k,Math.round(v.score*100))"`

Expected:
- performance ≥ 90
- accessibility, best-practices and seo each ≥ 95

If any is below target, fix it in the owning task's files, re-run, and commit as `fix: <audit>`.

- [ ] **Step 2: Re-run Review Focus 1–3** at 360px and at desktop width, as in Task 4 Step 4. Expected: same results.

- [ ] **Step 3: Confirm the tree is clean and nothing private is tracked**

Run: `git status --short && git ls-files | grep -E "^(reference|\.superpowers)/"`
Expected: both print nothing.
