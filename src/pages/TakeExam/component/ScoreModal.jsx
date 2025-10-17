import { Flex, Text, Button } from "@chakra-ui/react";

import { useExam } from "./ExamContext";

export default function ScoreModal({ onClose }) {
  const { scores, examData, totalScore } = useExam();

  const totalMarks = examData.totalMarks || 400;
  const percentage = (totalScore / totalMarks) * 100;
  return (
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
      <Flex direction="column" justify={"center"} alignItems="center">
        <Text>Your Results</Text>
        {Object.entries(scores).map(([section, score]) => (
          <Text key={section}>
            {section}: {score.toFixed(2)} marks
          </Text>
        ))}
        <Text>
          Total Score: {totalScore.toFixed(2)} / {examData.totalMarks}
        </Text>

        <Text>Percentage: {percentage.toFixed(1)}%</Text>

        <Button mt={4} bg="danger" onClick={onClose} borderRadius="full" px={6}>
          Close
        </Button>
      </Flex>
    </Flex>
  );
}
