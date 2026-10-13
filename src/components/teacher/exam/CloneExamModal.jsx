import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Badge,
  HStack,
  VStack,
  Icon,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { fetchExams } from "../../../api-endpoint/exam/exams";
import { FaCopy, FaSearch, FaClock, FaAward, FaLayerGroup, FaCalendarAlt, FaTimes } from "react-icons/fa";

export default function CloneExamModal({ isOpen, onClose, onSelectExam }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const loadPreviousExams = async () => {
      setLoading(true);
      try {
        const res = await fetchExams();
        if (res && res.data) {
          const sorted = [...res.data].sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          );
          setExams(sorted);
        }
      } catch (err) {
        console.error("Failed to load previous exams for template cloning", err);
      } finally {
        setLoading(false);
      }
    };

    loadPreviousExams();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredExams = exams.filter((e) =>
    (e?.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={1400}
      bg="rgba(15, 23, 42, 0.65)"
      backdropFilter="blur(6px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={{ base: 3, md: 6 }}
      onClick={onClose}
    >
      <Box
        bg="white"
        w="100%"
        maxW="720px"
        maxH="88vh"
        borderRadius="24px"
        boxShadow="0 25px 50px -12px rgba(15, 23, 42, 0.35)"
        overflow="hidden"
        display="flex"
        flexDirection="column"
        onClick={(e) => e.stopPropagation()}
        border="1px solid #E2E8F0"
      >
        {/* Modal Header */}
        <Box
          p={{ base: 4, md: 5 }}
          borderBottom="1px solid #F1F5F9"
          bg="linear-gradient(135deg, #FAF5FF 0%, #FFFFFF 100%)"
        >
          <Flex justify="space-between" align="flex-start" gap={3}>
            <HStack spacing={3} align="flex-start">
              <Flex
                w="42px"
                h="42px"
                borderRadius="xl"
                bg="purple.100"
                color="#7C3AED"
                align="center"
                justify="center"
                flexShrink={0}
              >
                <Icon as={FaCopy} boxSize={5} />
              </Flex>
              <Box>
                <Text
                  fontSize={{ base: "17px", md: "19px" }}
                  fontWeight="800"
                  color="#0F172A"
                  fontFamily="'Outfit', sans-serif"
                >
                  Clone Questions from Previous Exam
                </Text>
                <Text fontSize="12px" color="#64748B" mt={0.5}>
                  Import all sections and questions instantly into this draft. You can freely edit questions, tweak sections, or change settings before saving.
                </Text>
              </Box>
            </HStack>
            <Button
              size="xs"
              variant="ghost"
              borderRadius="full"
              w="30px"
              h="30px"
              color="#64748B"
              _hover={{ bg: "#F1F5F9", color: "#0F172A" }}
              onClick={onClose}
            >
              <Icon as={FaTimes} boxSize={3.5} />
            </Button>
          </Flex>

          {/* Search Bar */}
          <Flex
            mt={4}
            align="center"
            gap={2.5}
            bg="white"
            px={3.5}
            py={2}
            borderRadius="xl"
            border="1px solid #CBD5E1"
            _focusWithin={{ borderColor: "#7C3AED", boxShadow: "0 0 0 1px #7C3AED" }}
          >
            <Icon as={FaSearch} color="#94A3B8" boxSize={3.5} />
            <Input
              variant="unstyled"
              placeholder="Search previous examinations by title..."
              fontSize="13px"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              color="#0F172A"
            />
            {searchQuery && (
              <Button
                size="2xs"
                variant="ghost"
                color="#94A3B8"
                onClick={() => setSearchQuery("")}
              >
                Clear
              </Button>
            )}
          </Flex>
        </Box>

        {/* Scrollable Exams List */}
        <Box p={{ base: 4, md: 5 }} overflowY="auto" flex="1">
          {loading ? (
            <Flex direction="column" align="center" justify="center" py={12} color="#64748B">
              <Spinner size="lg" color="#7C3AED" mb={3} />
              <Text fontSize="13px" fontWeight="600">
                Fetching previous examinations...
              </Text>
            </Flex>
          ) : filteredExams.length === 0 ? (
            <Flex direction="column" align="center" justify="center" py={10} color="#64748B">
              <Flex
                w="48px"
                h="48px"
                borderRadius="full"
                bg="#F1F5F9"
                align="center"
                justify="center"
                mb={2}
              >
                <Icon as={FaLayerGroup} color="#94A3B8" boxSize={5} />
              </Flex>
              <Text fontSize="14px" fontWeight="700" color="#1E293B">
                {searchQuery ? "No matching exams found" : "No previous exams available"}
              </Text>
              <Text fontSize="12px" color="#64748B" mt={1} maxW="360px" textAlign="center">
                {searchQuery
                  ? "Try searching with a different exam title or keyword."
                  : "You haven't created any exams yet. Create your first exam below!"}
              </Text>
            </Flex>
          ) : (
            <VStack spacing={3} align="stretch">
              {filteredExams.map((exam) => {
                const totalQuestions = (exam.sections || []).reduce(
                  (acc, s) => acc + (s.questions?.length || 0),
                  0
                );
                const sectionsList = exam.sections || [];

                return (
                  <Box
                    key={exam.id}
                    p={4}
                    borderRadius="16px"
                    border="1px solid #E2E8F0"
                    bg="white"
                    transition="all 0.18s ease"
                    _hover={{
                      borderColor: "#7C3AED",
                      bg: "#FAF5FF",
                      boxShadow: "0 4px 14px rgba(124, 58, 237, 0.08)",
                    }}
                  >
                    <Flex
                      direction={{ base: "column", sm: "row" }}
                      justify="space-between"
                      align={{ base: "flex-start", sm: "center" }}
                      gap={3}
                      mb={2.5}
                    >
                      <Box flex="1">
                        <Text fontSize="15px" fontWeight="800" color="#0F172A">
                          {exam.title}
                        </Text>
                        <HStack spacing={2} mt={1} wrap="wrap">
                          <HStack spacing={1} color="#64748B" fontSize="11px">
                            <Icon as={FaClock} color="#7C3AED" boxSize={3} />
                            <Text fontWeight="600">{exam.duration || 60} mins</Text>
                          </HStack>
                          <Text color="#CBD5E1">•</Text>
                          <HStack spacing={1} color="#64748B" fontSize="11px">
                            <Icon as={FaAward} color="#F59E0B" boxSize={3} />
                            <Text fontWeight="600">{exam.totalMarks || 100} marks</Text>
                          </HStack>
                          <Text color="#CBD5E1">•</Text>
                          <HStack spacing={1} color="#64748B" fontSize="11px">
                            <Icon as={FaLayerGroup} color="#2563EB" boxSize={3} />
                            <Text fontWeight="700" color="#0F172A">
                              {sectionsList.length} section{sectionsList.length === 1 ? "" : "s"} ({totalQuestions} questions)
                            </Text>
                          </HStack>
                        </HStack>
                      </Box>

                      <Button
                        size="sm"
                        h="36px"
                        px={4}
                        bg="#7C3AED"
                        color="white"
                        borderRadius="xl"
                        fontWeight="700"
                        fontSize="12px"
                        _hover={{ bg: "#6D28D9", transform: "translateY(-1px)" }}
                        onClick={() => onSelectExam(exam)}
                      >
                        <Icon as={FaCopy} mr={1.5} boxSize={3} />
                        Clone into Draft
                      </Button>
                    </Flex>

                    {/* Section Breakdown Pills */}
                    {sectionsList.length > 0 && (
                      <HStack spacing={1.5} wrap="wrap" pt={2} borderTop="1px dashed #E2E8F0">
                        <Text fontSize="10px" fontWeight="bold" color="#64748B" textTransform="uppercase">
                          Sections:
                        </Text>
                        {sectionsList.map((sec, idx) => (
                          <Badge
                            key={idx}
                            bg="purple.50"
                            color="#6B21A8"
                            border="1px solid #DDD6FE"
                            fontSize="10px"
                            fontWeight="600"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                          >
                            {sec.section || "General"} ({sec.questions?.length || 0} Qs)
                          </Badge>
                        ))}
                      </HStack>
                    )}
                  </Box>
                );
              })}
            </VStack>
          )}
        </Box>

        {/* Modal Footer */}
        <Box p={3.5} borderTop="1px solid #F1F5F9" bg="#F8FAFC">
          <Flex justify="space-between" align="center">
            <Text fontSize="11px" color="#64748B">
              💡 Cloning copies questions into your local draft without affecting the original exam.
            </Text>
            <Button size="xs" variant="outline" borderColor="#CBD5E1" onClick={onClose}>
              Close
            </Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}
