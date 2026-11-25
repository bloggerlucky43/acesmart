import { Box, Button, Flex, Icon, SimpleGrid, Text, useBreakpointValue } from "@chakra-ui/react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import TeachingAssignments from "../../components/teacher/TeachingAssignments";
import DashboardLayout from "../../constants/dashboardlayout";
import { useAuth } from "../../libs/AuthProvider";
import MobileLayout from "../../mobile/constant/mobilelayout";

export default function TeacherProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const fields = [
    ["Name", user?.name],
    ["Username", user?.username],
    ["Email", user?.email],
    ["Phone Number", user?.phoneNumber],
    ["Staff ID", user?.staffIdNumber],
    ["Designation", user?.designation],
    ["School", user?.institution?.name],
  ];
  const content = (
    <>
      <Flex justify="space-between" align="center" gap={3} wrap="wrap" mb={5}>
        <Flex gap={3} align="center">
          <Icon as={FaUserCircle} boxSize={7} color="#4338CA" />
          <Box>
            <Text as="h1" fontSize={{ base: "22px", md: "28px" }} fontWeight="800" color="#0F172A">
              My Profile
            </Text>
            <Text fontSize="13px" color="#64748B">Your account details and administrator-approved teaching assignments.</Text>
          </Box>
        </Flex>
        <Button variant="outline" borderRadius="xl" minH="44px" onClick={() => navigate("/teacher_dashboard")}>
          Back to Dashboard
        </Button>
      </Flex>
      <Box mb={5} p={{ base: 4, md: 5 }} bg="white" border="1px solid #E2E8F0" borderRadius="2xl">
        <Text as="h2" fontSize="16px" fontWeight="800" color="#0F172A" mb={4}>Personal Details</Text>
        <SimpleGrid as="dl" columns={{ base: 1, md: 2 }} gap={4}>
          {fields.map(([label, value]) => (
            <Box key={label} minW={0}>
              <Text as="dt" fontSize="12px" color="#64748B" mb={1}>{label}</Text>
              <Text as="dd" fontSize="14px" fontWeight="600" color="#334155" overflowWrap="anywhere">
                {value || "Not provided"}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
      <TeachingAssignments />
      {user?.role !== "teacher" && (
        <Box p={4} bg="white" border="1px solid #E2E8F0" borderRadius="2xl">
          <Text fontSize="13px" color="#64748B">
            Current Session: {user?.institution?.academicSession || "Not configured"}
          </Text>
          <Text fontSize="13px" color="#64748B" mt={2}>
            Teaching assignments apply to teacher accounts. Manage approved staff assignments in the Faculty Directory.
          </Text>
        </Box>
      )}
    </>
  );

  return isMobile ? <MobileLayout>{content}</MobileLayout> : (
    <DashboardLayout>
      <Box ml={{ base: 0, lg: "240px" }} w={{ base: "100%", lg: "calc(100% - 240px)" }} pt="88px" px={{ base: 4, md: 6, lg: 8 }} pb={8} maxW="1600px">
        {content}
      </Box>
    </DashboardLayout>
  );
}
