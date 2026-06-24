// AI Risk Assessment engine (heuristic, demo).
// Output is a RECOMMENDATION only — reviewed by reception + doctors.

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ReviewStatus = "pending" | "approved" | "fast_track" | "doctor_review" | "rejected";

export interface RiskAssessment {
  riskLevel: RiskLevel;
  confidence: number;       // 0-100
  suggestedDept: string;
  estDurationMins: number;
  labels: string[];         // ICU Review Suggested, Ambulance Recommendation Available, Pregnancy Priority...
  recommendation: string;
  ambulanceRecommended: boolean;
  reasons: string[];
}

interface Input {
  symptoms: string;
  history?: string;
  age?: number;
  pregnant?: boolean;
}

const CRITICAL = ["chest pain", "breath", "shortness of breath", "unconscious", "stroke", "seizure", "cardiac", "heart attack", "severe bleeding", "cannot breathe", "blue lips"];
const HIGH = ["high fever", "vomit", "severe pain", "abdominal pain", "fracture", "blood", "dizz", "fainted", "diabetic", "104", "103"];
const LOW = ["follow up", "follow-up", "checkup", "check up", "routine", "prescription", "vaccination", "report review", "renewal"];

const DEPT_MAP: Array<{ kw: string[]; dept: string }> = [
  { kw: ["chest", "cardiac", "heart", "palpitation"], dept: "Cardiology" },
  { kw: ["breath", "cough", "asthma", "lung"], dept: "Pulmonology" },
  { kw: ["fracture", "bone", "joint", "back pain"], dept: "Orthopedics" },
  { kw: ["skin", "rash", "acne"], dept: "Dermatology" },
  { kw: ["abdomen", "abdominal", "stomach", "vomit", "nausea"], dept: "Gastroenterology" },
  { kw: ["pregnan", "obstetric"], dept: "Obstetrics" },
  { kw: ["child", "pediatric", "infant"], dept: "Pediatrics" },
  { kw: ["diabet", "thyroid", "endocrine"], dept: "Endocrinology" },
  { kw: ["stroke", "seizure", "neuro", "headache"], dept: "Neurology" },
];

export function assessRisk({ symptoms, history = "", age, pregnant }: Input): RiskAssessment {
  const text = (symptoms + " " + history).toLowerCase();
  const reasons: string[] = [];
  const labels: string[] = [];
  let riskLevel: RiskLevel = "low";
  let confidence = 78;

  const isCritical = CRITICAL.some((k) => text.includes(k));
  const isHigh = HIGH.some((k) => text.includes(k));
  const isLow = LOW.some((k) => text.includes(k));

  if (isCritical) {
    riskLevel = "critical";
    confidence = 92;
    reasons.push("Critical symptom indicators detected.");
    reasons.push("Time-sensitive — recommend immediate triage.");
    labels.push("Emergency Review Needed");
    labels.push("Ambulance Recommendation Available");
  } else if (isHigh) {
    riskLevel = "high";
    confidence = 84;
    reasons.push("High-risk indicators present.");
    reasons.push("Recommend fast-track placement.");
    labels.push("ICU Review Suggested");
  } else if (isLow) {
    riskLevel = "low";
    confidence = 88;
    reasons.push("Routine / follow-up keywords detected.");
  } else if (text.trim()) {
    riskLevel = "medium";
    confidence = 72;
    reasons.push("Standard symptom profile — routine queue placement.");
  }

  // Demographic boosts
  if (pregnant || /pregnan/.test(text)) {
    labels.push("Pregnancy Priority");
    if (riskLevel === "medium" || riskLevel === "low") riskLevel = "high";
    reasons.push("Pregnancy detected — elevated priority.");
  }
  if (typeof age === "number") {
    if (age >= 65) {
      labels.push("Senior Citizen Priority");
      if (riskLevel === "medium") riskLevel = "high";
      reasons.push("Senior citizen — priority queue recommended.");
    }
    if (age <= 12) {
      labels.push("Child Priority");
      if (riskLevel === "medium") riskLevel = "high";
      reasons.push("Pediatric patient — priority queue recommended.");
    }
    if (age <= 5 && isCritical) {
      labels.push("Child Priority");
    }
  }

  // Suggested department
  let suggestedDept = "General Medicine";
  for (const { kw, dept } of DEPT_MAP) {
    if (kw.some((k) => text.includes(k))) { suggestedDept = dept; break; }
  }
  if (labels.includes("Pregnancy Priority")) suggestedDept = "Obstetrics";
  if (labels.includes("Child Priority")) suggestedDept = "Pediatrics";

  const estDurationMins =
    riskLevel === "critical" ? 25 :
    riskLevel === "high" ? 18 :
    riskLevel === "low" ? 8 : 12;

  const recommendation =
    riskLevel === "critical"
      ? "Potential emergency detected. Please seek immediate medical attention."
      : riskLevel === "high"
      ? "Fast-track review recommended. Please head to reception promptly."
      : riskLevel === "low"
      ? "Routine visit — arrive close to your booked slot."
      : "Standard consultation — follow your scheduled appointment.";

  return {
    riskLevel,
    confidence: Math.min(99, confidence + (Array.from(new Set(labels)).length * 2)),
    suggestedDept,
    estDurationMins,
    labels: Array.from(new Set(labels)),
    recommendation,
    ambulanceRecommended: riskLevel === "critical",
    reasons,
  };
}

export const RISK_META: Record<RiskLevel, { label: string; cls: string; ring: string; dot: string }> = {
  low:      { label: "Low Risk",                 cls: "bg-success/10 text-success border-success/30",            ring: "ring-success/30",  dot: "bg-success" },
  medium:   { label: "Medium Risk",              cls: "bg-warning/15 text-warning-foreground border-warning/40", ring: "ring-warning/30",  dot: "bg-warning" },
  high:     { label: "High Risk",                cls: "bg-orange-500/15 text-orange-600 border-orange-500/40 dark:text-orange-300", ring: "ring-orange-500/30", dot: "bg-orange-500" },
  critical: { label: "Critical Review Required", cls: "bg-destructive/10 text-destructive border-destructive/40", ring: "ring-destructive/40", dot: "bg-destructive" },
};

export function riskToPriority(r: RiskLevel): "critical" | "high" | "regular" | "routine" {
  return r === "critical" ? "critical" : r === "high" ? "high" : r === "low" ? "routine" : "regular";
}
