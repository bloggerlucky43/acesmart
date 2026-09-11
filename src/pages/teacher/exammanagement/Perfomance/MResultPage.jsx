import {
  Box,
  Flex,
  Table,
  Text,
  Button,
  Center,
  Spinner,
  Badge,
  HStack,
  Icon,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { fetchExamResults } from "../../../../api-endpoint/exam/exams";
import { FaFileExcel, FaFilePdf, FaArrowLeft, FaAward, FaUserGraduate } from "react-icons/fa";

export const MResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResult] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchStudentResults = async () => {
      try {
        setLoading(true);
        const response = await fetchExamResults(id);
        if (Array.isArray(response?.data)) {
          setResult(response.data);
        } else if (Array.isArray(response)) {
          setResult(response);
        } else {
          setResult([]);
        }
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

  // Calculate summary metrics
  const avgPercentage = useMemo(() => {
    if (!results.length) return 0;
    const total = results.reduce((acc, r) => acc + (Number(r.percentage) || 0), 0);
    return (total / results.length).toFixed(1);
  }, [results]);

  const handleDownload = () => {
    if (!results.length) return;

    const dataForExcel = results.map((res) => {
      const base = {
        "Student ID": res?.studentCode || res?.studentId || res?.Student?.studentId,
        Name: `${res?.Student?.firstName || ""} ${res?.Student?.lastName || ""}`.trim() || "N/A",
        "Total Score": res?.totalScore,
        Percentage: `${res.percentage}%`,
      };

      subjects.forEach((subject) => {
        base[subject] = res?.scores?.[subject] ?? "-";
      });

      return base;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

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
      <Center minH="calc(100vh - 58px)" bg="#F8FAFC">
        <VStack spacing={3}>
          <Spinner size="xl" color="#4F46E5" />
          <Text fontSize="sm" color="#64748B">Loading candidate results...</Text>
        </VStack>
      </Center>
    );
  }

  const examTitle = results[0]?.examTitle || "Examination";

  return (
    <Box p={4} minH="calc(100vh - 58px)" bg="#F8FAFC">
      {/* Top Header Card */}
      <Box
        bg="linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)"
        p={5}
        borderRadius="xl"
        color="white"
        mb={4}
        boxShadow="0 4px 14px 0 rgba(15, 23, 42, 0.2)"
      >
        <Flex justify="space-between" align="center" mb={3}>
          <Button
            size="xs"
            variant="ghost"
            color="white"
            onClick={() => navigate("/teacher/exam_result")}
            leftIcon={<Icon as={FaArrowLeft} />}
            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
            px={2}
          >
            All Exams
          </Button>
          <Badge
            bg="rgba(99, 102, 241, 0.25)"
            color="#A5B4FC"
            borderRadius="full"
            px={2.5}
            py={0.5}
            fontSize="10px"
          >
            {results.length} Candidates
          </Badge>
        </Flex>

        <Text fontSize="md" fontWeight="bold" lineHeight="1.3" mb={1}>
          {examTitle} Results
        </Text>
        <Text fontSize="xs" color="#94A3B8">
          Assessment performance breakdown and candidate grade roster
        </Text>

        {/* Quick KPI stats */}
        <Flex mt={4} gap={3}>
          <Box
            flex={1}
            bg="rgba(255, 255, 255, 0.08)"
            p={2.5}
            borderRadius="lg"
            border="1px solid rgba(255, 255, 255, 0.1)"
          >
            <HStack spacing={1.5} mb={0.5}>
              <Icon as={FaUserGraduate} boxSize={3} color="#818CF8" />
              <Text fontSize="10px" color="#94A3B8">Exams Taken</Text>
            </HStack>
            <Text fontSize="sm" fontWeight="bold">{results.length}</Text>
          </Box>
          <Box
            flex={1}
            bg="rgba(255, 255, 255, 0.08)"
            p={2.5}
            borderRadius="lg"
            border="1px solid rgba(255, 255, 255, 0.1)"
          >
            <HStack spacing={1.5} mb={0.5}>
              <Icon as={FaAward} boxSize={3} color="#34D399" />
              <Text fontSize="10px" color="#94A3B8">Avg. Score</Text>
            </HStack>
            <Text fontSize="sm" fontWeight="bold" color="#34D399">{avgPercentage}%</Text>
          </Box>
        </Flex>
      </Box>

      {/* Action Buttons */}
      <Flex gap={2} mb={4}>
        <Button
          flex={1}
          size="sm"
          bg="#059669"
          color="white"
          borderRadius="lg"
          fontSize="xs"
          fontWeight="semibold"
          onClick={handleDownload}
          isDisabled={!results.length}
          _hover={{ bg: "#047857" }}
          leftIcon={<Icon as={FaFileExcel} />}
        >
          Export Excel
        </Button>
        <Button
          flex={1}
          size="sm"
          bg="#4F46E5"
          color="white"
          borderRadius="lg"
          fontSize="xs"
          fontWeight="semibold"
          onClick={handleDownloadPDF}
          isDisabled={!results.length}
          loading={pdfGenerating}
          _hover={{ bg: "#4338CA" }}
          leftIcon={<Icon as={FaFilePdf} />}
        >
          Export PDF
        </Button>
      </Flex>

      {/* Results Content */}
      {results.length === 0 ? (
        <Box
          bg="white"
          p={8}
          borderRadius="xl"
          border="1px dashed #CBD5E1"
          textAlign="center"
        >
          <Text fontWeight="semibold" color="#334155" mb={1}>
            No Results Found
          </Text>
          <Text fontSize="xs" color="#64748B">
            No candidates have submitted responses for this examination yet.
          </Text>
        </Box>
      ) : (
        <Box
          id="result-table"
          bg="white"
          borderRadius="xl"
          border="1px solid #E2E8F0"
          boxShadow="0 1px 3px rgba(0, 0, 0, 0.05)"
          overflow="hidden"
        >
          <Table.ScrollArea>
            <Table.Root size="sm" variant="outline">
              <Table.Header>
                <Table.Row bg="#0F172A">
                  <Table.ColumnHeader color="white" fontSize="11px" py={3}>
                    Student ID
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="white" fontSize="11px" py={3}>
                    Candidate Name
                  </Table.ColumnHeader>
                  {subjects.map((subject) => (
                    <Table.ColumnHeader
                      key={subject}
                      color="white"
                      fontSize="11px"
                      py={3}
                      textAlign="center"
                      textTransform="capitalize"
                    >
                      {subject}
                    </Table.ColumnHeader>
                  ))}
                  <Table.ColumnHeader color="white" fontSize="11px" py={3} textAlign="center">
                    Total
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="white" fontSize="11px" py={3} textAlign="center">
                    Grade (%)
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {results.map((res, index) => {
                  const studentName = res?.Student
                    ? `${res?.Student?.firstName || ""} ${res?.Student?.lastName || ""}`.trim()
                    : "Unknown";
                  const studentCode = res?.studentCode || res?.studentId || res?.Student?.studentId || `STU-${index + 1}`;
                  const pct = Number(res?.percentage || 0);

                  return (
                    <Table.Row
                      key={res.id || index}
                      _hover={{ bg: "#F8FAFC" }}
                      borderBottom="1px solid #F1F5F9"
                    >
                      <Table.Cell py={2.5}>
                        <Badge
                          bg="#F1F5F9"
                          color="#475569"
                          fontSize="10px"
                          borderRadius="md"
                          px={1.5}
                        >
                          {studentCode}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell py={2.5} fontSize="xs" fontWeight="medium" color="#0F172A">
                        {studentName}
                      </Table.Cell>
                      {subjects.map((subject) => (
                        <Table.Cell key={subject} textAlign="center" fontSize="xs" color="#334155" py={2.5}>
                          {res.scores?.[subject] ?? "-"}
                        </Table.Cell>
                      ))}
                      <Table.Cell textAlign="center" py={2.5}>
                        <Text fontSize="xs" fontWeight="bold" color="#0F172A">
                          {res?.totalScore ?? 0}
                        </Text>
                      </Table.Cell>
                      <Table.Cell textAlign="center" py={2.5}>
                        <Badge
                          bg={pct >= 50 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)"}
                          color={pct >= 50 ? "#059669" : "#DC2626"}
                          fontSize="10px"
                          fontWeight="bold"
                          borderRadius="full"
                          px={2}
                          py={0.5}
                        >
                          {pct.toFixed(1)}%
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Box>
      )}
    </Box>
  );
};
