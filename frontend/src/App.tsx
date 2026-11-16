import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import ClerkAuthProvider from "@/components/auth/ClerkAuthProvider";
import { TriageProvider } from "@/components/triage/TriageContext";
import TriageDrawer from "@/components/triage/TriageDrawer";
import Nav, { PublicNav } from "@/components/Nav";
import Landing from "@/pages/Landing";
import Doctors from "@/pages/Doctors";
import DoctorProfile from "@/pages/DoctorProfile";
import Checkout from "@/pages/Checkout";
import SignInPage from "@/pages/SignIn";
import SignUpPage from "@/pages/SignUp";
import PatientDashboard from "@/pages/PatientDashboard";
import DoctorDashboard from "@/pages/DoctorDashboard";
import NotFound from "@/pages/NotFound";

// ClerkAuthProvider sits inside the app's single BrowserRouter (main.tsx) and wraps
// everything that touches auth. One <Route> per page in src/pages.
export default function App() {
  return (
    <ClerkAuthProvider fallback={<BrowseOnlyApp />}>
      <AuthenticatedApp />
    </ClerkAuthProvider>
  );
}

function AuthUnavailable() {
  return (
    <section className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber-400">
        AUTH // SETUP REQUIRED
      </p>
      <h1 className="mt-4 font-heading text-3xl font-bold uppercase tracking-tight text-zinc-50">
        Sign-in is not configured
      </h1>
      <p className="mt-4 font-mono text-sm leading-relaxed text-zinc-400">
        Doctor browsing is available. To sign in, book an appointment, or use a dashboard, configure
        the Clerk publishable and secret keys in the backend environment.
      </p>
    </section>
  );
}

function BrowseOnlyApp() {
  return (
    <TriageProvider>
      <div className="flex min-h-svh flex-col bg-[#090A0F]">
        <PublicNav />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:id" element={<DoctorProfile />} />
            <Route path="/sign-in/*" element={<AuthUnavailable />} />
            <Route path="/sign-up/*" element={<AuthUnavailable />} />
            <Route path="/checkout" element={<AuthUnavailable />} />
            <Route path="/dashboard" element={<AuthUnavailable />} />
            <Route path="/doctor-dashboard" element={<AuthUnavailable />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
      <TriageDrawer />
      <Toaster richColors theme="dark" position="bottom-right" />
    </TriageProvider>
  );
}

function AuthenticatedApp() {
  return (
    <TriageProvider>
      <div className="flex min-h-svh flex-col bg-[#090A0F]">
        <Nav />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:id" element={<DoctorProfile />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />
            <Route path="/dashboard" element={<PatientDashboard />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
      <TriageDrawer />
      <Toaster richColors theme="dark" position="bottom-right" />
    </TriageProvider>
  );
}
