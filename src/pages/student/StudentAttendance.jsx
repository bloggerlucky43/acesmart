import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Icon,
  Badge,
  SimpleGrid,
  Button,
} from "@chakra-ui/react";
import {
  FaCalendarCheck,
  FaSyncAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaNotesMedical,
} from "react-icons/fa";
import StudentPageHeading from "../../components/student/StudentPageHeading";
import {
  PortalCard,
  PortalLoader,
  PortalEmpty,
} from "../../components/student/StudentPortalPrimitives";
import { statusTone } from "../../components/student/studentStatusTone";
import { useStudentPortal } from "../../libs/StudentPortalProvider";
import { getStudentAttendanceApi } from "../../api-endpoint/sms/portalEndpoints";

const countCard = (icon, label, value, tint, accent) => (
  <PortalCard key={label}>
    <Flex align="center" justify="space-between">
      <Box>
        <Text fontSize="12px" fontWeight="700" color="#64748B">
          {label}
        </Text>
        <Text fontSize="22px" fontWeight="900" color={accent} mt={1}>
          {value}
        </Text>
      </Box>
      <Flex
        w="38px"
        h="38px"
        borderRadius="xl"
        bg={tint}
        color={accent}
        align="center"
        justify="center"
      >
        <Icon as={icon} boxSize={4} />
      </Flex>
    </Flex>
  </PortalCard>
);

const StudentAttendance = () => {
  const { student } = useStudentPortal();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentId = student?.id;

  const load = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await getStudentAttendanceApi(studentId);
      if (res?.success) setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = data?.summary;
  const records = data?.records || [];
  const monthly = data?.monthly || [];

  return (
    <Box>
      <StudentPageHeading
        title="Attendance Record"
        description="See exactly which days you were present, absent, or late."
        icon={FaCalendarCheck}
        action={
          <Button
            size="sm"
            variant="outline"
            borderColor="#CBD5E1"
            borderRadius="xl"
            fontWeight="700"
            fontSize="12px"
            loading={loading}
            onClick={load}
          >
            <Icon as={FaSyncAlt} mr={2} boxSize={3} />
            Refresh
          </Button>
        }
      />

      {loading && !data ? (
        <PortalLoader label="Loading your attendance..." />
      ) : !summary || summary.total === 0 ? (
        <PortalEmpty
          icon={FaCalendarCheck}
          title="No attendance marked yet"
          description="When your class teacher starts marking daily attendance, your present, absent, and late records will show here."
        />
      ) : (
        <>
          <PortalCard mb={6}>
            <Flex
              justify="space-between"
              align={{ base: "flex-start", md: "center" }}
              direction={{ base: "column", md: "row" }}
              gap={4}
            >
              <Box>
                <Text fontSize="12px" fontWeight="700" color="#64748B">
                  OVERALL ATTENDANCE RATE
                </Text>
                <Text fontSize="32px" fontWeight="900" color="#4338CA" lineHeight="1.2">
                  {summary.attendanceRate}%
                </Text>
                <Text fontSize="12px" color="#64748B">
                  {summary.present + summary.late} of {summary.total} school days attended
                </Text>
              </Box>
              <Box
                w={{ base: "100%", md: "260px" }}
                p={4}
                borderRadius="xl"
                bg="#F8FAFC"
                border="1px solid #E2E8F0"
              >
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="12px" color="#64748B">Days recorded</Text>
                  <Text fontSize="13px" fontWeight="800">{summary.total}</Text>
                </Flex>
                <Box h="10px" bg="#E2E8F0" borderRadius="full" overflow="hidden">
                  <Box
                    h="100%"
                    w={`${Math.min(summary.attendanceRate, 100)}%`}
                    bg="linear-gradient(90deg, #10B981 0%, #4338CA 100%)"
                    borderRadius="full"
                  />
                </Box>
              </Box>
            </Flex>
          </PortalCard>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} mb={6}>
            {countCard(FaCheckCircle, "PRESENT", summary.present, "#ECFDF5", "#065F46")}
            {countCard(FaTimesCircle, "ABSENT", summary.absent, "#FEF2F2", "#991B1B")}
            {countCard(FaClock, "LATE", summary.late, "#FEF3C7", "#92400E")}
            {countCard(FaNotesMedical, "EXCUSED", summary.excused, "#EFF6FF", "#1D4ED8")}
          </SimpleGrid>

          {monthly.length > 0 && (
            <PortalCard mb={6}>
              <Text fontSize="16px" fontWeight="800" color="#0F172A" mb={4}>
                Monthly Breakdown
              </Text>
              <Flex direction="column" gap={4}>
                {monthly.map((month) => {
                  const rate =
                    month.total > 0
                      ? Number((((month.present + month.late) / month.total) * 100).toFixed(0))
                      : 0;
                  return (
                    <Box key={month.month}>
                      <Flex justify="space-between" mb={1}>
                        <Text fontSize="13px" fontWeight="700" color="#334155">
                          {new Date(`${month.month}-01`).toLocaleDateString(undefined, {
                            month: "long",
                            year: "numeric",
                          })}
                        </Text>
                        <Text fontSize="12px" color="#64748B">
                          {rate}% • {month.present}P / {month.absent}A / {month.late}L
                        </Text>
                      </Flex>
                      <Flex h="8px" borderRadius="full" overflow="hidden" bg="#F1F5F9">
                        <Box
                          h="100%"
                          w={`${(month.present / month.total) * 100}%`}
                          bg="#10B981"
                        />
                        <Box h="100%" w={`${(month.late / month.total) * 100}%`} bg="#F59E0B" />
                        <Box
                          h="100%"
                          w={`${(month.absent / month.total) * 100}%`}
                          bg="#EF4444"
                        />
                      </Flex>
                    </Box>
                  );
                })}
              </Flex>
            </PortalCard>
          )}

          <PortalCard>
            <Text fontSize="16px" fontWeight="800" color="#0F172A" mb={4}>
              Recent Records
            </Text>
            <Flex direction="column" gap={2}>
              {records.slice(0, 40).map((record) => {
                const tone = statusTone(record.status);
                return (
                  <Flex
                    key={record.id}
                    align="center"
                    justify="space-between"
                    px={3}
                    py={2.5}
                    borderRadius="xl"
                    border="1px solid #F1F5F9"
                    gap={3}
                  >
                    <Text fontSize="13px" fontWeight="700" color="#0F172A">
                      {new Date(record.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                    <Flex align="center" gap={3}>
                      {record.remark && (
                        <Text fontSize="11px" color="#94A3B8" isTruncated maxW="200px">
                          {record.remark}
                        </Text>
                      )}
                      <Badge
                        bg={tone.bg}
                        color={tone.color}
                        px={2.5}
                        py={0.5}
                        borderRadius="full"
                        fontWeight="800"
                        fontSize="11px"
                        textTransform="uppercase"
                      >
                        {record.status}
                      </Badge>
                    </Flex>
                  </Flex>
                );
              })}
            </Flex>
          </PortalCard>
        </>
      )}
    </Box>
  );
};

export default StudentAttendance;
