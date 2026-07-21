# Home Sky

Home Sky is a personal weather and sky app for saving meaningful places and feeling the current atmosphere of home. It includes account login, saved locations, live weather data, and an immersive local sky view.

## Stack

- React + Vite
- Plain JavaScript
- Plain CSS
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Google Identity Services
- Open-Meteo APIs

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Fill in `.env`:

```env
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-long-random-secret
PORT=4001
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

`JWT_SECRET` is required. The backend will stop on startup if it is missing.

4. Start the backend:

```bash
npm run server
```

5. Start the frontend in another terminal:

```bash
npm run dev
```

Frontend: `http://127.0.0.1:5173`

Backend: `http://127.0.0.1:4001`

Useful local routes:

- `http://127.0.0.1:5173/sky`
- `http://127.0.0.1:5173/weather`

## Environment Notes

Do not commit `.env`. It contains private credentials for MongoDB, JWT signing, and Google OAuth.

## Scripts

- `npm run dev` starts the Vite frontend.
- `npm run server` starts the Express backend.
- `npm run build` builds the frontend.
- `npm run preview` previews the frontend build.
- `npm run check` runs the production build check.

## Current Features

- Email signup/login.
- Google login.
- Saved locations with default and active location persistence.
- Open-Meteo location search.
- Current weather, hourly forecast, and seven-day forecast.
- Live local time for the selected location timezone.
- Immersive `/sky` view with time-of-day sky, cloud layers, fog/haze, rain/snow, and storm placeholders.
- Detailed `/weather` view for forecast data.
- Development-only Sky Lab controls for testing visual weather states.

## Data

MongoDB stores:

- Users
- Password hashes or Google auth profile links
- Saved locations
- Default location
- Active location

Open-Meteo weather data is fetched live and is not stored.

## Development Workflow

- `main` is the stable baseline.
- `dev` is the integration branch.
- Feature work should happen on branches from `dev`, such as `feature/phase-1-sky-view`.
- Keep `.env`, `node_modules`, and build output out of Git.
