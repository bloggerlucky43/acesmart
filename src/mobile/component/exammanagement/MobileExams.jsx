import {
  Box,
  Text,
  Flex,
  Button,
  Icon,
  Badge,
  Input,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchExams } from "../../../api-endpoint/exam/exams";
import { toaster } from "../../../components/ui/toaster";
import { CardGridSkeleton } from "../../../components/ui/skeletons";
import {
  FaPlus,
  FaSearch,
  FaCalendarAlt,
  FaClock,
  FaCopy,
  FaCheck,
  FaEdit,
  FaChartBar,
  FaFileAlt,
  FaGraduationCap,
} from "react-icons/fa";

export default function MobileExams() {
  const [allExams, setAllExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllExams = async () => {
      try {
        const res = await fetchExams();
        const sorted = [
          ...(res?.data ?? []).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          ),
        ];
        setAllExams(sorted);
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

  const copyToClipboard = async (examId) => {
    const origin = window.location.origin;
    const testUrl = `${origin}/exam/${examId}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(testUrl);
      } else {
        const tmp = document.createElement("textarea");
        tmp.value = testUrl;
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
    (e?.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box pb={6} className="animate-scale-in">
      {/* Top Title & CTA */}
      <Flex justify="space-between" align="center" mb={4}>
        <Box>
          <Text fontSize="18px" fontWeight="800" color="#0F172A" fontFamily="'Outfit', sans-serif">
            Examinations
          </Text>
          <Text fontSize="12px" color="#64748B">
            Manage scheduled CBT tests & question structures
          </Text>
        </Box>
        <Button
          size="sm"
          bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
          color="white"
          borderRadius="xl"
          fontSize="12px"
          fontWeight="700"
          onClick={() => navigate("/teacher/create_exam")}
        >
          <Icon as={FaPlus} mr={1} boxSize={3} />
          New Exam
        </Button>
      </Flex>

      {/* Search Bar */}
      <Box mb={4}>
        <Flex
          align="center"
          gap={2.5}
          bg="white"
          px={3.5}
          py={2}
          borderRadius="xl"
          border="1px solid"
          borderColor="#E2E8F0"
          boxShadow="0 1px 3px rgba(0,0,0,0.02)"
        >
          <Icon as={FaSearch} color="#94A3B8" boxSize={3.5} />
          <Input
            variant="unstyled"
            placeholder="Search exam title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fontSize="13px"
          />
        </Flex>
      </Box>

      {/* Loading Skeleton */}
      {loading ? (
        <CardGridSkeleton count={4} />
      ) : filteredExams.length === 0 ? (
        <Box
          bg="white"
          borderRadius="2xl"
          p={8}
          border="1px dashed #CBD5E1"
          textAlign="center"
        >
          <Icon as={FaFileAlt} boxSize={8} color="#CBD5E1" mb={2} />
          <Text fontSize="14px" fontWeight="700" color="#334155" mb={1}>
            {searchTerm ? "No matching exams" : "No examinations created yet"}
          </Text>
          <Text fontSize="12px" color="#64748B" mb={4}>
            {searchTerm ? "Try a different search keyword." : "Get started by authoring your first CBT session."}
          </Text>
          {!searchTerm && (
            <Button
              size="sm"
              bg="#6A1B9A"
              color="white"
              borderRadius="xl"
              onClick={() => navigate("/teacher/create_exam")}
            >
              Create First Exam
            </Button>
          )}
        </Box>
      ) : (
        /* Mobile Card List */
        <VStack gap={3.5} align="stretch">
          {filteredExams.map((exam) => (
            <Box
              key={exam.id}
              bg="white"
              borderRadius="2xl"
              p={4}
              border="1px solid"
              borderColor="#E2E8F0"
              boxShadow="0 2px 8px rgba(0,0,0,0.02)"
            >
              {/* Top Row: Title & Status */}
              <Flex justify="space-between" align="flex-start" mb={2}>
                <Box maxW="72%">
                  <Text fontSize="15px" fontWeight="800" color="#0F172A" lineHeight="1.3">
                    {exam.title}
                  </Text>
                  <Text fontSize="11px" color="#64748B" mt={0.5}>
                    ID: {exam.id ? exam.id.substring(0, 8) : "N/A"}...
                  </Text>
                </Box>
                <Badge
                  bg={exam.isPublished ? "green.50" : "orange.50"}
                  color={exam.isPublished ? "green.700" : "orange.700"}
                  border="1px solid"
                  borderColor={exam.isPublished ? "green.200" : "orange.200"}
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  fontSize="10px"
                  fontWeight="700"
                >
                  {exam.isPublished ? "Published" : "Draft"}
                </Badge>
              </Flex>

              {/* Metadata Badges */}
              <Flex gap={2} mb={3.5} flexWrap="wrap">
                <Flex align="center" gap={1.5} bg="#F8FAFC" px={2.5} py={1} borderRadius="lg" border="1px solid #E2E8F0">
                  <Icon as={FaClock} color="#6A1B9A" boxSize={3} />
                  <Text fontSize="11px" fontWeight="600" color="#475569">
                    {exam.duration || 60} mins
                  </Text>
                </Flex>

                <Flex align="center" gap={1.5} bg="#F8FAFC" px={2.5} py={1} borderRadius="lg" border="1px solid #E2E8F0">
                  <Icon as={FaCalendarAlt} color="#2563EB" boxSize={3} />
                  <Text fontSize="11px" fontWeight="600" color="#475569">
                    {formatDate(exam.startDate)}
                  </Text>
                </Flex>

                {exam.totalMarks && (
                  <Flex align="center" gap={1.5} bg="#F8FAFC" px={2.5} py={1} borderRadius="lg" border="1px solid #E2E8F0">
                    <Icon as={FaGraduationCap} color="#059669" boxSize={3} />
                    <Text fontSize="11px" fontWeight="600" color="#475569">
                      {exam.totalMarks} Marks
                    </Text>
                  </Flex>
                )}
              </Flex>

              {/* Action Buttons Row */}
              <Flex gap={2} pt={3} borderTop="1px solid" borderColor="#F1F5F9">
                <Button
                  flex={1}
                  size="xs"
                  variant="outline"
                  borderColor="#CBD5E1"
                  color="#334155"
                  borderRadius="lg"
                  h="34px"
                  onClick={() => copyToClipboard(exam.id)}
                  leftIcon={<Icon as={copiedId === exam.id ? FaCheck : FaCopy} color={copiedId === exam.id ? "green.600" : "#6A1B9A"} />}
                >
                  {copiedId === exam.id ? "Copied!" : "Copy Link"}
                </Button>

                <Button
                  flex={1}
                  size="xs"
                  bg="purple.50"
                  color="#6A1B9A"
                  borderRadius="lg"
                  h="34px"
                  fontWeight="700"
                  onClick={() => navigate(`/teacher/exams/edit/${exam.id}/structure`)}
                  leftIcon={<Icon as={FaEdit} />}
                >
                  Structure
                </Button>

                <Button
                  flex={1}
                  size="xs"
                  bg="#0F172A"
                  color="white"
                  borderRadius="lg"
                  h="34px"
                  fontWeight="700"
                  onClick={() => navigate(`/teacher/exam_results/${exam.id}`)}
                  leftIcon={<Icon as={FaChartBar} />}
                >
                  Results
                </Button>
              </Flex>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}
