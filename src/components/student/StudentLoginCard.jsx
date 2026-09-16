import { useState, useEffect } from "react";
import { Box, Flex, Text, Button, Icon, Input } from "@chakra-ui/react";
import { FaGraduationCap, FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useStudentPortal } from "../../libs/StudentPortalProvider";
import { getSavedStudentCode } from "../../libs/studentPortalStorage";

const StudentLoginCard = () => {
  const navigate = useNavigate();
  const { login, loading } = useStudentPortal();
  const [studentCode, setStudentCode] = useState("");
  const [lastName, setLastName] = useState("");

  // Restore the saved student code without retaining the surname password.
  useEffect(() => {
    const savedCode = getSavedStudentCode();
    if (savedCode) setStudentCode(savedCode);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await login(studentCode, lastName);
  };

  return (
    <Flex minH="100vh" bg="#F8FAFC" align="center" justify="center" p={4}>
      <Box
        bg="white"
        borderRadius="2xl"
        p={{ base: 6, md: 8 }}
        maxW="460px"
        w="100%"
        border="1px solid #E2E8F0"
        boxShadow="0 10px 30px rgba(0,0,0,0.06)"
        textAlign="center"
      >
        <Flex
          w="64px"
          h="64px"
          mx="auto"
          mb={4}
          borderRadius="2xl"
          bg="#EEF2FF"
          color="#4338CA"
          align="center"
          justify="center"
        >
          <Icon as={FaGraduationCap} boxSize={8} />
        </Flex>

        <Text
          fontSize="22px"
          fontWeight="900"
          color="#0F172A"
          letterSpacing="-0.5px"
        >
          Student & Parent Portal
        </Text>
        <Text fontSize="13px" color="#64748B" mt={1} mb={6}>
          Enter your Institutional Student Code to check term fees, payment
          receipts, and report cards
        </Text>

        <form onSubmit={handleSubmit}>
          <Box mb={4}>
            <Text
              fontSize="12px"
              fontWeight="700"
              color="#334155"
              textAlign="left"
              mb={1}
            >
              INSTITUTIONAL STUDENT CODE
            </Text>
            <Input
              placeholder="e.g. KINGS/2026/001 or ACE/2026/042"
              value={studentCode}
              onChange={(event) => setStudentCode(event.target.value)}
              h="48px"
              borderRadius="xl"
              fontSize="15px"
              fontWeight="700"
              textAlign="center"
              letterSpacing="1px"
              required
            />
          </Box>

          <Box mb={4}>
            <Text
              fontSize="12px"
              fontWeight="700"
              color="#334155"
              textAlign="left"
              mb={1}
            >
              SURNAME / LAST NAME
            </Text>
            <Input
              type="password"
              placeholder="Enter the student's surname"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              h="48px"
              borderRadius="xl"
              fontSize="15px"
              fontWeight="600"
              required
              autoComplete="current-password"
            />
          </Box>

          <Button
            type="submit"
            w="100%"
            h="48px"
            bg="linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)"
            color="white"
            borderRadius="xl"
            fontWeight="700"
            fontSize="14px"
            loading={loading}
            boxShadow="0 4px 14px rgba(67, 56, 202, 0.35)"
          >
            Access Student Portal
          </Button>
        </form>

        <Flex
          justify="center"
          align="center"
          gap={2}
          mt={4}
          color="#94A3B8"
          fontSize="11px"
        >
          <Icon as={FaShieldAlt} boxSize={3} color="#10B981" />
          <Text>Your surname is never stored on this device.</Text>
        </Flex>

        <Button
          mt={4}
          variant="ghost"
          size="sm"
          color="#64748B"
          onClick={() => navigate("/")}
        >
          <Icon as={FaArrowLeft} mr={2} boxSize={3} />
          Back to AceSmart Home
        </Button>
      </Box>
    </Flex>
  );
};

export default StudentLoginCard;
