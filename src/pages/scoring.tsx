import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Badge, Button, Center, Divider, Group, Loader, Paper, Stack, Text } from "@mantine/core";
import { IconArrowUp } from "@tabler/icons-react";
import Header from "@/components/Header";
import { FarajaMark } from "@/components/icons";
import type { SeveritySummary } from "@/types";

interface AuthUser {
	id: string;
	name: string;
	email: string;
	role: string;
}

interface WeightAdvice {
	low: number;
	crit: number;
	lines: string[];
}

const GLOBAL_WEIGHTS = [
	{ label: "Time since last report", pct: 25, desc: "Recency of damage intelligence" },
	{ label: "Damage severity", pct: 35, desc: "% completely destroyed in zone" },
	{ label: "Casualties reported", pct: 25, desc: "Confirmed or estimated casualties" },
	{ label: "Population exposure", pct: 15, desc: "Estimated residents in zone boundary" },
];

export default function ScoringPage() {
	const router = useRouter();
	const [user, setUser] = useState<AuthUser | null>(null);
	const [checking, setChecking] = useState(true);
	const [severity, setSeverity] = useState<SeveritySummary | null>(null);
	const [lowThreshold, setLowThreshold] = useState(40);
	const [critThreshold, setCritThreshold] = useState(70);
	const [loading, setLoading] = useState(false);
	const [advice, setAdvice] = useState<WeightAdvice | null>(null);
	const [advising, setAdvising] = useState(false);

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
		let mounted = true;
		const fetchSummary = async () => {
			setLoading(true);
			try {
				const res = await fetch("/api/stats/severity-summary");
				if (res.ok) {
					const data = (await res.json()) as SeveritySummary;
					if (mounted) setSeverity(data);
				}
			} catch {
				// ignore
			} finally {
				if (mounted) setLoading(false);
			}
		};
		fetchSummary();
		const interval = window.setInterval(fetchSummary, 60000);
		return () => {
			mounted = false;
			window.clearInterval(interval);
		};
	}, []);

	const requestAdvice = () => {
		setAdvising(true);
		setAdvice(null);
		window.setTimeout(() => {
			const dest = severity?.pct_destroyed ?? 0;
			const partial = severity?.pct_partial ?? 0;
			const minimal = severity?.pct_minimal ?? 0;
			const total = severity?.total_reports ?? 0;

			const crit = Math.min(85, Math.max(62, Math.round(60 + dest * 0.28)));
			const low = Math.min(crit - 8, Math.max(30, Math.round(30 + minimal * 0.25)));

			const lines = [
				total > 0
					? `Across ${total} reports: ${dest}% destroyed · ${partial}% partial · ${minimal}% minimal.`
					: "No live severity data yet — basing this on sensible defaults.",
				dest >= 50
					? `Severity is concentrated at the top, so I'd keep the Critical tier selective (cutoff ≈ ${crit}) — otherwise too many zones flag critical and responders get spread thin.`
					: dest <= 20
						? `Severely-damaged zones are rare here, so a lower Critical cutoff (≈ ${crit}) surfaces them earlier instead of burying them in Medium.`
						: `Damage is fairly spread out — a Critical cutoff around ${crit} keeps the top tier meaningful.`,
				`I'd set the Low/Medium boundary at ${low} so partial-damage zones read as Medium rather than Low.`,
			];
			setAdvice({ low, crit, lines });
			setAdvising(false);
		}, 620);
	};

	const applyAdvice = () => {
		if (!advice) return;
		setLowThreshold(advice.low);
		setCritThreshold(advice.crit);
	};

	const thresholdSegments = useMemo(
		() => [
			{ w: lowThreshold, c: "var(--sev-low)" },
			{ w: critThreshold - lowThreshold, c: "var(--sev-medium)" },
			{ w: 100 - critThreshold, c: "var(--sev-critical)" },
		],
		[lowThreshold, critThreshold]
	);

	if (checking || !user) {
		return (
			<Center style={{ height: "100vh" }}>
				<Loader />
			</Center>
		);
	}

	return (
		<div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--canvas)" }}>
			<Header user={user} />
			<div className="flex-1 overflow-auto p-4">
				<div className="mx-auto max-w-3xl space-y-5">
					<div>
						<Text fw={700} size="xl" style={{ color: "var(--ink)" }}>Priority Weighting</Text>
						<Text size="sm" c="dimmed">How zones are scored and triaged into Low / Medium / Critical tiers.</Text>
					</div>

					{/* Global weights */}
					<Paper withBorder p="lg">
						<Group justify="space-between" mb="md">
							<Text fw={700} size="lg" style={{ color: "var(--ink)" }}>Global priority weights</Text>
							<Badge styles={{ root: { background: "var(--sunken)", color: "var(--ink-3)" } }}>Admin managed</Badge>
						</Group>
						<Stack gap="md">
							{GLOBAL_WEIGHTS.map(({ label, pct, desc }) => (
								<div key={label}>
									<div style={{ display: "flex", justifyContent: "space-between" }} className="mb-2">
										<Text size="sm" fw={600} style={{ color: "var(--ink)" }}>{label}</Text>
										<Text size="sm" c="dimmed" className="tnum">{pct}%</Text>
									</div>
									<div style={{ height: 8, borderRadius: 999, background: "var(--sunken)", overflow: "hidden" }}>
										<div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", borderRadius: 999 }} />
									</div>
									<Text size="xs" c="dimmed" mt={4}>{desc}</Text>
								</div>
							))}
							{loading ? (
								<Center><Loader size="sm" /></Center>
							) : severity ? (
								<Text size="sm">
									Current crisis: {severity.pct_destroyed}% completely destroyed · {severity.pct_partial}% partial · {severity.pct_minimal}% minimal across {severity.total_reports} reports
								</Text>
							) : (
								<Text size="sm" c="dimmed">Severity summary unavailable</Text>
							)}
							<Text size="xs" c="dimmed">Admin only — contact a system administrator to adjust global weights.</Text>
						</Stack>
					</Paper>

					{/* Thresholds */}
					<Paper withBorder p="lg">
						<Text fw={700} size="lg" mb={4} style={{ color: "var(--ink)" }}>Score thresholds</Text>
						<Text size="sm" c="dimmed" mb="md">
							Define where Low ends and Critical begins. Session variable weights (access, debris, miscellaneous) are configured on the Responders page.
						</Text>
						<Stack gap="md">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Text size="sm" fw={600} mb={4} style={{ color: "var(--ink)" }}>Low / Medium boundary</Text>
									<input type="range" min={10} max={89} step={1} value={lowThreshold} onChange={(e) => setLowThreshold(Number(e.target.value))} className="w-full" />
									<Text size="xs" c="dimmed" className="tnum">{lowThreshold}%</Text>
								</div>
								<div>
									<Text size="sm" fw={600} mb={4} style={{ color: "var(--ink)" }}>Medium / Critical boundary</Text>
									<input type="range" min={11} max={99} step={1} value={critThreshold} onChange={(e) => setCritThreshold(Math.max(Number(e.target.value), lowThreshold + 1))} className="w-full" />
									<Text size="xs" c="dimmed" className="tnum">{critThreshold}%</Text>
								</div>
							</div>
							<div style={{ display: "flex", height: 12, borderRadius: 999, overflow: "hidden" }}>
								{thresholdSegments.map((s, i) => (
									<div key={i} style={{ width: `${Math.max(0, s.w)}%`, background: s.c }} />
								))}
							</div>
							<div style={{ display: "flex", justifyContent: "space-between" }}>
								<Badge styles={{ root: { background: "var(--sev-low-soft)", color: "var(--sev-low)" } }}>Low: 0 – {lowThreshold}%</Badge>
								<Badge styles={{ root: { background: "var(--sev-medium-soft)", color: "var(--sev-medium)" } }}>Medium: {lowThreshold} – {critThreshold}%</Badge>
								<Badge styles={{ root: { background: "var(--sev-critical-soft)", color: "var(--sev-critical)" } }}>Critical: {critThreshold} – 100%</Badge>
							</div>

							<Divider color="var(--border)" my={4} />

							{/* Faraja advice */}
							<div>
								<Group justify="space-between" align="center" mb={advice || advising ? "sm" : 0}>
									<Group gap="sm">
										<FarajaMark size={28} />
										<div className="leading-tight">
											<Text fw={700} size="sm" style={{ color: "var(--ink)" }}>Ask Faraja for advice</Text>
											<Text size="xs" c="dimmed">Recommends thresholds from the live crisis severity</Text>
										</div>
									</Group>
									<Button size="xs" variant="default" loading={advising} onClick={requestAdvice}>
										{advice ? "Re-evaluate" : "Get advice"}
									</Button>
								</Group>

								{advice && (
									<Paper withBorder p="md" radius="md" className="anim-rise" style={{ background: "var(--surface-2)" }}>
										<Stack gap={6}>
											{advice.lines.map((line, i) => (
												<Text key={i} size="sm" style={{ lineHeight: 1.5 }}>{line}</Text>
											))}
										</Stack>
										<Group gap="xs" mt="md" align="center">
											<Badge styles={{ root: { background: "var(--sev-low-soft)", color: "var(--sev-low)" } }}>Low/Med → {advice.low}</Badge>
											<Badge styles={{ root: { background: "var(--sev-critical-soft)", color: "var(--sev-critical)" } }}>Med/Crit → {advice.crit}</Badge>
											<Button
												size="xs"
												ml="auto"
												leftSection={<IconArrowUp size={14} />}
												onClick={applyAdvice}
												disabled={advice.low === lowThreshold && advice.crit === critThreshold}
											>
												Apply to thresholds
											</Button>
										</Group>
									</Paper>
								)}
							</div>
						</Stack>
					</Paper>
				</div>
			</div>
		</div>
	);
}
