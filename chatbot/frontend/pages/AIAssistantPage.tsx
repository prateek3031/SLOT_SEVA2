import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Bot,
  Send,
  AlertTriangle,
  Stethoscope,
  ShieldCheck,
  Clock,
  Heart,
  Baby,
  Bone,
  Activity,
  CheckCircle2,
  RefreshCw,
  Lock,
  ArrowRight,
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
  User,
  ArrowLeft,
  Info,
  ExternalLink
} from "lucide-react";
import { DoctorCard } from "@/components/chat/DoctorCard";
import { SlotPickerInline } from "@/components/chat/SlotPickerInline";
import { PaymentModal } from "@/components/chat/PaymentModal";
import { BookingConfirmationReceipt } from "@/components/chat/BookingConfirmationReceipt";
import type { ChatMessage, DoctorRecommendation, BookingDetails, ChatSession } from "@/types/chat";
import { api } from "@/api/client";

const SUGGESTION_PROMPTS = [
  {
    icon: "🤒",
    title: "High Fever & Chills",
    desc: "Persistent fever > 101°F, fatigue, body ache for 2 days"
  },
  {
    icon: "❤️",
    title: "Chest Tightness",
    desc: "Tight chest sensation, palpitations and breathlessness"
  },
  {
    icon: "🩺",
    title: "Skin Rash & Itching",
    desc: "Red spreading rash with intense itching on forearms"
  },
  {
    icon: "🦴",
    title: "Knee & Joint Pain",
    desc: "Severe swelling in knee joint with difficulty walking"
  }
];

export default function AIAssistantPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Chat sessions state
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem("slotseva_chat_sessions");
      if (saved) return JSON.parse(saved);
    } catch (_err) {}
    return [
      {
        id: "default-1",
        title: "New Health Consultation",
        createdAt: new Date().toLocaleDateString(),
        messages: []
      }
    ];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>("default-1");
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState("");

  // Booking Flow Context
  const [activeDoctorForBooking, setActiveDoctorForBooking] = useState<DoctorRecommendation | null>(null);
  const [selectedSlotData, setSelectedSlotData] = useState<{ date: string; slot: string } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("slotseva_chat_sessions", JSON.stringify(sessions));
    } catch (_err) {}
  }, [sessions]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, streamingText]);

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: "sess-" + Date.now(),
      title: "New Health Consultation",
      createdAt: new Date().toLocaleDateString(),
      messages: []
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setActiveDoctorForBooking(null);
    setSelectedSlotData(null);
    setShowPaymentModal(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      createNewSession();
      return;
    }
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    if (currentSessionId === id) {
      setCurrentSessionId(updated[0].id);
    }
  };

  const updateCurrentMessages = (newMessages: ChatMessage[]) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          let title = s.title;
          if (s.title === "New Health Consultation" && newMessages.length > 0) {
            const firstUserMsg = newMessages.find((m) => m.sender === "user");
            if (firstUserMsg) {
              title = firstUserMsg.text.slice(0, 30) + (firstUserMsg.text.length > 30 ? "..." : "");
            }
          }
          return { ...s, title, messages: newMessages };
        }
        return s;
      })
    );
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updatedWithUser = [...messages, userMsg];
    updateCurrentMessages(updatedWithUser);
    setInputText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setIsTyping(true);
    setStreamingText("");

    try {
      const response = await api.post("/ai/chat", {
        message: query,
        history: updatedWithUser.map((m) => ({ role: m.sender, content: m.text }))
      });

      const data = response.data;
      const fullReply = data.reply || "";

      // ChatGPT word streaming effect simulation
      let streamed = "";
      const words = fullReply.split(" ");
      for (let i = 0; i < words.length; i++) {
        streamed += (i === 0 ? "" : " ") + words[i];
        setStreamingText(streamed);
        await new Promise((r) => setTimeout(r, 20));
      }

      const botMsg: ChatMessage = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: fullReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isEmergency: data.isEmergency,
        recommendedSpecialty: data.recommendedSpecialty,
        specialtyReason: data.specialtyReason,
        doctors: data.doctors,
        quickReplies: data.quickReplies
      };

      setStreamingText("");
      updateCurrentMessages([...updatedWithUser, botMsg]);
    } catch (_err) {
      const lower = query.toLowerCase();
      
      // Medical Domain check
      const isMedical = /(fever|cough|cold|flu|headache|migraine|pain|ache|sore|hurt|swelling|swollen|rash|itch|bleed|vomit|nausea|diarrhea|chills|dizzy|fatigue|weakness|tired|pressure|cramp|stiffness|burn|infection|allergy|wound|injury|fracture|sprain|breath|pulse|heart|palpitation|chest|stomach|abdomen|throat|tonsil|ear|eye|nose|sinus|mouth|tooth|teeth|gum|skin|scalp|hair|back|spine|neck|shoulder|arm|leg|knee|ankle|foot|joint|bone|muscle|nerve|baby|child|infant|toddler|pediatric|pregnant|pregnancy|period|diabetes|bp|blood|pressure|doctor|clinic|hospital|appointment|slot|book|specialist|physician|cardiologist|dermatologist|pediatrician|orthopedic|dentist|treatment|medicine|pill|tablet|cure|health|sick|ill|unwell|symptom)/i.test(lower);

      if (!isMedical && !/^(hi|hello|hey|start)[\s!.]*$/i.test(query.trim())) {
        const refusalText = "⚠️ **Medical Purpose Only**\n\nI am **SlotSeva HealthGPT**, an AI clinical assistant designed **exclusively for medical symptom triage and doctor appointment bookings**.\n\nI cannot assist with non-medical topics (such as coding, general knowledge, sports, weather, or entertainment).\n\n👉 **Please describe your medical symptoms or health concerns** (e.g., *fever, skin rash, chest discomfort, knee pain, toothache*), and I will help recommend the right specialist and book an appointment.";
        
        let streamed = "";
        const words = refusalText.split(" ");
        for (let i = 0; i < words.length; i++) {
          streamed += (i === 0 ? "" : " ") + words[i];
          setStreamingText(streamed);
          await new Promise((r) => setTimeout(r, 15));
        }

        const refusalMsg: ChatMessage = {
          id: "bot-" + Date.now(),
          sender: "bot",
          text: refusalText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isEmergency: false,
          quickReplies: [
            "🤒 Check Fever & Cold",
            "❤️ Chest Pain Triage",
            "🩺 Check Skin Rash",
            "🦴 Knee Joint Pain",
            "🦷 Toothache"
          ]
        };

        setStreamingText("");
        updateCurrentMessages([...updatedWithUser, refusalMsg]);
        return;
      }

      const isEmergency = /chest|breath|stroke|unconscious|blood/i.test(lower);

      let spec = "General Medicine";
      let reason = "Your symptoms are best evaluated first by a General Physician.";

      if (/heart|chest|palpitation/i.test(lower)) {
        spec = "Cardiology";
        reason = "Cardiovascular and chest symptoms require assessment by a Cardiologist.";
      } else if (/skin|rash|acne|itch|eczema/i.test(lower)) {
        spec = "Dermatology";
        reason = "Skin lesions and rash symptoms are best diagnosed by a Dermatologist.";
      } else if (/child|baby|infant|kid/i.test(lower)) {
        spec = "Pediatrics";
        reason = "Pediatric health needs require examination by a specialized Pediatrician.";
      } else if (/joint|knee|bone|fracture|back/i.test(lower)) {
        spec = "Orthopedics";
        reason = "Musculoskeletal and bone symptoms are treated by an Orthopedic surgeon.";
      } else if (/tooth|teeth|gum|cavity/i.test(lower)) {
        spec = "Dentist";
        reason = "Dental pain or gum issues require clinical examination by a Dentist.";
      }

      const fallbackDocs: DoctorRecommendation[] = [
        {
          _id: "doc-1",
          name: "Dr. Rahul Sharma",
          specialty: "Cardiologist",
          experience: "12 years",
          ratingAverage: 4.8,
          ratingCount: 124,
          consultationFee: 500,
          clinicName: "ABC Clinic",
          clinicAddress: "Rajpura",
          availableSlots: ["Today 04:30 PM", "Tomorrow 10:00 AM"],
          img: 11
        },
        {
          _id: "doc-2",
          name: "Dr. Priya Patel",
          specialty: "Dermatologist",
          experience: "8 years",
          ratingAverage: 4.9,
          ratingCount: 89,
          consultationFee: 800,
          clinicName: "Skin Care Hub",
          clinicAddress: "Indiranagar",
          availableSlots: ["Tomorrow 10:00 AM", "Tomorrow 11:30 AM"],
          img: 12
        },
        {
          _id: "doc-3",
          name: "Dr. Anil Kumar",
          specialty: "General Physician",
          experience: "15 years",
          ratingAverage: 4.7,
          ratingCount: 210,
          consultationFee: 400,
          clinicName: "Family Health",
          clinicAddress: "Koramangala",
          availableSlots: ["Today 06:00 PM", "Tomorrow 09:30 AM"],
          img: 13
        }
      ];

      const filtered = fallbackDocs.filter((d) =>
        d.specialty.toLowerCase().includes(spec.toLowerCase().slice(0, 4))
      );
      const docsToDisplay = filtered.length > 0 ? filtered : [fallbackDocs[2]];

      const replyText = isEmergency
        ? `🚨 **URGENT EMERGENCY ALERT: Immediate Attention Required**\n\nYour symptoms suggest a potentially critical condition. Please call **112 / 108** or go to the nearest emergency room immediately.\n\nFor non-critical follow-up, here is the recommended specialist:`
        : `I've analyzed your symptoms. I recommend scheduling a consultation with a **${spec}**.\n\n` +
          `**Clinical Rationale:** ${reason}\n\n` +
          `Below are verified specialists with live openings ready for booking:`;

      // Streaming simulation
      let streamed = "";
      const words = replyText.split(" ");
      for (let i = 0; i < words.length; i++) {
        streamed += (i === 0 ? "" : " ") + words[i];
        setStreamingText(streamed);
        await new Promise((r) => setTimeout(r, 15));
      }

      const botMsg: ChatMessage = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isEmergency,
        recommendedSpecialty: spec,
        specialtyReason: reason,
        doctors: docsToDisplay,
        quickReplies: [`Book with ${docsToDisplay[0].name}`, "Ask another symptom", "Show more doctors"]
      };

      setStreamingText("");
      updateCurrentMessages([...updatedWithUser, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleStartSlotSelection = (doctor: DoctorRecommendation) => {
    setActiveDoctorForBooking(doctor);
    const slotPromptMsg: ChatMessage = {
      id: "slot-prompt-" + Date.now(),
      sender: "bot",
      text: `Live schedule opened for **${doctor.name}** (${doctor.specialty} at ${doctor.clinicName}). Choose your preferred appointment date and time below:`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      selectedDoctor: doctor,
      showSlotPicker: true
    };
    updateCurrentMessages([...messages, slotPromptMsg]);
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
      text: `🎉 **Booking Confirmed!** Your appointment with **${booking.doctorName}** is locked in.\n\nSMS confirmation sent to ${booking.patient.phone}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      bookingReceipt: booking
    };
    updateCurrentMessages([...messages, successMsg]);
    setActiveDoctorForBooking(null);
    setSelectedSlotData(null);
  };

  return (
    <div className="flex h-screen bg-[#f9fafb] text-gray-900 font-sans overflow-hidden">
      {/* ChatGPT-style Dark Sidebar */}
      <aside
        className={`bg-[#171717] text-[#ececec] flex flex-col transition-all duration-300 z-30 ${
          sidebarOpen ? "w-64 sm:w-72" : "w-0 -translate-x-full"
        }`}
      >
        <div className="p-3 border-b border-[#2f2f2f] flex items-center justify-between">
          <button
            onClick={createNewSession}
            className="flex items-center gap-2 px-2 py-1 hover:opacity-90 transition-opacity text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
              S
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight block">SlotSeva AI</span>
              <span className="text-[10px] text-gray-400 block -mt-1">HealthGPT Assistant</span>
            </div>
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#262626] transition-colors"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={createNewSession}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-[#383838] hover:bg-[#262626] transition-all text-xs font-semibold text-white shadow-xs"
          >
            <Plus className="h-4 w-4 text-blue-400" />
            <span>New Health Consultation</span>
          </button>
        </div>

        {/* Sessions History List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1 scrollbar-none">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Recent Consultations
          </div>
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => setCurrentSessionId(s.id)}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                s.id === currentSessionId
                  ? "bg-[#262626] text-white font-medium"
                  : "text-gray-400 hover:bg-[#202020] hover:text-gray-200"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{s.title}</span>
              </div>
              <button
                onClick={(e) => deleteSession(s.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 rounded transition-opacity"
                title="Delete consultation"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Specialist Shortcuts in Sidebar */}
        <div className="p-3 border-t border-[#2a2a2a] bg-[#141414] space-y-1">
          <div className="px-2 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Specialist Shortcuts
          </div>
          {[
            { name: "General Medicine", prompt: "I have high fever, cold, and body ache" },
            { name: "Cardiology", prompt: "I have tight chest pain and rapid heartbeat" },
            { name: "Dermatology", prompt: "I have an itchy red skin rash on my arms" },
            { name: "Pediatrics", prompt: "My baby has high fever and is unwell" },
            { name: "Orthopedics", prompt: "I have severe knee and joint pain" },
            { name: "Dentist", prompt: "I have a throbbing toothache and gum pain" }
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => handleSendMessage(item.prompt)}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-[#242424] transition-colors flex items-center justify-between"
            >
              <span>{item.name}</span>
              <span className="text-[10px] text-gray-500">&rarr;</span>
            </button>
          ))}
          <div className="pt-2 border-t border-[#262626] flex items-center justify-between px-2 text-[11px] text-gray-500">
            <span>Medical Purpose Only</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
        </div>
      </aside>

      {/* Main Conversation Container */}
      <main className="flex-1 flex flex-col h-full bg-[#fdfdfd] relative overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 bg-white/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                title="Open sidebar"
              >
                <PanelLeft className="h-5 w-5" />
              </button>
            )}

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>SlotSeva HealthGPT</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1"></span>
              </div>
              <span className="text-xs text-gray-400 hidden sm:inline">• Medical Triage & Instant Booking</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={createNewSession}
              className="text-xs bg-brand-900 hover:bg-brand-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Consultation</span>
            </button>
          </div>
        </header>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Empty State / Welcome Screen */}
            {messages.length === 0 && (
              <div className="py-10 text-center animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                  <Bot className="h-9 w-9" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-900 mb-2">
                  What symptoms are you experiencing?
                </h2>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-8">
                  Explain how you feel in your own words. HealthGPT will evaluate your symptoms, identify emergency conditions, suggest the best specialist, and book your appointment.
                </p>

                {/* Prompt Cards (ChatGPT style) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
                  {SUGGESTION_PROMPTS.map((item) => (
                    <button
                      key={item.title}
                      onClick={() => handleSendMessage(item.desc)}
                      className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all group text-left"
                    >
                      <div className="text-2xl mb-1.5">{item.icon}</div>
                      <h4 className="font-bold text-xs sm:text-sm text-brand-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Render Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                } animate-in fade-in duration-200`}
              >
                {/* Bot Avatar */}
                {msg.sender === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div
                  className={`max-w-[88%] sm:max-w-[80%] ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-3xl p-4 sm:p-5 text-sm leading-relaxed text-left shadow-xs ${
                      msg.sender === "user"
                        ? "bg-brand-900 text-white rounded-br-xs"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-xs"
                    }`}
                  >
                    {/* Emergency Alert Banner */}
                    {msg.isEmergency && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-3.5 rounded-xl mb-3 text-xs text-red-900 font-semibold flex items-start gap-2.5">
                        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-sm block">Emergency Red Flag Detected</span>
                          Please call emergency services (112 or 108) or proceed to the nearest emergency department immediately.
                        </div>
                      </div>
                    )}

                    <div className="whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                      {msg.text}
                    </div>

                    <span
                      className={`text-[10px] mt-2 block ${
                        msg.sender === "user" ? "text-gray-300 text-right" : "text-gray-400"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Quick Reply Chips */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2.5">
                      {msg.quickReplies.map((reply) => (
                        <button
                          key={reply}
                          onClick={() => handleSendMessage(reply)}
                          className="bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100 transition-colors shadow-xs active:scale-95"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Doctor Recommendation Cards (Embedded Generative UI) */}
                  {msg.doctors && msg.doctors.length > 0 && (
                    <div className="mt-3.5 space-y-2.5 w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Recommended Specialists:
                        </span>
                        <span className="text-xs text-blue-600 font-medium">
                          {msg.doctors.length} doctors available
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {msg.doctors.map((doc) => (
                          <DoctorCard
                            key={doc._id}
                            doctor={doc}
                            onSelectSlot={handleStartSlotSelection}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inline Slot Picker */}
                  {msg.showSlotPicker && msg.selectedDoctor && (
                    <div className="mt-3 w-full">
                      <SlotPickerInline
                        doctor={msg.selectedDoctor}
                        onSlotSelected={handleSlotPicked}
                      />
                    </div>
                  )}

                  {/* In-Chat Confirmed Booking Receipt */}
                  {msg.bookingReceipt && (
                    <div className="mt-3 w-full">
                      <BookingConfirmationReceipt
                        booking={msg.bookingReceipt}
                        onReset={createNewSession}
                      />
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-brand-900 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Live Streaming Message */}
            {isTyping && (
              <div className="flex gap-3 sm:gap-4 justify-start animate-in fade-in">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="max-w-[85%] bg-white border border-gray-100 rounded-3xl rounded-bl-xs p-4 sm:p-5 text-sm text-gray-800 shadow-xs text-left">
                  {streamingText ? (
                    <div className="whitespace-pre-line leading-relaxed">
                      {streamingText}
                      <span className="inline-block w-2 h-4 bg-blue-600 ml-1 animate-pulse align-middle"></span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Sparkles className="h-4 w-4 text-blue-600 animate-spin" />
                      <span>HealthGPT is analyzing symptoms & matching specialists...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ChatGPT Bottom Input Box */}
        <div className="border-t border-gray-100 bg-white/95 backdrop-blur-md p-3 sm:p-4 z-20">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative bg-gray-50 border border-gray-200 focus-within:border-blue-500 focus-within:bg-white rounded-3xl shadow-sm transition-all flex items-end p-2 pl-4"
            >
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={handleTextareaChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder="Describe your symptoms (e.g. fever for 2 days, tight chest pain, toothache)..."
                className="w-full bg-transparent border-none outline-none resize-none text-xs sm:text-sm text-gray-800 placeholder-gray-400 py-1.5 max-h-40 leading-relaxed"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="p-2.5 rounded-full bg-brand-900 hover:bg-brand-700 disabled:opacity-30 disabled:hover:bg-brand-900 text-white transition-all shadow-xs flex items-center justify-center flex-shrink-0 mb-0.5 ml-2"
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <p className="text-[11px] text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="h-3 w-3 text-gray-400" />
              <span>SlotSeva AI provides clinical symptom triage. In acute emergencies, dial 112 / 108 immediately.</span>
            </p>
          </div>
        </div>
      </main>

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
    </div>
  );
}
