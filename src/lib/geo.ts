import { CITIES, HOSPITALS, type City, type SeedHospital } from "./data";

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function nearestCity(point: { lat: number; lng: number }): City {
  let best = CITIES[0];
  let bestDist = haversineKm(point, best);
  for (const c of CITIES) {
    const d = haversineKm(point, c);
    if (d < bestDist) {
      best = c;
      bestDist = d;
    }
  }
  return best;
}

export function travelTimeMins(km: number): number {
  // city traffic average ~25 km/h
  return Math.max(5, Math.round(km * 2.4));
}

export function hospitalsNear(point: { lat: number; lng: number }, limit = 6): (SeedHospital & { distanceKm: number; etaMins: number })[] {
  return HOSPITALS
    .map((h) => {
      const distanceKm = haversineKm(point, { lat: h.lat, lng: h.lng });
      return { ...h, distanceKm, etaMins: travelTimeMins(distanceKm) };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

export function crowdColor(load: "low" | "medium" | "high"): string {
  return load === "low" ? "bg-success/15 text-success border-success/30"
    : load === "medium" ? "bg-warning/15 text-warning-foreground border-warning/40"
    : "bg-destructive/15 text-destructive border-destructive/30";
}
