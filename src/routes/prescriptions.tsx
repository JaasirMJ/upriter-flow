import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/lib/profile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Download, Pill, CalendarClock, Filter } from "lucide-react";
import { useMemo, useState } from "react";
import { format } from "date-fns";

export const Route = createFileRoute("/prescriptions")({
  head: () => ({ meta: [{ title: "Prescriptions — Upriter" }] }),
  component: PrescriptionsPage,
});

function PrescriptionsPage() {
  const prescriptions = useProfile((s) => s.prescriptions);
  const [q, setQ] = useState("");
  const [doctor, setDoctor] = useState<string>("all");

  const doctorOptions = useMemo(() => {
    const s = new Set<string>();
    prescriptions.forEach((p) => s.add(p.doctorName));
    return ["all", ...Array.from(s)];
  }, [prescriptions]);

  const filtered = prescriptions
    .filter((p) => doctor === "all" || p.doctorName === doctor)
    .filter((p) => {
      if (!q) return true;
      const v = q.toLowerCase();
      return p.doctorName.toLowerCase().includes(v) ||
        (p.diagnosis ?? "").toLowerCase().includes(v) ||
        p.medicines.some((m) => m.name.toLowerCase().includes(v));
    });

  return (
    <AppShell title="Prescriptions" subtitle="Your full digital prescription history.">
      <div className="space-y-4 max-w-5xl">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-64">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search medicine, doctor, or diagnosis…" className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-muted-foreground" />
            <select value={doctor} onChange={(e) => setDoctor(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm">
              {doctorOptions.map((d) => <option key={d} value={d}>{d === "all" ? "All doctors" : d}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 && (
          <Card className="p-10 text-center text-muted-foreground">
            <FileText className="size-8 mx-auto mb-2 opacity-50" />
            No prescriptions found.
          </Card>
        )}

        <div className="space-y-3">
          {filtered.map((p) => (
            <Card key={p.id} className="p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    <h3 className="font-semibold">{p.doctorName}</h3>
                    {p.department && <span className="text-xs text-muted-foreground">• {p.department}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(p.date), "PPP")} {p.hospitalName ? `• ${p.hospitalName}` : ""}</p>
                  {p.diagnosis && <p className="text-sm mt-2"><span className="text-muted-foreground">Diagnosis: </span>{p.diagnosis}</p>}
                </div>
                <Button variant="outline" size="sm" onClick={() => printPrescription(p)} className="gap-1.5">
                  <Download className="size-3.5" /> Download PDF
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                {p.medicines.map((m, i) => (
                  <div key={i} className="flex items-start gap-3 px-3 py-2 rounded-lg bg-muted/40">
                    <Pill className="size-4 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{m.name}</div>
                      <div className="text-xs text-muted-foreground">{m.dosage}{m.duration ? ` • ${m.duration}` : ""}</div>
                      {m.notes && <div className="text-[11px] text-muted-foreground mt-0.5">{m.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
              {p.instructions && (
                <p className="mt-3 text-xs text-muted-foreground border-l-2 border-primary/40 pl-3">{p.instructions}</p>
              )}
              {p.followUpDate && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  <CalendarClock className="size-3" /> Follow-up {format(new Date(p.followUpDate), "PPP")}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function printPrescription(p: any) {
  const w = window.open("", "_blank", "width=720,height=900");
  if (!w) return;
  const meds = p.medicines.map((m: any) => `<li><b>${escapeHtml(m.name)}</b> — ${escapeHtml(m.dosage)}${m.duration ? ` · ${escapeHtml(m.duration)}` : ""}${m.notes ? `<br/><span style="color:#666;font-size:12px">${escapeHtml(m.notes)}</span>` : ""}</li>`).join("");
  w.document.write(`<!doctype html><html><head><title>Prescription — ${escapeHtml(p.doctorName)}</title>
    <style>body{font-family:system-ui,-apple-system,sans-serif;max-width:680px;margin:40px auto;padding:0 32px;color:#111}
    h1{margin:0;font-size:22px}.muted{color:#666}.brand{display:flex;align-items:center;gap:10px;border-bottom:2px solid #0d9488;padding-bottom:12px;margin-bottom:24px}
    .logo{width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,#14b8a6,#3b82f6);color:#fff;display:grid;place-items:center;font-weight:700}
    .row{display:flex;justify-content:space-between;gap:24px;margin-bottom:16px;font-size:13px}
    ul{padding-left:20px;line-height:1.7}.fu{margin-top:24px;padding:12px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;font-size:13px}
    .sig{margin-top:48px;text-align:right;font-size:13px;color:#444}</style></head><body>
    <div class="brand"><div class="logo">U</div><div><h1>Upriter</h1><div class="muted" style="font-size:11px">Digital Prescription</div></div></div>
    <div class="row"><div><b>${escapeHtml(p.doctorName)}</b><br/><span class="muted">${escapeHtml(p.department ?? "")} ${p.hospitalName ? "· " + escapeHtml(p.hospitalName) : ""}</span></div>
    <div style="text-align:right"><span class="muted">Date:</span> ${new Date(p.date).toLocaleDateString()}</div></div>
    ${p.diagnosis ? `<div class="row"><div><b>Diagnosis:</b> ${escapeHtml(p.diagnosis)}</div></div>` : ""}
    <h3 style="margin-top:24px">Medication</h3><ul>${meds}</ul>
    ${p.instructions ? `<h3 style="margin-top:24px">Instructions</h3><p>${escapeHtml(p.instructions)}</p>` : ""}
    ${p.followUpDate ? `<div class="fu"><b>Follow-up:</b> ${new Date(p.followUpDate).toLocaleDateString()}</div>` : ""}
    <div class="sig">— ${escapeHtml(p.doctorName)}<br/>Digitally signed via Upriter</div>
    <script>window.print()</script></body></html>`);
  w.document.close();
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
