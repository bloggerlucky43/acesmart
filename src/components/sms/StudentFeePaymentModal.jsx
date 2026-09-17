import {
  Box,
  Flex,
  Text,
  Heading,
  Button,
  Icon,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  FaCreditCard,
  FaLock,
  FaShieldAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { quotePaymentApi, initializePaymentApi } from "../../api-endpoint/sms/smsEndpoints";
import { beginPaystackCheckout } from "../../libs/payment";
import { toaster } from "../../components/ui/toaster";

/**
 * School fee checkout.
 *
 * Amounts are entirely server-authoritative: this component asks
 * /api/payments/quote for the single `totalCharge`, then /api/payments/initialize
 * for the Paystack authorization URL. It never computes a payable amount and
 * never marks a payment successful locally.
 */
const StudentFeePaymentModal = ({
  isOpen,
  onClose,
  invoice,
  student,
  institution,
}) => {
  const balanceDue = Number(invoice?.balanceDue || 0);
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!isOpen || !invoice?.id) return undefined;

    setLoadingQuote(true);
    setQuoteError(null);
    quotePaymentApi({ invoiceId: invoice.id, purpose: "school_fee" })
      .then((res) => {
        if (cancelled) return;
        if (res?.success) setQuote(res.data);
        else setQuoteError(res?.message || "Unable to load payment total");
      })
      .catch((err) => {
        if (cancelled) return;
        setQuoteError(err.response?.data?.message || err.message || "Unable to load payment total");
      })
      .finally(() => {
        if (!cancelled) setLoadingQuote(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, invoice?.id]);

  if (!isOpen || !invoice) return null;

  const handleProcessPayment = async () => {
    if (!quote) {
      toaster.create({ title: quoteError || "Payment total is not available", type: "warning" });
      return;
    }

    setProcessing(true);
    try {
      const res = await initializePaymentApi({
        invoiceId: invoice.id,
        purpose: "school_fee",
        email: student?.parentEmail || student?.studentEmail || institution?.email,
      });

      if (!res?.success || !res?.data?.authorization_url) {
        throw new Error(res?.message || "Failed to start checkout");
      }

      // Success is confirmed server-side (webhook/verify), never here.
      beginPaystackCheckout({
        authorizationUrl: res.data.authorization_url,
        reference: res.data.reference,
        returnPath: window.location.pathname || "/student/fees",
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

  const totalCharge = quote ? Number(quote.totalCharge || 0) : 0;

  return (
    <Flex
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      bg="rgba(15, 23, 42, 0.75)"
      backdropFilter="blur(6px)"
      zIndex={9999}
      align="center"
      justify="center"
      p={4}
      fontFamily="'Outfit', sans-serif"
    >
      <Box
        bg="white"
        w="100%"
        maxW="540px"
        borderRadius="3xl"
        boxShadow="2xl"
        p={{ base: 5, md: 7 }}
        maxH="90vh"
        overflowY="auto"
      >
        <Box>
          <Flex justify="space-between" align="center" mb={4}>
            <Flex align="center" gap={2}>
              <Icon as={FaShieldAlt} color="#10B981" boxSize={5} />
              <Heading fontSize="18px" fontWeight="800" color="#0F172A">
                School Fee Online Payment
              </Heading>
            </Flex>
            <Button size="xs" variant="ghost" onClick={onClose} disabled={processing}>
              ✕
            </Button>
          </Flex>

          {/* Student & Term Info */}
          <Box bg="#F8FAFC" p={3.5} borderRadius="xl" border="1px solid #E2E8F0" mb={4} fontSize="13px">
            <Flex justify="space-between" mb={1}>
              <Text color="#64748B">Student:</Text>
              <Text fontWeight="700" color="#0F172A">
                {student?.name} ({student?.studentCode})
              </Text>
            </Flex>
            <Flex justify="space-between" mb={1}>
              <Text color="#64748B">Term / Session:</Text>
              <Text fontWeight="600">
                {invoice.term} • {invoice.session}
              </Text>
            </Flex>
            <Flex justify="space-between">
              <Text color="#64748B">Outstanding Balance:</Text>
              <Text fontWeight="900" color="#EF4444" fontSize="15px">
                ₦{balanceDue.toLocaleString()}
              </Text>
            </Flex>
          </Box>

          {loadingQuote ? (
            <Flex py={8} justify="center" align="center" gap={3}>
              <Spinner color="#4338CA" />
              <Text fontSize="13px" color="#64748B">
                Calculating your total…
              </Text>
            </Flex>
          ) : quoteError ? (
            <Box
              bg="#FEF2F2"
              border="1px solid #FECACA"
              color="#991B1B"
              p={4}
              borderRadius="xl"
              mb={5}
              fontSize="13px"
            >
              <Flex align="center" gap={2} mb={1}>
                <Icon as={FaExclamationTriangle} />
                <Text fontWeight="800">Online payment unavailable</Text>
              </Flex>
              <Text lineHeight="1.5">{quoteError}</Text>
            </Box>
          ) : (
            <Box
              bg="#F1F5F9"
              p={4}
              borderRadius="xl"
              border="1px solid #E2E8F0"
              mb={5}
              fontSize="13px"
            >
              <Flex justify="space-between" align="center">
                <Box>
                  <Text color="#0F172A" fontWeight="800">
                    Total to pay
                  </Text>
                  <Text color="#64748B" fontSize="11px">
                    Includes any applicable service and processing fees
                  </Text>
                </Box>
                <Text color="#4338CA" fontWeight="900" fontSize="22px">
                  ₦{totalCharge.toLocaleString()}
                </Text>
              </Flex>
            </Box>
          )}

          <Button
            w="100%"
            h="48px"
            bg="linear-gradient(135deg, #10B981 0%, #059669 100%)"
            color="white"
            borderRadius="xl"
            fontWeight="800"
            fontSize="15px"
            boxShadow="0 4px 14px rgba(16, 185, 129, 0.3)"
            _hover={{ opacity: 0.95 }}
            disabled={!quote || loadingQuote}
            loading={processing}
            loadingText="Redirecting to Paystack…"
            onClick={handleProcessPayment}
          >
            <Icon as={FaLock} mr={2} boxSize={3.5} />
            {quote ? `Pay ₦${totalCharge.toLocaleString()} Securely` : "Pay Securely"}
          </Button>

          <Flex justify="center" align="center" gap={2} mt={3} color="#94A3B8" fontSize="11px">
            <Icon as={FaCreditCard} boxSize={3} />
            <Text>You will be redirected to Paystack. A receipt is issued after confirmation.</Text>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
};

export default StudentFeePaymentModal;
