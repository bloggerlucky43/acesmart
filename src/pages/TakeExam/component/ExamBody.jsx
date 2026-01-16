import { Box, Flex, Text, Button, Tabs, Image } from "@chakra-ui/react";
import { useExam } from "./ExamContext";
import { useEffect, useRef, useState } from "react";
import { toaster } from "../../../components/ui/toaster";
import {
  saveExamResult,
  checkResultExisting,
} from "../../../api-endpoint/exam/exams";
import { useNavigate } from "react-router-dom";

export default function ExamBody() {
  const { examData, answers, saveAnswer, scores, totalScore } = useExam();
  const [tabValue, setTabValue] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState({});
  const violationCount = useRef(0);
  const totalMarks = examData?.totalMarks || 400;
  const percentage = (totalScore / totalMarks) * 100;
  const hasProcessedRef = useRef(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (examData?.sections?.length > 0) {
      setTabValue(examData.sections[0].section);
      setCurrentQuestionIndex(
        examData?.sections.reduce((acc, section) => {
          acc[section.section] = 0;
          return acc;
        }, {})
      );
    }
  }, [examData]);

  const enforceFullScreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {}
    }
  };

  // Full screen enforcement
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (error) {
        toaster.create({
          title: "FullScreen is required to take this exam",
          type: "warning",
        });
      }
    };
    enterFullscreen();
  }, []);

  //Violation handler
  const reportViolation = (reason) => {
    violationCount.current += 1;

    toaster.create({
      title: "Exam Violation Detected",
      description: reason,
      type: "error",
    });

    if (violationCount.current >= 5) {
      toaster.create({
        title: "Exam terminated due to multiple violations",
        type: "error",
      });

      AutoSubmit();
    }
  };

  useEffect(() => {
    //Tab switch
    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportViolation("Tab switch detected");
        toaster.create({
          title: "Tab Switch Detected",
          type: "warning",
        });
      }
    };

    const handleBlur = () => {
      reportViolation("Window focus lost");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    //Disable right clikc/copy
    const disableRightClick = (e) => e.preventDefault();
    const disableCopy = (e) => e.preventDefault();

    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("copy", disableCopy);
    document.addEventListener("cut", disableCopy);
    document.addEventListener("paste", disableCopy);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        toaster.create({
          title: "Fullscreen Required",
          type: "warning",
        });
        enforceFullScreen();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("copy", disableCopy);
      document.removeEventListener("cut", disableCopy);
      document.removeEventListener("paste", disableCopy);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
      // document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  const student = localStorage?.getItem("examStudent");
  const parsedStudent = JSON?.parse(student);
  // console.log("The parsed student is ", student, parsedStudent);

  const AutoSubmit = async () => {
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

    try {
      //Check if result already exists
      const checkRes = await checkResultExisting({
        studentId: parsedStudent?.studentId,
        examId: examData?.id,
      });

      if (checkRes?.exists) {
        toaster.create({
          title: "Exam already submitted",
          type: "warning",
        });

        navigate(`/exam/${examData?.id}`);
        return;
      }

      //save exam results
      await saveExamResult({
        scores,
        studentId: parsedStudent?.id,
        studentCode: parsedStudent?.studentId,
        examId: examData?.id,
        examTitle: examData?.title,
        totalMarks: examData?.totalMarks,
      });

      toaster.create({
        title: "Exam auto-submitted due to violations",
        type: "error",
      });

      navigate(`/exam/${examData?.id}`);
    } catch (error) {
      console.error("Auto-submit failed", error);
      toaster.create({
        title: "Failed to auto submit exam",
        type: "error",
      });
    } finally {
      localStorage.removeItem("examData");
      localStorage.removeItem("examStudent");
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement) {
        reportViolation("Exited fullscreen mode");
        document.documentElement.requestFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () =>
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  if (!examData || !examData.sections) {
    return (
      <Flex align="center" minH="70vh" justify="center">
        <Text fontSize="lg" color="gray.600">
          Loading exam...
        </Text>
      </Flex>
    );
  }
  return (
    <Box minH="70vh" mx="auto" mt={2} bg="white" maxW="8xl">
      <Flex p={2} direction={"column"} w="full">
        <Tabs.Root
          variant="enclosed"
          value={tabValue}
          onValueChange={(e) => setTabValue(e.value)}
          color="gray.900"
          mb={6}
          w="full"
        >
          <Tabs.List w="full" bg="gray.200" borderRadius="none">
            {examData?.sections.map((section, idx) => (
              <Tabs.Trigger
                key={idx}
                color="black"
                w="full"
                borderRadius="none"
                _selected={{ bg: "primary", color: "white" }}
                value={section.section}
              >
                {section.section}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {examData?.sections?.map((section) => {
            const qIndex = currentQuestionIndex[section?.section];
            const question = section?.questions[qIndex];
            if (!question) return null;
            return (
              <Tabs.Content
                key={section?.section}
                py={4}
                value={section?.section}
              >
                {/* current question */}
                <Flex direction="column" mb={4}>
                  <Image src={question?.imageUrl} w="40%" />
                  <Text
                    ml={4}
                    mb={2}
                    dangerouslySetInnerHTML={{ __html: question?.topic }}
                  />

                  <Flex mb={2} gap={4}>
                    <Text mb={2} fontWeight="medium">
                      {qIndex + 1}.
                    </Text>
                    <Text
                      dangerouslySetInnerHTML={{
                        __html: question?.questionText,
                      }}
                    />
                  </Flex>

                  <Flex direction="column" gap={4}>
                    {Object.entries(question.options).map(([key, opt], i) => {
                      const inputName = `${section?.section}-${question.id}`;

                      return (
                        <label
                          key={i}
                          htmlFor={inputName}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                            gap: "8px",
                            padding: "6px 10px",
                            border: "none",
                          }}
                        >
                          <input
                            type="radio"
                            name={inputName}
                            value={opt}
                            checked={answers[inputName] === opt}
                            onChange={(e) => {
                              console.log("Answer selected:", e.target.value);
                              saveAnswer(
                                section.section,
                                question.id,
                                e.target.value
                              );
                            }}
                          />
                          <Text>{opt}</Text>
                        </label>
                      );
                    })}
                  </Flex>
                </Flex>

                {/* Prev / Next Navigation */}

                <Flex justify="space-between" mb={6}>
                  <Button
                    onClick={() =>
                      setCurrentQuestionIndex((prev) => ({
                        ...prev,
                        [section.section]: Math.max(
                          0,
                          prev[section.section] - 1
                        ),
                      }))
                    }
                    disabled={qIndex === 0}
                    size={"sm"}
                  >
                    Prev
                  </Button>

                  <Button
                    onClick={() =>
                      setCurrentQuestionIndex((prev) => ({
                        ...prev,
                        [section.section]: Math.min(
                          section.questions.length - 1,
                          prev[section.section] + 1
                        ),
                      }))
                    }
                    disabled={qIndex === section.questions.length - 1}
                  >
                    {" "}
                    Next
                  </Button>
                </Flex>

                {/* question navigator */}
                <Flex mt={4} wrap="wrap" gap={2}>
                  {section.questions.map((q, i) => {
                    const answered = !!answers[`${section.section}-${q.id}`];
                    const isActive = i === qIndex;

                    return (
                      <Button
                        key={q.id}
                        size="sm"
                        bg={answered ? "secondary" : "danger"}
                        onClick={() =>
                          setCurrentQuestionIndex((prev) => ({
                            ...prev,
                            [section.section]: i,
                          }))
                        }
                      >
                        {i + 1}
                      </Button>
                    );
                  })}
                </Flex>
              </Tabs.Content>
            );
          })}
        </Tabs.Root>
      </Flex>
    </Box>
  );
}
