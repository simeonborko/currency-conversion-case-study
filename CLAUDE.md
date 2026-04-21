# Currency Conversion — Developer Guide

## Project Overview
Full-stack currency conversion app. **Backend complete; Next.js frontend complete.**

Monorepo structure: server in `src/server/`, frontend in `src/client/` (each has its own `package.json`, `tsconfig.json`). Root server tsconfig excludes `src/client/` to avoid conflicts.

## Running the App

### Backend Server
```bash
# Prerequisites: Node 20+ required
cp .env.example .env   # add your Open Exchange Rates APP_ID
npm install
npm run dev            # tsx watch — live reload on port 3001
npm run build          # tsc → dist/
npm start              # node dist/server/index.js
npm test               # jest
```

### Frontend (Next.js 15)
```bash
npm run client:install   # install frontend dependencies
npm run client:dev       # next dev — live reload on port 3000
npm run client:build     # next build
npm run client:start     # next start (production server)
```

**Both together** (requires two terminals or use `concurrently` for parallel execution).

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/currencies` | List all available currencies `{ currencies: [{ symbol, name }] }` |
| GET | `/api/convert?from=USD&to=EUR&amount=100` | Convert between currencies |
| GET | `/api/stats` | Conversion statistics |

**Convert validation:** `from` and `to` must be valid currency symbols (checked against `/api/currencies`); `amount` must be a positive finite number.

**Stats response:** `{ totalConversions: number, mostFrequentTarget: string | null }`

## Architecture

```
src/server/
├── index.ts               entry point — binds to port
├── app.ts                 createApp() factory — registers routes + global error handler
├── config.ts              reads .env, fails fast if APP_ID missing
├── types/
│   ├── currency.ts        Currency, ConversionResult DTOs
│   ├── openexchangerates.ts  raw OER API response shapes
│   └── stats.ts           ConversionStats DTO
├── services/
│   ├── cache.ts           generic TtlCache<T> (get/set/clear)
│   ├── exchangeRates.ts   fetches/caches OER data, cross-rate math
│   ├── IStatsStore.ts     interface: recordConversion(), getStats()
│   ├── InMemoryStatsStore.ts  current implementation
│   └── statsStore.ts      singleton + setStatsStore() for DI
└── routes/
    ├── currencies.ts      GET /api/currencies
    ├── convert.ts         GET /api/convert (validates, converts, records stats)
    └── stats.ts           GET /api/stats
```

## Key Design Decisions

**Cross-rate math:** OER free tier returns all rates relative to USD. Conversion uses `rate = rates[to] / rates[from]`, which correctly handles non-USD pairs (e.g. GBP→JPY).

**Cache:** `exchangeRates.ts` holds two `TtlCache` instances (currencies + rates), each 60s TTL. Tests call `clearCache()` + `setHttpClient()` to inject a mock and reset state between test runs.

**Stats concurrency:** `recordConversion()` is intentionally synchronous — no `await` between the read and write, so Node's single-threaded event loop guarantees atomicity.

**Stats are storage-agnostic:** `IStatsStore` interface + `setStatsStore()` dependency injection means swapping to PostgreSQL requires only a new implementing class, no changes to routes or other services.

**`createApp()` is separated from `index.ts`** so tests can import the Express app without binding to a port.

## Testing Patterns

**Service unit tests** (exchangeRates, cache, InMemoryStatsStore): inject mocks via exported setters (`setHttpClient`, `setStatsStore`) or construct fresh instances. Call `clearCache()` in `beforeEach` to avoid cross-test cache hits.

**Route integration tests** (supertest): mock entire service modules with `jest.mock(...)` for routes that depend on external I/O (`exchangeRates`). Inject fresh `InMemoryStatsStore` instances via `setStatsStore()` in `beforeEach` for stats isolation.

## Frontend Architecture (`src/client/`)

**Stack:** Next.js 15 + React 19 + TypeScript + Tailwind CSS 4 (CSS-first, no config file)

```
src/client/
├── app/
│   ├── layout.tsx          Root layout (imports globals.css)
│   ├── page.tsx            Main page — form + result display
│   └── globals.css         Tailwind @import + theme variables
├── components/
│   ├── ConverterForm.tsx   Purple card with amount + From/To selects
│   └── ResultCard.tsx      Displays converted amount + calculation count
├── lib/
│   ├── api.ts              Typed fetch wrappers for 3 backend endpoints
│   └── types.ts            DTOs matching server types
├── next.config.ts          Rewrites /api/* → http://localhost:3001/api/*
├── postcss.config.js       Tailwind 4 PostCSS plugin
├── tsconfig.json           Next.js strict TypeScript config
└── package.json            React 19, Next.js 15, Tailwind 4
```

**Key features:**
- Responsive design: 3-column form (desktop), stacked fields (mobile)
- Purple theme (`#6B21A8` card, `#5B21B6` button)
- API proxy via Next.js rewrites — all `/api/*` requests forward to backend
- Result card shows formatted amount + live stats (total conversions count)
- Error handling with inline error display
- Tailwind 4 CSS-first configuration (no `tailwind.config.js`)

**Running:** `npm run client:dev` starts on port 3000. Backend must run on port 3001 for proxy to work.

## Future Work

- **PostgreSQL stats store:** implement `IStatsStore` backed by pg; register it in `index.ts` startup. No route changes needed.
- **Caching TTL tuning:** currency names change rarely — consider longer TTL (e.g. 24h) for the currencies cache vs. rates.
- **Frontend deployment:** Next.js can be deployed standalone; rewrite target in `next.config.ts` should point to production backend URL via `NEXT_PUBLIC_API_URL` env var.
