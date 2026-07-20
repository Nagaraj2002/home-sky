# Home Sky

Home Sky is a personal project about helping people living away from home feel connected to the current sky and atmosphere of their hometown. The product will be built brick by brick, not all at once.

## Current Phase

Phase 0: Data Backbone

The goal of Phase 0 is to prove that the app can select a Home location, persist it locally, fetch weather data for it, and display the core information clearly.

Status: Implemented locally.

## Technology

- React
- Vite
- Plain JavaScript
- Plain CSS
- Open-Meteo APIs
- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- Google Identity Services support

## Explicit Non-Goals

Earlier Phase 0 excluded backend and authentication. The project has now moved past local-only Phase 0 and includes a small backend/auth foundation.

Phase 0 still will not include:

- TypeScript
- Interactive map
- Animations
- Sounds
- Sky rendering
- Moon animation
- Projector support

## Phase 0 User Flow

1. A first-time user sees "Where is home?"
2. The user searches for a town or city using Open-Meteo Geocoding.
3. Search results show place, state, and country.
4. The selected place is previewed first; saving it is an explicit user choice.
5. The app shows the selected location's continuously updating local time.
6. The app fetches current weather, hourly forecast, and seven-day forecast.
7. Refreshing the website preserves saved locations and the default location through the backend after login.
8. The user can add multiple locations and navigate them from the sidebar.
9. The app includes loading, empty, and API-error states.
10. The app includes required Open-Meteo attribution.

## Phase 0 Interface

The website should be laptop-first and responsive, with a minimal, peaceful layout and a simple dummy background.

The interface should show:

- Current Home location
- Live local time for that location
- Current temperature and condition
- Feels-like temperature
- Humidity
- Cloud cover
- Rain or precipitation
- Wind
- Hourly forecast
- Seven-day forecast
- Last updated time
- Sidebar with saved locations
- Main add-location screen
- Focused weather screen for a selected saved location
- Default location choice
- Saved locations with custom labels such as Home, School, or Office
- Sign up and login before entering the app
- Google login option on the auth screen

## APIs

### Geocoding

Use Open-Meteo Geocoding:

`https://geocoding-api.open-meteo.com/v1/search`

Expected usage:

- Search by user-entered place name.
- Read result fields such as name, admin region, country, latitude, longitude, and timezone.
- Save the selected result as a named location.
- Some places may appear by official/local names, so search includes more results and a few common aliases such as Bangalore/Bengaluru and Bailhongal/Bail Hongal.

### Forecast

Use Open-Meteo Forecast:

`https://api.open-meteo.com/v1/forecast`

Expected data:

- Current temperature
- Apparent or feels-like temperature
- Weather condition code
- Humidity
- Cloud cover
- Precipitation or rain
- Wind
- Hourly forecast
- Daily seven-day forecast
- Selected location timezone

## Proposed Implementation Plan

1. Scaffold the Vite React app
   - Create the Vite React JavaScript project structure inside this folder only.
   - Add minimal package scripts for development and build.

2. Establish app structure
   - `src/main.jsx`
   - `src/App.jsx`
   - `src/api/openMeteo.js`
   - `src/hooks/useLocalTime.js`
   - `src/utils/storage.js`
   - `src/utils/weatherCodes.js`
   - `src/index.css`

3. Implement Home selection
   - Build the first-time "Where is home?" state.
   - Add a search input connected to Open-Meteo Geocoding.
   - Show selectable results with place, state, and country.
- Save selected locations to localStorage.
- Restore saved locations and the default location on page refresh.
- Show saved locations in the sidebar.

4. Implement weather fetching
   - Fetch current, hourly, and daily forecast data from Open-Meteo.
   - Request data using the selected latitude, longitude, and timezone.
   - Normalize API responses into simple objects for the UI.
   - Track loading, error, empty, and last-updated states.

5. Implement live local time
   - Use the selected Home timezone.
   - Update continuously while the app is open.
   - Keep the time display independent from weather refresh timing.

6. Build the Phase 0 UI
   - Use a simple dummy background.
   - Create a calm laptop-first layout.
   - Show current weather details, hourly forecast, and seven-day forecast.
- Keep source metadata separate from the main weather content.

7. Verify Phase 0
   - Run the dev server.
   - Test first-time flow, search, selection, refresh persistence, Change Home, weather loading, API errors, and responsive layout.
   - Run a production build.

## Approval Gate

The Phase 0 plan was reviewed and approved. Implementation has started and the local app now includes the Phase 0 data backbone.

## Implementation Notes

- The Vite React JavaScript app has been scaffolded in this folder.
- A Node/Express backend has been added in `server/index.js`.
- MongoDB stores user accounts, saved locations, default location, and active location.
- JWT auth gates the app before showing the Home Sky screen.
- Google login backend endpoints and frontend button slot have been added.
- Google login is configured locally with `GOOGLE_CLIENT_ID` in `.env`.
- Backend API runs on `http://127.0.0.1:4001`.
- Local `.env` now points `MONGODB_URI` to MongoDB Atlas. The actual secret is intentionally not documented here.
- Frontend dev server runs on `http://127.0.0.1:5173`.
- Home location search uses Open-Meteo Geocoding.
- A selected location can be previewed before saving.
- Multiple saved locations are stored in MongoDB and restored after login.
- Saved locations can use custom labels such as Home, School, or Office.
- Users can mark a saved location as the default location.
- The layout now uses a sidebar for saved locations and a separate main add-location flow.
- Live local time uses the active location timezone.
- Forecast data comes from Open-Meteo Forecast.
- The interface includes live current weather for the active moment, hourly forecast, seven-day forecast, loading/error/empty states, city switching, saved locations, and last updated time.
- Styling uses plain CSS with a simple dummy background and responsive layouts for laptop, tablet, and mobile screen sizes.

## Verification

- `npm install` completed successfully.
- `npm run build` completed successfully.
- `node --check server/index.js` completed successfully.
- Backend health check returned HTTP 200 at `http://127.0.0.1:4001/api/health`.
- Backend debug check confirmed Atlas database `home-sky` on host `*.gamqbs4.mongodb.net`.
- A throwaway signup request successfully created a MongoDB-backed user.
- A throwaway signup request successfully created a MongoDB Atlas-backed user.
- Atlas debug user count is now `1`, so Data Explorer should show `home-sky > users` after refresh.
- Google auth config returned enabled with the configured local OAuth Client ID.
- Local Vite dev server responded with HTTP 200 at `http://127.0.0.1:5173/`.

## Known Local Notes

- Git status inspection is currently blocked by Git safe-directory ownership protection for the parent `C:/Users/gaddi/OneDrive/Desktop/Projects` repository.
