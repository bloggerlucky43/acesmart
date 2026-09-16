import {
  FaTachometerAlt,
  FaMoneyBillWave,
  FaReceipt,
  FaFileInvoice,
  FaChartBar,
  FaLaptopCode,
  FaClipboardList,
  FaCalendarCheck,
  FaBell,
  FaBook,
  FaUserEdit,
  FaCog,
  FaQuestionCircle,
} from "react-icons/fa";

export const STUDENT_PORTAL_ROOT = "/student";

export const STUDENT_NAV = [
  {
    title: "OVERVIEW",
    links: [
      { name: "Dashboard", path: "/student", icon: FaTachometerAlt, end: true },
    ],
  },
  {
    title: "FINANCE",
    links: [
      { name: "Fee Statement", path: "/student/fees", icon: FaMoneyBillWave },
      { name: "Payment History", path: "/student/receipts", icon: FaReceipt },
    ],
  },
  {
    title: "ACADEMICS",
    links: [
      { name: "Report Cards", path: "/student/results", icon: FaFileInvoice },
      { name: "Term Performance", path: "/student/performance", icon: FaChartBar },
      { name: "CBT Examinations", path: "/student/exams", icon: FaLaptopCode },
      { name: "Timetable", path: "/student/timetable", icon: FaClipboardList },
      { name: "Attendance Record", path: "/student/attendance", icon: FaCalendarCheck },
    ],
  },
  {
    title: "MY SCHOOL",
    links: [
      { name: "Announcements", path: "/student/announcements", icon: FaBell },
      { name: "Study Resources", path: "/student/resources", icon: FaBook },
      { name: "My Profile", path: "/student/profile", icon: FaUserEdit },
    ],
  },
  {
    title: "ACCOUNT",
    links: [
      { name: "Settings", path: "/student/settings", icon: FaCog },
      { name: "Help & Support", path: "/student/support", icon: FaQuestionCircle },
    ],
  },
];

// Copy shown on routes that are wired up but still waiting on backend endpoints.
export const STUDENT_PAGE_INFO = {
  "/student/receipts": {
    title: "Payment History & Receipts",
    description:
      "A term-by-term record of every fee payment with downloadable, school-stamped receipts.",
    planned: [
      "Full payment ledger per term and session",
      "Downloadable PDF receipts with verification code",
      "Bank transfer confirmation tracking",
      "Outstanding balance history",
    ],
  },
  "/student/performance": {
    title: "Term Performance Analytics",
    description:
      "Track how your scores move across terms and where you are improving fastest.",
    planned: [
      "Subject-by-subject score trend lines",
      "Class average and position comparison",
      "Strongest and weakest subject breakdown",
      "Teacher recommendations per subject",
    ],
  },
  "/student/timetable": {
    title: "Class Timetable",
    description:
      "Your weekly class schedule with subject, teacher, venue, and period times.",
    planned: [
      "Weekly and daily timetable views",
      "Subject, teacher, and venue per period",
      "Exam timetable with countdown",
      "Calendar export and reminders",
    ],
  },
  "/student/attendance": {
    title: "Attendance Record",
    description:
      "See exactly which days you were present, absent, or late this term.",
    planned: [
      "Attendance calendar heatmap",
      "Present / absent / late totals",
      "Attendance percentage vs school requirement",
      "Term and session history",
    ],
  },
  "/student/announcements": {
    title: "Announcements & Notices",
    description:
      "School-wide notices, fee deadlines, resumption dates, and class updates in one feed.",
    planned: [
      "School and class announcement feed",
      "Fee deadline and resumption reminders",
      "Exam and event notices",
      "Read / unread tracking",
    ],
  },
  "/student/resources": {
    title: "Study Resources",
    description:
      "Shared lesson notes, past questions, and reading material from your teachers.",
    planned: [
      "Lesson notes and slides by subject",
      "Past questions and practice sets",
      "Recommended textbook list",
      "Downloadable revision material",
    ],
  },
  "/student/settings": {
    title: "Account Settings",
    description:
      "Manage your portal preferences, notification channels, and session security.",
    planned: [
      "Change portal access PIN",
      "SMS and email notification preferences",
      "Preferred term and language",
      "Linked guardian contacts",
    ],
  },
  "/student/support": {
    title: "Help & Support",
    description:
      "Reach the school bursary or ICT desk when a payment, code, or result is wrong.",
    planned: [
      "Report a payment or receipt issue",
      "Report a missing or wrong result",
      "School bursary and ICT contact details",
      "Frequently asked questions",
    ],
  },
};

export const getStudentPageInfo = (pathname) =>
  STUDENT_PAGE_INFO[pathname?.replace(/\/+$/, "") || ""] || null;
