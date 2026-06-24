import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Image as ImageIcon, FlaskConical, Scan, Pill, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useProfile, categorizeReport, type MedicalReport } from "@/lib/profile";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Medical Reports — Upriter" }] }),
  component: ReportsPage,
});

const CATEGORIES = [
  { id: "all", label: "All", icon: FileText },
  { id: "prescription", label: "Prescriptions", icon: Pill },
  { id: "blood", label: "Blood reports", icon: FlaskConical },
  { id: "mri", label: "MRI", icon: Scan },
  { id: "xray", label: "X-Rays", icon: Scan },
  { id: "pdf", label: "PDFs", icon: FileText },
  { id: "image", label: "Images", icon: ImageIcon },
] as const;

function ReportsPage() {
  const reports = useProfile((s) => s.reports);
  const addReport = useProfile((s) => s.addReport);
  const removeReport = useProfile((s) => s.removeReport);
  const inputRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<string>("all");

  const onUpload = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      if (f.size > 5_000_000) {
        toast.error(`${f.name} is over 5MB — skipped`);
        continue;
      }
      const dataUrl = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.onerror = rej;
        r.readAsDataURL(f);
      });
      addReport({
        name: f.name,
        category: categorizeReport(f.name, f.type),
        mime: f.type || "application/octet-stream",
        size: f.size,
        dataUrl,
      });
    }
    toast.success("Reports uploaded");
  };

  const filtered = filter === "all" ? reports : reports.filter((r) => r.category === filter);

  return (
    <AppShell title="Medical Reports" subtitle="Encrypted on-device. Only you and doctors you book with can access them.">
      <div className="space-y-5">
        <Card
          className="p-6 border-dashed border-2 text-center cursor-pointer hover:bg-accent/30 transition"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); onUpload(e.dataTransfer.files); }}
        >
          <Upload className="size-8 mx-auto text-muted-foreground" />
          <div className="mt-2 font-medium">Upload PDF, images, prescriptions, blood / MRI / X-ray reports</div>
          <div className="text-xs text-muted-foreground mt-1">Drag & drop or click to choose · up to 5MB each</div>
          <input ref={inputRef} type="file" hidden multiple accept="image/*,application/pdf" onChange={(e) => onUpload(e.target.files)} />
        </Card>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const count = c.id === "all" ? reports.length : reports.filter((r) => r.category === c.id).length;
            return (
              <button key={c.id} onClick={() => setFilter(c.id)} className={`px-3 py-1.5 rounded-full text-xs border flex items-center gap-1.5 ${filter === c.id ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                <Icon className="size-3" />
                {c.label}
                <span className={`text-[10px] ${filter === c.id ? "opacity-80" : "text-muted-foreground"}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">No reports in this category yet.</Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((r) => <ReportCard key={r.id} r={r} onRemove={() => removeReport(r.id)} />)}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function ReportCard({ r, onRemove }: { r: MedicalReport; onRemove: () => void }) {
  const isImage = r.mime.startsWith("image/");
  return (
    <Card className="overflow-hidden group">
      <div className="aspect-[4/3] bg-muted relative">
        {isImage ? (
          <img src={r.dataUrl} alt={r.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-muted-foreground"><FileText className="size-10" /></div>
        )}
        <button onClick={onRemove} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition size-7 rounded-full bg-background/90 grid place-items-center hover:bg-destructive/15">
          <Trash2 className="size-3.5 text-destructive" />
        </button>
      </div>
      <div className="p-3">
        <div className="font-medium text-sm truncate" title={r.name}>{r.name}</div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <Badge variant="secondary" className="text-[10px] capitalize">{r.category}</Badge>
          <span>{(r.size / 1024).toFixed(0)} KB</span>
        </div>
        <a href={r.dataUrl} download={r.name} className="mt-2 block">
          <Button variant="outline" size="sm" className="w-full">Open</Button>
        </a>
      </div>
    </Card>
  );
}
