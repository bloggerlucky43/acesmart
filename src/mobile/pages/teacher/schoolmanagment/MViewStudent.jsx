import { Box, Flex, Text, Table, Button } from "@chakra-ui/react";
const MListOfStudent = () => {
  return (
    <Box mt="6vh" py={4}>
      <Box
        bg="gray.100"
        boxShadow="lg"
        borderRadius="md"
        mt={4}
        p={4}
        minH="100vh"
        justifySelf="center"
        w="98%"
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
                    ID
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                    Student ID
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                    Name
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                    Class
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                    Department
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {List.map((l) => (
                  <Table.Row bg="white">
                    <Table.Cell textAlign="center">{l.id}</Table.Cell>
                    <Table.Cell textAlign="center">
                      {l.studentID.toUpperCase()}
                    </Table.Cell>
                    <Table.Cell textAlign="center">{l.firstName}</Table.Cell>
                    <Table.Cell textAlign="center">{l.class}</Table.Cell>
                    <Table.Cell textAlign="center">{l.department}</Table.Cell>
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

export default MListOfStudent;
