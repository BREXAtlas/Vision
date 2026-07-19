# Privacy

## Local memory

The Vision Life simulation and the full Vision 2031 application save progress automatically in browser `localStorage`. This allows the learner to close the page and return later on the same browser without losing choices, points, family labels, ventures, journal entries, project changes, quiz results, or progress.

Clearing browser storage, using a private browsing session, switching browsers, or changing devices can remove or isolate the local copy.

## Optional Cloud Memory

Cloud Memory is optional. It uses Supabase email authentication and the `public.vision_memory` table to synchronize:

- `visionlife` — the standalone simulation state
- `vision2031-state` — the full React application state

The table uses the authenticated Supabase user ID as its primary key. Row Level Security policies allow an authenticated user to read, create, change, or delete only the row whose `user_id` equals `auth.uid()`.

The application ships a Supabase publishable key. Publishable keys are designed for browser use and do not bypass Row Level Security. No service-role key is included in the repository.

When a device copy and cloud copy differ, the app asks the user to choose between:

- keeping the current device version; or
- restoring the latest cloud version.

The app does not silently overwrite both copies during a conflict.

## Authentication data

Cloud Memory uses an email magic link. The browser stores the resulting access and refresh tokens locally so the session can continue. Signing out removes the locally stored cloud session. Supabase Auth manages the associated authenticated user record.

## No analytics

The application does not add analytics, advertising trackers, or behavioral tracking pixels. The cloud endpoint is used only for authentication and user-requested memory synchronization.

## Export and deletion

The full app supports JSON and Markdown exports. Imports are validated, and malformed data is rejected without replacing the current state.

A user can:

- reset local sections from the app;
- clear browser storage;
- sign out of Cloud Memory; and
- delete the authenticated cloud row through a future account-deletion control or directly through the Supabase project administration tools.
