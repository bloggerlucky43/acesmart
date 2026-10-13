import { Box, Flex, Text, Button, Icon, Badge, SimpleGrid } from "@chakra-ui/react";
import {
  FaPrint,
  FaGraduationCap,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaUserCheck,
  FaPencilAlt,
  FaSyncAlt,
  FaShieldAlt,
} from "react-icons/fa";
import { formatStudentName } from "../../libs/helper";

const callableCa = (result) =>
  (Number(result?.caScore1) || 0) +
  (Number(result?.caScore2) || 0) +
  (Number(result?.assignmentScore) || 0);

export const getGradeBadgeStyle = (grade) => {
  switch (grade) {
    case "A":
    case "A1":
      return { bg: "#EDE9FE", color: "#6D28D9", border: "#C4B5FD" }; // Purple
    case "B":
    case "B2":
    case "B3":
      return { bg: "#EEF2FF", color: "#4338CA", border: "#C7D2FE" }; // Indigo
    case "C":
    case "C4":
    case "C5":
    case "C6":
      return { bg: "#F0FDFA", color: "#0F766E", border: "#99F6E4" }; // Teal
    case "D":
    case "D7":
      return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" }; // Amber
    case "E":
    case "E8":
      return { bg: "#FFF7ED", color: "#C2410C", border: "#FFEDD5" }; // Orange
    case "F":
    case "F9":
    default:
      return { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" }; // Red
  }
};

const SummaryTile = ({ label, value, subtext, color = "#0F172A", bg = "#F8FAFC", isCompact, isUltraCompact }) => (
  <Box
    bg={bg}
    border="1px solid #E2E8F0"
    borderRadius={isUltraCompact ? "md" : "xl"}
    p={isUltraCompact ? "3px 8px" : isCompact ? "6px 10px" : "10px 14px"}
  >
    <Text
      fontSize={isUltraCompact ? "8px" : isCompact ? "9px" : "10px"}
      fontWeight="800"
      color="#64748B"
      letterSpacing="0.4px"
      textTransform="uppercase"
    >
      {label}
    </Text>
    <Text
      fontSize={isUltraCompact ? "13px" : isCompact ? "15px" : "18px"}
      fontWeight="900"
      color={color}
      lineHeight="1.1"
      mt={0.5}
    >
      {value}
    </Text>
    {subtext && !isUltraCompact && (
      <Text fontSize={isCompact ? "8.5px" : "10px"} color="#94A3B8" fontWeight="600" mt={0.5}>
        {subtext}
      </Text>
    )}
  </Box>
);

const StudentReportCardSheet = ({
  reportCard,
  onPrint,
  showDetailedCa = true,
  onEditScores,
  onSyncCbt,
}) => {
  if (!reportCard) return null;

  const studentInfo = reportCard.student || {};
  const institutionInfo = reportCard.institution || {};
  const results = reportCard.results || [];
  const summary = reportCard.summary || {};
  const signature = reportCard.signature || {};
  const approval = reportCard.approval || {};
  const attendance = summary.attendance || {};

  const handlePrint = onPrint || (() => window.print());

  const approvalStatus = approval.status || "pending";
  const isApproved = approvalStatus === "approved";
  const isRejected = approvalStatus === "rejected";

  // Density levels tailored so even 16 subjects fit strictly onto 1 single A4 page
  const subjectCount = results.length;
  const isUltraCompact = subjectCount >= 14; // 14 to 16 subjects
  const isCompact = subjectCount >= 10 && subjectCount < 14; // 10 to 13 subjects

  const formattedCandidateName = formatStudentName(
    studentInfo.name || `${studentInfo.firstName || ""} ${studentInfo.lastName || ""}` || "Student Name"
  );

  return (
    <Box
      id="student-report-sheet"
      bg="white"
      borderRadius="2xl"
      p={
        isUltraCompact
          ? { base: 3, md: 4 }
          : isCompact
          ? { base: 4, md: 6 }
          : { base: 5, md: 8 }
      }
      border="2px solid #CBD5E1"
      boxShadow="0 10px 30px rgba(0,0,0,0.06)"
      maxW="920px"
      mx="auto"
      position="relative"
    >
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 3.5mm 5mm !important;
          }
          html, body {
            height: 100% !important;
            max-height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #student-report-sheet, #student-report-sheet * {
            visibility: visible !important;
          }
          #student-report-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: 290mm !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            break-inside: avoid !important;
            break-after: avoid !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }
          .no-print {
            display: none !important;
          }
          table, tr, td, th, tbody, thead, tfoot {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Security Status Banner (Staff & Student View - Screen Only) */}
      <Flex
        justify="space-between"
        align="center"
        bg={isApproved ? "#ECFDF5" : isRejected ? "#FEF2F2" : "#FFFBEB"}
        border="1px solid"
        borderColor={isApproved ? "#A7F3D0" : isRejected ? "#FECACA" : "#FDE68A"}
        borderRadius="xl"
        px={3.5}
        py={1.5}
        mb={3}
        wrap="wrap"
        gap={2}
        className="no-print"
      >
        <Flex align="center" gap={2}>
          <Icon
            as={isApproved ? FaCheckCircle : isRejected ? FaExclamationTriangle : FaClock}
            color={isApproved ? "#059669" : isRejected ? "#DC2626" : "#D97706"}
            boxSize={3.5}
          />
          <Text
            fontSize="12px"
            fontWeight="700"
            color={isApproved ? "#065F46" : isRejected ? "#991B1B" : "#92400E"}
          >
            {isApproved
              ? "Official Terminal Report Card — Approved & Published"
              : isRejected
              ? "Under Review / Revision Requested by School Administration"
              : "Institutional Draft / Awaiting Principal's Final Endorsement"}
          </Text>
        </Flex>
        <Badge
          bg={isApproved ? "#059669" : isRejected ? "#DC2626" : "#D97706"}
          color="white"
          px={2.5}
          py={0.5}
          borderRadius="md"
          fontSize="10px"
          fontWeight="800"
        >
          {approvalStatus.toUpperCase()}
        </Badge>
      </Flex>

      {/* Official School Header */}
      <Flex
        justify="space-between"
        align="center"
        borderBottom="2px double #4338CA"
        pb={isUltraCompact ? 2 : isCompact ? 3 : 4}
        mb={isUltraCompact ? 2 : isCompact ? 3 : 4}
        gap={3}
        wrap="wrap"
      >
        <Flex align="center" gap={isUltraCompact ? 2.5 : 3.5}>
          {institutionInfo.logoUrl ? (
            <Box
              w={isUltraCompact ? "42px" : isCompact ? "52px" : "68px"}
              h={isUltraCompact ? "42px" : isCompact ? "52px" : "68px"}
              p={0.5}
              border="1px solid #E2E8F0"
              borderRadius="lg"
              bg="white"
              flexShrink={0}
            >
              <img
                src={institutionInfo.logoUrl}
                alt="Crest"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Box>
          ) : (
            <Flex
              w={isUltraCompact ? "40px" : isCompact ? "50px" : "64px"}
              h={isUltraCompact ? "40px" : isCompact ? "50px" : "64px"}
              borderRadius="lg"
              bg="#EEF2FF"
              color="#4338CA"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={FaGraduationCap} boxSize={isUltraCompact ? 5 : 7} />
            </Flex>
          )}

          <Box>
            <Text
              fontSize={
                isUltraCompact
                  ? { base: "15px", md: "17px" }
                  : isCompact
                  ? { base: "17px", md: "19px" }
                  : { base: "19px", md: "22px" }
              }
              fontWeight="900"
              color="#0F172A"
              textTransform="uppercase"
              letterSpacing="-0.3px"
              lineHeight="1.15"
            >
              {institutionInfo.name || "Academic Institution"}
            </Text>
            {institutionInfo.motto && (
              <Text
                fontSize={isUltraCompact ? "9.5px" : "11px"}
                color="#4338CA"
                fontWeight="600"
                fontStyle="italic"
                mt={0.5}
              >
                "{institutionInfo.motto}"
              </Text>
            )}
            <Text fontSize={isUltraCompact ? "8.5px" : "10.5px"} color="#64748B" mt={0.5} lineHeight="1.2">
              {institutionInfo.address || "Main Campus, Education Boulevard"}
              {institutionInfo.phone ? ` • Tel: ${institutionInfo.phone}` : ""}
              {institutionInfo.email ? ` • ${institutionInfo.email}` : ""}
            </Text>
          </Box>
        </Flex>

        <Box textAlign={{ base: "left", sm: "right" }}>
          <Badge
            bg="#4338CA"
            color="white"
            px={2.5}
            py={0.5}
            borderRadius="md"
            fontSize={isUltraCompact ? "9.5px" : "11px"}
            fontWeight="800"
            letterSpacing="0.4px"
          >
            TERMINAL REPORT SHEET
          </Badge>
          <Text
            fontSize={isUltraCompact ? "11px" : "12.5px"}
            fontWeight="800"
            color="#0F172A"
            mt={1}
            lineHeight="1.1"
          >
            {reportCard.term} • {reportCard.session}
          </Text>
          <Text fontSize={isUltraCompact ? "8.5px" : "9.5px"} color="#94A3B8" fontWeight="600">
            REF: RC/{reportCard.session?.replace("/", "")}/{studentInfo.studentCode || "STUDENT"}
          </Text>
        </Box>
      </Flex>

      {/* Student Profile & Bio Strip (Compact Density Scaled) */}
      <Box
        bg="#F8FAFC"
        p={isUltraCompact ? "6px 10px" : isCompact ? "8px 12px" : "12px 16px"}
        borderRadius="xl"
        border="1px solid #E2E8F0"
        mb={isUltraCompact ? 2 : isCompact ? 2.5 : 3.5}
      >
        <Flex
          justify="space-between"
          align="center"
          flexWrap="wrap"
          gap={isUltraCompact ? 2 : 3}
        >
          {/* Candidate Identity */}
          <Flex align="center" gap={2.5}>
            {studentInfo.faceImageUrl ? (
              <Box
                w={isUltraCompact ? "38px" : "46px"}
                h={isUltraCompact ? "38px" : "46px"}
                borderRadius="lg"
                overflow="hidden"
                border="2px solid #4338CA"
                flexShrink={0}
              >
                <img
                  src={studentInfo.faceImageUrl}
                  alt={formattedCandidateName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
            ) : (
              <Flex
                w={isUltraCompact ? "34px" : "42px"}
                h={isUltraCompact ? "34px" : "42px"}
                borderRadius="lg"
                bg="#EDE9FE"
                color="#6D28D9"
                align="center"
                justify="center"
                flexShrink={0}
              >
                <Icon as={FaGraduationCap} boxSize={isUltraCompact ? 4 : 5} />
              </Flex>
            )}

            <Box>
              <Text
                fontSize={isUltraCompact ? "8px" : "9px"}
                fontWeight="800"
                color="#64748B"
                textTransform="uppercase"
              >
                Candidate Full Name
              </Text>
              <Text
                fontSize={isUltraCompact ? "13px" : isCompact ? "14px" : "15px"}
                fontWeight="900"
                color="#0F172A"
                lineHeight="1.15"
              >
                {formattedCandidateName}
              </Text>
              <Text
                fontSize={isUltraCompact ? "9.5px" : "10.5px"}
                color="#4338CA"
                fontWeight="700"
              >
                Admission ID: {studentInfo.studentCode || "—"}
              </Text>
            </Box>
          </Flex>

          {/* Academic Profile Details */}
          <Flex align="center" gap={{ base: 3, sm: 5 }} wrap="wrap">
            <Box>
              <Text fontSize={isUltraCompact ? "8px" : "9px"} fontWeight="800" color="#64748B" textTransform="uppercase">
                Class / Arm
              </Text>
              <Text fontSize={isUltraCompact ? "11px" : "12.5px"} fontWeight="800" color="#0F172A">
                {studentInfo.classArm || "Unassigned"}
              </Text>
            </Box>
            <Box>
              <Text fontSize={isUltraCompact ? "8px" : "9px"} fontWeight="800" color="#64748B" textTransform="uppercase">
                Gender
              </Text>
              <Text fontSize={isUltraCompact ? "11px" : "12.5px"} fontWeight="800" color="#0F172A">
                {studentInfo.gender || "—"}
              </Text>
            </Box>
            <Box>
              <Text fontSize={isUltraCompact ? "8px" : "9px"} fontWeight="800" color="#64748B" textTransform="uppercase">
                Term / Session
              </Text>
              <Text fontSize={isUltraCompact ? "11px" : "12.5px"} fontWeight="800" color="#4338CA">
                {reportCard.term}
              </Text>
            </Box>
          </Flex>
        </Flex>

        {/* Integrated Attendance Strip */}
        <Flex
          mt={isUltraCompact ? 1.5 : 2}
          pt={isUltraCompact ? 1.5 : 2}
          borderTop="1px dashed #CBD5E1"
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={2}
          fontSize={isUltraCompact ? "9px" : "10.5px"}
        >
          <Flex align="center" gap={1.5}>
            <Icon as={FaUserCheck} color="#4338CA" boxSize={3} />
            <Text fontWeight="800" color="#334155" textTransform="uppercase">
              Term Attendance:
            </Text>
            <Text color="#64748B">
              Opened: <strong>{attendance.timesSchoolOpened ?? "—"}</strong> | Present: <strong style={{ color: "#059669" }}>{attendance.timesPresent ?? "—"}</strong> | Absent: <strong style={{ color: "#DC2626" }}>{attendance.timesAbsent ?? "0"}</strong>
            </Text>
          </Flex>
          <Badge
            bg="#EEF2FF"
            color="#4338CA"
            border="1px solid #C7D2FE"
            px={2}
            py={0.5}
            borderRadius="md"
            fontSize={isUltraCompact ? "8.5px" : "10px"}
            fontWeight="800"
          >
            {attendance.attendancePercentage ?? 100}% Regularity ({ (attendance.attendancePercentage ?? 100) >= 90 ? "Excellent" : (attendance.attendancePercentage ?? 100) >= 75 ? "Satisfactory" : "Irregular" })
          </Badge>
        </Flex>
      </Box>

      {/* Broadsheet Subject Scores Table (Ultra-density for up to 16 subjects on 1 page) */}
      <Box overflowX="auto" mb={isUltraCompact ? 1.5 : isCompact ? 2.5 : 3.5}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#F1F5F9", borderBottom: "2px solid #CBD5E1" }}>
              <th
                style={{
                  padding: isUltraCompact ? "3px 6px" : isCompact ? "5px 8px" : "8px 10px",
                  fontSize: isUltraCompact ? "9.5px" : isCompact ? "10px" : "11px",
                  color: "#334155",
                  fontWeight: "800",
                }}
              >
                SUBJECT ({results.length})
              </th>
              {showDetailedCa && (
                <>
                  <th
                    style={{
                      padding: isUltraCompact ? "3px 4px" : isCompact ? "5px 6px" : "8px 8px",
                      fontSize: isUltraCompact ? "9px" : isCompact ? "9.5px" : "11px",
                      color: "#334155",
                      fontWeight: "800",
                      textAlign: "center",
                    }}
                  >
                    CA1 (10)
                  </th>
                  <th
                    style={{
                      padding: isUltraCompact ? "3px 4px" : isCompact ? "5px 6px" : "8px 8px",
                      fontSize: isUltraCompact ? "9px" : isCompact ? "9.5px" : "11px",
                      color: "#334155",
                      fontWeight: "800",
                      textAlign: "center",
                    }}
                  >
                    CA2 (10)
                  </th>
                  <th
                    style={{
                      padding: isUltraCompact ? "3px 4px" : isCompact ? "5px 6px" : "8px 8px",
                      fontSize: isUltraCompact ? "9px" : isCompact ? "9.5px" : "11px",
                      color: "#334155",
                      fontWeight: "800",
                      textAlign: "center",
                    }}
                  >
                    ASSN (10)
                  </th>
                </>
              )}
              <th
                style={{
                  padding: isUltraCompact ? "3px 5px" : isCompact ? "5px 8px" : "8px 9px",
                  fontSize: isUltraCompact ? "9.5px" : isCompact ? "10px" : "11px",
                  color: "#334155",
                  fontWeight: "800",
                  textAlign: "center",
                }}
              >
                CA (30)
              </th>
              <th
                style={{
                  padding: isUltraCompact ? "3px 5px" : isCompact ? "5px 8px" : "8px 9px",
                  fontSize: isUltraCompact ? "9.5px" : isCompact ? "10px" : "11px",
                  color: "#334155",
                  fontWeight: "800",
                  textAlign: "center",
                }}
              >
                EXAM (70)
              </th>
              <th
                style={{
                  padding: isUltraCompact ? "3px 6px" : isCompact ? "5px 8px" : "8px 10px",
                  fontSize: isUltraCompact ? "9.5px" : isCompact ? "10.5px" : "11.5px",
                  color: "#334155",
                  fontWeight: "900",
                  textAlign: "center",
                }}
              >
                TOTAL (100)
              </th>
              <th
                style={{
                  padding: isUltraCompact ? "3px 5px" : isCompact ? "5px 6px" : "8px 8px",
                  fontSize: isUltraCompact ? "9px" : isCompact ? "9.5px" : "11px",
                  color: "#334155",
                  fontWeight: "800",
                  textAlign: "center",
                }}
              >
                GRADE
              </th>
              <th
                style={{
                  padding: isUltraCompact ? "3px 6px" : isCompact ? "5px 8px" : "8px 10px",
                  fontSize: isUltraCompact ? "9px" : isCompact ? "10px" : "11px",
                  color: "#334155",
                  fontWeight: "800",
                }}
              >
                REMARK
              </th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td
                  colSpan={showDetailedCa ? 9 : 6}
                  style={{ padding: "30px 16px", textAlign: "center", color: "#64748B" }}
                >
                  <Icon as={FaExclamationTriangle} boxSize={5} color="#D97706" mb={1.5} />
                  <Text fontSize="13px" fontWeight="800" color="#0F172A">
                    No Examination Results Recorded Yet
                  </Text>
                  <Text fontSize="11px" color="#64748B" maxW="400px" mx="auto" mt={0.5}>
                    Scores have not been entered or synchronized from CBT for this candidate for {reportCard.term} • {reportCard.session}.
                  </Text>
                  {(onEditScores || onSyncCbt) && (
                    <Flex justify="center" gap={2} mt={3} className="no-print">
                      {onEditScores && (
                        <Button size="xs" bg="#4338CA" color="white" borderRadius="lg" onClick={onEditScores}>
                          <Icon as={FaPencilAlt} mr={1} /> Enter Scores
                        </Button>
                      )}
                      {onSyncCbt && (
                        <Button size="xs" variant="outline" borderColor="#6D28D9" color="#6D28D9" borderRadius="lg" onClick={onSyncCbt}>
                          <Icon as={FaSyncAlt} mr={1} /> Sync from CBT
                        </Button>
                      )}
                    </Flex>
                  )}
                </td>
              </tr>
            ) : (
              results.map((result, index) => {
                const caTotal = callableCa(result);
                const gradeStyle = getGradeBadgeStyle(result.grade);
                const rowPad = isUltraCompact ? "2.2px 5px" : isCompact ? "4px 8px" : "7px 10px";
                const cellFontSize = isUltraCompact ? "9.5px" : isCompact ? "11px" : "12px";

                return (
                  <tr
                    key={index}
                    style={{
                      borderBottom: "1px solid #E2E8F0",
                      background: index % 2 === 1 ? "#FAF5FF08" : "transparent",
                    }}
                  >
                    <td
                      style={{
                        padding: rowPad,
                        fontWeight: "800",
                        fontSize: cellFontSize,
                        color: "#0F172A",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {result.subject}
                    </td>
                    {showDetailedCa && (
                      <>
                        <td style={{ padding: rowPad, fontSize: cellFontSize, color: "#334155", textAlign: "center" }}>
                          {result.caScore1 ?? 0}
                        </td>
                        <td style={{ padding: rowPad, fontSize: cellFontSize, color: "#334155", textAlign: "center" }}>
                          {result.caScore2 ?? 0}
                        </td>
                        <td style={{ padding: rowPad, fontSize: cellFontSize, color: "#334155", textAlign: "center" }}>
                          {result.assignmentScore ?? 0}
                        </td>
                      </>
                    )}
                    <td
                      style={{
                        padding: rowPad,
                        fontWeight: "700",
                        fontSize: cellFontSize,
                        color: "#4338CA",
                        textAlign: "center",
                      }}
                    >
                      {caTotal}
                    </td>
                    <td style={{ padding: rowPad, fontSize: cellFontSize, color: "#334155", textAlign: "center" }}>
                      {result.examScore ?? 0}
                    </td>
                    <td
                      style={{
                        padding: rowPad,
                        fontWeight: "900",
                        fontSize: isUltraCompact ? "10.5px" : isCompact ? "12px" : "13.5px",
                        color: "#0F172A",
                        textAlign: "center",
                      }}
                    >
                      {result.totalScore ?? 0}
                    </td>
                    <td style={{ padding: rowPad, textAlign: "center" }}>
                      <Badge
                        bg={gradeStyle.bg}
                        color={gradeStyle.color}
                        border={`1px solid ${gradeStyle.border}`}
                        px={isUltraCompact ? "2px" : "4px"}
                        py={0.2}
                        borderRadius="sm"
                        fontWeight="800"
                        fontSize={isUltraCompact ? "8px" : "9.5px"}
                      >
                        {result.grade || "—"}
                      </Badge>
                    </td>
                    <td
                      style={{
                        padding: rowPad,
                        fontSize: isUltraCompact ? "8.5px" : "10.5px",
                        color: "#475569",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {result.remark || "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {results.length > 0 && (
            <tfoot>
              <tr style={{ background: "#F8FAFC", borderTop: "2px solid #CBD5E1", borderBottom: "2px solid #CBD5E1" }}>
                <td
                  colSpan={showDetailedCa ? 5 : 2}
                  style={{
                    padding: isUltraCompact ? "3.5px 6px" : isCompact ? "5px 8px" : "8px 10px",
                    fontWeight: "800",
                    fontSize: isUltraCompact ? "9.5px" : "11px",
                    color: "#0F172A",
                  }}
                >
                  CUMULATIVE TERMINAL TOTAL
                </td>
                <td
                  style={{
                    padding: isUltraCompact ? "3.5px 6px" : isCompact ? "5px 8px" : "8px 10px",
                    fontWeight: "700",
                    fontSize: isUltraCompact ? "9px" : "10.5px",
                    color: "#64748B",
                    textAlign: "center",
                  }}
                >
                  OUT OF {results.length * 100}
                </td>
                <td
                  style={{
                    padding: isUltraCompact ? "3.5px 6px" : isCompact ? "5px 8px" : "8px 10px",
                    fontWeight: "900",
                    fontSize: isUltraCompact ? "11.5px" : "13.5px",
                    color: "#0F172A",
                    textAlign: "center",
                  }}
                >
                  {summary.totalScore ?? 0}
                </td>
                <td
                  colSpan={2}
                  style={{
                    padding: isUltraCompact ? "3.5px 6px" : isCompact ? "5px 8px" : "8px 10px",
                    fontWeight: "800",
                    fontSize: isUltraCompact ? "10px" : "12px",
                    color: "#4338CA",
                  }}
                >
                  AVERAGE: {summary.averageScore ?? 0}%
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </Box>

      {/* WAEC / National Standard Grading Scale Legend */}
      <Box
        bg="#F8FAFC"
        border="1px solid #E2E8F0"
        borderRadius="md"
        p={isUltraCompact ? "2px 6px" : isCompact ? "4px 8px" : "6px 10px"}
        mb={isUltraCompact ? 1.5 : isCompact ? 2 : 3}
      >
        <Flex
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={1}
          fontSize={isUltraCompact ? "7.5px" : isCompact ? "8.5px" : "9.5px"}
          color="#64748B"
          fontWeight="700"
        >
          <Text color="#0F172A" fontWeight="800" textTransform="uppercase">
            GRADING KEY:
          </Text>
          <Text><strong style={{ color: "#6D28D9" }}>A:</strong> 70-100% (Excellent)</Text>
          <Text><strong style={{ color: "#4338CA" }}>B:</strong> 60-69% (Very Good)</Text>
          <Text><strong style={{ color: "#0F766E" }}>C:</strong> 50-59% (Credit)</Text>
          <Text><strong style={{ color: "#B45309" }}>D:</strong> 40-49% (Pass)</Text>
          <Text><strong style={{ color: "#C2410C" }}>E:</strong> 30-39% (Fair)</Text>
          <Text><strong style={{ color: "#B91C1C" }}>F:</strong> 0-29% (Fail)</Text>
        </Flex>
      </Box>

      {/* Summary Score Tiles */}
      <SimpleGrid
        columns={{ base: 2, sm: 4 }}
        gap={isUltraCompact ? 1.5 : isCompact ? 2 : 2.5}
        mb={isUltraCompact ? 1.5 : isCompact ? 2 : 3}
      >
        <SummaryTile
          label="Total Subjects"
          value={summary.totalSubjects ?? results.length}
          subtext="Enrollments"
          isCompact={isCompact}
          isUltraCompact={isUltraCompact}
        />
        <SummaryTile
          label="Cumulative Marks"
          value={summary.totalScore ?? 0}
          subtext={`Out of ${(results.length || 0) * 100}`}
          isCompact={isCompact}
          isUltraCompact={isUltraCompact}
        />
        <SummaryTile
          label="Terminal Average"
          value={`${summary.averageScore ?? 0}%`}
          subtext="Overall Standing"
          color="#4338CA"
          bg="#EEF2FF"
          isCompact={isCompact}
          isUltraCompact={isUltraCompact}
        />
        <SummaryTile
          label="Academic Standing"
          value={
            (summary.averageScore ?? 0) >= 70
              ? "Excellent"
              : (summary.averageScore ?? 0) >= 60
              ? "Very Good"
              : (summary.averageScore ?? 0) >= 50
              ? "Credit"
              : (summary.averageScore ?? 0) >= 40
              ? "Pass"
              : (summary.averageScore ?? 0) >= 30
              ? "Fair"
              : "Review"
          }
          color={
            (summary.averageScore ?? 0) >= 60
              ? "#059669"
              : (summary.averageScore ?? 0) >= 50
              ? "#D97706"
              : "#DC2626"
          }
          subtext="Performance Tier"
          isCompact={isCompact}
          isUltraCompact={isUltraCompact}
        />
      </SimpleGrid>

      {/* Form Teacher & Principal Official Remarks */}
      <Box
        bg="#F8FAFC"
        border="1px solid #E2E8F0"
        borderRadius="lg"
        p={isUltraCompact ? "4px 8px" : isCompact ? "6px 10px" : "10px 14px"}
        mb={isUltraCompact ? 1.5 : isCompact ? 2 : 3}
      >
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={isUltraCompact ? 2 : 3}>
          <Box>
            <Text
              fontSize={isUltraCompact ? "8px" : "9.5px"}
              fontWeight="800"
              color="#334155"
              mb={0.5}
              textTransform="uppercase"
            >
              Form Teacher's Assessment
            </Text>
            <Text
              fontSize={isUltraCompact ? "9.5px" : isCompact ? "11px" : "12px"}
              color="#1E293B"
              fontStyle="italic"
              lineHeight="1.2"
            >
              "{summary.teacherComment || summary.overallRemark || "Diligent candidate with steady academic focus."}"
            </Text>
          </Box>

          <Box>
            <Text
              fontSize={isUltraCompact ? "8px" : "9.5px"}
              fontWeight="800"
              color="#334155"
              mb={0.5}
              textTransform="uppercase"
            >
              Principal's Executive Endorsement
            </Text>
            <Text
              fontSize={isUltraCompact ? "9.5px" : isCompact ? "11px" : "12px"}
              color="#1E293B"
              fontStyle="italic"
              lineHeight="1.2"
            >
              "{summary.principalRemark || "Commendable performance. Sustain this momentum next term."}"
            </Text>
          </Box>
        </SimpleGrid>

        {summary.nextTermResumption && (
          <Flex
            align="center"
            gap={1.5}
            mt={isUltraCompact ? 1 : 1.5}
            pt={isUltraCompact ? 1 : 1.5}
            borderTop="1px dashed #CBD5E1"
            fontSize={isUltraCompact ? "8px" : "9.5px"}
            color="#1E40AF"
          >
            <Icon as={FaCalendarAlt} color="#2563EB" boxSize={2.5} />
            <Text>
              Next Academic Term Resumes: <strong>{summary.nextTermResumption}</strong>
            </Text>
          </Flex>
        )}
      </Box>

      {/* Signatures & School Stamp Section */}
      <Flex
        justify="space-between"
        align="flex-end"
        pt={isUltraCompact ? 1 : 2}
        mb={isUltraCompact ? 1 : 2}
        borderTop="1px solid #E2E8F0"
        wrap="wrap"
        gap={2}
      >
        {/* Form Teacher Endorsement Line */}
        <Box textAlign="center" minW={isUltraCompact ? "130px" : "150px"}>
          <Box h={isUltraCompact ? "18px" : "28px"} borderBottom="1px solid #94A3B8" mb={0.5} />
          <Text fontSize={isUltraCompact ? "9px" : "10.5px"} fontWeight="800" color="#0F172A">
            Form Teacher's Signature
          </Text>
          <Text fontSize={isUltraCompact ? "8px" : "9px"} color="#64748B">
            Class Administration
          </Text>
        </Box>

        {/* School Stamp Seal */}
        {signature.stampUrl ? (
          <Box
            w={isUltraCompact ? "44px" : isCompact ? "56px" : "68px"}
            h={isUltraCompact ? "44px" : isCompact ? "56px" : "68px"}
            borderRadius="full"
            overflow="hidden"
            opacity={0.92}
            flexShrink={0}
            border="1px solid #E2E8F0"
            p={0.5}
          >
            <img
              src={signature.stampUrl}
              alt="School stamp"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </Box>
        ) : (
          <Box
            w={isUltraCompact ? "44px" : isCompact ? "56px" : "64px"}
            h={isUltraCompact ? "44px" : isCompact ? "56px" : "64px"}
            borderRadius="full"
            border="1.5px dashed #94A3B8"
            p={0.5}
            display="flex"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
          >
            <Text fontSize={isUltraCompact ? "7px" : "8px"} fontWeight="800" color="#94A3B8" textTransform="uppercase">
              Official Seal
            </Text>
          </Box>
        )}

        {/* Principal Digital Signature */}
        <Box textAlign="center" minW={isUltraCompact ? "140px" : "160px"}>
          {signature.signatureUrl ? (
            <Box
              h={isUltraCompact ? "24px" : "34px"}
              mb={0.5}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <img
                src={signature.signatureUrl}
                alt="Principal signature"
                style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
              />
            </Box>
          ) : (
            <Box h={isUltraCompact ? "20px" : "30px"} borderBottom="1px solid #0F172A" mb={0.5} />
          )}
          <Box w="100%" h="1px" bg="#0F172A" mb={0.5} />
          <Text fontSize={isUltraCompact ? "9.5px" : "11px"} fontWeight="900" color="#0F172A">
            {signature.principalName || institutionInfo.principalName || "Principal / Head of School"}
          </Text>
          <Text fontSize={isUltraCompact ? "8px" : "9px"} color="#64748B" fontWeight="600">
            {signature.principalTitle || institutionInfo.principalTitle || "Authorized Signatory"}
          </Text>
        </Box>
      </Flex>

      {/* Security Verification Footer */}
      <Flex
        justify="space-between"
        align="center"
        pt={1}
        borderTop="1px solid #F1F5F9"
        fontSize={isUltraCompact ? "7.5px" : "9px"}
        color="#94A3B8"
        wrap="wrap"
        gap={1}
      >
        <Flex align="center" gap={1}>
          <Icon as={FaShieldAlt} color="#059669" boxSize={2.5} />
          <Text>
            AUTHENTIC ACADEMIC RECORD — VERIFIED BY {institutionInfo.name || "ACE-SMART INSTITUTION"}
          </Text>
        </Flex>
        <Text>
          Generated on {new Date().toLocaleDateString(undefined, { dateStyle: "long" })}
        </Text>
      </Flex>

      {/* Print Action Button */}
      <Flex justify="center" mt={4} className="no-print">
        <Button
          bg="#4338CA"
          color="white"
          borderRadius="xl"
          onClick={handlePrint}
          _hover={{ opacity: 0.95 }}
          px={5}
          h="40px"
          fontWeight="800"
          fontSize="13px"
        >
          <Icon as={FaPrint} mr={2} boxSize={3.5} />
          Print Official Report Card (A4 Single Page)
        </Button>
      </Flex>
    </Box>
  );
};

export default StudentReportCardSheet;
