# Currency Converter

A full-stack currency conversion application with a responsive web interface.

## Quick Start

### Prerequisites
- Node.js 20+ (use `nvm use 20` if you have nvm installed)
- Open Exchange Rates API key (sign up at https://openexchangerates.org)

### Setup

```bash
# Install server dependencies
npm install

# Create .env file with your API key
cp .env.example .env
# Edit .env and add your APP_ID from Open Exchange Rates
```

### Running the App

You'll need two terminals.

**Terminal 1 — Backend (port 3001):**
```bash
npm run dev
```

**Terminal 2 — Frontend (port 3000):**
```bash
npm run client:install  # only needed on first run
npm run client:dev
```

Then open http://localhost:3000 in your browser.

## Available Scripts

### Server
- `npm run dev` — start dev server with live reload
- `npm run build` — compile TypeScript
- `npm start` — run compiled server
- `npm test` — run tests

### Client
- `npm run client:dev` — start Next.js dev server
- `npm run client:build` — build for production
- `npm run client:start` — run production server

## Project Structure

```
src/
├── server/          Express backend (port 3001)
│   ├── routes/      API endpoints
│   ├── services/    Business logic & caching
│   └── types/       TypeScript interfaces
└── client/          Next.js frontend (port 3000)
    ├── app/         Pages & layout
    ├── components/  React components
    └── lib/         API wrappers
```

## API

The frontend communicates with the backend via three endpoints:

- `GET /api/currencies` — List available currencies
- `GET /api/convert?from=USD&to=EUR&amount=100` — Convert currency
- `GET /api/stats` — Get conversion statistics

See [CLAUDE.md](./CLAUDE.md) for detailed architecture.

## Features

- Real-time currency conversion using Open Exchange Rates API
- Responsive design (desktop & mobile)
- Caching for improved performance
- Conversion statistics tracking
- TypeScript for type safety

## Troubleshooting

**"Cannot find module" errors:** Make sure you've run `npm install` in both the root directory and `src/client/`.

**API requests failing:** Ensure the backend is running on port 3001 and your `.env` file has a valid `APP_ID`.

**Port already in use:** Change ports in `next.config.ts` (frontend) or `src/server/index.ts` (backend).
