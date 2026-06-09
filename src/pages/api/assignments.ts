// Mock data — replace with DB query
// NOTE: /api/tasks is the canonical endpoint; this file is kept for backwards compatibility
import type { NextApiRequest, NextApiResponse } from "next";
import type { TaskAssignment } from "@/types";

const ASSIGNMENTS: TaskAssignment[] = [
  {
    id: "A-9001",
    zone_id: "Z-101",
    point_id: "P-002",
    responder_name: "Amara Njoroge",
    priority: "Critical",
    status: "assigned",
    created_at: "15 min ago",
  },
  {
    id: "A-9002",
    zone_id: "Z-102",
    point_id: "P-019",
    responder_name: "Samuel Otieno",
    priority: "Medium",
    status: "assigned",
    created_at: "42 min ago",
  },
  {
    id: "A-9003",
    zone_id: "Z-105",
    point_id: "P-035",
    responder_name: "Leila Hassan",
    priority: "Low",
    status: "resolved",
    created_at: "2h ago",
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse<TaskAssignment[]>) {
  res.status(200).json(ASSIGNMENTS);
}
