# Kerem Can Bas — Portfolio

The personal portfolio site of Kerem Can Bas, a full-stack engineer. It's a single static page (Hero, About, Projects, Experience, Footer) with a botanical "Meadow" look and subtle motion.

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
  index.css     Tailwind import, Meadow design tokens (@theme), fonts, base styles
  content/      Typed site content: profile, links, experience, projects, nav sections
  components/   Shared UI (Section, Nav, SkipLink …)
  sections/     One component per page section
public/         Résumé PDF, favicon
```

To update a job, project or link, edit the matching file in `src/content/`. The layout code stays untouched.

`VITE_SITE_URL` (in `.env` locally, from the repo variable `SITE_URL` in CI) sets the canonical and Open Graph URLs.

## Launch checklist

Deploys run only when started by hand until launch.

1. Buy the domain.
2. Create the GitHub repo and push this project.
3. Settings → Pages → Source: **GitHub Actions**.
4. Settings → Secrets and variables → Actions → Variables: set `SITE_URL=https://<domain>` (no trailing slash).
5. Add `public/CNAME` containing just the domain.
6. Add the DNS records from GitHub's [custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).
7. Actions → Deploy → **Run workflow**.
8. Settings → Pages: enable **Enforce HTTPS** once the certificate is issued.
9. In `.github/workflows/deploy.yml`, add `push: branches: [main]` under `on:`.
10. Update the portfolio link on the résumé.
