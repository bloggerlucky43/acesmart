import { Flex, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useExam } from "./ExamContext";
import { useRef, useState } from "react";
import {
  checkResultExisting,
  // saveExamResult,
} from "../../../api-endpoint/exam/exams";
import { toaster } from "../../../components/ui/toaster";
import { useEffect } from "react";
import { saveWithRetry } from "../../../libs/helper";
function ScoreModal({ onClose }) {
  const { scores, examData, totalScore } = useExam();
  const [resultExists, setResultExists] = useState(false);
  const [checking, setChecking] = useState(true);
  const [saveStatus, setSaveStatus] = useState("loading");
  const [retryCount, setRetryCount] = useState(0);
  const hasProcessedRef = useRef(false);
  const navigate = useNavigate();
  const totalMarks = examData?.totalMarks || 400;
  const percentage = (totalScore / totalMarks) * 100;

  const student = localStorage.getItem("examStudent");
  const parsedStudent = JSON.parse(student);

  //Check if result already exists
  useEffect(() => {
    const CheckExistingResult = async () => {
      //Prevent rerun after save
      if (hasProcessedRef.current) return;
      hasProcessedRef.current = true;

      try {
        console.log("The parsed student at the useeffect is ", parsedStudent);

        const res = await checkResultExisting({
          studentId: parsedStudent?.studentId,
          examId: examData?.id,
        });

        if (res?.exists) {
          setResultExists(true);

          toaster.create({
            title: "Result already exists for this exam",
            type: "warning",
          });

          //Navigate back after short delay
          navigate(`/exam/${examData?.id}`, { replace: true });
          onClose();
          return;
        } else {
          try {
            const res = await saveWithRetry({
              scores,
              studentId: parsedStudent?.id,
              studentCode: parsedStudent?.studentId,
              examId: examData?.id,
              examTitle: examData?.title,
              totalMarks: examData?.totalMarks,
            });
            if (res.data) {
              toaster.create({
                title: "Exam result saved successfully",
                type: "success",
              });

              setSaveStatus("success");

              localStorage.removeItem("examData");
              localStorage.removeItem("examStudent");
            }
          } catch (error) {
            console.error("failed to save exam", error);
            setSaveStatus("error");

            toaster.create({
              title: "Failed to save exam result after multiple attempts.",
              description:
                "Please check your internet connection and try again.",
              type: "error",
            });
          }
        }
      } catch (error) {
        console.error("Error checking result existence", error);
      } finally {
        setChecking(false);
      }
    };

    if (student && examData?.id) {
      CheckExistingResult();
    }
  }, [student, examData?.id, navigate, onClose, retryCount]);

  //Do not render scores if result exists or still checking

  if (checking || resultExists || saveStatus !== "success") {
    return (
      <Flex
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        zIndex={2000}
        bg="white"
        boxShadow={"lg"}
        borderRadius={"md"}
        minH="40vh"
        minW="50vw"
        justify="center"
        align="center"
      >
        {checking && (
          <Text fontSize="lg" color="gray.900">
            Finalizing your exam result...
          </Text>
        )}

        {saveStatus === "error" && (
          <>
            <Text color="red.500" mb={4}>
              Unable to save result after multiple attempts
            </Text>
            <Button
              bg="primary"
              onClick={() => {
                hasProcessedRef.current = false;
                setSaveStatus("loading");
                setRetryCount((c) => c + 1);
              }}
            >
              Retry
            </Button>
          </>
        )}
      </Flex>
    );
  }

  const handleContinueButton = () => {
    navigate(`/exam/${examData?.id}`);
    onClose();
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
          <Text>{totalMarks}</Text>
        </Flex>

        <Flex mt={4} justify="space-between">
          <Text>Accuracy</Text>

          <Text> {percentage.toFixed(1)}%</Text>
        </Flex>
        <Flex mt={4}>
          <Button bg="primary" onClick={handleContinueButton} mt={4}>
            Continue
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default ScoreModal;
