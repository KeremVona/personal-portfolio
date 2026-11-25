# Kerem Can Bas — Portfolio

The personal portfolio site of Kerem Can Bas, a full-stack engineer. It's a single static page (Hero, About, Projects, Experience, Footer) that lives in the footer picture's world: one sky that deepens down the page to a hilltop computer, Projects as classic computer windows, and subtle motion.

Design decisions live in [`docs/superpowers/specs/2026-11-20-portfolio-foundation-design.md`](docs/superpowers/specs/2026-11-20-portfolio-foundation-design.md).

## Scripts

| Command                | What it does                                  |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Start the dev server                          |
| `npm run build`        | Type-check and build to `dist/`               |
| `npm run preview`      | Serve the production build locally            |
| `npm run lint`         | Lint with Oxlint                              |
| `npm run typecheck`    | Type-check only                               |
| `npm run format`       | Format with Prettier (sorts Tailwind classes) |
| `npm run format:check` | Check formatting without writing              |

## Where things live

```
src/
  index.css     Tailwind import, footer-palette tokens (@theme), the sky gradients, fonts, base styles
  content/      Typed site content: profile, links, experience, projects, nav sections
  components/   Shared UI (Section, Nav, SkipLink …)
  sections/     One component per page section
public/         Résumé PDF, favicon
```

To update a job, project or link, edit the matching file in `src/content/`. The layout code stays untouched.

`VITE_SITE_URL` (in `.env` locally, from the repo variable `SITE_URL` in CI) sets the canonical and Open Graph URLs.

## Launch checklist

Deploys run only when started by hand until launch.

The site goes on **GitHub Pages** at **keremvona.com** (www.keremvona.com redirects to it). The repo is public, so Pages is free.

1. ~~Buy the domain.~~ Done: keremvona.com.
2. ~~Create the GitHub repo and push this project.~~ Done: KeremVona/personal-portfolio.
3. Repo Settings → Pages → Source: **GitHub Actions**.
4. Repo Settings → Secrets and variables → Actions → Variables: set `SITE_URL=https://keremvona.com` (no trailing slash).
5. Recommended: verify the domain in your **account** Settings → Pages → Add a domain. GitHub gives you a TXT record to add at your registrar. This prevents domain takeover.
6. At your registrar's DNS settings, remove any parking or forwarding records for the root and `www`, then add:
   - **A**, name `@`, four records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - **AAAA**, name `@`, four records: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - **CNAME**, name `www`: `keremvona.github.io`

   Check them against GitHub's [custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) before saving.

7. Repo Settings → Pages → **Custom domain**: enter `keremvona.com` and Save. Deploys from a workflow ignore a `CNAME` file, so this setting is the one that counts. Without it the site would publish under `keremvona.github.io/personal-portfolio/`, where the root-relative asset paths break.
8. Add screenshots for the HOI4 project in `src/content/projects.ts` (AgriTech has its own).
9. Actions → Deploy → **Run workflow**.
10. Repo Settings → Pages: enable **Enforce HTTPS** once the certificate is issued (DNS can take up to a day).
11. In `.github/workflows/deploy.yml`, add `push: branches: [main]` under `on:`, so every push to main deploys.
12. Update the portfolio link on the résumé.
