import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
  Input,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FaCreditCard,
  FaSearch,
  FaTimes,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
} from "react-icons/fa";
import SuperAdminLayout from "./SuperAdminLayout";
import { getSuperAdminTransactionsApi } from "../../api-endpoint/sms/superAdminEndpoints";
import { toaster } from "../../components/ui/toaster";

export default function SuperAdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await getSuperAdminTransactionsApi({
        search: searchQuery,
        purpose: selectedPurpose,
        status: selectedStatus,
        limit: 100,
      });
      if (res.success) {
        setTransactions(res.data.transactions || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error("Load transactions error:", err);
      toaster.create({
        title: "Failed to load transactions",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [selectedPurpose, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadTransactions();
  };

  return (
    <SuperAdminLayout>
      {/* Header */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "stretch", sm: "center" }}
        gap={4}
        mb={6}
      >
        <Box>
          <Flex align="center" gap={2}>
            <Text fontSize="24px" fontWeight="900" color="white" letterSpacing="-0.5px">
              Global Financials & Transaction Ledger
            </Text>
            <Badge bg="#1E293B" color="#6EE7B7" fontSize="11px" fontWeight="800" px={2.5} py={0.5} borderRadius="full">
              {total} Total
            </Badge>
          </Flex>
          <Text fontSize="13px" color="#94A3B8" mt={0.5}>
            Universal audit of all student school fees, 10% result-checker tokens, and platform cuts.
          </Text>
        </Box>
      </Flex>

      {/* Filter Bar */}
      <Box
        bg="#111827"
        p={4}
        borderRadius="2xl"
        border="1px solid #1F2937"
        mb={6}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={3}
          align="center"
          justify="space-between"
        >
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} style={{ flex: 1, width: "100%" }}>
            <Flex
              bg="#1E293B"
              border="1px solid #374151"
              borderRadius="xl"
              px={3}
              h="40px"
              align="center"
              gap={2}
            >
              <Icon as={FaSearch} color="#94A3B8" boxSize={3.5} />
              <Input
                placeholder="Search reference, customer email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="unstyled"
                fontSize="13px"
                color="white"
                _placeholder={{ color: "#64748B" }}
              />
              {searchQuery && (
                <Button
                  size="xs"
                  variant="ghost"
                  color="#94A3B8"
                  p={0}
                  onClick={() => {
                    setSearchQuery("");
                    loadTransactions();
                  }}
                >
                  <Icon as={FaTimes} boxSize={2.5} />
                </Button>
              )}
              <Button
                size="xs"
                bg="#10B981"
                color="white"
                px={3}
                h="28px"
                borderRadius="lg"
                fontWeight="800"
                type="submit"
              >
                Search
              </Button>
            </Flex>
          </form>

          {/* Purpose & Status Filters */}
          <Flex align="center" gap={2} w={{ base: "100%", md: "auto" }} flexWrap="wrap">
            <select
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value)}
              style={{
                height: "40px",
                padding: "0 12px",
                borderRadius: "12px",
                background: "#1E293B",
                border: "1px solid #374151",
                color: "white",
                fontSize: "13px",
                fontWeight: "700",
                outline: "none",
              }}
            >
              <option value="all">All Purposes</option>
              <option value="school_fee">School Fees</option>
              <option value="result_checker">Result Checker (10% Cut)</option>
              <option value="subscription">SaaS Subscription</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                height: "40px",
                padding: "0 12px",
                borderRadius: "12px",
                background: "#1E293B",
                border: "1px solid #374151",
                color: "white",
                fontSize: "13px",
                fontWeight: "700",
                outline: "none",
              }}
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </Flex>
        </Flex>
      </Box>

      {/* Transactions Table */}
      <Box
        bg="#111827"
        borderRadius="2xl"
        border="1px solid #1F2937"
        overflow="hidden"
        boxShadow="0 4px 16px rgba(0,0,0,0.2)"
        mb={8}
      >
        <Box overflowX="auto">
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#1F2937", borderBottom: "1px solid #374151" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>Date</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>Reference</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>School</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>Purpose</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>Customer</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", textAlign: "right" }}>Total (₦)</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", textAlign: "right" }}>Platform Cut (₦)</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>
                    Loading transactions ledger...
                  </td>
                </tr>
              ) : transactions.length ? (
                transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    style={{ borderBottom: "1px solid #1F2937", transition: "background 0.15s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#1E293B")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#94A3B8", whiteSpace: "nowrap" }}>
                      {new Date(tx.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "700", color: "#6EE7B7" }}>
                      {tx.reference}
                    </td>

                    <td style={{ padding: "12px 16px" }}>
                      <Text fontSize="13px" fontWeight="800" color="white">
                        {tx.Institution?.name || "AceSmart Direct"}
                      </Text>
                      {tx.Institution?.code && (
                        <Text fontSize="10px" color="#94A3B8">Code: {tx.Institution.code}</Text>
                      )}
                    </td>

                    <td style={{ padding: "12px 16px" }}>
                      <Badge
                        bg={tx.purpose === "result_checker" ? "#312E81" : "#1E293B"}
                        color={tx.purpose === "result_checker" ? "#A5B4FC" : "#94A3B8"}
                        border="1px solid #374151"
                        px={2}
                        py={0.5}
                        borderRadius="md"
                        fontSize="10px"
                        fontWeight="800"
                      >
                        {tx.purpose === "result_checker" ? "Result Token (10%)" : tx.purpose}
                      </Badge>
                    </td>

                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#94A3B8" }}>
                      {tx.payerEmail || "-"}
                    </td>

                    <td style={{ padding: "12px 16px", textAlign: "right", fontSize: "13px", fontWeight: "900", color: "white" }}>
                      ₦{Number(tx.grossAmount || 0).toLocaleString()}
                    </td>

                    <td style={{ padding: "12px 16px", textAlign: "right", fontSize: "13px", fontWeight: "900", color: "#F59E0B" }}>
                      ₦{Number(tx.platformFee || 0).toLocaleString()}
                    </td>

                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      {tx.status === "success" ? (
                        <Badge bg="#064E3B" color="#6EE7B7" border="1px solid #059669" px={2} py={0.5} borderRadius="full" fontSize="10px" fontWeight="800">
                          <Icon as={FaCheckCircle} mr={1} boxSize={2} /> Success
                        </Badge>
                      ) : tx.status === "pending" ? (
                        <Badge bg="#451A03" color="#FCD34D" border="1px solid #D97706" px={2} py={0.5} borderRadius="full" fontSize="10px" fontWeight="800">
                          <Icon as={FaHourglassHalf} mr={1} boxSize={2} /> Pending
                        </Badge>
                      ) : (
                        <Badge bg="#450A0A" color="#FCA5A5" border="1px solid #DC2626" px={2} py={0.5} borderRadius="full" fontSize="10px" fontWeight="800">
                          <Icon as={FaTimesCircle} mr={1} boxSize={2} /> Failed
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: "36px", textAlign: "center", color: "#64748B" }}>
                    No transactions matching this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      </Box>
    </SuperAdminLayout>
  );
}
