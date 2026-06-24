import { useEffect, useMemo, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Sparkles, Send, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore, estimatedWaitMins, patientsAhead, activeDoctor, avgConsultMins } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Msg { role: "user" | "bot"; text: string; }

type Role = "patient" | "doctor" | "reception" | "admin" | "general";

function roleFromPath(p: string): Role {
  if (p.startsWith("/patient") || p.startsWith("/journey") || p.startsWith("/book") || p.startsWith("/hospitals") || p.startsWith("/doctors") || p.startsWith("/reports") || p.startsWith("/history") || p.startsWith("/first-aid")) return "patient";
  if (p.startsWith("/doctor")) return "doctor";
  if (p.startsWith("/reception")) return "reception";
  if (p.startsWith("/admin")) return "admin";
  return "general";
}

const fmtTime = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function answer(q: string, role: Role, state: ReturnType<typeof useStore.getState>): string {
  const lower = q.toLowerCase();
  const doc = activeDoctor(state);
  const waiting = state.patients.filter((p) => p.status === "waiting").length;
  const inCons = state.patients.filter((p) => p.status === "in_progress").length;
  const completed = state.patients.filter((p) => p.status === "completed").length;
  const avg = Math.round(avgConsultMins(state));
  const myToken = state.patients.find((p) => p.id === state.myTokenId);
  const now = new Date();

  // ---------- PATIENT ----------
  if (role === "patient") {
    // 1. When should I leave home?
    if (lower.includes("leave") || (lower.includes("when") && lower.includes("home"))) {
      if (!myToken) return "Book an appointment first and I'll calculate the perfect leave-home time based on live queue + traffic.";
      const wait = estimatedWaitMins(state, myToken.token);
      const travel = state.travelTimeMins;
      const buffer = 8;
      const leaveAt = new Date(now.getTime() + Math.max(0, (wait - travel - buffer)) * 60000);
      const reachAt = new Date(leaveAt.getTime() + travel * 60000);
      const consultAt = new Date(reachAt.getTime() + buffer * 60000);
      const saved = Math.max(20, 90 - wait);
      return [
        `Based on current queue movement and traffic, you should leave home at **${fmtTime(leaveAt)}**.`,
        ``,
        `🚗 Travel Time: ${travel} mins`,
        `🏥 Reach Hospital: ${fmtTime(reachAt)}`,
        `👨‍⚕️ Expected Consultation: ${fmtTime(consultAt)}`,
        `⏱ Estimated Waiting Inside Hospital: ${buffer} mins`,
        ``,
        `🎉 You'll save approximately **${saved} minutes** compared to the average wait.`,
      ].join("\n");
    }

    // 2. Why did my ETA change?
    if (lower.includes("eta") || lower.includes("change") || lower.includes("delay")) {
      if (doc.status === "late" && myToken) {
        const wait = estimatedWaitMins(state, myToken.token);
        const newTime = new Date(now.getTime() + wait * 60000);
        return [
          `${doc.name} is currently delayed by **${doc.delayMins} minutes** due to an extended consultation.`,
          ``,
          `Your new consultation time is **${fmtTime(newTime)}**.`,
          ``,
          `No action needed — I'll keep monitoring your queue automatically.`,
        ].join("\n");
      }
      return `ETA updates live based on patients ahead × avg consult time (currently ${avg} mins). No delays right now.`;
    }

    // 3. How many people are ahead of me?
    if (lower.includes("ahead") || lower.includes("how many") || lower.includes("position")) {
      if (!myToken) return "No active token yet. Book one to see your live queue position.";
      const ahead = patientsAhead(state, myToken.token);
      const wait = estimatedWaitMins(state, myToken.token);
      return [
        `There are currently **${ahead} patients** ahead of you.`,
        ``,
        `Current token being served: **${state.currentToken}**`,
        `Your token: **${myToken.token}**`,
        `Estimated waiting time: **${wait} minutes**`,
      ].join("\n");
    }

    // 6. Which doctor should I book? (department routing)
    if (lower.includes("department") || lower.includes("which doctor") || lower.includes("which dept") || lower.includes("book") || lower.includes("allergy") || lower.includes("skin") || lower.includes("rash")) {
      if (lower.includes("skin") || lower.includes("allergy") || lower.includes("rash")) {
        return [
          `Based on your concern, **Dermatology** may be appropriate.`,
          ``,
          `Available doctors:`,
          `• Dr. Saara`,
          `• Dr. Sanah`,
          ``,
          `Earliest slot available: **4:30 PM**.`,
        ].join("\n");
      }
      if (lower.includes("chest") || lower.includes("heart")) return "Chest concerns → **Cardiology**. Dr. Sameeha has the earliest slot today.";
      if (lower.includes("bone") || lower.includes("joint") || lower.includes("fracture")) return "Bone/joint concerns → **Orthopedics**. Dr. Rohan Mehta has openings this evening.";
      return "Share your symptoms and I'll suggest the right department and doctor.";
    }

    // 7. Nearby hospitals
    if (lower.includes("nearby") || lower.includes("near me") || lower.includes("hospital")) {
      return [
        `Hospitals near your location:`,
        ``,
        `🏥 **SSS Hospital** — 3.1 km`,
        `   Current crowd level: Medium`,
        `   Average wait: 21 mins`,
        ``,
        `🏥 **Apollo Hospital** — 5.2 km`,
        `   Current crowd level: High`,
        `   Average wait: 48 mins`,
      ].join("\n");
    }

    // 8. Emergency detection
    if (lower.includes("chest pain") || (lower.includes("breath") && (lower.includes("difficult") || lower.includes("short"))) || lower.includes("unconscious") || lower.includes("stroke")) {
      return [
        `⚠️ **Potential emergency detected.**`,
        ``,
        `Recommendation: Seek immediate medical attention.`,
        `Suggested Department: **Cardiology**`,
        `Priority: **Critical Review Required**`,
        ``,
        `Ambulance recommendation available for staff review.`,
        ``,
        `_This is an AI recommendation only and not a medical diagnosis._`,
      ].join("\n");
    }

    // 9. First aid
    if (lower.includes("burn")) {
      return [
        `**Immediate First Aid — Burn:**`,
        `• Run cool water over the affected area for 10–20 minutes.`,
        `• Remove rings or tight items.`,
        `• Do not apply ice directly.`,
        `• Seek medical attention if severe.`,
        ``,
        `_This information does not replace professional medical care._`,
      ].join("\n");
    }
    if (lower.includes("bleed")) {
      return [
        `**Immediate First Aid — Bleeding:**`,
        `• Apply firm pressure with a clean cloth.`,
        `• Elevate the injured area above heart level.`,
        `• Do not remove embedded objects.`,
        `• Call emergency services if bleeding doesn't stop in 10 mins.`,
        ``,
        `_This information does not replace professional medical care._`,
      ].join("\n");
    }

    // 10. Reminder
    if (lower.includes("remind") || lower.includes("appointment")) {
      if (!myToken) return "No upcoming appointments. Book one and I'll set smart reminders for you.";
      const wait = estimatedWaitMins(state, myToken.token);
      const leaveAt = new Date(now.getTime() + Math.max(0, wait - state.travelTimeMins - 8) * 60000);
      return [
        `**Reminder:**`,
        ``,
        `Appointment with ${doc.name}`,
        `Department: ${doc.specialty}`,
        `Token: **${myToken.token}**`,
        `Suggested departure time: **${fmtTime(leaveAt)}**`,
      ].join("\n");
    }

    // Emotional
    if (lower.includes("scared") || lower.includes("nervous") || lower.includes("anxious") || lower.includes("worried")) {
      return [
        `That's completely understandable.`,
        ``,
        `Your appointment is confirmed and you're on schedule. I'll keep tracking your queue and notify you of any changes so you can focus on your visit.`,
      ].join("\n");
    }
    if (lower.includes("don't understand") || lower.includes("confused") || lower.includes("token")) {
      if (myToken) {
        const ahead = patientsAhead(state, myToken.token);
        return `No worries. You're currently number **${ahead + 1}** in line.\n\nI'll notify you when it's almost your turn.`;
      }
    }
  }

  // ---------- DOCTOR ----------
  if (role === "doctor") {
    if (lower.includes("today") || lower.includes("overview") || lower.includes("summary") || lower.includes("schedule")) {
      const scheduled = waiting + inCons + completed;
      const remaining = waiting + inCons;
      const high = state.patients.filter((p) => p.priority === "critical" || p.priority === "high" || p.riskLevel === "critical" || p.riskLevel === "high").length;
      return [
        `Good afternoon ${doc.name}.`,
        ``,
        `Patients Scheduled: **${scheduled}**`,
        `Completed: **${completed}**`,
        `Remaining: **${remaining}**`,
        `Average Consultation Time: **${avg} mins**`,
        `High-Risk Patients: **${high}**`,
      ].join("\n");
    }
    if (lower.includes("high") || lower.includes("risk") || lower.includes("critical") || lower.includes("priority")) {
      const flagged = state.patients.filter((p) => p.priority === "critical" || p.priority === "high" || p.riskLevel === "critical" || p.riskLevel === "high");
      if (!flagged.length) return "No high-risk patients currently flagged.";
      const lines = flagged.slice(0, 5).map((p) => {
        const label = p.riskLabels?.[0] ?? (p.priority === "critical" ? "Critical Review Required" : "High Priority");
        return `Token ${p.token} — ${label}`;
      });
      return [`**Priority Patients:**`, ``, ...lines].join("\n");
    }
    if (lower.includes("average") || lower.includes("avg") || lower.includes("duration")) {
      return `Your average consultation duration is **${avg} minutes** across the last ${state.consultationDurations.length} consults.`;
    }
  }

  // ---------- RECEPTION ----------
  if (role === "reception") {
    if (lower.includes("load") || lower.includes("queue") || lower.includes("current")) {
      const upcoming = state.patients.filter((p) => p.status === "waiting" && p.appointmentTime).length;
      return [
        `Waiting Patients: **${waiting}**`,
        `In Consultation: **${inCons}**`,
        `Upcoming Appointments: **${upcoming}**`,
        ``,
        `Peak load expected between **9–11 AM**.`,
      ].join("\n");
    }
    if (lower.includes("fast") || lower.includes("track") || lower.includes("recommend")) {
      const flagged = state.patients.find((p) => (p.riskLevel === "high" || p.riskLevel === "critical") && p.reviewStatus === "pending");
      if (!flagged) return "No pending fast-track recommendations right now.";
      return [
        `Patient **${flagged.name}** has been flagged as **High Risk**.`,
        ``,
        `Recommendation:`,
        `Fast-track review suggested.`,
        ``,
        `Awaiting reception approval.`,
      ].join("\n");
    }
    if (lower.includes("delay") || lower.includes("late")) {
      return doc.status === "late" ? `${doc.name} is +${doc.delayMins} mins late. ${waiting} patients affected.` : "No doctors currently delayed.";
    }
  }

  // ---------- ADMIN ----------
  if (role === "admin") {
    if (lower.includes("analytic") || lower.includes("today") || lower.includes("insight") || lower.includes("overview")) {
      const total = state.patients.length;
      return [
        `Total Patients: **${total}**`,
        `Average Waiting Time: **${Math.round(avg * 1.4)} mins**`,
        `Average Consultation Time: **${avg} mins**`,
        `Most Busy Department: **General Medicine**`,
        `Peak Hour: **10 AM – 12 PM**`,
      ].join("\n");
    }
    if (lower.includes("peak") || lower.includes("hour")) return "Peak hospital hours: **9 AM – 11 AM** and **6 PM – 8 PM**.";
    if (lower.includes("bottleneck") || lower.includes("department")) return "Top bottleneck: **Cardiology** (42% load). Consider opening a second consultation room from 9–11 AM.";
  }

  // Generic
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) return "Hi! I'm your Upriter copilot. Ask me about queue load, wait times, or what to do next.";
  return `I can help with queue load, wait predictions, and journey planning. Try: "When should I leave home?" or "Show today's overview".`;
}

const SUGGESTIONS: Record<Role, string[]> = {
  patient: ["When should I leave home?", "How many are ahead of me?", "Why did my ETA change?", "I have skin allergies"],
  doctor: ["Show today's overview", "High-risk patients", "Average consultation time"],
  reception: ["Current load", "Fast-track recommendations", "Any delays?"],
  admin: ["Today's analytics", "Peak hours", "Department bottlenecks"],
  general: ["What can you do?"],
};

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

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
      <button
        aria-label="Open Upriter Copilot"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-40 size-14 rounded-2xl bg-gradient-hero shadow-glow grid place-items-center text-white transition-all hover:scale-105 active:scale-95",
          open && "opacity-0 pointer-events-none"
        )}
      >
        <Sparkles className="size-6" />
        <span className="absolute -top-1 -right-1 size-3 rounded-full bg-success border-2 border-background animate-pulse" />
      </button>

      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[min(92vw,440px)] h-[min(82vh,640px)] rounded-2xl bg-card border border-border shadow-glow flex flex-col overflow-hidden transition-all origin-bottom-right",
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-gradient-hero text-white">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-white/15 grid place-items-center"><Bot className="size-4" /></div>
            <div>
              <div className="font-semibold text-sm">Upriter Copilot</div>
              <div className="text-[10px] opacity-80 uppercase tracking-wider flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-300 animate-pulse" /> live · {role} context
              </div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="size-8 rounded-lg hover:bg-white/15 grid place-items-center"><X className="size-4" /></button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {msgs.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                )}
                dangerouslySetInnerHTML={{ __html: formatMarkdown(m.text) }}
              />
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
