import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, Ambulance, HeartPulse, Flame, Droplet, Activity, Bone, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/first-aid")({
  head: () => ({ meta: [{ title: "First Aid — Upriter" }] }),
  component: FirstAidPage,
});

interface AidItem {
  id: string;
  title: string;
  icon: typeof HeartPulse;
  tone: string;
  steps: string[];
  caution?: string;
}

const ITEMS: AidItem[] = [
  {
    id: "chest-pain",
    title: "Chest Pain",
    icon: HeartPulse,
    tone: "from-destructive/20 to-destructive/5 border-destructive/30",
    steps: [
      "Sit down, loosen tight clothing, stay calm.",
      "Chew (don't swallow) 1 adult aspirin (300mg) if not allergic.",
      "Note symptoms: sweating, nausea, pain radiating to arm/jaw.",
      "Call emergency services (108) immediately.",
      "If unconscious and not breathing — start CPR (30 compressions : 2 breaths).",
    ],
    caution: "Heart attack symptoms can be subtle — do not drive yourself.",
  },
  {
    id: "burn",
    title: "Burn Injury",
    icon: Flame,
    tone: "from-orange-500/20 to-orange-500/5 border-orange-500/30",
    steps: [
      "Move away from the heat source.",
      "Cool the burn under cool (not cold) running water for 20 minutes.",
      "Remove jewellery/loose clothing around the area (not stuck fabric).",
      "Cover loosely with clean cling film or non-stick dressing.",
      "Do not apply butter, oil, ice or toothpaste.",
    ],
    caution: "Seek hospital care for burns larger than your palm, on face/hands/joints, or deep burns.",
  },
  {
    id: "bleeding",
    title: "Severe Bleeding",
    icon: Droplet,
    tone: "from-rose-500/20 to-rose-500/5 border-rose-500/30",
    steps: [
      "Apply firm, direct pressure with a clean cloth.",
      "Raise the injured part above heart level if possible.",
      "Do not remove embedded objects — pad around them.",
      "Add layers if blood soaks through; keep pressing.",
      "Call 108 if bleeding does not stop within 10 minutes.",
    ],
  },
  {
    id: "stroke",
    title: "Stroke Symptoms",
    icon: Activity,
    tone: "from-purple-500/20 to-purple-500/5 border-purple-500/30",
    steps: [
      "Use FAST: Face droop, Arm weakness, Speech slurred, Time to call 108.",
      "Note the time symptoms started — critical for treatment.",
      "Lay the person on their side, head slightly raised.",
      "Do not give food or water.",
      "Stay with them until emergency arrives.",
    ],
    caution: "Every minute counts — treatment window is short.",
  },
  {
    id: "fracture",
    title: "Fractures",
    icon: Bone,
    tone: "from-amber-500/20 to-amber-500/5 border-amber-500/30",
    steps: [
      "Do not move the injured limb unnecessarily.",
      "Immobilize using a splint or rolled-up newspaper/cloth.",
      "Apply a cold pack wrapped in cloth — 15-minute intervals.",
      "Watch for shock: pale skin, rapid breathing.",
      "Transport to the nearest orthopedic emergency.",
    ],
  },
];

function FirstAidPage() {
  return (
    <AppShell title="Emergency First Aid" subtitle="Quick steps to take while help is on the way.">
      <div className="space-y-5">
        <Card className="p-4 border-destructive/40 bg-destructive/5 flex items-center gap-3 flex-wrap">
          <AlertTriangle className="size-5 text-destructive shrink-0" />
          <p className="text-sm flex-1 min-w-[16rem]">
            For informational purposes only. <strong>Please seek medical assistance immediately.</strong>
          </p>
          <a href="tel:108"><Button variant="destructive" className="gap-2"><Phone className="size-4" /> Call 108</Button></a>
          <a href="tel:102"><Button variant="outline" className="gap-2"><Ambulance className="size-4" /> Ambulance 102</Button></a>
        </Card>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.id} className={`p-5 bg-gradient-to-br ${item.tone}`}>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-background grid place-items-center"><Icon className="size-5" /></div>
                  <h3 className="font-semibold tracking-tight">{item.title}</h3>
                </div>
                <ol className="mt-4 space-y-2 text-sm">
                  {item.steps.map((s, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="shrink-0 size-5 grid place-items-center rounded-full bg-background text-[10px] font-semibold border border-border">{i + 1}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
                {item.caution && (
                  <div className="mt-3 text-[11px] flex items-start gap-1.5 text-muted-foreground">
                    <ShieldAlert className="size-3 mt-0.5 shrink-0" />
                    <span>{item.caution}</span>
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <a href="tel:108" className="flex-1"><Button size="sm" variant="destructive" className="w-full gap-1.5"><Phone className="size-3.5" /> Emergency</Button></a>
                  <a href="/hospitals" className="flex-1"><Button size="sm" variant="outline" className="w-full">Nearest ER</Button></a>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
