# Handoff (2026-02-15, night)

## Branch + Commit
- Branch: `main`
- Current HEAD: `b457f8d` (pushed)
- Worktree: clean

## What was done
- Removed all static `/public/live/*` template exports and disabled the `/live/:slug` rewrite in `next.config.js` to avoid mixed assets.
- Rebuilt **MedTrack** as a standalone React page at `app/live/medtrack/page.tsx` (medication manager with schedule, adherence, refill tracker, personas). No static assets required.
- BookFlow SPA remains at `app/live/bookflow/page.tsx` (unchanged).

## How to run / verify
1) `cd /Users/alexispinzon/CascadeProjects/islaapp-site/open-pro-next/open-pro-next`
2) `npm install`
3) `npm run dev -- --hostname 127.0.0.1 --port 3000`
4) Open:
   - BookFlow: `http://localhost:3000/live/bookflow`
   - MedTrack: `http://localhost:3000/live/medtrack`

## Next tasks (priority)
- Redeploy on your host so the rewritten /live removal and new MedTrack page are live.
- Keep BookFlow and MedTrack separate; ensure CTAs point to the correct routes and not to removed static pages.
- Optional: remove the unused `experimental.turbo` warning in `next.config.js` if desired.

## Notes
- Lockfile is the nested `open-pro-next/package-lock.json` (root lockfile was previously removed). Ensure your deploy uses this one.
- No tests were run in this pass. Deploy to verify. 
