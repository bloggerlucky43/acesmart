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
import { useState, useEffect } from "react";
import DashboardLayout from "../../../constants/dashboardlayout";
import MobileLayout from "../../../mobile/constant/mobilelayout";
import {
  EDUCATOR_PLANS,
  INITIAL_INVOICES,
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
} from "react-icons/fa";

export default function BillingPage() {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const [billingCycle, setBillingCycle] = useState("termly"); // "monthly" | "termly"
  const [activePlanId, setActivePlanId] = useState("pro");
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

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

  const handleOpenCheckout = (plan) => {
    setSelectedPlanForCheckout(plan);
    setIsCheckoutOpen(true);
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
              Monthly Billing
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
                  SAVE 20%
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
                  Billed {billingCycle} • Next automatic renewal on <b>November 15, 2026</b>
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

        {/* PLAN COMPARISON DECK */}
        <Box mb={8}>
          <Text fontSize="18px" fontWeight="800" color="#0F172A" mb={1} fontFamily="'Outfit', sans-serif">
            Available School & Educator Plans
          </Text>
          <Text fontSize="13px" color="#64748B" mb={5}>
            Upgrade or switch tiers anytime. Prorated credits are automatically calculated.
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4}>
            {EDUCATOR_PLANS.map((p) => {
              const isCurrent = p.id === activePlanId;
              const price = billingCycle === "termly" ? p.termlyPrice : p.monthlyPrice;
              const formatted =
                price === 0
                  ? "Free"
                  : new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                      maximumFractionDigits: 0,
                    }).format(price);

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

                    <HStack align="baseline" spacing={1} my={4}>
                      <Text fontSize="26px" fontWeight="900" color="#0F172A">
                        {formatted}
                      </Text>
                      {price > 0 && (
                        <Text fontSize="12px" color="#64748B">
                          /{billingCycle === "termly" ? "term" : "mo"}
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
                    {isCurrent ? "Current Plan" : p.ctaText}
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
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </Box>
  );

  return isMobile ? <MobileLayout>{content}</MobileLayout> : <DashboardLayout>{content}</DashboardLayout>;
}
