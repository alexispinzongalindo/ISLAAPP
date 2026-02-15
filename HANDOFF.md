# Handoff (2026-02-15, evening)

## Branch + Commit
- Branch: `main`
- Current HEAD: `e0e58a5` (pushed to origin)
- Worktree state: **dirty** (see below)

## What was done this session
- Enabled the BookFlow “Live demo” button in both galleries, wired to `/live/bookflow`.
- Added rewrites and a `/live/[slug]` redirect route so `/live/:slug` serves `/public/live/:slug/index.html`.
- Copied BookFlow static demo assets into the Next app folder: `open-pro-next/public/live/bookflow/`.
- Tried running dev on :3000 and static on :8000; localhost access from this environment is blocked, but assets + routing are in place.
- Documented stack/approach in README (`open-pro-next/README.md`).

## Uncommitted state to keep in mind
- Root `package-lock.json` was moved to `package-lock.legacy.json` to force the nested app lockfile to be used.
- `open-pro-next/package-lock.json` (nested) is present/untracked.
- BookFlow demo assets are untracked at `open-pro-next/public/live/bookflow/`.

## How to run / verify locally
1) `cd /Users/alexispinzon/CascadeProjects/islaapp-site/open-pro-next/open-pro-next`
2) `npm install` (will refresh the nested lockfile)
3) `npm run dev -- --hostname 127.0.0.1 --port 3000`
4) Open `http://localhost:3000/live/bookflow` (plain http, no www).  
If Next warns about multiple lockfiles, pick one: either restore root `package-lock.json` or commit the nested one and remove the root.
Static fallback (no Next):  
`cd open-pro-next/open-pro-next/public && python3 -m http.server 8000 --bind 127.0.0.1` then `http://localhost:8000/live/bookflow/index.html`.

## Next tasks (priority)
1) Choose and commit a single lockfile strategy to clean the tree.
2) Confirm BookFlow demo loads at `/live/bookflow`; keep the button enabled once verified.
3) Repeat the live-demo asset copy for the next template before enabling its button.
4) Remove the unused `experimental.turbo` key from `next.config.js` to silence warnings.

## Notes
- Latest pushed commits include live-demo routing and the BookFlow button; untracked assets/lockfile moves are local—don’t discard before review.
- No automated tests were run. Localhost access from this environment is blocked; verify on your machine.
