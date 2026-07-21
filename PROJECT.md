# Home Sky

Home Sky is a personal project about helping people living away from home feel connected to the current sky and atmosphere of their hometown. The product is being built brick by brick, not all at once.

## Status

Phase 0 is complete.

Phase 1A is implemented on `feature/phase-1-sky-view`.

Phase 1B is implemented on `feature/phase-1-sky-view`.

Phase 1C is implemented on `feature/phase-1-sky-view`.

Phase 1D is implemented on `feature/phase-1-sky-view`.

Phase 1E is implemented on `feature/phase-1-sky-view`.

Phase 1F is implemented on `feature/phase-1-sky-view`.

Phase 1 closure cleanup is in progress on `feature/phase-1-sky-view`.

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

## Phase 1A Scope

Phase 1A creates the product structure for the immersive sky experience.

Implemented in this brick:

- `/sky` route for the primary immersive sky view.
- `/weather` route for the detailed weather view.
- Shared active location and forecast state across both routes.
- Sidebar view switcher for Sky and Weather.
- Saved-location switching still works from the sidebar.
- Sky View uses a local generated sky-photo style asset at `src/assets/phase-1a-sky.png`.
- Sky View includes `Enter Fullscreen Sky`.
- Fullscreen mode renders only the sky container.
- Fullscreen exit can use Esc or the temporary reveal-on-move/tap exit control.

Still deferred to later Phase 1 bricks:

- Continuous daylight model.
- Cloud layers.
- Fog, precipitation, snow, storm and lightning rendering.
- Sky laboratory controls.

## Phase 1B Scope

Phase 1B creates the data model for future sky rendering.

Implemented in this brick:

- Expanded Open-Meteo forecast request with sky-relevant current/hourly/daily fields.
- Added total, low, middle, and high cloud cover.
- Added humidity, dew point, visibility, pressure, surface pressure.
- Added rain, showers, snowfall, precipitation probability.
- Added wind speed, direction, and gusts.
- Added radiation fields and CAPE from hourly data.
- Added sunrise, sunset, and daylight duration from daily data.
- Added `createSkyState(forecast, location)` in `src/utils/skyState.js`.
- Sky View now receives a normalized `SkyState`.
- Missing regional variables fall back to `null` rather than breaking rendering.
- A small temporary Sky View chip confirms sky data is available.

Still deferred to later Phase 1 bricks:

- Visual use of `SkyState`.
- Continuous daylight colour model.
- Cloud layer rendering.
- Fog, precipitation, snow, storm and lightning rendering.

## Phase 1C Scope

Phase 1C creates a development-only sky laboratory for testing future visual combinations without waiting for real weather.

Implemented in this brick:

- Added dev-only Sky Lab panel on `/sky`.
- Added in-memory overrides for daylight progress.
- Added cloud layer overrides for total, low, middle, and high clouds.
- Added atmosphere overrides for visibility and humidity.
- Added wind overrides for direction, speed, and gusts.
- Added precipitation overrides for rain, showers, and snowfall.
- Added storm inputs for WMO weather code and CAPE.
- Added `applySkyStateOverrides(skyState, overrides)`.
- Lab overrides do not change backend data, saved locations, or real weather responses.
- Sky View shows a temporary "Lab override active" chip when overrides are active.

Still deferred to later Phase 1 bricks:

- Cloud layer rendering.
- Fog, precipitation, snow, storm and lightning rendering.

## Phase 1D Scope

Phase 1D creates the base time-of-day sky.

Implemented in this brick:

- Added `createSkyVisualState(skyState)`.
- Converts daylight progress into a render-facing visual state.
- Adds continuous gradient colours for dawn, sunrise, day, golden hour, sunset, and night fallback.
- Adds sun placeholder position and intensity based on daylight progress.
- Adds night darkening and horizon warmth overlays.
- Keeps the generated sky photo as a reference texture under code-driven colour.
- Sky Lab daylight override now visibly changes the base sky.

Still deferred to later Phase 1 bricks:

- Cloud layer rendering.
- Fog and haze.
- Precipitation and snow.
- Storm darkness and lightning.

## Phase 1E Scope

Phase 1E adds the first renderable cloud system.

Implemented in this brick:

- Added `createCloudVisualState(skyState, skyVisualState)`.
- Separates clouds into high, middle, and low visual layers.
- Uses Open-Meteo total, low, middle, and high cloud cover to control layer density and opacity.
- Darkens cloud colour with rain, showers, snowfall, storm state, and night overlay.
- Uses wind speed and direction to set cloud drift direction and speed.
- Keeps cloud rendering inside the Sky View, behind the main location/time/weather overlay.
- Sky Lab cloud, wind, rain, snowfall, and daylight overrides now visibly affect the cloud scene.
- Respects reduced-motion preference by disabling cloud drift animation.

Still deferred to later Phase 1 bricks:

- Fog and haze.
- Rain and snow particles.
- Storm darkness and lightning.

## Phase 1F Scope

Phase 1F closes the first immersive sky pass by adding weather atmosphere layers.

Implemented in this brick:

- Added `createWeatherVisualState(skyState, skyVisualState, cloudVisualState)`.
- Adds fog and haze based on visibility, humidity, and low cloud cover.
- Adds rain streaks based on rain and shower intensity.
- Adds snowfall particles based on snowfall intensity.
- Adds storm darkening from thunderstorm WMO codes and CAPE.
- Adds a subtle lightning placeholder for storm states.
- Uses wind direction and speed to slant and pace precipitation movement.
- Keeps all effects inside the Sky View behind the main location/time/weather overlay.
- Sky Lab visibility, humidity, rain, showers, snowfall, wind, WMO code, and CAPE controls now affect the final atmosphere.
- Respects reduced-motion preference by disabling weather-layer animation.

Phase 1 is now a complete local visual foundation. Further visual work should be treated as Phase 2 polish or a dedicated design pass.

## Phase 1 Closure Notes

- `App.jsx` was refactored into focused component folders to keep files readable.
- CSS was split into focused files under `src/styles`.
- Source files are kept under 500 lines where practical.
- Night rendering was corrected so late-night hours render as night rather than sunset/dawn.
- Phase 1 should be committed and pushed before starting Moon, moon phase, stars, or other Phase 2 work.

## Phase 2 Candidate Direction

- Moon phase, moonrise, moonset, and moon position.
- Night star field controlled by daylight, cloud cover, visibility, and moon brightness.
- Later: visible bright-star catalog for the selected location/time.
- Later: constellation and planet visibility.
