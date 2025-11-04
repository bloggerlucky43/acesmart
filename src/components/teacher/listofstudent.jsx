import { Box, Flex, Text, Table, Button } from "@chakra-ui/react";
import { List } from "./constants/lists";
import { useEffect } from "react";
import { fetchStudent } from "../../api-endpoint/student/students";
import { useQuery } from "@tanstack/react-query";
const ListOfStudent = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudent,
  });

  const students = data?.students || [];
  return (
    <Box
      bg="gray.200"
      boxShadow="lg"
      borderRadius="md"
      mt="12vh"
      ml="18vw"
      p={4}
      justifySelf="center"
      w="70%"
    >
      <Flex mb={4} justify="space-between" align="center">
        <Text> List of Students</Text>
        <Button bg="secondary">Download as PDF</Button>
      </Flex>
      <Box align="start">
        <Table.ScrollArea h="80vh" borderWidth="1px" rounded="md">
          <Table.Root size="md" stickyHeader>
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
                  Department
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {students.map((l) => (
                <Table.Row bg="white">
                  <Table.Cell textAlign="center">{l.studentId}</Table.Cell>
                  <Table.Cell textAlign="center">{l.firstName}</Table.Cell>
                  <Table.Cell textAlign="center">{l.lastName}</Table.Cell>
                  <Table.Cell textAlign="center">{l.department}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      </Box>
    </Box>
  );
};

export default ListOfStudent;
