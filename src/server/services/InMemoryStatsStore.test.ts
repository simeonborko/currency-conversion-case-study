import { InMemoryStatsStore } from "./InMemoryStatsStore";

describe("InMemoryStatsStore", () => {
  let store: InMemoryStatsStore;

  beforeEach(() => {
    store = new InMemoryStatsStore();
  });

  it("getStats returns initial state with zero conversions", () => {
    const stats = store.getStats();
    expect(stats).toEqual({
      totalConversions: 0,
      mostFrequentTarget: null,
    });
  });

  it("recordConversion increments totalConversions", () => {
    store.recordConversion("EUR");
    expect(store.getStats().totalConversions).toBe(1);
  });

  it("tracks most frequent target currency", () => {
    store.recordConversion("EUR");
    store.recordConversion("EUR");
    store.recordConversion("GBP");

    const stats = store.getStats();
    expect(stats.totalConversions).toBe(3);
    expect(stats.mostFrequentTarget).toBe("EUR");
  });

  it("returns first currency when tied for most frequent", () => {
    store.recordConversion("EUR");
    store.recordConversion("GBP");

    const stats = store.getStats();
    expect(stats.mostFrequentTarget).toBe("EUR");
  });

  it("updates mostFrequentTarget when counts change", () => {
    store.recordConversion("EUR");
    expect(store.getStats().mostFrequentTarget).toBe("EUR");

    store.recordConversion("GBP");
    store.recordConversion("GBP");
    expect(store.getStats().mostFrequentTarget).toBe("GBP");
  });
});
