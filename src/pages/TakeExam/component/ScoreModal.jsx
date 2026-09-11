import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Icon,
  SimpleGrid,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useExam } from "./ExamContext";
import { useRef, useState, useEffect } from "react";
import { checkResultExisting } from "../../../api-endpoint/exam/exams";
import { toaster } from "../../../components/ui/toaster";
import { saveWithRetry } from "../../../libs/helper";
import { getWeakAreaDetection } from "../../../api-endpoint/ai/ai";
import {
  FaCheckCircle,
  FaGraduationCap,
  FaAward,
  FaArrowRight,
  FaRedo,
  FaShieldAlt,
  FaBrain,
  FaExclamationTriangle,
  FaBookOpen,
  FaLightbulb,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

function ScoreModal({ onClose }) {
  const { scores, examData, totalScore } = useExam();
  const [resultExists, setResultExists] = useState(false);
  const [checking, setChecking] = useState(true);
  const [saveStatus, setSaveStatus] = useState("loading");
  const [retryCount, setRetryCount] = useState(0);
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showAnomalies, setShowAnomalies] = useState(false);
  const hasProcessedRef = useRef(false);
  const navigate = useNavigate();

  const totalMarks = examData?.totalMarks || 100;
  const percentage = Math.min(100, Math.max(0, (totalScore / totalMarks) * 100));

  const student = localStorage.getItem("examStudent");
  let parsedStudent = null;
  try {
    parsedStudent = JSON.parse(student || "{}");
  } catch (e) {
    parsedStudent = {};
  }

  // Load integrity & anomaly metrics recorded during exam
  let storedAnomalies = [];
  let storedViolationCount = 0;
  let storedIntegrity = "VERIFIED";

  try {
    const rawAnom = localStorage.getItem("lastExamAnomalies");
    if (rawAnom) {
      const parsed = JSON.parse(rawAnom);
      storedAnomalies = parsed.anomalies || [];
      storedViolationCount = parsed.violationCount || storedAnomalies.length;
      storedIntegrity = parsed.integrityStatus || (storedViolationCount > 0 ? "FLAGGED_SUSPICIOUS" : "VERIFIED");
    }
  } catch (e) {}

  const isDemo = examData?.id === "demo-exam-cbt" || !examData?.id;
  const candidateName =
    `${parsedStudent?.firstName ?? ""} ${parsedStudent?.lastName ?? ""}`.trim() ||
    parsedStudent?.name ||
    "Candidate";

  // Check if result already exists & save result
  useEffect(() => {
    const CheckExistingResult = async () => {
      if (hasProcessedRef.current) return;
      hasProcessedRef.current = true;

      // In demo/practice mode, skip API save and mark success immediately
      if (isDemo) {
        setChecking(false);
        setSaveStatus("success");
        return;
      }

      try {
        const res = await checkResultExisting({
          studentId: parsedStudent?.studentId,
          examId: examData?.id,
        });

        if (res?.exists) {
          setResultExists(true);
          toaster.create({
            title: "Result already exists for this exam",
            type: "warning",
          });
          navigate(`/exam/${examData?.id}`, { replace: true });
          onClose?.();
          return;
        } else {
          try {
            const res = await saveWithRetry({
              scores,
              studentId: parsedStudent?.id,
              studentCode: parsedStudent?.studentId,
              examId: examData?.id,
              examTitle: examData?.title,
              totalMarks: examData?.totalMarks,
              anomalies: storedAnomalies,
              violationCount: storedViolationCount,
              integrityStatus: storedIntegrity,
            });

            if (res.data) {
              toaster.create({
                title: "Exam result saved successfully",
                type: "success",
              });
              setSaveStatus("success");
              localStorage.removeItem("activeExamKey");
              localStorage.removeItem("examStudent");
            }
          } catch (error) {
            console.error("Failed to save exam result:", error);
            setSaveStatus("error");
            toaster.create({
              title: "Failed to save exam result after multiple attempts.",
              description: "Please check your network and retry.",
              type: "error",
            });
          }
        }
      } catch (error) {
        console.error("Error checking result existence:", error);
      } finally {
        setChecking(false);
      }
    };

    if (student || isDemo) {
      CheckExistingResult();
    } else {
      setChecking(false);
      setSaveStatus("success");
    }
  }, [student, examData?.id, navigate, onClose, retryCount, isDemo]);

  // Fetch AI Weak Area Detection & Study Guidance
  useEffect(() => {
    const fetchAiDiagnostics = async () => {
      setLoadingAi(true);
      try {
        const data = await getWeakAreaDetection({
          scores,
          totalMarks,
          examSections: examData?.sections,
          studentName: candidateName,
        });
        setAiInsights(data);
      } catch (err) {
        console.warn("AI diagnostic fetch warning:", err);
      } finally {
        setLoadingAi(false);
      }
    };

    if (scores && Object.keys(scores).length > 0) {
      fetchAiDiagnostics();
    }
  }, [scores, totalMarks, examData, candidateName]);

  const handleContinueButton = () => {
    if (onClose) onClose();
    navigate("/");
  };

  // Loading state
  if (checking) {
    return (
      <Box
        position="fixed"
        inset={0}
        zIndex={2000}
        bg="rgba(15, 23, 42, 0.85)"
        backdropFilter="blur(8px)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Box
          bg="#1E293B"
          borderRadius="20px"
          border="1px solid #334155"
          p={8}
          textAlign="center"
          maxW="400px"
          w="100%"
        >
          <Flex
            w="52px"
            h="52px"
            borderRadius="16px"
            bg="#6A1B9A"
            color="white"
            align="center"
            justify="center"
            mx="auto"
            mb={4}
            className="glow-ambient"
          >
            <Icon as={FaGraduationCap} boxSize={7} />
          </Flex>
          <Text fontSize="18px" fontWeight="bold" color="white" mb={1}>
            Finalizing Examination
          </Text>
          <Text fontSize="13px" color="#94A3B8">
            Grading responses and recording proctoring audit log...
          </Text>
        </Box>
      </Box>
    );
  }

  // Error state
  if (saveStatus === "error") {
    return (
      <Box
        position="fixed"
        inset={0}
        zIndex={2000}
        bg="rgba(15, 23, 42, 0.85)"
        backdropFilter="blur(8px)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Box
          bg="#1E293B"
          borderRadius="20px"
          border="1px solid #334155"
          p={8}
          textAlign="center"
          maxW="420px"
          w="100%"
        >
          <Text fontSize="18px" fontWeight="bold" color="#F87171" mb={2}>
            Connection Interruption
          </Text>
          <Text fontSize="13px" color="#94A3B8" mb={5}>
            Unable to save exam results automatically. Please retry.
          </Text>
          <Button
            bg="#6A1B9A"
            color="white"
            borderRadius="12px"
            w="100%"
            onClick={() => {
              hasProcessedRef.current = false;
              setSaveStatus("loading");
              setRetryCount((c) => c + 1);
            }}
          >
            <Icon as={FaRedo} mr={2} />
            Retry Submission
          </Button>
        </Box>
      </Box>
    );
  }

  const performanceTier =
    percentage >= 70
      ? { label: "Excellent Performance", color: "#34D399", bg: "rgba(16, 185, 129, 0.15)" }
      : percentage >= 50
      ? { label: "Satisfactory Pass", color: "#60A5FA", bg: "rgba(37, 99, 235, 0.15)" }
      : { label: "Review Recommended", color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" };

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={1500}
      bg="rgba(15, 23, 42, 0.85)"
      backdropFilter="blur(8px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        bg="#1E293B"
        borderRadius="24px"
        border="1px solid #334155"
        p={{ base: 6, sm: 8 }}
        maxW="580px"
        w="100%"
        boxShadow="0 25px 50px rgba(0, 0, 0, 0.5)"
        maxH="92vh"
        overflowY="auto"
        className="animate-scale-in"
      >
        {/* Header Badge & Title */}
        <VStack spacing={2} align="center" textAlign="center" mb={5}>
          <Flex
            w="54px"
            h="54px"
            borderRadius="18px"
            bg="rgba(16, 185, 129, 0.15)"
            color="#34D399"
            align="center"
            justify="center"
            mb={1}
          >
            <Icon as={FaAward} boxSize={7} />
          </Flex>

          <Text fontSize="24px" fontWeight="800" color="white" fontFamily="'Outfit', sans-serif">
            Assessment Complete
          </Text>
          <Text fontSize="13px" color="#94A3B8">
            Candidate: <b style={{ color: "white" }}>{candidateName}</b>
            {parsedStudent?.studentId && ` • ID: ${parsedStudent.studentId}`}
          </Text>

          <HStack spacing={2} mt={1}>
            <Badge
              bg={performanceTier.bg}
              color={performanceTier.color}
              borderRadius="full"
              px={3}
              py={1}
              fontSize="11px"
              fontWeight="bold"
            >
              {performanceTier.label}
            </Badge>

            {/* Integrity Status Badge */}
            {storedViolationCount === 0 ? (
              <Badge
                bg="rgba(16, 185, 129, 0.15)"
                color="#34D399"
                borderRadius="full"
                px={3}
                py={1}
                fontSize="11px"
                fontWeight="bold"
                display="flex"
                alignItems="center"
                gap={1.5}
              >
                <Icon as={FaShieldAlt} boxSize={3} />
                Integrity Verified
              </Badge>
            ) : (
              <Badge
                bg={storedViolationCount >= 5 ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)"}
                color={storedViolationCount >= 5 ? "#F87171" : "#FBBF24"}
                borderRadius="full"
                px={3}
                py={1}
                fontSize="11px"
                fontWeight="bold"
                cursor="pointer"
                onClick={() => setShowAnomalies(!showAnomalies)}
                display="flex"
                alignItems="center"
                gap={1.5}
              >
                <Icon as={FaExclamationTriangle} boxSize={3} />
                {storedViolationCount} Incident{storedViolationCount > 1 ? "s" : ""} Flagged
                <Icon as={showAnomalies ? FaChevronUp : FaChevronDown} boxSize={2.5} />
              </Badge>
            )}
          </HStack>

          {/* Anomaly Inspection Dropdown */}
          {showAnomalies && storedAnomalies.length > 0 && (
            <Box
              w="100%"
              mt={3}
              p={3}
              borderRadius="xl"
              bg="#0F172A"
              border="1px solid #475569"
              textAlign="left"
            >
              <Text fontSize="11px" fontWeight="700" color="#FBBF24" mb={2} textTransform="uppercase">
                Proctoring Incident Log ({storedAnomalies.length}):
              </Text>
              <VStack spacing={1.5} align="stretch">
                {storedAnomalies.map((a, i) => (
                  <Flex key={i} justify="space-between" align="center" fontSize="12px" color="#CBD5E1">
                    <Text>• {a.description || a.type}</Text>
                    <Text color="#94A3B8" fontSize="11px">{a.timestamp}</Text>
                  </Flex>
                ))}
              </VStack>
            </Box>
          )}
        </VStack>

        {/* Big Overall Score Card */}
        <Box
          bg="#0F172A"
          borderRadius="18px"
          border="1px solid #334155"
          p={5}
          mb={4}
          textAlign="center"
        >
          <Text fontSize="11px" color="#94A3B8" textTransform="uppercase" letterSpacing="0.5px">
            Cumulative Score
          </Text>
          <HStack justify="center" align="baseline" spacing={2} mt={1}>
            <Text fontSize="38px" fontWeight="900" color="white" lineHeight="1">
              {totalScore.toFixed(1)}
            </Text>
            <Text fontSize="18px" color="#64748B" fontWeight="bold">
              / {totalMarks}
            </Text>
          </HStack>

          <Flex justify="space-between" align="center" mt={3} pt={3} borderTop="1px solid #1E293B">
            <Text fontSize="12px" color="#94A3B8">
              Overall Accuracy Rate:
            </Text>
            <Text fontSize="14px" fontWeight="bold" color="#38BDF8">
              {percentage.toFixed(1)}%
            </Text>
          </Flex>
        </Box>

        {/* Section Score Breakdown */}
        {scores && Object.keys(scores).length > 0 && (
          <Box mb={4}>
            <Text fontSize="12px" fontWeight="bold" color="#94A3B8" mb={2.5} textTransform="uppercase" letterSpacing="0.5px">
              Subject Section Performance:
            </Text>

            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={2}>
              {Object.entries(scores).map(([section, score]) => (
                <Box
                  key={section}
                  bg="#0F172A"
                  borderRadius="12px"
                  border="1px solid #334155"
                  p={3}
                >
                  <Flex justify="space-between" align="center">
                    <Text fontSize="13px" fontWeight="bold" color="white" textTransform="capitalize">
                      {section}
                    </Text>
                    <Badge bg="#1E293B" color="#CBD5E1" borderRadius="md" px={2} py={0.5}>
                      {Number(score).toFixed(1)} Pts
                    </Badge>
                  </Flex>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* AI Learning Diagnostic & Weak Area Detection Card */}
        <Box
          mb={6}
          p={4}
          borderRadius="18px"
          bg="linear-gradient(145deg, rgba(106, 27, 154, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)"
          border="1px solid rgba(168, 85, 247, 0.35)"
          position="relative"
        >
          <Flex align="center" justify="space-between" mb={3}>
            <Flex align="center" gap={2}>
              <Flex
                w="28px"
                h="28px"
                borderRadius="lg"
                bg="#6A1B9A"
                color="white"
                align="center"
                justify="center"
              >
                <Icon as={FaBrain} boxSize={3.5} />
              </Flex>
              <Text fontSize="14px" fontWeight="800" color="#E9D5FF">
                AI Learning Diagnostic
              </Text>
            </Flex>
            <Badge
              bg="rgba(168, 85, 247, 0.2)"
              color="#D8B4FE"
              borderRadius="full"
              px={2.5}
              py={0.5}
              fontSize="10px"
              fontWeight="bold"
            >
              {loadingAi ? "Analyzing..." : "Targeted Insights"}
            </Badge>
          </Flex>

          {/* Diagnostic summary narrative */}
          <Text fontSize="13px" color="#CBD5E1" mb={3.5} lineHeight="1.5">
            {aiInsights?.diagnosticNarrative ||
              "AI diagnosis: Evaluating question error rates and topic-specific concept mastery..."}
          </Text>

          {/* Identified Weak Areas */}
          {aiInsights?.weakAreas && aiInsights.weakAreas.length > 0 && (
            <Box mb={3.5}>
              <Text fontSize="11px" fontWeight="700" color="#FCA5A5" textTransform="uppercase" mb={2}>
                Priority Focus Areas (Score &lt; 50%):
              </Text>
              <VStack spacing={2} align="stretch">
                {aiInsights.weakAreas.map((w, idx) => (
                  <Box
                    key={idx}
                    p={2.5}
                    borderRadius="xl"
                    bg="rgba(239, 68, 68, 0.1)"
                    border="1px solid rgba(239, 68, 68, 0.25)"
                  >
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="12px" fontWeight="700" color="#FCA5A5">
                        {w.subject} • {w.topic}
                      </Text>
                      <Badge bg="rgba(239, 68, 68, 0.2)" color="#FCA5A5" fontSize="10px">
                        {w.scorePercent}% Mastery
                      </Badge>
                    </Flex>
                    <Text fontSize="11px" color="#E2E8F0">
                      💡 {w.remediationAdvice}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}

          {/* Personalized Study Roadmap */}
          {aiInsights?.personalizedRoadmap && aiInsights.personalizedRoadmap.length > 0 && (
            <Box pt={2} borderTop="1px solid rgba(168, 85, 247, 0.2)">
              <Flex align="center" gap={1.5} mb={2}>
                <Icon as={FaBookOpen} color="#C084FC" boxSize={3} />
                <Text fontSize="11px" fontWeight="700" color="#D8B4FE" textTransform="uppercase">
                  Recommended Study Roadmap:
                </Text>
              </Flex>
              <VStack spacing={1.5} align="stretch">
                {aiInsights.personalizedRoadmap.map((item, i) => (
                  <Flex key={i} align="flex-start" gap={2} fontSize="12px" color="#CBD5E1">
                    <Text color="#A855F7" fontWeight="bold">Step {i + 1}:</Text>
                    <Text>{item}</Text>
                  </Flex>
                ))}
              </VStack>
              {aiInsights?.recommendedPracticeHours && (
                <Text fontSize="11px" color="#A78BFA" mt={2} fontStyle="italic">
                  Target: {aiInsights.recommendedPracticeHours}
                </Text>
              )}
            </Box>
          )}
        </Box>

        {/* Exit / Return Action */}
        <Button
          w="100%"
          h="48px"
          bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
          color="white"
          borderRadius="14px"
          fontWeight="bold"
          fontSize="14px"
          boxShadow="0 4px 14px rgba(106, 27, 154, 0.35)"
          _hover={{ opacity: 0.95 }}
          onClick={handleContinueButton}
        >
          Exit Assessment Portal
          <Icon as={FaArrowRight} ml={2} />
        </Button>
      </Box>
    </Box>
  );
}

export default ScoreModal;
