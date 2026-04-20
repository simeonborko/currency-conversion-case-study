import request from "supertest";
import { createApp } from "../app";
import * as exchangeRates from "../services/exchangeRates";

jest.mock("../services/exchangeRates");

describe("GET /api/currencies", () => {
  it("returns 200 with currencies array", async () => {
    const mockCurrencies = [
      { symbol: "EUR", name: "Euro" },
      { symbol: "USD", name: "US Dollar" },
    ];

    (exchangeRates.getCurrencies as jest.Mock).mockResolvedValueOnce(
      mockCurrencies
    );

    const response = await request(createApp()).get("/api/currencies");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ currencies: mockCurrencies });
  });

  it("returns 500 when service throws", async () => {
    (exchangeRates.getCurrencies as jest.Mock).mockRejectedValueOnce(
      new Error("API error")
    );

    const response = await request(createApp()).get("/api/currencies");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "API error" });
  });
});
