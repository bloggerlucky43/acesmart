import {
  Box,
  Flex,
  Table,
  Text,
  Button,
  Badge,
  HStack,
  Icon,
  VStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { fetchExamResults } from "../../../../api-endpoint/exam/exams";
import { getClassInsights } from "../../../../api-endpoint/ai/ai";
import { TableSkeleton, AISummarySkeleton } from "../../../../components/ui/skeletons";
import {
  FaFileExcel,
  FaFilePdf,
  FaArrowLeft,
  FaAward,
  FaUserGraduate,
  FaBrain,
  FaShieldAlt,
  FaExclamationTriangle,
  FaSyncAlt,
  FaTimes,
  FaCheckCircle,
  FaLightbulb,
} from "react-icons/fa";

export const MResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResult] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [selectedCandidateAnomaly, setSelectedCandidateAnomaly] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchStudentResults = async () => {
      try {
        setLoading(true);
        const response = await fetchExamResults(id);
        let data = [];
        if (Array.isArray(response?.data)) {
          data = response.data;
        } else if (Array.isArray(response)) {
          data = response;
        }
        setResult(data);
      } catch (error) {
        console.error("Error fetching student results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentResults();
  }, [id]);

  // dynamically extracting all subject keys from scores
  const subjects = useMemo(() => {
    const subjectSet = new Set();
    results.forEach((res) => {
      Object.keys(res.scores || {}).forEach((subject) =>
        subjectSet.add(subject)
      );
    });
    return Array.from(subjectSet);
  }, [results]);

  const examTitle = results[0]?.examTitle || "Examination";

  // Calculate summary metrics
  const avgPercentage = useMemo(() => {
    if (!results.length) return 0;
    const total = results.reduce((acc, r) => acc + (Number(r.percentage) || 0), 0);
    return (total / results.length).toFixed(1);
  }, [results]);

  // Fetch AI Class Readiness & Progress Insights
  const fetchClassAiInsights = async () => {
    if (!results.length) return;
    setLoadingAi(true);
    try {
      const insights = await getClassInsights({
        examId: id,
        examTitle,
        results,
      });
      setAiInsights(insights);
    } catch (err) {
      console.warn("AI class insights load notice:", err);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    if (results.length > 0) {
      fetchClassAiInsights();
    }
  }, [results.length]);

  const handleDownload = () => {
    if (!results.length) return;

    const dataForExcel = results.map((res) => {
      const studentCode = res?.studentCode || res?.studentId || res?.Student?.studentId;
      const studentName = `${res?.Student?.firstName || ""} ${res?.Student?.lastName || ""}`.trim() || "N/A";
      const violations = res?.violationCount || (Array.isArray(res?.anomalies) ? res.anomalies.length : 0);
      const integrity = res?.integrityStatus || (violations > 0 ? "FLAGGED" : "VERIFIED");

      const base = {
        "Student ID": studentCode,
        Name: studentName,
        "Total Score": res?.totalScore,
        Percentage: `${res.percentage}%`,
        "Integrity Status": integrity,
        "Violation Count": violations,
      };

      subjects.forEach((subject) => {
        base[subject] = res?.scores?.[subject] ?? "-";
      });

      return base;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Class Results");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(blob, `ExamResults_${id}_${Date.now()}.xlsx`);
  };

  const handleDownloadPDF = () => {
    const input = document.getElementById("result-table");
    if (!input) return;

    setPdfGenerating(true);
    html2canvas(input, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 190;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 10;

        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`ExamResults_${id}.pdf`);
      })
      .finally(() => {
        setPdfGenerating(false);
      });
  };

  if (loading) {
    return (
      <Box p={{ base: 4, md: 6 }} minH="calc(100vh - 58px)" bg="#F8FAFC">
        <AISummarySkeleton />
        <Box mt={6}>
          <TableSkeleton rows={6} columns={7} />
        </Box>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 6 }} minH="calc(100vh - 58px)" bg="#F8FAFC">
      {/* Top Header Card */}
      <Box
        bg="linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)"
        p={{ base: 5, md: 6 }}
        borderRadius="2xl"
        color="white"
        mb={5}
        boxShadow="0 8px 24px rgba(15, 23, 42, 0.2)"
      >
        <Flex justify="space-between" align="center" mb={3}>
          <Button
            size="xs"
            variant="ghost"
            color="white"
            onClick={() => navigate("/teacher/exam_result")}
            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
            px={2}
          >
            <Icon as={FaArrowLeft} mr={1.5} />
            All Exams
          </Button>
          <Badge
            bg="rgba(99, 102, 241, 0.25)"
            color="#A5B4FC"
            borderRadius="full"
            px={3}
            py={0.5}
            fontSize="11px"
            fontWeight="700"
          >
            {results.length} Candidates Enrolled
          </Badge>
        </Flex>

        <Text fontSize="22px" fontWeight="800" lineHeight="1.3" mb={1} fontFamily="'Outfit', sans-serif">
          {examTitle} Results & Proctoring Ledger
        </Text>
        <Text fontSize="13px" color="#94A3B8">
          Review automated scoring, biometric audit logs, and AI class learning readiness diagnostics
        </Text>

        {/* Quick KPI stats */}
        <Flex mt={5} gap={3} flexWrap="wrap">
          <Box
            flex={1}
            minW="140px"
            bg="rgba(255, 255, 255, 0.08)"
            p={3}
            borderRadius="xl"
            border="1px solid rgba(255, 255, 255, 0.1)"
          >
            <HStack spacing={1.5} mb={0.5}>
              <Icon as={FaUserGraduate} boxSize={3.5} color="#818CF8" />
              <Text fontSize="11px" color="#94A3B8">Submissions</Text>
            </HStack>
            <Text fontSize="18px" fontWeight="bold">{results.length}</Text>
          </Box>
          <Box
            flex={1}
            minW="140px"
            bg="rgba(255, 255, 255, 0.08)"
            p={3}
            borderRadius="xl"
            border="1px solid rgba(255, 255, 255, 0.1)"
          >
            <HStack spacing={1.5} mb={0.5}>
              <Icon as={FaAward} boxSize={3.5} color="#34D399" />
              <Text fontSize="11px" color="#94A3B8">Cohort Average</Text>
            </HStack>
            <Text fontSize="18px" fontWeight="bold" color="#34D399">{avgPercentage}%</Text>
          </Box>
          <Box
            flex={1}
            minW="140px"
            bg="rgba(255, 255, 255, 0.08)"
            p={3}
            borderRadius="xl"
            border="1px solid rgba(255, 255, 255, 0.1)"
          >
            <HStack spacing={1.5} mb={0.5}>
              <Icon as={FaShieldAlt} boxSize={3.5} color="#C084FC" />
              <Text fontSize="11px" color="#94A3B8">Proctor Flags</Text>
            </HStack>
            <Text fontSize="18px" fontWeight="bold" color="#C084FC">
              {results.filter((r) => (r.violationCount || 0) > 0).length} Flagged
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* AI Class Readiness & Progress Summaries Banner */}
      {results.length > 0 && (
        <Box
          bg="white"
          p={{ base: 5, md: 6 }}
          borderRadius="2xl"
          border="1px solid"
          borderColor="purple.100"
          boxShadow="0 4px 20px -4px rgba(106, 27, 154, 0.08)"
          mb={5}
          position="relative"
          className="animate-slide-up"
        >
          <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
            <Flex align="center" gap={3}>
              <Flex
                w="38px"
                h="38px"
                borderRadius="xl"
                bg="purple.50"
                color="#6A1B9A"
                align="center"
                justify="center"
              >
                <Icon as={FaBrain} boxSize={5} />
              </Flex>
              <Box>
                <Flex align="center" gap={2}>
                  <Text fontSize="16px" fontWeight="800" color="gray.900" fontFamily="'Outfit', sans-serif">
                    AI Class Readiness & Learning Diagnostic
                  </Text>
                  <Badge
                    bg="purple.50"
                    color="#6A1B9A"
                    border="1px solid"
                    borderColor="purple.200"
                    px={2}
                    py={0.5}
                    borderRadius="full"
                    fontSize="11px"
                    fontWeight="700"
                  >
                    Readiness: {aiInsights?.classReadinessScore ?? Math.round(Number(avgPercentage))}%
                  </Badge>
                </Flex>
                <Text fontSize="12px" color="gray.500">
                  Synthesized cohort analytics, syllabus mastery gaps, and teacher interventions
                </Text>
              </Box>
            </Flex>

            <Button
              size="xs"
              variant="outline"
              borderColor="purple.200"
              color="#6A1B9A"
              borderRadius="lg"
              onClick={fetchClassAiInsights}
              loading={loadingAi}
            >
              <Icon as={FaSyncAlt} mr={1.5} />
              Refresh AI Insights
            </Button>
          </Flex>

          {/* Headline Finding Highlight Box */}
          <Box
            p={4}
            borderRadius="xl"
            bg="linear-gradient(135deg, rgba(106, 27, 154, 0.05) 0%, rgba(142, 36, 170, 0.08) 100%)"
            border="1px solid"
            borderColor="purple.100"
            mb={4}
          >
            <Text fontSize="13px" fontWeight="700" color="#6A1B9A" mb={1}>
              Key Cohort Takeaway:
            </Text>
            <Text fontSize="13px" color="gray.800" lineHeight="1.6">
              {aiInsights?.headlineFindings ||
                `${avgPercentage}% class average indicates solid foundational comprehension across tested sections. Target reinforcement on lower-scoring sections.`}
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
            {/* Topic Mastery Distribution */}
            <Box p={4} borderRadius="xl" bg="#F8FAFC" border="1px solid" borderColor="gray.200">
              <Text fontSize="12px" fontWeight="700" color="gray.700" mb={3} textTransform="uppercase">
                Syllabus Section Mastery:
              </Text>
              <VStack spacing={2.5} align="stretch">
                {subjects.map((subj) => {
                  const scoresList = results
                    .map((r) => Number(r.scores?.[subj]))
                    .filter((v) => !isNaN(v));
                  const avgSubj = scoresList.length
                    ? Math.round(scoresList.reduce((a, b) => a + b, 0) / scoresList.length)
                    : 0;
                  const isWeak = avgSubj < 50;

                  return (
                    <Box key={subj}>
                      <Flex justify="space-between" align="center" mb={1} fontSize="12px">
                        <Text fontWeight="600" color="gray.800" textTransform="capitalize">
                          {subj}
                        </Text>
                        <Badge
                          bg={isWeak ? "red.50" : "green.50"}
                          color={isWeak ? "red.600" : "green.700"}
                          fontSize="10px"
                        >
                          {avgSubj}% {isWeak ? "(Needs Review)" : "(Solid)"}
                        </Badge>
                      </Flex>
                      <Box w="100%" h="6px" bg="gray.200" borderRadius="full" overflow="hidden">
                        <Box
                          w={`${Math.min(100, Math.max(5, avgSubj))}%`}
                          h="100%"
                          bg={isWeak ? "#EF4444" : "#10B981"}
                          borderRadius="full"
                        />
                      </Box>
                    </Box>
                  );
                })}
              </VStack>
            </Box>

            {/* Recommended Pedagogical Interventions */}
            <Box p={4} borderRadius="xl" bg="#F8FAFC" border="1px solid" borderColor="gray.200">
              <Flex align="center" gap={1.5} mb={3}>
                <Icon as={FaLightbulb} color="#EAB308" boxSize={3.5} />
                <Text fontSize="12px" fontWeight="700" color="gray.700" textTransform="uppercase">
                  Actionable Teacher Interventions:
                </Text>
              </Flex>
              <VStack spacing={2} align="stretch">
                {(
                  aiInsights?.actionableRecommendations || [
                    "Conduct a 25-minute targeted review of foundational formulas in lower-scoring topics.",
                    "Assign a 10-question formative diagnostic practice to reinforce problem-solving steps.",
                    "Provide 1-on-1 scaffolding for candidates who scored below 40% threshold.",
                  ]
                ).map((rec, i) => (
                  <Flex key={i} align="flex-start" gap={2} fontSize="12px" color="gray.700">
                    <Text color="#6A1B9A" fontWeight="bold">#{i + 1}</Text>
                    <Text>{rec}</Text>
                  </Flex>
                ))}
              </VStack>
            </Box>
          </SimpleGrid>
        </Box>
      )}

      {/* Action Buttons */}
      <Flex gap={3} mb={5} flexWrap="wrap">
        <Button
          size="sm"
          bg="#059669"
          color="white"
          borderRadius="xl"
          fontSize="13px"
          fontWeight="semibold"
          onClick={handleDownload}
          isDisabled={!results.length}
          _hover={{ bg: "#047857" }}
          px={4}
        >
          <Icon as={FaFileExcel} mr={2} />
          Export Excel Results
        </Button>
        <Button
          size="sm"
          bg="#4F46E5"
          color="white"
          borderRadius="xl"
          fontSize="13px"
          fontWeight="semibold"
          onClick={handleDownloadPDF}
          isDisabled={!results.length}
          loading={pdfGenerating}
          _hover={{ bg: "#4338CA" }}
          px={4}
        >
          <Icon as={FaFilePdf} mr={2} />
          Export Printable PDF
        </Button>
      </Flex>

      {/* Results Table */}
      {results.length === 0 ? (
        <Box
          bg="white"
          p={10}
          borderRadius="2xl"
          border="1px dashed #CBD5E1"
          textAlign="center"
        >
          <Text fontWeight="semibold" color="#334155" mb={1}>
            No Results Found
          </Text>
          <Text fontSize="13px" color="#64748B">
            No candidates have submitted responses for this examination yet.
          </Text>
        </Box>
      ) : (
        <Box
          id="result-table"
          bg="white"
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          boxShadow="0 2px 10px rgba(0, 0, 0, 0.03)"
          overflow="hidden"
        >
          <Table.ScrollArea>
            <Table.Root size="sm" variant="outline">
              <Table.Header>
                <Table.Row bg="#0F172A">
                  <Table.ColumnHeader color="white" fontSize="11px" py={3.5}>
                    Candidate ID
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="white" fontSize="11px" py={3.5}>
                    Full Name
                  </Table.ColumnHeader>
                  {subjects.map((subject) => (
                    <Table.ColumnHeader
                      key={subject}
                      color="white"
                      fontSize="11px"
                      py={3.5}
                      textAlign="center"
                      textTransform="capitalize"
                    >
                      {subject}
                    </Table.ColumnHeader>
                  ))}
                  <Table.ColumnHeader color="white" fontSize="11px" py={3.5} textAlign="center">
                    Total Score
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="white" fontSize="11px" py={3.5} textAlign="center">
                    Accuracy (%)
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="white" fontSize="11px" py={3.5} textAlign="center">
                    Proctoring & Integrity
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {results.map((res, index) => {
                  const studentName = res?.Student
                    ? `${res?.Student?.firstName || ""} ${res?.Student?.lastName || ""}`.trim()
                    : "Unknown";
                  const studentCode =
                    res?.studentCode || res?.studentId || res?.Student?.studentId || `STU-${index + 1}`;
                  const pct = Number(res?.percentage || 0);

                  const anomalies = Array.isArray(res?.anomalies) ? res.anomalies : [];
                  const violationCount =
                    typeof res?.violationCount === "number" ? res.violationCount : anomalies.length;
                  const status = res?.integrityStatus || (violationCount > 0 ? "FLAGGED_SUSPICIOUS" : "VERIFIED");

                  return (
                    <Table.Row
                      key={res.id || index}
                      _hover={{ bg: "#F8FAFC" }}
                      borderBottom="1px solid #F1F5F9"
                    >
                      <Table.Cell py={3}>
                        <Badge
                          bg="#F1F5F9"
                          color="#475569"
                          fontSize="11px"
                          borderRadius="md"
                          px={2}
                          py={0.5}
                        >
                          {studentCode}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell py={3} fontSize="13px" fontWeight="600" color="#0F172A">
                        {studentName}
                      </Table.Cell>
                      {subjects.map((subject) => (
                        <Table.Cell key={subject} textAlign="center" fontSize="12px" color="#334155" py={3}>
                          {res.scores?.[subject] ?? "-"}
                        </Table.Cell>
                      ))}
                      <Table.Cell textAlign="center" py={3}>
                        <Text fontSize="13px" fontWeight="bold" color="#0F172A">
                          {res?.totalScore ?? 0}
                        </Text>
                      </Table.Cell>
                      <Table.Cell textAlign="center" py={3}>
                        <Badge
                          bg={pct >= 50 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)"}
                          color={pct >= 50 ? "#059669" : "#DC2626"}
                          fontSize="11px"
                          fontWeight="bold"
                          borderRadius="full"
                          px={2.5}
                          py={0.5}
                        >
                          {pct.toFixed(1)}%
                        </Badge>
                      </Table.Cell>

                      {/* Proctoring & Integrity Column */}
                      <Table.Cell textAlign="center" py={3}>
                        {violationCount === 0 ? (
                          <Badge
                            bg="green.50"
                            color="green.700"
                            borderRadius="full"
                            px={2.5}
                            py={0.5}
                            fontSize="11px"
                            fontWeight="600"
                          >
                            <Icon as={FaCheckCircle} mr={1} boxSize={2.5} />
                            Verified Clean
                          </Badge>
                        ) : (
                          <Button
                            size="xs"
                            variant="subtle"
                            bg={violationCount >= 5 ? "red.50" : "orange.50"}
                            color={violationCount >= 5 ? "red.600" : "orange.700"}
                            border="1px solid"
                            borderColor={violationCount >= 5 ? "red.200" : "orange.200"}
                            borderRadius="full"
                            px={2.5}
                            fontSize="11px"
                            fontWeight="700"
                            onClick={() =>
                              setSelectedCandidateAnomaly({
                                studentName,
                                studentCode,
                                violationCount,
                                status,
                                anomalies,
                              })
                            }
                          >
                            <Icon as={FaExclamationTriangle} mr={1} boxSize={2.5} />
                            {violationCount} {violationCount === 1 ? "Incident" : "Incidents"}
                          </Button>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Box>
      )}

      {/* Proctoring Incident Audit Modal */}
      {selectedCandidateAnomaly && (
        <Box
          position="fixed"
          inset={0}
          zIndex={1000}
          bg="rgba(15, 23, 42, 0.6)"
          backdropFilter="blur(6px)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <Box
            bg="white"
            borderRadius="24px"
            p={6}
            maxW="480px"
            w="100%"
            boxShadow="0 20px 50px rgba(0, 0, 0, 0.2)"
            className="animate-scale-in"
          >
            <Flex justify="space-between" align="center" pb={3} mb={4} borderBottom="1px solid" borderColor="gray.100">
              <Flex align="center" gap={2.5}>
                <Flex
                  w="36px"
                  h="36px"
                  borderRadius="xl"
                  bg="orange.50"
                  color="orange.600"
                  align="center"
                  justify="center"
                >
                  <Icon as={FaShieldAlt} boxSize={4} />
                </Flex>
                <Box>
                  <Text fontSize="16px" fontWeight="800" color="gray.900">
                    Proctoring Audit Log
                  </Text>
                  <Text fontSize="12px" color="gray.500">
                    {selectedCandidateAnomaly.studentName} ({selectedCandidateAnomaly.studentCode})
                  </Text>
                </Box>
              </Flex>
              <Icon
                as={FaTimes}
                boxSize={4}
                color="gray.400"
                cursor="pointer"
                _hover={{ color: "gray.700" }}
                onClick={() => setSelectedCandidateAnomaly(null)}
              />
            </Flex>

            <Box mb={4}>
              <Badge
                bg={selectedCandidateAnomaly.violationCount >= 5 ? "red.100" : "orange.100"}
                color={selectedCandidateAnomaly.violationCount >= 5 ? "red.700" : "orange.800"}
                borderRadius="md"
                px={2.5}
                py={1}
                fontSize="12px"
                fontWeight="700"
                mb={3}
              >
                Status: {selectedCandidateAnomaly.status} • {selectedCandidateAnomaly.violationCount} Recorded Warnings
              </Badge>

              <Text fontSize="12px" fontWeight="700" color="gray.700" mb={2}>
                Incident Timeline:
              </Text>

              {selectedCandidateAnomaly.anomalies.length === 0 ? (
                <Text fontSize="12px" color="gray.500" fontStyle="italic">
                  Tab switch or window focus loss was flagged by browser proctoring listener.
                </Text>
              ) : (
                <VStack spacing={2} align="stretch" maxH="220px" overflowY="auto">
                  {selectedCandidateAnomaly.anomalies.map((item, idx) => (
                    <Flex
                      key={idx}
                      p={2.5}
                      borderRadius="lg"
                      bg="gray.50"
                      border="1px solid"
                      borderColor="gray.100"
                      justify="space-between"
                      align="center"
                    >
                      <Box>
                        <Text fontSize="12px" fontWeight="600" color="gray.800">
                          {item.description || item.type}
                        </Text>
                        <Text fontSize="10px" color="gray.500">
                          Incident #{idx + 1}
                        </Text>
                      </Box>
                      <Badge bg="white" color="gray.600" border="1px solid" borderColor="gray.200" fontSize="10px">
                        {item.timestamp || "Active"}
                      </Badge>
                    </Flex>
                  ))}
                </VStack>
              )}
            </Box>

            <Button
              w="100%"
              bg="#0F172A"
              color="white"
              borderRadius="xl"
              size="sm"
              onClick={() => setSelectedCandidateAnomaly(null)}
            >
              Close Log
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};
export default MResultPage;
