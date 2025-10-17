import { Text, Flex, Button } from "@chakra-ui/react";
import { useState } from "react";
import ScoreModal from "./ScoreModal";
import { useExam } from "./ExamContext";
const SubmitModal = ({ onClose }) => {
  const [submitted, setSubmitted] = useState(false);

  const { examData, answers, submitExam } = useExam();

  const handleSubmit = () => {
    setSubmitted(true);
    submitExam();
    // onClose();
  };

  // total number of questions across all sections
  const totalQuestions = examData.sections.reduce(
    (sum, section) => sum + section.questions.length,
    0
  );

  // total answered questions
  const answeredCount = Object.keys(answers).length;
  console.log("Total Questions:", totalQuestions);

  return (
    <>
      <Flex
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        zIndex={1000}
        bg="gray.400"
        minH="50vh"
        minW="40vw"
        justify="center"
        align="center"
        boxShadow="lg"
        borderRadius="md"
        p={6}
      >
        <Flex direction={"column"} justify="center" alignItems={"center"}>
          <Text color="black" fontSize="3xl">
            Are you sure you want to submit?
          </Text>
          <Text color="gray.800" textAlign={"center"} mt={2}>
            You answered {answeredCount} questions out of {totalQuestions}{" "}
            questions
          </Text>
          <Flex gap={4} mt={4}>
            <Button size="md" bg="secondary" onClick={handleSubmit}>
              Yes
            </Button>
            <Button size="md" bg="danger" onClick={onClose}>
              No
            </Button>
          </Flex>
        </Flex>
      </Flex>

      {submitted && <ScoreModal onClose={() => setSubmitted(false)} />}
    </>
  );
};

export default SubmitModal;
