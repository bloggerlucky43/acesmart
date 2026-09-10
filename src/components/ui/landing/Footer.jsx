import {
  Box,
  Flex,
  Text,
  Stack,
  Icon,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FaBrain,
  FaEnvelope,
  FaPhoneAlt,
  FaWhatsapp,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaShieldAlt,
} from "react-icons/fa";

const Footer = ({ onLoginOpen, onDrawerOpen, onExamModalOpen }) => {
  return (
    <Box
      as="footer"
      bg="#110726"
      color="white"
      pt={16}
      pb={8}
      borderTop="1px solid"
      borderColor="whiteAlpha.100"
    >
      <Box maxW="1320px" mx="auto" px={{ base: 4, md: 8 }}>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 12 }} gap={10} mb={14}>
          
          {/* Col 1: Brand & Identity */}
          <Box gridColumn={{ lg: "span 4" }}>
            <Flex align="center" gap={3} mb={4}>
              <Flex
                align="center"
                justify="center"
                w="40px"
                h="40px"
                borderRadius="xl"
                bg="linear-gradient(135deg, #6A1B9A 0%, #AB47BC 100%)"
                color="white"
                boxShadow="0 4px 14px rgba(106, 27, 154, 0.4)"
              >
                <Icon as={FaBrain} boxSize={5} />
              </Flex>
              <Text
                fontSize="22px"
                fontWeight="800"
                fontFamily="'Outfit', sans-serif"
              >
                Ace<span style={{ color: "#BA68C8" }}>Smart</span>
              </Text>
            </Flex>

            <Text fontSize="14px" color="gray.400" lineHeight="1.6" mb={6}>
              The intelligent Computer-Based Testing and examination management
              platform built for Nigerian schools, colleges, and students.
              Empowering next-generation learning with speed, accuracy, and AI proctoring.
            </Text>

            <Flex align="center" gap={2} color="green.400" fontSize="13px" fontWeight="600">
              <Icon as={FaShieldAlt} />
              <Text>256-Bit SSL Encrypted & Secure Examination Engine</Text>
            </Flex>
          </Box>

          {/* Col 2: Platform Features */}
          <Box gridColumn={{ lg: "span 3" }}>
            <Text fontSize="15px" fontWeight="700" color="white" mb={4}>
              Platform Solutions
            </Text>
            <Stack gap={2.5} fontSize="14px" color="gray.400">
              <Text _hover={{ color: "purple.200" }} cursor="pointer">
                AI Facial Verification
              </Text>
              <Text _hover={{ color: "purple.200" }} cursor="pointer">
                50,000+ Past Questions Bank
              </Text>
              <Text _hover={{ color: "purple.200" }} cursor="pointer">
                LaTeX MathJax Equations
              </Text>
              <Text _hover={{ color: "purple.200" }} cursor="pointer">
                Instant Auto-Grading Engine
              </Text>
              <Text _hover={{ color: "purple.200" }} cursor="pointer">
                Excel Bulk Student Roster
              </Text>
              <Text _hover={{ color: "purple.200" }} cursor="pointer">
                Export PDF Result Slips
              </Text>
            </Stack>
          </Box>

          {/* Col 3: Curricula & Exams */}
          <Box gridColumn={{ lg: "span 2" }}>
            <Text fontSize="15px" fontWeight="700" color="white" mb={4}>
              Supported Exams
            </Text>
            <Stack gap={2.5} fontSize="14px" color="gray.400">
              <Text _hover={{ color: "purple.200" }} cursor="pointer">
                JAMB UTME CBT
              </Text>
              <Text _hover={{ color: "purple.200" }} cursor="pointer">
                WAEC SSCE
              </Text>
              <Text _hover={{ color: "purple.200" }} cursor="pointer">
                NECO Senior School
              </Text>
              <Text _hover={{ color: "purple.200" }} cursor="pointer">
                Post-UTME Screenings
              </Text>
              <Text _hover={{ color: "purple.200" }} cursor="pointer">
                Termly School Tests
              </Text>
            </Stack>
          </Box>

          {/* Col 4: Quick Portals */}
          <Box gridColumn={{ lg: "span 3" }}>
            <Text fontSize="15px" fontWeight="700" color="white" mb={4}>
              Direct Portals
            </Text>
            <Stack gap={3}>
              <Box
                p={3}
                borderRadius="xl"
                bg="whiteAlpha.100"
                border="1px solid whiteAlpha.200"
                cursor="pointer"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={onExamModalOpen}
              >
                <Text fontSize="13px" fontWeight="700" color="white">
                  Student Exam Room
                </Text>
                <Text fontSize="11px" color="gray.400">
                  Enter test code & take CBT exam
                </Text>
              </Box>

              <Box
                p={3}
                borderRadius="xl"
                bg="whiteAlpha.100"
                border="1px solid whiteAlpha.200"
                cursor="pointer"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={onLoginOpen}
              >
                <Text fontSize="13px" fontWeight="700" color="white">
                  Teacher & Admin Login
                </Text>
                <Text fontSize="11px" color="gray.400">
                  Manage questions, exams & results
                </Text>
              </Box>
            </Stack>
          </Box>
        </SimpleGrid>

        {/* Bottom Bar */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
          pt={8}
          borderTop="1px solid"
          borderColor="whiteAlpha.100"
          gap={4}
        >
          <Text fontSize="13px" color="gray.500">
            &copy; {new Date().getFullYear()} AceSmart Inc. All rights reserved. Built with pride for Nigeria & West Africa.
          </Text>

          <Flex gap={5} color="gray.400" fontSize="16px">
            <Icon
              as={FaWhatsapp}
              _hover={{ color: "green.400", transform: "scale(1.1)" }}
              cursor="pointer"
              transition="all 0.2s"
              onClick={() => window.open("https://wa.me/2349038561058", "_blank")}
            />
            <Icon
              as={FaTwitter}
              _hover={{ color: "blue.400", transform: "scale(1.1)" }}
              cursor="pointer"
              transition="all 0.2s"
            />
            <Icon
              as={FaLinkedin}
              _hover={{ color: "blue.500", transform: "scale(1.1)" }}
              cursor="pointer"
              transition="all 0.2s"
            />
            <Icon
              as={FaFacebook}
              _hover={{ color: "blue.600", transform: "scale(1.1)" }}
              cursor="pointer"
              transition="all 0.2s"
            />
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

export default Footer;
