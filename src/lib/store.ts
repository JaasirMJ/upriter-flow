import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

export type TokenStatus = "waiting" | "in_progress" | "completed" | "skipped" | "no_show";
export type DoctorStatus = "available" | "late" | "break";

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
  travelTimeMins: number;

  // actions
  addPatient: (
    p: { name: string; age: number; phone: string; isWalkIn?: boolean; appointmentTime?: string }
  ) => Patient;
  callNext: () => void;
  skipCurrent: () => void;
  markNoShow: () => void;
  startConsultation: () => void;
  endConsultation: () => void;
  setDoctorStatus: (status: DoctorStatus, delayMins?: number) => void;
  bookAppointment: (data: { name: string; age: number; phone: string; appointmentTime: string }) => Patient;
  pushNotification: (n: Omit<Notification, "id" | "time">) => void;
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
  subscribeWithSelector(
    persist(
      (set, get) => ({
        hospitals: seedHospitals,
        doctors: seedDoctors,
        activeDoctorId: "d1",
        patients: seed.patients,
        currentToken: seed.currentToken,
        nextTokenNumber: seed.nextTokenNumber,
        myTokenId: null,
        consultationDurations: [10, 8, 12, 9, 11, 7, 13],
        notifications: [
          { id: crypto.randomUUID(), text: "Welcome to Upriter — your queue is live.", type: "info", time: Date.now() - 60000 },
        ],
        travelTimeMins: 22,

        addPatient: ({ name, age, phone, isWalkIn, appointmentTime }) => {
          const token = get().nextTokenNumber;
          const p: Patient = {
            id: crypto.randomUUID(),
            token,
            name,
            age,
            phone,
            status: "waiting",
            createdAt: Date.now(),
            isWalkIn,
            appointmentTime,
          };
          set((s) => ({ patients: [...s.patients, p], nextTokenNumber: s.nextTokenNumber + 1 }));
          get().pushNotification({ text: `Token #${token} issued for ${name}`, type: "success" });
          return p;
        },

        callNext: () => {
          const s = get();
          // end any in-progress
          let patients = s.patients.map((p) => {
            if (p.status === "in_progress") {
              const startedAt = p.startedAt ?? Date.now() - 8 * 60000;
              const durationMin = Math.max(3, Math.round((Date.now() - startedAt) / 60000));
              return { ...p, status: "completed" as TokenStatus, endedAt: Date.now() };
            }
            return p;
          });
          const completed = s.patients.find((p) => p.status === "in_progress");
          let durations = s.consultationDurations;
          if (completed && completed.startedAt) {
            const d = Math.max(3, Math.round((Date.now() - completed.startedAt) / 60000));
            durations = [...durations, d].slice(-30);
          }
          // next waiting
          const next = [...patients]
            .filter((p) => p.status === "waiting")
            .sort((a, b) => a.token - b.token)[0];
          if (next) {
            patients = patients.map((p) =>
              p.id === next.id ? { ...p, status: "in_progress", startedAt: Date.now() } : p
            );
            set({ patients, currentToken: next.token, consultationDurations: durations });
            get().pushNotification({ text: `Now serving token #${next.token} — ${next.name}`, type: "info" });
          } else {
            set({ patients, consultationDurations: durations });
          }
        },

        skipCurrent: () => {
          const s = get();
          const patients = s.patients.map((p) =>
            p.status === "in_progress" ? { ...p, status: "skipped" as TokenStatus } : p
          );
          set({ patients });
          get().pushNotification({ text: "Token skipped — will be recalled later.", type: "warning" });
          get().callNext();
        },

        markNoShow: () => {
          const s = get();
          const patients = s.patients.map((p) =>
            p.status === "in_progress" ? { ...p, status: "no_show" as TokenStatus } : p
          );
          set({ patients });
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

        endConsultation: () => {
          get().callNext();
        },

        setDoctorStatus: (status, delayMins = 0) => {
          set((s) => ({
            doctors: s.doctors.map((d) =>
              d.id === s.activeDoctorId ? { ...d, status, delayMins } : d
            ),
          }));
          const label =
            status === "late" ? `Doctor running late (+${delayMins} mins)` :
            status === "break" ? "Doctor on a short break" :
            "Doctor available — queue resumed";
          get().pushNotification({ text: label, type: status === "available" ? "success" : "warning" });
        },

        bookAppointment: ({ name, age, phone, appointmentTime }) => {
          const p = get().addPatient({ name, age, phone, appointmentTime });
          set({ myTokenId: p.id });
          return p;
        },

        pushNotification: (n) => {
          set((s) => ({
            notifications: [
              { ...n, id: crypto.randomUUID(), time: Date.now() },
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
      }),
      {
        name: "upriter-store-v1",
        // only persist in browser
        storage: typeof window !== "undefined"
          ? undefined
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} } as any,
      }
    )
  )
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
