import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Activity,
  Stethoscope,
  Heart,
  Baby,
  Bone,
  Brain,
  CalendarCheck,
  CheckCircle2,
  Users,
  Building2,
  Star,
  Sparkles,
  Bot,
  ArrowRight,
  ShieldCheck,
  CreditCard
} from "lucide-react";
import { Navbar } from "@/components/v2/Navbar";
import { Footer } from "@/components/v2/Footer";

export default function LandingPage() {
  const navigate = useNavigate();

  const specialties = [
    { name: "General Physician", icon: Activity, color: "bg-blue-50 text-blue-600" },
    { name: "Cardiologist", icon: Heart, color: "bg-red-50 text-red-600" },
    { name: "Dermatologist", icon: Activity, color: "bg-pink-50 text-pink-600" },
    { name: "Dentist", icon: Activity, color: "bg-teal-50 text-teal-600" },
    { name: "Pediatrician", icon: Baby, color: "bg-yellow-50 text-yellow-600" },
    { name: "Orthopedic", icon: Bone, color: "bg-orange-50 text-orange-600" },
    { name: "Gynecologist", icon: Activity, color: "bg-purple-50 text-purple-600" },
    { name: "Neurologist", icon: Brain, color: "bg-indigo-50 text-indigo-600" },
  ];

  return (
    <div className="min-h-screen bg-brand-50 font-sans flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              {/* AI Badge */}
              <Link
                to="/ai-assistant"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 px-4 py-1.5 rounded-full text-xs font-bold text-blue-700 mb-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span>New: AI Symptom Checker & Doctor Matcher</span>
                <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Try Now &rarr;
                </span>
              </Link>

              <h1 className="text-5xl lg:text-6xl font-extrabold text-brand-900 leading-tight mb-6">
                Book Your Clinic Visit. <br />
                <span className="text-blue-600">Without The Wait.</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Find the right doctor, choose a convenient time, and book your clinic appointment in
                seconds. Say goodbye to endless phone calls and crowded waiting rooms.
              </p>

              {/* Search Component */}
              <div className="bg-white p-4 rounded-2xl shadow-soft border border-gray-100 flex flex-col sm:flex-row gap-3 relative z-20">
                <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-colors">
                  <Search className="h-5 w-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Search doctor, clinic, specialty..."
                    className="bg-transparent border-none outline-none w-full text-gray-700 placeholder-gray-400 text-sm"
                  />
                </div>
                <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-colors">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Location (e.g. Rajpura)"
                    className="bg-transparent border-none outline-none w-full text-gray-700 placeholder-gray-400 text-sm"
                  />
                </div>
                <button
                  onClick={() => navigate("/doctors")}
                  className="bg-brand-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-brand-700 transition-all shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap"
                >
                  Find Slots
                </button>
              </div>

              {/* Quick AI alternative prompt */}
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <span>Not sure which specialist to see?</span>
                <Link
                  to="/ai-assistant"
                  className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                >
                  Describe your symptoms to AI Doctor &rarr;
                </Link>
              </div>
            </div>

            {/* Visuals */}
            <div className="hidden lg:block relative">
              <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10 transform translate-x-10 translate-y-10"></div>
              <img
                src="https://images.unsplash.com/photo-1638202371559-4d8e588b3eb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Doctor consultation"
                className="rounded-[2rem] shadow-2xl border-8 border-white object-cover h-[500px] w-full"
              />
              {/* Floating Badge */}
              <div
                className="absolute bottom-10 -left-10 bg-white p-4 rounded-xl shadow-xl flex items-center gap-4 animate-bounce"
                style={{ animationDuration: "3s" }}
              >
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Next Slot Available</p>
                  <p className="text-brand-900 font-bold">Today, 4:30 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-white border-y border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100">
            <div className="text-center px-4">
              <div className="flex justify-center mb-3">
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-brand-900 mb-1">500+</h3>
              <p className="text-gray-500 font-medium">Expert Doctors</p>
            </div>
            <div className="text-center px-4">
              <div className="flex justify-center mb-3">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-brand-900 mb-1">100+</h3>
              <p className="text-gray-500 font-medium">Partner Clinics</p>
            </div>
            <div className="text-center px-4">
              <div className="flex justify-center mb-3">
                <CalendarCheck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-brand-900 mb-1">10K+</h3>
              <p className="text-gray-500 font-medium">Appointments</p>
            </div>
            <div className="text-center px-4">
              <div className="flex justify-center mb-3">
                <Star className="h-8 w-8 text-yellow-500 fill-current" />
              </div>
              <h3 className="text-3xl font-bold text-brand-900 mb-1">4.8/5</h3>
              <p className="text-gray-500 font-medium">Patient Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Doctor Feature Showcase Banner */}
      <section className="py-20 bg-gradient-to-br from-brand-900 via-indigo-950 to-brand-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-300 mb-6">
                <Bot className="h-4 w-4" />
                <span>AI Clinical Triage & Smart Booking</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6">
                Tell Us Your Symptoms. <br />
                <span className="text-blue-400">We Find Your Ideal Doctor.</span>
              </h2>
              <p className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed max-w-xl">
                Skip guessing medical specialties. Enter symptoms like fever, skin rash, or joint pain.
                Our AI analyzes symptoms, alerts for emergency red flags, recommends top-rated
                specialists from SlotSeva, and enables instant conflict-free slot booking with UPI or Pay-at-Clinic.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Emergency Triage</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Instant warning and 112/108 hotline advice if critical red flags appear.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <CreditCard className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Seamless Payment</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Pay online via UPI, Cards, NetBanking, or choose Pay at Clinic on arrival.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/ai-assistant")}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                >
                  <Sparkles className="h-5 w-5" />
                  <span>Try AI Symptom Checker</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate("/doctors")}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-xl transition-all border border-white/15"
                >
                  Browse Doctor Directory
                </button>
              </div>
            </div>

            {/* Interactive Preview Mockup Card */}
            <div className="lg:col-span-5 bg-white text-gray-900 rounded-3xl p-6 shadow-2xl border border-white/10 text-left">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-900">SlotSeva AI Assistant</h4>
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Demo
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs mb-5">
                <div className="bg-gray-100 p-3 rounded-2xl rounded-tr-xs text-gray-700 ml-auto max-w-[85%]">
                  "I have a fever, sore throat, and severe fatigue since yesterday."
                </div>
                <div className="bg-blue-50 p-3.5 rounded-2xl rounded-tl-xs border border-blue-100 text-gray-800 space-y-2">
                  <p className="font-medium">
                    Based on your acute viral symptoms, we recommend consulting a{" "}
                    <strong className="text-blue-700">General Physician</strong>.
                  </p>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-200/80 shadow-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-brand-900">Dr. Anil Kumar</p>
                      <p className="text-[11px] text-blue-600">General Physician • 15 yrs</p>
                      <p className="text-[11px] text-gray-500">Family Health Clinic, ₹400</p>
                    </div>
                    <button
                      onClick={() => navigate("/ai-assistant")}
                      className="bg-brand-900 hover:bg-brand-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-xs"
                    >
                      Book Slot
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate("/ai-assistant")}
                className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 py-2.5 rounded-xl transition-colors"
              >
                Open Full AI Consultation &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Specialties */}
      <section className="py-24 bg-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-900 mb-4">Top Specialties</h2>
            <p className="text-gray-600 text-lg">
              Find experienced doctors across all major medical specialties.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {specialties.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  onClick={() => navigate(`/doctors?specialty=${s.name}`)}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer group flex flex-col items-center text-center"
                >
                  <div className={`p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110 ${s.color}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{s.name}</h3>
                  <p className="text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View Doctors &rarr;
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-900 mb-4">Featured Doctors</h2>
              <p className="text-gray-600 text-lg">
                Highly rated professionals available for booking today.
              </p>
            </div>
            <Link to="/doctors" className="hidden md:block text-blue-600 font-medium hover:text-blue-700">
              See all doctors &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: 1,
                name: "Dr. Rahul Sharma",
                spec: "Cardiologist",
                exp: "12 years",
                fee: 500,
                rating: 4.8,
                reviews: 124,
                img: 11
              },
              {
                id: 2,
                name: "Dr. Priya Patel",
                spec: "Dermatologist",
                exp: "8 years",
                fee: 800,
                rating: 4.9,
                reviews: 89,
                img: 12
              },
              {
                id: 3,
                name: "Dr. Anil Kumar",
                spec: "General Physician",
                exp: "15 years",
                fee: 400,
                rating: 4.7,
                reviews: 210,
                img: 13
              }
            ].map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-shadow text-left"
              >
                <div className="flex gap-4 items-start mb-6">
                  <img
                    src={`https://i.pravatar.cc/150?img=${doc.img}`}
                    alt={doc.name}
                    className="w-16 h-16 rounded-full object-cover shadow-sm"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-brand-900">{doc.name}</h3>
                    <p className="text-blue-600 font-medium text-sm mb-1">{doc.spec}</p>
                    <p className="text-gray-500 text-sm">{doc.exp} experience</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl text-sm">
                  <div className="flex items-center text-gray-600">
                    <Star className="h-4 w-4 text-yellow-500 fill-current mr-2" />
                    <span className="font-medium text-gray-900 mr-1">{doc.rating}</span> ({doc.reviews} reviews)
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium text-gray-900 mr-1">₹{doc.fee}</span> Consultation fee
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/book/${doc.id}`)}
                  className="w-full bg-brand-900 text-white py-2.5 rounded-xl font-medium hover:bg-brand-700 transition-colors"
                >
                  Book Slot
                </button>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/doctors" className="text-blue-600 font-medium hover:text-blue-700">
              See all doctors &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-900 mb-16">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gray-200 -z-10"></div>

            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full shadow-md mx-auto mb-6 flex items-center justify-center border-4 border-brand-50 z-10">
                <Search className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-brand-900 mb-2">1. Find or Ask AI</h3>
              <p className="text-gray-600">
                Search directly or use our AI Doctor to get matched by symptoms.
              </p>
            </div>

            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full shadow-md mx-auto mb-6 flex items-center justify-center border-4 border-brand-50 z-10">
                <CalendarCheck className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-brand-900 mb-2">2. Choose a Slot & Pay</h3>
              <p className="text-gray-600">
                Select from real-time available slots and pay via UPI, Card, or at Clinic.
              </p>
            </div>

            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full shadow-md mx-auto mb-6 flex items-center justify-center border-4 border-brand-50 z-10">
                <Building2 className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-brand-900 mb-2">3. Visit the Clinic</h3>
              <p className="text-gray-600">
                Skip the waiting queue and meet your doctor at the scheduled time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
