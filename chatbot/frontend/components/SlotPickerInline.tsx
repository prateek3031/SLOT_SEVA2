import React, { useState } from "react";
import { Clock, Calendar, ChevronRight } from "lucide-react";
import type { DoctorRecommendation } from "@/types/chat";

interface SlotPickerInlineProps {
  doctor: DoctorRecommendation;
  onSlotSelected: (date: string, timeSlot: string) => void;
  onCancel?: () => void;
}

export const SlotPickerInline: React.FC<SlotPickerInlineProps> = ({
  doctor,
  onSlotSelected,
  onCancel
}) => {
  const dates = [
    { label: "Today", value: "Today, 13 Nov" },
    { label: "Tomorrow", value: "Tomorrow, 14 Nov" },
    { label: "Sat, 15 Nov", value: "Sat, 15 Nov" },
    { label: "Sun, 16 Nov", value: "Sun, 16 Nov" },
  ];

  const [selectedDate, setSelectedDate] = useState(dates[0].value);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const slotGroups = {
    Morning: ["09:30 AM", "10:30 AM", "11:15 AM"],
    Afternoon: ["02:00 PM", "03:15 PM", "04:30 PM"],
    Evening: ["05:30 PM", "06:15 PM", "07:00 PM"],
  };

  const unavailableSlots = ["10:30 AM", "03:15 PM"];

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-md p-4 text-left my-2 animate-in fade-in slide-in-from-bottom-2">
      <div className="border-b border-gray-100 pb-3 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Step 1: Select Appointment Time
          </span>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-xs text-gray-400 hover:text-gray-600 font-medium"
            >
              Cancel
            </button>
          )}
        </div>
        <h4 className="font-bold text-gray-900 text-sm mt-0.5">
          {doctor.name} <span className="text-gray-400 font-normal">({doctor.specialty})</span>
        </h4>
      </div>

      {/* Date tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
        {dates.map((d) => (
          <button
            key={d.value}
            onClick={() => {
              setSelectedDate(d.value);
              setSelectedSlot(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedDate === d.value
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Time Slots */}
      <div className="space-y-3 mb-4">
        {Object.entries(slotGroups).map(([period, slots]) => (
          <div key={period}>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {period}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {slots.map((slot) => {
                const isUnavailable = unavailableSlots.includes(slot);
                const isSelected = selectedSlot === slot;

                return (
                  <button
                    key={slot}
                    disabled={isUnavailable}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1"
                        : isUnavailable
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                        : "bg-gray-50 hover:bg-blue-50 text-gray-800 border border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        disabled={!selectedSlot}
        onClick={() => {
          if (selectedSlot) {
            onSlotSelected(selectedDate, selectedSlot);
          }
        }}
        className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
          selectedSlot
            ? "bg-brand-900 hover:bg-brand-700 text-white shadow-sm"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        <span>Continue to Patient Details & Payment</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};
