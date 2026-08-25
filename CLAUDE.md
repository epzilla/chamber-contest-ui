# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

"Home Run Challenge" — a SvelteKit UI for a chamber of commerce ambassador points contest: members log networking activities (calls, referrals, event attendance, etc.), earn points, and see leaderboards. Svelte 4 + SvelteKit 2 + TypeScript, deployed via `@sveltejs/adapter-vercel`.

## Commands

```bash
npm run dev              # start dev server (vite dev)
npm run build            # production build
npm run preview          # preview production build
npm run check            # svelte-kit sync + svelte-check (type checking)
npm run check:watch      # type checking in watch mode
npm run lint             # prettier --check . && eslint .
npm run format           # prettier --write .
```

Use `npm`, not `yarn` — `package-lock.json` is the committed lockfile. A `yarn.lock` may appear locally if `yarn` is run by mistake; it isn't checked in and should be deleted rather than committed.

There is no test suite/runner configured in this repo.

## Architecture

**This app is primarily a thin client for an external REST + WebSocket API**, not a self-contained full-stack app, despite having Sequelize wired up.

- All API base URLs are hardcoded in [src/lib/modules/constants.ts](src/lib/modules/constants.ts) (`BASE_URL`, `WS_BASE_URL`), currently pointing at `chamber-api.herokuapp.com`. There's no env-based switching in that file — swap the commented local URL manually for local API dev.
- [src/lib/modules/rest.ts](src/lib/modules/rest.ts) is the plain `fetch` wrapper (`get`/`post`/`put`/`del`/`uploadFile`) used by almost all data access, both in stores and in `+page.ts` loaders (client-side `load` functions).
- [src/lib/modules/db.ts](src/lib/modules/db.ts) + [src/lib/modules/dbModels.ts](src/lib/modules/dbModels.ts) set up a direct Sequelize/MySQL connection, but as of now it's only used in one place — the `addMember` form action in [src/routes/welcome/+page.server.ts](src/routes/welcome/+page.server.ts). Most routes use `+page.ts` (client-side) rather than `+page.server.ts`, since they fetch from the external REST API instead of the DB directly.
- Realtime updates flow through [src/lib/modules/websockets.ts](src/lib/modules/websockets.ts): a single reconnecting `WebSocket` to `WS_BASE_URL`, wrapped in an RxJS `Subject` (`socket`). [src/lib/modules/stores/updates.ts](src/lib/modules/stores/updates.ts) subscribes to it and re-dispatches by `Msg` type (`USER_UPDATED`, `EVENT_ATTENDANCE_UPDATED`) into more specific Subjects (`userUpdates`, `attendanceUpdates`). Messages that originated from the same browser tab (matched by `deviceId`) are filtered out to avoid self-echo.
- Device identity: a random device GUID is generated and persisted to `localStorage` on first load ([src/lib/modules/stores/devices.ts](src/lib/modules/stores/devices.ts)), registered with the API, and used both to tag outgoing writes (via `LocalStorage.get('device-id')` in `rest.put`) and to filter incoming websocket echoes.

### State (Svelte stores)

All global state lives in `src/lib/modules/stores/*.ts`, barrel-exported from [src/lib/modules/stores/index.ts](src/lib/modules/stores/index.ts) (note: `events.ts` and `eventTypes.ts` are *not* re-exported there — import them directly). Stores are largely self-initializing modules: many fire their own `rest.get(...)` calls at import time (guarded by `typeof window !== 'undefined'`) rather than being populated by page `load` functions. Key stores:

- `users.ts` — current `user` (persisted to `localStorage` under `user`), plus a `userAttendedEvents` store and `editingAttendedEvent`. Also owns most of the auth/redirect side effects (see Auth below).
- `events.ts` — `pastEvents`, `thisYearsPastEvents`, `myEvents`, `myUnattendedEvents`, `myUnattendedPastEvents`, derived by combining REST fetches with the `user` store.
- `alerts.ts` — toast/alert queue shown by `MiniAlerts`/`FixedAlerts`.
- `config.ts` — remote app config (e.g. submission deadlines).

### Auth model

There's no real auth/session mechanism — "login" is choosing yourself from a member list on `/welcome`, which is then cached as JSON in `localStorage['user']`. Multiple places independently redirect to/from `/welcome` based on this: `src/routes/+layout.svelte`, and the side effects at the top of `src/lib/modules/stores/users.ts`. `Member.isAdmin` gates access to `/admin/*` routes; that check is done ad hoc per-page (e.g. `src/routes/admin/+page.svelte` checks `$user?.isAdmin` client-side and redirects), not via a shared layout guard or server hook — replicate that pattern when adding new admin pages.

### Routes

- `/` — dashboard/home ([+page.server.ts](src/routes/+page.server.ts) fetches upcoming/past events + members from the REST API).
- `/welcome` — member self-select / "login" and new-member signup (the one route that writes to the DB directly via Sequelize).
- `/events/upcoming`, `/events/past`, `/events/[id]` — event browsing and per-event attendance.
- `/contest` — points leaderboard.
- `/admin`, `/admin/edit-events`, `/admin/edit-event-types`, `/admin/edit-members`, `/admin/feed` — admin CRUD screens, all gated client-side on `isAdmin`.
- `/logout` — clears local "session".

### Types

Shared domain types (`Member`, `ChamberEvent`, `EventAttendance`, `EventType`, `PointsTotal`, etc.) live in [src/lib/modules/types.ts](src/lib/modules/types.ts) — check here first before redefining shapes returned by the API.

### Styling

SCSS via `sass`; component-scoped styles are typical Svelte `<style>` blocks, with shared partials like [src/lib/styles/modal-form.scss](src/lib/styles/modal-form.scss) and [src/routes/admin/styles.scss](src/routes/admin/styles.scss) imported where needed. `svelecte` is used for select/combobox inputs, `datebook`/`date-fns` for calendar/date handling, `file-saver` for client-side file export.
