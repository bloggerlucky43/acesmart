import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Icon,
  Badge,
  Button,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FaBullhorn,
  FaCalendarAlt,
  FaBook,
  FaLifeRing,
  FaPlus,
  FaTrash,
  FaEdit,
  FaSave,
  FaSyncAlt,
  FaExternalLinkAlt,
  FaInbox,
} from "react-icons/fa";
import DashboardLayout from "../../constants/dashboardlayout";
import { toaster } from "../../components/ui/toaster";
import { getClassArmsApi } from "../../api-endpoint/sms/smsEndpoints";
import {
  getInstitutionAnnouncementsApi,
  saveInstitutionAnnouncementApi,
  deleteInstitutionAnnouncementApi,
  getInstitutionTimetableApi,
  saveInstitutionTimetableEntryApi,
  deleteInstitutionTimetableEntryApi,
  getInstitutionResourcesApi,
  saveInstitutionResourceApi,
  deleteInstitutionResourceApi,
  getInstitutionSupportTicketsApi,
  updateInstitutionSupportTicketApi,
} from "../../api-endpoint/sms/portalEndpoints";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TABS = [
  { id: "announcements", label: "Announcements", icon: FaBullhorn },
  { id: "timetable", label: "Timetable", icon: FaCalendarAlt },
  { id: "resources", label: "Resources", icon: FaBook },
  { id: "tickets", label: "Support Tickets", icon: FaLifeRing },
];

const inputStyle = {
  width: "100%",
  height: "44px",
  padding: "0 14px",
  borderRadius: "12px",
  border: "1px solid #CBD5E1",
  fontSize: "14px",
  fontWeight: "600",
  background: "white",
};

const labelStyle = {
  fontSize: "12px",
  fontWeight: "700",
  color: "#334155",
  marginBottom: "4px",
  display: "block",
};

const emptyAnnouncement = {
  id: null,
  title: "",
  body: "",
  category: "general",
  audience: "all",
  classArmId: "",
  pinned: false,
};

const emptyLesson = {
  id: null,
  classArmId: "",
  dayOfWeek: "Monday",
  startTime: "",
  endTime: "",
  subject: "",
  teacherName: "",
  venue: "",
};

const emptyResource = {
  id: null,
  title: "",
  url: "",
  description: "",
  subject: "",
  type: "link",
  classArmId: "",
};

const SectionCard = ({ children, ...rest }) => (
  <Box bg="white" borderRadius="2xl" border="1px solid #E2E8F0" p={{ base: 5, md: 6 }} {...rest}>
    {children}
  </Box>
);

const PortalContentManager = () => {
  const [tab, setTab] = useState("announcements");
  const [classArms, setClassArms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState(emptyAnnouncement);

  const [lessons, setLessons] = useState([]);
  const [lessonForm, setLessonForm] = useState(emptyLesson);

  const [resources, setResources] = useState([]);
  const [resourceForm, setResourceForm] = useState(emptyResource);

  const [tickets, setTickets] = useState([]);
  const [ticketFilter, setTicketFilter] = useState("all");

  useEffect(() => {
    getClassArmsApi()
      .then((res) => {
        if (res?.success) setClassArms(res.data || []);
      })
      .catch(() => setClassArms([]));
  }, []);

  const loadAnnouncements = useCallback(async () => {
    const res = await getInstitutionAnnouncementsApi();
    if (res?.success) setAnnouncements(res.data || []);
  }, []);

  const loadTimetable = useCallback(async () => {
    const res = await getInstitutionTimetableApi();
    if (res?.success) setLessons(res.data || []);
  }, []);

  const loadResources = useCallback(async () => {
    const res = await getInstitutionResourcesApi();
    if (res?.success) setResources(res.data || []);
  }, []);

  const loadTickets = useCallback(async () => {
    const res = await getInstitutionSupportTicketsApi();
    if (res?.success) {
      setTickets(
        (res.data || []).map((t) => ({
          ...t,
          draftStatus: t.status,
          draftResponse: t.adminResponse || "",
        }))
      );
    }
  }, []);

  const loadCurrent = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "announcements") await loadAnnouncements();
      else if (tab === "timetable") await loadTimetable();
      else if (tab === "resources") await loadResources();
      else await loadTickets();
    } catch {
      toaster.create({ title: "Failed to load content", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [tab, loadAnnouncements, loadTimetable, loadResources, loadTickets]);

  useEffect(() => {
    loadCurrent();
  }, [loadCurrent]);

  const classArmName = (id) =>
    classArms.find((c) => c.id === id)?.name || "All Classes";

  /* ------------------------------ Announcements ----------------------------- */

  const submitAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.body.trim()) {
      toaster.create({ title: "Title and message are required", type: "warning" });
      return;
    }
    setSaving(true);
    try {
      const res = await saveInstitutionAnnouncementApi({
        ...announcementForm,
        classArmId: announcementForm.audience === "class" ? announcementForm.classArmId : null,
      });
      if (res?.success) {
        toaster.create({ title: res.message, type: "success" });
        setAnnouncementForm(emptyAnnouncement);
        await loadAnnouncements();
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Failed to save announcement",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeAnnouncement = async (id) => {
    try {
      await deleteInstitutionAnnouncementApi(id);
      await loadAnnouncements();
    } catch {
      toaster.create({ title: "Failed to delete announcement", type: "error" });
    }
  };

  /* -------------------------------- Timetable ------------------------------- */

  const submitLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.subject.trim()) {
      toaster.create({ title: "Subject is required", type: "warning" });
      return;
    }
    setSaving(true);
    try {
      const res = await saveInstitutionTimetableEntryApi(lessonForm);
      if (res?.success) {
        toaster.create({ title: res.message, type: "success" });
        setLessonForm(emptyLesson);
        await loadTimetable();
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Failed to save timetable entry",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeLesson = async (id) => {
    try {
      await deleteInstitutionTimetableEntryApi(id);
      await loadTimetable();
    } catch {
      toaster.create({ title: "Failed to delete entry", type: "error" });
    }
  };

  /* -------------------------------- Resources ------------------------------- */

  const submitResource = async (e) => {
    e.preventDefault();
    if (!resourceForm.title.trim() || !resourceForm.url.trim()) {
      toaster.create({ title: "Title and URL are required", type: "warning" });
      return;
    }
    setSaving(true);
    try {
      const res = await saveInstitutionResourceApi(resourceForm);
      if (res?.success) {
        toaster.create({ title: res.message, type: "success" });
        setResourceForm(emptyResource);
        await loadResources();
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Failed to save resource",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeResource = async (id) => {
    try {
      await deleteInstitutionResourceApi(id);
      await loadResources();
    } catch {
      toaster.create({ title: "Failed to delete resource", type: "error" });
    }
  };

  /* -------------------------------- Tickets --------------------------------- */

  const visibleTickets = useMemo(
    () =>
      ticketFilter === "all"
        ? tickets
        : tickets.filter((t) => t.status === ticketFilter),
    [tickets, ticketFilter]
  );

  const saveTicket = async (ticket) => {
    try {
      const res = await updateInstitutionSupportTicketApi(ticket.id, {
        status: ticket.draftStatus,
        adminResponse: ticket.draftResponse,
      });
      if (res?.success) {
        toaster.create({ title: "Ticket updated", type: "success" });
        await loadTickets();
      }
    } catch {
      toaster.create({ title: "Failed to update ticket", type: "error" });
    }
  };

  return (
    <DashboardLayout>
      <Box
        p={{ base: 4, md: 8 }}
        pt={{ base: "84px", md: "88px" }}
        pl={{ base: 4, lg: "260px" }}
        maxW="1200px"
        mx="auto"
      >
        <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3}>
          <Box>
            <Text fontSize="24px" fontWeight="900" color="#0F172A" letterSpacing="-0.5px">
              Student Portal Content
            </Text>
            <Text fontSize="13px" color="#64748B">
              Publish announcements, timetables, resources, and respond to student tickets.
            </Text>
          </Box>
          <Button
            size="sm"
            variant="outline"
            borderColor="#CBD5E1"
            borderRadius="xl"
            fontWeight="700"
            fontSize="12px"
            loading={loading}
            onClick={loadCurrent}
          >
            <Icon as={FaSyncAlt} mr={2} boxSize={3} />
            Refresh
          </Button>
        </Flex>

        <Flex gap={2} mb={6} wrap="wrap">
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <Button
                key={item.id}
                size="sm"
                h="40px"
                px={4}
                borderRadius="xl"
                fontWeight="700"
                fontSize="13px"
                bg={active ? "#4338CA" : "white"}
                color={active ? "white" : "#475569"}
                border="1px solid"
                borderColor={active ? "#4338CA" : "#E2E8F0"}
                _hover={{ bg: active ? "#4338CA" : "#F8FAFC" }}
                onClick={() => setTab(item.id)}
              >
                <Icon as={item.icon} mr={2} boxSize={3.5} />
                {item.label}
              </Button>
            );
          })}
        </Flex>

        {/* Announcements */}
        {tab === "announcements" && (
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} alignItems="flex-start">
            <SectionCard>
              <Flex align="center" gap={2.5} mb={4}>
                <Icon as={FaPlus} color="#4338CA" boxSize={4} />
                <Text fontSize="16px" fontWeight="800" color="#0F172A">
                  {announcementForm.id ? "Edit Announcement" : "New Announcement"}
                </Text>
              </Flex>
              <form onSubmit={submitAnnouncement}>
                <Flex direction="column" gap={4}>
                  <Box>
                    <label style={labelStyle}>TITLE</label>
                    <input
                      style={inputStyle}
                      value={announcementForm.title}
                      onChange={(e) =>
                        setAnnouncementForm({ ...announcementForm, title: e.target.value })
                      }
                      placeholder="e.g. Mid-term break resumption"
                    />
                  </Box>
                  <Box>
                    <label style={labelStyle}>MESSAGE</label>
                    <textarea
                      rows={5}
                      style={{ ...inputStyle, height: "auto", padding: "12px 14px", resize: "vertical" }}
                      value={announcementForm.body}
                      onChange={(e) =>
                        setAnnouncementForm({ ...announcementForm, body: e.target.value })
                      }
                      placeholder="Write the full announcement..."
                    />
                  </Box>
                  <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                    <Box flex={1}>
                      <label style={labelStyle}>CATEGORY</label>
                      <select
                        style={{ ...inputStyle, padding: "0 12px" }}
                        value={announcementForm.category}
                        onChange={(e) =>
                          setAnnouncementForm({ ...announcementForm, category: e.target.value })
                        }
                      >
                        <option value="general">General</option>
                        <option value="fees">Fees</option>
                        <option value="exam">Exam</option>
                        <option value="event">Event</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </Box>
                    <Box flex={1}>
                      <label style={labelStyle}>AUDIENCE</label>
                      <select
                        style={{ ...inputStyle, padding: "0 12px" }}
                        value={announcementForm.audience}
                        onChange={(e) =>
                          setAnnouncementForm({ ...announcementForm, audience: e.target.value })
                        }
                      >
                        <option value="all">Whole School</option>
                        <option value="class">Specific Class</option>
                      </select>
                    </Box>
                  </Flex>
                  {announcementForm.audience === "class" && (
                    <Box>
                      <label style={labelStyle}>CLASS</label>
                      <select
                        style={{ ...inputStyle, padding: "0 12px" }}
                        value={announcementForm.classArmId}
                        onChange={(e) =>
                          setAnnouncementForm({ ...announcementForm, classArmId: e.target.value })
                        }
                      >
                        <option value="">Select a class...</option>
                        {classArms.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </Box>
                  )}
                  <Flex gap={3}>
                    <Button
                      type="submit"
                      flex={1}
                      h="44px"
                      bg="#4338CA"
                      color="white"
                      borderRadius="xl"
                      fontWeight="700"
                      loading={saving}
                    >
                      <Icon as={FaSave} mr={2} boxSize={3.5} />
                      {announcementForm.id ? "Update" : "Publish"}
                    </Button>
                    {announcementForm.id && (
                      <Button
                        variant="outline"
                        h="44px"
                        borderRadius="xl"
                        borderColor="#CBD5E1"
                        onClick={() => setAnnouncementForm(emptyAnnouncement)}
                      >
                        Cancel
                      </Button>
                    )}
                  </Flex>
                </Flex>
              </form>
            </SectionCard>

            <SectionCard>
              <Text fontSize="16px" fontWeight="800" color="#0F172A" mb={4}>
                Published ({announcements.length})
              </Text>
              {announcements.length === 0 ? (
                <Flex direction="column" align="center" py={8} color="#94A3B8" gap={2}>
                  <Icon as={FaInbox} boxSize={6} />
                  <Text fontSize="13px">No announcements published yet.</Text>
                </Flex>
              ) : (
                <Flex direction="column" gap={3}>
                  {announcements.map((a) => (
                    <Box key={a.id} p={4} borderRadius="xl" border="1px solid #E2E8F0" bg="#F8FAFC">
                      <Flex justify="space-between" align="flex-start" gap={3}>
                        <Box minW={0}>
                          <Text fontSize="14px" fontWeight="800" color="#0F172A">
                            {a.title}
                          </Text>
                          <Flex gap={2} mt={1} wrap="wrap">
                            <Badge bg="#EEF2FF" color="#4338CA" px={2} py={0.5} borderRadius="full" fontSize="10px" fontWeight="800">
                              {a.category}
                            </Badge>
                            <Badge bg="#F1F5F9" color="#475569" px={2} py={0.5} borderRadius="full" fontSize="10px" fontWeight="700">
                              {a.audience === "class" ? classArmName(a.classArmId) : "Whole School"}
                            </Badge>
                            {a.pinned && (
                              <Badge bg="#FEF3C7" color="#92400E" px={2} py={0.5} borderRadius="full" fontSize="10px" fontWeight="800">
                                PINNED
                              </Badge>
                            )}
                          </Flex>
                        </Box>
                        <Flex gap={1}>
                          <Button
                            size="xs"
                            variant="ghost"
                            color="#4338CA"
                            onClick={() => setAnnouncementForm({
                              id: a.id,
                              title: a.title,
                              body: a.body,
                              category: a.category || "general",
                              audience: a.audience || "all",
                              classArmId: a.classArmId || "",
                              pinned: !!a.pinned,
                            })}
                          >
                            <Icon as={FaEdit} boxSize={3} />
                          </Button>
                          <Button size="xs" variant="ghost" color="#EF4444" onClick={() => removeAnnouncement(a.id)}>
                            <Icon as={FaTrash} boxSize={3} />
                          </Button>
                        </Flex>
                      </Flex>
                      <Text fontSize="12px" color="#64748B" mt={2} noOfLines={2}>
                        {a.body}
                      </Text>
                    </Box>
                  ))}
                </Flex>
              )}
            </SectionCard>
          </SimpleGrid>
        )}

        {/* Timetable */}
        {tab === "timetable" && (
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} alignItems="flex-start">
            <SectionCard>
              <Flex align="center" gap={2.5} mb={4}>
                <Icon as={FaPlus} color="#4338CA" boxSize={4} />
                <Text fontSize="16px" fontWeight="800" color="#0F172A">
                  {lessonForm.id ? "Edit Lesson" : "Add Lesson"}
                </Text>
              </Flex>
              <form onSubmit={submitLesson}>
                <Flex direction="column" gap={4}>
                  <Box>
                    <label style={labelStyle}>CLASS</label>
                    <select
                      style={{ ...inputStyle, padding: "0 12px" }}
                      value={lessonForm.classArmId}
                      onChange={(e) => setLessonForm({ ...lessonForm, classArmId: e.target.value })}
                    >
                      <option value="">All Classes</option>
                      {classArms.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </Box>
                  <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                    <Box flex={1}>
                      <label style={labelStyle}>DAY</label>
                      <select
                        style={{ ...inputStyle, padding: "0 12px" }}
                        value={lessonForm.dayOfWeek}
                        onChange={(e) => setLessonForm({ ...lessonForm, dayOfWeek: e.target.value })}
                      >
                        {DAYS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </Box>
                    <Box flex={1}>
                      <label style={labelStyle}>SUBJECT</label>
                      <input
                        style={inputStyle}
                        value={lessonForm.subject}
                        onChange={(e) => setLessonForm({ ...lessonForm, subject: e.target.value })}
                        placeholder="e.g. Mathematics"
                      />
                    </Box>
                  </Flex>
                  <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                    <Box flex={1}>
                      <label style={labelStyle}>START TIME</label>
                      <input
                        type="time"
                        style={inputStyle}
                        value={lessonForm.startTime}
                        onChange={(e) => setLessonForm({ ...lessonForm, startTime: e.target.value })}
                      />
                    </Box>
                    <Box flex={1}>
                      <label style={labelStyle}>END TIME</label>
                      <input
                        type="time"
                        style={inputStyle}
                        value={lessonForm.endTime}
                        onChange={(e) => setLessonForm({ ...lessonForm, endTime: e.target.value })}
                      />
                    </Box>
                  </Flex>
                  <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                    <Box flex={1}>
                      <label style={labelStyle}>TEACHER</label>
                      <input
                        style={inputStyle}
                        value={lessonForm.teacherName}
                        onChange={(e) => setLessonForm({ ...lessonForm, teacherName: e.target.value })}
                        placeholder="e.g. Mr. Bello"
                      />
                    </Box>
                    <Box flex={1}>
                      <label style={labelStyle}>VENUE</label>
                      <input
                        style={inputStyle}
                        value={lessonForm.venue}
                        onChange={(e) => setLessonForm({ ...lessonForm, venue: e.target.value })}
                        placeholder="e.g. Lab 2"
                      />
                    </Box>
                  </Flex>
                  <Flex gap={3}>
                    <Button type="submit" flex={1} h="44px" bg="#4338CA" color="white" borderRadius="xl" fontWeight="700" loading={saving}>
                      <Icon as={FaSave} mr={2} boxSize={3.5} />
                      {lessonForm.id ? "Update Lesson" : "Add Lesson"}
                    </Button>
                    {lessonForm.id && (
                      <Button variant="outline" h="44px" borderRadius="xl" borderColor="#CBD5E1" onClick={() => setLessonForm(emptyLesson)}>
                        Cancel
                      </Button>
                    )}
                  </Flex>
                </Flex>
              </form>
            </SectionCard>

            <SectionCard>
              <Text fontSize="16px" fontWeight="800" color="#0F172A" mb={4}>
                Timetable ({lessons.length} lessons)
              </Text>
              {lessons.length === 0 ? (
                <Flex direction="column" align="center" py={8} color="#94A3B8" gap={2}>
                  <Icon as={FaInbox} boxSize={6} />
                  <Text fontSize="13px">No timetable entries yet.</Text>
                </Flex>
              ) : (
                <Flex direction="column" gap={2}>
                  {DAYS.filter((d) => lessons.some((l) => l.dayOfWeek === d)).map((day) => (
                    <Box key={day} mb={2}>
                      <Text fontSize="12px" fontWeight="800" color="#4338CA" mb={2}>
                        {day.toUpperCase()}
                      </Text>
                      <Flex direction="column" gap={2}>
                        {lessons
                          .filter((l) => l.dayOfWeek === day)
                          .map((l) => (
                            <Flex
                              key={l.id}
                              align="center"
                              justify="space-between"
                              p={3}
                              borderRadius="xl"
                              border="1px solid #E2E8F0"
                              bg="#F8FAFC"
                              gap={3}
                            >
                              <Box minW={0}>
                                <Text fontSize="13px" fontWeight="800" color="#0F172A">
                                  {l.startTime || "—"} {l.endTime ? `- ${l.endTime}` : ""} • {l.subject}
                                </Text>
                                <Text fontSize="11px" color="#64748B">
                                  {l.ClassArm?.name || classArmName(l.classArmId)}
                                  {l.teacherName ? ` • ${l.teacherName}` : ""}
                                  {l.venue ? ` • ${l.venue}` : ""}
                                </Text>
                              </Box>
                              <Flex gap={1} flexShrink={0}>
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  color="#4338CA"
                                  onClick={() =>
                                    setLessonForm({
                                      id: l.id,
                                      classArmId: l.classArmId || "",
                                      dayOfWeek: l.dayOfWeek,
                                      startTime: l.startTime || "",
                                      endTime: l.endTime || "",
                                      subject: l.subject,
                                      teacherName: l.teacherName || "",
                                      venue: l.venue || "",
                                    })
                                  }
                                >
                                  <Icon as={FaEdit} boxSize={3} />
                                </Button>
                                <Button size="xs" variant="ghost" color="#EF4444" onClick={() => removeLesson(l.id)}>
                                  <Icon as={FaTrash} boxSize={3} />
                                </Button>
                              </Flex>
                            </Flex>
                          ))}
                      </Flex>
                    </Box>
                  ))}
                </Flex>
              )}
            </SectionCard>
          </SimpleGrid>
        )}

        {/* Resources */}
        {tab === "resources" && (
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} alignItems="flex-start">
            <SectionCard>
              <Flex align="center" gap={2.5} mb={4}>
                <Icon as={FaPlus} color="#4338CA" boxSize={4} />
                <Text fontSize="16px" fontWeight="800" color="#0F172A">
                  {resourceForm.id ? "Edit Resource" : "New Resource"}
                </Text>
              </Flex>
              <form onSubmit={submitResource}>
                <Flex direction="column" gap={4}>
                  <Box>
                    <label style={labelStyle}>TITLE</label>
                    <input
                      style={inputStyle}
                      value={resourceForm.title}
                      onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                      placeholder="e.g. SS2 Physics — Waves notes"
                    />
                  </Box>
                  <Box>
                    <label style={labelStyle}>URL / LINK</label>
                    <input
                      style={inputStyle}
                      value={resourceForm.url}
                      onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                      placeholder="https://..."
                    />
                  </Box>
                  <Box>
                    <label style={labelStyle}>DESCRIPTION</label>
                    <textarea
                      rows={3}
                      style={{ ...inputStyle, height: "auto", padding: "12px 14px", resize: "vertical" }}
                      value={resourceForm.description}
                      onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                      placeholder="Short description for students"
                    />
                  </Box>
                  <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                    <Box flex={1}>
                      <label style={labelStyle}>SUBJECT</label>
                      <input
                        style={inputStyle}
                        value={resourceForm.subject}
                        onChange={(e) => setResourceForm({ ...resourceForm, subject: e.target.value })}
                        placeholder="e.g. Physics"
                      />
                    </Box>
                    <Box flex={1}>
                      <label style={labelStyle}>TYPE</label>
                      <select
                        style={{ ...inputStyle, padding: "0 12px" }}
                        value={resourceForm.type}
                        onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                      >
                        <option value="link">Link</option>
                        <option value="document">Document</option>
                        <option value="video">Video</option>
                        <option value="past_questions">Past Questions</option>
                      </select>
                    </Box>
                  </Flex>
                  <Box>
                    <label style={labelStyle}>CLASS</label>
                    <select
                      style={{ ...inputStyle, padding: "0 12px" }}
                      value={resourceForm.classArmId}
                      onChange={(e) => setResourceForm({ ...resourceForm, classArmId: e.target.value })}
                    >
                      <option value="">All Classes</option>
                      {classArms.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </Box>
                  <Flex gap={3}>
                    <Button type="submit" flex={1} h="44px" bg="#4338CA" color="white" borderRadius="xl" fontWeight="700" loading={saving}>
                      <Icon as={FaSave} mr={2} boxSize={3.5} />
                      {resourceForm.id ? "Update" : "Publish"}
                    </Button>
                    {resourceForm.id && (
                      <Button variant="outline" h="44px" borderRadius="xl" borderColor="#CBD5E1" onClick={() => setResourceForm(emptyResource)}>
                        Cancel
                      </Button>
                    )}
                  </Flex>
                </Flex>
              </form>
            </SectionCard>

            <SectionCard>
              <Text fontSize="16px" fontWeight="800" color="#0F172A" mb={4}>
                Published ({resources.length})
              </Text>
              {resources.length === 0 ? (
                <Flex direction="column" align="center" py={8} color="#94A3B8" gap={2}>
                  <Icon as={FaInbox} boxSize={6} />
                  <Text fontSize="13px">No resources published yet.</Text>
                </Flex>
              ) : (
                <Flex direction="column" gap={3}>
                  {resources.map((r) => (
                    <Box key={r.id} p={4} borderRadius="xl" border="1px solid #E2E8F0" bg="#F8FAFC">
                      <Flex justify="space-between" align="flex-start" gap={3}>
                        <Box minW={0}>
                          <Text fontSize="14px" fontWeight="800" color="#0F172A">
                            {r.title}
                          </Text>
                          <Flex gap={2} mt={1} wrap="wrap">
                            <Badge bg="#EEF2FF" color="#4338CA" px={2} py={0.5} borderRadius="full" fontSize="10px" fontWeight="800">
                              {r.type}
                            </Badge>
                            <Badge bg="#F1F5F9" color="#475569" px={2} py={0.5} borderRadius="full" fontSize="10px" fontWeight="700">
                              {r.subject || "General"}
                            </Badge>
                            <Badge bg="#ECFDF5" color="#065F46" px={2} py={0.5} borderRadius="full" fontSize="10px" fontWeight="700">
                              {r.ClassArm?.name || classArmName(r.classArmId)}
                            </Badge>
                          </Flex>
                        </Box>
                        <Flex gap={1}>
                          <Button as="a" href={r.url} target="_blank" rel="noopener noreferrer" size="xs" variant="ghost" color="#4338CA">
                            <Icon as={FaExternalLinkAlt} boxSize={3} />
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            color="#4338CA"
                            onClick={() =>
                              setResourceForm({
                                id: r.id,
                                title: r.title,
                                url: r.url,
                                description: r.description || "",
                                subject: r.subject || "",
                                type: r.type || "link",
                                classArmId: r.classArmId || "",
                              })
                            }
                          >
                            <Icon as={FaEdit} boxSize={3} />
                          </Button>
                          <Button size="xs" variant="ghost" color="#EF4444" onClick={() => removeResource(r.id)}>
                            <Icon as={FaTrash} boxSize={3} />
                          </Button>
                        </Flex>
                      </Flex>
                    </Box>
                  ))}
                </Flex>
              )}
            </SectionCard>
          </SimpleGrid>
        )}

        {/* Support Tickets */}
        {tab === "tickets" && (
          <>
            <Flex gap={2} mb={5} wrap="wrap">
              {["all", "open", "in_progress", "resolved", "closed"].map((value) => {
                const active = ticketFilter === value;
                return (
                  <Button
                    key={value}
                    size="sm"
                    h="34px"
                    borderRadius="full"
                    fontWeight="700"
                    fontSize="12px"
                    textTransform="capitalize"
                    bg={active ? "#4338CA" : "white"}
                    color={active ? "white" : "#475569"}
                    border="1px solid"
                    borderColor={active ? "#4338CA" : "#E2E8F0"}
                    onClick={() => setTicketFilter(value)}
                  >
                    {value === "all" ? "All" : value.replace("_", " ")}
                  </Button>
                );
              })}
            </Flex>

            {visibleTickets.length === 0 ? (
              <SectionCard>
                <Flex direction="column" align="center" py={8} color="#94A3B8" gap={2}>
                  <Icon as={FaInbox} boxSize={6} />
                  <Text fontSize="13px">No support tickets in this view.</Text>
                </Flex>
              </SectionCard>
            ) : (
              <Flex direction="column" gap={4}>
                {visibleTickets.map((ticket) => (
                  <SectionCard key={ticket.id}>
                    <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap" mb={3}>
                      <Box minW={0}>
                        <Text fontSize="15px" fontWeight="800" color="#0F172A">
                          {ticket.subject}
                        </Text>
                        <Text fontSize="12px" color="#64748B" mt={0.5}>
                          {ticket.student?.name} ({ticket.student?.studentCode}) •{" "}
                          {ticket.student?.classArm} • {ticket.category}
                        </Text>
                        <Text fontSize="11px" color="#94A3B8" mt={0.5}>
                          Submitted{" "}
                          {ticket.createdAt
                            ? new Date(ticket.createdAt).toLocaleString()
                            : ""}
                        </Text>
                      </Box>
                      <Badge
                        bg="#FEF3C7"
                        color="#92400E"
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontWeight="800"
                        fontSize="11px"
                        textTransform="uppercase"
                      >
                        {ticket.status.replace("_", " ")}
                      </Badge>
                    </Flex>

                    <Box p={3} borderRadius="xl" bg="#F8FAFC" border="1px solid #E2E8F0" mb={3}>
                      <Text fontSize="13px" color="#334155" lineHeight="1.6" whiteSpace="pre-wrap">
                        {ticket.message}
                      </Text>
                    </Box>

                    <Flex gap={4} direction={{ base: "column", md: "row" }} align="flex-end">
                      <Box flex={1} w="100%">
                        <label style={labelStyle}>RESPONSE</label>
                        <textarea
                          rows={3}
                          style={{ ...inputStyle, height: "auto", padding: "12px 14px", resize: "vertical" }}
                          value={ticket.draftResponse}
                          onChange={(e) =>
                            setTickets((prev) =>
                              prev.map((t) =>
                                t.id === ticket.id
                                  ? { ...t, draftResponse: e.target.value }
                                  : t
                              )
                            )
                          }
                          placeholder="Type a response for the student..."
                        />
                      </Box>
                      <Box w={{ base: "100%", md: "180px" }}>
                        <label style={labelStyle}>STATUS</label>
                        <select
                          style={{ ...inputStyle, padding: "0 12px" }}
                          value={ticket.draftStatus}
                          onChange={(e) =>
                            setTickets((prev) =>
                              prev.map((t) =>
                                t.id === ticket.id
                                  ? { ...t, draftStatus: e.target.value }
                                  : t
                              )
                            )
                          }
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </Box>
                      <Button
                        h="44px"
                        px={5}
                        bg="#10B981"
                        color="white"
                        borderRadius="xl"
                        fontWeight="700"
                        onClick={() => saveTicket(ticket)}
                      >
                        <Icon as={FaSave} mr={2} boxSize={3.5} />
                        Save
                      </Button>
                    </Flex>
                  </SectionCard>
                ))}
              </Flex>
            )}
          </>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default PortalContentManager;
