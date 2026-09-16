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
  FaGraduationCap,
  FaMoneyBillWave,
  FaFileInvoice,
  FaLaptopCode,
  FaLock,
  FaCheckCircle,
  FaUserEdit,
  FaReceipt,
  FaArrowRight,
  FaBell,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import StudentPageHeading from "../../components/student/StudentPageHeading";
import StudentFeePaymentModal from "../../components/sms/StudentFeePaymentModal";
import { useStudentPortal } from "../../libs/StudentPortalProvider";

const StatCard = ({ icon, label, value, tint = "#EEF2FF", accent = "#4338CA" }) => (
  <Box
    bg="white"
    p={5}
    borderRadius="2xl"
    border="1px solid #E2E8F0"
    boxShadow="0 4px 16px rgba(0,0,0,0.02)"
  >
    <Flex justify="space-between" align="center" mb={3}>
      <Text fontSize="12px" fontWeight="700" color="#64748B" letterSpacing="0.5px">
        {label}
      </Text>
      <Flex
        w="36px"
        h="36px"
        borderRadius="xl"
        bg={tint}
        color={accent}
        align="center"
        justify="center"
      >
        <Icon as={icon} boxSize={4} />
      </Flex>
    </Flex>
    <Text fontSize="20px" fontWeight="900" color="#0F172A" lineHeight="1.2">
      {value}
    </Text>
  </Box>
);

const QuickAction = ({ icon, title, description, onClick }) => (
  <Flex
    as="button"
    textAlign="left"
    align="center"
    gap={3}
    bg="white"
    p={4}
    borderRadius="2xl"
    border="1px solid #E2E8F0"
    boxShadow="0 4px 16px rgba(0,0,0,0.02)"
    cursor="pointer"
    _hover={{ borderColor: "#4338CA", transform: "translateY(-2px)" }}
    transition="all 0.15s ease"
    onClick={onClick}
    w="100%"
  >
    <Flex
      w="40px"
      h="40px"
      borderRadius="xl"
      bg="#EEF2FF"
      color="#4338CA"
      align="center"
      justify="center"
      flexShrink={0}
    >
      <Icon as={icon} boxSize={4} />
    </Flex>
    <Box flex={1} minW={0}>
      <Text fontSize="14px" fontWeight="800" color="#0F172A">
        {title}
      </Text>
      <Text fontSize="12px" color="#64748B" isTruncated>
        {description}
      </Text>
    </Box>
    <Icon as={FaArrowRight} boxSize={3} color="#94A3B8" />
  </Flex>
);

const StudentOverview = () => {
  const navigate = useNavigate();
  const { student, institution, invoice, isUnlocked, refresh } =
    useStudentPortal();
  const [feeModalOpen, setFeeModalOpen] = useState(false);

  const balanceDue = Number(invoice?.balanceDue || 0);
  const isCleared = invoice?.status === "cleared" || balanceDue <= 0;

  return (
    <Box>
      <StudentPageHeading
        title="Dashboard"
        description="Your fees, results, and school activity at a glance."
        icon={FaGraduationCap}
        action={
          <Badge
            bg="#ECFDF5"
            color="#065F46"
            px={3}
            py={1.5}
            borderRadius="full"
            fontWeight="800"
            fontSize="11px"
          >
            PORTAL ACTIVE
          </Badge>
        }
      />

      <Box
        bg="linear-gradient(135deg, #1E1B4B 0%, #4338CA 50%, #6D28D9 100%)"
        color="white"
        borderRadius="3xl"
        p={{ base: 6, md: 8 }}
        mb={8}
        boxShadow="0 10px 30px rgba(67, 56, 202, 0.2)"
      >
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          gap={4}
        >
          <Flex align="center" gap={4}>
            {institution?.logoUrl ? (
              <Box
                w="68px"
                h="68px"
                borderRadius="2xl"
                bg="white"
                p={1}
                boxShadow="0 4px 12px rgba(0,0,0,0.2)"
                flexShrink={0}
              >
                <img
                  src={institution.logoUrl}
                  alt="Crest"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </Box>
            ) : (
              <Flex
                w="64px"
                h="64px"
                borderRadius="2xl"
                bg="rgba(255,255,255,0.15)"
                align="center"
                justify="center"
                flexShrink={0}
              >
                <Icon as={FaGraduationCap} boxSize={8} color="#DDD6FE" />
              </Flex>
            )}

            <Box minW={0}>
              <Text
                fontSize="12px"
                fontWeight="700"
                letterSpacing="1px"
                color="#C7D2FE"
              >
                {institution?.name?.toUpperCase()}
              </Text>
              <Text fontSize="24px" fontWeight="900" letterSpacing="-0.5px">
                {student?.name}
              </Text>
              <Text fontSize="13px" color="#E0E7FF">
                Class: <strong>{student?.classArm}</strong> • Code:{" "}
                <strong>{student?.studentCode}</strong>
              </Text>
            </Box>
          </Flex>

          <Button
            bg="white"
            color="#4338CA"
            borderRadius="xl"
            fontWeight="800"
            fontSize="13px"
            px={4}
            h="42px"
            boxShadow="0 4px 12px rgba(0,0,0,0.15)"
            _hover={{ bg: "#F8FAFC" }}
            onClick={() => navigate(`/take_exam?code=${student?.studentCode}`)}
          >
            <Icon as={FaLaptopCode} mr={2} boxSize={4} />
            Take CBT Exam
          </Button>
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} mb={8}>
        <StatCard
          icon={FaMoneyBillWave}
          label="OUTSTANDING BALANCE"
          value={`₦${balanceDue.toLocaleString()}`}
          tint={isCleared ? "#ECFDF5" : "#FEF2F2"}
          accent={isCleared ? "#065F46" : "#EF4444"}
        />
        <StatCard
          icon={FaCheckCircle}
          label="FEE STATUS"
          value={invoice?.status?.toUpperCase() || "NO INVOICE"}
          tint={isCleared ? "#ECFDF5" : "#FEF2F2"}
          accent={isCleared ? "#065F46" : "#B91C1C"}
        />
        <StatCard
          icon={FaFileInvoice}
          label="REPORT CARD"
          value={isUnlocked ? "Unlocked" : "Token Required"}
          tint={isUnlocked ? "#ECFDF5" : "#FEF3C7"}
          accent={isUnlocked ? "#065F46" : "#B45309"}
        />
        <StatCard
          icon={FaGraduationCap}
          label="CLASS ARM"
          value={student?.classArm || "Unassigned"}
        />
      </SimpleGrid>

      <Flex direction={{ base: "column", lg: "row" }} gap={6} mb={8}>
        <Box
          flex={1}
          bg="white"
          p={6}
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          boxShadow="0 4px 16px rgba(0,0,0,0.02)"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="16px" fontWeight="800" color="#0F172A">
              Current Term Fees
            </Text>
            <Badge
              bg={isCleared ? "#ECFDF5" : "#FEF2F2"}
              color={isCleared ? "#065F46" : "#991B1B"}
              fontWeight="800"
              px={3}
              py={1}
              borderRadius="full"
            >
              {invoice?.status?.toUpperCase() || "NO INVOICE"}
            </Badge>
          </Flex>

          {invoice ? (
            <>
              <Box
                bg="#F8FAFC"
                p={4}
                borderRadius="xl"
                border="1px solid #E2E8F0"
                mb={4}
              >
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="13px" color="#64748B">
                    Total Billed:
                  </Text>
                  <Text fontSize="14px" fontWeight="700">
                    ₦{Number(invoice?.totalAmount || 0).toLocaleString()}
                  </Text>
                </Flex>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="13px" color="#64748B">
                    Amount Paid:
                  </Text>
                  <Text fontSize="14px" fontWeight="700" color="#10B981">
                    ₦{Number(invoice?.amountPaid || 0).toLocaleString()}
                  </Text>
                </Flex>
                <Flex
                  justify="space-between"
                  pt={2}
                  borderTop="1px solid #E2E8F0"
                >
                  <Text fontSize="13px" fontWeight="700" color="#0F172A">
                    Outstanding Balance:
                  </Text>
                  <Text fontSize="16px" fontWeight="900" color="#EF4444">
                    ₦{balanceDue.toLocaleString()}
                  </Text>
                </Flex>
              </Box>

              {balanceDue > 0 ? (
                <Button
                  w="100%"
                  h="44px"
                  bg="#10B981"
                  color="white"
                  borderRadius="xl"
                  fontWeight="700"
                  _hover={{ opacity: 0.95 }}
                  onClick={() => setFeeModalOpen(true)}
                >
                  <Icon as={FaMoneyBillWave} mr={2} boxSize={3.5} />
                  Pay Balance Online (₦{balanceDue.toLocaleString()})
                </Button>
              ) : (
                <Flex
                  align="center"
                  justify="center"
                  gap={2}
                  p={2.5}
                  borderRadius="xl"
                  bg="#ECFDF5"
                  color="#065F46"
                  fontWeight="700"
                  fontSize="13px"
                >
                  <Icon as={FaCheckCircle} />
                  All School Fees Cleared
                </Flex>
              )}
            </>
          ) : (
            <Text fontSize="13px" color="#64748B">
              No fee invoice has been generated for this term yet. Please check
              back later or contact the school bursary.
            </Text>
          )}

          <Button
            mt={3}
            variant="ghost"
            w="100%"
            fontSize="13px"
            color="#4338CA"
            fontWeight="700"
            onClick={() => navigate("/student/fees")}
          >
            View Full Fee Statement
            <Icon as={FaArrowRight} ml={2} boxSize={3} />
          </Button>
        </Box>

        <Box
          flex={1}
          bg="white"
          p={6}
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          boxShadow="0 4px 16px rgba(0,0,0,0.02)"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="16px" fontWeight="800" color="#0F172A">
              Terminal Report Card
            </Text>
            <Badge
              bg={isUnlocked ? "#ECFDF5" : "#FEF3C7"}
              color={isUnlocked ? "#065F46" : "#92400E"}
              fontWeight="800"
              px={3}
              py={1}
              borderRadius="full"
            >
              {isUnlocked ? "UNLOCKED" : "TOKEN REQUIRED"}
            </Badge>
          </Flex>

          <Box
            bg="#F8FAFC"
            p={4}
            borderRadius="xl"
            border="1px solid #E2E8F0"
            mb={4}
          >
            <Text fontSize="13px" color="#475569" lineHeight="1.5">
              Official broadsheet containing term continuous assessments, exam
              scores, class position, and principal remarks.
            </Text>
            <Text fontSize="11px" color="#94A3B8" mt={2}>
              Token Fee:{" "}
              <strong>₦{institution?.resultCheckerFee || 500}</strong>{" "}
              (One-time unlock per term)
            </Text>
          </Box>

          <Button
            w="100%"
            h="44px"
            bg={isUnlocked ? "#4338CA" : "linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)"}
            color="white"
            borderRadius="xl"
            fontWeight="700"
            onClick={() => navigate("/student/results")}
          >
            <Icon as={isUnlocked ? FaFileInvoice : FaLock} mr={2} boxSize={3.5} />
            {isUnlocked
              ? "View & Print Official Report Card"
              : `Unlock Report Card (₦${institution?.resultCheckerFee || 500})`}
          </Button>
        </Box>
      </Flex>

      <Text
        fontSize="11px"
        fontWeight="800"
        color="#64748B"
        letterSpacing="1px"
        mb={3}
      >
        QUICK ACTIONS
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        <QuickAction
          icon={FaMoneyBillWave}
          title="Fee Statement & Payment"
          description="See the full term breakdown and pay online"
          onClick={() => navigate("/student/fees")}
        />
        <QuickAction
          icon={FaFileInvoice}
          title="Report Cards"
          description="View, unlock, and print official results"
          onClick={() => navigate("/student/results")}
        />
        <QuickAction
          icon={FaLaptopCode}
          title="CBT Examinations"
          description="Enter the computer-based test room"
          onClick={() => navigate("/student/exams")}
        />
        <QuickAction
          icon={FaUserEdit}
          title="My Profile"
          description="Confirm your details and guardian contacts"
          onClick={() => navigate("/student/profile")}
        />
        <QuickAction
          icon={FaReceipt}
          title="Payment History"
          description="Download past receipts and payment records"
          onClick={() => navigate("/student/receipts")}
        />
        <QuickAction
          icon={FaBell}
          title="Everything Else"
          description="Timetable, attendance, announcements, and more"
          onClick={() => navigate("/student/announcements")}
        />
      </SimpleGrid>

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

export default StudentOverview;
