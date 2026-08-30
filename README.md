# Library Management Frontend

React and Vite frontend for the Library Management System.

## Local Development

```bash
npm install
npm run dev
```

Create `.env` from `.env.example` and set `VITE_API_URL` to the backend API URL.

## Vercel Deployment

Set the Vercel project root to this `client` folder.

Add this environment variable:

- `VITE_API_URL`: deployed backend URL ending in `/api`, for example `https://your-backend.vercel.app/api`

The included `vercel.json` rewrites client-side routes to `index.html`, so refreshes on `/dashboard`, `/books`, `/members`, and `/transactions` work in production.
