// Static seed data for Upriter — hospitals, doctors, cities (India)

export interface City {
  name: string;
  state: string;
  lat: number;
  lng: number;
}

export const CITIES: City[] = [
  // Tamil Nadu (preferred)
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  { name: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198 },
  { name: "Trichy", state: "Tamil Nadu", lat: 10.7905, lng: 78.7047 },
  { name: "Salem", state: "Tamil Nadu", lat: 11.6643, lng: 78.146 },
  { name: "Tirunelveli", state: "Tamil Nadu", lat: 8.7139, lng: 77.7567 },
  { name: "Erode", state: "Tamil Nadu", lat: 11.341, lng: 77.7172 },
  { name: "Vellore", state: "Tamil Nadu", lat: 12.9165, lng: 79.1325 },
  { name: "Thoothukudi", state: "Tamil Nadu", lat: 8.7642, lng: 78.1348 },
  // Metros
  { name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867 },
  { name: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777 },
  { name: "Delhi", state: "Delhi", lat: 28.7041, lng: 77.1025 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
];

export const LANGUAGES = ["English", "Tamil", "Hindi", "Telugu", "Malayalam", "Kannada"] as const;
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
export const GENDERS = ["Male", "Female", "Other"] as const;

export interface SeedHospital {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  departments: string[];
  queueLoad: "low" | "medium" | "high";
  avgWaitMins: number;
  doctorsAvailable: number;
  emergency24x7: boolean;
  rating: number;
  image?: string;
}

const ALL_DEPARTMENTS = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "ENT",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
];

export const HOSPITALS: SeedHospital[] = [
  {
    id: "sss-chennai",
    name: "SSS Hospital",
    city: "Chennai",
    state: "Tamil Nadu",
    lat: 13.0501,
    lng: 80.2521,
    departments: ALL_DEPARTMENTS,
    queueLoad: "medium",
    avgWaitMins: 22,
    doctorsAvailable: 14,
    emergency24x7: true,
    rating: 4.7,
  },
  {
    id: "apollo-chennai",
    name: "Apollo Speciality",
    city: "Chennai",
    state: "Tamil Nadu",
    lat: 13.0604,
    lng: 80.2496,
    departments: ["General Medicine", "Cardiology", "Neurology", "Orthopedics"],
    queueLoad: "high",
    avgWaitMins: 48,
    doctorsAvailable: 21,
    emergency24x7: true,
    rating: 4.6,
  },
  {
    id: "kmc-coimbatore",
    name: "KMC Multispeciality",
    city: "Coimbatore",
    state: "Tamil Nadu",
    lat: 11.0096,
    lng: 76.9636,
    departments: ["General Medicine", "Cardiology", "Dermatology", "ENT", "Pediatrics"],
    queueLoad: "low",
    avgWaitMins: 11,
    doctorsAvailable: 9,
    emergency24x7: true,
    rating: 4.5,
  },
  {
    id: "meenakshi-madurai",
    name: "Meenakshi Mission Hospital",
    city: "Madurai",
    state: "Tamil Nadu",
    lat: 9.9197,
    lng: 78.1289,
    departments: ["General Medicine", "Cardiology", "Orthopedics", "Pediatrics"],
    queueLoad: "medium",
    avgWaitMins: 26,
    doctorsAvailable: 12,
    emergency24x7: true,
    rating: 4.4,
  },
  {
    id: "manipal-bangalore",
    name: "Manipal Hospital",
    city: "Bangalore",
    state: "Karnataka",
    lat: 12.9606,
    lng: 77.6489,
    departments: ALL_DEPARTMENTS,
    queueLoad: "high",
    avgWaitMins: 55,
    doctorsAvailable: 32,
    emergency24x7: true,
    rating: 4.6,
  },
  {
    id: "kims-hyderabad",
    name: "KIMS Hospital",
    city: "Hyderabad",
    state: "Telangana",
    lat: 17.4255,
    lng: 78.4503,
    departments: ["General Medicine", "Cardiology", "Neurology", "ENT"],
    queueLoad: "medium",
    avgWaitMins: 33,
    doctorsAvailable: 18,
    emergency24x7: true,
    rating: 4.5,
  },
  {
    id: "fortis-mumbai",
    name: "Fortis Mulund",
    city: "Mumbai",
    state: "Maharashtra",
    lat: 19.1726,
    lng: 72.9425,
    departments: ALL_DEPARTMENTS,
    queueLoad: "high",
    avgWaitMins: 62,
    doctorsAvailable: 27,
    emergency24x7: true,
    rating: 4.4,
  },
  {
    id: "aiims-delhi",
    name: "AIIMS",
    city: "Delhi",
    state: "Delhi",
    lat: 28.5672,
    lng: 77.21,
    departments: ALL_DEPARTMENTS,
    queueLoad: "high",
    avgWaitMins: 78,
    doctorsAvailable: 41,
    emergency24x7: true,
    rating: 4.8,
  },
];

export interface SeedDoctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  hospitalId: string;
  experienceYears: number;
  languages: string[];
  consultationFee: number;
  avgConsultationMins: number;
  rating: number;
  patientsTreated: number;
  qualifications: string;
  about: string;
}

export const DOCTORS: SeedDoctor[] = [
  {
    id: "dr-sameeha",
    name: "Dr. Sameeha",
    specialty: "Cardiologist",
    department: "Cardiology",
    hospitalId: "sss-chennai",
    experienceYears: 14,
    languages: ["English", "Tamil", "Hindi"],
    consultationFee: 700,
    avgConsultationMins: 12,
    rating: 4.9,
    patientsTreated: 9420,
    qualifications: "MBBS, MD, DM (Cardiology)",
    about: "Interventional cardiologist focused on preventive cardiac care.",
  },
  {
    id: "dr-saara",
    name: "Dr. Saara",
    specialty: "Dermatologist",
    department: "Dermatology",
    hospitalId: "sss-chennai",
    experienceYears: 9,
    languages: ["English", "Tamil", "Malayalam"],
    consultationFee: 500,
    avgConsultationMins: 10,
    rating: 4.8,
    patientsTreated: 6210,
    qualifications: "MBBS, MD (Dermatology)",
    about: "Specialises in acne, pigmentation and cosmetic dermatology.",
  },
  {
    id: "dr-sanah",
    name: "Dr. Sanah",
    specialty: "General Physician",
    department: "General Medicine",
    hospitalId: "sss-chennai",
    experienceYears: 7,
    languages: ["English", "Tamil", "Hindi", "Telugu"],
    consultationFee: 350,
    avgConsultationMins: 9,
    rating: 4.7,
    patientsTreated: 11200,
    qualifications: "MBBS, MD (General Medicine)",
    about: "Family medicine, lifestyle disease management and diabetes care.",
  },
  {
    id: "dr-arun",
    name: "Dr. Arun Krishnan",
    specialty: "ENT Surgeon",
    department: "ENT",
    hospitalId: "sss-chennai",
    experienceYears: 11,
    languages: ["English", "Tamil", "Malayalam"],
    consultationFee: 600,
    avgConsultationMins: 11,
    rating: 4.6,
    patientsTreated: 5400,
    qualifications: "MBBS, MS (ENT)",
    about: "Endoscopic sinus and ear surgery specialist.",
  },
  {
    id: "dr-rohan",
    name: "Dr. Rohan Mehta",
    specialty: "Orthopedic Surgeon",
    department: "Orthopedics",
    hospitalId: "sss-chennai",
    experienceYears: 16,
    languages: ["English", "Hindi", "Tamil"],
    consultationFee: 750,
    avgConsultationMins: 13,
    rating: 4.7,
    patientsTreated: 8120,
    qualifications: "MBBS, MS (Ortho), Fellowship Joint Replacement",
    about: "Knee and hip replacement, sports injuries.",
  },
  {
    id: "dr-priya",
    name: "Dr. Priya Iyer",
    specialty: "Neurologist",
    department: "Neurology",
    hospitalId: "sss-chennai",
    experienceYears: 12,
    languages: ["English", "Tamil"],
    consultationFee: 800,
    avgConsultationMins: 14,
    rating: 4.8,
    patientsTreated: 4800,
    qualifications: "MBBS, MD, DM (Neurology)",
    about: "Stroke, epilepsy and movement disorders.",
  },
  {
    id: "dr-anjali",
    name: "Dr. Anjali Sharma",
    specialty: "Pediatrician",
    department: "Pediatrics",
    hospitalId: "sss-chennai",
    experienceYears: 10,
    languages: ["English", "Hindi", "Tamil"],
    consultationFee: 550,
    avgConsultationMins: 11,
    rating: 4.9,
    patientsTreated: 7800,
    qualifications: "MBBS, MD (Pediatrics)",
    about: "New-born care, vaccinations and child development.",
  },
  {
    id: "dr-vikram",
    name: "Dr. Vikram Reddy",
    specialty: "Cardiologist",
    department: "Cardiology",
    hospitalId: "apollo-chennai",
    experienceYears: 18,
    languages: ["English", "Tamil", "Telugu"],
    consultationFee: 900,
    avgConsultationMins: 13,
    rating: 4.7,
    patientsTreated: 12400,
    qualifications: "MBBS, MD, DM (Cardiology), FRCP",
    about: "Senior interventional cardiologist and angioplasty specialist.",
  },
  {
    id: "dr-divya",
    name: "Dr. Divya Subramanian",
    specialty: "General Physician",
    department: "General Medicine",
    hospitalId: "kmc-coimbatore",
    experienceYears: 6,
    languages: ["English", "Tamil"],
    consultationFee: 300,
    avgConsultationMins: 10,
    rating: 4.6,
    patientsTreated: 3900,
    qualifications: "MBBS, MD (Internal Medicine)",
    about: "Comprehensive adult primary care.",
  },
  {
    id: "dr-kumar",
    name: "Dr. Kumar Pandian",
    specialty: "Orthopedic Surgeon",
    department: "Orthopedics",
    hospitalId: "meenakshi-madurai",
    experienceYears: 20,
    languages: ["English", "Tamil"],
    consultationFee: 650,
    avgConsultationMins: 12,
    rating: 4.8,
    patientsTreated: 14200,
    qualifications: "MBBS, MS (Ortho)",
    about: "Trauma care and joint surgery.",
  },
  {
    id: "dr-meera",
    name: "Dr. Meera Nair",
    specialty: "Dermatologist",
    department: "Dermatology",
    hospitalId: "manipal-bangalore",
    experienceYears: 8,
    languages: ["English", "Malayalam", "Kannada"],
    consultationFee: 600,
    avgConsultationMins: 10,
    rating: 4.7,
    patientsTreated: 4600,
    qualifications: "MBBS, MD (Dermatology)",
    about: "Hair restoration and pigmentation.",
  },
  {
    id: "dr-raghav",
    name: "Dr. Raghav Menon",
    specialty: "Neurologist",
    department: "Neurology",
    hospitalId: "kims-hyderabad",
    experienceYears: 15,
    languages: ["English", "Hindi", "Telugu"],
    consultationFee: 850,
    avgConsultationMins: 14,
    rating: 4.7,
    patientsTreated: 5200,
    qualifications: "MBBS, MD, DM (Neurology)",
    about: "Headache clinic and neuro-rehabilitation.",
  },
];

export function hospitalById(id: string) {
  return HOSPITALS.find((h) => h.id === id);
}
export function doctorById(id: string) {
  return DOCTORS.find((d) => d.id === id);
}
export function doctorsByHospital(hospitalId: string) {
  return DOCTORS.filter((d) => d.hospitalId === hospitalId);
}
export function doctorsByDept(hospitalId: string, dept: string) {
  return DOCTORS.filter((d) => d.hospitalId === hospitalId && d.department === dept);
}

// 7-day availability calendar — deterministic per doctor
export function availabilityForDoctor(doctorId: string): { date: string; slots: string[] }[] {
  const days = 7;
  const out: { date: string; slots: string[] }[] = [];
  const allSlots = [
    "07:30", "08:30", "09:30",
    "11:30", "12:30", "13:30",
    "15:30", "16:30", "17:30",
    "19:30", "20:30",
  ];
  const seed = doctorId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const date = d.toISOString().slice(0, 10);
    const slots = allSlots.filter((_, idx) => ((idx + i + seed) % 3) !== 0);
    out.push({ date, slots });
  }
  return out;
}
