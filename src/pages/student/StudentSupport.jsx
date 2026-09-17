import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Icon,
  Badge,
  Button,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import {
  FaQuestionCircle,
  FaPaperPlane,
  FaSyncAlt,
  FaPhone,
  FaEnvelope,
  FaUniversity,
  FaInbox,
} from "react-icons/fa";
import StudentPageHeading from "../../components/student/StudentPageHeading";
import {
  PortalCard,
  PortalLoader,
} from "../../components/student/StudentPortalPrimitives";
import { statusTone } from "../../components/student/studentStatusTone";
import { useStudentPortal } from "../../libs/StudentPortalProvider";
import {
  getStudentSupportTicketsApi,
  createStudentSupportTicketApi,
} from "../../api-endpoint/sms/portalEndpoints";
import { toaster } from "../../components/ui/toaster";

const CATEGORIES = [
  { value: "general", label: "General Enquiry" },
  { value: "payment", label: "Payment / Receipt Issue" },
  { value: "result", label: "Result / Report Card Issue" },
  { value: "portal", label: "Portal Access Issue" },
];

const fieldStyle = {
  width: "100%",
  borderRadius: "12px",
  border: "1px solid #CBD5E1",
  fontSize: "14px",
  fontWeight: "600",
  background: "white",
  padding: "12px 14px",
};

const StudentSupport = () => {
  const { student, institution } = useStudentPortal();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");

  const studentId = student?.id;

  const load = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await getStudentSupportTicketsApi(studentId);
      if (res?.success) setTickets(res.data || []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toaster.create({ title: "Enter a subject and message", type: "warning" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await createStudentSupportTicketApi({
        studentId,
        subject: subject.trim(),
        message: message.trim(),
        category,
      });
      if (res?.success) {
        toaster.create({ title: "Ticket submitted", type: "success" });
        setSubject("");
        setMessage("");
        setCategory("general");
        await load();
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Failed to submit ticket",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <StudentPageHeading
        title="Help & Support"
        description="Reach the school bursary or ICT desk when something is wrong."
        icon={FaQuestionCircle}
        action={
          <Button
            size="sm"
            variant="outline"
            borderColor="#CBD5E1"
            borderRadius="xl"
            fontWeight="700"
            fontSize="12px"
            loading={loading}
            onClick={load}
          >
            <Icon as={FaSyncAlt} mr={2} boxSize={3} />
            Refresh
          </Button>
        }
      />

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} mb={6}>
        <PortalCard>
          <Flex align="center" gap={2.5} mb={4}>
            <Icon as={FaPaperPlane} color="#4338CA" boxSize={4} />
            <Text fontSize="16px" fontWeight="800" color="#0F172A">
              Report an Issue
            </Text>
          </Flex>

          <form onSubmit={submit}>
            <Flex direction="column" gap={4}>
              <Box>
                <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                  SUBJECT
                </Text>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={fieldStyle}
                  placeholder="e.g. Payment not reflecting"
                />
              </Box>

              <Box>
                <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                  CATEGORY
                </Text>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ ...fieldStyle, height: "44px", padding: "0 12px" }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Box>

              <Box>
                <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                  MESSAGE
                </Text>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  style={{ ...fieldStyle, resize: "vertical" }}
                  placeholder="Describe the issue in detail. Include your payment reference or subject if relevant."
                />
              </Box>

              <Button
                type="submit"
                h="44px"
                bg="#4338CA"
                color="white"
                borderRadius="xl"
                fontWeight="700"
                loading={submitting}
              >
                <Icon as={FaPaperPlane} mr={2} boxSize={3.5} />
                Submit Ticket
              </Button>
            </Flex>
          </form>
        </PortalCard>

        <PortalCard>
          <Flex align="center" gap={2.5} mb={4}>
            <Icon as={FaUniversity} color="#4338CA" boxSize={4} />
            <Text fontSize="16px" fontWeight="800" color="#0F172A">
              School Contact
            </Text>
          </Flex>

          {[
            { icon: FaUniversity, label: "Institution", value: institution?.name || "—" },
            { icon: FaPhone, label: "Phone", value: institution?.phone || "Contact the school office" },
            { icon: FaEnvelope, label: "Email", value: institution?.email || "Contact the school office" },
          ].map((row) => (
            <Flex
              key={row.label}
              align="center"
              gap={3}
              py={3}
              borderBottom="1px solid #F1F5F9"
            >
              <Icon as={row.icon} color="#4338CA" boxSize={3.5} flexShrink={0} />
              <Box minW={0}>
                <Text fontSize="11px" color="#94A3B8" fontWeight="700">
                  {row.label.toUpperCase()}
                </Text>
                <Text fontSize="13px" fontWeight="700" color="#0F172A" isTruncated>
                  {row.value}
                </Text>
              </Box>
            </Flex>
          ))}

          <Box
            mt={4}
            p={4}
            borderRadius="xl"
            bg="#EEF2FF"
            color="#3730A3"
            fontSize="12px"
            lineHeight="1.6"
          >
            Payments usually reflect within the same day. If a payment is missing
            after 24 hours, submit a ticket with your payment reference and the
            bursary will reconcile it manually.
          </Box>
        </PortalCard>
      </SimpleGrid>

      <PortalCard>
        <Flex align="center" gap={2.5} mb={4}>
          <Icon as={FaInbox} color="#4338CA" boxSize={4} />
          <Text fontSize="16px" fontWeight="800" color="#0F172A">
            My Tickets
          </Text>
        </Flex>

        {loading && tickets.length === 0 ? (
          <Flex align="center" justify="center" py={8} gap={3} color="#64748B">
            <Spinner size="sm" color="#4338CA" /> Loading your tickets...
          </Flex>
        ) : tickets.length === 0 ? (
          <Text fontSize="13px" color="#64748B" textAlign="center" py={6}>
            You have not submitted any support tickets yet.
          </Text>
        ) : (
          <Flex direction="column" gap={3}>
            {tickets.map((ticket) => {
              const tone = statusTone(ticket.status);
              return (
                <Box
                  key={ticket.id}
                  p={4}
                  borderRadius="xl"
                  border="1px solid #E2E8F0"
                  bg="#F8FAFC"
                >
                  <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap">
                    <Box minW={0}>
                      <Text fontSize="14px" fontWeight="800" color="#0F172A">
                        {ticket.subject}
                      </Text>
                      <Text fontSize="11px" color="#94A3B8" mt={0.5}>
                        {ticket.category} •{" "}
                        {ticket.createdAt
                          ? new Date(ticket.createdAt).toLocaleDateString()
                          : ""}
                      </Text>
                    </Box>
                    <Badge
                      bg={tone.bg}
                      color={tone.color}
                      px={2.5}
                      py={0.5}
                      borderRadius="full"
                      fontWeight="800"
                      fontSize="11px"
                      textTransform="uppercase"
                    >
                      {ticket.status.replace("_", " ")}
                    </Badge>
                  </Flex>

                  <Text fontSize="13px" color="#334155" mt={2} lineHeight="1.6" whiteSpace="pre-wrap">
                    {ticket.message}
                  </Text>

                  {ticket.adminResponse && (
                    <Box
                      mt={3}
                      p={3}
                      borderRadius="lg"
                      bg="#ECFDF5"
                      border="1px solid #A7F3D0"
                    >
                      <Text fontSize="11px" fontWeight="800" color="#065F46" mb={1}>
                        SCHOOL RESPONSE
                      </Text>
                      <Text fontSize="13px" color="#065F46" lineHeight="1.6" whiteSpace="pre-wrap">
                        {ticket.adminResponse}
                      </Text>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Flex>
        )}
      </PortalCard>
    </Box>
  );
};

export default StudentSupport;
