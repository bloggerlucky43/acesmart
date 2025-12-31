import { Box, Flex, Text, Button, Tabs, Image } from "@chakra-ui/react";
import { useExam } from "./ExamContext";
import { useEffect, useState } from "react";
import { toaster } from "../../../components/ui/toaster";
export default function ExamBody() {
  const { examData, answers, saveAnswer } = useExam();
  const [tabValue, setTabValue] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(
    !!document.fullscreenElement
  );

  useEffect(() => {
    if (examData?.sections?.length > 0) {
      setTabValue(examData.sections[0].section);
      setCurrentQuestionIndex(
        examData?.sections.reduce((acc, section) => {
          acc[section.section] = 0;
          return acc;
        }, {})
      );
    }
  }, [examData]);

  if (!examData || !examData.sections) {
    return (
      <Flex align="center" minH="70vh" justify="center">
        <Text fontSize="lg" color="gray.600">
          Loading exam...
        </Text>
      </Flex>
    );
  }

  useEffect(() => {
    //Tab switch
    const handleVisibilityChange = () => {
      if (document.hidden) {
        alert("You have switched tabs! This will be reported.");
        toaster.create({
          title: "Tab Switch Detected",
          type: "warning",
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    //Disable right clikc/copy
    const disableRightClick = (e) => e.preventDefault();
    const disableCopy = (e) => e.preventDefault();

    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("copy", disableCopy);
    document.addEventListener("cut", disableCopy);
    document.addEventListener("paste", disableCopy);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        toaster.create({
          title: "Fullscreen Required",
          type: "warning",
        });
        enforceFullScreen();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("copy", disableCopy);
      document.removeEventListener("cut", disableCopy);
      document.removeEventListener("paste", disableCopy);
      document.removeEventListener("keydown", handleKeyDown);
      // document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);
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
            {examData?.sections.map((section, idx) => (
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
          {examData?.sections?.map((section) => {
            const qIndex = currentQuestionIndex[section?.section];
            const question = section?.questions[qIndex];
            if (!question) return null;
            return (
              <Tabs.Content
                key={section?.section}
                py={4}
                value={section?.section}
              >
                {/* current question */}
                <Flex direction="column" mb={4}>
                  <Image src={question?.imageUrl} w="40%" />
                  <Text
                    ml={4}
                    mb={2}
                    dangerouslySetInnerHTML={{ __html: question?.topic }}
                  />

                  <Flex mb={2} gap={4}>
                    <Text mb={2} fontWeight="medium">
                      {qIndex + 1}.
                    </Text>
                    <Text
                      dangerouslySetInnerHTML={{
                        __html: question?.questionText,
                      }}
                    />
                  </Flex>

                  <Flex direction="column" gap={4}>
                    {Object.entries(question.options).map(([key, opt], i) => {
                      const inputName = `${section?.section}-${question.id}`;

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
      </Flex>
    </Box>
  );
}
