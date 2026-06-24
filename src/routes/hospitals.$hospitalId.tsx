import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hospitalById, doctorsByHospital } from "@/lib/data";
import { useProfile } from "@/lib/profile";
import { AmbulanceIcon, Clock, Heart, MapPin, Star, Stethoscope, Users } from "lucide-react";
import { haversineKm, travelTimeMins, crowdColor } from "@/lib/geo";

export const Route = createFileRoute("/hospitals/$hospitalId")({
  head: ({ params }) => {
    const h = hospitalById(params.hospitalId);
    return { meta: [{ title: `${h?.name ?? "Hospital"} — Upriter` }] };
  },
  component: HospitalDetail,
  notFoundComponent: () => (
    <AppShell title="Hospital not found"><div className="text-sm text-muted-foreground">This hospital is not registered with Upriter.</div></AppShell>
  ),
});

function HospitalDetail() {
  const { hospitalId } = Route.useParams();
  const h = hospitalById(hospitalId);
  if (!h) throw notFound();
  const profile = useProfile((s) => s.profile);
  const favorites = useProfile((s) => s.favorites);
  const toggleFavorite = useProfile((s) => s.toggleFavorite);
  const navigate = useNavigate();
  const fav = favorites.includes(h.id);

  const docs = doctorsByHospital(h.id);
  const here = profile ? { lat: profile.lat, lng: profile.lng } : null;
  const dist = here ? haversineKm(here, { lat: h.lat, lng: h.lng }) : null;
  const eta = dist != null ? travelTimeMins(dist) : null;

  return (
    <AppShell title={h.name} subtitle={`${h.city}, ${h.state}`}>
      <div className="space-y-5">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 text-amber-500"><Star className="size-3 fill-current" />{h.rating}</span>
                {h.emergency24x7 && <Badge variant="destructive" className="gap-1"><AmbulanceIcon className="size-3" /> 24×7 Emergency</Badge>}
                <Badge variant="outline" className="gap-1"><MapPin className="size-3" /> {h.city}</Badge>
                {eta != null && <Badge variant="secondary"><Clock className="size-3 mr-1" /> {dist!.toFixed(1)} km · {eta} min</Badge>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {h.departments.map((d) => <Badge key={d} variant="secondary" className="text-[11px]">{d}</Badge>)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => toggleFavorite(h.id)} className="gap-2">
                <Heart className={`size-4 ${fav ? "fill-destructive text-destructive" : ""}`} />
                {fav ? "Favorited" : "Add to favorites"}
              </Button>
              <Button onClick={() => navigate({ to: "/book", search: { hospitalId: h.id } })}>Book appointment</Button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Current queue" value={h.queueLoad === "low" ? "Low" : h.queueLoad === "medium" ? "Medium" : "High"} className={crowdColor(h.queueLoad)} />
            <Stat label="Avg wait time" value={`${h.avgWaitMins} min`} icon={<Clock className="size-3.5" />} />
            <Stat label="Doctors available" value={`${h.doctorsAvailable}`} icon={<Stethoscope className="size-3.5" />} />
            <Stat label="Patients today" value={`${120 + h.doctorsAvailable * 5}`} icon={<Users className="size-3.5" />} />
          </div>
        </Card>

        <div>
          <h3 className="font-semibold tracking-tight mb-3">Doctors</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {docs.map((d) => (
              <Card key={d.id} className="p-4 hover:shadow-soft transition">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-gradient-hero grid place-items-center text-white"><Stethoscope className="size-5" /></div>
                  <div className="min-w-0">
                    <Link to="/doctors/$doctorId" params={{ doctorId: d.id }} className="font-medium hover:text-primary truncate block">{d.name}</Link>
                    <div className="text-[11px] text-muted-foreground">{d.specialty} · {d.experienceYears}y</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-center">
                  <div className="p-2 rounded-md bg-muted/60"><div className="text-muted-foreground">Fee</div><div className="font-medium">₹{d.consultationFee}</div></div>
                  <div className="p-2 rounded-md bg-muted/60"><div className="text-muted-foreground">Avg</div><div className="font-medium">{d.avgConsultationMins}m</div></div>
                  <div className="p-2 rounded-md bg-muted/60"><div className="text-muted-foreground">★</div><div className="font-medium">{d.rating}</div></div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link to="/doctors/$doctorId" params={{ doctorId: d.id }} className="flex-1"><Button variant="outline" size="sm" className="w-full">Profile</Button></Link>
                  <Button size="sm" onClick={() => navigate({ to: "/book", search: { hospitalId: h.id, doctorId: d.id } })}>Book</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, icon, className }: { label: string; value: string; icon?: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border p-3 ${className ?? ""}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-80 flex items-center gap-1">{icon}{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}
