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
  FaBook,
  FaSyncAlt,
  FaExternalLinkAlt,
  FaFileAlt,
  FaPlayCircle,
  FaLink,
  FaQuestionCircle,
} from "react-icons/fa";
import StudentPageHeading from "../../components/student/StudentPageHeading";
import {
  PortalCard,
  PortalLoader,
  PortalEmpty,
} from "../../components/student/StudentPortalPrimitives";
import { useStudentPortal } from "../../libs/StudentPortalProvider";
import { getStudentResourcesApi } from "../../api-endpoint/sms/portalEndpoints";

const TYPE_META = {
  document: { icon: FaFileAlt, bg: "#EEF2FF", color: "#4338CA", label: "Document" },
  video: { icon: FaPlayCircle, bg: "#FEF2F2", color: "#991B1B", label: "Video" },
  past_questions: {
    icon: FaQuestionCircle,
    bg: "#FEF3C7",
    color: "#92400E",
    label: "Past Questions",
  },
  link: { icon: FaLink, bg: "#ECFDF5", color: "#065F46", label: "Link" },
};

const FILTERS = ["all", "document", "video", "past_questions", "link"];

const StudentResources = () => {
  const { student } = useStudentPortal();
  const [resources, setResources] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const studentId = student?.id;

  const load = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await getStudentResourcesApi(studentId);
      if (res?.success) setResources(res.data || []);
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () => (filter === "all" ? resources : resources.filter((r) => r.type === filter)),
    [resources, filter]
  );

  return (
    <Box>
      <StudentPageHeading
        title="Study Resources"
        description="Shared notes, past questions, and material from your teachers."
        icon={FaBook}
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
          const label = value === "all" ? "All" : TYPE_META[value]?.label || value;
          return (
            <Button
              key={value}
              size="sm"
              h="34px"
              borderRadius="full"
              fontWeight="700"
              fontSize="12px"
              bg={active ? "#4338CA" : "white"}
              color={active ? "white" : "#475569"}
              border="1px solid"
              borderColor={active ? "#4338CA" : "#E2E8F0"}
              _hover={{ bg: active ? "#4338CA" : "#F8FAFC" }}
              onClick={() => setFilter(value)}
            >
              {label}
            </Button>
          );
        })}
      </Flex>

      {loading && resources.length === 0 ? (
        <PortalLoader label="Loading study resources..." />
      ) : visible.length === 0 ? (
        <PortalEmpty
          icon={FaBook}
          title="No resources published yet"
          description="Lesson notes, past questions, and reading material shared by your teachers will show up here."
        />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          {visible.map((resource) => {
            const meta = TYPE_META[resource.type] || TYPE_META.link;
            return (
              <PortalCard key={resource.id} display="flex" flexDirection="column">
                <Flex align="flex-start" gap={3} mb={3}>
                  <Flex
                    w="40px"
                    h="40px"
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
                    <Text fontSize="15px" fontWeight="800" color="#0F172A">
                      {resource.title}
                    </Text>
                    <Flex gap={2} mt={1} wrap="wrap">
                      <Badge
                        bg={meta.bg}
                        color={meta.color}
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        fontWeight="800"
                        fontSize="10px"
                      >
                        {meta.label}
                      </Badge>
                      <Badge
                        bg="#F1F5F9"
                        color="#475569"
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        fontWeight="700"
                        fontSize="10px"
                      >
                        {resource.subject}
                      </Badge>
                    </Flex>
                  </Box>
                </Flex>

                {resource.description && (
                  <Text fontSize="13px" color="#64748B" lineHeight="1.6" flex={1} mb={4}>
                    {resource.description}
                  </Text>
                )}

                <Button
                  as="a"
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  mt="auto"
                  h="40px"
                  bg="#4338CA"
                  color="white"
                  borderRadius="xl"
                  fontWeight="700"
                  fontSize="13px"
                  _hover={{ opacity: 0.95 }}
                >
                  <Icon as={FaExternalLinkAlt} mr={2} boxSize={3} />
                  Open Resource
                </Button>
              </PortalCard>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default StudentResources;
