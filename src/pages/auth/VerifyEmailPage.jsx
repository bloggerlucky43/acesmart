import { useEffect, useRef, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Field,
  Icon,
  Badge,
  PinInput,
} from "@chakra-ui/react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  verifyEmail,
  resendVerification,
} from "../../api-endpoint/auth/auths";
import { toaster } from "../../components/ui/toaster";
import { useAuth } from "../../libs/AuthProvider";
import { FaArrowLeft, FaEnvelope, FaKey, FaCheckCircle } from "react-icons/fa";

const RESEND_COOLDOWN_SECONDS = 60;
const OTP_LENGTH = 6;

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const initialEmail =
    location.state?.email ||
    new URLSearchParams(location.search).get("email") ||
    "";
  const codeAlreadySent = location.state?.justSent === true;
  const autoSend = location.state?.autoSend === true;

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [codeSent, setCodeSent] = useState(codeAlreadySent);
  const [cooldown, setCooldown] = useState(
    codeAlreadySent ? RESEND_COOLDOWN_SECONDS : 0
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const autoSentRef = useRef(false);

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

  const handleSendCode = async (e, { silent = false } = {}) => {
    if (e) e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter the email address you registered with.");
      return;
    }

    setLoading(true);
    try {
      const res = await resendVerification({ email: email.trim() });
      setCodeSent(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      if (!silent) {
        toaster.create({
          title: "Verification code sent",
          description: res?.message || "Check your email for the 6-digit code.",
          type: "success",
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send the verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!autoSend || autoSentRef.current) return;
    autoSentRef.current = true;
    handleSendCode(null, { silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSend]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.trim().length !== OTP_LENGTH) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyEmail({ email: email.trim(), otp: otp.trim() });

      toaster.create({
        title: "Email verified successfully!",
        description: "Welcome to AceSmart CBT.",
        type: "success",
      });

      localStorage.setItem("USER_KEY", JSON.stringify(res.data));
      setUser(res.data);

      if (res.data?.role === "institution_admin" || res.data?.role === "admin") {
        navigate("/institution/dashboard", { replace: true });
      } else {
        navigate("/teacher_dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

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
              <Icon as={codeSent ? FaKey : FaEnvelope} boxSize={5} />
            </Flex>
            <Box>
              <Text fontSize="20px" fontWeight="900" color="gray.900" lineHeight="1.2">
                {codeSent ? "Verify your email" : "Activate your account"}
              </Text>
              <Text fontSize="13px" color="gray.500" mt={0.5}>
                {codeSent
                  ? `Enter the 6-digit code we sent to ${email}.`
                  : "Confirm your email address to finish creating your AceSmart account."}
              </Text>
            </Box>
          </Flex>

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

          {!codeSent && (
            <form onSubmit={(e) => handleSendCode(e)}>
              <Field.Root required>
                <Field.Label fontSize="13px" fontWeight="700" color="gray.700">
                  Account Email
                </Field.Label>
                <Input
                  type="email"
                  placeholder="e.g. admin@school.ng"
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

          {codeSent && (
            <form onSubmit={handleVerify}>
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
                Verify &amp; Activate Account
              </Button>

              <Flex justify="center" mt={4}>
                <Button
                  variant="ghost"
                  size="sm"
                  color="#6A1B9A"
                  disabled={loading || cooldown > 0}
                  onClick={() => handleSendCode(null, { silent: false })}
                  fontSize="12px"
                  _hover={{ bg: "purple.50" }}
                >
                  {cooldown > 0
                    ? `Resend code in ${cooldown}s`
                    : "Didn't get the code? Resend"}
                </Button>
              </Flex>

              <Flex justify="center" mt={2}>
                <Button
                  variant="ghost"
                  size="sm"
                  color="gray.500"
                  fontSize="12px"
                  _hover={{ color: "#6A1B9A", bg: "transparent" }}
                  onClick={() => {
                    setCodeSent(false);
                    setOtp("");
                    setError("");
                  }}
                >
                  Use a different email
                </Button>
              </Flex>
            </form>
          )}

          {!codeSent && (
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
                <Icon as={FaCheckCircle} mr={1} boxSize={2.5} />
                Secure email verification
              </Badge>
            </Flex>
          )}
        </Box>

        <Text textAlign="center" fontSize="13px" color="gray.500" mt={6}>
          Already verified?{" "}
          <Link
            to="/login"
            style={{ color: "#6A1B9A", fontWeight: "700", textDecoration: "underline" }}
          >
            Sign in
          </Link>
        </Text>
      </Box>
    </Flex>
  );
}
