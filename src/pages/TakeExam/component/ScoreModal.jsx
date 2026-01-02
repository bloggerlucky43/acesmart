import { Flex, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useExam } from "./ExamContext";
import { useState } from "react";
import { saveExamResult } from "../../../api-endpoint/exam/exams";
import { toaster } from "../../../components/ui/toaster";
function ScoreModal({ onClose }) {
  const { scores, examData, totalScore } = useExam();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const totalMarks = examData.totalMarks || 400;
  const percentage = (totalScore / totalMarks) * 100;

  const handleContinueButton = async () => {
    setLoading(true);
    try {
      const student = localStorage?.getItem("examStudent");
      const parsedStudent = JSON.parse(student);
      console.log("the parsed stdebt is", student, parsedStudent);

      const res = await saveExamResult({
        scores,
        studentId: parsedStudent?.id,
        studentCode: parsedStudent?.studentId,
        examId: examData?.id,
        examTitle: examData?.title,
        totalMarks: examData?.duration,
      });
      if (res.data) {
        toaster.create({
          title: "Exam result saved successfully",
          type: "success",
        });
        navigate(`/exam/${examData?.id}`);
        onClose();
      }
    } catch (error) {
      console.error("failed to save exam", error);
    } finally {
      localStorage.removeItem("examData");
      localStorage.removeItem("examStudent");
      setLoading(false);
    }
  };
  return (
    <Flex
      position="fixed"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      zIndex={1000}
      bg="white"
      minH="50vh"
      minW="40vw"
      justify="center"
      // align="center"
      boxShadow="lg"
      borderRadius="md"
      p={6}
    >
      <Flex w="80%" direction="column">
        <Text mb={8} textAlign={"center"} fontSize="2xl" color="primary">
          Your Results
        </Text>
        {Object.entries(scores).map(([section, score]) => (
          <Flex mb={6} key={section} justify="space-between">
            <Text>{section}</Text>
            <Text>{score.toFixed(2)} </Text>
          </Flex>
        ))}

        <Flex justify="space-between">
          <Text>You Scored</Text>
          <Text> {totalScore.toFixed(2)}</Text>
        </Flex>

        <Flex mt={4} justify={"space-between"}>
          <Text>Total Score</Text>
          <Text>{examData.totalMarks}</Text>
        </Flex>

        <Flex mt={4} justify="space-between">
          <Text>Accuracy</Text>
          {/* <Button mt={4} bg="danger" onClick={onClose} borderRadius="full" px={6}>
          Close
        </Button> */}
          <Text> {percentage.toFixed(1)}%</Text>
        </Flex>
        <Flex mt={4}>
          <Button
            bg="primary"
            loading={loading}
            loadingText="Saving..."
            spinnerPlacement="right"
            onClick={handleContinueButton}
            mt={4}
          >
            Continue
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default ScoreModal;
