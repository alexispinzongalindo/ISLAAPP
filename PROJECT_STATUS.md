# ISLAAPP Project Status

Last updated: 2026-02-17 (afternoon)
Workspace: /Users/alexispinzon/CascadeProjects/islaapp-site/open-pro-next
Primary deploy repo: https://github.com/alexispinzongalindo/ISLAAPP.git
Primary app path: /Users/alexispinzon/CascadeProjects/islaapp-site/open-pro-next/open-pro-next

## Current Product Direction
- Base site migrated to template-first funnel.
- User flow target:
  1. Landing page
  2. Template selection
  3. AI Agent chat (real AI) to collect requirements and guide build phases
- Bilingual EN/ES experience with language toggle on core funnel screens.

## Session Handoff (Latest)
- User requested EstateGo live page to stop showing placeholder text and show real visuals.
- EstateGo live page now uses:
  - Real house hero image (Unsplash URL) in the campaign cover section.
  - Real embedded OpenStreetMap iframe in the map section.
  - Commute panel text updated to realistic values (no placeholder wording).
- File changed:
  - `/Users/alexispinzon/CascadeProjects/islaapp-site/open-pro-next/open-pro-next/app/live/real-estate/page.tsx`
- Current task in progress: commit + push this real photo/map update so Render auto-deploys.

## What Is Already Implemented
1. Render deployment configured to run `open-pro-next` (rootDir deployment).
2. Homepage + template navigation wired to `/templates`.
3. Template detail route present (BookFlow).
4. AI Agent route/page implemented:
   - UI page: `/agent`
   - API: `/api/agent`
   - Uses `OPENAI_API_KEY` from Render env.
5. Agent build/runtime fixes completed:
   - Removed `useSearchParams` prerender issue for Render builds.
   - Fixed Responses API payload formatting.
   - Added model compatibility logic:
     - `reasoning.effort` is sent only for GPT-5 models.
6. Agent behavior upgraded to phased planning format:
   - "What I need from you"
   - "Why"
   - "What we will create next"
   - Auto language behavior: responds in ES or EN based on user message.
7. Agent continuity and output tools:
   - Conversation persistence in browser localStorage (per template).
   - "New chat / Nuevo chat" reset action.
   - Built-in "Generate brief / Generar resumen" panel with copy action.
8. Multi-template catalog enabled:
   - Gallery expanded from 1 to 12 templates.
   - Dynamic detail route: `/templates/[slug]`.
   - Every template now routes to AI agent with template context.
9. Live demo pages upgraded:
   - Template detail now includes demo summary, module cards, and step-by-step live flow.
   - Demos are differentiated by template slug (not one generic preview).

## Recent Important Commits (ISLAAPP/main)
- `360b39f` Add explicit house and map placeholders in EstateGo live view
- `36cb43c` Update FlexSpace template thumbnail from DEMO SHOOT
- `397abbc` Update PriorityOS template thumbnail from DEMO SHOOT
- `2525ebc` Update NovaHabit template thumbnail from DEMO SHOOT
- `1936b56` Add functional FlexSpace live app and wire template routing/buttons
- `2d36a1e` Fix TableReady confirm click handler scoping (still needs a clean redeploy)
- `48b6a7e` Wire TableReady confirm button to show mock email/SMS receipt (build failed; needs follow-up)
- `7413e97` Revert FitCoach mock output (to stabilize)
- `aa2fbfb` Revert MedTrack mock output (to stabilize)
- `42e7476` Revert initial FitCoach/TableReady mock output attempt (to stabilize)
- `b9e6fe2` Re-add EstateGo real-estate live demo with build-safe implementation
- `0358953` Add Briefly law live demo and wire live buttons
- `3b028ca` Show Live demo button for SmileSet (dental)

## Render Environment
Required:
- `OPENAI_API_KEY` (set)

Optional/cleanup:
- `PORT` is not required by Render (Render provides it automatically).

## Known Working Goal
- User can pick template and land on `/agent?template=...`.
- Agent should start real conversation and guide client in phases.

## Open Items / Next Build Tasks
1. Expand EN/ES coverage beyond core funnel to all pages/components.
2. Improve long-term agent memory/session continuity across devices (server-side persistence).
3. Add richer structured project output generation from agent replies:
   - brief
   - MVP scope
   - screen map
   - data schema
4. Add admin/history view for captured client requirements.
5. Add category filters/search for template gallery and improve template localization.
6. Polish UI spacing/typography consistency in header/agent composer.

## Immediate Next Step When Resuming
1. Redeploy latest `main` on Render.
2. Test full flow:
   - Home -> Templates -> Template -> Agent
   - Send messages in EN and ES
   - Confirm model switch behavior (GPT-5 vs GPT-4.1-mini)
3. If any runtime error appears, capture screenshot + log snippet and patch quickly.

## Instruction for Future Sessions
When resuming, read this file first and continue from "Open Items / Next Build Tasks" without asking the user to repeat context.
