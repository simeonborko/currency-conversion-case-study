"use client";

import { useState } from "react";
import ConverterForm from "@/components/ConverterForm";
import ResultCard from "@/components/ResultCard";
import { ConversionResult, ConversionStats } from "@/lib/types";
import { fetchStats } from "@/lib/api";

export default function Page() {
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [stats, setStats] = useState<ConversionStats | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleConversionComplete = async (result: ConversionResult) => {
    setConversionResult(result);
    try {
      const freshStats = await fetchStats();
      setStats(freshStats);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch stats";
      setErrorMessage(message);
    }
  };

  return (
    <main className="min-h-screen bg-[#e5e7eb] flex flex-col items-center px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Purple currency converter
      </h1>

      <div className="w-full max-w-4xl flex flex-col gap-6">
        <ConverterForm
          onConversionComplete={handleConversionComplete}
          onConversionError={setErrorMessage}
        />

        {errorMessage && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
            {errorMessage}
          </div>
        )}

        {conversionResult && <ResultCard result={conversionResult} stats={stats} />}
      </div>
    </main>
  );
}
