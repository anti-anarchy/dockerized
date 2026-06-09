import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import { Paper, Text, Stack, Badge, Button } from "@mantine/core";
import { useRouter } from "next/router";
import type { ZoneFeature, PointFeature, DisasterType, DamageLevel } from "@/types";
import { DISASTER_COLORS, DAMAGE_COLORS } from "@/types";

const MIXED_DISASTER_COLOR = "#6D6E72";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function createClusterIcon(count: number, color: string, selected: boolean): L.DivIcon {
  const r = Math.max(20, Math.min(54, Math.sqrt(count) * 5));
  const d = r * 2;
  const fs = Math.max(11, Math.min(18, r / 2.4));
  const border = selected ? "3px solid #1a1a2e" : "2.5px solid rgba(255,255,255,0.9)";
  const opacity = selected ? 1 : 0.84;
  return L.divIcon({
    className: "",
    html: `<div style="width:${d}px;height:${d}px;border-radius:50%;background:${color};opacity:${opacity};border:${border};box-shadow:0 2px 10px rgba(0,0,0,0.28);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:${fs}px;line-height:1;font-family:sans-serif;">${Math.round(count)}</div>`,
    iconSize: [d, d] as [number, number],
    iconAnchor: [r, r] as [number, number],
  });
}

function createPointIcon(damageLevel: DamageLevel, selected: boolean): L.DivIcon {
  const color = DAMAGE_COLORS[damageLevel] ?? "#c0392b";
  const size = selected ? 14 : 10;
  const border = selected ? "2.5px solid #1a1a2e" : "2px solid #fff";
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${border};box-shadow:0 1px 5px rgba(0,0,0,0.38);"></div>`,
    iconSize: [size, size] as [number, number],
    iconAnchor: [size / 2, size / 2] as [number, number],
  });
}

function MapLegend() {
  return (
    <div style={{ position: "absolute", top: 12, left: 12, zIndex: 1000, pointerEvents: "none" }}>
      <Paper shadow="sm" radius="md" p="sm" withBorder style={{ minWidth: 168 }}>
        <Text size="xs" fw={600} mb={5} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.04em" }}>
          Disaster Type
        </Text>
        <Stack gap={4}>
          {(["Flood", "Landslide", "Fire"] as DisasterType[]).map((type) => (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: DISASTER_COLORS[type], flexShrink: 0 }} />
              <Text size="xs">{type}</Text>
            </div>
          ))}
        </Stack>
        <Text size="xs" fw={600} mt={9} mb={5} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.04em" }}>
          Damage Level
        </Text>
        <Stack gap={4}>
          {(Object.entries(DAMAGE_COLORS) as [DamageLevel, string][]).map(([level, color]) => (
            <div key={level} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <Text size="xs">{level}</Text>
            </div>
          ))}
        </Stack>
        <Text size="xs" fw={600} mt={9} mb={5} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.04em" }}>
          Mixed Cluster
        </Text>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: MIXED_DISASTER_COLOR, flexShrink: 0 }} />
          <Text size="xs">Multiple disasters</Text>
        </div>
      </Paper>
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
  const dominant_disaster = (Object.entries(disasterTally).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Hurricane") as DisasterType;
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

// Mounts inside MapContainer; re-mounts (via key) each time a new fly target is set.
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
  const [points, setPoints] = useState<PointFeatureExtended[]>([]);
  const pointsMapRef = useRef<Map<string, PointFeatureExtended>>(new Map());

  useEffect(() => {
    const controller = new AbortController();

    async function loadPoints() {
      try {
        // Using a broader search window for the current mock data to approximate a 50km radius view.
        // This will change when the database is connected and the API can perform true geographic radius clustering.
        const res = await fetch("/api/clusters?bbox=36.43,-1.685,37.33,-0.785", {
          signal: controller.signal,
        });
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

        const derivedZones: ZoneFeature[] = Array.from(zoneMap.entries()).map(([zid, pts]) =>
          buildZoneFeature(zid, pts)
        );
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
    const tally: Record<string, number> = {};
    for (const marker of children) {
      const disaster = (marker.options as L.MarkerOptions & { alt?: string }).alt ?? "Unknown";
      tally[disaster] = (tally[disaster] ?? 0) + 1;
    }
const distinctDisasters = Object.keys(tally).filter((disaster) => disaster && disaster !== "Unknown");
  const dominant = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Unknown";
  const color = distinctDisasters.length > 1 ? MIXED_DISASTER_COLOR : DISASTER_COLORS[dominant as DisasterType] ?? "#607D8B";
    return createClusterIcon(count, color, false);
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

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <MapLegend />
      <MapContainer center={[-1.235, 36.88]} zoom={10} style={{ height: "100%", width: "100%", zIndex: 10 }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {flyTo && <FlyToPoint key={flyTo.seq} lat={flyTo.lat} lng={flyTo.lng} />}
        <MarkerClusterGroup
          iconCreateFunction={iconCreateFunction}
          chunkedLoading
          showCoverageOnHover={false}
          animate
          animateAddingMarkers={false}
          // Approximate a broader 50km cluster radius in screen-space for the current mock display.
          // A true 50km-spatial radius should be implemented when the DB is connected.
          maxClusterRadius={220}
          spiderfyOnMaxZoom
          eventHandlers={{ clusterclick: handleClusterClick } as any}
        >
          {points.map((pt) => {
            const [lng, lat] = pt.geometry.coordinates;
            const disasterColor = DISASTER_COLORS[pt.properties.disaster_type] ?? "#607D8B";
            const damageColor = DAMAGE_COLORS[pt.properties.damage_level] ?? "#c0392b";
            return (
              <Marker
                key={pt.properties.point_id}
                position={[lat, lng]}
                icon={createPointIcon(pt.properties.damage_level, false)}
                alt={pt.properties.disaster_type}
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
                    <Text fw={700} size="sm">
                      {pt.properties.infrastructure_name}
                    </Text>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <Badge style={{ backgroundColor: disasterColor, color: "#fff" }}>
                        {pt.properties.disaster_type}
                      </Badge>
                      <Badge style={{ backgroundColor: damageColor, color: "#fff" }}>
                        {pt.properties.damage_level}
                      </Badge>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed">
                        Infrastructure type
                      </Text>
                      <Text size="xs" fw={500}>
                        {pt.properties.infrastructure_type}
                      </Text>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed">
                        Infrastructure name
                      </Text>
                      <Text size="xs" fw={500}>
                        {pt.properties.infrastructure_name}
                      </Text>
                    </div>
                    {pt.properties.assigned ? (
                      <Badge style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}>
                        Assigned to {pt.properties.assigned_to}
                      </Badge>
                    ) : (
                      <>
                        <Badge style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}>
                          Not assigned
                        </Badge>
                        <Button
                          size="xs"
                          mt="xs"
                          fullWidth
                          onClick={() => router.push(`/responders?zone=${pt.properties.zone_id}`)}
                        >
                          Assign →
                        </Button>
                      </>
                    )}
                    {onViewReport && (
                      <Button
                        size="xs"
                        fullWidth
                        variant="outline"
                        onClick={() => onViewReport(pt)}
                      >
                        View full report →
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
