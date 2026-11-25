import { Box, Flex, Text, Badge, Button, Icon } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { FaBookOpen } from "react-icons/fa";
import { useAuth } from "../../libs/AuthProvider";
import { getMyTeachingAssignmentsApi } from "../../api-endpoint/institution/teachingAssignments";

export default function TeachingAssignments() {
  const { user, loading } = useAuth();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: ["teaching-assignments", user?._id, user?.institutionId],
    queryFn: async () => {
      const response = await getMyTeachingAssignmentsApi();
      if (!response.success || !response.data) {
        throw new Error(response.message || "Unable to load teaching assignments.");
      }
      return response.data;
    },
    enabled: !loading && user?.role === "teacher" && Boolean(user?.institutionId),
    retry: false,
  });

  if (user?.role !== "teacher") return null;
  if (!user?.institutionId) {
    return (
      <Box mb={5} p={4} bg="white" border="1px solid #E2E8F0" borderRadius="2xl">
        {loading ? <Text role="status">Loading teaching assignments...</Text> : (
          <>
            <Text fontWeight="800" color="#334155">Not Assigned</Text>
            <Text fontSize="13px" color="#64748B" mt={1}>Current Session: Not configured</Text>
            <Text fontSize="13px" color="#64748B" mt={1}>
              Your account is not linked to a school. A school administrator must enroll you and approve your teaching assignments.
            </Text>
          </>
        )}
      </Box>
    );
  }

  const classes = data?.classes || [];
  const subjectAssignments = data?.subjectAssignments || [];
  const teachingStatus = classes.length && subjectAssignments.length
    ? "Both"
    : classes.length ? "Class Teacher" : subjectAssignments.length ? "Subject Teacher" : "Not Assigned";

  return (
    <Box mb={5} p={{ base: 4, md: 5 }} bg="white" border="1px solid #E2E8F0" borderRadius="2xl">
      <Flex gap={3} align="flex-start" justify="space-between" wrap="wrap" mb={3}>
        <Flex gap={3} align="center">
          <Icon as={FaBookOpen} color="#4338CA" boxSize={5} />
          <Box>
            <Text as="h2" fontSize="16px" fontWeight="800" color="#0F172A">My Teaching Assignments</Text>
            <Text fontSize="12px" color="#64748B">
              School-admin approved
            </Text>
          </Box>
        </Flex>
        <Badge bg="#EEF2FF" color="#4338CA" borderRadius="full" px={3} py={1}>Read Only</Badge>
      </Flex>
      <Text fontSize="12px" color="#64748B" mb={4}>
        Only your school administrator can assign or change your classes and subjects. Contact them if a correction is needed.
      </Text>
      {loading || isPending ? (
        <Text role="status" fontSize="13px" color="#64748B">Loading teaching assignments...</Text>
      ) : error ? (
        <Box role="alert" p={3} bg="#FEF2F2" borderRadius="xl">
          <Text fontSize="13px" color="#B91C1C" mb={2}>
            {error.response?.data?.message || error.message || "Unable to load teaching assignments."}
          </Text>
          <Button size="sm" variant="outline" onClick={() => refetch()} loading={isFetching}>Retry</Button>
        </Box>
      ) : (
        <>
          <Flex gap={3} wrap="wrap" align="center" mb={4}>
            <Badge bg="#EEF2FF" color="#4338CA" borderRadius="full" px={3} py={1}>
              {teachingStatus}
            </Badge>
            <Text fontSize="13px" color="#64748B">
              Current Session: {data?.academicSession || data?.session || "Not configured"}
            </Text>
          </Flex>
          {!classes.length && !subjectAssignments.length ? (
            <Box p={4} bg="#F8FAFC" borderRadius="xl" border="1px dashed #CBD5E1">
              <Text fontSize="14px" fontWeight="700" color="#334155">No teaching assignments yet</Text>
              <Text fontSize="12px" color="#64748B" mt={1}>
                Your school administrator must assign you as a class teacher or subject teacher before you can access assigned report-card work.
              </Text>
            </Box>
          ) : (
            <Flex direction={{ base: "column", md: "row" }} gap={4}>
              <Box flex={1} minW={0} p={4} bg="#F8FAFC" borderRadius="xl">
                <Text fontSize="13px" fontWeight="800" color="#334155" mb={2}>Class Teacher</Text>
                {classes.length ? (
                  <Flex gap={2} wrap="wrap">
                    {classes.map((classArm) => (
                      <Badge key={classArm.id} bg="#EEF2FF" color="#4338CA" px={3} py={1} borderRadius="lg" whiteSpace="normal">
                        {classArm.name}
                      </Badge>
                    ))}
                  </Flex>
                ) : <Text fontSize="12px" color="#64748B">No class-teacher assignment.</Text>}
              </Box>
              <Box flex={1} minW={0} p={4} bg="#F8FAFC" borderRadius="xl">
                <Text fontSize="13px" fontWeight="800" color="#334155" mb={2}>Subject Teacher</Text>
                {subjectAssignments.length ? (
                  <Flex direction="column" gap={2}>
                    {subjectAssignments.map((assignment) => (
                      <Text key={`${assignment.classArmId}:${assignment.subjectId}`} fontSize="13px" color="#334155" overflowWrap="anywhere">
                        <Box as="span" fontWeight="700">{assignment.Subject?.name || "Assigned subject"}</Box>
                        {" | "}{assignment.ClassArm?.name || "Assigned class"}
                      </Text>
                    ))}
                  </Flex>
                ) : <Text fontSize="12px" color="#64748B">No subject-teacher assignments.</Text>}
              </Box>
            </Flex>
          )}
        </>
      )}
    </Box>
  );
}
