// Local demo auth. Accounts persist in localStorage; no backend.
// Passwords are stored as PBKDF2-SHA256 hashes with a per-account random salt —
// the plaintext is never written to storage. Note: because the entire auth
// runs in the browser, this is suitable for a demo only and provides no
// protection against a user who edits their own browser storage.
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "patient" | "doctor" | "reception" | "admin";

export interface Account {
  id: string;
  role: Role;
  email?: string;
  phone?: string;
  /** PBKDF2-SHA256 hash, base64. */
  passwordHash: string;
  /** Random salt, base64. */
  passwordSalt: string;
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
  login: (role: Role, identifier: string, password: string, remember?: boolean) => Promise<{ ok: boolean; error?: string }>;
  signup: (data: Omit<Account, "id" | "createdAt" | "passwordHash" | "passwordSalt"> & { password: string }) => Promise<{ ok: boolean; error?: string; account?: Account }>;
  logout: () => void;
  updateCurrent: (patch: Partial<Omit<Account, "id" | "role" | "createdAt" | "passwordHash" | "passwordSalt">>) => void;
}

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Math.random());
}

function bytesToB64(b: Uint8Array): string {
  let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s);
}
function b64ToBytes(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function derivePasswordHash(password: string, saltB64?: string): Promise<{ hash: string; salt: string }> {
  const saltBytes = saltB64 ? b64ToBytes(saltB64) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes as BufferSource, iterations: 100_000, hash: "SHA-256" },
    key,
    256,
  );
  return { hash: bytesToB64(new Uint8Array(bits)), salt: bytesToB64(saltBytes) };
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function matches(a: Account, role: Role, id: string): boolean {
  if (a.role !== role) return false;
  const v = id.trim().toLowerCase();
  if (!v) return false;
  return a.email?.toLowerCase() === v || a.phone === id.trim();
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      // No seeded staff accounts — credentials must be created by signup.
      accounts: [],
      currentId: null,
      remember: true,

      login: async (role, identifier, password, remember = true) => {
        const acc = get().accounts.find((a) => matches(a, role, identifier));
        if (!acc) return { ok: false, error: "No account found for that role." };
        if (!acc.passwordSalt || !acc.passwordHash) {
          return { ok: false, error: "This account needs to be re-created." };
        }
        const { hash } = await derivePasswordHash(password, acc.passwordSalt);
        if (!timingSafeEqual(hash, acc.passwordHash)) {
          return { ok: false, error: "Incorrect password." };
        }
        set({ currentId: acc.id, remember });
        return { ok: true };
      },

      signup: async (data) => {
        const { accounts } = get();
        const v = (data.email ?? data.phone ?? "").trim().toLowerCase();
        if (!v) return { ok: false, error: "Email or phone is required." };
        if (!data.password || data.password.length < 8) {
          return { ok: false, error: "Password must be at least 8 characters." };
        }
        const dup = accounts.find((a) => a.role === data.role && (
          (data.email && a.email?.toLowerCase() === data.email.toLowerCase()) ||
          (data.phone && a.phone === data.phone)
        ));
        if (dup) return { ok: false, error: "An account with this email/phone already exists for this role." };
        const { hash, salt } = await derivePasswordHash(data.password);
        const { password: _drop, ...rest } = data;
        const account: Account = {
          ...rest,
          id: uid(),
          createdAt: Date.now(),
          passwordHash: hash,
          passwordSalt: salt,
        };
        set({ accounts: [...accounts, account], currentId: account.id });
        return { ok: true, account };
      },

      logout: () => set({ currentId: null }),

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
