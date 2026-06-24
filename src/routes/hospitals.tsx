import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MapPin, Clock, Stethoscope, Search, AmbulanceIcon, Star } from "lucide-react";
import { useProfile } from "@/lib/profile";
import { HOSPITALS } from "@/lib/data";
import { haversineKm, travelTimeMins, crowdColor } from "@/lib/geo";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/hospitals")({
  head: () => ({ meta: [{ title: "Hospitals — Upriter" }] }),
  component: HospitalsPage,
});

function HospitalsPage() {
  const profile = useProfile((s) => s.profile);
  const favorites = useProfile((s) => s.favorites);
  const toggleFavorite = useProfile((s) => s.toggleFavorite);
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const here = profile ? { lat: profile.lat, lng: profile.lng } : null;
    return HOSPITALS
      .filter((h) => !q || h.name.toLowerCase().includes(q.toLowerCase()) || h.city.toLowerCase().includes(q.toLowerCase()))
      .map((h) => {
        const dist = here ? haversineKm(here, { lat: h.lat, lng: h.lng }) : null;
        return { ...h, distanceKm: dist, etaMins: dist != null ? travelTimeMins(dist) : null };
      })
      .sort((a, b) => {
        const af = favorites.includes(a.id) ? 0 : 1;
        const bf = favorites.includes(b.id) ? 0 : 1;
        if (af !== bf) return af - bf;
        return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
      });
  }, [q, favorites, profile]);

  return (
    <AppShell title="Hospitals registered with Upriter" subtitle="Free hospital registration. No booking fees.">
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by hospital or city…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((h) => {
            const fav = favorites.includes(h.id);
            return (
              <Card key={h.id} className="p-5 group hover:shadow-soft transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to="/hospitals/$hospitalId" params={{ hospitalId: h.id }} className="font-semibold tracking-tight hover:text-primary">
                      {h.name}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <MapPin className="size-3" /> {h.city}, {h.state}
                    </div>
                  </div>
                  <button onClick={() => toggleFavorite(h.id)} aria-label="Favorite" className="rounded-full size-8 grid place-items-center hover:bg-accent">
                    <Heart className={`size-4 ${fav ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {h.departments.slice(0, 4).map((d) => (
                    <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>
                  ))}
                  {h.departments.length > 4 && <Badge variant="outline" className="text-[10px]">+{h.departments.length - 4}</Badge>}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className={`px-2 py-1.5 rounded-md border ${crowdColor(h.queueLoad)} flex items-center gap-1.5`}>
                    <span className="size-1.5 rounded-full bg-current" />
                    {h.queueLoad === "low" ? "Low" : h.queueLoad === "medium" ? "Medium" : "High"} crowd
                  </div>
                  <div className="px-2 py-1.5 rounded-md border border-border flex items-center gap-1.5">
                    <Clock className="size-3" /> ~{h.avgWaitMins}m wait
                  </div>
                  <div className="px-2 py-1.5 rounded-md border border-border flex items-center gap-1.5">
                    <Stethoscope className="size-3" /> {h.doctorsAvailable} doctors
                  </div>
                  {h.etaMins != null && (
                    <div className="px-2 py-1.5 rounded-md border border-border flex items-center gap-1.5">
                      <MapPin className="size-3" /> {h.distanceKm!.toFixed(1)} km • {h.etaMins}m
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 text-amber-500"><Star className="size-3 fill-current" />{h.rating}</span>
                    {h.emergency24x7 && (
                      <span className="inline-flex items-center gap-1 text-destructive">
                        <AmbulanceIcon className="size-3" /> 24×7 ER
                      </span>
                    )}
                  </div>
                  <Link to="/hospitals/$hospitalId" params={{ hospitalId: h.id }}>
                    <Button size="sm" variant="ghost">View</Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
