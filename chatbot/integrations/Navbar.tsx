import { Link } from "react-router-dom";
import { ActivitySquare, Sparkles } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <ActivitySquare className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold tracking-tight text-brand-900">Slot Seva</span>
            </Link>
          </div>

          {/* Center Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Home
            </Link>
            <Link to="/doctors" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Find Doctors
            </Link>
            <Link
              to="/ai-assistant"
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold transition-colors bg-blue-50 px-3 py-1 rounded-full border border-blue-100"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Symptom Checker</span>
            </Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Dashboard
            </Link>
          </div>

          {/* Right Nav */}
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors hidden sm:block">
              Login
            </Link>
            <Link
              to="/ai-assistant"
              className="bg-brand-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-brand-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-1.5"
            >
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span>Ask AI Doctor</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
