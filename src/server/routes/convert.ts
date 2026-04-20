import { Router, Request, Response, NextFunction } from "express";
import { getCurrencies, convertCurrency } from "../services/exchangeRates";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to, amount: amountStr } = req.query;

    if (typeof from !== "string" || from.trim() === "")
      return res.status(400).json({ error: "Query param 'from' is required" });
    if (typeof to !== "string" || to.trim() === "")
      return res.status(400).json({ error: "Query param 'to' is required" });
    if (typeof amountStr !== "string")
      return res.status(400).json({ error: "Query param 'amount' is required" });

    const amount = Number(amountStr);
    if (!Number.isFinite(amount) || amount <= 0)
      return res.status(400).json({ error: "'amount' must be a positive number" });

    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();

    const currencies = await getCurrencies();
    const symbols = new Set(currencies.map((c) => c.symbol));

    if (!symbols.has(fromUpper))
      return res.status(400).json({ error: `Unknown currency: ${fromUpper}` });
    if (!symbols.has(toUpper))
      return res.status(400).json({ error: `Unknown currency: ${toUpper}` });

    const result = await convertCurrency(fromUpper, toUpper, amount);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
