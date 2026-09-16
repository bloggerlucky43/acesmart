import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Icon,
  Badge,
  SimpleGrid,
  Button,
} from "@chakra-ui/react";
import { FaClipboardList, FaSyncAlt, FaClock, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import StudentPageHeading from "../../components/student/StudentPageHeading";
import {
  PortalCard,
  PortalLoader,
  PortalEmpty,
} from "../../components/student/StudentPortalPrimitives";
import { useStudentPortal } from "../../libs/StudentPortalProvider";
import { getStudentTimetableApi } from "../../api-endpoint/sms/portalEndpoints";

const JS_DAY_TO_NAME = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const StudentTimetable = () => {
  const { student, institution } = useStudentPortal();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentId = student?.id;
  const todayName = JS_DAY_TO_NAME[new Date().getDay()];

  const load = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await getStudentTimetableApi(studentId);
      if (res?.success) setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  const days = data?.days || [];

  return (
    <Box>
      <StudentPageHeading
        title="Class Timetable"
        description="Your weekly lesson schedule with subject, time, and venue."
        icon={FaClipboardList}
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

      {loading && !data ? (
        <PortalLoader label="Loading your timetable..." />
      ) : days.length === 0 ? (
        <PortalEmpty
          icon={FaClipboardList}
          title="No timetable published yet"
          description={
            student?.classArm && student.classArm !== "Unassigned"
              ? `Your school has not published a timetable for ${student.classArm} yet. It will appear here automatically.`
              : "Once the school publishes your class timetable, your weekly lessons will appear here."
          }
        />
      ) : (
        <>
          <Flex align="center" gap={2} mb={5} wrap="wrap">
            <Badge
              bg="#EEF2FF"
              color="#4338CA"
              px={3}
              py={1.5}
              borderRadius="full"
              fontWeight="800"
              fontSize="11px"
            >
              {data?.term || institution?.currentTerm || "CURRENT TERM"}
            </Badge>
            {data?.session && (
              <Badge
                bg="#F1F5F9"
                color="#475569"
                px={3}
                py={1.5}
                borderRadius="full"
                fontWeight="800"
                fontSize="11px"
              >
                {data.session}
              </Badge>
            )}
          </Flex>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>
            {days.map((day) => {
              const isToday = day.day === todayName;
              return (
                <PortalCard
                  key={day.day}
                  borderColor={isToday ? "#C7D2FE" : "#E2E8F0"}
                  borderWidth={isToday ? "1.5px" : "1px"}
                >
                  <Flex align="center" justify="space-between" mb={4}>
                    <Text fontSize="15px" fontWeight="900" color="#0F172A">
                      {day.day}
                    </Text>
                    {isToday && (
                      <Badge
                        bg="#4338CA"
                        color="white"
                        px={2.5}
                        py={0.5}
                        borderRadius="full"
                        fontWeight="800"
                        fontSize="10px"
                      >
                        TODAY
                      </Badge>
                    )}
                  </Flex>

                  <Flex direction="column" gap={2.5}>
                    {day.lessons.map((lesson) => (
                      <Flex
                        key={lesson.id}
                        align="center"
                        gap={3}
                        p={3}
                        borderRadius="xl"
                        bg="#F8FAFC"
                        border="1px solid #F1F5F9"
                      >
                        <Flex
                          direction="column"
                          align="center"
                          justify="center"
                          w="64px"
                          flexShrink={0}
                          borderRadius="lg"
                          bg="white"
                          border="1px solid #E2E8F0"
                          py={1.5}
                        >
                          <Text fontSize="12px" fontWeight="800" color="#4338CA">
                            {lesson.startTime || "—"}
                          </Text>
                          <Text fontSize="10px" color="#94A3B8">
                            {lesson.endTime ? `to ${lesson.endTime}` : ""}
                          </Text>
                        </Flex>

                        <Box flex={1} minW={0}>
                          <Text fontSize="14px" fontWeight="800" color="#0F172A" isTruncated>
                            {lesson.subject}
                          </Text>
                          <Flex align="center" gap={3} mt={0.5} wrap="wrap">
                            {lesson.teacherName && (
                              <Flex align="center" gap={1} color="#64748B">
                                <Icon as={FaUser} boxSize={2.5} />
                                <Text fontSize="11px">{lesson.teacherName}</Text>
                              </Flex>
                            )}
                            {lesson.venue && (
                              <Flex align="center" gap={1} color="#64748B">
                                <Icon as={FaMapMarkerAlt} boxSize={2.5} />
                                <Text fontSize="11px">{lesson.venue}</Text>
                              </Flex>
                            )}
                          </Flex>
                        </Box>
                      </Flex>
                    ))}
                  </Flex>
                </PortalCard>
              );
            })}
          </SimpleGrid>

          <Flex align="center" gap={2} mt={4} color="#94A3B8" fontSize="11px">
            <Icon as={FaClock} boxSize={3} />
            <Text>Times are shown in 24-hour format where provided by the school.</Text>
          </Flex>
        </>
      )}
    </Box>
  );
};

export default StudentTimetable;
