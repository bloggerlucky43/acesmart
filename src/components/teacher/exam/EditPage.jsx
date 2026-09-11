import {
  Box,
  Button,
  Field,
  Switch,
  SimpleGrid,
  Input,
  Flex,
  Textarea,
  Text,
  Badge,
  HStack,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toaster } from "../../ui/toaster";
import { createExam } from "../../../api-endpoint/exam/exams";
import {
  FaSlidersH,
  FaCalendarAlt,
  FaCheckCircle,
  FaEye,
  FaClock,
  FaAward,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function EditPage() {
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const examId = searchParams.get("exam");

  const [examDetails, setExamDetails] = useState({
    title: "WAEC 2024",
    description: "This is a sample exam description.",
    duration: 60,
    startDate: "",
    endDate: "",
    totalMarks: 100,
    negativeMarking: false,
    sections: [],
    id: examId || null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const loadExam = async () => {
      if (examId) {
        setLoading(true);
        // Reserved for exam loader if needed
        setLoading(false);
      } else {
        const storedData = localStorage.getItem("NEW_EXAM");

        if (!storedData) return;
        try {
          const parsedData = JSON.parse(storedData);

          setExamDetails((prev) => ({
            ...prev,
            title: parsedData.examTitle || prev.title,
            duration: parsedData.duration || prev.duration,
            sections: parsedData.sections || [],
            totalMarks: parsedData.totalMarks || prev.totalMarks,
          }));
        } catch (e) {
          console.error("Failed to parse NEW_EXAM", e);
        }
      }
    };

    loadExam();
  }, [examId, navigate]);

  const handleSaveChanges = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!examDetails.startDate) {
      toaster.error({ title: "Start date/time is required" });
      return;
    } else if (!examDetails.endDate) {
      toaster.error({ title: "End date/time is required" });
      return;
    } else if (!examDetails.duration) {
      toaster.error({ title: "Exam duration is required" });
      return;
    } else if (!examDetails.description?.trim()) {
      toaster.error({ title: "Exam description is required" });
      return;
    } else if (examDetails.sections.length === 0) {
      toaster.error({ title: "Exam question sections are empty" });
      return;
    }

    setLoading(true);
    try {
      const res = await createExam(examDetails);

      if (res.success && res.data) {
        toaster.success({ title: "Exam successfully published to student portal!" });
        navigate("/teacher/exams");
      }
    } catch (error) {
      toaster.error({
        title: "Something went wrong. Please try again later.",
      });
      console.error("Server call fail:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalQuestions = examDetails.sections.reduce(
    (acc, sec) => acc + (sec.questions?.length || 0),
    0
  );

  return (
    <Box
      bg="#F8FAFC"
      minH="calc(100vh - 84px)"
      p={{ base: 4, md: 8 }}
      ml={{ base: 0, lg: "240px" }}
      w={{ base: "100%", lg: "calc(100% - 240px)" }}
      justifySelf="center"
      mt="84px"
    >
      {/* Header Banner */}
      <Box
        bg="linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)"
        p={{ base: 6, md: 8 }}
        borderRadius="24px"
        color="white"
        mb={8}
        boxShadow="0 10px 25px -5px rgba(15, 23, 42, 0.2)"
      >
        <Flex
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={4}
        >
          <Box>
            <HStack spacing={2} mb={2}>
              <Badge
                bg="rgba(99, 102, 241, 0.25)"
                color="#A5B4FC"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="11px"
                fontWeight="bold"
              >
                STEP 2 OF 2: PUBLISHING & SCHEDULING
              </Badge>
              <Badge
                bg="rgba(16, 185, 129, 0.2)"
                color="#34D399"
                px={2.5}
                py={1}
                borderRadius="full"
                fontSize="11px"
              >
                {examDetails.sections.length} Sections Attached
              </Badge>
            </HStack>
            <Text
              fontSize={{ base: "22px", md: "28px" }}
              fontWeight="800"
              fontFamily="'Outfit', sans-serif"
              lineHeight="1.2"
              mb={2}
            >
              Examination Rules & Schedule
            </Text>
            <Text fontSize="14px" color="#94A3B8" maxW="680px">
              Specify active CBT testing windows, proctoring instructions, scoring limits,
              and negative marking penalties before deploying to students.
            </Text>
          </Box>

          <HStack
            spacing={4}
            bg="rgba(255, 255, 255, 0.06)"
            p={3}
            borderRadius="xl"
            border="1px solid rgba(255, 255, 255, 0.1)"
          >
            <VStack spacing={0} align="center" px={2}>
              <Text fontSize="11px" color="#94A3B8">Sections</Text>
              <Text fontSize="lg" fontWeight="bold" color="white">{examDetails.sections.length}</Text>
            </VStack>
            <Box h="28px" w="1px" bg="rgba(255, 255, 255, 0.15)" />
            <VStack spacing={0} align="center" px={2}>
              <Text fontSize="11px" color="#94A3B8">Questions</Text>
              <Text fontSize="lg" fontWeight="bold" color="#818CF8">{totalQuestions}</Text>
            </VStack>
            <Box h="28px" w="1px" bg="rgba(255, 255, 255, 0.15)" />
            <VStack spacing={0} align="center" px={2}>
              <Text fontSize="11px" color="#94A3B8">Duration</Text>
              <Text fontSize="lg" fontWeight="bold" color="#34D399">{examDetails.duration}m</Text>
            </VStack>
          </HStack>
        </Flex>
      </Box>

      {/* Main Settings Grid */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} mb={8}>
        {/* Left Column: Metadata & Instructions */}
        <Box
          p={{ base: 6, md: 8 }}
          borderRadius="24px"
          border="1px solid #E2E8F0"
          bg="white"
          boxShadow="0 2px 12px rgba(0,0,0,0.03)"
        >
          <Flex align="center" gap={3} mb={5}>
            <Flex
              w="36px"
              h="36px"
              borderRadius="xl"
              bg="rgba(99, 102, 241, 0.1)"
              align="center"
              justify="center"
            >
              <Icon as={FaInfoCircle} color="#4F46E5" boxSize={4} />
            </Flex>
            <Box>
              <Text fontSize="16px" fontWeight="800" color="#0F172A">
                General Exam Information
              </Text>
              <Text fontSize="12px" color="#64748B">
                Candidate-facing exam title and instructions.
              </Text>
            </Box>
          </Flex>

          <VStack spacing={5} align="stretch">
            <Field.Root required>
              <Field.Label fontWeight="700" fontSize="13px" color="#334155">
                Exam Title <Field.RequiredIndicator />
              </Field.Label>
              <Input
                placeholder="Enter exam title"
                borderRadius="xl"
                h="46px"
                borderColor="#CBD5E1"
                _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
                value={examDetails.title}
                onChange={(e) =>
                  setExamDetails({ ...examDetails, title: e.target.value })
                }
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label fontWeight="700" fontSize="13px" color="#334155">
                Instructions / Description <Field.RequiredIndicator />
              </Field.Label>
              <Textarea
                placeholder="Provide instructions for candidate testing (e.g. calculators allowed, time limit warnings)..."
                borderRadius="xl"
                rows={5}
                borderColor="#CBD5E1"
                _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
                value={examDetails.description}
                onChange={(e) =>
                  setExamDetails({
                    ...examDetails,
                    description: e.target.value,
                  })
                }
              />
            </Field.Root>

            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
              <Field.Root required>
                <Field.Label fontWeight="700" fontSize="13px" color="#334155">
                  Duration (minutes) <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  type="number"
                  placeholder="60"
                  borderRadius="xl"
                  h="46px"
                  borderColor="#CBD5E1"
                  _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
                  value={examDetails.duration}
                  onChange={(e) =>
                    setExamDetails({ ...examDetails, duration: Number(e.target.value) })
                  }
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label fontWeight="700" fontSize="13px" color="#334155">
                  Total Marks <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  type="number"
                  placeholder="100"
                  borderRadius="xl"
                  h="46px"
                  borderColor="#CBD5E1"
                  _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
                  value={examDetails.totalMarks}
                  onChange={(e) =>
                    setExamDetails({ ...examDetails, totalMarks: Number(e.target.value) })
                  }
                />
              </Field.Root>
            </SimpleGrid>
          </VStack>
        </Box>

        {/* Right Column: Scheduling & Negative Marking */}
        <Box
          p={{ base: 6, md: 8 }}
          borderRadius="24px"
          border="1px solid #E2E8F0"
          bg="white"
          boxShadow="0 2px 12px rgba(0,0,0,0.03)"
        >
          <Flex align="center" gap={3} mb={5}>
            <Flex
              w="36px"
              h="36px"
              borderRadius="xl"
              bg="rgba(16, 185, 129, 0.1)"
              align="center"
              justify="center"
            >
              <Icon as={FaCalendarAlt} color="#059669" boxSize={4} />
            </Flex>
            <Box>
              <Text fontSize="16px" fontWeight="800" color="#0F172A">
                Scheduling Window & Policies
              </Text>
              <Text fontSize="12px" color="#64748B">
                Define the start/expiration timestamps and test behavior.
              </Text>
            </Box>
          </Flex>

          <VStack spacing={5} align="stretch">
            <Field.Root required>
              <Field.Label fontWeight="700" fontSize="13px" color="#334155">
                Exam Start Date & Time <Field.RequiredIndicator />
              </Field.Label>
              <Input
                type="datetime-local"
                borderRadius="xl"
                h="46px"
                borderColor="#CBD5E1"
                _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
                value={examDetails.startDate}
                onChange={(e) =>
                  setExamDetails({
                    ...examDetails,
                    startDate: e.target.value,
                  })
                }
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label fontWeight="700" fontSize="13px" color="#334155">
                Exam End Date & Time <Field.RequiredIndicator />
              </Field.Label>
              <Input
                type="datetime-local"
                borderRadius="xl"
                h="46px"
                borderColor="#CBD5E1"
                _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
                value={examDetails.endDate}
                onChange={(e) =>
                  setExamDetails({
                    ...examDetails,
                    endDate: e.target.value,
                  })
                }
              />
            </Field.Root>

            {/* Negative Marking Card */}
            <Box
              p={4}
              borderRadius="16px"
              bg="#F8FAFC"
              border="1px solid #E2E8F0"
              mt={2}
            >
              <Flex justify="space-between" align="center">
                <Box maxW="80%">
                  <HStack spacing={2} mb={1}>
                    <Icon as={FaExclamationTriangle} color="#D97706" boxSize={3.5} />
                    <Text fontSize="13px" fontWeight="700" color="#0F172A">
                      Negative Marking Policy
                    </Text>
                  </HStack>
                  <Text fontSize="11px" color="#64748B">
                    When enabled, incorrect candidate choices deduct fractional marks from the aggregate score.
                  </Text>
                </Box>

                <Switch.Root
                  checked={examDetails.negativeMarking}
                  onCheckedChange={(e) =>
                    setExamDetails({
                      ...examDetails,
                      negativeMarking: e.checked,
                    })
                  }
                  colorPalette="purple"
                >
                  <Switch.HiddenInput />
                  <Switch.Control />
                </Switch.Root>
              </Flex>
            </Box>
          </VStack>
        </Box>
      </SimpleGrid>

      {/* Bottom Action Bar */}
      <Flex
        p={5}
        borderRadius="24px"
        bg="white"
        border="1px solid #E2E8F0"
        justify="space-between"
        align="center"
        boxShadow="0 4px 20px rgba(0,0,0,0.04)"
      >
        <Button
          variant="outline"
          borderColor="#CBD5E1"
          borderRadius="xl"
          h="46px"
          px={5}
          fontSize="13px"
          color="#475569"
          onClick={() =>
            navigate(
              examId
                ? `/teacher/exam/questions?exam_question=${examId}`
                : "/teacher/create_exam"
            )
          }
          leftIcon={<Icon as={FaEye} />}
        >
          {examId ? "Inspect Exam Questions" : "Back to Section Builder"}
        </Button>

        <Button
          h="48px"
          px={8}
          bg="linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
          color="white"
          borderRadius="xl"
          fontWeight="bold"
          fontSize="14px"
          boxShadow="0 4px 16px rgba(99, 102, 241, 0.35)"
          _hover={{
            transform: "translateY(-1px)",
            boxShadow: "0 6px 20px rgba(99, 102, 241, 0.45)",
          }}
          onClick={handleSaveChanges}
          loading={loading}
          leftIcon={<Icon as={FaCheckCircle} />}
        >
          Save & Publish Assessment
        </Button>
      </Flex>
    </Box>
  );
}
