import { Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./Landing";
import { AuthProvider, useAuth } from "../libs/AuthProvider";
import { getTenantSubdomain } from "../libs/tenantSubdomain";
import { getInstitutionBySubdomainApi } from "../api-endpoint/sms/smsEndpoints";
import {
  Teacher,
  AddStudent,
  Dashboard,
  EditStudent,
  AddQuestion,
  ExamLoginPage,
  CreateExam,
  AllExams,
  EditSettings,
  ExamQuestionPage,
  StartExam,
  Performance,
  ResultPage,
  ScoreModal,
  ViewStudent,
  EditExamStructure,
  EditDraft,
  BillingPage,
  PricingPage,
} from ".";

import { Toaster } from "../components/ui/toaster";
import { ExamProvider } from "./TakeExam/component/ExamContext";
import PageLoader from "../components/ui/pageloader";
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";

// School Management System (SMS) Components
import TeacherScanClockIn from "./teacher/sms/TeacherScanClockIn";
import StudentAttendanceManager from "./teacher/sms/StudentAttendanceManager";
import ResultAndReportCardManager from "./teacher/sms/ResultAndReportCardManager";
import SchoolAdminDashboard from "./institution/SchoolAdminDashboard";
import StaffQrGenerator from "./institution/StaffQrGenerator";
import StaffAttendanceHistory from "./institution/StaffAttendanceHistory";
import AdminDebtorManager from "./institution/AdminDebtorManager";
import AdminPaymentHistory from "./institution/AdminPaymentHistory";
import AdminTransactions from "./institution/AdminTransactions";
import AdminFeeBillingManager from "./institution/AdminFeeBillingManager";
import InstitutionSettings from "./institution/InstitutionSettings";
import StaffManager from "./institution/StaffManager";
import PortalContentManager from "./institution/PortalContentManager";
import PrincipalApprovals from "./institution/PrincipalApprovals";

// Student & Parent Portal
import { StudentPortalProvider } from "../libs/StudentPortalProvider";
import StudentPortalLayout from "../components/student/StudentPortalLayout";
import PaymentCallback from "./PaymentCallback";
import StudentOverview from "./student/StudentOverview";
import StudentFees from "./student/StudentFees";
import StudentResults from "./student/StudentResults";
import StudentExams from "./student/StudentExams";
import StudentProfile from "./student/StudentProfile";
import StudentReceipts from "./student/StudentReceipts";
import StudentPerformance from "./student/StudentPerformance";
import StudentTimetable from "./student/StudentTimetable";
import StudentAttendance from "./student/StudentAttendance";
import StudentAnnouncements from "./student/StudentAnnouncements";
import StudentResources from "./student/StudentResources";
import StudentSettings from "./student/StudentSettings";
import StudentSupport from "./student/StudentSupport";

// Role-Guard: Restrict Institution Admin/ERP features from regular teachers
const InstitutionAdminRoute = ({ children }) => {
  const { user } = useAuth();
  const isInstitutionAdmin =
    user?.role === "institution_admin" ||
    user?.role === "admin" ||
    user?.role === "institution";

  if (!isInstitutionAdmin) {
    return <Navigate to="/teacher_dashboard" replace />;
  }

  return children;
};

const Home = () => {
  const [tenantSchool, setTenantSchool] = useState(null);

  useEffect(() => {
    const sub = getTenantSubdomain();
    if (sub) {
      getInstitutionBySubdomainApi(sub)
        .then((res) => {
          if (res.success && res.data) {
            setTenantSchool(res.data);
            document.title = `${res.data.name} | AceSmart Institution Portal`;
          }
        })
        .catch(() => null);
    }
  }, []);

  return (
    <>
      <ExamProvider>
        <Routes>
          {/* student take exam */}
          <Route path="/exam/:id" element={<ExamLoginPage />} />
          <Route path="/ex/:id" element={<StartExam />} />
          <Route path="/take_exam" element={<Dashboard />} />
          <Route path="/takeexam" element={<Dashboard />} />
          <Route path="/student_result" element={<ScoreModal />} />
        </Routes>
      </ExamProvider>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/"
              element={tenantSchool ? <Navigate to="/student" replace /> : <Landing />}
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/pricing" element={<PricingPage />} />

            {/* Paystack return/callback (cosmetic; server verify is authoritative) */}
            <Route path="/payment/callback" element={<PaymentCallback />} />

            {/* Student & Parent Portal */}
            <Route
              path="/student"
              element={
                <StudentPortalProvider>
                  <StudentPortalLayout />
                </StudentPortalProvider>
              }
            >
              <Route index element={<StudentOverview />} />
              <Route path="fees" element={<StudentFees />} />
              <Route path="receipts" element={<StudentReceipts />} />
              <Route path="results" element={<StudentResults />} />
              <Route
                path="results/token"
                element={<Navigate to="/student/results" replace />}
              />
              <Route path="performance" element={<StudentPerformance />} />
              <Route path="exams" element={<StudentExams />} />
              <Route path="timetable" element={<StudentTimetable />} />
              <Route path="attendance" element={<StudentAttendance />} />
              <Route path="announcements" element={<StudentAnnouncements />} />
              <Route path="resources" element={<StudentResources />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="settings" element={<StudentSettings />} />
              <Route path="support" element={<StudentSupport />} />
              <Route path="portal" element={<Navigate to="/student" replace />} />
            </Route>

            {/* Institutional Admin ERP Routes (Restricted to Institution Admins only) */}
            <Route
              path="/institution/dashboard"
              element={
                <InstitutionAdminRoute>
                  <SchoolAdminDashboard />
                </InstitutionAdminRoute>
              }
            />
            <Route
              path="/institution/staff"
              element={
                <InstitutionAdminRoute>
                  <StaffManager />
                </InstitutionAdminRoute>
              }
            />
            <Route
              path="/institution/staff-qr"
              element={
                <InstitutionAdminRoute>
                  <StaffQrGenerator />
                </InstitutionAdminRoute>
              }
            />
            <Route
              path="/institution/attendance-history"
              element={
                <InstitutionAdminRoute>
                  <StaffAttendanceHistory />
                </InstitutionAdminRoute>
              }
            />
            <Route
              path="/institution/fees"
              element={
                <InstitutionAdminRoute>
                  <AdminFeeBillingManager />
                </InstitutionAdminRoute>
              }
            />
            <Route
              path="/institution/debtors"
              element={
                <InstitutionAdminRoute>
                  <AdminDebtorManager />
                </InstitutionAdminRoute>
              }
            />
            <Route
              path="/institution/payments"
              element={
                <InstitutionAdminRoute>
                  <AdminPaymentHistory />
                </InstitutionAdminRoute>
              }
            />
            <Route
              path="/institution/transactions"
              element={
                <InstitutionAdminRoute>
                  <AdminTransactions />
                </InstitutionAdminRoute>
              }
            />
            <Route
              path="/institution/settings"
              element={
                <InstitutionAdminRoute>
                  <InstitutionSettings />
                </InstitutionAdminRoute>
              }
            />
            <Route
              path="/institution/portal-content"
              element={
                <InstitutionAdminRoute>
                  <PortalContentManager />
                </InstitutionAdminRoute>
              }
            />
            <Route
              path="/institution/approvals"
              element={
                <InstitutionAdminRoute>
                  <PrincipalApprovals />
                </InstitutionAdminRoute>
              }
            />

            {/* Teacher SMS Routes */}
            <Route path="/teacher/scan-clockin" element={<TeacherScanClockIn />} />
            <Route path="/teacher/attendance" element={<StudentAttendanceManager />} />
            <Route path="/teacher/report-cards" element={<ResultAndReportCardManager />} />

            {/* Teacher CBT Routes */}
            <Route path="/teacher_dashboard" element={<Teacher />} />
            <Route path="/teacher/add_student" element={<AddStudent />} />
            <Route path="/teacher/view" element={<ViewStudent />} />
            <Route path="/teacher/edit" element={<EditStudent />} />
            <Route path="/teacher/add_questions" element={<AddQuestion />} />
            <Route path="/teacher/create_exam" element={<CreateExam />} />
            <Route path="/teacher/exams" element={<AllExams />} />
            <Route path="/teacher/exams/edit" element={<EditSettings />} />
            <Route
              path="/teacher/exams/edit/:examId/structure"
              element={<EditExamStructure />}
            />
            <Route
              path="/teacher/exams/edit/:examId/draft"
              element={<EditDraft />}
            />
            <Route
              path="/teacher/exam/questions"
              element={<ExamQuestionPage />}
            />
            <Route path="/teacher/exam_result" element={<Performance />} />
            <Route path="/teacher/exam_results/:id" element={<ResultPage />} />
            <Route path="/teacher/billing" element={<BillingPage />} />
          </Routes>
        </Suspense>
        <Toaster />
      </AuthProvider>
    </>
  );
};

export default Home;
