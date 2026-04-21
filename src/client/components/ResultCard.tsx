"use client";

import { ConversionResult, ConversionStats } from "@/lib/types";

interface ResultCardProps {
  result: ConversionResult;
  stats: ConversionStats | null;
}

export default function ResultCard({ result, stats }: ResultCardProps) {
  const formatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedAmount = formatter.format(result.result);

  return (
    <div className="rounded-xl bg-white border border-gray-200 p-6 w-full text-center">
      <p className="text-sm text-gray-500 mb-2">Result</p>
      <p className="text-3xl font-bold text-gray-900 mb-4">
        {formattedAmount} {result.to}
      </p>

      <hr className="my-4 border-gray-200" />

      <p className="text-sm text-gray-500 mb-2">Number of calculations made</p>
      <p className="text-3xl font-bold text-gray-900">{stats?.totalConversions ?? 0}</p>
    </div>
  );
}
