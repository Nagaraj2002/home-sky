# Home Sky

Home Sky is a personal weather app for saving meaningful places and checking their live local time, current weather, hourly forecast, and seven-day forecast.

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

## Environment Notes

Do not commit `.env`. It contains private credentials for MongoDB, JWT signing, and Google OAuth.

## Scripts

- `npm run dev` starts the Vite frontend.
- `npm run server` starts the Express backend.
- `npm run build` builds the frontend.
- `npm run preview` previews the frontend build.
- `npm run check` runs the production build check.

## Data

MongoDB stores:

- Users
- Password hashes or Google auth profile links
- Saved locations
- Default location
- Active location

Open-Meteo weather data is fetched live and is not stored.
