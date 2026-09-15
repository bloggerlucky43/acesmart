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
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaCheckCircle,
  FaWhatsapp,
  FaSearch,
  FaFilter,
  FaPlus,
  FaCreditCard,
  FaPrint,
} from "react-icons/fa";
import {
  getInstitutionFeeOverviewApi,
  getDebtorListApi,
  getClassArmsApi,
  recordFeePaymentApi,
} from "../../api-endpoint/sms/smsEndpoints";
import { useAuth } from "../../libs/AuthProvider";
import { toaster } from "../../components/ui/toaster";
import DashboardLayout from "../../constants/dashboardlayout";
import AllocatePaymentModal from "../../components/sms/AllocatePaymentModal";

export default function AdminDebtorManager() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [debtors, setDebtors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Manual payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const institutionName = user?.institution?.name || "Institution";

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ovRes, debtRes, clsRes] = await Promise.all([
        getInstitutionFeeOverviewApi(),
        getDebtorListApi({ classArmId: selectedClassId, search }),
        getClassArmsApi(),
      ]);

      if (ovRes.success) setOverview(ovRes.data);
      if (debtRes.success) setDebtors(debtRes.data);
      if (clsRes.success) setClasses(clsRes.data);
    } catch (error) {
      console.error("Fetch debtor error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedClassId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleSendReminder = (debtor) => {
    const parentPhone = debtor.parentPhone?.replace(/[^0-9]/g, "") || "";
    const cleanPhone = parentPhone.startsWith("0") ? `234${parentPhone.slice(1)}` : parentPhone;

    const message = encodeURIComponent(
      `Dear ${debtor.parentName || "Parent"},\nThis is a polite fee reminder from ${institutionName}. Your child ${debtor.studentName} (${debtor.studentCode}) has an outstanding school fee balance of ₦${debtor.balanceDue.toLocaleString()} for the term. Kindly make payment to ensure seamless academic continuation.\nThank you.`
    );

    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
    } else {
      toaster.create({
        title: "Parent Phone Number Not Configured",
        description: "Please update the student's parent contact information.",
        type: "error",
      });
    }
  };

  const handleOpenPaymentModal = (debtor) => {
    setSelectedInvoice({
      ...debtor,
      id: debtor.studentId,
      firstName: debtor.studentName?.split(" ")[0] || "Student",
      lastName: debtor.studentName?.split(" ").slice(1).join(" ") || "",
      studentId: debtor.studentCode || debtor.studentId,
    });
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!payAmount || Number(payAmount) <= 0) {
      toaster.create({ title: "Please enter a valid payment amount", type: "error" });
      return;
    }

    setSubmittingPayment(true);
    try {
      const res = await recordFeePaymentApi({
        invoiceId: selectedInvoice.invoiceId,
        amount: Number(payAmount),
        reference: `BURSARY-CASH-${Date.now()}`,
      });

      if (res.success) {
        toaster.create({
          title: "Payment Recorded Successfully!",
          description: `₦${Number(payAmount).toLocaleString()} credited to ${selectedInvoice.studentName}`,
          type: "success",
        });
        setPaymentModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Failed to record payment",
        type: "error",
      });
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <DashboardLayout>
      <Box
        p={{ base: 4, md: 8 }}
        pt={{ base: "84px", md: "88px" }}
        pl={{ base: 4, lg: "260px" }}
        maxW="1300px"
        mx="auto"
      >
        {/* Header */}
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          gap={4}
          mb={8}
        >
          <Box>
            <Text fontSize="24px" fontWeight="900" color="#0F172A" letterSpacing="-0.5px">
              School Fee & Debtor Management
            </Text>
            <Text fontSize="13px" color="#64748B">
              {institutionName} • Termly revenue tracking and student defaulter monitoring
            </Text>
          </Box>

          <Flex gap={2}>
            <Button
              bg="#10B981"
              color="white"
              size="sm"
              borderRadius="xl"
              fontWeight="700"
              onClick={() => {
                setSelectedInvoice(null);
                setPaymentModalOpen(true);
              }}
              _hover={{ bg: "#059669" }}
            >
              <Icon as={FaMoneyBillWave} mr={1.5} />
              Allocate Manual Payment
            </Button>

            <Button
              variant="outline"
              size="sm"
              borderRadius="xl"
              onClick={() => window.print()}
            >
              <Icon as={FaPrint} mr={2} boxSize={3.5} />
              Print Debtor Report
            </Button>
          </Flex>
        </Flex>

        {/* Financial KPI Cards */}
        <Flex gap={4} mb={8} flexWrap="wrap">
          <Box
            flex="1"
            minW="200px"
            bg="white"
            p={5}
            borderRadius="2xl"
            border="1px solid #E2E8F0"
            boxShadow="0 2px 10px rgba(0,0,0,0.02)"
          >
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#64748B">TOTAL BILLED</Text>
              <Flex w="32px" h="32px" borderRadius="lg" bg="#EEF2FF" color="#4338CA" align="center" justify="center">
                <Icon as={FaMoneyBillWave} boxSize={3.5} />
              </Flex>
            </Flex>
            <Text fontSize="24px" fontWeight="900" color="#0F172A">
              ₦{overview?.totalBilled?.toLocaleString() || "0"}
            </Text>
            <Text fontSize="11px" color="#64748B" mt={1}>
              Across {overview?.invoiceCount || 0} student invoices
            </Text>
          </Box>

          <Box
            flex="1"
            minW="200px"
            bg="white"
            p={5}
            borderRadius="2xl"
            border="1px solid #E2E8F0"
            boxShadow="0 2px 10px rgba(0,0,0,0.02)"
          >
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#10B981">TOTAL COLLECTED</Text>
              <Flex w="32px" h="32px" borderRadius="lg" bg="#ECFDF5" color="#10B981" align="center" justify="center">
                <Icon as={FaCheckCircle} boxSize={3.5} />
              </Flex>
            </Flex>
            <Text fontSize="24px" fontWeight="900" color="#10B981">
              ₦{overview?.totalCollected?.toLocaleString() || "0"}
            </Text>
            <Text fontSize="11px" color="#059669" mt={1}>
              {overview?.collectionRate || 0}% collection rate
            </Text>
          </Box>

          <Box
            flex="1"
            minW="200px"
            bg="white"
            p={5}
            borderRadius="2xl"
            border="1px solid #E2E8F0"
            boxShadow="0 2px 10px rgba(0,0,0,0.02)"
          >
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#EF4444">OUTSTANDING DEBT</Text>
              <Flex w="32px" h="32px" borderRadius="lg" bg="#FEF2F2" color="#EF4444" align="center" justify="center">
                <Icon as={FaExclamationTriangle} boxSize={3.5} />
              </Flex>
            </Flex>
            <Text fontSize="24px" fontWeight="900" color="#EF4444">
              ₦{overview?.totalOutstanding?.toLocaleString() || "0"}
            </Text>
            <Text fontSize="11px" color="#B91C1C" mt={1}>
              {debtors.length} students currently owing
            </Text>
          </Box>
        </Flex>

        {/* Filter and Search Bar */}
        <Flex
          bg="white"
          p={5}
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          gap={4}
          flexWrap="wrap"
          align="center"
          justify="space-between"
          mb={6}
        >
          <Flex gap={3} flexWrap="wrap" align="center">
            <Box>
              <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>FILTER BY CLASS</Text>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                style={{
                  height: "40px",
                  padding: "0 12px",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px",
                  fontWeight: "600",
                  background: "#F8FAFC",
                }}
              >
                <option value="all">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </Box>

            <form onSubmit={handleSearchSubmit}>
              <Box>
                <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>SEARCH STUDENT / CODE</Text>
                <Flex gap={2}>
                  <Input
                    placeholder="e.g. Adebayo or KINGS/2026/001"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    h="40px"
                    borderRadius="10px"
                    border="1px solid #CBD5E1"
                    bg="#F8FAFC"
                    fontSize="13px"
                  />
                  <Button type="submit" h="40px" borderRadius="10px" bg="#0F172A" color="white">
                    <Icon as={FaSearch} boxSize={3} />
                  </Button>
                </Flex>
              </Box>
            </form>
          </Flex>

          <Badge bg="#FEF2F2" color="#991B1B" px={3} py={1.5} borderRadius="xl" fontSize="12px" fontWeight="700">
            {debtors.length} Defaulters on Record
          </Badge>
        </Flex>

        {/* Debtor Roster Table */}
        <Box
          bg="white"
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          overflow="hidden"
          boxShadow="0 4px 16px rgba(0,0,0,0.02)"
        >
          <Box overflowX="auto">
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>STUDENT</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>CLASS</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>PARENT CONTACT</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>TOTAL BILLED</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>AMOUNT PAID</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>BALANCE DUE</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B", textAlign: "center" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {debtors.length ? (
                  debtors.map((d, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <Text fontWeight="800" fontSize="14px" color="#0F172A">
                          {d.studentName}
                        </Text>
                        <Text fontSize="12px" color="#4338CA" fontWeight="700">
                          {d.studentCode}
                        </Text>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#64748B", fontWeight: "600" }}>
                        {d.classArmName}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <Text fontSize="13px" fontWeight="700" color="#334155">
                          {d.parentName}
                        </Text>
                        <Text fontSize="12px" color="#64748B">
                          {d.parentPhone}
                        </Text>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: "600" }}>
                        ₦{d.totalAmount.toLocaleString()}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#10B981", fontWeight: "700" }}>
                        ₦{d.amountPaid.toLocaleString()}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <Badge bg="#FEF2F2" color="#EF4444" fontSize="13px" fontWeight="900" px={2.5} py={0.5} borderRadius="md">
                          ₦{d.balanceDue.toLocaleString()}
                        </Badge>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <Flex justify="center" gap={2}>
                          {/* Send WhatsApp Reminder */}
                          <Button
                            size="xs"
                            bg="#25D366"
                            color="white"
                            borderRadius="lg"
                            fontWeight="700"
                            _hover={{ opacity: 0.9 }}
                            onClick={() => handleSendReminder(d)}
                            title="Send WhatsApp Fee Reminder"
                          >
                            <Icon as={FaWhatsapp} mr={1} boxSize={3} />
                            Reminder
                          </Button>
                          {/* Record Cash Override */}
                          <Button
                            size="xs"
                            variant="outline"
                            borderRadius="lg"
                            fontWeight="700"
                            onClick={() => handleOpenPaymentModal(d)}
                          >
                            Record Pay
                          </Button>
                        </Flex>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: "36px", textAlign: "center", color: "#94A3B8" }}>
                      No debtors found. All enrolled students have cleared their school fees!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </Box>

        {/* Dedicated Manual Payment Allocation Modal with Printable Receipt */}
        <AllocatePaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          initialStudent={selectedInvoice}
          initialInvoice={selectedInvoice}
          onPaymentSuccess={() => fetchData()}
        />
      </Box>
    </DashboardLayout>
  );
}
