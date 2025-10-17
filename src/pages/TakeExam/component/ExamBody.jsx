import { Box, Flex, Text, Button, Tabs, RadioGroup } from "@chakra-ui/react";
import { useExam } from "./ExamContext";
import { useState } from "react";
export default function ExamBody() {
  const { examData, answers, saveAnswer, submitExam, scores, totalScore } =
    useExam();

  const [tabValue, setTabValue] = useState(examData.sections[0]?.section || "");

  // Track question index for each section
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    examData.sections.reduce((acc, section) => {
      acc[section.section] = 0;
      return acc;
    }, {})
  );

  return (
    <Box minH="70vh" mx="auto" mt={2} bg="white" maxW="8xl">
      <Flex p={2} direction={"column"} w="full">
        <Tabs.Root
          variant="enclosed"
          value={tabValue}
          onValueChange={(e) => setTabValue(e.value)}
          color="gray.900"
          mb={6}
          w="full"
        >
          <Tabs.List w="full" bg="gray.200" borderRadius="none">
            {examData.sections.map((section, idx) => (
              <Tabs.Trigger
                key={idx}
                color="black"
                w="full"
                borderRadius="none"
                _selected={{ bg: "primary", color: "white" }}
                value={section.section}
              >
                {section.section}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {examData.sections.map((section) => {
            const qIndex = currentQuestionIndex[section.section];
            const question = section.questions[qIndex];
            if (!question) return null;
            return (
              <Tabs.Content
                key={section.section}
                py={4}
                value={section.section}
              >
                {/* current question */}
                <Flex direction="column" mb={4}>
                  <Text mb={2} fontWeight="medium">
                    {qIndex + 1}. {question.question}
                  </Text>
                  <Flex direction="column" gap={4}>
                    {question.options.map((opt, i) => {
                      const inputName = `${section.section}-${question.id}`;

                      return (
                        <label
                          key={i}
                          htmlFor={inputName}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                            gap: "8px",
                            padding: "6px 10px",
                            border: "none",
                          }}
                        >
                          <input
                            type="radio"
                            name={inputName}
                            value={opt}
                            checked={answers[inputName] === opt}
                            onChange={(e) => {
                              console.log("Answer selected:", e.target.value);
                              saveAnswer(
                                section.section,
                                question.id,
                                e.target.value
                              );
                            }}
                          />
                          <Text>{opt}</Text>
                        </label>
                      );
                    })}
                  </Flex>
                </Flex>

                {/* Prev / Next Navigation */}

                <Flex justify="space-between" mb={6}>
                  <Button
                    onClick={() =>
                      setCurrentQuestionIndex((prev) => ({
                        ...prev,
                        [section.section]: Math.max(
                          0,
                          prev[section.section] - 1
                        ),
                      }))
                    }
                    disabled={qIndex === 0}
                    size={"sm"}
                  >
                    Prev
                  </Button>

                  <Button
                    onClick={() =>
                      setCurrentQuestionIndex((prev) => ({
                        ...prev,
                        [section.section]: Math.min(
                          section.questions.length - 1,
                          prev[section.section] + 1
                        ),
                      }))
                    }
                    disabled={qIndex === section.questions.length - 1}
                  >
                    {" "}
                    Next
                  </Button>
                </Flex>

                {/* question navigator */}
                <Flex mt={4} wrap="wrap" gap={2}>
                  {section.questions.map((q, i) => {
                    const answered = !!answers[`${section.section}-${q.id}`];
                    const isActive = i === qIndex;

                    return (
                      <Button
                        key={q.id}
                        size="sm"
                        bg={answered ? "secondary" : "danger"}
                        onClick={() =>
                          setCurrentQuestionIndex((prev) => ({
                            ...prev,
                            [section.section]: i,
                          }))
                        }
                      >
                        {i + 1}
                      </Button>
                    );
                  })}
                </Flex>
              </Tabs.Content>
            );
          })}
        </Tabs.Root>

        {/* Submit Exam */}
        {/* {!submitted && (
          <Button mt={6} colorScheme="teal" onClick={handleSubmit}>
            Submit Exam
          </Button>
        )} */}
      </Flex>
    </Box>
  );
}
