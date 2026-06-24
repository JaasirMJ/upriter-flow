import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { doctorById, hospitalById, availabilityForDoctor } from "@/lib/data";
import { Stethoscope, Star, Award, Languages, Clock, IndianRupee, Calendar, Users } from "lucide-react";

export const Route = createFileRoute("/doctors/$doctorId")({
  head: ({ params }) => {
    const d = doctorById(params.doctorId);
    return { meta: [{ title: `${d?.name ?? "Doctor"} — Upriter` }] };
  },
  component: DoctorDetail,
});

function DoctorDetail() {
  const { doctorId } = Route.useParams();
  const d = doctorById(doctorId);
  if (!d) throw notFound();
  const h = hospitalById(d.hospitalId);
  const navigate = useNavigate();
  const cal = availabilityForDoctor(d.id);

  return (
    <AppShell title={d.name} subtitle={`${d.specialty} · ${h?.name}`}>
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-6 lg:col-span-2 space-y-5">
          <div className="flex items-start gap-4">
            <div className="size-16 rounded-2xl bg-gradient-hero grid place-items-center text-white"><Stethoscope className="size-7" /></div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold tracking-tight">{d.name}</h2>
              <div className="text-sm text-muted-foreground">{d.qualifications}</div>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 text-amber-500"><Star className="size-3.5 fill-current" /> {d.rating}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{d.patientsTreated.toLocaleString()} patients treated</span>
              </div>
            </div>
            <Button onClick={() => navigate({ to: "/book", search: { hospitalId: d.hospitalId, doctorId: d.id } })}>Book appointment</Button>
          </div>

          <p className="text-sm text-muted-foreground">{d.about}</p>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            <Info icon={<Award className="size-3.5" />} label="Experience" value={`${d.experienceYears} years`} />
            <Info icon={<IndianRupee className="size-3.5" />} label="Consultation" value={`₹${d.consultationFee}`} />
            <Info icon={<Clock className="size-3.5" />} label="Avg duration" value={`${d.avgConsultationMins} min`} />
            <Info icon={<Users className="size-3.5" />} label="Patients" value={d.patientsTreated.toLocaleString()} />
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Languages className="size-3.5" /> Languages spoken</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {d.languages.map((l) => <Badge key={l} variant="secondary">{l}</Badge>)}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Calendar className="size-3.5" /> Availability</div>
          <div className="mt-3 space-y-2">
            {cal.slice(0, 5).map((day) => (
              <div key={day.date} className="rounded-lg border border-border p-3">
                <div className="text-xs font-medium">{new Date(day.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {day.slots.slice(0, 6).map((s) => <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{s}</span>)}
                </div>
              </div>
            ))}
          </div>
          {h && (
            <Link to="/hospitals/$hospitalId" params={{ hospitalId: h.id }} className="mt-3 block text-xs text-primary hover:underline">
              At {h.name} →
            </Link>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3 bg-card">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">{icon}{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
