import {
  Box,
  Flex,
  Text,
  Input,
  Field,
  Button,
  Checkbox,
  Badge,
  HStack,
  VStack,
  Icon,
  NativeSelect,
} from "@chakra-ui/react";
import { useEffect, useState, useMemo } from "react";
import { getQuestions } from "../../../api-endpoint/exam/exams";
import { toaster } from "../../../components/ui/toaster";
import { useNavigate } from "react-router-dom";
import { STORAGE_KEY } from "../../../libs/helper";
import {
  FaLayerGroup,
  FaSearch,
  FaCheckCircle,
  FaTrash,
  FaEdit,
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
  FaUserGraduate,
  FaGlobe,
  FaShieldAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  SUBJECTS_LIST,
  isTeacherQuestion,
} from "../../../components/teacher/exam/addExam";

export default function MobileAddExam() {
  const [subject, setSubject] = useState("Mathematics");
  const [customSubject, setCustomSubject] = useState("");
  const [year, setYear] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all"); // 'all' | 'teacher' | 'api'
  const [viewMode, setViewMode] = useState("all"); // 'all' | 'selected'
  const [selectedQuestionsIds, setSelectedQuestionsIds] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [sections, setSections] = useState([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [examForm, setExamForm] = useState({
    examTitle: "",
    duration: "",
    totalMarks: 40,
    negativeMarking: false,
    enableBiometricCheckin: false,
  });
  const [editingSectionIndex, setEditingSectionIndex] = useState(null);
  const [expandedSectionIdx, setExpandedSectionIdx] = useState(null);
  const [showBlueprint, setShowBlueprint] = useState(false);
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
          negativeMarking: false,
          enableBiometricCheckin: false,
          ...parsed?.examForm,
        });
        setSections(parsed.sections || []);
        setSubject(parsed.subject || "Mathematics");
        setCustomSubject(parsed.customSubject || "");
        setYear(parsed.year || "");
        setSourceFilter(parsed.sourceFilter || "all");
        setQuestions(parsed.questions || []);
        setSelectedQuestionsIds(parsed.selectedQuestionsIds || []);

        toaster.info({ title: "Exam draft restored" });
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
        customSubject,
        year,
        sourceFilter,
        questions,
        selectedQuestionsIds,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [
    examForm,
    sections,
    subject,
    customSubject,
    year,
    sourceFilter,
    questions,
    selectedQuestionsIds,
  ]);

  const effectiveSubject =
    subject === "Other / Custom Subject"
      ? customSubject.trim()
      : (subject || "").trim();

  const fetchQuestions = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!effectiveSubject) {
      toaster.warning({ title: "Please select or type a subject first" });
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
        setFilterQuery("");
        setViewMode("all");
        localStorage.setItem("QUES_TION", JSON.stringify(res.data));

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
        toaster.create({
          title: res.message || "No questions found for this query",
          type: "warning",
        });
      }
    } catch (error) {
      setQuestions([]);
      toaster.create({
        title:
          "Something went wrong while fetching questions. Try again later.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedIdSet = useMemo(() => {
    return new Set(selectedQuestionsIds.map((item) => item.id));
  }, [selectedQuestionsIds]);

  const selectedTeacherCount = useMemo(() => {
    return selectedQuestionsIds.filter((q) => isTeacherQuestion(q)).length;
  }, [selectedQuestionsIds]);

  const selectedPlatformCount = useMemo(() => {
    return selectedQuestionsIds.filter((q) => !isTeacherQuestion(q)).length;
  }, [selectedQuestionsIds]);

  const selectAllQuestions = () => {
    setSelectedQuestionsIds((prev) => {
      const currentIds = new Set(prev.map((item) => item.id));
      const additions = questions.filter((q) => !currentIds.has(q.id));
      return [...prev, ...additions];
    });
  };

  const deselectAllQuestions = () => {
    if (viewMode === "selected") {
      setSelectedQuestionsIds([]);
    } else {
      const poolIds = new Set(questions.map((q) => q.id));
      setSelectedQuestionsIds((prev) => prev.filter((q) => !poolIds.has(q.id)));
    }
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
    const finalSubject =
      subject === "Other / Custom Subject"
        ? customSubject.trim()
        : (subject || "").trim();

    if (!finalSubject) {
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
      section: finalSubject,
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

    setSubject("Mathematics");
    setCustomSubject("");
    setYear("");
    setQuestions([]);
    setSelectedQuestionsIds([]);
    setFilterQuery("");
    setViewMode("all");
  };

  const editSection = (index) => {
    const sec = sections[index];
    if (
      SUBJECTS_LIST.filter((s) => s !== "Other / Custom Subject").includes(
        sec.section,
      )
    ) {
      setSubject(sec.section);
      setCustomSubject("");
    } else {
      setSubject("Other / Custom Subject");
      setCustomSubject(sec.section);
    }
    setYear(sec.year || "");
    setQuestions(sec.questions);
    setSelectedQuestionsIds(sec.questions);
    setEditingSectionIndex(index);
    setFilterQuery("");
    setViewMode("selected");
    setShowBlueprint(false);
  };

  const removeSection = (index) => {
    const updated = sections.filter((_, i) => i !== index);
    setSections(updated);
    toaster.info({ title: "Section removed from assessment" });
  };

  const handleCreateExam = () => {
    if (!examForm.examTitle.trim()) {
      toaster.create({ title: "Exam title is required", type: "warning" });
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
      negativeMarking: Boolean(examForm.negativeMarking),
      enableBiometricCheckin: Boolean(examForm.enableBiometricCheckin),
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
    0,
  );

  const currentQuestionsPool =
    viewMode === "selected" ? selectedQuestionsIds : questions;

  const displayedQuestions = filterQuery.trim()
    ? currentQuestionsPool.filter(
        (q) =>
          (q.questionText || q.question || "")
            .toLowerCase()
            .includes(filterQuery.toLowerCase()) ||
          (q.topic || "").toLowerCase().includes(filterQuery.toLowerCase()),
      )
    : currentQuestionsPool;

  const hasTitle = Boolean(examForm.examTitle.trim());
  const hasDuration = Boolean(
    examForm.duration && Number(examForm.duration) > 0,
  );
  const hasMarks = Boolean(
    examForm.totalMarks && Number(examForm.totalMarks) > 0,
  );
  const hasSections = sections.length > 0;
  const isReadyToProceed = hasTitle && hasDuration && hasMarks && hasSections;

  return (
    <Box
      bg="#F8FAFC"
      minH="100vh"
      pb="88px" // room for sticky bottom action bar
    >
      <Box p={4}>
        {/* Header Banner */}
        <Box
          bg="linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)"
          p={4}
          borderRadius="xl"
          color="white"
          mb={4}
          boxShadow="0 4px 14px 0 rgba(15, 23, 42, 0.2)"
        >
          <HStack spacing={3} mb={2} justify="space-between">
            <HStack spacing={3}>
              <Flex
                w="36px"
                h="36px"
                borderRadius="lg"
                bg="rgba(99, 102, 241, 0.25)"
                align="center"
                justify="center"
                border="1px solid rgba(129, 140, 248, 0.4)"
                flexShrink={0}
              >
                <Icon as={FaLayerGroup} color="#818CF8" boxSize={4} />
              </Flex>
              <Box>
                <Text fontSize="sm" fontWeight="bold" lineHeight="1.2">
                  CBT Creator Studio
                </Text>
                <Text fontSize="11px" color="#94A3B8">
                  Multi-section examination builder
                </Text>
              </Box>
            </HStack>
            <HStack
              spacing={1.5}
              bg="rgba(16, 185, 129, 0.15)"
              px={2}
              py={1}
              borderRadius="full"
              flexShrink={0}
            >
              <Box w="6px" h="6px" borderRadius="full" bg="#10B981" />
              <Text fontSize="10px" color="#6EE7B7" fontWeight="semibold">
                Saved
              </Text>
            </HStack>
          </HStack>
        </Box>

        {/* Reset Draft */}
        <Flex justify="flex-end" mb={3}>
          <Button
            size="xs"
            variant="outline"
            borderColor="#CBD5E1"
            borderRadius="lg"
            h="32px"
            fontSize="11px"
            color="#64748B"
            leftIcon={<Icon as={FaRedo} boxSize={2.5} />}
            onClick={() => {
              setExamForm({
                examTitle: "",
                duration: "",
                totalMarks: 40,
                negativeMarking: false,
                enableBiometricCheckin: false,
              });
              setSubject("Mathematics");
              setCustomSubject("");
              setYear("");
              setQuestions([]);
              setSelectedQuestionsIds([]);
              setSections([]);
              setEditingSectionIndex(null);
              localStorage.removeItem(STORAGE_KEY);
              toaster.info({ title: "Draft cleared" });
            }}
          >
            Reset Draft
          </Button>
        </Flex>

        {/* Card 1: Exam Identification & Timings */}
        <Box
          bg="white"
          p={4}
          borderRadius="20px"
          border="1px solid #E2E8F0"
          boxShadow="0 2px 10px rgba(0, 0, 0, 0.02)"
          mb={4}
        >
          <Flex align="center" gap={2.5} mb={3}>
            <Flex
              w="30px"
              h="30px"
              borderRadius="lg"
              bg="rgba(99, 102, 241, 0.1)"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={FaFileAlt} color="#4F46E5" boxSize={3.5} />
            </Flex>
            <Box>
              <Text fontSize="14px" fontWeight="800" color="#0F172A">
                Step 1: Exam Identification & Timings
              </Text>
              <Text fontSize="10.5px" color="#64748B">
                Core assessment credentials visible to candidates.
              </Text>
            </Box>
          </Flex>

          <VStack spacing={3} align="stretch">
            <Field.Root required>
              <Field.Label fontWeight="700" fontSize="12px" color="#334155">
                Master Examination Title <Field.RequiredIndicator />
              </Field.Label>
              <Input
                placeholder="e.g. WAEC 2026 Mock"
                size="sm"
                borderRadius="lg"
                h="42px"
                borderColor="#CBD5E1"
                _focus={{
                  borderColor: "#6366F1",
                  boxShadow: "0 0 0 1px #6366F1",
                }}
                value={examForm.examTitle}
                onChange={(e) =>
                  setExamForm({ ...examForm, examTitle: e.target.value })
                }
              />
            </Field.Root>

            <HStack spacing={3}>
              <Field.Root required flex={1}>
                <Field.Label fontWeight="700" fontSize="12px" color="#334155">
                  Duration (mins) <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  type="number"
                  placeholder="120"
                  size="sm"
                  borderRadius="lg"
                  h="42px"
                  borderColor="#CBD5E1"
                  _focus={{
                    borderColor: "#6366F1",
                    boxShadow: "0 0 0 1px #6366F1",
                  }}
                  value={examForm.duration}
                  onChange={(e) =>
                    setExamForm({ ...examForm, duration: e.target.value })
                  }
                />
              </Field.Root>

              <Field.Root required flex={1}>
                <Field.Label fontWeight="700" fontSize="12px" color="#334155">
                  Total Marks <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  type="number"
                  placeholder="100"
                  size="sm"
                  borderRadius="lg"
                  h="42px"
                  borderColor="#CBD5E1"
                  _focus={{
                    borderColor: "#6366F1",
                    boxShadow: "0 0 0 1px #6366F1",
                  }}
                  value={examForm.totalMarks}
                  onChange={(e) =>
                    setExamForm({ ...examForm, totalMarks: e.target.value })
                  }
                />
              </Field.Root>
            </HStack>

            {/* Policy Toggle Cards */}
            <VStack spacing={2.5} align="stretch" pt={1}>
              <Box
                p={3}
                borderRadius="14px"
                border="1px solid"
                borderColor={examForm.negativeMarking ? "#818CF8" : "#E2E8F0"}
                bg={
                  examForm.negativeMarking
                    ? "rgba(99, 102, 241, 0.04)"
                    : "#F8FAFC"
                }
                onClick={() =>
                  setExamForm((prev) => ({
                    ...prev,
                    negativeMarking: !prev.negativeMarking,
                  }))
                }
              >
                <Flex justify="space-between" align="center">
                  <Box pr={2}>
                    <HStack spacing={1.5} mb={0.5}>
                      <Icon
                        as={FaExclamationTriangle}
                        color="#D97706"
                        boxSize={3}
                      />
                      <Text fontSize="12px" fontWeight="700" color="#0F172A">
                        Negative Marking
                      </Text>
                    </HStack>
                    <Text fontSize="10px" color="#64748B">
                      -25% penalty for wrong choices
                    </Text>
                  </Box>
                  <Checkbox.Root
                    checked={Boolean(examForm.negativeMarking)}
                    colorPalette="purple"
                    pointerEvents="none"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                  </Checkbox.Root>
                </Flex>
              </Box>

              <Box
                p={3}
                borderRadius="14px"
                border="1px solid"
                borderColor={
                  examForm.enableBiometricCheckin ? "#818CF8" : "#E2E8F0"
                }
                bg={
                  examForm.enableBiometricCheckin
                    ? "rgba(99, 102, 241, 0.04)"
                    : "#F8FAFC"
                }
                onClick={() =>
                  setExamForm((prev) => ({
                    ...prev,
                    enableBiometricCheckin: !prev.enableBiometricCheckin,
                  }))
                }
              >
                <Flex justify="space-between" align="center">
                  <Box pr={2}>
                    <HStack spacing={1.5} mb={0.5}>
                      <Icon as={FaShieldAlt} color="#6366F1" boxSize={3} />
                      <Text fontSize="12px" fontWeight="700" color="#0F172A">
                        AI Biometric Check-in
                      </Text>
                    </HStack>
                    <Text fontSize="10px" color="#64748B">
                      Face recognition before exam entry
                    </Text>
                  </Box>
                  <Checkbox.Root
                    checked={Boolean(examForm.enableBiometricCheckin)}
                    colorPalette="purple"
                    pointerEvents="none"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                  </Checkbox.Root>
                </Flex>
              </Box>
            </VStack>
          </VStack>
        </Box>

        {/* Card 2: Section Builder */}
        <Box
          bg="white"
          p={4}
          borderRadius="20px"
          border="1px solid #E2E8F0"
          boxShadow="0 2px 10px rgba(0, 0, 0, 0.02)"
          mb={4}
        >
          <Flex justify="space-between" align="flex-start" mb={3} gap={2}>
            <Flex align="center" gap={2.5}>
              <Flex
                w="30px"
                h="30px"
                borderRadius="lg"
                bg="rgba(124, 58, 237, 0.1)"
                align="center"
                justify="center"
                flexShrink={0}
              >
                <Icon as={FaLayerGroup} color="#7C3AED" boxSize={3.5} />
              </Flex>
              <Box>
                <Text fontSize="14px" fontWeight="800" color="#0F172A">
                  Step 2: Subject Section Builder
                </Text>
                <Text fontSize="10.5px" color="#64748B">
                  Query, select, and append questions.
                </Text>
              </Box>
            </Flex>

            {editingSectionIndex !== null && (
              <Badge
                bg="#FEF3C7"
                color="#D97706"
                px={2}
                py={0.5}
                borderRadius="full"
                fontSize="9px"
                fontWeight="bold"
                flexShrink={0}
              >
                EDITING #{editingSectionIndex + 1}
              </Badge>
            )}
          </Flex>

          {/* Query Controls */}
          <Box
            bg="#F8FAFC"
            p={3}
            borderRadius="16px"
            border="1px solid #E2E8F0"
            mb={3}
          >
            <Box mb={2.5}>
              <Text fontWeight="700" fontSize="10.5px" color="#475569" mb={1.5}>
                Question Bank Source:
              </Text>
              <HStack
                spacing={2}
                overflowX="auto"
                pb={1}
                css={{ "&::-webkit-scrollbar": { display: "none" } }}
              >
                {[
                  { key: "all", label: "All Banks", icon: FaLayerGroup },
                  { key: "teacher", label: "My Bank", icon: FaUserGraduate },
                  { key: "api", label: "Platform", icon: FaGlobe },
                ].map((src) => {
                  const isActive = sourceFilter === src.key;
                  return (
                    <Button
                      key={src.key}
                      size="xs"
                      h="30px"
                      px={2.5}
                      flexShrink={0}
                      borderRadius="full"
                      variant={isActive ? "solid" : "outline"}
                      bg={isActive ? "#0F172A" : "white"}
                      color={isActive ? "white" : "#475569"}
                      borderColor={isActive ? "#0F172A" : "#CBD5E1"}
                      fontWeight="700"
                      fontSize="11px"
                      onClick={() => setSourceFilter(src.key)}
                      leftIcon={<Icon as={src.icon} boxSize={2.5} />}
                    >
                      {src.label}
                    </Button>
                  );
                })}
              </HStack>
            </Box>

            <VStack spacing={3} align="stretch">
              <Field.Root required>
                <Field.Label fontWeight="700" fontSize="10.5px" color="#475569">
                  Subject / Course <Field.RequiredIndicator />
                </Field.Label>
                <NativeSelect.Root size="sm" w="100%">
                  <NativeSelect.Field
                    bg="white"
                    borderRadius="lg"
                    h="40px"
                    fontSize="13px"
                    borderColor="#CBD5E1"
                    _focus={{ borderColor: "#6366F1" }}
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
                  <Box mt={2}>
                    <Input
                      placeholder="Type custom subject name..."
                      bg="white"
                      borderRadius="lg"
                      h="38px"
                      fontSize="13px"
                      borderColor="#CBD5E1"
                      _focus={{ borderColor: "#6366F1" }}
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                    />
                  </Box>
                )}
              </Field.Root>

              <Field.Root>
                <Field.Label fontWeight="700" fontSize="10.5px" color="#475569">
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
                leftIcon={<Icon as={FaSearch} />}
              >
                Query Questions
              </Button>
            </VStack>
          </Box>

          {/* Section Assembly Counter */}
          <Box
            bg="#FFFFFF"
            p={3}
            borderRadius="14px"
            border="1px solid #E2E8F0"
            mb={3}
          >
            <VStack spacing={2} align="stretch">
              <Box>
                <HStack spacing={2} mb={1} wrap="wrap">
                  <Text fontSize="11.5px" fontWeight="800" color="#0F172A">
                    Section:{" "}
                    <span style={{ color: "#4F46E5" }}>
                      {effectiveSubject || "Unspecified"}
                    </span>
                  </Text>
                  <Badge
                    bg="#0F172A"
                    color="white"
                    px={1.5}
                    py={0.5}
                    borderRadius="full"
                    fontSize="9px"
                    fontWeight="bold"
                  >
                    {selectedQuestionsIds.length} Selected
                  </Badge>
                </HStack>
                <HStack spacing={1.5}>
                  <Badge
                    bg="rgba(124, 58, 237, 0.12)"
                    color="#7C3AED"
                    border="1px solid rgba(124, 58, 237, 0.25)"
                    px={1.5}
                    py={0.5}
                    borderRadius="md"
                    fontSize="9px"
                    fontWeight="bold"
                  >
                    🎓 {selectedTeacherCount} My Bank
                  </Badge>
                  <Badge
                    bg="rgba(37, 99, 235, 0.1)"
                    color="#2563EB"
                    border="1px solid rgba(37, 99, 235, 0.25)"
                    px={1.5}
                    py={0.5}
                    borderRadius="md"
                    fontSize="9px"
                    fontWeight="bold"
                  >
                    🌐 {selectedPlatformCount} Platform
                  </Badge>
                </HStack>
              </Box>

              <HStack spacing={1.5} bg="#F1F5F9" p={1} borderRadius="xl">
                <Button
                  flex={1}
                  size="xs"
                  h="28px"
                  variant={viewMode === "all" ? "solid" : "ghost"}
                  bg={viewMode === "all" ? "#0F172A" : "transparent"}
                  color={viewMode === "all" ? "white" : "#64748B"}
                  fontWeight="700"
                  fontSize="10.5px"
                  borderRadius="lg"
                  onClick={() => setViewMode("all")}
                >
                  Available ({questions.length})
                </Button>
                <Button
                  flex={1}
                  size="xs"
                  h="28px"
                  variant={viewMode === "selected" ? "solid" : "ghost"}
                  bg={viewMode === "selected" ? "#4F46E5" : "transparent"}
                  color={viewMode === "selected" ? "white" : "#64748B"}
                  fontWeight="700"
                  fontSize="10.5px"
                  borderRadius="lg"
                  onClick={() => setViewMode("selected")}
                >
                  Selection ({selectedQuestionsIds.length})
                </Button>
              </HStack>
            </VStack>
          </Box>

          {/* Question List */}
          {currentQuestionsPool.length === 0 ? (
            <Box
              p={6}
              borderRadius="16px"
              border="2px dashed #E2E8F0"
              bg="#F8FAFC"
              textAlign="center"
              mb={3}
            >
              <Icon as={FaBookOpen} boxSize={6} color="#94A3B8" mb={2} />
              <Text fontWeight="700" color="#334155" fontSize="12.5px" mb={1}>
                {viewMode === "selected"
                  ? "No Questions Selected Yet"
                  : "No Questions Queried Yet"}
              </Text>
              <Text fontSize="10.5px" color="#64748B">
                {viewMode === "selected"
                  ? "Switch to 'Available' and select items to add to this section."
                  : "Pick a subject and source above, then tap 'Query Questions'."}
              </Text>
            </Box>
          ) : (
            <Box mb={3}>
              <Flex
                direction="column"
                gap={2}
                bg="#0F172A"
                color="white"
                p={3}
                borderRadius="14px"
                mb={2.5}
              >
                <Flex justify="space-between" align="center">
                  <HStack spacing={2}>
                    <Icon as={FaListOl} color="#818CF8" boxSize={3} />
                    <Text fontSize="12px" fontWeight="bold">
                      {displayedQuestions.length} Listed
                    </Text>
                  </HStack>
                  <Badge
                    bg="rgba(99, 102, 241, 0.3)"
                    color="#C7D2FE"
                    px={1.5}
                    py={0.5}
                    borderRadius="full"
                    fontSize="9px"
                  >
                    {selectedQuestionsIds.length} Total
                  </Badge>
                </Flex>
                <Input
                  placeholder="Filter by keyword..."
                  size="xs"
                  bg="rgba(255, 255, 255, 0.1)"
                  borderColor="rgba(255, 255, 255, 0.2)"
                  color="white"
                  _placeholder={{ color: "gray.400" }}
                  borderRadius="md"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                />
                <HStack spacing={2}>
                  {selectedQuestionsIds.length > 0 && (
                    <Button
                      flex={1}
                      size="xs"
                      variant="subtle"
                      bg="rgba(239, 68, 68, 0.25)"
                      color="#FCA5A5"
                      borderRadius="md"
                      onClick={deselectAllQuestions}
                    >
                      {viewMode === "selected"
                        ? "Clear Section"
                        : "Deselect Page"}
                    </Button>
                  )}
                  {viewMode === "all" && questions.length > 0 && (
                    <Button
                      flex={1}
                      size="xs"
                      variant="outline"
                      color="white"
                      borderColor="rgba(255, 255, 255, 0.25)"
                      borderRadius="md"
                      onClick={selectAllQuestions}
                    >
                      Select All
                    </Button>
                  )}
                </HStack>
              </Flex>

              <VStack
                spacing={2}
                align="stretch"
                maxH="360px"
                overflowY="auto"
                pr={1}
              >
                {displayedQuestions.map((q, idx) => {
                  const isSelected = selectedIdSet.has(q.id);
                  const isTeacher = isTeacherQuestion(q);
                  return (
                    <Box
                      key={q.id || idx}
                      p={3}
                      borderRadius="14px"
                      border="1px solid"
                      borderColor={isSelected ? "#6366F1" : "#E2E8F0"}
                      bg={isSelected ? "rgba(99, 102, 241, 0.04)" : "#FFFFFF"}
                      onClick={() => toggleSelectQuestion(q)}
                    >
                      <Flex gap={2.5} align="flex-start">
                        <Checkbox.Root
                          checked={isSelected}
                          pointerEvents="none"
                          colorPalette="purple"
                          mt={0.5}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                        </Checkbox.Root>

                        <Box flex={1} minW={0}>
                          <HStack spacing={1.5} mb={1} wrap="wrap">
                            <Badge
                              bg="#F1F5F9"
                              color="#475569"
                              fontSize="8.5px"
                              fontWeight="bold"
                              px={1.5}
                              borderRadius="md"
                            >
                              #{idx + 1}
                            </Badge>

                            {isTeacher ? (
                              <Badge
                                bg="rgba(124, 58, 237, 0.12)"
                                color="#7C3AED"
                                border="1px solid rgba(124, 58, 237, 0.25)"
                                fontSize="8.5px"
                                fontWeight="bold"
                                borderRadius="full"
                                px={1.5}
                              >
                                🎓 My Bank
                              </Badge>
                            ) : (
                              <Badge
                                bg="rgba(37, 99, 235, 0.1)"
                                color="#2563EB"
                                border="1px solid rgba(37, 99, 235, 0.25)"
                                fontSize="8.5px"
                                fontWeight="bold"
                                borderRadius="full"
                                px={1.5}
                              >
                                🌐 Platform
                              </Badge>
                            )}

                            {q.examYear && (
                              <Badge
                                bg="#F1F5F9"
                                color="#64748B"
                                fontSize="8.5px"
                                borderRadius="full"
                                px={1.5}
                              >
                                {q.examYear}
                              </Badge>
                            )}
                          </HStack>

                          <Text
                            fontSize="12px"
                            fontWeight="600"
                            color="#0F172A"
                            mb={1.5}
                          >
                            {q.questionText || q.question}
                          </Text>

                          {q.options && (
                            <VStack spacing={1} align="stretch">
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
                                  <strong style={{ color: "#334155" }}>
                                    {key.toUpperCase()}:
                                  </strong>{" "}
                                  {value}
                                </Text>
                              ))}
                            </VStack>
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
          <VStack spacing={2} align="stretch">
            <Button
              bg="#059669"
              color="white"
              borderRadius="xl"
              h="42px"
              fontWeight="700"
              fontSize="12.5px"
              onClick={saveSection}
              isDisabled={
                !effectiveSubject || selectedQuestionsIds.length === 0
              }
              leftIcon={<Icon as={FaCheckCircle} />}
              boxShadow="0 4px 12px rgba(5, 150, 105, 0.2)"
            >
              {editingSectionIndex !== null
                ? "Update Section"
                : `Add Section (${selectedQuestionsIds.length})`}
            </Button>

            {editingSectionIndex !== null && (
              <Button
                variant="outline"
                borderRadius="xl"
                h="40px"
                fontSize="12px"
                onClick={() => {
                  setEditingSectionIndex(null);
                  setSubject("Mathematics");
                  setCustomSubject("");
                  setYear("");
                  setQuestions([]);
                  setSelectedQuestionsIds([]);
                  setViewMode("all");
                }}
              >
                Cancel Edit
              </Button>
            )}
          </VStack>
        </Box>

        {/* Blueprint / Sections Roster Card */}
        <Box
          bg="white"
          p={4}
          borderRadius="20px"
          border="1px solid #E2E8F0"
          boxShadow="0 4px 20px rgba(0, 0, 0, 0.04)"
          mb={4}
        >
          <Flex
            justify="space-between"
            align="center"
            mb={showBlueprint ? 3 : 0}
            onClick={() => setShowBlueprint((v) => !v)}
          >
            <HStack spacing={2}>
              <Text fontSize="14px" fontWeight="800" color="#0F172A">
                Live Exam Blueprint
              </Text>
              <Badge
                bg="rgba(99, 102, 241, 0.12)"
                color="#4F46E5"
                px={2}
                py={0.5}
                borderRadius="full"
                fontSize="10px"
                fontWeight="bold"
              >
                {sections.length}{" "}
                {sections.length === 1 ? "Section" : "Sections"}
              </Badge>
            </HStack>
            <Icon
              as={showBlueprint ? FaChevronUp : FaChevronDown}
              color="#64748B"
              boxSize={3}
            />
          </Flex>

          {showBlueprint && (
            <>
              {/* Live Metrics */}
              <HStack spacing={2} mb={4}>
                <Box
                  flex={1}
                  bg="#F8FAFC"
                  p={2.5}
                  borderRadius="xl"
                  border="1px solid #E2E8F0"
                  textAlign="center"
                >
                  <Text fontSize="9.5px" color="#64748B" fontWeight="medium">
                    Questions
                  </Text>
                  <Text fontSize="15px" fontWeight="800" color="#4F46E5">
                    {totalExamQuestions}
                  </Text>
                </Box>
                <Box
                  flex={1}
                  bg="#F8FAFC"
                  p={2.5}
                  borderRadius="xl"
                  border="1px solid #E2E8F0"
                  textAlign="center"
                >
                  <Text fontSize="9.5px" color="#64748B" fontWeight="medium">
                    Duration
                  </Text>
                  <Text fontSize="15px" fontWeight="800" color="#0F172A">
                    {examForm.duration ? `${examForm.duration}m` : "—"}
                  </Text>
                </Box>
                <Box
                  flex={1}
                  bg="#F8FAFC"
                  p={2.5}
                  borderRadius="xl"
                  border="1px solid #E2E8F0"
                  textAlign="center"
                >
                  <Text fontSize="9.5px" color="#64748B" fontWeight="medium">
                    Score
                  </Text>
                  <Text fontSize="15px" fontWeight="800" color="#059669">
                    {examForm.totalMarks || "—"}
                  </Text>
                </Box>
              </HStack>

              <Text fontSize="11.5px" fontWeight="700" color="#334155" mb={2}>
                Assembled Sections Roster:
              </Text>

              {sections.length === 0 ? (
                <Box
                  p={5}
                  borderRadius="16px"
                  border="2px dashed #E2E8F0"
                  bg="#F8FAFC"
                  textAlign="center"
                  mb={4}
                >
                  <Icon
                    as={FaRegLightbulb}
                    color="#94A3B8"
                    boxSize={5}
                    mb={2}
                  />
                  <Text
                    fontSize="12px"
                    fontWeight="bold"
                    color="#334155"
                    mb={0.5}
                  >
                    No Sections Attached Yet
                  </Text>
                  <Text fontSize="10.5px" color="#64748B">
                    Use the builder above to fetch questions and tap "Add
                    Section".
                  </Text>
                </Box>
              ) : (
                <VStack
                  spacing={2.5}
                  align="stretch"
                  mb={4}
                  maxH="360px"
                  overflowY="auto"
                >
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
                        <Box
                          p={3}
                          bg="#F8FAFC"
                          onClick={() =>
                            setExpandedSectionIdx(isExpanded ? null : idx)
                          }
                        >
                          <Flex
                            justify="space-between"
                            align="flex-start"
                            gap={2}
                          >
                            <HStack spacing={2} align="flex-start">
                              <Badge
                                bg="#0F172A"
                                color="white"
                                borderRadius="md"
                                px={1.5}
                                py={0.5}
                                fontSize="9px"
                                fontWeight="bold"
                                flexShrink={0}
                              >
                                #{idx + 1}
                              </Badge>
                              <Box>
                                <Text
                                  fontSize="12.5px"
                                  fontWeight="700"
                                  color="#0F172A"
                                  textTransform="capitalize"
                                  lineHeight="1.2"
                                >
                                  {sec.section}
                                </Text>
                                <Text fontSize="9.5px" color="#64748B">
                                  {sec.questions.length} Qs
                                  {sec.year && ` • ${sec.year}`}
                                </Text>
                                <HStack spacing={1} mt={0.5}>
                                  <Text
                                    fontSize="9px"
                                    color="#7C3AED"
                                    fontWeight="700"
                                  >
                                    🎓{" "}
                                    {
                                      sec.questions.filter((q) =>
                                        isTeacherQuestion(q),
                                      ).length
                                    }
                                  </Text>
                                  <Text
                                    fontSize="9px"
                                    color="#2563EB"
                                    fontWeight="700"
                                  >
                                    🌐{" "}
                                    {
                                      sec.questions.filter(
                                        (q) => !isTeacherQuestion(q),
                                      ).length
                                    }
                                  </Text>
                                </HStack>
                              </Box>
                            </HStack>

                            <HStack
                              spacing={0.5}
                              onClick={(e) => e.stopPropagation()}
                              flexShrink={0}
                            >
                              <Button
                                size="2xs"
                                variant="ghost"
                                color="#4F46E5"
                                onClick={() => editSection(idx)}
                                px={1.5}
                              >
                                <Icon as={FaEdit} />
                              </Button>
                              <Button
                                size="2xs"
                                variant="ghost"
                                color="#DC2626"
                                onClick={() => removeSection(idx)}
                                px={1.5}
                              >
                                <Icon as={FaTrash} />
                              </Button>
                            </HStack>
                          </Flex>
                        </Box>

                        {isExpanded && (
                          <Box p={3} borderTop="1px solid #F1F5F9" bg="white">
                            <VStack
                              spacing={1.5}
                              align="stretch"
                              maxH="180px"
                              overflowY="auto"
                            >
                              {sec.questions.map((q, qIdx) => {
                                const isTeacher = isTeacherQuestion(q);
                                return (
                                  <Box
                                    key={q.id || qIdx}
                                    p={2}
                                    borderRadius="8px"
                                    bg="#F8FAFC"
                                    border="1px solid #F1F5F9"
                                  >
                                    <HStack spacing={1.5} mb={0.5}>
                                      <Badge
                                        fontSize="8px"
                                        px={1}
                                        py={0.2}
                                        borderRadius="sm"
                                        bg={
                                          isTeacher
                                            ? "rgba(124, 58, 237, 0.12)"
                                            : "rgba(37, 99, 235, 0.1)"
                                        }
                                        color={
                                          isTeacher ? "#7C3AED" : "#2563EB"
                                        }
                                        fontWeight="bold"
                                      >
                                        {isTeacher ? "My Bank" : "Platform"}
                                      </Badge>
                                      <Text fontSize="9.5px" color="#64748B">
                                        #{qIdx + 1}
                                      </Text>
                                    </HStack>
                                    <Text
                                      fontSize="10.5px"
                                      fontWeight="600"
                                      color="#1E293B"
                                      noOfLines={2}
                                    >
                                      {q.questionText || q.question}
                                    </Text>
                                  </Box>
                                );
                              })}
                            </VStack>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </VStack>
              )}

              {/* Readiness Checklist */}
              <Box
                p={3}
                borderRadius="14px"
                bg="#F8FAFC"
                border="1px solid #E2E8F0"
              >
                <Text fontSize="10.5px" fontWeight="700" color="#334155" mb={2}>
                  Assessment Launch Readiness:
                </Text>
                <VStack spacing={1.5} align="stretch">
                  <HStack spacing={2} fontSize="10.5px">
                    <Icon
                      as={hasTitle ? FaCheck : FaTimes}
                      color={hasTitle ? "#059669" : "#DC2626"}
                      boxSize={2.5}
                    />
                    <Text color={hasTitle ? "#0F172A" : "#64748B"}>
                      Exam Title Specified
                    </Text>
                  </HStack>
                  <HStack spacing={2} fontSize="10.5px">
                    <Icon
                      as={hasDuration && hasMarks ? FaCheck : FaTimes}
                      color={hasDuration && hasMarks ? "#059669" : "#DC2626"}
                      boxSize={2.5}
                    />
                    <Text
                      color={hasDuration && hasMarks ? "#0F172A" : "#64748B"}
                    >
                      Duration & Total Marks Configured
                    </Text>
                  </HStack>
                  <HStack spacing={2} fontSize="10.5px">
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
            </>
          )}
        </Box>
      </Box>

      {/* Sticky Bottom Action Bar */}
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg="white"
        borderTop="1px solid #E2E8F0"
        p={3}
        boxShadow="0 -4px 16px rgba(0,0,0,0.06)"
        zIndex={20}
      >
        <Flex justify="space-between" align="center" gap={3}>
          <Box>
            <Text fontSize="10px" color="#64748B" fontWeight="medium">
              {sections.length} sections • {totalExamQuestions} Qs
            </Text>
          </Box>
          <Button
            flex={1}
            maxW="240px"
            h="46px"
            bg="linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
            color="white"
            borderRadius="xl"
            fontWeight="bold"
            fontSize="13px"
            boxShadow="0 4px 16px rgba(99, 102, 241, 0.35)"
            onClick={handleCreateExam}
            isDisabled={!isReadyToProceed}
            rightIcon={<Icon as={FaArrowRight} />}
          >
            Proceed to Publish
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
