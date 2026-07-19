# VISION 2031 · The McGaffie Legacy Game

“Where do you see yourself in five years?”

A five-year vision, leadership, entrepreneurship, research, and wealth-literacy experience. The cinematic Vision Story is a possible future for visualization; the Real Plan converts it into measurable action; the Learning Lab grounds factual instruction in official sources. Outcomes are never promised.

## Two connected experiences

The repository now deliberately builds two entry pages from one Vite project:

- `index.html` — **Vision Life: The McGaffie Simulation**, the new Claude-created future-day story based on [`docs/McGaffie_Vision_Life.md`](docs/McGaffie_Vision_Life.md).
- `app.html` — the complete React/TypeScript **Vision 2031** application with the 15-quarter timeline, daily chapters, Academy, Wealth Lab, projects, journal, progress, Legacy Laws, Course Builder, sources, and settings.

The simulation landing page receives a navigation dock at build time so every major full-app section is one click away. Ventures created in the simulation are copied into the full app’s project portfolio when the full app already has a saved profile. The full app includes a return link to the simulation.

## Run locally

Requires Node.js 22+.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run dev
```

Open:

- `http://localhost:5173/` for the Vision Life simulation
- `http://localhost:5173/app.html#/` for the complete Vision 2031 application

Other commands: `pnpm run lint`, `typecheck`, `test`, `test:e2e`, `validate:content`, `build`, `preview`, and the full `pnpm run verify`.

## Architecture

React, strict TypeScript, Vite, and `HashRouter` produce a serverless GitHub Pages application. Vite builds both HTML entries and uses relative asset paths, so the same build works at `https://brexatlas.github.io/Vision/` and remains compatible with a later GitHub Pages custom domain.

Typed content feeds a deterministic chapter generator covering every date from July 11, 2026 through August 31, 2031. The full React app uses a versioned `localStorage` state layer for profile, progress, journal, course, and portfolio data. Zod validates backup imports.

The simulation saves locally by default. Its optional Supabase fields are user-configured and should not be used with an open read/write policy for private information. The full React journal remains browser-local unless the user explicitly exports it.

## GitHub Pages deployment

The workflow at `.github/workflows/deploy.yml` verifies and deploys `dist` with the supported Pages artifact flow.

1. In **Settings → Pages**, set **Source** to **GitHub Actions**.
2. Merge to `main` or run the workflow manually.
3. Open `https://brexatlas.github.io/Vision/`.
4. The complete app is available at `https://brexatlas.github.io/Vision/app.html#/`.

For a custom GitHub Pages domain, add the exact domain to `public/CNAME` and configure the repository’s Pages custom-domain field. No `CNAME` is committed until an exact domain is supplied.

## Vision source

The uploaded vision casting document is preserved at [`docs/McGaffie_Vision_Life.md`](docs/McGaffie_Vision_Life.md). It is an aspirational narrative source. Financial, legal, tax, aviation, estate, foundation, and investment statements should be taught with current official sources and professional boundaries in the full Learning Lab.

## Assets

To add the optional source vision board later, optimize it as `public/assets/vision-board.webp` and provide meaningful alt text wherever used. Do not publish a private source PDF unless explicitly authorized.

See [product specification](docs/PRODUCT_SPEC.md), [story bible](docs/STORY_BIBLE.md), [curriculum](docs/CURRICULUM_MAP.md), [content model](docs/CONTENT_MODEL.md), [sources](docs/SOURCES.md), [deployment](docs/DEPLOYMENT.md), [maintenance](docs/MAINTENANCE.md), and [privacy](docs/PRIVACY.md).
