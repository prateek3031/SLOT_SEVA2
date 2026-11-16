import React from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Download,
  Receipt,
  User,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import type { BookingDetails } from "@/types/chat";

interface BookingConfirmationReceiptProps {
  booking: BookingDetails;
  onReset?: () => void;
}

export const BookingConfirmationReceipt: React.FC<BookingConfirmationReceiptProps> = ({
  booking,
  onReset
}) => {
  return (
    <div className="bg-white rounded-2xl border border-emerald-200 shadow-md p-4 text-left my-2 overflow-hidden relative">
      <div className="bg-emerald-500 text-white px-3 py-1.5 -mx-4 -mt-4 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-xs">
          <CheckCircle2 className="h-4 w-4" />
          <span>Appointment Confirmed</span>
        </div>
        <span className="font-mono text-xs font-bold bg-white/20 px-2 py-0.5 rounded">
          {booking.bookingId}
        </span>
      </div>

      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
            {booking.doctorName}
          </h4>
          <p className="text-xs font-semibold text-blue-600">{booking.specialty}</p>
        </div>
        <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-lg p-1 flex items-center justify-center flex-shrink-0">
          <QrCode className="w-full h-full text-gray-700" />
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 mb-3">
        <div className="flex items-center gap-1.5 font-medium text-gray-800">
          <Calendar className="h-3.5 w-3.5 text-blue-600" />
          <span>{booking.appointmentDate}</span>
          <span className="text-gray-400">•</span>
          <Clock className="h-3.5 w-3.5 text-blue-600" />
          <span>{booking.timeSlot}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <span className="font-medium text-gray-800">{booking.clinicName}</span>
          <span className="text-gray-400">({booking.clinicAddress})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <span>Patient: {booking.patient.name} ({booking.patient.phone})</span>
        </div>
      </div>

      {/* Payment info */}
      <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-900 border border-emerald-100 px-3 py-2 rounded-xl mb-3">
        <div className="flex items-center gap-1.5">
          <Receipt className="h-4 w-4 text-emerald-600" />
          <div>
            <span className="font-bold">{booking.paymentStatus}</span>
            {booking.transactionId && (
              <span className="text-[10px] text-gray-500 block font-mono">
                {booking.transactionId}
              </span>
            )}
          </div>
        </div>
        <span className="font-extrabold text-sm">₹{booking.amount}</span>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <button
          onClick={() => window.print()}
          className="w-full bg-brand-900 hover:bg-brand-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <Download className="h-4 w-4" />
          <span>Download / Print Appointment Slip</span>
        </button>

        {onReset && (
          <button
            onClick={onReset}
            className="w-full text-center text-xs text-blue-600 hover:text-blue-800 font-semibold py-1 flex items-center justify-center gap-1"
          >
            <span>+ Start Another Health Consultation</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
};
