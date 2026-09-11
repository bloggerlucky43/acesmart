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
} from "@chakra-ui/react";
import { STORAGE_KEY } from "../../../libs/helper";
import { useNavigate, useParams } from "react-router-dom";
import { toaster } from "../../ui/toaster";
import { useEffect, useState } from "react";
import { getQuestions } from "../../../api-endpoint/exam/exams";
import DashboardLayout from "../../../constants/dashboardlayout";
import { getExamById } from "../../../api-endpoint/exam/exams";

export default function EditExamStructure() {
  const { examId } = useParams();
  console.log("Logging the exam id ", examId);

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
        setSubject(parsed.subject || "");
        setYear(parsed.year || "");
        setQuestions(parsed.questions || []);
        setSelectedQuestionsIds(parsed.selectedQuestionsIds || []);

        toaster.info({
          title: "Draft restored",
        });
      } catch (error) {
        console.error("Failed to load draft", error);
      }
    }
  }, []);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    }, 1000); // wait 1s

    return () => clearTimeout(timeout);
  }, [examForm, sections, subject, year, questions, selectedQuestionsIds]);

  const fetchQuestions = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!subject?.trim()) {
      toaster.warning({
        title: "Subject is missing",
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
          title: "Questions fetched successfully",
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
        title: "Something went wrong.Try again later.",
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
    console.log("Selected IDs NOW:", isChecked, question);
  };

  const handleSelectAll = () => {
    if (questions.length === 0) return;
    if (selectedQuestionsIds.length === questions.length) {
      setSelectedQuestionsIds([]);
    } else {
      setSelectedQuestionsIds(questions);
    }
  };

  const saveSection = () => {
    if (!subject?.trim()) {
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
      section: subject.trim(),
      year: year?.trim() || null,
      questions: selectedQuestionsIds,
    };

    if (editingSectionIndex !== null) {
      // update ONLY
      setSections((prev) =>
        prev.map((sec, i) => (i === editingSectionIndex ? newSection : sec)),
      );

      toaster.success({ title: "Section updated" });
    } else {
      // create ONLY
      setSections((prev) => [...prev, newSection]);

      toaster.success({ title: "Section added" });
    }

    setSubject("");
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

    setSubject(section.section);
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
        mt="68px"
        minH="calc(100vh - 68px)"
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
          <Box mb={6}>
            <Text fontSize={"lg"} fontWeight={"semibold"} mb={2}>
              Add Section (subject)
            </Text>

            <Flex gap={3} mb={3} wrap="wrap" align="center">
              <Field.Root required>
                <Field.Label>
                  Subject <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  placeholder="Subject  (e.g. english)"
                  value={subject}
                  borderColor="gray.500"
                  _focus={{ borderColor: "primary" }}
                  onChange={(e) => setSubject(e.target.value)}
                  w="250px"
                />
              </Field.Root>
              <Field.Root>
                <Field.Label>Year (optional)</Field.Label>
                <Input
                  placeholder="2023,2022......."
                  value={year}
                  borderColor="gray.500"
                  _focus={{ borderColor: "primary" }}
                  onChange={(e) => setYear(e.target.value)}
                  w="150px"
                />
              </Field.Root>

              <Button
                onClick={fetchQuestions}
                loading={loading}
                spinnerPlacement="center"
                bg="secondary"
                // mb={4}
              >
                Fetch Questions
              </Button>

              <Button onClick={handleSelectAll} variant="outline">
                {selectedQuestionsIds.length === questions.length &&
                questions.length > 0
                  ? "Deselect All"
                  : "Select All"}
              </Button>

              <Button bg="green" onClick={saveSection} ml="auto">
                {examId ? "Update Exam" : " Create Exam"}
              </Button>
            </Flex>
          </Box>

          {/* Questions List */}
          <Box mb={4}>
            <Flex justify="space-between" align="center">
              <Text fontSize="lg" mb={2}>
                Fetched Questions
              </Text>
              <Text
                color="white"
                fontSize="lg"
                borderRadius="full"
                bg="secondary"
                p={2}
              >
                {selectedQuestionsIds?.length}
              </Text>
            </Flex>
            {questions.length === 0 ? (
              <Text color="gray.500">
                No questions fetched for this subject yet.
              </Text>
            ) : (
              <List.Root>
                {questions.map((q) => (
                  <List.Item key={q.id}>
                    <Checkbox.Root
                      checked={selectedQuestionsIds.some(
                        (item) => item.id === q.id,
                      )}
                      onCheckedChange={(checked) =>
                        toggleSelectQuestion(q, checked)
                      }
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                      <Checkbox.Label>{q.questionText}</Checkbox.Label>
                    </Checkbox.Root>
                  </List.Item>
                ))}
              </List.Root>
            )}
          </Box>

          {/* saved sections preview */}
          <Box mb={6}>
            <Flex align="center" justify="space-between" mb={2}>
              <Text fontSize="lg" fontWeight="semibold">
                Saved Sections ({sections.length})
              </Text>
              <Text>
                Total Questions in Exam:
                {sections.reduce((s, sec) => s + sec.questions.length, 0)}
              </Text>
            </Flex>

            {sections.length === 0 ? (
              <Text color="gray.500">No sections saved yet</Text>
            ) : (
              <Accordion.Root collapsible multiple>
                {sections.map((sec, idx) => (
                  <Accordion.Item key={idx} value={String(idx)}>
                    <Accordion.ItemTrigger>
                      {sec.section} ({sec.questions.length} questions)
                      <Accordion.ItemIndicator />
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                      <Accordion.ItemBody />
                      <ul style={{ marginLeft: "1rem" }}>
                        {sec.questions.map((q) => (
                          <li key={q.id}>
                            <strong>{q.questionText}</strong>
                            <ul>
                              {Object.entries(q.options).map(([key, value]) => (
                                <li key={key}>
                                  <strong>{key.toUpperCase()}:</strong>
                                  {value}
                                </li>
                              ))}
                            </ul>
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
