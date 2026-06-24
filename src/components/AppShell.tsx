import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, LayoutDashboard, User, Stethoscope, ClipboardList, BarChart3, Moon, Sun, RotateCcw } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/patient", label: "Patient", icon: User },
  { to: "/doctor", label: "Doctor", icon: Stethoscope },
  { to: "/reception", label: "Reception", icon: ClipboardList },
  { to: "/admin", label: "Admin", icon: BarChart3 },
] as const;

export function AppShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [dark, setDark] = useState(false);
  const reset = useStore((s) => s.reset);

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

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar p-5 gap-2 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2 mb-6 group">
          <div className="size-9 rounded-xl bg-gradient-hero grid place-items-center shadow-glow">
            <Activity className="size-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-lg tracking-tight">Upriter</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5 uppercase tracking-wider">Patient Flow OS</div>
          </div>
        </Link>
        <nav className="flex flex-col gap-1">
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
        <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-border">
          <Button variant="ghost" size="sm" onClick={reset} className="justify-start gap-2">
            <RotateCcw className="size-4" /> Reset demo
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="justify-start gap-2">
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {dark ? "Light mode" : "Dark mode"}
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-sidebar sticky top-0 z-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-hero grid place-items-center">
              <Activity className="size-4 text-white" />
            </div>
            <span className="font-semibold">Upriter</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </div>
        <div className="md:hidden flex gap-1 px-3 pb-3 overflow-x-auto border-b border-border bg-sidebar">
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

        <header className="px-6 md:px-10 pt-8 pb-6 border-b border-border">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1 text-sm md:text-base">{subtitle}</p>}
        </header>
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
