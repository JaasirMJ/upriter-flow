import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore, type Priority } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PhoneOff, SkipForward, UserPlus, PhoneCall, Search, AlertTriangle, Undo2, History as HistoryIcon, Tv, Lock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/routes/doctor";
import { PriorityBadge } from "@/components/PriorityIntake";
import { HospitalLiveStatus } from "@/components/HospitalLiveStatus";
import { ReceptionEmergencyPanel } from "@/components/ReceptionEmergencyPanel";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/reception")({
  head: () => ({ meta: [{ title: "Reception — Upriter" }] }),
  component: ReceptionPage,
});

const PRIORITY_RANK: Record<Priority, number> = { critical: 0, high: 1, regular: 2, routine: 3 };

function relTime(ts: number, now: number): string {
  const s = Math.max(0, Math.floor((now - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

function ReceptionPage() {
  const patients = useStore((s) => s.patients);
  const addPatient = useStore((s) => s.addPatient);
  const callNext = useStore((s) => s.callNext);
  const skipCurrent = useStore((s) => s.skipCurrent);
  const markNoShow = useStore((s) => s.markNoShow);
  const setPatientPriority = useStore((s) => s.setPatientPriority);
  const undoLast = useStore((s) => s.undoLast);
  const auditLog = useStore((s) => s.auditLog);
  const undoStack = useStore((s) => s.undoStack);
  const lockedTokens = useStore((s) => s.lockedTokens);
  const lastUpdatedAt = useStore((s) => s.lastUpdatedAt);
  const now = useStore((s) => s.now);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [walkIn, setWalkIn] = useState(false);
  const [priority, setPriority] = useState<Priority>("regular");
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState<null | "skip" | "noshow">(null);

  const current = patients.find((p) => p.status === "in_progress");
  const dupPhone = phone.trim().length >= 6 && patients.some((p) => p.phone === phone.trim());
  const dupActive = dupPhone && patients.some((p) => p.phone === phone.trim() && (p.status === "waiting" || p.status === "in_progress"));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || !phone) return toast.error("Fill all fields");
    if (dupActive) {
      toast.error("Duplicate: this phone number is already in the active queue");
      return;
    }
    if (dupPhone) {
      const ok = window.confirm("This phone has a previous visit on record. Add as a new visit?");
      if (!ok) return;
    }
    const p = addPatient({ name, age: Number(age), phone, isWalkIn: walkIn, priority });
    toast.success(`Token #${p.token} (${priority.toUpperCase()}) for ${name}`);
    useStore.getState().pushAudit("Add patient", `Token #${p.token} — ${name}`);
    setName(""); setAge(""); setPhone(""); setPriority("regular");
  };

  const handleCallNext = () => {
    if (!current) { callNext(); return; }
    const ok = useStore.getState().lockToken(current.token);
    if (!ok) {
      toast.error(`Token #${current.token} is locked by another session`);
      return;
    }
    try { callNext(); } finally { useStore.getState().unlockToken(current.token); }
  };

  // Keyboard shortcuts: N / S / M
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "n") { e.preventDefault(); handleCallNext(); }
      else if (k === "s") { e.preventDefault(); setConfirm("skip"); }
      else if (k === "m") { e.preventDefault(); setConfirm("noshow"); }
      else if (k === "u") { e.preventDefault(); if (!undoLast()) toast.info("Nothing to undo"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undoLast, current?.id]);

  const filtered = patients.filter((p) =>
    !query || p.name.toLowerCase().includes(query.toLowerCase()) || String(p.token).includes(query) || p.phone.includes(query)
  );
  const sortedByPriority = [...filtered].sort((a, b) => {
    const pa = PRIORITY_RANK[a.priority ?? "regular"];
    const pb = PRIORITY_RANK[b.priority ?? "regular"];
    if (pa !== pb) return pa - pb;
    return a.token - b.token;
  });

  // Warnings
  const warnings: { kind: "warning" | "info"; text: string }[] = useMemo(() => {
    const out: { kind: "warning" | "info"; text: string }[] = [];
    const phoneCounts = new Map<string, number>();
    for (const p of patients) {
      if (p.status === "waiting" || p.status === "in_progress") {
        phoneCounts.set(p.phone, (phoneCounts.get(p.phone) ?? 0) + 1);
      }
    }
    for (const [ph, c] of phoneCounts) if (c > 1) out.push({ kind: "warning", text: `Duplicate patient detected — phone ${ph} appears ${c}× in active queue` });
    const completedToday = patients.filter((p) => p.status === "completed").length;
    if (completedToday > 0 && current && patients.some((p) => p.status === "completed" && p.phone === current.phone)) {
      out.push({ kind: "info", text: `Token #${current.token} (${current.name}) — patient already has a completed visit today` });
    }
    return out;
  }, [patients, current]);

  return (
    <AppShell title="Reception Dashboard" subtitle="Add patients, manage the queue, handle walk-ins.">
      <div className="space-y-5">
        {/* Live status bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-border bg-card/60">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Last updated <span className="font-medium text-foreground">{relTime(lastUpdatedAt, now)}</span>
            {lockedTokens.length > 0 && (
              <span className="ml-3 inline-flex items-center gap-1 text-amber-600 dark:text-amber-400"><Lock className="size-3" /> {lockedTokens.length} locked</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { if (!undoLast()) toast.info("Nothing to undo"); }} disabled={undoStack.length === 0} className="gap-1.5 h-8">
              <Undo2 className="size-3.5" /> Undo {undoStack[0] ? `(${undoStack[0].label})` : ""}
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-1.5 h-8">
              <Link to="/display"><Tv className="size-3.5" /> TV Mode</Link>
            </Button>
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="space-y-2">
            {warnings.map((w, i) => (
              <div key={i} className={`flex items-start gap-2.5 px-4 py-2.5 rounded-lg border text-sm ${w.kind === "warning" ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200" : "bg-muted/40 border-border text-foreground"}`}>
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>{w.text}</span>
              </div>
            ))}
          </div>
        )}

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
              {dupPhone && (
                <div className={`text-[11px] flex items-start gap-1.5 ${dupActive ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}>
                  <AlertTriangle className="size-3 mt-0.5 shrink-0" />
                  {dupActive ? "This phone is already active in the queue." : "Previous visit found for this phone."}
                </div>
              )}
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
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Queue actions</div>
                <div className="text-[10px] text-muted-foreground">Shortcuts: N · S · M · U</div>
              </div>
              <Button onClick={handleCallNext} size="lg" className="w-full gap-2 h-12 text-base">
                <PhoneCall className="size-5" /> Call next <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-white/20">N</kbd>
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => setConfirm("skip")} size="lg" variant="outline" className="gap-2 h-11">
                  <SkipForward className="size-4" /> Skip <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-muted">S</kbd>
                </Button>
                <Button onClick={() => setConfirm("noshow")} size="lg" variant="outline" className="gap-2 h-11">
                  <PhoneOff className="size-4" /> No show <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-muted">M</kbd>
                </Button>
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
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search token, name, or phone..." className="pl-8 h-8 w-72" />
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="py-2 pr-3">Token</th>
                    <th className="py-2 pr-3">Patient</th>
                    <th className="py-2 pr-3">Phone</th>
                    <th className="py-2 pr-3">Priority</th>
                    <th className="py-2 pr-3">Type</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedByPriority.map((p) => (
                    <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40 transition">
                      <td className="py-3 pr-3 font-medium tabular-nums">
                        #{p.token}
                        {lockedTokens.includes(p.token) && <Lock className="inline size-3 ml-1 text-amber-500" />}
                      </td>
                      <td className="py-3 pr-3">{p.name} <span className="text-xs text-muted-foreground">• {p.age}y</span></td>
                      <td className="py-3 pr-3 text-xs text-muted-foreground tabular-nums">{p.phone}</td>
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
                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">No patients in queue.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Audit log */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <HistoryIcon className="size-4 text-primary" />
            <h3 className="font-semibold">Audit log</h3>
            <span className="text-xs text-muted-foreground ml-1">— every queue event is timestamped</span>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
            {auditLog.slice(0, 50).map((a) => (
              <div key={a.id} className="py-2 flex items-start gap-3 text-sm">
                <span className="text-[11px] text-muted-foreground tabular-nums w-20 shrink-0">{new Date(a.time).toLocaleTimeString()}</span>
                <span className="font-medium">{a.action}</span>
                {a.detail && <span className="text-muted-foreground">— {a.detail}</span>}
                <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">{a.actor ?? "system"}</span>
              </div>
            ))}
            {auditLog.length === 0 && <div className="py-6 text-center text-sm text-muted-foreground">No events yet.</div>}
          </div>
        </Card>
      </div>

      {/* Confirmation dialogs */}
      <AlertDialog open={confirm === "skip"} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Skip current patient?</AlertDialogTitle>
            <AlertDialogDescription>
              {current ? <>Token <b>#{current.token}</b> — {current.name} will be moved out of the active slot. You can recall them later.</> : "No patient is currently being served."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { skipCurrent(); setConfirm(null); }}>Skip patient</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirm === "noshow"} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as no-show?</AlertDialogTitle>
            <AlertDialogDescription>
              {current ? <>Token <b>#{current.token}</b> — {current.name} will be marked as a no-show. This will be recorded in the audit log.</> : "No patient is currently being served."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { markNoShow(); setConfirm(null); }}>Mark no-show</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
