import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, ArrowRight, ArrowLeft, Loader2, MapPin, Phone, Search, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CITIES, LANGUAGES, BLOOD_GROUPS, GENDERS } from "@/lib/data";
import { nearestCity } from "@/lib/geo";
import { useProfile } from "@/lib/profile";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Get started — Upriter" }] }),
  component: Onboarding,
});

type Step = 1 | 2 | 3 | 4;

function Onboarding() {
  const navigate = useNavigate();
  const setProfile = useProfile((s) => s.setProfile);
  const [step, setStep] = useState<Step>(1);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [city, setCity] = useState<typeof CITIES[number] | null>(null);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<string>("Male");
  const [bloodGroup, setBloodGroup] = useState<string>("O+");
  const [emergency, setEmergency] = useState("");
  const [language, setLanguage] = useState<string>("English");

  const detect = () => {
    setSearching(true);
    if (!navigator.geolocation) {
      setSearching(false);
      toast.error("Geolocation not available. Please choose a city.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = nearestCity({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setCity(c);
        setSearching(false);
        toast.success(`Detected: ${c.name}, ${c.state}`);
      },
      () => {
        setSearching(false);
        toast.error("Could not detect location. Please choose manually.");
      },
      { timeout: 8000 }
    );
  };

  const sendOtp = () => {
    if (phone.replace(/\D/g, "").length < 10) return toast.error("Enter a valid 10-digit number");
    setOtpSent(true);
    toast.success("OTP sent (demo: any 4 digits work)");
  };

  const verifyOtp = () => {
    if (otp.length !== 4) return toast.error("Enter the 4-digit OTP");
    setStep(2);
  };

  const finish = () => {
    if (!city) return toast.error("Pick a location first");
    if (!name || !age || !emergency) return toast.error("Fill all fields");
    setProfile({
      phone,
      name,
      age: Number(age),
      gender,
      bloodGroup,
      emergencyContact: emergency,
      language,
      city: city.name,
      state: city.state,
      lat: city.lat,
      lng: city.lng,
      createdAt: Date.now(),
    });
    toast.success(`Welcome to Upriter, ${name.split(" ")[0]}!`);
    navigate({ to: "/patient" });
  };

  const filtered = CITIES.filter((c) =>
    !query ? true : c.name.toLowerCase().includes(query.toLowerCase()) || c.state.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 mb-6 justify-center">
          <div className="size-10 rounded-xl bg-gradient-hero grid place-items-center shadow-glow">
            <Activity className="size-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-lg">Upriter</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5 uppercase tracking-wider">Patient Flow OS</div>
          </div>
        </div>

        <Card className="p-6">
          {/* Progress */}
          <div className="flex items-center gap-1.5 mb-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className={`h-1 flex-1 rounded-full ${step >= n ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Enter your phone number</h1>
                <p className="text-sm text-muted-foreground mt-1">We'll send you a one-time code.</p>
              </div>
              <div>
                <Label className="text-xs">Mobile number</Label>
                <div className="mt-2 flex gap-2">
                  <div className="px-3 h-10 grid place-items-center rounded-md border bg-muted text-sm font-medium">+91</div>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    placeholder="98xxx xxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    disabled={otpSent}
                  />
                </div>
              </div>
              {otpSent && (
                <div>
                  <Label className="text-xs">OTP</Label>
                  <Input
                    inputMode="numeric"
                    placeholder="• • • •"
                    className="mt-2 tracking-[0.5em] text-center text-lg"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  />
                  <button onClick={sendOtp} className="text-[11px] text-primary mt-2 hover:underline">Resend code</button>
                </div>
              )}
              {!otpSent ? (
                <Button onClick={sendOtp} className="w-full gap-2">
                  <Phone className="size-4" /> Send OTP
                </Button>
              ) : (
                <Button onClick={verifyOtp} className="w-full gap-2">
                  Verify & continue <ArrowRight className="size-4" />
                </Button>
              )}
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground justify-center">
                <ShieldCheck className="size-3" />
                Your number stays on your device. Demo OTP — any 4 digits.
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Where are you?</h1>
                <p className="text-sm text-muted-foreground mt-1">We'll show nearby hospitals and travel times.</p>
              </div>

              <Button onClick={detect} variant="outline" className="w-full justify-start gap-2 h-11" disabled={searching}>
                {searching ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4 text-primary" />}
                {searching ? "Detecting…" : "Use current location"}
              </Button>

              <div className="text-center text-[11px] text-muted-foreground">or choose manually</div>

              <div className="relative">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search city…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>

              <div className="max-h-56 overflow-y-auto -mx-1 px-1 space-y-1">
                {filtered.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setCity(c)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm flex items-center justify-between ${city?.name === c.name ? "border-primary bg-primary/5" : "border-border hover:bg-accent/40"}`}
                  >
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground">{c.state}</div>
                    </div>
                    {city?.name === c.name && <span className="text-[10px] text-primary">Selected</span>}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="size-4" /></Button>
                <Button onClick={() => city && setStep(3)} disabled={!city} className="flex-1 gap-2">
                  Continue <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Create your profile</h1>
                <p className="text-sm text-muted-foreground mt-1">This stays on your device, encrypted at rest.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label className="text-xs">Full name</Label>
                  <div className="mt-1.5 relative">
                    <User className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aarav Mehta" className="pl-9" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Age</Label>
                  <Input type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="32" className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs">Gender</Label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {GENDERS.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Blood group</Label>
                  <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Preferred language</Label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {LANGUAGES.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Emergency contact</Label>
                  <Input value={emergency} onChange={(e) => setEmergency(e.target.value)} placeholder="Name & phone" className="mt-1.5" />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="size-4" /></Button>
                <Button onClick={finish} className="flex-1 gap-2">
                  Finish & open app <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        <p className="text-center text-[11px] text-muted-foreground mt-4 px-4">
          By continuing you agree to our <a href="/terms" className="underline">Terms</a> and <a href="/privacy" className="underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
