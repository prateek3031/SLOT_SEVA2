import React from "react";
import { Star, MapPin, Clock, CalendarCheck, ShieldCheck } from "lucide-react";
import type { DoctorRecommendation } from "@/types/chat";

interface DoctorCardProps {
  doctor: DoctorRecommendation;
  onSelectSlot: (doctor: DoctorRecommendation) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onSelectSlot }) => {
  const avatarId = doctor.img || ((doctor.name.charCodeAt(3) || 12) % 20) + 10;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-blue-200 transition-all text-left">
      <div className="flex items-start gap-3.5 mb-3">
        <img
          src={`https://i.pravatar.cc/150?img=${avatarId}`}
          alt={doctor.name}
          className="w-14 h-14 rounded-full object-cover border-2 border-blue-50 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-tight truncate">
              {doctor.name}
            </h4>
            <ShieldCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />
          </div>
          <p className="text-xs font-semibold text-blue-600 mt-0.5">{doctor.specialty}</p>

          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
            <div className="flex items-center bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded font-medium border border-yellow-100">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
              {doctor.ratingAverage}
            </div>
            <span>•</span>
            <span>{doctor.experience || "10+ yrs"}</span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 mb-3 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <span className="font-medium text-gray-800">{doctor.clinicName}</span>
          <span className="text-gray-400">- {doctor.clinicAddress}</span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
          <span className="text-gray-500">Consultation Fee</span>
          <span className="font-bold text-gray-900">₹{doctor.consultationFee}</span>
        </div>
      </div>

      {doctor.availableSlots && doctor.availableSlots.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 mb-3 font-medium">
          <Clock className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
          <span>Earliest Slot: {doctor.availableSlots[0]}</span>
        </div>
      )}

      <button
        onClick={() => onSelectSlot(doctor)}
        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold py-2 px-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
      >
        <CalendarCheck className="h-4 w-4" />
        Choose Slot & Book
      </button>
    </div>
  );
};
