import DashboardLayout from "../../../constants/dashboardlayout";
import {
  Box,
  Button,
  Field,
  Switch,
  Grid,
  Stack,
  Input,
  Flex,
  NumberInput,
  Textarea,
  Fieldset,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toaster } from "../../ui/toaster";
import { updateExam } from "../../../api-endpoint/exam/exams";

export default function EditDraft() {
  const [loading, setLoading] = useState(false);

  const { examId } = useParams();
  const [examDetails, setExamDetails] = useState({
    title: "WAEC 2024",
    description: "This is a sample exam description.",

    duration: 60,
    startDate: "",
    endDate: "",
    totalMarks: 100,
    negativeMarking: false,
    sections: [],
    id: examId || null,
  });
  const navigate = useNavigate();
  console.log("Editing exam with ID:", examId);

  useEffect(() => {
    const saved = localStorage.getItem("EDIT_EXAM_DRAFT");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        setExamDetails((prev) => ({
          ...prev,
          title: parsed.examTitle,
          duration: parsed.duration,
          totalMarks: parsed.totalMarks,
          sections: parsed.sections || [],
        }));

        setSections(parsed.sections || []);
      } catch (err) {
        console.error("Failed to parse draft", err);
      }
    }
  }, []);

  const handleFinalSubmit = async () => {
    const saved = localStorage.getItem("EDIT_EXAM_DRAFT");
    if (!saved) {
      toaster.error({ title: "No draft found" });
      return;
    }

    const draft = JSON.parse(saved);

    if (!examDetails.startDate) {
      toaster.error({
        title: "Start date required",
      });
      return;
    } else if (!examDetails.endDate) {
      toaster.error({ title: "End date is required" });

      return;
    } else if (!examDetails.duration) {
      toaster.error({ title: "Exam duration is required" });
      setLoading(false);
      return;
    } else if (!examDetails.description) {
      toaster.error({ title: "Exam description is required" });
      setLoading(false);
      return;
    }
    const finalExam = {
      ...draft,
      description: examDetails.description,
      startDate: examDetails.startDate,
      endDate: examDetails.endDate,
      negativeMarking: examDetails.negativeMarking,
    };

    setLoading(true);
    try {
      const res = await updateExam(examId, finalExam);

      if (res.success && res.data) {
        toaster.success({ title: "Exam updated successfully" });
        localStorage.removeItem("EDIT_EXAM_DRAFT");
        navigate("/teacher/exams");
      }
    } catch (error) {
      toaster.error({
        title: "Something went wrong.Try again later.",
      });
      console.error("Server call fail:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <DashboardLayout>
      {" "}
      <Box
        bg="gray.200"
        minH={"100vh"}
        p={4}
        ml="10vw"
        w="70%"
        justifySelf="center"
        mt="9vh"
      >
        <Fieldset.Root
          bg="white"
          p={6}
          mt={4}
          borderRadius="md"
          boxShadow="md"
          size="lg"
        >
          <Stack>
            <Fieldset.Legend fontSize="xl" fontWeight="bold">
              Exam Details
            </Fieldset.Legend>
            <Fieldset.HelperText>
              Please provide the details for the exam.
            </Fieldset.HelperText>
          </Stack>

          <Fieldset.Content>
            <Grid templateColumns="repeat(2,1fr)" gap={6} mt={4}>
              {/* left column */}
              <Stack gap={4}>
                <Field.Root>
                  <Field.Label>Exam Title </Field.Label>
                  <Input
                    placeholder="Enter exam title"
                    value={examDetails.title}
                    onChange={(e) =>
                      setExamDetails({ ...examDetails, title: e.target.value })
                    }
                    borderColor="gray.500"
                    _focus={{ borderColor: "primary" }}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Description </Field.Label>
                  <Textarea
                    placeholder="Enter exam description"
                    value={examDetails.description}
                    onChange={(e) =>
                      setExamDetails({
                        ...examDetails,
                        description: e.target.value,
                      })
                    }
                    borderColor="gray.500"
                    _focus={{ borderColor: "primary" }}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Duration (minutes) </Field.Label>
                  <NumberInput.Root
                    placeholder="Enter duration in minutes"
                    value={examDetails.duration}
                    onValueChange={(e) =>
                      setExamDetails({ ...examDetails, duration: e.value })
                    }
                  >
                    <NumberInput.Control />
                    <NumberInput.Input
                      _focus={{ borderColor: "primary" }}
                      borderColor="gray.500"
                    />
                  </NumberInput.Root>
                </Field.Root>
              </Stack>

              <Stack gap={4}>
                <Field.Root>
                  <Field.Label>Start Date</Field.Label>
                  <Input
                    type="datetime-local"
                    value={examDetails.startDate}
                    onChange={(e) =>
                      setExamDetails({
                        ...examDetails,
                        startDate: e.target.value,
                      })
                    }
                    _focus={{ borderColor: "primary" }}
                    borderColor="gray.500"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>End Date</Field.Label>
                  <Input
                    type="datetime-local"
                    value={examDetails.endDate}
                    onChange={(e) =>
                      setExamDetails({
                        ...examDetails,
                        endDate: e.target.value,
                      })
                    }
                    _focus={{ borderColor: "primary" }}
                    borderColor="gray.500"
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Total Marks</Field.Label>
                  <NumberInput.Root>
                    <NumberInput.Control />
                    <NumberInput.Input
                      value={examDetails.totalMarks}
                      onChange={(e) =>
                        setExamDetails({
                          ...examDetails,
                          totalMarks: e.target.value,
                        })
                      }
                      _focus={{ borderColor: "primary" }}
                      borderColor="gray.500"
                    />
                  </NumberInput.Root>
                </Field.Root>

                <Switch.Root
                  checked={examDetails.negativeMarking}
                  onCheckedChange={(e) =>
                    setExamDetails({
                      ...examDetails,
                      negativeMarking: e.checked,
                    })
                  }
                  _focus={{ borderColor: "primary" }}
                  colorPalette={"green"}
                  mt={4}
                >
                  <Switch.HiddenInput />
                  <Switch.Control />
                  <Switch.Label>Negative Marking</Switch.Label>
                </Switch.Root>
              </Stack>
            </Grid>
          </Fieldset.Content>
        </Fieldset.Root>

        <Flex mt={4} justify="flex-end" gap={4}>
          <Button
            bg="secondary"
            _hover={{ transform: "scale(1.05)" }}
            onClick={handleFinalSubmit}
            loading={loading}
            spinnerPlacement="center"
          >
            Save Changes
          </Button>
        </Flex>
      </Box>
    </DashboardLayout>
  );
}
