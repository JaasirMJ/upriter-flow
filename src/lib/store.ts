import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { RiskLevel, ReviewStatus } from "@/lib/risk";

export type TokenStatus = "waiting" | "in_progress" | "completed" | "skipped" | "no_show";
export type DoctorStatus = "available" | "late" | "break";
export type Priority = "critical" | "high" | "regular" | "routine";

export interface Patient {
  id: string;
  token: number;
  name: string;
  age: number;
  phone: string;
  status: TokenStatus;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  appointmentTime?: string;
  isWalkIn?: boolean;
  priority?: Priority;
  symptoms?: string;
  aiLabel?: string;
  // AI Risk Assessment (recommendation only)
  riskLevel?: RiskLevel;
  riskLabels?: string[];
  suggestedDept?: string;
  recommendation?: string;
  confidence?: number;
  estDurationMins?: number;
  reviewStatus?: ReviewStatus;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  status: DoctorStatus;
  delayMins: number;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  departments: string[];
}

export interface Notification {
  id: string;
  text: string;
  type: "info" | "warning" | "success";
  time: number;
}

interface State {
  hospitals: Hospital[];
  doctors: Doctor[];
  activeDoctorId: string;
  patients: Patient[];
  currentToken: number;
  nextTokenNumber: number;
  myTokenId: string | null;
  consultationDurations: number[]; // minutes
  notifications: Notification[];
  lastReadNotifAt: number;
  travelTimeMins: number;

  // actions
  addPatient: (
    p: { name: string; age: number; phone: string; isWalkIn?: boolean; appointmentTime?: string; priority?: Priority; symptoms?: string; aiLabel?: string }
  ) => Patient;
  callNext: () => void;
  skipCurrent: () => void;
  markNoShow: () => void;
  startConsultation: () => void;
  endConsultation: () => void;
  setDoctorStatus: (status: DoctorStatus, delayMins?: number) => void;
  bookAppointment: (data: { name: string; age: number; phone: string; appointmentTime: string; priority?: Priority; symptoms?: string; aiLabel?: string }) => Patient;
  pushNotification: (n: Omit<Notification, "id" | "time">) => void;
  markNotificationsRead: () => void;
  setPatientPriority: (id: string, priority: Priority) => void;
  clearMyToken: () => void;
  reset: () => void;
}

const seedDoctors: Doctor[] = [
  { id: "d1", name: "Dr. Anjali Sharma", specialty: "Cardiology", hospital: "h1", status: "available", delayMins: 0 },
  { id: "d2", name: "Dr. Rohan Mehta", specialty: "Orthopedics", hospital: "h1", status: "available", delayMins: 0 },
  { id: "d3", name: "Dr. Priya Iyer", specialty: "Dermatology", hospital: "h1", status: "available", delayMins: 0 },
];

const seedHospitals: Hospital[] = [
  { id: "h1", name: "Apollo Multi-Speciality", city: "Bengaluru", departments: ["Cardiology", "Orthopedics", "Dermatology", "Neurology", "Pediatrics"] },
  { id: "h2", name: "Fortis Health City", city: "Bengaluru", departments: ["Cardiology", "Oncology", "ENT"] },
  { id: "h3", name: "Manipal General", city: "Bengaluru", departments: ["Orthopedics", "Pediatrics", "Dermatology"] },
];

// Build a realistic seed queue
function buildSeedPatients(): { patients: Patient[]; currentToken: number; nextTokenNumber: number } {
  const now = Date.now();
  const startToken = 50;
  const patients: Patient[] = [];
  const completedNames = ["Rajesh Kumar", "Sneha Patel", "Vikram Singh", "Anita Rao", "Manish Joshi"];
  // 5 completed before
  for (let i = 0; i < 5; i++) {
    patients.push({
      id: crypto.randomUUID(),
      token: startToken - 5 + i,
      name: completedNames[i],
      age: 30 + i * 3,
      phone: "98xxxx" + (1000 + i),
      status: "completed",
      createdAt: now - (60 - i * 10) * 60000,
      startedAt: now - (50 - i * 10) * 60000,
      endedAt: now - (40 - i * 10) * 60000,
    });
  }
  // current in progress
  patients.push({
    id: crypto.randomUUID(),
    token: startToken,
    name: "Karan Verma",
    age: 42,
    phone: "98xxxx1234",
    status: "in_progress",
    createdAt: now - 25 * 60000,
    startedAt: now - 4 * 60000,
  });
  // waiting (6 ahead of "you" who will be 57)
  const waiting = [
    "Neha Gupta", "Sanjay Reddy", "Pooja Nair", "Arjun Bose", "Kavya Menon", "Aditya Shah",
  ];
  waiting.forEach((n, i) => {
    patients.push({
      id: crypto.randomUUID(),
      token: startToken + 1 + i,
      name: n,
      age: 28 + i * 2,
      phone: "98xxxx" + (2000 + i),
      status: "waiting",
      createdAt: now - (20 - i * 2) * 60000,
      appointmentTime: new Date(now + (5 + i * 8) * 60000).toISOString(),
    });
  });
  return { patients, currentToken: startToken, nextTokenNumber: startToken + waiting.length + 1 };
}

const seed = buildSeedPatients();

export const useStore = create<State>()(
  subscribeWithSelector((set, get) => ({
    hospitals: seedHospitals,
    doctors: seedDoctors,
    activeDoctorId: "d1",
    patients: seed.patients,
    currentToken: seed.currentToken,
    nextTokenNumber: seed.nextTokenNumber,
    myTokenId: null,
    consultationDurations: [10, 8, 12, 9, 11, 7, 13],
    notifications: [
      { id: "seed-notif", text: "Welcome to Upriter — your queue is live.", type: "info", time: Date.now() - 60000 },
    ],
    travelTimeMins: 22,
    lastReadNotifAt: Date.now(),

    addPatient: ({ name, age, phone, isWalkIn, appointmentTime, priority, symptoms, aiLabel }) => {
      const token = get().nextTokenNumber;
      const p: Patient = {
        id: (typeof crypto !== "undefined" ? crypto.randomUUID() : String(Math.random())),
        token, name, age, phone,
        status: "waiting",
        createdAt: Date.now(),
        isWalkIn, appointmentTime,
        priority: priority ?? "regular",
        symptoms, aiLabel,
      };
      set((s) => ({ patients: [...s.patients, p], nextTokenNumber: s.nextTokenNumber + 1 }));
      get().pushNotification({ text: `Token #${token} issued for ${name}`, type: "success" });
      return p;
    },

    callNext: () => {
      const s = get();
      let patients = s.patients.map((p) =>
        p.status === "in_progress" ? { ...p, status: "completed" as TokenStatus, endedAt: Date.now() } : p
      );
      const completed = s.patients.find((p) => p.status === "in_progress");
      let durations = s.consultationDurations;
      if (completed && completed.startedAt) {
        const d = Math.max(3, Math.round((Date.now() - completed.startedAt) / 60000));
        durations = [...durations, d].slice(-30);
      }
      const next = [...patients].filter((p) => p.status === "waiting").sort((a, b) => a.token - b.token)[0];
      if (next) {
        patients = patients.map((p) => p.id === next.id ? { ...p, status: "in_progress", startedAt: Date.now() } : p);
        set({ patients, currentToken: next.token, consultationDurations: durations });
        get().pushNotification({ text: `Now serving token #${next.token} — ${next.name}`, type: "info" });
      } else {
        set({ patients, consultationDurations: durations });
      }
    },

    skipCurrent: () => {
      set((s) => ({
        patients: s.patients.map((p) => p.status === "in_progress" ? { ...p, status: "skipped" as TokenStatus } : p),
      }));
      get().pushNotification({ text: "Token skipped — will be recalled later.", type: "warning" });
      get().callNext();
    },

    markNoShow: () => {
      set((s) => ({
        patients: s.patients.map((p) => p.status === "in_progress" ? { ...p, status: "no_show" as TokenStatus } : p),
      }));
      get().pushNotification({ text: "Marked as No-Show.", type: "warning" });
      get().callNext();
    },

    startConsultation: () => {
      set((s) => ({
        patients: s.patients.map((p) =>
          p.status === "in_progress" && !p.startedAt ? { ...p, startedAt: Date.now() } : p
        ),
      }));
    },

    endConsultation: () => { get().callNext(); },

    setDoctorStatus: (status, delayMins = 0) => {
      set((s) => ({
        doctors: s.doctors.map((d) => d.id === s.activeDoctorId ? { ...d, status, delayMins } : d),
      }));
      const label =
        status === "late" ? `Doctor running late (+${delayMins} mins)` :
        status === "break" ? "Doctor on a short break" :
        "Doctor available — queue resumed";
      get().pushNotification({ text: label, type: status === "available" ? "success" : "warning" });
    },

    bookAppointment: ({ name, age, phone, appointmentTime, priority, symptoms, aiLabel }) => {
      const p = get().addPatient({ name, age, phone, appointmentTime, priority, symptoms, aiLabel });
      set({ myTokenId: p.id });
      return p;
    },

    markNotificationsRead: () => set({ lastReadNotifAt: Date.now() }),

    setPatientPriority: (id, priority) => {
      set((s) => ({ patients: s.patients.map((p) => p.id === id ? { ...p, priority } : p) }));
      get().pushNotification({ text: `Priority updated to ${priority.toUpperCase()}`, type: priority === "critical" || priority === "high" ? "warning" : "info" });
    },

    pushNotification: (n) => {
      set((s) => ({
        notifications: [
          { ...n, id: (typeof crypto !== "undefined" ? crypto.randomUUID() : String(Math.random())), time: Date.now() },
          ...s.notifications,
        ].slice(0, 30),
      }));
    },

    clearMyToken: () => set({ myTokenId: null }),

    reset: () => {
      const s = buildSeedPatients();
      set({
        patients: s.patients,
        currentToken: s.currentToken,
        nextTokenNumber: s.nextTokenNumber,
        myTokenId: null,
        consultationDurations: [10, 8, 12, 9, 11, 7, 13],
        notifications: [],
        doctors: seedDoctors,
      });
    },
  }))
);

// Cross-tab sync via BroadcastChannel
if (typeof window !== "undefined") {
  try {
    const bc = new BroadcastChannel("upriter-sync");
    let suppress = false;
    bc.onmessage = (e) => {
      suppress = true;
      useStore.setState(e.data);
      suppress = false;
    };
    useStore.subscribe((state) => {
      if (suppress) return;
      const { addPatient, callNext, skipCurrent, markNoShow, startConsultation, endConsultation, setDoctorStatus, bookAppointment, pushNotification, clearMyToken, reset, ...data } = state as any;
      bc.postMessage(data);
    });
  } catch {}
}

// ---- selectors ----

export function avgConsultMins(state: State): number {
  if (!state.consultationDurations.length) return 10;
  return state.consultationDurations.reduce((a, b) => a + b, 0) / state.consultationDurations.length;
}

export function activeDoctor(state: State): Doctor {
  return state.doctors.find((d) => d.id === state.activeDoctorId) ?? state.doctors[0];
}

export function patientsAhead(state: State, token: number): number {
  return state.patients.filter(
    (p) => p.status === "waiting" && p.token < token
  ).length + state.patients.filter((p) => p.status === "in_progress" && p.token < token).length;
}

export function estimatedWaitMins(state: State, token: number): number {
  const avg = avgConsultMins(state);
  const ahead = patientsAhead(state, token);
  const doc = activeDoctor(state);
  const delay = doc.status === "late" ? doc.delayMins : doc.status === "break" ? 10 : 0;
  return Math.max(0, Math.round(ahead * avg + delay));
}
