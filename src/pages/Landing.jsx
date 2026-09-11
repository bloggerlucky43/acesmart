import { useRef, useState } from "react";
import {
  Box,
  Text,
  Flex,
  Icon,
  Button,
  Input,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/ui/landing/navbar";
import Heading from "../components/ui/landing/Heading";
import Features from "../components/ui/landing/features";
import Numbers from "../components/ui/landing/numbers";
import Testimonial from "../components/ui/landing/testimonial";
import Contact from "../components/ui/landing/contact";
import Footer from "../components/ui/landing/Footer";
import {
  FaBrain,
  FaTimes,
  FaGraduationCap,
  FaArrowRight,
} from "react-icons/fa";

function Landing() {
  const [showMenu, setShowMenu] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [examCode, setExamCode] = useState("");
  const [examError, setExamError] = useState("");

  const headingRef = useRef(null);
  const featureRef = useRef(null);
  const numberRef = useRef(null);
  const testimonialRef = useRef(null);
  const contactRef = useRef(null);

  const isMobile = useBreakpointValue({ base: true, md: false });
  const navigate = useNavigate();

  const scrollToSection = (ref, e) => {
    if (e) e.preventDefault();
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLaunchExam = (e) => {
    e.preventDefault();
    const trimmed = examCode.trim();
    if (!trimmed) {
      setExamError("Please enter a valid Exam ID or Access Code");
      return;
    }
    setShowExamModal(false);
    navigate(`/exam/${trimmed}`);
  };

  return (
    <Box minH="100vh" bg="#FAFAFA" position="relative">
      {/* Top Navigation */}
      <Navbar
        onNavClick={scrollToSection}
        refs={{
          home: headingRef,
          about: featureRef,
          number: numberRef,
          testimonials: testimonialRef,
          contact: contactRef,
        }}
        onLoginOpen={() => navigate("/login")}
        onDrawerOpen={() => navigate("/register")}
        onMenuOpen={() => setShowMenu(true)}
        onExamModalOpen={() => setShowExamModal(true)}
      />

      {/* Main Content Sections */}
      <Box as="main">
        <Heading
          homeRef={headingRef}
          onGetStarted={() => navigate("/register")}
          onTakeExam={() => setShowExamModal(true)}
        />
        <Numbers numberRef={numberRef} />
        <Features aboutRef={featureRef} />
        <Testimonial testimonialsRef={testimonialRef} />
        <Contact contactRef={contactRef} />
        <Footer
          onLoginOpen={() => navigate("/login")}
          onDrawerOpen={() => navigate("/register")}
          onExamModalOpen={() => setShowExamModal(true)}
        />
      </Box>

      {/* Quick Exam Code Modal */}
      {showExamModal && (
        <Box
          position="fixed"
          inset={0}
          zIndex={150}
          bg="rgba(17, 7, 38, 0.65)"
          backdropFilter="blur(8px)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <Box
            bg="white"
            borderRadius="24px"
            p={{ base: 6, sm: 8 }}
            maxW="480px"
            w="100%"
            boxShadow="0 24px 60px rgba(0,0,0,0.25)"
            position="relative"
            animation="float 0.3s ease-out"
          >
            <Flex justify="space-between" align="center" mb={5}>
              <Flex align="center" gap={2.5}>
                <Flex
                  w="38px"
                  h="38px"
                  borderRadius="xl"
                  bg="purple.50"
                  color="#6A1B9A"
                  align="center"
                  justify="center"
                >
                  <Icon as={FaGraduationCap} boxSize={5} />
                </Flex>
                <Box>
                  <Text fontSize="18px" fontWeight="800" color="gray.900">
                    Candidate Exam Portal
                  </Text>
                  <Text fontSize="12px" color="gray.500">
                    Enter your school or test access code
                  </Text>
                </Box>
              </Flex>
              <Icon
                as={FaTimes}
                boxSize={4}
                color="gray.400"
                cursor="pointer"
                _hover={{ color: "gray.700" }}
                onClick={() => {
                  setShowExamModal(false);
                  setExamError("");
                }}
              />
            </Flex>

            <form onSubmit={handleLaunchExam}>
              <Box mb={4}>
                <Text fontSize="13px" fontWeight="700" color="gray.700" mb={1.5}>
                  Exam ID or Room Code
                </Text>
                <Input
                  placeholder="e.g. EXAM-2024-MATH or 12"
                  value={examCode}
                  onChange={(e) => {
                    setExamCode(e.target.value);
                    setExamError("");
                  }}
                  borderRadius="xl"
                  h="48px"
                  fontSize="15px"
                  borderColor={examError ? "red.400" : "gray.300"}
                  _focus={{ borderColor: "#6A1B9A", boxShadow: "0 0 0 1px #6A1B9A" }}
                  autoFocus
                />
                {examError && (
                  <Text color="red.500" fontSize="12px" mt={1}>
                    {examError}
                  </Text>
                )}
              </Box>

              <Button
                type="submit"
                w="100%"
                h="48px"
                bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
                color="white"
                borderRadius="xl"
                fontSize="15px"
                fontWeight="700"
                boxShadow="0 4px 14px rgba(106, 27, 154, 0.3)"
                _hover={{ opacity: 0.95 }}
                mb={3}
              >
                Proceed to Exam
                <Icon as={FaArrowRight} ml={2} boxSize={3.5} />
              </Button>

              <Button
                variant="ghost"
                w="100%"
                size="sm"
                color="gray.500"
                onClick={() => {
                  setShowExamModal(false);
                  navigate("/take_exam");
                }}
              >
                Open General Practice Room
              </Button>
            </form>
          </Box>
        </Box>
      )}

      {/* Mobile Navigation Drawer */}
      {showMenu && (
        <Box
          position="fixed"
          inset={0}
          zIndex={160}
          bg="rgba(17, 7, 38, 0.5)"
          backdropFilter="blur(4px)"
          onClick={() => setShowMenu(false)}
        >
          <Box
            position="fixed"
            top={0}
            left={0}
            bg="white"
            shadow="2xl"
            w={{ base: "85%", sm: "320px" }}
            h="100vh"
            p={6}
            onClick={(e) => e.stopPropagation()}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <Box>
              <Flex align="center" justify="space-between" pb={4} borderBottom="1px solid" borderColor="gray.100" mb={6}>
                <Flex align="center" gap={2}>
                  <Flex
                    w="36px"
                    h="36px"
                    borderRadius="lg"
                    bg="#6A1B9A"
                    color="white"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FaBrain} boxSize={4} />
                  </Flex>
                  <Text fontSize="18px" fontWeight="800">
                    Ace<span style={{ color: "#6A1B9A" }}>Smart</span>
                  </Text>
                </Flex>
                <Icon
                  as={FaTimes}
                  boxSize={4}
                  color="gray.500"
                  cursor="pointer"
                  onClick={() => setShowMenu(false)}
                />
              </Flex>

              <Flex direction="column" gap={3}>
                <Text
                  fontSize="16px"
                  fontWeight="600"
                  color="gray.800"
                  p={2}
                  borderRadius="lg"
                  cursor="pointer"
                  _hover={{ bg: "purple.50", color: "#6A1B9A" }}
                  onClick={(e) => {
                    setShowMenu(false);
                    scrollToSection(headingRef, e);
                  }}
                >
                  Home
                </Text>
                <Text
                  fontSize="16px"
                  fontWeight="600"
                  color="gray.800"
                  p={2}
                  borderRadius="lg"
                  cursor="pointer"
                  _hover={{ bg: "purple.50", color: "#6A1B9A" }}
                  onClick={(e) => {
                    setShowMenu(false);
                    scrollToSection(featureRef, e);
                  }}
                >
                  Features
                </Text>
                <Text
                  fontSize="16px"
                  fontWeight="600"
                  color="gray.800"
                  p={2}
                  borderRadius="lg"
                  cursor="pointer"
                  _hover={{ bg: "purple.50", color: "#6A1B9A" }}
                  onClick={(e) => {
                    setShowMenu(false);
                    scrollToSection(numberRef, e);
                  }}
                >
                  Impact
                </Text>
                <Text
                  fontSize="16px"
                  fontWeight="600"
                  color="gray.800"
                  p={2}
                  borderRadius="lg"
                  cursor="pointer"
                  _hover={{ bg: "purple.50", color: "#6A1B9A" }}
                  onClick={(e) => {
                    setShowMenu(false);
                    scrollToSection(testimonialRef, e);
                  }}
                >
                  Testimonials
                </Text>
                <Text
                  fontSize="16px"
                  fontWeight="600"
                  color="gray.800"
                  p={2}
                  borderRadius="lg"
                  cursor="pointer"
                  _hover={{ bg: "purple.50", color: "#6A1B9A" }}
                  onClick={() => {
                    setShowMenu(false);
                    navigate("/pricing");
                  }}
                >
                  Pricing & Plans
                </Text>
                <Text
                  fontSize="16px"
                  fontWeight="600"
                  color="gray.800"
                  p={2}
                  borderRadius="lg"
                  cursor="pointer"
                  _hover={{ bg: "purple.50", color: "#6A1B9A" }}
                  onClick={(e) => {
                    setShowMenu(false);
                    scrollToSection(contactRef, e);
                  }}
                >
                  Contact
                </Text>
              </Flex>
            </Box>

            <Box pt={6} borderTop="1px solid" borderColor="gray.100">
              <Button
                w="100%"
                variant="outline"
                borderColor="purple.200"
                color="#6A1B9A"
                borderRadius="xl"
                mb={2.5}
                onClick={() => {
                  setShowMenu(false);
                  setShowExamModal(true);
                }}
              >
                Take Exam with Code
              </Button>
              <Button
                w="100%"
                bg="#6A1B9A"
                color="white"
                borderRadius="xl"
                mb={2.5}
                onClick={() => {
                  setShowMenu(false);
                  navigate("/login");
                }}
              >
                Teacher Login
              </Button>
              <Button
                w="100%"
                bg="purple.50"
                color="#6A1B9A"
                borderRadius="xl"
                onClick={() => {
                  setShowMenu(false);
                  navigate("/register");
                }}
              >
                Register School
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Landing;
