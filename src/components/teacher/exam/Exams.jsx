import {
  Box,
  Text,
  Flex,
  Table,
  Button,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchExams } from "../../../api-endpoint/exam/exams";
import { FaCopy } from "react-icons/fa";
import { Tooltip } from "../../ui/tooltip";
import { toaster } from "../../ui/toaster";
export default function Exams() {
  const [allExams, setAllExams] = useState();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllExams = async () => {
      try {
        const res = await fetchExams();
        setAllExams(res?.data ?? []);
      } catch (error) {
        toaster.create({
          title: "Failed to load exams",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllExams();
  }, []);

  if (loading) {
    return (
      <Flex minH="100vh" justify="center" align="center">
        <Spinner size="xl" color="primary" />
      </Flex>
    );
  }

  if (!allExams.length) {
    return (
      <Flex minH="100vh" justify="center" align="center">
        <Text>No exams available</Text>
      </Flex>
    );
  }

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
      ml="200px"
      p={4}
      minH="100vh"
      w="calc(100% - 200px)"
      justifySelf="center"
      mt="9vh"
    >
      <Flex mb={4} mt={4} justify="space-between" align="center">
        <Text fontSize="xl" fontWeight="bold">
          All Exams
        </Text>
      </Flex>
      <Box align="start">
        <Table.ScrollArea borderWidth="1px" rounded="md">
          <Table.Root size="md" stickyHeader>
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
                  Exam URL
                </Table.ColumnHeader>
                <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                  Actions
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {allExams?.map((exam) => {
                const examUrl = `${window.location.origin}/exam/${exam.id}`;
                return (
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
                      <Flex align="center" justify="center">
                        <Text
                          as="span"
                          cursor="pointer"
                          onClick={() => copyToClipboard(examUrl)}
                          title="Click to copy"
                          maxWidth="420px"
                          truncate
                        >
                          {examUrl}
                        </Text>
                        <Tooltip label="Copy URL" aria-label="Copy URL tooltip">
                          <IconButton
                            size="sm"
                            onClick={() => copyToClipboard(examUrl)}
                            aria-label={`Copy exam ${exam.title} URL`}
                          >
                            <FaCopy />
                          </IconButton>
                        </Tooltip>
                      </Flex>
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
                );
              })}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      </Box>
    </Box>
  );
}
