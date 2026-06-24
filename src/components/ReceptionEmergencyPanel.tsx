import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { RiskBadge } from "@/components/PriorityIntake";
import { Check, Zap, Phone, UserCog, X, ShieldAlert, Ambulance } from "lucide-react";
import { toast } from "sonner";
import type { ReviewStatus } from "@/lib/risk";

const STATUS_META: Record<ReviewStatus, { label: string; cls: string }> = {
  pending: { label: "Pending review", cls: "bg-warning/15 text-warning-foreground border-warning/30" },
  approved: { label: "Approved", cls: "bg-success/10 text-success border-success/30" },
  fast_track: { label: "Fast-tracked", cls: "bg-primary/10 text-primary border-primary/30" },
  doctor_review: { label: "Doctor review", cls: "bg-accent text-accent-foreground" },
  rejected: { label: "Rejected", cls: "bg-muted text-muted-foreground border-border" },
};

export function ReceptionEmergencyPanel() {
  const { patients, setReviewStatus, setPatientPriority } = useStore();

  const urgent = patients.filter(
    (p) => (p.riskLevel === "critical" || p.riskLevel === "high") && p.status !== "completed"
  );

  return (
    <Card className="p-5 border-2 border-destructive/30 bg-destructive/[0.02]">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-destructive/10 text-destructive grid place-items-center">
            <ShieldAlert className="size-4" />
          </div>
          <div>
            <h3 className="font-semibold tracking-tight">Emergency Review Panel</h3>
            <p className="text-[11px] text-muted-foreground">Human-in-the-loop verification — AI decisions are never final.</p>
          </div>
        </div>
        <Badge variant="outline" className="border-destructive/30 text-destructive">
          {urgent.length} alert{urgent.length === 1 ? "" : "s"}
        </Badge>
      </div>

      {urgent.length === 0 ? (
        <div className="mt-6 py-8 text-center text-sm text-muted-foreground">
          No emergency alerts. Queue is calm.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-2 pr-3">Patient</th>
                <th className="py-2 pr-3">Symptoms</th>
                <th className="py-2 pr-3">Risk</th>
                <th className="py-2 pr-3">Suggested dept</th>
                <th className="py-2 pr-3">Review</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {urgent.map((p) => {
                const status = p.reviewStatus ?? "pending";
                return (
                  <tr key={p.id} className="border-b border-border/60 last:border-0 align-top">
                    <td className="py-3 pr-3">
                      <div className="font-medium">#{p.token} · {p.name}</div>
                      <div className="text-[11px] text-muted-foreground">{p.age}y · {p.phone}</div>
                      {p.riskLabels && p.riskLabels.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {p.riskLabels.slice(0, 2).map((l) => (
                            <span key={l} className={`text-[10px] px-1.5 py-0.5 rounded border ${l.includes("Ambulance") ? "border-destructive/40 text-destructive" : "border-border text-muted-foreground"}`}>
                              {l.includes("Ambulance") && <Ambulance className="inline size-2.5 mr-0.5" />}
                              {l}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-3 max-w-[220px]">
                      <div className="text-xs text-muted-foreground line-clamp-3">{p.symptoms ?? "—"}</div>
                    </td>
                    <td className="py-3 pr-3">
                      <RiskBadge level={p.riskLevel ?? "medium"} />
                      <div className="text-[10px] text-muted-foreground mt-1">{p.confidence ?? "—"}% conf.</div>
                    </td>
                    <td className="py-3 pr-3 text-xs">{p.suggestedDept ?? "—"}</td>
                    <td className="py-3 pr-3">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border ${STATUS_META[status].cls}`}>
                        {STATUS_META[status].label}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex flex-wrap gap-1 justify-end">
                        <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]" onClick={() => { setReviewStatus(p.id, "approved"); setPatientPriority(p.id, p.riskLevel === "critical" ? "critical" : "high"); }}>
                          <Check className="size-3" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]" onClick={() => { setReviewStatus(p.id, "fast_track"); setPatientPriority(p.id, "critical"); }}>
                          <Zap className="size-3" /> Fast track
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]" onClick={() => toast.success(`Calling ${p.name}…`)}>
                          <Phone className="size-3" /> Contact
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]" onClick={() => setReviewStatus(p.id, "doctor_review")}>
                          <UserCog className="size-3" /> Doctor
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 gap-1 text-[11px] text-muted-foreground" onClick={() => { setReviewStatus(p.id, "rejected"); setPatientPriority(p.id, "regular"); }}>
                          <X className="size-3" /> Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
