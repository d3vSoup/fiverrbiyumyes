# Fiverrfront (React + Vite, all JavaScript)

The entire UI lives in `src/App.js`. Every block/component/function is preceded by a comment explaining the next section so you can scan the file inside VS Code and immediately know what to edit.

## Run this app

```bash
cd fiverrfront
npm install
echo VITE_API_URL=http://localhost:4000 > .env.local
npm run dev
# visit http://localhost:5173
```

## What lives inside App.js?

- Navbar, hero, category tabs, services grid (INR pricing).
- Floating search FAB, wishlist/cart actions, pointer wobble effect.
- Sign-in form + Google button placeholder with domain guards.
- React Router routes for `/`, `/about`, `/cart`, `/wishlist`, `/signin`, `/profile/manage-orders`, `/profile/manage-items`.
- Admin dashboards that hit the Express endpoints (or the Supabase views once you swap the `API_URL`).

All styling is in `src/App.css` and `src/index.css`. No TypeScript, no external state libs—just approachable React components.
