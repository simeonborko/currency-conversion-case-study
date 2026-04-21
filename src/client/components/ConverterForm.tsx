"use client";

import { useState, useEffect } from "react";
import { Currency, ConversionResult } from "@/lib/types";
import { fetchCurrencies, convertCurrency } from "@/lib/api";

interface ConverterFormProps {
  onConversionComplete: (result: ConversionResult) => void;
  onConversionError: (error: string) => void;
}

export default function ConverterForm({
  onConversionComplete,
  onConversionError,
}: ConverterFormProps) {
  const [amount, setAmount] = useState("200");
  const [fromCurrency, setFromCurrency] = useState("EUR");
  const [toCurrency, setToCurrency] = useState("CZK");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);

  useEffect(() => {
    fetchCurrencies()
      .then(setCurrencies)
      .catch((err) => {
        onConversionError(`Failed to load currencies: ${err.message}`);
      })
      .finally(() => setCurrenciesLoading(false));
  }, [onConversionError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      onConversionError("Amount must be a positive number");
      return;
    }

    setIsLoading(true);
    try {
      const result = await convertCurrency(fromCurrency, toCurrency, parsedAmount);
      onConversionComplete(result);
      onConversionError("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Conversion failed";
      onConversionError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-xl bg-purple-brand p-6">
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Amount to convert */}
          <div className="flex-1">
            <label className="block text-white text-sm font-medium mb-2">
              Amount to convert
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              step="0.01"
              min="0"
              className="w-full rounded-lg bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-brand-dark"
              disabled={isLoading || currenciesLoading}
            />
          </div>

          {/* From currency */}
          <div className="flex-1">
            <label className="block text-white text-sm font-medium mb-2">
              From
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full rounded-lg bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-brand-dark"
              disabled={isLoading || currenciesLoading}
            >
              {currencies.map((currency) => (
                <option key={currency.symbol} value={currency.symbol}>
                  {currency.symbol}
                </option>
              ))}
            </select>
          </div>

          {/* To currency */}
          <div className="flex-1">
            <label className="block text-white text-sm font-medium mb-2">
              To
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full rounded-lg bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-brand-dark"
              disabled={isLoading || currenciesLoading}
            >
              {currencies.map((currency) => (
                <option key={currency.symbol} value={currency.symbol}>
                  {currency.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || currenciesLoading}
        className="mx-auto block bg-purple-brand-dark text-white font-medium rounded-lg px-6 py-3 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Converting..." : "Convert currency"}
      </button>
    </form>
  );
}
