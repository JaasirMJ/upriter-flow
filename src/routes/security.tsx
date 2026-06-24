import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { ShieldCheck, KeyRound, Lock, Users, EyeOff, History } from "lucide-react";

export const Route = createFileRoute("/security")({
  head: () => ({ meta: [{ title: "Data Security — Upriter" }] }),
  component: () => (
    <AppShell title="Data Security" subtitle="How we protect your health records">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Item icon={Lock} title="Encrypted records" body="All reports are encrypted at rest with AES-256 on your device, and in transit with TLS 1.3." />
        <Item icon={ShieldCheck} title="Patient data protection" body="We never sell your data. Logs are anonymised and retained only as long as required by law." />
        <Item icon={Users} title="Consent-based sharing" body="A hospital can see your records only while you have an active booking with them — and only the data you've shared." />
        <Item icon={KeyRound} title="Role-based access" body="Reception, doctors and admins each see only what they need. Doctors only see patients assigned to them." />
        <Item icon={EyeOff} title="Audit logs" body="Every access to your records is logged. You can review the access log from Settings." />
        <Item icon={History} title="Right to delete" body="Delete your account anytime — your records, reports and visit history are wiped within 24 hours." />
      </div>
    </AppShell>
  ),
});

function Item({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <Card className="p-5">
      <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><Icon className="size-5" /></div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{body}</p>
    </Card>
  );
}
