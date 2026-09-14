import {
  Box,
  Flex,
  Text,
  Input,
  Field,
  Button,
  Checkbox,
  List,
  Accordion,
  Spinner,
  Badge,
  HStack,
  NativeSelect,
} from "@chakra-ui/react";
import { STORAGE_KEY } from "../../../libs/helper";
import { useNavigate, useParams } from "react-router-dom";
import { toaster } from "../../ui/toaster";
import { useEffect, useState, useMemo } from "react";
import { getQuestions } from "../../../api-endpoint/exam/exams";
import DashboardLayout from "../../../constants/dashboardlayout";
import { getExamById } from "../../../api-endpoint/exam/exams";
import { SUBJECTS_LIST, isTeacherQuestion } from "./addExam";

export default function EditExamStructure() {
  const { examId } = useParams();
  console.log("Logging the exam id ", examId);

  const [subject, setSubject] = useState("Mathematics");
  const [customSubject, setCustomSubject] = useState("");
  const [year, setYear] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all"); // "all" | "teacher" | "api"
  const [selectedQuestionsIds, setSelectedQuestionsIds] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [sections, setSections] = useState([]);
  const [examForm, setExamForm] = useState({
    examTitle: "",
    duration: "",
    totalMarks: 40,
  });
  const [editingSectionIndex, setEditingSectionIndex] = useState(null);
  const [loadingExam, setLoadingExam] = useState(false);
  //   console.log(subject, selectedQuestionsIds, examForm);
  //   console.log("Sections are", sections);

  useEffect(() => {
    if (!examId) return;

    const fetchExam = async () => {
      setLoadingExam(true);
      try {
        const res = await getExamById(examId);

        console.log("The data here in this case is", res);

        if (res.message === "Exam fetched successfully" && res.exam) {
          setExamForm({
            examTitle: res?.exam?.title,
            duration: res?.exam?.duration,
            totalMarks: res?.exam?.totalMarks,
          });
          setSections(res?.exam?.sections || []);
        } else {
          toaster.error({ title: "Failed to fetch exam" });
        }
      } catch (error) {
        toaster.error({ title: "Error fetching exam" });
      } finally {
        setLoadingExam(false);
      }
    };

    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (examId) return;
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
        setSubject(parsed.subject || "Mathematics");
        setCustomSubject(parsed.customSubject || "");
        setYear(parsed.year || "");
        setSourceFilter(parsed.sourceFilter || "all");
        setQuestions(parsed.questions || []);
        setSelectedQuestionsIds(parsed.selectedQuestionsIds || []);

        toaster.info({
          title: "Draft restored",
        });
      } catch (error) {
        console.error("Failed to load draft", error);
      }
    }
  }, [examId]);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    }, 1000); // wait 1s

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

  const selectedTeacherCount = useMemo(() => {
    return selectedQuestionsIds.filter((q) => isTeacherQuestion(q)).length;
  }, [selectedQuestionsIds]);

  const selectedPlatformCount = useMemo(() => {
    return selectedQuestionsIds.filter((q) => !isTeacherQuestion(q)).length;
  }, [selectedQuestionsIds]);

  const fetchQuestions = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

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

      if (res.success && res.data && Array.isArray(res.data)) {
        setQuestions(res.data);
        // Do NOT clear selectedQuestionsIds here: enables multi-source combinations!
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
          title: res.message || "No questions found",
          type: "warning",
        });
      }
    } catch (error) {
      setQuestions([]);
      toaster.create({
        title: "Something went wrong. Try again later.",
        type: "error",
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
        : prev.filter((q) => q.id !== question.id),
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
      toaster.create({
        title: "Please enter a subject name",
        type: "error",
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
      // update ONLY
      setSections((prev) =>
        prev.map((sec, i) => (i === editingSectionIndex ? newSection : sec))
      );

      toaster.success({ title: "Section updated" });
    } else {
      // create ONLY
      setSections((prev) => [...prev, newSection]);

      toaster.success({ title: "Section added" });
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

  const handleNext = (e) => {
    if (e && e?.preventDefault) e.preventDefault();

    const draft = {
      examTitle: examForm.examTitle,
      duration: Number(examForm.duration),
      totalMarks: Number(examForm.totalMarks),
      sections,
    };

    localStorage.setItem("EDIT_EXAM_DRAFT", JSON.stringify(draft));
    toaster.success({
      title: "Progress saved",
    });

    navigate(`/teacher/exams/edit/${examId}/draft`);
  };

  const editSection = (index) => {
    const section = sections[index];

    if (
      SUBJECTS_LIST.filter((s) => s !== "Other / Custom Subject").includes(
        section.section
      )
    ) {
      setSubject(section.section);
      setCustomSubject("");
    } else {
      setSubject("Other / Custom Subject");
      setCustomSubject(section.section);
    }
    setYear(section.year || "");
    setQuestions(section.questions);
    setSelectedQuestionsIds(section.questions);
    setEditingSectionIndex(index);
  };

  if (loadingExam) {
    return (
      <Flex minH="100vh" justify="center" align="center">
        <Spinner size="xl" color="primary" />
        <Text ml={2}>Loading exam...</Text>
      </Flex>
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
        justifySelf="center"
      >
        <Text fontSize="2xl" mb={2} mt={4} fontWeight={"bold"}>
          Create Exam (multiple sections)
        </Text>
        <Box p={4} boxShadow="md" borderRadius="md" bg="white">
          <Flex mt={6} mb={4}>
            <Field.Root required>
              <Field.Label>
                Exam Title
                <Field.RequiredIndicator />
              </Field.Label>
              <Input
                placeholder="Exam Title"
                // flex="1"
                borderColor="gray.500"
                _focus={{ borderColor: "primary" }}
                value={examForm.examTitle}
                onChange={(e) =>
                  setExamForm({ ...examForm, examTitle: e.target.value })
                }
              />
            </Field.Root>
            <Field.Root required>
              <Field.Label>
                Duration (minutes) <Field.RequiredIndicator />
              </Field.Label>
              <Input
                type="number"
                placeholder="e.g. 60"
                borderColor="gray.500"
                _focus={{ borderColor: "primary" }}
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
              <Field.Label>
                Total Marks <Field.RequiredIndicator />
              </Field.Label>
              <Input
                type="number"
                placeholder="e.g Total Marks (e.g., 400)"
                borderColor="gray.500"
                value={examForm.totalMarks}
                onChange={(e) =>
                  setExamForm({ ...examForm, totalMarks: e.target.value })
                }
              />
            </Field.Root>
          </Flex>

          {/* current section builder */}
          <Box mb={6} p={4} bg="#F8FAFC" borderRadius="xl" border="1px solid #E2E8F0">
            <Text fontSize={"md"} fontWeight={"bold"} color="#0F172A" mb={3}>
              Section Builder (Subject & Source Bank)
            </Text>

            {/* Source Bank Selection */}
            <Box mb={3}>
              <Text fontSize="xs" fontWeight="bold" color="#475569" mb={1.5}>
                Question Bank Source:
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
                      h="30px"
                      px={3}
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

            <Flex gap={3} mb={3} wrap="wrap" align="flex-end">
              <Field.Root required w={{ base: "100%", md: "260px" }}>
                <Field.Label fontSize="xs" fontWeight="bold" color="#475569">
                  Subject <Field.RequiredIndicator />
                </Field.Label>
                <NativeSelect.Root size="sm" w="100%">
                  <NativeSelect.Field
                    bg="white"
                    borderRadius="md"
                    h="38px"
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
                  <Input
                    mt={2}
                    placeholder="Type custom subject..."
                    value={customSubject}
                    bg="white"
                    size="sm"
                    borderRadius="md"
                    borderColor="#CBD5E1"
                    _focus={{ borderColor: "#6366F1" }}
                    onChange={(e) => setCustomSubject(e.target.value)}
                  />
                )}
              </Field.Root>

              <Field.Root w={{ base: "100%", md: "150px" }}>
                <Field.Label fontSize="xs" fontWeight="bold" color="#475569">
                  Year (optional)
                </Field.Label>
                <Input
                  placeholder="e.g. 2024"
                  value={year}
                  bg="white"
                  size="sm"
                  h="38px"
                  borderRadius="md"
                  borderColor="#CBD5E1"
                  _focus={{ borderColor: "#6366F1" }}
                  onChange={(e) => setYear(e.target.value)}
                />
              </Field.Root>

              <Button
                onClick={fetchQuestions}
                loading={loading}
                h="38px"
                px={4}
                bg="#0F172A"
                color="white"
                fontSize="12px"
                fontWeight="bold"
                borderRadius="md"
                _hover={{ bg: "#1E293B" }}
              >
                Fetch Questions
              </Button>

              <Button
                onClick={handleSelectAll}
                variant="outline"
                h="38px"
                fontSize="12px"
                borderRadius="md"
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
                h="38px"
                px={5}
                fontSize="12px"
                fontWeight="bold"
                borderRadius="md"
                _hover={{ bg: "#047857" }}
                onClick={saveSection}
                ml="auto"
                isDisabled={!effectiveSubject || selectedQuestionsIds.length === 0}
              >
                {editingSectionIndex !== null
                  ? "Update Section"
                  : `Save Section (${selectedQuestionsIds.length} Qs)`}
              </Button>
            </Flex>

            {/* Selection Counter Live Badges */}
            <HStack spacing={2} pt={2} borderTop="1px dashed #CBD5E1">
              <Text fontSize="xs" fontWeight="bold" color="#334155">
                Section Assembly: {selectedQuestionsIds.length} total picked
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
          </Box>

          {/* Questions List */}
          <Box mb={4}>
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="md" fontWeight="bold" color="#0F172A">
                Available Questions ({questions.length})
              </Text>
              <Badge bg="#0F172A" color="white" px={2.5} py={1} borderRadius="full" fontSize="11px">
                {selectedQuestionsIds?.length} Selected
              </Badge>
            </Flex>
            {questions.length === 0 ? (
              <Text color="gray.500" fontSize="sm">
                No questions fetched for this query yet. Select a subject and bank source above and click "Fetch Questions".
              </Text>
            ) : (
              <List.Root gap={2}>
                {questions.map((q) => {
                  const isTeacher = isTeacherQuestion(q);
                  const isChecked = selectedQuestionsIds.some(
                    (item) => item.id === q.id
                  );
                  return (
                    <List.Item
                      key={q.id}
                      p={2.5}
                      borderRadius="lg"
                      border="1px solid"
                      borderColor={isChecked ? "#6366F1" : "#E2E8F0"}
                      bg={isChecked ? "purple.50" : "white"}
                      mb={1}
                    >
                      <Checkbox.Root
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          toggleSelectQuestion(q, checked)
                        }
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label>
                          <HStack spacing={2} align="center" wrap="wrap">
                            <Badge
                              fontSize="10px"
                              px={2}
                              py={0.5}
                              borderRadius="full"
                              bg={isTeacher ? "purple.100" : "blue.100"}
                              color={isTeacher ? "purple.800" : "blue.800"}
                              fontWeight="bold"
                            >
                              {isTeacher ? "🎓 My Bank" : "🌐 Platform Bank"}
                            </Badge>
                            <Text fontSize="xs" fontWeight="semibold" color="#0F172A">
                              {q.questionText || q.question}
                            </Text>
                          </HStack>
                        </Checkbox.Label>
                      </Checkbox.Root>
                    </List.Item>
                  );
                })}
              </List.Root>
            )}
          </Box>

          {/* saved sections preview */}
          <Box mb={6}>
            <Flex align="center" justify="space-between" mb={2}>
              <Text fontSize="md" fontWeight="bold">
                Saved Sections ({sections.length})
              </Text>
              <Text fontSize="sm" color="#64748B">
                Total Questions in Exam:{" "}
                <strong style={{ color: "#0F172A" }}>
                  {sections.reduce((s, sec) => s + (sec.questions?.length || 0), 0)}
                </strong>
              </Text>
            </Flex>

            {sections.length === 0 ? (
              <Text color="gray.500" fontSize="sm">No sections saved yet</Text>
            ) : (
              <Accordion.Root collapsible multiple>
                {sections.map((sec, idx) => (
                  <Accordion.Item key={idx} value={String(idx)}>
                    <Accordion.ItemTrigger>
                      {sec.section} ({sec.questions.length} questions •{" "}
                      {sec.questions.filter(isTeacherQuestion).length} My Bank,{" "}
                      {sec.questions.filter((q) => !isTeacherQuestion(q)).length} Platform)
                      <Accordion.ItemIndicator />
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                      <Accordion.ItemBody />
                      <ul style={{ marginLeft: "1rem" }}>
                        {sec.questions.map((q) => (
                          <li key={q.id}>
                            <strong>
                              [{isTeacherQuestion(q) ? "My Bank" : "Platform"}]{" "}
                              {q.questionText || q.question}
                            </strong>
                            {q.options && (
                              <ul>
                                {Object.entries(q.options).map(([key, value]) => (
                                  <li key={key}>
                                    <strong>{key.toUpperCase()}:</strong> {value}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>

                      <Button
                        size="sm"
                        m={2}
                        bg="secondary"
                        onClick={() => editSection(idx)}
                      >
                        Edit Section
                      </Button>
                    </Accordion.ItemContent>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            )}
          </Box>
          <Flex gap={3} justify="flex-end">
            <Button
              variant="outline"
              onClick={() => {
                // reset full form
                setExamForm({ examTitle: "", duration: "", totalMarks: 400 });
                setSubject("");
                setYear("");
                setQuestions([]);
                setSelectedQuestionsIds([]);
                setSections([]);
                localStorage.removeItem(STORAGE_KEY);
              }}
            >
              Reset
            </Button>

            <Button bg="contrast" onClick={handleNext}>
              Next
            </Button>
          </Flex>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
