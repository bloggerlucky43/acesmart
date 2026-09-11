import { createContext, useContext, useEffect, useState } from "react";
import { getStorageKey } from "../../../libs/helper";
const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
  const [examData, setExamData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState({});

  // Restore exam from localStorage on refresh
  useEffect(() => {
    const raw = localStorage.getItem("activeExamKey");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.sections) {
        setExamData(parsed);
      }
    } catch (e) {
      console.error("Failed to parse cached activeExamKey:", e);
    }
  }, []);

  // RESET TIMER WHEN EXAM LOADS
  useEffect(() => {
    if (!examData?.duration) return;
    setTimeLeft(examData.duration * 60);
  }, [examData]);

  // TIMER COUNTDOWN
  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  // AUTO SUBMIT WHEN TIME IS UP
  useEffect(() => {
    if (timeLeft === 0 && examData) {
      submitExam();
    }
  }, [timeLeft]);

  const loadExamData = (data, userId) => {
    const enrichedExam = {
      ...data,
      userId,
    };

    setExamData(enrichedExam);
    setAnswers({});
    setScores({});
    setTotalScore(0);
    setFlaggedQuestions({});
    localStorage.setItem("activeExamKey", JSON.stringify(enrichedExam));
  };

  // LOAD REALISTIC CBT DEMO EXAM (For direct testing of /takeexam or /take_exam)
  const loadDemoExam = () => {
    const demoData = {
      id: "demo-exam-cbt",
      title: "CBT Standardized Assessment Simulation",
      duration: 30, // 30 mins
      totalMarks: 100,
      sections: [
        {
          section: "Mathematics",
          questions: [
            {
              id: "math-1",
              questionText: "If 3x + 7 = 22, what is the value of 2x - 1?",
              options: { A: "7", B: "9", C: "11", D: "15" },
              correctAnswer: "9",
            },
            {
              id: "math-2",
              questionText: "A rectangular garden has a length of 14m and perimeter of 48m. Find its area.",
              options: { A: "120 m²", B: "140 m²", C: "144 m²", D: "168 m²" },
              correctAnswer: "140 m²",
            },
            {
              id: "math-3",
              questionText: "What is the slope of the line passing through points (2, 3) and (6, 11)?",
              options: { A: "1.5", B: "2.0", C: "2.5", D: "4.0" },
              correctAnswer: "2.0",
            },
            {
              id: "math-4",
              questionText: "Simplify: log₁₀(1000) + log₂(32) - ln(e²)",
              options: { A: "4", B: "6", C: "8", D: "10" },
              correctAnswer: "6",
            },
            {
              id: "math-5",
              questionText: "The probability of rolling a prime number on a standard six-sided die is:",
              options: { A: "1/6", B: "1/3", C: "1/2", D: "2/3" },
              correctAnswer: "1/2",
            },
          ],
        },
        {
          section: "English Language",
          questions: [
            {
              id: "eng-1",
              questionText: "Choose the word most nearly opposite in meaning to <b>METICULOUS</b>:",
              options: { A: "Painstaking", B: "Careless", C: "Thorough", D: "Diligent" },
              correctAnswer: "Careless",
            },
            {
              id: "eng-2",
              questionText: "Neither of the candidates _______ qualified for the senior advisory position.",
              options: { A: "is", B: "are", C: "were", D: "being" },
              correctAnswer: "is",
            },
            {
              id: "eng-3",
              questionText: "Identify the figure of speech: <i>'The wind whispered secrets through the willow trees.'</i>",
              options: { A: "Metaphor", B: "Personification", C: "Hyperbole", D: "Irony" },
              correctAnswer: "Personification",
            },
            {
              id: "eng-4",
              questionText: "Select the sentence with correct punctuation:",
              options: {
                A: "Its a matter of time before they're project succeeds.",
                B: "It's a matter of time before their project succeeds.",
                C: "It's a matter of time before they're project succeeds.",
                D: "Its a matter of time before there project succeeds.",
              },
              correctAnswer: "It's a matter of time before their project succeeds.",
            },
            {
              id: "eng-5",
              questionText: "To <i>'burn the midnight oil'</i> idiomatically means to:",
              options: {
                A: "Waste natural resources carelessly",
                B: "Work or study late into the night",
                C: "Cause an accidental fire",
                D: "Procrastinate on important tasks",
              },
              correctAnswer: "Work or study late into the night",
            },
          ],
        },
        {
          section: "General Science",
          questions: [
            {
              id: "sci-1",
              questionText: "Which cellular organelle is responsible for generating adenosine triphosphate (ATP)?",
              options: { A: "Ribosome", B: "Endoplasmic Reticulum", C: "Mitochondria", D: "Golgi Apparatus" },
              correctAnswer: "Mitochondria",
            },
            {
              id: "sci-2",
              questionText: "Newton's Second Law of Motion is expressed mathematically as:",
              options: { A: "F = ma", B: "E = mc²", C: "P = IV", D: "v = u + at" },
              correctAnswer: "F = ma",
            },
            {
              id: "sci-3",
              questionText: "What is the pH level of pure distilled water at 25°C?",
              options: { A: "0", B: "5.5", C: "7.0", D: "14.0" },
              correctAnswer: "7.0",
            },
            {
              id: "sci-4",
              questionText: "Which layer of the Earth's atmosphere contains the ozone layer that absorbs UV radiation?",
              options: { A: "Troposphere", B: "Stratosphere", C: "Mesosphere", D: "Thermosphere" },
              correctAnswer: "Stratosphere",
            },
            {
              id: "sci-5",
              questionText: "Which chemical element has the atomic number 6 and forms the basis for organic chemistry?",
              options: { A: "Oxygen", B: "Nitrogen", C: "Carbon", D: "Hydrogen" },
              correctAnswer: "Carbon",
            },
          ],
        },
      ],
    };

    const demoStudent = {
      id: "demo-student-001",
      studentId: "CBT-PRACTICE-01",
      firstName: "Practice",
      lastName: "Candidate",
    };

    localStorage.setItem("examStudent", JSON.stringify(demoStudent));
    loadExamData(demoData, demoStudent.studentId);
    return demoData;
  };

  // SAVE ANSWERS
  const saveAnswer = (section, qid, value) => {
    setAnswers((prev) => ({
      ...prev,
      [`${section}-${qid}`]: value,
    }));
  };

  // CLEAR ANSWER
  const clearAnswer = (section, qid) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[`${section}-${qid}`];
      return next;
    });
  };

  // TOGGLE FLAGGED FOR REVIEW
  const toggleFlag = (section, qid) => {
    const key = `${section}-${qid}`;
    setFlaggedQuestions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // SUBMIT EXAM
  const submitExam = () => {
    if (!examData) return;

    const totalMarks = examData?.totalMarks || 100;
    const numberOfSections = examData?.sections?.length || 1;
    const marksPerSection = totalMarks / numberOfSections;

    let newScores = {};
    let overall = 0;

    examData?.sections?.forEach((section) => {
      const qCount = section.questions?.length || 1;
      const marksPerQuestion = marksPerSection / qCount;

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
        clearAnswer,
        flaggedQuestions,
        toggleFlag,
        submitExam,
        timeLeft,
        formatTime,
        loadExamData,
        loadDemoExam,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => useContext(ExamContext);
