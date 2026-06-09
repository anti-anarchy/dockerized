// Mock data — replace with DB query
import type { NextApiRequest, NextApiResponse } from "next";
import type { TaskAssignment } from "@/types";

const MOCK_TASKS: TaskAssignment[] = [
  // Active (assigned)
  {
    id: "T-001",
    zone_id: "Z-001",
    point_id: "P-002",
    responder_name: "Amina Yusuf",
    priority: "Critical",
    status: "assigned",
    created_at: "2024-06-09T08:30:00Z",
  },
  {
    id: "T-002",
    zone_id: "Z-001",
    point_id: "P-007",
    responder_name: "Brian Otieno",
    priority: "Critical",
    status: "assigned",
    created_at: "2024-06-09T08:45:00Z",
  },
  {
    id: "T-003",
    zone_id: "Z-002",
    point_id: "P-019",
    responder_name: "Cynthia Kamau",
    priority: "Critical",
    status: "assigned",
    created_at: "2024-06-09T09:00:00Z",
  },
  {
    id: "T-004",
    zone_id: "Z-002",
    point_id: "P-022",
    responder_name: "Grace Wanjiru",
    priority: "Critical",
    status: "assigned",
    created_at: "2024-06-09T09:05:00Z",
  },
  // Unassigned
  {
    id: "T-005",
    zone_id: "Z-001",
    point_id: "P-001",
    responder_name: "",
    priority: "Medium",
    status: "unassigned",
    created_at: "2024-06-09T09:15:00Z",
  },
  {
    id: "T-006",
    zone_id: "Z-002",
    point_id: "P-020",
    responder_name: "",
    priority: "Critical",
    status: "unassigned",
    created_at: "2024-06-09T09:20:00Z",
  },
  {
    id: "T-007",
    zone_id: "Z-003",
    point_id: "P-034",
    responder_name: "",
    priority: "Medium",
    status: "unassigned",
    created_at: "2024-06-09T09:25:00Z",
  },
  // Resolved
  {
    id: "T-008",
    zone_id: "Z-001",
    point_id: "P-004",
    responder_name: "David Mwangi",
    priority: "Low",
    status: "resolved",
    created_at: "2024-06-09T07:00:00Z",
  },
  {
    id: "T-009",
    zone_id: "Z-001",
    point_id: "P-006",
    responder_name: "Francis Kimani",
    priority: "Medium",
    status: "resolved",
    created_at: "2024-06-09T07:30:00Z",
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json(MOCK_TASKS);
  }

  if (req.method === "POST") {
    // TODO: persist task to DB
    return res.status(200).json({ task_id: "mock-task-" + Date.now(), success: true });
  }

  return res.status(405).json({ success: false });
}
