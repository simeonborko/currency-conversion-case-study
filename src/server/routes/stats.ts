import { Router, Request, Response } from "express";
import { getStatsStore } from "../services/statsStore";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const stats = getStatsStore().getStats();
  res.json(stats);
});

export default router;
