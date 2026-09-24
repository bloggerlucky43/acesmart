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
  FaChevronLeft,
  FaChevronRight,
  FaCalendarWeek,
  FaSearch,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";
import { getClassAttendanceAnalyticsApi } from "../../../../api-endpoint/sms/smsEndpoints";

export default function WeeklyAttendanceMatrix({
  selectedClassId,
  classes,
  onSelectClassId,
}) {
  const [selectedWeekDate, setSelectedWeekDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  // Compute Monday to Friday range and day labels
  const weekBoundaries = useMemo(() => {
    const d = new Date(selectedWeekDate);
    const day = d.getDay(); // 0 is Sun, 1 is Mon... 6 is Sat
    const diffToMon = day === 0 ? -6 : 1 - day;
    const mon = new Date(d);
    mon.setDate(d.getDate() + diffToMon);

    const weekDays = [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    for (let i = 0; i < 5; i++) {
      const cur = new Date(mon);
      cur.setDate(mon.getDate() + i);
      const iso = cur.toISOString().split("T")[0];
      weekDays.push({
        date: iso,
        dayName: dayNames[i],
        shortLabel: `${dayNames[i]} ${cur.getDate()}/${cur.getMonth() + 1}`,
        fullDateStr: cur.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      });
    }

    const fri = new Date(mon);
    fri.setDate(mon.getDate() + 4);

    return {
      monday: mon.toISOString().split("T")[0],
      friday: fri.toISOString().split("T")[0],
      weekDays,
      label: `${mon.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} – ${fri.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`,
    };
  }, [selectedWeekDate]);

  // Navigate weeks
  const shiftWeek = (deltaDays) => {
    const d = new Date(selectedWeekDate);
    d.setDate(d.getDate() + deltaDays);
    setSelectedWeekDate(d.toISOString().split("T")[0]);
  };

  const goToCurrentWeek = () => {
    setSelectedWeekDate(new Date().toISOString().split("T")[0]);
  };

  // Fetch weekly analytics
  useEffect(() => {
    if (!selectedClassId) return;

    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await getClassAttendanceAnalyticsApi(selectedClassId, {
          period: "weekly",
          date: selectedWeekDate,
        });
        if (isMounted && res?.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error("Load weekly analytics error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedClassId, selectedWeekDate]);

  // Filter roster by student search
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

  // Helper renderer for a single session pill (P / A / L / E)
  const renderSessionPill = (status, sessionLabel) => {
    if (!status) {
      return (
        <Box
          as="span"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          w="18px"
          h="18px"
          borderRadius="md"
          bg="#F1F5F9"
          color="#94A3B8"
          fontSize="10px"
          fontWeight="700"
          title={`${sessionLabel}: Not recorded`}
        >
          -
        </Box>
      );
    }

    const isPresent = status === "present";
    const isLate = status === "late";
    const isAbsent = status === "absent";
    const isExcused = status === "excused";

    const bg = isPresent
      ? "#ECFDF5"
      : isLate
      ? "#FEF3C7"
      : isAbsent
      ? "#FEF2F2"
      : "#EFF6FF";
    const color = isPresent
      ? "#059669"
      : isLate
      ? "#D97706"
      : isAbsent
      ? "#DC2626"
      : "#2563EB";
    const label = isPresent ? "P" : isLate ? "L" : isAbsent ? "A" : "E";

    return (
      <Box
        as="span"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        w="19px"
        h="19px"
        borderRadius="md"
        bg={bg}
        color={color}
        fontSize="10px"
        fontWeight="900"
        title={`${sessionLabel}: ${status.toUpperCase()}`}
      >
        {label}
      </Box>
    );
  };

  const summary = analytics?.summary || {
    totalEnrolled: 0,
    daysSchoolOpened: 0,
    totalSessionsOpened: 0,
    classAverageRate: 0,
    excellentCount: 0,
    warningCount: 0,
    criticalCount: 0,
  };

  const rateColor =
    summary.classAverageRate >= 90
      ? "#10B981"
      : summary.classAverageRate >= 75
      ? "#F59E0B"
      : "#EF4444";

  return (
    <Box>
      {/* Weekly Controls Bar */}
      <Box
        bg="white"
        p={{ base: 3, md: 5 }}
        borderRadius="2xl"
        border="1px solid #E2E8F0"
        mb={{ base: 4, md: 5 }}
        boxShadow="0 2px 10px rgba(0,0,0,0.02)"
      >
        <Flex
          direction={{ base: "column", lg: "row" }}
          justify="space-between"
          align={{ base: "stretch", lg: "center" }}
          gap={3}
        >
          {/* Class Selector & Search */}
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3} flex="1">
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

            <Box>
              <Text fontSize="11px" fontWeight="800" color="#64748B" mb={1}>
                SEARCH STUDENT
              </Text>
              <Flex
                align="center"
                bg="#F8FAFC"
                border="1px solid #CBD5E1"
                borderRadius="10px"
                px={3}
                h="38px"
                gap={2}
              >
                <Icon as={FaSearch} color="#94A3B8" boxSize={3.5} />
                <Input
                  placeholder="Filter by student name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="unstyled"
                  fontSize="13px"
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
            </Box>
          </SimpleGrid>

          {/* Week Navigator Controls */}
          <Box>
            <Text fontSize="11px" fontWeight="800" color="#64748B" mb={1}>
              ACTIVE SCHOOL WEEK
            </Text>
            <Flex
              align="center"
              bg="#F1F5F9"
              p={1}
              borderRadius="xl"
              border="1px solid #E2E8F0"
              gap={1}
            >
              <Button
                size="sm"
                h="32px"
                w="32px"
                minW="32px"
                p={0}
                borderRadius="lg"
                bg="white"
                border="1px solid #CBD5E1"
                _hover={{ bg: "#E2E8F0" }}
                onClick={() => shiftWeek(-7)}
                title="Previous Week"
              >
                <Icon as={FaChevronLeft} boxSize={2.5} color="#334155" />
              </Button>

              <Flex
                align="center"
                justify="center"
                px={3}
                h="32px"
                gap={1.5}
              >
                <Icon as={FaCalendarWeek} color="#4338CA" boxSize={3.5} />
                <Text
                  fontSize={{ base: "12px", sm: "13px" }}
                  fontWeight="800"
                  color="#0F172A"
                  whiteSpace="nowrap"
                >
                  {weekBoundaries.label}
                </Text>
              </Flex>

              <Button
                size="sm"
                h="32px"
                w="32px"
                minW="32px"
                p={0}
                borderRadius="lg"
                bg="white"
                border="1px solid #CBD5E1"
                _hover={{ bg: "#E2E8F0" }}
                onClick={() => shiftWeek(7)}
                title="Next Week"
              >
                <Icon as={FaChevronRight} boxSize={2.5} color="#334155" />
              </Button>

              <Button
                size="sm"
                h="32px"
                px={2.5}
                borderRadius="lg"
                fontSize="11px"
                fontWeight="800"
                bg="#4338CA"
                color="white"
                _hover={{ opacity: 0.9 }}
                onClick={goToCurrentWeek}
              >
                This Week
              </Button>
            </Flex>
          </Box>
        </Flex>
      </Box>

      {/* Weekly KPI Summary Cards */}
      <SimpleGrid columns={{ base: 2, sm: 2, md: 4 }} gap={2.5} mb={{ base: 4, md: 5 }}>
        {/* Class Weekly Attendance Rate */}
        <Box bg="white" p={3.5} borderRadius="xl" border="1px solid #E2E8F0">
          <Text fontSize="10px" fontWeight="800" color="#64748B" textTransform="uppercase">
            Class Weekly Rate
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
              {summary.classAverageRate >= 90 ? "Excellent" : summary.classAverageRate >= 75 ? "Fair" : "Low"}
            </Badge>
          </Flex>
          <Box bg="#E2E8F0" h="4px" borderRadius="full" mt={2} overflow="hidden">
            <Box bg={rateColor} h="100%" w={`${Math.min(100, summary.classAverageRate)}%`} borderRadius="full" />
          </Box>
        </Box>

        {/* Days School Opened */}
        <Box bg="white" p={3.5} borderRadius="xl" border="1px solid #E2E8F0">
          <Text fontSize="10px" fontWeight="800" color="#64748B" textTransform="uppercase">
            Days School Opened
          </Text>
          <Text fontSize={{ base: "20px", md: "26px" }} fontWeight="900" color="#0F172A" mt={1}>
            {summary.daysSchoolOpened} <Text as="span" fontSize="13px" fontWeight="700" color="#64748B">Days</Text>
          </Text>
          <Text fontSize="11px" color="#64748B" fontWeight="600" mt={1}>
            {summary.totalSessionsOpened} sessions held this week
          </Text>
        </Box>

        {/* High Attendance (>=90%) */}
        <Box bg="white" p={3.5} borderRadius="xl" border="1px solid #E2E8F0">
          <Text fontSize="10px" fontWeight="800" color="#10B981" textTransform="uppercase">
            High Attendance (&ge;90%)
          </Text>
          <Flex align="baseline" gap={1.5} mt={1}>
            <Text fontSize={{ base: "20px", md: "26px" }} fontWeight="900" color="#10B981">
              {summary.excellentCount}
            </Text>
            <Text fontSize="12px" fontWeight="700" color="#64748B">
              of {summary.totalEnrolled} students
            </Text>
          </Flex>
          <Text fontSize="11px" color="#059669" fontWeight="700" mt={1}>
            Full or near-perfect attendance
          </Text>
        </Box>

        {/* Truancy Alert (<75%) */}
        <Box bg="white" p={3.5} borderRadius="xl" border="1px solid #E2E8F0">
          <Text fontSize="10px" fontWeight="800" color="#EF4444" textTransform="uppercase">
            At-Risk Truancy (&lt;75%)
          </Text>
          <Flex align="baseline" gap={1.5} mt={1}>
            <Text fontSize={{ base: "20px", md: "26px" }} fontWeight="900" color={summary.criticalCount > 0 ? "#EF4444" : "#10B981"}>
              {summary.criticalCount}
            </Text>
            <Text fontSize="12px" fontWeight="700" color="#64748B">
              students flagged
            </Text>
          </Flex>
          <Text fontSize="11px" color={summary.criticalCount > 0 ? "#DC2626" : "#059669"} fontWeight="700" mt={1}>
            {summary.criticalCount > 0 ? "Requires teacher / parent follow-up" : "All students on track"}
          </Text>
        </Box>
      </SimpleGrid>

      {/* Legend Strip */}
      <Flex
        bg="#F8FAFC"
        p={2.5}
        borderRadius="xl"
        border="1px solid #E2E8F0"
        align="center"
        justify="space-between"
        flexWrap="wrap"
        gap={2}
        mb={4}
      >
        <Flex align="center" gap={3} flexWrap="wrap">
          <Text fontSize="11px" fontWeight="800" color="#475569">
            Session Indicators:
          </Text>
          <Flex align="center" gap={1.5}>
            <Box w="14px" h="14px" bg="#ECFDF5" color="#059669" borderRadius="sm" fontSize="9px" fontWeight="900" display="flex" alignItems="center" justifyContent="center">P</Box>
            <Text fontSize="11px" color="#64748B" fontWeight="600">Present</Text>
          </Flex>
          <Flex align="center" gap={1.5}>
            <Box w="14px" h="14px" bg="#FEF3C7" color="#D97706" borderRadius="sm" fontSize="9px" fontWeight="900" display="flex" alignItems="center" justifyContent="center">L</Box>
            <Text fontSize="11px" color="#64748B" fontWeight="600">Late</Text>
          </Flex>
          <Flex align="center" gap={1.5}>
            <Box w="14px" h="14px" bg="#FEF2F2" color="#DC2626" borderRadius="sm" fontSize="9px" fontWeight="900" display="flex" alignItems="center" justifyContent="center">A</Box>
            <Text fontSize="11px" color="#64748B" fontWeight="600">Absent</Text>
          </Flex>
          <Flex align="center" gap={1.5}>
            <Box w="14px" h="14px" bg="#EFF6FF" color="#2563EB" borderRadius="sm" fontSize="9px" fontWeight="900" display="flex" alignItems="center" justifyContent="center">E</Box>
            <Text fontSize="11px" color="#64748B" fontWeight="600">Excused</Text>
          </Flex>
          <Text fontSize="10px" color="#94A3B8" fontWeight="600">
            (Each day displays AM and PM)
          </Text>
        </Flex>

        <Text fontSize="11px" color="#64748B" fontWeight="600">
          Showing <b>{filteredRoster.length}</b> of <b>{analytics?.roster?.length || 0}</b> students
        </Text>
      </Flex>

      {/* ========================================================
          VIEW 1: MOBILE CARD LIST (< md)
         ======================================================== */}
      <Box display={{ base: "block", md: "none" }} mb={6}>
        {loading ? (
          <Box p={8} textAlign="center" bg="white" borderRadius="2xl" border="1px solid #E2E8F0" color="#64748B">
            Loading weekly attendance sheet...
          </Box>
        ) : filteredRoster.length ? (
          <Flex direction="column" gap={3}>
            {filteredRoster.map((student, idx) => {
              const pct = student.attendancePercentage;
              const color = pct >= 90 ? "#10B981" : pct >= 75 ? "#F59E0B" : "#EF4444";

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
                        {student.studentCode || "No Code"}
                      </Text>
                    </Box>

                    <Badge
                      bg={pct >= 90 ? "#ECFDF5" : pct >= 75 ? "#FEF3C7" : "#FEF2F2"}
                      color={pct >= 90 ? "#065F46" : pct >= 75 ? "#92400E" : "#991B1B"}
                      border={pct >= 90 ? "1px solid #A7F3D0" : pct >= 75 ? "1px solid #FDE68A" : "1px solid #FECACA"}
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      fontWeight="800"
                      fontSize="10px"
                    >
                      {pct}% Weekly
                    </Badge>
                  </Flex>

                  {/* 5-Day Strip */}
                  <Flex
                    mt={3}
                    p={2}
                    bg="#F8FAFC"
                    borderRadius="xl"
                    border="1px solid #E2E8F0"
                    justify="space-between"
                    align="center"
                  >
                    {weekBoundaries.weekDays.map((day) => {
                      const dayRec = student.dailyBreakdown?.[day.date];
                      return (
                        <Flex key={day.date} direction="column" align="center" gap={1}>
                          <Text fontSize="10px" fontWeight="800" color="#64748B">
                            {day.dayName}
                          </Text>
                          <Flex gap={0.5}>
                            {renderSessionPill(dayRec?.morning, "AM")}
                            {renderSessionPill(dayRec?.afternoon, "PM")}
                          </Flex>
                        </Flex>
                      );
                    })}
                  </Flex>

                  {/* Footer Stats */}
                  <Flex justify="space-between" align="center" mt={3} pt={2} borderTop="1px solid #F1F5F9">
                    <Text fontSize="11px" color="#64748B" fontWeight="600">
                      Days Present: <b style={{ color: "#0F172A" }}>{student.daysPresent}</b> / {summary.daysSchoolOpened}
                    </Text>
                    <Text fontSize="11px" color="#64748B" fontWeight="600">
                      Sessions: <b style={{ color: color }}>{student.sessionsPresent}</b> / {summary.totalSessionsOpened}
                    </Text>
                  </Flex>
                </Box>
              );
            })}
          </Flex>
        ) : (
          <Box p={8} textAlign="center" bg="white" borderRadius="2xl" border="1px solid #E2E8F0" color="#64748B">
            No students found for this week.
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
                <th style={{ padding: "12px 14px", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", minWidth: "180px" }}>Student</th>
                {weekBoundaries.weekDays.map((day) => (
                  <th
                    key={day.date}
                    style={{
                      padding: "12px 10px",
                      fontSize: "11px",
                      fontWeight: "800",
                      color: "#475569",
                      textAlign: "center",
                      minWidth: "75px",
                    }}
                  >
                    <div>{day.dayName}</div>
                    <div style={{ fontSize: "9px", color: "#94A3B8", fontWeight: "600" }}>
                      {day.date.slice(5)}
                    </div>
                  </th>
                ))}
                <th style={{ padding: "12px 14px", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", textAlign: "center", minWidth: "90px" }}>Days Present</th>
                <th style={{ padding: "12px 14px", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", minWidth: "120px" }}>Weekly %</th>
                <th style={{ padding: "12px 14px", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", textAlign: "center", minWidth: "100px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>
                    Loading weekly attendance sheet...
                  </td>
                </tr>
              ) : filteredRoster.length ? (
                filteredRoster.map((student, idx) => {
                  const pct = student.attendancePercentage;
                  const color = pct >= 90 ? "#10B981" : pct >= 75 ? "#F59E0B" : "#EF4444";

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

                      <td style={{ padding: "12px 14px" }}>
                        <Text fontSize="13px" fontWeight="800" color="#0F172A">
                          {student.name}
                        </Text>
                        <Text fontSize="11px" fontWeight="600" color="#64748B">
                          {student.studentCode || "-"} &bull; {student.gender || ""}
                        </Text>
                      </td>

                      {/* 5 Days Columns */}
                      {weekBoundaries.weekDays.map((day) => {
                        const dayRec = student.dailyBreakdown?.[day.date];
                        return (
                          <td
                            key={day.date}
                            style={{
                              padding: "10px",
                              textAlign: "center",
                              background: idx % 2 === 0 ? "transparent" : "#FAFAFA",
                            }}
                          >
                            <Flex align="center" justify="center" gap={1}>
                              {renderSessionPill(dayRec?.morning, "AM")}
                              {renderSessionPill(dayRec?.afternoon, "PM")}
                            </Flex>
                          </td>
                        );
                      })}

                      {/* Days Present */}
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <Text fontSize="13px" fontWeight="800" color="#0F172A">
                          {student.daysPresent}
                        </Text>
                        <Text fontSize="10px" color="#64748B" fontWeight="600">
                          of {summary.daysSchoolOpened} days
                        </Text>
                      </td>

                      {/* Weekly % */}
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

                      {/* Status */}
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        {pct >= 90 ? (
                          <Badge bg="#ECFDF5" color="#059669" border="1px solid #A7F3D0" px={2.5} py={0.5} borderRadius="full" fontSize="10px" fontWeight="800">
                            Excellent
                          </Badge>
                        ) : pct >= 75 ? (
                          <Badge bg="#FEF3C7" color="#D97706" border="1px solid #FDE68A" px={2.5} py={0.5} borderRadius="full" fontSize="10px" fontWeight="800">
                            Fair
                          </Badge>
                        ) : (
                          <Badge bg="#FEF2F2" color="#DC2626" border="1px solid #FECACA" px={2.5} py={0.5} borderRadius="full" fontSize="10px" fontWeight="800">
                            <Icon as={FaExclamationTriangle} mr={1} boxSize={2.5} />
                            At-Risk
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} style={{ padding: "36px", textAlign: "center", color: "#94A3B8" }}>
                    {searchQuery ? `No students matching "${searchQuery}".` : "No attendance records found for this week."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>

        {/* Footer */}
        <Flex p={3} bg="#F8FAFC" borderTop="1px solid #E2E8F0" justify="space-between" align="center">
          <Text fontSize="12px" color="#64748B" fontWeight="600">
            Calculated on school days where attendance was submitted (AM + PM = 1.0 day).
          </Text>
          <Text fontSize="12px" color="#4338CA" fontWeight="800">
            Class Weekly Average: {summary.classAverageRate}%
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}
