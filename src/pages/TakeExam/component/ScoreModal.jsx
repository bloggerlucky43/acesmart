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
  Progress,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useExam } from "./ExamContext";
import { useRef, useState, useEffect } from "react";
import { checkResultExisting } from "../../../api-endpoint/exam/exams";
import { toaster } from "../../../components/ui/toaster";
import { saveWithRetry } from "../../../libs/helper";
import {
  FaCheckCircle,
  FaGraduationCap,
  FaAward,
  FaArrowRight,
  FaRedo,
} from "react-icons/fa";

function ScoreModal({ onClose }) {
  const { scores, examData, totalScore } = useExam();
  const [resultExists, setResultExists] = useState(false);
  const [checking, setChecking] = useState(true);
  const [saveStatus, setSaveStatus] = useState("loading");
  const [retryCount, setRetryCount] = useState(0);
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

  const isDemo = examData?.id === "demo-exam-cbt" || !examData?.id;

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

  const candidateName =
    `${parsedStudent?.firstName ?? ""} ${parsedStudent?.lastName ?? ""}`.trim() ||
    "Candidate";

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
        bg="rgba(15, 23, 42, 0.8)"
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
            w="48px"
            h="48px"
            borderRadius="14px"
            bg="#2563EB"
            color="white"
            align="center"
            justify="center"
            mx="auto"
            mb={4}
          >
            <Icon as={FaGraduationCap} boxSize={6} />
          </Flex>
          <Text fontSize="16px" fontWeight="bold" color="white" mb={1}>
            Finalizing Examination
          </Text>
          <Text fontSize="12px" color="#94A3B8">
            Verifying answers and computing scores...
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
        bg="rgba(15, 23, 42, 0.8)"
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
          <Text fontSize="16px" fontWeight="bold" color="#F87171" mb={2}>
            Connection Interruption
          </Text>
          <Text fontSize="12px" color="#94A3B8" mb={5}>
            Unable to save exam results automatically. Please retry.
          </Text>
          <Button
            bg="#2563EB"
            color="white"
            borderRadius="12px"
            w="100%"
            onClick={() => {
              hasProcessedRef.current = false;
              setSaveStatus("loading");
              setRetryCount((c) => c + 1);
            }}
            leftIcon={<Icon as={FaRedo} />}
          >
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
      bg="rgba(15, 23, 42, 0.8)"
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
        maxW="540px"
        w="100%"
        boxShadow="0 25px 50px rgba(0, 0, 0, 0.5)"
        maxH="90vh"
        overflowY="auto"
      >
        {/* Header Badge & Title */}
        <VStack spacing={2} align="center" textAlign="center" mb={6}>
          <Flex
            w="52px"
            h="52px"
            borderRadius="16px"
            bg="rgba(16, 185, 129, 0.15)"
            color="#34D399"
            align="center"
            justify="center"
            mb={1}
          >
            <Icon as={FaAward} boxSize={7} />
          </Flex>

          <Text fontSize="22px" fontWeight="800" color="white" fontFamily="'Outfit', sans-serif">
            Assessment Complete
          </Text>
          <Text fontSize="13px" color="#94A3B8">
            Candidate: <b>{candidateName}</b>
            {parsedStudent?.studentId && ` • Reg: ${parsedStudent.studentId}`}
          </Text>

          <Badge
            bg={performanceTier.bg}
            color={performanceTier.color}
            borderRadius="full"
            px={3}
            py={1}
            fontSize="11px"
            fontWeight="bold"
            mt={1}
          >
            {performanceTier.label}
          </Badge>
        </VStack>

        {/* Big Overall Score Card */}
        <Box
          bg="#0F172A"
          borderRadius="18px"
          border="1px solid #334155"
          p={5}
          mb={5}
          textAlign="center"
        >
          <Text fontSize="11px" color="#94A3B8" textTransform="uppercase" letterSpacing="0.5px">
            Cumulative Score
          </Text>
          <HStack justify="center" align="baseline" spacing={2} mt={1}>
            <Text fontSize="36px" fontWeight="900" color="white" lineHeight="1">
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
          <Box mb={6}>
            <Text fontSize="12px" fontWeight="bold" color="#94A3B8" mb={3} textTransform="uppercase" letterSpacing="0.5px">
              Subject Section Performance:
            </Text>

            <VStack spacing={2.5} align="stretch">
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
            </VStack>
          </Box>
        )}

        {/* Exit / Return Action */}
        <Button
          w="100%"
          h="48px"
          bg="#2563EB"
          color="white"
          borderRadius="12px"
          fontWeight="bold"
          fontSize="14px"
          _hover={{ bg: "#1D4ED8" }}
          onClick={handleContinueButton}
          rightIcon={<Icon as={FaArrowRight} />}
        >
          Exit Assessment Portal
        </Button>
      </Box>
    </Box>
  );
}

export default ScoreModal;
