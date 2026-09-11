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
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activateStudent,
  deactivateStudent,
  deleteStudent,
  fetchStudent,
} from "../../../../api-endpoint/student/students";
import { CardGridSkeleton } from "../../../../components/ui/skeletons";
import { toaster } from "../../../../components/ui/toaster";
import {
  FaSearch,
  FaCheck,
  FaBan,
  FaTrashAlt,
  FaUsers,
  FaUserEdit,
} from "react-icons/fa";

export const MStudentEditor = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudent,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const activateMutation = useMutation({
    mutationFn: activateStudent,
    onSuccess: () => {
      queryClient.invalidateQueries(["students"]);
      toaster.create({ title: "Student profile activated", type: "success" });
    },
    onError: () => {
      toaster.create({ title: "Failed to activate student", type: "error" });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateStudent,
    onSuccess: () => {
      queryClient.invalidateQueries(["students"]);
      toaster.create({ title: "Student profile deactivated", type: "info" });
    },
    onError: () => {
      toaster.create({ title: "Failed to deactivate student", type: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries(["students"]);
      toaster.create({ title: "Student removed successfully", type: "success" });
    },
    onError: () => {
      toaster.create({ title: "Failed to delete student", type: "error" });
    },
  });

  const students = data?.students || [];

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${s?.firstName ?? ""} ${s?.lastName ?? ""}`.toLowerCase();
    const studentId = String(s?.studentId ?? "").toLowerCase();
    return fullName.includes(term) || studentId.includes(term);
  });

  return (
    <Box pb={6} className="animate-scale-in">
      {/* Top Header */}
      <Box mb={4}>
        <Flex align="center" gap={2} mb={1}>
          <Icon as={FaUserEdit} color="#6A1B9A" boxSize={4.5} />
          <Text fontSize="18px" fontWeight="800" color="#0F172A" fontFamily="'Outfit', sans-serif">
            Candidate Status Management
          </Text>
        </Flex>
        <Text fontSize="12px" color="#64748B">
          Activate, suspend, or manage student assessment access permissions
        </Text>
      </Box>

      {/* Search Bar */}
      <Box mb={4}>
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
            onChange={(e) => setSearchTerm(e.target.value)}
            fontSize="13px"
          />
        </Flex>
      </Box>

      {/* Loading Skeleton */}
      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : isError ? (
        <Box bg="white" p={6} borderRadius="2xl" textAlign="center" color="red.500" fontSize="13px">
          Error retrieving student records. Please retry.
        </Box>
      ) : filteredStudents.length === 0 ? (
        <Box
          bg="white"
          borderRadius="2xl"
          p={8}
          border="1px dashed #CBD5E1"
          textAlign="center"
        >
          <Icon as={FaUsers} boxSize={8} color="#CBD5E1" mb={2} />
          <Text fontSize="14px" fontWeight="700" color="#334155" mb={1}>
            No matching students found
          </Text>
          <Text fontSize="12px" color="#64748B">
            Try a different search query or enroll new candidates.
          </Text>
        </Box>
      ) : (
        /* Mobile Card List */
        <VStack gap={3} align="stretch">
          {filteredStudents.map((s) => {
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
                <Flex gap={2} pt={2.5} borderTop="1px solid" borderColor="#F1F5F9">
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
                      Suspend Access
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
    </Box>
  );
};

export default MStudentEditor;
