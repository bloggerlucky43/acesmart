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
  FaChartBar,
  FaSyncAlt,
  FaArrowUp,
  FaArrowDown,
  FaUsers,
} from "react-icons/fa";
import StudentPageHeading from "../../components/student/StudentPageHeading";
import {
  PortalCard,
  PortalLoader,
  PortalEmpty,
} from "../../components/student/StudentPortalPrimitives";
import { useStudentPortal } from "../../libs/StudentPortalProvider";
import { getStudentPerformanceApi } from "../../api-endpoint/sms/portalEndpoints";

const StatCard = ({ label, value, hint, accent = "#0F172A" }) => (
  <PortalCard>
    <Text fontSize="12px" fontWeight="700" color="#64748B">
      {label}
    </Text>
    <Text fontSize="22px" fontWeight="900" color={accent} mt={1}>
      {value}
    </Text>
    {hint && (
      <Text fontSize="11px" color="#94A3B8" mt={0.5}>
        {hint}
      </Text>
    )}
  </PortalCard>
);

const StudentPerformance = () => {
  const { student } = useStudentPortal();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentId = student?.id;

  const load = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await getStudentPerformanceApi(studentId);
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
  const subjects = data?.currentSubjects || [];
  const termAverages = data?.termAverages || [];

  return (
    <Box>
      <StudentPageHeading
        title="Term Performance"
        description="Track how your scores move across terms and subjects."
        icon={FaChartBar}
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
        <PortalLoader label="Crunching your performance data..." />
      ) : subjects.length === 0 && termAverages.length === 0 ? (
        <PortalEmpty
          icon={FaChartBar}
          title="No published scores yet"
          description="Once your teachers publish continuous assessment and exam scores for the current term, your performance analytics will appear here."
        />
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} mb={6}>
            <StatCard
              label="TERM AVERAGE"
              value={summary?.averageScore != null ? `${summary.averageScore}%` : "—"}
              hint={`${data?.currentTerm || ""} ${data?.currentSession || ""}`}
              accent="#4338CA"
            />
            <StatCard
              label="CLASS AVERAGE"
              value={summary?.classAverage != null ? `${summary.classAverage}%` : "—"}
              hint={summary?.classSize ? `${summary.classSize} students` : "Class data pending"}
            />
            <StatCard
              label="SUBJECTS SCORED"
              value={summary?.totalSubjects ?? 0}
              hint={`Total: ${summary?.totalScore ?? 0} marks`}
            />
            <StatCard
              label="AVERAGE PER SUBJECT"
              value={
                summary?.totalSubjects
                  ? (summary.totalScore / summary.totalSubjects).toFixed(1)
                  : "—"
              }
              hint="Out of 100"
            />
          </SimpleGrid>

          {(summary?.bestSubject || summary?.weakestSubject) && (
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={6}>
              {summary?.bestSubject && (
                <PortalCard borderLeft="4px solid #10B981">
                  <Flex align="center" gap={2} color="#065F46" mb={2}>
                    <Icon as={FaArrowUp} boxSize={3.5} />
                    <Text fontSize="12px" fontWeight="800" letterSpacing="0.5px">
                      STRONGEST SUBJECT
                    </Text>
                  </Flex>
                  <Text fontSize="16px" fontWeight="900" color="#0F172A">
                    {summary.bestSubject.subject}
                  </Text>
                  <Text fontSize="13px" color="#64748B">
                    {summary.bestSubject.totalScore}% • Grade {summary.bestSubject.grade}
                  </Text>
                </PortalCard>
              )}
              {summary?.weakestSubject && (
                <PortalCard borderLeft="4px solid #EF4444">
                  <Flex align="center" gap={2} color="#991B1B" mb={2}>
                    <Icon as={FaArrowDown} boxSize={3.5} />
                    <Text fontSize="12px" fontWeight="800" letterSpacing="0.5px">
                      NEEDS ATTENTION
                    </Text>
                  </Flex>
                  <Text fontSize="16px" fontWeight="900" color="#0F172A">
                    {summary.weakestSubject.subject}
                  </Text>
                  <Text fontSize="13px" color="#64748B">
                    {summary.weakestSubject.totalScore}% • Grade{" "}
                    {summary.weakestSubject.grade}
                  </Text>
                </PortalCard>
              )}
            </SimpleGrid>
          )}

          {termAverages.length > 0 && (
            <PortalCard mb={6}>
              <Text fontSize="16px" fontWeight="800" color="#0F172A" mb={4}>
                Term-by-Term Average
              </Text>
              <Flex direction="column" gap={3}>
                {termAverages.map((term) => (
                  <Box key={`${term.session}-${term.term}`}>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="13px" fontWeight="700" color="#334155">
                        {term.term}{" "}
                        <Text as="span" color="#94A3B8" fontWeight="500">
                          {term.session}
                        </Text>
                      </Text>
                      <Text fontSize="13px" fontWeight="800" color="#4338CA">
                        {term.average}%
                      </Text>
                    </Flex>
                    <Box h="8px" bg="#F1F5F9" borderRadius="full" overflow="hidden">
                      <Box
                        h="100%"
                        w={`${Math.min(term.average, 100)}%`}
                        bg="linear-gradient(90deg, #4338CA 0%, #6D28D9 100%)"
                        borderRadius="full"
                      />
                    </Box>
                  </Box>
                ))}
              </Flex>
            </PortalCard>
          )}

          {subjects.length > 0 && (
            <PortalCard>
              <Flex align="center" justify="space-between" mb={4} wrap="wrap" gap={2}>
                <Text fontSize="16px" fontWeight="800" color="#0F172A">
                  {data?.currentTerm} Subject Breakdown
                </Text>
                <Flex align="center" gap={1.5} color="#64748B" fontSize="12px">
                  <Icon as={FaUsers} boxSize={3} />
                  <Text>
                    Class average {summary?.classAverage != null ? `${summary.classAverage}%` : "—"}
                  </Text>
                </Flex>
              </Flex>

              <Flex direction="column" gap={2}>
                <Flex
                  px={3}
                  py={2}
                  bg="#F8FAFC"
                  borderRadius="lg"
                  fontSize="11px"
                  fontWeight="800"
                  color="#64748B"
                  letterSpacing="0.5px"
                >
                  <Text flex={2}>SUBJECT</Text>
                  <Text flex={1} textAlign="center">CA</Text>
                  <Text flex={1} textAlign="center">EXAM</Text>
                  <Text flex={1} textAlign="center">TOTAL</Text>
                  <Text flex={1} textAlign="right">GRADE</Text>
                </Flex>

                {subjects.map((subject) => (
                  <Flex
                    key={subject.id}
                    px={3}
                    py={2.5}
                    borderRadius="lg"
                    border="1px solid #F1F5F9"
                    align="center"
                  >
                    <Text flex={2} fontSize="13px" fontWeight="700" color="#0F172A" isTruncated>
                      {subject.subject}
                    </Text>
                    <Text flex={1} textAlign="center" fontSize="13px" color="#64748B">
                      {subject.caScore1 + subject.caScore2 + subject.assignmentScore}
                    </Text>
                    <Text flex={1} textAlign="center" fontSize="13px" color="#64748B">
                      {subject.examScore}
                    </Text>
                    <Text flex={1} textAlign="center" fontSize="13px" fontWeight="800" color="#0F172A">
                      {subject.totalScore}
                    </Text>
                    <Flex flex={1} justify="flex-end">
                      <Badge
                        bg={subject.totalScore >= 50 ? "#ECFDF5" : "#FEF2F2"}
                        color={subject.totalScore >= 50 ? "#065F46" : "#991B1B"}
                        px={2.5}
                        py={0.5}
                        borderRadius="full"
                        fontWeight="800"
                        fontSize="11px"
                      >
                        {subject.grade}
                      </Badge>
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            </PortalCard>
          )}
        </>
      )}
    </Box>
  );
};

export default StudentPerformance;
