# VISION 2031 · The McGaffie Legacy Game

“Where do you see yourself in five years?”

A static, local-first five-year vision, leadership, entrepreneurship, research, and wealth-literacy game. The cinematic Vision Story is a possible future for visualization; the Real Plan converts it into measurable action; the Learning Lab grounds factual instruction in official sources. Outcomes are never promised.

## Run locally

Requires Node.js 22+.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run dev
```

Open the Vite URL. Other commands: `pnpm run lint`, `typecheck`, `test`, `test:e2e`, `validate:content`, `build`, `preview`, and the full `pnpm run verify`.

## Architecture

React, strict TypeScript, Vite, and `HashRouter` produce a serverless GitHub Pages app under `/Vision/`. Typed content feeds a deterministic chapter generator covering every date from July 11, 2026 through August 31, 2031. A versioned localStorage state layer holds profile, progress, journal, course, and portfolio data. Zod validates backup imports. No runtime API, analytics, account, or server receives private entries.

## GitHub Pages deployment

The workflow at `.github/workflows/deploy.yml` verifies and deploys `dist` with the supported Pages artifact flow. In repository **Settings → Pages**, set **Source** to **GitHub Actions**. Push `main` or run the workflow manually. Vite’s base is `/Vision/`; hash URLs refresh safely.

## Assets

No source vision-board image or PDF was present in this checkout. To add the optional visual later, optimize the board as `public/assets/vision-board.webp` and provide meaningful alt text wherever used. Do not publish the source PDF unless explicitly authorized.

See [product specification](docs/PRODUCT_SPEC.md), [story bible](docs/STORY_BIBLE.md), [curriculum](docs/CURRICULUM_MAP.md), [content model](docs/CONTENT_MODEL.md), [sources](docs/SOURCES.md), [deployment](docs/DEPLOYMENT.md), [maintenance](docs/MAINTENANCE.md), and [privacy](docs/PRIVACY.md).
