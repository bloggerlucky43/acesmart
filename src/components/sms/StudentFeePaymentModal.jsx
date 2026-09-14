import {
  Box,
  Flex,
  Text,
  Heading,
  Button,
  Input,
  Icon,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  FaCreditCard,
  FaUniversity,
  FaCheckCircle,
  FaPrint,
  FaLock,
  FaReceipt,
  FaShieldAlt,
} from "react-icons/fa";
import { recordFeePaymentApi } from "../../api-endpoint/sms/smsEndpoints";
import { toaster } from "../../components/ui/toaster";

const StudentFeePaymentModal = ({
  isOpen,
  onClose,
  invoice,
  student,
  institution,
  onPaymentSuccess,
}) => {
  if (!isOpen || !invoice) return null;

  const balanceDue = Number(invoice.balanceDue || 0);
  const [payMode, setPayMode] = useState("full"); // "full" | "custom"
  const [customAmount, setCustomAmount] = useState(Math.min(20000, balanceDue));
  const [paymentMethod, setPaymentMethod] = useState("card"); // "card" | "transfer"
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState("4084 0841 8408 4084");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("841");

  const amountToPay = payMode === "full" ? balanceDue : Number(customAmount || 0);

  const handleProcessPayment = async () => {
    if (amountToPay <= 0) {
      toaster.create({ title: "Please specify a valid payment amount", type: "warning" });
      return;
    }

    if (amountToPay > balanceDue) {
      toaster.create({ title: "Payment amount cannot exceed balance due", type: "warning" });
      return;
    }

    setProcessing(true);
    try {
      const ref = `PAY-${Date.now().toString().slice(-8)}`;
      const res = await recordFeePaymentApi({
        invoiceId: invoice.id,
        amount: amountToPay,
        paymentMethod: paymentMethod === "card" ? "Paystack Card Checkout" : "Bank Transfer",
        reference: ref,
      });

      if (res.success) {
        const receiptData = {
          receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          amountPaid: amountToPay,
          remainingBalance: Math.max(0, balanceDue - amountToPay),
          reference: ref,
          studentName: student.name,
          studentCode: student.studentCode,
          classArm: student.classArm,
          term: invoice.term,
          session: invoice.session,
          status: balanceDue - amountToPay <= 0 ? "FULL PAYMENT" : "PARTIAL PAYMENT",
        };

        setReceipt(receiptData);
        toaster.create({
          title: "Payment Successful!",
          description: `₦${amountToPay.toLocaleString()} paid successfully.`,
          type: "success",
        });

        if (onPaymentSuccess) onPaymentSuccess(res.data);
      }
    } catch (err) {
      toaster.create({
        title: "Payment Processing Failed",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setProcessing(false);
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
        {/* VIEW A: OFFICIAL BURSARY RECEIPT AFTER PAYMENT */}
        {receipt ? (
          <Box>
            <Flex justify="space-between" align="center" mb={4}>
              <Badge bg="#DCFCE7" color="#166534" px={3} py={1} borderRadius="full" fontWeight="800">
                OFFICIAL PAYMENT RECEIPT
              </Badge>
              <Button size="xs" variant="ghost" onClick={onClose}>
                ✕ Close
              </Button>
            </Flex>

            <Box
              p={6}
              borderRadius="2xl"
              border="2px dashed #CBD5E1"
              bg="#F8FAFC"
              mb={6}
              id="printable-receipt"
            >
              {/* Receipt Header */}
              <Flex align="center" gap={3} borderBottom="2px solid #E2E8F0" pb={3} mb={4}>
                {institution?.logoUrl && (
                  <Box w="48px" h="48px" borderRadius="xl" bg="white" p={1} border="1px solid #E2E8F0">
                    <img src={institution.logoUrl} alt="Crest" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </Box>
                )}
                <Box>
                  <Text fontSize="16px" fontWeight="900" color="#0F172A" textTransform="uppercase">
                    {institution?.name || "School Bursary"}
                  </Text>
                  <Text fontSize="11px" color="#64748B" fontStyle="italic">
                    "{institution?.motto || "Excellence & Discipline"}"
                  </Text>
                </Box>
              </Flex>

              {/* Receipt Details */}
              <Flex justify="space-between" fontSize="12px" color="#64748B" mb={3}>
                <Text>Receipt No: <strong>{receipt.receiptNumber}</strong></Text>
                <Text>{receipt.date}</Text>
              </Flex>

              <Box bg="white" p={4} borderRadius="xl" border="1px solid #E2E8F0" mb={4} fontSize="13px">
                <Flex justify="space-between" py={1}>
                  <Text color="#64748B">Student Name:</Text>
                  <Text fontWeight="700" color="#0F172A">{receipt.studentName}</Text>
                </Flex>
                <Flex justify="space-between" py={1}>
                  <Text color="#64748B">Student Code:</Text>
                  <Text fontWeight="700" color="#4338CA">{receipt.studentCode}</Text>
                </Flex>
                <Flex justify="space-between" py={1}>
                  <Text color="#64748B">Class Arm:</Text>
                  <Text fontWeight="600">{receipt.classArm}</Text>
                </Flex>
                <Flex justify="space-between" py={1}>
                  <Text color="#64748B">Term / Session:</Text>
                  <Text fontWeight="600">{receipt.term} ({receipt.session})</Text>
                </Flex>
                <Flex justify="space-between" py={1.5} borderTop="1px solid #E2E8F0" mt={1}>
                  <Text color="#64748B" fontWeight="700">Amount Paid:</Text>
                  <Text fontWeight="900" fontSize="16px" color="#16A34A">
                    ₦{receipt.amountPaid.toLocaleString()}
                  </Text>
                </Flex>
                <Flex justify="space-between" py={1}>
                  <Text color="#64748B">Remaining Balance:</Text>
                  <Text fontWeight="800" color={receipt.remainingBalance > 0 ? "#EF4444" : "#16A34A"}>
                    ₦{receipt.remainingBalance.toLocaleString()}
                  </Text>
                </Flex>
              </Box>

              {/* Stamp Badge */}
              <Flex justify="center">
                <Badge
                  px={4}
                  py={1.5}
                  borderRadius="full"
                  bg={receipt.remainingBalance <= 0 ? "#16A34A" : "#D97706"}
                  color="white"
                  fontWeight="800"
                  fontSize="12px"
                  letterSpacing="1px"
                >
                  {receipt.status} • VERIFIED
                </Badge>
              </Flex>
            </Box>

            <Flex gap={3}>
              <Button
                flex={1}
                variant="outline"
                borderColor="#CBD5E1"
                borderRadius="xl"
                onClick={() => window.print()}
              >
                <Icon as={FaPrint} mr={2} />
                Print Receipt
              </Button>
              <Button
                flex={1}
                bg="#4338CA"
                color="white"
                borderRadius="xl"
                onClick={onClose}
              >
                Done
              </Button>
            </Flex>
          </Box>
        ) : (
          /* VIEW B: CHECKOUT MODAL */
          <Box>
            <Flex justify="space-between" align="center" mb={4}>
              <Flex align="center" gap={2}>
                <Icon as={FaShieldAlt} color="#10B981" boxSize={5} />
                <Heading fontSize="18px" fontWeight="800" color="#0F172A">
                  School Fee Online Payment
                </Heading>
              </Flex>
              <Button size="xs" variant="ghost" onClick={onClose}>
                ✕
              </Button>
            </Flex>

            {/* Student & Term Info Banner */}
            <Box bg="#F8FAFC" p={3.5} borderRadius="xl" border="1px solid #E2E8F0" mb={4} fontSize="13px">
              <Flex justify="space-between" mb={1}>
                <Text color="#64748B">Student:</Text>
                <Text fontWeight="700" color="#0F172A">{student.name} ({student.studentCode})</Text>
              </Flex>
              <Flex justify="space-between" mb={1}>
                <Text color="#64748B">Term / Session:</Text>
                <Text fontWeight="600">{invoice.term} • {invoice.session}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="#64748B">Total Balance Due:</Text>
                <Text fontWeight="900" color="#EF4444" fontSize="15px">
                  ₦{balanceDue.toLocaleString()}
                </Text>
              </Flex>
            </Box>

            {/* Payment Mode Selection */}
            <Text fontSize="13px" fontWeight="700" color="#334155" mb={2}>
              Choose Payment Option:
            </Text>
            <Flex gap={3} mb={4}>
              <Button
                flex={1}
                h="44px"
                variant={payMode === "full" ? "solid" : "outline"}
                bg={payMode === "full" ? "#4338CA" : "white"}
                color={payMode === "full" ? "white" : "#475569"}
                borderColor="#CBD5E1"
                borderRadius="xl"
                fontSize="13px"
                fontWeight="700"
                onClick={() => setPayMode("full")}
              >
                Pay Full (₦{balanceDue.toLocaleString()})
              </Button>

              <Button
                flex={1}
                h="44px"
                variant={payMode === "custom" ? "solid" : "outline"}
                bg={payMode === "custom" ? "#4338CA" : "white"}
                color={payMode === "custom" ? "white" : "#475569"}
                borderColor="#CBD5E1"
                borderRadius="xl"
                fontSize="13px"
                fontWeight="700"
                onClick={() => setPayMode("custom")}
              >
                Custom Installment
              </Button>
            </Flex>

            {payMode === "custom" && (
              <Box mb={4}>
                <Text fontSize="12px" color="#64748B" mb={1}>
                  Enter Installment Amount (₦):
                </Text>
                <Input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  max={balanceDue}
                  borderRadius="xl"
                  h="42px"
                  fontWeight="700"
                  fontSize="15px"
                />
              </Box>
            )}

            {/* Payment Method Tabs */}
            <Flex gap={2} mb={4} p={1} bg="#F1F5F9" borderRadius="xl">
              <Button
                flex={1}
                size="sm"
                variant="ghost"
                borderRadius="lg"
                bg={paymentMethod === "card" ? "white" : "transparent"}
                boxShadow={paymentMethod === "card" ? "sm" : "none"}
                fontWeight="700"
                color={paymentMethod === "card" ? "#4338CA" : "#64748B"}
                onClick={() => setPaymentMethod("card")}
              >
                <Icon as={FaCreditCard} mr={2} boxSize={3.5} />
                Card / Paystack
              </Button>

              <Button
                flex={1}
                size="sm"
                variant="ghost"
                borderRadius="lg"
                bg={paymentMethod === "transfer" ? "white" : "transparent"}
                boxShadow={paymentMethod === "transfer" ? "sm" : "none"}
                fontWeight="700"
                color={paymentMethod === "transfer" ? "#4338CA" : "#64748B"}
                onClick={() => setPaymentMethod("transfer")}
              >
                <Icon as={FaUniversity} mr={2} boxSize={3.5} />
                Bank Transfer
              </Button>
            </Flex>

            {paymentMethod === "card" ? (
              <Box bg="#F8FAFC" p={4} borderRadius="xl" border="1px solid #E2E8F0" mb={5}>
                <Text fontSize="12px" fontWeight="700" color="#334155" mb={2}>
                  CARD DETAILS (PAYSTACK ENCRYPTED)
                </Text>
                <Input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Card Number"
                  h="40px"
                  borderRadius="lg"
                  bg="white"
                  fontSize="13px"
                  mb={2}
                />
                <Flex gap={3}>
                  <Input
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    h="40px"
                    borderRadius="lg"
                    bg="white"
                    fontSize="13px"
                  />
                  <Input
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="CVV"
                    h="40px"
                    borderRadius="lg"
                    bg="white"
                    fontSize="13px"
                  />
                </Flex>
              </Box>
            ) : (
              <Box bg="#EFF6FF" p={4} borderRadius="xl" border="1px solid #BFDBFE" mb={5} fontSize="13px">
                <Text fontWeight="700" color="#1E3A8A" mb={1}>
                  Official School Bank Account:
                </Text>
                <Text color="#1E40AF">Bank: <strong>Zenith Bank PLC</strong></Text>
                <Text color="#1E40AF">Account Name: <strong>{institution?.name || "AceSmart Academy"}</strong></Text>
                <Text color="#1E40AF">Account Number: <strong>1014892742</strong></Text>
                <Text fontSize="11px" color="#3B82F6" mt={2}>
                  Reference Code: <strong>{student.studentCode}</strong>
                </Text>
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
              loading={processing}
              onClick={handleProcessPayment}
            >
              <Icon as={FaLock} mr={2} boxSize={3.5} />
              Pay ₦{amountToPay.toLocaleString()} Now
            </Button>
          </Box>
        )}
      </Box>
    </Flex>
  );
};

export default StudentFeePaymentModal;
