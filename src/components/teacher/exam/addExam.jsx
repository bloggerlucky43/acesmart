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
} from "@chakra-ui/react";
import { useState } from "react";
import { getQuestions } from "../../../api-endpoint/exam/exams";
import { toaster } from "../../ui/toaster";
import { useNavigate } from "react-router-dom";
export default function AddExam() {
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [selectedQuestionsIds, setSelectedQuestionsIds] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [sections, setSections] = useState([]);
  const [examForm, setExamForm] = useState({
    examTitle: "",
    duration: "",
    totalMarks: 10,
  });

  console.log(subject, selectedQuestionsIds, examForm);
  console.log("Sections are", sections);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      const res = await getQuestions(subject?.trim(), year?.trim());

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
      isChecked ? [...prev, question] : prev.filter((q) => q.id !== question.id)
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

    console.log("Saving section now...");
    console.log("Selected IDs:", selectedQuestionsIds);
    console.log("All questions:", questions);

    const selectedQuestions = selectedQuestionsIds;

    const newSection = {
      section: subject.trim(),
      year: year?.trim() || null,
      questions: selectedQuestions,
    };
    console.log("Saving section now...");
    console.log("Selected IDs:", selectedQuestionsIds);
    console.log("All questions:", questions);

    console.log("Questions available:", questions);
    console.log("Selected IDs:", selectedQuestionsIds);
    console.log("Filtered selected questions:", selectedQuestions);
    console.log("Sections before save:", sections);

    setSections((prev) => [...prev, newSection]);

    setSubject("");
    setYear("");
    setQuestions([]);
    setSelectedQuestionsIds([]);
    toaster.create({
      title: `Section "${newSection.section}" saved`,
      type: "success",
    });
  };

  const removeSection = (index) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
    toaster.info({ title: "Section removed" });
  };

  const handleCreateExam = (e) => {
    if (e && e?.preventDefault) e.preventDefault();

    // validations
    if (!examForm?.examTitle) {
      toaster.create({ title: "Exam title is required", type: "warning" });
      return;
    }
    if (!examForm.duration) {
      toaster.create({ title: "Duration is required", type: "warning" });
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
        title: "Please add at least one section to the exam",
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
    toaster.create({
      title: "Exam created — continuing to editor",
      type: "success",
    });

    // navigate to your edit page
    toaster.create({
      title: "Exam created- continuing to editor",
      type: "success",
    });
    navigate("/teacher/exams/edit");
  };

  // small helper — display question label safely
  const questionLabel = (q) =>
    q.question ?? q.questionText ?? q.text ?? `Q${q.id}`;

  return (
    <Box
      p={6}
      bg="gray.200"
      w="80%"
      ml="20vw"
      mt="9vh"
      minH="100vh"
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
                placeholder="Subject  (e.g., English)"
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
                placeholder="Subject  (e.g., English)"
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
              Save Section
            </Button>
          </Flex>
        </Box>

        {/* Questions List */}
        <Box mb={4}>
          <Text fontSize="lg" mb={2}>
            Fetched Questions
          </Text>
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
                      (item) => item.id === q.id
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
            }}
          >
            Reset
          </Button>

          <Button colorScheme="blue" onClick={handleCreateExam}>
            Create Exam
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
