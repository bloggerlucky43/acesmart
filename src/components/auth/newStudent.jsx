import {
  Box,
  Text,
  Fieldset,
  Input,
  Button,
  Field,
  Flex,
  SimpleGrid,
} from "@chakra-ui/react";
import { useState } from "react";
import { addStudent } from "../../api-endpoint/student/students";
import { toaster } from "../ui/toaster";

const NewStudent = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    studentemail: "",
  });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.firstName || !form.lastName || !form.studentemail) {
      toaster.warning({ title: "All fields are required" });
      setLoading(false);
      return;
    }

    setLoading(true);
    const res = await addStudent(form);

    console.log("at res", res);

    if (res.success && res.message === "Student Added Successfully") {
      toaster.create({ title: "Student added successfully", type: "success" });
      setLoading(false);
    }
  };
  return (
    <Flex
      rounded="md"
      mt="9vh"
      ml="200px"
      justifySelf={"center"}
      w={"calc(100% - 200px)"}
      p={4}
      minH="100vh"
      color="gray.900"
      bg="gray.200"
    >
      <Fieldset.Root size="lg" maxW="4xl">
        <form onSubmit={handleSubmit}>
          <Box>
            <Text fontSize="xl" mt={4} fontWeight="bold">
              Add New Student
            </Text>
            <Text mb={4}>
              Fill in the details below to add a student to the system
            </Text>
          </Box>
          <Fieldset.Content>
            <SimpleGrid columns={2} gap={4}>
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
  );
};

export default NewStudent;
