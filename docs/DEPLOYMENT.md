# Deployment

1. Run `pnpm install --frozen-lockfile && pnpm run verify`.
2. Set GitHub **Settings → Pages → Source** to **GitHub Actions**.
3. Push `main` or manually dispatch **Deploy Vision 2031 to GitHub Pages**.
4. Confirm assets load under `/Vision/` and hash routes navigate after refresh.

The deployment uses `configure-pages`, `upload-pages-artifact`, and `deploy-pages`; no secret is required.
