import "dotenv/config";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  port: parseInt(process.env.PORT ?? "3001", 10),
  appId: requireEnv("APP_ID"),
  oerBaseUrl: "https://openexchangerates.org/api",
  cacheRatesTtlMs: 60_000,
} as const;
