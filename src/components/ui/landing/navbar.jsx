import {
  Box,
  Flex,
  Text,
  Icon,
  Button,
  useBreakpointValue,
} from "@chakra-ui/react";
import { FaBrain, FaBars, FaGraduationCap, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Navbar = ({
  onNavClick,
  refs,
  onLoginOpen,
  onDrawerOpen,
  onMenuOpen,
  onExamModalOpen,
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const navigate = useNavigate();

  return (
    <Box
      as="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={100}
      bg="rgba(255, 255, 255, 0.88)"
      backdropFilter="blur(16px)"
      borderBottom="1px solid"
      borderColor="rgba(226, 232, 240, 0.8)"
      boxShadow="0 4px 24px -4px rgba(106, 27, 154, 0.06)"
      transition="all 0.3s ease"
    >
      <Flex
        maxW="1320px"
        mx="auto"
        px={{ base: 4, md: 8 }}
        py={3.5}
        justifyContent="space-between"
        alignItems="center"
      >
        {/* Brand Logo */}
        <Flex
          align="center"
          gap={3}
          cursor="pointer"
          onClick={(e) => onNavClick(refs.home, e)}
          _hover={{ transform: "scale(1.02)" }}
          transition="transform 0.2s"
        >
          <Flex
            align="center"
            justify="center"
            w="42px"
            h="42px"
            borderRadius="xl"
            bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 50%, #AB47BC 100%)"
            boxShadow="0 4px 12px rgba(106, 27, 154, 0.35)"
            color="white"
          >
            <Icon as={FaBrain} boxSize={5} />
          </Flex>
          <Box>
            <Flex align="center" gap={1.5}>
              <Text
                fontSize="22px"
                fontWeight="800"
                letterSpacing="-0.5px"
                color="gray.900"
                fontFamily="'Outfit', sans-serif"
                lineHeight="1.1"
              >
                Ace<span style={{ color: "#6A1B9A" }}>Smart</span>
              </Text>
              <Box
                px={1.5}
                py={0.5}
                borderRadius="full"
                bg="purple.50"
                border="1px solid"
                borderColor="purple.200"
              >
                <Text
                  fontSize="10px"
                  fontWeight="700"
                  color="#6A1B9A"
                  letterSpacing="0.5px"
                >
                  CBT
                </Text>
              </Box>
            </Flex>
            <Text
              fontSize="11px"
              fontWeight="500"
              color="gray.500"
              letterSpacing="0.2px"
            >
              Smart Exam Portal
            </Text>
          </Box>
        </Flex>

        {/* Desktop Navigation Links */}
        <Flex
          gap={8}
          align="center"
          display={{ base: "none", lg: "flex" }}
          fontWeight="500"
          fontSize="15px"
          color="gray.600"
        >
          <Text
            cursor="pointer"
            onClick={(e) => onNavClick(refs.home, e)}
            _hover={{ color: "#6A1B9A" }}
            transition="color 0.2s"
          >
            Home
          </Text>
          <Text
            cursor="pointer"
            onClick={(e) => onNavClick(refs.about, e)}
            _hover={{ color: "#6A1B9A" }}
            transition="color 0.2s"
          >
            Features
          </Text>
          <Text
            cursor="pointer"
            onClick={(e) => onNavClick(refs.number, e)}
            _hover={{ color: "#6A1B9A" }}
            transition="color 0.2s"
          >
            Impact
          </Text>
          <Text
            cursor="pointer"
            onClick={(e) => onNavClick(refs.testimonials, e)}
            _hover={{ color: "#6A1B9A" }}
            transition="color 0.2s"
          >
            Testimonials
          </Text>
          <Text
            cursor="pointer"
            onClick={() => navigate("/pricing")}
            _hover={{ color: "#6A1B9A" }}
            transition="color 0.2s"
          >
            Pricing
          </Text>
          <Text
            cursor="pointer"
            onClick={(e) => onNavClick(refs.contact, e)}
            _hover={{ color: "#6A1B9A" }}
            transition="color 0.2s"
          >
            Contact
          </Text>
        </Flex>

        {/* Action Buttons */}
        {isMobile ? (
          <Flex align="center" gap={2}>
            <Button
              size="sm"
              bg="#6A1B9A"
              color="white"
              borderRadius="lg"
              px={3}
              fontSize="12px"
              fontWeight="600"
              onClick={onExamModalOpen}
            >
              Take Exam
            </Button>
            <Button
              variant="ghost"
              p={2}
              borderRadius="lg"
              color="gray.700"
              _hover={{ bg: "purple.50" }}
              onClick={onMenuOpen}
              aria-label="Open navigation menu"
            >
              <Icon as={FaBars} boxSize={5} color="#6A1B9A" />
            </Button>
          </Flex>
        ) : (
          <Flex align="center" gap={3}>
            {/* Quick Candidate Portal Access */}
            <Button
              size="sm"
              variant="outline"
              borderColor="purple.200"
              bg="purple.50"
              color="#6A1B9A"
              borderRadius="xl"
              px={4}
              fontSize="13px"
              fontWeight="600"
              _hover={{
                bg: "purple.100",
                borderColor: "#6A1B9A",
                transform: "translateY(-1px)",
              }}
              onClick={onExamModalOpen}
              transition="all 0.2s"
            >
              <Icon as={FaGraduationCap} mr={1.5} />
              Take Exam
            </Button>

            {/* Login button */}
            <Button
              size="sm"
              variant="ghost"
              color="gray.700"
              borderRadius="xl"
              px={4}
              fontSize="14px"
              fontWeight="600"
              _hover={{
                color: "#6A1B9A",
                bg: "purple.50",
              }}
              onClick={onLoginOpen}
            >
              Teacher Login
            </Button>

            {/* Register / Get Started CTA */}
            <Button
              size="sm"
              bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
              color="white"
              borderRadius="xl"
              px={5}
              py={4}
              fontSize="14px"
              fontWeight="600"
              boxShadow="0 4px 14px rgba(106, 27, 154, 0.3)"
              _hover={{
                opacity: 0.95,
                transform: "translateY(-1px)",
                boxShadow: "0 6px 18px rgba(106, 27, 154, 0.4)",
              }}
              onClick={onDrawerOpen}
              transition="all 0.2s"
            >
              Get Started Free
              <Icon as={FaArrowRight} ml={1.5} boxSize={3} />
            </Button>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export default Navbar;
