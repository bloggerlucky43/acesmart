import {
  Box,
  Text,
  Flex,
  Table,
  Button,
  Icon,
  Badge,
  Input,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchExams } from "../../../api-endpoint/exam/exams";
import { TableSkeleton } from "../../ui/skeletons";
import {
  FaCopy,
  FaFileAlt,
  FaClock,
  FaCalendarAlt,
  FaPlus,
  FaSearch,
  FaEdit,
  FaLink,
  FaCheck,
} from "react-icons/fa";
import { toaster } from "../../ui/toaster";

export default function Exams() {
  const [allExams, setAllExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllExams = async () => {
      try {
        const res = await fetchExams();
        const sortedExams = [
          ...(res?.data ?? []).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          ),
        ];
        setAllExams(sortedExams);
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

  const handleEdit = (examId) =>
    navigate(`/teacher/exams/edit/${examId}/structure`);

  const copyToClipboard = async (text, examId) => {
    const url = String(text);

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const tmp = document.createElement("textarea");
        tmp.value = url;
        tmp.style.position = "fixed";
        tmp.style.left = "-9999px";
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        document.body.removeChild(tmp);
      }
      setCopiedId(examId);
      setTimeout(() => setCopiedId(null), 2000);
      toaster.create({
        title: "Copied test URL to clipboard!",
        type: "success",
      });
    } catch (error) {
      toaster.create({
        title: "Unable to copy URL",
        type: "error",
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Anytime";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredExams = allExams.filter((e) =>
    (e?.title || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Box
      bg="#F8FAFC"
      ml={{ base: 0, lg: "240px" }}
      p={{ base: 4, md: 8 }}
      minH="calc(100vh - 84px)"
      w={{ base: "100%", lg: "calc(100% - 240px)" }}
      mt="84px"
    >
      <Box maxW="1200px" mx="auto">
        {/* Page Header */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          gap={4}
          mb={6}
        >
          <Box>
            <Flex align="center" gap={2.5} mb={1}>
              <Flex
                w="38px"
                h="38px"
                borderRadius="xl"
                bg="purple.50"
                color="#6A1B9A"
                align="center"
                justify="center"
              >
                <Icon as={FaFileAlt} boxSize={5} />
              </Flex>
              <Text
                fontSize={{ base: "22px", md: "26px" }}
                fontWeight="800"
                color="#0F172A"
                fontFamily="'Outfit', sans-serif"
              >
                All Examinations
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
                {allExams.length} Exams
              </Badge>
            </Flex>
            <Text fontSize="14px" color="#64748B">
              Manage CBT test schedules, distribute candidate access links, and configure sections.
            </Text>
          </Box>

          <Button
            bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
            color="white"
            borderRadius="xl"
            px={5}
            h="44px"
            fontSize="14px"
            fontWeight="700"
            boxShadow="0 4px 12px rgba(106, 27, 154, 0.25)"
            _hover={{ opacity: 0.95, transform: "translateY(-1px)" }}
            onClick={() => navigate("/teacher/create_exam")}
          >
            <Icon as={FaPlus} mr={2} boxSize={3.5} />
            Create Exam
          </Button>
        </Flex>

        {/* Exams Table Card */}
        <Box
          bg="white"
          borderRadius="24px"
          border="1px solid"
          borderColor="#E2E8F0"
          boxShadow="0 2px 12px rgba(0, 0, 0, 0.03)"
          overflow="hidden"
        >
          {/* Search toolbar */}
          <Box p={4} borderBottom="1px solid" borderColor="#F1F5F9">
            <Flex
              align="center"
              gap={3}
              bg="#F8FAFC"
              px={4}
              py={2}
              borderRadius="xl"
              border="1px solid #E2E8F0"
              maxW="380px"
            >
              <Icon as={FaSearch} color="#94A3B8" />
              <Input
                variant="unstyled"
                placeholder="Search examination title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fontSize="13px"
              />
            </Flex>
          </Box>

          {loading ? (
            <Box p={4}>
              <TableSkeleton rows={5} columns={5} />
            </Box>
          ) : filteredExams.length === 0 ? (
            <Flex h="240px" direction="column" justify="center" align="center" color="#64748B">
              <Icon as={FaFileAlt} boxSize={8} color="#CBD5E1" mb={2} />
              <Text fontSize="15px" fontWeight="700">
                {searchTerm ? "No matching exams found" : "No examinations created yet"}
              </Text>
              <Text fontSize="13px" mb={4}>
                {searchTerm ? "Try searching with a different keyword." : "Get started by scheduling your first CBT test."}
              </Text>
              {!searchTerm && (
                <Button
                  size="sm"
                  bg="#6A1B9A"
                  color="white"
                  borderRadius="xl"
                  onClick={() => navigate("/teacher/create_exam")}
                >
                  Schedule First Exam
                </Button>
              )}
            </Flex>
          ) : (
            <Table.ScrollArea maxH="65vh">
              <Table.Root size="md" stickyHeader>
                <Table.Header>
                  <Table.Row bg="#0F172A">
                    <Table.ColumnHeader color="white" py={3.5} px={5} fontSize="12px" fontWeight="700">
                      Exam Title & ID
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="white" py={3.5} px={5} fontSize="12px" fontWeight="700">
                      Duration
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="white" py={3.5} px={5} fontSize="12px" fontWeight="700">
                      Window Dates
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="white" py={3.5} px={5} fontSize="12px" fontWeight="700">
                      Student Access URL
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="white" py={3.5} px={5} fontSize="12px" fontWeight="700" textAlign="right">
                      Actions
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredExams.map((exam) => {
                    const examUrl = `${window.location.origin}/exam/${exam.id}`;
                    const isCopied = copiedId === exam.id;
                    return (
                      <Table.Row
                        key={exam.id}
                        _hover={{ bg: "#FAF5FF" }}
                        transition="background 0.15s ease"
                      >
                        <Table.Cell py={3.5} px={5}>
                          <Box>
                            <Text fontSize="14px" fontWeight="700" color="#0F172A">
                              {exam.title}
                            </Text>
                            <Text fontSize="11px" color="#64748B" fontFamily="monospace">
                              ID: {exam.id}
                            </Text>
                          </Box>
                        </Table.Cell>

                        <Table.Cell py={3.5} px={5}>
                          <Flex align="center" gap={1.5} color="#475569">
                            <Icon as={FaClock} color="#7C3AED" boxSize={3} />
                            <Text fontSize="13px" fontWeight="600">
                              {exam.duration || "60"} mins
                            </Text>
                          </Flex>
                        </Table.Cell>

                        <Table.Cell py={3.5} px={5}>
                          <Flex align="center" gap={1.5} color="#475569">
                            <Icon as={FaCalendarAlt} color="#2563EB" boxSize={3} />
                            <Text fontSize="12px">
                              {formatDate(exam.startDate)} - {formatDate(exam.endDate)}
                            </Text>
                          </Flex>
                        </Table.Cell>

                        <Table.Cell py={3.5} px={5}>
                          <Button
                            size="xs"
                            variant="outline"
                            borderColor={isCopied ? "#10B981" : "#E2E8F0"}
                            bg={isCopied ? "green.50" : "#F8FAFC"}
                            color={isCopied ? "#059669" : "#334155"}
                            borderRadius="lg"
                            px={2.5}
                            onClick={() => copyToClipboard(examUrl, exam.id)}
                          >
                            <Icon as={isCopied ? FaCheck : FaCopy} mr={1.5} boxSize={2.5} />
                            {isCopied ? "Copied!" : "Copy Test Link"}
                          </Button>
                        </Table.Cell>

                        <Table.Cell py={3.5} px={5} textAlign="right">
                          <Flex justify="flex-end" align="center" gap={2}>
                            <Button
                              size="xs"
                              bg="#6A1B9A"
                              color="white"
                              borderRadius="lg"
                              px={3}
                              _hover={{ opacity: 0.9 }}
                              onClick={() => handleEdit(exam.id)}
                            >
                              <Icon as={FaEdit} mr={1} boxSize={2.5} />
                              Structure
                            </Button>
                          </Flex>
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
