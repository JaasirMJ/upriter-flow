import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { Bell, Car, Moon, Palette, Shield, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Upriter" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [dark, setDark] = useState(false);
  const [travel, setTravel] = useState(useStore.getState().travelTimeMins);
  const [notifs, setNotifs] = useState(true);
  const [sms, setSms] = useState(true);
  const [emergency, setEmergency] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = (v: boolean) => {
    setDark(v);
    document.documentElement.classList.toggle("dark", v);
    localStorage.setItem("upriter-theme", v ? "dark" : "light");
  };

  const save = () => {
    useStore.setState({ travelTimeMins: travel });
    toast.success("Settings saved");
  };

  return (
    <AppShell title="Settings" subtitle="Personalise your Upriter experience.">
      <div className="grid lg:grid-cols-3 gap-5 max-w-5xl">
        <Card className="p-6 lg:col-span-2 space-y-5">
          <SectionTitle icon={UserIcon} title="Profile" />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Full name" defaultValue="Aarav Sharma" />
            <Field label="Email" defaultValue="aarav@upriter.health" />
            <Field label="Phone" defaultValue="+91 98xxx xxxxx" />
            <Field label="Default hospital" defaultValue="Apollo Multi-Speciality" />
          </div>

          <div className="border-t border-border pt-5">
            <SectionTitle icon={Car} title="Journey defaults" />
            <div className="mt-3">
              <Label className="text-xs">Travel time to your usual hospital (minutes)</Label>
              <Input type="number" value={travel} onChange={(e) => setTravel(Number(e.target.value) || 0)} className="mt-2 max-w-xs" />
              <p className="text-xs text-muted-foreground mt-1.5">Used by the AI Arrival Planner to compute leave-home time.</p>
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <SectionTitle icon={Bell} title="Notifications" />
            <ToggleRow label="In-app notifications" desc="Show queue updates and reminders" checked={notifs} onChange={setNotifs} />
            <ToggleRow label="SMS reminders" desc="Get an SMS when it's nearly your turn" checked={sms} onChange={setSms} />
            <ToggleRow label="Emergency alerts" desc="Allow doctors to flag critical updates" checked={emergency} onChange={setEmergency} />
          </div>

          <div className="border-t border-border pt-5">
            <SectionTitle icon={Palette} title="Appearance" />
            <ToggleRow label="Dark mode" desc="Reduce eye strain in low-light environments" checked={dark} onChange={toggleTheme} icon={Moon} />
          </div>

          <div className="pt-3">
            <Button onClick={save}>Save changes</Button>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-6">
            <SectionTitle icon={Shield} title="Privacy" />
            <p className="text-xs text-muted-foreground mt-2">Your medical history is encrypted at rest and visible only to clinicians you authorise.</p>
            <Button variant="outline" className="mt-3 w-full">Download my data</Button>
            <Button variant="ghost" className="mt-2 w-full text-destructive hover:text-destructive">Delete account</Button>
          </Card>
          <Card className="p-6">
            <div className="font-semibold text-sm">Plan</div>
            <div className="text-xs text-muted-foreground mt-1">Upriter Personal • Free</div>
            <div className="mt-3 rounded-lg bg-gradient-hero text-white p-3 text-xs">
              Upgrade to <span className="font-semibold">Upriter Family</span> to manage up to 6 family members.
            </div>
            <Button className="mt-3 w-full">Upgrade</Button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-primary" />
      <h3 className="font-semibold tracking-tight">{title}</h3>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input defaultValue={defaultValue} className="mt-1.5" />
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void; icon?: any }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
