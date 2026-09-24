# AIverse

A collection of AI writing tools. A Vue app and its API are served from a single Bunny.net
Pull Zone: the built app lives in Bunny Storage, and a single-file middleware Edge Script
answers `/api/*` using the OpenAI Responses API.

| Tool | App URL | API endpoint | Response |
| --- | --- | --- | --- |
| Writer | `/write` | `POST /api/write` | streamed (SSE) |
| Re-writer | `/rewrite` | `POST /api/rewrite` | JSON, 1–5 variations |
| Reply drafter | `/reply` | `POST /api/reply` | JSON, 1–3 options |
| Headlines | `/headlines` | `POST /api/headlines` | JSON, 1–10 options with character counts |
| Summariser | `/summarise` | `POST /api/summarise` | streamed (SSE) |
| Key points | `/key-points` | `POST /api/key-points` | JSON: summary, key points, action items, decisions, open questions |
| Explain simply | `/explain` | `POST /api/explain` | streamed (SSE) |
| Tone analyser | `/tone` | `POST /api/tone` | JSON: scores, tones, issues, suggestions |

```
api/main.ts   Bunny middleware Edge Script: the whole API in one file, no build step
app/          Vue 3 + TypeScript + Tailwind v4 + Pinia + vue-router (Vite build)
```

## How it fits together

```
browser ──▶ Pull Zone (your domain)
              │
              ├─ /api/*      ──▶ middleware script (api/main.ts) ──▶ OpenAI
              │
              └─ everything else ──▶ Storage zone (app/dist)
                                      unknown paths (/tone, …) → /index.html
```

The app calls `/api` on its own origin, so no CORS is needed. The API is a single
hand-written file you paste into Bunny. Only the app has a build step, because the
browser can't run `.vue`, TypeScript or Tailwind source directly.

The middleware also sets browser cache headers:

| Paths | Cache-Control |
| --- | --- |
| `/assets/*` (hashed, never change) | `public, max-age=31536000, immutable` |
| `index.html` and SPA routes | `no-cache` |
| `/api/*` | `no-store` |

## Deploying to Bunny.net

### First-time setup

Do these steps in order. You'll need an OpenAI API key, and an access token you choose
(any long random string). Users type the access token into the app to unlock it.

1. **Create a Storage zone** (*Storage → Add Storage Zone*). Pick a main region, then
   open *FTP & API Access* and note three things: the zone name, the **password**, and
   the **hostname** (e.g. `storage.bunnycdn.com` or `uk.storage.bunnycdn.com`).
2. **Make deep links work.** In the Storage zone's *Error handling* page, set *404 File
   path* to `/index.html`, tick *Rewrite 404 to 200 status code*, and save. Now a URL like
   `/tone` loads the app instead of a 404.
3. **Create a Pull Zone** (*CDN → Add Pull Zone*) with origin type *Storage Zone*,
   pointing at the zone from step 1. This is your app's domain (`<name>.b-cdn.net`, or add
   a custom hostname). Note the Pull Zone's numeric **ID**, which appears in its dashboard
   URL.
4. **Stop the CDN caching the API.** In the Pull Zone, open *Edge Rules* and add a rule:
   - Action: *Override Cache Time*, set to `0`
   - Condition: *Request URL* matches `*/api/*`
5. **Create the API script** (*Edge Scripting → Add Script → Middleware*) and link it to
   the Pull Zone from step 3. Replace the default code with the contents of
   [`api/main.ts`](api/main.ts), then add these environment variables and publish:

   | Variable | Required | Purpose / default |
   | --- | --- | --- |
   | `OPENAI_TOKEN` | yes | your OpenAI API key |
   | `AUTH_TOKEN` | yes | the access token users enter in the app |
   | `DEFAULT_MODEL` | no | defaults to `gpt-5.6-terra` |
   | `DEFAULT_REASONING_EFFORT` | no | defaults to `low` |
   | `TIMEOUT` | no | seconds to wait for OpenAI to start responding; defaults to `60` |
   | `ALLOWED_ORIGINS` | no | only needed if the app is hosted on a different origin |

6. **Deploy the app.** Follow [Updating the app](#updating-the-app) below.
7. **Check it works** (replace the domain with your Pull Zone's):

   ```bash
   curl https://your-zone.b-cdn.net/api/health
   ```

   It should print `{"ok":true}`. Then open `https://your-zone.b-cdn.net/tone`. You should
   see the unlock screen, and entering your `AUTH_TOKEN` should take you to the Tone
   analyser.

### Updating the app

With the deploy script (recommended), set up your credentials once:

```bash
cd app && cp .env.deploy.example .env.deploy
```

Fill in `.env.deploy` with the storage zone name, password and hostname from step 1, your
account API key (*Account settings → API key*), and the Pull Zone ID from step 3. The file
is git-ignored. Then, whenever you want to deploy:

```bash
pnpm deploy:bunny
```

This builds the app, uploads `app/dist` to the Storage zone (assets first, then
`index.html`), and purges the Pull Zone cache. Add `--dry-run` to see what it would
upload without uploading anything. (Use `pnpm deploy:bunny`, not `pnpm deploy`, which is
a built-in pnpm command.)

**By hand:** run `pnpm build` in `app/`, then drag the *contents* of `app/dist` (not the
folder itself) into the root of the Storage zone in its file manager, and purge the Pull
Zone's cache.

Either way, old files in `/assets/` are left in place. That's harmless: their names are
hashed, so the new `index.html` never refers to them.

### Updating the API

Paste the new contents of `api/main.ts` into the Edge Script's editor and publish. No
build or cache purge is needed.

Clients authenticate with `Authorization: Bearer <base64(AUTH_TOKEN)>`. The request and
response shapes, and the SSE event format, are documented at the top of `api/main.ts`.
If you have Deno installed, you can type-check the file locally:

```bash
deno check api/main.ts
```

### If streaming shows up all at once

The Summariser, Writer and Explain stream their output word by word. If it arrives all at
once in production, the CDN is buffering the API's stream. Check the step 4 Edge Rule is
in place.

## Local development

```bash
cd app && cp .env.example .env
```

Set `API_PROXY_TARGET` to your Pull Zone URL. The Vite dev server proxies `/api` to it, so
the app stays same-origin. This means the API must be deployed first; see
[First-time setup](#first-time-setup) steps 1–5. Then:

```bash
pnpm install
```

```bash
pnpm dev
```

The app runs on http://localhost:4217. Opening any tool first asks for the access token
(the value of `AUTH_TOKEN`). It's checked against the API and stored in this browser's
localStorage only. Nothing secret is built into the bundle.

| Script | Does |
| --- | --- |
| `pnpm build` | type-check and build to `app/dist` |
| `pnpm type-check` | `vue-tsc` |
| `pnpm lint` / `pnpm lint:fix` | ESLint (flat config, Vue + TypeScript) |
| `pnpm format` / `pnpm format:check` | Prettier (+ Tailwind class sorting) |
| `pnpm deploy:bunny` | build, upload to Bunny Storage and purge the cache (see above) |

## Adding a tool

1. **API:** add any presets and register the tool with `streamTool({...})` or
   `jsonTool({...})` in `api/main.ts`. A path of `/foo` is served at `/api/foo`.
2. **App:**
   - Add request/result types in `src/api/types.ts`.
   - Add a store in `src/stores/`, using `useStreamRunner('/foo')` or
     `useJsonRunner('/foo')`.
   - Add a view in `src/views/tools/`.
   - Add an entry in `src/tools/registry.ts`.
   - Add a receiver in `src/composables/useSendTo.ts`.

The registry entry automatically adds the route, sidebar link, home card, ⌘K palette
entry and "Send to…" target.

Preset ids in `app/src/tools/presets.ts` must match those in `api/main.ts`.
