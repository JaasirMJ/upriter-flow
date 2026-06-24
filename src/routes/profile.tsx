import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuth, currentUser } from "@/lib/auth";
import { useProfile } from "@/lib/profile";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { Camera, Save, Heart, AlertCircle, Pill } from "lucide-react";
import { HOSPITALS, DOCTORS } from "@/lib/data";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Upriter" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const me = useAuth((s) => currentUser(s));
  const updateCurrent = useAuth((s) => s.updateCurrent);
  const profile = useProfile((s) => s.profile);
  const updateProfile = useProfile((s) => s.updateProfile);

  const [draft, setDraft] = useState({
    name: me?.name ?? "",
    phone: me?.phone ?? "",
    email: me?.email ?? "",
    address: me?.address ?? "",
    language: me?.language ?? profile?.language ?? "English",
    emergencyContact: me?.emergencyContact ?? profile?.emergencyContact ?? "",
    preferredHospitalId: me?.preferredHospitalId ?? "",
    preferredDoctorId: me?.preferredDoctorId ?? "",
    photoDataUrl: me?.photoDataUrl ?? "",
  });
  const [allergies, setAllergies] = useState((profile?.allergies ?? []).join(", "));
  const [conditions, setConditions] = useState((profile?.conditions ?? []).join(", "));
  const [medicines, setMedicines] = useState((profile?.medicines ?? []).join(", "));
  const [bloodGroup, setBloodGroup] = useState(profile?.bloodGroup ?? "");

  useEffect(() => {
    if (me) {
      setDraft((d) => ({ ...d, name: me.name, phone: me.phone ?? d.phone, email: me.email ?? d.email,
        address: me.address ?? d.address, language: me.language ?? d.language,
        emergencyContact: me.emergencyContact ?? d.emergencyContact,
        preferredHospitalId: me.preferredHospitalId ?? "",
        preferredDoctorId: me.preferredDoctorId ?? "",
        photoDataUrl: me.photoDataUrl ?? "" }));
    }
  }, [me?.id]);

  const fileRef = useRef<HTMLInputElement>(null);

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 2 * 1024 * 1024) return toast.error("Photo must be under 2MB");
    const r = new FileReader();
    r.onload = () => setDraft((d) => ({ ...d, photoDataUrl: String(r.result ?? "") }));
    r.readAsDataURL(f);
  };

  const save = () => {
    if (!me) return;
    updateCurrent({
      name: draft.name, phone: draft.phone || undefined, email: draft.email || undefined,
      address: draft.address, language: draft.language, emergencyContact: draft.emergencyContact,
      preferredHospitalId: draft.preferredHospitalId || undefined,
      preferredDoctorId: draft.preferredDoctorId || undefined,
      photoDataUrl: draft.photoDataUrl || undefined,
    });
    if (me.role === "patient" && profile) {
      updateProfile({
        name: draft.name, phone: draft.phone || profile.phone,
        language: draft.language, emergencyContact: draft.emergencyContact,
        bloodGroup: bloodGroup || profile.bloodGroup,
        allergies: allergies.split(",").map((s) => s.trim()).filter(Boolean),
        conditions: conditions.split(",").map((s) => s.trim()).filter(Boolean),
        medicines: medicines.split(",").map((s) => s.trim()).filter(Boolean),
      });
    }
    useStore.getState().pushAudit("Profile updated", draft.name);
    toast.success("Profile saved — changes synced across dashboards");
  };

  if (!me) return null;
  const initials = me.name.split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <AppShell title="My profile" subtitle="Update personal info — changes apply instantly across the app.">
      <div className="grid lg:grid-cols-3 gap-5 max-w-5xl">
        <Card className="p-6 lg:col-span-1 flex flex-col items-center text-center">
          <div className="relative">
            <div className="size-28 rounded-2xl bg-gradient-hero text-white grid place-items-center text-3xl font-semibold overflow-hidden shadow-glow">
              {draft.photoDataUrl ? <img src={draft.photoDataUrl} alt={draft.name} className="size-full object-cover" /> : initials}
            </div>
            <button onClick={() => fileRef.current?.click()} className="absolute -bottom-2 -right-2 size-9 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-lg hover:scale-105 transition">
              <Camera className="size-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />
          </div>
          <h3 className="mt-5 text-xl font-semibold">{draft.name || "Unnamed"}</h3>
          <span className="mt-1 text-[11px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary">{me.role}</span>
          <p className="mt-2 text-sm text-muted-foreground break-all">{me.email ?? me.phone}</p>
        </Card>

        <Card className="p-6 lg:col-span-2 space-y-4">
          <h3 className="font-semibold">Personal info</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Name"><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
            <Field label="Language">
              <select value={draft.language} onChange={(e) => setDraft({ ...draft, language: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                {["English", "Tamil", "Hindi", "Telugu", "Malayalam", "Kannada"].map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Email"><Input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></Field>
            <Field label="Phone number"><Input type="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></Field>
            <Field label="Emergency contact"><Input value={draft.emergencyContact} onChange={(e) => setDraft({ ...draft, emergencyContact: e.target.value })} /></Field>
            <Field label="Address"><Input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} placeholder="Street, city, pincode" /></Field>
          </div>

          {me.role === "patient" && (
            <>
              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold flex items-center gap-2"><Heart className="size-4 text-primary" /> Preferences</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Preferred hospital">
                  <select value={draft.preferredHospitalId} onChange={(e) => setDraft({ ...draft, preferredHospitalId: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                    <option value="">— None —</option>
                    {HOSPITALS.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </Field>
                <Field label="Preferred doctor">
                  <select value={draft.preferredDoctorId} onChange={(e) => setDraft({ ...draft, preferredDoctorId: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                    <option value="">— None —</option>
                    {DOCTORS.map((d) => <option key={d.id} value={d.id}>{d.name} • {d.specialty}</option>)}
                  </select>
                </Field>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold flex items-center gap-2"><AlertCircle className="size-4 text-primary" /> Medical info</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Blood group">
                  <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                    {["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => <option key={g}>{g || "—"}</option>)}
                  </select>
                </Field>
                <Field label="Allergies (comma-separated)"><Input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Penicillin, Peanuts" /></Field>
                <Field label="Conditions"><Input value={conditions} onChange={(e) => setConditions(e.target.value)} placeholder="Hypertension, Diabetes" /></Field>
                <Field label="Current medicines"><Input value={medicines} onChange={(e) => setMedicines(e.target.value)} placeholder="Telmisartan 40mg" /></Field>
              </div>
            </>
          )}

          <div className="pt-4 flex justify-end">
            <Button onClick={save} className="gap-2"><Save className="size-4" /> Save changes</Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
