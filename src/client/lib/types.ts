export interface Currency {
  symbol: string;
  name: string;
}

export interface ConversionResult {
  result: number;
  rate: number;
  from: string;
  to: string;
  amount: number;
}

export interface ConversionStats {
  totalConversions: number;
  mostFrequentTarget: string | null;
}
