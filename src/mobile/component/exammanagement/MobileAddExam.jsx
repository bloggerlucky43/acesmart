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
} from "@chakra-ui/react";
import { useState } from "react";
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

export default function MobileAddExam() {
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [examForm, setExamForm] = useState({
    examTitle: "",
    duration: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchQuestions = async (e) => {
    e.preventDefault();
    if (!subject) {
      toaster.warning({
        title: "Subject is required",
      });
      return;
    }
    setLoading(true);

    try {
      const res = await getQuestions(subject, year);

      if (res.success && res.data) {
        setQuestions(res.data);
        localStorage.setItem("QUES_TION", JSON.stringify(res.data));
        toaster.success({
          title: `Fetched ${res.data.length} questions successfully!`,
        });
      } else {
        setQuestions([]);
        toaster.create({
          title: res.message || "No questions found for this subject/year",
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

  const handleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions);
    }
  };

  const toggleSelectQuestion = (q) => {
    if (selectedQuestions.some((item) => item.id === q.id)) {
      setSelectedQuestions(
        selectedQuestions.filter((item) => item.id !== q.id)
      );
    } else {
      setSelectedQuestions([...selectedQuestions, q]);
    }
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
          Search by subject and optional target examination year
        </Text>

        <Flex gap={2} mb={3}>
          <Field.Root required flex={1}>
            <Field.Label fontSize="xs" fontWeight="medium" color="#475569">
              Subject
            </Field.Label>
            <Input
              placeholder="e.g., Physics"
              size="sm"
              borderRadius="lg"
              borderColor="#CBD5E1"
              _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </Field.Root>

          <Field.Root flex={1}>
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
            <Button
              size="xs"
              variant="outline"
              borderColor="#CBD5E1"
              onClick={handleSelectAll}
              borderRadius="md"
            >
              {selectedQuestions.length === questions.length
                ? "Deselect All"
                : "Select All"}
            </Button>
          </Flex>

          <VStack spacing={2} align="stretch" maxH="320px" overflowY="auto" pr={1}>
            {questions.map((q) => {
              const isSelected = selectedQuestions.some((item) => item.id === q.id);
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
                  transition="all 0.15s ease"
                >
                  <HStack spacing={2} align="flex-start">
                    <Checkbox.Root
                      checked={isSelected}
                      onCheckedChange={() => toggleSelectQuestion(q)}
                      colorPalette="purple"
                      mt={0.5}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                    </Checkbox.Root>
                    <Box flex={1}>
                      <Text fontSize="xs" color="#1E293B" fontWeight={isSelected ? "semibold" : "normal"}>
                        {q.questionText}
                      </Text>
                      {q.subject && (
                        <Badge
                          bg="#E2E8F0"
                          color="#475569"
                          fontSize="9px"
                          borderRadius="full"
                          px={1.5}
                          mt={1}
                        >
                          {q.subject}
                        </Badge>
                      )}
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
            <Text fontSize="sm" fontWeight="bold" color="#0F172A">
              Selected Questions
            </Text>
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
