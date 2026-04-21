import express, { Request, Response, NextFunction } from "express";
import currenciesRouter from "./routes/currencies";
import convertRouter from "./routes/convert";
import statsRouter from "./routes/stats";

export function createApp() {
  const app = express();
  app.use(express.json());

  app.use("/api/currencies", currenciesRouter);
  app.use("/api/convert", convertRouter);
  app.use("/api/stats", statsRouter);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  });

  return app;
}
