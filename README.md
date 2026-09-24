# AIverse

A collection of AI writing tools. A single Cloudflare Worker serves both the Vue app and
its API, and the API uses the OpenAI Responses API.

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

Everything lives in `app/`:

```
app/src/                 Vue 3 + TypeScript + Tailwind v4 + Pinia + vue-router
app/worker/index.ts      the API (Hono + zod), running as a Cloudflare Worker
app/wrangler.jsonc       Worker config: routing, settings
```

## How it fits together

```
browser ──▶ Cloudflare Worker (your *.workers.dev or custom domain)
              ├─ /api/*            ──▶ worker/index.ts ──▶ OpenAI
              └─ everything else   ──▶ the built app (dist/client)
                                        unknown paths (/tone, …) → index.html
```

`wrangler.jsonc` does the routing: `run_worker_first: ["/api/*"]` sends API calls to the
Worker code, and `not_found_handling: "single-page-application"` serves `index.html` for
app routes. The app calls `/api` on its own origin, so no CORS is needed.

## Local development

You need Node 22+ and pnpm. From `app/`, install the dependencies:

```bash
pnpm install
```

Create your local secrets file (git-ignored), then fill in your OpenAI key and choose an
access token:

```bash
cp .dev.vars.example .dev.vars
```

Start the app and the API together on http://localhost:4217:

```bash
pnpm dev
```

Open any tool and enter the `AUTH_TOKEN` from `.dev.vars` to unlock it. The token is
checked against the API and stored in this browser's localStorage only. Nothing secret is
built into the bundle.

| Script | Does |
| --- | --- |
| `pnpm dev` | app + API locally, with hot reload |
| `pnpm build` | type-check and build the app and Worker to `dist/` |
| `pnpm preview` | build, then run the production build locally |
| `pnpm run deploy` | build and deploy to Cloudflare from your machine |
| `pnpm type-check` | `vue-tsc` (app and Worker) |
| `pnpm lint` / `pnpm lint:fix` | ESLint (flat config, Vue + TypeScript) |
| `pnpm format` / `pnpm format:check` | Prettier (+ Tailwind class sorting) |
| `pnpm cf-typegen` | regenerate `worker-configuration.d.ts` after editing `wrangler.jsonc` |

Use `pnpm run deploy`, not `pnpm deploy`, which is a built-in pnpm command.

## Deploying to Cloudflare

### First-time setup

Once this is set up, every push to `main` deploys the app and the API together.

1. **Push this repo to GitHub or GitLab.**
2. **Import it into Cloudflare.** In the Cloudflare dashboard, go to *Workers & Pages →
   Create → Import a repository*, choose the repo, and set:
   - **Project name:** `aiverse`. This must match `name` in `wrangler.jsonc`.
   - **Root directory:** `app`
   - **Build command:** `pnpm run build`
   - **Deploy command:** `npx wrangler deploy` (the default)

   Then deploy. The first build creates the Worker, but it won't work until you add the
   secrets in the next step.
3. **Add the secrets.** Open the Worker's *Settings → Variables and Secrets*, and add two
   entries of type *Secret*:

   | Name | Value |
   | --- | --- |
   | `OPENAI_TOKEN` | your OpenAI API key |
   | `AUTH_TOKEN` | the access token users will enter to unlock the app (a long random string) |

4. **Check it works** (use your Worker's URL from its overview page):

   ```bash
   curl https://aiverse.<your-subdomain>.workers.dev/api/health
   ```

   It should print `{"ok":true}`. Then open `/tone` on the same domain. You should see the
   unlock screen, and entering your `AUTH_TOKEN` should take you to the Tone analyser.
5. **Optional: add a custom domain** under the Worker's *Settings → Domains & Routes*.

### Deploying updates

Push to `main`. Cloudflare builds and deploys the app and API together, usually within a
minute or two. You can follow progress under the Worker's *Deployments* tab and roll back
to a previous version there. Pushes to other branches get their own preview URL, which
doesn't affect production.

To deploy from your machine instead, log in once:

```bash
pnpm exec wrangler login
```

Then deploy with:

```bash
pnpm run deploy
```

### Settings

Non-secret settings are in `vars` in [`app/wrangler.jsonc`](app/wrangler.jsonc). They're
version-controlled and applied on every deploy, so change them there rather than in the
dashboard:

| Variable | Default | Purpose |
| --- | --- | --- |
| `DEFAULT_MODEL` | `gpt-5.6-terra` | model used when the app doesn't choose one |
| `DEFAULT_REASONING_EFFORT` | `low` | `none` / `low` / `medium` / `high` / `xhigh` / `max` |
| `TIMEOUT` | `60` | seconds to wait for OpenAI to start responding |

After editing `wrangler.jsonc`, run `pnpm cf-typegen` to update the Worker's types.

### If the Cloudflare build fails

- **pnpm or Node version errors:** add `PNPM_VERSION` (e.g. `12.4.2`, matching
  `packageManager` in `package.json`) and/or `NODE_VERSION` (e.g. `22`) under the Worker's
  *Settings → Build → Variables*.
- **"Project name does not match":** the Cloudflare project name must equal `name` in
  `wrangler.jsonc`.

## API reference

Clients authenticate with `Authorization: Bearer <base64(AUTH_TOKEN)>`. The request and
response shapes, and the SSE event format, are documented at the top of
[`app/worker/index.ts`](app/worker/index.ts). All API responses are sent with
`Cache-Control: no-store`. Hashed files under `/assets/` are cached for a year (see
`app/public/_headers`), and `index.html` is revalidated on every load, so a new deploy
shows up straight away.

## Adding a tool

1. **API:** add any presets and register the tool with `streamTool({...})` or
   `jsonTool({...})` in `app/worker/index.ts`. A path of `/foo` is served at `/api/foo`.
2. **App:**
   - Add request/result types in `src/api/types.ts`.
   - Add a store in `src/stores/`, using `useStreamRunner('/foo')` or
     `useJsonRunner('/foo')`.
   - Add a view in `src/views/tools/`.
   - Add an entry in `src/tools/registry.ts`.
   - Add a receiver in `src/composables/useSendTo.ts`.

The registry entry automatically adds the route, sidebar link, home card, ⌘K palette
entry and "Send to…" target.

Preset ids in `app/src/tools/presets.ts` must match those in `app/worker/index.ts`.
