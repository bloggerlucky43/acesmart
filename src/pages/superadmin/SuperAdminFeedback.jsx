import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Icon,
  Badge,
  SimpleGrid,
  HStack,
  VStack,
  Textarea,
  NativeSelect,
} from "@chakra-ui/react";
import {
  FaCommentDots,
  FaStar,
  FaCheckCircle,
  FaClock,
  FaSyncAlt,
  FaTrash,
  FaReply,
  FaTimes,
} from "react-icons/fa";
import SuperAdminLayout from "./SuperAdminLayout";
import {
  getFeedbacksApi,
  updateFeedbackStatusApi,
  deleteFeedbackApi,
} from "../../api-endpoint/feedback/feedbackEndpoints";

const CATEGORIES = [
  "All",
  "General Feedback",
  "Bug Report",
  "Feature Request",
  "Question Bank / Content",
  "Exam / CBT Issue",
];

const STATUSES = ["All", "pending", "in_review", "resolved"];

export default function SuperAdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadError, setLoadError] = useState("");
  const [replyError, setReplyError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const requestId = useRef(null);
  const mutationInFlight = useRef(false);

  // Response Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [replyStatus, setReplyStatus] = useState("resolved");
  const [replyText, setReplyText] = useState("");
  const [savingReply, setSavingReply] = useState(false);

  const fetchFeedbacks = useCallback(async () => {
    const request = Symbol();
    requestId.current = request;
    setLoading(true);
    setLoadError("");
    try {
      const res = await getFeedbacksApi({
        category: selectedCategory,
        status: selectedStatus,
        search,
        page,
        limit: 15,
      });

      if (request !== requestId.current) return;
      if (res?.success) {
        const pages = res.totalPages || 1;
        if (page > pages) {
          setPage(pages);
          return;
        }
        setFeedbacks(res.data || []);
        if (res.metrics) setMetrics(res.metrics);
        setTotalPages(pages);
      } else {
        setLoadError(res?.message || "Unable to load feedback. Please try again.");
      }
    } catch {
      if (request === requestId.current) setLoadError("Unable to load feedback. Please try again.");
    } finally {
      if (request === requestId.current) setLoading(false);
    }
  }, [selectedCategory, selectedStatus, search, page]);

  useEffect(() => {
    fetchFeedbacks();
    return () => { requestId.current = null; };
  }, [fetchFeedbacks]);

  const handleOpenReply = (fb) => {
    setSelectedItem(fb);
    setReplyStatus(fb.status === "pending" ? "resolved" : fb.status);
    setReplyText(fb.adminResponse || "");
    setReplyError("");
  };

  const handleSaveReply = async () => {
    if (!selectedItem || mutationInFlight.current) return;
    mutationInFlight.current = true;
    setSavingReply(true);
    setReplyError("");
    try {
      const res = await updateFeedbackStatusApi(selectedItem.id, {
        status: replyStatus,
        adminResponse: replyText.trim(),
      });
      if (res?.success) {
        setSelectedItem(null);
        await fetchFeedbacks();
      } else {
        setReplyError(res?.message || "Unable to save feedback changes.");
      }
    } catch {
      setReplyError("Unable to save feedback changes. Please try again.");
    } finally {
      mutationInFlight.current = false;
      setSavingReply(false);
    }
  };

  const handleDelete = async (id) => {
    if (mutationInFlight.current || !window.confirm("Are you sure you want to delete this feedback entry?")) return;
    mutationInFlight.current = true;
    setDeletingId(id);
    try {
      const res = await deleteFeedbackApi(id);
      if (res?.success) {
        await fetchFeedbacks();
      } else {
        setLoadError(res?.message || "Unable to delete feedback.");
      }
    } catch {
      setLoadError("Unable to delete feedback. Please try again.");
    } finally {
      mutationInFlight.current = false;
      setDeletingId(null);
    }
  };

  const renderStars = (count) => {
    return (
      <HStack gap={0.5}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            as={FaStar}
            boxSize={3}
            color={star <= count ? "#F59E0B" : "#CBD5E1"}
          />
        ))}
      </HStack>
    );
  };

  return (
    <SuperAdminLayout>
      <Box p={{ base: 4, md: 8 }} maxW="1400px" mx="auto">
        {/* Header */}
        <Flex
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={4}
          mb={8}
        >
          <Box>
            <Flex align="center" gap={3} mb={1}>
              <Flex
                w="42px"
                h="42px"
                borderRadius="xl"
                bg="purple.50"
                color="#6A1B9A"
                align="center"
                justify="center"
              >
                <Icon as={FaCommentDots} boxSize={5} />
              </Flex>
              <Text fontSize="24px" fontWeight="900" color="#0F172A">
                User Feedback & Experience Desk
              </Text>
            </Flex>
            <Text fontSize="13px" color="#64748B">
              Live reviews, bug reports, and suggestions submitted by teachers, students, and school administrators.
            </Text>
          </Box>

          <Button
            size="sm"
            variant="outline"
            borderRadius="xl"
            onClick={fetchFeedbacks}
            loading={loading}
            disabled={savingReply || deletingId !== null}
          >
            <Icon as={FaSyncAlt} mr={2} boxSize={3} />
            Refresh
          </Button>
        </Flex>

        {/* Metrics Overview */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} mb={8}>
          <Box bg="white" p={5} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#64748B">
                TOTAL FEEDBACKS
              </Text>
              <Icon as={FaCommentDots} color="#6366F1" boxSize={4} />
            </Flex>
            <Text fontSize="24px" fontWeight="900" color="#0F172A">
              {metrics.total}
            </Text>
            <Text fontSize="11px" color="#64748B" mt={1}>
              All time user submissions
            </Text>
          </Box>

          <Box bg="white" p={5} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#64748B">
                AVERAGE SATISFACTION
              </Text>
              <Icon as={FaStar} color="#F59E0B" boxSize={4} />
            </Flex>
            <Flex align="baseline" gap={2}>
              <Text fontSize="24px" fontWeight="900" color="#0F172A">
                {metrics.averageRating}
              </Text>
              <Text fontSize="13px" color="#64748B">
                / 5.0
              </Text>
            </Flex>
            {renderStars(Math.round(metrics.averageRating))}
          </Box>

          <Box bg="white" p={5} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#D97706">
                PENDING ACTION
              </Text>
              <Icon as={FaClock} color="#D97706" boxSize={4} />
            </Flex>
            <Text fontSize="24px" fontWeight="900" color="#D97706">
              {metrics.pending}
            </Text>
            <Text fontSize="11px" color="#64748B" mt={1}>
              Awaiting review or triage
            </Text>
          </Box>

          <Box bg="white" p={5} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#059669">
                RESOLVED
              </Text>
              <Icon as={FaCheckCircle} color="#059669" boxSize={4} />
            </Flex>
            <Text fontSize="24px" fontWeight="900" color="#059669">
              {metrics.resolved}
            </Text>
            <Text fontSize="11px" color="#64748B" mt={1}>
              Addressed or incorporated
            </Text>
          </Box>
        </SimpleGrid>

        {/* Filter Toolbar */}
        <Box bg="white" p={4} borderRadius="2xl" border="1px solid #E2E8F0" mb={6}>
          <Flex wrap="wrap" gap={3} align="center" justify="space-between">
            <HStack wrap="wrap" gap={2} flex={1}>
              <Box minW="220px" flex={1}>
                <Input
                  placeholder="Search subject, user, school, or keyword..."
                  value={search}
                  disabled={savingReply || deletingId !== null}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  maxLength={255}
                  h="38px"
                  borderRadius="xl"
                  fontSize="13px"
                />
              </Box>

              <NativeSelect.Root size="sm" w="180px">
                <NativeSelect.Field
                  value={selectedCategory}
                  disabled={savingReply || deletingId !== null}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  borderRadius="xl"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </NativeSelect.Field>
              </NativeSelect.Root>

              <NativeSelect.Root size="sm" w="140px">
                <NativeSelect.Field
                  value={selectedStatus}
                  disabled={savingReply || deletingId !== null}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                  borderRadius="xl"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      Status: {s}
                    </option>
                  ))}
                </NativeSelect.Field>
              </NativeSelect.Root>
            </HStack>
          </Flex>
        </Box>

        {loadError && <Box role="alert" bg="red.50" color="#B91C1C" p={4} borderRadius="xl" mb={4}>{loadError}</Box>}

        {/* Feedback List */}
        {loading ? (
          <Flex justify="center" align="center" h="200px" color="#64748B">
            Loading feedbacks...
          </Flex>
        ) : feedbacks.length === 0 && !loadError ? (
          <Box bg="white" p={12} borderRadius="2xl" textAlign="center" border="1px solid #E2E8F0">
            <Icon as={FaCheckCircle} boxSize={8} color="#10B981" mb={3} />
            <Text fontSize="16px" fontWeight="800" color="#0F172A">
              No Feedbacks Found
            </Text>
            <Text fontSize="13px" color="#64748B">
              No user submissions matching the current category or filter criteria.
            </Text>
          </Box>
        ) : (
          <VStack gap={4} align="stretch">
            {feedbacks.map((fb) => {
              const statusBg =
                fb.status === "resolved"
                  ? "#ECFDF5"
                  : fb.status === "in_review"
                  ? "#EFF6FF"
                  : "#FFFBEB";
              const statusColor =
                fb.status === "resolved"
                  ? "#059669"
                  : fb.status === "in_review"
                  ? "#2563EB"
                  : "#D97706";

              return (
                <Box
                  key={fb.id}
                  bg="white"
                  p={5}
                  borderRadius="2xl"
                  border="1px solid #E2E8F0"
                  boxShadow="0 2px 8px rgba(0, 0, 0, 0.02)"
                >
                  <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap" mb={3}>
                    <Box>
                      <Flex align="center" gap={2} wrap="wrap" mb={1}>
                        <Badge
                          bg="#F1F5F9"
                          color="#475569"
                          px={2.5}
                          py={0.5}
                          borderRadius="full"
                          fontSize="11px"
                          fontWeight="700"
                        >
                          {fb.category}
                        </Badge>
                        <Badge
                          bg={statusBg}
                          color={statusColor}
                          px={2.5}
                          py={0.5}
                          borderRadius="full"
                          fontSize="11px"
                          fontWeight="800"
                        >
                          {fb.status.toUpperCase()}
                        </Badge>
                        <Badge
                          bg="#EEF2FF"
                          color="#4338CA"
                          px={2.5}
                          py={0.5}
                          borderRadius="full"
                          fontSize="11px"
                          fontWeight="700"
                        >
                          {fb.role}
                        </Badge>
                        {renderStars(fb.rating)}
                      </Flex>
                      <Text fontSize="16px" fontWeight="800" color="#0F172A">
                        {fb.subject}
                      </Text>
                    </Box>

                    <HStack gap={2}>
                      <Button
                        size="xs"
                        bg="#4338CA"
                        color="white"
                        borderRadius="lg"
                        onClick={() => handleOpenReply(fb)}
                        disabled={deletingId !== null || savingReply}
                        _hover={{ bg: "#3730A3" }}
                      >
                        <Icon as={FaReply} mr={1} />
                        Respond / Status
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        color="#DC2626"
                        borderRadius="lg"
                        onClick={() => handleDelete(fb.id)}
                        aria-label={`Delete feedback: ${fb.subject}`}
                        loading={deletingId === fb.id}
                        disabled={deletingId !== null || savingReply}
                      >
                        <Icon as={FaTrash} />
                      </Button>
                    </HStack>
                  </Flex>

                  <Text fontSize="13px" color="#334155" lineHeight="1.6" mb={3} whiteSpace="pre-wrap">
                    {fb.message}
                  </Text>

                  {/* Admin Response Note */}
                  {fb.adminResponse && (
                    <Box bg="#F8FAFC" p={3.5} borderRadius="xl" border="1px solid #E2E8F0" mb={3}>
                      <Text fontSize="11px" fontWeight="800" color="#475569" mb={1}>
                        DEVELOPER / ADMIN RESPONSE:
                      </Text>
                      <Text fontSize="13px" color="#0F172A" whiteSpace="pre-wrap">
                        {fb.adminResponse}
                      </Text>
                    </Box>
                  )}

                  <Flex justify="space-between" align="center" wrap="wrap" gap={2} fontSize="12px" color="#64748B" pt={2} borderTop="1px solid #F1F5F9">
                    <Text>
                      Submitted by: <strong style={{ color: "#0F172A" }}>{fb.name || "Anonymous"}</strong> ({fb.email || "No email"})
                      {fb.Institution && ` • School: ${fb.Institution.name}`}
                    </Text>
                    <Text>
                      {new Date(fb.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </Flex>
                </Box>
              );
            })}
          </VStack>
        )}

        {totalPages > 1 && (
          <Flex justify="center" align="center" gap={3} mt={6}>
            <Button variant="outline" size="sm" disabled={loading || savingReply || deletingId !== null || page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <Text fontSize="13px">Page {page} of {totalPages}</Text>
            <Button variant="outline" size="sm" disabled={loading || savingReply || deletingId !== null || page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </Flex>
        )}

        {/* Resolution & Response Modal */}
        {selectedItem && (
          <Box
            position="fixed"
            top={0}
            left={0}
            w="100vw"
            h="100dvh"
            bg="rgba(15, 23, 42, 0.6)"
            backdropFilter="blur(4px)"
            zIndex={9999}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
          >
            <Box bg="white" w="100%" maxW="500px" maxH="calc(100dvh - 32px)" borderRadius="24px" overflowY="auto" boxShadow="2xl" role="dialog" aria-modal="true" aria-label="Respond to feedback">
              <Flex bg="#1E1B4B" color="white" p={5} justify="space-between" align="center">
                <Box>
                  <Text fontSize="16px" fontWeight="800">
                    Respond to Feedback
                  </Text>
                  <Text fontSize="12px" color="#C7D2FE">
                    {selectedItem.subject}
                  </Text>
                </Box>
                <Button size="xs" variant="ghost" color="white" aria-label="Close response" disabled={savingReply} onClick={() => setSelectedItem(null)}>
                  <Icon as={FaTimes} boxSize={4} />
                </Button>
              </Flex>

              <Box p={6}>
                <Box mb={4}>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1.5}>
                    UPDATE STATUS
                  </Text>
                  <NativeSelect.Root size="md">
                    <NativeSelect.Field
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value)}
                      borderRadius="xl"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_review">In Review / Investigating</option>
                      <option value="resolved">Resolved / Implemented</option>
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Box>

                <Box mb={5}>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1.5}>
                    ADMIN NOTE / RESPONSE (OPTIONAL)
                  </Text>
                  <Textarea
                    maxLength={10000}
                    rows={4}
                    placeholder="e.g. Fixed in patch v2.4 or added to next sprint roadmap..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    borderRadius="xl"
                    fontSize="13px"
                  />
                </Box>

                {replyError && <Text role="alert" color="#B91C1C" fontSize="13px" mb={4}>{replyError}</Text>}

                <Flex justify="flex-end" gap={2}>
                  <Button variant="outline" borderRadius="xl" disabled={savingReply} onClick={() => setSelectedItem(null)}>
                    Cancel
                  </Button>
                  <Button
                    bg="#4338CA"
                    color="white"
                    borderRadius="xl"
                    onClick={handleSaveReply}
                    loading={savingReply}
                    disabled={savingReply}
                  >
                    Save Changes
                  </Button>
                </Flex>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </SuperAdminLayout>
  );
}
