import {
  Box,
  Table,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
  Input,
} from "@chakra-ui/react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TableSkeleton } from "../ui/skeletons";
import {
  activateStudent,
  deactivateStudent,
  deleteStudent,
  fetchStudent,
} from "../../api-endpoint/student/students";
import { formatStudentFullName, formatStudentName } from "../../libs/helper";
import {
  FaUserEdit,
  FaSearch,
  FaCheck,
  FaBan,
  FaTrashAlt,
  FaUsers,
  FaCamera,
  FaEdit,
} from "react-icons/fa";
import EditStudentModal from "../sms/EditStudentModal";
import { getClassArmsApi } from "../../api-endpoint/sms/smsEndpoints";
import { useAuth } from "../../libs/AuthProvider";

const StudentEditor = () => {
  const { user, loading: authLoading } = useAuth();
  const userId = user?._id || user?.id;
  const institutionId = user?.institutionId;
  const isSchoolAdmin = ["institution", "institution_admin", "admin"].includes(user?.role);
  const [selectedClassArm, setSelectedClassArm] = useState("");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: classData, isLoading: classesLoading, isError: classesError } = useQuery({
    queryKey: ["student-editor-classes", userId, institutionId, user?.role],
    queryFn: async () => {
      const response = await getClassArmsApi();
      if (!response?.success) throw new Error("Unable to load classes");
      return response;
    },
    enabled: !authLoading && Boolean(userId && institutionId) && (user?.role === "teacher" || isSchoolAdmin),
    retry: false,
  });
  const classArms = (classData?.data || []).filter((arm) =>
    arm.institutionId === institutionId && (isSchoolAdmin || arm.formTeacherId === userId));
  const canLoadStudents = !authLoading && Boolean(userId) &&
    (institutionId ? classArms.some((arm) => arm.id === selectedClassArm) : user?.role === "teacher");

  const { data, isFetching, isError } = useQuery({
    queryKey: ["students", "editing", userId, institutionId, user?.role, selectedClassArm, searchTerm, page],
    queryFn: async ({ signal }) => {
      const response = await fetchStudent({
        ...(institutionId ? { classArmId: selectedClassArm } : {}),
        editingOnly: true, search: searchTerm, page, limit: 25,
      });
      if (signal.aborted) throw new DOMException("Request superseded", "AbortError");
      if (!response?.success) throw new Error("Unable to load students");
      return response;
    },
    enabled: canLoadStudents,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const activateMutation = useMutation({
    mutationFn: activateStudent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["students"] }),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateStudent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["students"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["students"] }),
  });

  const students = canLoadStudents && !isFetching && !isError ? data?.students || [] : [];
  const count = canLoadStudents && !isFetching && !isError ? data?.count || 0 : 0;

  return (
    <Box
      mt="84px"
      ml={{ base: 0, lg: "240px" }}
      w={{ base: "100%", lg: "calc(100% - 240px)" }}
      p={{ base: 4, md: 8 }}
      minH="calc(100vh - 84px)"
      bg="#F8FAFC"
    >
      <Box maxW="1200px" mx="auto">
        {/* Page Header */}
        <Box mb={6}>
          <Flex align="center" gap={2.5} mb={1} wrap="wrap">
            <Flex
              w="38px"
              h="38px"
              borderRadius="xl"
              bg="purple.50"
              color="#6A1B9A"
              align="center"
              justify="center"
            >
              <Icon as={FaUserEdit} boxSize={5} />
            </Flex>
            <Text
              fontSize={{ base: "22px", md: "26px" }}
              fontWeight="800"
              color="#0F172A"
              fontFamily="'Outfit', sans-serif"
            >
              Manage Student Status
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
              {count} Records
            </Badge>
          </Flex>
          <Text fontSize="14px" color="#64748B">
            Activate, suspend, or remove candidate examination permissions and portal credentials.
          </Text>
        </Box>

        {/* Table Container Card */}
        <Box
          bg="white"
          borderRadius="24px"
          border="1px solid"
          borderColor="#E2E8F0"
          boxShadow="0 2px 12px rgba(0, 0, 0, 0.03)"
          overflow="hidden"
        >
          {/* Search bar */}
          <Box p={4} borderBottom="1px solid" borderColor="#F1F5F9">
            {institutionId && (
              <Box mb={3}>
                <Text fontSize="13px" fontWeight="600" mb={1}>Class</Text>
                <Box as="select" aria-label="Select class" value={selectedClassArm}
                  onChange={(e) => {
                    setSelectedClassArm(e.target.value);
                    setSearchTerm("");
                    setPage(1);
                    setEditingStudent(null);
                    setIsEditModalOpen(false);
                  }}
                  w={{ base: "100%", md: "380px" }} minH="44px" px={3}
                  border="1px solid #E2E8F0" borderRadius="xl" bg="white"
                  disabled={authLoading || classesLoading || classesError}>
                  <option value="">Select a class to load students</option>
                  {classArms.map((arm) => <option key={arm.id} value={arm.id}>{arm.name}</option>)}
                </Box>
                {classesError && <Text color="red.500" fontSize="13px">Unable to load classes. Please retry.</Text>}
                {!classesLoading && !classesError && classArms.length === 0 && (
                  <Text fontSize="13px" color="#64748B">No authorized classes assigned.</Text>
                )}
              </Box>
            )}
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
                placeholder="Search candidate name or ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                  setEditingStudent(null);
                  setIsEditModalOpen(false);
                }}
                disabled={!canLoadStudents}
                fontSize="13px"
              />
            </Flex>
          </Box>

          {authLoading || (institutionId && classesLoading) || (canLoadStudents && isFetching) ? (
            <Box p={4}>
              <TableSkeleton rows={5} columns={4} />
            </Box>
          ) : canLoadStudents && isError ? (
            <Flex h="200px" justify="center" align="center" color="red.500">
              <Text>Error fetching student list. Please retry.</Text>
            </Flex>
          ) : students.length === 0 ? (
            <Flex h="220px" direction="column" justify="center" align="center" color="#64748B">
              <Icon as={FaUsers} boxSize={7} color="#CBD5E1" mb={2} />
              <Text fontSize="14px" fontWeight="600">
                {institutionId && !canLoadStudents ? "Select a class to load students" : "No matching students found"}
              </Text>
            </Flex>
          ) : (
            <Table.ScrollArea maxH="65vh">
              <Table.Root size="md" stickyHeader>
                <Table.Header>
                  <Table.Row bg="#0F172A">
                    <Table.ColumnHeader color="white" py={3.5} px={4} fontSize="12px" fontWeight="700">
                      Face
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="white" py={3.5} px={5} fontSize="12px" fontWeight="700">
                      Student ID
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="white" py={3.5} px={5} fontSize="12px" fontWeight="700">
                      Full Name
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="white" py={3.5} px={4} fontSize="12px" fontWeight="700">
                      Class Arm
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="white" py={3.5} px={5} fontSize="12px" fontWeight="700" textAlign="center">
                      Current Status
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="white" py={3.5} px={5} fontSize="12px" fontWeight="700" textAlign="right">
                      Account Actions
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {students.map((l) => {
                    const isActive = l?.active === true;
                    return (
                      <Table.Row
                        key={l.id}
                        _hover={{ bg: "#FAF5FF" }}
                        transition="background 0.15s ease"
                      >
                        {/* Face Biometric Thumbnail */}
                        <Table.Cell py={2.5} px={4}>
                          {l.faceImageUrl ? (
                            <Box
                              w="38px"
                              h="38px"
                              borderRadius="xl"
                              overflow="hidden"
                              border="2px solid #10B981"
                              boxShadow="0 2px 6px rgba(0,0,0,0.08)"
                              cursor="pointer"
                              onClick={() => {
                                setEditingStudent(l);
                                setIsEditModalOpen(true);
                              }}
                              title="Click to view/replace face photo"
                            >
                              <img
                                src={l.faceImageUrl}
                                alt="Face"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </Box>
                          ) : (
                            <Button
                              size="xs"
                              variant="outline"
                              borderColor="#F59E0B"
                              color="#D97706"
                              bg="#FFFBEB"
                              borderRadius="lg"
                              fontSize="10px"
                              px={2}
                              py={1}
                              h="30px"
                              onClick={() => {
                                setEditingStudent(l);
                                setIsEditModalOpen(true);
                              }}
                              title="Upload face photo for CBT proctoring"
                            >
                              <Icon as={FaCamera} mr={1} boxSize={2.5} />
                              Add Face
                            </Button>
                          )}
                        </Table.Cell>

                        <Table.Cell py={3.5} px={5} fontWeight="700" color="#6A1B9A" fontSize="13px">
                          {l.studentId || `STU-${l.id}`}
                        </Table.Cell>

                        <Table.Cell py={3.5} px={5} fontWeight="600" color="#1E293B">
                          {formatStudentFullName(l.firstName, l.lastName)}
                        </Table.Cell>

                        <Table.Cell py={3.5} px={4} fontSize="12px" color="#475569" fontWeight="600">
                          {l.ClassArm?.name || "General / CBT"}
                        </Table.Cell>

                        <Table.Cell py={3.5} px={5} textAlign="center">
                          <Badge
                            bg={isActive ? "green.50" : "red.50"}
                            color={isActive ? "#059669" : "#DC2626"}
                            border="1px solid"
                            borderColor={isActive ? "#A7F3D0" : "#FECACA"}
                            borderRadius="full"
                            px={2.5}
                            py={0.5}
                            fontSize="11px"
                            fontWeight="700"
                          >
                            {isActive ? "ACTIVE" : "SUSPENDED"}
                          </Badge>
                        </Table.Cell>

                        <Table.Cell py={3.5} px={5} textAlign="right">
                          <Flex justify="flex-end" align="center" gap={2}>
                            {/* Edit / Face Photo Action */}
                            <Button
                              size="xs"
                              variant="outline"
                              borderColor="#CBD5E1"
                              color="#6A1B9A"
                              bg="white"
                              borderRadius="lg"
                              px={2.5}
                              _hover={{ bg: "#FAF5FF", borderColor: "#6A1B9A" }}
                              onClick={() => {
                                setEditingStudent(l);
                                setIsEditModalOpen(true);
                              }}
                              title="Edit candidate profile and upload headshot photo"
                            >
                              <Icon as={FaEdit} mr={1} boxSize={2.5} />
                              Edit / Face
                            </Button>

                            {!isActive ? (
                              <Button
                                size="xs"
                                bg="#10B981"
                                color="white"
                                borderRadius="lg"
                                px={2.5}
                                _hover={{ bg: "#059669" }}
                                onClick={() => activateMutation.mutate(l.id)}
                                loading={activateMutation.isPending}
                              >
                                <Icon as={FaCheck} mr={1} boxSize={2.5} />
                                Activate
                              </Button>
                            ) : (
                              <Button
                                size="xs"
                                variant="outline"
                                borderColor="#F59E0B"
                                color="#D97706"
                                bg="#FFFBEB"
                                borderRadius="lg"
                                px={2.5}
                                _hover={{ bg: "#FEF3C7" }}
                                onClick={() => deactivateMutation.mutate(l.id)}
                                loading={deactivateMutation.isPending}
                              >
                                <Icon as={FaBan} mr={1} boxSize={2.5} />
                                Deactivate
                              </Button>
                            )}

                            <Button
                              size="xs"
                              variant="outline"
                              borderColor="#FECACA"
                              color="#DC2626"
                              bg="#FEF2F2"
                              borderRadius="lg"
                              px={2.5}
                              _hover={{ bg: "#DC2626", color: "white" }}
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete ${formatStudentName(l.firstName)}?`)) {
                                  deleteMutation.mutate(l.id);
                                }
                              }}
                              loading={deleteMutation.isPending}
                            >
                              <Icon as={FaTrashAlt} mr={1} boxSize={2.5} />
                              Delete
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
          {canLoadStudents && !isError && (
            <Flex p={4} gap={3} align="center" justify="space-between" wrap="wrap">
              <Text fontSize="13px" color="#64748B">Page {page} of {Math.max(1, data?.totalPages || 0)} | {count} records</Text>
              <Flex gap={2}>
                <Button size="sm" variant="outline" disabled={isFetching || page <= 1}
                  onClick={() => { setPage(page - 1); setEditingStudent(null); setIsEditModalOpen(false); }}>Previous</Button>
                <Button size="sm" variant="outline" disabled={isFetching || page >= (data?.totalPages || 0)}
                  onClick={() => { setPage(page + 1); setEditingStudent(null); setIsEditModalOpen(false); }}>Next</Button>
              </Flex>
            </Flex>
          )}
        </Box>
      </Box>

      {/* Edit Student & Face Photo Upload Modal */}
      <EditStudentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        student={editingStudent}
        onUpdated={() => queryClient.invalidateQueries({ queryKey: ["students"] })}
      />
    </Box>
  );
};

export default StudentEditor;
