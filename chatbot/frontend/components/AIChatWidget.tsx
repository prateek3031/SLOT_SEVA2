import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  AlertTriangle,
  RefreshCw,
  Minus,
  Maximize2,
  Stethoscope,
  ExternalLink
} from "lucide-react";
import { DoctorCard } from "./DoctorCard";
import { SlotPickerInline } from "./SlotPickerInline";
import { PaymentModal } from "./PaymentModal";
import { BookingConfirmationReceipt } from "./BookingConfirmationReceipt";
import type { ChatMessage, DoctorRecommendation, BookingDetails } from "@/types/chat";
import { api } from "@/api/client";

const CLIENT_FALLBACK_DOCTORS: Record<string, DoctorRecommendation[]> = {
  Cardiology: [
    {
      _id: "doc-1",
      name: "Dr. Rahul Sharma",
      specialty: "Cardiologist",
      experience: "12 years",
      ratingAverage: 4.8,
      ratingCount: 124,
      consultationFee: 500,
      clinicName: "ABC Clinic",
      clinicAddress: "Sector 4, Rajpura",
      availableSlots: ["Today 04:30 PM", "Tomorrow 10:00 AM", "Tomorrow 02:30 PM"],
      img: 11
    }
  ],
  Dermatology: [
    {
      _id: "doc-2",
      name: "Dr. Priya Patel",
      specialty: "Dermatologist",
      experience: "8 years",
      ratingAverage: 4.9,
      ratingCount: 89,
      consultationFee: 800,
      clinicName: "Skin Care Hub",
      clinicAddress: "Indiranagar, Bengaluru",
      availableSlots: ["Tomorrow 10:00 AM", "Tomorrow 11:30 AM"],
      img: 12
    }
  ],
  Pediatrics: [
    {
      _id: "doc-4",
      name: "Dr. Sneha Reddy",
      specialty: "Pediatrician",
      experience: "10 years",
      ratingAverage: 4.9,
      ratingCount: 156,
      consultationFee: 600,
      clinicName: "Little Smiles Clinic",
      clinicAddress: "Whitefield, Bengaluru",
      availableSlots: ["Tomorrow 02:30 PM", "Tomorrow 04:00 PM"],
      img: 14
    }
  ],
  Orthopedics: [
    {
      _id: "doc-6",
      name: "Dr. Kavita Reddy",
      specialty: "Orthopedic Surgeon",
      experience: "14 years",
      ratingAverage: 4.8,
      ratingCount: 98,
      consultationFee: 700,
      clinicName: "Whitefield Orthopedic Center",
      clinicAddress: "Whitefield, Bengaluru",
      availableSlots: ["Tomorrow 10:30 AM", "Tomorrow 01:00 PM"],
      img: 16
    }
  ],
  Dentist: [
    {
      _id: "doc-5",
      name: "Dr. Vikram Singh",
      specialty: "Dentist",
      experience: "6 years",
      ratingAverage: 4.6,
      ratingCount: 72,
      consultationFee: 300,
      clinicName: "Bright Teeth Studio",
      clinicAddress: "Jayanagar, Bengaluru",
      availableSlots: ["Today 05:15 PM", "Tomorrow 11:00 AM"],
      img: 15
    }
  ],
  "General Medicine": [
    {
      _id: "doc-3",
      name: "Dr. Anil Kumar",
      specialty: "General Physician",
      experience: "15 years",
      ratingAverage: 4.7,
      ratingCount: 210,
      consultationFee: 400,
      clinicName: "Family Health Clinic",
      clinicAddress: "Koramangala, Bengaluru",
      availableSlots: ["Today 06:00 PM", "Tomorrow 09:30 AM", "Tomorrow 11:00 AM"],
      img: 13
    }
  ]
};

const SUGGESTION_CHIPS = [
  "🤒 High fever & body ache for 2 days",
  "❤️ Chest tightness and palpitations",
  "🩺 Itchy skin rash with redness",
  "🦴 Severe knee joint pain when walking",
  "🦷 Throbbing toothache and gum pain",
  "👶 3-year-old child with persistent cough"
];

export const AIChatWidget: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState("");

  const [activeDoctorForBooking, setActiveDoctorForBooking] = useState<DoctorRecommendation | null>(null);
  const [selectedSlotData, setSelectedSlotData] = useState<{ date: string; slot: string } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const initialBotMessage: ChatMessage = {
    id: "init-1",
    sender: "bot",
    text: "Hello! I am your **SlotSeva HealthGPT** clinical assistant 🩺.\n\nDescribe your symptoms (e.g. fever, chest pain, rash, toothache) and I will analyze them, alert you to red flags, match the right doctor, and help you book a slot.",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    quickReplies: ["🤒 Fever & Chills", "❤️ Chest Pain", "🩺 Skin Rash", "🦴 Joint Pain"]
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialBotMessage]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isTyping, streamingText]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);
    setStreamingText("");

    try {
      const response = await api.post("/ai/chat", {
        message: query,
        history: messages.map((m) => ({ role: m.sender, content: m.text }))
      });

      const data = response.data;
      const fullReply = data.reply || "";

      // Stream text
      let streamed = "";
      const words = fullReply.split(" ");
      for (let i = 0; i < words.length; i++) {
        streamed += (i === 0 ? "" : " ") + words[i];
        setStreamingText(streamed);
        await new Promise((r) => setTimeout(r, 15));
      }

      const botMsg: ChatMessage = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: fullReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isEmergency: data.isEmergency,
        recommendedSpecialty: data.recommendedSpecialty,
        specialtyReason: data.specialtyReason,
        doctors: data.doctors && data.doctors.length > 0 ? data.doctors : undefined,
        quickReplies: data.quickReplies
      };

      setStreamingText("");
      setMessages((prev) => [...prev, botMsg]);
    } catch (_err) {
      // Client-side resilience fallback
      const lower = query.toLowerCase();

      // Medical Domain check
      const isMedical = /(fever|cough|cold|flu|headache|migraine|pain|ache|sore|hurt|swelling|swollen|rash|itch|bleed|vomit|nausea|diarrhea|chills|dizzy|fatigue|weakness|tired|pressure|cramp|stiffness|burn|infection|allergy|wound|injury|fracture|sprain|breath|pulse|heart|palpitation|chest|stomach|abdomen|throat|tonsil|ear|eye|nose|sinus|mouth|tooth|teeth|gum|skin|scalp|hair|back|spine|neck|shoulder|arm|leg|knee|ankle|foot|joint|bone|muscle|nerve|baby|child|infant|toddler|pediatric|pregnant|pregnancy|period|diabetes|bp|blood|pressure|doctor|clinic|hospital|appointment|slot|book|specialist|physician|cardiologist|dermatologist|pediatrician|orthopedic|dentist|treatment|medicine|pill|tablet|cure|health|sick|ill|unwell|symptom)/i.test(lower);

      if (!isMedical && !/^(hi|hello|hey|start)[\s!.]*$/i.test(query.trim())) {
        const refusal = "⚠️ **Medical Purpose Only**\n\nI am **SlotSeva HealthGPT**, an AI clinical assistant designed **exclusively for medical symptom triage and doctor appointment bookings**.\n\nI cannot answer non-medical questions.\n\n👉 **Please describe your symptoms or medical concerns** (e.g., *fever, chest tightness, skin rash, toothache*), and I will gladly match you with a verified doctor.";
        
        let streamed = "";
        const words = refusal.split(" ");
        for (let i = 0; i < words.length; i++) {
          streamed += (i === 0 ? "" : " ") + words[i];
          setStreamingText(streamed);
          await new Promise((r) => setTimeout(r, 15));
        }

        const refusalMsg: ChatMessage = {
          id: "bot-" + Date.now(),
          sender: "bot",
          text: refusal,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isEmergency: false,
          quickReplies: [
            "🤒 Check Fever & Cold",
            "❤️ Chest Pain Triage",
            "🩺 Check Skin Rash",
            "🦴 Knee Joint Pain"
          ]
        };

        setStreamingText("");
        setMessages((prev) => [...prev, refusalMsg]);
        return;
      }

      const isEmergency =
        /chest\s*(pain|pressure|tightness)|shortness of breath|stroke|unconscious|cough(ing)? blood/i.test(
          lower
        );

      let spec = "General Medicine";
      let reason =
        "Your symptoms are best evaluated by a General Physician who can conduct an initial examination and prescribe appropriate tests.";

      if (/heart|chest|palpitation|pulse|blood pressure/i.test(lower)) {
        spec = "Cardiology";
        reason = "Cardiovascular symptoms require assessment by a Cardiologist.";
      } else if (/skin|rash|acne|itch|pimples|eczema|allergy/i.test(lower)) {
        spec = "Dermatology";
        reason = "Skin, scalp, and dermatological conditions are treated by a Dermatologist.";
      } else if (/child|baby|infant|toddler|kid/i.test(lower)) {
        spec = "Pediatrics";
        reason = "Childhood symptoms require specialized evaluation by a Pediatrician.";
      } else if (/joint|knee|bone|fracture|back pain|spine|shoulder/i.test(lower)) {
        spec = "Orthopedics";
        reason = "Musculoskeletal, bone, and joint symptoms are treated by an Orthopedic specialist.";
      } else if (/tooth|teeth|gum|cavity|jaw/i.test(lower)) {
        spec = "Dentist";
        reason = "Dental conditions should be examined promptly by a Dentist.";
      }

      const matchedDocs =
        CLIENT_FALLBACK_DOCTORS[spec] || CLIENT_FALLBACK_DOCTORS["General Medicine"];

      const reply = isEmergency
        ? `🚨 **URGENT MEDICAL WARNING: Red-Flag Condition**\n\nYour symptoms may represent an emergency condition. Please call **112 / 108** or visit the nearest hospital emergency room immediately.\n\nFor non-critical care, here is our recommended specialist:`
        : `Based on your symptoms, we recommend consulting a **${spec}**.\n\n*Clinical Reasoning:* ${reason}\n\nHere are top-rated verified doctors near you:`;

      let streamed = "";
      const words = reply.split(" ");
      for (let i = 0; i < words.length; i++) {
        streamed += (i === 0 ? "" : " ") + words[i];
        setStreamingText(streamed);
        await new Promise((r) => setTimeout(r, 15));
      }

      const botMsg: ChatMessage = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isEmergency,
        recommendedSpecialty: spec,
        specialtyReason: reason,
        doctors: matchedDocs,
        quickReplies: [`Book with ${matchedDocs[0].name}`, "Show more options"]
      };

      setStreamingText("");
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleStartSlotSelection = (doctor: DoctorRecommendation) => {
    setActiveDoctorForBooking(doctor);
    const slotPromptMsg: ChatMessage = {
      id: "slot-prompt-" + Date.now(),
      sender: "bot",
      text: `Live schedule opened for **${doctor.name}** (${doctor.specialty} at ${doctor.clinicName}). Please choose your preferred date and time slot:`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      selectedDoctor: doctor,
      showSlotPicker: true
    };
    setMessages((prev) => [...prev, slotPromptMsg]);
  };

  const handleSlotPicked = (date: string, timeSlot: string) => {
    if (!activeDoctorForBooking) return;
    setSelectedSlotData({ date, slot: timeSlot });
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (booking: BookingDetails) => {
    setShowPaymentModal(false);
    const successMsg: ChatMessage = {
      id: "success-" + Date.now(),
      sender: "bot",
      text: `🎉 **Booking Confirmed!** Your appointment has been locked with **${booking.doctorName}**.\n\nA confirmation SMS and email have been sent to ${booking.patient.phone}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      bookingReceipt: booking
    };
    setMessages((prev) => [...prev, successMsg]);
    setActiveDoctorForBooking(null);
    setSelectedSlotData(null);
  };

  const handleResetChat = () => {
    setMessages([initialBotMessage]);
    setActiveDoctorForBooking(null);
    setSelectedSlotData(null);
    setShowPaymentModal(false);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {!isOpen && (
          <div
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="cursor-pointer hidden sm:flex items-center bg-white px-3.5 py-2 rounded-full shadow-xl border border-blue-100 text-xs font-bold text-brand-900 hover:shadow-2xl transition-all hover:-translate-y-0.5"
          >
            <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
            <span>Chat with HealthGPT</span>
          </div>
        )}

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setIsMinimized(false);
          }}
          className="bg-brand-900 hover:bg-brand-700 active:scale-95 text-white p-4 rounded-full shadow-2xl transition-all flex items-center justify-center relative group"
          aria-label="Open AI Health Assistant"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-md opacity-40 group-hover:opacity-75 transition-opacity"></div>
          {isOpen ? (
            <X className="h-6 w-6 relative z-10" />
          ) : (
            <div className="relative z-10 flex items-center justify-center">
              <Bot className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
            </div>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-4 sm:right-6 z-50 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col transition-all duration-300 overflow-hidden ${
            isMinimized
              ? "h-16 w-80 sm:w-96"
              : "h-[85vh] max-h-[660px] w-[95vw] sm:w-[440px] max-w-lg"
          }`}
        >
          {/* Header */}
          <div className="bg-[#171717] text-white px-5 py-3.5 flex items-center justify-between shadow-sm flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-inner relative">
                <Bot className="h-5 w-5 text-white" />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 border-2 border-[#171717] rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight text-white flex items-center gap-1.5">
                  SlotSeva HealthGPT
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                </h3>
                <p className="text-[11px] text-gray-400">Interactive Clinical Triage</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate("/ai-assistant")}
                title="Open Fullscreen ChatGPT mode"
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
              <button
                onClick={handleResetChat}
                title="Reset conversation"
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand" : "Minimize"}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          {!isMinimized && (
            <>
              {/* Message stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70 text-xs sm:text-sm">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-3xl p-3.5 sm:p-4 text-left leading-relaxed shadow-xs ${
                        msg.sender === "user"
                          ? "bg-brand-900 text-white rounded-br-xs"
                          : "bg-white text-gray-800 border border-gray-100 rounded-bl-xs"
                      }`}
                    >
                      {/* Emergency Warning */}
                      {msg.isEmergency && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-2.5 rounded-xl mb-2 text-xs text-red-900 font-semibold flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">Medical Red Flag Detected!</span>
                            Call 112 / 108 or go to emergency room immediately if in severe distress.
                          </div>
                        </div>
                      )}

                      {/* Text */}
                      <div className="whitespace-pre-line text-xs sm:text-[13px] leading-relaxed">
                        {msg.text}
                      </div>

                      <span
                        className={`text-[10px] mt-1.5 block ${
                          msg.sender === "user" ? "text-gray-300 text-right" : "text-gray-400"
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Quick Replies */}
                    {msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mt-2">
                        {msg.quickReplies.map((qr) => (
                          <button
                            key={qr}
                            onClick={() => handleSend(qr)}
                            className="bg-white border border-blue-200 hover:border-blue-500 hover:bg-blue-50 text-blue-700 font-semibold text-[11px] px-2.5 py-1 rounded-full transition-all shadow-xs"
                          >
                            {qr}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Matched Doctor Cards */}
                    {msg.doctors && msg.doctors.length > 0 && (
                      <div className="w-full mt-2.5 space-y-2">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider text-left">
                          Recommended Specialists ({msg.recommendedSpecialty || "Top Doctors"}):
                        </p>
                        {msg.doctors.map((doc) => (
                          <DoctorCard
                            key={doc._id}
                            doctor={doc}
                            onSelectSlot={handleStartSlotSelection}
                          />
                        ))}
                      </div>
                    )}

                    {/* In-Chat Slot Picker */}
                    {msg.showSlotPicker && msg.selectedDoctor && (
                      <div className="w-full mt-2">
                        <SlotPickerInline
                          doctor={msg.selectedDoctor}
                          onSlotSelected={handleSlotPicked}
                        />
                      </div>
                    )}

                    {/* In-Chat Booking Confirmation Receipt */}
                    {msg.bookingReceipt && (
                      <div className="w-full mt-2">
                        <BookingConfirmationReceipt
                          booking={msg.bookingReceipt}
                          onReset={handleResetChat}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {/* Live Typing & Streaming Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-white border border-gray-100 p-3 rounded-2xl w-fit shadow-xs text-left">
                    {streamingText ? (
                      <div className="whitespace-pre-line leading-relaxed">
                        {streamingText}
                        <span className="inline-block w-2 h-3.5 bg-blue-600 ml-1 animate-pulse align-middle"></span>
                      </div>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-blue-600 animate-spin" />
                        <span>HealthGPT is analyzing symptoms...</span>
                      </>
                    )}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestion Chips */}
              {messages.length <= 2 && (
                <div className="px-3 pt-2 pb-1 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto scrollbar-none">
                  {SUGGESTION_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleSend(chip)}
                      className="text-[11px] font-medium bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors border border-gray-200 hover:border-blue-200 flex-shrink-0"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Box */}
              <div className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Describe your symptoms (e.g. fever, chest pain)..."
                    className="flex-1 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isTyping}
                    className="bg-brand-900 hover:bg-brand-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Payment Interface Modal */}
      {showPaymentModal && activeDoctorForBooking && selectedSlotData && (
        <PaymentModal
          doctor={activeDoctorForBooking}
          date={selectedSlotData.date}
          timeSlot={selectedSlotData.slot}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};
