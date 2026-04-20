import axios, { AxiosInstance } from "axios";
import { config } from "../config";
import { TtlCache } from "./cache";
import type { OerLatestResponse, OerCurrenciesResponse } from "../types/openexchangerates";
import type { Currency, ConversionResult } from "../types/currency";

const ratesCache = new TtlCache<OerLatestResponse>(config.cacheRatesTtlMs);
const currenciesCache = new TtlCache<OerCurrenciesResponse>(config.cacheRatesTtlMs);

let httpClient: AxiosInstance = axios;

export function setHttpClient(client: AxiosInstance): void {
  httpClient = client;
}

export function clearCache(): void {
  ratesCache.clear();
  currenciesCache.clear();
}

async function fetchLatestRates(): Promise<OerLatestResponse> {
  const cached = ratesCache.get("latest");
  if (cached) return cached;

  const { data } = await httpClient.get<OerLatestResponse>(
    `${config.oerBaseUrl}/latest.json`,
    { params: { app_id: config.appId }, timeout: 8_000 }
  );
  ratesCache.set("latest", data);
  return data;
}

async function fetchCurrencies(): Promise<OerCurrenciesResponse> {
  const cached = currenciesCache.get("currencies");
  if (cached) return cached;

  const { data } = await httpClient.get<OerCurrenciesResponse>(
    `${config.oerBaseUrl}/currencies.json`,
    { params: { app_id: config.appId }, timeout: 8_000 }
  );
  currenciesCache.set("currencies", data);
  return data;
}

export async function getCurrencies(): Promise<Currency[]> {
  const raw = await fetchCurrencies();
  return Object.entries(raw)
    .map(([symbol, name]) => ({ symbol, name }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
}

export async function convertCurrency(
  from: string,
  to: string,
  amount: number
): Promise<ConversionResult> {
  const { rates } = await fetchLatestRates();

  const rateFrom = rates[from];
  const rateTo = rates[to];

  if (rateFrom == null) throw new Error(`Unknown currency: ${from}`);
  if (rateTo == null) throw new Error(`Unknown currency: ${to}`);

  // OER free tier bases all rates on USD.
  // Cross-rate: result = amount * (rateTo / rateFrom)
  const rate = rateTo / rateFrom;
  const result = parseFloat((amount * rate).toFixed(6));

  return { from, to, amount, result, rate };
}
