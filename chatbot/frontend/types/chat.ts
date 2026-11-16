export interface DoctorRecommendation {
  _id: string;
  name: string;
  specialty: string;
  experience?: string;
  ratingAverage: number;
  ratingCount: number;
  consultationFee: number;
  clinicName: string;
  clinicAddress: string;
  location?: {
    type: string;
    coordinates: number[];
  };
  visitDurationMinutes?: number;
  availableSlots?: string[];
  img?: number;
}

export interface BookingDetails {
  bookingId: string;
  transactionId?: string | null;
  doctorId: string;
  doctorName: string;
  specialty: string;
  clinicName: string;
  clinicAddress: string;
  patient: {
    name: string;
    phone: string;
    email?: string;
  };
  appointmentDate: string;
  timeSlot: string;
  reasonForVisit: string;
  amount: number;
  paymentMethod: "UPI" | "PAY_AT_CLINIC";
  paymentStatus: string;
  status: "confirmed" | "completed" | "cancelled";
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  isEmergency?: boolean;
  recommendedSpecialty?: string;
  specialtyReason?: string;
  doctors?: DoctorRecommendation[];
  selectedDoctor?: DoctorRecommendation | null;
  selectedDate?: string;
  selectedSlot?: string;
  bookingReceipt?: BookingDetails;
  showSlotPicker?: boolean;
  showPaymentModal?: boolean;
  quickReplies?: string[];
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}
