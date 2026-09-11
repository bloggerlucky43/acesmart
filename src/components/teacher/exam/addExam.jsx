import {
  Box,
  Flex,
  Text,
  Input,
  Field,
  Button,
  Checkbox,
  SimpleGrid,
  Badge,
  HStack,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { useEffect, useState, useMemo } from "react";
import { getQuestions } from "../../../api-endpoint/exam/exams";
import { toaster } from "../../ui/toaster";
import { useNavigate } from "react-router-dom";
import { STORAGE_KEY } from "../../../libs/helper";
import {
  FaLayerGroup,
  FaSearch,
  FaCheckCircle,
  FaTrash,
  FaEdit,
  FaClock,
  FaAward,
  FaArrowRight,
  FaBookOpen,
  FaRedo,
  FaChevronDown,
  FaChevronUp,
  FaListOl,
  FaCheck,
  FaTimes,
  FaFileAlt,
  FaRegLightbulb,
} from "react-icons/fa";

export default function AddExam() {
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [selectedQuestionsIds, setSelectedQuestionsIds] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [sections, setSections] = useState([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [examForm, setExamForm] = useState({
    examTitle: "",
    duration: "",
    totalMarks: 40,
  });
  const [editingSectionIndex, setEditingSectionIndex] = useState(null);
  const [expandedSectionIdx, setExpandedSectionIdx] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Restore draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setExamForm({
          examTitle: "",
          duration: "",
          totalMarks: 40,
          ...parsed?.examForm,
        });
        setSections(parsed.sections || []);
        setSubject(parsed.subject || "");
        setYear(parsed.year || "");
        setQuestions(parsed.questions || []);
        setSelectedQuestionsIds(parsed.selectedQuestionsIds || []);

        toaster.info({
          title: "Exam draft restored",
        });
      } catch (error) {
        console.error("Failed to load draft", error);
      }
    }
  }, []);

  // Auto-save draft on changes (1s debounce)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const draft = {
        examForm,
        sections,
        subject,
        year,
        questions,
        selectedQuestionsIds,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [examForm, sections, subject, year, questions, selectedQuestionsIds]);

  const fetchQuestions = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!subject?.trim()) {
      toaster.warning({
        title: "Subject is required to fetch questions",
      });
      return;
    }
    setLoading(true);

    try {
      const res = await getQuestions(
        subject?.toLowerCase().trim(),
        year?.trim(),
      );

      if (res.success && res.data && Array.isArray(res.data)) {
        setQuestions(res.data);
        setSelectedQuestionsIds([]);
        setFilterQuery("");
        localStorage.setItem("QUES_TION", JSON.stringify(res.data));
        toaster.success({
          title: `Successfully fetched ${res.data.length} questions for ${subject}!`,
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
        title: "Something went wrong while fetching questions. Try again later.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedIdSet = useMemo(() => {
    return new Set(selectedQuestionsIds.map((item) => item.id));
  }, [selectedQuestionsIds]);

  const selectAllQuestions = () => {
    setSelectedQuestionsIds([...questions]);
  };

  const deselectAllQuestions = () => {
    setSelectedQuestionsIds([]);
  };

  const toggleSelectQuestion = (q) => {
    setSelectedQuestionsIds((prev) => {
      const exists = prev.some((item) => item.id === q.id);
      if (exists) {
        return prev.filter((item) => item.id !== q.id);
      } else {
        return [...prev, q];
      }
    });
  };

  const saveSection = () => {
    if (!subject.trim()) {
      toaster.create({
        title: "Please specify a section subject name",
        type: "warning",
      });
      return;
    }

    if (selectedQuestionsIds.length === 0) {
      toaster.create({
        title: "Please select at least one question for this section",
        type: "warning",
      });
      return;
    }

    const newSection = {
      section: subject.trim(),
      year: year.trim(),
      questions: selectedQuestionsIds,
    };

    if (editingSectionIndex !== null) {
      const updated = [...sections];
      updated[editingSectionIndex] = newSection;
      setSections(updated);
      setEditingSectionIndex(null);
      toaster.create({
        title: `Updated section "${newSection.section}"`,
        type: "success",
      });
    } else {
      setSections([...sections, newSection]);
      toaster.create({
        title: `Added section "${newSection.section}" with ${newSection.questions.length} questions`,
        type: "success",
      });
    }

    // Reset current builder
    setSubject("");
    setYear("");
    setQuestions([]);
    setSelectedQuestionsIds([]);
    setFilterQuery("");
  };

  const editSection = (index) => {
    const sec = sections[index];
    setSubject(sec.section);
    setYear(sec.year || "");
    setQuestions(sec.questions);
    setSelectedQuestionsIds(sec.questions);
    setEditingSectionIndex(index);
    setFilterQuery("");
  };

  const removeSection = (index) => {
    const updated = sections.filter((_, i) => i !== index);
    setSections(updated);
    toaster.info({ title: "Section removed from assessment" });
  };

  const handleCreateExam = () => {
    if (!examForm.examTitle.trim()) {
      toaster.create({
        title: "Exam title is required",
        type: "warning",
      });
      return;
    }
    if (!examForm.duration || examForm.duration <= 0) {
      toaster.create({
        title: "Please enter a valid duration in minutes",
        type: "warning",
      });
      return;
    }
    if (!examForm.totalMarks || examForm.totalMarks <= 0) {
      toaster.create({
        title: "Total marks must be a positive number",
        type: "warning",
      });
      return;
    }
    if (sections.length === 0) {
      toaster.create({
        title: "Please add at least one subject section to the exam",
        type: "warning",
      });
      return;
    }

    const finalExam = {
      examTitle: examForm.examTitle,
      duration: Number(examForm.duration),
      totalMarks: Number(examForm.totalMarks),
      sections,
    };

    localStorage.setItem("NEW_EXAM", JSON.stringify(finalExam));
    localStorage.removeItem(STORAGE_KEY);
    toaster.create({
      title: "Exam configured! Proceeding to scheduling & publication...",
      type: "success",
    });

    navigate("/teacher/exams/edit");
  };

  const totalExamQuestions = sections.reduce(
    (acc, sec) => acc + (sec.questions?.length || 0),
    0
  );

  const displayedQuestions = filterQuery.trim()
    ? questions.filter((q) =>
        (q.questionText || q.question || "")
          .toLowerCase()
          .includes(filterQuery.toLowerCase())
      )
    : questions;

  const hasTitle = Boolean(examForm.examTitle.trim());
  const hasDuration = Boolean(examForm.duration && Number(examForm.duration) > 0);
  const hasMarks = Boolean(examForm.totalMarks && Number(examForm.totalMarks) > 0);
  const hasSections = sections.length > 0;
  const isReadyToProceed = hasTitle && hasDuration && hasMarks && hasSections;

  return (
    <Box
      p={{ base: 4, md: 8 }}
      bg="#F8FAFC"
      w={{ base: "100%", lg: "calc(100% - 240px)" }}
      ml={{ base: 0, lg: "240px" }}
      mt="84px"
      minH="calc(100vh - 84px)"
      justifySelf="center"
    >
      {/* Top Header Bar */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        gap={4}
        mb={6}
      >
        <Box>
          <HStack spacing={2} mb={1}>
            <Badge
              bg="#0F172A"
              color="white"
              px={2.5}
              py={0.5}
              borderRadius="md"
              fontSize="10px"
              fontWeight="bold"
              letterSpacing="0.5px"
            >
              CBT CREATOR STUDIO
            </Badge>
            <HStack spacing={1.5} bg="rgba(16, 185, 129, 0.12)" px={2} py={0.5} borderRadius="full">
              <Box w="6px" h="6px" borderRadius="full" bg="#10B981" />
              <Text fontSize="11px" color="#059669" fontWeight="semibold">
                Draft Auto-Saved
              </Text>
            </HStack>
          </HStack>
          <Text
            fontSize={{ base: "22px", md: "26px" }}
            fontWeight="800"
            color="#0F172A"
            fontFamily="'Outfit', sans-serif"
            lineHeight="1.2"
          >
            Create Multi-Section Examination
          </Text>
          <Text fontSize="13px" color="#64748B">
            Assemble modular assessment sections, query the accredited question repository, and configure live testing limits.
          </Text>
        </Box>

        <HStack spacing={3}>
          <Button
            variant="outline"
            borderColor="#CBD5E1"
            borderRadius="xl"
            h="40px"
            fontSize="12px"
            color="#64748B"
            leftIcon={<Icon as={FaRedo} />}
            onClick={() => {
              setExamForm({ examTitle: "", duration: "", totalMarks: 40 });
              setSubject("");
              setYear("");
              setQuestions([]);
              setSelectedQuestionsIds([]);
              setSections([]);
              localStorage.removeItem(STORAGE_KEY);
              toaster.info({ title: "Draft cleared" });
            }}
          >
            Reset Draft
          </Button>

          <Button
            h="40px"
            px={5}
            bg="linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
            color="white"
            borderRadius="xl"
            fontWeight="bold"
            fontSize="13px"
            boxShadow="0 4px 14px rgba(99, 102, 241, 0.3)"
            _hover={{
              transform: "translateY(-1px)",
              boxShadow: "0 6px 18px rgba(99, 102, 241, 0.4)",
            }}
            onClick={handleCreateExam}
            isDisabled={!isReadyToProceed}
            rightIcon={<Icon as={FaArrowRight} />}
          >
            Proceed to Publish
          </Button>
        </HStack>
      </Flex>

      {/* 2-COLUMN CBT STUDIO LAYOUT */}
      <SimpleGrid columns={{ base: 1, xl: 12 }} gap={6} alignItems="flex-start">
        
        {/* ================= LEFT COLUMN: WORK AREA & BUILDER (7 of 12 cols) ================= */}
        <Box gridColumn={{ base: "1", xl: "span 7" }}>
          
          {/* Card 1: Exam General Parameters */}
          <Box
            bg="white"
            p={6}
            borderRadius="24px"
            border="1px solid #E2E8F0"
            boxShadow="0 2px 10px rgba(0, 0, 0, 0.02)"
            mb={6}
          >
            <Flex align="center" gap={2.5} mb={4}>
              <Flex
                w="32px"
                h="32px"
                borderRadius="lg"
                bg="rgba(99, 102, 241, 0.1)"
                align="center"
                justify="center"
              >
                <Icon as={FaFileAlt} color="#4F46E5" boxSize={3.5} />
              </Flex>
              <Box>
                <Text fontSize="15px" fontWeight="800" color="#0F172A">
                  Step 1: Exam Identification & Timings
                </Text>
                <Text fontSize="11px" color="#64748B">
                  Core assessment credentials visible to all enrolled candidates.
                </Text>
              </Box>
            </Flex>

            <VStack spacing={4} align="stretch">
              <Field.Root required>
                <Field.Label fontWeight="700" fontSize="12px" color="#334155">
                  Master Examination Title <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  placeholder="e.g. WAEC 2026 Mathematics & Science General Mock"
                  borderRadius="xl"
                  h="44px"
                  borderColor="#CBD5E1"
                  _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
                  value={examForm.examTitle}
                  onChange={(e) =>
                    setExamForm({ ...examForm, examTitle: e.target.value })
                  }
                />
              </Field.Root>

              <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                <Field.Root required>
                  <Field.Label fontWeight="700" fontSize="12px" color="#334155">
                    Duration (minutes) <Field.RequiredIndicator />
                  </Field.Label>
                  <HStack>
                    <Input
                      type="number"
                      placeholder="e.g. 120"
                      borderRadius="xl"
                      h="44px"
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
                  </HStack>
                </Field.Root>

                <Field.Root required>
                  <Field.Label fontWeight="700" fontSize="12px" color="#334155">
                    Total Marks <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    type="number"
                    placeholder="e.g. 100"
                    borderRadius="xl"
                    h="44px"
                    borderColor="#CBD5E1"
                    _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
                    value={examForm.totalMarks}
                    onChange={(e) =>
                      setExamForm({ ...examForm, totalMarks: e.target.value })
                    }
                  />
                </Field.Root>
              </SimpleGrid>
            </VStack>
          </Box>

          {/* Card 2: Section Builder Studio */}
          <Box
            bg="white"
            p={6}
            borderRadius="24px"
            border="1px solid #E2E8F0"
            boxShadow="0 2px 10px rgba(0, 0, 0, 0.02)"
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Flex align="center" gap={2.5}>
                <Flex
                  w="32px"
                  h="32px"
                  borderRadius="lg"
                  bg="rgba(124, 58, 237, 0.1)"
                  align="center"
                  justify="center"
                >
                  <Icon as={FaLayerGroup} color="#7C3AED" boxSize={3.5} />
                </Flex>
                <Box>
                  <Text fontSize="15px" fontWeight="800" color="#0F172A">
                    Step 2: Subject Section Builder
                  </Text>
                  <Text fontSize="11px" color="#64748B">
                    Query repository questions, select items, and append to this examination.
                  </Text>
                </Box>
              </Flex>

              {editingSectionIndex !== null && (
                <Badge
                  bg="#FEF3C7"
                  color="#D97706"
                  px={2.5}
                  py={1}
                  borderRadius="full"
                  fontSize="10px"
                  fontWeight="bold"
                >
                  EDITING SECTION #{editingSectionIndex + 1}
                </Badge>
              )}
            </Flex>

            {/* Query Controls */}
            <Box
              bg="#F8FAFC"
              p={4}
              borderRadius="18px"
              border="1px solid #E2E8F0"
              mb={5}
            >
              <SimpleGrid columns={{ base: 1, md: 12 }} gap={3} alignItems="flex-end">
                <Box gridColumn={{ base: "1", md: "span 5" }}>
                  <Field.Root required>
                    <Field.Label fontWeight="700" fontSize="11px" color="#475569">
                      Subject / Course <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      placeholder="e.g. Mathematics, Physics, English"
                      bg="white"
                      borderRadius="lg"
                      h="40px"
                      fontSize="13px"
                      borderColor="#CBD5E1"
                      _focus={{ borderColor: "#6366F1" }}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </Field.Root>
                </Box>

                <Box gridColumn={{ base: "1", md: "span 3" }}>
                  <Field.Root>
                    <Field.Label fontWeight="700" fontSize="11px" color="#475569">
                      Year (Optional)
                    </Field.Label>
                    <Input
                      placeholder="e.g. 2024"
                      bg="white"
                      borderRadius="lg"
                      h="40px"
                      fontSize="13px"
                      borderColor="#CBD5E1"
                      _focus={{ borderColor: "#6366F1" }}
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    />
                  </Field.Root>
                </Box>

                <Box gridColumn={{ base: "1", md: "span 4" }}>
                  <Button
                    w="100%"
                    h="40px"
                    bg="#0F172A"
                    color="white"
                    borderRadius="lg"
                    fontWeight="700"
                    fontSize="12px"
                    onClick={fetchQuestions}
                    loading={loading}
                    _hover={{ bg: "#1E293B" }}
                    leftIcon={<Icon as={FaSearch} />}
                  >
                    Query Questions
                  </Button>
                </Box>
              </SimpleGrid>
            </Box>

            {/* Question Selector List */}
            {questions.length === 0 ? (
              <Box
                p={8}
                borderRadius="18px"
                border="2px dashed #E2E8F0"
                bg="#F8FAFC"
                textAlign="center"
                mb={4}
              >
                <Icon as={FaBookOpen} boxSize={7} color="#94A3B8" mb={2} />
                <Text fontWeight="700" color="#334155" fontSize="13px" mb={1}>
                  No Questions Queried Yet
                </Text>
                <Text fontSize="11px" color="#64748B" maxW="380px" mx="auto">
                  Type a subject above (e.g. "English", "Mathematics") and click "Query Questions" to inspect and select questions from the repository.
                </Text>
              </Box>
            ) : (
              <Box mb={5}>
                {/* Search & Selection Controls Header */}
                <Flex
                  justify="space-between"
                  align="center"
                  bg="#0F172A"
                  color="white"
                  p={3.5}
                  borderRadius="16px"
                  mb={3}
                  gap={3}
                  wrap="wrap"
                >
                  <HStack spacing={2}>
                    <Icon as={FaListOl} color="#818CF8" boxSize={3.5} />
                    <Text fontSize="13px" fontWeight="bold">
                      {questions.length} Items Found
                    </Text>
                    <Badge
                      bg="rgba(99, 102, 241, 0.3)"
                      color="#C7D2FE"
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      fontSize="10px"
                    >
                      {selectedQuestionsIds.length} Selected
                    </Badge>
                  </HStack>

                  <HStack spacing={2}>
                    <Input
                      placeholder="Filter questions..."
                      size="xs"
                      w="140px"
                      bg="rgba(255, 255, 255, 0.1)"
                      borderColor="rgba(255, 255, 255, 0.2)"
                      color="white"
                      _placeholder={{ color: "gray.400" }}
                      borderRadius="md"
                      value={filterQuery}
                      onChange={(e) => setFilterQuery(e.target.value)}
                    />
                    {selectedQuestionsIds.length > 0 && (
                      <Button
                        size="xs"
                        variant="subtle"
                        bg="rgba(239, 68, 68, 0.25)"
                        color="#FCA5A5"
                        _hover={{ bg: "rgba(239, 68, 68, 0.35)" }}
                        borderRadius="md"
                        onClick={deselectAllQuestions}
                      >
                        Deselect All
                      </Button>
                    )}
                    <Button
                      size="xs"
                      variant="outline"
                      color="white"
                      borderColor="rgba(255, 255, 255, 0.25)"
                      _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                      borderRadius="md"
                      onClick={selectAllQuestions}
                    >
                      Select All
                    </Button>
                  </HStack>
                </Flex>

                {/* Questions Scrollable Deck */}
                <VStack spacing={2.5} align="stretch" maxH="360px" overflowY="auto" pr={1}>
                  {displayedQuestions.map((q, idx) => {
                    const isSelected = selectedIdSet.has(q.id);
                    return (
                      <Box
                        key={q.id || idx}
                        p={3.5}
                        borderRadius="14px"
                        border="1px solid"
                        borderColor={isSelected ? "#6366F1" : "#E2E8F0"}
                        bg={isSelected ? "rgba(99, 102, 241, 0.04)" : "#FFFFFF"}
                        cursor="pointer"
                        onClick={() => toggleSelectQuestion(q)}
                        transition="all 0.1s ease"
                        _hover={{ borderColor: "#818CF8", bg: "rgba(99, 102, 241, 0.02)" }}
                      >
                        <Flex gap={3} align="flex-start">
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
                            <HStack spacing={2} mb={1}>
                              <Badge
                                bg="#F1F5F9"
                                color="#475569"
                                fontSize="9px"
                                fontWeight="bold"
                                px={1.5}
                                borderRadius="md"
                              >
                                Q{idx + 1}
                              </Badge>
                              {q.subject && (
                                <Badge
                                  bg="rgba(79, 70, 229, 0.1)"
                                  color="#4F46E5"
                                  fontSize="9px"
                                  borderRadius="full"
                                  px={2}
                                  textTransform="capitalize"
                                >
                                  {q.subject}
                                </Badge>
                              )}
                            </HStack>

                            <Text fontSize="12px" fontWeight="600" color="#0F172A" mb={1.5}>
                              {q.questionText || q.question}
                            </Text>

                            {q.options && (
                              <SimpleGrid columns={{ base: 1, sm: 2 }} gap={1}>
                                {Object.entries(q.options).map(([key, value]) => (
                                  <Text
                                    key={key}
                                    fontSize="10px"
                                    color="#64748B"
                                    bg="#F8FAFC"
                                    p={1}
                                    borderRadius="md"
                                    border="1px solid #F1F5F9"
                                  >
                                    <strong style={{ color: "#334155" }}>{key.toUpperCase()}:</strong> {value}
                                  </Text>
                                ))}
                              </SimpleGrid>
                            )}
                          </Box>
                        </Flex>
                      </Box>
                    );
                  })}
                </VStack>
              </Box>
            )}

            {/* Section Save Toolbar */}
            <Flex justify="flex-end" gap={2.5}>
              {editingSectionIndex !== null && (
                <Button
                  variant="outline"
                  borderRadius="xl"
                  h="40px"
                  fontSize="12px"
                  onClick={() => {
                    setEditingSectionIndex(null);
                    setSubject("");
                    setYear("");
                    setQuestions([]);
                    setSelectedQuestionsIds([]);
                  }}
                >
                  Cancel Edit
                </Button>
              )}

              <Button
                bg="#059669"
                color="white"
                borderRadius="xl"
                h="40px"
                px={5}
                fontWeight="700"
                fontSize="12px"
                _hover={{ bg: "#047857" }}
                onClick={saveSection}
                isDisabled={!subject.trim() || selectedQuestionsIds.length === 0}
                leftIcon={<Icon as={FaCheckCircle} />}
                boxShadow="0 4px 12px rgba(5, 150, 105, 0.2)"
              >
                {editingSectionIndex !== null
                  ? "Update Section"
                  : `Add Section (${selectedQuestionsIds.length} Questions)`}
              </Button>
            </Flex>
          </Box>
        </Box>

        {/* ================= RIGHT COLUMN: LIVE BLUEPRINT & SECTIONS ROSTER (5 of 12 cols) ================= */}
        <Box
          gridColumn={{ base: "1", xl: "span 5" }}
          position={{ base: "static", xl: "sticky" }}
          top="84px"
        >
          {/* Blueprint Card */}
          <Box
            bg="white"
            p={6}
            borderRadius="24px"
            border="1px solid #E2E8F0"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.04)"
            mb={4}
          >
            {/* Header & Live Summary */}
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontSize="15px" fontWeight="800" color="#0F172A">
                Live Exam Blueprint
              </Text>
              <Badge
                bg="rgba(99, 102, 241, 0.12)"
                color="#4F46E5"
                px={2.5}
                py={0.5}
                borderRadius="full"
                fontSize="11px"
                fontWeight="bold"
              >
                {sections.length} {sections.length === 1 ? "Section" : "Sections"}
              </Badge>
            </Flex>

            {/* Live Metrics Grid */}
            <SimpleGrid columns={3} gap={2} mb={5}>
              <Box
                bg="#F8FAFC"
                p={2.5}
                borderRadius="xl"
                border="1px solid #E2E8F0"
                textAlign="center"
              >
                <Text fontSize="10px" color="#64748B" fontWeight="medium">Questions</Text>
                <Text fontSize="16px" fontWeight="800" color="#4F46E5">
                  {totalExamQuestions}
                </Text>
              </Box>
              <Box
                bg="#F8FAFC"
                p={2.5}
                borderRadius="xl"
                border="1px solid #E2E8F0"
                textAlign="center"
              >
                <Text fontSize="10px" color="#64748B" fontWeight="medium">Duration</Text>
                <Text fontSize="16px" fontWeight="800" color="#0F172A">
                  {examForm.duration ? `${examForm.duration}m` : "—"}
                </Text>
              </Box>
              <Box
                bg="#F8FAFC"
                p={2.5}
                borderRadius="xl"
                border="1px solid #E2E8F0"
                textAlign="center"
              >
                <Text fontSize="10px" color="#64748B" fontWeight="medium">Total Score</Text>
                <Text fontSize="16px" fontWeight="800" color="#059669">
                  {examForm.totalMarks || "—"}
                </Text>
              </Box>
            </SimpleGrid>

            {/* Configured Sections List */}
            <Text fontSize="12px" fontWeight="700" color="#334155" mb={2}>
              Assembled Sections Roster:
            </Text>

            {sections.length === 0 ? (
              <Box
                p={6}
                borderRadius="16px"
                border="2px dashed #E2E8F0"
                bg="#F8FAFC"
                textAlign="center"
                mb={5}
              >
                <Icon as={FaRegLightbulb} color="#94A3B8" boxSize={5} mb={2} />
                <Text fontSize="12px" fontWeight="bold" color="#334155" mb={0.5}>
                  No Sections Attached Yet
                </Text>
                <Text fontSize="11px" color="#64748B">
                  Use the left section builder to fetch questions and click "Add Section".
                </Text>
              </Box>
            ) : (
              <VStack spacing={2.5} align="stretch" mb={5} maxH="380px" overflowY="auto">
                {sections.map((sec, idx) => {
                  const isExpanded = expandedSectionIdx === idx;
                  return (
                    <Box
                      key={idx}
                      borderRadius="16px"
                      border="1px solid #E2E8F0"
                      bg="#FFFFFF"
                      overflow="hidden"
                      boxShadow="0 1px 3px rgba(0,0,0,0.03)"
                    >
                      <Flex
                        p={3}
                        justify="space-between"
                        align="center"
                        bg="#F8FAFC"
                        cursor="pointer"
                        onClick={() =>
                          setExpandedSectionIdx(isExpanded ? null : idx)
                        }
                      >
                        <HStack spacing={2}>
                          <Badge
                            bg="#0F172A"
                            color="white"
                            borderRadius="md"
                            px={2}
                            py={0.5}
                            fontSize="10px"
                            fontWeight="bold"
                          >
                            #{idx + 1}
                          </Badge>
                          <Box>
                            <Text
                              fontSize="13px"
                              fontWeight="700"
                              color="#0F172A"
                              textTransform="capitalize"
                              lineHeight="1.2"
                            >
                              {sec.section}
                            </Text>
                            <Text fontSize="10px" color="#64748B">
                              {sec.questions.length} Qs {sec.year && `• ${sec.year}`}
                            </Text>
                          </Box>
                        </HStack>

                        <HStack spacing={1} onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="2xs"
                            variant="ghost"
                            color="#4F46E5"
                            onClick={() => editSection(idx)}
                            px={1.5}
                            title="Edit Section"
                          >
                            <Icon as={FaEdit} />
                          </Button>
                          <Button
                            size="2xs"
                            variant="ghost"
                            color="#DC2626"
                            onClick={() => removeSection(idx)}
                            px={1.5}
                            title="Remove Section"
                          >
                            <Icon as={FaTrash} />
                          </Button>
                          <Flex
                            w="22px"
                            h="22px"
                            borderRadius="md"
                            align="center"
                            justify="center"
                            cursor="pointer"
                            onClick={() =>
                              setExpandedSectionIdx(isExpanded ? null : idx)
                            }
                          >
                            <Icon
                              as={isExpanded ? FaChevronUp : FaChevronDown}
                              color="#64748B"
                              boxSize={2.5}
                            />
                          </Flex>
                        </HStack>
                      </Flex>

                      {/* Expandable Preview */}
                      {isExpanded && (
                        <Box p={3} borderTop="1px solid #F1F5F9" bg="white">
                          <VStack spacing={1.5} align="stretch" maxH="180px" overflowY="auto">
                            {sec.questions.map((q, qIdx) => (
                              <Box
                                key={q.id || qIdx}
                                p={2}
                                borderRadius="8px"
                                bg="#F8FAFC"
                                border="1px solid #F1F5F9"
                              >
                                <Text fontSize="11px" fontWeight="600" color="#1E293B" noOfLines={2}>
                                  {qIdx + 1}. {q.questionText || q.question}
                                </Text>
                              </Box>
                            ))}
                          </VStack>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </VStack>
            )}

            {/* Readyness Checklist */}
            <Box
              p={3.5}
              borderRadius="16px"
              bg="#F8FAFC"
              border="1px solid #E2E8F0"
              mb={4}
            >
              <Text fontSize="11px" fontWeight="700" color="#334155" mb={2}>
                Assessment Launch Readiness:
              </Text>
              <VStack spacing={1.5} align="stretch">
                <HStack spacing={2} fontSize="11px">
                  <Icon
                    as={hasTitle ? FaCheck : FaTimes}
                    color={hasTitle ? "#059669" : "#DC2626"}
                    boxSize={2.5}
                  />
                  <Text color={hasTitle ? "#0F172A" : "#64748B"}>
                    Exam Title Specified
                  </Text>
                </HStack>
                <HStack spacing={2} fontSize="11px">
                  <Icon
                    as={hasDuration && hasMarks ? FaCheck : FaTimes}
                    color={hasDuration && hasMarks ? "#059669" : "#DC2626"}
                    boxSize={2.5}
                  />
                  <Text color={hasDuration && hasMarks ? "#0F172A" : "#64748B"}>
                    Duration & Total Marks Configured
                  </Text>
                </HStack>
                <HStack spacing={2} fontSize="11px">
                  <Icon
                    as={hasSections ? FaCheck : FaTimes}
                    color={hasSections ? "#059669" : "#DC2626"}
                    boxSize={2.5}
                  />
                  <Text color={hasSections ? "#0F172A" : "#64748B"}>
                    At Least 1 Section Added ({sections.length} Ready)
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Primary Action Button in Right Rail */}
            <Button
              w="100%"
              h="46px"
              bg="linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
              color="white"
              borderRadius="xl"
              fontWeight="bold"
              fontSize="13px"
              boxShadow="0 4px 16px rgba(99, 102, 241, 0.35)"
              _hover={{
                transform: "translateY(-1px)",
                boxShadow: "0 6px 20px rgba(99, 102, 241, 0.45)",
              }}
              onClick={handleCreateExam}
              isDisabled={!isReadyToProceed}
              rightIcon={<Icon as={FaArrowRight} />}
            >
              Configure Schedule & Publish →
            </Button>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
