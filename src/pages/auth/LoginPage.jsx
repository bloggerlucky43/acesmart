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
} from "@chakra-ui/react";
import { PasswordInput } from "../../components/ui/password-input";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../api-endpoint/auth/auths";
import { toaster } from "../../components/ui/toaster";
import { useAuth } from "../../libs/AuthProvider";
import {
  FaBrain,
  FaArrowLeft,
  FaShieldAlt,
  FaChartLine,
  FaGraduationCap,
  FaCheckCircle,
} from "react-icons/fa";

export default function LoginPage() {
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
        toaster.create({
          title: "Welcome back!",
          description: "Login successful.",
          type: "success",
        });

        localStorage.setItem("USER_KEY", JSON.stringify(res.data));
        setUser(res.data);
        if (res.data.role === "institution_admin") {
          navigate("/institution/dashboard", { replace: true });
        } else {
          navigate("/teacher_dashboard", { replace: true });
        }
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.error || "Login failed. Please check your credentials.",
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
        w={{ lg: "48%", xl: "45%" }}
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
        <Box
          position="absolute"
          bottom="-5%"
          left="-10%"
          w="350px"
          h="350px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(106,27,154,0.4) 0%, rgba(0,0,0,0) 70%)"
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
            CBT Cloud 2.0
          </Badge>
        </Flex>

        {/* Hero Narrative */}
        <Box zIndex={2} my="auto" maxW="480px">
          <Text
            fontSize="34px"
            fontWeight="900"
            lineHeight="1.2"
            letterSpacing="-0.02em"
            mb={4}
          >
            Empower your institution with{" "}
            <span style={{ color: "#C084FC" }}>AI-driven CBT</span> examinations.
          </Text>
          <Text fontSize="15px" color="rgba(255, 255, 255, 0.75)" mb={8} lineHeight="1.6">
            Log in to manage questions, schedule proctored exams, detect candidate learning gaps, and review real-time anomaly tracking.
          </Text>

          {/* Feature highlights */}
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
                <Icon as={FaShieldAlt} boxSize={4} />
              </Flex>
              <Text fontSize="14px" fontWeight="600" color="gray.200">
                AI Proctoring & Tab Switch Anomaly Flagging
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
                <Icon as={FaChartLine} boxSize={4} />
              </Flex>
              <Text fontSize="14px" fontWeight="600" color="gray.200">
                Personalized Weak Area Diagnostics & Class Readiness
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
                <Icon as={FaGraduationCap} boxSize={4} />
              </Flex>
              <Text fontSize="14px" fontWeight="600" color="gray.200">
                50,000+ JAMB, WAEC & NECO Question Bank
              </Text>
            </Flex>
          </Flex>
        </Box>

        {/* Bottom Social Proof */}
        <Flex
          zIndex={2}
          bg="rgba(255, 255, 255, 0.08)"
          backdropFilter="blur(12px)"
          border="1px solid rgba(255, 255, 255, 0.15)"
          p={4}
          borderRadius="2xl"
          align="center"
          gap={3.5}
        >
          <Flex
            w="36px"
            h="36px"
            borderRadius="full"
            bg="green.500"
            color="white"
            align="center"
            justify="center"
            flexShrink={0}
          >
            <Icon as={FaCheckCircle} boxSize={4} />
          </Flex>
          <Box>
            <Text fontSize="13px" fontWeight="700">
              Trusted by 120+ Secondary Schools & Tutorial Centers
            </Text>
            <Text fontSize="12px" color="rgba(255, 255, 255, 0.65)">
              Grading over 150,000+ CBT exams with 99.9% uptime
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* Right Login Form Panel */}
      <Flex
        flex="1"
        align="center"
        justify="center"
        p={{ base: 6, sm: 10, md: 14 }}
        position="relative"
      >
        <Box maxW="440px" w="100%" className="animate-scale-in">
          {/* Back to Home link */}
          <Button
            variant="ghost"
            size="sm"
            color="gray.500"
            mb={6}
            px={0}
            _hover={{ color: "#6A1B9A", bg: "transparent" }}
            onClick={() => navigate("/")}
          >
            <Icon as={FaArrowLeft} mr={2} boxSize={3.5} />
            Back to Home
          </Button>

          {/* Heading */}
          <Box mb={8}>
            <Text fontSize="28px" fontWeight="900" color="gray.900" letterSpacing="-0.5px">
              Teacher & Admin Login
            </Text>
            <Text fontSize="14px" color="gray.500" mt={1}>
              Sign in to manage your exams, students, and institutional analytics
            </Text>
          </Box>

          {/* Form */}
          <form onSubmit={handleLogin}>
            <Flex direction="column" gap={5}>
              <Field.Root required>
                <Field.Label fontSize="13px" fontWeight="700" color="gray.700">
                  Username or Email
                </Field.Label>
                <Input
                  name="usernameoremail"
                  placeholder="e.g. teacher@school.edu or admin"
                  type="text"
                  value={form.usernameOrEmail}
                  onChange={(e) =>
                    setForm({ ...form, usernameOrEmail: e.target.value })
                  }
                  h="48px"
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
                <Flex justify="space-between" align="center" w="100%">
                  <Field.Label fontSize="13px" fontWeight="700" color="gray.700">
                    Password
                  </Field.Label>
                </Flex>
                <PasswordInput
                  value={form.password}
                  placeholder="Enter your account password"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  h="48px"
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
                loadingText="Signing in..."
                transition="all 0.2s"
              >
                Sign In to Dashboard
              </Button>
            </Flex>
          </form>

          {/* Switch to Register */}
          <Flex
            mt={8}
            pt={6}
            borderTop="1px solid"
            borderColor="gray.200"
            justify="center"
            align="center"
            gap={2}
          >
            <Text fontSize="14px" color="gray.600">
              Don't have an institution account?
            </Text>
            <Link
              to="/register"
              style={{
                color: "#6A1B9A",
                fontWeight: "700",
                fontSize: "14px",
                textDecoration: "underline",
              }}
            >
              Register School
            </Link>
          </Flex>

          {/* Quick exam access shortcut */}
          <Box mt={6} p={4} borderRadius="xl" bg="purple.50" border="1px solid" borderColor="purple.100">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="13px" fontWeight="700" color="#6A1B9A">
                  Are you a student taking an exam?
                </Text>
                <Text fontSize="12px" color="gray.600">
                  You don't need a teacher account to test.
                </Text>
              </Box>
              <Button
                size="xs"
                bg="#6A1B9A"
                color="white"
                borderRadius="lg"
                onClick={() => navigate("/take_exam")}
              >
                Take Exam
              </Button>
            </Flex>
          </Box>

          {/* Student & Parent Portal shortcut */}
          <Box mt={3} p={4} borderRadius="xl" bg="blue.50" border="1px solid" borderColor="blue.100">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="13px" fontWeight="700" color="#1D4ED8">
                  Student & Parent Portal
                </Text>
                <Text fontSize="12px" color="gray.600">
                  Check term school fees, pay online & unlock report cards
                </Text>
              </Box>
              <Button
                size="xs"
                bg="#1D4ED8"
                color="white"
                borderRadius="lg"
                onClick={() => navigate("/student/portal")}
              >
                Enter Portal
              </Button>
            </Flex>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}
