import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, Mail, Phone, Lock, ArrowRight, Stethoscope, ClipboardList, BarChart3, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth, homeFor, type Role } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Upriter" }] }),
  component: AuthPage,
});

const PORTALS: { role: Role; label: string; icon: any; hint: string; tone: string }[] = [
  { role: "patient", label: "Patient", icon: UserIcon, hint: "Book appointments and track your token", tone: "from-teal-500/20 to-blue-500/10" },
  { role: "doctor", label: "Doctor", icon: Stethoscope, hint: "Manage consultations and prescriptions", tone: "from-violet-500/20 to-fuchsia-500/10" },
  { role: "reception", label: "Reception", icon: ClipboardList, hint: "Queue management and walk-ins", tone: "from-amber-500/20 to-orange-500/10" },
  { role: "admin", label: "Hospital Admin", icon: BarChart3, hint: "Analytics and oversight", tone: "from-emerald-500/20 to-sky-500/10" },
];

function AuthPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("patient");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [method, setMethod] = useState<"email" | "phone">("email");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [name, setName] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  const login = useAuth((s) => s.login);
  const signup = useAuth((s) => s.signup);

  const portal = PORTALS.find((p) => p.role === role)!;
  const Icon = portal.icon;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return toast.error("Fill all fields");
    setBusy(true);
    try {
      if (mode === "login") {
        const r = await login(role, identifier, password, remember);
        if (!r.ok) return toast.error(r.error ?? "Login failed");
        toast.success(`Welcome back`);
        router.navigate({ to: homeFor(role) });
      } else {
        if (password.length < 8) return toast.error("Password must be at least 8 characters");
        if (password !== confirmPw) return toast.error("Passwords don't match");
        if (!name.trim()) return toast.error("Enter your name");
        const r = await signup({
          role, name: name.trim(), password,
          email: method === "email" ? identifier.trim() : undefined,
          phone: method === "phone" ? identifier.trim() : undefined,
        });
        if (!r.ok) return toast.error(r.error ?? "Signup failed");
        toast.success(`Account created`);
        // Patients still need to complete onboarding (location, age, etc.)
        router.navigate({ to: role === "patient" ? "/onboarding" : homeFor(role) });
      }
    } finally {
      setBusy(false);
    }
  };


  return (
    <div className="min-h-screen flex bg-background">
      {/* Visual side */}
      <div className={`hidden lg:flex flex-col justify-between p-12 w-[42%] relative overflow-hidden bg-gradient-to-br ${portal.tone}`}>
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-gradient-hero grid place-items-center shadow-glow">
              <Activity className="size-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-lg">Upriter</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Patient Flow OS</div>
            </div>
          </Link>
        </div>
        <div className="relative z-10 space-y-6 max-w-md">
          <h1 className="text-4xl font-semibold tracking-tight leading-tight">
            Arrive when you're needed, <span className="text-primary">not hours before.</span>
          </h1>
          <p className="text-muted-foreground">
            One operating system for patients, doctors, reception, and hospital admins.
            Sign in to your portal to continue.
          </p>
          <div className="grid grid-cols-2 gap-2 max-w-sm">
            {PORTALS.map((p) => (
              <button key={p.role} onClick={() => setRole(p.role)} className={`p-3 rounded-xl border text-left transition ${role === p.role ? "border-primary bg-primary/5" : "border-border bg-card/40 hover:bg-card"}`}>
                <p.icon className="size-4 text-primary mb-1.5" />
                <div className="text-sm font-medium">{p.label}</div>
                <div className="text-[10px] text-muted-foreground line-clamp-1">{p.hint}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-xs text-muted-foreground max-w-sm">
          <p className="font-medium text-foreground/80 mb-1">Demo build</p>
          <p>Sign up to create an account in each portal. No real patient data should be entered — this is a frontend-only demo without a secure backend.</p>
        </div>

      </div>

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="size-9 rounded-xl bg-gradient-hero grid place-items-center"><Activity className="size-5 text-white" /></div>
            <div className="font-semibold">Upriter</div>
          </Link>

          {/* Portal selector — mobile */}
          <div className="lg:hidden grid grid-cols-4 gap-1.5 mb-6 p-1 bg-muted rounded-xl">
            {PORTALS.map((p) => (
              <button key={p.role} onClick={() => setRole(p.role)} className={`py-2 rounded-lg text-[11px] font-medium transition ${role === p.role ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-primary/10 grid place-items-center">
              <Icon className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{portal.label} portal</h2>
              <p className="text-sm text-muted-foreground">{mode === "login" ? "Sign in to your account" : "Create your account"}</p>
            </div>

          </div>

          {/* Method toggle */}
          <div className="mt-6 inline-flex p-1 bg-muted rounded-lg text-xs">
            <button onClick={() => setMethod("email")} className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${method === "email" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
              <Mail className="size-3" /> Email
            </button>
            <button onClick={() => setMethod("phone")} className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${method === "phone" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
              <Phone className="size-3" /> Phone
            </button>
          </div>

          <form onSubmit={submit} className="mt-4 space-y-3.5">
            {mode === "signup" && (
              <div>
                <Label className="text-xs">Full name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-1.5" />
              </div>
            )}
            <div>
              <Label className="text-xs">{method === "email" ? "Email" : "Phone number"}</Label>
              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={method === "email" ? "you@example.com" : "98xxxxxxxx"}
                type={method === "email" ? "email" : "tel"}
                className="mt-1.5"
                autoComplete={method === "email" ? "email" : "tel"}
              />
            </div>
            <div>
              <Label className="text-xs">{mode === "forgot" ? "New password" : "Password"}</Label>
              <div className="relative mt-1.5">
                <Lock className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className="pl-9" autoComplete={mode === "login" ? "current-password" : "new-password"} />
              </div>
            </div>
            {mode === "signup" && (
              <div>
                <Label className="text-xs">Confirm password</Label>
                <Input value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} type="password" placeholder="••••••••" className="mt-1.5" autoComplete="new-password" />
              </div>
            )}

            {mode === "login" && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded" />
                  Remember me
                </label>
                <button type="button" onClick={() => setMode("forgot")} className="text-primary hover:underline">Forgot password?</button>
              </div>
            )}

            <Button type="submit" className="w-full gap-2 h-10 mt-2">
              {mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Reset password"} <ArrowRight className="size-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" && (
              <>Don't have an account? <button onClick={() => setMode("signup")} className="text-primary hover:underline">Sign up</button></>
            )}
            {mode === "signup" && (
              <>Already have an account? <button onClick={() => setMode("login")} className="text-primary hover:underline">Sign in</button></>
            )}
            {mode === "forgot" && (
              <button onClick={() => setMode("login")} className="text-primary hover:underline">Back to sign in</button>
            )}
          </div>

          <p className="mt-8 text-[10px] text-center text-muted-foreground">
            By continuing you agree to our <Link to="/terms" className="underline">terms</Link> and <Link to="/privacy" className="underline">privacy policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
