import {
  Box,
  Button,
  Flex,
  Text,
  Icon,
  SimpleGrid,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  FaStar,
  FaShieldAlt,
  FaArrowRight,
  FaClock,
  FaCheckCircle,
  FaPlay,
  FaSchool,
  FaUserGraduate,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";

const Heading = ({ homeRef, onGetStarted, onTakeExam }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [selectedOption, setSelectedOption] = useState("B");
  const [secondsLeft, setSecondsLeft] = useState(5040); // 1hr 24m

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 5040));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0",
    )}:${String(s).padStart(2, "0")}`;
  };

  return (
    <Box
      ref={homeRef}
      position="relative"
      pt={{ base: "110px", md: "140px" }}
      pb={{ base: 14, md: 24 }}
      overflow="hidden"
      bg="linear-gradient(180deg, #F9F5FF 0%, #FFFFFF 60%, #FAF5FF 100%)"
    >
      {/* Decorative ambient background glows */}
      <Box
        position="absolute"
        top="-10%"
        left="5%"
        w="450px"
        h="450px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(106, 27, 154, 0.12) 0%, rgba(255,255,255,0) 70%)"
        filter="blur(50px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="10%"
        right="5%"
        w="500px"
        h="500px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(255,255,255,0) 70%)"
        filter="blur(60px)"
        pointerEvents="none"
      />

      <Box maxW="1320px" mx="auto" px={{ base: 4, md: 8 }} position="relative">
        <SimpleGrid columns={{ base: 1, lg: 12 }} gap={{ base: 12, lg: 8 }} alignItems="center">
          
          {/* Left Column: Headline, Value Prop & CTAs */}
          <Box gridColumn={{ lg: "span 7" }}>
            {/* Pill Tag */}
            <Flex
              display="inline-flex"
              align="center"
              gap={2}
              px={3.5}
              py={1.5}
              borderRadius="full"
              bg="purple.50"
              border="1px solid"
              borderColor="purple.200"
              mb={6}
              boxShadow="0 2px 8px rgba(106, 27, 154, 0.08)"
            >
              <Box
                w="8px"
                h="8px"
                borderRadius="full"
                bg="#6A1B9A"
                boxShadow="0 0 8px #8E24AA"
              />
              <Text
                fontSize={{ base: "12px", md: "13px" }}
                fontWeight="700"
                color="#6A1B9A"
                letterSpacing="0.4px"
              >
                NEXT-GEN CBT PLATFORM • NIGERIAN CURRICULUM READY
              </Text>
            </Flex>

            {/* Main Punchy Heading */}
            <Text
              as="h1"
              fontSize={{ base: "34px", sm: "44px", md: "54px" }}
              fontWeight="800"
              lineHeight={{ base: "1.18", md: "1.12" }}
              color="gray.900"
              fontFamily="'Outfit', sans-serif"
              letterSpacing="-1px"
              mb={5}
            >
              Conduct CBT Exams with{" "}
              <Text
                as="span"
                bgGradient="linear(to-r, #6A1B9A, #9C27B0, #10B981)"
                bgClip="text"
                color="#6A1B9A"
              >
                Confidence, Speed
              </Text>{" "}
              & AI Proctoring.
            </Text>

            {/* Subtitle */}
            <Text
              fontSize={{ base: "16px", md: "19px" }}
              color="gray.600"
              lineHeight="1.6"
              maxW="600px"
              mb={8}
            >
              Empower your school, academy, or students with 50,000+ WAEC & JAMB
              past questions, real-time facial verification, instant auto-scoring,
              and rich LaTeX math formula rendering.
            </Text>

            {/* Primary & Secondary Action Buttons */}
            <Flex
              direction={{ base: "column", sm: "row" }}
              gap={4}
              mb={10}
              align={{ base: "stretch", sm: "center" }}
            >
              <Button
                size="lg"
                bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
                color="white"
                px={8}
                h="54px"
                fontSize="16px"
                fontWeight="700"
                borderRadius="xl"
                boxShadow="0 10px 24px rgba(106, 27, 154, 0.35)"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 14px 28px rgba(106, 27, 154, 0.45)",
                }}
                onClick={onGetStarted}
                transition="all 0.2s"
              >
                <Icon as={FaSchool} mr={2} />
                Get Started as School / Teacher
                <Icon as={FaArrowRight} ml={2} boxSize={3.5} />
              </Button>

              <Button
                size="lg"
                variant="outline"
                bg="white"
                borderColor="purple.200"
                color="#6A1B9A"
                px={7}
                h="54px"
                fontSize="15px"
                fontWeight="700"
                borderRadius="xl"
                boxShadow="0 4px 12px rgba(0,0,0,0.03)"
                _hover={{
                  bg: "purple.50",
                  borderColor: "#6A1B9A",
                  transform: "translateY(-2px)",
                }}
                onClick={onTakeExam}
                transition="all 0.2s"
              >
                <Icon as={FaUserGraduate} mr={2} />
                Enter Exam Code
              </Button>
            </Flex>

            {/* Social Proof & Rating Bar */}
            <Flex
              align="center"
              gap={4}
              pt={4}
              borderTop="1px solid"
              borderColor="gray.200"
              flexWrap="wrap"
            >
              <Flex>
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
                ].map((src, i) => (
                  <Box
                    key={i}
                    w="38px"
                    h="38px"
                    borderRadius="full"
                    border="2.5px solid white"
                    ml={i === 0 ? 0 : "-12px"}
                    overflow="hidden"
                    boxShadow="0 2px 6px rgba(0,0,0,0.15)"
                  >
                    <img
                      src={src}
                      alt="Student Avatar"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
                ))}
              </Flex>

              <Box>
                <Flex align="center" gap={1.5} mb={0.5}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Icon key={s} as={FaStar} color="#F59E0B" boxSize={3.5} />
                  ))}
                  <Text fontSize="14px" fontWeight="800" color="gray.800" ml={1}>
                    4.9 / 5.0
                  </Text>
                </Flex>
                <Text fontSize="13px" color="gray.600">
                  Trusted by <strong>10,000+ candidates</strong> across Nigeria
                </Text>
              </Box>
            </Flex>
          </Box>

          {/* Right Column: Live Interactive Mock CBT Experience */}
          <Box gridColumn={{ lg: "span 5" }} position="relative">
            {/* Ambient Backing Glow */}
            <Box
              position="absolute"
              inset="-15px"
              bg="linear-gradient(135deg, rgba(106, 27, 154, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)"
              borderRadius="32px"
              filter="blur(20px)"
              zIndex={0}
            />

            {/* Main Interactive Exam Simulation Card */}
            <Box
              position="relative"
              zIndex={1}
              bg="white"
              borderRadius="24px"
              border="1px solid"
              borderColor="gray.200"
              boxShadow="0 20px 40px -12px rgba(106, 27, 154, 0.18)"
              p={{ base: 5, md: 6 }}
            >
              {/* CBT Mock Header */}
              <Flex
                justify="space-between"
                align="center"
                pb={4}
                borderBottom="1px solid"
                borderColor="gray.100"
                flexWrap="wrap"
                gap={2}
              >
                <Flex align="center" gap={2}>
                  <Box
                    px={2.5}
                    py={1}
                    borderRadius="md"
                    bg="purple.100"
                    color="#6A1B9A"
                    fontSize="11px"
                    fontWeight="800"
                    letterSpacing="0.5px"
                  >
                    JAMB UTME 2024
                  </Box>
                  <Text fontSize="13px" fontWeight="700" color="gray.700">
                    Mathematics
                  </Text>
                </Flex>

                {/* Live Countdown Timer */}
                <Flex
                  align="center"
                  gap={1.5}
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg="red.50"
                  border="1px solid"
                  borderColor="red.200"
                >
                  <Icon as={FaClock} color="red.500" boxSize={3.5} />
                  <Text
                    fontSize="13px"
                    fontWeight="800"
                    fontFamily="monospace"
                    color="red.600"
                  >
                    {formatTimer(secondsLeft)}
                  </Text>
                </Flex>
              </Flex>

              {/* Live Proctoring Badge */}
              <Flex
                align="center"
                justify="space-between"
                bg="#ECFDF5"
                border="1px solid #A7F3D0"
                borderRadius="xl"
                p={2.5}
                my={4}
              >
                <Flex align="center" gap={2}>
                  <Icon as={FaShieldAlt} color="#059669" boxSize={4} />
                  <Text fontSize="12px" fontWeight="700" color="#065F46">
                    Biometric Face Proctor: Active
                  </Text>
                </Flex>
                <Flex align="center" gap={1}>
                  <Icon as={MdVerified} color="#059669" boxSize={4} />
                  <Text fontSize="11px" fontWeight="600" color="#047857">
                    Verified
                  </Text>
                </Flex>
              </Flex>

              {/* Question Text */}
              <Box mb={5}>
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontSize="12px" fontWeight="700" color="#6A1B9A">
                    QUESTION 14 OF 40
                  </Text>
                  <Text fontSize="11px" color="gray.400">
                    Difficulty: Medium
                  </Text>
                </Flex>
                <Text
                  fontSize="16px"
                  fontWeight="600"
                  color="gray.800"
                  lineHeight="1.5"
                >
                  If 3<sup>(2x - 1)</sup> = 27, determine the numerical value of
                  the variable <em>x</em>.
                </Text>
              </Box>

              {/* Options Selection */}
              <Flex direction="column" gap={2.5} mb={6}>
                {[
                  { id: "A", text: "x = 1" },
                  { id: "B", text: "x = 2 (Correct)" },
                  { id: "C", text: "x = 3" },
                  { id: "D", text: "x = 0.5" },
                ].map((opt) => {
                  const isSelected = selectedOption === opt.id;
                  return (
                    <Flex
                      key={opt.id}
                      onClick={() => setSelectedOption(opt.id)}
                      align="center"
                      gap={3}
                      p={3}
                      borderRadius="xl"
                      cursor="pointer"
                      border="1.5px solid"
                      borderColor={isSelected ? "#6A1B9A" : "gray.200"}
                      bg={isSelected ? "purple.50" : "white"}
                      _hover={{ borderColor: "#6A1B9A", bg: "purple.50" }}
                      transition="all 0.15s ease"
                    >
                      <Flex
                        align="center"
                        justify="center"
                        w="28px"
                        h="28px"
                        borderRadius="full"
                        fontSize="12px"
                        fontWeight="700"
                        bg={isSelected ? "#6A1B9A" : "gray.100"}
                        color={isSelected ? "white" : "gray.700"}
                      >
                        {opt.id}
                      </Flex>
                      <Text
                        fontSize="14px"
                        fontWeight={isSelected ? "700" : "500"}
                        color={isSelected ? "#6A1B9A" : "gray.800"}
                      >
                        {opt.text}
                      </Text>
                    </Flex>
                  );
                })}
              </Flex>

              {/* Question Navigation Bar Simulation */}
              <Flex
                justify="space-between"
                align="center"
                pt={4}
                borderTop="1px solid"
                borderColor="gray.100"
              >
                <Flex gap={1.5}>
                  {[12, 13, 14, 15, 16].map((num) => (
                    <Box
                      key={num}
                      w="26px"
                      h="26px"
                      borderRadius="md"
                      fontSize="11px"
                      fontWeight="700"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bg={
                        num === 14
                          ? "#6A1B9A"
                          : num < 14
                          ? "#10B981"
                          : "gray.100"
                      }
                      color={num <= 14 ? "white" : "gray.600"}
                    >
                      {num}
                    </Box>
                  ))}
                </Flex>

                <Flex gap={2}>
                  <Button
                    size="xs"
                    variant="outline"
                    borderColor="gray.300"
                    color="gray.700"
                    borderRadius="md"
                  >
                    Flag
                  </Button>
                  <Button
                    size="xs"
                    bg="#6A1B9A"
                    color="white"
                    borderRadius="md"
                    _hover={{ opacity: 0.9 }}
                  >
                    Next &gt;
                  </Button>
                </Flex>
              </Flex>
            </Box>

            {/* Floating Auto-Graded Pill */}
            <Flex
              position="absolute"
              bottom="-18px"
              left={{ base: "4", md: "-20px" }}
              zIndex={2}
              align="center"
              gap={2.5}
              bg="white"
              px={4}
              py={3}
              borderRadius="2xl"
              boxShadow="0 12px 28px rgba(0, 0, 0, 0.12)"
              border="1px solid"
              borderColor="gray.100"
            >
              <Flex
                align="center"
                justify="center"
                w="36px"
                h="36px"
                borderRadius="xl"
                bg="green.500"
                color="white"
              >
                <Icon as={FaCheckCircle} boxSize={5} />
              </Flex>
              <Box>
                <Text fontSize="11px" fontWeight="600" color="gray.500">
                  Instant Assessment Engine
                </Text>
                <Text fontSize="14px" fontWeight="800" color="gray.900">
                  Auto-Graded in &lt; 0.5s • 92% Pass
                </Text>
              </Box>
            </Flex>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default Heading;
