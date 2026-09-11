import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Icon,
  Input,
  Tabs,
  SimpleGrid,
  Field,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  FaCreditCard,
  FaUniversity,
  FaMobileAlt,
  FaShieldAlt,
  FaCheckCircle,
  FaTimes,
  FaLock,
  FaCopy,
  FaArrowRight,
  FaCheck,
} from "react-icons/fa";
import { toaster } from "../ui/toaster";

export default function PaymentModal({
  isOpen,
  onClose,
  plan,
  billingCycle = "monthly",
  onPaymentSuccess,
}) {
  const [activeTab, setActiveTab] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form states
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardPin, setCardPin] = useState("");

  if (!isOpen || !plan) return null;

  const price =
    billingCycle === "termly"
      ? plan.termlyPrice ?? plan.price
      : plan.monthlyPrice ?? plan.price;

  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price || 0);

  const virtualAccount = {
    bank: "Wema Bank / Titan Trust",
    accountNumber: "8924019284",
    beneficiary: "AceSmart EdTech Ltd",
    reference: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(virtualAccount.accountNumber);
    setCopied(true);
    toaster.create({
      title: "Account number copied to clipboard",
      type: "success",
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePay = () => {
    setIsProcessing(true);

    // Simulate real Paystack payment verification
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentDone(true);
      toaster.create({
        title: "Payment Confirmed Successfully!",
        description: `Your subscription to ${plan.name} is now active.`,
        type: "success",
      });

      if (onPaymentSuccess) {
        onPaymentSuccess({
          plan,
          billingCycle,
          amount: formattedAmount,
          reference: virtualAccount.reference,
          date: new Date().toISOString().split("T")[0],
        });
      }
    }, 2000);
  };

  const handleDone = () => {
    setPaymentDone(false);
    onClose();
  };

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={1500}
      bg="rgba(15, 23, 42, 0.75)"
      backdropFilter="blur(8px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        bg="#1E293B"
        border="1px solid #334155"
        borderRadius="24px"
        p={{ base: 5, sm: 7 }}
        maxW="520px"
        w="100%"
        color="white"
        boxShadow="0 25px 50px rgba(0, 0, 0, 0.5)"
        animation="fadeIn 0.2s ease-out"
        position="relative"
      >
        {/* Close button */}
        {!isProcessing && (
          <Button
            size="xs"
            variant="ghost"
            position="absolute"
            top="16px"
            right="16px"
            color="#94A3B8"
            _hover={{ color: "white", bg: "#0F172A" }}
            onClick={onClose}
          >
            <Icon as={FaTimes} boxSize={4} />
          </Button>
        )}

        {paymentDone ? (
          /* SUCCESS STATE */
          <VStack spacing={4} py={4} align="center" textAlign="center">
            <Flex
              w="64px"
              h="64px"
              borderRadius="full"
              bg="rgba(16, 185, 129, 0.15)"
              color="#34D399"
              align="center"
              justify="center"
            >
              <Icon as={FaCheckCircle} boxSize={8} />
            </Flex>

            <Box>
              <Text fontSize="22px" fontWeight="800" color="white" fontFamily="'Outfit', sans-serif">
                Payment Successful!
              </Text>
              <Text fontSize="13px" color="#94A3B8" mt={1}>
                Your institution has been upgraded to <b>{plan.name}</b>.
              </Text>
            </Box>

            <Box
              w="100%"
              bg="#0F172A"
              borderRadius="16px"
              border="1px solid #334155"
              p={4}
              textAlign="left"
            >
              <Flex justify="space-between" mb={2} fontSize="13px">
                <Text color="#94A3B8">Plan Activated:</Text>
                <Text fontWeight="bold" color="white">{plan.name}</Text>
              </Flex>
              <Flex justify="space-between" mb={2} fontSize="13px">
                <Text color="#94A3B8">Billing Cycle:</Text>
                <Text fontWeight="bold" color="white" textTransform="capitalize">
                  {billingCycle}
                </Text>
              </Flex>
              <Flex justify="space-between" mb={2} fontSize="13px">
                <Text color="#94A3B8">Amount Paid:</Text>
                <Text fontWeight="bold" color="#34D399">{formattedAmount}</Text>
              </Flex>
              <Flex justify="space-between" fontSize="13px">
                <Text color="#94A3B8">Payment Ref:</Text>
                <Text fontWeight="mono" color="#CBD5E1">{virtualAccount.reference}</Text>
              </Flex>
            </Box>

            <Button
              w="100%"
              h="46px"
              bg="#2563EB"
              color="white"
              borderRadius="12px"
              fontWeight="bold"
              fontSize="14px"
              _hover={{ bg: "#1D4ED8" }}
              onClick={handleDone}
              rightIcon={<Icon as={FaArrowRight} />}
            >
              Return to Portal
            </Button>
          </VStack>
        ) : (
          /* CHECKOUT FORM */
          <>
            {/* Header / Summary */}
            <Flex justify="space-between" align="flex-start" mb={5} pr={6}>
              <Box>
                <HStack spacing={2} mb={1}>
                  <Badge bg="rgba(37, 99, 235, 0.15)" color="#60A5FA" border="1px solid rgba(37, 99, 235, 0.3)" borderRadius="full" px={2}>
                    SECURE CHECKOUT
                  </Badge>
                  {plan.badge && (
                    <Badge bg="#334155" color="#CBD5E1" borderRadius="full" px={2}>
                      {plan.badge}
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="20px" fontWeight="800" color="white" fontFamily="'Outfit', sans-serif">
                  {plan.name}
                </Text>
                <Text fontSize="12px" color="#94A3B8">
                  Billing cycle: <span style={{ textTransform: "capitalize", color: "#CBD5E1" }}>{billingCycle}</span>
                </Text>
              </Box>

              <Box textAlign="right">
                <Text fontSize="11px" color="#94A3B8" textTransform="uppercase">
                  Total Due
                </Text>
                <Text fontSize="22px" fontWeight="900" color="#34D399" lineHeight="1.2">
                  {formattedAmount}
                </Text>
              </Box>
            </Flex>

            {/* Payment Method Channels */}
            <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)} w="100%" mb={5}>
              <Tabs.List bg="#0F172A" p={1} borderRadius="12px" border="1px solid #334155" gap={1}>
                <Tabs.Trigger
                  value="card"
                  flex={1}
                  py={2}
                  borderRadius="8px"
                  color="#94A3B8"
                  fontSize="12px"
                  fontWeight="bold"
                  _selected={{ bg: "#1E293B", color: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
                >
                  <HStack spacing={1.5} justify="center">
                    <Icon as={FaCreditCard} />
                    <Text>Card</Text>
                  </HStack>
                </Tabs.Trigger>

                <Tabs.Trigger
                  value="transfer"
                  flex={1}
                  py={2}
                  borderRadius="8px"
                  color="#94A3B8"
                  fontSize="12px"
                  fontWeight="bold"
                  _selected={{ bg: "#1E293B", color: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
                >
                  <HStack spacing={1.5} justify="center">
                    <Icon as={FaUniversity} />
                    <Text>Bank Transfer</Text>
                  </HStack>
                </Tabs.Trigger>

                <Tabs.Trigger
                  value="ussd"
                  flex={1}
                  py={2}
                  borderRadius="8px"
                  color="#94A3B8"
                  fontSize="12px"
                  fontWeight="bold"
                  _selected={{ bg: "#1E293B", color: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
                >
                  <HStack spacing={1.5} justify="center">
                    <Icon as={FaMobileAlt} />
                    <Text>USSD</Text>
                  </HStack>
                </Tabs.Trigger>
              </Tabs.List>

              {/* 1. CARD PAYMENT TAB */}
              <Tabs.Content value="card" pt={4}>
                <VStack spacing={3} align="stretch">
                  <Field.Root>
                    <Field.Label fontSize="11px" fontWeight="bold" color="#CBD5E1">
                      CARD NUMBER
                    </Field.Label>
                    <Input
                      placeholder="0000 0000 0000 0000"
                      bg="#0F172A"
                      borderRadius="10px"
                      h="44px"
                      border="1px solid #334155"
                      color="white"
                      fontSize="14px"
                      _focus={{ borderColor: "#2563EB" }}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </Field.Root>

                  <SimpleGrid columns={3} gap={2}>
                    <Field.Root>
                      <Field.Label fontSize="11px" fontWeight="bold" color="#CBD5E1">
                        EXPIRY
                      </Field.Label>
                      <Input
                        placeholder="MM/YY"
                        bg="#0F172A"
                        borderRadius="10px"
                        h="44px"
                        border="1px solid #334155"
                        color="white"
                        fontSize="13px"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label fontSize="11px" fontWeight="bold" color="#CBD5E1">
                        CVV
                      </Field.Label>
                      <Input
                        placeholder="123"
                        type="password"
                        maxLength={4}
                        bg="#0F172A"
                        borderRadius="10px"
                        h="44px"
                        border="1px solid #334155"
                        color="white"
                        fontSize="13px"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label fontSize="11px" fontWeight="bold" color="#CBD5E1">
                        PIN
                      </Field.Label>
                      <Input
                        placeholder="••••"
                        type="password"
                        maxLength={4}
                        bg="#0F172A"
                        borderRadius="10px"
                        h="44px"
                        border="1px solid #334155"
                        color="white"
                        fontSize="13px"
                        value={cardPin}
                        onChange={(e) => setCardPin(e.target.value)}
                      />
                    </Field.Root>
                  </SimpleGrid>
                </VStack>
              </Tabs.Content>

              {/* 2. BANK TRANSFER TAB */}
              <Tabs.Content value="transfer" pt={4}>
                <Box bg="#0F172A" borderRadius="14px" border="1px solid #334155" p={4}>
                  <Text fontSize="12px" color="#94A3B8" mb={3} textAlign="center">
                    Transfer exactly <b>{formattedAmount}</b> to this dedicated dynamic account:
                  </Text>

                  <VStack spacing={2.5} align="stretch">
                    <Flex justify="space-between" align="center" py={1.5} borderBottom="1px solid #1E293B">
                      <Text fontSize="12px" color="#94A3B8">Bank Name:</Text>
                      <Text fontSize="13px" fontWeight="bold" color="white">{virtualAccount.bank}</Text>
                    </Flex>

                    <Flex justify="space-between" align="center" py={1.5} borderBottom="1px solid #1E293B">
                      <Text fontSize="12px" color="#94A3B8">Account Number:</Text>
                      <HStack spacing={2}>
                        <Text fontSize="16px" fontWeight="900" color="#38BDF8" fontFamily="monospace">
                          {virtualAccount.accountNumber}
                        </Text>
                        <Button size="2xs" variant="outline" borderColor="#334155" color="white" onClick={handleCopyAccount}>
                          <Icon as={copied ? FaCheck : FaCopy} />
                        </Button>
                      </HStack>
                    </Flex>

                    <Flex justify="space-between" align="center" py={1.5}>
                      <Text fontSize="12px" color="#94A3B8">Beneficiary:</Text>
                      <Text fontSize="12px" fontWeight="bold" color="white">{virtualAccount.beneficiary}</Text>
                    </Flex>
                  </VStack>
                </Box>
              </Tabs.Content>

              {/* 3. USSD TAB */}
              <Tabs.Content value="ussd" pt={4}>
                <Box bg="#0F172A" borderRadius="14px" border="1px solid #334155" p={4} textAlign="center">
                  <Text fontSize="12px" color="#94A3B8" mb={3}>
                    Dial this code directly from your bank-registered mobile number:
                  </Text>
                  <Text fontSize="18px" fontWeight="900" color="#38BDF8" fontFamily="monospace" p={2} bg="#1E293B" borderRadius="10px" border="1px solid #334155" mb={3}>
                    *737*2*{price}*001#
                  </Text>
                  <Text fontSize="11px" color="#64748B">
                    GTBank, Zenith, Access, UBA, FirstBank supported
                  </Text>
                </Box>
              </Tabs.Content>
            </Tabs.Root>

            {/* Security note */}
            <Flex align="center" justify="center" gap={2} mb={5} color="#94A3B8" fontSize="11px">
              <Icon as={FaLock} color="#34D399" />
              <Text>256-Bit SSL Encryption • Powered by Paystack / Flutterwave</Text>
            </Flex>

            {/* Action Buttons */}
            <Button
              w="100%"
              h="48px"
              bg="#059669"
              color="white"
              borderRadius="12px"
              fontWeight="bold"
              fontSize="14px"
              _hover={{ bg: "#047857" }}
              loading={isProcessing}
              loadingText="Processing Transaction..."
              onClick={handlePay}
            >
              Pay {formattedAmount} Now
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}
