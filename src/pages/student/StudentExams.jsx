import { Box, Flex, Text, Button, Icon, Badge, SimpleGrid } from "@chakra-ui/react";
import {
  FaLaptopCode,
  FaCheckCircle,
  FaInfoCircle,
  FaClipboardList,
  FaClock,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import StudentPageHeading from "../../components/student/StudentPageHeading";
import { useStudentPortal } from "../../libs/StudentPortalProvider";

const RULES = [
  "Enter the exam room using your institutional student code.",
  "Confirm your identity before the timer starts.",
  "Do not refresh, close, or leave the exam tab while writing.",
  "Each exam is timed and submits automatically when time elapses.",
  "Report any technical issue to the invigilator immediately.",
];

const StudentExams = () => {
  const navigate = useNavigate();
  const { student, institution } = useStudentPortal();

  return (
    <Box>
      <StudentPageHeading
        title="CBT Examinations"
        description="Enter the computer-based test room and review your exam history."
        icon={FaLaptopCode}
        action={
          <Badge
            bg="#EEF2FF"
            color="#4338CA"
            px={3}
            py={1.5}
            borderRadius="full"
            fontWeight="800"
            fontSize="11px"
          >
            {institution?.currentTerm || "CURRENT TERM"}
          </Badge>
        }
      />

      <Box
        bg="linear-gradient(135deg, #1E1B4B 0%, #4338CA 55%, #6D28D9 100%)"
        color="white"
        borderRadius="3xl"
        p={{ base: 6, md: 8 }}
        mb={6}
        boxShadow="0 10px 30px rgba(67, 56, 202, 0.2)"
      >
        <Flex
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={5}
        >
          <Box>
            <Flex align="center" gap={2} mb={2}>
              <Icon as={FaLaptopCode} boxSize={4} color="#C7D2FE" />
              <Text fontSize="12px" fontWeight="800" letterSpacing="1px" color="#C7D2FE">
                ACE EXAM ROOM
              </Text>
            </Flex>
            <Text fontSize={{ base: "20px", md: "24px" }} fontWeight="900">
              Ready to write an exam?
            </Text>
            <Text fontSize="13px" color="#E0E7FF" mt={1} maxW="520px">
              You will be asked for your institutional student code on the exam
              login screen. Keep it handy: <strong>{student?.studentCode}</strong>
            </Text>
          </Box>

          <Button
            bg="white"
            color="#4338CA"
            borderRadius="xl"
            fontWeight="800"
            fontSize="14px"
            px={6}
            h="48px"
            boxShadow="0 6px 18px rgba(0,0,0,0.2)"
            _hover={{ bg: "#F8FAFC" }}
            onClick={() => navigate(`/take_exam?code=${student?.studentCode}`)}
          >
            <Icon as={FaLaptopCode} mr={2} boxSize={4} />
            Enter CBT Exam Room
          </Button>
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        <Box
          bg="white"
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          boxShadow="0 4px 16px rgba(0,0,0,0.02)"
          p={{ base: 5, md: 6 }}
        >
          <Flex align="center" gap={2.5} mb={4}>
            <Icon as={FaClipboardList} color="#4338CA" boxSize={4} />
            <Text fontSize="16px" fontWeight="800" color="#0F172A">
              Exam Rules &amp; Instructions
            </Text>
          </Flex>
          {RULES.map((rule) => (
            <Flex key={rule} align="flex-start" gap={2.5} mb={3}>
              <Icon
                as={FaCheckCircle}
                color="#10B981"
                boxSize={3.5}
                mt={0.5}
                flexShrink={0}
              />
              <Text fontSize="13px" color="#334155" lineHeight="1.5">
                {rule}
              </Text>
            </Flex>
          ))}
        </Box>

        <Box
          bg="white"
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          boxShadow="0 4px 16px rgba(0,0,0,0.02)"
          p={{ base: 5, md: 6 }}
        >
          <Flex align="center" gap={2.5} mb={4}>
            <Icon as={FaClock} color="#4338CA" boxSize={4} />
            <Text fontSize="16px" fontWeight="800" color="#0F172A">
              Scheduled Exams
            </Text>
          </Flex>

          <Flex
            direction="column"
            align="center"
            justify="center"
            textAlign="center"
            py={8}
            px={4}
            borderRadius="xl"
            bg="#F8FAFC"
            border="1px dashed #CBD5E1"
          >
            <Icon as={FaInfoCircle} color="#94A3B8" boxSize={6} mb={3} />
            <Text fontSize="14px" fontWeight="800" color="#0F172A">
              No published exam schedule yet
            </Text>
            <Text fontSize="12px" color="#64748B" mt={1} maxW="320px">
              When your school publishes a computer-based test, its date, subject,
              duration, and status will be listed here.
            </Text>
          </Flex>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default StudentExams;
