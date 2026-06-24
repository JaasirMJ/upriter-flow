import { useProfile } from "@/lib/profile";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, MessageSquare } from "lucide-react";
import { format, formatDistanceToNowStrict } from "date-fns";
import { sendWhatsApp } from "@/lib/whatsapp";

export function NextVisitCard() {
  const followUps = useProfile((s) => s.followUps);
  const profile = useProfile((s) => s.profile);
  const now = useStore((s) => s.now);

  const upcoming = followUps
    .filter((f) => f.status === "scheduled" && new Date(f.date).getTime() > now - 86400000)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (upcoming.length === 0) return null;
  const next = upcoming[0];
  const date = new Date(next.date);
  const remind = () => {
    if (!profile?.phone) return;
    sendWhatsApp(profile.phone, `Reminder: Your next visit with ${next.doctorName} is on ${format(date, "PPP")} — ${next.reason}. Upriter will tell you when to leave.`);
  };

  return (
    <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
      <div className="absolute -top-10 -right-10 size-40 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary">
          <CalendarClock className="size-3.5" /> Next visit
        </div>
        <div className="mt-2 flex items-baseline gap-3 flex-wrap">
          <h3 className="text-2xl font-semibold tracking-tight">{format(date, "MMM d")}</h3>
          <span className="text-sm text-muted-foreground">{formatDistanceToNowStrict(date, { addSuffix: true })}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Doctor</div>
            <div className="font-medium mt-0.5">{next.doctorName}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Reason</div>
            <div className="font-medium mt-0.5">{next.reason}</div>
          </div>
        </div>
        {next.hospitalName && (
          <div className="mt-3 text-xs text-muted-foreground">{next.hospitalName}</div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={remind} className="gap-1.5">
            <MessageSquare className="size-3.5" /> Send WhatsApp reminder
          </Button>
          {upcoming.length > 1 && <span className="text-xs text-muted-foreground self-center">+{upcoming.length - 1} more upcoming</span>}
        </div>
      </div>
    </Card>
  );
}
