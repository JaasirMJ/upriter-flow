import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldAlert, Activity, FileUp, Sparkles, Ambulance, HeartPulse } from "lucide-react";
import { useState } from "react";
import type { Priority } from "@/lib/store";

interface AIResult {
  priority: Priority;
  label: string;
  reasons: string[];
}

const CRITICAL_KW = ["chest pain", "breath", "unconscious", "bleeding heavy", "stroke", "seizure", "cardiac"];
const HIGH_KW = ["fever 104", "severe pain", "vomit", "blood", "fracture", "diabet", "hypertens", "pregnan"];
const LOW_KW = ["checkup", "follow", "routine", "vaccination", "report"];

export function PriorityIntake({ onAccept }: { onAccept: (r: AIResult & { symptoms: string }) => void }) {
  const [symptoms, setSymptoms] = useState("");
  const [history, setHistory] = useState("");
  const [result, setResult] = useState<AIResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const analyze = () => {
    const text = (symptoms + " " + history).toLowerCase();
    setAnalyzing(true);
    setTimeout(() => {
      let priority: Priority = "regular";
      let label = "Standard consultation";
      const reasons: string[] = [];

      if (CRITICAL_KW.some((k) => text.includes(k))) {
        priority = "critical";
        label = "Emergency Attention Needed";
        reasons.push("Detected critical symptom keywords");
        reasons.push("Ambulance recommendation suggested");
      } else if (HIGH_KW.some((k) => text.includes(k))) {
        priority = "high";
        label = "ICU Review Suggested";
        reasons.push("High-risk indicators present");
        reasons.push("Recommend triage within 15 min");
      } else if (LOW_KW.some((k) => text.includes(k))) {
        priority = "routine";
        label = "Routine visit";
        reasons.push("Routine / follow-up keywords detected");
      } else {
        reasons.push("No critical markers detected");
        reasons.push("Standard queue placement");
      }
      setResult({ priority, label, reasons });
      setAnalyzing(false);
    }, 700);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-lg bg-gradient-hero grid place-items-center"><HeartPulse className="size-4 text-white" /></div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight">AI Priority Triage</h3>
          <p className="text-xs text-muted-foreground">Recommendation only — final approval rests with doctors and reception.</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <Label className="text-xs">Describe your symptoms</Label>
          <Textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="e.g. Severe chest pain since 1 hour, shortness of breath…" className="mt-1.5 min-h-20" />
        </div>
        <div>
          <Label className="text-xs">Medical history (optional)</Label>
          <Textarea value={history} onChange={(e) => setHistory(e.target.value)} placeholder="Diabetes, hypertension, allergies…" className="mt-1.5 min-h-16" />
        </div>
        <button className="text-xs text-muted-foreground inline-flex items-center gap-1.5 hover:text-foreground">
          <FileUp className="size-3.5" /> Attach reports (PDF / image)
        </button>
      </div>

      <Button onClick={analyze} disabled={!symptoms || analyzing} className="mt-4 w-full gap-2">
        <Sparkles className="size-4" />
        {analyzing ? "Analyzing…" : "Run AI triage"}
      </Button>

      {result && (
        <div className="mt-5 p-4 rounded-xl border border-border bg-card animate-fade-in">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={result.priority} />
            <span className="text-sm font-medium">{result.label}</span>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {result.reasons.map((r, i) => <li key={i} className="flex items-start gap-2"><span className="size-1 rounded-full bg-primary mt-2" />{r}</li>)}
          </ul>
          {result.priority === "critical" && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
              <Ambulance className="size-4" /> Ambulance dispatch recommended. Call hospital directly.
            </div>
          )}
          <div className="mt-3 p-2.5 rounded-lg bg-muted/60 text-[11px] text-muted-foreground">
            ⓘ AI recommendation only. Reception staff and doctors will review and confirm.
          </div>
          <Button onClick={() => onAccept({ ...result, symptoms })} className="mt-4 w-full" variant="outline">
            Accept and continue booking
          </Button>
        </div>
      )}
    </Card>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map = {
    critical: { label: "Critical", cls: "bg-destructive text-destructive-foreground", Icon: ShieldAlert },
    high: { label: "High risk", cls: "bg-warning text-warning-foreground", Icon: AlertTriangle },
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
