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
  Collapse,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
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
} from "react-icons/fa";

export default function AddExam() {
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [selectedQuestionsIds, setSelectedQuestionsIds] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [sections, setSections] = useState([]);
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

  const handleSelectAll = () => {
    if (selectedQuestionsIds.length === questions.length) {
      setSelectedQuestionsIds([]);
    } else {
      setSelectedQuestionsIds([...questions]);
    }
  };

  const toggleSelectQuestion = (q) => {
    const exists = selectedQuestionsIds.some((item) => item.id === q.id);
    if (exists) {
      setSelectedQuestionsIds(
        selectedQuestionsIds.filter((item) => item.id !== q.id)
      );
    } else {
      setSelectedQuestionsIds([...selectedQuestionsIds, q]);
    }
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
  };

  const editSection = (index) => {
    const sec = sections[index];
    setSubject(sec.section);
    setYear(sec.year || "");
    setQuestions(sec.questions);
    setSelectedQuestionsIds(sec.questions);
    setEditingSectionIndex(index);
  };

  const removeSection = (index) => {
    const updated = sections.filter((_, i) => i !== index);
    setSections(updated);
    toaster.info({ title: "Section removed" });
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

  return (
    <Box
      p={{ base: 4, md: 8 }}
      bg="#F8FAFC"
      w={{ base: "100%", lg: "calc(100% - 240px)" }}
      ml={{ base: 0, lg: "240px" }}
      mt="68px"
      minH="calc(100vh - 68px)"
      justifySelf="center"
    >
      {/* Hero Header Banner */}
      <Box
        bg="linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)"
        p={{ base: 6, md: 8 }}
        borderRadius="24px"
        color="white"
        mb={8}
        boxShadow="0 10px 25px -5px rgba(15, 23, 42, 0.2)"
        position="relative"
        overflow="hidden"
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
                letterSpacing="0.5px"
              >
                CBT ASSESSMENT STUDIO
              </Badge>
              <HStack spacing={1.5} bg="rgba(16, 185, 129, 0.2)" px={2.5} py={0.5} borderRadius="full">
                <Box w="6px" h="6px" borderRadius="full" bg="#34D399" />
                <Text fontSize="11px" color="#34D399" fontWeight="medium">
                  Draft auto-saved
                </Text>
              </HStack>
            </HStack>
            <Text
              fontSize={{ base: "22px", md: "28px" }}
              fontWeight="800"
              fontFamily="'Outfit', sans-serif"
              lineHeight="1.2"
              mb={2}
            >
              Create Multi-Section Examination
            </Text>
            <Text fontSize="14px" color="#94A3B8" maxW="680px">
              Configure modular subject sections (e.g., Mathematics, English Language, Physics),
              fetch accredited questions from the repository, and set examination timing.
            </Text>
          </Box>

          {/* Quick Stats Pill */}
          <HStack
            spacing={4}
            bg="rgba(255, 255, 255, 0.06)"
            p={3}
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
              <Text fontSize="lg" fontWeight="bold" color="#818CF8">{totalExamQuestions}</Text>
            </VStack>
            <Box h="28px" w="1px" bg="rgba(255, 255, 255, 0.15)" />
            <VStack spacing={0} align="center" px={2}>
              <Text fontSize="11px" color="#94A3B8">Total Marks</Text>
              <Text fontSize="lg" fontWeight="bold" color="#34D399">{examForm.totalMarks || 0}</Text>
            </VStack>
          </HStack>
        </Flex>
      </Box>

      {/* STEP 1: Basic Information Card */}
      <Box
        p={{ base: 6, md: 8 }}
        borderRadius="24px"
        border="1px solid #E2E8F0"
        bg="white"
        boxShadow="0 2px 12px rgba(0,0,0,0.03)"
        mb={8}
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
            <Icon as={FaBookOpen} color="#4F46E5" boxSize={4} />
          </Flex>
          <Box>
            <Text fontSize="16px" fontWeight="800" color="#0F172A">
              1. General Examination Parameters
            </Text>
            <Text fontSize="12px" color="#64748B">
              Define the master assessment title, total duration, and aggregate score.
            </Text>
          </Box>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
          <Field.Root required>
            <Field.Label fontWeight="700" fontSize="13px" color="#334155">
              Exam Title <Field.RequiredIndicator />
            </Field.Label>
            <Input
              placeholder="e.g. JAMB UTME Mock 2026 / Term 1 Finals"
              borderRadius="xl"
              h="46px"
              borderColor="#CBD5E1"
              _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
              value={examForm.examTitle}
              onChange={(e) =>
                setExamForm({ ...examForm, examTitle: e.target.value })
              }
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label fontWeight="700" fontSize="13px" color="#334155">
              Duration (minutes) <Field.RequiredIndicator />
            </Field.Label>
            <Input
              type="number"
              placeholder="e.g. 120"
              borderRadius="xl"
              h="46px"
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

          <Field.Root required>
            <Field.Label fontWeight="700" fontSize="13px" color="#334155">
              Total Marks <Field.RequiredIndicator />
            </Field.Label>
            <Input
              type="number"
              placeholder="e.g. 400"
              borderRadius="xl"
              h="46px"
              borderColor="#CBD5E1"
              _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
              value={examForm.totalMarks}
              onChange={(e) =>
                setExamForm({ ...examForm, totalMarks: e.target.value })
              }
            />
          </Field.Root>
        </SimpleGrid>
      </Box>

      {/* STEP 2: Subject Section Builder */}
      <Box
        p={{ base: 6, md: 8 }}
        borderRadius="24px"
        border="1px solid #E2E8F0"
        bg="white"
        boxShadow="0 2px 12px rgba(0,0,0,0.03)"
        mb={8}
      >
        <Flex
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          gap={3}
          mb={5}
        >
          <Flex align="center" gap={3}>
            <Flex
              w="36px"
              h="36px"
              borderRadius="xl"
              bg="rgba(124, 58, 237, 0.1)"
              align="center"
              justify="center"
            >
              <Icon as={FaLayerGroup} color="#7C3AED" boxSize={4} />
            </Flex>
            <Box>
              <Text fontSize="16px" fontWeight="800" color="#0F172A">
                2. Subject Section Builder & Question Bank
              </Text>
              <Text fontSize="12px" color="#64748B">
                Query repository questions, pick items, and save as modular sections.
              </Text>
            </Box>
          </Flex>

          {editingSectionIndex !== null && (
            <Badge
              bg="#FEF3C7"
              color="#D97706"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="11px"
              fontWeight="bold"
            >
              EDITING SECTION #{editingSectionIndex + 1}
            </Badge>
          )}
        </Flex>

        {/* Query Controls Bar */}
        <Box
          bg="#F8FAFC"
          p={5}
          borderRadius="20px"
          border="1px solid #E2E8F0"
          mb={6}
        >
          <SimpleGrid columns={{ base: 1, md: 12 }} gap={4} alignItems="flex-end">
            <Box gridColumn={{ base: "1", md: "span 5" }}>
              <Field.Root required>
                <Field.Label fontWeight="700" fontSize="12px" color="#475569">
                  Subject or Course <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  placeholder="e.g. Mathematics, English, Biology"
                  bg="white"
                  borderRadius="xl"
                  h="44px"
                  borderColor="#CBD5E1"
                  _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </Field.Root>
            </Box>

            <Box gridColumn={{ base: "1", md: "span 3" }}>
              <Field.Root>
                <Field.Label fontWeight="700" fontSize="12px" color="#475569">
                  Target Exam Year (Optional)
                </Field.Label>
                <Input
                  placeholder="e.g. 2024, 2025"
                  bg="white"
                  borderRadius="xl"
                  h="44px"
                  borderColor="#CBD5E1"
                  _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 1px #6366F1" }}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </Field.Root>
            </Box>

            <Box gridColumn={{ base: "1", md: "span 4" }}>
              <Button
                w="100%"
                h="44px"
                bg="linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
                color="white"
                borderRadius="xl"
                fontWeight="700"
                fontSize="13px"
                onClick={fetchQuestions}
                loading={loading}
                _hover={{ opacity: 0.95, transform: "translateY(-1px)" }}
                leftIcon={<Icon as={FaSearch} />}
                boxShadow="0 4px 12px rgba(79, 70, 229, 0.25)"
              >
                Fetch Questions
              </Button>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Questions Selection Area */}
        {questions.length > 0 && (
          <Box mb={6}>
            <Flex
              justify="space-between"
              align="center"
              bg="#0F172A"
              color="white"
              p={4}
              borderRadius="16px"
              mb={3}
            >
              <HStack spacing={3}>
                <Icon as={FaListOl} color="#818CF8" boxSize={4} />
                <Text fontSize="14px" fontWeight="bold">
                  Available Questions ({questions.length})
                </Text>
                <Badge
                  bg="rgba(99, 102, 241, 0.3)"
                  color="#C7D2FE"
                  px={2.5}
                  py={0.5}
                  borderRadius="full"
                  fontSize="11px"
                >
                  {selectedQuestionsIds.length} Selected
                </Badge>
              </HStack>

              <Button
                size="sm"
                variant="outline"
                color="white"
                borderColor="rgba(255, 255, 255, 0.2)"
                _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                borderRadius="lg"
                fontSize="12px"
                onClick={handleSelectAll}
              >
                {selectedQuestionsIds.length === questions.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </Flex>

            {/* Scrollable Questions Grid */}
            <VStack spacing={3} align="stretch" maxH="380px" overflowY="auto" pr={1}>
              {questions.map((q, idx) => {
                const isSelected = selectedQuestionsIds.some(
                  (item) => item.id === q.id
                );
                return (
                  <Box
                    key={q.id || idx}
                    p={4}
                    borderRadius="16px"
                    border="1px solid"
                    borderColor={isSelected ? "#6366F1" : "#E2E8F0"}
                    bg={isSelected ? "rgba(99, 102, 241, 0.04)" : "#FFFFFF"}
                    cursor="pointer"
                    onClick={() => toggleSelectQuestion(q)}
                    transition="all 0.15s ease"
                    _hover={{ borderColor: "#818CF8", bg: "rgba(99, 102, 241, 0.02)" }}
                  >
                    <Flex gap={3} align="flex-start">
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
                        <HStack spacing={2} mb={1}>
                          <Badge
                            bg="#F1F5F9"
                            color="#475569"
                            fontSize="10px"
                            fontWeight="bold"
                            px={2}
                            borderRadius="md"
                          >
                            Q{idx + 1}
                          </Badge>
                          {q.subject && (
                            <Badge
                              bg="rgba(79, 70, 229, 0.1)"
                              color="#4F46E5"
                              fontSize="10px"
                              borderRadius="full"
                              px={2}
                              textTransform="capitalize"
                            >
                              {q.subject}
                            </Badge>
                          )}
                        </HStack>

                        <Text fontSize="13px" fontWeight="600" color="#0F172A" mb={2}>
                          {q.questionText || q.question}
                        </Text>

                        {/* Options preview pills */}
                        {q.options && (
                          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={1.5}>
                            {Object.entries(q.options).map(([key, value]) => (
                              <Text
                                key={key}
                                fontSize="11px"
                                color="#64748B"
                                bg="#F8FAFC"
                                p={1.5}
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

        {/* Section Save / Update Button */}
        <Flex justify="flex-end" gap={3} pt={2}>
          {editingSectionIndex !== null && (
            <Button
              variant="outline"
              borderRadius="xl"
              h="42px"
              fontSize="13px"
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
            h="42px"
            px={6}
            fontWeight="700"
            fontSize="13px"
            _hover={{ bg: "#047857" }}
            onClick={saveSection}
            isDisabled={!subject.trim() || selectedQuestionsIds.length === 0}
            leftIcon={<Icon as={FaCheckCircle} />}
            boxShadow="0 4px 12px rgba(5, 150, 105, 0.25)"
          >
            {editingSectionIndex !== null
              ? "Update Section"
              : `Save Section (${selectedQuestionsIds.length} Questions)`}
          </Button>
        </Flex>
      </Box>

      {/* STEP 3: Saved Sections Live Review */}
      <Box
        p={{ base: 6, md: 8 }}
        borderRadius="24px"
        border="1px solid #E2E8F0"
        bg="white"
        boxShadow="0 2px 12px rgba(0,0,0,0.03)"
        mb={8}
      >
        <Flex justify="space-between" align="center" mb={5}>
          <Box>
            <Text fontSize="16px" fontWeight="800" color="#0F172A">
              3. Configured Examination Sections ({sections.length})
            </Text>
            <Text fontSize="12px" color="#64748B">
              Review saved subject modules before finalizing exam structure.
            </Text>
          </Box>

          <Badge
            bg="rgba(16, 185, 129, 0.1)"
            color="#059669"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="12px"
            fontWeight="bold"
          >
            {totalExamQuestions} Questions in Assessment
          </Badge>
        </Flex>

        {sections.length === 0 ? (
          <Box
            p={8}
            borderRadius="20px"
            border="2px dashed #E2E8F0"
            bg="#F8FAFC"
            textAlign="center"
          >
            <Icon as={FaLayerGroup} boxSize={8} color="#94A3B8" mb={2} />
            <Text fontWeight="700" color="#334155" fontSize="14px" mb={1}>
              No Subject Sections Added Yet
            </Text>
            <Text fontSize="12px" color="#64748B" maxW="450px" mx="auto">
              Use Section 2 above to fetch questions for a subject (e.g., Mathematics, English),
              select test items, and click "Save Section".
            </Text>
          </Box>
        ) : (
          <VStack spacing={3} align="stretch">
            {sections.map((sec, idx) => {
              const isExpanded = expandedSectionIdx === idx;
              return (
                <Box
                  key={idx}
                  borderRadius="20px"
                  border="1px solid #E2E8F0"
                  bg="#FFFFFF"
                  overflow="hidden"
                  boxShadow="0 1px 3px rgba(0,0,0,0.04)"
                >
                  <Flex
                    p={4}
                    justify="space-between"
                    align="center"
                    bg="#F8FAFC"
                    cursor="pointer"
                    onClick={() =>
                      setExpandedSectionIdx(isExpanded ? null : idx)
                    }
                  >
                    <HStack spacing={3}>
                      <Badge
                        bg="#0F172A"
                        color="white"
                        borderRadius="md"
                        px={2.5}
                        py={1}
                        fontSize="11px"
                        fontWeight="bold"
                      >
                        SECTION {idx + 1}
                      </Badge>
                      <Box>
                        <Text
                          fontSize="15px"
                          fontWeight="700"
                          color="#0F172A"
                          textTransform="capitalize"
                        >
                          {sec.section}
                        </Text>
                        <HStack spacing={2}>
                          <Text fontSize="11px" color="#64748B">
                            {sec.questions.length} Questions
                          </Text>
                          {sec.year && (
                            <>
                              <Text fontSize="11px" color="#CBD5E1">•</Text>
                              <Text fontSize="11px" color="#64748B">Year {sec.year}</Text>
                            </>
                          )}
                        </HStack>
                      </Box>
                    </HStack>

                    <HStack spacing={2} onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="xs"
                        variant="outline"
                        borderColor="#CBD5E1"
                        borderRadius="md"
                        leftIcon={<Icon as={FaEdit} />}
                        onClick={() => editSection(idx)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        colorPalette="red"
                        borderColor="#FCA5A5"
                        color="#DC2626"
                        borderRadius="md"
                        leftIcon={<Icon as={FaTrash} />}
                        onClick={() => removeSection(idx)}
                      >
                        Delete
                      </Button>
                      <Flex
                        w="28px"
                        h="28px"
                        borderRadius="md"
                        bg="white"
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
                          boxSize={3}
                        />
                      </Flex>
                    </HStack>
                  </Flex>

                  {/* Expanded Section Items */}
                  {isExpanded && (
                    <Box p={4} borderTop="1px solid #F1F5F9" bg="white">
                      <VStack spacing={2} align="stretch">
                        {sec.questions.map((q, qIdx) => (
                          <Box
                            key={q.id || qIdx}
                            p={3}
                            borderRadius="12px"
                            bg="#F8FAFC"
                            border="1px solid #F1F5F9"
                          >
                            <Text fontSize="12px" fontWeight="600" color="#1E293B" mb={1}>
                              {qIdx + 1}. {q.questionText || q.question}
                            </Text>
                            {q.options && (
                              <SimpleGrid columns={{ base: 1, sm: 2 }} gap={1} mt={1}>
                                {Object.entries(q.options).map(([k, val]) => (
                                  <Text key={k} fontSize="10px" color="#64748B">
                                    <strong style={{ color: "#334155" }}>{k.toUpperCase()}:</strong> {val}
                                  </Text>
                                ))}
                              </SimpleGrid>
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

      {/* FINALIZATION TOOLBAR */}
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
            toaster.info({ title: "Draft reset" });
          }}
        >
          Reset All
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
          onClick={handleCreateExam}
          isDisabled={
            !examForm.examTitle ||
            !examForm.duration ||
            !examForm.totalMarks ||
            sections.length === 0
          }
          rightIcon={<Icon as={FaArrowRight} />}
        >
          Proceed to Scheduling & Publish ({sections.length} Sections)
        </Button>
      </Flex>
    </Box>
  );
}
