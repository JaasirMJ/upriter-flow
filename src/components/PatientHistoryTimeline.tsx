import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Pill, AlertTriangle, Stethoscope } from "lucide-react";

const HISTORY = [
  { date: "2026-04-12", type: "visit", title: "Cardiology — Dr. Anjali Sharma", note: "BP 132/86 • Stable. Continue medication.", icon: Stethoscope },
  { date: "2026-02-03", type: "report", title: "Lipid panel + ECG", note: "Mild LDL elevation. ECG normal.", icon: FileText },
  { date: "2025-11-21", type: "visit", title: "Orthopedics — Dr. Rohan Mehta", note: "Knee MRI clean. Physio recommended.", icon: Stethoscope },
  { date: "2025-08-09", type: "rx", title: "Atorvastatin 10mg", note: "Once daily, evening.", icon: Pill },
];

const ALLERGIES = ["Penicillin", "Peanuts"];
const CONDITIONS = ["Hypertension (controlled)", "Type 2 diabetes"];

export function PatientHistoryTimeline() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold tracking-tight">Your health timeline</h3>
          <p className="text-xs text-muted-foreground">Past visits, reports and prescriptions</p>
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl p-3 bg-destructive/5 border border-destructive/20">
          <div className="flex items-center gap-2 text-xs font-medium text-destructive"><AlertTriangle className="size-3.5" /> Allergies</div>
          <div className="mt-2 flex flex-wrap gap-1">{ALLERGIES.map((a) => <Badge key={a} variant="destructive" className="text-[10px]">{a}</Badge>)}</div>
        </div>
        <div className="rounded-xl p-3 bg-warning/10 border border-warning/30">
          <div className="text-xs font-medium text-warning-foreground">Active conditions</div>
          <div className="mt-2 flex flex-wrap gap-1">{CONDITIONS.map((c) => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}</div>
        </div>
      </div>

      <ol className="mt-5 relative">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
        {HISTORY.map((h, i) => {
          const Icon = h.icon;
          return (
            <li key={i} className="relative pl-11 pb-4 last:pb-0">
              <div className="absolute left-0 top-0 size-8 rounded-lg bg-accent text-accent-foreground grid place-items-center">
                <Icon className="size-4" />
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-medium text-sm">{h.title}</div>
                <div className="text-[11px] text-muted-foreground whitespace-nowrap">{h.date}</div>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{h.note}</div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
