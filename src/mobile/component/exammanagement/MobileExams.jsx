import { Box, Text, Flex, Table, Button } from "@chakra-ui/react";
import { useEffect } from "react";
import { useState } from "react";

import { useNavigate } from "react-router-dom";
import { fetchExams } from "../../../api-endpoint/exam/exams";
export default function MobileExams() {
  const [allExams, setAllExams] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllExams = async () => {
      const res = await fetchExams();

      if (res.data) {
        setAllExams(res.data);
        console.log(res.data);
      }
    };

    fetchAllExams();
  }, []);

  const handleEdit = (examId) => navigate(`/teacher/exams/edit?exam=${examId}`);

  const copyToClipboard = async (text) => {
    const url = String(text);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        toaster.create({
          title: "Copied URL to clipboard",
          type: "success",
        });
        return;
      } catch (error) {
        console.warn("Clipboard API failed,using fallback", error);
      }
    }

    try {
      const tmp = document.createElement("textarea");
      tmp.value = url;
      tmp.style.position = "fixed";
      tmp.style.left = "-9999px";
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      document.body.removeChild(tmp);
      toaster.create({
        title: "Copied URL to clipboard",
        type: "success",
      });
    } catch (error) {
      toaster.create({
        title: "Unable to copy url",
        type: "error",
      });
      console.error("Fallback copy failed", error);
    }
  };

  // Helper function to format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Box
      bg="gray.200"
      minH="100vh"
      p={4}
      w="100%"
      justifySelf="center"
      mt="7vh"
    >
      <Box bg="white" p={2} borderRadius="md">
        <Flex mb={4} justify="space-between" align="center">
          <Text>All Exams</Text>
        </Flex>
        <Box align="start">
          <Table.ScrollArea borderWidth="1px" rounded="md" maxH="80vh">
            <Table.Root size="sm" stickyHeader>
              <Table.Header>
                <Table.Row bg="primary">
                  <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                    Exam Title
                  </Table.ColumnHeader>

                  <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                    Duration
                  </Table.ColumnHeader>

                  <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                    Start Date
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                    End Date
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                    Actions
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {allExams?.map((exam) => (
                  <Table.Row bg="white" key={exam.id}>
                    <Table.Cell textAlign="center">{exam.title}</Table.Cell>

                    <Table.Cell textAlign="center">{exam.duration}</Table.Cell>

                    <Table.Cell textAlign="center">
                      {formatDate(exam?.startDate)}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      {formatDate(exam?.endDate)}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Flex justify="center" align="center" gap={2}>
                        <Button
                          bg="secondary"
                          _hover={{ transform: "scale(1.05)" }}
                          onClick={() => handleEdit(exam.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          bg="danger"
                          color="gray.900"
                          _hover={{ transform: "scale(1.05)" }}
                        >
                          Delete
                        </Button>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Box>
      </Box>
    </Box>
  );
}
