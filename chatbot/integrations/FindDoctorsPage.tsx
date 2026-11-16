import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Star, Filter, CalendarCheck, Sparkles } from "lucide-react";
import { Navbar } from "@/components/v2/Navbar";
import { Footer } from "@/components/v2/Footer";

export default function FindDoctorsPage() {
  const navigate = useNavigate();
  const [activeSpecialty, setActiveSpecialty] = useState("All");

  const specialties = ["All", "Cardiologist", "Dermatologist", "Dentist", "Pediatrician", "General Physician"];
  
  const doctors = [
    { id: 1, name: "Dr. Rahul Sharma", spec: "Cardiologist", exp: "12 years", rating: 4.8, revs: 124, clinic: "ABC Clinic", loc: "Rajpura", fee: 500, next: "Today, 4:30 PM", img: 11 },
    { id: 2, name: "Dr. Priya Patel", spec: "Dermatologist", exp: "8 years", rating: 4.9, revs: 89, clinic: "Skin Care Hub", loc: "Indiranagar", fee: 800, next: "Tomorrow, 10:00 AM", img: 12 },
    { id: 3, name: "Dr. Anil Kumar", spec: "General Physician", exp: "15 years", rating: 4.7, revs: 210, clinic: "Family Health", loc: "Koramangala", fee: 400, next: "Today, 6:00 PM", img: 13 },
    { id: 4, name: "Dr. Sneha Reddy", spec: "Pediatrician", exp: "10 years", rating: 4.9, revs: 156, clinic: "Little Smiles", loc: "Whitefield", fee: 600, next: "Tomorrow, 2:30 PM", img: 14 },
    { id: 5, name: "Dr. Vikram Singh", spec: "Dentist", exp: "6 years", rating: 4.6, revs: 72, clinic: "Bright Teeth", scale: "Jayanagar", fee: 300, next: "Today, 5:15 PM", img: 15 },
  ];

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col font-sans">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-brand-900 mb-6">Find the Right Doctor for You</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search doctors, specialties or clinics..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
            <div className="w-full md:w-64 relative">
              <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Location" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <Filter className="h-5 w-5 text-gray-500" />
              <h2 className="font-semibold text-brand-900">Filters</h2>
            </div>
            
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Specialty</h3>
              <div className="space-y-2">
                {specialties.map(s => (
                  <label key={s} className="flex items-center cursor-pointer group">
                    <input 
                      type="radio" 
                      name="specialty" 
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      checked={activeSpecialty === s}
                      onChange={() => setActiveSpecialty(s)}
                    />
                    <span className={`ml-3 text-sm transition-colors ${activeSpecialty === s ? 'text-brand-900 font-medium' : 'text-gray-600 group-hover:text-brand-900'}`}>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Availability</h3>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="rounded text-blue-600 border-gray-300 focus:ring-blue-500" defaultChecked />
                  <span className="ml-3 text-sm text-gray-600">Available Today</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="rounded text-blue-600 border-gray-300 focus:ring-blue-500" />
                  <span className="ml-3 text-sm text-gray-600">Available Tomorrow</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* AI Symptom Matcher Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl flex-shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-brand-900">Unsure which doctor or specialty to choose?</h3>
                <p className="text-xs text-gray-600 mt-0.5">Tell our AI Doctor your symptoms and get instant specialist matches & slot booking.</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/ai-assistant")}
              className="bg-brand-900 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl whitespace-nowrap shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Ask AI Doctor</span> &rarr;
            </button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-brand-900">{doctors.length} doctors found</h2>
            <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500">
              <option>Sort by: Recommended</option>
              <option>Sort by: Rating</option>
              <option>Sort by: Experience</option>
              <option>Sort by: Fee (Low to High)</option>
            </select>
          </div>

          <div className="space-y-4">
            {doctors.map(doc => (
              <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-6">
                <img src={`https://i.pravatar.cc/150?img=${doc.img}`} alt={doc.name} className="w-24 h-24 rounded-full object-cover shadow-sm flex-shrink-0" />
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-brand-900 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => navigate(`/doctor/${doc.id}`)}>{doc.name}</h3>
                      <p className="text-blue-600 font-medium text-sm">{doc.spec} • <span className="text-gray-500 font-normal">{doc.exp}</span></p>
                    </div>
                    <div className="mt-2 sm:mt-0 flex items-center bg-yellow-50 px-2 py-1 rounded border border-yellow-100">
                      <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                      <span className="font-bold text-yellow-700 text-sm">{doc.rating}</span>
                      <span className="text-yellow-600/70 text-xs ml-1">({doc.revs})</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 mt-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      {doc.clinic}, {doc.loc}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="text-gray-400 font-medium mr-2">₹</span>
                      Consultation Fee: <span className="font-semibold text-gray-900 ml-1">₹{doc.fee}</span>
                    </div>
                    <div className="flex items-center text-gray-600 md:col-span-2 mt-2">
                      <CalendarCheck className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-green-700 font-medium bg-green-50 px-2.5 py-1 rounded-md border border-green-100">Next slot: {doc.next}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 justify-center sm:w-40 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6">
                  <button onClick={() => navigate(`/doctor/${doc.id}`)} className="w-full bg-white text-brand-900 border border-gray-200 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                    View Profile
                  </button>
                  <button onClick={() => navigate(`/book/${doc.id}`)} className="w-full bg-brand-900 text-white py-2 rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors">
                    Book Slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
