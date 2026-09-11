import {
  Box,
  Table,
  Flex,
  Text,
  Button,
  Spinner,
  Icon,
  Badge,
  Input,
} from "@chakra-ui/react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activateStudent,
  deactivateStudent,
  deleteStudent,
  fetchStudent,
} from "../../api-endpoint/student/students";
import {
  FaUserEdit,
  FaSearch,
  FaCheck,
  FaBan,
  FaTrashAlt,
  FaUsers,
} from "react-icons/fa";

const StudentEditor = () => {
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
    onSuccess: () => queryClient.invalidateQueries(["students"]),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateStudent,
    onSuccess: () => queryClient.invalidateQueries(["students"]),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => queryClient.invalidateQueries(["students"]),
  });

  const students = data?.students || [];

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${s?.firstName ?? ""} ${s?.lastName ?? ""}`.toLowerCase();
    const studentId = String(s?.studentId ?? "").toLowerCase();
    return fullName.includes(term) || studentId.includes(term);
  });

  return (
    <Box
      mt="68px"
      ml={{ base: 0, lg: "240px" }}
      w={{ base: "100%", lg: "calc(100% - 240px)" }}
      p={{ base: 4, md: 8 }}
      minH="calc(100vh - 68px)"
      bg="#F8FAFC"
    >
      <Box maxW="1200px" mx="auto">
        {/* Page Header */}
        <Box mb={6}>
          <Flex align="center" gap={2.5} mb={1}>
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
              {students.length} Records
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
                onChange={(e) => setSearchTerm(e.target.value)}
                fontSize="13px"
              />
            </Flex>
          </Box>

          {isLoading ? (
            <Flex h="240px" justify="center" align="center">
              <Spinner size="xl" color="#6A1B9A" />
            </Flex>
          ) : isError ? (
            <Flex h="200px" justify="center" align="center" color="red.500">
              <Text>Error fetching student list. Please retry.</Text>
            </Flex>
          ) : filteredStudents.length === 0 ? (
            <Flex h="220px" direction="column" justify="center" align="center" color="#64748B">
              <Icon as={FaUsers} boxSize={7} color="#CBD5E1" mb={2} />
              <Text fontSize="14px" fontWeight="600">
                No matching students found
              </Text>
            </Flex>
          ) : (
            <Table.ScrollArea maxH="65vh">
              <Table.Root size="md" stickyHeader>
                <Table.Header>
                  <Table.Row bg="#0F172A">
                    <Table.ColumnHeader color="white" py={3.5} px={5} fontSize="12px" fontWeight="700">
                      Student ID
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="white" py={3.5} px={5} fontSize="12px" fontWeight="700">
                      Full Name
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
                  {filteredStudents.map((l) => {
                    const isActive = l?.active === true;
                    return (
                      <Table.Row
                        key={l.id}
                        _hover={{ bg: "#FAF5FF" }}
                        transition="background 0.15s ease"
                      >
                        <Table.Cell py={3.5} px={5} fontWeight="700" color="#6A1B9A" fontSize="13px">
                          {l.studentId || `STU-${l.id}`}
                        </Table.Cell>

                        <Table.Cell py={3.5} px={5} fontWeight="600" color="#1E293B">
                          {l.firstName} {l.lastName}
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
                                if (window.confirm(`Are you sure you want to delete ${l.firstName}?`)) {
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
        </Box>
      </Box>
    </Box>
  );
};

export default StudentEditor;
