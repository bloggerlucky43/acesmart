import {
  Badge,
  Box,
  Flex,
  Table,
  Text,
  Button,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { fetchExamResults } from "../../../../../api-endpoint/exam/exams";
import { useQuery } from "@tanstack/react-query";

export default function ResultDetails() {
  const { id } = useParams();

  const {
    data: results = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["exam-results", id],
    queryFn: async () => {
      const res = await fetchExamResults(id);
      return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  //dynamically extracting all subject keys from scores
  const subjects = useMemo(() => {
    const subjectSet = new Set();
    results.forEach((res) => {
      Object.keys(res.scores || {}).forEach((subject) =>
        subjectSet.add(subject)
      );
    });
    return Array.from(subjectSet);
  }, [results]);

  const handleDownload = () => {
    if (!results.length) return;

    // Build a flat array for Excel
    const dataForExcel = results.map((res) => {
      const base = {
        "Student ID": res?.studentCode || res?.studentId,
        Name: `${res?.Student?.firstName ?? ""} ${
          res?.Student?.lastName ?? ""
        }`,
        "Total Score": res?.totalScore,
        Percentage: `${Number(res?.percentage ?? 0).toFixed(2)}%`,
      };

      //add each subject score dynamicalaly
      subjects.forEach((subject) => {
        base[subject] = res?.scores?.[subject] ?? "-";
      });

      return base;
    });

    //create worksheet & workbook
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    //convert to excel file and trigger download
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(blob, `ExamResults_${Date.now()}.xlsx`);
  };

  const handleDownloadPDF = () => {
    const input = document.getElementById("result-table"); // the div or table you want to download
    html2canvas(input, { scale: 2 }).then((canvas) => {
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

      pdf.save("exam_results.pdf");
    });
  };

  if (isLoading) {
    return (
      <Flex minH="100vh" justify="center" align="center">
        <Spinner size="lg" color="primary" />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Center minH="50vh">
        <Text color="red.500">
          Failed to load results: {String(error?.message ?? "Unknown error")}
        </Text>
      </Center>
    );
  }

  const examTitle = String(results[0]?.examTitle ?? "Examination");
  const avgPercentage = results.length
    ? (results.reduce((acc, r) => acc + Number(r?.percentage || 0), 0) / results.length).toFixed(1)
    : 0;

  return (
    <Box
      w={{ base: "100%", lg: "calc(100% - 240px)" }}
      mt="84px"
      ml={{ base: 0, lg: "240px" }}
      p={{ base: 4, md: 8 }}
      bg="#F8FAFC"
      minH="calc(100vh - 84px)"
    >
      <Box maxW="1200px" mx="auto">
        {/* Top Header & Export Toolbar */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          gap={4}
          mb={6}
        >
          <Box>
            <Flex align="center" gap={2.5} mb={1}>
              <Text
                fontSize={{ base: "22px", md: "26px" }}
                fontWeight="800"
                color="#0F172A"
                fontFamily="'Outfit', sans-serif"
              >
                {examTitle}
              </Text>
              <Badge
                bg="purple.50"
                color="#6A1B9A"
                border="1px solid #E9D5FF"
                borderRadius="full"
                px={2.5}
                py={0.5}
                fontSize="12px"
                fontWeight="700"
              >
                {results.length} Candidates
              </Badge>
            </Flex>
            <Text fontSize="13px" color="#64748B">
              Detailed candidate score breakdowns, sectional marks, and class performance distribution.
            </Text>
          </Box>

          <Flex gap={3} flexWrap="wrap">
            <Button
              bg="#10B981"
              color="white"
              borderRadius="xl"
              px={4}
              h="42px"
              fontSize="13px"
              fontWeight="700"
              _hover={{ bg: "#059669" }}
              onClick={handleDownload}
            >
              Export Excel (.xlsx)
            </Button>
            <Button
              bg="#6A1B9A"
              color="white"
              borderRadius="xl"
              px={4}
              h="42px"
              fontSize="13px"
              fontWeight="700"
              _hover={{ opacity: 0.95 }}
              onClick={handleDownloadPDF}
            >
              Download PDF Report
            </Button>
          </Flex>
        </Flex>

        {/* Quick Metric Pills */}
        <Flex gap={4} mb={6} flexWrap="wrap">
          <Box px={4} py={2.5} borderRadius="xl" bg="white" border="1px solid #E2E8F0">
            <Text fontSize="11px" color="#64748B" fontWeight="600">
              CANDIDATES ASSESSED
            </Text>
            <Text fontSize="18px" fontWeight="800" color="#0F172A">
              {results.length}
            </Text>
          </Box>

          <Box px={4} py={2.5} borderRadius="xl" bg="white" border="1px solid #E2E8F0">
            <Text fontSize="11px" color="#64748B" fontWeight="600">
              CLASS AVERAGE SCORE
            </Text>
            <Text fontSize="18px" fontWeight="800" color="#7C3AED">
              {avgPercentage}%
            </Text>
          </Box>
        </Flex>

        {/* Results Table Card */}
        <Box
          bg="white"
          borderRadius="24px"
          border="1px solid"
          borderColor="#E2E8F0"
          boxShadow="0 2px 12px rgba(0, 0, 0, 0.03)"
          overflow="hidden"
        >
          {results.length === 0 ? (
            <Center h="240px">
              <Text color="#64748B" fontSize="14px">
                No student submissions recorded for this examination yet.
              </Text>
            </Center>
          ) : (
            <Table.ScrollArea id="result-table" maxH="65vh">
              <Table.Root size="md" stickyHeader>
                <Table.Header>
                  <Table.Row bg="#0F172A">
                    <Table.ColumnHeader color="white" py={3.5} px={5} fontSize="12px" fontWeight="700">
                      Student ID
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="white" py={3.5} px={5} fontSize="12px" fontWeight="700">
                      Candidate Name
                    </Table.ColumnHeader>

                    {subjects.map((subject) => (
                      <Table.ColumnHeader
                        key={subject}
                        color="white"
                        py={3.5}
                        px={4}
                        fontSize="12px"
                        fontWeight="700"
                        textAlign="center"
                        textTransform="capitalize"
                      >
                        {subject}
                      </Table.ColumnHeader>
                    ))}

                    <Table.ColumnHeader color="white" py={3.5} px={4} fontSize="12px" fontWeight="700" textAlign="center">
                      Total
                    </Table.ColumnHeader>

                    <Table.ColumnHeader color="white" py={3.5} px={5} fontSize="12px" fontWeight="700" textAlign="right">
                      Grade / %
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {results?.map((res) => {
                    const pct = typeof res?.percentage === "number"
                      ? res?.percentage
                      : Number(res?.percentage || 0);
                    const isPass = pct >= 50;

                    return (
                      <Table.Row
                        key={res.id}
                        _hover={{ bg: "#FAF5FF" }}
                        transition="background 0.15s ease"
                      >
                        <Table.Cell py={3.5} px={5} fontWeight="700" color="#6A1B9A" fontSize="13px">
                          {res?.studentCode || res?.Student?.studentId || `STU-${res.id}`}
                        </Table.Cell>

                        <Table.Cell py={3.5} px={5} fontWeight="600" color="#1E293B">
                          {res?.Student
                            ? `${res?.Student?.firstName} ${res?.Student?.lastName}`
                            : "Candidate"}
                        </Table.Cell>

                        {subjects.map((subject) => (
                          <Table.Cell key={subject} py={3.5} px={4} textAlign="center" fontWeight="600" color="#334155">
                            {res?.scores?.[subject] ?? "-"}
                          </Table.Cell>
                        ))}

                        <Table.Cell py={3.5} px={4} textAlign="center" fontWeight="800" color="#0F172A">
                          {res?.totalScore}
                        </Table.Cell>

                        <Table.Cell py={3.5} px={5} textAlign="right">
                          <Badge
                            bg={isPass ? "green.50" : "red.50"}
                            color={isPass ? "#059669" : "#DC2626"}
                            border="1px solid"
                            borderColor={isPass ? "#A7F3D0" : "#FECACA"}
                            borderRadius="full"
                            px={2.5}
                            py={0.5}
                            fontSize="11px"
                            fontWeight="800"
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
          )}
        </Box>
      </Box>
    </Box>
  );
}
