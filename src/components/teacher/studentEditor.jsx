import { Box, Table, Flex, Text, Button, Spinner } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activateStudent,
  deactivateStudent,
  deleteStudent,
  fetchStudent,
} from "../../api-endpoint/student/students";

const StudentEditor = () => {
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

  if (isLoading) {
    return (
      <Flex minH="100vh" justify="center" align="center">
        <Spinner size="lg" color="primary" />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Text color="danger" textAlign="center">
        Error fetching Students
      </Text>
    );
  }
  const students = data?.students || [];
  return (
    <Box
      bg="gray.200"
      boxShadow="lg"
      borderRadius="md"
      mt="9vh"
      ml="200px"
      minH="100vh"
      p={4}
      justifySelf="center"
      w={"calc(100% - 200px)"}
    >
      <Flex mb={4} mt={4} justify="space-between" align="center">
        <Text> List of Students</Text>
      </Flex>
      <Box align="start">
        <Table.ScrollArea borderWidth="1px" rounded="md">
          <Table.Root size="sm" stickyHeader>
            <Table.Header>
              <Table.Row bg="primary">
                <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                  Student ID
                </Table.ColumnHeader>
                <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                  First Name
                </Table.ColumnHeader>
                <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                  Last Name
                </Table.ColumnHeader>
                <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                  Status
                </Table.ColumnHeader>

                <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                  Actions
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {students?.map((l) => (
                <Table.Row bg="white">
                  <Table.Cell textAlign="center">{l.studentId}</Table.Cell>
                  <Table.Cell textAlign="center">{l.firstName}</Table.Cell>
                  <Table.Cell textAlign="center">{l.lastName}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {l?.active === true ? "Active" : "Inactive"}
                  </Table.Cell>

                  <Table.Cell w="10%" justifyContent="center">
                    <Flex justify="center" align="center" gap={2}>
                      <Button
                        bg="secondary"
                        onClick={() => activateMutation.mutate(l.id)}
                        loading={activateMutation.isPending}
                        _hover={{ transform: "scale(1.05)" }}
                      >
                        Activate
                      </Button>
                      <Button
                        bg="danger"
                        color="gray.900"
                        onClick={() => deactivateMutation.mutate(l.id)}
                        loading={deactivateMutation.isPending}
                        _hover={{ transform: "scale(1.05)" }}
                      >
                        Deactivate
                      </Button>
                      <Button
                        onClick={() => deleteMutation.mutate(l.id)}
                        loading={deleteMutation.isPending}
                        bg="danger"
                        color="gray.900"
                      >
                        Delete
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      </Box>
    </Box>
  );
};

export default StudentEditor;
