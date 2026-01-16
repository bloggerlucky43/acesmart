import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
  const [examData, setExamData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const cachedExam = localStorage.getItem("examData");
    if (cachedExam) setExamData(JSON.parse(cachedExam));
  }, []);

  useEffect(() => {
    if (!examData?.duration || timeLeft > 0) return;

    setTimeLeft(examData.duration * 60);
  }, [examData]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && examData) {
      console.log("⏰ Time’s up! Auto-submitting exam...");
      submitExam();
    }
  }, [timeLeft]);

  const loadExamData = (data) => {
    setExamData(data);
    setAnswers({});
    setScores({});
    setTotalScore(0);
    localStorage.setItem("examData", JSON.stringify(data));
  };

  const saveAnswer = (section, qid, value) => {
    setAnswers((prev) => ({
      ...prev,
      [`${section}-${qid}`]: value,
    }));
  };

  const submitExam = () => {
    const totalMarks = examData?.totalMarks || 100;
    const numberOfSections = examData?.sections?.length;
    const marksPerSection = totalMarks / numberOfSections;

    let newScores = {};
    let overall = 0;

    examData?.sections?.forEach((section) => {
      const marksPerQuestion = marksPerSection / section.questions.length;

      let sectionScore = 0;

      section?.questions?.forEach((q) => {
        const ans = answers[`${section.section}-${q.id}`];

        if (ans === q.correctAnswer) {
          sectionScore += marksPerQuestion;
        }
      });

      newScores[section.section] = parseFloat(sectionScore.toFixed(2));
      overall += sectionScore;
    });

    const roundedOverall = parseFloat(overall.toFixed(2));
    setScores(newScores);
    setTotalScore(roundedOverall);
    // console.log("== MARKING COMPLETE ==");
    // console.log("Total score:", roundedOverall);
    setAnswers({});
    localStorage.removeItem("examData");
    return { sectionScores: newScores, total: roundedOverall };
  };

  const formatTime = () => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":");
  };

  return (
    <ExamContext.Provider
      value={{
        examData,
        answers,
        scores,
        totalScore,
        saveAnswer,
        submitExam,
        timeLeft,
        formatTime,
        loadExamData,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => useContext(ExamContext);
