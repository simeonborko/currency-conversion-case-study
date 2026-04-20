import { Router, Request, Response, NextFunction } from "express";
import { getCurrencies } from "../services/exchangeRates";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const currencies = await getCurrencies();
    res.json({ currencies });
  } catch (err) {
    next(err);
  }
});

export default router;
