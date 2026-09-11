import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Button,
  Text,
  Input,
  Icon,
  Badge,
  HStack,
  VStack,
  Field,
} from "@chakra-ui/react";
import { PasswordInput } from "../../components/ui/password-input";
import {
  FaShieldAlt,
  FaLaptop,
  FaArrowRight,
  FaGraduationCap,
} from "react-icons/fa";
import { useState } from "react";
import { toaster } from "../../components/ui/toaster";
import { examLogin } from "../../api-endpoint/exam/exams";

const ExamLoginPage = () => {
  const [examDetail, setExamDetail] = useState({
    studentId: "",
    firstName: "",
  });
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (window.innerWidth < 768) {
      toaster.warning({
        title: "Desktop Screen Recommended",
        description: "For optimal testing experience and diagram rendering, please use a PC or laptop.",
      });
    }

    if (!examDetail.firstName?.trim() || !examDetail.studentId?.trim()) {
      toaster.error({ title: "Please enter your Registration Number and Password" });
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await examLogin(examDetail);
      if (res.success) {
        toaster.create({
          title: "Candidate Verified Successfully",
          type: "success",
        });

        localStorage.setItem(
          "examStudent",
          JSON.stringify({ ...res.student, examId: id })
        );
        navigate(`/ex/${id}`);
      } else {
        setError(res.message || "Invalid candidate credentials. Please check details.");
      }
    } catch (err) {
      setError("Authentication failed. Please verify your Student ID and Password.");
    } finally {
      setLoading(false);
    }
  };

  const handlePracticeMode = () => {
    const demoStudent = {
      id: "demo-student-001",
      studentId: "CBT-PRACTICE-01",
      firstName: "Practice",
      lastName: "Candidate",
    };
    localStorage.setItem("examStudent", JSON.stringify(demoStudent));
    navigate("/take_exam");
  };

  return (
    <Box
      minH="100vh"
      w="100%"
      bg="#0F172A"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={{ base: 4, md: 8 }}
    >
      {/* Main Candidate Card */}
      <Box
        w="100%"
        maxW="460px"
        bg="#1E293B"
        borderRadius="20px"
        border="1px solid #334155"
        p={{ base: 6, sm: 8 }}
        boxShadow="0 20px 40px rgba(0, 0, 0, 0.4)"
      >
        {/* Brand Header */}
        <VStack spacing={2.5} align="center" mb={6}>
          <Flex
            w="52px"
            h="52px"
            borderRadius="16px"
            bg="#2563EB"
            align="center"
            justify="center"
            boxShadow="0 4px 14px rgba(37, 99, 235, 0.35)"
          >
            <Icon as={FaGraduationCap} boxSize={7} color="white" />
          </Flex>

          <Box textAlign="center">
            <Text
              fontSize="22px"
              fontWeight="800"
              color="white"
              fontFamily="'Outfit', sans-serif"
              letterSpacing="-0.3px"
            >
              AceSmart CBT Portal
            </Text>
            <Text fontSize="13px" color="#94A3B8" mt={0.5}>
              Candidate Examination Verification
            </Text>
          </Box>

          <Badge
            bg="rgba(16, 185, 129, 0.12)"
            color="#34D399"
            border="1px solid rgba(16, 185, 129, 0.25)"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="10px"
            fontWeight="bold"
            mt={1}
          >
            <HStack spacing={1.5}>
              <Icon as={FaShieldAlt} />
              <Text>SECURE TESTING ENVIRONMENT</Text>
            </HStack>
          </Badge>
        </VStack>

        {/* Error Alert */}
        {error && (
          <Box
            bg="rgba(239, 68, 68, 0.12)"
            border="1px solid rgba(239, 68, 68, 0.3)"
            borderRadius="12px"
            p={3}
            mb={5}
            textAlign="center"
          >
            <Text fontSize="12px" color="#FCA5A5" fontWeight="semibold">
              {error}
            </Text>
          </Box>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <VStack spacing={4} align="stretch" w="100%">
            <Field.Root required w="100%">
              <Field.Label fontSize="12px" fontWeight="bold" color="#CBD5E1">
                Candidate Registration Number <Field.RequiredIndicator />
              </Field.Label>
              <Input
                type="text"
                placeholder="e.g. STU-2026-001 or ID"
                bg="#0F172A"
                borderRadius="12px"
                h="48px"
                w="100%"
                color="white"
                borderColor="#334155"
                _focus={{
                  borderColor: "#3B82F6",
                  boxShadow: "0 0 0 1px #3B82F6",
                  bg: "#0F172A",
                }}
                _placeholder={{ color: "#64748B" }}
                value={examDetail.studentId}
                onChange={(e) =>
                  setExamDetail({
                    ...examDetail,
                    studentId: e.target.value,
                  })
                }
                required
              />
            </Field.Root>

            <Field.Root required w="100%">
              <Field.Label fontSize="12px" fontWeight="bold" color="#CBD5E1">
                Candidate Access Key / Password <Field.RequiredIndicator />
              </Field.Label>
              <PasswordInput
                bg="#0F172A"
                borderRadius="12px"
                h="48px"
                w="100%"
                color="white"
                borderColor="#334155"
                _focus={{
                  borderColor: "#3B82F6",
                  boxShadow: "0 0 0 1px #3B82F6",
                  bg: "#0F172A",
                }}
                _placeholder={{ color: "#64748B" }}
                value={examDetail.firstName}
                onChange={(e) =>
                  setExamDetail({
                    ...examDetail,
                    firstName: e.target.value,
                  })
                }
                required
              />
            </Field.Root>

            {/* Proctoring notice */}
            <Box
              bg="#0F172A"
              p={3}
              borderRadius="12px"
              border="1px solid #334155"
              mt={1}
            >
              <HStack spacing={2} align="flex-start">
                <Icon as={FaLaptop} color="#60A5FA" boxSize={3.5} mt={0.5} />
                <Text fontSize="11px" color="#94A3B8" lineHeight="1.4">
                  Assessment will launch in full screen. Tab switching and copy shortcuts are disabled by proctoring.
                </Text>
              </HStack>
            </Box>

            <Button
              type="submit"
              h="48px"
              w="100%"
              bg="#2563EB"
              color="white"
              borderRadius="12px"
              fontWeight="bold"
              fontSize="14px"
              mt={2}
              _hover={{
                bg: "#1D4ED8",
              }}
              loading={loading}
              loadingText="Verifying Candidate..."
              rightIcon={<Icon as={FaArrowRight} />}
            >
              Authenticate & Proceed
            </Button>

            {/* Practice / Demo Test Link */}
            <Button
              variant="ghost"
              size="sm"
              w="100%"
              color="#64748B"
              _hover={{ color: "#94A3B8", bg: "transparent" }}
              fontSize="12px"
              onClick={handlePracticeMode}
            >
              Launch Practice Assessment Mode
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  );
};

export default ExamLoginPage;
