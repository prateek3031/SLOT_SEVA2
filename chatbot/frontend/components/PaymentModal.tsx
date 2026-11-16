import React, { useState } from "react";
import {
  X,
  QrCode,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Clock,
  Calendar,
  MapPin,
  Lock
} from "lucide-react";
import type { DoctorRecommendation, BookingDetails } from "@/types/chat";

interface PaymentModalProps {
  doctor: DoctorRecommendation;
  date: string;
  timeSlot: string;
  onClose: () => void;
  onSuccess: (booking: BookingDetails) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  doctor,
  date,
  timeSlot,
  onClose,
  onSuccess
}) => {
  const [patientName, setPatientName] = useState("Prateek Verma");
  const [patientPhone, setPatientPhone] = useState("+91 98765 43210");
  const [patientEmail, setPatientEmail] = useState("prateek@example.com");
  const [reason, setReason] = useState("AI Symptom Consultation");

  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "PAY_AT_CLINIC">("UPI");
  const [upiId, setUpiId] = useState("prateek@okaxis");

  const [isProcessing, setIsProcessing] = useState(false);
  const [stepMessage, setStepMessage] = useState("Initializing payment gateway...");

  const fee = doctor.consultationFee || 500;
  const platformFee = 0;
  const total = fee + platformFee;

  const handlePayAndBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (paymentMethod === "PAY_AT_CLINIC") {
      setStepMessage("Reserving your clinic appointment...");
    } else {
      setStepMessage("Authorizing UPI payment...");
    }

    // Realistic secure payment simulation delay
    setTimeout(() => {
      setStepMessage("Confirming appointment slot with clinic...");
      setTimeout(() => {
        const bookingId = "SS-" + Math.floor(10000 + Math.random() * 90000);
        const txnId =
          paymentMethod === "PAY_AT_CLINIC"
            ? null
            : `TXN_UPI_${Date.now().toString(36).toUpperCase()}`;

        const bookingDetails: BookingDetails = {
          bookingId,
          transactionId: txnId,
          doctorId: doctor._id,
          doctorName: doctor.name,
          specialty: doctor.specialty,
          clinicName: doctor.clinicName,
          clinicAddress: doctor.clinicAddress,
          patient: {
            name: patientName,
            phone: patientPhone,
            email: patientEmail
          },
          appointmentDate: date,
          timeSlot: timeSlot,
          reasonForVisit: reason,
          amount: total,
          paymentMethod,
          paymentStatus: paymentMethod === "PAY_AT_CLINIC" ? "Pending (Pay at Clinic)" : "Paid Online via UPI",
          status: "confirmed",
          createdAt: new Date().toISOString()
        };

        setIsProcessing(false);
        onSuccess(bookingDetails);
      }, 800);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden text-left relative flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-brand-900 text-white p-5 flex items-center justify-between relative">
          <div>
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> 256-bit Encrypted Checkout
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">Confirm Appointment & Payment</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Appointment Summary Box */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-brand-900 text-base">{doctor.name}</h4>
                <p className="text-xs font-semibold text-blue-600">{doctor.specialty}</p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-gray-400" /> {doctor.clinicName}, {doctor.clinicAddress}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 block">Total Payable</span>
                <span className="text-xl font-extrabold text-brand-900">₹{total}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-blue-100/80 flex items-center gap-4 text-xs font-semibold text-gray-700">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-blue-600" /> {date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-blue-600" /> {timeSlot}
              </span>
            </div>
          </div>

          <form onSubmit={handlePayAndBook} className="space-y-4">
            {/* Patient Information */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Patient Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Patient name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 Phone"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector (Only UPI & Pay at Clinic) */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Select Payment Mode
              </h4>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === "UPI"
                      ? "bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-sm"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <QrCode className="h-5 w-5" />
                  <span className="text-xs sm:text-sm">Pay Online (UPI)</span>
                  <span className="text-[10px] text-blue-600 font-medium">GPay / PhonePe / Paytm</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("PAY_AT_CLINIC")}
                  className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === "PAY_AT_CLINIC"
                      ? "bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-sm"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Wallet className="h-5 w-5" />
                  <span className="text-xs sm:text-sm">Pay at Clinic</span>
                  <span className="text-[10px] text-gray-500 font-medium">Cash / Pay on Arrival</span>
                </button>
              </div>

              {/* Sub-inputs depending on mode */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-xs text-gray-700">
                {paymentMethod === "UPI" && (
                  <div>
                    <label className="block font-medium mb-1.5 text-gray-800">
                      Enter UPI ID (Google Pay, PhonePe, Paytm, BHIM)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1.5 rounded-lg text-[11px] flex items-center">
                        Verified
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">
                      Instant slot locking. No convenience fee or surcharge applied.
                    </p>
                  </div>
                )}

                {paymentMethod === "PAY_AT_CLINIC" && (
                  <div className="flex items-start gap-2.5 text-emerald-800">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Zero Prepayment Required</p>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        Your appointment slot will be reserved immediately. You can pay ₹{total} directly at the clinic reception on arrival.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Total breakdown */}
            <div className="border-t border-gray-100 pt-3 space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Doctor Consultation Fee</span>
                <span>₹{fee}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Platform Booking Fee</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-gray-900 pt-1 border-t border-gray-100">
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-brand-900 hover:bg-brand-700 active:scale-[0.99] text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{stepMessage}</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-emerald-400" />
                    <span>
                      {paymentMethod === "PAY_AT_CLINIC"
                        ? "Reserve Slot & Confirm Appointment"
                        : `Pay ₹${total} via UPI & Confirm Slot`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
