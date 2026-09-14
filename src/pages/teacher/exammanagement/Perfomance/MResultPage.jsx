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
  Input,
  Avatar,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { fetchExamResults, formatSubjectTitle } from "../../../../api-endpoint/exam/exams";
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
  FaCrown,
  FaMedal,
  FaTrophy,
  FaSearch,
  FaChartLine,
  FaChartPie,
  FaFilter,
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

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState("all");

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

  // Helper to categorize score into standard educational grade bands
  const getGradeBand = (percentage) => {
    const p = Number(percentage) || 0;
    if (p >= 70)
      return {
        label: "Distinction",
        bg: "rgba(16, 185, 129, 0.12)",
        color: "#059669",
        border: "rgba(16, 185, 129, 0.3)",
      };
    if (p >= 60)
      return {
        label: "Credit",
        bg: "rgba(59, 130, 246, 0.12)",
        color: "#2563EB",
        border: "rgba(59, 130, 246, 0.3)",
      };
    if (p >= 50)
      return {
        label: "Pass",
        bg: "rgba(245, 158, 11, 0.12)",
        color: "#D97706",
        border: "rgba(245, 158, 11, 0.3)",
      };
    return {
      label: "Needs Support",
      bg: "rgba(239, 68, 68, 0.12)",
      color: "#DC2626",
      border: "rgba(239, 68, 68, 0.3)",
    };
  };

  // Compute dense/competition class ranks
  const rankedResults = useMemo(() => {
    if (!results.length) return [];

    const sorted = [...results].sort((a, b) => {
      const scoreA = Number(a.totalScore ?? a.percentage ?? 0);
      const scoreB = Number(b.totalScore ?? b.percentage ?? 0);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return Number(b.percentage || 0) - Number(a.percentage || 0);
    });

    let currentRank = 1;
    return sorted.map((res, index) => {
      if (index > 0) {
        const prev = sorted[index - 1];
        const prevScore = Number(prev.totalScore ?? prev.percentage ?? 0);
        const currScore = Number(res.totalScore ?? res.percentage ?? 0);
        if (currScore < prevScore) {
          currentRank = index + 1;
        }
      }
      return {
        ...res,
        classRank: currentRank,
        gradeInfo: getGradeBand(res.percentage),
      };
    });
  }, [results]);

  // Cohort Analytics Summary Metrics
  const analyticsSummary = useMemo(() => {
    if (!rankedResults.length) {
      return {
        avgPct: "0.0",
        highest: null,
        lowest: null,
        passRate: "0.0",
        cleanProctorRate: "100.0",
        distinctionCount: 0,
        creditCount: 0,
        passCount: 0,
        remedialCount: 0,
      };
    }

    const totalPct = rankedResults.reduce(
      (acc, r) => acc + (Number(r.percentage) || 0),
      0
    );
    const avgPct = (totalPct / rankedResults.length).toFixed(1);

    const highest = rankedResults[0];
    const lowest = rankedResults[rankedResults.length - 1];

    const passList = rankedResults.filter((r) => Number(r.percentage || 0) >= 50);
    const passRate = ((passList.length / rankedResults.length) * 100).toFixed(1);

    const cleanList = rankedResults.filter(
      (r) => (r.violationCount || 0) === 0
    );
    const cleanProctorRate = (
      (cleanList.length / rankedResults.length) *
      100
    ).toFixed(1);

    const distinctionCount = rankedResults.filter(
      (r) => Number(r.percentage || 0) >= 70
    ).length;
    const creditCount = rankedResults.filter((r) => {
      const p = Number(r.percentage || 0);
      return p >= 60 && p < 70;
    }).length;
    const passCount = rankedResults.filter((r) => {
      const p = Number(r.percentage || 0);
      return p >= 50 && p < 60;
    }).length;
    const remedialCount = rankedResults.filter(
      (r) => Number(r.percentage || 0) < 50
    ).length;

    return {
      avgPct,
      highest,
      lowest,
      passRate,
      cleanProctorRate,
      distinctionCount,
      creditCount,
      passCount,
      remedialCount,
    };
  }, [rankedResults]);

  // Top 3 Podium Candidates
  const topPodium = useMemo(() => {
    if (!rankedResults.length) return [];
    return rankedResults.slice(0, 3);
  }, [rankedResults]);

  // Filtered Results for Main Ledger
  const filteredResults = useMemo(() => {
    return rankedResults.filter((res) => {
      const studentName = `${res?.Student?.firstName || ""} ${
        res?.Student?.lastName || ""
      }`.toLowerCase();
      const studentCode = (
        res?.studentCode ||
        res?.studentId ||
        res?.Student?.studentId ||
        ""
      ).toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query || studentName.includes(query) || studentCode.includes(query);
      if (!matchesSearch) return false;

      const pct = Number(res.percentage || 0);
      const violations =
        res?.violationCount ||
        (Array.isArray(res?.anomalies) ? res.anomalies.length : 0);

      if (filterTier === "top10") return res.classRank <= 10;
      if (filterTier === "distinction") return pct >= 70;
      if (filterTier === "passed") return pct >= 50;
      if (filterTier === "remedial") return pct < 50;
      if (filterTier === "flagged") return violations > 0;
      return true;
    });
  }, [rankedResults, searchQuery, filterTier]);

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
    if (!rankedResults.length) return;

    const dataForExcel = rankedResults.map((res) => {
      const studentCode =
        res?.studentCode || res?.studentId || res?.Student?.studentId;
      const studentName =
        `${res?.Student?.firstName || ""} ${
          res?.Student?.lastName || ""
        }`.trim() || "N/A";
      const violations =
        res?.violationCount ||
        (Array.isArray(res?.anomalies) ? res.anomalies.length : 0);
      const integrity =
        res?.integrityStatus || (violations > 0 ? "FLAGGED" : "VERIFIED");

      const base = {
        "Class Rank": `#${res.classRank}`,
        "Student ID": studentCode,
        "Candidate Name": studentName,
        "Total Score": res?.totalScore ?? 0,
        Percentage: `${Number(res.percentage || 0).toFixed(1)}%`,
        "Grade Band": res.gradeInfo?.label || "Pass",
        "Integrity Status": integrity,
        "Violation Count": violations,
      };

      subjects.forEach((subject) => {
        const cleanTitle = formatSubjectTitle(subject);
        base[cleanTitle] = res?.scores?.[subject] ?? "-";
      });

      return base;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Class Results & Rankings");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(blob, `ExamResults_Ranked_${id}_${Date.now()}.xlsx`);
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

        pdf.save(`ExamResults_Ranked_${id}.pdf`);
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
          <TableSkeleton rows={6} columns={8} />
        </Box>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 6 }} minH="calc(100vh - 58px)" bg="#F8FAFC">
      {/* Top Header Card */}
      <Box
        bg="linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)"
        p={{ base: 5, md: 7 }}
        borderRadius="24px"
        color="white"
        mb={6}
        boxShadow="0 12px 32px rgba(15, 23, 42, 0.25)"
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Button
            size="xs"
            variant="ghost"
            color="white"
            onClick={() => navigate("/teacher/exam_result")}
            _hover={{ bg: "rgba(255, 255, 255, 0.12)" }}
            px={2.5}
            borderRadius="lg"
          >
            <Icon as={FaArrowLeft} mr={1.5} />
            All Exams
          </Button>
          <HStack spacing={2}>
            <Badge
              bg="rgba(99, 102, 241, 0.25)"
              color="#A5B4FC"
              borderRadius="full"
              px={3}
              py={1}
              fontSize="11px"
              fontWeight="700"
            >
              {rankedResults.length} Candidates Enrolled
            </Badge>
            <Badge
              bg="rgba(16, 185, 129, 0.2)"
              color="#34D399"
              borderRadius="full"
              px={3}
              py={1}
              fontSize="11px"
              fontWeight="700"
            >
              Pass Rate: {analyticsSummary.passRate}%
            </Badge>
          </HStack>
        </Flex>

        <Text
          fontSize={{ base: "22px", md: "26px" }}
          fontWeight="800"
          lineHeight="1.2"
          mb={1.5}
          fontFamily="'Outfit', sans-serif"
        >
          {examTitle} Performance Analytics & Class Ranking
        </Text>
        <Text fontSize="13px" color="#94A3B8" maxW="720px">
          Comprehensive cohort leaderboard, relative class standing, grade band
          distributions, subject section mastery, and AI diagnostic insights.
        </Text>

        {/* Executive KPI Stats Bar */}
        <SimpleGrid
          columns={{ base: 2, sm: 3, md: 5 }}
          gap={3}
          mt={6}
        >
          <Box
            bg="rgba(255, 255, 255, 0.07)"
            p={3.5}
            borderRadius="16px"
            border="1px solid rgba(255, 255, 255, 0.1)"
          >
            <HStack spacing={1.5} mb={1}>
              <Icon as={FaUserGraduate} boxSize={3.5} color="#818CF8" />
              <Text fontSize="11px" color="#94A3B8">Submissions</Text>
            </HStack>
            <Text fontSize="20px" fontWeight="800">{rankedResults.length}</Text>
          </Box>

          <Box
            bg="rgba(255, 255, 255, 0.07)"
            p={3.5}
            borderRadius="16px"
            border="1px solid rgba(255, 255, 255, 0.1)"
          >
            <HStack spacing={1.5} mb={1}>
              <Icon as={FaChartLine} boxSize={3.5} color="#38BDF8" />
              <Text fontSize="11px" color="#94A3B8">Class Average</Text>
            </HStack>
            <Text fontSize="20px" fontWeight="800" color="#38BDF8">
              {analyticsSummary.avgPct}%
            </Text>
          </Box>

          <Box
            bg="rgba(255, 255, 255, 0.07)"
            p={3.5}
            borderRadius="16px"
            border="1px solid rgba(255, 255, 255, 0.1)"
          >
            <HStack spacing={1.5} mb={1}>
              <Icon as={FaCrown} boxSize={3.5} color="#FBBF24" />
              <Text fontSize="11px" color="#94A3B8">Highest Score</Text>
            </HStack>
            <Text fontSize="20px" fontWeight="800" color="#FBBF24">
              {analyticsSummary.highest
                ? `${Number(analyticsSummary.highest.percentage || 0).toFixed(1)}%`
                : "--"}
            </Text>
          </Box>

          <Box
            bg="rgba(255, 255, 255, 0.07)"
            p={3.5}
            borderRadius="16px"
            border="1px solid rgba(255, 255, 255, 0.1)"
          >
            <HStack spacing={1.5} mb={1}>
              <Icon as={FaAward} boxSize={3.5} color="#34D399" />
              <Text fontSize="11px" color="#94A3B8">Pass Rate (≥50%)</Text>
            </HStack>
            <Text fontSize="20px" fontWeight="800" color="#34D399">
              {analyticsSummary.passRate}%
            </Text>
          </Box>

          <Box
            bg="rgba(255, 255, 255, 0.07)"
            p={3.5}
            borderRadius="16px"
            border="1px solid rgba(255, 255, 255, 0.1)"
          >
            <HStack spacing={1.5} mb={1}>
              <Icon as={FaShieldAlt} boxSize={3.5} color="#C084FC" />
              <Text fontSize="11px" color="#94A3B8">Clean Integrity</Text>
            </HStack>
            <Text fontSize="20px" fontWeight="800" color="#C084FC">
              {analyticsSummary.cleanProctorRate}%
            </Text>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Top 3 Class Leaderboard Podium */}
      {topPodium.length > 0 && (
        <Box
          bg="white"
          p={{ base: 5, md: 6 }}
          borderRadius="24px"
          border="1px solid #E2E8F0"
          boxShadow="0 4px 20px rgba(0, 0, 0, 0.04)"
          mb={6}
        >
          <Flex align="center" justify="space-between" mb={5} flexWrap="wrap" gap={2}>
            <Flex align="center" gap={2.5}>
              <Flex
                w="38px"
                h="38px"
                borderRadius="14px"
                bg="rgba(245, 158, 11, 0.12)"
                align="center"
                justify="center"
              >
                <Icon as={FaTrophy} color="#D97706" boxSize={4.5} />
              </Flex>
              <Box>
                <Text fontSize="16px" fontWeight="800" color="#0F172A" fontFamily="'Outfit', sans-serif">
                  Examination Leaderboard & Honors Podium
                </Text>
                <Text fontSize="12px" color="#64748B">
                  Recognizing the highest achieving candidates across this assessment
                </Text>
              </Box>
            </Flex>
            <Badge bg="#FEF3C7" color="#92400E" fontSize="11px" px={3} py={1} borderRadius="full" fontWeight="bold">
              TOP 3 COHORT HONORS
            </Badge>
          </Flex>

          {/* Podium Blocks */}
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} alignItems="flex-end">
            {/* 2nd Place (Silver) */}
            {topPodium[1] ? (
              <Box
                order={{ base: 2, md: 1 }}
                bg="linear-gradient(180deg, #F8FAFC 0%, #EEF2F6 100%)"
                p={4}
                borderRadius="20px"
                border="1.5px solid #CBD5E1"
                textAlign="center"
                position="relative"
              >
                <Flex
                  w="34px"
                  h="34px"
                  borderRadius="full"
                  bg="#94A3B8"
                  color="white"
                  align="center"
                  justify="center"
                  fontWeight="bold"
                  fontSize="14px"
                  mx="auto"
                  mb={2}
                  boxShadow="0 4px 10px rgba(148, 163, 184, 0.4)"
                >
                  🥈 2nd
                </Flex>
                <Text fontSize="14px" fontWeight="bold" color="#0F172A" lineClamp={1}>
                  {topPodium[1]?.Student
                    ? `${topPodium[1].Student.firstName} ${topPodium[1].Student.lastName}`
                    : "Candidate #2"}
                </Text>
                <Text fontSize="11px" color="#64748B" mb={2}>
                  {topPodium[1]?.studentCode || topPodium[1]?.studentId || "ID: N/A"}
                </Text>
                <HStack justify="center" spacing={2}>
                  <Badge bg="white" color="#334155" border="1px solid #CBD5E1" px={2} py={0.5} borderRadius="md" fontSize="11px">
                    Score: {topPodium[1]?.totalScore ?? 0}
                  </Badge>
                  <Badge bg="rgba(59, 130, 246, 0.15)" color="#2563EB" px={2} py={0.5} borderRadius="md" fontSize="11px" fontWeight="bold">
                    {Number(topPodium[1]?.percentage || 0).toFixed(1)}%
                  </Badge>
                </HStack>
              </Box>
            ) : (
              <Box order={{ base: 2, md: 1 }} />
            )}

            {/* 1st Place (Gold Champion) */}
            {topPodium[0] && (
              <Box
                order={{ base: 1, md: 2 }}
                bg="linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%)"
                p={5}
                borderRadius="24px"
                border="2px solid #F59E0B"
                textAlign="center"
                position="relative"
                boxShadow="0 10px 25px -5px rgba(245, 158, 11, 0.25)"
                transform={{ md: "scale(1.04)" }}
                zIndex={2}
              >
                <Flex
                  w="42px"
                  h="42px"
                  borderRadius="full"
                  bg="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
                  color="white"
                  align="center"
                  justify="center"
                  fontWeight="800"
                  fontSize="16px"
                  mx="auto"
                  mb={2}
                  boxShadow="0 6px 14px rgba(245, 158, 11, 0.45)"
                >
                  🥇 1st
                </Flex>
                <Text fontSize="16px" fontWeight="800" color="#78350F" lineClamp={1}>
                  {topPodium[0]?.Student
                    ? `${topPodium[0].Student.firstName} ${topPodium[0].Student.lastName}`
                    : "Candidate #1"}
                </Text>
                <Text fontSize="11px" color="#92400E" mb={3}>
                  {topPodium[0]?.studentCode || topPodium[0]?.studentId || "ID: N/A"}
                </Text>
                <HStack justify="center" spacing={2.5}>
                  <Badge bg="white" color="#78350F" border="1px solid #FCD34D" px={2.5} py={0.5} borderRadius="md" fontSize="12px" fontWeight="bold">
                    Score: {topPodium[0]?.totalScore ?? 0}
                  </Badge>
                  <Badge bg="#F59E0B" color="white" px={3} py={0.5} borderRadius="md" fontSize="12px" fontWeight="800">
                    {Number(topPodium[0]?.percentage || 0).toFixed(1)}%
                  </Badge>
                </HStack>
              </Box>
            )}

            {/* 3rd Place (Bronze) */}
            {topPodium[2] ? (
              <Box
                order={{ base: 3, md: 3 }}
                bg="linear-gradient(180deg, #FFF7ED 0%, #FFEDD5 100%)"
                p={4}
                borderRadius="20px"
                border="1.5px solid #FDBA74"
                textAlign="center"
                position="relative"
              >
                <Flex
                  w="34px"
                  h="34px"
                  borderRadius="full"
                  bg="#C2410C"
                  color="white"
                  align="center"
                  justify="center"
                  fontWeight="bold"
                  fontSize="14px"
                  mx="auto"
                  mb={2}
                  boxShadow="0 4px 10px rgba(194, 65, 12, 0.35)"
                >
                  🥉 3rd
                </Flex>
                <Text fontSize="14px" fontWeight="bold" color="#0F172A" lineClamp={1}>
                  {topPodium[2]?.Student
                    ? `${topPodium[2].Student.firstName} ${topPodium[2].Student.lastName}`
                    : "Candidate #3"}
                </Text>
                <Text fontSize="11px" color="#64748B" mb={2}>
                  {topPodium[2]?.studentCode || topPodium[2]?.studentId || "ID: N/A"}
                </Text>
                <HStack justify="center" spacing={2}>
                  <Badge bg="white" color="#334155" border="1px solid #FDBA74" px={2} py={0.5} borderRadius="md" fontSize="11px">
                    Score: {topPodium[2]?.totalScore ?? 0}
                  </Badge>
                  <Badge bg="rgba(245, 158, 11, 0.2)" color="#C2410C" px={2} py={0.5} borderRadius="md" fontSize="11px" fontWeight="bold">
                    {Number(topPodium[2]?.percentage || 0).toFixed(1)}%
                  </Badge>
                </HStack>
              </Box>
            ) : (
              <Box order={{ base: 3, md: 3 }} />
            )}
          </SimpleGrid>
        </Box>
      )}

      {/* Grade Distribution & Section Mastery Grid */}
      {rankedResults.length > 0 && (
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5} mb={6}>
          {/* Grade Distribution Breakdown */}
          <Box
            bg="white"
            p={{ base: 5, md: 6 }}
            borderRadius="24px"
            border="1px solid #E2E8F0"
            boxShadow="0 2px 12px rgba(0,0,0,0.03)"
          >
            <Flex align="center" gap={2.5} mb={4}>
              <Flex
                w="36px"
                h="36px"
                borderRadius="12px"
                bg="rgba(99, 102, 241, 0.1)"
                align="center"
                justify="center"
              >
                <Icon as={FaChartPie} color="#4F46E5" boxSize={4} />
              </Flex>
              <Box>
                <Text fontSize="15px" fontWeight="800" color="#0F172A">
                  Cohort Grade Distribution
                </Text>
                <Text fontSize="11px" color="#64748B">
                  Candidate distribution across benchmark attainment thresholds
                </Text>
              </Box>
            </Flex>

            {/* Distribution Multi-Color Bar */}
            <Box
              w="100%"
              h="12px"
              bg="#F1F5F9"
              borderRadius="full"
              overflow="hidden"
              display="flex"
              mb={4}
            >
              {analyticsSummary.distinctionCount > 0 && (
                <Box
                  w={`${(analyticsSummary.distinctionCount / rankedResults.length) * 100}%`}
                  h="100%"
                  bg="#10B981"
                  title={`Distinction: ${analyticsSummary.distinctionCount}`}
                />
              )}
              {analyticsSummary.creditCount > 0 && (
                <Box
                  w={`${(analyticsSummary.creditCount / rankedResults.length) * 100}%`}
                  h="100%"
                  bg="#3B82F6"
                  title={`Credit: ${analyticsSummary.creditCount}`}
                />
              )}
              {analyticsSummary.passCount > 0 && (
                <Box
                  w={`${(analyticsSummary.passCount / rankedResults.length) * 100}%`}
                  h="100%"
                  bg="#F59E0B"
                  title={`Pass: ${analyticsSummary.passCount}`}
                />
              )}
              {analyticsSummary.remedialCount > 0 && (
                <Box
                  w={`${(analyticsSummary.remedialCount / rankedResults.length) * 100}%`}
                  h="100%"
                  bg="#EF4444"
                  title={`Needs Support: ${analyticsSummary.remedialCount}`}
                />
              )}
            </Box>

            <SimpleGrid columns={2} gap={3}>
              <Box p={3} borderRadius="14px" bg="rgba(16, 185, 129, 0.06)" border="1px solid rgba(16, 185, 129, 0.2)">
                <Flex justify="space-between" align="center">
                  <Text fontSize="12px" fontWeight="bold" color="#059669">Distinction (≥70%)</Text>
                  <Badge bg="#10B981" color="white" borderRadius="full" fontSize="11px">
                    {analyticsSummary.distinctionCount}
                  </Badge>
                </Flex>
                <Text fontSize="11px" color="#64748B" mt={1}>
                  {((analyticsSummary.distinctionCount / rankedResults.length) * 100).toFixed(0)}% of class
                </Text>
              </Box>

              <Box p={3} borderRadius="14px" bg="rgba(59, 130, 246, 0.06)" border="1px solid rgba(59, 130, 246, 0.2)">
                <Flex justify="space-between" align="center">
                  <Text fontSize="12px" fontWeight="bold" color="#2563EB">Credit (60-69%)</Text>
                  <Badge bg="#3B82F6" color="white" borderRadius="full" fontSize="11px">
                    {analyticsSummary.creditCount}
                  </Badge>
                </Flex>
                <Text fontSize="11px" color="#64748B" mt={1}>
                  {((analyticsSummary.creditCount / rankedResults.length) * 100).toFixed(0)}% of class
                </Text>
              </Box>

              <Box p={3} borderRadius="14px" bg="rgba(245, 158, 11, 0.06)" border="1px solid rgba(245, 158, 11, 0.2)">
                <Flex justify="space-between" align="center">
                  <Text fontSize="12px" fontWeight="bold" color="#D97706">Pass (50-59%)</Text>
                  <Badge bg="#F59E0B" color="white" borderRadius="full" fontSize="11px">
                    {analyticsSummary.passCount}
                  </Badge>
                </Flex>
                <Text fontSize="11px" color="#64748B" mt={1}>
                  {((analyticsSummary.passCount / rankedResults.length) * 100).toFixed(0)}% of class
                </Text>
              </Box>

              <Box p={3} borderRadius="14px" bg="rgba(239, 68, 68, 0.06)" border="1px solid rgba(239, 68, 68, 0.2)">
                <Flex justify="space-between" align="center">
                  <Text fontSize="12px" fontWeight="bold" color="#DC2626">Needs Support (&lt;50%)</Text>
                  <Badge bg="#EF4444" color="white" borderRadius="full" fontSize="11px">
                    {analyticsSummary.remedialCount}
                  </Badge>
                </Flex>
                <Text fontSize="11px" color="#64748B" mt={1}>
                  {((analyticsSummary.remedialCount / rankedResults.length) * 100).toFixed(0)}% of class
                </Text>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Section-by-Section Performance Matrix */}
          <Box
            bg="white"
            p={{ base: 5, md: 6 }}
            borderRadius="24px"
            border="1px solid #E2E8F0"
            boxShadow="0 2px 12px rgba(0,0,0,0.03)"
          >
            <Flex align="center" gap={2.5} mb={4}>
              <Flex
                w="36px"
                h="36px"
                borderRadius="12px"
                bg="rgba(16, 185, 129, 0.1)"
                align="center"
                justify="center"
              >
                <Icon as={FaAward} color="#059669" boxSize={4} />
              </Flex>
              <Box>
                <Text fontSize="15px" fontWeight="800" color="#0F172A">
                  Section Mastery Matrix
                </Text>
                <Text fontSize="11px" color="#64748B">
                  Mean accuracy & strength breakdown by examination subject
                </Text>
              </Box>
            </Flex>

            <VStack spacing={3.5} align="stretch">
              {subjects.map((subj) => {
                const scoresList = results
                  .map((r) => Number(r.scores?.[subj]))
                  .filter((v) => !isNaN(v));
                const avgSubj = scoresList.length
                  ? Math.round(
                      scoresList.reduce((a, b) => a + b, 0) / scoresList.length
                    )
                  : 0;
                const maxSubj = scoresList.length ? Math.max(...scoresList) : 0;
                const isWeak = avgSubj < 50;
                const cleanTitle = formatSubjectTitle(subj);

                return (
                  <Box key={subj} p={3} bg="#F8FAFC" borderRadius="14px" border="1px solid #E2E8F0">
                    <Flex justify="space-between" align="center" mb={1.5}>
                      <HStack spacing={2}>
                        <Text fontSize="13px" fontWeight="700" color="#1E293B">
                          {cleanTitle}
                        </Text>
                        <Badge
                          bg={isWeak ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)"}
                          color={isWeak ? "#DC2626" : "#059669"}
                          fontSize="10px"
                          px={2}
                          py={0.5}
                          borderRadius="md"
                        >
                          {isWeak ? "Intervention Needed" : "Solid Mastery"}
                        </Badge>
                      </HStack>
                      <HStack spacing={2} fontSize="12px">
                        <Text color="#64748B">Max: <b>{maxSubj}</b></Text>
                        <Text fontWeight="800" color={isWeak ? "#DC2626" : "#059669"}>
                          Avg: {avgSubj}%
                        </Text>
                      </HStack>
                    </Flex>
                    <Box w="100%" h="7px" bg="#E2E8F0" borderRadius="full" overflow="hidden">
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
        </SimpleGrid>
      )}

      {/* AI Class Readiness & Progress Summaries Banner */}
      {results.length > 0 && (
        <Box
          bg="white"
          p={{ base: 5, md: 6 }}
          borderRadius="24px"
          border="1px solid"
          borderColor="purple.100"
          boxShadow="0 4px 20px -4px rgba(106, 27, 154, 0.08)"
          mb={6}
          position="relative"
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
                    px={2.5}
                    py={0.5}
                    borderRadius="full"
                    fontSize="11px"
                    fontWeight="700"
                  >
                    Readiness: {aiInsights?.classReadinessScore ?? Math.round(Number(analyticsSummary.avgPct))}%
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
                `${analyticsSummary.avgPct}% class average indicates solid foundational comprehension across tested sections. Target reinforcement on lower-scoring sections.`}
            </Text>
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
                  "Provide 1-on-1 scaffolding for candidates who scored below the 50% pass threshold.",
                ]
              ).map((rec, i) => (
                <Flex key={i} align="flex-start" gap={2} fontSize="12px" color="gray.700">
                  <Text color="#6A1B9A" fontWeight="bold">#{i + 1}</Text>
                  <Text>{rec}</Text>
                </Flex>
              ))}
            </VStack>
          </Box>
        </Box>
      )}

      {/* Ledger Controls Bar: Search, Filters & Export */}
      <Box
        bg="white"
        p={4}
        borderRadius="20px"
        border="1px solid #E2E8F0"
        mb={4}
        boxShadow="0 2px 10px rgba(0, 0, 0, 0.02)"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          gap={3}
        >
          {/* Search Box */}
          <HStack spacing={2} flex={1} maxW={{ base: "100%", md: "380px" }}>
            <Box position="relative" w="100%">
              <Input
                placeholder="Search candidate name or student ID..."
                size="sm"
                borderRadius="xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                pl={8}
                borderColor="#CBD5E1"
                _focus={{ borderColor: "#4F46E5" }}
              />
              <Icon
                as={FaSearch}
                color="#94A3B8"
                boxSize={3}
                position="absolute"
                left={3}
                top="50%"
                transform="translateY(-50%)"
              />
            </Box>
          </HStack>

          {/* Filter Chips */}
          <HStack spacing={2} flexWrap="wrap">
            <Button
              size="xs"
              borderRadius="full"
              variant={filterTier === "all" ? "solid" : "outline"}
              bg={filterTier === "all" ? "#0F172A" : "white"}
              color={filterTier === "all" ? "white" : "#475569"}
              onClick={() => setFilterTier("all")}
            >
              All ({rankedResults.length})
            </Button>
            <Button
              size="xs"
              borderRadius="full"
              variant={filterTier === "top10" ? "solid" : "outline"}
              bg={filterTier === "top10" ? "#4F46E5" : "white"}
              color={filterTier === "top10" ? "white" : "#475569"}
              onClick={() => setFilterTier("top10")}
            >
              Top 10
            </Button>
            <Button
              size="xs"
              borderRadius="full"
              variant={filterTier === "distinction" ? "solid" : "outline"}
              bg={filterTier === "distinction" ? "#059669" : "white"}
              color={filterTier === "distinction" ? "white" : "#475569"}
              onClick={() => setFilterTier("distinction")}
            >
              Distinction (≥70%)
            </Button>
            <Button
              size="xs"
              borderRadius="full"
              variant={filterTier === "remedial" ? "solid" : "outline"}
              bg={filterTier === "remedial" ? "#DC2626" : "white"}
              color={filterTier === "remedial" ? "white" : "#475569"}
              onClick={() => setFilterTier("remedial")}
            >
              Needs Support (&lt;50%)
            </Button>
            <Button
              size="xs"
              borderRadius="full"
              variant={filterTier === "flagged" ? "solid" : "outline"}
              bg={filterTier === "flagged" ? "#D97706" : "white"}
              color={filterTier === "flagged" ? "white" : "#475569"}
              onClick={() => setFilterTier("flagged")}
            >
              Flagged Proctoring
            </Button>
          </HStack>

          {/* Export Buttons */}
          <HStack spacing={2}>
            <Button
              size="sm"
              bg="#059669"
              color="white"
              borderRadius="xl"
              fontSize="12px"
              fontWeight="semibold"
              onClick={handleDownload}
              isDisabled={!rankedResults.length}
              _hover={{ bg: "#047857" }}
              px={3.5}
            >
              <Icon as={FaFileExcel} mr={1.5} />
              Export Excel
            </Button>
            <Button
              size="sm"
              bg="#4F46E5"
              color="white"
              borderRadius="xl"
              fontSize="12px"
              fontWeight="semibold"
              onClick={handleDownloadPDF}
              isDisabled={!rankedResults.length}
              loading={pdfGenerating}
              _hover={{ bg: "#4338CA" }}
              px={3.5}
            >
              <Icon as={FaFilePdf} mr={1.5} />
              Export PDF
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Results & Class Ranking Table */}
      {filteredResults.length === 0 ? (
        <Box
          bg="white"
          p={10}
          borderRadius="24px"
          border="1px dashed #CBD5E1"
          textAlign="center"
        >
          <Text fontWeight="semibold" color="#334155" mb={1}>
            No Candidates Found
          </Text>
          <Text fontSize="13px" color="#64748B">
            {searchQuery || filterTier !== "all"
              ? "No matching records found for current filter criteria."
              : "No candidates have submitted responses for this examination yet."}
          </Text>
        </Box>
      ) : (
        <Box
          id="result-table"
          bg="white"
          borderRadius="24px"
          border="1px solid #E2E8F0"
          boxShadow="0 4px 20px rgba(0, 0, 0, 0.03)"
          overflow="hidden"
        >
          <Table.ScrollArea>
            <Table.Root size="sm" variant="outline">
              <Table.Header>
                <Table.Row bg="#0F172A">
                  <Table.ColumnHeader color="white" fontSize="11px" py={3.5} textAlign="center" w="100px">
                    Class Rank
                  </Table.ColumnHeader>
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
                    >
                      {formatSubjectTitle(subject)}
                    </Table.ColumnHeader>
                  ))}
                  <Table.ColumnHeader color="white" fontSize="11px" py={3.5} textAlign="center">
                    Total Score
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="white" fontSize="11px" py={3.5} textAlign="center">
                    Accuracy (%)
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="white" fontSize="11px" py={3.5} textAlign="center">
                    Grade Band
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="white" fontSize="11px" py={3.5} textAlign="center">
                    Proctoring Audit
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredResults.map((res, index) => {
                  const studentName = res?.Student
                    ? `${res?.Student?.firstName || ""} ${res?.Student?.lastName || ""}`.trim()
                    : "Unknown";
                  const studentCode =
                    res?.studentCode ||
                    res?.studentId ||
                    res?.Student?.studentId ||
                    `STU-${index + 1}`;
                  const pct = Number(res?.percentage || 0);

                  const anomalies = Array.isArray(res?.anomalies)
                    ? res.anomalies
                    : [];
                  const violationCount =
                    typeof res?.violationCount === "number"
                      ? res.violationCount
                      : anomalies.length;
                  const status =
                    res?.integrityStatus ||
                    (violationCount > 0 ? "FLAGGED_SUSPICIOUS" : "VERIFIED");

                  // Rank Badge Display
                  const rank = res.classRank;
                  let rankBadge = null;
                  if (rank === 1) {
                    rankBadge = (
                      <Badge bg="#FEF3C7" color="#B45309" border="1px solid #FCD34D" px={2.5} py={0.5} borderRadius="full" fontSize="11px" fontWeight="800">
                        🥇 1st
                      </Badge>
                    );
                  } else if (rank === 2) {
                    rankBadge = (
                      <Badge bg="#F1F5F9" color="#475569" border="1px solid #CBD5E1" px={2.5} py={0.5} borderRadius="full" fontSize="11px" fontWeight="800">
                        🥈 2nd
                      </Badge>
                    );
                  } else if (rank === 3) {
                    rankBadge = (
                      <Badge bg="#FFEDD5" color="#C2410C" border="1px solid #FDBA74" px={2.5} py={0.5} borderRadius="full" fontSize="11px" fontWeight="800">
                        🥉 3rd
                      </Badge>
                    );
                  } else {
                    rankBadge = (
                      <Badge bg="#F8FAFC" color="#64748B" border="1px solid #E2E8F0" px={2} py={0.5} borderRadius="full" fontSize="11px" fontWeight="bold">
                        #{rank}
                      </Badge>
                    );
                  }

                  return (
                    <Table.Row
                      key={res.id || index}
                      _hover={{ bg: "#F8FAFC" }}
                      borderBottom="1px solid #F1F5F9"
                    >
                      {/* Class Rank Column */}
                      <Table.Cell py={3.5} textAlign="center">
                        {rankBadge}
                      </Table.Cell>

                      {/* Candidate ID */}
                      <Table.Cell py={3.5}>
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

                      {/* Full Name */}
                      <Table.Cell py={3.5} fontSize="13px" fontWeight="600" color="#0F172A">
                        {studentName}
                      </Table.Cell>

                      {/* Dynamic Subject Scores */}
                      {subjects.map((subject) => (
                        <Table.Cell
                          key={subject}
                          textAlign="center"
                          fontSize="12px"
                          color="#334155"
                          py={3.5}
                        >
                          {res.scores?.[subject] ?? "-"}
                        </Table.Cell>
                      ))}

                      {/* Total Score */}
                      <Table.Cell textAlign="center" py={3.5}>
                        <Text fontSize="13px" fontWeight="bold" color="#0F172A">
                          {res?.totalScore ?? 0}
                        </Text>
                      </Table.Cell>

                      {/* Percentage */}
                      <Table.Cell textAlign="center" py={3.5}>
                        <Text fontSize="13px" fontWeight="bold" color="#0F172A">
                          {pct.toFixed(1)}%
                        </Text>
                      </Table.Cell>

                      {/* Grade Band Badge */}
                      <Table.Cell textAlign="center" py={3.5}>
                        <Badge
                          bg={res.gradeInfo?.bg}
                          color={res.gradeInfo?.color}
                          border="1px solid"
                          borderColor={res.gradeInfo?.border}
                          fontSize="11px"
                          fontWeight="bold"
                          borderRadius="full"
                          px={2.5}
                          py={0.5}
                        >
                          {res.gradeInfo?.label}
                        </Badge>
                      </Table.Cell>

                      {/* Proctoring & Integrity Column */}
                      <Table.Cell textAlign="center" py={3.5}>
                        {violationCount === 0 ? (
                          <Badge
                            bg="rgba(16, 185, 129, 0.1)"
                            color="#059669"
                            border="1px solid rgba(16, 185, 129, 0.25)"
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
          >
            <Flex
              justify="space-between"
              align="center"
              pb={3}
              mb={4}
              borderBottom="1px solid"
              borderColor="gray.100"
            >
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
                    {selectedCandidateAnomaly.studentName} (
                    {selectedCandidateAnomaly.studentCode})
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
                bg={
                  selectedCandidateAnomaly.violationCount >= 5
                    ? "red.100"
                    : "orange.100"
                }
                color={
                  selectedCandidateAnomaly.violationCount >= 5
                    ? "red.700"
                    : "orange.800"
                }
                borderRadius="md"
                px={2.5}
                py={1}
                fontSize="12px"
                fontWeight="700"
                mb={3}
              >
                Status: {selectedCandidateAnomaly.status} •{" "}
                {selectedCandidateAnomaly.violationCount} Recorded Warnings
              </Badge>

              <Text fontSize="12px" fontWeight="700" color="gray.700" mb={2}>
                Incident Timeline:
              </Text>

              {selectedCandidateAnomaly.anomalies.length === 0 ? (
                <Text fontSize="12px" color="gray.500" fontStyle="italic">
                  Tab switch or window focus loss was flagged by browser
                  proctoring listener.
                </Text>
              ) : (
                <VStack
                  spacing={2}
                  align="stretch"
                  maxH="220px"
                  overflowY="auto"
                >
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
                      <Badge
                        bg="white"
                        color="gray.600"
                        border="1px solid"
                        borderColor="gray.200"
                        fontSize="10px"
                      >
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
