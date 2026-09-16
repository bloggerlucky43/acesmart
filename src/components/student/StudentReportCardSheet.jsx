import { Box, Flex, Text, Button, Icon, Badge, SimpleGrid } from "@chakra-ui/react";
import { FaPrint, FaGraduationCap } from "react-icons/fa";

const callableCa = (result) =>
  (Number(result?.caScore1) || 0) +
  (Number(result?.caScore2) || 0) +
  (Number(result?.assignmentScore) || 0);

const SummaryTile = ({ label, value, color = "#0F172A" }) => (
  <Box bg="#F8FAFC" border="1px solid #E2E8F0" borderRadius="xl" p={4}>
    <Text fontSize="11px" fontWeight="700" color="#64748B" letterSpacing="0.5px">
      {label}
    </Text>
    <Text fontSize="18px" fontWeight="900" color={color} mt={1}>
      {value}
    </Text>
  </Box>
);

const StudentReportCardSheet = ({ reportCard, onPrint }) => {
  if (!reportCard) return null;

  const studentInfo = reportCard.student || {};
  const institutionInfo = reportCard.institution || {};
  const results = reportCard.results || [];
  const summary = reportCard.summary || {};

  const handlePrint = onPrint || (() => window.print());

  return (
    <Box
      id="student-report-sheet"
      bg="white"
      borderRadius="2xl"
      p={{ base: 6, md: 10 }}
      border="2px solid #CBD5E1"
      boxShadow="0 10px 30px rgba(0,0,0,0.08)"
    >
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #student-report-sheet, #student-report-sheet * { visibility: visible; }
          #student-report-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
          }
        }
      `}</style>

      <Flex
        justify="space-between"
        align="center"
        borderBottom="3px double #4338CA"
        pb={4}
        mb={5}
        gap={4}
        wrap="wrap"
      >
        <Flex align="center" gap={3}>
          {institutionInfo.logoUrl ? (
            <Box
              w="60px"
              h="60px"
              p={1}
              border="1px solid #E2E8F0"
              borderRadius="lg"
            >
              <img
                src={institutionInfo.logoUrl}
                alt="Crest"
                style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
              />
            </Box>
          ) : (
            <Flex
              w="56px"
              h="56px"
              borderRadius="lg"
              bg="#EEF2FF"
              color="#4338CA"
              align="center"
              justify="center"
            >
              <Icon as={FaGraduationCap} boxSize={6} />
            </Flex>
          )}
          <Box>
            <Text
              fontSize="18px"
              fontWeight="900"
              color="#0F172A"
              textTransform="uppercase"
            >
              {institutionInfo.name}
            </Text>
            {institutionInfo.motto && (
              <Text fontSize="12px" color="#4338CA" fontStyle="italic">
                "{institutionInfo.motto}"
              </Text>
            )}
            <Text fontSize="11px" color="#64748B" mt={0.5}>
              {reportCard.term} • {reportCard.session}
            </Text>
          </Box>
        </Flex>
        <Badge
          bg="#4338CA"
          color="white"
          px={3}
          py={1}
          borderRadius="md"
          fontWeight="800"
        >
          OFFICIAL REPORT SHEET
        </Badge>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 4 }} gap={3} mb={5}>
        <Box>
          <Text fontSize="10px" fontWeight="700" color="#94A3B8">
            STUDENT
          </Text>
          <Text fontSize="13px" fontWeight="800" color="#0F172A">
            {studentInfo.name}
          </Text>
        </Box>
        <Box>
          <Text fontSize="10px" fontWeight="700" color="#94A3B8">
            STUDENT CODE
          </Text>
          <Text fontSize="13px" fontWeight="800" color="#0F172A">
            {studentInfo.studentCode}
          </Text>
        </Box>
        <Box>
          <Text fontSize="10px" fontWeight="700" color="#94A3B8">
            CLASS ARM
          </Text>
          <Text fontSize="13px" fontWeight="800" color="#0F172A">
            {studentInfo.classArm || "Unassigned"}
          </Text>
        </Box>
        <Box>
          <Text fontSize="10px" fontWeight="700" color="#94A3B8">
            SESSION
          </Text>
          <Text fontSize="13px" fontWeight="800" color="#0F172A">
            {reportCard.session}
          </Text>
        </Box>
      </SimpleGrid>

      <Box overflowX="auto" mb={6}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#F1F5F9", borderBottom: "2px solid #CBD5E1" }}>
              <th style={{ padding: "10px", fontSize: "11px", color: "#475569" }}>SUBJECT</th>
              <th style={{ padding: "10px", fontSize: "11px", color: "#475569" }}>CA (30)</th>
              <th style={{ padding: "10px", fontSize: "11px", color: "#475569" }}>EXAM (70)</th>
              <th style={{ padding: "10px", fontSize: "11px", color: "#475569" }}>TOTAL (100)</th>
              <th style={{ padding: "10px", fontSize: "11px", color: "#475569" }}>GRADE</th>
              <th style={{ padding: "10px", fontSize: "11px", color: "#475569" }}>REMARK</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ padding: "24px", textAlign: "center", color: "#94A3B8", fontSize: "13px" }}
                >
                  No subject scores have been published for this term yet.
                </td>
              </tr>
            ) : (
              results.map((result, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #E2E8F0" }}>
                  <td style={{ padding: "10px", fontWeight: "700", fontSize: "13px" }}>
                    {result.subject}
                  </td>
                  <td style={{ padding: "10px", fontSize: "13px" }}>
                    {callableCa(result)}
                  </td>
                  <td style={{ padding: "10px", fontSize: "13px" }}>
                    {result.examScore}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      fontWeight: "800",
                      fontSize: "14px",
                      color: "#0F172A",
                    }}
                  >
                    {result.totalScore}
                  </td>
                  <td style={{ padding: "10px", fontWeight: "800", color: "#4338CA" }}>
                    {result.grade}
                  </td>
                  <td style={{ padding: "10px", fontSize: "12px", color: "#64748B" }}>
                    {result.remark}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Box>

      <SimpleGrid columns={{ base: 2, md: 4 }} gap={3} mb={5}>
        <SummaryTile label="SUBJECTS" value={summary.totalSubjects ?? results.length} />
        <SummaryTile label="TOTAL SCORE" value={summary.totalScore ?? 0} />
        <SummaryTile
          label="AVERAGE"
          value={`${summary.averageScore ?? 0}%`}
          color="#4338CA"
        />
        <SummaryTile label="GENDER" value={studentInfo.gender || "—"} />
      </SimpleGrid>

      <Box bg="#F8FAFC" border="1px solid #E2E8F0" borderRadius="xl" p={4} mb={5}>
        <Text fontSize="11px" fontWeight="800" color="#475569" mb={1}>
          CLASS TEACHER'S REMARK
        </Text>
        <Text fontSize="13px" color="#334155" mb={3}>
          {summary.overallRemark || "No remark recorded yet."}
        </Text>
        <Text fontSize="11px" fontWeight="800" color="#475569" mb={1}>
          PRINCIPAL'S REMARK
        </Text>
        <Text fontSize="13px" color="#334155">
          {summary.principalRemark || "No principal remark recorded yet."}
        </Text>
      </Box>

      {summary.nextTermResumption && (
        <Text fontSize="12px" color="#64748B" mb={5}>
          Next term resumption: <strong>{summary.nextTermResumption}</strong>
        </Text>
      )}

      <Flex justify="center">
        <Button
          bg="#4338CA"
          color="white"
          borderRadius="xl"
          onClick={handlePrint}
          _hover={{ opacity: 0.95 }}
        >
          <Icon as={FaPrint} mr={2} boxSize={3.5} />
          Print Official Report Card
        </Button>
      </Flex>
    </Box>
  );
};

export default StudentReportCardSheet;
