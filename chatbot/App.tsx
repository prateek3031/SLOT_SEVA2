import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { queryClient } from "@/api/queryClient";
import AIAssistantPage from "@/pages/v2/AIAssistantPage";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Dedicated Chatbot Application */}
            <Route path="/" element={<AIAssistantPage />} />
            <Route path="/chat" element={<AIAssistantPage />} />
            <Route path="/ai-assistant" element={<AIAssistantPage />} />
            
            {/* Catch-all redirect to Chatbot */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
