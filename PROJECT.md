# Home Sky

Home Sky is a personal project about helping people living away from home feel connected to the current sky and atmosphere of their hometown. The product is being built brick by brick, not all at once.

## Status

Phase 0 is complete.

Deployment is intentionally deferred. The app now has a working local foundation, but we should improve usefulness, visual identity, and production readiness before publishing it.

## Branch Workflow

- `main` contains the completed Phase 0 baseline.
- `dev` is synchronized with `main` and is the base branch for upcoming work.
- Phase 1 work should begin from `dev`.
- Use feature branches from `dev` where possible, for example `feature/phase-1-sky-view`.
- Merge completed feature branches back into `dev`.
- Merge `dev` into `main` only when a stable milestone is ready.

## Technology

- React
- Vite
- Plain JavaScript
- Plain CSS
- Open-Meteo APIs
- Node.js
- Express
- MongoDB Atlas
- Mongoose
- JWT authentication
- Google Identity Services

## Phase 0 Completed Scope

- Email signup and login.
- Google login option.
- Logout.
- MongoDB-backed user accounts.
- Saved locations per user.
- Default location per user.
- Active location persistence.
- Collapsible saved-location sidebar.
- Main add-location screen.
- Focused weather screen for selected saved locations.
- Location search with Open-Meteo Geocoding.
- Current weather with moment-level summary.
- Hourly forecast.
- Seven-day forecast.
- Live local time using the selected location timezone.
- Loading, empty, and API-error states.
- Simple dummy background.

## Phase 0 Non-Goals

These remain out of scope for Phase 0:

- TypeScript
- Interactive map
- Animations
- Sounds
- Sky rendering
- Moon animation
- Projector support
- Production deployment

## Local Development

Frontend runs at:

`http://127.0.0.1:5173`

Backend runs at:

`http://127.0.0.1:4001`

Required `.env` values:

- `MONGODB_URI`
- `JWT_SECRET`
- `PORT`
- `GOOGLE_CLIENT_ID`

Do not commit `.env`. Credentials and secrets must stay local or in deployment secret storage.

The backend now stops on startup if `JWT_SECRET` is missing. It should not silently use an unsafe fallback secret.

## Data

MongoDB stores:

- User account records.
- Password hashes or Google auth identity links.
- Saved locations.
- Default location.
- Active location.

Open-Meteo weather data is fetched live and is not stored.

Temporary smoke-test accounts using `@homesky.local` were removed from MongoDB Atlas during Phase 0 cleanup.

## Verification Checklist

Before opening Phase 1, verify:

- Email signup/login
- Google login
- Logout
- Location search
- Save multiple locations
- Default location
- Refresh persistence
- Current weather
- Hourly forecast
- Seven-day forecast
- Local time
- Loading and error states

Final local checks:

```bash
npm run build
node --check server/index.js
git status
```

## Deferred Before Deployment

These are intentionally deferred until the app is closer to a presentable production release:

- Rate limiting
- Helmet/security headers
- Configurable production URLs and CORS
- Strong server-side validation
- Authentication-cookie improvements
- CI/CD and hosting

## Phase 1 Direction

Phase 1 should make Home Sky feel like Home Sky, not just a standard weather dashboard. The next phase should focus on usefulness, emotional clarity, visual identity, and a calmer weather experience before deployment.
