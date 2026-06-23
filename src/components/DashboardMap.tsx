import { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import { Text, Stack, Badge, Button, Popover, useComputedColorScheme } from "@mantine/core";
import { IconArrowRight, IconFileText, IconStack2, IconChevronDown, IconMap, IconCheck } from "@tabler/icons-react";
import { useRouter } from "next/router";
import type { ZoneFeature, PointFeature, DisasterType, DamageLevel } from "@/types";
import { DAMAGE_COLORS } from "@/types";
import { DISASTER_ICON, DisasterGlyph } from "@/components/icons";

const LEGEND_DISASTERS: DisasterType[] = ["Flood", "Fire", "Landslide", "Earthquake", "Hurricane"];

interface Basemap {
	id: string;
	label: string;
	url: string;
	subdomains: string;
	attribution: string;
	swatch: string;
}

const CARTO_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
const OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const BASEMAPS: Basemap[] = [
	{ id: "voyager", label: "Voyager", url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png", subdomains: "abcd", attribution: CARTO_ATTR, swatch: "#eae6dc" },
	{ id: "light", label: "Minimal", url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", subdomains: "abcd", attribution: CARTO_ATTR, swatch: "#f5f5f3" },
	{ id: "dark", label: "Dark", url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", subdomains: "abcd", attribution: CARTO_ATTR, swatch: "#1b1b1f" },
	{ id: "streets", label: "Streets", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", subdomains: "abc", attribution: OSM_ATTR, swatch: "#dfe3d4" },
];

function BasemapControl({ value, onChange }: { value: string; onChange: (id: string) => void }) {
	return (
		<div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}>
			<Popover position="right-start" radius="md" shadow="md" offset={6} withArrow>
				<Popover.Target>
					<button
						aria-label="Switch basemap"
						className="flex items-center justify-center transition-colors"
						style={{
							width: 32,
							height: 32,
							borderRadius: 8,
							border: "1px solid var(--border)",
							background: "var(--surface)",
							color: "var(--ink-2)",
							cursor: "pointer",
							boxShadow: "var(--shadow-sm)",
						}}
						onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover)")}
						onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface)")}
					>
						<IconMap size={17} />
					</button>
				</Popover.Target>
				<Popover.Dropdown p={6} style={{ minWidth: 168 }}>
					<Text className="section-label" px={6} pt={2} pb={4}>Basemap</Text>
					<Stack gap={2}>
						{BASEMAPS.map((b) => {
							const isActive = b.id === value;
							return (
								<button
									key={b.id}
									onClick={() => onChange(b.id)}
									className="flex items-center gap-2.5 transition-colors"
									style={{
										width: "100%",
										padding: "7px 8px",
										borderRadius: 8,
										border: "none",
										background: isActive ? "var(--sunken)" : "transparent",
										cursor: "pointer",
										fontSize: 13,
										fontWeight: isActive ? 600 : 500,
										color: "var(--ink)",
									}}
									onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--hover)"; }}
									onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
								>
									<span style={{ width: 18, height: 18, borderRadius: 5, background: b.swatch, border: "1px solid var(--border-strong)", flexShrink: 0 }} />
									<span style={{ flex: 1, textAlign: "left" }}>{b.label}</span>
									{isActive && <IconCheck size={14} color="var(--accent)" />}
								</button>
							);
						})}
					</Stack>
				</Popover.Dropdown>
			</Popover>
		</div>
	);
}

function disasterSvg(type: DisasterType, size: number): string {
	const Comp = DISASTER_ICON[type] ?? DISASTER_ICON.Other;
	return renderToStaticMarkup(<Comp size={size} color="#ffffff" stroke={2.2} />);
}

/** Pin = severity colour (urgency) + crisis glyph (type). */
function createPointIcon(damageLevel: DamageLevel, disasterType: DisasterType, selected: boolean): L.DivIcon {
	const color = DAMAGE_COLORS[damageLevel] ?? "#8d897d";
	const size = selected ? 38 : 30;
	const glyph = disasterSvg(disasterType, Math.round(size * 0.5));
	const ring = selected ? "outline:3px solid var(--ink);outline-offset:2px;" : "";
	return L.divIcon({
		className: "",
		html: `<div class="crisis-pin" style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid var(--surface);box-shadow:0 3px 8px rgba(0,0,0,0.32);display:flex;align-items:center;justify-content:center;${ring}">${glyph}</div>`,
		iconSize: [size, size] as [number, number],
		iconAnchor: [size / 2, size / 2] as [number, number],
	});
}

/** Cluster as a severity donut — the ring shows the critical/medium/low mix at a glance. */
function createClusterIcon(count: number, crit: number, med: number, low: number): L.DivIcon {
	const total = crit + med + low || count || 1;
	const r = Math.max(20, Math.min(42, Math.sqrt(count) * 5.2));
	const d = r * 2;
	const th = Math.max(5, r * 0.26);
	const ringR = r - th / 2 - 1.5;
	const C = 2 * Math.PI * ringR;
	const fs = Math.max(12, Math.min(18, r / 2.1));
	const segs: [number, string][] = [
		[crit, DAMAGE_COLORS.Critical],
		[med, DAMAGE_COLORS.Medium],
		[low, DAMAGE_COLORS.Low],
	];
	let offset = 0;
	let arcs = "";
	for (const [val, color] of segs) {
		if (val <= 0) continue;
		const len = (val / total) * C;
		arcs += `<circle cx="${r}" cy="${r}" r="${ringR}" fill="none" stroke="${color}" stroke-width="${th}" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${r} ${r})" />`;
		offset += len;
	}
	const html = `<div style="filter:drop-shadow(0 3px 8px rgba(0,0,0,0.26));width:${d}px;height:${d}px;">
		<svg width="${d}" height="${d}" viewBox="0 0 ${d} ${d}">
			<circle cx="${r}" cy="${r}" r="${ringR}" fill="none" stroke="var(--sunken)" stroke-width="${th}" />
			${arcs}
			<circle cx="${r}" cy="${r}" r="${ringR - th / 2}" fill="var(--surface)" />
			<text x="${r}" y="${r}" text-anchor="middle" dominant-baseline="central" font-family="Exodus,DMSans,sans-serif" font-weight="700" font-size="${fs}" fill="var(--ink)">${Math.round(count)}</text>
		</svg></div>`;
	return L.divIcon({
		className: "",
		html,
		iconSize: [d, d] as [number, number],
		iconAnchor: [r, r] as [number, number],
	});
}

function MapLegendControl() {
	return (
		<div style={{ position: "absolute", bottom: 28, left: 12, zIndex: 1000 }}>
			<Popover position="top-start" radius="md" shadow="md" offset={6} withArrow>
				<Popover.Target>
					<button
						className="flex items-center gap-2 transition-colors"
						style={{
							height: 34,
							padding: "0 12px",
							borderRadius: 9,
							border: "1px solid var(--border)",
							background: "var(--surface)",
							color: "var(--ink)",
							cursor: "pointer",
							fontSize: 12.5,
							fontWeight: 600,
							boxShadow: "var(--shadow-sm)",
						}}
						onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover)")}
						onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface)")}
					>
						<IconStack2 size={15} color="var(--ink-2)" />
						Legend
						<IconChevronDown size={13} color="var(--ink-3)" />
					</button>
				</Popover.Target>
				<Popover.Dropdown p="sm" style={{ minWidth: 178 }}>
					<Text className="section-label" mb={6}>Crisis type</Text>
					<Stack gap={6}>
						{LEGEND_DISASTERS.map((type) => (
							<div key={type} style={{ display: "flex", alignItems: "center", gap: 9 }}>
								<span style={{ color: "var(--ink-2)", display: "inline-flex" }}>
									<DisasterGlyph type={type} size={15} stroke={2} />
								</span>
								<Text size="xs">{type}</Text>
							</div>
						))}
					</Stack>
					<Text className="section-label" mt={11} mb={6}>Severity</Text>
					<Stack gap={6}>
						{(Object.entries(DAMAGE_COLORS) as [DamageLevel, string][]).map(([level, color]) => (
							<div key={level} style={{ display: "flex", alignItems: "center", gap: 9 }}>
								<span style={{ width: 11, height: 11, borderRadius: "50%", background: color, flexShrink: 0, border: "1.5px solid var(--surface)", boxShadow: "0 0 0 1px var(--border)" }} />
								<Text size="xs">{level}</Text>
							</div>
						))}
					</Stack>
				</Popover.Dropdown>
			</Popover>
		</div>
	);
}

type PointFeatureExtended = PointFeature & {
	properties: PointFeature["properties"] & {
		casualties: number;
		assigned: boolean;
		assigned_to: string | null;
	};
};

function buildZoneFeature(zoneId: string, points: PointFeatureExtended[]): ZoneFeature {
	const count = points.length;
	const casualties = points.reduce((sum, pt) => sum + pt.properties.casualties, 0);
	const pct_critical = count ? points.filter((pt) => pt.properties.damage_level === "Critical").length / count : 0;
	const pct_partial = count ? points.filter((pt) => pt.properties.damage_level === "Medium").length / count : 0;
	const pct_low = count ? points.filter((pt) => pt.properties.damage_level === "Low").length / count : 0;
	const score = Math.min(100, Math.round(pct_critical * 60 + (casualties / count) * 40));
	const tier: ZoneFeature["properties"]["tier"] = score >= 70 ? "Critical" : score >= 40 ? "Medium" : "Low";

	const disasterTally: Partial<Record<DisasterType, number>> = {};
	for (const pt of points) {
		disasterTally[pt.properties.disaster_type] = (disasterTally[pt.properties.disaster_type] ?? 0) + 1;
	}
	const dominant_disaster = (Object.entries(disasterTally).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Other") as DisasterType;
	const lats = points.map((pt) => pt.geometry.coordinates[1]);
	const lngs = points.map((pt) => pt.geometry.coordinates[0]);
	const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
	const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

	return {
		type: "Feature",
		geometry: { type: "Point", coordinates: [avgLng, avgLat] },
		properties: {
			zone_id: zoneId,
			label: `Zone ${zoneId}`,
			count,
			casualties,
			pct_critical,
			pct_partial,
			pct_low,
			score,
			tier,
			dominant: tier.toLowerCase() as "critical" | "medium" | "low",
			dominant_disaster,
			disaster_breakdown: disasterTally,
		},
	};
}

export interface MapSelection {
	cluster: ZoneFeature | null;
	point: PointFeature | null;
}

function FlyToPoint({ lat, lng }: { lat: number; lng: number }) {
	const map = useMap();
	useEffect(() => {
		map.flyTo([lat, lng], 17, { duration: 1 });
	}, [lat, lng, map]);
	return null;
}

interface DashboardMapProps {
	onSelect: (selection: MapSelection) => void;
	onVisibleZonesChange?: (zones: ZoneFeature[]) => void;
	flyTo?: { lat: number; lng: number; seq: number } | null;
	onViewReport?: (point: PointFeature) => void;
}

export default function DashboardMap({ onSelect, onVisibleZonesChange, flyTo, onViewReport }: DashboardMapProps) {
	const router = useRouter();
	const scheme = useComputedColorScheme("light");
	const [basemapId, setBasemapId] = useState<string | null>(null);
	const [points, setPoints] = useState<PointFeatureExtended[]>([]);
	const pointsMapRef = useRef<Map<string, PointFeatureExtended>>(new Map());

	useEffect(() => {
		const controller = new AbortController();

		async function loadPoints() {
			try {
				const res = await fetch("/api/clusters?bbox=36.43,-1.685,37.33,-0.785", { signal: controller.signal });
				if (!res.ok) return;
				const data = (await res.json()) as { points?: PointFeatureExtended[] };
				const fetchedPoints = data.points ?? [];
				setPoints(fetchedPoints);
				pointsMapRef.current = new Map(fetchedPoints.map((pt) => [pt.properties.point_id, pt]));

				const zoneMap = new Map<string, PointFeatureExtended[]>();
				for (const pt of fetchedPoints) {
					const existing = zoneMap.get(pt.properties.zone_id) ?? [];
					existing.push(pt);
					zoneMap.set(pt.properties.zone_id, existing);
				}

				const derivedZones: ZoneFeature[] = Array.from(zoneMap.entries()).map(([zid, pts]) => buildZoneFeature(zid, pts));
				onVisibleZonesChange?.(derivedZones);
			} catch (err) {
				if ((err as DOMException)?.name === "AbortError") return;
				console.error(err);
			}
		}

		loadPoints();
		return () => controller.abort();
	}, [onVisibleZonesChange]);

	const iconCreateFunction = (cluster: any) => {
		const count = cluster.getChildCount();
		const children = cluster.getAllChildMarkers();
		let crit = 0;
		let med = 0;
		let low = 0;
		for (const marker of children) {
			const dl = (marker.options as L.MarkerOptions & { alt?: string }).alt;
			if (dl === "Critical") crit++;
			else if (dl === "Medium") med++;
			else low++;
		}
		return createClusterIcon(count, crit, med, low);
	};

	const handleClusterClick = (event: any) => {
		const cluster = event.cluster ?? event.layer;
		if (!cluster?.getAllChildMarkers) {
			onSelect({ cluster: null, point: null });
			return;
		}
		const childMarkers = cluster.getAllChildMarkers();
		const childPoints = childMarkers
			.map((marker: any) => pointsMapRef.current.get(marker.options?.title))
			.filter(Boolean) as PointFeatureExtended[];
		if (childPoints.length === 0) {
			onSelect({ cluster: null, point: null });
			return;
		}
		const syntheticZone = buildZoneFeature("CLUSTER", childPoints);
		onSelect({ cluster: syntheticZone, point: null });
	};

	const handlePointClick = (pt: PointFeatureExtended) => {
		const zonePoints = points.filter((item) => item.properties.zone_id === pt.properties.zone_id);
		const parentZone = buildZoneFeature(pt.properties.zone_id, zonePoints);
		onSelect({ cluster: parentZone, point: pt });
	};

	// Defaults to the theme's basemap until the user explicitly picks one.
	const activeBasemap =
		BASEMAPS.find((b) => b.id === (basemapId ?? (scheme === "dark" ? "dark" : "voyager"))) ?? BASEMAPS[0];

	return (
		<div style={{ position: "relative", width: "100%", height: "100%" }}>
			<MapLegendControl />
			<BasemapControl value={activeBasemap.id} onChange={setBasemapId} />
			<MapContainer center={[-1.235, 36.88]} zoom={10} style={{ height: "100%", width: "100%", zIndex: 10 }}>
				<TileLayer
					key={activeBasemap.id}
					url={activeBasemap.url}
					subdomains={activeBasemap.subdomains}
					attribution={activeBasemap.attribution}
				/>
				{flyTo && <FlyToPoint key={flyTo.seq} lat={flyTo.lat} lng={flyTo.lng} />}
				<MarkerClusterGroup
					iconCreateFunction={iconCreateFunction}
					chunkedLoading
					showCoverageOnHover={false}
					animate
					animateAddingMarkers={false}
					maxClusterRadius={220}
					spiderfyOnMaxZoom
					eventHandlers={{ clusterclick: handleClusterClick } as any}
				>
					{points.map((pt) => {
						const [lng, lat] = pt.geometry.coordinates;
						const damageColor = DAMAGE_COLORS[pt.properties.damage_level] ?? "#8d897d";
						return (
							<Marker
								key={pt.properties.point_id}
								position={[lat, lng]}
								icon={createPointIcon(pt.properties.damage_level, pt.properties.disaster_type, false)}
								alt={pt.properties.damage_level}
								title={pt.properties.point_id}
								eventHandlers={{
									click: (e) => {
										e.originalEvent.stopPropagation();
										handlePointClick(pt);
									},
								}}
							>
								<Popup minWidth={250}>
									<Stack gap={8}>
										<Text fw={700} size="sm">{pt.properties.infrastructure_name}</Text>
										<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
											<Badge
												variant="default"
												leftSection={<DisasterGlyph type={pt.properties.disaster_type} size={12} stroke={2} />}
												styles={{ root: { background: "var(--sunken)", color: "var(--ink)", border: "1px solid var(--border)" } }}
											>
												{pt.properties.disaster_type}
											</Badge>
											<Badge style={{ backgroundColor: damageColor, color: "#fff" }}>
												{pt.properties.damage_level}
											</Badge>
										</div>
										<div>
											<Text size="xs" c="dimmed">Infrastructure type</Text>
											<Text size="xs" fw={500}>{pt.properties.infrastructure_type}</Text>
										</div>
										{pt.properties.assigned ? (
											<Badge style={{ backgroundColor: "var(--sev-low-soft)", color: "var(--sev-low)" }}>
												Assigned to {pt.properties.assigned_to}
											</Badge>
										) : (
											<>
												<Badge style={{ backgroundColor: "var(--sev-critical-soft)", color: "var(--sev-critical)" }}>
													Not assigned
												</Badge>
												<Button
													size="xs"
													mt="xs"
													fullWidth
													rightSection={<IconArrowRight size={14} />}
													onClick={() => router.push(`/responders?zone=${pt.properties.zone_id}`)}
												>
													Assign
												</Button>
											</>
										)}
										{onViewReport && (
											<Button size="xs" fullWidth variant="light" leftSection={<IconFileText size={14} />} onClick={() => onViewReport(pt)}>
												View full report
											</Button>
										)}
									</Stack>
								</Popup>
							</Marker>
						);
					})}
				</MarkerClusterGroup>
			</MapContainer>
		</div>
	);
}
