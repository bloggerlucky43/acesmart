import {
  Box,
  Flex,
  Text,
  Icon,
  Badge,
  Avatar,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FaUserEdit,
  FaGraduationCap,
  FaShieldAlt,
} from "react-icons/fa";
import StudentPageHeading from "../../components/student/StudentPageHeading";
import { useStudentPortal } from "../../libs/StudentPortalProvider";

const InfoRow = ({ label, value }) => (
  <Flex
    justify="space-between"
    align="center"
    py={3}
    gap={4}
    borderBottom="1px solid #F1F5F9"
  >
    <Text fontSize="13px" color="#64748B" flexShrink={0}>
      {label}
    </Text>
    <Text fontSize="13px" fontWeight="700" color="#0F172A" textAlign="right">
      {value || "—"}
    </Text>
  </Flex>
);

const StudentProfile = () => {
  const { student, institution, isUnlocked } = useStudentPortal();

  const studentName = student?.name || student?.fullName || "Student";

  return (
    <Box>
      <StudentPageHeading
        title="My Profile"
        description="Confirm your registration details and guardian contacts."
        icon={FaUserEdit}
      />

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6} mb={6}>
        <Box
          bg="white"
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          boxShadow="0 4px 16px rgba(0,0,0,0.02)"
          p={{ base: 6, md: 7 }}
          textAlign="center"
        >
          <Avatar.Root size="2xl" bg="#4338CA" color="white" mx="auto">
            <Avatar.Fallback name={studentName} />
          </Avatar.Root>
          <Text fontSize="18px" fontWeight="900" color="#0F172A" mt={4}>
            {studentName}
          </Text>
          <Text fontSize="12px" color="#4338CA" fontWeight="700" mt={0.5}>
            {student?.studentCode}
          </Text>
          <Flex justify="center" gap={2} mt={3} wrap="wrap">
            <Badge
              bg="#EEF2FF"
              color="#4338CA"
              px={3}
              py={1}
              borderRadius="full"
              fontWeight="700"
              fontSize="11px"
            >
              {student?.classArm || "Unassigned"}
            </Badge>
            <Badge
              bg={isUnlocked ? "#ECFDF5" : "#FEF3C7"}
              color={isUnlocked ? "#065F46" : "#92400E"}
              px={3}
              py={1}
              borderRadius="full"
              fontWeight="700"
              fontSize="11px"
            >
              {isUnlocked ? "RESULT UNLOCKED" : "RESULT LOCKED"}
            </Badge>
          </Flex>

          <Flex
            align="center"
            justify="center"
            gap={2}
            mt={5}
            p={3}
            borderRadius="xl"
            bg="#F8FAFC"
            border="1px solid #E2E8F0"
            color="#64748B"
            fontSize="11px"
          >
            <Icon as={FaShieldAlt} boxSize={3} color="#10B981" />
            <Text>Details are managed by the school registry.</Text>
          </Flex>
        </Box>

        <Box
          bg="white"
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          boxShadow="0 4px 16px rgba(0,0,0,0.02)"
          p={{ base: 6, md: 7 }}
        >
          <Flex align="center" gap={2.5} mb={3}>
            <Icon as={FaGraduationCap} color="#4338CA" boxSize={4} />
            <Text fontSize="15px" fontWeight="800" color="#0F172A">
              Academic Details
            </Text>
          </Flex>
          <InfoRow label="Student Code" value={student?.studentCode} />
          <InfoRow label="Class Arm" value={student?.classArm} />
          <InfoRow label="Gender" value={student?.gender} />
          <InfoRow label="Email" value={student?.studentEmail} />
          <InfoRow label="Fee Status" value={student?.feeStatus} />
        </Box>

        <Box
          bg="white"
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          boxShadow="0 4px 16px rgba(0,0,0,0.02)"
          p={{ base: 6, md: 7 }}
        >
          <Flex align="center" gap={2.5} mb={3}>
            <Icon as={FaUserEdit} color="#4338CA" boxSize={4} />
            <Text fontSize="15px" fontWeight="800" color="#0F172A">
              Guardian &amp; School
            </Text>
          </Flex>
          <InfoRow label="Parent / Guardian" value={student?.parentName} />
          <InfoRow label="Parent Phone" value={student?.parentPhone} />
          <InfoRow label="Institution" value={institution?.name} />
          <InfoRow label="Current Term" value={institution?.currentTerm} />
          <InfoRow label="Academic Session" value={institution?.academicSession} />
        </Box>
      </SimpleGrid>

      <Box
        bg="#EEF2FF"
        borderRadius="2xl"
        border="1px solid #C7D2FE"
        p={{ base: 5, md: 6 }}
        color="#3730A3"
      >
        <Text fontSize="14px" fontWeight="800" mb={1}>
          Need to correct something?
        </Text>
        <Text fontSize="13px" lineHeight="1.6">
          Names, class arms, and guardian contacts can only be changed by the
          school registry. Please contact the school office or bursary with your
          student code if any detail above is incorrect.
        </Text>
      </Box>
    </Box>
  );
};

export default StudentProfile;
