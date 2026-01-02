import {
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
import PageLoader from "../../../../../components/ui/pageloader";
export default function ResultDetails() {
  const { id } = useParams();

  const {
    data: results = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["exam-results", id],
    queryFn: () => fetchExamResults(id).then((res) => res.data),
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

  return (
    <Box
      w={"calc(100% -200px)"}
      mt="9vh"
      ml="200px"
      p={4}
      bg="gray.200"
      minH="100vh"
      cursor="pointer"
    >
      <Flex mb={6} justify="space-between" align="center" mt={4}>
        <Text fontSize="2xl" fontWeight={"semibold"}>
          {String(results[0]?.examTitle ?? "Exam")} Results
        </Text>
        <Flex gap={4}>
          <Button bg="primary" onClick={handleDownload}>
            Download Excel
          </Button>
          <Button onClick={handleDownloadPDF} bg="secondary" color="white">
            Download PDF
          </Button>
        </Flex>
      </Flex>

      {results.length === 0 ? (
        <Center h="50vh">
          <Text>No student results found for this exam.</Text>
        </Center>
      ) : (
        <Table.ScrollArea id="result-table">
          <Table.Root size="md" stickyHeader>
            <Table.Header>
              <Table.Row bg="primary">
                <Table.ColumnHeader color="white" textAlign={"center"}>
                  Student ID
                </Table.ColumnHeader>
                <Table.ColumnHeader color="white" textAlign={"center"}>
                  Name
                </Table.ColumnHeader>

                {subjects.map((subject) => (
                  <Table.ColumnHeader
                    key={subject}
                    color="white"
                    textAlign={"center"}
                    textTransform={"capitalize"}
                  >
                    {subject}
                  </Table.ColumnHeader>
                ))}

                <Table.ColumnHeader color="White" textAlign="center">
                  Total
                </Table.ColumnHeader>

                <Table.ColumnHeader color="White" textAlign="center">
                  Percentage (%)
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {results?.map((res) => (
                <Table.Row key={res.id} bg="white">
                  <Table.Cell textAlign={"center"}>
                    {res?.studentCode || res?.Student?.studentId}
                  </Table.Cell>
                  <Table.Cell textAlign={"center"}>
                    {res?.Student
                      ? `${res?.Student?.firstName} ${res?.Student?.lastName}`
                      : "N/A"}
                  </Table.Cell>

                  {subjects.map((subject) => (
                    <Table.Cell key={subject} textAlign={"center"}>
                      {res?.scores?.[subject] ?? "-"}
                    </Table.Cell>
                  ))}

                  <Table.Cell textAlign={"center"}>
                    {res?.totalScore}
                  </Table.Cell>
                  <Table.Cell textAlign={"center"}>
                    {typeof res?.percentage === "number"
                      ? res?.percentage.toFixed(2)
                      : Number(res?.percentage || 0).toFixed(2)}
                    %
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      )}
    </Box>
  );
}
