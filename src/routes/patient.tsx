import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore, estimatedWaitMins, patientsAhead, avgConsultMins, activeDoctor } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bell, Building2, Calendar, Car, Clock, MapPin, Search, Sparkles, Stethoscope, Ticket, TrendingUp, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

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
  const doc = activeDoctor(state);

  return (
    <AppShell title="Patient Dashboard" subtitle="Book, track and plan your hospital visit.">
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {myToken ? <LiveQueueCard /> : <BookFlow />}
          <AIArrivalPlanner />
        </div>
        <div className="space-y-5">
          <DoctorCard />
          <Notifications />
        </div>
      </div>
    </AppShell>
  );
}

function BookFlow() {
  const { hospitals, doctors, bookAppointment } = useStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [hospitalId, setHospitalId] = useState(hospitals[0].id);
  const [dept, setDept] = useState<string>("Cardiology");
  const [doctorId, setDoctorId] = useState(doctors[0].id);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");

  const hospital = hospitals.find((h) => h.id === hospitalId)!;
  const filteredDoctors = doctors;

  const book = () => {
    if (!name || !age || !phone) return toast.error("Fill in your details");
    const appt = new Date(`${date}T17:30:00`).toISOString();
    const p = bookAppointment({ name, age: Number(age), phone, appointmentTime: appt });
    toast.success(`Booked! Your token is #${p.token}`);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h2 className="text-lg font-semibold tracking-tight">Book an appointment</h2>
      </div>

      {/* Stepper */}
      <div className="mt-4 flex items-center gap-2 text-xs">
        {(["Hospital", "Doctor & date", "Your details"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`size-6 grid place-items-center rounded-full ${step >= ((i + 1) as 1|2|3) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
            <span className={step >= ((i + 1) as 1|2|3) ? "font-medium" : "text-muted-foreground"}>{s}</span>
            {i < 2 && <div className="w-6 h-px bg-border" />}
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
              {filteredDoctors.map((d) => (
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
        <div className="mt-6 space-y-4">
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
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
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
        <Badge variant={isUp ? "default" : isDone ? "secondary" : "outline"} className={isUp ? "animate-pulse-ring" : ""}>
          {isUp ? "It's your turn" : isDone ? "Completed" : "Waiting"}
        </Badge>
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

function AIArrivalPlanner() {
  const state = useStore();
  const myToken = state.patients.find((p) => p.id === state.myTokenId);
  const wait = myToken ? estimatedWaitMins(state, myToken.token) : 48;
  const travel = state.travelTimeMins;

  const now = new Date();
  const consultAt = useMemo(() => new Date(now.getTime() + wait * 60000), [wait, now.getTime()]);
  const leaveAt = useMemo(() => {
    const buffer = 5; // arrive 5 mins before
    return new Date(consultAt.getTime() - (travel + buffer) * 60000);
  }, [consultAt, travel]);

  const expectedWaitInside = Math.max(0, Math.min(10, Math.round(wait - travel - 5)));

  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 size-48 rounded-full bg-gradient-hero opacity-10 blur-2xl" />
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-lg bg-gradient-hero grid place-items-center"><Sparkles className="size-4 text-white" /></div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight">AI Arrival Planner</h3>
          <p className="text-xs text-muted-foreground">Powered by live queue + your travel time</p>
        </div>
      </div>

      <div className="mt-5 grid md:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Car className="size-3.5" /> Travel from home</div>
          <div className="mt-2 text-xl font-semibold">{travel} mins</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="size-3.5" /> Expected consult</div>
          <div className="mt-2 text-xl font-semibold">{format(consultAt, "p")}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingUp className="size-3.5" /> Wait inside hospital</div>
          <div className="mt-2 text-xl font-semibold">~{expectedWaitInside} min</div>
        </Card>
      </div>

      <div className="mt-5 p-5 rounded-xl bg-gradient-hero text-white relative">
        <div className="text-xs uppercase tracking-wider text-white/80">Recommendation</div>
        <div className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">Leave home at {format(leaveAt, "p")}</div>
        <div className="text-sm text-white/85 mt-1">
          You'll reach in ~{travel} min and your consultation starts around {format(consultAt, "p")}.
        </div>
      </div>
    </Card>
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

function Notifications() {
  const notifs = useStore((s) => s.notifications);
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2"><Bell className="size-4 text-primary" /><h3 className="font-semibold">Notifications</h3></div>
      <div className="mt-3 space-y-2 max-h-72 overflow-auto">
        {notifs.slice(0, 8).map((n) => (
          <div key={n.id} className="text-sm p-3 rounded-lg bg-muted/60 border border-border">
            <div className="text-foreground">{n.text}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.time).toLocaleTimeString()}</div>
          </div>
        ))}
        {notifs.length === 0 && <div className="text-xs text-muted-foreground">No notifications yet.</div>}
      </div>
    </Card>
  );
}
