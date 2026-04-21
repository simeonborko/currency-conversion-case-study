import request from "supertest";
import { createApp } from "../app";
import { InMemoryStatsStore } from "../services/InMemoryStatsStore";
import { setStatsStore } from "../services/statsStore";

describe("GET /api/stats", () => {
  beforeEach(() => {
    setStatsStore(new InMemoryStatsStore());
  });

  it("returns 200 with ConversionStats shape", async () => {
    const response = await request(createApp()).get("/api/stats");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      totalConversions: 0,
      mostFrequentTarget: null,
    });
  });

  it("returns correct data after store has been populated", async () => {
    const store = new InMemoryStatsStore();
    store.recordConversion("EUR");
    store.recordConversion("EUR");
    store.recordConversion("GBP");
    setStatsStore(store);

    const response = await request(createApp()).get("/api/stats");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      totalConversions: 3,
      mostFrequentTarget: "EUR",
    });
  });
});
