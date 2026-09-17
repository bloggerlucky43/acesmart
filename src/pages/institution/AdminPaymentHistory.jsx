import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
  Input,
  Spinner,
} from "@chakra-ui/react";
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaUsers,
  FaSearch,
  FaPrint,
  FaFileDownload,
  FaCalendarAlt,
  FaUniversity,
} from "react-icons/fa";
import {
  getInstitutionPaymentHistoryApi,
  getClassArmsApi,
} from "../../api-endpoint/sms/smsEndpoints";
import { useAuth } from "../../libs/AuthProvider";
import { toaster } from "../../components/ui/toaster";
import DashboardLayout from "../../constants/dashboardlayout";

const PAYMENT_METHODS = [
  { value: "all", label: "All Methods" },
  { value: "Cash at Bursary", label: "Cash at Bursary" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Paystack Card Checkout", label: "Paystack Card Checkout" },
  { value: "manual", label: "Manual Entry" },
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer (legacy)" },
  { value: "paystack", label: "Paystack (legacy)" },
  { value: "online", label: "Online" },
];

const toLocalISO = (dateStr, endOfDay) => {
  if (!dateStr) return undefined;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  const dt = endOfDay
    ? new Date(y, m - 1, d, 23, 59, 59, 999)
    : new Date(y, m - 1, d, 0, 0, 0, 0);
  return dt.toISOString();
};

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "N/A";
  return dt.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDay = (value) => {
  if (!value) return "N/A";
  const dt = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function AdminPaymentHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dailyTotals, setDailyTotals] = useState([]);
  const [studentTotals, setStudentTotals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterMode, setFilterMode] = useState("all");
  const [day, setDay] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const institutionName = user?.institution?.name || "Institution";
  const isSystemAdmin = user?.role === "admin";

  const buildParams = () => {
    const params = {};
    if (filterMode === "day" && day) {
      params.from = toLocalISO(day, false);
      params.to = toLocalISO(day, true);
    } else if (filterMode === "range") {
      const from = toLocalISO(fromDate, false);
      const to = toLocalISO(toDate, true);
      if (from) params.from = from;
      if (to) params.to = to;
    }
    if (selectedClassId && selectedClassId !== "all") params.classArmId = selectedClassId;
    if (paymentMethod && paymentMethod !== "all") params.paymentMethod = paymentMethod;
    if (search) params.search = search;
    return params;
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const [historyRes, classRes] = await Promise.all([
        getInstitutionPaymentHistoryApi(buildParams()),
        getClassArmsApi().catch(() => null),
      ]);

      if (historyRes?.success) {
        setPayments(historyRes.data.payments || []);
        setSummary(historyRes.data.summary || null);
        setDailyTotals(historyRes.data.dailyTotals || []);
        setStudentTotals(historyRes.data.studentTotals || []);
      }
      if (classRes?.success) setClasses(classRes.data || []);
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Failed to load payment history",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMode, day, fromDate, toDate, selectedClassId, paymentMethod, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const clearFilters = () => {
    setFilterMode("all");
    setDay("");
    setFromDate("");
    setToDate("");
    setSelectedClassId("all");
    setPaymentMethod("all");
    setSearchInput("");
    setSearch("");
  };

  const handleDayClick = (date) => {
    setFilterMode("day");
    setDay(date);
  };

  const exportCsv = () => {
    if (!payments.length) {
      toaster.create({ title: "No payments to export", type: "warning" });
      return;
    }
    const headers = [
      "Date",
      "Student",
      "School ID",
      "Class",
      "Amount (NGN)",
      "Method",
      "Receipt No",
      "Reference",
    ];
    const lines = payments.map((p) =>
      [
        formatDateTime(p.paidAt),
        p.studentName,
        p.studentCode,
        p.classArmName,
        p.amount,
        p.paymentMethod,
        p.receiptNumber || "",
        p.reference || "",
      ]
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payment-history-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeFilterLabel = useMemo(() => {
    if (filterMode === "day" && day) return formatDay(day);
    if (filterMode === "range") {
      if (fromDate && toDate) return `${formatDay(fromDate)} - ${formatDay(toDate)}`;
      if (fromDate) return `From ${formatDay(fromDate)}`;
      if (toDate) return `Up to ${formatDay(toDate)}`;
      return "Date Range";
    }
    return "All Time";
  }, [filterMode, day, fromDate, toDate]);

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
              Payment History
            </Text>
            <Text fontSize="13px" color="#64748B">
              {institutionName} • Daily fee collections made by students
            </Text>
          </Box>

          <Flex gap={2}>
            <Button
              variant="outline"
              size="sm"
              borderRadius="xl"
              onClick={() => navigate("/institution/transactions")}
            >
              <Icon as={FaUniversity} mr={2} boxSize={3.5} />
              Online Transactions
            </Button>
            <Button
              bg="#0F172A"
              color="white"
              size="sm"
              borderRadius="xl"
              fontWeight="700"
              onClick={exportCsv}
              _hover={{ bg: "#1E293B" }}
            >
              <Icon as={FaFileDownload} mr={2} boxSize={3.5} />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" borderRadius="xl" onClick={() => window.print()}>
              <Icon as={FaPrint} mr={2} boxSize={3.5} />
              Print
            </Button>
          </Flex>
        </Flex>

        {/* Filter Panel */}
        <Box
          bg="white"
          p={5}
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          mb={6}
          boxShadow="0 2px 10px rgba(0,0,0,0.02)"
        >
          <Flex gap={2} mb={4} flexWrap="wrap" align="center">
            {[
              { key: "all", label: "All Time" },
              { key: "day", label: "Specific Day" },
              { key: "range", label: "Date Range" },
            ].map((mode) => (
              <Button
                key={mode.key}
                size="sm"
                borderRadius="xl"
                fontWeight="700"
                variant={filterMode === mode.key ? "solid" : "outline"}
                bg={filterMode === mode.key ? "#4338CA" : "transparent"}
                color={filterMode === mode.key ? "white" : "#4338CA"}
                borderColor="#C7D2FE"
                onClick={() => setFilterMode(mode.key)}
                _hover={{ bg: filterMode === mode.key ? "#3730A3" : "#EEF2FF" }}
              >
                {mode.label}
              </Button>
            ))}
          </Flex>

          <Flex gap={4} flexWrap="wrap" align="flex-end">
            {filterMode === "day" && (
              <Box>
                <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
                  PICK A DAY
                </Text>
                <Input
                  type="date"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  h="40px"
                  w="180px"
                  borderRadius="10px"
                  border="1px solid #CBD5E1"
                  bg="#F8FAFC"
                  fontSize="13px"
                />
              </Box>
            )}

            {filterMode === "range" && (
              <>
                <Box>
                  <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
                    FROM
                  </Text>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    h="40px"
                    w="170px"
                    borderRadius="10px"
                    border="1px solid #CBD5E1"
                    bg="#F8FAFC"
                    fontSize="13px"
                  />
                </Box>
                <Box>
                  <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
                    TO
                  </Text>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    h="40px"
                    w="170px"
                    borderRadius="10px"
                    border="1px solid #CBD5E1"
                    bg="#F8FAFC"
                    fontSize="13px"
                  />
                </Box>
              </>
            )}

            <Box>
              <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
                FILTER BY CLASS
              </Text>
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
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </Box>

            <Box>
              <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
                PAYMENT METHOD
              </Text>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
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
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Box>

            <form onSubmit={handleSearchSubmit}>
              <Box>
                <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
                  SEARCH STUDENT / SCHOOL ID
                </Text>
                <Flex gap={2}>
                  <Input
                    placeholder="e.g. Adebayo or KINGS/2026/001"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    h="40px"
                    w={{ base: "180px", md: "240px" }}
                    borderRadius="10px"
                    border="1px solid #CBD5E1"
                    bg="#F8FAFC"
                    fontSize="13px"
                  />
                  <Button type="submit" h="40px" borderRadius="10px" bg="#4338CA" color="white">
                    <Icon as={FaSearch} boxSize={3} />
                  </Button>
                </Flex>
              </Box>
            </form>

            <Button
              size="sm"
              h="40px"
              variant="ghost"
              borderRadius="10px"
              color="#64748B"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </Flex>

          <Flex mt={4} align="center" gap={2} flexWrap="wrap">
            <Badge bg="#EEF2FF" color="#4338CA" px={3} py={1} borderRadius="full" fontSize="11px" fontWeight="700">
              <Icon as={FaCalendarAlt} mr={1} boxSize={2.5} />
              {activeFilterLabel}
            </Badge>
            {isSystemAdmin && (
              <Badge bg="#FEF3C7" color="#92400E" px={3} py={1} borderRadius="full" fontSize="11px" fontWeight="700">
                <Icon as={FaUniversity} mr={1} boxSize={2.5} />
                System Admin
              </Badge>
            )}
          </Flex>
        </Box>

        {/* Summary KPI Cards */}
        <Flex gap={4} mb={6} flexWrap="wrap">
          <Box flex="1" minW="200px" bg="white" p={5} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#10B981">
                TOTAL COLLECTED
              </Text>
              <Flex w="32px" h="32px" borderRadius="lg" bg="#ECFDF5" color="#10B981" align="center" justify="center">
                <Icon as={FaCheckCircle} boxSize={3.5} />
              </Flex>
            </Flex>
            <Text fontSize="24px" fontWeight="900" color="#10B981">
              ₦{(summary?.totalAmount || 0).toLocaleString()}
            </Text>
            <Text fontSize="11px" color="#059669" mt={1}>
              For the selected filters
            </Text>
          </Box>

          <Box flex="1" minW="200px" bg="white" p={5} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#4338CA">
                PAYMENTS RECORDED
              </Text>
              <Flex w="32px" h="32px" borderRadius="lg" bg="#EEF2FF" color="#4338CA" align="center" justify="center">
                <Icon as={FaMoneyBillWave} boxSize={3.5} />
              </Flex>
            </Flex>
            <Text fontSize="24px" fontWeight="900" color="#0F172A">
              {summary?.totalPayments || 0}
            </Text>
            <Text fontSize="11px" color="#64748B" mt={1}>
              Transactions in period
            </Text>
          </Box>

          <Box flex="1" minW="200px" bg="white" p={5} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#6D28D9">
                STUDENTS WHO PAID
              </Text>
              <Flex w="32px" h="32px" borderRadius="lg" bg="#F3E8FF" color="#6D28D9" align="center" justify="center">
                <Icon as={FaUsers} boxSize={3.5} />
              </Flex>
            </Flex>
            <Text fontSize="24px" fontWeight="900" color="#0F172A">
              {summary?.uniqueStudents || 0}
            </Text>
            <Text fontSize="11px" color="#7C3AED" mt={1}>
              Unique students
            </Text>
          </Box>

          <Box flex="1" minW="200px" bg="white" p={5} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#B45309">
                AVERAGE PAYMENT
              </Text>
              <Flex w="32px" h="32px" borderRadius="lg" bg="#FEF3C7" color="#B45309" align="center" justify="center">
                <Icon as={FaMoneyBillWave} boxSize={3.5} />
              </Flex>
            </Flex>
            <Text fontSize="24px" fontWeight="900" color="#0F172A">
              ₦{(summary?.averagePayment || 0).toLocaleString()}
            </Text>
            <Text fontSize="11px" color="#B45309" mt={1}>
              Per transaction
            </Text>
          </Box>
        </Flex>

        {/* Daily Breakdown */}
        {dailyTotals.length > 0 && (
          <Box
            bg="white"
            p={5}
            borderRadius="2xl"
            border="1px solid #E2E8F0"
            mb={6}
            boxShadow="0 4px 16px rgba(0,0,0,0.02)"
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontSize="15px" fontWeight="800" color="#0F172A">
                Daily Collections
              </Text>
              <Text fontSize="12px" color="#64748B">
                Tap a day to filter
              </Text>
            </Flex>
            <Flex gap={3} flexWrap="wrap">
              {dailyTotals.map((d) => (
                <Box
                  key={d.date}
                  cursor="pointer"
                  bg={filterMode === "day" && day === d.date ? "#EEF2FF" : "#F8FAFC"}
                  border="1px solid"
                  borderColor={filterMode === "day" && day === d.date ? "#4338CA" : "#E2E8F0"}
                  borderRadius="xl"
                  px={4}
                  py={3}
                  minW="150px"
                  _hover={{ borderColor: "#4338CA" }}
                  transition="all 0.15s"
                  onClick={() => handleDayClick(d.date)}
                >
                  <Text fontSize="11px" fontWeight="700" color="#64748B">
                    {formatDay(d.date)}
                  </Text>
                  <Text fontSize="18px" fontWeight="900" color="#0F172A" mt={0.5}>
                    ₦{d.total.toLocaleString()}
                  </Text>
                  <Text fontSize="11px" color="#4338CA" fontWeight="700">
                    {d.count} payment{d.count === 1 ? "" : "s"}
                  </Text>
                </Box>
              ))}
            </Flex>
          </Box>
        )}

        {/* Payments Table */}
        <Box
          bg="white"
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          overflow="hidden"
          boxShadow="0 4px 16px rgba(0,0,0,0.02)"
          mb={8}
        >
          <Flex
            px={5}
            py={4}
            borderBottom="1px solid #E2E8F0"
            justify="space-between"
            align="center"
            bg="#F8FAFC"
          >
            <Text fontSize="15px" fontWeight="800" color="#0F172A">
              Payment Ledger
            </Text>
            <Badge bg="#EEF2FF" color="#4338CA" px={3} py={1} borderRadius="full" fontSize="11px" fontWeight="700">
              {payments.length} record{payments.length === 1 ? "" : "s"}
            </Badge>
          </Flex>

          {loading ? (
            <Flex py={16} justify="center" align="center" gap={3}>
              <Spinner color="#4338CA" />
              <Text fontSize="13px" color="#64748B">
                Loading payments...
              </Text>
            </Flex>
          ) : (
            <Box overflowX="auto">
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>DATE</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>STUDENT</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>SCHOOL ID</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>CLASS</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>AMOUNT PAID</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>METHOD</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>RECEIPT NO</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length ? (
                    payments.map((p) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "14px 16px", fontSize: "12px", color: "#64748B", fontWeight: "600" }}>
                          {formatDateTime(p.paidAt)}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <Text fontWeight="800" fontSize="14px" color="#0F172A">
                            {p.studentName}
                          </Text>
                          {(p.term || p.session) && (
                            <Text fontSize="11px" color="#94A3B8">
                              {[p.term, p.session].filter(Boolean).join(" • ")}
                            </Text>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "12px", color: "#4338CA", fontWeight: "700" }}>
                          {p.studentCode}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "13px", color: "#64748B", fontWeight: "600" }}>
                          {p.classArmName}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "14px", color: "#10B981", fontWeight: "900" }}>
                          ₦{p.amount.toLocaleString()}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <Badge bg="#EEF2FF" color="#4338CA" px={2.5} py={0.5} borderRadius="md" fontSize="11px" fontWeight="700">
                            {p.paymentMethod}
                          </Badge>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "11px", color: "#64748B" }}>
                          {p.receiptNumber || "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ padding: "36px", textAlign: "center", color: "#94A3B8" }}>
                        No payments found for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>
          )}
        </Box>

        {/* Per-student totals */}
        {studentTotals.length > 0 && (
          <Box
            bg="white"
            p={5}
            borderRadius="2xl"
            border="1px solid #E2E8F0"
            boxShadow="0 4px 16px rgba(0,0,0,0.02)"
          >
            <Text fontSize="15px" fontWeight="800" color="#0F172A" mb={4}>
              Total Paid Per Student
            </Text>
            <Flex gap={3} flexWrap="wrap">
              {studentTotals.slice(0, 24).map((s) => (
                <Box
                  key={s.studentId}
                  bg="#F8FAFC"
                  border="1px solid #E2E8F0"
                  borderRadius="xl"
                  px={4}
                  py={3}
                  minW="200px"
                >
                  <Text fontSize="13px" fontWeight="800" color="#0F172A">
                    {s.studentName}
                  </Text>
                  <Text fontSize="11px" color="#4338CA" fontWeight="700">
                    {s.studentCode}
                  </Text>
                  <Text fontSize="16px" fontWeight="900" color="#10B981" mt={1}>
                    ₦{s.total.toLocaleString()}
                  </Text>
                  <Text fontSize="11px" color="#64748B">
                    {s.count} payment{s.count === 1 ? "" : "s"}
                  </Text>
                </Box>
              ))}
            </Flex>
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}
