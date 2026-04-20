export interface OerLatestResponse {
  disclaimer: string;
  license: string;
  timestamp: number;
  base: string;
  rates: Record<string, number>;
}

export interface OerCurrenciesResponse {
  [symbol: string]: string;
}
