import {
  Flex,
  Text,
  Box,
  SimpleGrid,
  Button,
  Icon,
  Badge,
} from "@chakra-ui/react";
import { fetchExams } from "../../../../../api-endpoint/exam/exams";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  FaChartBar,
  FaFileAlt,
  FaClock,
  FaArrowRight,
  FaCalendarAlt,
} from "react-icons/fa";

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
      bg="#F8FAFC"
      mt="68px"
      p={{ base: 4, md: 8 }}
      ml={{ base: 0, lg: "240px" }}
      w={{ base: "100%", lg: "calc(100% - 240px)" }}
      minH="calc(100vh - 68px)"
    >
      <Box maxW="1200px" mx="auto">
        {/* Page Header */}
        <Box mb={8}>
          <Flex align="center" gap={2.5} mb={1}>
            <Flex
              w="38px"
              h="38px"
              borderRadius="xl"
              bg="purple.50"
              color="#6A1B9A"
              align="center"
              justify="center"
            >
              <Icon as={FaChartBar} boxSize={5} />
            </Flex>
            <Text
              fontSize={{ base: "22px", md: "26px" }}
              fontWeight="800"
              color="#0F172A"
              fontFamily="'Outfit', sans-serif"
            >
              Examination Results & Performance
            </Text>
            <Badge
              bg="purple.50"
              color="#6A1B9A"
              border="1px solid #E9D5FF"
              borderRadius="full"
              px={2.5}
              py={0.5}
              fontSize="12px"
              fontWeight="700"
            >
              {exams.length} Exams
            </Badge>
          </Flex>
          <Text fontSize="14px" color="#64748B">
            Select a completed or ongoing assessment to inspect candidate scores, class averages, and exportable grade sheets.
          </Text>
        </Box>

        {exams.length === 0 ? (
          <Box
            p={12}
            bg="white"
            borderRadius="24px"
            border="1px solid #E2E8F0"
            textAlign="center"
          >
            <Icon as={FaFileAlt} boxSize={8} color="#CBD5E1" mb={3} />
            <Text fontSize="16px" fontWeight="700" color="#0F172A" mb={1}>
              No Examination Records Found
            </Text>
            <Text fontSize="13px" color="#64748B" mb={4}>
              Create and conduct CBT exams to view auto-graded reports and analytics here.
            </Text>
            <Button
              bg="#6A1B9A"
              color="white"
              borderRadius="xl"
              onClick={() => navigate("/teacher/create_exam")}
            >
              Schedule New Exam
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {exams.map((exam) => (
              <Box
                key={exam.id}
                p={6}
                bg="white"
                borderRadius="24px"
                border="1px solid"
                borderColor="#E2E8F0"
                boxShadow="0 2px 12px rgba(0,0,0,0.03)"
                _hover={{
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 24px rgba(106, 27, 154, 0.08)",
                  borderColor: "#C084FC",
                }}
                transition="all 0.2s ease"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                cursor="pointer"
                onClick={() => navigate(`/teacher/exam_results/${exam.id}`)}
              >
                <Box mb={6}>
                  <Flex justify="space-between" align="flex-start" mb={3}>
                    <Badge
                      bg="purple.50"
                      color="#6A1B9A"
                      borderRadius="md"
                      px={2}
                      py={0.5}
                      fontSize="10px"
                      fontWeight="700"
                    >
                      CBT ASSESSMENT
                    </Badge>
                    <Flex align="center" gap={1} color="#64748B" fontSize="12px">
                      <Icon as={FaClock} boxSize={3} color="#7C3AED" />
                      <Text fontWeight="600">{exam?.duration || "60"}m</Text>
                    </Flex>
                  </Flex>

                  <Text
                    fontSize="18px"
                    fontWeight="800"
                    color="#0F172A"
                    fontFamily="'Outfit', sans-serif"
                    lineHeight="1.3"
                    mb={2}
                  >
                    {exam?.title}
                  </Text>
                  <Text fontSize="13px" color="#64748B" noOfLines={2}>
                    {exam?.description || "Automated multi-subject testing with real-time scoring and instant feedback."}
                  </Text>
                </Box>

                <Flex
                  justify="space-between"
                  align="center"
                  pt={4}
                  borderTop="1px solid"
                  borderColor="#F1F5F9"
                  color="#6A1B9A"
                  fontSize="13px"
                  fontWeight="700"
                >
                  <Text>View Candidate Scores</Text>
                  <Icon as={FaArrowRight} boxSize={3} />
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
}
