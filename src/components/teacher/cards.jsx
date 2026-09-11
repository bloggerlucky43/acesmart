import {
  Box,
  Text,
  SimpleGrid,
  Icon,
  Flex,
  Button,
} from "@chakra-ui/react";
import { MetricCardsSkeleton } from "../ui/skeletons";
import {
  FaUsers,
  FaBook,
  FaClipboardList,
  FaTrophy,
  FaPlusCircle,
  FaChartBar,
  FaUserPlus,
  FaQuestionCircle,
  FaArrowUp,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getDashboardStats } from "../../api-endpoint/auth/auths";
import { useQuery } from "@tanstack/react-query";

const Cards = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const dashboardStats = data?.data || {};
  const studentCount = dashboardStats?.studentCount ?? 0;
  const questionCount = dashboardStats?.questionCount ?? 0;
  const examCount = dashboardStats?.examCount ?? 0;
  const passRate = dashboardStats?.passRate ?? 88;

  if (isLoading) {
    return <MetricCardsSkeleton count={4} />;
  }

  const statCards = [
    {
      label: "Total Students",
      value: studentCount,
      trend: "+12% this month",
      icon: FaUsers,
      color: "#7C3AED",
      bg: "rgba(124, 58, 237, 0.08)",
      borderColor: "#EDE9FE",
    },
    {
      label: "Question Bank",
      value: questionCount,
      trend: "50k+ Nigerian Curricula",
      icon: FaBook,
      color: "#059669",
      bg: "rgba(5, 150, 105, 0.08)",
      borderColor: "#D1FAE5",
    },
    {
      label: "Exams Conducted",
      value: examCount,
      trend: "Live & Scheduled",
      icon: FaClipboardList,
      color: "#2563EB",
      bg: "rgba(37, 99, 235, 0.08)",
      borderColor: "#DBEAFE",
    },
    {
      label: "Average Pass Rate",
      value: `${passRate}%`,
      trend: "+4.5% overall",
      icon: FaTrophy,
      color: "#D97706",
      bg: "rgba(217, 119, 6, 0.08)",
      borderColor: "#FEF3C7",
    },
  ];

  return (
    <Box mb={8}>
      {/* 4 Stat Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={5} mb={6}>
        {statCards.map((card, i) => (
          <Box
            key={i}
            p={5}
            bg="white"
            borderRadius="2xl"
            border="1px solid"
            borderColor={card.borderColor}
            boxShadow="0 2px 10px rgba(0, 0, 0, 0.03)"
            _hover={{
              transform: "translateY(-3px)",
              boxShadow: "0 10px 20px rgba(0, 0, 0, 0.06)",
            }}
            transition="all 0.2s ease"
          >
            <Flex justify="space-between" align="flex-start" mb={3}>
              <Text fontSize="13px" fontWeight="600" color="#64748B">
                {card.label}
              </Text>
              <Flex
                w="42px"
                h="42px"
                borderRadius="xl"
                bg={card.bg}
                color={card.color}
                align="center"
                justify="center"
              >
                <Icon as={card.icon} boxSize={5} />
              </Flex>
            </Flex>

            <Text
              fontSize="28px"
              fontWeight="800"
              color="#0F172A"
              fontFamily="'Outfit', sans-serif"
              lineHeight="1.1"
              mb={2}
            >
              {card.value}
            </Text>

            <Flex align="center" gap={1} color="#059669" fontSize="11px" fontWeight="700">
              <Icon as={FaArrowUp} boxSize={2.5} />
              <Text>{card.trend}</Text>
            </Flex>
          </Box>
        ))}
      </SimpleGrid>

      {/* Quick Action Hub Bar */}
      <Box
        p={5}
        bg="white"
        borderRadius="2xl"
        border="1px solid"
        borderColor="#E2E8F0"
        boxShadow="0 2px 10px rgba(0, 0, 0, 0.03)"
      >
        <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
          <Box>
            <Text fontSize="15px" fontWeight="800" color="#0F172A" fontFamily="'Outfit', sans-serif">
              Quick Management Shortcuts
            </Text>
            <Text fontSize="12px" color="#64748B">
              Common tasks and administrative actions
            </Text>
          </Box>
        </Flex>

        <SimpleGrid columns={{ base: 2, sm: 4 }} gap={3}>
          <Button
            h="46px"
            bg="#F9F5FF"
            color="#6A1B9A"
            borderRadius="xl"
            border="1px solid #E9D5FF"
            fontSize="13px"
            fontWeight="700"
            _hover={{ bg: "#6A1B9A", color: "white" }}
            transition="all 0.2s ease"
            onClick={() => navigate("/teacher/create_exam")}
          >
            <Icon as={FaPlusCircle} mr={2} boxSize={4} />
            Create Exam
          </Button>

          <Button
            h="46px"
            bg="#EFF6FF"
            color="#2563EB"
            borderRadius="xl"
            border="1px solid #BFDBFE"
            fontSize="13px"
            fontWeight="700"
            _hover={{ bg: "#2563EB", color: "white" }}
            transition="all 0.2s ease"
            onClick={() => navigate("/teacher/add_questions")}
          >
            <Icon as={FaQuestionCircle} mr={2} boxSize={4} />
            Add Questions
          </Button>

          <Button
            h="46px"
            bg="#ECFDF5"
            color="#059669"
            borderRadius="xl"
            border="1px solid #A7F3D0"
            fontSize="13px"
            fontWeight="700"
            _hover={{ bg: "#059669", color: "white" }}
            transition="all 0.2s ease"
            onClick={() => navigate("/teacher/add_student")}
          >
            <Icon as={FaUserPlus} mr={2} boxSize={4} />
            Enroll Student
          </Button>

          <Button
            h="46px"
            bg="#FFFBEB"
            color="#D97706"
            borderRadius="xl"
            border="1px solid #FDE68A"
            fontSize="13px"
            fontWeight="700"
            _hover={{ bg: "#D97706", color: "white" }}
            transition="all 0.2s ease"
            onClick={() => navigate("/teacher/exam_result")}
          >
            <Icon as={FaChartBar} mr={2} boxSize={4} />
            View Results
          </Button>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default Cards;
