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
} from ".";

import { Toaster } from "../components/ui/toaster";
import { ExamProvider } from "./TakeExam/component/ExamContext";
import PageLoader from "../components/ui/pageloader";

const Home = () => {
  return (
    <>
      <ExamProvider>
        <Routes>
          {/* student take exam */}
          <Route path="/exam/:id" element={<ExamLoginPage />} />
          <Route path="/ex/:id" element={<StartExam />} />
          <Route path="/take_exam" element={<Dashboard />} />
          <Route path="/student_result" element={<ScoreModal />} />
        </Routes>
      </ExamProvider>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />

            <Route path="/teacher_dashboard" element={<Teacher />} />
            <Route path="/teacher/add_student" element={<AddStudent />} />
            <Route path="/teacher/view" element={<ViewStudent />} />
            <Route path="/teacher/edit" element={<EditStudent />} />
            <Route path="/teacher/add_questions" element={<AddQuestion />} />
            <Route path="/teacher/create_exam" element={<CreateExam />} />
            <Route path="/teacher/exams" element={<AllExams />} />
            <Route path="/teacher/exams/edit" element={<EditSettings />} />
            <Route
              path="/teacher/exam/questions"
              element={<ExamQuestionPage />}
            />
            <Route path="/teacher/exam_result" element={<Performance />} />
            <Route path="/teacher/exam_results/:id" element={<ResultPage />} />
          </Routes>
        </Suspense>
        <Toaster />
      </AuthProvider>
    </>
  );
};

export default Home;
