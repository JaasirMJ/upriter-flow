# Upriter — Patient Experience Expansion

This builds on the existing Upriter app (Zustand store, AppShell, dashboards). All changes are frontend-only (no backend), with data persisted to `localStorage` via the existing store pattern. WhatsApp "integration" will be simulated via a notification + deep-link to `wa.me` (no real Twilio/Meta setup — flag if you want real sending).

## 1. Onboarding (Uber/Ola-style) — `/onboarding`
Three-step flow stored permanently in `localStorage` under `upriter.patient.profile`. App boots into onboarding if no profile exists.

- **Step 1 — Phone**: country code (+91 default), 10-digit validation, mock OTP (any 4 digits accepted).
- **Step 2 — Location**: "Use Current Location" (browser geolocation → reverse-geocode against preset city list by nearest match using lat/lng table) or "Enter Manually" (searchable dropdown of preloaded Indian cities: 9 Tamil Nadu cities + 6 metros).
- **Step 3 — Profile**: Name, Age, Gender, Blood Group, Emergency Contact, Preferred Language (Tamil / English / Hindi / Telugu / Malayalam / Kannada).

## 2. Hospitals & Doctors Database — `src/lib/data.ts`
Seed data shipped as a static module + extended in store.

**Hospitals** (8 total, anchored by SSS Hospital, Chennai):
- name, city, state, lat/lng, departments[], queueLoad, avgWaitMins, doctorsAvailable, emergency24x7, distanceKm (computed)

**Doctors** (12+ with sample names):
- Dr. Sameeha (Cardiology), Dr. Saara (Dermatology), Dr. Sanah (General Physician) + 9 more across departments
- experienceYears, languages[], consultationFee, avgConsultationMins, rating, patientsTreated, availability calendar (next 7 days × 4 slots)

## 3. New Patient Pages
- **`/hospitals`** — Registered Hospitals: card grid with queue load, avg wait, doctors available, Emergency badge. Heart-icon to favorite.
- **`/hospitals/$hospitalId`** — Detail page → departments → doctors list.
- **`/doctors/$doctorId`** — Profile (experience, specialization, patients served, languages, ratings, availability calendar).
- **`/book`** — Uber-style booking wizard: Hospital → Department → Doctor → Date → Time Slot (Morning 7–10 / Afternoon 11–2 / Evening 3–6 / Night 7–11, color-coded by availability) → Confirm. On confirm: create patient token in store + push WhatsApp-style notification with `wa.me` link.
- **`/first-aid`** — Cards for Chest Pain, Burn, Bleeding, Stroke, Fractures. Each: step-by-step list, "Call Emergency" (`tel:108`), "Nearest ER" link. Disclaimer banner.
- **`/reports`** — Upload PDF/image (stored as base64 in localStorage, capped ~5MB total). Auto-categorize by filename keywords (prescription / blood / mri / xray / other). Filter & preview.
- **`/history`** — Visits timeline, total visits, tests, doctors consulted, reports count, conditions, avg consult duration, avg wait time saved.
- **`/privacy`**, **`/terms`**, **`/security`** — static content pages explaining encrypted records, RBAC, consent.

## 4. Patient Dashboard Enhancements (`/patient`)
- **My Health Summary card** at top: Total Visits, Total Tests, Avg Consultation Time, Time Saved (hrs), Preferred Hospital, Preferred Doctor (computed from visit history).
- **Preferred Hospital** + **Recently Visited** + **Suggested Nearby** sections (using haversine distance from user lat/lng).
- **Nearby Hospitals** strip with distance, travel time (distanceKm × 2.5 min/km), crowd color (green/yellow/red).

## 5. Admin Dashboard Additions (`/admin`)
Add tiles: Total Hospitals, Total Doctors, Total Patients, Total Appointments, Total Consultations — wired to store + seed data.

## 6. WhatsApp Simulation
Helper `sendWhatsApp(phone, message)` → creates a notification entry + opens `https://wa.me/<phone>?text=<msg>` in a new tab when user clicks "Send via WhatsApp". Triggers on: booking confirmation, token call, doctor delay, reminder (1hr before appt via setTimeout while app open), emergency contact alert. No real API.

## 7. Navigation
Update `AppShell.tsx` sidebar (patient role) to add: Hospitals, Book Appointment, First Aid, Reports, History. Footer links: Privacy / Terms / Security.

## Technical notes
- Pure frontend. All persistence via existing zustand `persist` middleware (extended schema: `profile`, `hospitals`, `doctors`, `favorites`, `reports`, `visits`).
- Reverse geocoding: local lat/lng table + nearest-neighbor (no external API).
- File uploads: `FileReader` → base64 → localStorage; warn if >5MB.
- Routes added under `src/routes/` flat convention (e.g. `hospitals.$hospitalId.tsx`).
- Onboarding gate: `__root.tsx` redirects to `/onboarding` if no profile and route ≠ landing/onboarding/privacy.

## Files to create
- `src/routes/onboarding.tsx`, `hospitals.tsx`, `hospitals.$hospitalId.tsx`, `doctors.$doctorId.tsx`, `book.tsx`, `first-aid.tsx`, `reports.tsx`, `history.tsx`, `privacy.tsx`, `terms.tsx`, `security.tsx`
- `src/lib/data.ts` (hospitals + doctors + cities seed)
- `src/lib/geo.ts` (haversine, nearest city)
- `src/lib/whatsapp.ts`
- `src/components/HealthSummary.tsx`, `NearbyHospitals.tsx`, `BookingWizard.tsx`, `OnboardingSteps.tsx`

## Files to edit
- `src/lib/store.ts` — extend types (profile, hospitals, doctors, favorites, reports, visits)
- `src/components/AppShell.tsx` — patient nav links
- `src/routes/__root.tsx` — onboarding gate
- `src/routes/patient.tsx` — health summary + nearby hospitals
- `src/routes/admin.tsx` — new stat tiles

## Out of scope (flag if you want them)
- Real WhatsApp Business API / Twilio sending — needs a server + credentials.
- Real OTP via SMS — currently mocked (any 4 digits).
- Real reverse geocoding (Google/Mapbox) — currently nearest-city from preset table.
- Auth/account sync across devices — profile lives in localStorage only.

Confirm to proceed, or tell me which sections to drop/expand.
