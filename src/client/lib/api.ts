import { Currency, ConversionResult, ConversionStats } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "/api";

export async function fetchCurrencies(): Promise<Currency[]> {
  const res = await fetch(`${BASE}/currencies`);
  if (!res.ok) throw new Error(`Failed to fetch currencies: ${res.statusText}`);
  const data = await res.json();
  return data.currencies;
}

export async function convertCurrency(
  from: string,
  to: string,
  amount: number
): Promise<ConversionResult> {
  const params = new URLSearchParams({
    from,
    to,
    amount: amount.toString(),
  });
  const res = await fetch(`${BASE}/convert?${params}`);
  if (!res.ok) throw new Error(`Conversion failed: ${res.statusText}`);
  return res.json();
}

export async function fetchStats(): Promise<ConversionStats> {
  const res = await fetch(`${BASE}/stats`);
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.statusText}`);
  return res.json();
}
