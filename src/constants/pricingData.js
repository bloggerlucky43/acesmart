// AceSmart Pricing & Subscription Plans Data
// Aligned with the Per-Student Termly Strategy (PRICING_STRATEGY.md)

export const GRADUATED_TIERS = [
  { label: "Starter / Micro School", minStudents: 20, maxStudents: 70, rate: 500, minFloor: 25000 },
  { label: "Standard Academy", minStudents: 71, maxStudents: 250, rate: 450, minFloor: 0 },
  { label: "Premier School", minStudents: 251, maxStudents: 700, rate: 400, minFloor: 0 },
  { label: "Enterprise Group", minStudents: 701, maxStudents: 2500, rate: 350, minFloor: 0 },
];

export function getTierForStudentCount(count) {
  const n = Math.max(Number(count) || 0, 0);
  return GRADUATED_TIERS.find((t) => n <= t.maxStudents) || GRADUATED_TIERS[GRADUATED_TIERS.length - 1];
}

export function calculateSchoolCost(studentCount) {
  const n = Math.max(Number(studentCount) || 0, 0);
  if (n === 0) return 0;
  const tier = getTierForStudentCount(n);
  return Math.max(n * tier.rate, tier.minFloor || 0);
}

export function calculateParentCollection(studentCount, levyPerStudent = 1200) {
  const n = Math.max(Number(studentCount) || 0, 0);
  return n * (Number(levyPerStudent) || 1200);
}

export function calculateSchoolProfit(studentCount, levyPerStudent = 1200) {
  return calculateParentCollection(studentCount, levyPerStudent) - calculateSchoolCost(studentCount);
}

export const EDUCATOR_PLANS = [
  {
    id: "starter",
    name: "Starter Trial",
    badge: "Free Forever",
    tagline: "Essential tools for small tutoring groups and classroom pilots.",
    ratePerChild: "₦0",
    monthlyPrice: 0,
    termlyPrice: 0,
    popular: false,
    studentLimit: 30,
    examLimit: 5,
    features: [
      "Up to 30 active students",
      "5 published examinations / month",
      "Standard past question bank (5,000 Qs)",
      "Automated CBT grading & scoring",
      "Basic PDF result sheets",
      "Email support",
    ],
    limitations: [
      "No biometric face proctoring",
      "No Excel bulk roster import",
      "AceSmart watermark on result sheets",
    ],
    ctaText: "Current Plan",
    disabled: true,
  },
  {
    id: "pro",
    name: "Standard Academy",
    badge: "Most Popular",
    tagline: "Ideal for growing private schools wanting automated CBT and dual attendance.",
    ratePerChild: "₦450 / student / term",
    monthlyPrice: 25000,
    termlyPrice: 65000, // Based on average 150 students
    popular: true,
    studentLimit: 250,
    examLimit: "Unlimited",
    features: [
      "Up to 250 active students",
      "Per-student billing: ₦450 / child / term",
      "Morning (AM) & Afternoon (PM) student roll call",
      "Unlimited published examinations",
      "Full 50,000+ past questions (JAMB/WAEC)",
      "Automated ALOC question bank importer",
      "Excel (.xlsx) bulk student roster import",
      "Instant Excel & PDF master score sheets",
      "Anti-cheat proctoring & tab-switch detector",
      "Custom school crest on result transcripts",
      "Priority WhatsApp & phone support",
    ],
    limitations: [
      "Basic camera face capture (no AI matching)",
    ],
    ctaText: "Upgrade to Standard",
    disabled: false,
  },
  {
    id: "institution",
    name: "Premier Institution ERP",
    badge: "All-in-One Suite",
    tagline: "Complete School Management System + AI CBT Proctored Examination Suite.",
    ratePerChild: "₦400 / student / term",
    monthlyPrice: 60000,
    termlyPrice: 160000, // Based on average 400 students
    popular: false,
    studentLimit: 700,
    examLimit: "Unlimited",
    features: [
      "Up to 700 active students (Unified Student Codes)",
      "Discounted per-student rate: ₦400 / child / term",
      "All-in-One School Management System (SMS)",
      "Staff QR Barcode Clock-In Attendance System",
      "Student Morning & Afternoon Daily Attendance & Roll Call",
      "Terminal Report Card Broadsheets (CBT Sync + Manual Scores)",
      "Termly School Fee Billing & Parent Online Payment Portal",
      "Debtor Defaulter Tracker with 1-Click Fee Reminders",
      "₦500 Terminal Result-Checker Paywall Token Engine",
      "Custom School Crest, Signature & Stamp on Report Cards",
      "Unlimited published examinations + AI Face Proctoring",
      "50,000+ past questions + Offline test room sync",
      "Dedicated account manager & priority phone support",
    ],
    limitations: [],
    ctaText: "Upgrade to Premier ERP",
    disabled: false,
  },
  {
    id: "enterprise",
    name: "Enterprise Multi-Campus",
    badge: "Custom Suite",
    tagline: "Custom-tailored deployment for state educational boards, dioceses & large school groups.",
    ratePerChild: "₦350 / student / term",
    monthlyPrice: 130000,
    termlyPrice: 350000, // Based on 1,000 students
    popular: false,
    studentLimit: "Unlimited",
    examLimit: "Unlimited",
    features: [
      "Unlimited student enrollments (lowest volume rate: ₦350/child)",
      "Multi-campus centralized governance",
      "Custom AI proctoring parameters",
      "On-premise / private cloud deployment option",
      "SLA 99.9% uptime guarantee",
      "Custom integration with school ERP/SIS",
      "Dedicated 24/7 technical engineer",
      "Staff onboarding and training workshops",
    ],
    limitations: [],
    ctaText: "Contact Enterprise",
    disabled: false,
  },
];

export const CANDIDATE_PASSES = [
  {
    id: "token-single",
    name: "Single Mock Token",
    price: 500,
    duration: "1 Simulated Exam",
    tagline: "Perfect for a quick test run before your official examination.",
    features: [
      "1 full-length simulated CBT exam (JAMB / WAEC format)",
      "Standard 4-subject UTME combination",
      "Real-time countdown timer & question palette",
      "Instant score breakdown and accuracy report",
      "Step-by-step answer explanations",
    ],
    ctaText: "Buy 1 Token (₦500)",
  },
  {
    id: "token-monthly",
    name: "Monthly Prep Pass",
    price: 2500,
    duration: "30 Days Unlimited",
    popular: true,
    tagline: "Intensive 30-day preparation with unrestricted practice tests.",
    features: [
      "Unlimited mock examinations for 30 days",
      "Access to all subjects and past year papers",
      "Weak topic diagnostic analytics",
      "JAMB score prediction engine",
      "Printable study performance certificate",
      "Priority server speed",
    ],
    ctaText: "Get 30-Day Pass (₦2,500)",
  },
  {
    id: "token-season",
    name: "UTME/WAEC Season Pass",
    price: 5000,
    duration: "90 Days (Full Exam Season)",
    popular: false,
    tagline: "Complete preparation package covering your entire exam season.",
    features: [
      "90 days unlimited access across UTME, WAEC, & Post-UTME",
      "Over 50,000 solved questions with diagrams",
      "Timed speed drills & topic-by-topic revisions",
      "National weekly mock challenge entry",
      "Live leaderboard & scholarship eligibility",
      "Offline downloadable revision PDFs",
    ],
    ctaText: "Get Season Pass (₦5,000)",
  },
];

export const INITIAL_INVOICES = [
  {
    id: "INV-2026-003",
    date: "2026-08-15",
    plan: "Standard Academy (Termly)",
    amount: "₦65,000.00",
    method: "Paystack Card (•••• 4242)",
    status: "Paid",
  },
  {
    id: "INV-2026-002",
    date: "2026-05-12",
    plan: "Standard Academy (Termly)",
    amount: "₦65,000.00",
    method: "Bank Transfer",
    status: "Paid",
  },
  {
    id: "INV-2026-001",
    date: "2026-01-10",
    plan: "Standard Academy (Monthly)",
    amount: "₦25,000.00",
    method: "Paystack Card (•••• 8910)",
    status: "Paid",
  },
];

export const FAQS = [
  {
    question: "How does the Per-Student Per-Term pricing work?",
    answer: "Instead of charging an expensive flat fee that punishes small schools, AceSmart charges transparently based on your student enrollment (₦400 – ₦500 per student per term). A school with 60 students pays just ₦27,000/term, while a school with 400 students pays ₦160,000/term.",
  },
  {
    question: "How does our school profit using the ICT Portal Levy strategy?",
    answer: "Schools typically add an 'ICT & Portal Levy' of ₦1,000 to ₦1,500 per term to each student's school bill. Since you pay AceSmart only ₦400 – ₦500 per child, the software costs your school ₦0 out of pocket, and your school earns an extra ₦500 – ₦1,000 pure profit per student every term!",
  },
  {
    question: "What is the ₦500 Online Result-Checker Token engine?",
    answer: "If you prefer not to add a portal fee to tuition, parents can unlock and print official terminal report cards online with a ₦500 token. Revenue is split 50/50: ₦250 to AceSmart and ₦250 paid directly to the school bank account.",
  },
  {
    question: "What payment methods are supported?",
    answer: "We support all major Nigerian payment methods via Paystack, including Mastercard, Visa, Verve cards, direct Bank Transfer, and USSD codes (*737#, *919#, etc.).",
  },
  {
    question: "Do you offer offline CBT testing solutions for schools with poor internet?",
    answer: "Yes! Our Institution and Enterprise plans support local offline hotspot test rooms. Students can take CBT examinations over a local Wi-Fi router without active internet, and results synchronize automatically when connected.",
  },
];
