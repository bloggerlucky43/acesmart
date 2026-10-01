import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Icon,
  Badge,
  HStack,
} from "@chakra-ui/react";
import {
  FaAward,
  FaClock,
  FaCheckCircle,
  FaSignOutAlt,
  FaShieldAlt,
  FaKey,
} from "react-icons/fa";
import { studentPrefectClockInApi } from "../../api-endpoint/sms/prefectEndpoints";

export default function PrefectDutyCard({ student, onAttendanceRecorded }) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [attendanceResult, setAttendanceResult] = useState(null);

  if (!student?.isPrefect) return null;

  const roleTitle = student.prefectRole || "School Prefect";

  const handleClockIn = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setSubmitting(true);
    const res = await studentPrefectClockInApi({
      studentId: student.id,
      prefectCode: code.trim(),
    });
    setSubmitting(false);

    if (res?.success) {
      setAttendanceResult(res.data);
      setCode("");
      if (onAttendanceRecorded) onAttendanceRecorded();
    }
  };

  return (
    <Box
      bg="linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)"
      color="white"
      p={{ base: 5, md: 6 }}
      borderRadius="24px"
      boxShadow="0 10px 25px -5px rgba(49, 46, 129, 0.3)"
      mb={6}
      position="relative"
      overflow="hidden"
    >
      {/* Decorative background glow */}
      <Box
        position="absolute"
        top="-40px"
        right="-40px"
        w="160px"
        h="160px"
        borderRadius="full"
        bg="rgba(129, 140, 248, 0.15)"
        filter="blur(25px)"
        pointerEvents="none"
      />

      <Flex
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        gap={4}
        mb={4}
      >
        <Flex align="center" gap={3}>
          <Flex
            w="46px"
            h="46px"
            borderRadius="2xl"
            bg="rgba(255, 255, 255, 0.15)"
            backdropFilter="blur(8px)"
            color="#FDE047"
            align="center"
            justify="center"
            flexShrink={0}
          >
            <Icon as={FaAward} boxSize={6} />
          </Flex>
          <Box>
            <Flex align="center" gap={2} wrap="wrap">
              <Text fontSize="18px" fontWeight="900" letterSpacing="-0.3px">
                Prefect Duty & Attendance Sign-In
              </Text>
              <Badge
                bg="#FEF08A"
                color="#854D0E"
                px={2.5}
                py={0.5}
                borderRadius="full"
                fontSize="11px"
                fontWeight="900"
              >
                ★ {roleTitle.toUpperCase()}
              </Badge>
            </Flex>
            <Text fontSize="12px" color="#C7D2FE">
              Record your daily prefect arrival & closing duty using the school administration code.
            </Text>
          </Box>
        </Flex>
      </Flex>

      {attendanceResult ? (
        <Box
          bg="rgba(255, 255, 255, 0.12)"
          p={4}
          borderRadius="2xl"
          border="1px solid rgba(255, 255, 255, 0.2)"
        >
          <Flex align="center" gap={2.5} mb={2}>
            <Icon as={FaCheckCircle} color="#4ADE80" boxSize={5} />
            <Text fontSize="15px" fontWeight="800">
              {attendanceResult.clockOutTime ? "Prefect Day Closed" : "Signed In for Duty!"}
            </Text>
            <Badge
              bg={attendanceResult.status === "on_time" ? "#DCFCE7" : "#FEF3C7"}
              color={attendanceResult.status === "on_time" ? "#166534" : "#92400E"}
              fontSize="10px"
              fontWeight="800"
              px={2}
              py={0.5}
              borderRadius="full"
            >
              {attendanceResult.status === "on_time" ? "ON TIME" : "LATE"}
            </Badge>
          </Flex>

          <HStack gap={4} fontSize="13px" color="#E0E7FF" wrap="wrap">
            <Text>
              Clocked In: <strong>{attendanceResult.clockInTime}</strong>
            </Text>
            {attendanceResult.clockOutTime && (
              <Text>
                Clocked Out: <strong>{attendanceResult.clockOutTime}</strong>
              </Text>
            )}
            <Text color="#A5B4FC">Date: {attendanceResult.date}</Text>
          </HStack>
        </Box>
      ) : (
        <Box as="form" onSubmit={handleClockIn}>
          <Flex
            gap={3}
            direction={{ base: "column", sm: "row" }}
            align={{ base: "stretch", sm: "center" }}
          >
            <Box flex={1} maxW={{ sm: "280px" }}>
              <Input
                placeholder="Enter 6-digit Prefect Code..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
                bg="rgba(255, 255, 255, 0.15)"
                color="white"
                borderColor="rgba(255, 255, 255, 0.3)"
                _placeholder={{ color: "#A5B4FC" }}
                _focus={{ borderColor: "#FDE047", bg: "rgba(255, 255, 255, 0.2)" }}
                borderRadius="xl"
                h="44px"
                fontSize="14px"
                fontWeight="800"
                letterSpacing="1px"
              />
            </Box>

            <Button
              type="submit"
              bg="#FDE047"
              color="#1E1B4B"
              h="44px"
              px={6}
              borderRadius="xl"
              fontWeight="900"
              fontSize="13px"
              loading={submitting}
              loadingText="Verifying..."
              _hover={{ bg: "#FEF08A" }}
            >
              <Icon as={FaClock} mr={2} />
              Sign In Prefect Duty
            </Button>
          </Flex>
          <Text fontSize="11px" color="#A5B4FC" mt={2}>
            * The school principal or institution admin releases this code daily for all active prefects.
          </Text>
        </Box>
      )}
    </Box>
  );
}
