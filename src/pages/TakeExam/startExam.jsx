import { Box, Flex, Text, Button } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchLiveExam } from "../../api-endpoint/exam/exams";

export default function StartExam() {
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const handleStartExam = async () => {
    try {
      localStorage.getItem("examStudent");
      const res = await fetchLiveExam({ studentId, examId: id });
    } catch (error) {}
  };
  return (
    <Flex bg="gray.200" justify="center" minH="100vh">
      <Flex
        // justifySelf="center"
        alignSelf={"center"}
        minH="50vh"
        w="70%"
        direction="column"
        justify="center"
        align={"center"}
      >
        <Flex w="50%" justify="space-between">
          <Text>Name</Text>
          <Text>Adesare adegnaji</Text>
        </Flex>
        <Flex w="50%" justify="space-between">
          <Text>Registration Number</Text>
          <Text>22/1928ddjd</Text>
        </Flex>
        <Flex w="50%" justify="space-between">
          <Text>Registration Number</Text>
          <Text>22/1928ddjd</Text>
        </Flex>
        <Flex w="50%" justify="space-between">
          <Text>Registration Number</Text>
          <Text>22/1928ddjd</Text>
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
