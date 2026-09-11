import { Box, Table, Flex, Text, Spinner } from "@chakra-ui/react";
import { fetchStudent } from "../../../../api-endpoint/student/students";
import { useQuery } from "@tanstack/react-query";
export const MStudentEditor = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudent,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <Flex bg="gray.200" minH="100vh" justify={"center"} align="center">
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
    <Box py={2}>
      <Box bg="white" border="1px solid #E2E8F0" borderRadius="24px" p={4} w="100%" boxShadow="0 2px 10px rgba(0,0,0,0.03)">
        <Flex mt={4} mb={2} justify="space-between" align="center">
          <Text fontSize="lg"> List of Students</Text>
        </Flex>
        <Box>
          <Table.ScrollArea h="70vh" borderWidth="1px" rounded="md">
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
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {students?.map((l) => (
                  <Table.Row bg="white">
                    <Table.Cell textAlign="center">{l.studentId}</Table.Cell>
                    <Table.Cell textAlign="center">
                      <Table.Cell textAlign={"center"}>
                        {l.firstName}
                      </Table.Cell>
                    </Table.Cell>
                    <Table.Cell textAlign="center">{l.lastName}</Table.Cell>
                    <Table.Cell textAlign="center">
                      {l?.active === true ? "Active" : "Inactive"}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Box>
      </Box>
    </Box>
  );
};
