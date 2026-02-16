# Handoff (2026-02-16, early AM)

## Branch + Commit
- Branch: `main`
- Current HEAD: _pending push after moves_ (see git status for final hash)
- Worktree: clean once you commit/push the live-page moves below

## What was done
- Removed static `/public/live/*` templates and the `/live/:slug` rewrite so only app routes are used.
- Rebuilt **MedTrack** as a standalone React page (meds list, schedule, adherence, refills, personas).
- Added **FitCoach** SPA (theme switcher, coaching dashboard, check-ins, progress, billing).
- **Moved MedTrack and FitCoach into the actual Next app** at `open-pro-next/app/live/{medtrack,fitcoach}` so Render builds pick them up. BookFlow stays at `open-pro-next/app/live/bookflow`.

## How to run / verify
1) `cd /Users/alexispinzon/CascadeProjects/islaapp-site/open-pro-next/open-pro-next`
2) `npm install`
3) `npm run dev -- --hostname 127.0.0.1 --port 3000`
4) Open:
   - BookFlow: `http://localhost:3000/live/bookflow`
   - MedTrack: `http://localhost:3000/live/medtrack`
   - FitCoach: `http://localhost:3000/live/fitcoach`

## Next tasks (priority)
- Commit & push the live-page moves (fitcoach + medtrack into `open-pro-next/app/live`) then redeploy; 404s should disappear because routes will be part of the built app.
- Keep BookFlow, MedTrack, FitCoach separate; point CTAs only to their `/live/*` routes.
- Optional: remove the invalid `experimental.turbo` key in `next.config.js` (warning only).

## Notes
- Lockfile for the Next app is `open-pro-next/open-pro-next/package-lock.json`; Render uses `rootDir: open-pro-next` so it should pick it up.
- Local `npm run build` failed only because Google Fonts download was blocked; Render should succeed with network access.
- No tests were run in this pass. Deploy to verify.
