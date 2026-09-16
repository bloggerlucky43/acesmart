import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Flex, Text, Icon, Badge, Button } from "@chakra-ui/react";
import {
  FaBell,
  FaSyncAlt,
  FaThumbtack,
  FaBullhorn,
  FaMoneyBillWave,
  FaFileAlt,
  FaCalendarDay,
  FaUsers,
} from "react-icons/fa";
import StudentPageHeading from "../../components/student/StudentPageHeading";
import {
  PortalCard,
  PortalLoader,
  PortalEmpty,
} from "../../components/student/StudentPortalPrimitives";
import { useStudentPortal } from "../../libs/StudentPortalProvider";
import { getStudentAnnouncementsApi } from "../../api-endpoint/sms/portalEndpoints";

const CATEGORY_META = {
  fees: { icon: FaMoneyBillWave, bg: "#FEF3C7", color: "#92400E" },
  exam: { icon: FaFileAlt, bg: "#EEF2FF", color: "#4338CA" },
  event: { icon: FaCalendarDay, bg: "#ECFDF5", color: "#065F46" },
  urgent: { icon: FaBullhorn, bg: "#FEF2F2", color: "#991B1B" },
  general: { icon: FaBell, bg: "#F1F5F9", color: "#475569" },
};

const FILTERS = ["all", "general", "fees", "exam", "event", "urgent"];

const StudentAnnouncements = () => {
  const { student } = useStudentPortal();
  const [announcements, setAnnouncements] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const studentId = student?.id;

  const load = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await getStudentAnnouncementsApi(studentId);
      if (res?.success) setAnnouncements(res.data || []);
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () =>
      filter === "all"
        ? announcements
        : announcements.filter((a) => (a.category || "general") === filter),
    [announcements, filter]
  );

  return (
    <Box>
      <StudentPageHeading
        title="Announcements & Notices"
        description="School-wide notices, fee deadlines, and class updates."
        icon={FaBell}
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

      <Flex gap={2} mb={5} wrap="wrap">
        {FILTERS.map((value) => {
          const active = filter === value;
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
              _hover={{ bg: active ? "#4338CA" : "#F8FAFC" }}
              onClick={() => setFilter(value)}
            >
              {value === "all" ? "All" : value}
            </Button>
          );
        })}
      </Flex>

      {loading && announcements.length === 0 ? (
        <PortalLoader label="Loading announcements..." />
      ) : visible.length === 0 ? (
        <PortalEmpty
          icon={FaBell}
          title="No announcements to show"
          description="When your school publishes a notice or event for your class, it will appear here."
        />
      ) : (
        <Flex direction="column" gap={3}>
          {visible.map((item) => {
            const meta = CATEGORY_META[item.category] || CATEGORY_META.general;
            return (
              <PortalCard
                key={item.id}
                borderLeft={item.pinned ? "4px solid #4338CA" : undefined}
              >
                <Flex align="flex-start" gap={4} direction={{ base: "column", sm: "row" }}>
                  <Flex
                    w="42px"
                    h="42px"
                    borderRadius="xl"
                    bg={meta.bg}
                    color={meta.color}
                    align="center"
                    justify="center"
                    flexShrink={0}
                  >
                    <Icon as={meta.icon} boxSize={4} />
                  </Flex>

                  <Box flex={1} minW={0}>
                    <Flex align="center" gap={2} wrap="wrap" mb={1}>
                      <Text fontSize="15px" fontWeight="800" color="#0F172A">
                        {item.title}
                      </Text>
                      {item.pinned && (
                        <Badge
                          bg="#EEF2FF"
                          color="#4338CA"
                          px={2}
                          py={0.5}
                          borderRadius="full"
                          fontWeight="800"
                          fontSize="10px"
                        >
                          <Icon as={FaThumbtack} mr={1} boxSize={2} />
                          PINNED
                        </Badge>
                      )}
                      <Badge
                        bg={meta.bg}
                        color={meta.color}
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        fontWeight="800"
                        fontSize="10px"
                        textTransform="uppercase"
                      >
                        {item.category}
                      </Badge>
                      {item.audience === "class" && item.classArm && (
                        <Badge
                          bg="#F1F5F9"
                          color="#475569"
                          px={2}
                          py={0.5}
                          borderRadius="full"
                          fontWeight="700"
                          fontSize="10px"
                        >
                          <Icon as={FaUsers} mr={1} boxSize={2} />
                          {item.classArm}
                        </Badge>
                      )}
                    </Flex>

                    <Text fontSize="13px" color="#334155" lineHeight="1.7" whiteSpace="pre-wrap">
                      {item.body}
                    </Text>

                    <Text fontSize="11px" color="#94A3B8" mt={2}>
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : ""}
                    </Text>
                  </Box>
                </Flex>
              </PortalCard>
            );
          })}
        </Flex>
      )}
    </Box>
  );
};

export default StudentAnnouncements;
