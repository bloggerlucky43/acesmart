import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import { AuthProvider } from "../libs/AuthProvider";
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

const Home = () => {
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
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/pricing" element={<PricingPage />} />

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
