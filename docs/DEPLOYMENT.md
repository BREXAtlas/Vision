# Deployment

The repository is a Vite multi-page build with three public entry points:

- `/index.html` — Vision Life simulation
- `/app.html#/` — complete Vision 2031 React application
- `/auth-callback.html` — Supabase email-link callback for secure Cloud Memory

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
   - `https://brexatlas.github.io/Vision/auth-callback.html`

Vite uses relative asset URLs so the same artifact works under the `/Vision/` project path and under a future custom domain. `HashRouter` keeps the full application’s client-side routes compatible with static GitHub Pages hosting and browser refreshes.

## Supabase Cloud Memory

The production table and RLS policies are recorded in:

`supabase/migrations/20260719_create_vision_memory.sql`

Before testing email sign-in, add the following under **Supabase → Authentication → URL Configuration → Redirect URLs**:

```text
https://brexatlas.github.io/Vision/auth-callback.html
http://localhost:5173/auth-callback.html
```

When a custom domain is enabled, also add:

```text
https://YOUR-CUSTOM-DOMAIN/auth-callback.html
```

The browser uses only the Supabase publishable key. Do not add a service-role key to GitHub, Vite variables, client JavaScript, or GitHub Pages.

## Custom domain

When an exact custom domain is selected:

1. Add the bare domain to `public/CNAME`.
2. Enter the same domain under **Settings → Pages → Custom domain**.
3. Configure the required DNS records with the domain provider.
4. Add the custom-domain callback URL to Supabase Auth.
5. Enable **Enforce HTTPS** after GitHub provisions the certificate.
6. Re-run deployment and test the simulation, full app, and email callback.

Do not commit a placeholder `CNAME`; GitHub Pages treats its contents as the real domain.

The deployment uses `configure-pages`, `upload-pages-artifact`, and `deploy-pages`; no deployment secret is required.
