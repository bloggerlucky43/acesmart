import { Box, Fieldset, Input, Button, Field } from "@chakra-ui/react";
import { PasswordInput } from "../../components/ui/password-input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toaster } from "../ui/toaster";
import { registerUser } from "../../api-endpoint/auth/auths";
import { useAuth } from "../../libs/AuthProvider";
const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "teacher",
    phoneNumber: "",

    username: "",
    password: "",
    confirmPassword: "",
  });
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const isLongEnough = password.length > 6;

    if (!isLongEnough) {
      return "Password must be at least 6 characters long.";
    }
    if (!hasNumber) {
      return "Password must contain at least one number.";
    }

    if (!hasLetter) {
      return "Password must contain at least one letter.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const validationError = validatePassword(form.password);

    if (validationError) {
      toaster.create({
        title: validationError,
        type: "error",
      });
      setLoading(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      toaster.create({
        title: "Passwords do not match",
        type: "error",
      });
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await registerUser(form);

      if (res.success) {
        toaster.create({
          title: "Registration successful",
          type: "success",
        });

        setUser(res.data);
        localStorage.setItem("USER_KEY", JSON.stringify(res.data));
        navigate("/teacher_dashboard");
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.error,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box rounded="md" w="100%" color="gray.900">
      <Fieldset.Root size="lg" maxW="md">
        <form onSubmit={handleSubmit}>
          <Fieldset.Content display="flex" w="full">
            <Field.Root mt={4} required>
              <Field.Label>
                Full name
                <Field.RequiredIndicator />
              </Field.Label>
              <Input
                name="name"
                placeholder="Enter your name"
                value={form.name}
                borderColor="gray.800"
                _focus={{ outline: "none", borderColor: "primary" }}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label>
                Phone Number
                <Field.RequiredIndicator />
              </Field.Label>
              <Input
                name="phone"
                placeholder="Enter your phone number"
                type="text"
                value={form.phoneNumber}
                borderColor="gray.800"
                _focus={{ outline: "none", borderColor: "primary" }}
                onChange={(e) =>
                  setForm({ ...form, phoneNumber: e.target.value })
                }
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
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
          </Fieldset.Content>
          <Button
            type="submit"
            w="full"
            mt={2}
            borderRadius="md"
            bg="primary"
            loading={loading}
            loadingText="Registering..."
            spinnerPlacement="start"
          >
            Apply
          </Button>
        </form>
      </Fieldset.Root>
    </Box>
  );
};
export default Register;
