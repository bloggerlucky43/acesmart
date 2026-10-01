import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Icon,
  Badge,
  Input,
  Button,
  SimpleGrid,
  HStack,
  Table,
} from "@chakra-ui/react";
import {
  FaAward,
  FaClock,
  FaCheckCircle,
  FaSignOutAlt,
  FaShieldAlt,
  FaKey,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaInfoCircle,
  FaUserTie,
  FaHistory,
  FaSchool,
} from "react-icons/fa";
import StudentPageHeading from "../../components/student/StudentPageHeading";
import {
  PortalCard,
  PortalLoader,
  PortalEmpty,
} from "../../components/student/StudentPortalPrimitives";
import { useStudentPortal } from "../../libs/StudentPortalProvider";
import {
  studentPrefectClockInApi,
  getStudentPrefectStatusApi,
} from "../../api-endpoint/sms/prefectEndpoints";

export default function StudentPrefectDuty() {
  const { student, institution, refresh } = useStudentPortal();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentId = student?.id;
  const isPrefect = Boolean(student?.isPrefect || statusData?.isPrefect);
  const prefectRole = statusData?.prefectRole || student?.prefectRole || "School Prefect";

  const loadStatus = useCallback(async () => {
    if (!studentId) return;
    try {
      const res = await getStudentPrefectStatusApi(studentId);
      if (res?.success && res.data) {
        setStatusData(res.data);
      }
    } catch (e) {
      console.error("Failed to load prefect status:", e);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleClockIn = async (e) => {
    e.preventDefault();
    if (!code.trim() || !studentId) return;

    setSubmitting(true);
    const res = await studentPrefectClockInApi({
      studentId,
      prefectCode: code.trim(),
    });
    setSubmitting(false);

    if (res?.success) {
      setCode("");
      await loadStatus();
      if (refresh) refresh();
    }
  };

  const todayRecord = statusData?.todayRecord;
  const isClockedIn = Boolean(todayRecord?.clockInTime);
  const isClockedOut = Boolean(todayRecord?.clockOutTime);

  return (
    <Box>
      <StudentPageHeading
        title="Prefect Duty & Sign-In"
        subtitle="Daily attendance recording, arrival punctuality, and leadership verification for appointed school prefects."
        icon={FaAward}
      />

      {loading ? (
        <PortalLoader text="Verifying prefect office credentials..." />
      ) : !isPrefect ? (
        /* Non-Prefect View */
        <Box maxW="700px" mx="auto" mt={4}>
          <PortalCard>
            <Flex
              direction="column"
              align="center"
              textAlign="center"
              py={8}
              px={{ base: 3, md: 6 }}
            >
              <Flex
                w="64px"
                h="64px"
                borderRadius="full"
                bg="#FEF3C7"
                color="#D97706"
                align="center"
                justify="center"
                mb={4}
                boxShadow="0 4px 12px rgba(217, 119, 6, 0.15)"
              >
                <Icon as={FaShieldAlt} boxSize={8} />
              </Flex>

              <Text
                fontSize={{ base: "18px", md: "20px" }}
                fontWeight="800"
                color="#0F172A"
                mb={2}
                fontFamily="'Outfit', sans-serif"
              >
                Prefect Office Not Assigned
              </Text>

              <Text
                fontSize="14px"
                color="#64748B"
                maxW="480px"
                lineHeight="1.6"
                mb={6}
              >
                Your student profile is currently not designated as an active school
                prefect for <strong>{institution?.name || "your school"}</strong>.
                Daily prefect attendance sign-in is reserved for student officers appointed
                by the school administration.
              </Text>

              <Box
                w="100%"
                p={4}
                borderRadius="xl"
                bg="#F8FAFC"
                border="1px solid #E2E8F0"
                textAlign="left"
              >
                <Flex align="center" gap={2} mb={2}>
                  <Icon as={FaInfoCircle} color="#4338CA" boxSize={4} />
                  <Text fontSize="13px" fontWeight="700" color="#1E293B">
                    Have you been appointed recently?
                  </Text>
                </Flex>
                <Text fontSize="12px" color="#64748B" lineHeight="1.5">
                  If you were appointed as a prefect (such as Head Boy, Head Girl, Sanitary
                  Prefect, etc.), please contact your class teacher, Vice Principal, or the
                  school admin office to activate your prefect portfolio on the system.
                </Text>
              </Box>
            </Flex>
          </PortalCard>
        </Box>
      ) : (
        /* Appointed Prefect View */
        <Box>
          {/* Header Portfolio Banner */}
          <Box
            bg="linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)"
            color="white"
            p={{ base: 5, md: 7 }}
            borderRadius="24px"
            boxShadow="0 12px 28px -6px rgba(49, 46, 129, 0.35)"
            mb={6}
            position="relative"
            overflow="hidden"
          >
            {/* Ambient background glow */}
            <Box
              position="absolute"
              top="-30px"
              right="-30px"
              w="180px"
              h="180px"
              borderRadius="full"
              bg="rgba(129, 140, 248, 0.2)"
              filter="blur(30px)"
              pointerEvents="none"
            />

            <Flex
              justify="space-between"
              align={{ base: "flex-start", sm: "center" }}
              direction={{ base: "column", sm: "row" }}
              gap={4}
            >
              <Flex align="center" gap={{ base: 3, md: 4 }}>
                <Flex
                  w={{ base: "52px", md: "60px" }}
                  h={{ base: "52px", md: "60px" }}
                  borderRadius="2xl"
                  bg="rgba(255, 255, 255, 0.15)"
                  backdropFilter="blur(8px)"
                  color="#FDE047"
                  align="center"
                  justify="center"
                  flexShrink={0}
                  boxShadow="0 4px 12px rgba(0,0,0,0.2)"
                >
                  <Icon as={FaAward} boxSize={{ base: 6, md: 7 }} />
                </Flex>
                <Box>
                  <Flex align="center" gap={2} wrap="wrap" mb={1}>
                    <Text
                      fontSize={{ base: "20px", md: "24px" }}
                      fontWeight="900"
                      letterSpacing="-0.5px"
                      fontFamily="'Outfit', sans-serif"
                    >
                      {prefectRole}
                    </Text>
                    <Badge
                      bg="#FEF08A"
                      color="#854D0E"
                      px={2.5}
                      py={0.5}
                      borderRadius="full"
                      fontSize="11px"
                      fontWeight="900"
                      letterSpacing="0.5px"
                    >
                      ★ ACTIVE PREFECT
                    </Badge>
                  </Flex>
                  <Text fontSize="13px" color="#C7D2FE">
                    {student?.name || student?.fullName} • {student?.classArm || "Class Officer"} •{" "}
                    {institution?.name || "School"}
                  </Text>
                </Box>
              </Flex>

              {/* Status pill */}
              <Box
                px={3.5}
                py={2}
                borderRadius="xl"
                bg="rgba(255, 255, 255, 0.1)"
                border="1px solid rgba(255, 255, 255, 0.15)"
                backdropFilter="blur(6px)"
                alignSelf={{ base: "flex-start", sm: "center" }}
              >
                <Text fontSize="10px" fontWeight="700" color="#C7D2FE" letterSpacing="0.5px">
                  TODAY'S DUTY STATUS
                </Text>
                <Flex align="center" gap={1.5} mt={0.5}>
                  <Box
                    w="8px"
                    h="8px"
                    borderRadius="full"
                    bg={
                      isClockedOut
                        ? "#A855F7"
                        : isClockedIn
                        ? "#4ADE80"
                        : "#FBBF24"
                    }
                  />
                  <Text fontSize="13px" fontWeight="800" color="white">
                    {isClockedOut
                      ? "Duty Completed"
                      : isClockedIn
                      ? "Currently On Duty"
                      : "Pending Sign-In"}
                  </Text>
                </Flex>
              </Box>
            </Flex>
          </Box>

          <SimpleGrid columns={{ base: 1, lg: 12 }} gap={6} mb={8}>
            {/* Left Column: Sign-In Action Form (7 cols) */}
            <Box gridColumn={{ base: "1 / -1", lg: "span 7" }}>
              <PortalCard>
                <Flex align="center" gap={2.5} mb={4} pb={3} borderBottom="1px solid #F1F5F9">
                  <Icon as={FaKey} color="#4338CA" boxSize={4} />
                  <Text fontSize="16px" fontWeight="800" color="#0F172A">
                    {isClockedIn && !isClockedOut
                      ? "Clock Out of Daily Duty"
                      : isClockedOut
                      ? "Duty Recorded for Today"
                      : "Record Daily Duty Sign-In"}
                  </Text>
                </Flex>

                {/* If Clocked In Status details */}
                {isClockedIn && (
                  <Box
                    bg={isClockedOut ? "#FAF5FF" : "#F0FDF4"}
                    p={4}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={isClockedOut ? "#E9D5FF" : "#BBF7D0"}
                    mb={5}
                  >
                    <Flex align="center" gap={2.5} mb={2}>
                      <Icon
                        as={FaCheckCircle}
                        color={isClockedOut ? "#9333EA" : "#16A34A"}
                        boxSize={5}
                      />
                      <Text
                        fontSize="15px"
                        fontWeight="800"
                        color={isClockedOut ? "#581C87" : "#14532D"}
                      >
                        {isClockedOut
                          ? "Duty Successfully Completed & Signed Out"
                          : "Signed In for Prefect Duty Today"}
                      </Text>
                      <Badge
                        bg={todayRecord?.status === "on_time" ? "#DCFCE7" : "#FEF3C7"}
                        color={todayRecord?.status === "on_time" ? "#166534" : "#92400E"}
                        fontSize="10px"
                        fontWeight="800"
                        px={2}
                        py={0.5}
                        borderRadius="full"
                      >
                        {todayRecord?.status === "on_time" ? "ON TIME" : "LATE"}
                      </Badge>
                    </Flex>

                    <HStack gap={5} fontSize="13px" color="#334155" wrap="wrap" mt={2}>
                      <Flex align="center" gap={1.5}>
                        <Icon as={FaClock} color="#64748B" boxSize={3.5} />
                        <Text>
                          Clocked In: <strong>{todayRecord?.clockInTime}</strong>
                        </Text>
                      </Flex>
                      {todayRecord?.clockOutTime && (
                        <Flex align="center" gap={1.5}>
                          <Icon as={FaSignOutAlt} color="#64748B" boxSize={3.5} />
                          <Text>
                            Clocked Out: <strong>{todayRecord?.clockOutTime}</strong>
                          </Text>
                        </Flex>
                      )}
                    </HStack>
                  </Box>
                )}

                {/* Input form */}
                {!isClockedOut ? (
                  <Box as="form" onSubmit={handleClockIn}>
                    <Text fontSize="13px" color="#64748B" mb={3} lineHeight="1.5">
                      {isClockedIn
                        ? "Enter today's active 6-digit Prefect Code again at the end of the school day to record your departure & clock out."
                        : "Obtain today's active 6-digit Prefect Attendance Code announced at morning assembly or posted on the administration noticeboard."}
                    </Text>

                    <Flex
                      direction={{ base: "column", sm: "row" }}
                      gap={3}
                      align={{ base: "stretch", sm: "center" }}
                    >
                      <Box flex={1}>
                        <Input
                          placeholder="e.g. 583921"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          maxLength={8}
                          fontSize="18px"
                          fontWeight="700"
                          letterSpacing="3px"
                          textAlign="center"
                          h="48px"
                          bg="#F8FAFC"
                          borderColor="#CBD5E1"
                          _focus={{
                            borderColor: "#4338CA",
                            boxShadow: "0 0 0 1px #4338CA",
                            bg: "white",
                          }}
                        />
                      </Box>

                      <Button
                        type="submit"
                        loading={submitting}
                        disabled={!code.trim() || submitting}
                        h="48px"
                        px={6}
                        bg={
                          isClockedIn
                            ? "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)"
                            : "linear-gradient(135deg, #4338CA 0%, #312E81 100%)"
                        }
                        color="white"
                        borderRadius="xl"
                        fontWeight="800"
                        fontSize="14px"
                        boxShadow="0 4px 14px rgba(67, 56, 202, 0.3)"
                        _hover={{
                          opacity: 0.95,
                          transform: "translateY(-1px)",
                        }}
                        transition="all 0.15s ease"
                      >
                        <Icon
                          as={isClockedIn ? FaSignOutAlt : FaCheckCircle}
                          mr={2}
                          boxSize={4}
                        />
                        {isClockedIn ? "Clock Out Duty" : "Sign In For Duty"}
                      </Button>
                    </Flex>

                    <Text fontSize="11px" color="#94A3B8" mt={2.5}>
                      Codes rotate daily and are cryptographically verified for punctuality and validity.
                    </Text>
                  </Box>
                ) : (
                  <Box
                    p={4}
                    borderRadius="xl"
                    bg="#F8FAFC"
                    border="1px dashed #CBD5E1"
                    textAlign="center"
                  >
                    <Icon as={FaCheckCircle} color="#16A34A" boxSize={6} mb={2} />
                    <Text fontSize="14px" fontWeight="700" color="#1E293B">
                      You are completely signed out for today.
                    </Text>
                    <Text fontSize="12px" color="#64748B" mt={1}>
                      Thank you for carrying out your prefect responsibilities today!
                    </Text>
                  </Box>
                )}
              </PortalCard>
            </Box>

            {/* Right Column: Guidelines & Leadership Values (5 cols) */}
            <Box gridColumn={{ base: "1 / -1", lg: "span 5" }}>
              <PortalCard>
                <Flex align="center" gap={2} mb={3}>
                  <Icon as={FaSchool} color="#4338CA" boxSize={4} />
                  <Text fontSize="15px" fontWeight="800" color="#0F172A">
                    Prefect Code & Responsibilities
                  </Text>
                </Flex>

                <Flex direction="column" gap={3} fontSize="12.5px" color="#475569">
                  <Flex align="flex-start" gap={2.5}>
                    <Flex
                      w="20px"
                      h="20px"
                      borderRadius="full"
                      bg="#EEF2FF"
                      color="#4338CA"
                      align="center"
                      justify="center"
                      fontSize="11px"
                      fontWeight="800"
                      flexShrink={0}
                      mt={0.5}
                    >
                      1
                    </Flex>
                    <Text>
                      <strong>Arrive Early:</strong> Report to your duty post before the general assembly bell rings.
                    </Text>
                  </Flex>

                  <Flex align="flex-start" gap={2.5}>
                    <Flex
                      w="20px"
                      h="20px"
                      borderRadius="full"
                      bg="#EEF2FF"
                      color="#4338CA"
                      align="center"
                      justify="center"
                      fontSize="11px"
                      fontWeight="800"
                      flexShrink={0}
                      mt={0.5}
                    >
                      2
                    </Flex>
                    <Text>
                      <strong>Lead by Example:</strong> Ensure neat school uniform, punctuality, and exemplary conduct at all times.
                    </Text>
                  </Flex>

                  <Flex align="flex-start" gap={2.5}>
                    <Flex
                      w="20px"
                      h="20px"
                      borderRadius="full"
                      bg="#EEF2FF"
                      color="#4338CA"
                      align="center"
                      justify="center"
                      fontSize="11px"
                      fontWeight="800"
                      flexShrink={0}
                      mt={0.5}
                    >
                      3
                    </Flex>
                    <Text>
                      <strong>Administrative Review:</strong> The Principal & Vice Principal inspect the daily prefect attendance roster each morning.
                    </Text>
                  </Flex>

                  <Flex align="flex-start" gap={2.5}>
                    <Flex
                      w="20px"
                      h="20px"
                      borderRadius="full"
                      bg="#EEF2FF"
                      color="#4338CA"
                      align="center"
                      justify="center"
                      fontSize="11px"
                      fontWeight="800"
                      flexShrink={0}
                      mt={0.5}
                    >
                      4
                    </Flex>
                    <Text>
                      <strong>End of Day Duty:</strong> Assist teachers on duty during closing dismissal and sign out using the code before leaving.
                    </Text>
                  </Flex>
                </Flex>
              </PortalCard>
            </Box>
          </SimpleGrid>

          {/* Bottom Section: Recent Duty History */}
          <Box mt={6}>
            <PortalCard>
              <Flex align="center" justify="space-between" mb={4} wrap="wrap" gap={2}>
                <Flex align="center" gap={2.5}>
                  <Icon as={FaHistory} color="#4338CA" boxSize={4} />
                  <Text fontSize="16px" fontWeight="800" color="#0F172A">
                    Recent Prefect Duty Attendance Log
                  </Text>
                </Flex>
                <Badge bg="#EEF2FF" color="#4338CA" px={2.5} py={0.5} borderRadius="full">
                  Recent {statusData?.history?.length || 0} Records
                </Badge>
              </Flex>

              {!statusData?.history || statusData.history.length === 0 ? (
                <PortalEmpty
                  title="No duty attendance recorded yet"
                  message="Once you sign in for your daily duty posts, your records and punctuality will appear here."
                />
              ) : (
                <Box overflowX="auto">
                  <Table.Root size="sm" variant="outline">
                    <Table.Header bg="#F8FAFC">
                      <Table.Row>
                        <Table.ColumnHeader fontSize="11px" fontWeight="800" color="#64748B">
                          DATE
                        </Table.ColumnHeader>
                        <Table.ColumnHeader fontSize="11px" fontWeight="800" color="#64748B">
                          CLOCK IN
                        </Table.ColumnHeader>
                        <Table.ColumnHeader fontSize="11px" fontWeight="800" color="#64748B">
                          CLOCK OUT
                        </Table.ColumnHeader>
                        <Table.ColumnHeader fontSize="11px" fontWeight="800" color="#64748B">
                          PUNCTUALITY
                        </Table.ColumnHeader>
                        <Table.ColumnHeader fontSize="11px" fontWeight="800" color="#64748B">
                          VERIFICATION
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {statusData.history.map((record) => (
                        <Table.Row key={record.id || record.date} _hover={{ bg: "#F8FAFC" }}>
                          <Table.Cell fontWeight="700" color="#1E293B">
                            {record.date}
                          </Table.Cell>
                          <Table.Cell color="#0F172A" fontWeight="600">
                            {record.clockInTime || "-"}
                          </Table.Cell>
                          <Table.Cell color="#64748B">
                            {record.clockOutTime || "—"}
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              bg={record.status === "on_time" ? "#DCFCE7" : "#FEF3C7"}
                              color={record.status === "on_time" ? "#166534" : "#92400E"}
                              fontSize="10px"
                              fontWeight="800"
                              px={2}
                              py={0.5}
                              borderRadius="full"
                            >
                              {record.status === "on_time" ? "ON TIME" : "LATE"}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell fontSize="12px" color="#64748B">
                            Daily Code
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              )}
            </PortalCard>
          </Box>
        </Box>
      )}
    </Box>
  );
}
