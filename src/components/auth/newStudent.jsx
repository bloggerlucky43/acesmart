import {
  Box,
  Text,
  Fieldset,
  NativeSelect,
  Input,
  Button,
  Field,
  Flex,
  SimpleGrid,
} from "@chakra-ui/react";
import { PasswordInput } from "../ui/password-input";
import { useState } from "react";

const NewStudent = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "student",
    school: "Adeleke",
    class: "",
    department: "",
  });

  return (
    <Flex
      rounded="md"
      mt="12vh"
      ml="18vw"
      justifySelf={"center"}
      w="70%"
      p={4}
      color="gray.900"
      bg="gray.200">
      <Fieldset.Root size="lg" maxW="4xl">
        <form>
          <Box>
            <Text fontSize="xl" fontWeight="bold">
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
                  placeholder="Enter your l name"
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
                  placeholder="Enter your name"
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
                  Email
                  <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  name="email"
                  placeholder="Enter your email address"
                  type="email"
                  value={form.email}
                  borderColor="gray.800"
                  _focus={{ outline: "none", borderColor: "primary" }}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </Field.Root>
              <Field.Root required>
                <Field.Label>
                  Username
                  <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  name="username"
                  placeholder="Enter your username"
                  type="text"
                  value={form.username}
                  borderColor="gray.800"
                  _focus={{ outline: "none", borderColor: "primary" }}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  required
                />
              </Field.Root>
              <Field.Root required>
                <Field.Label>
                  Role
                  <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  name="role"
                  type="text"
                  value={form.role}
                  borderColor="gray.800"
                  disabled
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label>
                  Department
                  <Field.RequiredIndicator />
                </Field.Label>
                <NativeSelect.Root
                  size="sm"
                  value={form.value}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }>
                  <NativeSelect.Field
                    borderColor="gray.800"
                    _focus={{ outline: "none", borderColor: "primary" }}>
                    <option value="science">Science</option>
                    <option value="arts">Arts</option>
                    <option value="commercial">Commercial</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>
              <Field.Root required>
                <Field.Label>
                  Class
                  <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  name="class"
                  placeholder="Enter your current class"
                  type="text"
                  value={form.class}
                  borderColor="gray.800"
                  _focus={{ outline: "none", borderColor: "primary" }}
                  onChange={(e) => setForm({ ...form, class: e.target.value })}
                  required
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label>
                  Password
                  <Field.RequiredIndicator />
                </Field.Label>
                <PasswordInput
                  value={form.password}
                  borderColor="gray.800"
                  _focus={{ outline: "none", borderColor: "primary" }}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </Field.Root>
              <Field.Root required>
                <Field.Label>
                  Confirm Password
                  <Field.RequiredIndicator />
                </Field.Label>
                <PasswordInput
                  value={form.confirmPassword}
                  borderColor="gray.800"
                  _focus={{ outline: "none", borderColor: "primary" }}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  required
                />
              </Field.Root>
            </SimpleGrid>
          </Fieldset.Content>
          <Button type="submit" w="full" mt={2} borderRadius="md" bg="primary">
            Apply
          </Button>
        </form>
      </Fieldset.Root>
    </Flex>
  );
};

export default NewStudent;
