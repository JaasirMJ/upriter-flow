import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore, type Priority } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneOff, SkipForward, UserPlus, PhoneCall, Search, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/routes/doctor";
import { PriorityBadge } from "@/components/PriorityIntake";
import { HospitalLiveStatus } from "@/components/HospitalLiveStatus";
import { ReceptionEmergencyPanel } from "@/components/ReceptionEmergencyPanel";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/reception")({
  head: () => ({ meta: [{ title: "Reception — Upriter" }] }),
  component: ReceptionPage,
});

const PRIORITY_RANK: Record<Priority, number> = { critical: 0, high: 1, regular: 2, routine: 3 };

function ReceptionPage() {
  const { patients, addPatient, callNext, skipCurrent, markNoShow, setPatientPriority } = useStore();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [walkIn, setWalkIn] = useState(false);
  const [priority, setPriority] = useState<Priority>("regular");
  const [query, setQuery] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || !phone) return toast.error("Fill all fields");
    const p = addPatient({ name, age: Number(age), phone, isWalkIn: walkIn, priority });
    toast.success(`Token #${p.token} (${priority.toUpperCase()}) for ${name}`);
    setName(""); setAge(""); setPhone(""); setPriority("regular");
  };

  const filtered = patients.filter((p) =>
    !query || p.name.toLowerCase().includes(query.toLowerCase()) || String(p.token).includes(query)
  );
  const sortedByPriority = [...filtered].sort((a, b) => {
    const pa = PRIORITY_RANK[a.priority ?? "regular"];
    const pb = PRIORITY_RANK[b.priority ?? "regular"];
    if (pa !== pb) return pa - pb;
    return a.token - b.token;
  });

  return (
    <AppShell title="Reception Dashboard" subtitle="Add patients, manage the queue, handle walk-ins.">
      <div className="space-y-5">
        <HospitalLiveStatus />
        <ReceptionEmergencyPanel />

        <div className="grid lg:grid-cols-3 gap-5">
          <Card className="p-5 lg:col-span-1">
            <div className="flex items-center gap-2">
              <UserPlus className="size-4 text-primary" />
              <h3 className="font-semibold">Add patient</h3>
            </div>
            <form onSubmit={submit} className="mt-4 space-y-3">
              <div>
                <Label className="text-xs">Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" placeholder="Full name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Age</Label>
                  <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs">Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" placeholder="98xxxxxxxx" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Priority</Label>
                <div className="mt-1.5 grid grid-cols-4 gap-1">
                  {(["critical", "high", "regular", "routine"] as Priority[]).map((p) => (
                    <button type="button" key={p} onClick={() => setPriority(p)} className={`text-[11px] py-1.5 rounded-md border ${priority === p ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                      {p[0].toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={walkIn} onChange={(e) => setWalkIn(e.target.checked)} className="rounded" />
                Walk-in patient
              </label>
              <Button type="submit" className="w-full gap-2"><UserPlus className="size-4" /> Generate token</Button>
            </form>

            <div className="mt-6 pt-5 border-t border-border space-y-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Queue actions</div>
              <Button onClick={callNext} className="w-full gap-2"><PhoneCall className="size-4" /> Call next</Button>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={skipCurrent} variant="outline" className="gap-2"><SkipForward className="size-4" /> Skip</Button>
                <Button onClick={markNoShow} variant="outline" className="gap-2"><PhoneOff className="size-4" /> No show</Button>
              </div>
              <div className="text-[11px] text-muted-foreground pt-2 flex items-start gap-1.5">
                <AlertTriangle className="size-3 mt-0.5 shrink-0" />
                Reception can override AI priority recommendations at any time.
              </div>
            </div>
          </Card>

          <Card className="p-5 lg:col-span-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="font-semibold">Priority queue</h3>
              <div className="relative">
                <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search token or name..." className="pl-8 h-8 w-64" />
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="py-2 pr-3">Token</th>
                    <th className="py-2 pr-3">Patient</th>
                    <th className="py-2 pr-3">Priority</th>
                    <th className="py-2 pr-3">Type</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedByPriority.map((p) => (
                    <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40 transition">
                      <td className="py-3 pr-3 font-medium tabular-nums">#{p.token}</td>
                      <td className="py-3 pr-3">{p.name} <span className="text-xs text-muted-foreground">• {p.age}y</span></td>
                      <td className="py-3 pr-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="cursor-pointer"><PriorityBadge priority={p.priority ?? "regular"} /></button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel className="text-xs">Override priority</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {(["critical", "high", "regular", "routine"] as Priority[]).map((pr) => (
                              <DropdownMenuItem key={pr} onClick={() => setPatientPriority(p.id, pr)}>
                                <PriorityBadge priority={pr} />
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="py-3 pr-3 text-xs text-muted-foreground">{p.isWalkIn ? "Walk-in" : "Booked"}</td>
                      <td className="py-3"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                  {sortedByPriority.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">No patients in queue.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
