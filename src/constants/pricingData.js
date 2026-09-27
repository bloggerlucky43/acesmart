// AceSmart Pricing & Subscription Plans Data
// Aligned with the Per-Student Termly Strategy (PRICING_STRATEGY.md)

export const ANNUAL_DISCOUNT_PERCENT = 20;
export const TERMS_PER_YEAR = 3;

export const GRADUATED_TIERS = [
  {
    id: "demo",
    label: "Free Demo / Trial",
    minStudents: 0,
    maxStudents: 5,
    termlyPrice: 0,
    annualPrice: 0,
    monthlyPrice: 0,
    aiLimit: "15 AI credits/mo",
    effectiveRate: 0,
  },
  {
    id: "starter",
    label: "Starter School",
    minStudents: 6,
    maxStudents: 70,
    termlyPrice: 25000,
    annualPrice: 60000, // ₦25,000 * 3 * 0.8
    monthlyPrice: 10000,
    aiLimit: "100 AI credits/mo",
    effectiveRate: 357,
  },
  {
    id: "standard",
    label: "Standard Academy",
    minStudents: 71,
    maxStudents: 250,
    termlyPrice: 125000,
    annualPrice: 300000, // ₦125,000 * 3 * 0.8
    monthlyPrice: 50000,
    aiLimit: "500 AI credits/mo",
    effectiveRate: 500,
  },
  {
    id: "premier",
    label: "Premier Institution ERP",
    minStudents: 251,
    maxStudents: 700,
    termlyPrice: 315000,
    annualPrice: 756000, // ₦315,000 * 3 * 0.8
    monthlyPrice: 125000,
    aiLimit: "2,500 AI credits/mo",
    effectiveRate: 450,
  },
  {
    id: "enterprise",
    label: "Mega / Enterprise Group",
    minStudents: 701,
    maxStudents: 2500,
    termlyPrice: 400000,
    annualPrice: 960000, // ₦400,000 * 3 * 0.8
    monthlyPrice: 160000,
    aiLimit: "10,000 AI credits/mo",
    effectiveRate: 400,
  },
];

export function getTierForStudentCount(count) {
  const n = Math.max(Number(count) || 0, 0);
  if (n <= 5) return GRADUATED_TIERS[0];
  return GRADUATED_TIERS.find((t) => n <= t.maxStudents) || GRADUATED_TIERS[GRADUATED_TIERS.length - 1];
}

export function calculateSchoolCost(studentCount, billingCycle = "termly") {
  const n = Math.max(Number(studentCount) || 0, 0);
  if (n <= 5) return 0;
  const tier = getTierForStudentCount(n);
  const cycle = String(billingCycle || "termly").toLowerCase();

  if (cycle === "monthly") {
    return tier.monthlyPrice;
  }
  if (cycle === "annual" || cycle === "annually" || cycle === "yearly") {
    return tier.annualPrice;
  }
  return tier.termlyPrice;
}

export function calculateAnnualSavings(studentCount) {
  const n = Math.max(Number(studentCount) || 0, 0);
  if (n <= 5) return 0;
  const tier = getTierForStudentCount(n);
  return Math.max(tier.termlyPrice * 3 - tier.annualPrice, 0);
}

export function calculateParentCollection(studentCount, levyPerStudent = 1200, billingCycle = "termly") {
  const n = Math.max(Number(studentCount) || 0, 0);
  const levy = Number(levyPerStudent) || 1200;
  const cycle = String(billingCycle || "termly").toLowerCase();

  if (cycle === "annual" || cycle === "annually" || cycle === "yearly") {
    return n * levy * TERMS_PER_YEAR;
  }
  if (cycle === "monthly") {
    return Math.round((n * levy) / 3);
  }
  return n * levy;
}

export function calculateSchoolProfit(studentCount, levyPerStudent = 1200, billingCycle = "termly") {
  return calculateParentCollection(studentCount, levyPerStudent, billingCycle) - calculateSchoolCost(studentCount, billingCycle);
}

export const EDUCATOR_PLANS = [
  {
    id: "demo",
    name: "Free Demo / Pilot",
    badge: "Demo & Trial",
    tagline: "Test-drive AceSmart with a small classroom pilot before onboarding your entire school.",
    ratePerChild: "Free Demo",
    annualRatePerChild: "Free Demo",
    monthlyPrice: 0,
    termlyPrice: 0,
    annualPrice: 0,
    annualSavings: 0,
    popular: false,
    studentLimit: 5,
    examLimit: 5,
    aiLimit: "15 AI generations / mo",
    features: [
      "Up to 5 active students",
      "5 published examinations",
      "15 AI question generations / month",
      "Standard past question bank (5,000 Qs)",
      "Automated CBT grading & scoring",
      "Basic PDF result sheets",
      "Community support",
    ],
    limitations: [
      "Limited to 5 candidates for trial only",
      "No biometric face proctoring",
      "No Excel bulk roster import",
      "AceSmart watermark on result sheets",
    ],
    ctaText: "Start Free Demo",
    disabled: true,
  },
  {
    id: "starter",
    name: "Starter School",
    badge: "Micro Schools",
    tagline: "Ideal for small private nursery/primary schools, tutorial centers & coaching institutes.",
    ratePerChild: "₦25,000 / term (up to 70 kids)",
    annualRatePerChild: "₦60,000 / yr (Save ₦15k • 20% OFF)",
    monthlyPrice: 10000,
    termlyPrice: 25000,
    annualPrice: 60000,
    annualSavings: 15000,
    popular: false,
    studentLimit: 70,
    examLimit: "Unlimited",
    aiLimit: "100 AI generations / mo",
    features: [
      "Up to 70 active students",
      "Flat termly pricing: ₦25,000 / term",
      "100 AI question bank generations / month",
      "AI question shuffling & difficulty balancing",
      "Unlimited published examinations",
      "Morning (AM) student roll call",
      "Instant PDF result score sheets",
      "Excel (.xlsx) bulk student roster import",
      "Standard WAEC/JAMB past question banks",
      "WhatsApp & email support",
    ],
    limitations: [
      "No AI biometric face matching",
    ],
    ctaText: "Upgrade to Starter",
    disabled: false,
  },
  {
    id: "standard",
    name: "Standard Academy",
    badge: "Most Popular",
    tagline: "Ideal for growing private schools wanting automated CBT, dual attendance, and AI anti-cheat.",
    ratePerChild: "₦125,000 / term (< 250 kids)",
    annualRatePerChild: "₦300,000 / yr (Save ₦75k • 20% OFF)",
    monthlyPrice: 50000,
    termlyPrice: 125000,
    annualPrice: 300000,
    annualSavings: 75000,
    popular: true,
    studentLimit: 250,
    examLimit: "Unlimited",
    aiLimit: "500 AI generations / mo",
    features: [
      "Up to 250 active students (< 250 capacity)",
      "Flat termly pricing: ₦125,000 / term",
      "500 AI question generations & step explanations / mo",
      "AI anti-cheat suspicious behavior scoring",
      "Morning (AM) & Afternoon (PM) student roll call",
      "Unlimited published examinations",
      "Full 50,000+ past questions (JAMB/WAEC)",
      "Automated ALOC question bank importer",
      "Excel (.xlsx) bulk student roster import",
      "Instant Excel & PDF master score sheets",
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
    id: "premier",
    name: "Premier Institution ERP",
    badge: "All-in-One Suite",
    tagline: "Complete School Management System + AI CBT Proctored Examination Suite.",
    ratePerChild: "₦315,000 / term (< 700 kids)",
    annualRatePerChild: "₦756,000 / yr (Save ₦189k • 20% OFF)",
    monthlyPrice: 125000,
    termlyPrice: 315000,
    annualPrice: 756000,
    annualSavings: 189000,
    popular: false,
    studentLimit: 700,
    examLimit: "Unlimited",
    aiLimit: "2,500 AI generations / mo",
    features: [
      "Up to 700 active students (< 700 capacity)",
      "Flat termly pricing: ₦315,000 / term",
      "2,500 AI generations & automated theory grading / mo",
      "AI Biometric webcam face verification & live proctoring",
      "AI class readiness & weak topic diagnostic analytics",
      "All-in-One School Management System (SMS)",
      "Staff QR Barcode Clock-In Attendance System",
      "Student Morning & Afternoon Daily Roll Call",
      "Terminal Report Card Broadsheets (CBT + Manual)",
      "Termly School Fee Billing & Parent Online Portal",
      "Debtor Defaulter Tracker with 1-Click Fee Reminders",
      "₦500 Terminal Result-Checker Paywall Token Engine",
      "Custom School Crest, Signature & Stamp on Report Cards",
      "Dedicated account manager & priority phone support",
    ],
    limitations: [],
    ctaText: "Upgrade to Premier ERP",
    disabled: false,
  },
  {
    id: "enterprise",
    name: "Mega / Enterprise Group",
    badge: "Large Groups",
    tagline: "Custom-tailored deployment for state educational boards, dioceses & large school groups.",
    ratePerChild: "₦400,000 / term (700+ kids)",
    annualRatePerChild: "₦960,000 / yr (Save ₦240k • 20% OFF)",
    monthlyPrice: 160000,
    termlyPrice: 400000,
    annualPrice: 960000,
    annualSavings: 240000,
    popular: false,
    studentLimit: "700+ Unlimited",
    examLimit: "Unlimited",
    aiLimit: "10,000 AI generations / mo",
    features: [
      "700+ students (Unlimited student enrollments)",
      "Flat termly pricing: ₦400,000 / term",
      "10,000 AI generations & dedicated high-priority queue / mo",
      "Full AI multi-face, voice & background anomaly detection",
      "Multi-campus centralized governance",
      "Custom AI proctoring parameters",
      "On-premise / private cloud deployment option",
      "SLA 99.9% uptime guarantee",
      "Custom integration with school ERP/SIS",
      "Dedicated 24/7 technical engineer & staff training",
    ],
    limitations: [],
    ctaText: "Upgrade to Mega Group",
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
    question: "Do you offer a discount if we pay annually?",
    answer: "Yes! Schools that pay annually (covering the full 3-term academic session upfront) receive an automatic 20% discount. This provides substantial savings (e.g. Save ₦39,000 on Standard, ₦96,000 on Premier ERP, or ₦210,000 on Enterprise) while eliminating the need for termly budget reconciliations.",
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
