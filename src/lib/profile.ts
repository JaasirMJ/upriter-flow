// Persisted patient profile, favorites, reports, visits — separate from queue store.
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PatientProfile {
  phone: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  emergencyContact: string;
  language: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  createdAt: number;
}

export interface MedicalReport {
  id: string;
  name: string;
  category: "prescription" | "blood" | "mri" | "xray" | "pdf" | "image" | "other";
  mime: string;
  size: number;
  dataUrl: string; // base64
  uploadedAt: number;
}

export interface PatientVisit {
  id: string;
  hospitalId: string;
  hospitalName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string; // ISO
  time: string;
  consultationMins: number;
  waitedMins: number;
  hospitalAvgWaitMins: number;
  notes?: string;
  testsTaken?: number;
  tokenNumber?: number;
  status: "upcoming" | "completed" | "cancelled";
}

interface ProfileState {
  profile: PatientProfile | null;
  favorites: string[]; // hospital ids
  reports: MedicalReport[];
  visits: PatientVisit[];

  setProfile: (p: PatientProfile) => void;
  clearProfile: () => void;
  toggleFavorite: (hospitalId: string) => void;
  addReport: (r: Omit<MedicalReport, "id" | "uploadedAt">) => void;
  removeReport: (id: string) => void;
  addVisit: (v: Omit<PatientVisit, "id">) => PatientVisit;
  completeVisit: (id: string, patch: Partial<PatientVisit>) => void;
}

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Math.random());
}

// Seed visit history so dashboards have content for new users
function seedVisits(): PatientVisit[] {
  const now = Date.now();
  const day = 86400000;
  return [
    {
      id: uid(),
      hospitalId: "sss-chennai",
      hospitalName: "SSS Hospital",
      doctorId: "dr-sameeha",
      doctorName: "Dr. Sameeha",
      department: "Cardiology",
      date: new Date(now - 14 * day).toISOString(),
      time: "10:30",
      consultationMins: 14,
      waitedMins: 8,
      hospitalAvgWaitMins: 55,
      testsTaken: 2,
      notes: "ECG normal. BP 128/82.",
      status: "completed",
    },
    {
      id: uid(),
      hospitalId: "sss-chennai",
      hospitalName: "SSS Hospital",
      doctorId: "dr-sanah",
      doctorName: "Dr. Sanah",
      department: "General Medicine",
      date: new Date(now - 38 * day).toISOString(),
      time: "16:00",
      consultationMins: 9,
      waitedMins: 12,
      hospitalAvgWaitMins: 48,
      testsTaken: 1,
      status: "completed",
    },
    {
      id: uid(),
      hospitalId: "sss-chennai",
      hospitalName: "SSS Hospital",
      doctorId: "dr-saara",
      doctorName: "Dr. Saara",
      department: "Dermatology",
      date: new Date(now - 72 * day).toISOString(),
      time: "11:00",
      consultationMins: 11,
      waitedMins: 6,
      hospitalAvgWaitMins: 40,
      status: "completed",
    },
  ];
}

export const useProfile = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      favorites: ["sss-chennai"],
      reports: [],
      visits: seedVisits(),

      setProfile: (p) => set({ profile: p }),
      clearProfile: () => set({ profile: null }),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [...s.favorites, id],
        })),
      addReport: (r) =>
        set((s) => ({ reports: [{ ...r, id: uid(), uploadedAt: Date.now() }, ...s.reports] })),
      removeReport: (id) => set((s) => ({ reports: s.reports.filter((r) => r.id !== id) })),
      addVisit: (v) => {
        const visit: PatientVisit = { ...v, id: uid() };
        set((s) => ({ visits: [visit, ...s.visits] }));
        return visit;
      },
      completeVisit: (id, patch) =>
        set((s) => ({ visits: s.visits.map((v) => (v.id === id ? { ...v, ...patch } : v)) })),
    }),
    {
      name: "upriter.patient.profile.v1",
      // do not persist huge base64 reports beyond a soft cap; the store itself handles size
    }
  )
);

export function categorizeReport(filename: string, mime: string): MedicalReport["category"] {
  const f = filename.toLowerCase();
  if (/(prescr|rx)/.test(f)) return "prescription";
  if (/blood|cbc|lipid|sugar|hba1c/.test(f)) return "blood";
  if (/mri/.test(f)) return "mri";
  if (/xray|x-ray|chest/.test(f)) return "xray";
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("image/")) return "image";
  return "other";
}

export function healthSummary(visits: PatientVisit[], reportsCount: number) {
  const completed = visits.filter((v) => v.status === "completed");
  const totalVisits = completed.length;
  const totalTests = completed.reduce((a, v) => a + (v.testsTaken ?? 0), 0);
  const avgConsult = completed.length
    ? completed.reduce((a, v) => a + v.consultationMins, 0) / completed.length
    : 0;
  const timeSavedMins = completed.reduce(
    (a, v) => a + Math.max(0, v.hospitalAvgWaitMins - v.waitedMins),
    0
  );

  const hospitalCounts = new Map<string, { count: number; name: string }>();
  const doctorCounts = new Map<string, { count: number; name: string }>();
  const deptCounts = new Map<string, number>();
  for (const v of completed) {
    const hc = hospitalCounts.get(v.hospitalId) ?? { count: 0, name: v.hospitalName };
    hc.count++; hospitalCounts.set(v.hospitalId, hc);
    const dc = doctorCounts.get(v.doctorId) ?? { count: 0, name: v.doctorName };
    dc.count++; doctorCounts.set(v.doctorId, dc);
    deptCounts.set(v.department, (deptCounts.get(v.department) ?? 0) + 1);
  }
  const top = <T,>(m: Map<string, T>, sel: (t: T) => number): T | null => {
    let best: T | null = null;
    let bestN = -1;
    m.forEach((v) => {
      const n = sel(v);
      if (n > bestN) { bestN = n; best = v; }
    });
    return best;
  };
  const prefHospital = top(hospitalCounts, (v) => v.count);
  const prefDoctor = top(doctorCounts, (v) => v.count);
  let prefDept: string | null = null;
  let prefDeptN = -1;
  deptCounts.forEach((n, k) => { if (n > prefDeptN) { prefDeptN = n; prefDept = k; } });

  return {
    totalVisits,
    totalTests,
    reportsCount,
    avgConsultMins: Math.round(avgConsult),
    timeSavedHours: +(timeSavedMins / 60).toFixed(1),
    preferredHospital: prefHospital?.name ?? "—",
    preferredDoctor: prefDoctor?.name ?? "—",
    preferredDepartment: prefDept ?? "—",
    doctorsConsulted: doctorCounts.size,
  };
}
