import { Flex, Text, Box, Accordion, useDisclosure } from "@chakra-ui/react";
import { fetchExams } from "../../../../../api-endpoint/exam/exams";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
export default function Results() {
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["exams"],
    queryFn: fetchExams,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  const exams = data?.data || [];
  return (
    <Box
      bg="gray.200"
      mt={"9vh"}
      p={6}
      ml={"200px"}
      w={"calc(100% - 200px)"}
      minH="100vh"
      cursor="pointer"
    >
      <Text mt={4} fontSize="2xl">
        Check Exam Results
      </Text>
      <Flex bg="white" p={4} boxShadow={"md"} direction="column">
        <Text>Select an exam to view student results.</Text>
        {exams?.map((exam) => (
          <Flex mt={4} direction="column" key={exam.id}>
            <Text
              onClick={() => {
                console.log("exam id", exam.id);
                navigate(`/teacher/exam_results/${exam.id}`);
              }}
              fontSize="xl"
              fontWeight={"semibold"}
            >
              {exam?.title}
            </Text>
            <Text color="gray.600">{exam?.description}</Text>
          </Flex>
        ))}
      </Flex>

      <Flex></Flex>
    </Box>
  );
}
