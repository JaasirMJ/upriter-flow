import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator
} from "@/components/ui/command";
import { useStore } from "@/lib/store";
import { LayoutDashboard, User, Stethoscope, ClipboardList, BarChart3, Settings, PhoneCall, SkipForward, PhoneOff, RotateCcw, Moon, Sun, Sparkles, Home } from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { callNext, skipCurrent, markNoShow, reset } = useStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const go = (to: string) => {
    setOpen(false);
    navigate({ to });
  };

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  const toggleTheme = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("upriter-theme", next ? "dark" : "light"); } catch {}
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search dashboards, actions, patients…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go("/")}> <Home className="mr-2 size-4" /> Home</CommandItem>
          <CommandItem onSelect={() => go("/patient")}> <User className="mr-2 size-4" /> Patient dashboard</CommandItem>
          <CommandItem onSelect={() => go("/doctor")}> <Stethoscope className="mr-2 size-4" /> Doctor dashboard</CommandItem>
          <CommandItem onSelect={() => go("/reception")}> <ClipboardList className="mr-2 size-4" /> Reception dashboard</CommandItem>
          <CommandItem onSelect={() => go("/admin")}> <BarChart3 className="mr-2 size-4" /> Admin analytics</CommandItem>
          <CommandItem onSelect={() => go("/settings")}> <Settings className="mr-2 size-4" /> Settings</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Queue actions">
          <CommandItem onSelect={() => run(callNext)}><PhoneCall className="mr-2 size-4" /> Call next patient</CommandItem>
          <CommandItem onSelect={() => run(skipCurrent)}><SkipForward className="mr-2 size-4" /> Skip current</CommandItem>
          <CommandItem onSelect={() => run(markNoShow)}><PhoneOff className="mr-2 size-4" /> Mark no-show</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="System">
          <CommandItem onSelect={() => run(toggleTheme)}><Moon className="mr-2 size-4" /> Toggle theme</CommandItem>
          <CommandItem onSelect={() => run(reset)}><RotateCcw className="mr-2 size-4" /> Reset demo data</CommandItem>
          <CommandItem onSelect={() => { setOpen(false); window.dispatchEvent(new CustomEvent("upriter:open-copilot")); }}>
            <Sparkles className="mr-2 size-4" /> Open AI Copilot
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
