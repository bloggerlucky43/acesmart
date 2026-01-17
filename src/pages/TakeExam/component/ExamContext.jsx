import { createContext, useContext, useEffect, useState } from "react";
import { getStorageKey } from "../../../libs/helper";
const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
  const [examData, setExamData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
 


   useEffect(() => {
      const raw = localStorage.getItem("activeExamKey");
      if (!raw) return;
  
      const cached = localStorage.getItem(raw);
      if (cached) {
        const parsed = JSON.parse(cached);
        setExamData(parsed);
      }
   }, []);
  
  //RESET TIMER WHEN EXAM LOADS
  useEffect(() => {
    if (!examData?.duration) return;

    setTimeLeft(examData.duration * 60);
  }, [examData]);

  //TIMER COUNTDOWN
  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);


  //AUTO SUBMIT WHEN TIME IS UP

  useEffect(() => {
    if (timeLeft === 0 && examData) {
      submitExam();
    }
  }, [timeLeft]);

  const loadExamData = (data, userId) => {
    const enrichedExam = {
      ...data,
      userId,
    }

    const key = getStorageKey(data?.id, userId)
    console.log("The key at loading exam is ",key);
    
    setExamData(enrichedExam);
    setAnswers({});
    setScores({});
    setTotalScore(0);
    localStorage.setItem("activeExamKey", JSON.stringify(enrichedExam));
  };

  //SAVE ANSWERS

  const saveAnswer = (section, qid, value) => {
    setAnswers((prev) => ({
      ...prev,
      [`${section}-${qid}`]: value,
    }));
  };


  //SUBMIT EXAM
  const submitExam = () => {
    if (!examData) return;

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
   
    setAnswers({});
    localStorage.removeItem("activeExamKey");
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
