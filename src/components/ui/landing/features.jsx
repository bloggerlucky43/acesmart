import {
  Box,
  Text,
  Flex,
  Icon,
  SimpleGrid,
  Button,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  FaShieldAlt,
  FaSquareRootAlt,
  FaDatabase,
  FaChartLine,
  FaFileExcel,
  FaLaptopCode,
  FaArrowRight,
  FaFileInvoiceDollar,
  FaQrcode,
  FaUsers,
  FaGlobe,
  FaStamp,
  FaSchool,
} from "react-icons/fa";
import { MdAssignmentTurnedIn, MdSchool } from "react-icons/md";

const smsFeatureList = [
  {
    icon: MdAssignmentTurnedIn,
    title: "Automated Terminal Report Cards",
    badge: "Nigerian Curriculum",
    badgeColor: "purple",
    desc: "Calculates CA (30/40) + Exam (70/60), computes student position in class, grade remarks, psychomotor domain ratings, and principal stamps on watermark PDFs.",
    accent: "#6A1B9A",
  },
  {
    icon: FaFileInvoiceDollar,
    title: "Bursary & Paystack Collections",
    badge: "Automated Split",
    badgeColor: "green",
    desc: "Generate class-specific fee schedules, collect online tuition via Paystack split settlement directly to your school bank, and issue automated digital receipts.",
    accent: "#059669",
  },
  {
    icon: FaQrcode,
    title: "Staff QR Attendance System",
    badge: "Punctuality Clock-in",
    badgeColor: "blue",
    desc: "Dynamic time-expiring QR codes displayed at the school gate or staff room. Teachers clock-in via mobile with automated late arrival flagging and monthly registers.",
    accent: "#2563EB",
  },
  {
    icon: FaUsers,
    title: "Class Arms & Student Directory",
    badge: "Institutional Hierarchy",
    badgeColor: "orange",
    desc: "Seamlessly organize multi-arm classes (e.g. JSS 1 Gold, SSS 2 Science), allocate subject teachers, manage student biodata, and link parent contacts.",
    accent: "#D97706",
  },
  {
    icon: FaGlobe,
    title: "Student & Parent Result Portal",
    badge: "Online Scratch Checker",
    badgeColor: "teal",
    desc: "Parents and students check term results directly on the portal with registration numbers or scratch-card PIN tokens, completely eliminating office congestion.",
    accent: "#0D9488",
  },
  {
    icon: FaStamp,
    title: "White-Label Subdomain Portals",
    badge: "Custom School Brand",
    badgeColor: "pink",
    desc: "Every school receives a dedicated web portal (e.g. yourschool.acesmart.site) fully branded with your crest/logo, motto, and custom term academic calendar.",
    accent: "#DB2777",
  },
];

const cbtFeatureList = [
  {
    icon: FaDatabase,
    title: "50,000+ Past Questions Bank",
    badge: "WAEC, JAMB & NECO",
    badgeColor: "green",
    desc: "Instant access to verified Nigerian national examination questions with subject syllabus tagging for mock exams, continuous assessments, and practice tests.",
    accent: "#059669",
  },
  {
    icon: FaShieldAlt,
    title: "AI Biometric Verification",
    badge: "Anti-Cheating",
    badgeColor: "purple",
    desc: "Computer vision face detection and candidate presence monitoring prevents impersonation during candidate check-in and active test sessions.",
    accent: "#6A1B9A",
  },
  {
    icon: FaSquareRootAlt,
    title: "LaTeX & MathJax Engine",
    badge: "Scientific Formulas",
    badgeColor: "blue",
    desc: "Crystal-clear rendering for complex mathematical equations, chemistry structures, square roots, and physics symbols across all screen sizes.",
    accent: "#2563EB",
  },
  {
    icon: FaChartLine,
    title: "Automated Instant Grading",
    badge: "Zero Manual Marking",
    badgeColor: "orange",
    desc: "Instant score calculation, subject breakdowns, percentile analysis, and interactive visual charts for teachers with 1-click grade export.",
    accent: "#D97706",
  },
  {
    icon: FaLaptopCode,
    title: "Network-Resilient CBT Engine",
    badge: "High Reliability",
    badgeColor: "teal",
    desc: "Local persistence and state autosave safeguard candidate answers against unexpected power cuts or connectivity drops during examination sessions.",
    accent: "#0D9488",
  },
  {
    icon: FaFileExcel,
    title: "Bulk Excel Rosters & Questions",
    badge: "1-Click Import",
    badgeColor: "pink",
    desc: "Upload entire student rosters with one click via Excel (.xlsx) and import large question banks with automated format validation and error checking.",
    accent: "#DB2777",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Set Up Your School Portal",
    desc: "Register your institution, configure class arms (JSS1 - SSS3), set up school fees, and customize your term dates and school crest.",
  },
  {
    step: "02",
    title: "Enrol Students & Staff",
    desc: "Import your student roster via Excel or individual forms. Teachers clock in via QR code and record continuous assessment scores or CBT tests.",
  },
  {
    step: "03",
    title: "Publish Results & Collect Fees",
    desc: "Generate terminal report cards with 1-click principal approval. Collect fees online via Paystack and let parents check results from anywhere.",
  },
];

const Features = ({ aboutRef }) => {
  const [activeTab, setActiveTab] = useState("sms"); // "sms" | "cbt"

  const activeList = activeTab === "sms" ? smsFeatureList : cbtFeatureList;

  return (
    <Box
      ref={aboutRef}
      py={20}
      bg="linear-gradient(180deg, #FFFFFF 0%, #FAF5FF 50%, #FFFFFF 100%)"
    >
      <Box maxW="1320px" mx="auto" px={{ base: 4, md: 8 }}>
        
        {/* Section Header */}
        <Box textAlign="center" maxW="800px" mx="auto" mb={10}>
          <Text
            fontSize="12px"
            fontWeight="800"
            color="#6A1B9A"
            letterSpacing="1px"
            textTransform="uppercase"
            mb={2}
          >
            Dual-Engine Educational Cloud
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
            Everything Your School Needs in One Unified Platform
          </Text>
          <Text fontSize={{ base: "15px", md: "17px" }} color="gray.600">
            From automated terminal report cards and Paystack fee collections to AI-proctored CBT exams with 50,000+ past questions.
          </Text>
        </Box>

        {/* Feature Category Toggle Tabs */}
        <Flex justify="center" mb={14}>
          <Flex
            bg="white"
            p={1.5}
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.200"
            boxShadow="0 6px 20px rgba(106, 27, 154, 0.08)"
            gap={2}
            maxW="560px"
            w="100%"
          >
            <Button
              flex="1"
              h="46px"
              borderRadius="xl"
              fontSize={{ base: "13px", sm: "14px" }}
              fontWeight="800"
              bg={activeTab === "sms" ? "#6A1B9A" : "transparent"}
              color={activeTab === "sms" ? "white" : "gray.600"}
              _hover={{ bg: activeTab === "sms" ? "#581580" : "purple.50" }}
              onClick={() => setActiveTab("sms")}
              transition="all 0.2s"
            >
              <Icon as={MdSchool} mr={2} boxSize={4.5} />
              School Management (ERP)
            </Button>

            <Button
              flex="1"
              h="46px"
              borderRadius="xl"
              fontSize={{ base: "13px", sm: "14px" }}
              fontWeight="800"
              bg={activeTab === "cbt" ? "#6A1B9A" : "transparent"}
              color={activeTab === "cbt" ? "white" : "gray.600"}
              _hover={{ bg: activeTab === "cbt" ? "#581580" : "purple.50" }}
              onClick={() => setActiveTab("cbt")}
              transition="all 0.2s"
            >
              <Icon as={FaLaptopCode} mr={2} boxSize={4.5} />
              CBT Examination Engine
            </Button>
          </Flex>
        </Flex>

        {/* Feature Cards Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8} mb={24}>
          {activeList.map((f, i) => (
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
                <Text fontSize="14px" color="gray.600" lineHeight="1.65">
                  {f.desc}
                </Text>
              </Box>

              <Flex align="center" gap={2} mt={6} color={f.accent} fontSize="13px" fontWeight="700">
                <Text>{activeTab === "sms" ? "Explore ERP module" : "Explore CBT feature"}</Text>
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
              Effortless Implementation
            </Text>
            <Text
              fontSize={{ base: "24px", md: "32px" }}
              fontWeight="800"
              color="gray.900"
              fontFamily="'Outfit', sans-serif"
            >
              Get Your School Operational in 3 Simple Steps
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
