import {
  Box,
  Button,
  Flex,
  Text,
  Icon,
  SimpleGrid,
  Badge,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  FaStar,
  FaShieldAlt,
  FaArrowRight,
  FaClock,
  FaCheckCircle,
  FaSchool,
  FaUserGraduate,
  FaFileInvoiceDollar,
  FaQrcode,
  FaCheck,
  FaLaptopCode,
  FaStamp,
} from "react-icons/fa";
import { MdVerified, MdAssignmentTurnedIn } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Heading = ({ homeRef, onGetStarted, onTakeExam }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const navigate = useNavigate();
  const [activePreviewTab, setActivePreviewTab] = useState("sms"); // "sms" | "cbt"
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
        <SimpleGrid
          columns={{ base: 1, lg: 12 }}
          gap={{ base: 12, lg: 8 }}
          alignItems="center"
        >
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
                fontWeight="800"
                color="#6A1B9A"
                letterSpacing="0.4px"
              >
                ALL-IN-ONE SCHOOL ERP + NEXT-GEN CBT PLATFORM
              </Text>
            </Flex>

            {/* Main Punchy Heading */}
            <Text
              as="h1"
              fontSize={{ base: "34px", sm: "44px", md: "52px" }}
              fontWeight="900"
              lineHeight={{ base: "1.18", md: "1.12" }}
              color="gray.900"
              fontFamily="'Outfit', sans-serif"
              letterSpacing="-1px"
              mb={5}
            >
              Transform Your School with{" "}
              <Text
                as="span"
                bgGradient="linear(to-r, #6A1B9A, #9C27B0, #10B981)"
                bgClip="text"
                color="#6A1B9A"
              >
                Smart Management
              </Text>{" "}
              & Next-Gen CBT.
            </Text>

            {/* Subtitle */}
            <Text
              fontSize={{ base: "16px", md: "18.5px" }}
              color="gray.600"
              lineHeight="1.65"
              maxW="620px"
              mb={8}
            >
              Automate terminal report cards with psychomotor ratings, collect
              fees via Paystack split settlement, monitor staff QR clock-in, and
              conduct proctored CBT exams with 50,000+ past questions—all in one
              unified cloud system.
            </Text>

            {/* Quick Feature Badges */}
            <SimpleGrid
              columns={{ base: 2, sm: 4 }}
              gap={2.5}
              mb={8}
              maxW="600px"
            >
              {[
                {
                  icon: MdAssignmentTurnedIn,
                  label: "Automated Report Cards",
                  color: "#6A1B9A",
                  bg: "#FAF5FF",
                },
                {
                  icon: FaFileInvoiceDollar,
                  label: "Paystack Fee Invoicing",
                  color: "#059669",
                  bg: "#ECFDF5",
                },
                {
                  icon: FaQrcode,
                  label: "Staff QR Attendance",
                  color: "#2563EB",
                  bg: "#EFF6FF",
                },
                {
                  icon: FaLaptopCode,
                  label: "50k+ WAEC/JAMB CBT",
                  color: "#D97706",
                  bg: "#FFFBEB",
                },
              ].map((item, i) => (
                <Flex
                  key={i}
                  align="center"
                  gap={1.5}
                  p={2}
                  borderRadius="xl"
                  bg={item.bg}
                  border="1px solid"
                  borderColor="rgba(0,0,0,0.06)"
                >
                  <Icon as={item.icon} color={item.color} boxSize={3.5} />
                  <Text
                    fontSize="11px"
                    fontWeight="700"
                    color="gray.800"
                    noOfLines={1}
                  >
                    {item.label}
                  </Text>
                </Flex>
              ))}
            </SimpleGrid>

            {/* Primary & Secondary Action Buttons */}
            <Flex
              direction={{ base: "column", sm: "row" }}
              gap={3.5}
              mb={10}
              align={{ base: "stretch", sm: "center" }}
            >
              <Button
                size="lg"
                bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
                color="white"
                px={8}
                h="54px"
                fontSize="15.5px"
                fontWeight="800"
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
                Register Your School Free
                <Icon as={FaArrowRight} ml={2} boxSize={3.5} />
              </Button>

              <Button
                size="lg"
                variant="outline"
                bg="white"
                borderColor="green.200"
                color="#059669"
                px={6}
                h="54px"
                fontSize="14.5px"
                fontWeight="700"
                borderRadius="xl"
                boxShadow="0 4px 12px rgba(16, 185, 129, 0.08)"
                _hover={{
                  bg: "green.50",
                  borderColor: "#10B981",
                  transform: "translateY(-2px)",
                }}
                onClick={() => navigate("/student")}
                transition="all 0.2s"
              >
                <Icon as={FaUserGraduate} mr={2} />
                Student Result Portal
              </Button>

              <Button
                size="lg"
                variant="ghost"
                color="#6A1B9A"
                px={5}
                h="54px"
                fontSize="14px"
                fontWeight="700"
                borderRadius="xl"
                _hover={{ bg: "purple.50" }}
                onClick={onTakeExam}
              >
                Exam Code &gt;
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
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                ))}
              </Flex>

              <Box>
                <Flex align="center" gap={1.5} mb={0.5}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Icon key={s} as={FaStar} color="#F59E0B" boxSize={3.5} />
                  ))}
                  <Text
                    fontSize="14px"
                    fontWeight="800"
                    color="gray.800"
                    ml={1}
                  >
                    4.9 / 5.0
                  </Text>
                </Flex>
                <Text fontSize="13px" color="gray.600">
                  Trusted by <strong>120+ Nigerian Schools</strong> & 10,000+
                  Students
                </Text>
              </Box>
            </Flex>
          </Box>

          {/* Right Column: Live Interactive Dual Showcase (SMS Report Card vs CBT Exam) */}
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

            {/* Interactive Showcase Mode Switcher */}
            <Flex
              position="relative"
              zIndex={2}
              mb={3}
              bg="white"
              p={1}
              borderRadius="2xl"
              border="1px solid"
              borderColor="gray.200"
              boxShadow="0 4px 14px rgba(0,0,0,0.06)"
              gap={1}
            >
              <Button
                flex="1"
                size="sm"
                h="36px"
                borderRadius="xl"
                fontSize="12px"
                fontWeight="800"
                bg={activePreviewTab === "sms" ? "#6A1B9A" : "transparent"}
                color={activePreviewTab === "sms" ? "white" : "gray.600"}
                _hover={{
                  bg: activePreviewTab === "sms" ? "#581580" : "purple.50",
                }}
                onClick={() => setActivePreviewTab("sms")}
              >
                <Icon as={MdAssignmentTurnedIn} mr={1.5} boxSize={4} />
                School ERP & Report Card
              </Button>

              <Button
                flex="1"
                size="sm"
                h="36px"
                borderRadius="xl"
                fontSize="12px"
                fontWeight="800"
                bg={activePreviewTab === "cbt" ? "#6A1B9A" : "transparent"}
                color={activePreviewTab === "cbt" ? "white" : "gray.600"}
                _hover={{
                  bg: activePreviewTab === "cbt" ? "#581580" : "purple.50",
                }}
                onClick={() => setActivePreviewTab("cbt")}
              >
                <Icon as={FaLaptopCode} mr={1.5} boxSize={4} />
                Live CBT Exam Engine
              </Button>
            </Flex>

            {/* Main Interactive Showcase Card */}
            <Box
              position="relative"
              zIndex={1}
              bg="white"
              borderRadius="24px"
              border="1px solid"
              borderColor="gray.200"
              boxShadow="0 20px 40px -12px rgba(106, 27, 154, 0.18)"
              p={{ base: 4, sm: 5 }}
            >
              {activePreviewTab === "sms" ? (
                /* TAB 1: School ERP & Terminal Report Card Preview */
                <Box>
                  {/* School Header */}
                  <Flex
                    justify="space-between"
                    align="flex-start"
                    pb={3}
                    borderBottom="1px solid"
                    borderColor="gray.100"
                    mb={3}
                  >
                    <Box>
                      <Flex align="center" gap={1.5}>
                        <Box w="8px" h="8px" borderRadius="full" bg="#10B981" />
                        <Text fontSize="14px" fontWeight="900" color="gray.900">
                          Grace International Academy
                        </Text>
                      </Flex>
                      <Text fontSize="11px" color="gray.500" fontWeight="600">
                        First Term Terminal Result Sheet &bull; Session:
                        2025/2026
                      </Text>
                    </Box>
                    <Badge
                      bg="#ECFDF5"
                      color="#059669"
                      border="1px solid #A7F3D0"
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      fontSize="10px"
                      fontWeight="800"
                    >
                      Approved & Signed
                    </Badge>
                  </Flex>

                  {/* Student Biodata strip */}
                  <Flex
                    justify="space-between"
                    align="center"
                    bg="#FAF5FF"
                    p={2.5}
                    borderRadius="xl"
                    border="1px solid #E9D5FF"
                    mb={3}
                  >
                    <Box>
                      <Text fontSize="13px" fontWeight="800" color="#6A1B9A">
                        Okafor Chukwudi Daniel
                      </Text>
                      <Text fontSize="11px" color="gray.600">
                        Class: <b>JSS 2 Diamond</b> &bull; Reg:{" "}
                        <b>GIA/2024/048</b>
                      </Text>
                    </Box>
                    <Box textAlign="right">
                      <Badge
                        bg="#6A1B9A"
                        color="white"
                        px={2}
                        py={0.5}
                        borderRadius="md"
                        fontSize="10px"
                        fontWeight="800"
                      >
                        Position: 2nd / 46
                      </Badge>
                      <Text
                        fontSize="11px"
                        color="#059669"
                        fontWeight="800"
                        mt={0.5}
                      >
                        Average: 90.0%
                      </Text>
                    </Box>
                  </Flex>

                  {/* Mini Subject Scores Table */}
                  <Box mb={3} overflowX="auto">
                    <table
                      style={{
                        width: "100%",
                        fontSize: "11px",
                        borderCollapse: "collapse",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            background: "#F1F5F9",
                            color: "#475569",
                            fontWeight: "800",
                          }}
                        >
                          <th
                            style={{
                              padding: "6px 8px",
                              textAlign: "left",
                              borderRadius: "6px 0 0 6px",
                            }}
                          >
                            Subject
                          </th>
                          <th
                            style={{ padding: "6px 4px", textAlign: "center" }}
                          >
                            CA (40)
                          </th>
                          <th
                            style={{ padding: "6px 4px", textAlign: "center" }}
                          >
                            Exam (60)
                          </th>
                          <th
                            style={{ padding: "6px 4px", textAlign: "center" }}
                          >
                            Total
                          </th>
                          <th
                            style={{
                              padding: "6px 8px",
                              textAlign: "right",
                              borderRadius: "0 6px 6px 0",
                            }}
                          >
                            Grade
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            name: "Mathematics",
                            ca: "36",
                            exam: "54",
                            total: "90",
                            grade: "A+",
                          },
                          {
                            name: "English Studies",
                            ca: "34",
                            exam: "52",
                            total: "86",
                            grade: "A",
                          },
                          {
                            name: "Basic Science",
                            ca: "38",
                            exam: "56",
                            total: "94",
                            grade: "A+",
                          },
                          {
                            name: "Civic Education",
                            ca: "35",
                            exam: "50",
                            total: "85",
                            grade: "A",
                          },
                        ].map((row, i) => (
                          <tr
                            key={i}
                            style={{ borderBottom: "1px solid #F1F5F9" }}
                          >
                            <td
                              style={{
                                padding: "6px 8px",
                                fontWeight: "700",
                                color: "#1E293B",
                              }}
                            >
                              {row.name}
                            </td>
                            <td
                              style={{
                                padding: "6px 4px",
                                textAlign: "center",
                                color: "#64748B",
                              }}
                            >
                              {row.ca}
                            </td>
                            <td
                              style={{
                                padding: "6px 4px",
                                textAlign: "center",
                                color: "#64748B",
                              }}
                            >
                              {row.exam}
                            </td>
                            <td
                              style={{
                                padding: "6px 4px",
                                textAlign: "center",
                                fontWeight: "800",
                                color: "#059669",
                              }}
                            >
                              {row.total}%
                            </td>
                            <td
                              style={{
                                padding: "6px 8px",
                                textAlign: "right",
                                fontWeight: "900",
                                color: "#6A1B9A",
                              }}
                            >
                              {row.grade}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>

                  {/* Bursary & Fee Status Pill */}
                  <Flex
                    justify="space-between"
                    align="center"
                    bg="#F0FDF4"
                    border="1px solid #BBF7D0"
                    p={2.5}
                    borderRadius="xl"
                    mb={3}
                  >
                    <Flex align="center" gap={2}>
                      <Icon
                        as={FaFileInvoiceDollar}
                        color="#16A34A"
                        boxSize={4}
                      />
                      <Box>
                        <Text fontSize="11px" fontWeight="800" color="#166534">
                          Bursary Account: ₦85,000 (PAID)
                        </Text>
                        <Text fontSize="10px" color="#15803D">
                          Paystack Verified &bull; Instant Receipt Issued
                        </Text>
                      </Box>
                    </Flex>
                    <Icon as={MdVerified} color="#16A34A" boxSize={4.5} />
                  </Flex>

                  {/* Digital Signature & Principal Stamp */}
                  <Flex
                    justify="space-between"
                    align="center"
                    pt={2}
                    borderTop="1px solid"
                    borderColor="gray.100"
                  >
                    <Flex align="center" gap={1.5}>
                      <Icon as={FaStamp} color="#6A1B9A" boxSize={3.5} />
                      <Text fontSize="10.5px" color="gray.600" fontWeight="700">
                        Official Principal Digital Seal & Signature
                      </Text>
                    </Flex>
                    <Badge
                      bg="#EFF6FF"
                      color="#2563EB"
                      border="1px solid #BFDBFE"
                      fontSize="10px"
                      fontWeight="800"
                    >
                      QR Verified
                    </Badge>
                  </Flex>
                </Box>
              ) : (
                /* TAB 2: Live CBT Exam Simulation */
                <Box>
                  {/* CBT Mock Header */}
                  <Flex
                    justify="space-between"
                    align="center"
                    pb={3}
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
                    p={2}
                    my={3}
                  >
                    <Flex align="center" gap={2}>
                      <Icon as={FaShieldAlt} color="#059669" boxSize={4} />
                      <Text fontSize="11px" fontWeight="700" color="#065F46">
                        Biometric Face Proctor: Active
                      </Text>
                    </Flex>
                    <Flex align="center" gap={1}>
                      <Icon as={MdVerified} color="#059669" boxSize={3.5} />
                      <Text fontSize="10.5px" fontWeight="700" color="#047857">
                        Verified
                      </Text>
                    </Flex>
                  </Flex>

                  {/* Question Text */}
                  <Box mb={4}>
                    <Flex justify="space-between" align="center" mb={1.5}>
                      <Text fontSize="11px" fontWeight="800" color="#6A1B9A">
                        QUESTION 14 OF 40
                      </Text>
                      <Text fontSize="10px" color="gray.400" fontWeight="600">
                        Difficulty: Medium
                      </Text>
                    </Flex>
                    <Text
                      fontSize="14.5px"
                      fontWeight="600"
                      color="gray.800"
                      lineHeight="1.5"
                    >
                      If 3<sup>(2x - 1)</sup> = 27, determine the numerical
                      value of the variable <em>x</em>.
                    </Text>
                  </Box>

                  {/* Options Selection */}
                  <Flex direction="column" gap={2} mb={4}>
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
                          gap={2.5}
                          p={2.5}
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
                            w="24px"
                            h="24px"
                            borderRadius="full"
                            fontSize="11px"
                            fontWeight="800"
                            bg={isSelected ? "#6A1B9A" : "gray.100"}
                            color={isSelected ? "white" : "gray.700"}
                          >
                            {opt.id}
                          </Flex>
                          <Text
                            fontSize="13px"
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
                    pt={3}
                    borderTop="1px solid"
                    borderColor="gray.100"
                  >
                    <Flex gap={1}>
                      {[12, 13, 14, 15, 16].map((num) => (
                        <Box
                          key={num}
                          w="24px"
                          h="24px"
                          borderRadius="md"
                          fontSize="10px"
                          fontWeight="800"
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

                    <Flex gap={1.5}>
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
              )}
            </Box>

            {/* Dynamic Floating Pill */}
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
                bg={activePreviewTab === "sms" ? "#6A1B9A" : "green.500"}
                color="white"
              >
                <Icon
                  as={
                    activePreviewTab === "sms"
                      ? MdAssignmentTurnedIn
                      : FaCheckCircle
                  }
                  boxSize={5}
                />
              </Flex>
              <Box>
                <Text fontSize="11px" fontWeight="600" color="gray.500">
                  {activePreviewTab === "sms"
                    ? "School ERP Engine"
                    : "CBT Examination Engine"}
                </Text>
                <Text fontSize="13px" fontWeight="800" color="gray.900">
                  {activePreviewTab === "sms"
                    ? "Continuous Assessment & Paystack Auto-Billing"
                    : "Instant Auto-Grading & 50,000+ Past Questions"}
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
