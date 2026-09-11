import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Icon,
  SimpleGrid,
  Accordion,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EDUCATOR_PLANS,
  CANDIDATE_PASSES,
  FAQS,
} from "../constants/pricingData";
import PaymentModal from "../components/payment/PaymentModal";
import Navbar from "../components/ui/landing/navbar";
import Footer from "../components/ui/landing/Footer";
import {
  FaCheck,
  FaGraduationCap,
  FaShieldAlt,
  FaArrowRight,
  FaBolt,
  FaQuestionCircle,
} from "react-icons/fa";

export default function PricingPage() {
  const [audience, setAudience] = useState("educators"); // "educators" | "candidates"
  const [billingCycle, setBillingCycle] = useState("termly"); // "monthly" | "termly"
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenCheckout = (plan) => {
    setSelectedPlanForCheckout(plan);
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = () => {
    // If candidate, redirect to take exam or dashboard
    if (audience === "candidates") {
      navigate("/take_exam");
    } else {
      navigate("/teacher_dashboard");
    }
  };

  return (
    <Box minH="100vh" bg="#0A0E1A" color="white" position="relative">
      {/* Landing Navbar */}
      <Navbar
        onNavClick={() => navigate("/")}
        refs={{}}
        onLoginOpen={() => navigate("/")}
        onDrawerOpen={() => {}}
        onMenuOpen={() => {}}
        onExamModalOpen={() => navigate("/")}
      />

      {/* Hero Header */}
      <Box pt={{ base: "90px", md: "110px" }} pb={12} px={4} textAlign="center" maxW="900px" mx="auto">
        <HStack justify="center" spacing={2} mb={3}>
          <Badge bg="rgba(37, 99, 235, 0.2)" color="#60A5FA" border="1px solid rgba(37, 99, 235, 0.3)" borderRadius="full" px={3} py={1} fontSize="11px" fontWeight="bold">
            TRANSPARENT & AFFORDABLE PRICING
          </Badge>
        </HStack>

        <Text
          fontSize={{ base: "30px", sm: "40px", md: "48px" }}
          fontWeight="900"
          fontFamily="'Outfit', sans-serif"
          lineHeight="1.15"
          letterSpacing="-0.5px"
          mb={4}
        >
          Predictable Plans for Schools.{" "}
          <span style={{ color: "#38BDF8" }}>Affordable Passes for Candidates.</span>
        </Text>

        <Text fontSize={{ base: "14px", md: "16px" }} color="#94A3B8" maxW="680px" mx="auto" mb={8}>
          Power your entire school's examinations with automated grading and anti-cheat proctoring, or practice unlimited CBT past questions for JAMB UTME and WAEC.
        </Text>

        {/* Audience Switcher (Schools vs Candidates) */}
        <Flex justify="center" mb={6}>
          <HStack bg="#1E293B" p={1.5} borderRadius="2xl" border="1px solid #334155">
            <Button
              size="md"
              borderRadius="xl"
              px={5}
              fontWeight="bold"
              fontSize="13px"
              bg={audience === "educators" ? "#2563EB" : "transparent"}
              color={audience === "educators" ? "white" : "#94A3B8"}
              _hover={audience === "educators" ? {} : { color: "white" }}
              onClick={() => setAudience("educators")}
              leftIcon={<Icon as={FaGraduationCap} />}
            >
              Schools & Educators
            </Button>
            <Button
              size="md"
              borderRadius="xl"
              px={5}
              fontWeight="bold"
              fontSize="13px"
              bg={audience === "candidates" ? "#2563EB" : "transparent"}
              color={audience === "candidates" ? "white" : "#94A3B8"}
              _hover={audience === "candidates" ? {} : { color: "white" }}
              onClick={() => setAudience("candidates")}
              leftIcon={<Icon as={FaBolt} />}
            >
              Students & Candidates
            </Button>
          </HStack>
        </Flex>

        {/* Billing Switcher (Only for Educators) */}
        {audience === "educators" && (
          <Flex justify="center" align="center" gap={3}>
            <HStack bg="#1E293B" p={1} borderRadius="xl" border="1px solid #334155">
              <Button
                size="sm"
                borderRadius="lg"
                px={4}
                fontSize="12px"
                fontWeight="bold"
                bg={billingCycle === "monthly" ? "#334155" : "transparent"}
                color={billingCycle === "monthly" ? "white" : "#94A3B8"}
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly Billing
              </Button>
              <Button
                size="sm"
                borderRadius="lg"
                px={4}
                fontSize="12px"
                fontWeight="bold"
                bg={billingCycle === "termly" ? "#334155" : "transparent"}
                color={billingCycle === "termly" ? "white" : "#94A3B8"}
                onClick={() => setBillingCycle("termly")}
              >
                <HStack spacing={1.5}>
                  <Text>Termly (3 Months)</Text>
                  <Badge bg="#10B981" color="white" fontSize="9px" borderRadius="full" px={1.5}>
                    SAVE 20%
                  </Badge>
                </HStack>
              </Button>
            </HStack>
          </Flex>
        )}
      </Box>

      {/* PLANS GRID */}
      <Box maxW="1320px" mx="auto" px={{ base: 4, md: 8 }} pb={20}>
        {audience === "educators" ? (
          /* SCHOOL / EDUCATOR PLANS */
          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={6} alignItems="stretch">
            {EDUCATOR_PLANS.map((plan) => {
              const price = billingCycle === "termly" ? plan.termlyPrice : plan.monthlyPrice;
              const formattedPrice =
                price === 0
                  ? "Free"
                  : new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                      maximumFractionDigits: 0,
                    }).format(price);

              return (
                <Box
                  key={plan.id}
                  bg="#1E293B"
                  borderRadius="24px"
                  border={plan.popular ? "2px solid #3B82F6" : "1px solid #334155"}
                  p={{ base: 6, sm: 7 }}
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  position="relative"
                  boxShadow={plan.popular ? "0 20px 40px rgba(37, 99, 235, 0.25)" : "0 10px 30px rgba(0,0,0,0.3)"}
                >
                  {plan.popular && (
                    <Badge
                      position="absolute"
                      top="-12px"
                      left="50%"
                      transform="translateX(-50%)"
                      bg="#2563EB"
                      color="white"
                      fontSize="11px"
                      fontWeight="bold"
                      borderRadius="full"
                      px={3}
                      py={0.5}
                    >
                      RECOMMENDED
                    </Badge>
                  )}

                  <Box>
                    <Text fontSize="20px" fontWeight="800" color="white">
                      {plan.name}
                    </Text>
                    <Text fontSize="12px" color="#94A3B8" mt={1} minH="36px">
                      {plan.tagline}
                    </Text>

                    <HStack align="baseline" spacing={1} my={5}>
                      <Text fontSize="32px" fontWeight="900" color="white" lineHeight="1">
                        {formattedPrice}
                      </Text>
                      {price > 0 && (
                        <Text fontSize="12px" color="#94A3B8">
                          /{billingCycle === "termly" ? "term" : "mo"}
                        </Text>
                      )}
                    </HStack>

                    <Box borderTop="1px solid #334155" pt={4} mb={6}>
                      <Text fontSize="11px" fontWeight="bold" color="#94A3B8" mb={3} textTransform="uppercase" letterSpacing="0.5px">
                        PLAN INCLUDES:
                      </Text>
                      <VStack spacing={2.5} align="stretch">
                        {plan.features.map((feat, idx) => (
                          <HStack key={idx} spacing={2.5} align="flex-start">
                            <Icon as={FaCheck} color="#34D399" boxSize={3.5} mt={0.5} />
                            <Text fontSize="13px" color="#CBD5E1" lineHeight="1.3">
                              {feat}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  </Box>

                  <Button
                    w="100%"
                    h="46px"
                    borderRadius="14px"
                    fontWeight="bold"
                    fontSize="14px"
                    bg={plan.popular ? "#2563EB" : "#334155"}
                    color="white"
                    _hover={{ bg: plan.popular ? "#1D4ED8" : "#475569" }}
                    onClick={() => handleOpenCheckout(plan)}
                  >
                    {plan.id === "starter" ? "Get Started Free" : plan.ctaText}
                  </Button>
                </Box>
              );
            })}
          </SimpleGrid>
        ) : (
          /* CANDIDATE EXAM PASSES */
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} maxW="1080px" mx="auto">
            {CANDIDATE_PASSES.map((pass) => {
              const formattedPrice = new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
                maximumFractionDigits: 0,
              }).format(pass.price);

              return (
                <Box
                  key={pass.id}
                  bg="#1E293B"
                  borderRadius="24px"
                  border={pass.popular ? "2px solid #3B82F6" : "1px solid #334155"}
                  p={{ base: 6, sm: 7 }}
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  position="relative"
                  boxShadow={pass.popular ? "0 20px 40px rgba(37, 99, 235, 0.25)" : "0 10px 30px rgba(0,0,0,0.3)"}
                >
                  {pass.popular && (
                    <Badge
                      position="absolute"
                      top="-12px"
                      left="50%"
                      transform="translateX(-50%)"
                      bg="#2563EB"
                      color="white"
                      fontSize="11px"
                      fontWeight="bold"
                      borderRadius="full"
                      px={3}
                      py={0.5}
                    >
                      BEST VALUE FOR UTME
                    </Badge>
                  )}

                  <Box>
                    <HStack justify="space-between">
                      <Text fontSize="20px" fontWeight="800" color="white">
                        {pass.name}
                      </Text>
                      <Badge bg="#0F172A" color="#38BDF8" border="1px solid #334155" borderRadius="md">
                        {pass.duration}
                      </Badge>
                    </HStack>

                    <Text fontSize="12px" color="#94A3B8" mt={1} minH="36px">
                      {pass.tagline}
                    </Text>

                    <HStack align="baseline" spacing={1} my={5}>
                      <Text fontSize="32px" fontWeight="900" color="white" lineHeight="1">
                        {formattedPrice}
                      </Text>
                      <Text fontSize="12px" color="#94A3B8">
                        /pass
                      </Text>
                    </HStack>

                    <Box borderTop="1px solid #334155" pt={4} mb={6}>
                      <Text fontSize="11px" fontWeight="bold" color="#94A3B8" mb={3} textTransform="uppercase" letterSpacing="0.5px">
                        WHAT YOU GET:
                      </Text>
                      <VStack spacing={2.5} align="stretch">
                        {pass.features.map((feat, idx) => (
                          <HStack key={idx} spacing={2.5} align="flex-start">
                            <Icon as={FaCheck} color="#34D399" boxSize={3.5} mt={0.5} />
                            <Text fontSize="13px" color="#CBD5E1" lineHeight="1.3">
                              {feat}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  </Box>

                  <Button
                    w="100%"
                    h="46px"
                    borderRadius="14px"
                    fontWeight="bold"
                    fontSize="14px"
                    bg={pass.popular ? "#2563EB" : "#334155"}
                    color="white"
                    _hover={{ bg: pass.popular ? "#1D4ED8" : "#475569" }}
                    onClick={() => handleOpenCheckout(pass)}
                  >
                    {pass.ctaText}
                  </Button>
                </Box>
              );
            })}
          </SimpleGrid>
        )}

        {/* FREQUENTLY ASKED QUESTIONS */}
        <Box mt={20} maxW="860px" mx="auto">
          <HStack justify="center" spacing={2} mb={2}>
            <Icon as={FaQuestionCircle} color="#38BDF8" />
            <Text fontSize="13px" fontWeight="bold" color="#38BDF8" textTransform="uppercase" letterSpacing="0.5px">
              QUESTIONS & ANSWERS
            </Text>
          </HStack>
          <Text fontSize="28px" fontWeight="800" color="white" textAlign="center" mb={8} fontFamily="'Outfit', sans-serif">
            Frequently Asked Billing Questions
          </Text>

          <VStack spacing={4} align="stretch">
            {FAQS.map((faq, idx) => (
              <Box key={idx} bg="#1E293B" border="1px solid #334155" borderRadius="18px" p={5}>
                <Text fontSize="15px" fontWeight="bold" color="white" mb={2}>
                  {faq.question}
                </Text>
                <Text fontSize="13px" color="#94A3B8" lineHeight="1.5">
                  {faq.answer}
                </Text>
              </Box>
            ))}
          </VStack>
        </Box>
      </Box>

      {/* Footer */}
      <Footer
        onLoginOpen={() => navigate("/")}
        onDrawerOpen={() => navigate("/")}
        onExamModalOpen={() => navigate("/")}
      />

      {/* Checkout Modal */}
      {selectedPlanForCheckout && (
        <PaymentModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          plan={selectedPlanForCheckout}
          billingCycle={billingCycle}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </Box>
  );
}
