import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, LayoutDashboard, User, Stethoscope, ClipboardList, BarChart3, Moon, Sun, RotateCcw, Search, Settings, Command, MapPin, Building2, CalendarPlus, HeartPulse, FileText, History, ShieldCheck } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AICopilot } from "@/components/AICopilot";
import { CommandPalette } from "@/components/CommandPalette";
import { NotificationCenter } from "@/components/NotificationCenter";
import { ProfileMenu } from "@/components/ProfileMenu";

const NAV_MAIN = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/journey", label: "Smart Journey", icon: MapPin },
  { to: "/patient", label: "Patient", icon: User },
  { to: "/book", label: "Book", icon: CalendarPlus },
  { to: "/hospitals", label: "Hospitals", icon: Building2 },
  { to: "/first-aid", label: "First Aid", icon: HeartPulse },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/history", label: "History", icon: History },
] as const;

const NAV_STAFF = [
  { to: "/doctor", label: "Doctor", icon: Stethoscope },
  { to: "/reception", label: "Reception", icon: ClipboardList },
  { to: "/admin", label: "Admin", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reset = useStore((s) => s.reset);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const saved = localStorage.getItem("upriter-theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("upriter-theme", next ? "dark" : "light");
  };

  const openPalette = () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-sidebar p-4 gap-1 sticky top-0 h-screen z-30">
        <Link to="/" className="flex items-center gap-2.5 px-2 mb-6 group">
          <div className="size-9 rounded-xl bg-gradient-hero grid place-items-center shadow-glow">
            <Activity className="size-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-base tracking-tight">Upriter</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5 uppercase tracking-wider">Patient Flow OS</div>
          </div>
        </Link>

        <button onClick={openPalette} className="mb-4 mx-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-accent/40 text-xs text-muted-foreground transition">
          <Search className="size-3.5" />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border">⌘K</kbd>
        </button>

        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 px-3 pb-1">Workspace</div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-soft"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-border">
          <Button variant="ghost" size="sm" onClick={reset} className="justify-start gap-2 h-8">
            <RotateCcw className="size-3.5" /> Reset demo
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="justify-start gap-2 h-8">
            {dark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            {dark ? "Light mode" : "Dark mode"}
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top header */}
        <header className="h-14 flex items-center gap-3 px-4 md:px-6 border-b border-border bg-card/60 backdrop-blur-xl sticky top-0 z-20">
          <Link to="/" className="md:hidden flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-hero grid place-items-center">
              <Activity className="size-4 text-white" />
            </div>
            <span className="font-semibold">Upriter</span>
          </Link>

          <button onClick={openPalette} className="hidden md:flex items-center gap-2 px-3 h-9 rounded-lg border border-border bg-background hover:bg-accent/40 text-xs text-muted-foreground transition flex-1 max-w-md">
            <Search className="size-3.5" />
            <span className="flex-1 text-left">Search patients, doctors, commands…</span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border flex items-center gap-0.5"><Command className="size-2.5" />K</kbd>
          </button>

          <div className="flex-1 md:hidden" />

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="size-9 md:hidden">
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <NotificationCenter />
            <div className="w-px h-6 bg-border mx-1" />
            <ProfileMenu />
          </div>
        </header>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-1 px-3 py-2 overflow-x-auto border-b border-border bg-sidebar">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap",
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="px-6 md:px-10 pt-7 pb-5 border-b border-border">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1 text-sm md:text-base">{subtitle}</p>}
        </div>
        <div className="p-4 md:p-8 flex-1">{mounted ? children : null}</div>

        {/* Global app shell mounts */}
        {mounted && <CommandPalette />}
        {mounted && <AICopilot />}
      </main>
    </div>
  );
}
