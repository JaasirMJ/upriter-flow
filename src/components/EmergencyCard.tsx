import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ambulance, Phone, MapPin, Stethoscope, Timer, ShieldAlert } from "lucide-react";
import type { Patient } from "@/lib/store";
import { RISK_META, type RiskLevel } from "@/lib/risk";
import { RiskBadge } from "@/components/PriorityIntake";

export function EmergencyCard({ patient }: { patient: Patient }) {
  const level: RiskLevel = patient.riskLevel ?? "low";
  const isUrgent = level === "critical" || level === "high";
  if (!isUrgent) return null;
  const meta = RISK_META[level];

  return (
    <Card className={`relative overflow-hidden border-2 ${level === "critical" ? "border-destructive/70" : "border-orange-500/60"} p-6 animate-fade-in`}>
      <div className={`absolute inset-0 -z-10 ${level === "critical" ? "bg-destructive/5" : "bg-orange-500/5"}`} />
      {level === "critical" && (
        <div className="absolute top-3 right-3">
          <span className="relative flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex size-3 rounded-full bg-destructive" />
          </span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className={`size-9 rounded-xl grid place-items-center ${level === "critical" ? "bg-destructive text-destructive-foreground" : "bg-orange-500 text-white"}`}>
          <ShieldAlert className="size-5" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">AI Safety Alert</div>
          <h3 className="font-semibold text-lg tracking-tight">{meta.label}</h3>
        </div>
      </div>

      <p className={`mt-4 text-sm font-medium ${level === "critical" ? "text-destructive" : ""}`}>
        {patient.recommendation ?? "Please head to the hospital promptly for review."}
      </p>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <InfoTile icon={Stethoscope} label="Suggested dept" value={patient.suggestedDept ?? "—"} />
        <InfoTile icon={Timer} label="Est. consult" value={`${patient.estDurationMins ?? "—"} min`} />
        <InfoTile icon={ShieldAlert} label="Confidence" value={`${patient.confidence ?? "—"}%`} />
      </div>

      {patient.riskLabels && patient.riskLabels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {patient.riskLabels.map((l) => (
            <Badge key={l} variant="outline" className={`gap-1 ${l.includes("Ambulance") ? "border-destructive/50 text-destructive" : ""}`}>
              {l.includes("Ambulance") && <Ambulance className="size-3" />}
              {l}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Button variant={level === "critical" ? "default" : "outline"} className="gap-2" asChild>
          <a href="tel:108"><Ambulance className="size-4" /> Emergency contact</a>
        </Button>
        <Button variant="outline" className="gap-2" asChild>
          <a href="tel:1066"><Phone className="size-4" /> Hospital helpline</a>
        </Button>
        <Button variant="outline" className="gap-2" asChild>
          <a href="https://www.google.com/maps/search/emergency+room+near+me" target="_blank" rel="noreferrer">
            <MapPin className="size-4" /> Nearest ER
          </a>
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>AI recommendation — pending reception/doctor confirmation.</span>
        <RiskBadge level={level} />
      </div>
    </Card>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/70 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3" /> {label}
      </div>
      <div className="text-sm font-medium mt-0.5 truncate">{value}</div>
    </div>
  );
}
