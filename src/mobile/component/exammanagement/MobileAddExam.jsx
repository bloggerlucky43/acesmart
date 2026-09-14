import {
  Box,
  Flex,
  Text,
  Input,
  Field,
  Button,
  Checkbox,
  Accordion,
  Badge,
  HStack,
  VStack,
  Icon,
  NativeSelect,
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { getQuestions } from "../../../api-endpoint/exam/exams";
import { toaster } from "../../../components/ui/toaster";
import { useNavigate } from "react-router-dom";
import {
  FaLayerGroup,
  FaSearch,
  FaCheckCircle,
  FaArrowRight,
  FaClock,
  FaBook,
} from "react-icons/fa";
import { SUBJECTS_LIST, isTeacherQuestion } from "../../../components/teacher/exam/addExam";

export default function MobileAddExam() {
  const [subject, setSubject] = useState("Mathematics");
  const [customSubject, setCustomSubject] = useState("");
  const [year, setYear] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all"); // "all" | "teacher" | "api"
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [examForm, setExamForm] = useState({
    examTitle: "",
    duration: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const effectiveSubject =
    subject === "Other / Custom Subject"
      ? customSubject.trim()
      : (subject || "").trim();

  const selectedTeacherCount = useMemo(() => {
    return selectedQuestions.filter((q) => isTeacherQuestion(q)).length;
  }, [selectedQuestions]);

  const selectedPlatformCount = useMemo(() => {
    return selectedQuestions.filter((q) => !isTeacherQuestion(q)).length;
  }, [selectedQuestions]);

  const fetchQuestions = async (e) => {
    e.preventDefault();
    if (!effectiveSubject) {
      toaster.warning({
        title: "Please select or enter a subject",
      });
      return;
    }
    setLoading(true);

    try {
      const res = await getQuestions({
        subject: effectiveSubject,
        year: year?.trim() || undefined,
        source: sourceFilter,
        limit: 100,
      });

      if (res.success && res.data) {
        setQuestions(res.data);
        localStorage.setItem("QUES_TION", JSON.stringify(res.data));
        const sourceLabel =
          sourceFilter === "teacher"
            ? "My Bank"
            : sourceFilter === "api"
            ? "Platform Bank"
            : "All Question Banks";
        toaster.success({
          title: `Fetched ${res.data.length} questions from ${sourceLabel}!`,
        });
      } else {
        setQuestions([]);
        toaster.create({
          title: res.message || "No questions found for this query",
          type: "warning",
        });
      }
    } catch (error) {
      setQuestions([]);
      toaster.create({
        title: "Something went wrong. Please try again later.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedIdSet = useMemo(() => {
    return new Set(selectedQuestions.map((item) => item.id));
  }, [selectedQuestions]);

  const selectAllQuestions = () => {
    setSelectedQuestions([...questions]);
  };

  const deselectAllQuestions = () => {
    setSelectedQuestions([]);
  };

  const toggleSelectQuestion = (q) => {
    setSelectedQuestions((prev) => {
      const exists = prev.some((item) => item.id === q.id);
      if (exists) {
        return prev.filter((item) => item.id !== q.id);
      } else {
        return [...prev, q];
      }
    });
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();

    const examData = {
      examTitle: examForm.examTitle,
      duration: examForm.duration,
      questions: selectedQuestions,
    };

    if (!examData.examTitle) {
      toaster.warning({ title: "Please enter an exam title" });
      return;
    } else if (!examData.duration) {
      toaster.warning({ title: "Please enter exam duration" });
      return;
    } else if (examData.questions.length === 0) {
      toaster.warning({ title: "Please select at least one question" });
      return;
    }

    setLoading(true);

    try {
      localStorage.setItem("NEW_EXAM", JSON.stringify(examData));
      const examDetails = localStorage.getItem("NEW_EXAM");

      if (examDetails) {
        navigate("/teacher/exams/edit");
      }
    } catch (error) {
      toaster.error({
        title: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4} minH="calc(100vh - 58px)" bg="#F8FAFC">
      {/* Header Banner */}
      <Box
        bg="linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)"
        p={5}
        borderRadius="xl"
        color="white"
        mb={4}
        boxShadow="0 4px 14px 0 rgba(15, 23, 42, 0.2)"
      >
        <HStack spacing={3} mb={2}>
          <Flex
            w="36px"
            h="36px"
            borderRadius="lg"
            bg="rgba(99, 102, 241, 0.25)"
            align="center"
            justify="center"
            border="1px solid rgba(129, 140, 248, 0.4)"
          >
            <Icon as={FaLayerGroup} color="#818CF8" boxSize={4} />
          </Flex>
          <Box>
            <Text fontSize="md" fontWeight="bold" lineHeight="1.2">
              New Examination Setup
            </Text>
            <Text fontSize="xs" color="#94A3B8">
              Step 1 of 2: Details & Question Selection
            </Text>
          </Box>
        </HStack>
      </Box>

      {/* Basic Info Card */}
      <Box
        bg="white"
        p={4}
        borderRadius="xl"
        border="1px solid #E2E8F0"
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.05)"
        mb={4}
      >
        <Text fontSize="sm" fontWeight="bold" color="#0F172A" mb={3}>
          1. Basic Exam Information
        </Text>

        <VStack spacing={3} align="stretch">
          <Field.Root required>
            <Field.Label fontSize="xs" fontWeight="medium" color="#475569">
              Exam Title <Field.RequiredIndicator />
            </Field.Label>
            <Input
              placeholder="e.g., Mathematics Mock Test 2026"
              size="sm"
              borderRadius="lg"
              borderColor="#CBD5E1"
              _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
              value={examForm.examTitle}
              onChange={(e) =>
                setExamForm({ ...examForm, examTitle: e.target.value })
              }
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label fontSize="xs" fontWeight="medium" color="#475569">
              Duration (minutes) <Field.RequiredIndicator />
            </Field.Label>
            <Input
              type="number"
              placeholder="e.g., 60"
              size="sm"
              borderRadius="lg"
              borderColor="#CBD5E1"
              _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
              value={examForm.duration}
              onChange={(e) =>
                setExamForm({
                  ...examForm,
                  duration: e.target.value,
                })
              }
            />
          </Field.Root>
        </VStack>
      </Box>

      {/* Fetch Questions Card */}
      <Box
        bg="white"
        p={4}
        borderRadius="xl"
        border="1px solid #E2E8F0"
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.05)"
        mb={4}
      >
        <Text fontSize="sm" fontWeight="bold" color="#0F172A" mb={1}>
          2. Pull Questions from Bank
        </Text>
        <Text fontSize="xs" color="#64748B" mb={3}>
          Filter by question bank source, subject, and optional exam year
        </Text>

        {/* Bank Source Pills */}
        <Box mb={3}>
          <Text fontSize="xs" fontWeight="bold" color="#475569" mb={1.5}>
            Bank Source:
          </Text>
          <HStack spacing={1.5} wrap="wrap">
            {[
              { key: "all", label: "All Banks" },
              { key: "teacher", label: "🎓 My Bank" },
              { key: "api", label: "🌐 Platform" },
            ].map((src) => {
              const isActive = sourceFilter === src.key;
              return (
                <Button
                  key={src.key}
                  size="xs"
                  h="28px"
                  px={2.5}
                  borderRadius="full"
                  variant={isActive ? "solid" : "outline"}
                  bg={isActive ? "#0F172A" : "white"}
                  color={isActive ? "white" : "#475569"}
                  borderColor={isActive ? "#0F172A" : "#CBD5E1"}
                  fontWeight="bold"
                  fontSize="11px"
                  onClick={() => setSourceFilter(src.key)}
                >
                  {src.label}
                </Button>
              );
            })}
          </HStack>
        </Box>

        <Flex direction="column" gap={3} mb={3}>
          <Field.Root required>
            <Field.Label fontSize="xs" fontWeight="medium" color="#475569">
              Subject
            </Field.Label>
            <NativeSelect.Root size="sm" w="100%">
              <NativeSelect.Field
                borderRadius="lg"
                borderColor="#CBD5E1"
                _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                <option value="">-- Select Subject --</option>
                {SUBJECTS_LIST.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </NativeSelect.Field>
            </NativeSelect.Root>
            {subject === "Other / Custom Subject" && (
              <Input
                mt={2}
                placeholder="Enter custom subject..."
                size="sm"
                borderRadius="lg"
                borderColor="#CBD5E1"
                _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
              />
            )}
          </Field.Root>

          <Field.Root>
            <Field.Label fontSize="xs" fontWeight="medium" color="#475569">
              Year (optional)
            </Field.Label>
            <Input
              placeholder="e.g., 2025"
              size="sm"
              borderRadius="lg"
              borderColor="#CBD5E1"
              _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </Field.Root>
        </Flex>

        <Button
          w="100%"
          size="sm"
          bg="#4F46E5"
          color="white"
          borderRadius="lg"
          fontWeight="semibold"
          onClick={fetchQuestions}
          loading={loading}
          _hover={{ bg: "#4338CA" }}
          leftIcon={<Icon as={FaSearch} />}
        >
          Query Question Bank
        </Button>
      </Box>

      {/* Questions Selection List */}
      {questions.length > 0 && (
        <Box
          bg="white"
          p={4}
          borderRadius="xl"
          border="1px solid #E2E8F0"
          boxShadow="0 1px 3px rgba(0, 0, 0, 0.05)"
          mb={4}
        >
          <Flex justify="space-between" align="center" mb={3}>
            <Box>
              <Text fontSize="sm" fontWeight="bold" color="#0F172A">
                Found Questions ({questions.length})
              </Text>
              <Text fontSize="xs" color="#64748B">
                Tap to include in this exam
              </Text>
            </Box>
            <HStack spacing={1.5}>
              {selectedQuestions.length > 0 && (
                <Button
                  size="xs"
                  variant="subtle"
                  bg="rgba(239, 68, 68, 0.15)"
                  color="#DC2626"
                  onClick={deselectAllQuestions}
                  borderRadius="md"
                >
                  Clear ({selectedQuestions.length})
                </Button>
              )}
              <Button
                size="xs"
                variant="outline"
                borderColor="#CBD5E1"
                onClick={selectAllQuestions}
                borderRadius="md"
              >
                Select All
              </Button>
            </HStack>
          </Flex>

          <VStack spacing={2} align="stretch" maxH="320px" overflowY="auto" pr={1}>
            {questions.map((q) => {
              const isSelected = selectedIdSet.has(q.id);
              const isTeacher = isTeacherQuestion(q);
              return (
                <Box
                  key={q.id}
                  p={2.5}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={isSelected ? "#818CF8" : "#F1F5F9"}
                  bg={isSelected ? "rgba(99, 102, 241, 0.04)" : "#F8FAFC"}
                  cursor="pointer"
                  onClick={() => toggleSelectQuestion(q)}
                  transition="all 0.1s ease"
                >
                  <HStack spacing={2} align="flex-start">
                    <Checkbox.Root
                      checked={isSelected}
                      pointerEvents="none"
                      colorPalette="purple"
                      mt={0.5}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                    </Checkbox.Root>
                    <Box flex={1}>
                      <HStack spacing={1.5} mb={1} wrap="wrap">
                        <Badge
                          fontSize="9px"
                          px={1.5}
                          py={0.2}
                          borderRadius="full"
                          bg={isTeacher ? "purple.100" : "blue.100"}
                          color={isTeacher ? "purple.800" : "blue.800"}
                          fontWeight="bold"
                        >
                          {isTeacher ? "🎓 My Bank" : "🌐 Platform"}
                        </Badge>
                        {q.subject && (
                          <Badge
                            bg="#E2E8F0"
                            color="#475569"
                            fontSize="9px"
                            borderRadius="full"
                            px={1.5}
                          >
                            {q.subject}
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="#1E293B" fontWeight={isSelected ? "semibold" : "normal"}>
                        {q.questionText || q.question}
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        </Box>
      )}

      {/* Selected Questions Preview */}
      {selectedQuestions.length > 0 && (
        <Box
          bg="white"
          p={4}
          borderRadius="xl"
          border="1px solid #E2E8F0"
          boxShadow="0 1px 3px rgba(0, 0, 0, 0.05)"
          mb={4}
        >
          <Flex justify="space-between" align="center" mb={3}>
            <Box>
              <Text fontSize="sm" fontWeight="bold" color="#0F172A">
                Selected Questions ({selectedQuestions.length})
              </Text>
              <HStack spacing={1.5} mt={0.5}>
                <Badge bg="purple.100" color="purple.800" fontSize="9px" borderRadius="full" px={1.5}>
                  🎓 {selectedTeacherCount} My Bank
                </Badge>
                <Badge bg="blue.100" color="blue.800" fontSize="9px" borderRadius="full" px={1.5}>
                  🌐 {selectedPlatformCount} Platform
                </Badge>
              </HStack>
            </Box>
            <Badge
              bg="rgba(16, 185, 129, 0.1)"
              color="#059669"
              fontSize="xs"
              fontWeight="bold"
              px={2}
              py={0.5}
              borderRadius="full"
            >
              {selectedQuestions.length} Ready
            </Badge>
          </Flex>

          <Accordion.Root collapsible multiple>
            {selectedQuestions.map((q, idx) => (
              <Accordion.Item
                key={q.id || idx}
                value={String(q.id || idx)}
                borderBottom="1px solid #F1F5F9"
                py={1}
              >
                <Accordion.ItemTrigger py={2}>
                  <Flex flex={1} justify="space-between" align="center" pr={2}>
                    <Text fontSize="xs" fontWeight="medium" color="#334155" noOfLines={1}>
                      {idx + 1}. {q.questionText}
                    </Text>
                  </Flex>
                  <Accordion.ItemIndicator />
                </Accordion.ItemTrigger>
                <Accordion.ItemContent pb={3}>
                  <VStack align="stretch" spacing={1} pl={3} pt={1}>
                    {q.options &&
                      Object.entries(q.options).map(([key, value]) => (
                        <Text key={key} fontSize="11px" color="#64748B">
                          <strong style={{ color: "#0F172A" }}>{key.toUpperCase()}:</strong> {value}
                        </Text>
                      ))}
                  </VStack>
                </Accordion.ItemContent>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </Box>
      )}

      {/* Proceed CTA */}
      <Button
        w="100%"
        size="md"
        bg="linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
        color="white"
        borderRadius="xl"
        fontWeight="bold"
        boxShadow="0 4px 12px rgba(99, 102, 241, 0.3)"
        onClick={handleCreateExam}
        isDisabled={!examForm.examTitle || !examForm.duration || selectedQuestions.length === 0}
        _hover={{
          transform: "translateY(-1px)",
          boxShadow: "0 6px 16px rgba(99, 102, 241, 0.4)",
        }}
        rightIcon={<Icon as={FaArrowRight} />}
        mb={6}
      >
        Configure Structure & Schedule
      </Button>
    </Box>
  );
}
