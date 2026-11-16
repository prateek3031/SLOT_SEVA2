let Doctor, Clinic, Appointment;
try {
  const models = require("../models");
  Doctor = models.Doctor;
  Clinic = models.Clinic;
  Appointment = models.Appointment;
} catch (_err) {
  // Models or Mongoose offline / not yet installed
}
let env;
try {
  env = require("../config/env");
} catch (_err) {
  env = {};
}

// Emergency symptom signatures
const EMERGENCY_PATTERNS = [
  /chest\s*(pain|pressure|tightness|heaviness)/i,
  /radiat(ing|es?)\s*(to|down)\s*(left\s*)?(arm|neck|jaw|back)/i,
  /difficulty\s*breath(ing)?|shortness\s*of\s*breath|cannot\s*breathe/i,
  /stroke|facial\s*droop|slurr(ed|ing)\s*speech|one-sided\s*weakness/i,
  /unconscious|faint(ed|ing)|passed\s*out|seizure/i,
  /cough(ing)?\s*blood|vomit(ing)?\s*blood|severe\s*bleeding/i,
  /severe\s*allergic|anaphylax(is)?|swelling\s*of\s*(throat|tongue|lips)/i,
];

// Curated medical keywords regex to strictly detect medical domain queries
const MEDICAL_DOMAIN_REGEX = new RegExp(
  [
    // Symptoms & Body Sensations
    "fever", "cough", "cold", "flu", "headache", "migraine", "pain", "ache", "sore", "hurt",
    "swelling", "swollen", "rash", "itch", "itching", "bleed", "bleeding", "vomit", "vomiting",
    "nausea", "diarrhea", "chills", "dizzy", "dizziness", "fatigue", "weakness", "tired",
    "pressure", "cramp", "cramps", "stiffness", "burn", "burning", "infection", "inflamm",
    "allergy", "allergic", "lesion", "boil", "wound", "injury", "fracture", "sprain", "bruise",
    "breath", "breathing", "pulse", "palpitation", "palpitations", "angina", "asthma",
    // Body Parts & Anatomy
    "chest", "heart", "stomach", "abdomen", "tummy", "belly", "throat", "tonsil", "ear", "ears",
    "eye", "eyes", "nose", "nasal", "sinus", "mouth", "tooth", "teeth", "gum", "gums", "tongue",
    "skin", "scalp", "hair", "back", "spine", "neck", "shoulder", "arm", "arms", "leg", "legs",
    "knee", "knees", "ankle", "foot", "feet", "joint", "joints", "bone", "bones", "muscle",
    "nerve", "nerves", "kidney", "liver", "lung", "lungs", "brain", "bowel", "urine", "urinary",
    // Demographics & Conditions
    "baby", "child", "children", "kid", "kids", "infant", "toddler", "newborn", "pediatric",
    "pregnant", "pregnancy", "period", "menstrual", "diabetes", "diabetic", "hypertension", "bp",
    "blood pressure", "cholesterol", "sugar", "acne", "eczema", "psoriasis", "hives",
    // Healthcare & Appointment entities
    "doctor", "clinic", "hospital", "appointment", "slot", "slots", "book", "booking", "schedule",
    "specialist", "physician", "cardiologist", "cardiology", "dermatologist", "dermatology",
    "pediatrician", "pediatrics", "orthopedic", "orthopedics", "dentist", "dentistry", "neurologist",
    "ent", "surgeon", "consult", "consultation", "prescription", "medicine", "medication", "pill",
    "tablet", "syrup", "dosage", "treatment", "therapy", "diagnosis", "test", "scan", "xray", "mri",
    "lab", "emergency", "ambulance", "health", "healthy", "sick", "ill", "unwell", "feeling unwell",
    "disease", "disorder", "syndrome", "condition", "symptom", "symptoms"
  ].join("|"),
  "i"
);

// Specialty matching rules
const SPECIALTY_RULES = [
  {
    specialty: "Cardiology",
    aliases: ["Cardiologist", "Cardiology"],
    keywords: [
      "chest pain", "heart", "palpitation", "high blood pressure", "hypertension",
      "arrhythmia", "shortness of breath", "angina", "pulse rate", "cholesterol"
    ],
    reason: "Your symptoms indicate potential cardiovascular or heart-related concerns requiring evaluation by a Cardiologist."
  },
  {
    specialty: "Dermatology",
    aliases: ["Dermatologist", "Dermatology"],
    keywords: [
      "skin", "rash", "acne", "pimples", "itch", "itching", "eczema", "psoriasis",
      "allergy", "hives", "hair loss", "scalp", "dandruff", "pigmentation", "mole", "boil"
    ],
    reason: "These cutaneous symptoms (skin, hair, or rash) are best diagnosed and treated by a qualified Dermatologist."
  },
  {
    specialty: "Pediatrics",
    aliases: ["Pediatrician", "Pediatrics"],
    keywords: [
      "child", "baby", "infant", "toddler", "kid", "newborn", "pediatric",
      "childhood fever", "teething", "baby rash", "2 year old", "1 year old", "months old"
    ],
    ageBoost: 8,
    reason: "Because this relates to an infant or young child, a specialized Pediatrician should examine the patient."
  },
  {
    specialty: "Orthopedics",
    aliases: ["Orthopedic", "Orthopedics", "Orthopedist"],
    keywords: [
      "joint pain", "knee pain", "bone", "fracture", "sprain", "ligament",
      "back pain", "spine", "shoulder pain", "arthritis", "swollen ankle", "cartilage"
    ],
    reason: "Your symptoms point toward musculoskeletal, bone, or joint issues that an Orthopedic specialist treats."
  },
  {
    specialty: "Dentist",
    aliases: ["Dentist", "Dental", "Dentistry"],
    keywords: [
      "tooth", "teeth", "toothache", "gum", "gums bleeding", "cavity",
      "jaw pain", "root canal", "sensitive teeth", "wisdom tooth"
    ],
    reason: "Dental issues such as toothache, enamel sensitivity, or gum irritation need examination by a Dentist."
  },
  {
    specialty: "ENT",
    aliases: ["ENT", "Otolaryngologist"],
    keywords: [
      "ear", "ear pain", "throat", "sore throat", "sinus", "sinusitis",
      "hearing", "tinnitus", "tonsils", "nasal blockage", "runny nose"
    ],
    reason: "Ear, nose, and throat concerns are best treated by an ENT specialist."
  },
  {
    specialty: "General Medicine",
    aliases: ["General Physician", "General Medicine", "Internal Medicine"],
    keywords: [
      "fever", "cough", "cold", "flu", "headache", "body ache", "fatigue",
      "stomach ache", "vomiting", "nausea", "diarrhea", "weakness", "infection",
      "dizziness", "chills", "food poisoning"
    ],
    reason: "These systemic symptoms are best addressed first by a General Physician for diagnosis, treatment, and lab investigations."
  }
];

const FALLBACK_DOCTORS = [
  {
    _id: "doc-1",
    name: "Dr. Rahul Sharma",
    specialty: "Cardiologist",
    experience: "12 years",
    ratingAverage: 4.8,
    ratingCount: 124,
    consultationFee: 500,
    clinicName: "ABC Heart & Health Clinic",
    clinicAddress: "123 Health Avenue, Sector 4, Rajpura",
    location: { type: "Point", coordinates: [77.6229, 12.9352] },
    visitDurationMinutes: 20,
    availableSlots: ["Today 04:30 PM", "Tomorrow 10:00 AM", "Tomorrow 02:30 PM", "Tomorrow 05:00 PM"],
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
    clinicName: "Skin Care & Glow Clinic",
    clinicAddress: "100 Feet Rd, Indiranagar, Bengaluru",
    location: { type: "Point", coordinates: [77.6408, 12.9719] },
    visitDurationMinutes: 20,
    availableSlots: ["Tomorrow 10:00 AM", "Tomorrow 11:30 AM", "Tomorrow 03:00 PM"],
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
    clinicName: "Family Health & Wellness",
    clinicAddress: "80 Feet Rd, Koramangala, Bengaluru",
    location: { type: "Point", coordinates: [77.6229, 12.9352] },
    visitDurationMinutes: 15,
    availableSlots: ["Today 06:00 PM", "Today 06:30 PM", "Tomorrow 09:30 AM", "Tomorrow 11:00 AM"],
    img: 13
  },
  {
    _id: "doc-4",
    name: "Dr. Sneha Reddy",
    specialty: "Pediatrician",
    experience: "10 years",
    ratingAverage: 4.9,
    ratingCount: 156,
    consultationFee: 600,
    clinicName: "Little Smiles Pediatric Center",
    clinicAddress: "ITPL Main Rd, Whitefield, Bengaluru",
    location: { type: "Point", coordinates: [77.7499, 12.9698] },
    visitDurationMinutes: 20,
    availableSlots: ["Tomorrow 02:30 PM", "Tomorrow 03:30 PM", "Tomorrow 04:30 PM"],
    img: 14
  },
  {
    _id: "doc-5",
    name: "Dr. Vikram Singh",
    specialty: "Dentist",
    experience: "6 years",
    ratingAverage: 4.6,
    ratingCount: 72,
    consultationFee: 300,
    clinicName: "Bright Teeth Dental Studio",
    clinicAddress: "4th Block, Jayanagar, Bengaluru",
    location: { type: "Point", coordinates: [77.5833, 12.9308] },
    visitDurationMinutes: 25,
    availableSlots: ["Today 05:15 PM", "Tomorrow 11:00 AM", "Tomorrow 04:00 PM"],
    img: 15
  },
  {
    _id: "doc-6",
    name: "Dr. Kavita Reddy",
    specialty: "Orthopedic Surgeon",
    experience: "14 years",
    ratingAverage: 4.8,
    ratingCount: 98,
    consultationFee: 700,
    clinicName: "Whitefield Orthopedic & Joint Center",
    clinicAddress: "ITPL Main Rd, Whitefield, Bengaluru",
    location: { type: "Point", coordinates: [77.7499, 12.9698] },
    visitDurationMinutes: 30,
    availableSlots: ["Tomorrow 10:30 AM", "Tomorrow 01:00 PM", "Tomorrow 04:30 PM"],
    img: 16
  }
];

function detectEmergency(text) {
  for (const pattern of EMERGENCY_PATTERNS) {
    if (pattern.test(text)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if the query is strictly within the medical/health/appointment domain
 */
function isMedicalQuery(text) {
  const trimmed = text.trim();
  // Allow simple polite greetings
  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|start|greetings|help)[\s!.]*$/i.test(trimmed)) {
    return { isMedical: true, isGreeting: true };
  }
  // Check against our medical domain ontology
  if (MEDICAL_DOMAIN_REGEX.test(trimmed)) {
    return { isMedical: true, isGreeting: false };
  }
  return { isMedical: false, isGreeting: false };
}

function matchSpecialties(text) {
  const lower = text.toLowerCase();
  const matched = [];

  for (const rule of SPECIALTY_RULES) {
    let score = 0;
    for (const alias of rule.aliases) {
      if (lower.includes(alias.toLowerCase())) {
        score += 10;
      }
    }
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        score += rule.ageBoost ? rule.ageBoost : 2;
      }
    }

    if (score > 0) {
      matched.push({
        specialty: rule.specialty,
        score,
        reason: rule.reason
      });
    }
  }

  matched.sort((a, b) => b.score - a.score);

  if (matched.length === 0) {
    matched.push({
      specialty: "General Medicine",
      score: 1,
      reason: "Based on your general symptoms, an initial consultation with a General Physician is recommended to evaluate and guide further treatment."
    });
  }

  return matched;
}

async function getDoctorsForSpecialty(specialty) {
  try {
    const isSpecialtyRegex = new RegExp(specialty.replace(/ist$|ics$/i, ""), "i");
    const dbDoctors = await Doctor.find({
      specialty: { $regex: isSpecialtyRegex }
    }).populate("clinicId").lean().exec();

    if (dbDoctors && dbDoctors.length > 0) {
      return dbDoctors.map(doc => ({
        _id: doc._id.toString(),
        name: doc.name,
        specialty: doc.specialty,
        experience: "10+ years",
        ratingAverage: doc.ratingAverage || 4.8,
        ratingCount: doc.ratingCount || 50,
        consultationFee: 500,
        clinicName: doc.clinicId?.name || "SlotSeva Partner Clinic",
        clinicAddress: doc.clinicId?.address || "Bengaluru",
        location: doc.clinicId?.location || { type: "Point", coordinates: [77.62, 12.93] },
        visitDurationMinutes: doc.visitDurationMinutes || 20,
        availableSlots: ["Today 04:30 PM", "Tomorrow 10:30 AM", "Tomorrow 03:00 PM"]
      }));
    }
  } catch (_err) {
    // Fallback
  }

  const lowerSpec = specialty.toLowerCase().replace(/ist$|ics$/i, "");
  const matched = FALLBACK_DOCTORS.filter(d => 
    d.specialty.toLowerCase().includes(lowerSpec) || lowerSpec.includes(d.specialty.toLowerCase().slice(0, 5))
  );

  return matched.length > 0 ? matched : [FALLBACK_DOCTORS[2]];
}

async function callGeminiAPI(apiKey, prompt) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 600
        }
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (e) {
    return null;
  }
}

const NON_MEDICAL_REFUSAL_MESSAGE =
  "⚠️ **Medical Purpose Only**\n\n" +
  "I am **SlotSeva HealthGPT**, an AI assistant designed **exclusively for medical purposes, clinical symptom triage, and doctor appointment bookings**.\n\n" +
  "I cannot answer questions or discuss topics outside of health and medical care (such as general knowledge, coding, weather, entertainment, politics, or math).\n\n" +
  "👉 **Please describe your medical symptoms or health concerns** (e.g. *fever, chest pain, skin rash, knee pain, toothache*), and I will gladly recommend the right doctor and help you book an appointment.";

/**
 * Main chat processor with strict medical guardrail
 */
async function processUserMessage({ message, history = [], user = null }) {
  const { isMedical, isGreeting } = isMedicalQuery(message);

  // STRICT GUARDRAIL: If non-medical query, immediately refuse and redirect to medical purpose only
  if (!isMedical) {
    return {
      reply: NON_MEDICAL_REFUSAL_MESSAGE,
      isMedical: false,
      isEmergency: false,
      recommendedSpecialty: null,
      doctors: [],
      quickReplies: [
        "🤒 Check Fever & Cold",
        "❤️ Chest Pain Triage",
        "🩺 Check Skin Rash",
        "🦴 Knee Joint Pain",
        "🦷 Toothache"
      ],
      nextStep: "TRIAGE"
    };
  }

  // If simple greeting
  if (isGreeting) {
    return {
      reply:
        "Hello! I am **SlotSeva HealthGPT** 🩺, an AI assistant dedicated **exclusively for medical symptom triage and doctor appointment bookings**.\n\n" +
        "Please describe any health symptoms or pain you are feeling, and I will recommend the right doctor specialist and help you book a slot.",
      isMedical: true,
      isEmergency: false,
      recommendedSpecialty: null,
      doctors: [],
      quickReplies: [
        "🤒 High fever & body ache for 2 days",
        "❤️ Chest tightness & rapid pulse",
        "🩺 Itchy red skin rash",
        "🦴 Severe knee joint pain",
        "🦷 Throbbing toothache"
      ],
      nextStep: "TRIAGE"
    };
  }

  // Medical processing
  const isEmergency = detectEmergency(message);
  const matchedSpecialties = matchSpecialties(message);
  const primaryMatch = matchedSpecialties[0];
  const recommendedSpecialty = primaryMatch.specialty;

  const doctors = await getDoctorsForSpecialty(recommendedSpecialty);

  // Check if user is asking to book or mentions a doctor name
  const isBookingIntent = /(book|schedule|appointment|slot|reserve)/i.test(message);
  let selectedDoctor = null;

  for (const doc of FALLBACK_DOCTORS) {
    const docFirstName = doc.name.split(" ")[1]?.toLowerCase() || "";
    if (message.toLowerCase().includes(docFirstName) || message.toLowerCase().includes(doc.name.toLowerCase())) {
      selectedDoctor = doc;
      break;
    }
  }

  const isSlotSelection = /(today|tomorrow|0[0-9]|1[0-2]|am|pm|\d{1,2}:\d{2})/i.test(message) && selectedDoctor;

  let botReply = "";
  let quickReplies = [];
  let nextStep = "VIEW_DOCTORS";

  const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;

  if (apiKey) {
    const prompt = `
CRITICAL SYSTEM INSTRUCTION: You are SlotSeva HealthGPT, an AI assistant designed EXCLUSIVELY for medical purposes, symptom assessment, and doctor appointment booking.
If the user's message is not about human medical symptoms, health conditions, or doctor appointments, you MUST refuse and state that you are exclusively for medical purpose.
User message: "${message}"
Detected Emergency: ${isEmergency ? "YES" : "NO"}
Specialty match: ${recommendedSpecialty}
Doctors: ${doctors.map(d => `${d.name} (${d.specialty}, Fee ₹${d.consultationFee})`).join(", ")}

Instructions:
1. If emergency, warn them to call 112/108 or go to ER immediately.
2. Otherwise, give an empathetic clinical triage explaining why a ${recommendedSpecialty} is recommended.
3. Invite them to review the recommended doctors and pick a slot.
4. Keep it concise, helpful, and strictly medical.
`;
    const geminiText = await callGeminiAPI(apiKey, prompt);
    if (geminiText) botReply = geminiText;
  }

  if (!botReply) {
    if (isEmergency) {
      botReply = `🚨 **URGENT MEDICAL ALERT: Critical Red-Flag Detected**\n\nYour symptoms could indicate an emergency condition requiring immediate clinical care. Please dial emergency services (**112** or **108** in India) or head to your nearest emergency department without delay.\n\nFor non-critical follow-up, here is the recommended specialist:`;
      quickReplies = ["Call Emergency 112", "Find Nearby Emergency Room", "Show Specialists"];
      nextStep = "VIEW_DOCTORS";
    } else if (isSlotSelection && selectedDoctor) {
      botReply = `I have locked in **${selectedDoctor.name}** (${selectedDoctor.specialty} at ${selectedDoctor.clinicName}).\n\nPlease select your preferred slot below to proceed to patient confirmation and payment:`;
      quickReplies = ["Select First Slot", "Pay at Clinic", "Pay via UPI"];
      nextStep = "SELECT_SLOT";
    } else if (isBookingIntent && selectedDoctor) {
      botReply = `Great choice! I have loaded the live appointment calendar for **${selectedDoctor.name}** at ${selectedDoctor.clinicName}.\n\nConsultation Fee: **₹${selectedDoctor.consultationFee}** (Pay online or on arrival).\n\nChoose an available slot:`;
      quickReplies = selectedDoctor.availableSlots?.slice(0, 3) || ["Today 04:30 PM", "Tomorrow 10:00 AM"];
      nextStep = "SELECT_SLOT";
    } else {
      botReply = `Based on what you've described, I recommend consulting a **${recommendedSpecialty}**.\n\n` +
        `**Clinical Rationale:** ${primaryMatch.reason}\n\n` +
        `💡 *Self-care note:* Rest, stay well-hydrated, and track if your symptoms worsen. Below are top-rated verified doctors with live openings:`;
      quickReplies = [`Book with ${doctors[0]?.name || "Doctor"}`, "Ask a follow-up question", "Show more doctors"];
      nextStep = "VIEW_DOCTORS";
    }
  }

  return {
    reply: botReply,
    isMedical: true,
    isEmergency,
    recommendedSpecialty,
    specialtyReason: primaryMatch.reason,
    matchedSpecialties,
    doctors,
    selectedDoctor: selectedDoctor || doctors[0] || null,
    quickReplies,
    nextStep
  };
}

module.exports = {
  detectEmergency,
  isMedicalQuery,
  matchSpecialties,
  getDoctorsForSpecialty,
  processUserMessage,
  FALLBACK_DOCTORS
};
