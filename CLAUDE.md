# Currency Conversion — Developer Guide

## Project Overview
Full-stack currency conversion app. **Backend is complete; React frontend is next (not yet started).**

Single-package TypeScript monorepo. Server lives in `src/server/`, future React client in `src/client/` (already excluded from server tsconfig).

## Running the Server

```bash
# Prerequisites: Node 20+ required (nvm use 20 if needed)
cp .env.example .env   # add your Open Exchange Rates APP_ID
npm install
npm run dev            # tsx watch — live reload
npm run build          # tsc → dist/
npm start              # node dist/server/index.js
npm test               # jest
```

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

## Future Work

- **PostgreSQL stats store:** implement `IStatsStore` backed by pg; register it in `index.ts` startup. No route changes needed.
- **React frontend:** scaffold under `src/client/` with its own `tsconfig.json`; server tsconfig already excludes that path.
- **Caching TTL tuning:** currency names change rarely — consider longer TTL (e.g. 24h) for the currencies cache vs. rates.
