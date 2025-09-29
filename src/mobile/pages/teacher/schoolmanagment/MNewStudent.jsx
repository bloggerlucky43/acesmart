import { Box, Text, Input, Button, Field, Flex, Table } from "@chakra-ui/react";
import { FakeStudents } from "./FakeStudents";
import { useState } from "react";

const MNewStudent = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    role: "student",
    department: "",
  });

  return (
    <Box
      rounded="md"
      justifySelf="center"
      p={4}
      justify="center"
      align="center"
      minH="100vh"
      color="gray.900"
      bg="gray.200"
    >
      <Box borderRadius="md" size="lg" bg="white" maxW="4xl" p={4} mt="10vh">
        <Text fontSize="xl" textAlign="center" fontWeight="bold">
          Add Students
        </Text>
        <Text fontSize="sm" mb={2}>
          Fill in the details below to add a student to the system
        </Text>
        <Box align="start">
          <Table.ScrollArea borderWidth="1px" rounded="md">
            <Table.Root size="sm" stickyHeader>
              <Table.Header>
                <Table.Row bg="primary">
                  <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                    First name
                  </Table.ColumnHeader>

                  <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                    Last name
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                    Role
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                    Departments
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {FakeStudents.map((s) => (
                  <Table.Row bg="white" key={s.id}>
                    <Table.Cell textAlign="center">
                      <Input
                        name="firstname"
                        value={form.firstName}
                        borderColor="gray.400"
                        _focus={{ borderColor: "primary" }}
                        onChange={(e) =>
                          setForm({ ...form, firstName: e.target.value })
                        }
                      />
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      {" "}
                      <Input
                        name="firstname"
                        value={form.lastName}
                        borderColor="gray.400"
                        _focus={{ borderColor: "primary" }}
                        onChange={(e) =>
                          setForm({ ...form, lastName: e.target.value })
                        }
                      />
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Input
                        name="role"
                        value={form.role}
                        borderColor="gray.400"
                        disabled
                        _focus={{ borderColor: "primary" }}
                        onChange={(e) =>
                          setForm({ ...form, role: e.target.value })
                        }
                      />
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Input
                        name="firstname"
                        value={form.department}
                        borderColor="gray.400"
                        _focus={{ borderColor: "primary" }}
                        onChange={(e) =>
                          setForm({ ...form, department: e.target.value })
                        }
                      />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Box>

        <Button type="submit" w="full" mt={2} borderRadius="md" bg="secondary">
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default MNewStudent;
