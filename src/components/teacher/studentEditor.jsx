import {
  Box,
  Table,
  Flex,
  Text,
  Input,
  Fieldset,
  Field,
  Button,
} from "@chakra-ui/react";
import { List } from "./constants/lists";
const StudentEditor = () => {
  return (
    <Box
      bg="gray.200"
      boxShadow="lg"
      borderRadius="md"
      mt="12vh"
      ml="18vw"
      p={4}
      justifySelf="center"
      w="70%">
      <Flex mb={4} justify="space-between" align="center">
        <Text> List of Students</Text>
      </Flex>
      <Box align="start">
        <Table.ScrollArea borderWidth="1px" rounded="md">
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
                <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                  Actions
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
                  <Table.Cell w="10%" justifyContent="center">
                    <Flex justify="center" align="center" gap={2}>
                      <Button
                        bg="secondary"
                        _hover={{ transform: "scale(1.05)" }}>
                        Update
                      </Button>
                      <Button
                        bg="danger"
                        color="gray.900"
                        _hover={{ transform: "scale(1.05)" }}>
                        Remove
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
