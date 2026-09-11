import Cards from "../../components/teacher/cards";
import Performance from "../../components/teacher/performance";
import DashboardLayout from "../../constants/dashboardlayout";
import MCards from "../../mobile/component/cards";
import MPerformance from "../../mobile/component/performance";
import MobileLayout from "../../mobile/constant/mobilelayout";
import { Box, useBreakpointValue, Flex, Text, Button, Icon } from "@chakra-ui/react";
import { FaGraduationCap, FaPlus, FaBookOpen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../libs/AuthProvider";

const Teacher = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const navigate = useNavigate();
  const { user } = useAuth();
  const teacherName = user?.name || user?.username || "Educator";

  return (
    <Box>
      {isMobile ? (
        <MobileLayout>
          <MCards />
          <MPerformance />
        </MobileLayout>
      ) : (
        <DashboardLayout>
          <Box
            ml={{ base: 0, lg: "240px" }}
            w={{ base: "100%", lg: "calc(100% - 240px)" }}
            pt={{ base: "84px", lg: "88px" }}
            px={{ base: 4, md: 6, lg: 8 }}
            pb={{ base: 6, md: 8 }}
            maxW="1600px"
          >
            
            {/* Welcome Banner */}
            <Box
              p={{ base: 6, md: 8 }}
              borderRadius="28px"
              bg="linear-gradient(135deg, #1E1B4B 0%, #3B0764 50%, #581C87 100%)"
              color="white"
              boxShadow="0 10px 30px rgba(59, 7, 100, 0.2)"
              mb={8}
              position="relative"
              overflow="hidden"
            >
              {/* Background ambient accents */}
              <Box
                position="absolute"
                top="-50%"
                right="-10%"
                w="350px"
                h="350px"
                borderRadius="full"
                bg="radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)"
                filter="blur(40px)"
                pointerEvents="none"
              />

              <Flex
                direction={{ base: "column", md: "row" }}
                justify="space-between"
                align={{ base: "flex-start", md: "center" }}
                gap={6}
                position="relative"
                zIndex={1}
              >
                <Box maxW="680px">
                  <Flex align="center" gap={2} mb={2}>
                    <Box
                      px={2.5}
                      py={0.5}
                      borderRadius="full"
                      bg="rgba(255,255,255,0.15)"
                      border="1px solid rgba(255,255,255,0.2)"
                      fontSize="11px"
                      fontWeight="700"
                      color="purple.100"
                      letterSpacing="0.5px"
                    >
                      CBT COMMAND CENTER
                    </Box>
                  </Flex>

                  <Text
                    as="h1"
                    fontSize={{ base: "24px", md: "32px" }}
                    fontWeight="800"
                    fontFamily="'Outfit', sans-serif"
                    lineHeight="1.2"
                    mb={2}
                  >
                    Welcome, {teacherName} 👋
                  </Text>
                  <Text fontSize="15px" color="purple.100" lineHeight="1.6">
                    Manage your CBT examination schedules, monitor live candidate progress,
                    and review auto-graded assessment metrics across all departments.
                  </Text>
                </Box>

                <Flex gap={3} flexWrap="wrap">
                  <Button
                    bg="white"
                    color="#581C87"
                    h="46px"
                    px={5}
                    borderRadius="xl"
                    fontSize="14px"
                    fontWeight="700"
                    boxShadow="0 4px 14px rgba(0,0,0,0.15)"
                    _hover={{ bg: "purple.50", transform: "translateY(-1px)" }}
                    onClick={() => navigate("/teacher/create_exam")}
                  >
                    <Icon as={FaPlus} mr={2} boxSize={3.5} />
                    Schedule Exam
                  </Button>

                  <Button
                    variant="outline"
                    bg="rgba(255,255,255,0.1)"
                    borderColor="rgba(255,255,255,0.3)"
                    color="white"
                    h="46px"
                    px={5}
                    borderRadius="xl"
                    fontSize="14px"
                    fontWeight="700"
                    _hover={{ bg: "rgba(255,255,255,0.2)" }}
                    onClick={() => navigate("/teacher/add_questions")}
                  >
                    <Icon as={FaBookOpen} mr={2} boxSize={3.5} />
                    Question Bank
                  </Button>
                </Flex>
              </Flex>
            </Box>

            {/* Metric KPI Cards & Action Bar */}
            <Cards />

            {/* Performance Analytics Grid */}
            <Performance />
          </Box>
        </DashboardLayout>
      )}
    </Box>
  );
};

export default Teacher;
