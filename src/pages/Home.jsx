import { Routes, Route, useLocation } from "react-router-dom";
import Landing from "./Landing";
import { AuthProvider } from "../libs/AuthProvider";
import Teacher from "./teacher/dashboard";
import AddStudent from "./teacher/schoolmanagement/addStudent";
import Dashboard from "./TakeExam/pages/exampage";
import ViewStudent from "./teacher/schoolmanagement/Liststudent";
import EditStudent from "./teacher/schoolmanagement/editStudent";
import AddQuestion from "./teacher/questionbank/addQuestion";
import ExamLoginPage from "./TakeExam/login";
import CreateExam from "./teacher/exammanagement/createExam";
import AllExams from "./teacher/exammanagement/AllExams";
import EditSettings from "./teacher/exammanagement/examSettings";
import ExamQuestionPage from "./teacher/exammanagement/examquestionpage";
import { Toaster } from "../components/ui/toaster";
const Home = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* student routes */}
        <Route path="/take_exam" element={<Dashboard />} />

        <Route path="/teacher_dashboard" element={<Teacher />} />
        <Route path="/teacher/add_student" element={<AddStudent />} />
        <Route path="/teacher/view" element={<ViewStudent />} />
        <Route path="/teacher/edit" element={<EditStudent />} />
        <Route path="/teacher/add_questions" element={<AddQuestion />} />
        <Route path="/teacher/create_exam" element={<CreateExam />} />
        <Route path="/teacher/exams" element={<AllExams />} />
        <Route path="/teacher/exams/edit" element={<EditSettings />} />
        <Route path="/teacher/exam/questions" element={<ExamQuestionPage />} />
        {/* student take exam */}
        <Route path="/school/exam/:id" element={<ExamLoginPage />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
};

export default Home;
