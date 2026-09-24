import { useState, useEffect, useMemo } from "react";
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
  FaSearch,
  FaTimes,
  FaDownload,
  FaFileCsv,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import { getClassAttendanceAnalyticsApi } from "../../../../api-endpoint/sms/smsEndpoints";
import { toaster } from "../../../../components/ui/toaster";

export default function TermlyAttendanceSummary({
  selectedClassId,
  classes,
  onSelectClassId,
}) {
  const todayStr = new Date().toISOString().split("T")[0];
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [selectedTerm, setSelectedTerm] = useState("First Term");
  const [selectedSession, setSelectedSession] = useState("2025/2026");
  const [startDate, setStartDate] = useState(ninetyDaysAgo);
  const [endDate, setEndDate] = useState(todayStr);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  // Quick Date Range Presets
  const applyPreset = (preset) => {
    const now = new Date();
    const end = now.toISOString().split("T")[0];
    setEndDate(end);

    if (preset === "30") {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      setStartDate(start);
    } else if (preset === "90") {
      const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      setStartDate(start);
    } else if (preset === "120") {
      const start = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      setStartDate(start);
    }
  };

  // Fetch Termly Analytics
  useEffect(() => {
    if (!selectedClassId) return;

    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await getClassAttendanceAnalyticsApi(selectedClassId, {
          period: "termly",
          startDate,
          endDate,
          term: selectedTerm,
          session: selectedSession,
        });
        if (isMounted && res?.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error("Load termly analytics error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedClassId, selectedTerm, selectedSession, startDate, endDate]);

  // Filter roster by search query
  const filteredRoster = useMemo(() => {
    if (!analytics?.roster) return [];
    if (!searchQuery.trim()) return analytics.roster;
    const q = searchQuery.toLowerCase().trim();
    return analytics.roster.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.studentCode && s.studentCode.toLowerCase().includes(q))
    );
  }, [analytics, searchQuery]);

  // Summary Metrics
  const summary = analytics?.summary || {
    totalEnrolled: 0,
    daysSchoolOpened: 0,
    totalSessionsOpened: 0,
    classAverageRate: 0,
    excellentCount: 0,
    warningCount: 0,
    criticalCount: 0,
  };

  const eligibleCount = useMemo(() => {
    if (!analytics?.roster) return 0;
    return analytics.roster.filter((s) => s.attendancePercentage >= 75).length;
  }, [analytics]);

  const atRiskCount = useMemo(() => {
    if (!analytics?.roster) return 0;
    return analytics.roster.filter((s) => s.attendancePercentage < 75).length;
  }, [analytics]);

  // Export to CSV
  const handleExportCsv = () => {
    if (!filteredRoster || filteredRoster.length === 0) {
      toaster.create({ title: "No data to export", type: "warning" });
      return;
    }

    const className = analytics?.classArm?.name || "Class";
    const totalSessions = summary.totalSessionsOpened || 0;
    const totalDays = summary.daysSchoolOpened || 0;

    const headers = [
      "No",
      "Student Admission No",
      "Student Full Name",
      "Gender",
      "Times School Opened (Sessions)",
      "Times Present (Sessions)",
      "Times Absent (Sessions)",
      "Times Late (Sessions)",
      "Days Present",
      "Total School Days",
      "Attendance Percentage",
      "Exam Eligibility (>=75%)",
    ];

    const rows = filteredRoster.map((s, idx) => [
      idx + 1,
      `"${s.studentCode || "-"}"`,
      `"${s.name}"`,
      `"${s.gender || "-"}"`,
      totalSessions,
      s.sessionsPresent,
      s.sessionsAbsent,
      s.sessionsLate,
      s.daysPresent,
      totalDays,
      `${s.attendancePercentage}%`,
      `"${s.attendancePercentage >= 75 ? "Eligible" : "Attendance Warning"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Termly_Attendance_${className.replace(/\s+/g, "_")}_${selectedTerm.replace(/\s+/g, "_")}_${todayStr}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toaster.create({
      title: "Attendance Register Exported!",
      description: "CSV downloaded successfully for Excel / Reports.",
      type: "success",
    });
  };

  const rateColor =
    summary.classAverageRate >= 90
      ? "#10B981"
      : summary.classAverageRate >= 75
      ? "#F59E0B"
      : "#EF4444";

  return (
    <Box>
      {/* Termly Controls Bar */}
      <Box
        bg="white"
        p={{ base: 3, md: 5 }}
        borderRadius="2xl"
        border="1px solid #E2E8F0"
        mb={{ base: 4, md: 5 }}
        boxShadow="0 2px 10px rgba(0,0,0,0.02)"
      >
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={3} mb={3}>
          {/* Class Selector */}
          <Box>
            <Text fontSize="11px" fontWeight="800" color="#64748B" mb={1}>
              SELECT CLASS
            </Text>
            <select
              value={selectedClassId}
              onChange={(e) => onSelectClassId(e.target.value)}
              style={{
                height: "38px",
                width: "100%",
                padding: "0 10px",
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
                fontSize: "13px",
                fontWeight: "700",
                color: "#0F172A",
                background: "#F8FAFC",
                outline: "none",
              }}
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.level || "Class"})
                </option>
              ))}
            </select>
          </Box>

          {/* Term Selector */}
          <Box>
            <Text fontSize="11px" fontWeight="800" color="#64748B" mb={1}>
              ACADEMIC TERM
            </Text>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              style={{
                height: "38px",
                width: "100%",
                padding: "0 10px",
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
                fontSize: "13px",
                fontWeight: "700",
                color: "#0F172A",
                background: "#F8FAFC",
                outline: "none",
              }}
            >
              <option value="First Term">First Term</option>
              <option value="Second Term">Second Term</option>
              <option value="Third Term">Third Term</option>
            </select>
          </Box>

          {/* Date Range: Start Date */}
          <Box>
            <Text fontSize="11px" fontWeight="800" color="#64748B" mb={1}>
              TERM START DATE
            </Text>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                height: "38px",
                width: "100%",
                padding: "0 10px",
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
                fontSize: "13px",
                fontWeight: "700",
                color: "#0F172A",
                background: "#F8FAFC",
                outline: "none",
              }}
            />
          </Box>

          {/* Date Range: End Date */}
          <Box>
            <Text fontSize="11px" fontWeight="800" color="#64748B" mb={1}>
              TERM END DATE
            </Text>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                height: "38px",
                width: "100%",
                padding: "0 10px",
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
                fontSize: "13px",
                fontWeight: "700",
                color: "#0F172A",
                background: "#F8FAFC",
                outline: "none",
              }}
            />
          </Box>
        </SimpleGrid>

        {/* Quick Range Buttons, Search & Export */}
        <Flex
          pt={3}
          borderTop="1px solid #F1F5F9"
          justify="space-between"
          align="center"
          direction={{ base: "column", md: "row" }}
          gap={3}
        >
          {/* Quick Range Presets */}
          <Flex align="center" gap={1.5} flexWrap="wrap">
            <Text fontSize="11px" fontWeight="800" color="#64748B" mr={1}>
              Quick Presets:
            </Text>
            <Button
              size="xs"
              bg="#F1F5F9"
              color="#475569"
              border="1px solid #E2E8F0"
              borderRadius="lg"
              fontWeight="700"
              h="28px"
              px={2.5}
              _hover={{ bg: "#E2E8F0" }}
              onClick={() => applyPreset("30")}
            >
              Last 30 Days
            </Button>
            <Button
              size="xs"
              bg="#EEF2FF"
              color="#4338CA"
              border="1px solid #C7D2FE"
              borderRadius="lg"
              fontWeight="800"
              h="28px"
              px={2.5}
              _hover={{ bg: "#E0E7FF" }}
              onClick={() => applyPreset("90")}
            >
              Current Term (90 Days)
            </Button>
            <Button
              size="xs"
              bg="#F1F5F9"
              color="#475569"
              border="1px solid #E2E8F0"
              borderRadius="lg"
              fontWeight="700"
              h="28px"
              px={2.5}
              _hover={{ bg: "#E2E8F0" }}
              onClick={() => applyPreset("120")}
            >
              Full Term (120 Days)
            </Button>
          </Flex>

          {/* Search & Export Action */}
          <Flex align="center" gap={2} w={{ base: "100%", md: "auto" }}>
            <Flex
              align="center"
              bg="#F8FAFC"
              border="1px solid #CBD5E1"
              borderRadius="10px"
              px={3}
              h="36px"
              flex="1"
              minW={{ base: "100%", md: "240px" }}
              gap={2}
            >
              <Icon as={FaSearch} color="#94A3B8" boxSize={3.5} />
              <Input
                placeholder="Search student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="unstyled"
                fontSize="12px"
                fontWeight="600"
                color="#0F172A"
              />
              {searchQuery && (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setSearchQuery("")}
                  color="#94A3B8"
                  p={0}
                  h="auto"
                >
                  <Icon as={FaTimes} boxSize={2.5} />
                </Button>
              )}
            </Flex>

            <Button
              size="sm"
              bg="#4338CA"
              color="white"
              borderRadius="xl"
              fontWeight="800"
              fontSize="12px"
              h="36px"
              px={3.5}
              _hover={{ opacity: 0.92 }}
              onClick={handleExportCsv}
              whiteSpace="nowrap"
            >
              <Icon as={FaDownload} mr={1.5} boxSize={3} />
              Export CSV
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Termly KPI Summary Cards */}
      <SimpleGrid columns={{ base: 2, sm: 2, md: 4 }} gap={2.5} mb={{ base: 4, md: 5 }}>
        {/* Class Term Average Rate */}
        <Box bg="white" p={3.5} borderRadius="xl" border="1px solid #E2E8F0">
          <Text fontSize="10px" fontWeight="800" color="#64748B" textTransform="uppercase">
            Class Term Average
          </Text>
          <Flex align="baseline" gap={2} mt={1}>
            <Text fontSize={{ base: "20px", md: "26px" }} fontWeight="900" color={rateColor}>
              {summary.classAverageRate}%
            </Text>
            <Badge
              bg={summary.classAverageRate >= 90 ? "#ECFDF5" : summary.classAverageRate >= 75 ? "#FEF3C7" : "#FEF2F2"}
              color={summary.classAverageRate >= 90 ? "#065F46" : summary.classAverageRate >= 75 ? "#92400E" : "#991B1B"}
              fontSize="9px"
              fontWeight="800"
              borderRadius="full"
              px={2}
            >
              {summary.classAverageRate >= 90 ? "Excellent" : summary.classAverageRate >= 75 ? "Satisfactory" : "Low"}
            </Badge>
          </Flex>
          <Box bg="#E2E8F0" h="4px" borderRadius="full" mt={2} overflow="hidden">
            <Box bg={rateColor} h="100%" w={`${Math.min(100, summary.classAverageRate)}%`} borderRadius="full" />
          </Box>
        </Box>

        {/* Total School Days Held */}
        <Box bg="white" p={3.5} borderRadius="xl" border="1px solid #E2E8F0">
          <Text fontSize="10px" fontWeight="800" color="#64748B" textTransform="uppercase">
            School Days Opened
          </Text>
          <Text fontSize={{ base: "20px", md: "26px" }} fontWeight="900" color="#0F172A" mt={1}>
            {summary.daysSchoolOpened} <Text as="span" fontSize="13px" fontWeight="700" color="#64748B">Days</Text>
          </Text>
          <Text fontSize="11px" color="#64748B" fontWeight="600" mt={1}>
            {summary.totalSessionsOpened} total sessions opened
          </Text>
        </Box>

        {/* Exam Eligible (>=75%) */}
        <Box bg="white" p={3.5} borderRadius="xl" border="1px solid #E2E8F0">
          <Text fontSize="10px" fontWeight="800" color="#10B981" textTransform="uppercase">
            Exam Eligible (&ge;75%)
          </Text>
          <Flex align="baseline" gap={1.5} mt={1}>
            <Text fontSize={{ base: "20px", md: "26px" }} fontWeight="900" color="#10B981">
              {eligibleCount}
            </Text>
            <Text fontSize="12px" fontWeight="700" color="#64748B">
              of {summary.totalEnrolled} students
            </Text>
          </Flex>
          <Text fontSize="11px" color="#059669" fontWeight="700" mt={1}>
            Qualified for Terminal Examination
          </Text>
        </Box>

        {/* Exam At-Risk (<75%) */}
        <Box bg="white" p={3.5} borderRadius="xl" border="1px solid #E2E8F0">
          <Text fontSize="10px" fontWeight="800" color="#EF4444" textTransform="uppercase">
            Below Threshold (&lt;75%)
          </Text>
          <Flex align="baseline" gap={1.5} mt={1}>
            <Text fontSize={{ base: "20px", md: "26px" }} fontWeight="900" color={atRiskCount > 0 ? "#EF4444" : "#10B981"}>
              {atRiskCount}
            </Text>
            <Text fontSize="12px" fontWeight="700" color="#64748B">
              students flagged
            </Text>
          </Flex>
          <Text fontSize="11px" color={atRiskCount > 0 ? "#DC2626" : "#059669"} fontWeight="700" mt={1}>
            {atRiskCount > 0 ? "Barred from exams without principal waiver" : "No truant students"}
          </Text>
        </Box>
      </SimpleGrid>

      {/* Info Banner */}
      <Flex
        bg="#EFF6FF"
        p={3}
        borderRadius="xl"
        border="1px solid #BFDBFE"
        align="center"
        justify="space-between"
        flexWrap="wrap"
        gap={2}
        mb={4}
      >
        <Flex align="center" gap={2}>
          <Icon as={FaCalendarAlt} color="#2563EB" boxSize={3.5} />
          <Text fontSize="12px" color="#1E40AF" fontWeight="700">
            Term Attendance Records Auto-Sync to Terminal Report Cards ("Times School Opened" & "Times Present").
          </Text>
        </Flex>

        <Text fontSize="11px" color="#1E40AF" fontWeight="600">
          Showing <b>{filteredRoster.length}</b> of <b>{analytics?.roster?.length || 0}</b> students
        </Text>
      </Flex>

      {/* ========================================================
          VIEW 1: MOBILE CARD LIST (< md)
         ======================================================== */}
      <Box display={{ base: "block", md: "none" }} mb={6}>
        {loading ? (
          <Box p={8} textAlign="center" bg="white" borderRadius="2xl" border="1px solid #E2E8F0" color="#64748B">
            Loading term attendance records...
          </Box>
        ) : filteredRoster.length ? (
          <Flex direction="column" gap={3}>
            {filteredRoster.map((student, idx) => {
              const pct = student.attendancePercentage;
              const color = pct >= 90 ? "#10B981" : pct >= 75 ? "#F59E0B" : "#EF4444";
              const isEligible = pct >= 75;

              return (
                <Box
                  key={student.studentId}
                  bg="white"
                  p={4}
                  borderRadius="2xl"
                  border="1px solid #E2E8F0"
                  boxShadow="0 2px 6px rgba(0,0,0,0.02)"
                >
                  <Flex justify="space-between" align="flex-start" mb={2}>
                    <Box>
                      <Flex align="center" gap={1.5}>
                        <Text fontSize="11px" fontWeight="800" color="#94A3B8">
                          #{idx + 1}
                        </Text>
                        <Text fontSize="14px" fontWeight="900" color="#0F172A">
                          {student.name}
                        </Text>
                      </Flex>
                      <Text fontSize="11px" fontWeight="700" color="#4338CA" mt={0.5}>
                        {student.studentCode || "No Code"} &bull; {student.gender || "-"}
                      </Text>
                    </Box>

                    <Badge
                      bg={isEligible ? "#ECFDF5" : "#FEF2F2"}
                      color={isEligible ? "#065F46" : "#991B1B"}
                      border={isEligible ? "1px solid #A7F3D0" : "1px solid #FECACA"}
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      fontWeight="800"
                      fontSize="10px"
                    >
                      {isEligible ? "✓ Exam Eligible" : "⚠ Under 75%"}
                    </Badge>
                  </Flex>

                  {/* Progress Bar & Percentage */}
                  <Flex align="center" gap={2} mt={3}>
                    <Box flex="1" bg="#E2E8F0" h="7px" borderRadius="full" overflow="hidden">
                      <Box bg={color} h="100%" w={`${pct}%`} borderRadius="full" />
                    </Box>
                    <Text fontSize="13px" fontWeight="900" color={color}>
                      {pct}%
                    </Text>
                  </Flex>

                  {/* Statistics Grid */}
                  <SimpleGrid columns={3} gap={2} mt={3} pt={2} borderTop="1px solid #F1F5F9">
                    <Box>
                      <Text fontSize="9px" fontWeight="700" color="#64748B" textTransform="uppercase">Times Present</Text>
                      <Text fontSize="13px" fontWeight="800" color="#10B981">{student.sessionsPresent}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="9px" fontWeight="700" color="#64748B" textTransform="uppercase">Times Absent</Text>
                      <Text fontSize="13px" fontWeight="800" color="#EF4444">{student.sessionsAbsent}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="9px" fontWeight="700" color="#64748B" textTransform="uppercase">Days Present</Text>
                      <Text fontSize="13px" fontWeight="800" color="#0F172A">{student.daysPresent} d</Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              );
            })}
          </Flex>
        ) : (
          <Box p={8} textAlign="center" bg="white" borderRadius="2xl" border="1px solid #E2E8F0" color="#64748B">
            No student records found for this term range.
          </Box>
        )}
      </Box>

      {/* ========================================================
          VIEW 2: DESKTOP TABLE (Visible on screens >= md)
         ======================================================== */}
      <Box
        display={{ base: "none", md: "block" }}
        bg="white"
        borderRadius="2xl"
        border="1px solid #E2E8F0"
        overflow="hidden"
        boxShadow="0 4px 16px rgba(0,0,0,0.02)"
        mb={6}
      >
        <Box overflowX="auto">
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <th style={{ padding: "12px 14px", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", width: "40px" }}>#</th>
                <th style={{ padding: "12px 14px", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", minWidth: "120px" }}>Admission No</th>
                <th style={{ padding: "12px 14px", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", minWidth: "180px" }}>Student Name</th>
                <th style={{ padding: "12px 14px", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", textAlign: "center", width: "70px" }}>Gender</th>
                <th style={{ padding: "12px 14px", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", textAlign: "center", minWidth: "110px" }}>Times Opened</th>
                <th style={{ padding: "12px 14px", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", textAlign: "center", minWidth: "100px" }}>Times Present</th>
                <th style={{ padding: "12px 14px", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", textAlign: "center", minWidth: "90px" }}>Times Absent</th>
                <th style={{ padding: "12px 14px", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", textAlign: "center", minWidth: "95px" }}>Days Present</th>
                <th style={{ padding: "12px 14px", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", minWidth: "140px" }}>Termly %</th>
                <th style={{ padding: "12px 14px", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", textAlign: "center", minWidth: "130px" }}>Exam Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>
                    Loading termly attendance sheet...
                  </td>
                </tr>
              ) : filteredRoster.length ? (
                filteredRoster.map((student, idx) => {
                  const pct = student.attendancePercentage;
                  const color = pct >= 90 ? "#10B981" : pct >= 75 ? "#F59E0B" : "#EF4444";
                  const isEligible = pct >= 75;

                  return (
                    <tr
                      key={student.studentId}
                      style={{
                        borderBottom: "1px solid #F1F5F9",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", fontSize: "12px", color: "#94A3B8", fontWeight: "700" }}>
                        {idx + 1}
                      </td>

                      <td style={{ padding: "12px 14px", fontSize: "12px", fontWeight: "800", color: "#4338CA" }}>
                        {student.studentCode || "-"}
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <Text fontSize="13px" fontWeight="800" color="#0F172A">
                          {student.name}
                        </Text>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center", fontSize: "12px", color: "#64748B", fontWeight: "600" }}>
                        {student.gender ? student.gender[0].toUpperCase() : "-"}
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center", fontSize: "13px", fontWeight: "700", color: "#0F172A" }}>
                        {summary.totalSessionsOpened}
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center", fontSize: "13px", fontWeight: "800", color: "#10B981" }}>
                        {student.sessionsPresent}
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center", fontSize: "13px", fontWeight: "800", color: student.sessionsAbsent > 0 ? "#EF4444" : "#94A3B8" }}>
                        {student.sessionsAbsent}
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <Text fontSize="13px" fontWeight="800" color="#0F172A">
                          {student.daysPresent}
                        </Text>
                        <Text fontSize="10px" color="#64748B" fontWeight="600">
                          of {summary.daysSchoolOpened} days
                        </Text>
                      </td>

                      {/* Termly % with Progress bar */}
                      <td style={{ padding: "12px 14px" }}>
                        <Flex align="center" gap={2}>
                          <Box flex="1" bg="#E2E8F0" h="6px" borderRadius="full" overflow="hidden">
                            <Box bg={color} h="100%" w={`${pct}%`} borderRadius="full" />
                          </Box>
                          <Text fontSize="12px" fontWeight="900" color={color} minW="36px" textAlign="right">
                            {pct}%
                          </Text>
                        </Flex>
                      </td>

                      {/* Exam Eligibility */}
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        {isEligible ? (
                          <Badge bg="#ECFDF5" color="#059669" border="1px solid #A7F3D0" px={2.5} py={0.5} borderRadius="full" fontSize="10px" fontWeight="800">
                            ✓ Exam Eligible
                          </Badge>
                        ) : (
                          <Badge bg="#FEF2F2" color="#DC2626" border="1px solid #FECACA" px={2.5} py={0.5} borderRadius="full" fontSize="10px" fontWeight="800">
                            <Icon as={FaExclamationTriangle} mr={1} boxSize={2.5} />
                            Below 75%
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} style={{ padding: "36px", textAlign: "center", color: "#94A3B8" }}>
                    {searchQuery ? `No students matching "${searchQuery}".` : "No attendance records found for this term."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>

        {/* Footer */}
        <Flex p={3} bg="#F8FAFC" borderTop="1px solid #E2E8F0" justify="space-between" align="center" flexWrap="wrap" gap={2}>
          <Text fontSize="12px" color="#64748B" fontWeight="600">
            Report card format: 1 full day = 2 attendances (Morning + Afternoon sessions).
          </Text>
          <Text fontSize="12px" color="#4338CA" fontWeight="800">
            Class Term Average: {summary.classAverageRate}% ({eligibleCount} of {summary.totalEnrolled} students exam eligible)
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}
