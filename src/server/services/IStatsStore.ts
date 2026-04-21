import type { ConversionStats } from "../types/stats";

export interface IStatsStore {
  recordConversion(targetCurrency: string): void;
  getStats(): ConversionStats;
}
