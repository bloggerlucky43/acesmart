import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
  Input,
  VStack,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activateStudent,
  deactivateStudent,
  deleteStudent,
  fetchStudent,
} from "../../../../api-endpoint/student/students";
import { CardGridSkeleton } from "../../../../components/ui/skeletons";
import { toaster } from "../../../../components/ui/toaster";
import EditStudentModal from "../../../../components/sms/EditStudentModal";
import { getClassArmsApi } from "../../../../api-endpoint/sms/smsEndpoints";
import { useAuth } from "../../../../libs/AuthProvider";
import { STUDENT_EDITOR_CACHE_MS, STUDENT_EDITOR_PAGE_SIZE, trimStudentEditorCache, updateStudentEditorCache } from "../../../../libs/studentEditorCache";
import {
  FaSearch,
  FaCheck,
  FaBan,
  FaTrashAlt,
  FaUsers,
  FaUserEdit,
} from "react-icons/fa";

export const MStudentEditor = () => {
  const { user, loading: authLoading } = useAuth();
  const userId = user?._id || user?.id;
  const institutionId = user?.institutionId;
  const isSchoolAdmin = ["institution", "institution_admin", "admin"].includes(user?.role);
  const [selectedClassArm, setSelectedClassArm] = useState("");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const queryClient = useQueryClient();
  const cachePrefix = ["students", "editing", userId, institutionId || null, user?.role];
  const studentQueryKey = [...cachePrefix, selectedClassArm || null, searchTerm, page, STUDENT_EDITOR_PAGE_SIZE, true];

  const { data: classData, isLoading: classesLoading, isError: classesError } = useQuery({
    queryKey: ["student-editor-classes", userId, institutionId, user?.role],
    queryFn: async () => {
      const response = await getClassArmsApi();
      if (!response?.success) throw new Error("Unable to load classes");
      return response;
    },
    enabled: !authLoading && Boolean(userId && institutionId) && (user?.role === "teacher" || isSchoolAdmin),
    staleTime: STUDENT_EDITOR_CACHE_MS,
    gcTime: STUDENT_EDITOR_CACHE_MS,
    retry: false,
  });
  const classArms = (classData?.data || []).filter((arm) =>
    arm.institutionId === institutionId && (isSchoolAdmin || arm.formTeacherId === userId));
  const canLoadStudents = !authLoading && Boolean(userId) &&
    (institutionId ? classArms.some((arm) => arm.id === selectedClassArm) : user?.role === "teacher");

  const { data, isFetching, isError } = useQuery({
    queryKey: studentQueryKey,
    queryFn: async ({ signal }) => {
      const response = await fetchStudent({
        ...(institutionId ? { classArmId: selectedClassArm } : {}),
        editingOnly: true, search: searchTerm, page, limit: STUDENT_EDITOR_PAGE_SIZE,
      }, { signal });
      if (signal.aborted) throw new DOMException("Request superseded", "AbortError");
      if (!response?.success) throw new Error("Unable to load students");
      return response;
    },
    enabled: canLoadStudents,
    staleTime: STUDENT_EDITOR_CACHE_MS,
    gcTime: STUDENT_EDITOR_CACHE_MS,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => { trimStudentEditorCache(queryClient); }, [queryClient, data, classData]);

  const updateCachedStudent = (student, deleted = false, scope = { prefix: cachePrefix, key: studentQueryKey }) => {
    const nextPage = updateStudentEditorCache(queryClient, scope.prefix, scope.key, student, deleted);
    if (nextPage && JSON.stringify(scope.key) === JSON.stringify(studentQueryKey)) setPage(nextPage);
  };

  const activateMutation = useMutation({
    mutationFn: activateStudent,
    onMutate: () => ({ prefix: cachePrefix, key: studentQueryKey }),
    onSuccess: (_response, id, scope) => {
      updateCachedStudent({ id, active: true }, false, scope);
      toaster.create({ title: "Student profile activated", type: "success" });
    },
    onError: () => {
      toaster.create({ title: "Failed to activate student", type: "error" });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateStudent,
    onMutate: () => ({ prefix: cachePrefix, key: studentQueryKey }),
    onSuccess: (_response, id, scope) => {
      updateCachedStudent({ id, active: false }, false, scope);
      toaster.create({ title: "Student profile deactivated", type: "info" });
    },
    onError: () => {
      toaster.create({ title: "Failed to deactivate student", type: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onMutate: () => ({ prefix: cachePrefix, key: studentQueryKey }),
    onSuccess: (_response, id, scope) => {
      updateCachedStudent({ id }, true, scope);
      toaster.create({ title: "Student removed successfully", type: "success" });
    },
    onError: () => {
      toaster.create({ title: "Failed to delete student", type: "error" });
    },
  });

  const students = canLoadStudents && !isError ? data?.students || [] : [];
  const count = canLoadStudents && !isError ? data?.count || 0 : 0;

  return (
    <Box pb={6} className="animate-scale-in">
      {/* Top Header */}
      <Box mb={4}>
        <Flex align="center" gap={2} mb={1}>
          <Icon as={FaUserEdit} color="#6A1B9A" boxSize={4.5} />
          <Text fontSize="18px" fontWeight="800" color="#0F172A" fontFamily="'Outfit', sans-serif">
            Student Status Management
          </Text>
        </Flex>
        <Text fontSize="12px" color="#64748B">
          Activate, suspend, or manage student assessment access permissions
        </Text>
        <Text fontSize="12px" color="#64748B" mt={1}>{count} Records</Text>
      </Box>

      {/* Search Bar */}
      <Box mb={4}>
        {institutionId && (
          <Box mb={3}>
            <Text fontSize="13px" fontWeight="600" mb={1}>Class</Text>
            <Box as="select" aria-label="Select class" value={selectedClassArm}
              onChange={(e) => {
                setSelectedClassArm(e.target.value);
                setSearchTerm("");
                setPage(1);
                setEditingStudent(null);
              }}
              w="100%" minH="44px" px={3} border="1px solid #E2E8F0" borderRadius="xl" bg="white"
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
          gap={2.5}
          bg="white"
          px={3.5}
          py={2}
          borderRadius="xl"
          border="1px solid"
          borderColor="#E2E8F0"
        >
          <Icon as={FaSearch} color="#94A3B8" boxSize={3.5} />
          <Input
            variant="unstyled"
            placeholder="Search student by name or ID..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); setEditingStudent(null); }}
            disabled={!canLoadStudents}
            fontSize="13px"
          />
        </Flex>
      </Box>

      {/* Loading Skeleton */}
      {authLoading || (institutionId && classesLoading) || (canLoadStudents && isFetching && !data) ? (
        <CardGridSkeleton count={4} />
      ) : canLoadStudents && isError ? (
        <Box bg="white" p={6} borderRadius="2xl" textAlign="center" color="red.500" fontSize="13px">
          Error retrieving student records. Please retry.
        </Box>
      ) : students.length === 0 ? (
        <Box
          bg="white"
          borderRadius="2xl"
          p={8}
          border="1px dashed #CBD5E1"
          textAlign="center"
        >
          <Icon as={FaUsers} boxSize={8} color="#CBD5E1" mb={2} />
          <Text fontSize="14px" fontWeight="700" color="#334155" mb={1}>
            {institutionId && !canLoadStudents ? "Select a class to load students" : "No matching students found"}
          </Text>
          <Text fontSize="12px" color="#64748B">
            {institutionId && !canLoadStudents ? "Only your authorized classes are available for editing." : "Try a different search query or enroll new candidates."}
          </Text>
        </Box>
      ) : (
        /* Mobile Card List */
        <VStack gap={3} align="stretch">
          {students.map((s) => {
            const fullName = `${s?.firstName ?? ""} ${s?.lastName ?? ""}`.trim() || "Candidate";
            const isActive = s?.active === true || s?.status === "active";

            return (
              <Box
                key={s.id}
                bg="white"
                borderRadius="2xl"
                p={4}
                border="1px solid"
                borderColor="#E2E8F0"
                boxShadow="0 2px 6px rgba(0,0,0,0.02)"
              >
                <Flex justify="space-between" align="center" mb={3}>
                  <Box>
                    <Text fontSize="14px" fontWeight="800" color="#0F172A" lineHeight="1.2">
                      {fullName}
                    </Text>
                    <Text fontSize="11px" color="#64748B" mt={0.5}>
                      ID: {s.studentId || "N/A"}
                    </Text>
                  </Box>

                  <Badge
                    bg={isActive ? "green.50" : "red.50"}
                    color={isActive ? "green.700" : "red.700"}
                    border="1px solid"
                    borderColor={isActive ? "green.200" : "red.200"}
                    borderRadius="full"
                    px={2.5}
                    py={0.5}
                    fontSize="11px"
                    fontWeight="700"
                  >
                    {isActive ? "Active" : "Suspended"}
                  </Badge>
                </Flex>

                {/* Actions */}
                <Flex gap={2} pt={2.5} borderTop="1px solid" borderColor="#F1F5F9" wrap="wrap">
                  <Button
                    size="xs"
                    variant="outline"
                    color="#6A1B9A"
                    borderRadius="lg"
                    h="34px"
                    onClick={() => setEditingStudent(s)}
                  >
                    <Icon as={FaUserEdit} boxSize={3} />
                    Edit / Photo
                  </Button>
                  {isActive ? (
                    <Button
                      flex={1}
                      size="xs"
                      variant="outline"
                      borderColor="orange.300"
                      color="orange.700"
                      bg="orange.50"
                      borderRadius="lg"
                      h="34px"
                      fontSize="11px"
                      fontWeight="700"
                      onClick={() => deactivateMutation.mutate(s.id)}
                      loading={deactivateMutation.isLoading}
                      leftIcon={<Icon as={FaBan} />}
                    >
                      Suspend
                    </Button>
                  ) : (
                    <Button
                      flex={1}
                      size="xs"
                      variant="outline"
                      borderColor="green.300"
                      color="green.700"
                      bg="green.50"
                      borderRadius="lg"
                      h="34px"
                      fontSize="11px"
                      fontWeight="700"
                      onClick={() => activateMutation.mutate(s.id)}
                      loading={activateMutation.isLoading}
                      leftIcon={<Icon as={FaCheck} />}
                    >
                      Activate
                    </Button>
                  )}

                  <Button
                    size="xs"
                    variant="ghost"
                    color="red.600"
                    _hover={{ bg: "red.50" }}
                    borderRadius="lg"
                    h="34px"
                    px={3}
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to remove ${fullName}?`)) {
                        deleteMutation.mutate(s.id);
                      }
                    }}
                    loading={deleteMutation.isLoading}
                    aria-label="Delete student"
                  >
                    <Icon as={FaTrashAlt} boxSize={3} />
                  </Button>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      )}
      {canLoadStudents && !isError && (
        <Flex mt={4} gap={3} align="center" justify="space-between" wrap="wrap">
          <Text fontSize="12px" color="#64748B">Page {page} of {Math.max(1, data?.totalPages || 0)} | {count} records</Text>
          <Flex gap={2}>
            <Button size="sm" variant="outline" minH="44px" disabled={isFetching || page <= 1}
              onClick={() => { setPage(page - 1); setEditingStudent(null); }}>Previous</Button>
            <Button size="sm" variant="outline" minH="44px" disabled={isFetching || page >= (data?.totalPages || 0)}
              onClick={() => { setPage(page + 1); setEditingStudent(null); }}>Next</Button>
          </Flex>
        </Flex>
      )}
      <EditStudentModal
        isOpen={Boolean(editingStudent)}
        onClose={() => setEditingStudent(null)}
        student={editingStudent}
        onUpdated={(student) => updateCachedStudent(student)}
      />
    </Box>
  );
};

export default MStudentEditor;
