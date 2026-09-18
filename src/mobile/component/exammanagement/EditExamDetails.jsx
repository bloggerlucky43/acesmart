import {
  Box,
  Button,
  Field,
  Stack,
  Input,
  Flex,
  Textarea,
  Text,
  Badge,
  HStack,
  Icon,
  VStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toaster } from "../../../components/ui/toaster";
import { createExam } from "../../../api-endpoint/exam/exams";
import {
  FaSlidersH,
  FaCheckCircle,
  FaEye,
} from "react-icons/fa";

export default function MobileEditExamDetails() {
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const examId = searchParams.get("exam");

  const [examDetails, setExamDetails] = useState({
    title: "WAEC 2024",
    description: "This is a sample exam description.",
    subject: "Mathematics",
    duration: 60,
    startDate: "",
    endDate: "",
    totalMarks: 100,
    passMarks: 50,
    negativeMarking: false,
    enableBiometricCheckin: false,
    sections: [],
    id: examId || null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const loadExam = async () => {
      if (examId) {
        // Reserved for future dynamic load
      } else {
        const storedData = localStorage.getItem("NEW_EXAM");

        if (!storedData) return;
        const parsedData = JSON.parse(storedData);

        setExamDetails((prev) => ({
          ...prev,
          title: parsedData.examTitle || prev.title,
          duration: parsedData.duration || prev.duration,
          totalMarks: parsedData.totalMarks ?? prev.totalMarks,
          negativeMarking: parsedData.negativeMarking ?? prev.negativeMarking,
          enableBiometricCheckin:
            parsedData.enableBiometricCheckin ?? prev.enableBiometricCheckin,
          sections: parsedData.sections || prev.sections,
        }));
      }
    };

    loadExam();
  }, [examId, navigate]);

  const totalQuestions = examDetails.sections.reduce(
    (acc, sec) => acc + (sec.questions?.length || 0),
    0,
  );

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!examDetails.startDate) {
      toaster.error({ title: "Start date is required" });
      return;
    } else if (!examDetails.endDate) {
      toaster.error({ title: "End date is required" });
      return;
    } else if (!examDetails.duration) {
      toaster.error({ title: "Exam duration is required" });
      return;
    } else if (!examDetails.description) {
      toaster.error({ title: "Exam description is required" });
      return;
    } else if (totalQuestions === 0) {
      toaster.error({ title: "Exam question list is empty" });
      return;
    }

    setLoading(true);
    try {
      const res = await createExam(examDetails);

      if (res.success && res.data) {
        toaster.success({ title: "Exam created and published successfully!" });
        navigate("/teacher/exams");
      }
    } catch (error) {
      toaster.error({
        title: "Something went wrong. Please try again later.",
      });
      console.error("Server call fail:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4} minH="calc(100vh - 58px)" bg="#F8FAFC" overflowX="hidden">
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
            flexShrink={0}
          >
            <Icon as={FaSlidersH} color="#818CF8" boxSize={4} />
          </Flex>
          <Box>
            <Text fontSize="md" fontWeight="bold" lineHeight="1.2">
              Exam Parameters
            </Text>
            <Text fontSize="xs" color="#94A3B8">
              Step 2 of 2: Scheduling & Scoring Rules
            </Text>
          </Box>
        </HStack>

        <HStack spacing={2} mt={2} wrap="wrap">
          <Badge
            bg="rgba(99, 102, 241, 0.2)"
            color="#A5B4FC"
            borderRadius="full"
            px={2.5}
            fontSize="10px"
          >
            {totalQuestions} Questions Attached
          </Badge>
          <Badge
            bg="rgba(99, 102, 241, 0.2)"
            color="#A5B4FC"
            borderRadius="full"
            px={2.5}
            fontSize="10px"
          >
            {examDetails.sections.length} Sections
          </Badge>
          {examDetails.negativeMarking && (
            <Badge
              bg="rgba(217, 119, 6, 0.2)"
              color="#FBBF24"
              borderRadius="full"
              px={2.5}
              fontSize="10px"
            >
              Negative Marking On
            </Badge>
          )}
        </HStack>
      </Box>

      {/* Main Settings Card */}
      <Box
        bg="white"
        p={4}
        borderRadius="xl"
        border="1px solid #E2E8F0"
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.05)"
        mb={4}
      >
        <VStack spacing={4} align="stretch">
          <Field.Root required>
            <Field.Label fontSize="xs" fontWeight="semibold" color="#334155">
              Exam Title <Field.RequiredIndicator />
            </Field.Label>
            <Input
              placeholder="Enter exam title"
              size="sm"
              borderRadius="lg"
              borderColor="#CBD5E1"
              _focus={{ borderColor: "#6366F1" }}
              value={examDetails.title}
              onChange={(e) =>
                setExamDetails({ ...examDetails, title: e.target.value })
              }
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label fontSize="xs" fontWeight="semibold" color="#334155">
              Description / Instructions <Field.RequiredIndicator />
            </Field.Label>
            <Textarea
              placeholder="Enter exam instructions for candidates"
              size="sm"
              rows={3}
              borderRadius="lg"
              borderColor="#CBD5E1"
              _focus={{ borderColor: "#6366F1" }}
              value={examDetails.description}
              onChange={(e) =>
                setExamDetails({
                  ...examDetails,
                  description: e.target.value,
                })
              }
            />
          </Field.Root>

          {/* Timing Section — stacked to avoid datetime-local overflow on narrow screens */}
          <Stack spacing={3}>
            <Field.Root required>
              <Field.Label fontSize="xs" fontWeight="semibold" color="#334155">
                Start Date/Time <Field.RequiredIndicator />
              </Field.Label>
              <Input
                type="datetime-local"
                size="sm"
                w="100%"
                borderRadius="lg"
                borderColor="#CBD5E1"
                _focus={{ borderColor: "#6366F1" }}
                value={examDetails.startDate}
                onChange={(e) =>
                  setExamDetails({
                    ...examDetails,
                    startDate: e.target.value,
                  })
                }
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label fontSize="xs" fontWeight="semibold" color="#334155">
                End Date/Time <Field.RequiredIndicator />
              </Field.Label>
              <Input
                type="datetime-local"
                size="sm"
                w="100%"
                borderRadius="lg"
                borderColor="#CBD5E1"
                _focus={{ borderColor: "#6366F1" }}
                value={examDetails.endDate}
                onChange={(e) =>
                  setExamDetails({
                    ...examDetails,
                    endDate: e.target.value,
                  })
                }
              />
            </Field.Root>
          </Stack>

          {/* Scores & Duration */}
          <SimpleGrid columns={2} gap={3}>
            <Field.Root required>
              <Field.Label fontSize="xs" fontWeight="semibold" color="#334155">
                Total Marks
              </Field.Label>
              <Input
                type="number"
                size="sm"
                borderRadius="lg"
                borderColor="#CBD5E1"
                _focus={{ borderColor: "#6366F1" }}
                value={examDetails.totalMarks}
                onChange={(e) =>
                  setExamDetails({
                    ...examDetails,
                    totalMarks: Number(e.target.value),
                  })
                }
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label fontSize="xs" fontWeight="semibold" color="#334155">
                Pass Marks
              </Field.Label>
              <Input
                type="number"
                size="sm"
                borderRadius="lg"
                borderColor="#CBD5E1"
                _focus={{ borderColor: "#6366F1" }}
                value={examDetails.passMarks}
                onChange={(e) =>
                  setExamDetails({
                    ...examDetails,
                    passMarks: Number(e.target.value),
                  })
                }
              />
            </Field.Root>
          </SimpleGrid>

          <Field.Root required>
            <Field.Label fontSize="xs" fontWeight="semibold" color="#334155">
              Duration (min)
            </Field.Label>
            <Input
              type="number"
              size="sm"
              borderRadius="lg"
              borderColor="#CBD5E1"
              _focus={{ borderColor: "#6366F1" }}
              value={examDetails.duration}
              onChange={(e) =>
                setExamDetails({
                  ...examDetails,
                  duration: Number(e.target.value),
                })
              }
            />
          </Field.Root>
        </VStack>
      </Box>

      {/* Action Buttons */}
      <VStack spacing={2} align="stretch" mb={6}>
        <Button
          w="100%"
          size="md"
          bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
          color="white"
          borderRadius="xl"
          fontWeight="bold"
          boxShadow="0 4px 12px rgba(106, 27, 154, 0.3)"
          onClick={handleSaveChanges}
          loading={loading}
          _hover={{
            transform: "translateY(-1px)",
            boxShadow: "0 6px 16px rgba(106, 27, 154, 0.4)",
          }}
          leftIcon={<Icon as={FaCheckCircle} />}
        >
          Save & Publish Exam
        </Button>

        {examId && (
          <Button
            w="100%"
            size="sm"
            variant="outline"
            borderColor="#CBD5E1"
            borderRadius="lg"
            fontSize="xs"
            color="#475569"
            onClick={() =>
              navigate(`/teacher/exam/questions?exam_question=${examId}`)
            }
            leftIcon={<Icon as={FaEye} />}
          >
            Inspect Exam Questions
          </Button>
        )}
      </VStack>
    </Box>
  );
}