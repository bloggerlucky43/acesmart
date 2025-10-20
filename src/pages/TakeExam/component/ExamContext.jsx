// ExamContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

// Simulated exam data with correct answers
const examData = {
  totalMarks: 400,
  sections: [
    {
      section: "English",
      questions: [
        {
          id: 1,
          question: "Choose the correct synonym of 'Happy'.",
          options: ["Sad", "Joyful", "Angry", "Worried"],
          correctAnswer: "Joyful",
        },
        {
          id: 2,
          question: "Fill in the blank: She ____ to the market yesterday.",
          options: ["go", "going", "went", "gone"],
          correctAnswer: "went",
        },
      ],
    },

    {
      section: "Mathematics",
      questions: [
        {
          id: 3,
          question: "Solve: 2x + 3 = 7. Find x.",
          options: ["1", "2", "3", "4"],
          correctAnswer: "2",
        },
        {
          id: 4,
          question: "What is the square root of 81?",
          options: ["7", "8", "9", "10"],
          correctAnswer: "9",
        },
      ],
    },

    {
      section: "Physics",
      questions: [
        {
          id: 5,
          question: "What is the SI unit of Force?",
          options: ["Pascal", "Newton", "Joule", "Watt"],
          correctAnswer: "Newton",
        },
      ],
    },
  ],
};

const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60 * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      submitExam();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  console.log("Total score", totalScore);

  const saveAnswer = (section, qid, value) => {
    setAnswers((prev) => ({
      ...prev,
      [`${section}-${qid}`]: value,
    }));
  };

  // Auto-mark exam
  const submitExam = () => {
    const totalMarks = examData.totalMarks || 100;
    const numberOfSections = examData.sections.length;
    const marksPerSection = totalMarks / numberOfSections;
    console.log(
      "at submit exam,first three parameters",
      totalMarks,
      numberOfSections,
      marksPerSection
    );

    let newScores = {};
    let overall = 0;

    examData.sections.forEach((section) => {
      const marksPerQuestion = marksPerSection / section.questions.length;

      let sectionScore = 0;

      section.questions.forEach((q) => {
        const ans = answers[`${section.section}-${q.id}`];
        console.log(
          `Checking ${section.section} → Q${q.id}: user="${ans}", correct="${q.correctAnswer}"`
        );
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
    console.log("== MARKING COMPLETE ==");
    console.log("Section scores:", newScores);
    console.log("Total score:", roundedOverall);
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
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => useContext(ExamContext);
