import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { queryClient } from "@/api/queryClient";

import LandingPageV2 from "@/pages/v2/LandingPage";
import FindDoctorsPageV2 from "@/pages/v2/FindDoctorsPage";
import DoctorProfilePageV2 from "@/pages/v2/DoctorProfilePage";
import SlotBookingPageV2 from "@/pages/v2/SlotBookingPage";
import BookingConfirmationPageV2 from "@/pages/v2/BookingConfirmationPage";
import UserDashboardPageV2 from "@/pages/v2/UserDashboardPage";
import AIAssistantPageV2 from "@/pages/v2/AIAssistantPage";

import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import { AIChatWidget } from "@/components/chat/AIChatWidget";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* V2 UI Routes */}
            <Route path="/" element={<LandingPageV2 />} />
            <Route path="/doctors" element={<FindDoctorsPageV2 />} />
            <Route path="/doctor/:id" element={<DoctorProfilePageV2 />} />
            <Route path="/book/:id" element={<SlotBookingPageV2 />} />
            <Route path="/confirmation/:id" element={<BookingConfirmationPageV2 />} />
            <Route path="/dashboard" element={<UserDashboardPageV2 />} />
            
            {/* AI Assistant Dedicated Page */}
            <Route path="/ai-assistant" element={<AIAssistantPageV2 />} />
            <Route path="/chat" element={<AIAssistantPageV2 />} />

            {/* Original Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>

          {/* Floating AI Chatbot Widget available across all pages */}
          <AIChatWidget />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
