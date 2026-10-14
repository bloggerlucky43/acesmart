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
  Input,
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
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
  FaCalculator,
  FaCoins,
  FaRobot,
  FaUsers,
  FaCrown,
  FaGraduationCap,
} from "react-icons/fa";

export default function PricingPage() {
  const [audience, setAudience] = useState("educators"); // "educators" | "candidates"
  const [billingCycle, setBillingCycle] = useState("termly"); // "monthly" | "termly" | "annual"

  // Profit Calculator State
  const [calcPlan, setCalcPlan] = useState("standard"); // "standard" | "premier"
  const [calcStudents, setCalcStudents] = useState(200);
  const [calcLevy, setCalcLevy] = useState(1000);

  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const navigate = useNavigate();

  // Calculator calculations
  const schoolCost = useMemo(() => {
    const isPremier = calcPlan === "premier";
    if (billingCycle === "monthly") return isPremier ? 18000 : 10000;
    if (billingCycle === "annual") return isPremier ? 115000 : 65000;
    return isPremier ? 45000 : 25000;
  }, [calcPlan, billingCycle]);

  const parentCollection = useMemo(() => {
    const students = Math.max(Number(calcStudents) || 0, 0);
    const levy = Math.max(Number(calcLevy) || 0, 0);
    if (billingCycle === "annual") return students * levy * 3;
    if (billingCycle === "monthly") return Math.round((students * levy) / 3);
    return students * levy;
  }, [calcStudents, calcLevy, billingCycle]);

  const netSurplus = useMemo(() => {
    return parentCollection - schoolCost;
  }, [parentCollection, schoolCost]);

  const annualSavings = useMemo(() => {
    return calcPlan === "premier" ? 20000 : 10000;
  }, [calcPlan]);

  const handleOpenCheckout = (plan) => {
    setSelectedPlanForCheckout(plan);
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = () => {
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
      <Box
        pt={{ base: "90px", md: "115px" }}
        pb={6}
        px={4}
        textAlign="center"
        maxW="920px"
        mx="auto"
      >
        <HStack justify="center" spacing={2} mb={3} flexWrap="wrap">
          <Badge
            bg="rgba(37, 99, 235, 0.2)"
            color="#60A5FA"
            border="1px solid rgba(37, 99, 235, 0.3)"
            borderRadius="full"
            px={3.5}
            py={1}
            fontSize="11px"
            fontWeight="bold"
            letterSpacing="0.5px"
          >
            FLAT-RATE TRANSPARENT PRICING
          </Badge>
          <Badge
            bg="rgba(16, 185, 129, 0.2)"
            color="#34D399"
            border="1px solid rgba(16, 185, 129, 0.3)"
            borderRadius="full"
            px={3.5}
            py={1}
            fontSize="11px"
            fontWeight="bold"
            letterSpacing="0.5px"
          >
            🔥 UNLIMITED STUDENT CAPACITY
          </Badge>
          <Badge
            bg="rgba(245, 158, 11, 0.2)"
            color="#FBBF24"
            border="1px solid rgba(245, 158, 11, 0.3)"
            borderRadius="full"
            px={3.5}
            py={1}
            fontSize="11px"
            fontWeight="bold"
            letterSpacing="0.5px"
          >
            ANNUAL PLAN: SAVE UP TO ₦20,000
          </Badge>
        </HStack>

        <Text
          fontSize={{ base: "28px", sm: "38px", md: "46px" }}
          fontWeight="900"
          fontFamily="'Outfit', sans-serif"
          lineHeight="1.15"
          letterSpacing="-0.5px"
          mb={4}
        >
          One Flat Price.{" "}
          <span style={{ color: "#38BDF8" }}>
            Zero Student Headcount Limits.
          </span>
        </Text>

        <Text
          fontSize={{ base: "13px", md: "15px" }}
          color="#94A3B8"
          maxW="720px"
          mx="auto"
          mb={6}
        >
          No per-student fees or surprise upgrade cliffs. Standard Academy
          covers unlimited students for just <b>₦25,000/term</b>. Upgrade to
          Premier for complete SMS automation including Staff Payroll, Master
          Broadsheets, and ID Cards.
        </Text>

        {/* Audience Switcher (Schools vs Candidates) */}
        <Flex justify="center" mb={6}>
          <HStack
            bg="#1E293B"
            p={1.5}
            borderRadius="2xl"
            border="1px solid #334155"
          >
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
            >
              Schools & Institutions
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
            >
              JAMB & WAEC Candidates
            </Button>
          </HStack>
        </Flex>

        {/* Billing Cycle Switcher (For Schools) */}
        {audience === "educators" && (
          <Flex justify="center" align="center" gap={3}>
            <HStack
              bg="#1E293B"
              p={1}
              borderRadius="xl"
              border="1px solid #334155"
              flexWrap="wrap"
              justify="center"
            >
              <Button
                size="sm"
                borderRadius="lg"
                px={3.5}
                fontSize="12px"
                fontWeight="bold"
                bg={billingCycle === "monthly" ? "#334155" : "transparent"}
                color={billingCycle === "monthly" ? "white" : "#94A3B8"}
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly
              </Button>
              <Button
                size="sm"
                borderRadius="lg"
                px={4}
                fontSize="12px"
                fontWeight="bold"
                bg={billingCycle === "termly" ? "#2563EB" : "transparent"}
                color={billingCycle === "termly" ? "white" : "#94A3B8"}
                onClick={() => setBillingCycle("termly")}
              >
                <HStack spacing={1.5}>
                  <Text>Termly (Per Term)</Text>
                  <Badge
                    bg="#10B981"
                    color="white"
                    fontSize="9px"
                    borderRadius="full"
                    px={1.5}
                  >
                    POPULAR
                  </Badge>
                </HStack>
              </Button>
              <Button
                size="sm"
                borderRadius="lg"
                px={4}
                fontSize="12px"
                fontWeight="bold"
                bg={billingCycle === "annual" ? "#10B981" : "transparent"}
                color={billingCycle === "annual" ? "white" : "#94A3B8"}
                onClick={() => setBillingCycle("annual")}
              >
                <HStack spacing={1.5}>
                  <Text>Annual (Full Session)</Text>
                  <Badge
                    bg="#F59E0B"
                    color="white"
                    fontSize="9px"
                    borderRadius="full"
                    px={1.5}
                  >
                    SAVE ₦10K - ₦20K
                  </Badge>
                </HStack>
              </Button>
            </HStack>
          </Flex>
        )}
      </Box>

      {/* MAIN CONTENT AREA */}
      <Box maxW="1280px" mx="auto" px={{ base: 4, md: 8 }} pb={20}>
        {audience === "educators" ? (
          <>
            {/* ========================================================
                THE 3 EDUCATOR PLAN CARDS
               ======================================================== */}
            <SimpleGrid
              columns={{ base: 1, lg: 3 }}
              gap={6}
              alignItems="stretch"
              mb={14}
            >
              {EDUCATOR_PLANS.map((plan) => {
                const isAnnual = billingCycle === "annual";
                const isMonthly = billingCycle === "monthly";
                const isPremier = plan.id === "premier";
                const isStandard = plan.id === "standard";

                const price = isAnnual
                  ? plan.annualPrice
                  : isMonthly
                    ? plan.monthlyPrice
                    : plan.termlyPrice;

                const originalAnnual =
                  plan.termlyPrice > 0 ? plan.termlyPrice * 3 : 0;

                const formattedPrice =
                  price === 0
                    ? "Free"
                    : new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                        maximumFractionDigits: 0,
                      }).format(price);

                const formattedOriginal =
                  originalAnnual > 0
                    ? new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                        maximumFractionDigits: 0,
                      }).format(originalAnnual)
                    : null;

                const cycleSuffix = isAnnual
                  ? "year"
                  : isMonthly
                    ? "mo"
                    : "term";

                return (
                  <Box
                    key={plan.id}
                    bg="#1E293B"
                    borderRadius="24px"
                    border={
                      isStandard
                        ? "2px solid #3B82F6"
                        : isPremier
                          ? "2px solid #8B5CF6"
                          : "1px solid #334155"
                    }
                    p={{ base: 6, sm: 7 }}
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    position="relative"
                    boxShadow={
                      isStandard
                        ? "0 20px 45px rgba(37, 99, 235, 0.22)"
                        : isPremier
                          ? "0 20px 45px rgba(139, 92, 246, 0.22)"
                          : "0 10px 30px rgba(0,0,0,0.3)"
                    }
                  >
                    {/* Top Floating Badge */}
                    {isStandard && (
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
                        px={3.5}
                        py={0.5}
                        boxShadow="0 4px 10px rgba(37, 99, 235, 0.4)"
                      >
                        MOST POPULAR • UNLIMITED STUDENTS
                      </Badge>
                    )}

                    {isPremier && (
                      <Badge
                        position="absolute"
                        top="-12px"
                        left="50%"
                        transform="translateX(-50%)"
                        bg="linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)"
                        color="white"
                        fontSize="11px"
                        fontWeight="bold"
                        borderRadius="full"
                        px={3.5}
                        py={0.5}
                        boxShadow="0 4px 10px rgba(139, 92, 246, 0.4)"
                      >
                        ALL-IN-ONE INSTITUTIONAL ERP
                      </Badge>
                    )}

                    <Box>
                      <HStack justify="space-between" align="center" mb={1}>
                        <Text fontSize="22px" fontWeight="800" color="white">
                          {plan.name}
                        </Text>
                        {isPremier && (
                          <Icon as={FaCrown} color="#FBBF24" boxSize={5} />
                        )}
                        {isStandard && (
                          <Icon
                            as={FaGraduationCap}
                            color="#60A5FA"
                            boxSize={5}
                          />
                        )}
                      </HStack>

                      <Text
                        fontSize="12.5px"
                        color="#94A3B8"
                        mt={1}
                        minH="38px"
                        lineHeight="1.4"
                      >
                        {plan.tagline}
                      </Text>

                      {/* Capacity & AI Cap Pills */}
                      <VStack align="stretch" spacing={2} my={4}>
                        <HStack
                          bg="rgba(16, 185, 129, 0.12)"
                          border="1px solid rgba(16, 185, 129, 0.25)"
                          p={2}
                          borderRadius="lg"
                          spacing={2}
                        >
                          <Icon as={FaUsers} color="#34D399" boxSize={3.5} />
                          <Text
                            fontSize="12px"
                            fontWeight="700"
                            color="#34D399"
                          >
                            Capacity: {plan.studentLimit}
                          </Text>
                        </HStack>

                        <HStack
                          bg="rgba(56, 189, 248, 0.1)"
                          border="1px solid rgba(56, 189, 248, 0.25)"
                          p={2}
                          borderRadius="lg"
                          spacing={2}
                        >
                          <Icon as={FaRobot} color="#38BDF8" boxSize={3.5} />
                          <Text
                            fontSize="12px"
                            fontWeight="700"
                            color="#38BDF8"
                          >
                            AI Limit: {plan.aiLimit}
                          </Text>
                        </HStack>
                      </VStack>

                      {/* Strikethrough if Annual */}
                      {isAnnual && formattedOriginal && price > 0 && (
                        <HStack spacing={2} mb={1}>
                          <Text
                            fontSize="13px"
                            color="#64748B"
                            textDecoration="line-through"
                          >
                            {formattedOriginal}/year
                          </Text>
                          <Badge
                            bg="rgba(16, 185, 129, 0.2)"
                            color="#34D399"
                            fontSize="10px"
                            borderRadius="full"
                            px={1.5}
                          >
                            {isPremier ? "SAVE ₦20,000" : "SAVE ₦10,000"}
                          </Badge>
                        </HStack>
                      )}

                      {/* Price Display */}
                      <HStack align="baseline" spacing={1.5} mb={5}>
                        <Text
                          fontSize="32px"
                          fontWeight="900"
                          color="white"
                          lineHeight="1"
                        >
                          {formattedPrice}
                        </Text>
                        {price > 0 && (
                          <Text
                            fontSize="13px"
                            color="#94A3B8"
                            fontWeight="600"
                          >
                            /{cycleSuffix}
                          </Text>
                        )}
                      </HStack>

                      {/* Features List */}
                      <Box borderTop="1px solid #334155" pt={4} mb={6}>
                        <Text
                          fontSize="11px"
                          fontWeight="bold"
                          color="#94A3B8"
                          mb={3}
                          textTransform="uppercase"
                          letterSpacing="0.5px"
                        >
                          INCLUDED IN THIS PLAN:
                        </Text>
                        <VStack spacing={2.5} align="stretch">
                          {plan.features.map((feat, idx) => (
                            <HStack key={idx} spacing={2.5} align="flex-start">
                              <Icon
                                as={FaCheck}
                                color="#34D399"
                                boxSize={3.5}
                                mt={0.5}
                              />
                              <Text
                                fontSize="13px"
                                color="#CBD5E1"
                                lineHeight="1.3"
                              >
                                {feat}
                              </Text>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    </Box>

                    {/* CTA Button */}
                    <Button
                      w="100%"
                      h="48px"
                      borderRadius="14px"
                      fontWeight="bold"
                      fontSize="14px"
                      bg={
                        isPremier
                          ? "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)"
                          : isStandard
                            ? "#2563EB"
                            : "#334155"
                      }
                      color="white"
                      _hover={{
                        opacity: 0.9,
                        transform: "translateY(-1px)",
                      }}
                      onClick={() => handleOpenCheckout(plan)}
                    >
                      {plan.id === "demo"
                        ? "Start Free Demo"
                        : isAnnual
                          ? `${plan.ctaText} (${isPremier ? "Save ₦20k" : "Save ₦10k"})`
                          : plan.ctaText}
                    </Button>
                  </Box>
                );
              })}
            </SimpleGrid>

            {/* ========================================================
                PROPRIETOR SURPLUS & PROFIT ESTIMATOR (FLAT-RATE MODEL)
               ======================================================== */}
          
          </>
        ) : (
       
          <SimpleGrid
            columns={{ base: 1, md: 3 }}
            gap={6}
            maxW="1080px"
            mx="auto"
          >
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
                  border={
                    pass.popular ? "2px solid #3B82F6" : "1px solid #334155"
                  }
                  p={{ base: 6, sm: 7 }}
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  position="relative"
                  boxShadow={
                    pass.popular
                      ? "0 20px 40px rgba(37, 99, 235, 0.25)"
                      : "0 10px 30px rgba(0,0,0,0.3)"
                  }
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
                    <Text fontSize="20px" fontWeight="800" color="white">
                      {pass.name}
                    </Text>
                    <Text fontSize="12px" color="#94A3B8" mt={1} minH="36px">
                      {pass.tagline}
                    </Text>

                    <HStack align="baseline" spacing={1} my={5}>
                      <Text
                        fontSize="32px"
                        fontWeight="900"
                        color="white"
                        lineHeight="1"
                      >
                        {formattedPrice}
                      </Text>
                      <Text fontSize="12px" color="#94A3B8">
                        /{pass.duration}
                      </Text>
                    </HStack>

                    <Box borderTop="1px solid #334155" pt={4} mb={6}>
                      <Text
                        fontSize="11px"
                        fontWeight="bold"
                        color="#94A3B8"
                        mb={3}
                        textTransform="uppercase"
                        letterSpacing="0.5px"
                      >
                        PASS INCLUDES:
                      </Text>
                      <VStack spacing={2.5} align="stretch">
                        {pass.features.map((feat, idx) => (
                          <HStack key={idx} spacing={2.5} align="flex-start">
                            <Icon
                              as={FaCheck}
                              color="#34D399"
                              boxSize={3.5}
                              mt={0.5}
                            />
                            <Text
                              fontSize="13px"
                              color="#CBD5E1"
                              lineHeight="1.3"
                            >
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

        {/* FAQs Section */}
        <Box mt={16} maxW="860px" mx="auto">
          <Text
            fontSize="24px"
            fontWeight="800"
            color="white"
            textAlign="center"
            mb={2}
          >
            Frequently Asked Billing Questions
          </Text>
          <Text fontSize="13px" color="#94A3B8" textAlign="center" mb={8}>
            Everything you need to know about our flat-rate pricing, unlimited
            student capacity, and AI caps
          </Text>

          <VStack spacing={4} align="stretch">
            {FAQS.map((faq, idx) => (
              <Box
                key={idx}
                bg="#1E293B"
                border="1px solid #334155"
                borderRadius="18px"
                p={5}
              >
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
          studentCount={null}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </Box>
  );
}
