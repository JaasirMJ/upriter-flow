import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, FileText, CalendarClock } from "lucide-react";
import { useProfile, type PrescriptionMed } from "@/lib/profile";
import { useStore } from "@/lib/store";
import { useAuth, currentUser } from "@/lib/auth";
import { sendWhatsApp } from "@/lib/whatsapp";
import { toast } from "sonner";

interface Props {
  patient: { name: string; phone: string; token: number };
  trigger?: React.ReactNode;
  onSaved?: () => void;
}

export function PrescriptionDialog({ patient, trigger, onSaved }: Props) {
  const [open, setOpen] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [meds, setMeds] = useState<PrescriptionMed[]>([{ name: "", dosage: "", duration: "" }]);
  const [followUp, setFollowUp] = useState<"none" | "7" | "30" | "custom">("none");
  const [customDate, setCustomDate] = useState("");
  const [followUpReason, setFollowUpReason] = useState("");

  const doctor = useAuth((s) => currentUser(s));
  const addPrescription = useProfile((s) => s.addPrescription);
  const addFollowUp = useProfile((s) => s.addFollowUp);

  const addMed = () => setMeds([...meds, { name: "", dosage: "", duration: "" }]);
  const removeMed = (i: number) => setMeds(meds.filter((_, idx) => idx !== i));
  const updateMed = (i: number, patch: Partial<PrescriptionMed>) => setMeds(meds.map((m, idx) => idx === i ? { ...m, ...patch } : m));

  const computeFollowUpDate = (): string | undefined => {
    if (followUp === "none") return undefined;
    if (followUp === "custom") return customDate ? new Date(customDate).toISOString() : undefined;
    const days = Number(followUp);
    return new Date(Date.now() + days * 86400000).toISOString();
  };

  const save = () => {
    const validMeds = meds.filter((m) => m.name.trim() && m.dosage.trim());
    if (validMeds.length === 0) return toast.error("Add at least one medicine");
    const followUpDate = computeFollowUpDate();
    const pres = addPrescription({
      date: new Date().toISOString(),
      doctorId: doctor?.id ?? "doctor",
      doctorName: doctor?.name ?? "Doctor",
      hospitalName: "SSS Hospital",
      department: "Consultation",
      diagnosis: diagnosis.trim() || undefined,
      medicines: validMeds,
      instructions: notes.trim() || undefined,
      followUpDate,
    });
    if (followUpDate) {
      addFollowUp({
        date: followUpDate,
        doctorId: doctor?.id ?? "doctor",
        doctorName: doctor?.name ?? "Doctor",
        hospitalName: "SSS Hospital",
        reason: followUpReason.trim() || (diagnosis.trim() ? `${diagnosis} — review` : "Follow-up review"),
        prescriptionId: pres.id,
        status: "scheduled",
      });
    }
    useStore.getState().pushAudit("Prescription uploaded", `${patient.name} — ${validMeds.length} medicine(s)`);
    useStore.getState().pushNotification({ text: `Prescription uploaded for ${patient.name}`, type: "success" });
    if (followUpDate) useStore.getState().pushAudit("Follow-up scheduled", `${patient.name} — ${new Date(followUpDate).toLocaleDateString()}`);
    // Simulated WhatsApp link (does not auto-send)
    const msg = `Hi ${patient.name}, your prescription from ${doctor?.name ?? "your doctor"} is ready in Upriter.${followUpDate ? ` Next visit: ${new Date(followUpDate).toLocaleDateString()}.` : ""}`;
    if (patient.phone) {
      try { sendWhatsApp(patient.phone, msg); } catch {}
    }
    toast.success("Prescription saved — patient notified");
    onSaved?.();
    setOpen(false);
    setDiagnosis(""); setNotes(""); setMeds([{ name: "", dosage: "", duration: "" }]);
    setFollowUp("none"); setCustomDate(""); setFollowUpReason("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button variant="outline" className="gap-2"><FileText className="size-4" /> Write prescription</Button>}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Prescription — {patient.name}</DialogTitle>
          <DialogDescription>Patient will see this in their prescriptions instantly.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div>
            <Label className="text-xs">Diagnosis</Label>
            <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Hypertension — stable" className="mt-1.5" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Medicines</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addMed} className="h-7 gap-1.5 text-xs"><Plus className="size-3" /> Add</Button>
            </div>
            <div className="space-y-2">
              {meds.map((m, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-start">
                  <Input className="col-span-4" value={m.name} onChange={(e) => updateMed(i, { name: e.target.value })} placeholder="Medicine" />
                  <Input className="col-span-4" value={m.dosage} onChange={(e) => updateMed(i, { dosage: e.target.value })} placeholder="Dosage" />
                  <Input className="col-span-3" value={m.duration} onChange={(e) => updateMed(i, { duration: e.target.value })} placeholder="Duration" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeMed(i)} disabled={meds.length === 1} className="col-span-1 size-9"><Trash2 className="size-3.5" /></Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">Instructions</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Diet, lifestyle, when to return" className="mt-1.5" rows={3} />
          </div>

          <div className="pt-3 border-t border-border">
            <Label className="text-xs flex items-center gap-1.5"><CalendarClock className="size-3.5" /> Schedule follow-up</Label>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {[
                { v: "none", label: "None" },
                { v: "7", label: "After 7 days" },
                { v: "30", label: "After 30 days" },
                { v: "custom", label: "Custom" },
              ].map((o) => (
                <button key={o.v} type="button" onClick={() => setFollowUp(o.v as any)} className={`py-2 rounded-md text-xs border transition ${followUp === o.v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                  {o.label}
                </button>
              ))}
            </div>
            {followUp === "custom" && (
              <Input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="mt-2" />
            )}
            {followUp !== "none" && (
              <Input value={followUpReason} onChange={(e) => setFollowUpReason(e.target.value)} placeholder="Reason for follow-up" className="mt-2" />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} className="gap-2"><FileText className="size-4" /> Save & notify patient</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
