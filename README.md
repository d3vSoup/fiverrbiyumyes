# Fiverr for Students (Mono Repo)

Everything now lives in two folders but the main UI logic is inside `fiverrfront/src/App.js`, as requested.

| Folder | Stack | Notes |
|--------|-------|-------|
| `fiverrfront/` | Vite + React (JavaScript) | Single `App.js` with router, comments on every block, floating search, wobble pointer |
| `fiverrback/` | Express (JavaScript) | JSON persistence for services / carts / wishlists / orders, heavy inline docs |

## Quick VS Code workflow

1. `File > Open Folder...` → select `d:\fiver`.
2. Split the terminal (Ctrl+Shift+5) so you can run backend + frontend side by side.
3. Backend pane:
   ```bash
   cd fiverrback
   npm install
   npm run dev
   # -> http://localhost:4000
   ```
4. Frontend pane:
   ```bash
   cd fiverrfront
   npm install
   echo VITE_API_URL=http://localhost:4000 > .env.local
   npm run dev
   # -> http://localhost:5173
   ```
5. Open `fiverrfront/src/App.js` in VS Code. Every component/function is declared there with comments explaining the next block in detail.

## Supabase (optional production backend)

1. Run `supabase/sql/schema.sql` to create tables.
2. Run `supabase/sql/admin_views.sql` to create the dashboard views used by “Manage Orders” + “Manage Items”.
3. Point `API_URL` in `App.js` (or `VITE_API_URL`) to your Supabase Edge function / Render deployment once ready.

## Features packed into `App.js`

- Host/Student mode toggle with automatic theme swap (black vs white hue).
- Email + mock Google sign-in restricted to BMS domains, plus admin inbox guard.
- Floating search button, wishlist hearts, wobble pointer effect, INR pricing.
- Admin-only dashboards (orders + items) wired to backend endpoints.
- Block comments before every logical section to make code tours painless.

For backend-specific details see `fiverrback/README.md`; for UI notes see `fiverrfront/README.md`.

