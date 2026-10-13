import {
  Box,
  Flex,
  Text,
  Input,
  Field,
  Button,
  Checkbox,
  Spinner,
  Badge,
  HStack,
  VStack,
  Icon,
  SimpleGrid,
} from "@chakra-ui/react";
import { STORAGE_KEY } from "../../../libs/helper";
import { useNavigate, useParams } from "react-router-dom";
import { toaster } from "../../ui/toaster";
import { useEffect, useState, useMemo } from "react";
import { getQuestions, getExamById } from "../../../api-endpoint/exam/exams";
import DashboardLayout from "../../../constants/dashboardlayout";
import { isTeacherQuestion } from "./addExam";
import SearchableSubjectSelect from "../../ui/SearchableSubjectSelect";
import {
  FaLayerGroup,
  FaArrowLeft,
  FaArrowRight,
  FaClock,
  FaAward,
  FaBookOpen,
  FaTrash,
  FaEdit,
  FaCheck,
  FaRedo,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

export default function EditExamStructure() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState("Mathematics");
  const [customSubject, setCustomSubject] = useState("");
  const [year, setYear] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all"); // "all" | "teacher" | "api"
  const [selectedQuestionsIds, setSelectedQuestionsIds] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [sections, setSections] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingExam, setLoadingExam] = useState(false);

  // Full exam state including publication & proctoring metadata
  const [examForm, setExamForm] = useState({
    examTitle: "",
    description: "",
    duration: 60,
    totalMarks: 100,
    startDate: "",
    endDate: "",
    negativeMarking: false,
    negativeMarkingPenalty: 0.25,
    enableBiometricCheckin: false,
    examCode: "",
  });
  const [editingSectionIndex, setEditingSectionIndex] = useState(null);

  useEffect(() => {
    if (!examId) return;

    const fetchExam = async () => {
      setLoadingExam(true);
      try {
        const res = await getExamById(examId);

        if (res.message === "Exam fetched successfully" && res.exam) {
          const ex = res.exam;
          setExamForm({
            examTitle: ex.title || "",
            description: ex.description || "",
            duration: ex.duration || 60,
            totalMarks: ex.totalMarks || 100,
            startDate: ex.startDate || "",
            endDate: ex.endDate || "",
            negativeMarking: Boolean(ex.negativeMarking),
            negativeMarkingPenalty: ex.negativeMarkingPenalty ?? 0.25,
            enableBiometricCheckin: Boolean(ex.enableBiometricCheckin),
            examCode: ex.examCode || "",
          });
          setSections(ex.sections || []);
        } else {
          toaster.error({ title: "Failed to fetch examination structure" });
        }
      } catch (error) {
        toaster.error({ title: "Error fetching examination details" });
      } finally {
        setLoadingExam(false);
      }
    };

    fetchExam();
  }, [examId]);

  const effectiveSubject =
    subject === "Other / Custom Subject"
      ? customSubject.trim()
      : (subject || "").trim();

  const selectedTeacherCount = useMemo(() => {
    return selectedQuestionsIds.filter((q) => isTeacherQuestion(q)).length;
  }, [selectedQuestionsIds]);

  const selectedPlatformCount = useMemo(() => {
    return selectedQuestionsIds.filter((q) => !isTeacherQuestion(q)).length;
  }, [selectedQuestionsIds]);

  const totalQuestionsCount = useMemo(() => {
    return sections.reduce((acc, s) => acc + (s.questions?.length || 0), 0);
  }, [sections]);

  const fetchQuestionsList = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!effectiveSubject) {
      toaster.warning({
        title: "Please select or specify a subject",
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

      if (res.success && res.data && Array.isArray(res.data)) {
        setQuestions(res.data);
        const sourceLabel =
          sourceFilter === "teacher"
            ? "My Bank"
            : sourceFilter === "api"
            ? "Platform Bank"
            : "All Question Banks";
        toaster.success({
          title: `Found ${res.data.length} questions from ${sourceLabel} for ${effectiveSubject}!`,
        });
      } else {
        setQuestions([]);
        toaster.warning({
          title: res.message || "No questions found for this query",
        });
      }
    } catch (error) {
      setQuestions([]);
      toaster.error({
        title: "Something went wrong while fetching questions.",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectQuestion = (question, checked) => {
    const isChecked = checked?.checked ?? checked;
    setSelectedQuestionsIds((prev) =>
      isChecked
        ? [...prev, question]
        : prev.filter((q) => q.id !== question.id)
    );
  };

  const handleSelectAll = () => {
    if (questions.length === 0) return;
    const poolIds = new Set(questions.map((q) => q.id));
    const allSelected = questions.every((q) =>
      selectedQuestionsIds.some((item) => item.id === q.id)
    );

    if (allSelected) {
      setSelectedQuestionsIds((prev) =>
        prev.filter((item) => !poolIds.has(item.id))
      );
    } else {
      setSelectedQuestionsIds((prev) => {
        const currentIds = new Set(prev.map((item) => item.id));
        const additions = questions.filter((q) => !currentIds.has(q.id));
        return [...prev, ...additions];
      });
    }
  };

  const saveSection = () => {
    const finalSubject =
      subject === "Other / Custom Subject"
        ? customSubject.trim()
        : (subject || "").trim();

    if (!finalSubject) {
      toaster.error({
        title: "Please specify a subject name for this section",
      });
      return;
    }

    if (selectedQuestionsIds.length === 0) {
      toaster.warning({
        title: "Please select at least one question for this section",
      });
      return;
    }

    const newSection = {
      section: finalSubject,
      year: year?.trim() || null,
      questions: selectedQuestionsIds,
    };

    if (editingSectionIndex !== null) {
      setSections((prev) =>
        prev.map((sec, i) => (i === editingSectionIndex ? newSection : sec))
      );
      toaster.success({ title: `Section "${finalSubject}" updated!` });
    } else {
      setSections((prev) => [...prev, newSection]);
      toaster.success({
        title: `Section "${finalSubject}" added with ${selectedQuestionsIds.length} questions!`,
      });
    }

    setSubject("Mathematics");
    setCustomSubject("");
    setYear("");
    setQuestions([]);
    setSelectedQuestionsIds([]);
    setEditingSectionIndex(null);
  };

  const removeSection = (index) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
    toaster.info({ title: "Section removed" });
  };

  const editSection = (index) => {
    const section = sections[index];
    setSubject(section.section || "Mathematics");
    setCustomSubject("");
    setYear(section.year || "");
    setQuestions(section.questions || []);
    setSelectedQuestionsIds(section.questions || []);
    setEditingSectionIndex(index);
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  const toggleExpandSection = (index) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleNext = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!examForm.examTitle.trim()) {
      toaster.error({ title: "Exam title is required" });
      return;
    }
    if (!examForm.duration || Number(examForm.duration) <= 0) {
      toaster.error({ title: "Valid duration in minutes is required" });
      return;
    }
    if (!examForm.totalMarks || Number(examForm.totalMarks) <= 0) {
      toaster.error({ title: "Total marks is required" });
      return;
    }
    if (sections.length === 0) {
      toaster.error({ title: "Exam must contain at least one section" });
      return;
    }

    const draft = {
      ...examForm,
      examTitle: examForm.examTitle,
      duration: Number(examForm.duration),
      totalMarks: Number(examForm.totalMarks),
      sections,
    };

    localStorage.setItem("EDIT_EXAM_DRAFT", JSON.stringify(draft));
    toaster.success({
      title: "Structure saved! Proceeding to scheduling & publication...",
    });

    navigate(`/teacher/exams/edit/${examId}/draft`);
  };

  if (loadingExam) {
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
            Loading examination structure...
          </Text>
        </Flex>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box
        p={{ base: 4, md: 8 }}
        bg="#F8FAFC"
        w={{ base: "100%", lg: "calc(100% - 240px)" }}
        ml={{ base: 0, lg: "240px" }}
        mt="84px"
        minH="calc(100vh - 84px)"
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
                    onClick={() => navigate("/teacher/exams")}
                    px={2}
                    h="26px"
                    borderRadius="md"
                    fontSize="11px"
                  >
                    All Exams
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
                    STEP 1 OF 2: STRUCTURE & SECTIONS
                  </Badge>
                  {examForm.examCode && (
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
                      CODE: {examForm.examCode}
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
                  Editing: {examForm.examTitle || "Examination Structure"}
                </Text>
                <Text fontSize="13px" color="#94A3B8" maxW="640px">
                  Update general test metadata, adjust subject sections, or query question banks to add and remove questions.
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
                  <Text fontSize="lg" fontWeight="bold" color="white">{sections.length}</Text>
                </VStack>
                <Box h="28px" w="1px" bg="rgba(255, 255, 255, 0.15)" />
                <VStack spacing={0} align="center" px={2}>
                  <Text fontSize="11px" color="#94A3B8">Questions</Text>
                  <Text fontSize="lg" fontWeight="bold" color="#818CF8">{totalQuestionsCount}</Text>
                </VStack>
                <Box h="28px" w="1px" bg="rgba(255, 255, 255, 0.15)" />
                <VStack spacing={0} align="center" px={2}>
                  <Text fontSize="11px" color="#94A3B8">Duration</Text>
                  <Text fontSize="lg" fontWeight="bold" color="#34D399">{examForm.duration}m</Text>
                </VStack>
              </HStack>
            </Flex>
          </Box>

          {/* Exam Overview Parameters */}
          <Box
            p={{ base: 5, md: 6 }}
            bg="white"
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
                bg="purple.50"
                color="#7C3AED"
                align="center"
                justify="center"
              >
                <Icon as={FaBookOpen} boxSize={4} />
              </Flex>
              <Box>
                <Text fontSize="15px" fontWeight="800" color="#0F172A">
                  General Assessment Parameters
                </Text>
                <Text fontSize="12px" color="#64748B">
                  Define the primary test title, allotted duration, and scoring ceiling.
                </Text>
              </Box>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
              <Field.Root required>
                <Field.Label fontSize="12px" fontWeight="bold" color="#334155">
                  Exam Title <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  placeholder="e.g. WAEC 2024 Mock Examination"
                  value={examForm.examTitle}
                  onChange={(e) =>
                    setExamForm({ ...examForm, examTitle: e.target.value })
                  }
                  borderRadius="xl"
                  h="44px"
                  borderColor="#CBD5E1"
                  _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label fontSize="12px" fontWeight="bold" color="#334155">
                  Duration (Minutes) <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  type="number"
                  placeholder="e.g. 60"
                  value={examForm.duration}
                  onChange={(e) =>
                    setExamForm({ ...examForm, duration: e.target.value })
                  }
                  borderRadius="xl"
                  h="44px"
                  borderColor="#CBD5E1"
                  _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label fontSize="12px" fontWeight="bold" color="#334155">
                  Total Marks <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  type="number"
                  placeholder="e.g. 100"
                  value={examForm.totalMarks}
                  onChange={(e) =>
                    setExamForm({ ...examForm, totalMarks: e.target.value })
                  }
                  borderRadius="xl"
                  h="44px"
                  borderColor="#CBD5E1"
                  _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
                />
              </Field.Root>
            </SimpleGrid>
          </Box>

          {/* Section Builder */}
          <Box
            p={{ base: 5, md: 6 }}
            bg="white"
            borderRadius="24px"
            border="1px solid #E2E8F0"
            boxShadow="0 2px 10px rgba(0, 0, 0, 0.02)"
            mb={6}
          >
            <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
              <Flex align="center" gap={2.5}>
                <Flex
                  w="32px"
                  h="32px"
                  borderRadius="lg"
                  bg="purple.50"
                  color="#7C3AED"
                  align="center"
                  justify="center"
                >
                  <Icon as={FaLayerGroup} boxSize={4} />
                </Flex>
                <Box>
                  <Text fontSize="15px" fontWeight="800" color="#0F172A">
                    {editingSectionIndex !== null
                      ? `Updating Section #${editingSectionIndex + 1}`
                      : "Add / Curate Question Section"}
                  </Text>
                  <Text fontSize="12px" color="#64748B">
                    Query the Question Bank repository, pick relevant questions, and assign them to a subject section.
                  </Text>
                </Box>
              </Flex>

              {editingSectionIndex !== null && (
                <Button
                  size="xs"
                  variant="outline"
                  borderColor="#CBD5E1"
                  onClick={() => {
                    setEditingSectionIndex(null);
                    setSubject("Mathematics");
                    setQuestions([]);
                    setSelectedQuestionsIds([]);
                  }}
                >
                  Cancel Edit Mode
                </Button>
              )}
            </Flex>

            {/* Source Bank Selection */}
            <Box mb={4} p={3.5} bg="#F8FAFC" borderRadius="xl" border="1px solid #F1F5F9">
              <Text fontSize="11px" fontWeight="bold" color="#475569" mb={2} textTransform="uppercase">
                Question Bank Source Filter:
              </Text>
              <HStack spacing={2} wrap="wrap">
                {[
                  { key: "all", label: "All Question Banks" },
                  { key: "teacher", label: "🎓 My Bank (Teacher Uploaded)" },
                  { key: "api", label: "🌐 Platform General Bank" },
                ].map((src) => {
                  const isActive = sourceFilter === src.key;
                  return (
                    <Button
                      key={src.key}
                      size="xs"
                      h="32px"
                      px={3.5}
                      borderRadius="full"
                      variant={isActive ? "solid" : "outline"}
                      bg={isActive ? "#0F172A" : "white"}
                      color={isActive ? "white" : "#475569"}
                      borderColor={isActive ? "#0F172A" : "#CBD5E1"}
                      fontWeight="bold"
                      fontSize="11px"
                      onClick={() => setSourceFilter(src.key)}
                      _hover={{ bg: isActive ? "#1E293B" : "#F1F5F9" }}
                    >
                      {src.label}
                    </Button>
                  );
                })}
              </HStack>
            </Box>

            {/* Query Controls */}
            <Flex gap={3} mb={4} wrap="wrap" align="flex-end">
              <Field.Root required w={{ base: "100%", md: "260px" }}>
                <Field.Label fontSize="12px" fontWeight="bold" color="#475569">
                  Subject <Field.RequiredIndicator />
                </Field.Label>
                <SearchableSubjectSelect
                  value={subject}
                  onChange={(newSubj) => {
                    setSubject(newSubj);
                    setCustomSubject("");
                  }}
                  placeholder="Search subject (e.g. Mathematics)..."
                  allowCustom={true}
                />
              </Field.Root>

              <Field.Root w={{ base: "100%", md: "150px" }}>
                <Field.Label fontSize="12px" fontWeight="bold" color="#475569">
                  Exam Year (optional)
                </Field.Label>
                <Input
                  placeholder="e.g. 2024"
                  value={year}
                  bg="white"
                  h="42px"
                  borderRadius="xl"
                  borderColor="#CBD5E1"
                  _focus={{ borderColor: "#6366F1" }}
                  onChange={(e) => setYear(e.target.value)}
                />
              </Field.Root>

              <Button
                onClick={fetchQuestionsList}
                loading={loading}
                h="42px"
                px={5}
                bg="#0F172A"
                color="white"
                fontSize="12px"
                fontWeight="bold"
                borderRadius="xl"
                _hover={{ bg: "#1E293B" }}
              >
                Fetch Questions
              </Button>

              <Button
                onClick={handleSelectAll}
                variant="outline"
                borderColor="#CBD5E1"
                h="42px"
                fontSize="12px"
                borderRadius="xl"
                isDisabled={questions.length === 0}
              >
                {questions.length > 0 &&
                questions.every((q) =>
                  selectedQuestionsIds.some((item) => item.id === q.id)
                )
                  ? "Deselect Page"
                  : "Select All Page"}
              </Button>

              <Button
                bg="#059669"
                color="white"
                h="42px"
                px={5}
                fontSize="12px"
                fontWeight="bold"
                borderRadius="xl"
                _hover={{ bg: "#047857" }}
                onClick={saveSection}
                ml={{ base: 0, md: "auto" }}
                isDisabled={!effectiveSubject || selectedQuestionsIds.length === 0}
              >
                {editingSectionIndex !== null
                  ? "Update Section"
                  : `Save Section (${selectedQuestionsIds.length} Qs)`}
              </Button>
            </Flex>

            {/* Live Badges Counter */}
            <HStack spacing={2} pt={3} borderTop="1px dashed #E2E8F0">
              <Text fontSize="12px" fontWeight="bold" color="#334155">
                Current Section Pick: {selectedQuestionsIds.length} selected
              </Text>
              <Badge
                bg="purple.100"
                color="purple.800"
                fontSize="10px"
                fontWeight="bold"
                px={2}
                py={0.5}
                borderRadius="full"
              >
                🎓 {selectedTeacherCount} My Bank
              </Badge>
              <Badge
                bg="blue.100"
                color="blue.800"
                fontSize="10px"
                fontWeight="bold"
                px={2}
                py={0.5}
                borderRadius="full"
              >
                🌐 {selectedPlatformCount} Platform Bank
              </Badge>
            </HStack>

            {/* Questions Pool List */}
            {questions.length > 0 && (
              <Box mt={5} pt={4} borderTop="1px solid #E2E8F0">
                <Flex justify="space-between" align="center" mb={3}>
                  <Text fontSize="13px" fontWeight="bold" color="#0F172A">
                    Available Question Bank Pool ({questions.length})
                  </Text>
                  <Badge bg="#0F172A" color="white" px={2.5} py={1} borderRadius="full" fontSize="11px">
                    {selectedQuestionsIds.length} Picked for Section
                  </Badge>
                </Flex>

                <VStack spacing={2.5} align="stretch" maxH="380px" overflowY="auto" pr={1}>
                  {questions.map((q) => {
                    const isTeacher = isTeacherQuestion(q);
                    const isChecked = selectedQuestionsIds.some((item) => item.id === q.id);
                    return (
                      <Box
                        key={q.id}
                        p={3}
                        borderRadius="xl"
                        border="1px solid"
                        borderColor={isChecked ? "#6366F1" : "#E2E8F0"}
                        bg={isChecked ? "#EEF2FF" : "#FAFAFA"}
                        transition="all 0.15s ease"
                      >
                        <Checkbox.Root
                          checked={isChecked}
                          onCheckedChange={(checked) => toggleSelectQuestion(q, checked)}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label width="100%">
                            <VStack align="flex-start" spacing={1.5} ml={2}>
                              <HStack spacing={2}>
                                <Badge
                                  fontSize="9px"
                                  px={2}
                                  py={0.5}
                                  borderRadius="full"
                                  bg={isTeacher ? "purple.100" : "blue.100"}
                                  color={isTeacher ? "purple.800" : "blue.800"}
                                  fontWeight="bold"
                                >
                                  {isTeacher ? "🎓 My Bank" : "🌐 Platform Bank"}
                                </Badge>
                                {q.topic && (
                                  <Badge fontSize="9px" px={2} py={0.5} borderRadius="full" bg="gray.100" color="gray.700">
                                    {q.topic}
                                  </Badge>
                                )}
                              </HStack>
                              <Text fontSize="13px" fontWeight="600" color="#0F172A">
                                {q.questionText || q.question}
                              </Text>
                            </VStack>
                          </Checkbox.Label>
                        </Checkbox.Root>
                      </Box>
                    );
                  })}
                </VStack>
              </Box>
            )}
          </Box>

          {/* Saved Sections in Exam */}
          <Box
            p={{ base: 5, md: 6 }}
            bg="white"
            borderRadius="24px"
            border="1px solid #E2E8F0"
            boxShadow="0 2px 10px rgba(0, 0, 0, 0.02)"
            mb={8}
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Box>
                <Text fontSize="16px" fontWeight="800" color="#0F172A">
                  Assembled Exam Sections ({sections.length})
                </Text>
                <Text fontSize="12px" color="#64748B">
                  Total questions across sections:{" "}
                  <strong style={{ color: "#0F172A" }}>{totalQuestionsCount}</strong>
                </Text>
              </Box>
            </Flex>

            {sections.length === 0 ? (
              <Flex direction="column" align="center" justify="center" py={8} color="#64748B">
                <Icon as={FaLayerGroup} boxSize={8} color="#CBD5E1" mb={2} />
                <Text fontSize="14px" fontWeight="600">No sections added yet</Text>
                <Text fontSize="12px">Use the builder above to query question banks and save sections.</Text>
              </Flex>
            ) : (
              <VStack spacing={3} align="stretch">
                {sections.map((sec, idx) => {
                  const isExpanded = Boolean(expandedSections[idx]);
                  const secQuestions = sec.questions || [];
                  const teacherQs = secQuestions.filter(isTeacherQuestion).length;
                  const platformQs = secQuestions.length - teacherQs;

                  return (
                    <Box
                      key={idx}
                      borderRadius="16px"
                      border="1px solid #E2E8F0"
                      bg="white"
                      overflow="hidden"
                      transition="all 0.15s ease"
                    >
                      <Flex
                        p={4}
                        justify="space-between"
                        align="center"
                        bg="#F8FAFC"
                        borderBottom={isExpanded ? "1px solid #E2E8F0" : "none"}
                        cursor="pointer"
                        onClick={() => toggleExpandSection(idx)}
                      >
                        <HStack spacing={3}>
                          <Flex
                            w="28px"
                            h="28px"
                            borderRadius="md"
                            bg="#0F172A"
                            color="white"
                            fontSize="11px"
                            fontWeight="bold"
                            align="center"
                            justify="center"
                          >
                            {idx + 1}
                          </Flex>
                          <Box>
                            <Text fontSize="14px" fontWeight="800" color="#0F172A">
                              {sec.section}
                            </Text>
                            <HStack spacing={2} mt={0.5}>
                              <Text fontSize="11px" color="#64748B">
                                {secQuestions.length} Questions
                              </Text>
                              <Text color="#CBD5E1">•</Text>
                              <Badge fontSize="10px" bg="purple.50" color="#7C3AED" px={1.5} py={0.5} borderRadius="md">
                                {teacherQs} My Bank
                              </Badge>
                              <Badge fontSize="10px" bg="blue.50" color="#2563EB" px={1.5} py={0.5} borderRadius="md">
                                {platformQs} Platform
                              </Badge>
                            </HStack>
                          </Box>
                        </HStack>

                        <HStack spacing={2} onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="xs"
                            bg="purple.50"
                            color="#7C3AED"
                            border="1px solid #DDD6FE"
                            borderRadius="lg"
                            fontWeight="bold"
                            leftIcon={<Icon as={FaEdit} boxSize={2.5} />}
                            onClick={() => editSection(idx)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            color="red.600"
                            _hover={{ bg: "red.50" }}
                            borderRadius="lg"
                            onClick={() => removeSection(idx)}
                          >
                            <Icon as={FaTrash} boxSize={3} />
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => toggleExpandSection(idx)}
                          >
                            <Icon as={isExpanded ? FaChevronUp : FaChevronDown} boxSize={3} />
                          </Button>
                        </HStack>
                      </Flex>

                      {/* Expanded Section Questions Preview */}
                      {isExpanded && (
                        <Box p={4} bg="white">
                          <VStack spacing={2.5} align="stretch">
                            {secQuestions.map((q, qIdx) => (
                              <Box
                                key={q.id || qIdx}
                                p={3}
                                borderRadius="xl"
                                bg="#FAFAFA"
                                border="1px solid #F1F5F9"
                              >
                                <HStack spacing={2} mb={1}>
                                  <Badge fontSize="9px" px={1.5} py={0.5} borderRadius="md" bg="#0F172A" color="white">
                                    Q{qIdx + 1}
                                  </Badge>
                                  <Badge
                                    fontSize="9px"
                                    px={1.5}
                                    py={0.5}
                                    borderRadius="md"
                                    bg={isTeacherQuestion(q) ? "purple.100" : "blue.100"}
                                    color={isTeacherQuestion(q) ? "purple.800" : "blue.800"}
                                  >
                                    {isTeacherQuestion(q) ? "My Bank" : "Platform"}
                                  </Badge>
                                  <Text fontSize="12px" fontWeight="700" color="#0F172A">
                                    {q.questionText || q.question}
                                  </Text>
                                </HStack>

                                {/* Options breakdown if present */}
                                {q.options && typeof q.options === "object" && (
                                  <HStack spacing={2} wrap="wrap" mt={1.5} pl={6}>
                                    {Object.entries(q.options).map(([k, v]) => (
                                      <Badge
                                        key={k}
                                        fontSize="10px"
                                        bg="white"
                                        border="1px solid #CBD5E1"
                                        color="#475569"
                                        px={2}
                                        py={0.5}
                                        borderRadius="md"
                                      >
                                        <strong>{k.toUpperCase()}:</strong> {v}
                                      </Badge>
                                    ))}
                                  </HStack>
                                )}
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
          </Box>

          {/* Action Footer */}
          <Flex justify="space-between" align="center" pt={4} borderTop="1px solid #E2E8F0">
            <Button
              variant="outline"
              borderColor="#CBD5E1"
              borderRadius="xl"
              h="44px"
              px={5}
              fontSize="13px"
              color="#64748B"
              onClick={() => navigate("/teacher/exams")}
            >
              Cancel & Return to Exams
            </Button>

            <Button
              h="44px"
              px={6}
              bg="linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
              color="white"
              borderRadius="xl"
              fontWeight="bold"
              fontSize="13px"
              boxShadow="0 4px 14px rgba(99, 102, 241, 0.3)"
              _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(99, 102, 241, 0.4)" }}
              onClick={handleNext}
              rightIcon={<Icon as={FaArrowRight} />}
              isDisabled={sections.length === 0}
            >
              Continue to Schedule & Settings →
            </Button>
          </Flex>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
