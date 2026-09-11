import {
  Box,
  Flex,
  Text,
  Button,
  Tabs,
  Image,
  SimpleGrid,
  Badge,
  HStack,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { useExam } from "./ExamContext";
import { useEffect, useRef, useState } from "react";
import { toaster } from "../../../components/ui/toaster";
import {
  saveExamResult,
  checkResultExisting,
} from "../../../api-endpoint/exam/exams";
import { useNavigate } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaThLarge,
  FaGraduationCap,
  FaFlag,
  FaUndo,
} from "react-icons/fa";

export default function ExamBody() {
  const {
    examData,
    answers,
    saveAnswer,
    clearAnswer,
    flaggedQuestions,
    toggleFlag,
    scores,
    totalScore,
    loadDemoExam,
  } = useExam();

  const [tabValue, setTabValue] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState({});
  const violationCount = useRef(0);
  const anomaliesRef = useRef([]);
  const isTerminatedRef = useRef(false);
  const totalMarks = examData?.totalMarks || 100;
  const percentage = (totalScore / totalMarks) * 100;
  const hasProcessedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear previous exam anomalies when starting a fresh session
    try {
      localStorage.removeItem("lastExamAnomalies");
    } catch (e) {}
  }, []);

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

  // Full screen enforcement
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (error) {
        // ignore browser permission denial silently
      }
    };
    enterFullscreen();
  }, []);

  // Violation handler
  const reportViolation = (reason) => {
    // If exam is already terminated or submitted, DO NOT process or show any further warnings
    if (isTerminatedRef.current || hasProcessedRef.current) return;

    violationCount.current += 1;
    const now = new Date();
    const anomalyRecord = {
      id: `anom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: reason.toLowerCase().includes("tab")
        ? "TAB_SWITCH"
        : reason.toLowerCase().includes("focus")
        ? "WINDOW_BLUR"
        : "PROCTOR_ALERT",
      description: reason,
      timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      isoTime: now.toISOString(),
      warningNumber: violationCount.current,
    };
    anomaliesRef.current.push(anomalyRecord);

    let currentIntegrity = "VERIFIED";
    if (violationCount.current >= 5) {
      currentIntegrity = "HIGH_RISK_TERMINATED";
    } else if (violationCount.current >= 2) {
      currentIntegrity = "FLAGGED_SUSPICIOUS";
    } else if (violationCount.current === 1) {
      currentIntegrity = "MINOR_WARNING";
    }

    try {
      localStorage.setItem(
        "lastExamAnomalies",
        JSON.stringify({
          anomalies: anomaliesRef.current,
          violationCount: violationCount.current,
          integrityStatus: currentIntegrity,
        })
      );
    } catch (e) {}

    toaster.create({
      title: "Exam Integrity Notice",
      description: `${reason}. (${violationCount.current}/5 warnings)`,
      type: "error",
    });

    if (violationCount.current >= 5) {
      isTerminatedRef.current = true;
      toaster.create({
        title: "Exam Terminated",
        description: "Maximum violations (5/5) reached. Assessment session ended.",
        type: "error",
      });
      AutoSubmit();
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isTerminatedRef.current || hasProcessedRef.current) return;
      if (document.hidden) {
        reportViolation("Unauthorized tab switch detected");
      }
    };

    const handleBlur = () => {
      if (isTerminatedRef.current || hasProcessedRef.current) return;
      reportViolation("Window focus lost");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    const disableRightClick = (e) => {
      if (!isTerminatedRef.current && !hasProcessedRef.current) e.preventDefault();
    };
    const disableCopy = (e) => {
      if (!isTerminatedRef.current && !hasProcessedRef.current) e.preventDefault();
    };

    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("copy", disableCopy);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("blur", handleBlur);
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("copy", disableCopy);
    };
  }, []);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isTerminatedRef.current || hasProcessedRef.current) return;
      if (!currentSection || !currentQuestion) return;
      const key = e.key.toLowerCase();

      // Options A-D or 1-4
      if (currentQuestion.options) {
        const optionValues = Object.values(currentQuestion.options);

        let selectedOpt = null;
        if (key === "a" || key === "1") selectedOpt = optionValues[0];
        else if (key === "b" || key === "2") selectedOpt = optionValues[1];
        else if (key === "c" || key === "3") selectedOpt = optionValues[2];
        else if (key === "d" || key === "4") selectedOpt = optionValues[3];

        if (selectedOpt) {
          saveAnswer(currentSection.section, currentQuestion.id, selectedOpt);
          return;
        }
      }

      // Next: N or ArrowRight
      if (key === "n" || key === "arrowright") {
        if (qIndex < (currentSection?.questions?.length || 1) - 1) {
          setCurrentQuestionIndex((prev) => ({
            ...prev,
            [currentSection.section]: prev[currentSection.section] + 1,
          }));
        }
      }
      // Prev: P or ArrowLeft
      else if (key === "p" || key === "arrowleft") {
        if (qIndex > 0) {
          setCurrentQuestionIndex((prev) => ({
            ...prev,
            [currentSection.section]: prev[currentSection.section] - 1,
          }));
        }
      }
      // Flag: F
      else if (key === "f") {
        toggleFlag?.(currentSection.section, currentQuestion.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tabValue, currentQuestionIndex, examData]);

  const AutoSubmit = async () => {
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;
    isTerminatedRef.current = true;

    // Exit fullscreen cleanly
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (e) {}
    }

    const student = localStorage.getItem("examStudent");
    const parsedStudent = JSON.parse(student || "{}");

    // Clean up active session
    localStorage.removeItem("activeExamKey");

    const anomalies = anomaliesRef.current || [];
    const count = violationCount.current || 0;
    let integrityStatus = "VERIFIED";
    if (count >= 5) integrityStatus = "HIGH_RISK_TERMINATED";
    else if (count >= 2) integrityStatus = "FLAGGED_SUSPICIOUS";
    else if (count === 1) integrityStatus = "MINOR_WARNING";

    try {
      localStorage.setItem(
        "lastExamAnomalies",
        JSON.stringify({
          anomalies,
          violationCount: count,
          integrityStatus,
        })
      );
    } catch (e) {}

    try {
      if (examData?.id && examData.id !== "demo-exam-cbt") {
        const existing = await checkResultExisting({
          studentId: parsedStudent?.studentId,
          examId: examData?.id,
        });

        if (!existing?.exists) {
          await saveExamResult({
            scores,
            studentId: parsedStudent?.id,
            examId: examData?.id,
            totalMarks: examData?.totalMarks,
            studentCode: parsedStudent?.studentId,
            percentage: Number(percentage.toFixed(2)),
            anomalies,
            violationCount: count,
            integrityStatus,
          });
        }
      }

      // If terminated due to violations, redirect to /exam/:id cleanly without further warnings
      if (isViolationTermination) {
        navigate(examData?.id ? `/exam/${examData.id}` : "/", { replace: true });
      } else {
        navigate("/student_result");
      }
    } catch (err) {
      console.error("Auto submit failed:", err);
      if (isViolationTermination) {
        navigate(examData?.id ? `/exam/${examData.id}` : "/", { replace: true });
      } else {
        navigate("/student_result");
      }
    }
  };

  // Fallback when no exam is loaded yet
  if (!examData || !examData.sections || examData.sections.length === 0) {
    return (
      <Flex minH="85vh" justify="center" align="center" bg="#0F172A" p={4}>
        <Box
          maxW="480px"
          w="100%"
          bg="#1E293B"
          borderRadius="20px"
          border="1px solid #334155"
          p={{ base: 6, sm: 8 }}
          textAlign="center"
          boxShadow="0 20px 40px rgba(0, 0, 0, 0.4)"
        >
          <Flex
            w="56px"
            h="56px"
            borderRadius="16px"
            bg="#2563EB"
            color="white"
            align="center"
            justify="center"
            mx="auto"
            mb={4}
          >
            <Icon as={FaGraduationCap} boxSize={7} />
          </Flex>

          <Text fontSize="20px" fontWeight="800" color="white" mb={2}>
            CBT Examination Session
          </Text>
          <Text fontSize="13px" color="#94A3B8" mb={6} lineHeight="1.5">
            No live assessment is currently loaded in this session. You can launch a practice simulation to test the CBT exam interface or return to the candidate portal.
          </Text>

          <VStack spacing={3}>
            <Button
              w="100%"
              h="46px"
              bg="#2563EB"
              color="white"
              borderRadius="12px"
              fontWeight="bold"
              fontSize="14px"
              _hover={{ bg: "#1D4ED8" }}
              onClick={() => loadDemoExam()}
            >
              Launch CBT Practice Simulation
            </Button>

            <Button
              w="100%"
              h="46px"
              variant="outline"
              borderColor="#334155"
              color="#CBD5E1"
              borderRadius="12px"
              _hover={{ bg: "#0F172A", color: "white" }}
              onClick={() => navigate("/")}
            >
              Return to Homepage / Portal
            </Button>
          </VStack>
        </Box>
      </Flex>
    );
  }

  // Active section data
  const currentSection = examData.sections.find((s) => s.section === tabValue) || examData.sections[0];
  const qIndex = currentQuestionIndex[currentSection?.section] || 0;
  const currentQuestion = currentSection?.questions?.[qIndex];
  const currentKey = `${currentSection?.section}-${currentQuestion?.id}`;
  const isFlagged = !!flaggedQuestions?.[currentKey];

  // Progress metrics across all sections
  const totalQuestionsAll = examData.sections.reduce((acc, s) => acc + s.questions.length, 0);
  const totalAnsweredAll = Object.keys(answers).length;

  return (
    <Box minH="calc(100vh - 60px)" bg="#0B1120" p={{ base: 3, md: 6 }}>
      <Box maxW="1500px" mx="auto">
        {/* SECTION TABS */}
        <Tabs.Root
          value={tabValue}
          onValueChange={(e) => setTabValue(e.value)}
          w="full"
          mb={5}
        >
          <Tabs.List
            bg="#1E293B"
            p={1.5}
            borderRadius="14px"
            border="1px solid #334155"
            gap={2}
            overflowX="auto"
          >
            {examData.sections.map((sec) => {
              const secAnsweredCount = sec.questions.filter(
                (q) => !!answers[`${sec.section}-${q.id}`]
              ).length;
              return (
                <Tabs.Trigger
                  key={sec.section}
                  value={sec.section}
                  borderRadius="10px"
                  px={4}
                  py={2}
                  color="#94A3B8"
                  fontWeight="bold"
                  fontSize="13px"
                  _selected={{
                    bg: "#2563EB",
                    color: "white",
                  }}
                  transition="all 0.15s ease"
                >
                  <HStack spacing={2}>
                    <Text textTransform="capitalize">{sec.section}</Text>
                    <Badge
                      bg="rgba(255, 255, 255, 0.2)"
                      color="white"
                      fontSize="10px"
                      borderRadius="full"
                      px={1.5}
                    >
                      {secAnsweredCount}/{sec.questions.length}
                    </Badge>
                  </HStack>
                </Tabs.Trigger>
              );
            })}
          </Tabs.List>
        </Tabs.Root>

        {/* 2-COLUMN CBT ROOM: QUESTION AREA (LEFT) + PALETTE (RIGHT) */}
        <SimpleGrid columns={{ base: 1, lg: 12 }} gap={6} alignItems="flex-start">
          
          {/* LEFT: ACTIVE QUESTION CARD (8 of 12 cols) */}
          <Box gridColumn={{ base: "1", lg: "span 8" }}>
            <Box
              bg="#FFFFFF"
              borderRadius="20px"
              border="1px solid #E2E8F0"
              p={{ base: 5, md: 7 }}
              boxShadow="0 4px 20px rgba(0, 0, 0, 0.12)"
              minH="520px"
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
            >
              {/* Question Header */}
              <Box>
                <Flex justify="space-between" align="center" pb={3.5} borderBottom="1px solid #F1F5F9" mb={5} wrap="wrap" gap={2}>
                  <HStack spacing={2.5}>
                    <Badge
                      bg="#0F172A"
                      color="white"
                      fontSize="12px"
                      fontWeight="bold"
                      px={3}
                      py={1}
                      borderRadius="md"
                    >
                      QUESTION {qIndex + 1} OF {currentSection?.questions?.length || 0}
                    </Badge>

                    <Badge
                      bg="#EFF6FF"
                      color="#2563EB"
                      border="1px solid #DBEAFE"
                      fontSize="11px"
                      borderRadius="full"
                      px={2.5}
                      py={0.5}
                      textTransform="capitalize"
                    >
                      {currentSection?.section}
                    </Badge>
                  </HStack>

                  <HStack spacing={3}>
                    {/* Flag for Review Toggle Button */}
                    <Button
                      size="xs"
                      variant={isFlagged ? "solid" : "outline"}
                      bg={isFlagged ? "#FEF3C7" : "transparent"}
                      color={isFlagged ? "#B45309" : "#64748B"}
                      borderColor={isFlagged ? "#F59E0B" : "#CBD5E1"}
                      borderRadius="md"
                      px={2.5}
                      py={1}
                      onClick={() => toggleFlag?.(currentSection.section, currentQuestion?.id)}
                      leftIcon={<Icon as={FaFlag} color={isFlagged ? "#F59E0B" : "#94A3B8"} />}
                    >
                      {isFlagged ? "Flagged for Review" : "Flag for Review"}
                    </Button>

                    {answers[currentKey] ? (
                      <HStack spacing={1.5}>
                        <Icon as={FaCheckCircle} color="#059669" boxSize={3.5} />
                        <Text fontSize="11px" fontWeight="bold" color="#059669">
                          Answer Saved
                        </Text>
                      </HStack>
                    ) : (
                      <Text fontSize="11px" color="#94A3B8" fontWeight="medium">
                        Not answered
                      </Text>
                    )}
                  </HStack>
                </Flex>

                {/* Optional Question Image (capped size so it never blows up the UI) */}
                {currentQuestion?.imageUrl && (
                  <Box
                    mb={4}
                    borderRadius="14px"
                    overflow="hidden"
                    maxW="380px"
                    maxH="220px"
                    border="1px solid #E2E8F0"
                    bg="#F8FAFC"
                    p={2}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Image
                      src={currentQuestion.imageUrl}
                      alt="Question diagram"
                      maxH="200px"
                      maxW="100%"
                      objectFit="contain"
                      borderRadius="8px"
                    />
                  </Box>
                )}

                {/* Topic if provided */}
                {currentQuestion?.topic && (
                  <Text
                    fontSize="12px"
                    color="#64748B"
                    fontWeight="semibold"
                    mb={2}
                    dangerouslySetInnerHTML={{ __html: currentQuestion.topic }}
                  />
                )}

                {/* Question Text (with image size bounds for embedded images) */}
                <Box
                  mb={6}
                  css={{
                    "& img": {
                      maxHeight: "220px",
                      maxWidth: "100%",
                      height: "auto",
                      objectFit: "contain",
                      borderRadius: "8px",
                      margin: "10px 0",
                      display: "block",
                      border: "1px solid #E2E8F0",
                      padding: "4px",
                      background: "#F8FAFC",
                    },
                  }}
                >
                  <Text
                    fontSize={{ base: "15px", md: "17px" }}
                    fontWeight="600"
                    color="#0F172A"
                    lineHeight="1.6"
                    dangerouslySetInnerHTML={{
                      __html: currentQuestion?.questionText || currentQuestion?.question || "",
                    }}
                  />
                </Box>

                {/* Multiple Choice Options List */}
                <VStack spacing={3} align="stretch" mb={6} w="100%">
                  {currentQuestion?.options &&
                    Object.entries(currentQuestion.options).map(([key, opt], i) => {
                      const isSelected = answers[currentKey] === opt;
                      const letterLabel = key.toUpperCase();

                      return (
                        <Box
                          key={i}
                          onClick={() => {
                            saveAnswer(currentSection.section, currentQuestion.id, opt);
                          }}
                          p={3.5}
                          borderRadius="14px"
                          border="2px solid"
                          borderColor={isSelected ? "#2563EB" : "#E2E8F0"}
                          bg={isSelected ? "#EFF6FF" : "#FFFFFF"}
                          cursor="pointer"
                          transition="all 0.15s ease"
                          w="100%"
                          _hover={{
                            borderColor: isSelected ? "#2563EB" : "#CBD5E1",
                            bg: isSelected ? "#EFF6FF" : "#F8FAFC",
                          }}
                        >
                          <Flex align="center" gap={3}>
                            {/* Option Letter Bubble */}
                            <Flex
                              w="32px"
                              h="32px"
                              borderRadius="full"
                              bg={isSelected ? "#2563EB" : "#F1F5F9"}
                              color={isSelected ? "white" : "#475569"}
                              align="center"
                              justify="center"
                              fontWeight="800"
                              fontSize="13px"
                              transition="all 0.15s ease"
                            >
                              {letterLabel}
                            </Flex>

                            {/* Option Text with inline image constraint */}
                            <Box
                              flex={1}
                              css={{
                                "& img": {
                                  maxHeight: "70px",
                                  maxWidth: "100%",
                                  height: "auto",
                                  objectFit: "contain",
                                  display: "inline-block",
                                  verticalAlign: "middle",
                                },
                              }}
                            >
                              <Text
                                fontSize="14px"
                                fontWeight={isSelected ? "600" : "500"}
                                color={isSelected ? "#1E3A8A" : "#334155"}
                                dangerouslySetInnerHTML={{ __html: opt }}
                              />
                            </Box>

                            {/* Checkmark icon if chosen */}
                            {isSelected && (
                              <Icon as={FaCheckCircle} color="#2563EB" boxSize={4} />
                            )}
                          </Flex>
                        </Box>
                      );
                    })}
                </VStack>
              </Box>

              {/* Bottom Stepper Actions */}
              <Flex justify="space-between" align="center" pt={4} borderTop="1px solid #F1F5F9" wrap="wrap" gap={2}>
                <Button
                  size="md"
                  variant="outline"
                  borderColor="#CBD5E1"
                  color="#475569"
                  borderRadius="10px"
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => ({
                      ...prev,
                      [currentSection.section]: Math.max(0, prev[currentSection.section] - 1),
                    }))
                  }
                  isDisabled={qIndex === 0}
                  leftIcon={<Icon as={FaChevronLeft} />}
                >
                  Previous
                </Button>

                {/* Clear Answer Button */}
                {answers[currentKey] && (
                  <Button
                    size="sm"
                    variant="ghost"
                    color="#64748B"
                    _hover={{ color: "#EF4444" }}
                    onClick={() => clearAnswer?.(currentSection.section, currentQuestion.id)}
                    leftIcon={<Icon as={FaUndo} />}
                  >
                    Clear Choice
                  </Button>
                )}

                <Text fontSize="12px" color="#94A3B8" fontWeight="medium">
                  {qIndex + 1} of {currentSection?.questions?.length || 0}
                </Text>

                <Button
                  size="md"
                  bg="#2563EB"
                  color="white"
                  borderRadius="10px"
                  fontWeight="bold"
                  _hover={{ bg: "#1D4ED8" }}
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => ({
                      ...prev,
                      [currentSection.section]: Math.min(
                        currentSection.questions.length - 1,
                        prev[currentSection.section] + 1
                      ),
                    }))
                  }
                  isDisabled={qIndex === (currentSection?.questions?.length || 1) - 1}
                  rightIcon={<Icon as={FaChevronRight} />}
                >
                  Next
                </Button>
              </Flex>
            </Box>
          </Box>

          {/* RIGHT: QUESTION NAVIGATOR PALETTE (4 of 12 cols) */}
          <Box gridColumn={{ base: "1", lg: "span 4" }}>
            <Box
              bg="#1E293B"
              borderRadius="20px"
              border="1px solid #334155"
              p={5}
              color="white"
              boxShadow="0 4px 20px rgba(0, 0, 0, 0.25)"
            >
              <Flex justify="space-between" align="center" mb={4}>
                <HStack spacing={2}>
                  <Icon as={FaThLarge} color="#60A5FA" boxSize={3.5} />
                  <Text fontSize="14px" fontWeight="bold">
                    Question Palette
                  </Text>
                </HStack>

                <Badge
                  bg="rgba(16, 185, 129, 0.15)"
                  color="#34D399"
                  border="1px solid rgba(16, 185, 129, 0.3)"
                  borderRadius="full"
                  px={2}
                  fontSize="10px"
                >
                  {totalAnsweredAll}/{totalQuestionsAll} Done
                </Badge>
              </Flex>

              {/* Status Legend (4 States) */}
              <SimpleGrid columns={2} gap={2} mb={4} fontSize="11px" color="#94A3B8">
                <HStack spacing={1.5}>
                  <Box w="10px" h="10px" borderRadius="full" bg="#10B981" />
                  <Text>Answered</Text>
                </HStack>
                <HStack spacing={1.5}>
                  <Box w="10px" h="10px" borderRadius="full" bg="#2563EB" />
                  <Text>Current</Text>
                </HStack>
                <HStack spacing={1.5}>
                  <Box w="10px" h="10px" borderRadius="full" bg="#F59E0B" />
                  <Text>Flagged for Review</Text>
                </HStack>
                <HStack spacing={1.5}>
                  <Box w="10px" h="10px" borderRadius="full" bg="#334155" />
                  <Text>Unanswered</Text>
                </HStack>
              </SimpleGrid>

              {/* Number Buttons Grid */}
              <Box
                maxH="360px"
                overflowY="auto"
                pr={1}
                p={2}
                borderRadius="14px"
                bg="#0F172A"
                border="1px solid #334155"
              >
                <SimpleGrid columns={5} gap={2}>
                  {currentSection?.questions?.map((q, i) => {
                    const qKey = `${currentSection.section}-${q.id}`;
                    const isAnswered = !!answers[qKey];
                    const isCurrent = i === qIndex;
                    const isQFlagged = !!flaggedQuestions?.[qKey];

                    let bg = "#334155";
                    let color = "#CBD5E1";
                    let border = "1px solid transparent";

                    if (isCurrent) {
                      bg = "#2563EB";
                      color = "white";
                      border = "2px solid #60A5FA";
                    } else if (isQFlagged) {
                      bg = "#F59E0B";
                      color = "#0F172A";
                    } else if (isAnswered) {
                      bg = "#059669";
                      color = "white";
                    }

                    return (
                      <Button
                        key={q.id || i}
                        size="xs"
                        h="36px"
                        bg={bg}
                        color={color}
                        border={border}
                        borderRadius="md"
                        fontWeight="bold"
                        fontSize="12px"
                        _hover={{ opacity: 0.9, transform: "scale(1.05)" }}
                        transition="all 0.1s ease"
                        onClick={() =>
                          setCurrentQuestionIndex((prev) => ({
                            ...prev,
                            [currentSection.section]: i,
                          }))
                        }
                      >
                        {i + 1}
                      </Button>
                    );
                  })}
                </SimpleGrid>
              </Box>

              {/* Keyboard Shortcuts Hint */}
              <Box mt={3} pt={3} borderTop="1px solid #334155">
                <Text fontSize="10px" color="#64748B" textAlign="center">
                  Shortcuts: [A-D] Select • [N/P] Next/Prev • [F] Flag
                </Text>
              </Box>
            </Box>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
}
