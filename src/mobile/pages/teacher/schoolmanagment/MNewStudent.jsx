import {
  Box,
  Text,
  Input,
  Button,
  Field,
  Flex,
  Table,
  Fieldset,
  SimpleGrid,
} from "@chakra-ui/react";
import { addStudent } from "../../../../api-endpoint/student/students";
import { useState } from "react";
import { toaster } from "../../../../components/ui/toaster";
const MNewStudent = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    studentemail: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!form.firstName || !form.lastName || !form.studentemail) {
        toaster.warning({ title: "All fields are required" });
        setLoading(false);
        return;
      }

      setLoading(true);
      const res = await addStudent(form);
      if (res.success && res.message === "Student Added Successfully") {
        toaster.create({
          title: "Student added successfully",
          type: "success",
        });
        setForm({});
      }
    } catch (error) {
      console.error("Error adding student", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      bg="gray.200"
      p={4}
      align="center"
      justify="center"
      mt="7vh"
      minH="100vh"
    >
      <Flex
        rounded="md"
        justifySelf={"center"}
        py={12}
        px={4}
        maxH="80vh"
        alignSelf="center"
        color="gray.900"
        bg="white"
      >
        <Fieldset.Root size="lg" maxW="lg">
          <form onSubmit={handleSubmit}>
            <Box>
              <Text fontSize="xl" mt={2} fontWeight="bold">
                Add New Student
              </Text>
              <Text mb={2}>
                Fill in the details below to add a student to the system
              </Text>
            </Box>
            <Fieldset.Content>
              <SimpleGrid columns={1} gap={4}>
                <Field.Root required>
                  <Field.Label>
                    First name
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    name="name"
                    placeholder="Enter your firstname"
                    value={form.firstName}
                    borderColor="gray.800"
                    _focus={{ outline: "none", borderColor: "primary" }}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                    required
                  />
                </Field.Root>
                <Field.Root required>
                  <Field.Label>
                    Last name
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    name="lastname"
                    placeholder="Enter your surname"
                    value={form.lastName}
                    borderColor="gray.800"
                    _focus={{ outline: "none", borderColor: "primary" }}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                    required
                  />
                </Field.Root>
                <Field.Root required>
                  <Field.Label>
                    Student Email
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="e.g example@gmail.com"
                    value={form.studentemail}
                    borderColor="gray.800"
                    _focus={{ outline: "none", borderColor: "primary" }}
                    onChange={(e) =>
                      setForm({ ...form, studentemail: e.target.value })
                    }
                    required
                  />
                </Field.Root>
              </SimpleGrid>
            </Fieldset.Content>
            <Button
              type="submit"
              w="full"
              mt={2}
              borderRadius="md"
              bg="primary"
              loading={loading}
              spinnerPlacement="center"
            >
              Apply
            </Button>
          </form>
        </Fieldset.Root>
      </Flex>
    </Box>
  );
};
export default MNewStudent;
