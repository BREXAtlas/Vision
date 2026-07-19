const SUPABASE_URL = 'https://rceqidouaazdlimtivfq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Xtiu88oQn1d7n7JZMcSmeg_vJA6u2RP';

const AUTH_KEY = 'vision-cloud-auth-v1';
const META_KEY = 'vision-cloud-meta-v1';
const APP_STATE_KEY = 'vision2031-state';
const SIMULATION_STATE_KEY = 'visionlife';

interface CloudSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
  email?: string;
}

interface CloudMeta {
  lastObservedSnapshot?: string;
  lastPushedSnapshot?: string;
  lastCloudUpdatedAt?: string;
  lastLocalChangeAt?: string;
  conflictResolved?: boolean;
}

interface CloudRow {
  app_state: unknown | null;
  simulation_state: unknown | null;
  updated_at: string;
}

interface LocalBundle {
  appState: unknown | null;
  simulationState: unknown | null;
}

let session: CloudSession | null = null;
let cloudRow: CloudRow | null = null;
let cloudReady = false;
let syncing = false;
let syncTimer: number | null = null;
let statusText = 'Saved on this device';

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function readMeta(): CloudMeta {
  return safeParse<CloudMeta>(localStorage.getItem(META_KEY)) ?? {};
}

function writeMeta(meta: CloudMeta): void {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function saveSession(value: CloudSession | null): void {
  session = value;
  try {
    if (value) localStorage.setItem(AUTH_KEY, JSON.stringify(value));
    else localStorage.removeItem(AUTH_KEY);
  } catch {
    // Ignore storage failures and keep the in-memory session for this visit.
  }
  updateCloudButton();
}

function loadSession(): CloudSession | null {
  const stored = safeParse<CloudSession>(localStorage.getItem(AUTH_KEY));
  if (!stored?.accessToken || !stored.refreshToken || !stored.userId) return null;
  return stored;
}

async function refreshSession(current: CloudSession): Promise<CloudSession | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: current.refreshToken }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      user?: { id?: string; email?: string };
    };
    const payload = decodeJwtPayload(data.access_token);
    const next: CloudSession = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      userId: data.user?.id ?? String(payload?.sub ?? current.userId),
      email: data.user?.email ?? String(payload?.email ?? current.email ?? ''),
    };
    saveSession(next);
    return next;
  } catch {
    return null;
  }
}

async function activeSession(): Promise<CloudSession | null> {
  if (!session) return null;
  if (session.expiresAt > Date.now() + 60_000) return session;
  const refreshed = await refreshSession(session);
  if (!refreshed) {
    saveSession(null);
    setStatus('Cloud sign-in expired');
  }
  return refreshed;
}

function collectLocalBundle(): LocalBundle {
  return {
    appState: safeParse<unknown>(localStorage.getItem(APP_STATE_KEY)),
    simulationState: safeParse<unknown>(localStorage.getItem(SIMULATION_STATE_KEY)),
  };
}

function bundleSnapshot(bundle = collectLocalBundle()): string {
  return JSON.stringify(bundle);
}

function hasMeaningfulLocalState(bundle: LocalBundle): boolean {
  return bundle.appState !== null || bundle.simulationState !== null;
}

function setStatus(message: string): void {
  statusText = message;
  const status = document.querySelector<HTMLElement>('[data-cloud-status]');
  if (status) status.textContent = message;
  updateCloudButton();
}

function updateCloudButton(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-cloud-open]');
  if (!button) return;
  button.textContent = session ? '☁ Cloud Memory' : '☁ Save Across Devices';
  button.setAttribute('aria-label', session ? `Cloud memory: ${statusText}` : 'Set up secure cloud memory');
}

async function authorizedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const current = await activeSession();
  if (!current) throw new Error('Sign in is required.');
  const headers = new Headers(init.headers);
  headers.set('apikey', SUPABASE_KEY);
  headers.set('Authorization', `Bearer ${current.accessToken}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return fetch(`${SUPABASE_URL}${path}`, { ...init, headers });
}

async function fetchCloudRow(): Promise<CloudRow | null> {
  const current = await activeSession();
  if (!current) return null;
  const response = await authorizedFetch(
    `/rest/v1/vision_memory?user_id=eq.${encodeURIComponent(current.userId)}&select=app_state,simulation_state,updated_at`,
  );
  if (!response.ok) throw new Error(`Cloud read failed (${response.status}).`);
  const rows = (await response.json()) as CloudRow[];
  return rows[0] ?? null;
}

async function pushLocalToCloud(reason = 'Saved to cloud'): Promise<void> {
  if (syncing) return;
  const current = await activeSession();
  if (!current) return;
  syncing = true;
  setStatus('Syncing…');
  try {
    const bundle = collectLocalBundle();
    const now = new Date().toISOString();
    const response = await authorizedFetch('/rest/v1/vision_memory?on_conflict=user_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({
        user_id: current.userId,
        app_state: bundle.appState,
        simulation_state: bundle.simulationState,
        updated_at: now,
      }),
    });
    if (!response.ok) throw new Error(`Cloud write failed (${response.status}).`);
    const rows = (await response.json()) as CloudRow[];
    cloudRow = rows[0] ?? {
      app_state: bundle.appState,
      simulation_state: bundle.simulationState,
      updated_at: now,
    };
    const snapshot = bundleSnapshot(bundle);
    writeMeta({
      ...readMeta(),
      lastObservedSnapshot: snapshot,
      lastPushedSnapshot: snapshot,
      lastCloudUpdatedAt: cloudRow.updated_at,
      conflictResolved: true,
    });
    cloudReady = true;
    setStatus(reason);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'Cloud sync failed');
  } finally {
    syncing = false;
  }
}

function restoreCloudToDevice(): void {
  if (!cloudRow) return;
  try {
    if (cloudRow.app_state !== null) {
      localStorage.setItem(APP_STATE_KEY, JSON.stringify(cloudRow.app_state));
    }
    if (cloudRow.simulation_state !== null) {
      localStorage.setItem(SIMULATION_STATE_KEY, JSON.stringify(cloudRow.simulation_state));
    }
    const snapshot = bundleSnapshot();
    writeMeta({
      ...readMeta(),
      lastObservedSnapshot: snapshot,
      lastPushedSnapshot: snapshot,
      lastCloudUpdatedAt: cloudRow.updated_at,
      conflictResolved: true,
    });
    setStatus('Restored from cloud');
    window.setTimeout(() => window.location.reload(), 450);
  } catch {
    setStatus('Could not restore cloud memory');
  }
}

async function reconcileCloud(): Promise<void> {
  if (!session) return;
  try {
    cloudRow = await fetchCloudRow();
    const bundle = collectLocalBundle();
    const meta = readMeta();
    if (!cloudRow) {
      cloudReady = true;
      if (hasMeaningfulLocalState(bundle)) await pushLocalToCloud('First cloud backup created');
      else setStatus('Cloud memory ready');
      return;
    }

    const cloudChanged = meta.lastCloudUpdatedAt !== cloudRow.updated_at;
    const localSnapshot = bundleSnapshot(bundle);
    const localChanged =
      meta.lastPushedSnapshot !== undefined && meta.lastPushedSnapshot !== localSnapshot;

    if (!hasMeaningfulLocalState(bundle)) {
      restoreCloudToDevice();
      return;
    }

    if (cloudChanged && !localChanged && meta.lastCloudUpdatedAt) {
      restoreCloudToDevice();
      return;
    }

    if (cloudChanged && (!meta.conflictResolved || localChanged || !meta.lastCloudUpdatedAt)) {
      cloudReady = false;
      setStatus('Choose which memory to keep');
      openCloudDialog(true);
      return;
    }

    cloudReady = true;
    setStatus('Cloud memory is current');
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'Cloud connection failed');
  }
}

async function sendMagicLink(email: string): Promise<void> {
  const callback = new URL('./auth-callback.html', window.location.href);
  callback.searchParams.set('return', window.location.pathname.endsWith('app.html') ? 'app' : 'simulation');
  const response = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      create_user: true,
      options: { email_redirect_to: callback.toString() },
    }),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Could not send sign-in link (${response.status}).`);
  }
}

function signOut(): void {
  saveSession(null);
  cloudRow = null;
  cloudReady = false;
  writeMeta({});
  setStatus('Saved on this device');
  closeCloudDialog();
}

function scheduleSync(): void {
  if (syncTimer !== null) window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => {
    syncTimer = null;
    void pushLocalToCloud();
  }, 1_500);
}

function observeLocalChanges(): void {
  const current = bundleSnapshot();
  const meta = readMeta();
  if (current !== meta.lastObservedSnapshot) {
    writeMeta({
      ...meta,
      lastObservedSnapshot: current,
      lastLocalChangeAt: new Date().toISOString(),
    });
    if (session && cloudReady) scheduleSync();
  }
}

function cloudDialogMarkup(conflict: boolean): string {
  const signedIn = Boolean(session);
  return `
    <div class="vision-cloud-card" role="document">
      <button type="button" class="vision-cloud-close" data-cloud-close aria-label="Close cloud memory">×</button>
      <p class="vision-cloud-kicker">Secure persistent memory</p>
      <h2>${signedIn ? 'Your vision follows you' : 'Keep your progress across devices'}</h2>
      <p data-cloud-status>${statusText}</p>
      ${
        signedIn
          ? `
            <p class="vision-cloud-account">Signed in${session?.email ? ` as ${escapeHtml(session.email)}` : ''}.</p>
            ${
              conflict
                ? `<div class="vision-cloud-conflict" role="alert">
                    <strong>Both this device and the cloud have memory.</strong>
                    <p>Choose the version to keep. Nothing is overwritten until you choose.</p>
                  </div>`
                : ''
            }
            <div class="vision-cloud-actions">
              <button type="button" data-cloud-push>${conflict ? 'Keep this device' : 'Sync now'}</button>
              <button type="button" data-cloud-restore ${cloudRow ? '' : 'disabled'}>Restore latest cloud memory</button>
              <button type="button" class="secondary" data-cloud-signout>Sign out</button>
            </div>
          `
          : `
            <p>Your progress already saves automatically in this browser. Sign in by email to back up both the Vision Life simulation and the full Vision 2031 app in your private Supabase row.</p>
            <form data-cloud-form>
              <label for="vision-cloud-email">Email address</label>
              <input id="vision-cloud-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com" />
              <button type="submit">Send secure sign-in link</button>
            </form>
            <p class="vision-cloud-note">The link signs you in without a password. Supabase Row Level Security prevents other users from reading your memory.</p>
          `
      }
    </div>
  `;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };
    return entities[character];
  });
}

function closeCloudDialog(): void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-cloud-dialog]');
  if (dialog?.open) dialog.close();
}

function bindDialogActions(dialog: HTMLDialogElement): void {
  dialog.querySelector('[data-cloud-close]')?.addEventListener('click', closeCloudDialog);
  dialog.querySelector('[data-cloud-signout]')?.addEventListener('click', signOut);
  dialog.querySelector('[data-cloud-restore]')?.addEventListener('click', restoreCloudToDevice);
  dialog.querySelector('[data-cloud-push]')?.addEventListener('click', () => {
    cloudReady = true;
    writeMeta({ ...readMeta(), conflictResolved: true });
    void pushLocalToCloud('This device is now the cloud version').then(closeCloudDialog);
  });
  dialog.querySelector<HTMLFormElement>('[data-cloud-form]')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get('email');
    if (typeof email !== 'string' || !email.trim()) return;
    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (submit) submit.disabled = true;
    setStatus('Sending secure link…');
    try {
      await sendMagicLink(email.trim());
      setStatus('Check your email and open the sign-in link');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not send sign-in link');
      if (submit) submit.disabled = false;
    }
  });
}

function openCloudDialog(conflict = false): void {
  let dialog = document.querySelector<HTMLDialogElement>('[data-cloud-dialog]');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.dataset.cloudDialog = '';
    document.body.append(dialog);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeCloudDialog();
    });
  }
  dialog.innerHTML = cloudDialogMarkup(conflict);
  bindDialogActions(dialog);
  if (!dialog.open) dialog.showModal();
}

function installCloudUi(): void {
  if (!document.querySelector('[data-cloud-open]')) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.cloudOpen = '';
    button.className = 'vision-cloud-open';
    button.addEventListener('click', () => openCloudDialog(!cloudReady && Boolean(cloudRow)));
    document.body.append(button);
  }

  const style = document.createElement('style');
  style.textContent = `
    .vision-cloud-open{position:fixed;right:16px;bottom:16px;z-index:120;border:1px solid #d4af37;border-radius:999px;background:#0e1834;color:#f0da9b;padding:10px 15px;font:700 13px/1 Inter,system-ui,sans-serif;box-shadow:0 10px 35px rgba(0,0,0,.35);cursor:pointer}
    .vision-cloud-open:focus-visible{outline:3px solid #2fa8ab;outline-offset:3px}
    dialog[data-cloud-dialog]{width:min(92vw,520px);border:1px solid #243259;border-radius:18px;padding:0;background:#0e1834;color:#f3eddd;box-shadow:0 25px 90px rgba(0,0,0,.65)}
    dialog[data-cloud-dialog]::backdrop{background:rgba(4,8,20,.78);backdrop-filter:blur(5px)}
    .vision-cloud-card{position:relative;padding:26px;font-family:Inter,system-ui,sans-serif}
    .vision-cloud-card h2{margin:5px 0 10px;font:700 30px/1.05 'Cormorant Garamond',Georgia,serif;color:#f0da9b}
    .vision-cloud-card p{line-height:1.55;color:#c1c8dc}
    .vision-cloud-kicker{text-transform:uppercase;letter-spacing:.18em;font-size:11px!important;font-weight:700;color:#d4af37!important}
    .vision-cloud-close{position:absolute;right:12px;top:10px;border:0;background:transparent;color:#9ba6c4;font-size:28px;cursor:pointer}
    .vision-cloud-card label{display:block;margin:16px 0 6px;color:#9ba6c4;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em}
    .vision-cloud-card input{width:100%;box-sizing:border-box;border:1px solid #243259;border-radius:10px;background:#131f42;color:#f3eddd;padding:12px;font:inherit}
    .vision-cloud-card button:not(.vision-cloud-close){border:1px solid #d4af37;border-radius:10px;background:linear-gradient(120deg,#d4af37,#b8860b);color:#141002;padding:11px 14px;font-weight:800;cursor:pointer}
    .vision-cloud-card form button{width:100%;margin-top:10px}
    .vision-cloud-actions{display:grid;gap:9px;margin-top:16px}
    .vision-cloud-card button.secondary{background:transparent;color:#c1c8dc;border-color:#243259}
    .vision-cloud-card button:disabled{opacity:.45;cursor:not-allowed}
    .vision-cloud-note{font-size:12px}.vision-cloud-account{font-size:13px}.vision-cloud-conflict{margin-top:12px;padding:12px;border:1px solid #d4af37;border-radius:10px;background:rgba(212,175,55,.08)}
    @media(max-width:600px){.vision-cloud-open{right:10px;bottom:10px}.vision-cloud-card{padding:22px 18px}}
  `;
  document.head.append(style);
  updateCloudButton();
}

function replaceLegacySimulationMemory(): void {
  const global = window as unknown as Record<string, unknown>;
  try {
    localStorage.removeItem('supa_url');
    localStorage.removeItem('supa_key');
  } catch {
    // Ignore restricted storage.
  }
  global.supaSave = async () => undefined;
  global.supaLoad = async () => false;
  global.saveSupa = () => openCloudDialog();
  global.pullSupa = () => openCloudDialog(Boolean(cloudRow));
  global.vSet = () => {
    const view = document.getElementById('view');
    if (!view) return;
    view.innerHTML = `
      <div class="card">
        <span class="stime">Memory</span>
        <h2 class="stitle">Your story remembers</h2>
        <p class="narrative">Every choice, quiz, family name, venture, point, and journal event saves automatically in this browser. Close the page and return later on this device—the story continues where you left it.</p>
        <div class="lesson"><span class="ltag">Cross-device backup</span><p>Use secure Cloud Memory to carry the same story to another phone or computer. Email authentication and Row Level Security protect your private record.</p></div>
        <div class="choices" style="margin-top:14px"><button class="btn" type="button" id="secureCloudMemory">☁ Open Secure Cloud Memory</button></div>
        <p class="memory" data-cloud-status>${escapeHtml(statusText)}</p>
      </div>
      <div class="card"><span class="stime">Danger zone</span><div class="choices"><button class="btn ghost" style="color:var(--bad);border-color:var(--bad)" onclick="if(confirm('Erase the entire story and start Day 1 fresh?')){S=JSON.parse(JSON.stringify(DEFAULT));saveState();render();toast('New timeline begun.');}">Reset the timeline</button></div></div>
    `;
    document.getElementById('secureCloudMemory')?.addEventListener('click', () => openCloudDialog(!cloudReady && Boolean(cloudRow)));
  };
}

async function initializeCloudMemory(): Promise<void> {
  installCloudUi();
  replaceLegacySimulationMemory();
  session = loadSession();
  updateCloudButton();
  const snapshot = bundleSnapshot();
  const meta = readMeta();
  writeMeta({ ...meta, lastObservedSnapshot: meta.lastObservedSnapshot ?? snapshot });
  if (session) await reconcileCloud();
  window.setInterval(observeLocalChanges, 2_500);
  window.setInterval(() => {
    if (session && cloudReady) void reconcileCloud();
  }, 60_000);
}

void initializeCloudMemory();
