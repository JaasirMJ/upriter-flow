import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore, estimatedWaitMins, patientsAhead, avgConsultMins, activeDoctor } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, Car, Clock, MapPin, Search, Sparkles, Stethoscope, Ticket, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { JourneyPlanner } from "@/components/JourneyPlanner";
import { BookingSlots } from "@/components/BookingSlots";
import { PriorityIntake, PriorityBadge, RiskBadge } from "@/components/PriorityIntake";
import { PatientHistoryTimeline } from "@/components/PatientHistoryTimeline";
import { EmergencyCard } from "@/components/EmergencyCard";
import { HealthSummary } from "@/components/HealthSummary";
import { NearbyHospitals } from "@/components/NearbyHospitals";
import type { Priority } from "@/lib/store";
import type { RiskAssessment } from "@/lib/risk";

export const Route = createFileRoute("/patient")({
  head: () => ({
    meta: [
      { title: "Patient — Upriter" },
      { name: "description", content: "Book appointments, track your token, and arrive at the right time." },
    ],
  }),
  component: PatientPage,
});

function PatientPage() {
  const state = useStore();
  const myToken = state.patients.find((p) => p.id === state.myTokenId);

  return (
    <AppShell title="Patient Dashboard" subtitle="Book, plan and arrive only when you're needed.">
      <div className="space-y-5">
        <HealthSummary />
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {myToken && <EmergencyCard patient={myToken} />}
            {myToken ? <LiveQueueCard /> : <BookFlow />}
            <JourneyPlanner />
            {!myToken && <BookingSlots onSelect={(t) => toast.message(`Slot ${t} selected — complete booking on the left.`)} />}
          </div>
          <div className="space-y-5">
            <DoctorCard />
            <NearbyHospitals />
            <PatientHistoryTimeline />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function BookFlow() {
  const { hospitals, doctors, bookAppointment } = useStore();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [hospitalId, setHospitalId] = useState(hospitals[0].id);
  const [dept, setDept] = useState<string>("Cardiology");
  const [doctorId, setDoctorId] = useState(doctors[0].id);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [priority, setPriority] = useState<Priority>("regular");
  const [symptoms, setSymptoms] = useState("");
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);

  const hospital = hospitals.find((h) => h.id === hospitalId)!;

  const book = () => {
    if (!name || !age || !phone) return toast.error("Fill in your details");
    const appt = new Date(`${date}T17:30:00`).toISOString();
    const p = bookAppointment({
      name, age: Number(age), phone, appointmentTime: appt, priority, symptoms,
      aiLabel: assessment?.recommendation,
      riskLevel: assessment?.riskLevel,
      riskLabels: assessment?.labels,
      suggestedDept: assessment?.suggestedDept,
      recommendation: assessment?.recommendation,
      confidence: assessment?.confidence,
      estDurationMins: assessment?.estDurationMins,
    });
    toast.success(`Booked! Your token is #${p.token}`);
  };

  const steps = ["Hospital", "Doctor & date", "Health check", "Your details"];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h2 className="text-lg font-semibold tracking-tight">Book an appointment</h2>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs flex-wrap">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`size-6 grid place-items-center rounded-full ${step >= ((i + 1) as 1|2|3|4) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
            <span className={step >= ((i + 1) as 1|2|3|4) ? "font-medium" : "text-muted-foreground"}>{s}</span>
            {i < steps.length - 1 && <div className="w-4 h-px bg-border" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="mt-6 space-y-4">
          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search hospitals..." className="pl-9" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {hospitals.map((h) => (
              <button key={h.id} onClick={() => setHospitalId(h.id)} className={`text-left p-4 rounded-xl border transition ${hospitalId === h.id ? "border-primary bg-primary/5" : "border-border hover:border-foreground/20"}`}>
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  <div className="font-medium">{h.name}</div>
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="size-3" /> {h.city}</div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {h.departments.slice(0, 3).map((d) => <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>)}
                </div>
              </button>
            ))}
          </div>
          <div>
            <Label className="text-xs">Department</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {hospital.departments.map((d) => (
                <button key={d} onClick={() => setDept(d)} className={`px-3 py-1.5 rounded-full text-xs border ${dept === d ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>{d}</button>
              ))}
            </div>
          </div>
          <Button onClick={() => setStep(2)} className="w-full">Continue</Button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6 space-y-4">
          <div>
            <Label className="text-xs">Doctor</Label>
            <div className="mt-2 space-y-2">
              {doctors.map((d) => (
                <button key={d.id} onClick={() => setDoctorId(d.id)} className={`w-full text-left p-3 rounded-lg border flex items-center justify-between ${doctorId === d.id ? "border-primary bg-primary/5" : "border-border"}`}>
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-muted grid place-items-center"><Stethoscope className="size-4 text-primary" /></div>
                    <div>
                      <div className="font-medium text-sm">{d.name}</div>
                      <div className="text-xs text-muted-foreground">{d.specialty}</div>
                    </div>
                  </div>
                  <Badge variant="secondary">Avail. today</Badge>
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="date" className="text-xs">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)} className="flex-1">Continue</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-6 space-y-3">
          <PriorityIntake age={age ? Number(age) : undefined} onAccept={(r) => { setPriority(r.priority); setAssessment(r.assessment); setSymptoms(r.symptoms); setStep(4); }} />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button variant="ghost" onClick={() => setStep(4)} className="flex-1">Skip for now</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="mt-6 space-y-4">
          {assessment && (
            <div className="p-3 rounded-lg bg-accent/40 border border-border flex items-center justify-between gap-2 flex-wrap">
              <div>
                <div className="text-xs text-muted-foreground">AI risk assessment</div>
                <div className="text-sm font-medium">{assessment.recommendation}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Suggested: {assessment.suggestedDept} · {assessment.confidence}% confidence</div>
              </div>
              <RiskBadge level={assessment.riskLevel} />
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aarav Mehta" className="mt-2" />
            </div>
            <div>
              <Label className="text-xs">Age</Label>
              <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="32" className="mt-2" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98xxx xxxxx" className="mt-2" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
            <Button onClick={book} className="flex-1 gap-2"><Ticket className="size-4" />Generate token</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function LiveQueueCard() {
  const state = useStore();
  const myToken = state.patients.find((p) => p.id === state.myTokenId)!;
  const ahead = patientsAhead(state, myToken.token);
  const wait = estimatedWaitMins(state, myToken.token);
  const clearMyToken = useStore((s) => s.clearMyToken);

  const isUp = myToken.status === "in_progress";
  const isDone = myToken.status === "completed";

  return (
    <Card className="p-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-soft -z-10" />
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><Ticket className="size-3.5" /> Your live queue</div>
          <h2 className="text-2xl font-semibold tracking-tight mt-1">Token #{myToken.token}</h2>
          <div className="text-sm text-muted-foreground">{myToken.name} • {new Date(myToken.appointmentTime ?? Date.now()).toLocaleString()}</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={isUp ? "default" : isDone ? "secondary" : "outline"} className={isUp ? "animate-pulse-ring" : ""}>
            {isUp ? "It's your turn" : isDone ? "Completed" : "Waiting"}
          </Badge>
          {myToken.priority && myToken.priority !== "regular" && <PriorityBadge priority={myToken.priority} />}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile label="Now Serving" value={`#${state.currentToken}`} />
        <Tile label="Your Token" value={`#${myToken.token}`} highlight />
        <Tile label="Patients Ahead" value={ahead.toString()} />
        <Tile label="Est. Wait" value={`${wait} min`} />
      </div>

      <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
        <div>Avg consult: <span className="font-medium text-foreground">{Math.round(avgConsultMins(state))} min</span></div>
        <button onClick={clearMyToken} className="hover:text-foreground">Cancel booking</button>
      </div>
    </Card>
  );
}

function Tile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${highlight ? "bg-primary text-primary-foreground border-primary shadow-glow" : "bg-card border-border"}`}>
      <div className={`text-[10px] uppercase tracking-wider ${highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{label}</div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function DoctorCard() {
  const state = useStore();
  const d = activeDoctor(state);
  const tone = d.status === "available" ? "bg-success/10 text-success border-success/30" : d.status === "late" ? "bg-warning/15 text-warning-foreground border-warning/40" : "bg-muted text-muted-foreground border-border";
  return (
    <Card className="p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">Your doctor</div>
      <div className="mt-3 flex items-center gap-3">
        <div className="size-12 rounded-full bg-gradient-hero grid place-items-center text-white"><Stethoscope className="size-5" /></div>
        <div>
          <div className="font-semibold">{d.name}</div>
          <div className="text-xs text-muted-foreground">{d.specialty}</div>
        </div>
      </div>
      <div className={`mt-4 inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs ${tone}`}>
        <span className="size-1.5 rounded-full bg-current" />
        {d.status === "available" ? "Available" : d.status === "late" ? `Running late +${d.delayMins} min` : "On break"}
      </div>
    </Card>
  );
}
