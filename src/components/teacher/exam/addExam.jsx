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
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [examForm, setExamForm] = useState({
    examTitle: "",
    duration: "",
    totalMarks: 10,
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchQuestions = async (e) => {
    e.preventDefault();
    if (!subject) {
      toaster.warning({
        title: "Subject is missing",
      });
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      const res = await getQuestions(subject, year);

      if (res.success && res.data) {
        setQuestions(res.data);
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

  const handleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      // If all are selected, deselect all
      setSelectedQuestions([]);
    } else {
      // Otherwise select all
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
    console.log("Exam Created:", examData);

    if (!examData.duration) {
      toaster.warning({ title: "Duration for exam is missing" });
      setLoading(false);
      return;
    } else if (!examData.examTitle) {
      toaster.warning({ title: "Exam title is missing" });
      setLoading(false);
      return;
    } else if (examData.questions === 0) {
      toaster.warning({
        title: "No question selected",
      });
      setLoading(false);
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
        title: "Something went wrong.Try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      p={6}
      bg="gray.200"
      w="70%"
      ml="10vw"
      mt="9vh"
      minH="100vh"
      justifySelf="center"
    >
      <Box p={4} boxShadow="md" borderRadius="md" bg="white">
        <Flex mt={6} mb={4}>
          <Field.Root required>
            <Field.Label>
              Exam Title
              <Field.RequiredIndicator />
            </Field.Label>
            <Input
              placeholder="Enter exam title"
              borderColor="gray.500"
              _focus={{ borderColor: "primary" }}
              value={examForm.examTitle}
              onChange={(e) =>
                setExamForm({ ...examForm, examTitle: e.target.value })
              }
            />
          </Field.Root>
          <Field.Root required ml={4}>
            <Field.Label>
              Duration (minutes) <Field.RequiredIndicator />
            </Field.Label>
            <Input
              type="number"
              placeholder="e.g., 60"
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
        </Flex>

        <Flex mb={4} align="center">
          <Field.Root required mr={4}>
            <Field.Label>
              Subject <Field.RequiredIndicator />
            </Field.Label>
            <Input
              value={subject}
              borderColor="gray.500"
              _focus={{ borderColor: "primary" }}
              onChange={(e) => setSubject(e.target.value)}
            />
          </Field.Root>
          <Field.Root required>
            <Field.Label>
              Year <Field.RequiredIndicator />
            </Field.Label>
            <Input
              value={year}
              borderColor="gray.500"
              _focus={{ borderColor: "primary" }}
              onChange={(e) => setYear(e.target.value)}
            />
          </Field.Root>

          <Field.Root required ml={4}>
            <Field.Label>
              Total Marks <Field.RequiredIndicator />
            </Field.Label>
            <Input
              type="number"
              placeholder="e.g JAMB=400, WAEC=100"
              borderColor="gray.500"
              value={examForm.totalMarks}
              onChange={(e) =>
                setExamForm({ ...examForm, totalMarks: e.target.value })
              }
            />
          </Field.Root>
        </Flex>

        <Button
          onClick={fetchQuestions}
          loading={loading}
          spinnerPlacement="center"
          bg="secondary"
          mb={4}
        >
          Fetch Questions
        </Button>

        {/* Questions List */}
        <Box mb={4}>
          <Text fontSize="lg" mb={2}>
            Questions
          </Text>
          {questions.length === 0 ? (
            <Text color="gray.500">No questions fetched yet.</Text>
          ) : (
            <List.Root>
              {questions.map((q) => (
                <List.Item key={q.id}>
                  <Checkbox.Root
                    checked={selectedQuestions.includes(q)}
                    onCheckedChange={() => toggleSelectQuestion(q)}
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
        <Button onClick={handleSelectAll} mb={4}>
          {selectedQuestions.length === questions.length
            ? "Deselect All"
            : "Select All"}
        </Button>

        {/* Selected Preview */}
        <Box mb={4}>
          <Text fontSize="lg" mb={2}>
            Selected {subject} Questions ({selectedQuestions.length})
          </Text>
          {selectedQuestions.length === 0 ? (
            <Text color="gray.500">No questions selected.</Text>
          ) : (
            <Accordion.Root collapsible multiple>
              {selectedQuestions.map((q) => (
                <Accordion.Item key={q.id} value={q.id}>
                  <Accordion.ItemTrigger>
                    <Checkbox.Root
                      checked={selectedQuestions.some(
                        (item) => item.id === q.id
                      )}
                      onCheckedChange={() => toggleSelectQuestion(q)}
                      mr={3}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                      <Checkbox.Label>{q.questionText}</Checkbox.Label>
                    </Checkbox.Root>
                    <Accordion.ItemIndicator />
                  </Accordion.ItemTrigger>
                  <Accordion.ItemContent>
                    <Accordion.ItemBody />
                    <ul style={{ marginLeft: "1rem" }}>
                      {Object.entries(q.options).map(([key, value]) => (
                        <li key={key}>
                          <strong>{key.toUpperCase()}:</strong> {value}
                        </li>
                      ))}
                    </ul>
                  </Accordion.ItemContent>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          )}
        </Box>

        <Button onClick={handleCreateExam} bg="secondary">
          Next
        </Button>
      </Box>
    </Box>
  );
}
