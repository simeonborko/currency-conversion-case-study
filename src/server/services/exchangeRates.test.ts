import * as exchangeRates from "./exchangeRates";

describe("exchangeRates", () => {
  const mockCurrencies = {
    USD: "US Dollar",
    EUR: "Euro",
    GBP: "British Pound",
    JPY: "Japanese Yen",
  };

  const mockRates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 150.5,
  };

  let mockHttpClient: any;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
    };
    exchangeRates.setHttpClient(mockHttpClient);
    exchangeRates.clearCache();
  });

  describe("getCurrencies", () => {
    it("returns sorted Currency array from mocked OER response", async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: mockCurrencies,
      });

      const result = await exchangeRates.getCurrencies();
      expect(result).toEqual([
        { symbol: "EUR", name: "Euro" },
        { symbol: "GBP", name: "British Pound" },
        { symbol: "JPY", name: "Japanese Yen" },
        { symbol: "USD", name: "US Dollar" },
      ]);
    });

    it("returns cached result on second call", async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: mockCurrencies,
      });

      await exchangeRates.getCurrencies();
      await exchangeRates.getCurrencies();

      expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("convertCurrency", () => {
    beforeEach(() => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          rates: mockRates,
        },
      });
    });

    it("converts USD to EUR correctly", async () => {
      const result = await exchangeRates.convertCurrency("USD", "EUR", 100);
      expect(result.from).toBe("USD");
      expect(result.to).toBe("EUR");
      expect(result.amount).toBe(100);
      expect(result.rate).toBe(0.92);
      expect(result.result).toBe(92);
    });

    it("computes correct cross-rate for GBP to JPY", async () => {
      const result = await exchangeRates.convertCurrency("GBP", "JPY", 50);
      const rate = 150.5 / 0.79;
      expect(result.from).toBe("GBP");
      expect(result.to).toBe("JPY");
      expect(result.amount).toBe(50);
      expect(result.rate).toBeCloseTo(rate, 5);
    });

    it("throws on unknown from currency", async () => {
      await expect(
        exchangeRates.convertCurrency("XYZ", "EUR", 100)
      ).rejects.toThrow("Unknown currency: XYZ");
    });

    it("throws on unknown to currency", async () => {
      await expect(
        exchangeRates.convertCurrency("USD", "ABC", 100)
      ).rejects.toThrow("Unknown currency: ABC");
    });
  });
});
