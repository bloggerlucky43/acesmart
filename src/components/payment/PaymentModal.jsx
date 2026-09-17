import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Icon,
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaTimes,
  FaArrowRight,
  FaLock,
  FaShieldAlt,
} from "react-icons/fa";
import { toaster } from "../ui/toaster";
import { quotePaymentApi, initializePaymentApi } from "../../api-endpoint/sms/smsEndpoints";
import {
  beginPaystackCheckout,
  pollPaymentStatus,
  getPendingReference,
  clearPendingPayment,
} from "../../libs/payment";

const currency = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

/**
 * Subscription checkout.
 *
 * The server resolves the plan price (/payments/quote) and creates the Paystack
 * transaction (/payments/initialize). This component never computes an amount
 * and never marks a payment successful — success comes from /payments/verify.
 */
export default function PaymentModal({
  isOpen,
  onClose,
  plan,
  billingCycle = "monthly",
  onPaymentSuccess,
}) {
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    if (!isOpen || !plan) return undefined;
    let cancelled = false;

    const pending = getPendingReference();
    if (pending) {
      setLoading(true);
      setError(null);
      pollPaymentStatus(pending, { attempts: 12, intervalMs: 2500 }).then((data) => {
        if (cancelled) return;
        clearPendingPayment();
        if (data?.status === "success") {
          setPaymentDone(true);
          setReceipt({ amount: data.totalCharge, reference: data.reference });
          if (onPaymentSuccess) {
            onPaymentSuccess({
              plan,
              billingCycle,
              amount: currency(data.totalCharge),
              reference: data.reference,
              date: new Date().toISOString().split("T")[0],
            });
          }
        } else {
          setError("We could not confirm your last payment. Please try again or contact support.");
        }
        setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError(null);
    setQuote(null);
    setPaymentDone(false);
    quotePaymentApi({ purpose: "subscription", planId: plan.id, billingCycle })
      .then((res) => {
        if (cancelled) return;
        if (res?.success) setQuote(res.data);
        else setError(res?.message || "Unable to load the checkout total");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.message || err.message || "Unable to load the checkout total");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, plan?.id, billingCycle]);

  if (!isOpen || !plan) return null;

  const formattedAmount = currency(quote?.totalCharge);

  const handlePay = async () => {
    setProcessing(true);
    try {
      const res = await initializePaymentApi({
        purpose: "subscription",
        planId: plan.id,
        billingCycle,
      });
      if (!res?.success || !res?.data?.authorization_url) {
        throw new Error(res?.message || "Failed to start checkout");
      }
      beginPaystackCheckout({
        authorizationUrl: res.data.authorization_url,
        reference: res.data.reference,
        returnPath: window.location.pathname,
      });
    } catch (err) {
      toaster.create({
        title: "Could not start payment",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
      setProcessing(false);
    }
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
        position="relative"
      >
        {!processing && (
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
                Payment Confirmed
              </Text>
              <Text fontSize="13px" color="#94A3B8" mt={1}>
                Your institution has been upgraded to <b>{plan.name}</b>.
              </Text>
            </Box>

            <Box w="100%" bg="#0F172A" borderRadius="16px" border="1px solid #334155" p={4} textAlign="left">
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
                <Text fontWeight="bold" color="#34D399">{currency(receipt?.amount)}</Text>
              </Flex>
              <Flex justify="space-between" fontSize="13px">
                <Text color="#94A3B8">Payment Ref:</Text>
                <Text fontWeight="mono" color="#CBD5E1">{receipt?.reference}</Text>
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
          <>
            <Flex justify="space-between" align="flex-start" mb={5} pr={6}>
              <Box>
                <HStack spacing={2} mb={1}>
                  <Badge
                    bg="rgba(37, 99, 235, 0.15)"
                    color="#60A5FA"
                    border="1px solid rgba(37, 99, 235, 0.3)"
                    borderRadius="full"
                    px={2}
                  >
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
                {loading ? (
                  <Spinner size="sm" color="#34D399" mt={2} />
                ) : (
                  <Text fontSize="22px" fontWeight="900" color="#34D399" lineHeight="1.2">
                    {formattedAmount}
                  </Text>
                )}
              </Box>
            </Flex>

            {error && (
              <Box
                bg="rgba(239, 68, 68, 0.12)"
                border="1px solid rgba(239, 68, 68, 0.4)"
                color="#FCA5A5"
                borderRadius="12px"
                p={3}
                mb={5}
                fontSize="12px"
              >
                {error}
              </Box>
            )}

            {quote && (
              <Box bg="#0F172A" borderRadius="14px" border="1px solid #334155" p={4} mb={5} fontSize="12px">
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text color="#CBD5E1" fontWeight="800">
                      Total to pay
                    </Text>
                    <Text color="#94A3B8" fontSize="11px">
                      Includes any applicable processing fee
                    </Text>
                  </Box>
                  <Text color="#34D399" fontWeight="900" fontSize="16px">
                    {currency(quote.totalCharge)}
                  </Text>
                </Flex>
              </Box>
            )}

            <Flex align="center" justify="center" gap={2} mb={5} color="#94A3B8" fontSize="11px">
              <Icon as={FaLock} color="#34D399" />
              <Text>Card, bank transfer &amp; USSD handled securely by Paystack</Text>
            </Flex>

            <Button
              w="100%"
              h="48px"
              bg="#059669"
              color="white"
              borderRadius="12px"
              fontWeight="bold"
              fontSize="14px"
              _hover={{ bg: "#047857" }}
              loading={processing}
              loadingText="Redirecting to Paystack…"
              disabled={!quote || loading}
              onClick={handlePay}
            >
              <Icon as={FaShieldAlt} mr={2} boxSize={4} />
              {quote ? `Pay ${formattedAmount} Now` : "Pay Now"}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}
