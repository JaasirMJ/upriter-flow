import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { HOSPITALS, doctorsByHospital, doctorsByDept, availabilityForDoctor, hospitalById, doctorById } from "@/lib/data";
import { Building2, Calendar, CheckCircle2, ChevronRight, MessageSquare, Stethoscope, Sunrise, Sun, Sunset, Moon, Ticket } from "lucide-react";
import { useProfile } from "@/lib/profile";
import { useStore } from "@/lib/store";
import { sendWhatsApp } from "@/lib/whatsapp";
import { toast } from "sonner";

type BookSearch = { hospitalId?: string; doctorId?: string };

export const Route = createFileRoute("/book")({
  head: () => ({ meta: [{ title: "Book — Upriter" }] }),
  validateSearch: (s: Record<string, unknown>): BookSearch => ({
    hospitalId: typeof s.hospitalId === "string" ? s.hospitalId : undefined,
    doctorId: typeof s.doctorId === "string" ? s.doctorId : undefined,
  }),
  component: BookPage,
});

const BLOCKS = [
  { id: "morning", label: "Morning", time: "7–10 AM", icon: Sunrise, hours: [7, 10] },
  { id: "afternoon", label: "Afternoon", time: "11–2 PM", icon: Sun, hours: [11, 14] },
  { id: "evening", label: "Evening", time: "3–6 PM", icon: Sunset, hours: [15, 18] },
  { id: "night", label: "Night", time: "7–11 PM", icon: Moon, hours: [19, 23] },
] as const;

function BookPage() {
  const search = Route.useSearch();
  const profile = useProfile((s) => s.profile);
  const addVisit = useProfile((s) => s.addVisit);
  const bookAppointment = useStore((s) => s.bookAppointment);

  const [step, setStep] = useState(search.doctorId ? 3 : search.hospitalId ? 2 : 1);
  const [hospitalId, setHospitalId] = useState(search.hospitalId ?? HOSPITALS[0].id);
  const [department, setDepartment] = useState<string>(hospitalById(search.hospitalId ?? HOSPITALS[0].id)!.departments[0]);
  const [doctorId, setDoctorId] = useState(search.doctorId ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState<string>("");
  const [confirmed, setConfirmed] = useState<{ token: number; doctor: string; hospital: string; date: string; time: string } | null>(null);

  const hospital = hospitalById(hospitalId)!;
  const docs = useMemo(() => doctorsByDept(hospitalId, department).length ? doctorsByDept(hospitalId, department) : doctorsByHospital(hospitalId), [hospitalId, department]);
  const doctor = docs.find((d) => d.id === doctorId) ?? docs[0];
  const cal = doctor ? availabilityForDoctor(doctor.id) : [];
  const todayCal = cal.find((c) => c.date === date) ?? cal[0];
  const slotsByBlock = useMemo(() => {
    if (!todayCal) return {} as Record<string, string[]>;
    const out: Record<string, string[]> = {};
    for (const b of BLOCKS) {
      out[b.id] = todayCal.slots.filter((s) => {
        const hr = Number(s.split(":")[0]);
        return hr >= b.hours[0] && hr <= b.hours[1];
      });
    }
    return out;
  }, [todayCal]);

  const goConfirm = () => {
    if (!profile) return toast.error("Please complete onboarding first.");
    if (!doctor || !slot) return toast.error("Pick a doctor and time slot.");
    const appt = new Date(`${date}T${slot}:00`).toISOString();
    const p = bookAppointment({
      name: profile.name,
      age: profile.age,
      phone: profile.phone,
      appointmentTime: appt,
    });
    addVisit({
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department,
      date: appt,
      time: slot,
      consultationMins: doctor.avgConsultationMins,
      waitedMins: 0,
      hospitalAvgWaitMins: hospital.avgWaitMins,
      tokenNumber: p.token,
      status: "upcoming",
    });
    setConfirmed({ token: p.token, doctor: doctor.name, hospital: hospital.name, date, time: slot });
    toast.success(`Token #${p.token} confirmed`);
  };

  if (confirmed) {
    return (
      <AppShell title="Appointment confirmed" subtitle="We'll notify you when it's time to leave.">
        <Card className="p-8 max-w-xl">
          <div className="size-14 rounded-full bg-success/15 grid place-items-center mb-4"><CheckCircle2 className="size-7 text-success" /></div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Your token</div>
          <div className="text-4xl font-semibold tracking-tight mt-1">#{confirmed.token}</div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <KV label="Doctor" value={confirmed.doctor} />
            <KV label="Hospital" value={confirmed.hospital} />
            <KV label="Date" value={new Date(confirmed.date).toLocaleDateString()} />
            <KV label="Time" value={confirmed.time} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={() => sendWhatsApp(profile!.phone, `Upriter: Appointment confirmed at ${confirmed.hospital} with ${confirmed.doctor} on ${confirmed.date} at ${confirmed.time}. Token #${confirmed.token}.`)} variant="outline" className="gap-2">
              <MessageSquare className="size-4 text-emerald-600" /> Send WhatsApp confirmation
            </Button>
            <Button onClick={() => (window.location.href = "/patient")} className="gap-2"><Ticket className="size-4" /> Open my token</Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-4">Hospital registration is free. There are no booking fees on Upriter.</p>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="Book an appointment" subtitle="Hospital → Department → Doctor → Date → Time">
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2 space-y-5">
          {/* Stepper */}
          <div className="flex items-center gap-1 text-xs flex-wrap">
            {["Hospital", "Department", "Doctor", "Date & slot"].map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`size-5 rounded-full grid place-items-center text-[10px] ${step > i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
                <span className={step > i ? "font-medium" : "text-muted-foreground"}>{s}</span>
                {i < 3 && <ChevronRight className="size-3 text-muted-foreground" />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div>
              <Label className="text-xs">Choose a hospital</Label>
              <div className="mt-2 grid sm:grid-cols-2 gap-2">
                {HOSPITALS.map((h) => (
                  <button key={h.id} onClick={() => { setHospitalId(h.id); setDepartment(h.departments[0]); setDoctorId(""); }} className={`text-left p-3 rounded-xl border transition ${hospitalId === h.id ? "border-primary bg-primary/5" : "border-border hover:border-foreground/20"}`}>
                    <div className="flex items-center gap-2"><Building2 className="size-4 text-primary" /><span className="font-medium text-sm">{h.name}</span></div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{h.city}, {h.state}</div>
                  </button>
                ))}
              </div>
              <Button onClick={() => setStep(2)} className="mt-4 w-full">Continue</Button>
            </div>
          )}

          {step === 2 && (
            <div>
              <Label className="text-xs">Department</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {hospital.departments.map((d) => (
                  <button key={d} onClick={() => { setDepartment(d); setDoctorId(""); }} className={`px-3 py-1.5 rounded-full text-xs border ${department === d ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>{d}</button>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1">Continue</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <Label className="text-xs">Doctor</Label>
              <div className="mt-2 space-y-2">
                {docs.map((d) => (
                  <button key={d.id} onClick={() => setDoctorId(d.id)} className={`w-full text-left p-3 rounded-lg border flex items-center justify-between ${doctorId === d.id ? "border-primary bg-primary/5" : "border-border"}`}>
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-muted grid place-items-center"><Stethoscope className="size-4 text-primary" /></div>
                      <div>
                        <div className="font-medium text-sm">{d.name}</div>
                        <div className="text-[11px] text-muted-foreground">{d.specialty} · ₹{d.consultationFee} · {d.avgConsultationMins}m</div>
                      </div>
                    </div>
                    <Badge variant="secondary">★ {d.rating}</Badge>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={() => doctor && setStep(4)} className="flex-1" disabled={!doctor}>Continue</Button>
              </div>
            </div>
          )}

          {step === 4 && doctor && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs flex items-center gap-1"><Calendar className="size-3.5" /> Date</Label>
                <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
                  {cal.map((c) => {
                    const d = new Date(c.date);
                    return (
                      <button key={c.date} onClick={() => { setDate(c.date); setSlot(""); }} className={`shrink-0 px-3 py-2 rounded-lg border text-xs text-center ${date === c.date ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
                        <div className="text-[10px] uppercase opacity-80">{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
                        <div className="font-semibold">{d.getDate()}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                {BLOCKS.map((b) => {
                  const slots = slotsByBlock[b.id] ?? [];
                  const Icon = b.icon;
                  const tone = slots.length >= 4 ? "border-success/40 bg-success/5" : slots.length >= 2 ? "border-warning/40 bg-warning/5" : "border-destructive/30 bg-destructive/5";
                  return (
                    <div key={b.id} className={`rounded-xl border p-3 ${tone}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium flex items-center gap-2"><Icon className="size-4" /> {b.label} <span className="text-[11px] text-muted-foreground">{b.time}</span></div>
                        <span className="text-[11px] text-muted-foreground">{slots.length} slots</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {slots.length === 0 ? (
                          <span className="text-[11px] text-muted-foreground">No slots</span>
                        ) : slots.map((s) => (
                          <button key={s} onClick={() => setSlot(s)} className={`px-2.5 py-1 rounded-md border text-xs ${slot === s ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"}`}>{s}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                <Button onClick={goConfirm} className="flex-1 gap-2" disabled={!slot}><Ticket className="size-4" /> Confirm — generate token</Button>
              </div>
              <p className="text-[11px] text-muted-foreground">Hospital registration is free. No booking fees.</p>
            </div>
          )}
        </Card>

        <Card className="p-5 h-fit">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Booking summary</div>
          <div className="mt-3 space-y-2 text-sm">
            <KV label="Hospital" value={hospital.name} />
            <KV label="City" value={`${hospital.city}, ${hospital.state}`} />
            <KV label="Department" value={department} />
            <KV label="Doctor" value={doctor?.name ?? "—"} />
            <KV label="Date" value={date} />
            <KV label="Time" value={slot || "—"} />
            <KV label="Avg consult" value={doctor ? `${doctor.avgConsultationMins} min` : "—"} />
            <KV label="Fee" value={doctor ? `₹${doctor.consultationFee}` : "—"} />
          </div>
          <div className="mt-4 p-3 rounded-lg bg-accent/40 text-[11px] text-muted-foreground">
            You'll get an Upriter token. We'll alert you on WhatsApp when it's time to leave.
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-1.5 text-sm">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium truncate">{value}</span>
    </div>
  );
}
