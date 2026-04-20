export interface Currency {
  symbol: string;
  name: string;
}

export interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
}
