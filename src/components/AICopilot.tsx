import { useEffect, useMemo, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Sparkles, Send, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore, estimatedWaitMins, patientsAhead, activeDoctor, avgConsultMins } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Msg { role: "user" | "bot"; text: string; }

function roleFromPath(p: string): "patient" | "doctor" | "reception" | "admin" | "general" {
  if (p.startsWith("/patient")) return "patient";
  if (p.startsWith("/doctor")) return "doctor";
  if (p.startsWith("/reception")) return "reception";
  if (p.startsWith("/admin")) return "admin";
  return "general";
}

function answer(q: string, role: ReturnType<typeof roleFromPath>, state: ReturnType<typeof useStore.getState>): string {
  const lower = q.toLowerCase();
  const doc = activeDoctor(state);
  const waiting = state.patients.filter((p) => p.status === "waiting").length;
  const inCons = state.patients.filter((p) => p.status === "in_progress").length;
  const completed = state.patients.filter((p) => p.status === "completed").length;
  const avg = Math.round(avgConsultMins(state));
  const myToken = state.patients.find((p) => p.id === state.myTokenId);

  // Patient
  if (role === "patient" || lower.includes("leave") || lower.includes("eta") || lower.includes("ahead")) {
    if (lower.includes("leave") || lower.includes("when") && lower.includes("home")) {
      if (myToken) {
        const wait = estimatedWaitMins(state, myToken.token);
        const leaveIn = Math.max(0, wait - state.travelTimeMins - 5);
        const leaveAt = new Date(Date.now() + leaveIn * 60000);
        return `Leave home at **${leaveAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}** — that's in ~${leaveIn} mins. With ${state.travelTimeMins} min travel, you'll arrive just before your consultation.`;
      }
      return "Book an appointment first and I'll calculate your ideal leave time based on live queue + travel.";
    }
    if (lower.includes("ahead") || lower.includes("how many")) {
      if (myToken) return `You have **${patientsAhead(state, myToken.token)} patients ahead** of you. Estimated wait: ${estimatedWaitMins(state, myToken.token)} mins.`;
      return "No active token yet. Book one to see your live position.";
    }
    if (lower.includes("eta") || lower.includes("change")) {
      return doc.status === "late"
        ? `Your ETA changed because ${doc.name} is running **+${doc.delayMins} mins late**. The queue rebalances automatically.`
        : `ETA updates live based on patients ahead × avg consult time (currently ${avg} mins). No delays right now.`;
    }
    if (lower.includes("department") || lower.includes("which")) {
      return "For chest pain → **Cardiology**. Joint or bone pain → **Orthopedics**. Skin issues → **Dermatology**. Tell me your symptoms and I'll route you.";
    }
  }

  // Doctor
  if (role === "doctor") {
    if (lower.includes("schedule") || lower.includes("today")) {
      return `Today: **${waiting + inCons + completed} patients**. ${completed} done, ${inCons} in consultation, ${waiting} waiting. Avg consult time: ${avg} mins.`;
    }
    if (lower.includes("high") || lower.includes("risk") || lower.includes("critical")) {
      const high = state.patients.filter((p) => p.priority === "critical" || p.priority === "high");
      return high.length ? `**${high.length} high-priority patients** in queue: ${high.slice(0, 3).map((p) => `#${p.token} ${p.name}`).join(", ")}.` : "No high-risk patients currently flagged.";
    }
    if (lower.includes("average") || lower.includes("avg") || lower.includes("duration")) {
      return `Your average consultation duration is **${avg} minutes** across the last ${state.consultationDurations.length} consults.`;
    }
  }

  // Reception
  if (role === "reception") {
    if (lower.includes("delay") || lower.includes("late")) {
      return doc.status === "late" ? `${doc.name} is +${doc.delayMins} mins late. ${waiting} patients affected.` : "No doctors currently delayed.";
    }
    if (lower.includes("load") || lower.includes("queue")) {
      return `**Queue load:** ${waiting} waiting, ${inCons} in consultation, ${completed} completed. ${waiting > 8 ? "High load." : waiting > 4 ? "Medium load." : "Light load."}`;
    }
  }

  // Admin
  if (role === "admin") {
    if (lower.includes("peak") || lower.includes("hour")) return "Peak hospital hours: **9 AM – 11 AM** and **6 PM – 8 PM**. Evening load is currently rising.";
    if (lower.includes("bottleneck") || lower.includes("department")) return "Top bottleneck: **Cardiology** (42% load). Consider opening a second consultation room from 9–11 AM.";
  }

  // Generic
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) return "Hi! I'm your Upriter copilot. Ask me about queue load, wait times, or what to do next.";
  return `I can help with queue load, wait predictions, and journey planning. Try: "When should I leave home?" or "Show today's schedule".`;
}

const SUGGESTIONS: Record<string, string[]> = {
  patient: ["When should I leave home?", "How many people are ahead?", "Why did my ETA change?", "Which department?"],
  doctor: ["Show today's schedule", "High-risk patients?", "Average consultation time"],
  reception: ["Which patients are delayed?", "Current queue load"],
  admin: ["Peak hospital hours", "Department bottlenecks"],
  general: ["Show queue load", "What can you do?"],
};

export function AICopilot() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const role = roleFromPath(pathname);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "Hi, I'm **Upriter Copilot**. I see queue data in real-time — ask me anything." },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => SUGGESTIONS[role] ?? SUGGESTIONS.general, [role]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const state = useStore.getState();
    const reply = answer(text, role, state);
    setMsgs((m) => [...m, { role: "user", text }, { role: "bot", text: reply }]);
    setInput("");
  };

  return (
    <>
      {/* Floating button */}
      <button
        aria-label="Open Upriter Copilot"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-40 size-14 rounded-2xl bg-gradient-hero shadow-glow grid place-items-center text-white transition-all hover:scale-105 active:scale-95",
          open && "opacity-0 pointer-events-none"
        )}
      >
        <Sparkles className="size-6" />
        <span className="absolute -top-1 -right-1 size-3 rounded-full bg-success border-2 border-background" />
      </button>

      {/* Panel */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[min(92vw,420px)] h-[min(80vh,600px)] rounded-2xl bg-card border border-border shadow-glow flex flex-col overflow-hidden transition-all origin-bottom-right",
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-gradient-hero text-white">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-white/15 grid place-items-center"><Bot className="size-4" /></div>
            <div>
              <div className="font-semibold text-sm">Upriter Copilot</div>
              <div className="text-[10px] opacity-80 uppercase tracking-wider">{role} context</div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="size-8 rounded-lg hover:bg-white/15 grid place-items-center"><X className="size-4" /></button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {msgs.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              )} dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
            </div>
          ))}
        </div>

        <div className="px-3 pt-2 flex flex-wrap gap-1.5 border-t border-border">
          {suggestions.map((s) => (
            <button key={s} onClick={() => send(s)} className="text-[11px] px-2.5 py-1 rounded-full bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition">
              {s}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="p-3 flex gap-2 border-t border-border"
        >
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the copilot…" className="flex-1" />
          <Button type="submit" size="icon" className="shrink-0"><Send className="size-4" /></Button>
        </form>
      </div>
    </>
  );
}
