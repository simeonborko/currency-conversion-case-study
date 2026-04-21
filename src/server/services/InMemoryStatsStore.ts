import type { ConversionStats } from "../types/stats";
import type { IStatsStore } from "./IStatsStore";

export class InMemoryStatsStore implements IStatsStore {
  private totalConversions = 0;
  private targetCounts = new Map<string, number>();

  recordConversion(targetCurrency: string): void {
    this.totalConversions++;
    this.targetCounts.set(
      targetCurrency,
      (this.targetCounts.get(targetCurrency) ?? 0) + 1
    );
  }

  getStats(): ConversionStats {
    let mostFrequentTarget: string | null = null;
    let maxCount = 0;

    for (const [currency, count] of this.targetCounts) {
      if (count > maxCount) {
        maxCount = count;
        mostFrequentTarget = currency;
      }
    }

    return {
      totalConversions: this.totalConversions,
      mostFrequentTarget,
    };
  }
}
