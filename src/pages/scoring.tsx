import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
	Badge,
	Center,
	Loader,
	Paper,
	Stack,
	Text,
} from "@mantine/core";
import Header from "@/components/Header";
import type { SeveritySummary } from "@/types";

interface AuthUser {
	id: string;
	name: string;
	email: string;
	role: string;
}

export default function ScoringPage() {
	const router = useRouter();
	const [user, setUser] = useState<AuthUser | null>(null);
	const [checking, setChecking] = useState(true);
	const [severity, setSeverity] = useState<SeveritySummary | null>(null);
	const [lowThreshold, setLowThreshold] = useState(40);
	const [critThreshold, setCritThreshold] = useState(70);
	const [loading, setLoading] = useState(false);

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

	const gradientStyle = useMemo(
		() => ({
			background: `linear-gradient(to right, #639922 0%, #639922 ${lowThreshold}%, #EF9F27 ${lowThreshold}%, #EF9F27 ${critThreshold}%, #E24B4A ${critThreshold}%, #E24B4A 100%)`,
			height: 14,
			borderRadius: 999,
		}),
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
		<div className="flex flex-col h-screen overflow-hidden bg-gray-50">
			<Header user={user} />
			<div className="flex-1 overflow-auto p-4">
				<div className="mx-auto max-w-3xl space-y-6">

					<Paper withBorder radius="md" p="lg">
						<Text fw={700} size="lg" mb="md">
							Global Priority Weights
						</Text>
						<Stack gap="md">
							{[
								{ label: "Time since last report", pct: 25, desc: "Recency of damage intelligence", color: "#334155", width: "25%" },
								{ label: "Damage severity", pct: 35, desc: "% completely destroyed in zone", color: "#f97316", width: "35%" },
								{ label: "Casualties reported", pct: 25, desc: "Confirmed or estimated casualties", color: "#0f172a", width: "25%" },
								{ label: "Population exposure", pct: 15, desc: "Estimated residents in zone boundary", color: "#059669", width: "15%" },
							].map(({ label, pct, desc, color, width }) => (
								<div key={label}>
									<div style={{ display: "flex", justifyContent: "space-between" }} className="mb-2">
										<Text size="sm" fw={600}>{label}</Text>
										<Text size="sm" c="dimmed">{pct}%</Text>
									</div>
									<div className="h-3 rounded-full bg-slate-100">
										<div className="h-full rounded-full" style={{ width, background: color }} />
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
							<Text size="xs" c="dimmed">
								Admin only — contact system administrator to adjust global weights
							</Text>
						</Stack>
					</Paper>

					<Paper withBorder radius="md" p="lg">
						<Text fw={700} size="lg" mb={4}>
							Score Thresholds
						</Text>
						<Text size="sm" c="dimmed" mb="md">
							Define where Low ends and where Critical begins. Session variable weights (access, debris, miscellaneous) are configured on the Assign Responders page.
						</Text>
						<Stack gap="md">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Text size="sm" fw={600} mb={4}>Low / Medium boundary</Text>
									<input
										type="range"
										min={10}
										max={89}
										step={1}
										value={lowThreshold}
										onChange={(e) => setLowThreshold(Number(e.target.value))}
										className="w-full"
									/>
									<Text size="xs" c="dimmed">{lowThreshold}%</Text>
								</div>
								<div>
									<Text size="sm" fw={600} mb={4}>Medium / Critical boundary</Text>
									<input
										type="range"
										min={11}
										max={99}
										step={1}
										value={critThreshold}
										onChange={(e) =>
											setCritThreshold(Math.max(Number(e.target.value), lowThreshold + 1))
										}
										className="w-full"
									/>
									<Text size="xs" c="dimmed">{critThreshold}%</Text>
								</div>
							</div>
							<div style={gradientStyle} />
							<div style={{ display: "flex", justifyContent: "space-between" }}>
								<Badge color="green" variant="light">Low: 0 – {lowThreshold}%</Badge>
								<Badge color="yellow" variant="light">Medium: {lowThreshold} – {critThreshold}%</Badge>
								<Badge color="red" variant="light">Critical: {critThreshold} – 100%</Badge>
							</div>
						</Stack>
					</Paper>

				</div>
			</div>
		</div>
	);
}
