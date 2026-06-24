import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldAlert, Activity, FileUp, Sparkles, Ambulance, HeartPulse, Stethoscope, Timer, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import type { Priority } from "@/lib/store";
import { assessRisk, RISK_META, type RiskAssessment, type RiskLevel } from "@/lib/risk";

export interface IntakeResult {
  priority: Priority;
  symptoms: string;
  history: string;
  assessment: RiskAssessment;
}

export function PriorityIntake({ age, onAccept }: { age?: number; onAccept: (r: IntakeResult) => void }) {
  const [symptoms, setSymptoms] = useState("");
  const [history, setHistory] = useState("");
  const [pregnant, setPregnant] = useState(false);
  const [result, setResult] = useState<RiskAssessment | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const analyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      const a = assessRisk({ symptoms, history, age, pregnant });
      setResult(a);
      setAnalyzing(false);
    }, 700);
  };

  const accept = () => {
    if (!result) return;
    const priority: Priority =
      result.riskLevel === "critical" ? "critical" :
      result.riskLevel === "high" ? "high" :
      result.riskLevel === "low" ? "routine" : "regular";
    onAccept({ priority, symptoms, history, assessment: result });
  };

  const examples = [
    "Chest pain + shortness of breath",
    "High fever for 3 days",
    "Routine diabetes follow-up",
    "Pregnant — severe abdominal pain",
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-lg bg-gradient-hero grid place-items-center"><HeartPulse className="size-4 text-white" /></div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight">AI Risk Assessment</h3>
          <p className="text-xs text-muted-foreground">Recommendation only — reviewed by reception staff and doctors.</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <Label className="text-xs">Describe your symptoms</Label>
          <Textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="e.g. Severe chest pain since 1 hour, shortness of breath…" className="mt-1.5 min-h-20" />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {examples.map((ex) => (
              <button key={ex} type="button" onClick={() => setSymptoms(ex)} className="text-[11px] px-2 py-1 rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition">
                {ex}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs">Medical history & existing conditions (optional)</Label>
          <Textarea value={history} onChange={(e) => setHistory(e.target.value)} placeholder="Diabetes, hypertension, allergies, medications…" className="mt-1.5 min-h-16" />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={pregnant} onChange={(e) => setPregnant(e.target.checked)} className="rounded" />
            Currently pregnant
          </label>
          <button type="button" className="text-xs text-muted-foreground inline-flex items-center gap-1.5 hover:text-foreground">
            <FileUp className="size-3.5" /> Attach reports
          </button>
        </div>
      </div>

      <Button onClick={analyze} disabled={!symptoms || analyzing} className="mt-4 w-full gap-2">
        <Sparkles className="size-4" />
        {analyzing ? "Analyzing symptoms…" : "Run AI risk assessment"}
      </Button>

      {result && <AssessmentCard a={result} onAccept={accept} />}
    </Card>
  );
}

function AssessmentCard({ a, onAccept }: { a: RiskAssessment; onAccept: () => void }) {
  const meta = RISK_META[a.riskLevel];
  const critical = a.riskLevel === "critical";

  return (
    <div className={`mt-5 p-4 rounded-xl border-2 animate-fade-in ${critical ? "border-destructive/60 bg-destructive/5 animate-pulse-ring" : "border-border bg-card"}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <RiskBadge level={a.riskLevel} />
        <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
          <span className={`size-1.5 rounded-full ${meta.dot}`} /> AI confidence {a.confidence}%
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <Field icon={Stethoscope} label="Suggested dept" value={a.suggestedDept} />
        <Field icon={Timer} label="Est. consult" value={`${a.estDurationMins} min`} />
      </div>

      <p className={`mt-3 text-sm font-medium ${critical ? "text-destructive" : ""}`}>
        {a.recommendation}
      </p>

      {a.labels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {a.labels.map((l) => (
            <Badge key={l} variant="outline" className={`gap-1 ${l.includes("Ambulance") ? "border-destructive/50 text-destructive" : l.includes("Pregnancy") ? "border-pink-500/50 text-pink-600 dark:text-pink-300" : l.includes("Senior") ? "border-amber-500/50 text-amber-600 dark:text-amber-300" : l.includes("Child") ? "border-blue-500/50 text-blue-600 dark:text-blue-300" : "border-border"}`}>
              {l.includes("Ambulance") && <Ambulance className="size-3" />}
              {l}
            </Badge>
          ))}
        </div>
      )}

      <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
        {a.reasons.map((r, i) => <li key={i} className="flex items-start gap-2"><span className="size-1 rounded-full bg-primary mt-1.5" />{r}</li>)}
      </ul>

      <div className="mt-3 p-2.5 rounded-lg bg-muted/60 text-[11px] text-muted-foreground flex items-start gap-1.5">
        <ShieldAlert className="size-3.5 mt-0.5 shrink-0" />
        AI never diagnoses or dispatches ambulances. Reception and doctors must confirm.
      </div>

      <Button onClick={onAccept} className="mt-4 w-full gap-2" variant={critical ? "default" : "outline"}>
        <CheckCircle2 className="size-4" /> Accept and continue booking
      </Button>
    </div>
  );
}

function Field({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/60 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3" /> {label}
      </div>
      <div className="text-sm font-medium mt-0.5">{value}</div>
    </div>
  );
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const meta = RISK_META[level];
  const Icon = level === "critical" ? ShieldAlert : level === "high" ? AlertTriangle : level === "medium" ? Activity : CheckCircle2;
  return (
    <Badge className={`gap-1 border ${meta.cls}`}>
      <Icon className="size-3" /> {meta.label}
    </Badge>
  );
}

// Legacy: keep PriorityBadge export used elsewhere
export function PriorityBadge({ priority }: { priority: Priority }) {
  const map = {
    critical: { label: "Critical", cls: "bg-destructive text-destructive-foreground", Icon: ShieldAlert },
    high: { label: "High risk", cls: "bg-orange-500 text-white", Icon: AlertTriangle },
    regular: { label: "Regular", cls: "bg-primary/10 text-primary border border-primary/30", Icon: Activity },
    routine: { label: "Routine", cls: "bg-muted text-muted-foreground", Icon: Activity },
  } as const;
  const { label, cls, Icon } = map[priority];
  return (
    <Badge className={`gap-1 ${cls}`}>
      <Icon className="size-3" /> {label}
    </Badge>
  );
}
