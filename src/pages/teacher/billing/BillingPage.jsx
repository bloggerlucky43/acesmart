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
  Table,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../../../constants/dashboardlayout";
import MobileLayout from "../../../mobile/constant/mobilelayout";
import {
  EDUCATOR_PLANS,
  INITIAL_INVOICES,
  getTierForStudentCount,
  calculateSchoolCost,
  calculateAnnualSavings,
  calculateParentCollection,
  calculateSchoolProfit,
} from "../../../constants/pricingData";
import PaymentModal from "../../../components/payment/PaymentModal";
import { toaster } from "../../../components/ui/toaster";
import {
  FaCreditCard,
  FaCheckCircle,
  FaArrowUp,
  FaDownload,
  FaGraduationCap,
  FaShieldAlt,
  FaCheck,
  FaBolt,
  FaCalculator,
  FaCoins,
} from "react-icons/fa";

export default function BillingPage() {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const [billingCycle, setBillingCycle] = useState("termly"); // "monthly" | "termly" | "annual"
  const [activePlanId, setActivePlanId] = useState("pro");
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [checkoutStudentCount, setCheckoutStudentCount] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // School Profit & ROI Calculator state
  const [calcStudentCount, setCalcStudentCount] = useState(150);
  const [calcParentLevy, setCalcParentLevy] = useState(1200);

  const activeCalcTier = useMemo(() => getTierForStudentCount(calcStudentCount), [calcStudentCount]);
  const calcSchoolCost = useMemo(() => calculateSchoolCost(calcStudentCount, billingCycle), [calcStudentCount, billingCycle]);
  const calcParentTotal = useMemo(() => calculateParentCollection(calcStudentCount, calcParentLevy, billingCycle), [calcStudentCount, calcParentLevy, billingCycle]);
  const calcNetProfit = useMemo(() => calculateSchoolProfit(calcStudentCount, calcParentLevy, billingCycle), [calcStudentCount, calcParentLevy, billingCycle]);
  const calcAnnualSavings = useMemo(() => calculateAnnualSavings(calcStudentCount), [calcStudentCount]);

  // Load saved subscription from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("activeSubscription");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.planId) setActivePlanId(parsed.planId);
        if (parsed.cycle) setBillingCycle(parsed.cycle);
      } catch (e) {}
    }
  }, []);

  const currentPlan =
    EDUCATOR_PLANS.find((p) => p.id === activePlanId) || EDUCATOR_PLANS[1];

  const handleOpenCheckout = (plan, dynamicCount = null) => {
    setSelectedPlanForCheckout(plan);
    setCheckoutStudentCount(dynamicCount);
    setIsCheckoutOpen(true);
  };

  const handleCalculatorCheckout = () => {
    let plan = EDUCATOR_PLANS[1];
    if (calcStudentCount <= 30) plan = EDUCATOR_PLANS[0];
    else if (calcStudentCount <= 250) plan = EDUCATOR_PLANS[1];
    else if (calcStudentCount <= 700) plan = EDUCATOR_PLANS[2];
    else plan = EDUCATOR_PLANS[3];

    handleOpenCheckout(plan, calcStudentCount);
  };

  const handlePaymentSuccess = ({ plan, billingCycle: cycle, amount, reference, date }) => {
    setActivePlanId(plan.id);
    localStorage.setItem(
      "activeSubscription",
      JSON.stringify({ planId: plan.id, cycle, updated: date })
    );

    // If upgrading to Institution or Enterprise, grant institution admin privileges
    if (plan.id === "institution" || plan.id === "enterprise") {
      const userRaw = localStorage.getItem("USER_KEY");
      if (userRaw) {
        try {
          const u = JSON.parse(userRaw);
          u.role = "institution_admin";
          localStorage.setItem("USER_KEY", JSON.stringify(u));
        } catch (e) {}
      }
    }

    const newInvoice = {
      id: reference,
      date,
      plan: `${plan.name} (${cycle.charAt(0).toUpperCase() + cycle.slice(1)})`,
      amount,
      method: "Paystack Direct",
      status: "Paid",
    };

    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const handleDownloadReceipt = (inv) => {
    toaster.create({
      title: `Invoice ${inv.id} Downloaded`,
      description: `Official receipt for ${inv.amount} has been saved to your downloads.`,
      type: "success",
    });
  };

  const content = (
    <Box
      mt={{ base: 0, lg: "84px" }}
      ml={{ base: 0, lg: "240px" }}
      w={{ base: "100%", lg: "calc(100% - 240px)" }}
      p={{ base: 3, md: 6, lg: 8 }}
      minH="calc(100vh - 84px)"
      bg="#F8FAFC"
    >
      <Box maxW="1280px" mx="auto">
        {/* Page Header */}
        <Flex
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={4}
          mb={6}
        >
          <Box>
            <HStack spacing={2} mb={1}>
              <Badge
                bg="rgba(37, 99, 235, 0.1)"
                color="#2563EB"
                px={2.5}
                py={0.5}
                borderRadius="full"
                fontSize="11px"
                fontWeight="bold"
              >
                SUBSCRIPTION & LICENSING
              </Badge>
            </HStack>
            <Text
              fontSize={{ base: "22px", md: "26px" }}
              fontWeight="800"
              color="#0F172A"
              fontFamily="'Outfit', sans-serif"
            >
              Billing & Subscription Management
            </Text>
            <Text fontSize="13px" color="#64748B">
              Manage your school's CBT tier, monitor student enrollment quotas, and access payment receipts.
            </Text>
          </Box>

          {/* Billing Cycle Switcher */}
          <HStack
            bg="#E2E8F0"
            p={1}
            borderRadius="xl"
            w={{ base: "100%", sm: "auto" }}
            flexWrap="wrap"
          >
            <Button
              flex={{ base: 1, sm: "initial" }}
              size="sm"
              borderRadius="lg"
              h="36px"
              px={3}
              fontSize="12px"
              fontWeight="bold"
              bg={billingCycle === "monthly" ? "white" : "transparent"}
              color={billingCycle === "monthly" ? "#0F172A" : "#64748B"}
              boxShadow={billingCycle === "monthly" ? "0 2px 6px rgba(0,0,0,0.1)" : "none"}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </Button>
            <Button
              flex={{ base: 1, sm: "initial" }}
              size="sm"
              borderRadius="lg"
              h="36px"
              px={3}
              fontSize="12px"
              fontWeight="bold"
              bg={billingCycle === "termly" ? "white" : "transparent"}
              color={billingCycle === "termly" ? "#0F172A" : "#64748B"}
              boxShadow={billingCycle === "termly" ? "0 2px 6px rgba(0,0,0,0.1)" : "none"}
              onClick={() => setBillingCycle("termly")}
            >
              <HStack spacing={1.5} justify="center">
                <Text>Termly (3 Mo)</Text>
                <Badge bg="#10B981" color="white" fontSize="9px" borderRadius="full" px={1.5}>
                  STANDARD
                </Badge>
              </HStack>
            </Button>
            <Button
              flex={{ base: 1, sm: "initial" }}
              size="sm"
              borderRadius="lg"
              h="36px"
              px={3}
              fontSize="12px"
              fontWeight="bold"
              bg={billingCycle === "annual" ? "white" : "transparent"}
              color={billingCycle === "annual" ? "#0F172A" : "#64748B"}
              boxShadow={billingCycle === "annual" ? "0 2px 6px rgba(0,0,0,0.1)" : "none"}
              onClick={() => setBillingCycle("annual")}
            >
              <HStack spacing={1.5} justify="center">
                <Text>Annual (Full Session)</Text>
                <Badge bg="#F59E0B" color="white" fontSize="9px" borderRadius="full" px={1.5}>
                  SAVE 20% 🔥
                </Badge>
              </HStack>
            </Button>
          </HStack>
        </Flex>

        {/* ACTIVE PLAN HERO CARD */}
        <Box
          bg="#0F172A"
          borderRadius="20px"
          p={{ base: 5, md: 6 }}
          color="white"
          mb={6}
          border="1px solid #1E293B"
          boxShadow="0 10px 25px -5px rgba(15, 23, 42, 0.3)"
        >
          <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4} mb={6}>
            <HStack spacing={3}>
              <Flex w="48px" h="48px" borderRadius="14px" bg="#2563EB" align="center" justify="center" color="white">
                <Icon as={FaBolt} boxSize={5} />
              </Flex>
              <Box>
                <HStack spacing={2}>
                  <Text fontSize="20px" fontWeight="800" fontFamily="'Outfit', sans-serif">
                    {currentPlan.name}
                  </Text>
                  <Badge bg="rgba(16, 185, 129, 0.2)" color="#34D399" border="1px solid rgba(16, 185, 129, 0.3)" borderRadius="full" px={2} fontSize="10px">
                    ACTIVE SUBSCRIPTION
                  </Badge>
                </HStack>
                <Text fontSize="12px" color="#94A3B8" mt={0.5}>
                  Billed {billingCycle === "annual" ? "Annually (Full Session • 20% Prepay Discount)" : billingCycle === "termly" ? "Termly (Per School Term)" : "Monthly"} • Next renewal on <b>November 15, 2026</b>
                </Text>
              </Box>
            </HStack>

            <HStack spacing={2}>
              <Button
                size="sm"
                bg="#2563EB"
                color="white"
                borderRadius="10px"
                fontWeight="bold"
                fontSize="13px"
                h="40px"
                px={4}
                _hover={{ bg: "#1D4ED8" }}
                onClick={() => handleOpenCheckout(EDUCATOR_PLANS[2])}
                leftIcon={<Icon as={FaArrowUp} />}
              >
                Upgrade Plan
              </Button>
            </HStack>
          </Flex>

          {/* Quota Usage Cards */}
          <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4}>
            <Box bg="#1E293B" p={4} borderRadius="14px" border="1px solid #334155">
              <Text fontSize="11px" color="#94A3B8" textTransform="uppercase" letterSpacing="0.5px">
                Candidate Enrollment
              </Text>
              <HStack justify="space-between" align="baseline" mt={1}>
                <Text fontSize="22px" fontWeight="800" color="white">
                  128
                </Text>
                <Text fontSize="12px" color="#94A3B8">
                  of {currentPlan.studentLimit} Max
                </Text>
              </HStack>
              {/* Progress bar */}
              <Box w="100%" h="6px" bg="#0F172A" borderRadius="full" mt={2} overflow="hidden">
                <Box
                  w={typeof currentPlan.studentLimit === "number" ? `${(128 / currentPlan.studentLimit) * 100}%` : "15%"}
                  h="100%"
                  bg="#2563EB"
                  borderRadius="full"
                />
              </Box>
            </Box>

            <Box bg="#1E293B" p={4} borderRadius="14px" border="1px solid #334155">
              <Text fontSize="11px" color="#94A3B8" textTransform="uppercase" letterSpacing="0.5px">
                Published Examinations
              </Text>
              <HStack justify="space-between" align="baseline" mt={1}>
                <Text fontSize="22px" fontWeight="800" color="white">
                  14
                </Text>
                <Text fontSize="12px" color="#34D399" fontWeight="bold">
                  Unlimited Quota
                </Text>
              </HStack>
              <Text fontSize="11px" color="#64748B" mt={2}>
                All ongoing tests are live and protected
              </Text>
            </Box>

            <Box bg="#1E293B" p={4} borderRadius="14px" border="1px solid #334155">
              <Text fontSize="11px" color="#94A3B8" textTransform="uppercase" letterSpacing="0.5px">
                Proctoring & Question Bank
              </Text>
              <HStack spacing={1.5} mt={1}>
                <Icon as={FaCheckCircle} color="#34D399" boxSize={4} />
                <Text fontSize="15px" fontWeight="bold" color="white">
                  Pro Active (50k+ Qs)
                </Text>
              </HStack>
              <Text fontSize="11px" color="#94A3B8" mt={2}>
                Tab-switch proctoring & instant PDF/Excel exports
              </Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* INTERACTIVE SCHOOL PROFIT & ROI CALCULATOR */}
        <Box
          bg="#0F172A"
          borderRadius="20px"
          p={{ base: 5, md: 6 }}
          color="white"
          mb={8}
          border="1px solid #1E293B"
          boxShadow="0 10px 25px -5px rgba(15, 23, 42, 0.3)"
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
                  Proprietor School ROI & Profit Calculator
                </Text>
              </HStack>
              <Text fontSize={{ base: "18px", md: "22px" }} fontWeight="800" color="white" fontFamily="'Outfit', sans-serif">
                Calculate Your School's Net Surplus With AceSmart
              </Text>
              <Text fontSize="12px" color="#94A3B8" mt={0.5}>
                Pass-through ICT portal levy of ₦{calcParentLevy.toLocaleString()}/term lets your school run 100% digital for free.
              </Text>
            </Box>

            <HStack spacing={2}>
              {billingCycle === "annual" && (
                <Badge bg="rgba(245, 158, 11, 0.2)" color="#FBBF24" border="1px solid rgba(245, 158, 11, 0.3)" borderRadius="full" px={3} py={1} fontSize="11px" fontWeight="bold">
                  20% Prepay Discount Active
                </Badge>
              )}
              <Badge bg="rgba(16, 185, 129, 0.15)" color="#34D399" border="1px solid rgba(16, 185, 129, 0.3)" borderRadius="full" px={3} py={1} fontSize="11px" fontWeight="bold">
                Zero Out-of-Pocket
              </Badge>
            </HStack>
          </Flex>

          {/* Slider & Quick Buttons */}
          <Box bg="#1E293B" p={{ base: 4, md: 5 }} borderRadius="16px" border="1px solid #334155" mb={5}>
            <Flex
              justify="space-between"
              align={{ base: "flex-start", sm: "center" }}
              direction={{ base: "column", sm: "row" }}
              gap={3}
              mb={4}
            >
              <Box>
                <Text fontSize="12px" fontWeight="700" color="#94A3B8">
                  Student Enrollment Count:
                </Text>
                <Text fontSize="24px" fontWeight="900" color="#38BDF8">
                  {calcStudentCount} Students
                </Text>
              </Box>

              <Flex gap={2} flexWrap="wrap">
                {[50, 150, 300, 500, 1000].map((preset) => (
                  <Button
                    key={preset}
                    size="xs"
                    borderRadius="lg"
                    px={2.5}
                    h="28px"
                    fontWeight="700"
                    bg={calcStudentCount === preset ? "#2563EB" : "#0F172A"}
                    color={calcStudentCount === preset ? "white" : "#94A3B8"}
                    border="1px solid #334155"
                    _hover={{ bg: "#2563EB", color: "white" }}
                    onClick={() => setCalcStudentCount(preset)}
                  >
                    {preset} Kids
                  </Button>
                ))}
              </Flex>
            </Flex>

            <input
              type="range"
              min="20"
              max="1200"
              step="10"
              value={calcStudentCount}
              onChange={(e) => setCalcStudentCount(Number(e.target.value))}
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

          {/* 4-Metric Grid */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={3} mb={5}>
            <Box bg="#0F172A" p={3.5} borderRadius="12px" border="1px solid #1E293B">
              <Text fontSize="11px" fontWeight="700" color="#94A3B8" textTransform="uppercase">
                {billingCycle === "annual" ? "Annual Tier Rate" : "Your Tier Rate"}
              </Text>
              <HStack align="baseline" spacing={1.5} mt={1}>
                <Text fontSize="20px" fontWeight="900" color="white">
                  ₦{billingCycle === "annual" ? activeCalcTier.annualRate.toLocaleString() : activeCalcTier.rate}
                </Text>
                {billingCycle === "annual" && (
                  <Badge bg="rgba(16, 185, 129, 0.2)" color="#34D399" fontSize="9px">
                    20% OFF
                  </Badge>
                )}
              </HStack>
              <Text fontSize="11px" color="#64748B" mt={0.5}>
                {billingCycle === "annual" ? "Per student / year" : "Per student / term"}
              </Text>
            </Box>

            <Box bg="#0F172A" p={3.5} borderRadius="12px" border="1px solid #1E293B">
              <Text fontSize="11px" fontWeight="700" color="#F87171" textTransform="uppercase">
                {billingCycle === "annual" ? "AceSmart Annual Bill" : billingCycle === "monthly" ? "AceSmart Monthly Bill" : "AceSmart Termly Bill"}
              </Text>
              <Text fontSize="20px" fontWeight="900" color="#F87171" mt={1}>
                ₦{calcSchoolCost.toLocaleString()}
              </Text>
              <Text fontSize="11px" color="#64748B" mt={0.5}>
                {billingCycle === "annual" ? `Saves ₦${calcAnnualSavings.toLocaleString()} (20% OFF)!` : "Covers CBT, 2x Attendance, SMS"}
              </Text>
            </Box>

            <Box bg="#0F172A" p={3.5} borderRadius="12px" border="1px solid #1E293B">
              <Text fontSize="11px" fontWeight="700" color="#60A5FA" textTransform="uppercase">
                {billingCycle === "annual" ? "Annual Parent Levy" : "Termly Parent Levy"}
              </Text>
              <Text fontSize="20px" fontWeight="900" color="#60A5FA" mt={1}>
                ₦{calcParentTotal.toLocaleString()}
              </Text>
              <Text fontSize="11px" color="#64748B" mt={0.5}>
                {billingCycle === "annual" ? "3 terms @ ₦1,200 ICT fee" : "Based on ₦1,200 ICT fee"}
              </Text>
            </Box>

            <Box bg="rgba(16, 185, 129, 0.12)" p={3.5} borderRadius="12px" border="1.5px solid #10B981">
              <Text fontSize="11px" fontWeight="800" color="#34D399" textTransform="uppercase">
                {billingCycle === "annual" ? "Annual Net Surplus" : "Termly Net Profit"}
              </Text>
              <Text fontSize="20px" fontWeight="900" color="#34D399" mt={1}>
                +₦{calcNetProfit.toLocaleString()}
              </Text>
              <Text fontSize="11px" color="#A7F3D0" mt={0.5}>
                Net profit for your school!
              </Text>
            </Box>
          </SimpleGrid>

          {/* Action Row */}
          <Flex
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            align={{ base: "stretch", sm: "center" }}
            gap={3}
            bg="#111B30"
            p={3.5}
            borderRadius="12px"
            border="1px solid #1E293B"
          >
            <HStack spacing={2}>
              <Icon as={FaCoins} color="#FBBF24" boxSize={4} />
              <Text fontSize="12px" color="#CBD5E1">
                {billingCycle === "annual" ? (
                  <>
                    Paying annually saves your school <b style={{ color: "#34D399" }}>₦{calcAnnualSavings.toLocaleString()} (20% OFF)</b> with a net profit of <b style={{ color: "#34D399" }}>+₦{calcNetProfit.toLocaleString()}</b>!
                  </>
                ) : (
                  <>
                    With <b>{calcStudentCount} students</b>, your school nets <b style={{ color: "#34D399" }}>+₦{calcNetProfit.toLocaleString()} profit</b> each term with zero out-of-pocket software cost!
                  </>
                )}
              </Text>
            </HStack>

            <Button
              h="38px"
              px={5}
              bg="linear-gradient(135deg, #10B981 0%, #059669 100%)"
              color="white"
              fontWeight="800"
              fontSize="12px"
              borderRadius="10px"
              boxShadow="0 4px 12px rgba(16, 185, 129, 0.3)"
              _hover={{ opacity: 0.95 }}
              onClick={handleCalculatorCheckout}
            >
              {billingCycle === "annual"
                ? `Subscribe Annually (${calcStudentCount} Students) • 20% OFF`
                : `Subscribe for ${calcStudentCount} Students`}
            </Button>
          </Flex>
        </Box>

        {/* PLAN COMPARISON DECK */}
        <Box mb={8}>
          <Text fontSize="18px" fontWeight="800" color="#0F172A" mb={1} fontFamily="'Outfit', sans-serif">
            Available School & Educator Plans
          </Text>
          <Text fontSize="13px" color="#64748B" mb={5}>
            {billingCycle === "annual"
              ? "All annual plans include an automatic 20% discount across the 3 academic terms"
              : "Upgrade or switch tiers anytime. Prorated credits are automatically calculated."}
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4}>
            {EDUCATOR_PLANS.map((p) => {
              const isCurrent = p.id === activePlanId;
              const isAnnual = billingCycle === "annual";
              const price = isAnnual
                ? p.annualPrice
                : billingCycle === "termly"
                ? p.termlyPrice
                : p.monthlyPrice;

              const originalAnnual = p.termlyPrice > 0 ? p.termlyPrice * 3 : 0;

              const formatted =
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

              const rateLabel = isAnnual ? p.annualRatePerChild : p.ratePerChild;
              const cycleSuffix = isAnnual ? "year" : billingCycle === "termly" ? "term" : "mo";

              return (
                <Box
                  key={p.id}
                  bg="white"
                  borderRadius="18px"
                  border={isCurrent ? "2px solid #2563EB" : p.popular ? "2px solid #6366F1" : "1px solid #E2E8F0"}
                  p={5}
                  boxShadow={isCurrent || p.popular ? "0 10px 25px -5px rgba(37, 99, 235, 0.15)" : "0 2px 8px rgba(0,0,0,0.04)"}
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  position="relative"
                >
                  {p.popular && !isCurrent && (
                    <Badge
                      position="absolute"
                      top="-11px"
                      left="50%"
                      transform="translateX(-50%)"
                      bg="#6366F1"
                      color="white"
                      fontSize="10px"
                      fontWeight="bold"
                      borderRadius="full"
                      px={3}
                      py={0.5}
                    >
                      RECOMMENDED
                    </Badge>
                  )}

                  {isCurrent && (
                    <Badge
                      position="absolute"
                      top="-11px"
                      left="50%"
                      transform="translateX(-50%)"
                      bg="#2563EB"
                      color="white"
                      fontSize="10px"
                      fontWeight="bold"
                      borderRadius="full"
                      px={3}
                      py={0.5}
                    >
                      CURRENT ACTIVE PLAN
                    </Badge>
                  )}

                  <Box>
                    <Text fontSize="17px" fontWeight="800" color="#0F172A">
                      {p.name}
                    </Text>
                    <Text fontSize="12px" color="#64748B" minH="34px" mt={1}>
                      {p.tagline}
                    </Text>

                    {/* Per-Child Rate Pill */}
                    <Box my={2.5}>
                      <Badge
                        bg="rgba(37, 99, 235, 0.1)"
                        color="#2563EB"
                        border="1px solid rgba(37, 99, 235, 0.2)"
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
                      <HStack spacing={1.5} mb={1}>
                        <Text fontSize="13px" color="#94A3B8" textDecoration="line-through">
                          {formattedOriginal}/year
                        </Text>
                        <Badge bg="rgba(16, 185, 129, 0.15)" color="#059669" fontSize="10px" borderRadius="full" px={1.5}>
                          SAVE 20%
                        </Badge>
                      </HStack>
                    )}

                    <HStack align="baseline" spacing={1} my={2.5}>
                      <Text fontSize="26px" fontWeight="900" color="#0F172A">
                        {formatted}
                      </Text>
                      {price > 0 && (
                        <Text fontSize="12px" color="#64748B">
                          /{cycleSuffix}
                        </Text>
                      )}
                    </HStack>

                    <Box borderTop="1px solid #F1F5F9" pt={3} mb={4}>
                      <Text fontSize="11px" fontWeight="bold" color="#94A3B8" mb={2} textTransform="uppercase">
                        Included Features:
                      </Text>
                      <VStack spacing={2} align="stretch">
                        {p.features.slice(0, 6).map((feat, idx) => (
                          <HStack key={idx} spacing={2} align="flex-start">
                            <Icon as={FaCheck} color="#10B981" boxSize={3} mt={1} />
                            <Text fontSize="12px" color="#334155" lineHeight="1.3">
                              {feat}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  </Box>

                  <Button
                    w="100%"
                    h="42px"
                    borderRadius="12px"
                    fontWeight="bold"
                    fontSize="13px"
                    bg={isCurrent ? "#F1F5F9" : p.popular ? "#2563EB" : "#0F172A"}
                    color={isCurrent ? "#64748B" : "white"}
                    _hover={isCurrent ? {} : { opacity: 0.9 }}
                    isDisabled={isCurrent}
                    onClick={() => handleOpenCheckout(p)}
                  >
                    {isCurrent ? "Current Plan" : isAnnual ? `${p.ctaText} (20% OFF)` : p.ctaText}
                  </Button>
                </Box>
              );
            })}
          </SimpleGrid>
        </Box>

        {/* BILLING HISTORY TABLE */}
        <Box bg="white" borderRadius="18px" border="1px solid #E2E8F0" p={5} boxShadow="0 2px 8px rgba(0,0,0,0.04)">
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Text fontSize="16px" fontWeight="800" color="#0F172A">
                Billing & Invoice History
              </Text>
              <Text fontSize="12px" color="#64748B">
                Download verified tax receipts and payment transaction records.
              </Text>
            </Box>
            <Badge bg="#F1F5F9" color="#475569" borderRadius="md" px={2} py={1} fontSize="11px">
              {invoices.length} Transactions
            </Badge>
          </Flex>

          <Box
            overflowX="auto"
            css={{
              WebkitOverflowScrolling: "touch",
              "&::-webkit-scrollbar": { height: "5px" },
              "&::-webkit-scrollbar-thumb": { background: "#E2E8F0", borderRadius: "4px" },
            }}
          >
            <Table.Root size="sm" minW="640px">
              <Table.Header bg="#F8FAFC">
                <Table.Row>
                  <Table.ColumnHeader color="#475569" fontWeight="bold">Invoice Ref</Table.ColumnHeader>
                  <Table.ColumnHeader color="#475569" fontWeight="bold">Date</Table.ColumnHeader>
                  <Table.ColumnHeader color="#475569" fontWeight="bold">Plan</Table.ColumnHeader>
                  <Table.ColumnHeader color="#475569" fontWeight="bold">Amount</Table.ColumnHeader>
                  <Table.ColumnHeader color="#475569" fontWeight="bold">Method</Table.ColumnHeader>
                  <Table.ColumnHeader color="#475569" fontWeight="bold">Status</Table.ColumnHeader>
                  <Table.ColumnHeader color="#475569" fontWeight="bold" textAlign="right">Action</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {invoices.map((inv) => (
                  <Table.Row key={inv.id} _hover={{ bg: "#F8FAFC" }}>
                    <Table.Cell fontWeight="mono" fontSize="12px" color="#0F172A">{inv.id}</Table.Cell>
                    <Table.Cell fontSize="13px" color="#64748B">{inv.date}</Table.Cell>
                    <Table.Cell fontSize="13px" fontWeight="600" color="#0F172A">{inv.plan}</Table.Cell>
                    <Table.Cell fontSize="13px" fontWeight="bold" color="#0F172A">{inv.amount}</Table.Cell>
                    <Table.Cell fontSize="12px" color="#64748B">{inv.method}</Table.Cell>
                    <Table.Cell>
                      <Badge bg="rgba(16, 185, 129, 0.15)" color="#059669" borderRadius="full" px={2} fontSize="10px">
                        {inv.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                      <Button size="xs" variant="outline" borderColor="#E2E8F0" color="#475569" onClick={() => handleDownloadReceipt(inv)} leftIcon={<Icon as={FaDownload} />}>
                        Receipt
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Box>
      </Box>

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

  return isMobile ? <MobileLayout>{content}</MobileLayout> : <DashboardLayout>{content}</DashboardLayout>;
}
