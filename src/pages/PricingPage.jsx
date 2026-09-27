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
  getTierForStudentCount,
  calculateSchoolCost,
  calculateAnnualSavings,
  calculateParentCollection,
  calculateSchoolProfit,
  ANNUAL_DISCOUNT_PERCENT,
} from "../constants/pricingData";
import PaymentModal from "../components/payment/PaymentModal";
import Navbar from "../components/ui/landing/navbar";
import Footer from "../components/ui/landing/Footer";
import {
  FaCheck,
  FaGraduationCap,
  FaBolt,
  FaArrowRight,
  FaCalculator,
  FaCoins,
} from "react-icons/fa";

export default function PricingPage() {
  const [audience, setAudience] = useState("educators"); // "educators" | "candidates"
  const [billingCycle, setBillingCycle] = useState("termly"); // "monthly" | "termly" | "annual"
  const [studentCount, setStudentCount] = useState(150);
  const [parentLevy, setParentLevy] = useState(1200);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [checkoutStudentCount, setCheckoutStudentCount] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const navigate = useNavigate();

  // Dynamic calculations for calculator
  const activeTier = useMemo(() => getTierForStudentCount(studentCount), [studentCount]);
  const schoolCost = useMemo(() => calculateSchoolCost(studentCount, billingCycle), [studentCount, billingCycle]);
  const parentTotal = useMemo(() => calculateParentCollection(studentCount, parentLevy, billingCycle), [studentCount, parentLevy, billingCycle]);
  const netProfit = useMemo(() => calculateSchoolProfit(studentCount, parentLevy, billingCycle), [studentCount, parentLevy, billingCycle]);
  const annualSavings = useMemo(() => calculateAnnualSavings(studentCount), [studentCount]);

  const handleOpenCheckout = (plan, dynamicCount = null) => {
    setSelectedPlanForCheckout(plan);
    setCheckoutStudentCount(dynamicCount);
    setIsCheckoutOpen(true);
  };

  const handleCalculatorCheckout = () => {
    // Pick appropriate tier based on student count
    let plan = EDUCATOR_PLANS[1]; // default pro / standard
    if (studentCount <= 30) plan = EDUCATOR_PLANS[0];
    else if (studentCount <= 250) plan = EDUCATOR_PLANS[1];
    else if (studentCount <= 700) plan = EDUCATOR_PLANS[2];
    else plan = EDUCATOR_PLANS[3];

    handleOpenCheckout(plan, studentCount);
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
      <Box pt={{ base: "90px", md: "110px" }} pb={8} px={4} textAlign="center" maxW="900px" mx="auto">
        <HStack justify="center" spacing={2} mb={3}>
          <Badge
            bg="rgba(37, 99, 235, 0.2)"
            color="#60A5FA"
            border="1px solid rgba(37, 99, 235, 0.3)"
            borderRadius="full"
            px={3}
            py={1}
            fontSize="11px"
            fontWeight="bold"
          >
            PER-STUDENT FAIR PRICING
          </Badge>
          <Badge
            bg="rgba(16, 185, 129, 0.2)"
            color="#34D399"
            border="1px solid rgba(16, 185, 129, 0.3)"
            borderRadius="full"
            px={3}
            py={1}
            fontSize="11px"
            fontWeight="bold"
          >
            ANNUAL PLAN: SAVE 20%
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
          Pay Only for What You Use.{" "}
          <span style={{ color: "#38BDF8" }}>Zero Waste for Schools.</span>
        </Text>

        <Text fontSize={{ base: "13px", md: "15px" }} color="#94A3B8" maxW="680px" mx="auto" mb={8}>
          Instead of expensive flat fees, AceSmart charges transparently per student (₦400 – ₦500/child/term).
          Pay annually to receive an automatic <b>20% discount</b> across your school session!
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
            >
              Students & Candidates
            </Button>
          </HStack>
        </Flex>

        {/* Billing Switcher (Only for Educators) */}
        {audience === "educators" && (
          <Flex justify="center" align="center" gap={3}>
            <HStack bg="#1E293B" p={1} borderRadius="xl" border="1px solid #334155" flexWrap="wrap" justify="center">
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
                  <Badge bg="#10B981" color="white" fontSize="9px" borderRadius="full" px={1.5}>
                    RECOMMENDED
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
                  <Badge bg="#F59E0B" color="white" fontSize="9px" borderRadius="full" px={1.5}>
                    SAVE 20% 🔥
                  </Badge>
                </HStack>
              </Button>
            </HStack>
          </Flex>
        )}
      </Box>

      {/* MAIN CONTENT AREA */}
      <Box maxW="1320px" mx="auto" px={{ base: 4, md: 8 }} pb={20}>
        {audience === "educators" ? (
          <>
            {/* ========================================================
                INTERACTIVE SCHOOL PROFIT & ROI CALCULATOR
               ======================================================== */}
            <Box
              bg="linear-gradient(145deg, #131D33 0%, #0F172A 100%)"
              borderRadius="28px"
              border="1.5px solid #2563EB"
              p={{ base: 5, sm: 6, md: 8 }}
              mb={12}
              boxShadow="0 20px 50px rgba(37, 99, 235, 0.15)"
            >
              <Flex
                justify="space-between"
                align={{ base: "flex-start", md: "center" }}
                direction={{ base: "column", md: "row" }}
                gap={3}
                mb={6}
              >
                <Box>
                  <HStack spacing={2} mb={1}>
                    <Icon as={FaCalculator} color="#38BDF8" boxSize={4} />
                    <Text fontSize="12px" fontWeight="800" color="#38BDF8" letterSpacing="0.5px" textTransform="uppercase">
                      Proprietor Revenue & ROI Calculator
                    </Text>
                  </HStack>
                  <Text fontSize={{ base: "20px", md: "24px" }} fontWeight="900" color="white">
                    See How Much Profit Your School Makes With AceSmart
                  </Text>
                  <Text fontSize="13px" color="#94A3B8" mt={0.5}>
                    Drag the slider to your student count. Charge parents a standard ICT levy to run AceSmart for free!
                  </Text>
                </Box>

                <HStack spacing={2}>
                  {billingCycle === "annual" && (
                    <Badge bg="rgba(245, 158, 11, 0.2)" color="#FBBF24" border="1px solid rgba(245, 158, 11, 0.3)" borderRadius="full" px={3} py={1} fontSize="12px" fontWeight="bold">
                      20% Prepay Discount Active
                    </Badge>
                  )}
                  <Badge bg="rgba(16, 185, 129, 0.15)" color="#34D399" border="1px solid rgba(16, 185, 129, 0.3)" borderRadius="full" px={3} py={1} fontSize="12px" fontWeight="bold">
                    Zero Cost to School
                  </Badge>
                </HStack>
              </Flex>

              {/* Slider & Controls */}
              <Box bg="#1A2642" p={{ base: 4, md: 6 }} borderRadius="2xl" border="1px solid #2D3E66" mb={6}>
                <Flex
                  justify="space-between"
                  align={{ base: "flex-start", sm: "center" }}
                  direction={{ base: "column", sm: "row" }}
                  gap={3}
                  mb={4}
                >
                  <Box>
                    <Text fontSize="13px" fontWeight="700" color="#E2E8F0">
                      Total Student Enrollment:
                    </Text>
                    <Text fontSize="26px" fontWeight="900" color="#38BDF8">
                      {studentCount} Students
                    </Text>
                  </Box>

                  {/* Preset Quick Buttons */}
                  <Flex gap={2} flexWrap="wrap">
                    {[50, 150, 300, 500, 1000].map((preset) => (
                      <Button
                        key={preset}
                        size="xs"
                        borderRadius="lg"
                        px={3}
                        h="28px"
                        fontWeight="700"
                        bg={studentCount === preset ? "#2563EB" : "#0F172A"}
                        color={studentCount === preset ? "white" : "#94A3B8"}
                        border="1px solid #334155"
                        _hover={{ bg: "#2563EB", color: "white" }}
                        onClick={() => setStudentCount(preset)}
                      >
                        {preset} Kids
                      </Button>
                    ))}
                  </Flex>
                </Flex>

                {/* Range Slider */}
                <input
                  type="range"
                  min="20"
                  max="1200"
                  step="10"
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  style={{
                    width: "100%",
                    height: "8px",
                    borderRadius: "4px",
                    background: "#0F172A",
                    accentColor: "#38BDF8",
                    cursor: "pointer",
                  }}
                />

                <Flex justify="space-between" mt={2} fontSize="11px" color="#64748B">
                  <Text>20 Students (Micro)</Text>
                  <Text>500 Students (Premier)</Text>
                  <Text>1,200+ Students (Mega)</Text>
                </Flex>
              </Box>

              {/* Dynamic 4-Metric Breakdown Grid */}
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} mb={6}>
                {/* Metric 1: Rate */}
                <Box bg="#0F172A" p={4} borderRadius="xl" border="1px solid #1E293B">
                  <Text fontSize="11px" fontWeight="700" color="#94A3B8" textTransform="uppercase">
                    {billingCycle === "annual" ? "Annual Tier Rate" : "Your Tier Rate"}
                  </Text>
                  <HStack align="baseline" spacing={1.5} mt={1}>
                    <Text fontSize="22px" fontWeight="900" color="white">
                      ₦{billingCycle === "annual" ? activeTier.annualRate.toLocaleString() : activeTier.rate}
                    </Text>
                    {billingCycle === "annual" && (
                      <Badge bg="rgba(16, 185, 129, 0.2)" color="#34D399" fontSize="10px">
                        20% OFF
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="11px" color="#64748B" mt={0.5}>
                    {billingCycle === "annual"
                      ? `Per child / full year (${activeTier.label})`
                      : `Per child / term (${activeTier.label})`}
                  </Text>
                </Box>

                {/* Metric 2: School Cost */}
                <Box bg="#0F172A" p={4} borderRadius="xl" border="1px solid #1E293B">
                  <Text fontSize="11px" fontWeight="700" color="#F87171" textTransform="uppercase">
                    {billingCycle === "annual"
                      ? "AceSmart Annual Bill"
                      : billingCycle === "monthly"
                      ? "AceSmart Monthly Bill"
                      : "AceSmart Termly Bill"}
                  </Text>
                  <Text fontSize="22px" fontWeight="900" color="#F87171" mt={1}>
                    ₦{schoolCost.toLocaleString()}
                  </Text>
                  <Text fontSize="11px" color="#64748B" mt={0.5}>
                    {billingCycle === "annual"
                      ? `Full session • Saves ₦${annualSavings.toLocaleString()}!`
                      : "Covers CBT, 2x Attendance, SMS"}
                  </Text>
                </Box>

                {/* Metric 3: Parent Collection */}
                <Box bg="#0F172A" p={4} borderRadius="xl" border="1px solid #1E293B">
                  <Text fontSize="11px" fontWeight="700" color="#60A5FA" textTransform="uppercase">
                    {billingCycle === "annual" ? "Annual Parent Levy" : "Collected From Parents"}
                  </Text>
                  <Text fontSize="22px" fontWeight="900" color="#60A5FA" mt={1}>
                    ₦{parentTotal.toLocaleString()}
                  </Text>
                  <Text fontSize="11px" color="#64748B" mt={0.5}>
                    {billingCycle === "annual"
                      ? `3 terms @ ₦${parentLevy.toLocaleString()} ICT levy / child`
                      : `Based on ₦${parentLevy.toLocaleString()} ICT levy / child`}
                  </Text>
                </Box>

                {/* Metric 4: Net Profit */}
                <Box bg="rgba(16, 185, 129, 0.12)" p={4} borderRadius="xl" border="1.5px solid #10B981">
                  <Text fontSize="11px" fontWeight="800" color="#34D399" textTransform="uppercase">
                    {billingCycle === "annual" ? "Annual Net Surplus" : "School Net Profit"}
                  </Text>
                  <Text fontSize="22px" fontWeight="900" color="#34D399" mt={1}>
                    +₦{netProfit.toLocaleString()}
                  </Text>
                  <Text fontSize="11px" color="#A7F3D0" mt={0.5}>
                    {billingCycle === "annual"
                      ? "Pure surplus for the entire school session!"
                      : "Pure surplus for your school!"}
                  </Text>
                </Box>
              </SimpleGrid>

              {/* Explanatory Banner & Instant Subscribe Button */}
              <Flex
                direction={{ base: "column", sm: "row" }}
                justify="space-between"
                align={{ base: "stretch", sm: "center" }}
                gap={4}
                bg="#0B132B"
                p={4}
                borderRadius="xl"
                border="1px solid #1E293B"
              >
                <HStack spacing={2.5}>
                  <Icon as={FaCoins} color="#FBBF24" boxSize={5} />
                  <Text fontSize="13px" color="#CBD5E1">
                    {billingCycle === "annual" ? (
                      <>
                        With <b>{studentCount} students</b> paying annually, your school saves{" "}
                        <b style={{ color: "#34D399" }}>₦{annualSavings.toLocaleString()} (20% OFF)</b> and nets an extra{" "}
                        <b style={{ color: "#34D399" }}>₦{netProfit.toLocaleString()} profit</b> over the academic session!
                      </>
                    ) : (
                      <>
                        With <b>{studentCount} students</b>, your school makes an extra{" "}
                        <b style={{ color: "#34D399" }}>₦{netProfit.toLocaleString()} profit</b> every term while running modern CBT exams and 2x attendance for ₦0 cost!
                      </>
                    )}
                  </Text>
                </HStack>

                <Button
                  h="42px"
                  px={6}
                  bg="linear-gradient(135deg, #10B981 0%, #059669 100%)"
                  color="white"
                  fontWeight="800"
                  fontSize="13px"
                  borderRadius="xl"
                  boxShadow="0 4px 14px rgba(16, 185, 129, 0.35)"
                  _hover={{ opacity: 0.95 }}
                  onClick={handleCalculatorCheckout}
                >
                  {billingCycle === "annual"
                    ? `Subscribe Annually (${studentCount} Students) • 20% OFF`
                    : `Subscribe for ${studentCount} Students`}
                </Button>
              </Flex>
            </Box>

            {/* ========================================================
                EDUCATOR PLAN CARDS
               ======================================================== */}
            <Box mb={6} textAlign="center">
              <Text fontSize="22px" fontWeight="800" color="white">
                Choose a Plan by School Capacity
              </Text>
              <Text fontSize="13px" color="#94A3B8" mt={1}>
                {billingCycle === "annual"
                  ? "Annual plans include an automatic 20% discount across all school tiers"
                  : "Upgrade or scale as your student body grows with automated pro-rated billing"}
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={6} alignItems="stretch">
              {EDUCATOR_PLANS.map((plan) => {
                const isAnnual = billingCycle === "annual";
                const price = isAnnual
                  ? plan.annualPrice
                  : billingCycle === "termly"
                  ? plan.termlyPrice
                  : plan.monthlyPrice;

                const originalAnnual = plan.termlyPrice > 0 ? plan.termlyPrice * 3 : 0;

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

                const rateLabel = isAnnual ? plan.annualRatePerChild : plan.ratePerChild;
                const cycleSuffix = isAnnual ? "year" : billingCycle === "termly" ? "term" : "mo";

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

                      {/* Per-Child Rate Pill */}
                      <Box my={3}>
                        <Badge
                          bg="rgba(56, 189, 248, 0.15)"
                          color="#38BDF8"
                          border="1px solid rgba(56, 189, 248, 0.3)"
                          borderRadius="md"
                          px={2}
                          py={0.5}
                          fontSize="11px"
                          fontWeight="700"
                        >
                          {rateLabel}
                        </Badge>
                      </Box>

                      {/* Strikethrough if Annual */}
                      {isAnnual && formattedOriginal && price > 0 && (
                        <HStack spacing={2} mb={1}>
                          <Text fontSize="13px" color="#64748B" textDecoration="line-through">
                            {formattedOriginal}/year
                          </Text>
                          <Badge bg="rgba(16, 185, 129, 0.2)" color="#34D399" fontSize="10px" borderRadius="full" px={1.5}>
                            SAVE 20%
                          </Badge>
                        </HStack>
                      )}

                      <HStack align="baseline" spacing={1} mb={5}>
                        <Text fontSize="28px" fontWeight="900" color="white" lineHeight="1">
                          {formattedPrice}
                        </Text>
                        {price > 0 && (
                          <Text fontSize="12px" color="#94A3B8">
                            /{cycleSuffix}
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
                      {plan.id === "starter"
                        ? "Get Started Free"
                        : isAnnual
                        ? `${plan.ctaText} (Save 20%)`
                        : plan.ctaText}
                    </Button>
                  </Box>
                );
              })}
            </SimpleGrid>
          </>
        ) : (
          /* ========================================================
              CANDIDATE EXAM PASSES
             ======================================================== */
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
                    <Text fontSize="20px" fontWeight="800" color="white">
                      {pass.name}
                    </Text>
                    <Text fontSize="12px" color="#94A3B8" mt={1} minH="36px">
                      {pass.tagline}
                    </Text>

                    <HStack align="baseline" spacing={1} my={5}>
                      <Text fontSize="32px" fontWeight="900" color="white" lineHeight="1">
                        {formattedPrice}
                      </Text>
                      <Text fontSize="12px" color="#94A3B8">
                        /{pass.duration}
                      </Text>
                    </HStack>

                    <Box borderTop="1px solid #334155" pt={4} mb={6}>
                      <Text fontSize="11px" fontWeight="bold" color="#94A3B8" mb={3} textTransform="uppercase" letterSpacing="0.5px">
                        PASS INCLUDES:
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

        {/* FAQs Section */}
        <Box mt={20} maxW="860px" mx="auto">
          <Text fontSize="24px" fontWeight="800" color="white" textAlign="center" mb={2}>
            Frequently Asked Billing Questions
          </Text>
          <Text fontSize="13px" color="#94A3B8" textAlign="center" mb={8}>
            Everything you need to know about our school per-student pricing and parent pass-through fees
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
          studentCount={checkoutStudentCount}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </Box>
  );
}
