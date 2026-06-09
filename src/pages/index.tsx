import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
    Badge,
    Button,
    Center,
    Divider,
    Group,
    Loader,
    Modal,
    Paper,
    Stack,
    Tabs,
    Text,
} from "@mantine/core";
import Header from "@/components/Header";
import type { DisasterType, PointFeature, TaskAssignment, TaskStatus, ZoneFeature } from "@/types";
import { DAMAGE_COLORS, DISASTER_COLORS } from "@/types";
import type { MapSelection } from "@/components/DashboardMap";

const DashboardMap = dynamic(() => import("@/components/DashboardMap"), {
    ssr: false,
    loading: () => (
        <Center style={{ height: "100%" }}>
            <Loader />
        </Center>
    ),
});

interface AuthUser {
    name: string;
    email: string;
}

const TASK_STATUS_STYLES: Record<TaskStatus, { bg: string; color: string }> = {
    unassigned: { bg: "#FEE2E2", color: "#991B1B" },
    assigned: { bg: "#E6F1FB", color: "#185FA5" },
    resolved: { bg: "#EAF3DE", color: "#3B6D11" },
};

function DamageMixBar({
    pct_critical,
    pct_partial,
    pct_low,
}: {
    pct_critical: number;
    pct_partial: number;
    pct_low: number;
}) {
    return (
        <div>
            <div className="h-3 rounded-full overflow-hidden bg-slate-100 flex">
                <div style={{ width: `${pct_low * 100}%`, height: "100%", background: DAMAGE_COLORS.Low }} />
                <div style={{ width: `${pct_partial * 100}%`, height: "100%", background: DAMAGE_COLORS.Medium }} />
                <div style={{ width: `${pct_critical * 100}%`, height: "100%", background: DAMAGE_COLORS.Critical }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <Text size="xs" c="dimmed">Low {Math.round(pct_low * 100)}%</Text>
                <Text size="xs" c="dimmed">Med {Math.round(pct_partial * 100)}%</Text>
                <Text size="xs" c="dimmed">Crit {Math.round(pct_critical * 100)}%</Text>
            </div>
        </div>
    );
}

function DisasterBreakdown({
    breakdown,
    total,
}: {
    breakdown: Partial<Record<DisasterType, number>>;
    total: number;
}) {
    const sorted = (Object.entries(breakdown) as [DisasterType, number][]).sort(
        (a, b) => b[1] - a[1]
    );
    return (
        <Stack gap={5}>
            {sorted.map(([type, count]) => {
                const color = DISASTER_COLORS[type] ?? "#607D8B";
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                    <div key={type} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: color,
                                flexShrink: 0,
                            }}
                        />
                        <Text size="xs" style={{ width: 82, flexShrink: 0 }}>
                            {type}
                        </Text>
                        <div
                            style={{
                                flex: 1,
                                height: 5,
                                background: "#eee",
                                borderRadius: 3,
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{ width: `${pct}%`, height: "100%", background: color }}
                            />
                        </div>
                        <Text size="xs" c="dimmed" style={{ minWidth: 22, textAlign: "right" }}>
                            {count}
                        </Text>
                    </div>
                );
            })}
        </Stack>
    );
}

function OverallAreaStats({ zones }: { zones: ZoneFeature[] }) {
    const stats = useMemo(() => {
        if (zones.length === 0) return null;
        const totalReports = zones.reduce((s, z) => s + z.properties.count, 0);
        const totalCasualties = zones.reduce((s, z) => s + z.properties.casualties, 0);
        const pct_critical =
            totalReports > 0
                ? zones.reduce((s, z) => s + z.properties.count * z.properties.pct_critical, 0) /
                  totalReports
                : 0;
        const pct_partial =
            totalReports > 0
                ? zones.reduce((s, z) => s + z.properties.count * z.properties.pct_partial, 0) /
                  totalReports
                : 0;
        const pct_low =
            totalReports > 0
                ? zones.reduce((s, z) => s + z.properties.count * z.properties.pct_low, 0) /
                  totalReports
                : 0;
        const disasterBreakdown: Partial<Record<DisasterType, number>> = {};
        for (const zone of zones) {
            for (const [type, count] of Object.entries(
                zone.properties.disaster_breakdown ?? {}
            )) {
                const t = type as DisasterType;
                disasterBreakdown[t] = (disasterBreakdown[t] ?? 0) + (count as number);
            }
        }
        return { totalReports, totalCasualties, pct_critical, pct_partial, pct_low, disasterBreakdown };
    }, [zones]);

    if (!stats) {
        return (
            <div className="h-full flex items-center justify-center px-4">
                <Text c="dimmed" ta="center" size="sm">
                    Loading area data…
                </Text>
            </div>
        );
    }

    return (
        <Stack gap="md">
            <Paper withBorder radius="md" p="md">
                <Text fw={700} size="sm" mb={2}>
                    Area Overview
                </Text>
                <Text size="xs" c="dimmed" mb="md">
                    {zones.length} zone{zones.length !== 1 ? "s" : ""} visible
                </Text>
                <div className="space-y-3">
                    <div style={{ display: "flex", gap: 24 }}>
                        <div>
                            <Text size="xs" c="dimmed">Total reports</Text>
                            <Text fw={700} size="lg">{stats.totalReports}</Text>
                        </div>
                        <div>
                            <Text size="xs" c="dimmed">Casualties</Text>
                            <Text fw={700} size="lg">{stats.totalCasualties}</Text>
                        </div>
                    </div>
                    <div>
                        <Text size="xs" c="dimmed" mb={5}>Damage breakdown</Text>
                        <DamageMixBar
                            pct_critical={stats.pct_critical}
                            pct_partial={stats.pct_partial}
                            pct_low={stats.pct_low}
                        />
                    </div>
                    <div>
                        <Text size="xs" c="dimmed" mb={6}>By disaster type</Text>
                        <DisasterBreakdown
                            breakdown={stats.disasterBreakdown}
                            total={stats.totalReports}
                        />
                    </div>
                </div>
            </Paper>
        </Stack>
    );
}

function ClusterStats({
    zone,
    onAssign,
}: {
    zone: ZoneFeature;
    onAssign: () => void;
}) {
    const color = DISASTER_COLORS[zone.properties.dominant_disaster] ?? "#607D8B";
    const tierColor = DAMAGE_COLORS[zone.properties.tier] ?? "#c0392b";
    const total = zone.properties.count;
    return (
        <Stack gap="md">
            <Paper withBorder radius="md" p="md">
                <Group justify="space-between" mb={4}>
                    <Text fw={700} size="sm">{zone.properties.zone_id}</Text>
                    <div style={{ display: "flex", gap: 5 }}>
                        <Badge style={{ backgroundColor: color, color: "#fff" }} size="sm">
                            {zone.properties.dominant_disaster}
                        </Badge>
                        <Badge style={{ backgroundColor: tierColor, color: "#fff" }} size="sm">
                            {zone.properties.tier}
                        </Badge>
                    </div>
                </Group>
                <Text size="xs" c="dimmed" mb="md">
                    {zone.properties.label}
                </Text>

                <div style={{ display: "flex", gap: 24, marginBottom: 12 }}>
                    <div>
                        <Text size="xs" c="dimmed">Reports</Text>
                        <Text fw={700}>{zone.properties.count}</Text>
                    </div>
                    <div>
                        <Text size="xs" c="dimmed">Casualties</Text>
                        <Text fw={700}>{zone.properties.casualties}</Text>
                    </div>
                    <div>
                        <Text size="xs" c="dimmed">Score</Text>
                        <Text fw={700}>{zone.properties.score}</Text>
                    </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                    <Text size="xs" c="dimmed" mb={5}>Damage breakdown</Text>
                    <DamageMixBar
                        pct_critical={zone.properties.pct_critical}
                        pct_partial={zone.properties.pct_partial}
                        pct_low={zone.properties.pct_low}
                    />
                </div>

                {Object.keys(zone.properties.disaster_breakdown ?? {}).length > 0 && (
                    <div>
                        <Text size="xs" c="dimmed" mb={6}>Disaster breakdown</Text>
                        <DisasterBreakdown
                            breakdown={zone.properties.disaster_breakdown ?? {}}
                            total={total}
                        />
                    </div>
                )}

                <Button fullWidth mt="md" size="xs" onClick={onAssign}>
                    Assign responder →
                </Button>
            </Paper>
        </Stack>
    );
}

function PointStats({
    point,
    cluster,
    assignments,
    onAssign,
}: {
    point: PointFeature;
    cluster: ZoneFeature | null;
    assignments: TaskAssignment[];
    onAssign: () => void;
}) {
    const disasterColor = DISASTER_COLORS[point.properties.disaster_type] ?? "#607D8B";
    const damageColor = DAMAGE_COLORS[point.properties.damage_level] ?? "#c0392b";
    const activeAssignment = assignments.find(
        (a) => a.status !== "resolved"
    ) ?? null;
    const isAssigned = activeAssignment !== null;

    return (
        <Stack gap="md">
            {cluster && (
                <Paper withBorder radius="md" p="md">
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={6} style={{ letterSpacing: "0.04em" }}>
                        Zone Context
                    </Text>
                    <Group justify="space-between" mb={4}>
                        <Text size="sm" fw={600}>{cluster.properties.label}</Text>
                        <Badge
                            style={{
                                backgroundColor: DAMAGE_COLORS[cluster.properties.tier],
                                color: "#fff",
                            }}
                            size="sm"
                        >
                            {cluster.properties.tier}
                        </Badge>
                    </Group>
                    <div style={{ display: "flex", gap: 20 }}>
                        <div>
                            <Text size="xs" c="dimmed">Reports in zone</Text>
                            <Text fw={600} size="sm">{cluster.properties.count}</Text>
                        </div>
                        <div>
                            <Text size="xs" c="dimmed">Casualties</Text>
                            <Text fw={600} size="sm">{cluster.properties.casualties}</Text>
                        </div>
                    </div>
                </Paper>
            )}

            <Paper withBorder radius="md" p="md">
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={8} style={{ letterSpacing: "0.04em" }}>
                    Infrastructure Detail
                </Text>
                <Text fw={700} size="sm" mb={6}>
                    {point.properties.infrastructure_name}
                </Text>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                    <Badge style={{ backgroundColor: disasterColor, color: "#fff" }} size="sm">
                        {point.properties.disaster_type}
                    </Badge>
                    <Badge style={{ backgroundColor: damageColor, color: "#fff" }} size="sm">
                        {point.properties.damage_level}
                    </Badge>
                </div>
                <div style={{ marginBottom: 8 }}>
                    <Text size="xs" c="dimmed">Infrastructure type</Text>
                    <Text size="sm" fw={500}>{point.properties.infrastructure_type}</Text>
                </div>
                <Divider my="xs" />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <Text size="xs" c="dimmed">Assignment status</Text>
                    {isAssigned ? (
                        <Badge style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }} size="sm">
                            Assigned to {activeAssignment!.responder_name}
                        </Badge>
                    ) : (
                        <Badge style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }} size="sm">
                            Not assigned
                        </Badge>
                    )}
                </div>
                {!isAssigned && (
                    <Button fullWidth size="xs" onClick={onAssign}>
                        Assign task →
                    </Button>
                )}
                {isAssigned && (
                    <Button fullWidth size="xs" variant="outline" onClick={onAssign}>
                        Reassign →
                    </Button>
                )}
            </Paper>
        </Stack>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [checking, setChecking] = useState(true);
    const [selection, setSelection] = useState<MapSelection>({ cluster: null, point: null });
    const [visibleZones, setVisibleZones] = useState<ZoneFeature[]>([]);
    const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
    const [visiblePoints, setVisiblePoints] = useState<PointFeature[]>([]);
    const [selectedReport, setSelectedReport] = useState<PointFeature | null>(null);
    const [showResolvedTasks, setShowResolvedTasks] = useState(false);
    const [activeTab, setActiveTab] = useState<string | null>("area-stats");
    const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; seq: number } | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem("auth_user");
        if (!raw) {
            router.replace("/signin");
        } else {
            try {
                setUser(JSON.parse(raw) as AuthUser);
            } catch {
                router.replace("/signin");
            }
        }
        setChecking(false);
    }, [router]);

    useEffect(() => {
        // TODO: replace with DB-backed task list
        const fetchTasks = async () => {
            try {
                const res = await fetch("/api/tasks");
                if (res.ok) setAssignments((await res.json()) as TaskAssignment[]);
            } catch {
                // ignore
            }
        };
        fetchTasks();
    }, []);

    useEffect(() => {
        // TODO: replace with viewport-aware fetch tied to map bounds
        const fetchPoints = async () => {
            try {
                const res = await fetch("/api/clusters?bbox=36.43,-1.685,37.33,-0.785");
                if (res.ok) {
                    const data = await res.json();
                    setVisiblePoints((data.points ?? []) as PointFeature[]);
                }
            } catch {
                // ignore
            }
        };
        fetchPoints();
    }, []);

    const pointLookup = useMemo(() => {
        const map = new Map<string, string>();
        for (const pt of visiblePoints) {
            map.set(pt.properties.point_id, pt.properties.infrastructure_name);
        }
        return map;
    }, [visiblePoints]);

    if (checking || !user) {
        return (
            <Center style={{ height: "100vh" }}>
                <Loader />
            </Center>
        );
    }

    const assignZone = (zoneId: string) => {
        router.push(`/responders?zone=${zoneId}`);
    };

    const renderAreaStats = () => {
        if (selection.point) {
            const zoneId =
                selection.cluster?.properties.zone_id ?? selection.point.properties.zone_id;
            const zoneAssignments = assignments.filter((a) => a.zone_id === zoneId);
            return (
                <PointStats
                    point={selection.point}
                    cluster={selection.cluster}
                    assignments={zoneAssignments}
                    onAssign={() => assignZone(zoneId)}
                />
            );
        }
        if (selection.cluster) {
            return (
                <ClusterStats
                    zone={selection.cluster}
                    onAssign={() => assignZone(selection.cluster!.properties.zone_id)}
                />
            );
        }
        return <OverallAreaStats zones={visibleZones} />;
    };

    const activeTasks = assignments.filter((a) => a.status === "assigned");
    const unassignedTasks = assignments.filter((a) => a.status === "unassigned");
    const resolvedTasks = assignments.filter((a) => a.status === "resolved");

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
            <Header user={user} />

            {/* Report detail modal */}
            <Modal
                opened={selectedReport !== null}
                onClose={() => setSelectedReport(null)}
                title={selectedReport?.properties.infrastructure_name ?? ""}
                size="md"
            >
                {selectedReport && (() => {
                    const tsStyle = TASK_STATUS_STYLES[selectedReport.properties.task_status];
                    const disasterColor = DISASTER_COLORS[selectedReport.properties.disaster_type] ?? "#607D8B";
                    const damageColor = DAMAGE_COLORS[selectedReport.properties.damage_level];
                    return (
                        <Stack gap="md">
                            <Group gap="xs">
                                <Badge style={{ backgroundColor: disasterColor, color: "#fff" }}>
                                    {selectedReport.properties.disaster_type}
                                </Badge>
                                <Badge style={{ backgroundColor: damageColor, color: "#fff" }}>
                                    {selectedReport.properties.damage_level}
                                </Badge>
                            </Group>

                            <div>
                                <Text fw={600} size="sm" mb={4}>Summary</Text>
                                <Text size="sm">{selectedReport.properties.report_summary}</Text>
                            </div>

                            <div>
                                <Text fw={600} size="sm" mb={8}>Details</Text>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
                                    <div>
                                        <Text size="xs" c="dimmed">Infrastructure type</Text>
                                        <Text size="sm" fw={500}>{selectedReport.properties.infrastructure_type}</Text>
                                    </div>
                                    <div>
                                        <Text size="xs" c="dimmed">Zone ID</Text>
                                        <Text size="sm" fw={500}>{selectedReport.properties.zone_id}</Text>
                                    </div>
                                    <div>
                                        <Text size="xs" c="dimmed">Casualties</Text>
                                        <Text size="sm" fw={500}>{selectedReport.properties.casualties}</Text>
                                    </div>
                                    <div>
                                        <Text size="xs" c="dimmed">Task status</Text>
                                        <Badge size="sm" style={{ backgroundColor: tsStyle.bg, color: tsStyle.color }}>
                                            {selectedReport.properties.task_status}
                                        </Badge>
                                    </div>
                                    <div style={{ gridColumn: "1 / -1" }}>
                                        <Text size="xs" c="dimmed">Assigned to</Text>
                                        <Text size="sm" fw={500}>
                                            {selectedReport.properties.assigned_to ?? "Unassigned"}
                                        </Text>
                                    </div>
                                </div>
                            </div>

                            {selectedReport.properties.task_status === "unassigned" && (
                                <Button
                                    onClick={() =>
                                        router.push(
                                            `/responders?zone=${selectedReport.properties.zone_id}&point=${selectedReport.properties.point_id}`
                                        )
                                    }
                                >
                                    Assign responder →
                                </Button>
                            )}
                            {selectedReport.properties.task_status === "assigned" && (
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        router.push(
                                            `/responders?zone=${selectedReport.properties.zone_id}&point=${selectedReport.properties.point_id}`
                                        )
                                    }
                                >
                                    Reassign →
                                </Button>
                            )}
                            {selectedReport.properties.task_status === "resolved" && (
                                <Text size="sm" c="dimmed">Resolved — no action needed</Text>
                            )}
                        </Stack>
                    );
                })()}
            </Modal>

            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 relative">
                    <DashboardMap
                        onSelect={setSelection}
                        onVisibleZonesChange={setVisibleZones}
                        flyTo={flyTarget}
                        onViewReport={(pt) => {
                            setSelectedReport(pt);
                            setActiveTab("reports");
                        }}
                    />
                </div>

                <aside className="w-96 border-l border-gray-200 bg-white flex flex-col overflow-hidden shrink-0 p-2">
                    <Tabs
                        value={activeTab}
                        onChange={setActiveTab}
                        keepMounted={false}
                        style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}
                    >
                        <Tabs.List>
                            <Tabs.Tab value="area-stats">
                                <Text size="xs" fw={500}>Area Stats</Text>
                            </Tabs.Tab>
                            <Tabs.Tab value="reports">
                                <Text size="xs" fw={500}>Reports</Text>
                            </Tabs.Tab>
                            <Tabs.Tab value="tasks">
                                <Text size="xs" fw={500}>Tasks</Text>
                            </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="area-stats" style={{ flex: 1, overflowY: "auto", padding: 12 }}>
                            {renderAreaStats()}
                        </Tabs.Panel>

                        <Tabs.Panel value="reports" style={{ flex: 1, overflowY: "auto", padding: 12 }}>
                            {visiblePoints.length === 0 ? (
                                <Text size="sm" c="dimmed" ta="center" mt="xl">
                                    No reports in view
                                </Text>
                            ) : (
                                <Stack gap="xs">
                                    {visiblePoints.map((point) => {
                                        const dotColor = DAMAGE_COLORS[point.properties.damage_level];
                                        const tsStyle = TASK_STATUS_STYLES[point.properties.task_status] ?? TASK_STATUS_STYLES.unassigned;
                                        const [lng, lat] = point.geometry.coordinates;
                                        return (
                                            <Paper
                                                key={point.properties.point_id}
                                                withBorder
                                                radius="md"
                                                p="sm"
                                                style={{ cursor: "pointer" }}
                                                onClick={() =>
                                                    setFlyTarget({ lat, lng, seq: Date.now() })
                                                }
                                            >
                                                <Group align="flex-start" gap="sm" wrap="nowrap">
                                                    <div
                                                        style={{
                                                            width: 10,
                                                            height: 10,
                                                            borderRadius: "50%",
                                                            background: dotColor,
                                                            marginTop: 4,
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <Text
                                                            fw={600}
                                                            size="sm"
                                                            style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                                        >
                                                            {point.properties.infrastructure_name}
                                                        </Text>
                                                        <Text size="xs" c="dimmed">
                                                            {point.properties.infrastructure_type} · {point.properties.disaster_type}
                                                        </Text>
                                                        <Group gap="xs" mt={4}>
                                                            <Badge size="xs" style={{ backgroundColor: tsStyle.bg, color: tsStyle.color }}>
                                                                {point.properties.task_status}
                                                            </Badge>
                                                            {point.properties.casualties > 0 && (
                                                                <Text size="xs" style={{ color: "#B45309" }}>
                                                                    ⚠ {point.properties.casualties}{" "}
                                                                    {point.properties.casualties === 1 ? "casualty" : "casualties"}
                                                                </Text>
                                                            )}
                                                        </Group>
                                                    </div>
                                                    <Button
                                                        size="xs"
                                                        variant="subtle"
                                                        style={{ flexShrink: 0 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedReport(point);
                                                        }}
                                                    >
                                                        View details →
                                                    </Button>
                                                </Group>
                                            </Paper>
                                        );
                                    })}
                                </Stack>
                            )}
                        </Tabs.Panel>

                        <Tabs.Panel value="tasks" style={{ flex: 1, overflowY: "auto", padding: 12 }}>
                            <Text size="xs" c="dimmed" mb="md">
                                {activeTasks.length} active · {unassignedTasks.length} unassigned · {resolvedTasks.length} resolved
                            </Text>

                            {activeTasks.length > 0 && (
                                <Stack gap="xs" mb="md">
                                    <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
                                        Active
                                    </Text>
                                    {activeTasks.map((task) => {
                                        const tsStyle = TASK_STATUS_STYLES[task.status];
                                        const infraName = pointLookup.get(task.point_id);
                                        return (
                                            <Paper key={task.id} withBorder radius="sm" p="sm">
                                                <Group justify="space-between" align="flex-start" wrap="nowrap">
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <Text fw={600} size="sm" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            {infraName ?? task.point_id}
                                                        </Text>
                                                        <Text size="xs" c="dimmed">Zone {task.zone_id}</Text>
                                                        <Text size="xs" c="dimmed">{task.responder_name || "Unassigned"}</Text>
                                                    </div>
                                                    <Stack gap={4} align="flex-end">
                                                        <Badge size="xs" style={{ backgroundColor: tsStyle.bg, color: tsStyle.color }}>
                                                            {task.status}
                                                        </Badge>
                                                        <Badge
                                                            size="xs"
                                                            color={task.priority === "Critical" ? "red" : task.priority === "Medium" ? "yellow" : "green"}
                                                            variant="outline"
                                                        >
                                                            {task.priority}
                                                        </Badge>
                                                    </Stack>
                                                </Group>
                                                <Button size="xs" variant="subtle" mt="xs">
                                                    {/* TODO: navigate to point on map */}
                                                    View point →
                                                </Button>
                                            </Paper>
                                        );
                                    })}
                                </Stack>
                            )}

                            {unassignedTasks.length > 0 && (
                                <Stack gap="xs" mb="md">
                                    <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
                                        Unassigned
                                    </Text>
                                    {unassignedTasks.map((task) => {
                                        const tsStyle = TASK_STATUS_STYLES[task.status];
                                        const infraName = pointLookup.get(task.point_id);
                                        return (
                                            <Paper key={task.id} withBorder radius="sm" p="sm">
                                                <Group justify="space-between" align="flex-start" wrap="nowrap">
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <Text fw={600} size="sm" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            {infraName ?? task.point_id}
                                                        </Text>
                                                        <Text size="xs" c="dimmed">Zone {task.zone_id}</Text>
                                                        <Text size="xs" c="dimmed" style={{ fontStyle: "italic" }}>Unassigned</Text>
                                                    </div>
                                                    <Badge size="xs" style={{ backgroundColor: tsStyle.bg, color: tsStyle.color }}>
                                                        {task.status}
                                                    </Badge>
                                                </Group>
                                                <Button size="xs" variant="subtle" mt="xs">
                                                    {/* TODO: navigate to point on map */}
                                                    View point →
                                                </Button>
                                            </Paper>
                                        );
                                    })}
                                </Stack>
                            )}

                            {resolvedTasks.length > 0 && (
                                <Stack gap="xs">
                                    <Group justify="space-between">
                                        <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
                                            Resolved ({resolvedTasks.length})
                                        </Text>
                                        <Button
                                            size="xs"
                                            variant="subtle"
                                            onClick={() => setShowResolvedTasks((v) => !v)}
                                        >
                                            {showResolvedTasks ? "Hide" : "Show"}
                                        </Button>
                                    </Group>
                                    {showResolvedTasks &&
                                        resolvedTasks.map((task) => {
                                            const tsStyle = TASK_STATUS_STYLES[task.status];
                                            const infraName = pointLookup.get(task.point_id);
                                            return (
                                                <Paper key={task.id} withBorder radius="sm" p="sm">
                                                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <Text fw={600} size="sm" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                {infraName ?? task.point_id}
                                                            </Text>
                                                            <Text size="xs" c="dimmed">Zone {task.zone_id}</Text>
                                                            <Text size="xs" c="dimmed">{task.responder_name || "—"}</Text>
                                                        </div>
                                                        <Badge size="xs" style={{ backgroundColor: tsStyle.bg, color: tsStyle.color }}>
                                                            {task.status}
                                                        </Badge>
                                                    </Group>
                                                    <Button size="xs" variant="subtle" mt="xs">
                                                        {/* TODO: navigate to point on map */}
                                                        View point →
                                                    </Button>
                                                </Paper>
                                            );
                                        })}
                                </Stack>
                            )}

                            {assignments.length === 0 && (
                                <Text size="sm" c="dimmed" ta="center" mt="xl">No tasks yet</Text>
                            )}
                        </Tabs.Panel>
                    </Tabs>
                </aside>
            </div>
        </div>
    );
}
