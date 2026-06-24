import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";

// 7 days x 14 hours (8 AM – 9 PM)
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 14 }, (_, i) => 8 + i);

function load(d: number, h: number): number {
  // synthetic heatmap with peaks at 9–11 and 18–20
  const peakMorning = Math.max(0, 1 - Math.abs(h - 10) / 3);
  const peakEvening = Math.max(0, 1 - Math.abs(h - 19) / 3);
  const weekend = d >= 5 ? 0.85 : 1;
  const base = (peakMorning * 0.9 + peakEvening * 0.7) * weekend;
  return Math.min(1, base + ((d * 7 + h) % 5) * 0.03);
}

function tone(v: number): string {
  if (v < 0.15) return "bg-muted";
  if (v < 0.35) return "bg-primary/15";
  if (v < 0.55) return "bg-primary/35";
  if (v < 0.75) return "bg-primary/60";
  return "bg-primary";
}

export function RushHourHeatmap() {
  const currentHour = new Date().getHours();
  const currentDay = (new Date().getDay() + 6) % 7;
  const currentLoad = load(currentDay, Math.min(21, Math.max(8, currentHour)));
  const loadLabel = currentLoad > 0.7 ? "High" : currentLoad > 0.4 ? "Medium" : "Low";

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold tracking-tight flex items-center gap-2"><Flame className="size-4 text-warning-foreground" /> Rush hour heatmap</h3>
          <p className="text-xs text-muted-foreground">Patient load across the last 7 days</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Peak</div>
            <div className="font-medium">9 AM – 11 AM</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Current load</div>
            <div className={`font-semibold ${loadLabel === "High" ? "text-destructive" : loadLabel === "Medium" ? "text-warning-foreground" : "text-success"}`}>{loadLabel}</div>
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="flex gap-1 ml-10 mb-1 text-[10px] text-muted-foreground">
            {HOURS.map((h) => <div key={h} className="flex-1 text-center tabular-nums">{h}</div>)}
          </div>
          {DAYS.map((day, di) => (
            <div key={day} className="flex items-center gap-1 mb-1">
              <div className="w-9 text-[10px] text-muted-foreground uppercase tracking-wider">{day}</div>
              {HOURS.map((h) => {
                const v = load(di, h);
                return <div key={h} className={`flex-1 h-6 rounded ${tone(v)} transition hover:ring-2 hover:ring-primary/40`} title={`${day} ${h}:00 — load ${Math.round(v * 100)}%`} />;
              })}
            </div>
          ))}
          <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>Less</span>
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => <div key={v} className={`size-3 rounded ${tone(v)}`} />)}
            <span>More</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
