import {
  Box,
  Text,
  Flex,
  Icon,
  SimpleGrid,
  Badge,
} from "@chakra-ui/react";
import {
  FaShieldAlt,
  FaSquareRootAlt,
  FaDatabase,
  FaChartLine,
  FaFileExcel,
  FaLaptopCode,
  FaCheck,
  FaArrowRight,
} from "react-icons/fa";

const featureList = [
  {
    icon: FaShieldAlt,
    title: "AI Biometric Verification",
    badge: "Anti-Cheating",
    badgeColor: "purple",
    desc: "Computer vision face detection and verification prevents impersonation during candidate check-in and test sessions.",
    accent: "#6A1B9A",
  },
  {
    icon: FaSquareRootAlt,
    title: "LaTeX & MathJax Engine",
    badge: "Scientific",
    badgeColor: "blue",
    desc: "Crystal-clear rendering for complex mathematical equations, chemistry structures, and physics symbols on all screens.",
    accent: "#2563EB",
  },
  {
    icon: FaDatabase,
    title: "50,000+ Past Questions Bank",
    badge: "Curated",
    badgeColor: "green",
    desc: "Instant access to JAMB UTME, WAEC, NECO, and Post-UTME questions with automated ALOC API synchronization.",
    accent: "#059669",
  },
  {
    icon: FaChartLine,
    title: "Automated Instant Grading",
    badge: "Real-Time",
    badgeColor: "orange",
    desc: "Instant score calculation, subject breakdowns, percentile analysis, and interactive visual charts for teachers.",
    accent: "#D97706",
  },
  {
    icon: FaFileExcel,
    title: "Bulk Excel Import & Export",
    badge: "Productivity",
    badgeColor: "teal",
    desc: "Upload entire student rosters with one click via Excel (.xlsx) and download standardized grade sheets effortlessly.",
    accent: "#0D9488",
  },
  {
    icon: FaLaptopCode,
    title: "Network-Resilient CBT Engine",
    badge: "High Reliability",
    badgeColor: "pink",
    desc: "Local persistence and state autosave safeguard candidate answers against unexpected power cuts or connectivity drops.",
    accent: "#DB2777",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Configure Your Exam",
    desc: "Select questions from the 50,000+ question bank or write custom questions. Set timers, pass marks, and instructions.",
  },
  {
    step: "02",
    title: "Enroll Candidates",
    desc: "Import your student list via Excel or register candidates individually. Issue secure student exam codes and passwords.",
  },
  {
    step: "03",
    title: "Auto-Grade & Export",
    desc: "Candidates complete their timed tests with biometric verification. Export full results, score cards, and analytics in seconds.",
  },
];

const Features = ({ aboutRef }) => {
  return (
    <Box
      ref={aboutRef}
      py={20}
      bg="linear-gradient(180deg, #FFFFFF 0%, #FAF5FF 50%, #FFFFFF 100%)"
    >
      <Box maxW="1320px" mx="auto" px={{ base: 4, md: 8 }}>
        
        {/* Section Header */}
        <Box textAlign="center" maxW="760px" mx="auto" mb={16}>
          <Text
            fontSize="12px"
            fontWeight="800"
            color="#6A1B9A"
            letterSpacing="1px"
            textTransform="uppercase"
            mb={2}
          >
            Built for Modern Education
          </Text>
          <Text
            as="h2"
            fontSize={{ base: "28px", md: "40px" }}
            fontWeight="800"
            color="gray.900"
            fontFamily="'Outfit', sans-serif"
            letterSpacing="-0.5px"
            lineHeight="1.2"
            mb={4}
          >
            Everything You Need to Run High-Stakes CBT Examinations
          </Text>
          <Text fontSize={{ base: "15px", md: "17px" }} color="gray.600">
            From standardized national testing to daily classroom quizzes, AceSmart delivers the speed, security, and precision required by educators.
          </Text>
        </Box>

        {/* Feature Cards Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8} mb={24}>
          {featureList.map((f, i) => (
            <Box
              key={i}
              bg="white"
              borderRadius="24px"
              p={8}
              border="1px solid"
              borderColor="gray.200"
              boxShadow="0 4px 20px rgba(0,0,0,0.03)"
              _hover={{
                transform: "translateY(-6px)",
                boxShadow: "0 18px 36px rgba(106, 27, 154, 0.09)",
                borderColor: f.accent,
              }}
              transition="all 0.25s ease"
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
            >
              <Box>
                <Flex justify="space-between" align="center" mb={6}>
                  <Flex
                    w="54px"
                    h="54px"
                    borderRadius="2xl"
                    bg={`${f.badgeColor}.50`}
                    color={f.accent}
                    align="center"
                    justify="center"
                  >
                    <Icon as={f.icon} boxSize={6} />
                  </Flex>
                  <Box
                    px={2.5}
                    py={1}
                    borderRadius="full"
                    bg={`${f.badgeColor}.50`}
                    border="1px solid"
                    borderColor={`${f.badgeColor}.200`}
                  >
                    <Text
                      fontSize="11px"
                      fontWeight="700"
                      color={f.accent}
                      letterSpacing="0.4px"
                    >
                      {f.badge}
                    </Text>
                  </Box>
                </Flex>

                <Text
                  fontSize="20px"
                  fontWeight="700"
                  color="gray.900"
                  fontFamily="'Outfit', sans-serif"
                  mb={3}
                >
                  {f.title}
                </Text>
                <Text fontSize="14px" color="gray.600" lineHeight="1.6">
                  {f.desc}
                </Text>
              </Box>

              <Flex align="center" gap={2} mt={6} color={f.accent} fontSize="13px" fontWeight="700">
                <Text>Learn how it works</Text>
                <Icon as={FaArrowRight} boxSize={3} />
              </Flex>
            </Box>
          ))}
        </SimpleGrid>

        {/* How It Works Workflow Bar */}
        <Box
          bg="white"
          borderRadius="32px"
          p={{ base: 8, md: 14 }}
          border="1px solid"
          borderColor="gray.200"
          boxShadow="0 10px 30px rgba(106, 27, 154, 0.05)"
        >
          <Box textAlign="center" maxW="600px" mx="auto" mb={12}>
            <Text
              fontSize="12px"
              fontWeight="800"
              color="#6A1B9A"
              letterSpacing="1px"
              textTransform="uppercase"
              mb={2}
            >
              Effortless Workflow
            </Text>
            <Text
              fontSize={{ base: "24px", md: "32px" }}
              fontWeight="800"
              color="gray.900"
              fontFamily="'Outfit', sans-serif"
            >
              How Institutions Conduct Exams in 3 Simple Steps
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
            {workflowSteps.map((s, idx) => (
              <Box
                key={idx}
                position="relative"
                p={6}
                borderRadius="2xl"
                bg="purple.50"
                border="1px solid"
                borderColor="purple.100"
              >
                <Text
                  fontSize="32px"
                  fontWeight="900"
                  color="#6A1B9A"
                  opacity={0.4}
                  fontFamily="'Outfit', sans-serif"
                  mb={2}
                >
                  {s.step}
                </Text>
                <Text
                  fontSize="18px"
                  fontWeight="700"
                  color="gray.900"
                  mb={2}
                >
                  {s.title}
                </Text>
                <Text fontSize="14px" color="gray.600" lineHeight="1.6">
                  {s.desc}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

      </Box>
    </Box>
  );
};

export default Features;
