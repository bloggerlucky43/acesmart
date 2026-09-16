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
  FaHistory,
  FaSyncAlt,
  FaClock,
  FaUserCheck,
  FaSignOutAlt,
  FaSearch,
  FaCalendarDay,
} from "react-icons/fa";
import {
  getStaffAttendanceHistoryApi,
  getStaffListApi,
} from "../../api-endpoint/sms/smsEndpoints";
import { useAuth } from "../../libs/AuthProvider";
import { toaster } from "../../components/ui/toaster";
import DashboardLayout from "../../constants/dashboardlayout";

// Attendance rows use the school's West Africa Time (fixed UTC+1) date, so the
// default range is derived from the UTC epoch to match the server exactly
// instead of depending on the browser's timezone database.
const WAT_OFFSET_MS = 60 * 60 * 1000;

const lagosDateString = (date = new Date()) =>
  new Date(date.getTime() + WAT_OFFSET_MS).toISOString().slice(0, 10);

const getDefaultRange = () => {
  const endDate = lagosDateString(new Date());
  const start = new Date(`${endDate}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - 29);
  return { startDate: start.toISOString().slice(0, 10), endDate };
};

const formatTimeLabel = (value) => {
  if (!value) return null;
  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return String(value);

  const hours24 = parseInt(match[1], 10);
  const minutes = match[2];
  const meridiem = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${minutes} ${meridiem}`;
};

const statusPill = (status, punctualityEnabled) => {
  if (status === "late") return { bg: "#FEF3C7", color: "#92400E", label: "Late" };
  if (status === "excused") return { bg: "#E0E7FF", color: "#3730A3", label: "Excused" };
  if (status === "absent") return { bg: "#F1F5F9", color: "#64748B", label: "Absent" };
  return {
    bg: "#ECFDF5",
    color: "#065F46",
    label: punctualityEnabled ? "On Time" : "Signed In",
  };
};

export default function StaffAttendanceHistory() {
  const { user } = useAuth();
  const isAdmin =
    user?.role === "institution_admin" ||
    user?.role === "admin" ||
    user?.role === "institution";

  const defaultRange = getDefaultRange();
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [staffId, setStaffId] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("records");

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await getStaffAttendanceHistoryApi({ startDate, endDate, staffId });
      if (res.success) setHistory(res.data);
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Failed to load attendance history",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    getStaffListApi()
      .then((res) => {
        if (res.success) setStaffList(res.data);
      })
      .catch(() => null);
  }, [isAdmin]);

  const punctualityEnabled = Boolean(history?.punctualityEnabled);
  const startTimeLabel = formatTimeLabel(history?.schoolStartTime);
  const closingTimeLabel = formatTimeLabel(history?.schoolClosingTime);
  const records = history?.records || [];
  const staffSummaries = history?.staffSummaries || [];

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
          mb={6}
        >
          <Flex align="center" gap={3}>
            <Flex
              w="44px"
              h="44px"
              borderRadius="xl"
              bg="#EEF2FF"
              color="#4338CA"
              align="center"
              justify="center"
            >
              <Icon as={FaHistory} boxSize={5} />
            </Flex>
            <Box>
              <Text fontSize="24px" fontWeight="900" color="#0F172A" letterSpacing="-0.5px">
                Staff Attendance History
              </Text>
              <Text fontSize="13px" color="#64748B">
                {isAdmin
                  ? "Full clock-in and clock-out log for every staff member"
                  : "Your daily clock-in and clock-out log"}
              </Text>
            </Box>
          </Flex>

          <Badge
            bg="#F8FAFC"
            color="#64748B"
            border="1px solid #E2E8F0"
            px={3.5}
            py={1.5}
            borderRadius="xl"
            fontSize="11px"
            fontWeight="700"
          >
            {punctualityEnabled && startTimeLabel
              ? `Window: ${startTimeLabel}${closingTimeLabel ? ` – ${closingTimeLabel}` : ""}`
              : "Late flag disabled"}
          </Badge>
        </Flex>

        {/* Filters */}
        <Box
          bg="white"
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          p={5}
          mb={6}
          boxShadow="0 4px 16px rgba(0,0,0,0.02)"
        >
          <Flex direction={{ base: "column", lg: "row" }} gap={4} align={{ base: "stretch", lg: "flex-end" }}>
            <Box flex={1}>
              <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                FROM DATE
              </Text>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                h="42px"
                borderRadius="xl"
                fontSize="13px"
              />
            </Box>

            <Box flex={1}>
              <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                TO DATE
              </Text>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                h="42px"
                borderRadius="xl"
                fontSize="13px"
              />
            </Box>

            {isAdmin && (
              <Box flex={1}>
                <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                  STAFF MEMBER
                </Text>
                <select
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  style={{
                    width: "100%",
                    height: "42px",
                    padding: "0 12px",
                    borderRadius: "12px",
                    border: "1px solid #CBD5E1",
                    fontSize: "13px",
                    fontWeight: "600",
                    background: "#F8FAFC",
                  }}
                >
                  <option value="">All Staff Members</option>
                  {staffList.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} ({staff.staffIdNumber})
                    </option>
                  ))}
                </select>
              </Box>
            )}

            <Button
              h="42px"
              px={5}
              bg="#4338CA"
              color="white"
              borderRadius="xl"
              fontWeight="700"
              fontSize="13px"
              loading={loading}
              onClick={loadHistory}
            >
              <Icon as={FaSearch} mr={2} boxSize={3.5} />
              Apply Filters
            </Button>
          </Flex>
        </Box>

        {/* Summary Stats */}
        <Flex gap={4} mb={6} flexWrap="wrap">
          <Box flex="1" minW="150px" bg="white" p={4} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex align="center" gap={2} mb={1}>
              <Icon as={FaCalendarDay} color="#64748B" boxSize={3} />
              <Text fontSize="12px" color="#64748B" fontWeight="600">
                Days Covered
              </Text>
            </Flex>
            <Text fontSize="24px" fontWeight="900" color="#0F172A">
              {history?.daysCovered || 0}
            </Text>
          </Box>

          <Box flex="1" minW="150px" bg="white" p={4} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex align="center" gap={2} mb={1}>
              <Icon as={FaUserCheck} color="#10B981" boxSize={3} />
              <Text fontSize="12px" color="#10B981" fontWeight="600">
                Total Entries
              </Text>
            </Flex>
            <Text fontSize="24px" fontWeight="900" color="#10B981">
              {history?.totalRecords || 0}
            </Text>
          </Box>

          <Box flex="1" minW="150px" bg="white" p={4} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex align="center" gap={2} mb={1}>
              <Icon as={FaClock} color="#F59E0B" boxSize={3} />
              <Text fontSize="12px" color="#F59E0B" fontWeight="600">
                Late Arrivals
              </Text>
            </Flex>
            <Text fontSize="24px" fontWeight="900" color="#F59E0B">
              {history?.lateCount || 0}
            </Text>
          </Box>

          <Box flex="1" minW="150px" bg="white" p={4} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex align="center" gap={2} mb={1}>
              <Icon as={FaSignOutAlt} color="#4338CA" boxSize={3} />
              <Text fontSize="12px" color="#4338CA" fontWeight="600">
                Clock-Outs Logged
              </Text>
            </Flex>
            <Text fontSize="24px" fontWeight="900" color="#4338CA">
              {history?.completedCount || 0}
            </Text>
          </Box>
        </Flex>

        {/* View Switcher */}
        <Flex p={1} borderRadius="xl" bg="#F1F5F9" mb={5} gap={1} maxW="420px">
          <Button
            flex={1}
            size="sm"
            borderRadius="lg"
            bg={view === "records" ? "white" : "transparent"}
            color={view === "records" ? "#0F172A" : "#64748B"}
            fontWeight="700"
            boxShadow={view === "records" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"}
            _hover={{ bg: view === "records" ? "white" : "transparent" }}
            onClick={() => setView("records")}
          >
            <Icon as={FaHistory} mr={2} boxSize={3} />
            Daily Log
          </Button>
          <Button
            flex={1}
            size="sm"
            borderRadius="lg"
            bg={view === "summary" ? "white" : "transparent"}
            color={view === "summary" ? "#0F172A" : "#64748B"}
            fontWeight="700"
            boxShadow={view === "summary" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"}
            _hover={{ bg: view === "summary" ? "white" : "transparent" }}
            onClick={() => setView("summary")}
          >
            <Icon as={FaUserCheck} mr={2} boxSize={3} />
            Per Staff Summary
          </Button>
        </Flex>

        {/* Records Table */}
        <Box
          bg="white"
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          overflow="hidden"
          boxShadow="0 4px 16px rgba(0,0,0,0.02)"
        >
          <Flex p={5} borderBottom="1px solid #E2E8F0" justify="space-between" align="center" gap={3}>
            <Box>
              <Text fontSize="16px" fontWeight="800" color="#0F172A">
                {view === "records" ? "Daily Attendance Log" : "Per Staff Summary"}
              </Text>
              <Text fontSize="12px" color="#64748B">
                {startDate || "—"} to {endDate || "—"}
                {history?.totalRecords ? ` • ${history.totalRecords} record(s)` : ""}
              </Text>
              {history?.truncated && (
                <Text fontSize="11px" color="#B45309" fontWeight="700" mt={0.5}>
                  Showing the most recent {history.pageSize} of {history.totalRecords} records — narrow the date
                  range to see the full log.
                </Text>
              )}
            </Box>
            <Button
              variant="outline"
              size="sm"
              borderRadius="xl"
              onClick={loadHistory}
              loading={loading}
            >
              <Icon as={FaSyncAlt} mr={2} boxSize={3} />
              Refresh
            </Button>
          </Flex>

          <Box overflowX="auto">
            {view === "records" ? (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>DATE</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>STAFF MEMBER</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>CLOCK-IN</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>CLOCK-OUT</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>STATUS</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>METHOD</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length ? (
                    records.map((item) => {
                      const pill = statusPill(item.status, punctualityEnabled);
                      return (
                        <tr key={item.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                          <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: "700", color: "#0F172A" }}>
                            {item.date}
                          </td>
                          <td style={{ padding: "14px 16px", fontWeight: "700", color: "#0F172A", fontSize: "13px" }}>
                            {item.name}
                            <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "normal" }}>
                              {item.staffIdNumber}
                              {item.designation ? ` • ${item.designation}` : ""}
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: "600", color: "#047857" }}>
                            {item.clockInTime}
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: "600", color: "#4338CA" }}>
                            {item.clockOutTime || "Not clocked out"}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "3px 10px",
                                borderRadius: "999px",
                                fontSize: "11px",
                                fontWeight: "700",
                                background: pill.bg,
                                color: pill.color,
                              }}
                            >
                              {pill.label}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "12px", color: "#64748B" }}>
                            {item.method === "qr_scan" ? "QR Scan" : item.method === "manual_pin" ? "PIN Code" : "-"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#94A3B8" }}>
                        {loading
                          ? "Loading attendance history..."
                          : "No attendance records found for the selected period."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>STAFF MEMBER</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>DAYS RECORDED</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>LATE</th>
                    <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>CLOCKED OUT</th>
                  </tr>
                </thead>
                <tbody>
                  {staffSummaries.length ? (
                    staffSummaries.map((staff) => (
                      <tr key={staff.staffId} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "14px 16px", fontWeight: "700", color: "#0F172A", fontSize: "13px" }}>
                          {staff.name}
                          <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "normal" }}>
                            {staff.staffIdNumber}
                            {staff.designation ? ` • ${staff.designation}` : ""}
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: "700", color: "#0F172A" }}>
                          {staff.daysRecorded}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: "700", color: "#F59E0B" }}>
                          {staff.lateCount}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: "700", color: "#4338CA" }}>
                          {staff.completedDays}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "#94A3B8" }}>
                        {loading ? "Loading summary..." : "No staff attendance summary available for this period."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
