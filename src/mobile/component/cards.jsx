import { Box, Flex, Text, Spinner, SimpleGrid, Icon, Button } from "@chakra-ui/react";
import {
  FaUsers,
  FaBook,
  FaClipboardList,
  FaTrophy,
  FaPlus,
  FaChartBar,
} from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getDashboardStats } from "../../api-endpoint/auth/auths";

const MCards = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
    staleTime: 5 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const dashboardStats = data?.data || {};
  const studentCount = dashboardStats?.studentCount ?? 0;
  const questionCount = dashboardStats?.questionCount ?? 0;
  const examCount = dashboardStats?.examCount ?? 0;
  const passRate = dashboardStats?.passRate ?? 88;

  if (isLoading) {
    return (
      <Flex h="140px" justify="center" align="center">
        <Spinner size="lg" color="#6A1B9A" />
      </Flex>
    );
  }

  const statList = [
    { label: "Students", val: studentCount, icon: FaUsers, color: "#7C3AED", bg: "purple.50" },
    { label: "Questions", val: questionCount, icon: FaBook, color: "#059669", bg: "green.50" },
    { label: "Tests Held", val: examCount, icon: FaClipboardList, color: "#2563EB", bg: "blue.50" },
    { label: "Pass Rate", val: `${passRate}%`, icon: FaTrophy, color: "#D97706", bg: "orange.50" },
  ];

  return (
    <Box mb={5}>
      {/* 2x2 Grid of Stat Cards */}
      <SimpleGrid columns={2} gap={3} mb={4}>
        {statList.map((s, i) => (
          <Box
            key={i}
            p={4}
            bg="white"
            borderRadius="2xl"
            border="1px solid"
            borderColor="#E2E8F0"
            boxShadow="0 2px 8px rgba(0,0,0,0.02)"
          >
            <Flex
              w="36px"
              h="36px"
              borderRadius="xl"
              bg={s.bg}
              color={s.color}
              align="center"
              justify="center"
              mb={2}
            >
              <Icon as={s.icon} boxSize={4} />
            </Flex>
            <Text fontSize="22px" fontWeight="800" color="#0F172A" lineHeight="1.1" mb={1}>
              {s.val}
            </Text>
            <Text fontSize="12px" fontWeight="600" color="#64748B">
              {s.label}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      {/* Mobile Quick Action Buttons */}
      <Flex gap={2}>
        <Button
          flex={1}
          size="sm"
          bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
          color="white"
          borderRadius="xl"
          h="40px"
          fontSize="12px"
          fontWeight="700"
          onClick={() => navigate("/teacher/create_exam")}
        >
          <Icon as={FaPlus} mr={1.5} boxSize={3} />
          Create Exam
        </Button>
        <Button
          flex={1}
          size="sm"
          variant="outline"
          borderColor="#E2E8F0"
          bg="white"
          color="#334155"
          borderRadius="xl"
          h="40px"
          fontSize="12px"
          fontWeight="700"
          onClick={() => navigate("/teacher/exam_result")}
        >
          <Icon as={FaChartBar} mr={1.5} boxSize={3} />
          Results
        </Button>
      </Flex>
    </Box>
  );
};

export default MCards;
