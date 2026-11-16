import { Link } from "react-router-dom";
import { LayoutDashboard, Calendar, Search, History, User, Settings, Clock, MapPin, ChevronRight, Sparkles } from "lucide-react";
import { Navbar } from "@/components/v2/Navbar";

export default function UserDashboardPage() {
  return (
    <div className="min-h-screen bg-brand-50 flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0 pt-10 pb-8 pr-8">
          <nav className="space-y-1">
            <Link to="/dashboard" className="flex items-center gap-3 bg-white text-brand-900 font-medium px-4 py-3 rounded-xl shadow-sm border border-gray-100">
              <LayoutDashboard className="h-5 w-5 text-blue-600" /> Overview
            </Link>
            <Link to="/ai-assistant" className="flex items-center gap-3 text-blue-600 bg-blue-50/70 hover:bg-blue-100 font-semibold px-4 py-3 rounded-xl transition-colors border border-blue-100">
              <Sparkles className="h-5 w-5 text-blue-600" /> AI Doctor / Triage
            </Link>
            <Link to="#" className="flex items-center gap-3 text-gray-600 hover:text-brand-900 hover:bg-white font-medium px-4 py-3 rounded-xl transition-colors">
              <Calendar className="h-5 w-5 text-gray-400" /> My Appointments
            </Link>
            <Link to="/doctors" className="flex items-center gap-3 text-gray-600 hover:text-brand-900 hover:bg-white font-medium px-4 py-3 rounded-xl transition-colors">
              <Search className="h-5 w-5 text-gray-400" /> Find Doctors
            </Link>
            <Link to="#" className="flex items-center gap-3 text-gray-600 hover:text-brand-900 hover:bg-white font-medium px-4 py-3 rounded-xl transition-colors">
              <History className="h-5 w-5 text-gray-400" /> Appointment History
            </Link>
            
            <div className="pt-6 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
            </div>
            <Link to="#" className="flex items-center gap-3 text-gray-600 hover:text-brand-900 hover:bg-white font-medium px-4 py-3 rounded-xl transition-colors">
              <User className="h-5 w-5 text-gray-400" /> Profile
            </Link>
            <Link to="#" className="flex items-center gap-3 text-gray-600 hover:text-brand-900 hover:bg-white font-medium px-4 py-3 rounded-xl transition-colors">
              <Settings className="h-5 w-5 text-gray-400" /> Settings
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 pt-10 pb-16 px-4 sm:px-6 md:px-0 md:pl-8 border-l border-transparent md:border-gray-200">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-brand-900">Good morning, Prateek 👋</h1>
            <p className="text-gray-500 mt-1">Here is your healthcare overview for today.</p>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-10">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500 mb-1">Upcoming</p>
              <h3 className="text-3xl font-bold text-blue-600">3</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500 mb-1">Completed</p>
              <h3 className="text-3xl font-bold text-green-600">9</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500 mb-1">Cancelled</p>
              <h3 className="text-3xl font-bold text-gray-900">1</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* Upcoming Appointment */}
            <div className="xl:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-brand-900">Upcoming Appointment</h2>
                <Link to="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">View all</Link>
              </div>
              
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                    <div className="flex gap-4">
                      <img src="https://i.pravatar.cc/150?img=11" alt="Doctor" className="w-16 h-16 rounded-full object-cover border-2 border-gray-100" />
                      <div>
                        <h3 className="text-xl font-bold text-brand-900">Dr. Rahul Sharma</h3>
                        <p className="text-blue-600 font-medium text-sm mb-4">Cardiologist</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-700 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2.5" />
                            <span className="font-semibold text-gray-900">30 September 2026</span>
                          </div>
                          <div className="flex items-center text-gray-700 text-sm">
                            <Clock className="h-4 w-4 text-gray-400 mr-2.5" />
                            <span className="font-semibold text-gray-900">10:30 AM</span>
                          </div>
                          <div className="flex items-center text-gray-700 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2.5" />
                            <span>ABC Clinic, Rajpura</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full sm:w-auto bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Booking ID</p>
                      <p className="font-mono font-bold text-brand-900">SS-10482</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 bg-white text-brand-900 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button className="flex-1 bg-white text-brand-900 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                    Reschedule
                  </button>
                  <button className="flex-[2] bg-brand-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="xl:col-span-1">
              <h2 className="text-xl font-bold text-brand-900 mb-6">Recommended Doctors</h2>
              
              <div className="space-y-4">
                {[
                  { name: "Dr. Priya Patel", spec: "Dermatologist", img: 12 },
                  { name: "Dr. Sneha Reddy", spec: "Pediatrician", img: 14 },
                  { name: "Dr. Anil Kumar", spec: "General Physician", img: 13 }
                ].map((doc, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group cursor-pointer hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <img src={`https://i.pravatar.cc/150?img=${doc.img}`} alt={doc.name} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <h4 className="font-bold text-brand-900 text-sm group-hover:text-blue-600 transition-colors">{doc.name}</h4>
                        <p className="text-gray-500 text-xs font-medium">{doc.spec}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-6 bg-white text-blue-600 border border-blue-100 py-3 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors">
                Find more doctors
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 pb-safe z-50">
        <Link to="/dashboard" className="flex flex-col items-center text-blue-600">
          <LayoutDashboard className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/doctors" className="flex flex-col items-center text-gray-500 hover:text-brand-900">
          <Search className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-medium">Doctors</span>
        </Link>
        <Link to="#" className="flex flex-col items-center text-gray-500 hover:text-brand-900">
          <Calendar className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-medium">Bookings</span>
        </Link>
        <Link to="#" className="flex flex-col items-center text-gray-500 hover:text-brand-900">
          <User className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
}
