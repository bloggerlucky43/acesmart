import { Box, Flex, Text, Table, Button } from "@chakra-ui/react";
const MListOfStudent = () => {
  return (
    <Box py={2}>
      <Box
        bg="white"
        boxShadow="0 2px 10px rgba(0,0,0,0.03)"
        borderRadius="24px"
        border="1px solid #E2E8F0"
        p={4}
        minH="calc(100vh - 80px)"
        w="100%"
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
