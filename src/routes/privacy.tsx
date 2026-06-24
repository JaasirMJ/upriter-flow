import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Lock, KeyRound, UserCheck, FileLock, EyeOff } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Upriter" }] }),
  component: () => (
    <AppShell title="Privacy Policy" subtitle="Last updated: June 2026">
      <div className="grid md:grid-cols-3 gap-4 mb-5">
        <Pill icon={Lock} title="Encrypted records" body="All medical reports are encrypted at rest on your device and in transit." />
        <Pill icon={UserCheck} title="Patient ownership" body="You own your health data. You decide who can see it." />
        <Pill icon={FileLock} title="Consent-based sharing" body="Hospitals and doctors see your records only after you book and consent." />
      </div>
      <Card className="p-6 prose-sm max-w-none space-y-4 text-sm">
        <h3 className="font-semibold">What we collect</h3>
        <p className="text-muted-foreground">Your phone number, name, age, gender, blood group, emergency contact, preferred language, and the city you're in. Optionally, the medical reports you upload.</p>
        <h3 className="font-semibold">How we use it</h3>
        <p className="text-muted-foreground">To book appointments, calculate accurate wait times, and notify you when it's time to leave. We never sell your data.</p>
        <h3 className="font-semibold">Who can see your records</h3>
        <p className="text-muted-foreground">Only doctors and reception staff at hospitals where you've booked an active appointment. Access is logged and revocable.</p>
        <h3 className="font-semibold">Your rights</h3>
        <p className="text-muted-foreground">You can export or delete your data anytime from Settings. Email <a className="underline" href="mailto:privacy@upriter.app">privacy@upriter.app</a> for requests.</p>
      </Card>
    </AppShell>
  ),
});

function Pill({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <Card className="p-5">
      <div className="size-9 rounded-xl bg-primary/10 text-primary grid place-items-center"><Icon className="size-4" /></div>
      <h4 className="mt-3 font-semibold">{title}</h4>
      <p className="text-xs text-muted-foreground mt-1">{body}</p>
    </Card>
  );
}
