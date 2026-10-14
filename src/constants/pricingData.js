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
    id: "standard",
    label: "Standard Academy",
    minStudents: 6,
    maxStudents: Infinity,
    termlyPrice: 25000,
    annualPrice: 65000, // ₦25,000 * 3 = ₦75,000 (Save ₦10k = ₦65,000/yr)
    monthlyPrice: 10000,
    aiLimit: "250 AI credits/mo",
    effectiveRate: 0,
  },
  {
    id: "premier",
    label: "Premier Institution",
    minStudents: 6,
    maxStudents: Infinity,
    termlyPrice: 45000,
    annualPrice: 115000, // ₦45,000 * 3 = ₦135,000 (Save ₦20k = ₦115,000/yr)
    monthlyPrice: 18000,
    aiLimit: "1,000 AI credits/mo",
    effectiveRate: 0,
  },
];

export function getTierForStudentCount(count) {
  const n = Math.max(Number(count) || 0, 0);
  if (n <= 5) return GRADUATED_TIERS[0];
  return GRADUATED_TIERS[1]; // default standard
}

export function calculateSchoolCost(studentCount, billingCycle = "termly") {
  const n = Math.max(Number(studentCount) || 0, 0);
  if (n <= 5) return 0;
  const tier = GRADUATED_TIERS[1]; // Standard Academy flat rate
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
  return 10000; // Save ₦10,000 per annum
}

export function calculateParentCollection(studentCount, levyPerStudent = 1000, billingCycle = "termly") {
  const n = Math.max(Number(studentCount) || 0, 0);
  const levy = Number(levyPerStudent) || 1000;
  const cycle = String(billingCycle || "termly").toLowerCase();

  if (cycle === "annual" || cycle === "annually" || cycle === "yearly") {
    return n * levy * TERMS_PER_YEAR;
  }
  if (cycle === "monthly") {
    return Math.round((n * levy) / 3);
  }
  return n * levy;
}

export function calculateSchoolProfit(studentCount, levyPerStudent = 1000, billingCycle = "termly") {
  return calculateParentCollection(studentCount, levyPerStudent, billingCycle) - calculateSchoolCost(studentCount, billingCycle);
}

export const EDUCATOR_PLANS = [
  {
    id: "demo",
    name: "Free Demo / Pilot",
    badge: "Free Trial",
    tagline: "Test-drive AceSmart with a small classroom pilot before onboarding your institution.",
    ratePerChild: "Free (5 Trial Students)",
    annualRatePerChild: "Free Demo",
    monthlyPrice: 0,
    termlyPrice: 0,
    annualPrice: 0,
    annualSavings: 0,
    popular: false,
    studentLimit: "5 Trial Students",
    examLimit: 5,
    aiLimit: "15 AI credits / mo (Hard Cap)",
    features: [
      "Up to 5 trial students",
      "5 published test examinations",
      "15 AI question generations / mo (Institution Cap)",
      "Standard WAEC & JAMB past questions",
      "Automated CBT grading & scoring",
      "Basic PDF student score sheets",
    ],
    limitations: [
      "Strictly for small classroom testing",
      "No custom domain or official stamps",
      "No biometric face proctoring",
    ],
    ctaText: "Start Free Demo",
    disabled: true,
  },
  {
    id: "standard",
    name: "Standard Academy",
    badge: "Most Popular • Unlimited Students",
    tagline: "Unlimited student capacity with full CBT examinations, dual attendance, and report cards.",
    ratePerChild: "₦25,000 / term (Unlimited Students)",
    annualRatePerChild: "₦65,000 / yr (Save ₦10k / yr • 3 Terms)",
    monthlyPrice: 10000,
    termlyPrice: 25000,
    annualPrice: 65000,
    annualSavings: 10000,
    popular: true,
    studentLimit: "Unlimited Students",
    examLimit: "Unlimited",
    aiLimit: "250 AI credits / mo (Institution Cap)",
    features: [
      "Unlimited student capacity (No per-student fees!)",
      "Flat ₦25,000 / term (Save ₦10,000 on annual subscription)",
      "250 AI question generations & step explanations / mo (Cap)",
      "Unlimited published CBT examinations",
      "Full 50,000+ past questions (JAMB/WAEC)",
      "Staff dynamic QR clock-in & punctuality tracking",
      "Morning (AM) & Afternoon (PM) student roll call",
      "Dual-mode Terminal Report cards (CBT + Manual CA)",
      "Debtor Defaulter Tracker with 1-Click Fee Reminders",
      "Paystack online fee checkout & bursary receipts",
      "Excel (.xlsx) bulk student roster import",
      "Priority WhatsApp & email support",
    ],
    limitations: [
      "No custom white-label subdomain",
      "250 AI credits monthly limit per institution",
    ],
    ctaText: "Upgrade to Standard",
    disabled: false,
  },
  {
    id: "premier",
    name: "Premier Institution",
    badge: "Complete All-in-One Suite",
    tagline: "All in Standard Academy PLUS advanced SMS features: Payroll, Broadsheets, ID Cards, and Expense Ledger.",
    ratePerChild: "₦45,000 / term (Unlimited Students)",
    annualRatePerChild: "₦115,000 / yr (Save ₦20k / yr • 3 Terms)",
    monthlyPrice: 18000,
    termlyPrice: 45000,
    annualPrice: 115000,
    annualSavings: 20000,
    popular: false,
    studentLimit: "Unlimited Students",
    examLimit: "Unlimited",
    aiLimit: "1,000 AI credits / mo (Institution Cap)",
    features: [
      "All features in Standard Academy included",
      "Unlimited student enrollment capacity",
      "Flat ₦45,000 / term (Save ₦20,000 on annual subscription)",
      "1,000 AI question generations & explanations / mo (Cap)",
      "Staff Payroll & Automated Lateness Deductions",
      "Master Broadsheet & 3-Term Cumulative Promotion",
      "Printable Barcode / QR Student & Staff ID Cards",
      "Petty Cash & School Expenses Ledger",
      "Dedicated White-Label Subdomain (school.acesmart.site)",
      "Custom School Crest, Principal Digital Signature & Official Stamp",
      "₦500 Result-Checker Paywall Token Engine (50/50 revenue split with school)",
      "Biometric webcam proctoring for CBT exams",
      "Dedicated account manager & priority phone support",
    ],
    limitations: [
      "1,000 AI credits monthly limit per institution",
    ],
    ctaText: "Upgrade to Premier",
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
    question: "How does the Hybrid Flat-Rate pricing work?",
    answer: "Like Klacify, AceSmart charges an ultra-affordable flat rate per term rather than punitively high subscription fees. Our Standard Academy plan is just ₦20,000/term flat for up to 300 students — matching Klacify while also giving your school a full CBT exam engine, student roll call, staff QR clock-in, and instant report cards.",
  },
  {
    question: "How does our school profit using the ICT Portal Levy strategy?",
    answer: "Schools typically add an 'ICT & Portal Levy' of ₦1,000 per term to each student's school bill. For a school with 200 students, you collect ₦200,000. You pay AceSmart only ₦20,000 flat, leaving your school with an extra ₦180,000 pure surplus every term!",
  },
  {
    question: "What is the ₦500 Online Result-Checker Token engine?",
    answer: "If you prefer not to add a portal fee to tuition, parents can unlock and print official terminal report cards online with a ₦500 token. Revenue is split 50/50: ₦250 to AceSmart and ₦250 paid directly to the school bank account.",
  },
  {
    question: "Are SMS and WhatsApp alert units free?",
    answer: "Because telecom and WhatsApp providers charge per transmission, SMS units are provided via an optional pay-as-you-go bundle (e.g. 1,000 SMS for ₦5,000) or schools can connect their own gateway, ensuring schools only pay for the message units they actually consume.",
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
