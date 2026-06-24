import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, CheckCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NotificationCenter() {
  const notifs = useStore((s) => s.notifications);
  const lastRead = useStore((s) => s.lastReadNotifAt);
  const markRead = useStore((s) => s.markNotificationsRead);
  const unread = notifs.filter((n) => n.time > lastRead).length;

  return (
    <Popover onOpenChange={(o) => { if (!o) markRead(); }}>
      <PopoverTrigger asChild>
        <button className="relative size-9 rounded-lg hover:bg-muted grid place-items-center transition" aria-label="Notifications">
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium grid place-items-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="font-semibold text-sm">Notifications</div>
          <Button size="sm" variant="ghost" onClick={markRead} className="h-7 text-xs gap-1.5"><CheckCheck className="size-3" /> Mark read</Button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifs.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">All caught up.</div>}
          {notifs.map((n) => {
            const isUnread = n.time > lastRead;
            const dot = n.type === "success" ? "bg-success" : n.type === "warning" ? "bg-warning" : "bg-primary";
            return (
              <div key={n.id} className={cn("px-4 py-3 border-b border-border/60 last:border-0 flex gap-3", isUnread && "bg-accent/30")}>
                <div className={cn("size-2 rounded-full mt-1.5 shrink-0", dot)} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm">{n.text}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{new Date(n.time).toLocaleTimeString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
