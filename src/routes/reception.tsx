import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneOff, SkipForward, UserPlus, PhoneCall, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/routes/doctor";

export const Route = createFileRoute("/reception")({
  head: () => ({ meta: [{ title: "Reception — Upriter" }] }),
  component: ReceptionPage,
});

function ReceptionPage() {
  const { patients, addPatient, callNext, skipCurrent, markNoShow } = useStore();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [walkIn, setWalkIn] = useState(false);
  const [query, setQuery] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || !phone) return toast.error("Fill all fields");
    const p = addPatient({ name, age: Number(age), phone, isWalkIn: walkIn });
    toast.success(`Token #${p.token} generated for ${name}`);
    setName(""); setAge(""); setPhone("");
  };

  const sorted = [...patients].sort((a, b) => a.token - b.token).filter((p) =>
    !query || p.name.toLowerCase().includes(query.toLowerCase()) || String(p.token).includes(query)
  );

  return (
    <AppShell title="Reception Dashboard" subtitle="Add patients, manage the queue, handle walk-ins.">
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
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="font-semibold">Live queue</h3>
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
                  <th className="py-2 pr-3">Phone</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p) => (
                  <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40 transition">
                    <td className="py-3 pr-3 font-medium tabular-nums">#{p.token}</td>
                    <td className="py-3 pr-3">{p.name} <span className="text-xs text-muted-foreground">• {p.age}y</span></td>
                    <td className="py-3 pr-3 text-muted-foreground">{p.phone}</td>
                    <td className="py-3 pr-3 text-xs text-muted-foreground">{p.isWalkIn ? "Walk-in" : "Booked"}</td>
                    <td className="py-3"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">No patients in queue.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
