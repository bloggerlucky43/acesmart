import { Box, Table, Flex, Text, Input, Button } from "@chakra-ui/react";

export const MStudentEditor = () => {
  return (
    <Box mt="5vh" minH="100vh" py={4}>
      <Box
        bg="gray.200"
        boxShadow="md"
        borderRadius="md"
        p={4}
        justifySelf="center"
        w="98%"
      >
        <Flex mt={4} mb={2} justify="space-between" align="center">
          <Text> List of Students</Text>
        </Flex>
        <Box>
          <Table.ScrollArea h="70vh" borderWidth="1px" rounded="md">
            <Table.Root size="sm" stickyHeader>
              <Table.Header>
                <Table.Row bg="primary">
                  <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                    ID
                  </Table.ColumnHeader>
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
                    <Table.Cell textAlign="center">{l.studentID}</Table.Cell>
                    <Table.Cell textAlign="center">
                      <Input
                        type="text"
                        name="name"
                        value={l.firstName}
                        _focus={{
                          outline: "none",
                          border: "solid 1px ",
                          borderColor: "primary",
                        }}
                      />
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Input
                        type="text"
                        name="name"
                        value={l.lastName}
                        _focus={{
                          outline: "none",
                          border: "solid 1px ",
                          borderColor: "primary",
                        }}
                      />
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Input
                        name="class"
                        type="text"
                        value={l.class}
                        _focus={{
                          outline: "none",
                          border: "solid 1px ",
                          borderColor: "primary",
                        }}
                      />
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Input
                        name="department"
                        type="text"
                        value={l.department}
                        _focus={{
                          outline: "none",
                          border: "solid 1px ",
                          borderColor: "primary",
                        }}
                      />
                      {/* {l.department} */}
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
