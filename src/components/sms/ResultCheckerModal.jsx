import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
} from "@chakra-ui/react";
import {
  FaLock,
  FaShieldAlt,
  FaCreditCard,
  FaTimes,
  FaGraduationCap,
} from "react-icons/fa";
import { quotePaymentApi, initializePaymentApi } from "../../api-endpoint/sms/smsEndpoints";
import { beginPaystackCheckout } from "../../libs/payment";
import { toaster } from "../ui/toaster";

export default function ResultCheckerModal({
  isOpen,
  onClose,
  student,
  institution,
  term,
  session,
}) {
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);

  useEffect(() => {
    if (!isOpen || !student?.id) return undefined;
    let cancelled = false;
    setLoadingQuote(true);
    setQuoteError(null);
    quotePaymentApi({
      studentId: student.id,
      purpose: "result_checker",
      term,
      session,
    })
      .then((res) => {
        if (cancelled) return;
        if (res?.success) setQuote(res.data);
        else setQuoteError(res?.message || "Unable to load the unlock total");
      })
      .catch((err) => {
        if (cancelled) return;
        setQuoteError(err.response?.data?.message || err.message || "Unable to load the unlock total");
      })
      .finally(() => {
        if (!cancelled) setLoadingQuote(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, student?.id, term, session]);

  if (!isOpen) return null;

  const baseFee = institution?.resultCheckerFee || 500;
  const totalCharge = quote ? Number(quote.totalCharge || 0) : baseFee;
  const schoolName = institution?.name || "Institution";
  const schoolLogo = institution?.logoUrl;

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await initializePaymentApi({
        studentId: student?.id,
        purpose: "result_checker",
        term,
        session,
        email: student?.parentEmail || student?.studentEmail,
      });

      if (!res?.success || !res?.data?.authorization_url) {
        throw new Error(res?.message || "Failed to start checkout");
      }

      // Unlock happens server-side after Paystack confirms (webhook/verify).
      beginPaystackCheckout({
        authorizationUrl: res.data.authorization_url,
        reference: res.data.reference,
        returnPath: window.location.pathname,
      });
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || error.message || "Payment could not be started",
        type: "error",
      });
      setLoading(false);
    }
  };

  return (
    <Flex
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      bg="rgba(15, 23, 42, 0.75)"
      backdropFilter="blur(8px)"
      zIndex={1000}
      align="center"
      justify="center"
      p={4}
    >
      <Box
        bg="white"
        borderRadius="2xl"
        maxW="480px"
        w="100%"
        overflow="hidden"
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        border="1px solid"
        borderColor="#E2E8F0"
        position="relative"
      >
        {/* Close Button */}
        <Flex
          as="button"
          position="absolute"
          top={4}
          right={4}
          w="32px"
          h="32px"
          borderRadius="full"
          bg="rgba(255, 255, 255, 0.2)"
          color="white"
          align="center"
          justify="center"
          cursor="pointer"
          _hover={{ bg: "rgba(255, 255, 255, 0.4)" }}
          onClick={onClose}
          zIndex={10}
        >
          <Icon as={FaTimes} boxSize={3.5} />
        </Flex>

        {/* Modal Header */}
        <Box
          bg="linear-gradient(135deg, #1E1B4B 0%, #4338CA 50%, #6D28D9 100%)"
          color="white"
          p={6}
          textAlign="center"
          position="relative"
        >
          {schoolLogo ? (
            <Flex
              w="60px"
              h="60px"
              mx="auto"
              mb={3}
              borderRadius="xl"
              bg="white"
              p={1}
              boxShadow="0 4px 12px rgba(0,0,0,0.2)"
              align="center"
              justify="center"
            >
              <img
                src={schoolLogo}
                alt="School Crest"
                style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
              />
            </Flex>
          ) : (
            <Flex
              w="54px"
              h="54px"
              mx="auto"
              mb={3}
              borderRadius="xl"
              bg="rgba(255, 255, 255, 0.15)"
              align="center"
              justify="center"
            >
              <Icon as={FaGraduationCap} boxSize={6} color="#DDD6FE" />
            </Flex>
          )}

          <Text fontSize="12px" fontWeight="700" letterSpacing="1px" color="#C7D2FE">
            {schoolName.toUpperCase()}
          </Text>
          <Text fontSize="20px" fontWeight="900" mt={1}>
            Official Result Checker Token
          </Text>
          <Text fontSize="13px" color="#E0E7FF" mt={1}>
            Terminal Academic Report Card Verification
          </Text>
        </Box>

        {/* Body */}
        <Box p={6}>
          {/* Student Badge */}
          <Flex
            bg="#F8FAFC"
            p={3.5}
            borderRadius="xl"
            border="1px solid #E2E8F0"
            justify="space-between"
            align="center"
            mb={5}
          >
            <Box>
              <Text fontSize="14px" fontWeight="800" color="#0F172A">
                {student?.name || student?.firstName || "Candidate"}
              </Text>
              <Text fontSize="12px" color="#64748B" fontWeight="600">
                Code: {student?.studentCode || student?.studentId}
              </Text>
            </Box>
            <Badge bg="#EEF2FF" color="#4F46E5" px={3} py={1} borderRadius="full" fontWeight="700">
              {term || institution?.currentTerm || "First Term"}
              {session ? ` • ${session}` : ""}
            </Badge>
          </Flex>

          {/* Fee Notice */}
          <Box
            bg="#FEF3C7"
            p={4}
            borderRadius="xl"
            border="1px solid #FDE68A"
            color="#92400E"
            mb={5}
          >
            <Flex align="center" gap={2} mb={1}>
              <Icon as={FaLock} color="#B45309" />
              <Text fontSize="13px" fontWeight="800">
                Report Card Paywall Notice
              </Text>
            </Flex>
            <Text fontSize="12px" lineHeight="1.5">
              To view, download, or print the comprehensive terminal report card with official school stamp and teacher remarks, a standard token fee of <strong>₦{totalCharge.toLocaleString()}</strong> is required.
            </Text>
          </Box>

          {/* Pricing Highlight */}
          <Flex
            justify="space-between"
            align="center"
            p={4}
            borderRadius="xl"
            bg="#F1F5F9"
            border="1px solid #E2E8F0"
            mb={6}
          >
            <Box>
              <Text fontSize="12px" color="#64748B" fontWeight="600">
                Total Unlock Charge
              </Text>
              <Text fontSize="11px" color="#94A3B8">
                Instant digital report card access
              </Text>
            </Box>
            <Text fontSize="24px" fontWeight="900" color="#0F172A">
              ₦{totalCharge.toLocaleString()}
            </Text>
          </Flex>

          {quoteError && (
            <Box
              bg="#FEF2F2"
              border="1px solid #FECACA"
              color="#991B1B"
              p={3}
              borderRadius="xl"
              mb={4}
              fontSize="12px"
            >
              {quoteError}
            </Box>
          )}

          {/* Action Buttons */}
          <Flex direction="column" gap={3}>
            <Button
              w="100%"
              h="48px"
              bg="linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)"
              color="white"
              borderRadius="xl"
              fontSize="14px"
              fontWeight="700"
              boxShadow="0 4px 14px rgba(67, 56, 202, 0.35)"
              _hover={{ opacity: 0.95, transform: "translateY(-1px)" }}
              onClick={handlePay}
              loading={loading}
              disabled={loadingQuote || !quote}
              loadingText="Redirecting to Paystack..."
            >
              <Icon as={FaCreditCard} mr={2} boxSize={3.5} />
              Pay ₦{totalCharge.toLocaleString()} to Unlock Report Card
            </Button>

            <Button
              variant="ghost"
              w="100%"
              h="40px"
              fontSize="13px"
              color="#64748B"
              _hover={{ bg: "#F1F5F9" }}
              onClick={onClose}
            >
              Cancel & Return
            </Button>
          </Flex>

          {/* Trust footer */}
          <Flex justify="center" align="center" gap={2} mt={5} color="#94A3B8" fontSize="11px">
            <Icon as={FaShieldAlt} boxSize={3} color="#10B981" />
            <Text>Secured by AceSmart Institutional Vault & Paystack</Text>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
}
