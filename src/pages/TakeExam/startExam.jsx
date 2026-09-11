import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Icon,
  Avatar,
  SimpleGrid,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchLiveExam } from "../../api-endpoint/exam/exams";
import { useExam } from "../TakeExam/component/ExamContext";
import { toaster } from "../../components/ui/toaster";
import {
  FaShieldAlt,
  FaClock,
  FaExclamationTriangle,
  FaLock,
  FaCheckCircle,
  FaPlay,
  FaArrowLeft,
  FaGraduationCap,
} from "react-icons/fa";

function StartExam() {
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();
  const [userDetails, setUserDetails] = useState({});
  const navigate = useNavigate();
  const { loadExamData } = useExam();

  useEffect(() => {
    const storedUser = localStorage?.getItem("examStudent");
    if (!storedUser) {
      toaster.create({
        title: "Session expired. Please verify your credentials again.",
        type: "error",
      });
      navigate(`/exam/${id}`, { replace: true });
      return;
    }

    try {
      setUserDetails(JSON.parse(storedUser));
    } catch (e) {
      navigate(`/exam/${id}`, { replace: true });
    }
  }, [id, navigate]);

  const handleStartExam = async () => {
    if (!userDetails?.studentId) {
      toaster.error({ title: "Missing verified candidate details" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetchLiveExam({
        studentId: userDetails?.studentId,
        examId: id,
      });
      if (res.success && res.exam) {
        loadExamData(res.exam, userDetails.studentId);
        toaster.success({ title: "Assessment loaded. Good luck!" });
        navigate(`/take_exam?examId=${id}`);
      } else {
        toaster.error({ title: res.message || "Unable to load active exam" });
      }
    } catch (error) {
      toaster.error({ title: "Network error loading exam questions. Please retry." });
    } finally {
      setIsLoading(false);
    }
  };

  const candidateName = `${userDetails?.firstName ?? ""} ${userDetails?.lastName ?? ""}`.trim() || "Candidate";

  return (
    <Box
      minH="100vh"
      w="100%"
      bg="#0F172A"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={{ base: 4, md: 8 }}
    >
      {/* Main Briefing Card */}
      <Box
        w="100%"
        maxW="620px"
        bg="#1E293B"
        borderRadius="20px"
        border="1px solid #334155"
        p={{ base: 6, sm: 8 }}
        boxShadow="0 20px 40px rgba(0, 0, 0, 0.4)"
      >
        {/* Top Header */}
        <Flex justify="space-between" align="center" mb={6}>
          <HStack spacing={3}>
            <Flex
              w="44px"
              h="44px"
              borderRadius="14px"
              bg="#2563EB"
              align="center"
              justify="center"
              boxShadow="0 4px 14px rgba(37, 99, 235, 0.35)"
            >
              <Icon as={FaGraduationCap} boxSize={6} color="white" />
            </Flex>
            <Box>
              <Text fontSize="18px" fontWeight="800" color="white" fontFamily="'Outfit', sans-serif">
                AceSmart Assessment Engine
              </Text>
              <Text fontSize="12px" color="#94A3B8">
                CBT Proctoring & Readiness Briefing
              </Text>
            </Box>
          </HStack>

          <Badge
            bg="rgba(16, 185, 129, 0.12)"
            color="#34D399"
            border="1px solid rgba(16, 185, 129, 0.25)"
            px={2.5}
            py={1}
            borderRadius="full"
            fontSize="10px"
            fontWeight="bold"
          >
            VERIFIED
          </Badge>
        </Flex>

        {/* Candidate Identity Card */}
        <Box
          bg="#0F172A"
          borderRadius="16px"
          border="1px solid #334155"
          p={4}
          mb={6}
        >
          <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
            <HStack spacing={3.5}>
              <Avatar.Root size="md" bg="#2563EB" color="white">
                <Avatar.Fallback name={candidateName} />
              </Avatar.Root>
              <Box>
                <Text fontSize="15px" fontWeight="bold" color="white">
                  {candidateName}
                </Text>
                <HStack spacing={2} mt={0.5}>
                  <Badge
                    bg="#1E293B"
                    color="#CBD5E1"
                    fontSize="11px"
                    borderRadius="md"
                    px={2}
                    py={0.5}
                    border="1px solid #334155"
                  >
                    REG: {userDetails?.studentId || "N/A"}
                  </Badge>
                </HStack>
              </Box>
            </HStack>

            <HStack spacing={1.5} bg="rgba(16, 185, 129, 0.12)" px={2.5} py={1} borderRadius="lg">
              <Icon as={FaCheckCircle} color="#34D399" boxSize={3.5} />
              <Text fontSize="11px" color="#34D399" fontWeight="semibold">
                Ready to Test
              </Text>
            </HStack>
          </Flex>
        </Box>

        {/* Guidelines & Proctoring Rules */}
        <Box mb={6}>
          <Text fontSize="12px" fontWeight="bold" color="#94A3B8" mb={3} textTransform="uppercase" letterSpacing="0.5px">
            CBT Security & Testing Rules:
          </Text>

          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
            <Box
              bg="#0F172A"
              p={3.5}
              borderRadius="14px"
              border="1px solid #334155"
            >
              <HStack spacing={2.5} mb={1}>
                <Icon as={FaClock} color="#60A5FA" boxSize={4} />
                <Text fontSize="12px" fontWeight="bold" color="white">
                  Continuous Timer
                </Text>
              </HStack>
              <Text fontSize="11px" color="#94A3B8" lineHeight="1.4">
                The clock runs continuously once launched. Test auto-submits upon time expiry.
              </Text>
            </Box>

            <Box
              bg="#0F172A"
              p={3.5}
              borderRadius="14px"
              border="1px solid #334155"
            >
              <HStack spacing={2.5} mb={1}>
                <Icon as={FaExclamationTriangle} color="#F59E0B" boxSize={4} />
                <Text fontSize="12px" fontWeight="bold" color="white">
                  Proctored Environment
                </Text>
              </HStack>
              <Text fontSize="11px" color="#94A3B8" lineHeight="1.4">
                Tab switching or window blurring triggers violation strikes. 5 strikes terminates the test.
              </Text>
            </Box>

            <Box
              bg="#0F172A"
              p={3.5}
              borderRadius="14px"
              border="1px solid #334155"
            >
              <HStack spacing={2.5} mb={1}>
                <Icon as={FaLock} color="#34D399" boxSize={4} />
                <Text fontSize="12px" fontWeight="bold" color="white">
                  Locked Fullscreen
                </Text>
              </HStack>
              <Text fontSize="11px" color="#94A3B8" lineHeight="1.4">
                Assessment launches in full screen. Right click and text copying are disabled.
              </Text>
            </Box>

            <Box
              bg="#0F172A"
              p={3.5}
              borderRadius="14px"
              border="1px solid #334155"
            >
              <HStack spacing={2.5} mb={1}>
                <Icon as={FaCheckCircle} color="#38BDF8" boxSize={4} />
                <Text fontSize="12px" fontWeight="bold" color="white">
                  Real-Time Saving
                </Text>
              </HStack>
              <Text fontSize="11px" color="#94A3B8" lineHeight="1.4">
                Every chosen answer is saved instantly. You can freely navigate and review questions.
              </Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Action Buttons */}
        <Flex gap={3}>
          <Button
            size="md"
            variant="outline"
            borderColor="#334155"
            color="#94A3B8"
            _hover={{ bg: "#0F172A", color: "white" }}
            borderRadius="12px"
            onClick={() => navigate(`/exam/${id}`)}
            leftIcon={<Icon as={FaArrowLeft} />}
          >
            Cancel
          </Button>

          <Button
            flex={1}
            size="md"
            bg="#2563EB"
            color="white"
            borderRadius="12px"
            fontWeight="bold"
            fontSize="14px"
            _hover={{ bg: "#1D4ED8" }}
            onClick={handleStartExam}
            loading={isLoading}
            loadingText="Initializing Examination Environment..."
            rightIcon={<Icon as={FaPlay} />}
          >
            Launch CBT Examination
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}

export default StartExam;
