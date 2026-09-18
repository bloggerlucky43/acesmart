import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Field,
  Icon,
  Badge,
  HStack,
  PinInput,
} from "@chakra-ui/react";
import { PasswordInput } from "../../components/ui/password-input";
import { useNavigate, Link } from "react-router-dom";
import {
  requestPasswordReset,
  verifyResetOtp,
  resetPassword,
} from "../../api-endpoint/auth/auths";
import { toaster } from "../../components/ui/toaster";
import { FaArrowLeft, FaEnvelope, FaKey, FaLock, FaCheckCircle } from "react-icons/fa";

const RESEND_COOLDOWN_SECONDS = 60;
const OTP_LENGTH = 6;

const STEP_META = {
  email: {
    title: "Forgot your password?",
    subtitle:
      "Enter the email linked to your AceSmart account and we'll send you a 6-digit verification code.",
    icon: FaEnvelope,
  },
  otp: {
    title: "Check your inbox",
    subtitle:
      "We sent a 6-digit verification code to your email. Enter it below to continue.",
    icon: FaKey,
  },
  password: {
    title: "Set a new password",
    subtitle:
      "Your identity is verified. Choose a strong new password for your account.",
    icon: FaLock,
  },
};

export default function ForgotPasswordPage() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  // Ark's PinInput syncs each box from this array, so it must always be a
  // full-length array. A short array (e.g. "".split("")) writes `undefined`
  // into the empty boxes and breaks typing.
  const otpDigits = Array.from(
    { length: OTP_LENGTH },
    (_, index) => otp[index] || ""
  );

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRequestOtp = async (e, isResend = false) => {
    if (e) e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your account email.");
      return;
    }

    setLoading(true);
    try {
      const res = await requestPasswordReset({ email: email.trim() });
      setStep("otp");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      toaster.create({
        title: isResend ? "Code resent" : "Code sent",
        description: res?.message || "Check your email for the verification code.",
        type: "success",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send the verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.trim().length !== OTP_LENGTH) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyResetOtp({ email: email.trim(), otp: otp.trim() });
      if (!res?.success || !res?.resetToken) {
        setError(res?.message || "Invalid or expired code.");
        return;
      }
      setResetToken(res.resetToken);
      setStep("password");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.password.trim() || !form.confirmPassword.trim()) {
      setError("Please enter and confirm your new password.");
      return;
    }
    if (form.password.trim() !== form.confirmPassword.trim()) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.trim().length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({
        resetToken,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      if (!res?.success) {
        setError(res?.message || "Unable to reset password.");
        return;
      }
      setDone(true);
      toaster.create({
        title: "Password reset successful",
        description: "You can now sign in with your new password.",
        type: "success",
      });
      setTimeout(() => navigate("/login", { replace: true }), 1800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const meta = STEP_META[step] || STEP_META.email;
  const StepIcon = done ? FaCheckCircle : meta.icon;

  return (
    <Flex minH="100vh" w="100%" bg="#f8fafc" align="center" justify="center" p={6}>
      <Box w="100%" maxW="440px">
        <Button
          variant="ghost"
          size="sm"
          color="gray.500"
          mb={6}
          px={0}
          _hover={{ color: "#6A1B9A", bg: "transparent" }}
          onClick={() => navigate("/login")}
        >
          <Icon as={FaArrowLeft} mr={2} boxSize={3.5} />
          Back to Login
        </Button>

        <Box
          bg="white"
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.200"
          boxShadow="0 10px 30px rgba(46, 16, 82, 0.08)"
          p={{ base: 6, sm: 8 }}
        >
          <Flex align="center" gap={3} mb={6}>
            <Flex
              w="46px"
              h="46px"
              borderRadius="xl"
              bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
              align="center"
              justify="center"
              color="white"
              flexShrink={0}
            >
              <Icon as={StepIcon} boxSize={5} />
            </Flex>
            <Box>
              <Text fontSize="20px" fontWeight="900" color="gray.900" lineHeight="1.2">
                {done ? "All done!" : meta.title}
              </Text>
              <Text fontSize="13px" color="gray.500" mt={0.5}>
                {done
                  ? "Your password has been updated. Redirecting to login..."
                  : meta.subtitle}
              </Text>
            </Box>
          </Flex>

          {!done && (
            <HStack mb={5} gap={2}>
              {["email", "otp", "password"].map((name, index) => (
                <Box
                  key={name}
                  flex="1"
                  h="4px"
                  borderRadius="full"
                  bg={
                    ["email", "otp", "password"].indexOf(step) >= index
                      ? "#8E24AA"
                      : "gray.200"
                  }
                />
              ))}
            </HStack>
          )}

          {error && (
            <Box
              bg="red.50"
              border="1px solid"
              borderColor="red.200"
              borderRadius="xl"
              p={3}
              mb={5}
            >
              <Text fontSize="12px" color="red.600" fontWeight="600">
                {error}
              </Text>
            </Box>
          )}

          {!done && step === "email" && (
            <form onSubmit={handleRequestOtp}>
              <Field.Root required>
                <Field.Label fontSize="13px" fontWeight="700" color="gray.700">
                  Account Email
                </Field.Label>
                <Input
                  type="email"
                  placeholder="e.g. teacher@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                mt={6}
                bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
                color="white"
                borderRadius="xl"
                fontSize="15px"
                fontWeight="700"
                _hover={{ opacity: 0.95 }}
                loading={loading}
                loadingText="Sending code..."
              >
                Send Verification Code
              </Button>
            </form>
          )}

          {!done && step === "otp" && (
            <form onSubmit={handleVerifyOtp}>
              <Field.Root required>
                <Field.Label fontSize="13px" fontWeight="700" color="gray.700">
                  Verification Code
                </Field.Label>
                <PinInput.Root
                  value={otpDigits}
                  count={OTP_LENGTH}
                  onValueChange={(details) => setOtp(details.value.join(""))}
                  otp
                  placeholder=""
                >
                  <PinInput.HiddenInput />
                  <PinInput.Control w="100%" gap={2} justify="space-between">
                    {Array.from({ length: OTP_LENGTH }, (_, index) => (
                      <PinInput.Input
                        key={index}
                        index={index}
                        h="52px"
                        w="48px"
                        fontSize="20px"
                        fontWeight="700"
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="gray.300"
                        _focus={{
                          borderColor: "#6A1B9A",
                          boxShadow: "0 0 0 1px #6A1B9A",
                        }}
                      />
                    ))}
                  </PinInput.Control>
                </PinInput.Root>
              </Field.Root>

              <Button
                type="submit"
                w="100%"
                h="50px"
                mt={6}
                bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
                color="white"
                borderRadius="xl"
                fontSize="15px"
                fontWeight="700"
                _hover={{ opacity: 0.95 }}
                loading={loading}
                loadingText="Verifying..."
              >
                Verify Code
              </Button>

              <Flex justify="center" mt={4}>
                <Button
                  variant="ghost"
                  size="sm"
                  color="#6A1B9A"
                  disabled={loading || cooldown > 0}
                  onClick={() => handleRequestOtp(null, true)}
                  fontSize="12px"
                  _hover={{ bg: "purple.50" }}
                >
                  {cooldown > 0
                    ? `Resend code in ${cooldown}s`
                    : "Didn't get the code? Resend"}
                </Button>
              </Flex>
            </form>
          )}

          {!done && step === "password" && (
            <form onSubmit={handleResetPassword}>
              <Flex direction="column" gap={5}>
                <Field.Root required>
                  <Field.Label fontSize="13px" fontWeight="700" color="gray.700">
                    New Password
                  </Field.Label>
                  <PasswordInput
                    value={form.password}
                    placeholder="Enter a new password"
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

                <Field.Root required>
                  <Field.Label fontSize="13px" fontWeight="700" color="gray.700">
                    Confirm New Password
                  </Field.Label>
                  <PasswordInput
                    value={form.confirmPassword}
                    placeholder="Re-enter your new password"
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
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
              </Flex>

              <Button
                type="submit"
                w="100%"
                h="50px"
                mt={6}
                bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
                color="white"
                borderRadius="xl"
                fontSize="15px"
                fontWeight="700"
                _hover={{ opacity: 0.95 }}
                loading={loading}
                loadingText="Resetting password..."
                leftIcon={<Icon as={FaLock} />}
              >
                Reset Password
              </Button>
            </form>
          )}

          {done && (
            <Flex
              align="center"
              gap={3}
              bg="green.50"
              border="1px solid"
              borderColor="green.200"
              borderRadius="xl"
              p={4}
            >
              <Icon as={FaCheckCircle} color="green.500" boxSize={5} />
              <Text fontSize="13px" color="green.700" fontWeight="600">
                Password updated successfully.
              </Text>
            </Flex>
          )}

          {!done && (
            <Flex justify="center" mt={6} pt={5} borderTop="1px solid" borderColor="gray.100">
              <Badge
                bg="purple.50"
                color="#6A1B9A"
                borderRadius="full"
                px={3}
                py={1}
                fontSize="10px"
                fontWeight="700"
              >
                Secure email verification
              </Badge>
            </Flex>
          )}
        </Box>

        {!done && (
          <Text textAlign="center" fontSize="13px" color="gray.500" mt={6}>
            Remembered it?{" "}
            <Link
              to="/login"
              style={{ color: "#6A1B9A", fontWeight: "700", textDecoration: "underline" }}
            >
              Back to login
            </Link>
          </Text>
        )}
      </Box>
    </Flex>
  );
}
