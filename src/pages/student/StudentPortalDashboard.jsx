import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
  Input,
} from "@chakra-ui/react";
import {
  FaGraduationCap,
  FaMoneyBillWave,
  FaFileInvoice,
  FaLaptopCode,
  FaLock,
  FaCheckCircle,
  FaArrowLeft,
  FaReceipt,
  FaPrint,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  studentCodeLoginApi,
  checkResultTokenStatusApi,
  getStudentReportCardApi,
} from "../../api-endpoint/sms/smsEndpoints";
import ResultCheckerModal from "../../components/sms/ResultCheckerModal";
import StudentFeePaymentModal from "../../components/sms/StudentFeePaymentModal";
import { toaster } from "../../components/ui/toaster";

export default function StudentPortalDashboard() {
  const navigate = useNavigate();
  const [studentCodeInput, setStudentCodeInput] = useState("");
  const [studentLastNameInput, setStudentLastNameInput] = useState("");
  const [activeData, setActiveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [reportCardData, setReportCardData] = useState(null);
  const [viewingReportCard, setViewingReportCard] = useState(false);

  // Restore the student code and surname saved during the portal session.
  useEffect(() => {
    const savedCode = localStorage.getItem("STUDENT_PORTAL_CODE");
    const savedLastName = localStorage.getItem("STUDENT_PORTAL_LAST_NAME");
    if (savedCode && savedLastName) {
      setStudentCodeInput(savedCode);
      setStudentLastNameInput(savedLastName);
      loadStudentPortal(savedCode, savedLastName);
    }
  }, []);

  const loadStudentPortal = async (codeToLoad, lastNameToLoad) => {
    const code = (codeToLoad || studentCodeInput).trim();
    const lastName = (lastNameToLoad || studentLastNameInput).trim();
    if (!code || !lastName) return;

    setLoading(true);
    try {
      const res = await studentCodeLoginApi(code, lastName);
      if (res.success) {
        setActiveData(res.data);
        localStorage.setItem("STUDENT_PORTAL_CODE", code);
        localStorage.setItem("STUDENT_PORTAL_LAST_NAME", lastName);

        // Check if report card is unlocked
        const tokenRes = await checkResultTokenStatusApi(res.data.student.id);
        if (tokenRes.success && tokenRes.isUnlocked) {
          setIsUnlocked(true);
        }
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Unable to access the student portal",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchReportCard = async () => {
    if (!isUnlocked) {
      setModalOpen(true);
      return;
    }

    try {
      const res = await getStudentReportCardApi(activeData.student.id);
      if (res.success) {
        setReportCardData(res.data);
        setViewingReportCard(true);
      }
    } catch (error) {
      if (error.response?.data?.paywallRequired) {
        setModalOpen(true);
      } else {
        toaster.create({ title: "Failed to load report card", type: "error" });
      }
    }
  };

  const handleLogoutStudent = () => {
    localStorage.removeItem("STUDENT_PORTAL_CODE");
    localStorage.removeItem("STUDENT_PORTAL_LAST_NAME");
    setActiveData(null);
    setViewingReportCard(false);
  };

  const student = activeData?.student;
  const institution = activeData?.institution;
  const invoice = activeData?.invoice;

  // View 1: Student Code Prompt if not logged in
  if (!activeData) {
    return (
      <Flex minH="100vh" bg="#F8FAFC" align="center" justify="center" p={4}>
        <Box
          bg="white"
          borderRadius="2xl"
          p={{ base: 6, md: 8 }}
          maxW="460px"
          w="100%"
          border="1px solid #E2E8F0"
          boxShadow="0 10px 30px rgba(0,0,0,0.06)"
          textAlign="center"
        >
          <Flex
            w="64px"
            h="64px"
            mx="auto"
            mb={4}
            borderRadius="2xl"
            bg="#EEF2FF"
            color="#4338CA"
            align="center"
            justify="center"
          >
            <Icon as={FaGraduationCap} boxSize={8} />
          </Flex>

          <Text fontSize="22px" fontWeight="900" color="#0F172A" letterSpacing="-0.5px">
            Student & Parent Portal
          </Text>
          <Text fontSize="13px" color="#64748B" mt={1} mb={6}>
            Enter your Institutional Student Code to check term fees, payment receipts, and report cards
          </Text>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadStudentPortal();
            }}
          >
            <Box mb={4}>
              <Text fontSize="12px" fontWeight="700" color="#334155" textAlign="left" mb={1}>
                INSTITUTIONAL STUDENT CODE
              </Text>
              <Input
                placeholder="e.g. KINGS/2026/001 or ACE/2026/042"
                value={studentCodeInput}
                onChange={(e) => setStudentCodeInput(e.target.value)}
                h="48px"
                borderRadius="xl"
                fontSize="15px"
                fontWeight="700"
                textAlign="center"
                letterSpacing="1px"
                required
              />
            </Box>

            <Box mb={4}>
              <Text fontSize="12px" fontWeight="700" color="#334155" textAlign="left" mb={1}>
                SURNAME / LAST NAME
              </Text>
              <Input
                type="password"
                placeholder="Enter the student's surname"
                value={studentLastNameInput}
                onChange={(e) => setStudentLastNameInput(e.target.value)}
                h="48px"
                borderRadius="xl"
                fontSize="15px"
                fontWeight="600"
                required
                autoComplete="current-password"
              />
            </Box>

            <Button
              type="submit"
              w="100%"
              h="48px"
              bg="linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)"
              color="white"
              borderRadius="xl"
              fontWeight="700"
              fontSize="14px"
              loading={loading}
              boxShadow="0 4px 14px rgba(67, 56, 202, 0.35)"
            >
              Access Student Portal
            </Button>
          </form>

          <Button
            mt={6}
            variant="ghost"
            size="sm"
            color="#64748B"
            onClick={() => navigate("/")}
          >
            <Icon as={FaArrowLeft} mr={2} boxSize={3} />
            Back to AceSmart Home
          </Button>
        </Box>
      </Flex>
    );
  }

  // View 2: Active Student Portal Dashboard
  return (
    <Box minH="100vh" bg="#F8FAFC" p={{ base: 4, md: 8 }}>
      <Box maxW="1000px" mx="auto">
        {/* Navigation Bar */}
        <Flex justify="space-between" align="center" mb={6}>
          <Button
            variant="ghost"
            size="sm"
            color="#64748B"
            onClick={handleLogoutStudent}
          >
            <Icon as={FaArrowLeft} mr={2} boxSize={3} />
            Switch Student / Log Out
          </Button>

          <Badge bg="#EEF2FF" color="#4338CA" px={3} py={1} borderRadius="full" fontWeight="700">
            Student Portal Active
          </Badge>
        </Flex>

        {/* School Crest & Student Profile Header Card */}
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
                >
                  <img
                    src={institution.logoUrl}
                    alt="Crest"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </Box>
              ) : (
                <Flex w="64px" h="64px" borderRadius="2xl" bg="rgba(255,255,255,0.15)" align="center" justify="center">
                  <Icon as={FaGraduationCap} boxSize={8} color="#DDD6FE" />
                </Flex>
              )}

              <Box>
                <Text fontSize="12px" fontWeight="700" letterSpacing="1px" color="#C7D2FE">
                  {institution?.name?.toUpperCase()}
                </Text>
                <Text fontSize="24px" fontWeight="900" letterSpacing="-0.5px">
                  {student.name}
                </Text>
                <Text fontSize="13px" color="#E0E7FF">
                  Class: <strong>{student.classArm}</strong> • Code: <strong>{student.studentCode}</strong>
                </Text>
              </Box>
            </Flex>

            {/* Shortcut to CBT Exam Room */}
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
              onClick={() => navigate(`/take_exam?code=${student.studentCode}`)}
            >
              <Icon as={FaLaptopCode} mr={2} boxSize={4} />
              Take CBT Exam
            </Button>
          </Flex>
        </Box>

        {/* Fee Status & Report Card Grid */}
        <Flex direction={{ base: "column", md: "row" }} gap={6} mb={8}>
          {/* Card 1: School Fees Overview */}
          <Box flex={1} bg="white" p={6} borderRadius="2xl" border="1px solid #E2E8F0" boxShadow="0 4px 16px rgba(0,0,0,0.02)">
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontSize="16px" fontWeight="800" color="#0F172A">
                Term School Fees
              </Text>
              <Badge
                bg={invoice?.status === "cleared" ? "#ECFDF5" : "#FEF2F2"}
                color={invoice?.status === "cleared" ? "#065F46" : "#991B1B"}
                fontWeight="800"
                px={3}
                py={1}
                borderRadius="full"
              >
                {invoice?.status?.toUpperCase() || "OWING"}
              </Badge>
            </Flex>

            <Box bg="#F8FAFC" p={4} borderRadius="xl" border="1px solid #E2E8F0" mb={4}>
              <Flex justify="space-between" mb={2}>
                <Text fontSize="13px" color="#64748B">Total Billed:</Text>
                <Text fontSize="14px" fontWeight="700">₦{Number(invoice?.totalAmount || 0).toLocaleString()}</Text>
              </Flex>
              <Flex justify="space-between" mb={2}>
                <Text fontSize="13px" color="#64748B">Amount Paid:</Text>
                <Text fontSize="14px" fontWeight="700" color="#10B981">₦{Number(invoice?.amountPaid || 0).toLocaleString()}</Text>
              </Flex>
              <Flex justify="space-between" pt={2} borderTop="1px solid #E2E8F0">
                <Text fontSize="13px" fontWeight="700" color="#0F172A">Outstanding Balance:</Text>
                <Text fontSize="16px" fontWeight="900" color="#EF4444">
                  ₦{Number(invoice?.balanceDue || 0).toLocaleString()}
                </Text>
              </Flex>
            </Box>

            {Number(invoice?.balanceDue) > 0 ? (
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
                Pay Balance Online (₦{Number(invoice?.balanceDue).toLocaleString()})
              </Button>
            ) : (
              <Flex align="center" justify="center" gap={2} p={2.5} borderRadius="xl" bg="#ECFDF5" color="#065F46" fontWeight="700" fontSize="13px">
                <Icon as={FaCheckCircle} />
                All School Fees Cleared
              </Flex>
            )}
          </Box>

          {/* Card 2: Terminal Report Card & ₦500 Paywall */}
          <Box flex={1} bg="white" p={6} borderRadius="2xl" border="1px solid #E2E8F0" boxShadow="0 4px 16px rgba(0,0,0,0.02)">
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

            <Box bg="#F8FAFC" p={4} borderRadius="xl" border="1px solid #E2E8F0" mb={4}>
              <Text fontSize="13px" color="#475569" lineHeight="1.5">
                Official broadsheet containing term continuous assessments, exam scores, class position, and principal remarks.
              </Text>
              <Text fontSize="11px" color="#94A3B8" mt={2}>
                Token Fee: <strong>₦{institution?.resultCheckerFee || 500}</strong> (One-time unlock per term)
              </Text>
            </Box>

            {isUnlocked ? (
              <Button
                w="100%"
                h="44px"
                bg="#4338CA"
                color="white"
                borderRadius="xl"
                fontWeight="700"
                onClick={handleFetchReportCard}
              >
                <Icon as={FaFileInvoice} mr={2} boxSize={3.5} />
                View & Print Official Report Card
              </Button>
            ) : (
              <Button
                w="100%"
                h="44px"
                bg="linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)"
                color="white"
                borderRadius="xl"
                fontWeight="700"
                onClick={() => setModalOpen(true)}
              >
                <Icon as={FaLock} mr={2} boxSize={3.5} />
                Unlock Report Card (₦{institution?.resultCheckerFee || 500})
              </Button>
            )}
          </Box>
        </Flex>

        {/* Render Report Card Sheet if viewed */}
        {viewingReportCard && reportCardData && (
          <Box
            bg="white"
            borderRadius="2xl"
            p={{ base: 6, md: 10 }}
            border="2px solid #CBD5E1"
            boxShadow="0 10px 30px rgba(0,0,0,0.08)"
            mb={8}
          >
            {/* Header */}
            <Flex justify="space-between" align="center" borderBottom="3px double #4338CA" pb={4} mb={5}>
              <Flex align="center" gap={3}>
                {institution?.logoUrl && (
                  <Box w="60px" h="60px" p={1} border="1px solid #E2E8F0" borderRadius="lg">
                    <img src={institution.logoUrl} alt="Crest" style={{ maxHeight: "100%", maxWidth: "100%" }} />
                  </Box>
                )}
                <Box>
                  <Text fontSize="18px" fontWeight="900" color="#0F172A" textTransform="uppercase">
                    {institution?.name}
                  </Text>
                  <Text fontSize="12px" color="#4338CA" fontStyle="italic">"{institution?.motto}"</Text>
                </Box>
              </Flex>
              <Badge bg="#4338CA" color="white" px={3} py={1} borderRadius="md" fontWeight="800">
                OFFICIAL REPORT SHEET
              </Badge>
            </Flex>

            {/* Results Table */}
            <Box overflowX="auto" mb={6}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#F1F5F9", borderBottom: "2px solid #CBD5E1" }}>
                    <th style={{ padding: "10px", fontSize: "11px", color: "#475569" }}>SUBJECT</th>
                    <th style={{ padding: "10px", fontSize: "11px", color: "#475569" }}>CA (30)</th>
                    <th style={{ padding: "10px", fontSize: "11px", color: "#475569" }}>EXAM (70)</th>
                    <th style={{ padding: "10px", fontSize: "11px", color: "#475569" }}>TOTAL (100)</th>
                    <th style={{ padding: "10px", fontSize: "11px", color: "#475569" }}>GRADE</th>
                    <th style={{ padding: "10px", fontSize: "11px", color: "#475569" }}>REMARK</th>
                  </tr>
                </thead>
                <tbody>
                  {reportCardData.results.map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #E2E8F0" }}>
                      <td style={{ padding: "10px", fontWeight: "700", fontSize: "13px" }}>{r.subject}</td>
                      <td style={{ padding: "10px", fontSize: "13px" }}>
                        {(Number(r.caScore1) || 0) + (Number(r.caScore2) || 0) + (Number(r.assignmentScore) || 0)}
                      </td>
                      <td style={{ padding: "10px", fontSize: "13px" }}>{r.examScore}</td>
                      <td style={{ padding: "10px", fontWeight: "800", fontSize: "14px", color: "#0F172A" }}>{r.totalScore}</td>
                      <td style={{ padding: "10px", fontWeight: "800", color: "#4338CA" }}>{r.grade}</td>
                      <td style={{ padding: "10px", fontSize: "12px", color: "#64748B" }}>{r.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>

            <Flex justify="center">
              <Button bg="#4338CA" color="white" borderRadius="xl" onClick={() => window.print()}>
                <Icon as={FaPrint} mr={2} boxSize={3.5} />
                Print Official Report Card
              </Button>
            </Flex>
          </Box>
        )}

        {/* Result Checker Modal */}
        <ResultCheckerModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          student={student}
          institution={institution}
          onSuccess={() => {
            setIsUnlocked(true);
            handleFetchReportCard();
          }}
        />

        {/* Student Fee Payment Checkout Modal */}
        <StudentFeePaymentModal
          isOpen={feeModalOpen}
          onClose={() => setFeeModalOpen(false)}
          invoice={invoice}
          student={student}
          institution={institution}
          onPaymentSuccess={() => {
            loadStudentPortal(student?.studentCode);
          }}
        />
      </Box>
    </Box>
  );
}
