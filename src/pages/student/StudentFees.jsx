import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaReceipt,
  FaUniversity,
  FaCreditCard,
  FaInfoCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import StudentPageHeading from "../../components/student/StudentPageHeading";
import StudentFeePaymentModal from "../../components/sms/StudentFeePaymentModal";
import { useStudentPortal } from "../../libs/StudentPortalProvider";

const StudentFees = () => {
  const navigate = useNavigate();
  const { student, institution, invoice, refresh } = useStudentPortal();
  const [feeModalOpen, setFeeModalOpen] = useState(false);

  const totalBilled = Number(invoice?.totalAmount || 0);
  const amountPaid = Number(invoice?.amountPaid || 0);
  const balanceDue = Number(invoice?.balanceDue || 0);
  const isCleared = invoice?.status === "cleared" || balanceDue <= 0;

  return (
    <Box>
      <StudentPageHeading
        title="Fee Statement"
        description="Your term billing, payment progress, and outstanding balance."
        icon={FaMoneyBillWave}
        action={
          balanceDue > 0 ? (
            <Button
              bg="#10B981"
              color="white"
              borderRadius="xl"
              fontWeight="700"
              h="42px"
              _hover={{ opacity: 0.95 }}
              onClick={() => setFeeModalOpen(true)}
            >
              <Icon as={FaMoneyBillWave} mr={2} boxSize={3.5} />
              Pay Fees Online
            </Button>
          ) : (
            <Badge
              bg="#ECFDF5"
              color="#065F46"
              px={3}
              py={1.5}
              borderRadius="full"
              fontWeight="800"
              fontSize="11px"
            >
              FULLY PAID
            </Badge>
          )
        }
      />

      {invoice ? (
        <>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={6}>
            <Box
              bg="white"
              p={5}
              borderRadius="2xl"
              border="1px solid #E2E8F0"
              boxShadow="0 4px 16px rgba(0,0,0,0.02)"
            >
              <Text fontSize="12px" fontWeight="700" color="#64748B">
                TOTAL BILLED
              </Text>
              <Text fontSize="22px" fontWeight="900" color="#0F172A" mt={1}>
                ₦{totalBilled.toLocaleString()}
              </Text>
            </Box>
            <Box
              bg="white"
              p={5}
              borderRadius="2xl"
              border="1px solid #E2E8F0"
              boxShadow="0 4px 16px rgba(0,0,0,0.02)"
            >
              <Text fontSize="12px" fontWeight="700" color="#64748B">
                AMOUNT PAID
              </Text>
              <Text fontSize="22px" fontWeight="900" color="#10B981" mt={1}>
                ₦{amountPaid.toLocaleString()}
              </Text>
            </Box>
            <Box
              bg="white"
              p={5}
              borderRadius="2xl"
              border="1px solid #E2E8F0"
              boxShadow="0 4px 16px rgba(0,0,0,0.02)"
            >
              <Text fontSize="12px" fontWeight="700" color="#64748B">
                OUTSTANDING BALANCE
              </Text>
              <Text
                fontSize="22px"
                fontWeight="900"
                color={balanceDue > 0 ? "#EF4444" : "#10B981"}
                mt={1}
              >
                ₦{balanceDue.toLocaleString()}
              </Text>
            </Box>
          </SimpleGrid>

          <Box
            bg="white"
            borderRadius="2xl"
            border="1px solid #E2E8F0"
            boxShadow="0 4px 16px rgba(0,0,0,0.02)"
            p={{ base: 5, md: 6 }}
            mb={6}
          >
            <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
              <Text fontSize="16px" fontWeight="800" color="#0F172A">
                Invoice Details
              </Text>
              <Badge
                bg={isCleared ? "#ECFDF5" : "#FEF2F2"}
                color={isCleared ? "#065F46" : "#991B1B"}
                fontWeight="800"
                px={3}
                py={1}
                borderRadius="full"
              >
                {invoice?.status?.toUpperCase() || "PENDING"}
              </Badge>
            </Flex>

            <Box
              bg="#F8FAFC"
              p={4}
              borderRadius="xl"
              border="1px solid #E2E8F0"
            >
              {[
                ["Student", `${student?.name} (${student?.studentCode})`],
                ["Class Arm", student?.classArm || "Unassigned"],
                ["Term", invoice?.term || institution?.currentTerm || "—"],
                [
                  "Session",
                  invoice?.session || institution?.academicSession || "—",
                ],
                ["Invoice ID", invoice?.id ? `#${invoice.id}` : "—"],
              ].map(([label, value]) => (
                <Flex key={label} justify="space-between" py={1.5} gap={4}>
                  <Text fontSize="13px" color="#64748B">
                    {label}:
                  </Text>
                  <Text fontSize="13px" fontWeight="700" color="#0F172A" textAlign="right">
                    {value}
                  </Text>
                </Flex>
              ))}
            </Box>

            <Box
              mt={4}
              p={4}
              borderRadius="xl"
              bg={isCleared ? "#ECFDF5" : "#FEF3C7"}
              border="1px solid"
              borderColor={isCleared ? "#A7F3D0" : "#FDE68A"}
              color={isCleared ? "#065F46" : "#92400E"}
              fontSize="12px"
              lineHeight="1.6"
            >
              {isCleared
                ? "This term's school fees have been fully settled. A school-stamped receipt is available after every payment."
                : "Pay the outstanding balance online through Paystack. The exact total (including any service fee) is calculated securely on the server at checkout."}
            </Box>
          </Box>

          <Box
            bg="white"
            borderRadius="2xl"
            border="1px solid #E2E8F0"
            boxShadow="0 4px 16px rgba(0,0,0,0.02)"
            p={{ base: 5, md: 6 }}
          >
            <Text fontSize="16px" fontWeight="800" color="#0F172A" mb={4}>
              Payment Channels
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <Flex
                align="center"
                gap={3}
                p={4}
                borderRadius="xl"
                bg="#F8FAFC"
                border="1px solid #E2E8F0"
              >
                <Icon as={FaCreditCard} color="#4338CA" boxSize={4} />
                <Box>
                  <Text fontSize="13px" fontWeight="800" color="#0F172A">
                    Card / Paystack Checkout
                  </Text>
                  <Text fontSize="12px" color="#64748B">
                    Instant confirmation with digital receipt
                  </Text>
                </Box>
              </Flex>
              <Flex
                align="center"
                gap={3}
                p={4}
                borderRadius="xl"
                bg="#F8FAFC"
                border="1px solid #E2E8F0"
              >
                <Icon as={FaUniversity} color="#4338CA" boxSize={4} />
                <Box>
                  <Text fontSize="13px" fontWeight="800" color="#0F172A">
                    Bank Transfer
                  </Text>
                  <Text fontSize="12px" color="#64748B">
                    Use your student code as the payment reference
                  </Text>
                </Box>
              </Flex>
            </SimpleGrid>

            <Flex
              align="flex-start"
              gap={2.5}
              mt={4}
              p={4}
              borderRadius="xl"
              bg="#EEF2FF"
              color="#3730A3"
              fontSize="12px"
            >
              <Icon as={FaInfoCircle} boxSize={3.5} mt={0.5} flexShrink={0} />
              <Text lineHeight="1.6">
                Payments reflect in this portal immediately. If a payment is
                missing after 24 hours, contact the school bursary with your
                payment reference.
              </Text>
            </Flex>

            <Button
              mt={5}
              variant="ghost"
              color="#4338CA"
              fontWeight="700"
              fontSize="13px"
              onClick={() => navigate("/student/receipts")}
            >
              <Icon as={FaReceipt} mr={2} boxSize={3.5} />
              View Payment History & Receipts
            </Button>
          </Box>
        </>
      ) : (
        <Box
          bg="white"
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          boxShadow="0 4px 16px rgba(0,0,0,0.02)"
          p={{ base: 6, md: 10 }}
          textAlign="center"
        >
          <Flex
            w="60px"
            h="60px"
            mx="auto"
            mb={4}
            borderRadius="2xl"
            bg="#F1F5F9"
            color="#64748B"
            align="center"
            justify="center"
          >
            <Icon as={FaMoneyBillWave} boxSize={6} />
          </Flex>
          <Text fontSize="17px" fontWeight="800" color="#0F172A">
            No fee invoice yet
          </Text>
          <Text fontSize="13px" color="#64748B" mt={1} maxW="420px" mx="auto">
            The school has not generated a fee invoice for this term. Once the
            bursary publishes it, the full breakdown and online payment option
            will appear here automatically.
          </Text>
        </Box>
      )}

      <StudentFeePaymentModal
        isOpen={feeModalOpen}
        onClose={() => setFeeModalOpen(false)}
        invoice={invoice}
        student={student}
        institution={institution}
        onPaymentSuccess={() => refresh()}
      />
    </Box>
  );
};

export default StudentFees;
