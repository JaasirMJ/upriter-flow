// Local demo auth. Accounts persist in localStorage; no backend.
// Suitable for the demo — passwords are stored plaintext intentionally for replay.
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "patient" | "doctor" | "reception" | "admin";

export interface Account {
  id: string;
  role: Role;
  email?: string;
  phone?: string;
  password: string;
  name: string;
  photoDataUrl?: string;
  address?: string;
  language?: string;
  emergencyContact?: string;
  preferredHospitalId?: string;
  preferredDoctorId?: string;
  createdAt: number;
}

interface AuthState {
  accounts: Account[];
  currentId: string | null;
  remember: boolean;
  login: (role: Role, identifier: string, password: string, remember?: boolean) => { ok: boolean; error?: string };
  signup: (data: Omit<Account, "id" | "createdAt">) => { ok: boolean; error?: string; account?: Account };
  logout: () => void;
  forgotPassword: (role: Role, identifier: string, newPassword: string) => { ok: boolean; error?: string };
  updateCurrent: (patch: Partial<Omit<Account, "id" | "role" | "createdAt">>) => void;
}

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Math.random());
}

function matches(a: Account, role: Role, id: string): boolean {
  if (a.role !== role) return false;
  const v = id.trim().toLowerCase();
  if (!v) return false;
  return a.email?.toLowerCase() === v || a.phone === id.trim();
}

// Seed staff accounts so judges can try every portal
const seed: Account[] = [
  { id: "demo-doc", role: "doctor", email: "doctor@upriter.health", password: "doctor", name: "Dr. Sameeha Rao", language: "English", createdAt: Date.now() - 86400000 },
  { id: "demo-rec", role: "reception", email: "reception@upriter.health", password: "reception", name: "Priya Nair", language: "English", createdAt: Date.now() - 86400000 },
  { id: "demo-adm", role: "admin", email: "admin@upriter.health", password: "admin", name: "Arjun Iyer", language: "English", createdAt: Date.now() - 86400000 },
];

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      accounts: seed,
      currentId: null,
      remember: true,

      login: (role, identifier, password, remember = true) => {
        const acc = get().accounts.find((a) => matches(a, role, identifier));
        if (!acc) return { ok: false, error: "No account found for that role." };
        if (acc.password !== password) return { ok: false, error: "Incorrect password." };
        set({ currentId: acc.id, remember });
        return { ok: true };
      },

      signup: (data) => {
        const { accounts } = get();
        const v = (data.email ?? data.phone ?? "").trim().toLowerCase();
        if (!v) return { ok: false, error: "Email or phone is required." };
        const dup = accounts.find((a) => a.role === data.role && (
          (data.email && a.email?.toLowerCase() === data.email.toLowerCase()) ||
          (data.phone && a.phone === data.phone)
        ));
        if (dup) return { ok: false, error: "An account with this email/phone already exists for this role." };
        const account: Account = { ...data, id: uid(), createdAt: Date.now() };
        set({ accounts: [...accounts, account], currentId: account.id });
        return { ok: true, account };
      },

      logout: () => set({ currentId: null }),

      forgotPassword: (role, identifier, newPassword) => {
        const { accounts } = get();
        const i = accounts.findIndex((a) => matches(a, role, identifier));
        if (i < 0) return { ok: false, error: "No account found." };
        const next = [...accounts];
        next[i] = { ...next[i], password: newPassword };
        set({ accounts: next });
        return { ok: true };
      },

      updateCurrent: (patch) => {
        const { accounts, currentId } = get();
        if (!currentId) return;
        set({
          accounts: accounts.map((a) => a.id === currentId ? { ...a, ...patch } : a),
        });
      },
    }),
    { name: "upriter.auth.v1" }
  )
);

export function currentUser(state: AuthState): Account | null {
  return state.accounts.find((a) => a.id === state.currentId) ?? null;
}

export function homeFor(role: Role): string {
  if (role === "doctor") return "/doctor";
  if (role === "reception") return "/reception";
  if (role === "admin") return "/admin";
  return "/patient";
}

// Per-role allowed routes (prefix match). "/" and "/profile"/"/settings" are universal.
const PERMS: Record<Role, string[]> = {
  patient: ["/patient", "/journey", "/book", "/hospitals", "/doctors", "/first-aid", "/reports", "/history", "/prescriptions"],
  doctor: ["/doctor"],
  reception: ["/reception", "/display"],
  admin: ["/admin", "/doctor", "/reception", "/display", "/patient", "/journey", "/book", "/hospitals", "/doctors", "/reports", "/history", "/prescriptions", "/first-aid"],
};

export function canAccess(role: Role, pathname: string): boolean {
  if (pathname === "/" || pathname.startsWith("/profile") || pathname.startsWith("/settings") || pathname.startsWith("/privacy") || pathname.startsWith("/terms") || pathname.startsWith("/security") || pathname.startsWith("/onboarding")) return true;
  return PERMS[role].some((p) => pathname === p || pathname.startsWith(p + "/"));
}
