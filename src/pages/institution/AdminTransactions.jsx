import { useEffect, useState } from "react";
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
  FaUniversity,
  FaSearch,
  FaSyncAlt,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { getInstitutionTransactionsApi } from "../../api-endpoint/sms/smsEndpoints";
import { useAuth } from "../../libs/AuthProvider";
import { toaster } from "../../components/ui/toaster";
import DashboardLayout from "../../constants/dashboardlayout";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "success", label: "Successful" },
  { value: "failed", label: "Failed" },
  { value: "abandoned", label: "Abandoned" },
  { value: "refunded", label: "Refunded" },
];

const PURPOSE_OPTIONS = [
  { value: "all", label: "All Purposes" },
  { value: "school_fee", label: "School Fee" },
  { value: "result_checker", label: "Result Checker" },
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

const statusColor = (status) => {
  switch (status) {
    case "success":
      return { bg: "#ECFDF5", color: "#065F46" };
    case "pending":
      return { bg: "#FEF3C7", color: "#92400E" };
    case "failed":
      return { bg: "#FEF2F2", color: "#991B1B" };
    default:
      return { bg: "#F1F5F9", color: "#475569" };
  }
};

export default function AdminTransactions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("all");
  const [purpose, setPurpose] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const institutionName = user?.institution?.name || "Institution";

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {};
      const from = toLocalISO(fromDate, false);
      const to = toLocalISO(toDate, true);
      if (from) params.from = from;
      if (to) params.to = to;
      if (status && status !== "all") params.status = status;
      if (purpose && purpose !== "all") params.purpose = purpose;
      if (search) params.search = search;

      const res = await getInstitutionTransactionsApi(params);
      if (res?.success) {
        setTransactions(res.data.transactions || []);
        setSummary(res.data.summary || null);
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Failed to load transactions",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, status, purpose, search]);

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setStatus("all");
    setPurpose("all");
    setSearchInput("");
    setSearch("");
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
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          gap={4}
          mb={8}
        >
          <Box>
            <Text fontSize="24px" fontWeight="900" color="#0F172A" letterSpacing="-0.5px">
              Online Transactions
            </Text>
            <Text fontSize="13px" color="#64748B">
              {institutionName} • Paystack collections and failed/abandoned payments
            </Text>
          </Box>
          <Button
            bg="#0F172A"
            color="white"
            size="sm"
            borderRadius="xl"
            fontWeight="700"
            onClick={fetchTransactions}
            _hover={{ bg: "#1E293B" }}
          >
            <Icon as={FaSyncAlt} mr={2} boxSize={3.5} />
            Refresh
          </Button>
        </Flex>

        {/* Filters */}
        <Box bg="white" p={5} borderRadius="2xl" border="1px solid #E2E8F0" mb={6}>
          <Flex gap={4} flexWrap="wrap" align="flex-end">
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
            <Box>
              <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
                STATUS
              </Text>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ height: 40, padding: "0 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, background: "#F8FAFC" }}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Box>
            <Box>
              <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
                PURPOSE
              </Text>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                style={{ height: 40, padding: "0 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, background: "#F8FAFC" }}
              >
                {PURPOSE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Box>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearch(searchInput.trim());
              }}
            >
              <Box>
                <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
                  SEARCH STUDENT / REFERENCE
                </Text>
                <Flex gap={2}>
                  <Input
                    placeholder="e.g. Adebayo or FEE-KINGS-…"
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
            <Button size="sm" h="40px" variant="ghost" color="#64748B" onClick={clearFilters}>
              Clear Filters
            </Button>
          </Flex>
        </Box>

        {/* KPI cards: school collections separated from platform fees */}
        <Flex gap={4} mb={6} flexWrap="wrap">
          <Box flex="1" minW="210px" bg="white" p={5} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#10B981">
                SCHOOL COLLECTIONS
              </Text>
              <Flex w="32px" h="32px" borderRadius="lg" bg="#ECFDF5" color="#10B981" align="center" justify="center">
                <Icon as={FaCheckCircle} boxSize={3.5} />
              </Flex>
            </Flex>
            <Text fontSize="24px" fontWeight="900" color="#10B981">
              ₦{(summary?.totalSchoolCollections || 0).toLocaleString()}
            </Text>
            <Text fontSize="11px" color="#059669" mt={1}>
              Credited to invoices (net to school)
            </Text>
          </Box>

          <Box flex="1" minW="210px" bg="white" p={5} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#6D28D9">
                PLATFORM FEES
              </Text>
              <Flex w="32px" h="32px" borderRadius="lg" bg="#F3E8FF" color="#6D28D9" align="center" justify="center">
                <Icon as={FaUniversity} boxSize={3.5} />
              </Flex>
            </Flex>
            <Text fontSize="24px" fontWeight="900" color="#0F172A">
              ₦{(summary?.totalPlatformFees || 0).toLocaleString()}
            </Text>
            <Text fontSize="11px" color="#7C3AED" mt={1}>
              Not counted as school revenue
            </Text>
          </Box>

          <Box flex="1" minW="210px" bg="white" p={5} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#4338CA">
                GROSS CHARGED
              </Text>
              <Flex w="32px" h="32px" borderRadius="lg" bg="#EEF2FF" color="#4338CA" align="center" justify="center">
                <Icon as={FaMoneyBillWave} boxSize={3.5} />
              </Flex>
            </Flex>
            <Text fontSize="24px" fontWeight="900" color="#0F172A">
              ₦{(summary?.totalGross || 0).toLocaleString()}
            </Text>
            <Text fontSize="11px" color="#64748B" mt={1}>
              {summary?.totalTransactions || 0} transaction(s)
            </Text>
          </Box>

          <Box flex="1" minW="210px" bg="white" p={5} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#B45309">
                FAILED / PENDING
              </Text>
              <Flex w="32px" h="32px" borderRadius="lg" bg="#FEF3C7" color="#B45309" align="center" justify="center">
                <Icon as={FaExclamationTriangle} boxSize={3.5} />
              </Flex>
            </Flex>
            <Text fontSize="24px" fontWeight="900" color="#0F172A">
              {(summary?.statusCounts?.failed || 0) + (summary?.statusCounts?.pending || 0) + (summary?.statusCounts?.abandoned || 0)}
            </Text>
            <Text fontSize="11px" color="#B45309" mt={1}>
              Require follow-up
            </Text>
          </Box>
        </Flex>

        {/* Table */}
        <Box bg="white" borderRadius="2xl" border="1px solid #E2E8F0" overflow="hidden" mb={8}>
          <Flex px={5} py={4} borderBottom="1px solid #E2E8F0" justify="space-between" align="center" bg="#F8FAFC">
            <Text fontSize="15px" fontWeight="800" color="#0F172A">
              Transaction Ledger
            </Text>
            <Badge bg="#EEF2FF" color="#4338CA" px={3} py={1} borderRadius="full" fontSize="11px" fontWeight="700">
              {transactions.length} record{transactions.length === 1 ? "" : "s"}
            </Badge>
          </Flex>

          {loading ? (
            <Flex py={16} justify="center" align="center" gap={3}>
              <Spinner color="#4338CA" />
              <Text fontSize="13px" color="#64748B">
                Loading transactions…
              </Text>
            </Flex>
          ) : (
            <Box overflowX="auto">
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>DATE</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>REFERENCE</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>STUDENT</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>PURPOSE</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>BASE (SCHOOL)</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>PLATFORM FEE</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>GROSS</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length ? (
                    transactions.map((tx) => {
                      const sc = statusColor(tx.status);
                      return (
                        <tr key={tx.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                          <td style={{ padding: "14px 16px", fontSize: "12px", color: "#64748B", fontWeight: "600" }}>
                            {formatDateTime(tx.paidAt || tx.createdAt)}
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "11px", color: "#0F172A", fontFamily: "monospace" }}>
                            {tx.reference}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <Text fontWeight="800" fontSize="13px" color="#0F172A">
                              {tx.studentName}
                            </Text>
                            <Text fontSize="11px" color="#94A3B8">
                              {tx.studentCode}
                            </Text>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "12px", color: "#475569", fontWeight: "600" }}>
                            {tx.purpose === "result_checker" ? "Result Checker" : "School Fee"}
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "13px", color: "#10B981", fontWeight: "800" }}>
                            ₦{Number(tx.baseAmount || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "13px", color: "#6D28D9", fontWeight: "700" }}>
                            ₦{Number(tx.platformFee || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "13px", color: "#0F172A", fontWeight: "800" }}>
                            ₦{Number(tx.grossAmount || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <Badge bg={sc.bg} color={sc.color} px={2.5} py={0.5} borderRadius="md" fontSize="11px" fontWeight="700">
                              {tx.status}
                            </Badge>
                            {tx.failureReason && (
                              <Text fontSize="10px" color="#EF4444" mt={1} maxW="180px">
                                {tx.failureReason}
                              </Text>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ padding: "36px", textAlign: "center", color: "#94A3B8" }}>
                        No transactions found for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>
          )}
        </Box>
      </Box>
    </DashboardLayout>
  );
}
