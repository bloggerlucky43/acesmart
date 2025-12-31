import { lazy } from "react";

export const Teacher = lazy(() => import("./teacher/dashboard"));
export const AddStudent = lazy(() =>
  import("./teacher/schoolmanagement/addStudent")
);
export const Dashboard = lazy(() => import("./TakeExam/pages/exampage"));
export const ViewStudent = lazy(() =>
  import("./teacher/schoolmanagement/Liststudent")
);
export const EditStudent = lazy(() =>
  import("./teacher/schoolmanagement/editStudent")
);
export const AddQuestion = lazy(() =>
  import("./teacher/questionbank/addQuestion")
);
export const ExamLoginPage = lazy(() => import("./TakeExam/login"));
export const CreateExam = lazy(() =>
  import("./teacher/exammanagement/createExam")
);
export const AllExams = lazy(() => import("./teacher/exammanagement/AllExams"));
export const EditSettings = lazy(() =>
  import("./teacher/exammanagement/examSettings")
);
export const ExamQuestionPage = lazy(() =>
  import("./teacher/exammanagement/examquestionpage")
);
export const StartExam = lazy(() => import("./TakeExam/startExam"));
export const Performance = lazy(() =>
  import("./teacher/exammanagement/Perfomance")
);
export const ResultPage = lazy(() =>
  import("./teacher/exammanagement/Perfomance/resultpage")
);
export const ScoreModal = lazy(() => import("./TakeExam/component/ScoreModal"));
