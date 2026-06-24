import { Card } from "@/components/ui/card";
import { Sun, Sunset, Moon, Sunrise } from "lucide-react";
import { cn } from "@/lib/utils";

type Slot = { id: string; time: string; status: "available" | "filling" | "full" };

const BLOCKS = [
  { id: "morning", label: "Morning", range: "7 AM – 10 AM", icon: Sunrise, slots: makeSlots(7, 10, [0, 1, 2, 4, 5]) },
  { id: "afternoon", label: "Afternoon", range: "11 AM – 2 PM", icon: Sun, slots: makeSlots(11, 14, [0, 2]) },
  { id: "evening", label: "Evening", range: "3 PM – 6 PM", icon: Sunset, slots: makeSlots(15, 18, [0, 1, 3, 4, 5]) },
  { id: "night", label: "Night", range: "7 PM – 11 PM", icon: Moon, slots: makeSlots(19, 22, []) },
] as const;

function makeSlots(start: number, end: number, occupied: number[]): Slot[] {
  const slots: Slot[] = [];
  let idx = 0;
  for (let h = start; h <= end; h++) {
    for (const m of [0, 30]) {
      const t = `${((h + 11) % 12) + 1}:${m === 0 ? "00" : "30"} ${h < 12 ? "AM" : "PM"}`;
      const isOcc = occupied.includes(idx);
      const isHot = idx % 7 === 3 && !isOcc;
      slots.push({ id: `${h}-${m}`, time: t, status: isOcc ? "full" : isHot ? "filling" : "available" });
      idx++;
    }
  }
  return slots;
}

export function BookingSlots({ onSelect }: { onSelect?: (time: string) => void }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold tracking-tight">Pick your slot</h3>
          <p className="text-xs text-muted-foreground">Live availability across today's schedule</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <Legend color="bg-success" label="Available" />
          <Legend color="bg-warning" label="Filling fast" />
          <Legend color="bg-destructive" label="Full" />
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {BLOCKS.map((b) => {
          const Icon = b.icon;
          const avail = b.slots.filter((s) => s.status === "available").length;
          return (
            <div key={b.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-accent grid place-items-center"><Icon className="size-3.5 text-accent-foreground" /></div>
                  <div>
                    <div className="text-sm font-medium">{b.label}</div>
                    <div className="text-[10px] text-muted-foreground">{b.range}</div>
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground">{avail}/{b.slots.length} available</div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                {b.slots.map((s) => (
                  <button
                    key={s.id}
                    disabled={s.status === "full"}
                    onClick={() => s.status !== "full" && onSelect?.(s.time)}
                    className={cn(
                      "text-xs py-2 rounded-lg border transition font-medium tabular-nums",
                      s.status === "available" && "border-success/40 bg-success/10 text-success hover:bg-success/20",
                      s.status === "filling" && "border-warning/40 bg-warning/15 text-warning-foreground hover:bg-warning/25",
                      s.status === "full" && "border-destructive/30 bg-destructive/10 text-destructive/60 cursor-not-allowed line-through"
                    )}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5"><span className={`size-2 rounded-full ${color}`} /> <span className="text-muted-foreground">{label}</span></span>;
}
