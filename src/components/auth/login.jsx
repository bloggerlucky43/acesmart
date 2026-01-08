import { Box, Fieldset, Input, Button, Field } from "@chakra-ui/react";
import { PasswordInput } from "../ui/password-input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api-endpoint/auth/auths";
import { toaster } from "../ui/toaster";
import { useAuth } from "../../libs/AuthProvider";
const Login = () => {
  const [form, setForm] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginUser(form);

      if (res.success) {
        toaster.success({
          title: "Login successful" || res?.message,
        });

        localStorage.setItem("USER_KEY", JSON.stringify(res.data));
        setUser(res.data);
        navigate("/teacher_dashboard", { replace: true });
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
        <form onSubmit={handleLogin}>
          <Fieldset.Content display="flex" w="full">
            <Field.Root required>
              <Field.Label>
                Username or Email
                <Field.RequiredIndicator />
              </Field.Label>
              <Input
                name="usernameoremail"
                placeholder="Enter your username or email address"
                type="text"
                value={form.usernameOrEmail}
                borderColor="gray.800"
                _focus={{ outline: "none", borderColor: "primary" }}
                onChange={(e) =>
                  setForm({ ...form, usernameOrEmail: e.target.value })
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
            loadingText="Authenticating..."
            spinnerPlacement="start"
          >
            Login
          </Button>
        </form>
      </Fieldset.Root>
    </Box>
  );
};
export default Login;
