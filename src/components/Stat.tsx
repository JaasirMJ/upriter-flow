import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function Stat({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "primary" | "success" | "warning";
}) {
  return (
    <Card className="p-5 hover:shadow-soft transition-shadow">
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
        <div
          className={cn(
            "size-9 rounded-lg grid place-items-center",
            tone === "primary" && "bg-primary/10 text-primary",
            tone === "success" && "bg-success/10 text-success",
            tone === "warning" && "bg-warning/15 text-warning-foreground",
            tone === "default" && "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>
      <div className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </Card>
  );
}
