# Deployment

The repository is a Vite multi-page build with two public entry points:

- `/index.html` — Vision Life simulation
- `/app.html#/` — complete Vision 2031 React application

## GitHub Pages project URL

1. Run `pnpm install --frozen-lockfile && pnpm run verify`.
2. Run `pnpm run test:e2e`.
3. Set GitHub **Settings → Pages → Source** to **GitHub Actions**.
4. Merge to `main` or manually dispatch **Deploy Vision 2031 to GitHub Pages**.
5. Confirm:
   - `https://brexatlas.github.io/Vision/`
   - `https://brexatlas.github.io/Vision/app.html#/`
   - `https://brexatlas.github.io/Vision/app.html#/timeline`
   - `https://brexatlas.github.io/Vision/app.html#/academy`

Vite uses relative asset URLs so the same artifact works under the `/Vision/` project path and under a future custom domain. `HashRouter` keeps the full application’s client-side routes compatible with static GitHub Pages hosting and browser refreshes.

## Custom domain

When an exact custom domain is selected:

1. Add the bare domain to `public/CNAME`.
2. Enter the same domain under **Settings → Pages → Custom domain**.
3. Configure the required DNS records with the domain provider.
4. Enable **Enforce HTTPS** after GitHub provisions the certificate.
5. Re-run the deployment and test both entry points.

Do not commit a placeholder `CNAME`; GitHub Pages treats its contents as the real domain.

The deployment uses `configure-pages`, `upload-pages-artifact`, and `deploy-pages`; no deployment secret is required.
