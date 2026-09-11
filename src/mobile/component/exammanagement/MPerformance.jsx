import {
  Flex,
  Text,
  Box,
  Badge,
  Icon,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { fetchExams } from "../../../api-endpoint/exam/exams";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CardGridSkeleton } from "../../../components/ui/skeletons";
import { FaGraduationCap, FaChevronRight, FaClipboardCheck } from "react-icons/fa";

export const MPerformance = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["exams"],
    queryFn: fetchExams,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  const exams = data?.data || [];

  return (
    <Box p={4} minH="calc(100vh - 58px)" bg="#F8FAFC">
      {/* Header Banner */}
      <Box
        bg="linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)"
        p={5}
        borderRadius="xl"
        color="white"
        mb={5}
        boxShadow="0 4px 14px 0 rgba(15, 23, 42, 0.2)"
      >
        <HStack spacing={3} mb={2}>
          <Flex
            w="36px"
            h="36px"
            borderRadius="lg"
            bg="rgba(99, 102, 241, 0.25)"
            align="center"
            justify="center"
            border="1px solid rgba(129, 140, 248, 0.4)"
          >
            <Icon as={FaClipboardCheck} color="#818CF8" boxSize={4} />
          </Flex>
          <Box>
            <Text fontSize="md" fontWeight="bold" lineHeight="1.2">
              Exam Results & Analytics
            </Text>
            <Text fontSize="xs" color="#94A3B8">
              Select an exam to inspect candidate score sheets
            </Text>
          </Box>
        </HStack>
      </Box>

      {/* Loading state */}
      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : exams.length === 0 ? (
        <Box
          bg="white"
          p={8}
          borderRadius="xl"
          border="1px dashed #CBD5E1"
          textAlign="center"
        >
          <Icon as={FaGraduationCap} boxSize={8} color="#94A3B8" mb={3} />
          <Text fontWeight="semibold" color="#334155" mb={1}>
            No exams found
          </Text>
          <Text fontSize="xs" color="#64748B">
            Create an examination to start recording candidate scores.
          </Text>
        </Box>
      ) : (
        <VStack spacing={3} align="stretch">
          {exams.map((exam) => (
            <Box
              key={exam.id}
              bg="white"
              p={4}
              borderRadius="xl"
              border="1px solid #E2E8F0"
              boxShadow="0 1px 3px rgba(0, 0, 0, 0.05)"
              cursor="pointer"
              transition="all 0.2s ease"
              _active={{
                transform: "scale(0.99)",
                borderColor: "#6366F1",
              }}
              onClick={() => {
                navigate(`/teacher/exam_results/${exam.id}`);
              }}
            >
              <Flex justify="space-between" align="flex-start" mb={2}>
                <VStack align="flex-start" spacing={1} maxW="80%">
                  <Badge
                    bg="rgba(79, 70, 229, 0.1)"
                    color="#4F46E5"
                    fontSize="10px"
                    fontWeight="bold"
                    px={2}
                    py={0.5}
                    borderRadius="full"
                  >
                    EXAM ID: {exam.id}
                  </Badge>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color="#0F172A"
                    lineHeight="1.3"
                  >
                    {exam?.title}
                  </Text>
                </VStack>
                <Flex
                  w="28px"
                  h="28px"
                  borderRadius="full"
                  bg="#F1F5F9"
                  align="center"
                  justify="center"
                >
                  <Icon as={FaChevronRight} color="#64748B" boxSize={3} />
                </Flex>
              </Flex>

              {exam?.description && (
                <Text
                  fontSize="xs"
                  color="#64748B"
                  noOfLines={2}
                  mb={3}
                >
                  {exam.description}
                </Text>
              )}

              <Flex
                pt={2}
                borderTop="1px solid #F1F5F9"
                justify="space-between"
                align="center"
              >
                <Text fontSize="11px" fontWeight="medium" color="#818CF8">
                  View Candidate Scores
                </Text>
                <Badge
                  colorPalette="green"
                  variant="subtle"
                  fontSize="10px"
                  borderRadius="full"
                  px={2}
                >
                  Published
                </Badge>
              </Flex>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};
