import { Box, Flex, Text, Button } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchLiveExam } from "../../api-endpoint/exam/exams";
import { useEffect } from "react";
import { useExam } from "../TakeExam/component/ExamContext";
import { toaster } from "../../components/ui/toaster";
export default function StartExam() {
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();
  const [userDetails, setUserDetails] = useState({});
  const navigate = useNavigate();
  const { loadExamData } = useExam();

  useEffect(() => {
    const storedUser = localStorage?.getItem("examStudent");

    if (storedUser) setUserDetails(JSON.parse(storedUser));
  }, []);

  const handleStartExam = async () => {
    if (!userDetails?.studentId) {
      toaster.error({ title: "Missing student details" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetchLiveExam({
        studentId: userDetails?.studentId,
        examId: id,
      });
      if (res.success) {
        loadExamData(res.exam);
        toaster.success({ title: "Exam loaded successfully" });
        navigate(`/take_exam?${id}`);
      } else {
        toaster.error({ title: res.message || "Exam not found" });
      }
    } catch (error) {
      toaster.error({ title: "Error loading exam" });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Flex bg="gray.200" justify="center" minH="100vh">
      <Flex
        // justifySelf="center"
        alignSelf={"center"}
        minH="50vh"
        w="50%"
        bg="white"
        boxShadow={"md"}
        direction="column"
        justify="center"
        align={"center"}
      >
        <Flex w="70%" justify="space-between">
          <Text>Name</Text>
          <Text>
            {userDetails?.firstName} {""}
            {userDetails?.lastName}
          </Text>
        </Flex>
        <Flex w="70%" justify="space-between">
          <Text>Student ID</Text>
          <Text>{userDetails?.studentId}</Text>
        </Flex>

        <Flex bg="red" mt="6vh" w="50%" justifySelf="center">
          <Button
            onClick={handleStartExam}
            loading={isLoading}
            bg="primary"
            w="full"
          >
            Start Exam
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
