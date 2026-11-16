// Hand-written mirrors of the backend's Pydantic models (backend/models/*) — nothing infers
// across the HTTP boundary, so this file is kept in sync with those models in the same edit.

export interface ClinicWindow {
  day: number; // 0=Mon .. 6=Sun
  start: string; // HH:MM
  end: string; // HH:MM
}

export interface Doctor {
  id: string;
  name: string;
  specialisation: string;
  tagline: string;
  clinic_name: string;
  city: string;
  area: string;
  address: string;
  fee: number;
  experience_years: number;
  languages: string[];
  rating: number;
  reviews: number;
  image_url: string;
  about: string;
  email: string;
  windows: ClinicWindow[];
  created_at: string;
}

export interface Facet {
  name: string;
  count: number;
}

export interface DoctorMeta {
  doctors: number;
  cities: number;
  specialisations: number;
  specialisation_list: Facet[];
  city_list: Facet[];
  fee_max: number;
}

export interface Slot {
  time: string; // HH:MM
  status: "open" | "booked" | "past";
}

export interface SlotDay {
  doctor_id: string;
  date: string;
  days: string[];
  slots: Slot[];
}

export interface AppUser {
  user_id: string;
  email: string;
  name: string;
  role: "patient" | "doctor";
  doctor_id: string | null;
  phone: string;
  created_at: string;
}

export type ApptStatus = "PENDING_PAYMENT" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface Appointment {
  id: string;
  reference: string;
  doctor_id: string;
  doctor_name: string;
  doctor_specialisation: string;
  clinic_name: string;
  clinic_city: string;
  image_url: string;
  patient_user_id: string;
  patient_name: string;
  patient_phone: string;
  date: string;
  time: string;
  status: ApptStatus;
  amount: number;
  payment_mode: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentList {
  today: string;
  appointments: Appointment[];
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string | null;
  role: "user" | "assistant";
  content: string;
  matches: string[];
  created_at: string;
}

// Payload of the SSE "done" event from POST /api/chat/stream
export interface MiniDoctor {
  id: string;
  name: string;
  specialisation: string;
  city: string;
  area: string;
  fee: number;
  rating: number;
  image_url: string;
}
