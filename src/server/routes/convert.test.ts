import request from "supertest";
import { createApp } from "../app";
import * as exchangeRates from "../services/exchangeRates";
import { InMemoryStatsStore } from "../services/InMemoryStatsStore";
import { setStatsStore } from "../services/statsStore";

jest.mock("../services/exchangeRates");

describe("GET /api/convert", () => {
  const mockCurrencies = [
    { symbol: "USD", name: "US Dollar" },
    { symbol: "EUR", name: "Euro" },
    { symbol: "GBP", name: "British Pound" },
  ];

  beforeEach(() => {
    (exchangeRates.getCurrencies as jest.Mock).mockResolvedValue(
      mockCurrencies
    );
    setStatsStore(new InMemoryStatsStore());
  });

  it("returns 200 with ConversionResult", async () => {
    (exchangeRates.convertCurrency as jest.Mock).mockResolvedValueOnce({
      from: "USD",
      to: "EUR",
      amount: 100,
      result: 92,
      rate: 0.92,
    });

    const response = await request(createApp()).get(
      "/api/convert?from=USD&to=EUR&amount=100"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      from: "USD",
      to: "EUR",
      amount: 100,
      result: 92,
      rate: 0.92,
    });
  });

  it("returns 400 when from is missing", async () => {
    const response = await request(createApp()).get(
      "/api/convert?to=EUR&amount=100"
    );

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("from");
  });

  it("returns 400 when to is missing", async () => {
    const response = await request(createApp()).get(
      "/api/convert?from=USD&amount=100"
    );

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("to");
  });

  it("returns 400 when amount is missing", async () => {
    const response = await request(createApp()).get(
      "/api/convert?from=USD&to=EUR"
    );

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("amount");
  });

  it("returns 400 when amount is non-numeric", async () => {
    const response = await request(createApp()).get(
      "/api/convert?from=USD&to=EUR&amount=abc"
    );

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("positive number");
  });

  it("returns 400 when amount is negative", async () => {
    const response = await request(createApp()).get(
      "/api/convert?from=USD&to=EUR&amount=-5"
    );

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("positive number");
  });

  it("returns 400 when from currency is unknown", async () => {
    const response = await request(createApp()).get(
      "/api/convert?from=XYZ&to=EUR&amount=100"
    );

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Unknown currency");
  });

  it("returns 400 when to currency is unknown", async () => {
    const response = await request(createApp()).get(
      "/api/convert?from=USD&to=ABC&amount=100"
    );

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Unknown currency");
  });

  it("returns 500 when service throws", async () => {
    (exchangeRates.convertCurrency as jest.Mock).mockRejectedValueOnce(
      new Error("API error")
    );

    const response = await request(createApp()).get(
      "/api/convert?from=USD&to=EUR&amount=100"
    );

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "API error" });
  });

  it("records conversion in stats store", async () => {
    const store = new InMemoryStatsStore();
    setStatsStore(store);

    (exchangeRates.convertCurrency as jest.Mock).mockResolvedValueOnce({
      from: "USD",
      to: "EUR",
      amount: 100,
      result: 92,
      rate: 0.92,
    });

    const response = await request(createApp()).get(
      "/api/convert?from=USD&to=EUR&amount=100"
    );

    expect(response.status).toBe(200);
    const stats = store.getStats();
    expect(stats.totalConversions).toBe(1);
    expect(stats.mostFrequentTarget).toBe("EUR");
  });
});
