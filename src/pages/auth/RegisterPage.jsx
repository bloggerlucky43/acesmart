import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Field,
  Icon,
  Badge,
  SimpleGrid,
} from "@chakra-ui/react";
import { PasswordInput } from "../../components/ui/password-input";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../api-endpoint/auth/auths";
import { toaster } from "../../components/ui/toaster";
import { useAuth } from "../../libs/AuthProvider";
import {
  FaBrain,
  FaArrowLeft,
  FaSchool,
  FaShieldAlt,
  FaCheckCircle,
  FaUsers,
  FaFileAlt,
} from "react-icons/fa";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "institution", // Default to institution
    phoneNumber: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const isLongEnough = password.length >= 6;

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

    const validationError = validatePassword(form.password);
    if (validationError) {
      toaster.create({
        title: validationError,
        type: "error",
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      toaster.create({
        title: "Passwords do not match",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await registerUser(form);

      if (res.success) {
        toaster.create({
          title: "Account Created Successfully!",
          description: "Welcome to AceSmart CBT.",
          type: "success",
        });

        setUser(res.data);
        localStorage.setItem("USER_KEY", JSON.stringify(res.data));

        if (res.data?.role === "institution_admin" || form.role === "institution") {
          navigate("/institution/dashboard", { replace: true });
        } else {
          navigate("/teacher_dashboard", { replace: true });
        }
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.error || "Registration failed. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" w="100%" bg="#f8fafc">
      {/* Left Branding Showcase Panel (Desktop) */}
      <Box
        display={{ base: "none", lg: "flex" }}
        w={{ lg: "45%", xl: "42%" }}
        bg="linear-gradient(145deg, #18092B 0%, #2E1052 50%, #4A154B 100%)"
        color="white"
        p={12}
        flexDirection="column"
        justifyContent="space-between"
        position="relative"
        overflow="hidden"
      >
        {/* Ambient Glows */}
        <Box
          position="absolute"
          top="-10%"
          right="-10%"
          w="400px"
          h="400px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(142,36,170,0.35) 0%, rgba(0,0,0,0) 70%)"
          pointerEvents="none"
        />

        {/* Top Logo */}
        <Flex align="center" gap={3} zIndex={2}>
          <Flex
            w="44px"
            h="44px"
            borderRadius="xl"
            bg="rgba(255, 255, 255, 0.12)"
            backdropFilter="blur(10px)"
            border="1px solid rgba(255, 255, 255, 0.2)"
            align="center"
            justify="center"
            color="white"
          >
            <Icon as={FaBrain} boxSize={5} />
          </Flex>
          <Text fontSize="22px" fontWeight="800" letterSpacing="-0.5px">
            Ace<span style={{ color: "#D8B4FE" }}>Smart</span>
          </Text>
          <Badge
            bg="rgba(168, 85, 247, 0.25)"
            color="#E9D5FF"
            border="1px solid rgba(168, 85, 247, 0.4)"
            px={2.5}
            py={0.5}
            borderRadius="full"
            fontSize="11px"
            fontWeight="700"
          >
            Institution Portal
          </Badge>
        </Flex>

        {/* Hero Narrative */}
        <Box zIndex={2} my="auto" maxW="460px">
          <Text
            fontSize="32px"
            fontWeight="900"
            lineHeight="1.2"
            letterSpacing="-0.02em"
            mb={4}
          >
            Deploy your school's official CBT center in{" "}
            <span style={{ color: "#C084FC" }}>under 5 minutes</span>.
          </Text>
          <Text fontSize="14px" color="rgba(255, 255, 255, 0.75)" mb={8} lineHeight="1.6">
            Get instant access to automated grading, AI weakness diagnostics, biometric face-verification, and past question banks.
          </Text>

          {/* Institutional Perquisites */}
          <Flex direction="column" gap={3.5}>
            <Flex align="center" gap={3}>
              <Flex
                w="32px"
                h="32px"
                borderRadius="lg"
                bg="rgba(255, 255, 255, 0.1)"
                align="center"
                justify="center"
                color="#A78BFA"
              >
                <Icon as={FaSchool} boxSize={4} />
              </Flex>
              <Text fontSize="14px" fontWeight="600" color="gray.200">
                School-Branded Examination Slips & PDF Result Sheets
              </Text>
            </Flex>

            <Flex align="center" gap={3}>
              <Flex
                w="32px"
                h="32px"
                borderRadius="lg"
                bg="rgba(255, 255, 255, 0.1)"
                align="center"
                justify="center"
                color="#A78BFA"
              >
                <Icon as={FaUsers} boxSize={4} />
              </Flex>
              <Text fontSize="14px" fontWeight="600" color="gray.200">
                Bulk Student Import & Face Profile Biometrics
              </Text>
            </Flex>

            <Flex align="center" gap={3}>
              <Flex
                w="32px"
                h="32px"
                borderRadius="lg"
                bg="rgba(255, 255, 255, 0.1)"
                align="center"
                justify="center"
                color="#A78BFA"
              >
                <Icon as={FaFileAlt} boxSize={4} />
              </Flex>
              <Text fontSize="14px" fontWeight="600" color="gray.200">
                AI Auto-Tagged Question Banks (Math, Sciences, Arts)
              </Text>
            </Flex>
          </Flex>
        </Box>

        {/* Guarantee Pill */}
        <Flex
          zIndex={2}
          bg="rgba(255, 255, 255, 0.08)"
          backdropFilter="blur(12px)"
          border="1px solid rgba(255, 255, 255, 0.15)"
          p={3.5}
          borderRadius="2xl"
          align="center"
          gap={3}
        >
          <Icon as={FaShieldAlt} color="#C084FC" boxSize={5} />
          <Text fontSize="13px" color="gray.200">
            No credit card required. Free tier includes up to 50 active candidates.
          </Text>
        </Flex>
      </Box>

      {/* Right Register Form Panel */}
      <Flex
        flex="1"
        align="center"
        justify="center"
        p={{ base: 6, sm: 10, md: 12 }}
        position="relative"
        overflowY="auto"
      >
        <Box maxW="520px" w="100%" py={6} className="animate-scale-in">
          {/* Back to Home link */}
          <Button
            variant="ghost"
            size="sm"
            color="gray.500"
            mb={5}
            px={0}
            _hover={{ color: "#6A1B9A", bg: "transparent" }}
            onClick={() => navigate("/")}
          >
            <Icon as={FaArrowLeft} mr={2} boxSize={3.5} />
            Back to Home
          </Button>

          {/* Heading */}
          <Box mb={4}>
            <Text fontSize="28px" fontWeight="900" color="gray.900" letterSpacing="-0.5px">
              {form.role === "institution" ? "Register Your Institution" : "Register Educator Account"}
            </Text>
            <Text fontSize="14px" color="gray.500" mt={1}>
              {form.role === "institution"
                ? "Deploy your school's official branded CBT portal, fees & staff management"
                : "Create your personal educator profile to launch standalone CBT tests"}
            </Text>
          </Box>

          {/* Account Type Selector */}
          <Box mb={6} p={1.5} bg="#F1F5F9" borderRadius="2xl">
            <Flex gap={2}>
              <Button
                flex={1}
                h="42px"
                borderRadius="xl"
                variant={form.role === "institution" ? "solid" : "ghost"}
                bg={form.role === "institution" ? "white" : "transparent"}
                color={form.role === "institution" ? "#6A1B9A" : "#64748B"}
                boxShadow={form.role === "institution" ? "0 2px 8px rgba(0,0,0,0.08)" : "none"}
                fontWeight="800"
                fontSize="13px"
                onClick={() => setForm({ ...form, role: "institution" })}
              >
                <Icon as={FaSchool} mr={2} />
                School / Institution
              </Button>

              <Button
                flex={1}
                h="42px"
                borderRadius="xl"
                variant={form.role === "teacher" ? "solid" : "ghost"}
                bg={form.role === "teacher" ? "white" : "transparent"}
                color={form.role === "teacher" ? "#6A1B9A" : "#64748B"}
                boxShadow={form.role === "teacher" ? "0 2px 8px rgba(0,0,0,0.08)" : "none"}
                fontWeight="800"
                fontSize="13px"
                onClick={() => setForm({ ...form, role: "teacher" })}
              >
                <Icon as={FaUsers} mr={2} />
                Independent Educator
              </Button>
            </Flex>
          </Box>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap={4}>
              <Field.Root required>
                <Field.Label fontSize="13px" fontWeight="700" color="gray.700">
                  Full Name / Institution Name
                </Field.Label>
                <Input
                  name="name"
                  placeholder="e.g. Dr. Jane Okon or Apex Academy"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  h="46px"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: "#6A1B9A",
                    boxShadow: "0 0 0 1px #6A1B9A",
                  }}
                  required
                />
              </Field.Root>

              <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                <Field.Root required>
                  <Field.Label fontSize="13px" fontWeight="700" color="gray.700">
                    Email Address
                  </Field.Label>
                  <Input
                    name="email"
                    placeholder="admin@school.ng"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    h="46px"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "#6A1B9A",
                      boxShadow: "0 0 0 1px #6A1B9A",
                    }}
                    required
                  />
                </Field.Root>

                <Field.Root required>
                  <Field.Label fontSize="13px" fontWeight="700" color="gray.700">
                    Phone Number
                  </Field.Label>
                  <Input
                    name="phoneNumber"
                    placeholder="0801 234 5678"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) =>
                      setForm({ ...form, phoneNumber: e.target.value })
                    }
                    h="46px"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "#6A1B9A",
                      boxShadow: "0 0 0 1px #6A1B9A",
                    }}
                    required
                  />
                </Field.Root>
              </SimpleGrid>

              <Field.Root required>
                <Field.Label fontSize="13px" fontWeight="700" color="gray.700">
                  Username
                </Field.Label>
                <Input
                  name="username"
                  placeholder="Choose a unique username"
                  type="text"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  h="46px"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: "#6A1B9A",
                    boxShadow: "0 0 0 1px #6A1B9A",
                  }}
                  required
                />
              </Field.Root>

              <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                <Field.Root required>
                  <Field.Label fontSize="13px" fontWeight="700" color="gray.700">
                    Password
                  </Field.Label>
                  <PasswordInput
                    value={form.password}
                    placeholder="At least 6 chars"
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    h="46px"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "#6A1B9A",
                      boxShadow: "0 0 0 1px #6A1B9A",
                    }}
                    required
                  />
                </Field.Root>

                <Field.Root required>
                  <Field.Label fontSize="13px" fontWeight="700" color="gray.700">
                    Confirm Password
                  </Field.Label>
                  <PasswordInput
                    value={form.confirmPassword}
                    placeholder="Repeat password"
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    h="46px"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "#6A1B9A",
                      boxShadow: "0 0 0 1px #6A1B9A",
                    }}
                    required
                  />
                </Field.Root>
              </SimpleGrid>

              <Button
                type="submit"
                w="100%"
                h="50px"
                mt={3}
                bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
                color="white"
                borderRadius="xl"
                fontSize="15px"
                fontWeight="700"
                boxShadow="0 4px 14px rgba(106, 27, 154, 0.3)"
                _hover={{
                  opacity: 0.95,
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 18px rgba(106, 27, 154, 0.4)",
                }}
                loading={loading}
                loadingText="Creating account..."
                transition="all 0.2s"
              >
                Create Institution Account
              </Button>
            </Flex>
          </form>

          {/* Switch to Login */}
          <Flex
            mt={6}
            pt={5}
            borderTop="1px solid"
            borderColor="gray.200"
            justify="center"
            align="center"
            gap={2}
          >
            <Text fontSize="14px" color="gray.600">
              Already have an account?
            </Text>
            <Link
              to="/login"
              style={{
                color: "#6A1B9A",
                fontWeight: "700",
                fontSize: "14px",
                textDecoration: "underline",
              }}
            >
              Sign In
            </Link>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
}
