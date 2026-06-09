// Mock data — replace with DB query
import type { NextApiRequest, NextApiResponse } from "next";
import type { SeveritySummary } from "@/types";

const SUMMARY: SeveritySummary = {
  pct_destroyed: 62,
  pct_partial: 28,
  pct_minimal: 10,
  total_reports: 1204,
};

export default function handler(req: NextApiRequest, res: NextApiResponse<SeveritySummary>) {
  res.status(200).json(SUMMARY);
}
