# Pre-trial: run Chat locally (Developer Requirements)

Matches [Developer Requirements](https://www.notion.so/Developer-Requirements-Document-15026a7d835c8062bbcde49b59aa00e8) — **fork, clone, run on localhost:3000**, screenshot for Sweetman.

## 1. Clone & install

```bash
git clone <your-fork-or-repo-url> chat
cd chat
pnpm install
# If pnpm complains about TTY:  $env:CI='true'; pnpm install
```

## 2. Env (minimum to boot)

Copy `.env.example` → `.env.local`.

**Required for the app to start**

- `NEXT_PUBLIC_PRIVY_APP_ID` — create a free app at [Privy](https://dashboard.privy.io), add **http://localhost:3000** to allowed URLs.

**Required for account / DB features**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Often `SUPABASE_SERVICE_ROLE_KEY` (server routes)

Pre-trial devs: doc says you may **obtain your own** env or ask Sweetman for **specific** keys — not a generic “send everything” request.

## 3. Run

```bash
pnpm dev
```

Open **http://localhost:3000** → screenshot (that’s the pre-trial check).

## 4. Recoup API (401 locally)

Local/preview uses **`https://test-recoup-api.vercel.app`** by default. If calls return **401**, the test deployment may not accept your Privy JWT yet. Options:

| Option | What to do |
|--------|------------|
| A | Ask Sweetman to align **test** API with your Privy app (proper fix for “all local”). |
| B | Temporarily set `NEXT_PUBLIC_RECOUP_API_URL=https://recoup-api.vercel.app` only if you’re allowed to hit prod from localhost. |
| C | Run **api** locally — see **`api/docs/RUN_LOCAL.md`** — then `NEXT_PUBLIC_RECOUP_API_URL=http://localhost:3001` in chat. |

**Pre-trial goal** is usually: app runs + login works + screenshot — not necessarily every API green on day one.

## 5. “Run everything locally”

Not required for pre-trial. Full stack is roughly:

| Repo | Role |
|------|------|
| **chat** | UI (this repo) |
| **api** | Recoup HTTP API + sandbox setup route |
| **tasks** | Trigger.dev jobs (needs Trigger credentials) |
| **mono** | Cloned inside sandboxes by tasks — not run as a separate local server for chat |

For daily work, most devs use **deployed** test/prod API + local chat.

## 6. Windows gotchas

- **EBUSY on `.next`**: stop all `pnpm dev`, delete `.next`, one dev server only; exclude `.next` from OneDrive/antivirus if needed.
- **Node**: LTS **20** or **22** if Next acts up on Node 24.
