// Mock data — replace with DB query
import type { NextApiRequest, NextApiResponse } from "next";
import type { Responder } from "@/types";

const RESPONDERS: Responder[] = [
  // Near Kasarani — available
  {
    id: "R-001",
    name: "Amina Yusuf",
    team: "Rapid Response",
    status: "available",
    current_task_zone: null,
    lat: -1.216,
    lng: 36.896,
    active_task_count: 0,
    max_tasks: 5,
  },
  {
    id: "R-002",
    name: "Brian Otieno",
    team: "Medical Team",
    status: "available",
    current_task_zone: null,
    lat: -1.220,
    lng: 36.900,
    active_task_count: 0,
    max_tasks: 5,
  },
  // Near Westlands — one busy (2 tasks), one available
  {
    id: "R-003",
    name: "Cynthia Kamau",
    team: "Assessment",
    status: "busy",
    current_task_zone: "Z-005",
    lat: -1.268,
    lng: 36.808,
    active_task_count: 2,
    max_tasks: 5,
  },
  {
    id: "R-004",
    name: "David Mwangi",
    team: "Logistics",
    status: "available",
    current_task_zone: null,
    lat: -1.272,
    lng: 36.812,
    active_task_count: 0,
    max_tasks: 5,
  },
  // Near Karen — OUT of range of most zones
  {
    id: "R-005",
    name: "Esther Njeri",
    team: "Rapid Response",
    status: "available",
    current_task_zone: null,
    lat: -1.318,
    lng: 36.712,
    active_task_count: 0,
    max_tasks: 5,
  },
  // Near Eastleigh — busy (4 tasks, nearly full)
  {
    id: "R-006",
    name: "Francis Kimani",
    team: "Medical Team",
    status: "busy",
    current_task_zone: "Z-003",
    lat: -1.274,
    lng: 36.856,
    active_task_count: 4,
    max_tasks: 5,
  },
  // Near Ruaraka — available
  {
    id: "R-007",
    name: "Grace Wanjiru",
    team: "Assessment",
    status: "available",
    current_task_zone: null,
    lat: -1.228,
    lng: 36.872,
    active_task_count: 0,
    max_tasks: 5,
  },
  // Offline
  {
    id: "R-008",
    name: "Hassan Abdi",
    team: "Logistics",
    status: "offline",
    current_task_zone: null,
    lat: -1.240,
    lng: 36.860,
    active_task_count: 0,
    max_tasks: 5,
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse<Responder[]>) {
  res.status(200).json(RESPONDERS);
}
