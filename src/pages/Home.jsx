import { Suspense, lazy, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import { AuthProvider } from "../libs/AuthProvider";
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
import AdminDebtorManager from "./institution/AdminDebtorManager";
import AdminFeeBillingManager from "./institution/AdminFeeBillingManager";
import InstitutionSettings from "./institution/InstitutionSettings";
import StaffManager from "./institution/StaffManager";
import StudentPortalDashboard from "./student/StudentPortalDashboard";

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
              element={tenantSchool ? <StudentPortalDashboard /> : <Landing />}
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/pricing" element={<PricingPage />} />

            {/* Student & Parent Portal */}
            <Route path="/student/portal" element={<StudentPortalDashboard />} />

            {/* Institutional Admin ERP Routes */}
            <Route path="/institution/dashboard" element={<SchoolAdminDashboard />} />
            <Route path="/institution/staff" element={<StaffManager />} />
            <Route path="/institution/staff-qr" element={<StaffQrGenerator />} />
            <Route path="/institution/fees" element={<AdminFeeBillingManager />} />
            <Route path="/institution/debtors" element={<AdminDebtorManager />} />
            <Route path="/institution/settings" element={<InstitutionSettings />} />

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
