# SlotSeva AI Chatbot: Symptom Triage, Doctor Recommendation & Booking Flow

An AI-powered clinical assistant and appointment booking suite integrated into **SlotSeva**. It takes patient symptoms in natural language, performs emergency red-flag triage, recommends the most qualified medical specialists from SlotSeva's directory, and completes conflict-free appointment booking with a full payment interface (UPI, Cards, NetBanking, Pay at Clinic).

---

## 🌟 Architecture & Features

```
                          ┌────────────────────────┐
                          │   Patient In Chat/Web  │
                          └───────────┬────────────┘
                                      │ Enters symptoms (e.g. "severe chest pain")
                                      ▼
                        ┌───────────────────────────┐
                        │ Red-Flag Emergency Triage │──[Emergency?]──► Immediate 112/108 Warning
                        └─────────────┬─────────────┘
                                      │ Non-critical
                                      ▼
                        ┌───────────────────────────┐
                        │ Specialty Matcher & Triage│ (Cardiology, Dermatology, Pediatrics,
                        └─────────────┬─────────────┘  Orthopedics, Dentist, General Physician)
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
    ┌────────────────────────┐                ┌────────────────────────┐
    │ Google Gemini API (LLM)│                │Deterministic Rule Model│
    │(Empathetic clinical CoT)│               │  (Offline Fallback)    │
    └────────────┬───────────┘                └────────────┬───────────┘
                 └────────────────────┬────────────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │ Doctor Recommendation Card│ Name, Fee, Clinic, Rating, Earliest Slot
                        └─────────────┬─────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │   In-Chat Slot Picker     │ Morning, Afternoon, Evening Times
                        └─────────────┬─────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │ Payment & Checkout Modal  │ UPI / Cards / NetBanking / Pay at Clinic
                        └─────────────┬─────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │ Confirmed Booking Receipt │ Unique ID (SS-XXXXX), QR Pass, Dashboard Link
                        └───────────────────────────┘
```

---

## 🛠️ Components Created

### 1. Backend Service & API Routes
* [aiChatService.js](backend/services/aiChatService.js):
  * **Strict Medical Guardrail**: Automatically filters out any non-medical queries (coding, trivia, weather, sports, math, politics) with an explicit refusal message explaining that SlotSeva HealthGPT is strictly for medical and clinic booking purposes.
  * **Emergency Detection**: Scans for life-threatening conditions (crushing chest pain radiating to arm, stroke symptoms, respiratory distress, acute hemorrhages).
  * **Specialty Triage**: Analyzes patient symptoms and routes to appropriate specialists (Cardiology, Dermatology, Pediatrics, Orthopedics, Dentistry, General Medicine).
  * **Age & Severity Modifiers**: Automatically boosts Pediatric specialists when infants or young children are mentioned.
  * **Dual AI Engine**: Uses Gemini API when `GEMINI_API_KEY` is present in `.env`, with a seamless medical ontology rule engine fallback that runs offline or without an API key.
  * **Doctor Database Match**: Queries MongoDB `Doctor` and `Clinic` models, falling back to curated doctor data if the database is running standalone.
* [aiChatController.js](backend/controllers/aiChatController.js):
  * `handleChat`: `POST /api/ai/chat` — Processes user messages and returns clinical triage, advice, emergency flags, and matched doctors.
  * `getDoctors`: `GET /api/ai/doctors` — Retrieves doctors filtered by specialty.
  * `bookAppointmentWithPayment`: `POST /api/ai/book-appointment` — Locks in the appointment, records the payment method, generates a transaction ID (`TXN_UPI_...`), and issues a unique booking reference (`SS-XXXXX`).
* [aiChatRoutes.js](backend/routes/aiChatRoutes.js) & [server_routes_index.js](integrations/server_routes_index.js):
  * Mounted at `/api/ai`.

---

### 2. Frontend Chat & UI Modules
* [AIChatWidget.tsx](frontend/components/AIChatWidget.tsx):
  * Global floating launcher button in the bottom-right corner across all pages (`/`, `/doctors`, `/dashboard`, etc.).
  * Responsive chat drawer with minimize, reset, and close options.
  * Quick symptom prompt chips:
    * *"High fever & body ache for 2 days"*
    * *"Chest tightness and palpitations"*
    * *"Itchy skin rash with redness"*
    * *"Severe knee joint pain when walking"*
    * *"Throbbing toothache and gum pain"*
    * *"3-year-old child with persistent cough"*
  * Real-time typing indicators and emergency red-flag alert box.
* [DoctorCard.tsx](frontend/components/DoctorCard.tsx):
  * Doctor avatar, verified badge, specialty, experience, rating (`4.8/5`), clinic location, consultation fee (`₹500`), earliest available slot badge, and a **"Choose Slot & Book"** button.
* [SlotPickerInline.tsx](frontend/components/SlotPickerInline.tsx):
  * In-chat interactive slot booking widget with date tabs (*Today, Tomorrow, Sat...*) and period groups (*Morning, Afternoon, Evening*).
* [PaymentModal.tsx](frontend/components/PaymentModal.tsx):
  * 256-bit encrypted checkout modal with appointment summary and breakdown.
  * **Payment Modes**:
    1. **UPI / GPay / PhonePe / Paytm / QR**: Direct UPI handle input and instant verification.
    2. **Credit / Debit Cards**: Card details, expiry, CVV with 3D Secure simulation.
    3. **Net Banking**: Major Indian banks (HDFC, SBI, ICICI, Axis, Kotak).
    4. **Pay at Clinic**: Zero prepayment required; reserve slot and pay on arrival.
* [BookingConfirmationReceipt.tsx](frontend/components/BookingConfirmationReceipt.tsx):
  * Booking confirmation pass featuring unique Booking ID (`SS-XXXXX`), QR code, doctor and clinic details, appointment time, payment status, and a direct link to the patient dashboard.
* [AIAssistantPage.tsx](frontend/pages/AIAssistantPage.tsx):
  * Full-page consultation suite accessible at `/ai-assistant` and `/chat`.
  * Left pane: Interactive chat triage & booking.
  * Right pane: "How It Works" overview, emergency medical disclaimers, and popular specialty directories.
* [Navbar.tsx](integrations/Navbar.tsx):
  * Added "AI Symptom Checker" pill and "Ask AI Doctor" button in header navigation.
* [LandingPage.tsx](integrations/LandingPage.tsx):
  * Added AI badge in hero section, "Describe your symptoms to AI Doctor" shortcut, and a full-width AI Doctor showcase section.
* [App.tsx](App.tsx):
  * Mounted `<AIChatWidget />` globally and registered `/ai-assistant` and `/chat` routes.

---

## 🚀 How to Run and Test

### 1. Client Development Server
```bash
cd <project-root>\frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173`:
* Click the floating blue **"Ask AI Doctor"** button in the bottom-right corner.
* Or click **"AI Symptom Checker"** in the top navigation bar to access the full-page mode (`/ai-assistant`).

### 2. Backend Server (Optional)
```bash
cd <project-root>\backend
npm install
npm run dev
```
To enable Google Gemini LLM for conversational responses, add your Gemini API key to `server/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If no API key is set, the system automatically uses the built-in clinical triage rule engine without errors).*
