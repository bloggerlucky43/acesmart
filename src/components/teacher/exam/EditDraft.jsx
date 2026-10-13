import DashboardLayout from "../../../constants/dashboardlayout";
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
  Spinner,
  NativeSelect,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toaster } from "../../ui/toaster";
import { updateExam, getExamById } from "../../../api-endpoint/exam/exams";
import { toUTCISOString, toDateTimeLocalValue } from "../../../libs/helper";
import {
  FaSlidersH,
  FaCalendarAlt,
  FaClock,
  FaAward,
  FaInfoCircle,
  FaArrowLeft,
  FaCheck,
  FaShieldAlt,
  FaCamera,
  FaExclamationTriangle,
  FaLayerGroup,
} from "react-icons/fa";

export default function EditDraft() {
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const { examId } = useParams();
  const navigate = useNavigate();

  const [examDetails, setExamDetails] = useState({
    title: "",
    description: "",
    duration: 60,
    startDate: "",
    endDate: "",
    totalMarks: 100,
    negativeMarking: false,
    negativeMarkingPenalty: 0.25,
    enableBiometricCheckin: false,
    sections: [],
    examCode: "",
    id: examId || null,
  });

  useEffect(() => {
    const loadDraftOrExam = async () => {
      const saved = localStorage.getItem("EDIT_EXAM_DRAFT");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setExamDetails((prev) => ({
            ...prev,
            title: parsed.examTitle || parsed.title || prev.title,
            description: parsed.description || prev.description,
            duration: parsed.duration || prev.duration,
            totalMarks: parsed.totalMarks || prev.totalMarks,
            startDate: toDateTimeLocalValue(parsed.startDate),
            endDate: toDateTimeLocalValue(parsed.endDate),
            negativeMarking: parsed.negativeMarking ?? prev.negativeMarking,
            negativeMarkingPenalty: parsed.negativeMarkingPenalty ?? prev.negativeMarkingPenalty,
            enableBiometricCheckin: parsed.enableBiometricCheckin ?? prev.enableBiometricCheckin,
            sections: parsed.sections || [],
            examCode: parsed.examCode || prev.examCode,
          }));
          return;
        } catch (err) {
          console.error("Failed to parse draft", err);
        }
      }

      // Fallback: Fetch directly from server if accessed directly or refreshed
      if (examId) {
        setLoadingInitial(true);
        try {
          const res = await getExamById(examId);
          if (res?.exam) {
            const ex = res.exam;
            setExamDetails({
              title: ex.title || "",
              description: ex.description || "",
              duration: ex.duration || 60,
              startDate: toDateTimeLocalValue(ex.startDate),
              endDate: toDateTimeLocalValue(ex.endDate),
              totalMarks: ex.totalMarks || 100,
              negativeMarking: Boolean(ex.negativeMarking),
              negativeMarkingPenalty: ex.negativeMarkingPenalty ?? 0.25,
              enableBiometricCheckin: Boolean(ex.enableBiometricCheckin),
              sections: ex.sections || [],
              examCode: ex.examCode || "",
              id: examId,
            });
          }
        } catch (error) {
          toaster.error({ title: "Failed to load examination details" });
        } finally {
          setLoadingInitial(false);
        }
      }
    };

    loadDraftOrExam();
  }, [examId]);

  const handleSetStartNow = () => {
    const now = new Date();
    // 2-minute buffer in the past guarantees immediate candidate access
    const immediateStart = new Date(now.getTime() - 2 * 60 * 1000);
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    setExamDetails((prev) => ({
      ...prev,
      startDate: toDateTimeLocalValue(immediateStart),
      endDate: prev.endDate || toDateTimeLocalValue(end),
    }));
    toaster.info({
      title: "Start date set to NOW! Examination is immediately active.",
    });
  };

  const totalQuestions = (examDetails.sections || []).reduce(
    (acc, sec) => acc + (sec.questions?.length || 0),
    0
  );

  const handleFinalSubmit = async () => {
    if (!examDetails.title?.trim()) {
      toaster.error({ title: "Exam title is required" });
      return;
    }
    if (!examDetails.startDate) {
      toaster.error({ title: "Exam start date & time is required" });
      return;
    }
    if (!examDetails.endDate) {
      toaster.error({ title: "Exam end date & time is required" });
      return;
    }
    if (!examDetails.duration || Number(examDetails.duration) <= 0) {
      toaster.error({ title: "Valid duration in minutes is required" });
      return;
    }
    if (!examDetails.description?.trim()) {
      toaster.error({ title: "Candidate instructions / description is required" });
      return;
    }
    if (examDetails.sections.length === 0) {
      toaster.error({ title: "Exam must contain at least one question section" });
      return;
    }

    const payload = {
      title: examDetails.title,
      description: examDetails.description,
      duration: Number(examDetails.duration),
      totalMarks: Number(examDetails.totalMarks),
      startDate: toUTCISOString(examDetails.startDate),
      endDate: toUTCISOString(examDetails.endDate),
      negativeMarking: Boolean(examDetails.negativeMarking),
      negativeMarkingPenalty: Number(examDetails.negativeMarkingPenalty || 0.25),
      enableBiometricCheckin: Boolean(examDetails.enableBiometricCheckin),
      sections: examDetails.sections,
    };

    setLoading(true);
    try {
      const res = await updateExam(examId, payload);

      if (res.success || res.data) {
        toaster.success({ title: "Examination updated and saved successfully!" });
        localStorage.removeItem("EDIT_EXAM_DRAFT");
        navigate("/teacher/exams");
      } else {
        toaster.error({ title: res.message || "Failed to update exam" });
      }
    } catch (error) {
      toaster.error({
        title: "Something went wrong while saving exam changes.",
      });
      console.error("Server update fail:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingInitial) {
    return (
      <DashboardLayout>
        <Flex
          minH="calc(100vh - 84px)"
          justify="center"
          align="center"
          direction="column"
          ml={{ base: 0, lg: "240px" }}
          mt="84px"
        >
          <Spinner size="xl" color="#7C3AED" mb={3} />
          <Text fontSize="14px" fontWeight="600" color="#64748B">
            Loading exam settings...
          </Text>
        </Flex>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box
        bg="#F8FAFC"
        minH="calc(100vh - 84px)"
        p={{ base: 4, md: 8 }}
        ml={{ base: 0, lg: "240px" }}
        w={{ base: "100%", lg: "calc(100% - 240px)" }}
        mt="84px"
      >
        <Box maxW="1200px" mx="auto">
          {/* Header Banner */}
          <Box
            bg="linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)"
            p={{ base: 6, md: 8 }}
            borderRadius="24px"
            color="white"
            mb={6}
            boxShadow="0 10px 25px -5px rgba(15, 23, 42, 0.2)"
          >
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "flex-start", md: "center" }}
              gap={4}
            >
              <Box>
                <HStack spacing={2} mb={2}>
                  <Button
                    size="xs"
                    variant="ghost"
                    color="whiteAlpha.800"
                    _hover={{ bg: "whiteAlpha.200", color: "white" }}
                    leftIcon={<Icon as={FaArrowLeft} />}
                    onClick={() => navigate(`/teacher/exams/edit/${examId}/structure`)}
                    px={2}
                    h="26px"
                    borderRadius="md"
                    fontSize="11px"
                  >
                    Back to Structure
                  </Button>
                  <Text color="whiteAlpha.400">•</Text>
                  <Badge
                    bg="rgba(124, 58, 237, 0.3)"
                    color="#C4B5FD"
                    border="1px solid rgba(196, 181, 253, 0.3)"
                    px={2.5}
                    py={0.5}
                    borderRadius="md"
                    fontSize="10px"
                    fontWeight="bold"
                  >
                    STEP 2 OF 2: SCHEDULE & PUBLICATION
                  </Badge>
                  {examDetails.examCode && (
                    <Badge
                      bg="rgba(16, 185, 129, 0.2)"
                      color="#6EE7B7"
                      border="1px solid rgba(110, 231, 183, 0.3)"
                      px={2.5}
                      py={0.5}
                      borderRadius="md"
                      fontSize="10px"
                      fontWeight="bold"
                      letterSpacing="0.8px"
                    >
                      CODE: {examDetails.examCode}
                    </Badge>
                  )}
                </HStack>
                <Text
                  fontSize={{ base: "22px", md: "28px" }}
                  fontWeight="800"
                  fontFamily="'Outfit', sans-serif"
                  lineHeight="1.2"
                  mb={1.5}
                >
                  Exam Rules, Schedule & Publication
                </Text>
                <Text fontSize="13px" color="#94A3B8" maxW="640px">
                  Specify testing windows, candidate proctoring policies, and scoring criteria before updating the live exam.
                </Text>
              </Box>

              {/* Stats Chips */}
              <HStack
                spacing={4}
                bg="rgba(255, 255, 255, 0.06)"
                p={3.5}
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

          {/* Settings Grid */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} mb={6}>
            {/* Left Column: General Info & Instructions */}
            <Box
              p={{ base: 6, md: 7 }}
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
                    Candidate-facing title and assessment instructions.
                  </Text>
                </Box>
              </Flex>

              <VStack spacing={4} align="stretch">
                <Field.Root required>
                  <Field.Label fontWeight="700" fontSize="13px" color="#334155">
                    Exam Title <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
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
                    Candidate Instructions & Description <Field.RequiredIndicator />
                  </Field.Label>
                  <Textarea
                    borderRadius="xl"
                    borderColor="#CBD5E1"
                    _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
                    rows={4}
                    placeholder="Enter examination guidelines, required calculators, and hall conduct rules..."
                    value={examDetails.description}
                    onChange={(e) =>
                      setExamDetails({ ...examDetails, description: e.target.value })
                    }
                  />
                </Field.Root>

                <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4} pt={2}>
                  <Field.Root required>
                    <Field.Label fontWeight="700" fontSize="13px" color="#334155">
                      Duration (Minutes) <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      type="number"
                      borderRadius="xl"
                      h="46px"
                      borderColor="#CBD5E1"
                      _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
                      value={examDetails.duration}
                      onChange={(e) =>
                        setExamDetails({ ...examDetails, duration: e.target.value })
                      }
                    />
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label fontWeight="700" fontSize="13px" color="#334155">
                      Total Marks <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      type="number"
                      borderRadius="xl"
                      h="46px"
                      borderColor="#CBD5E1"
                      _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
                      value={examDetails.totalMarks}
                      onChange={(e) =>
                        setExamDetails({ ...examDetails, totalMarks: e.target.value })
                      }
                    />
                  </Field.Root>
                </SimpleGrid>
              </VStack>
            </Box>

            {/* Right Column: Schedule & Security Controls */}
            <Box
              p={{ base: 6, md: 7 }}
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
                  bg="rgba(124, 58, 237, 0.1)"
                  align="center"
                  justify="center"
                >
                  <Icon as={FaCalendarAlt} color="#7C3AED" boxSize={4} />
                </Flex>
                <Box>
                  <Text fontSize="16px" fontWeight="800" color="#0F172A">
                    Testing Window & Security
                  </Text>
                  <Text fontSize="12px" color="#64748B">
                    Active schedules, biometric policies, and negative marking.
                  </Text>
                </Box>
              </Flex>

              <VStack spacing={4} align="stretch">
                {/* Start Date */}
                <Field.Root required>
                  <Flex justify="space-between" align="center" mb={1}>
                    <Field.Label fontWeight="700" fontSize="13px" color="#334155" mb={0}>
                      Exam Start Date & Time <Field.RequiredIndicator />
                    </Field.Label>
                    <Button
                      size="2xs"
                      variant="outline"
                      borderColor="#DDD6FE"
                      color="#7C3AED"
                      bg="purple.50"
                      _hover={{ bg: "purple.100" }}
                      borderRadius="md"
                      px={2.5}
                      py={1}
                      fontSize="11px"
                      fontWeight="bold"
                      onClick={handleSetStartNow}
                    >
                      Start Now
                    </Button>
                  </Flex>
                  <Input
                    type="datetime-local"
                    borderRadius="xl"
                    h="46px"
                    borderColor="#CBD5E1"
                    _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
                    value={examDetails.startDate}
                    onChange={(e) =>
                      setExamDetails({ ...examDetails, startDate: e.target.value })
                    }
                  />
                </Field.Root>

                {/* End Date */}
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
                      setExamDetails({ ...examDetails, endDate: e.target.value })
                    }
                  />
                </Field.Root>

                {/* Negative Marking Policy */}
                <Box
                  p={4}
                  borderRadius="16px"
                  bg="#F8FAFC"
                  border="1px solid #E2E8F0"
                >
                  <Flex justify="space-between" align="center">
                    <Box pr={2}>
                      <Text fontSize="13px" fontWeight="700" color="#0F172A">
                        Negative Marking Penalty
                      </Text>
                      <Text fontSize="11px" color="#64748B">
                        Deduct fractional marks for incorrect answers.
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

                  {examDetails.negativeMarking && (
                    <Box mt={3} pt={3} borderTop="1px dashed #CBD5E1">
                      <Field.Label fontSize="11px" fontWeight="700" color="#334155" mb={1}>
                        Penalty Deduction per Incorrect Answer:
                      </Field.Label>
                      <NativeSelect.Root size="sm">
                        <NativeSelect.Field
                          value={examDetails.negativeMarkingPenalty}
                          onChange={(e) =>
                            setExamDetails({
                              ...examDetails,
                              negativeMarkingPenalty: parseFloat(e.target.value),
                            })
                          }
                          borderRadius="lg"
                          bg="white"
                        >
                          <option value="0.25">-0.25 Marks (25% penalty)</option>
                          <option value="0.5">-0.50 Marks (50% penalty)</option>
                          <option value="1.0">-1.00 Mark (Full deduction)</option>
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                    </Box>
                  )}
                </Box>

                {/* Biometric Checkin */}
                <Box
                  p={4}
                  borderRadius="16px"
                  bg="#F8FAFC"
                  border="1px solid #E2E8F0"
                >
                  <Flex justify="space-between" align="center">
                    <Box pr={2}>
                      <HStack spacing={1.5} mb={0.5}>
                        <Icon as={FaCamera} color="#3B82F6" boxSize={3.5} />
                        <Text fontSize="13px" fontWeight="700" color="#0F172A">
                          AI Face Recognition Check-in
                        </Text>
                      </HStack>
                      <Text fontSize="11px" color="#64748B">
                        Validate candidate identity with real-time facial capture before allowing test entry.
                      </Text>
                    </Box>
                    <Switch.Root
                      checked={examDetails.enableBiometricCheckin}
                      onCheckedChange={(e) =>
                        setExamDetails({
                          ...examDetails,
                          enableBiometricCheckin: e.checked,
                        })
                      }
                      colorPalette="blue"
                    >
                      <Switch.HiddenInput />
                      <Switch.Control />
                    </Switch.Root>
                  </Flex>
                </Box>
              </VStack>
            </Box>
          </SimpleGrid>

          {/* Section Summary Card */}
          <Box
            p={{ base: 5, md: 6 }}
            bg="white"
            borderRadius="24px"
            border="1px solid #E2E8F0"
            boxShadow="0 2px 10px rgba(0, 0, 0, 0.02)"
            mb={6}
          >
            <Flex justify="space-between" align="center" mb={3}>
              <HStack spacing={2.5}>
                <Flex
                  w="28px"
                  h="28px"
                  borderRadius="md"
                  bg="#0F172A"
                  color="white"
                  align="center"
                  justify="center"
                >
                  <Icon as={FaLayerGroup} boxSize={3.5} />
                </Flex>
                <Text fontSize="14px" fontWeight="800" color="#0F172A">
                  Included Assessment Sections ({examDetails.sections.length})
                </Text>
              </HStack>
              <Button
                size="xs"
                variant="outline"
                borderColor="#CBD5E1"
                onClick={() => navigate(`/teacher/exams/edit/${examId}/structure`)}
              >
                Modify Sections
              </Button>
            </Flex>

            <HStack spacing={2} wrap="wrap">
              {examDetails.sections.map((sec, idx) => (
                <Badge
                  key={idx}
                  bg="purple.50"
                  color="#6B21A8"
                  border="1px solid #DDD6FE"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="11px"
                  fontWeight="bold"
                >
                  {sec.section || `Section ${idx + 1}`} ({sec.questions?.length || 0} Questions)
                </Badge>
              ))}
            </HStack>
          </Box>

          {/* Bottom Actions */}
          <Flex justify="space-between" align="center" pt={4} borderTop="1px solid #E2E8F0">
            <Button
              variant="outline"
              borderColor="#CBD5E1"
              borderRadius="xl"
              h="44px"
              px={5}
              fontSize="13px"
              color="#64748B"
              leftIcon={<Icon as={FaArrowLeft} />}
              onClick={() => navigate(`/teacher/exams/edit/${examId}/structure`)}
            >
              Back to Structure
            </Button>

            <Button
              h="44px"
              px={7}
              bg="linear-gradient(135deg, #059669 0%, #047857 100% )"
              color="white"
              borderRadius="xl"
              fontWeight="bold"
              fontSize="13px"
              boxShadow="0 4px 14px rgba(5, 150, 105, 0.3)"
              _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(5, 150, 105, 0.4)" }}
              onClick={handleFinalSubmit}
              loading={loading}
              spinnerPlacement="center"
            >
              <Icon as={FaCheck} mr={2} />
              Save & Update Examination
            </Button>
          </Flex>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
