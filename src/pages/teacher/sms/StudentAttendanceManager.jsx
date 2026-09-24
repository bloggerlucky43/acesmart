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
  FaCheck,
  FaTimes,
  FaClock,
  FaSave,
  FaCheckCircle,
  FaSun,
  FaCloudSun,
  FaBolt,
  FaCopy,
  FaSearch,
  FaNotesMedical,
} from "react-icons/fa";
import {
  getClassArmsApi,
  getClassAttendanceByDateApi,
  markStudentAttendanceBatchApi,
} from "../../../api-endpoint/sms/smsEndpoints";
import { toaster } from "../../../components/ui/toaster";
import DashboardLayout from "../../../constants/dashboardlayout";

export default function StudentAttendanceManager() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  // Session Mode: 'both' (Full Day), 'morning' (AM), 'afternoon' (PM)
  const [selectedSession, setSelectedSession] = useState("both");
  const [searchQuery, setSearchQuery] = useState("");
  const [roster, setRoster] = useState([]);
  const [morningStats, setMorningStats] = useState({
    marked: false,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
  });
  const [afternoonStats, setAfternoonStats] = useState({
    marked: false,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch Class Arms on mount
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await getClassArmsApi();
        if (res.success && res.data.length > 0) {
          setClasses(res.data);
          setSelectedClassId(res.data[0].id);
        }
      } catch (err) {
        console.error("Load classes error:", err);
      }
    };
    loadClasses();
  }, []);

  // Fetch Attendance Roster when Class, Date, or Session changes
  useEffect(() => {
    if (!selectedClassId) return;

    const loadRoster = async () => {
      setLoading(true);
      try {
        const res = await getClassAttendanceByDateApi(
          selectedClassId,
          selectedDate,
          selectedSession
        );
        if (res.success) {
          setRoster(res.data.roster || []);
          if (res.data.morningStats) setMorningStats(res.data.morningStats);
          if (res.data.afternoonStats) setAfternoonStats(res.data.afternoonStats);
        }
      } catch (err) {
        console.error("Load roster error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadRoster();
  }, [selectedClassId, selectedDate, selectedSession]);

  // Handle single status change for morning
  const handleMorningStatusChange = (studentId, status) => {
    setRoster((prev) =>
      prev.map((item) =>
        item.studentId === studentId
          ? { ...item, morningStatus: status, morningMarked: true }
          : item
      )
    );
  };

  // Handle single status change for afternoon
  const handleAfternoonStatusChange = (studentId, status) => {
    setRoster((prev) =>
      prev.map((item) =>
        item.studentId === studentId
          ? { ...item, afternoonStatus: status, afternoonMarked: true }
          : item
      )
    );
  };

  // Sync a single student's morning status to their afternoon status
  const handleSyncStudentToAfternoon = (studentId) => {
    setRoster((prev) =>
      prev.map((item) => {
        if (item.studentId !== studentId) return item;
        return {
          ...item,
          afternoonStatus: item.morningStatus || "present",
          afternoonMarked: true,
          afternoonRemark: item.morningRemark || item.afternoonRemark || "",
        };
      })
    );
  };

  // Handle remark change
  const handleRemarkChange = (studentId, remark, targetSession = "both") => {
    setRoster((prev) =>
      prev.map((item) => {
        if (item.studentId !== studentId) return item;
        if (targetSession === "morning") return { ...item, morningRemark: remark };
        if (targetSession === "afternoon") return { ...item, afternoonRemark: remark };
        return { ...item, remark, morningRemark: remark, afternoonRemark: remark };
      })
    );
  };

  // Quick Action: Mark All for Current Session or Both
  const handleMarkAll = (status) => {
    setRoster((prev) =>
      prev.map((item) => {
        if (selectedSession === "morning") {
          return { ...item, morningStatus: status, morningMarked: true };
        } else if (selectedSession === "afternoon") {
          return { ...item, afternoonStatus: status, afternoonMarked: true };
        } else {
          return {
            ...item,
            morningStatus: status,
            afternoonStatus: status,
            status,
            morningMarked: true,
            afternoonMarked: true,
          };
        }
      })
    );

    const sessionLabel =
      selectedSession === "morning"
        ? "Morning (AM)"
        : selectedSession === "afternoon"
        ? "Afternoon (PM)"
        : "Full Day (AM & PM)";

    toaster.create({
      title: `All marked as ${status.toUpperCase()} for ${sessionLabel}`,
      type: "info",
    });
  };

  // Copy Morning attendance directly to Afternoon for all students
  const handleCopyMorningToAfternoon = () => {
    setRoster((prev) =>
      prev.map((item) => ({
        ...item,
        afternoonStatus: item.morningStatus || "present",
        afternoonMarked: true,
        afternoonRemark: item.morningRemark || item.afternoonRemark || "",
      }))
    );
    toaster.create({
      title: "Copied Morning to Afternoon",
      description: "Afternoon session is now set to match morning attendance.",
      type: "success",
    });
  };

  // Save Attendance to Backend
  const handleSaveAttendance = async () => {
    if (!selectedClassId) return;
    setSaving(true);
    try {
      let attendanceList = [];

      if (selectedSession === "both") {
        attendanceList = roster.map((item) => ({
          studentId: item.studentId,
          morningStatus: item.morningStatus || "present",
          afternoonStatus: item.afternoonStatus || "present",
          status: item.morningStatus || "present",
          morningRemark: item.morningRemark || "",
          afternoonRemark: item.afternoonRemark || "",
          remark: item.remark || "",
        }));
      } else if (selectedSession === "morning") {
        attendanceList = roster.map((item) => ({
          studentId: item.studentId,
          status: item.morningStatus || item.status || "present",
          morningStatus: item.morningStatus || item.status || "present",
          remark: item.morningRemark || item.remark || "",
        }));
      } else if (selectedSession === "afternoon") {
        attendanceList = roster.map((item) => ({
          studentId: item.studentId,
          status: item.afternoonStatus || item.status || "present",
          afternoonStatus: item.afternoonStatus || item.status || "present",
          remark: item.afternoonRemark || item.remark || "",
        }));
      }

      const res = await markStudentAttendanceBatchApi({
        classArmId: selectedClassId,
        date: selectedDate,
        session: selectedSession,
        attendanceList,
      });

      if (res.success) {
        toaster.create({
          title: "Attendance Saved Successfully!",
          description: res.message || `Class attendance recorded for ${selectedDate}`,
          type: "success",
        });

        // Refresh stats
        const refreshed = await getClassAttendanceByDateApi(
          selectedClassId,
          selectedDate,
          selectedSession
        );
        if (refreshed?.success) {
          if (refreshed.data.morningStats) setMorningStats(refreshed.data.morningStats);
          if (refreshed.data.afternoonStats) setAfternoonStats(refreshed.data.afternoonStats);
        }
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Failed to save attendance",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Filter roster by student search query
  const filteredRoster = useMemo(() => {
    if (!searchQuery.trim()) return roster;
    const query = searchQuery.toLowerCase().trim();
    return roster.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        (s.studentCode && s.studentCode.toLowerCase().includes(query))
    );
  }, [roster, searchQuery]);

  // Dynamic statistics
  const currentPresentCount = useMemo(() => {
    if (selectedSession === "morning") {
      return roster.filter((r) => r.morningStatus === "present").length;
    }
    if (selectedSession === "afternoon") {
      return roster.filter((r) => r.afternoonStatus === "present").length;
    }
    return roster.filter(
      (r) => r.morningStatus === "present" && r.afternoonStatus === "present"
    ).length;
  }, [roster, selectedSession]);

  const currentAbsentCount = useMemo(() => {
    if (selectedSession === "morning") {
      return roster.filter((r) => r.morningStatus === "absent").length;
    }
    if (selectedSession === "afternoon") {
      return roster.filter((r) => r.afternoonStatus === "absent").length;
    }
    return roster.filter(
      (r) => r.morningStatus === "absent" || r.afternoonStatus === "absent"
    ).length;
  }, [roster, selectedSession]);

  const currentLateCount = useMemo(() => {
    if (selectedSession === "morning") {
      return roster.filter((r) => r.morningStatus === "late").length;
    }
    if (selectedSession === "afternoon") {
      return roster.filter((r) => r.afternoonStatus === "late").length;
    }
    return roster.filter(
      (r) => r.morningStatus === "late" || r.afternoonStatus === "late"
    ).length;
  }, [roster, selectedSession]);

  const attendanceRate =
    roster.length > 0
      ? ((currentPresentCount / roster.length) * 100).toFixed(0)
      : 0;

  // Mini button renderer for desktop table
  const renderDesktopBtn = (label, currentVal, targetVal, activeBg, activeColor, onClick) => {
    const isActive = currentVal === targetVal;
    return (
      <Button
        size="xs"
        px={2.5}
        py={1}
        h="28px"
        minW="30px"
        borderRadius="md"
        fontSize="11px"
        fontWeight="800"
        transition="all 0.15s ease"
        bg={isActive ? activeBg : "#F1F5F9"}
        color={isActive ? activeColor : "#64748B"}
        border={isActive ? `1px solid ${activeBg}` : "1px solid #E2E8F0"}
        _hover={{
          bg: isActive ? activeBg : "#E2E8F0",
          color: isActive ? activeColor : "#0F172A",
        }}
        onClick={onClick}
      >
        {label}
      </Button>
    );
  };

  // Touch-friendly button renderer for mobile cards
  const renderMobileBtn = (label, shortLabel, currentVal, targetVal, activeBg, activeColor, onClick) => {
    const isActive = currentVal === targetVal;
    return (
      <Button
        flex="1"
        size="sm"
        h="36px"
        borderRadius="lg"
        fontSize="12px"
        fontWeight="800"
        transition="all 0.15s ease"
        bg={isActive ? activeBg : "#F8FAFC"}
        color={isActive ? activeColor : "#64748B"}
        border={isActive ? `1.5px solid ${activeBg}` : "1px solid #CBD5E1"}
        boxShadow={isActive ? "0 2px 6px rgba(0,0,0,0.12)" : "none"}
        _active={{ transform: "scale(0.96)" }}
        onClick={onClick}
      >
        {shortLabel}
      </Button>
    );
  };

  return (
    <DashboardLayout>
      <Box
        p={{ base: 3, sm: 4, md: 8 }}
        pt={{ base: "76px", md: "88px" }}
        pl={{ base: 3, sm: 4, lg: "260px" }}
        maxW="1350px"
        mx="auto"
      >
        {/* Top Header */}
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "stretch", sm: "center" }}
          gap={3}
          mb={{ base: 4, md: 6 }}
        >
          <Box>
            <Flex align="center" gap={2} flexWrap="wrap">
              <Text
                fontSize={{ base: "18px", sm: "22px", md: "24px" }}
                fontWeight="900"
                color="#0F172A"
                letterSpacing="-0.5px"
              >
                Student Attendance Register
              </Text>
              <Badge
                bg="#EEF2FF"
                color="#4338CA"
                border="1px solid #C7D2FE"
                px={2}
                py={0.5}
                borderRadius="full"
                fontWeight="800"
                fontSize="10px"
              >
                Morning & Afternoon
              </Badge>
            </Flex>
            <Text fontSize={{ base: "12px", md: "13px" }} color="#64748B" mt={0.5}>
              Mark Morning (AM) and Afternoon (PM) sessions separately or both at once
            </Text>
          </Box>

          <Button
            bg="linear-gradient(135deg, #10B981 0%, #059669 100%)"
            color="white"
            borderRadius="xl"
            px={{ base: 4, md: 6 }}
            h={{ base: "40px", md: "44px" }}
            fontWeight="800"
            fontSize="13px"
            boxShadow="0 4px 14px rgba(16, 185, 129, 0.35)"
            _hover={{ opacity: 0.92 }}
            onClick={handleSaveAttendance}
            loading={saving}
          >
            <Icon as={FaSave} mr={2} boxSize={3.5} />
            Save Attendance
          </Button>
        </Flex>

        {/* Daily Session Status Bar */}
        <Flex
          bg="white"
          p={{ base: 3, md: 4 }}
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          gap={3}
          align="center"
          justify="space-between"
          flexWrap="wrap"
          mb={{ base: 4, md: 5 }}
          boxShadow="0 2px 8px rgba(0,0,0,0.02)"
        >
          <Flex align="center" gap={2} flexWrap="wrap">
            <Text
              fontSize="11px"
              fontWeight="800"
              color="#475569"
              textTransform="uppercase"
              letterSpacing="0.3px"
            >
              Session Status:
            </Text>

            {/* Morning Status Pill */}
            <Flex
              align="center"
              gap={1.5}
              px={2.5}
              py={1}
              borderRadius="lg"
              bg={morningStats.marked ? "#ECFDF5" : "#FEF3C7"}
              border={morningStats.marked ? "1px solid #A7F3D0" : "1px solid #FDE68A"}
            >
              <Icon as={FaSun} color={morningStats.marked ? "#059669" : "#D97706"} boxSize={3} />
              <Text fontSize="11px" fontWeight="700" color={morningStats.marked ? "#065F46" : "#92400E"}>
                Morning: {morningStats.marked ? `Marked (${morningStats.present} Present)` : "Pending"}
              </Text>
            </Flex>

            {/* Afternoon Status Pill */}
            <Flex
              align="center"
              gap={1.5}
              px={2.5}
              py={1}
              borderRadius="lg"
              bg={afternoonStats.marked ? "#EFF6FF" : "#FEF3C7"}
              border={afternoonStats.marked ? "1px solid #BFDBFE" : "1px solid #FDE68A"}
            >
              <Icon as={FaCloudSun} color={afternoonStats.marked ? "#2563EB" : "#D97706"} boxSize={3} />
              <Text fontSize="11px" fontWeight="700" color={afternoonStats.marked ? "#1E40AF" : "#92400E"}>
                Afternoon: {afternoonStats.marked ? `Marked (${afternoonStats.present} Present)` : "Pending"}
              </Text>
            </Flex>
          </Flex>

          {/* Quick Copy Action */}
          {selectedSession !== "morning" && (
            <Button
              size="xs"
              variant="outline"
              borderColor="#CBD5E1"
              color="#334155"
              borderRadius="lg"
              fontWeight="700"
              h="28px"
              px={2.5}
              _hover={{ bg: "#F8FAFC" }}
              onClick={handleCopyMorningToAfternoon}
            >
              <Icon as={FaCopy} mr={1} color="#6366F1" boxSize={3} />
              Copy Morning to Afternoon
            </Button>
          )}
        </Flex>

        {/* Filter Controls Bar */}
        <Box
          bg="white"
          p={{ base: 3, md: 5 }}
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          mb={{ base: 4, md: 6 }}
          boxShadow="0 2px 10px rgba(0,0,0,0.02)"
        >
          <Flex
            gap={3}
            direction={{ base: "column", lg: "row" }}
            justify="space-between"
            align={{ base: "stretch", lg: "center" }}
          >
            {/* Top row of inputs: Class, Date, Search */}
            <SimpleGrid columns={{ base: 1, sm: 3 }} gap={3} flex="1">
              {/* Class Selector */}
              <Box>
                <Text fontSize="11px" fontWeight="800" color="#64748B" mb={1}>
                  SELECT CLASS
                </Text>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
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

              {/* Date Selector */}
              <Box>
                <Text fontSize="11px" fontWeight="800" color="#64748B" mb={1}>
                  DATE
                </Text>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  h="38px"
                  borderRadius="10px"
                  border="1px solid #CBD5E1"
                  bg="#F8FAFC"
                  fontSize="13px"
                  fontWeight="700"
                  color="#0F172A"
                />
              </Box>

              {/* Student Search */}
              <Box>
                <Text fontSize="11px" fontWeight="800" color="#64748B" mb={1}>
                  FIND STUDENT
                </Text>
                <Flex
                  align="center"
                  bg="#F8FAFC"
                  border="1px solid #CBD5E1"
                  borderRadius="10px"
                  h="38px"
                  px={2.5}
                >
                  <Icon as={FaSearch} color="#94A3B8" mr={2} boxSize={3} />
                  <Input
                    placeholder="Search name or code..."
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
              </Box>
            </SimpleGrid>

            {/* Attendance Mode Switcher */}
            <Box>
              <Text fontSize="11px" fontWeight="800" color="#64748B" mb={1}>
                ATTENDANCE MODE
              </Text>
              <Flex
                bg="#F1F5F9"
                p={1}
                borderRadius="xl"
                border="1px solid #E2E8F0"
                gap={1}
              >
                <Button
                  flex="1"
                  size="sm"
                  h="32px"
                  px={{ base: 2, md: 3 }}
                  borderRadius="lg"
                  fontSize="11px"
                  fontWeight="800"
                  bg={selectedSession === "both" ? "#4338CA" : "transparent"}
                  color={selectedSession === "both" ? "white" : "#475569"}
                  _hover={{ bg: selectedSession === "both" ? "#4338CA" : "#E2E8F0" }}
                  onClick={() => setSelectedSession("both")}
                >
                  <Icon as={FaBolt} mr={1} boxSize={3} />
                  Full Day (Both)
                </Button>

                <Button
                  flex="1"
                  size="sm"
                  h="32px"
                  px={{ base: 2, md: 3 }}
                  borderRadius="lg"
                  fontSize="11px"
                  fontWeight="800"
                  bg={selectedSession === "morning" ? "#D97706" : "transparent"}
                  color={selectedSession === "morning" ? "white" : "#475569"}
                  _hover={{ bg: selectedSession === "morning" ? "#D97706" : "#E2E8F0" }}
                  onClick={() => setSelectedSession("morning")}
                >
                  <Icon as={FaSun} mr={1} boxSize={3} />
                  Morning (AM)
                </Button>

                <Button
                  flex="1"
                  size="sm"
                  h="32px"
                  px={{ base: 2, md: 3 }}
                  borderRadius="lg"
                  fontSize="11px"
                  fontWeight="800"
                  bg={selectedSession === "afternoon" ? "#2563EB" : "transparent"}
                  color={selectedSession === "afternoon" ? "white" : "#475569"}
                  _hover={{ bg: selectedSession === "afternoon" ? "#2563EB" : "#E2E8F0" }}
                  onClick={() => setSelectedSession("afternoon")}
                >
                  <Icon as={FaCloudSun} mr={1} boxSize={3} />
                  Afternoon (PM)
                </Button>
              </Flex>
            </Box>
          </Flex>

          {/* Quick Mark Strip */}
          <Flex
            mt={3}
            pt={3}
            borderTop="1px solid #F1F5F9"
            justify="space-between"
            align="center"
            flexWrap="wrap"
            gap={2}
          >
            <Flex align="center" gap={1.5} flexWrap="wrap">
              <Text fontSize="11px" color="#64748B" fontWeight="700">
                Quick Mark:
              </Text>
              <Button
                size="xs"
                bg="#ECFDF5"
                color="#065F46"
                border="1px solid #A7F3D0"
                fontWeight="800"
                borderRadius="lg"
                px={2.5}
                h="26px"
                _hover={{ bg: "#D1FAE5" }}
                onClick={() => handleMarkAll("present")}
              >
                <Icon as={FaCheckCircle} mr={1} boxSize={2.5} />
                All Present
              </Button>
              <Button
                size="xs"
                bg="#FEF2F2"
                color="#991B1B"
                border="1px solid #FECACA"
                fontWeight="800"
                borderRadius="lg"
                px={2.5}
                h="26px"
                _hover={{ bg: "#FEE2E2" }}
                onClick={() => handleMarkAll("absent")}
              >
                <Icon as={FaTimes} mr={1} boxSize={2.5} />
                All Absent
              </Button>
            </Flex>

            <Text fontSize="11px" color="#64748B" fontWeight="600">
              Showing <b>{filteredRoster.length}</b> of <b>{roster.length}</b> students
            </Text>
          </Flex>
        </Box>

        {/* Live Statistics Cards */}
        <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} gap={2.5} mb={{ base: 4, md: 6 }}>
          <Box bg="white" p={3} borderRadius="xl" border="1px solid #E2E8F0">
            <Text fontSize="10px" fontWeight="700" color="#64748B" textTransform="uppercase">Enrolled</Text>
            <Text fontSize={{ base: "18px", md: "22px" }} fontWeight="900" color="#0F172A">{roster.length}</Text>
          </Box>
          <Box bg="white" p={3} borderRadius="xl" border="1px solid #E2E8F0">
            <Text fontSize="10px" fontWeight="700" color="#10B981" textTransform="uppercase">Present</Text>
            <Text fontSize={{ base: "18px", md: "22px" }} fontWeight="900" color="#10B981">{currentPresentCount}</Text>
          </Box>
          <Box bg="white" p={3} borderRadius="xl" border="1px solid #E2E8F0">
            <Text fontSize="10px" fontWeight="700" color="#EF4444" textTransform="uppercase">Absent</Text>
            <Text fontSize={{ base: "18px", md: "22px" }} fontWeight="900" color="#EF4444">{currentAbsentCount}</Text>
          </Box>
          <Box bg="white" p={3} borderRadius="xl" border="1px solid #E2E8F0">
            <Text fontSize="10px" fontWeight="700" color="#F59E0B" textTransform="uppercase">Late</Text>
            <Text fontSize={{ base: "18px", md: "22px" }} fontWeight="900" color="#F59E0B">{currentLateCount}</Text>
          </Box>
          <Box bg="white" p={3} borderRadius="xl" border="1px solid #E2E8F0" gridColumn={{ base: "span 2", sm: "auto" }}>
            <Text fontSize="10px" fontWeight="700" color="#4338CA" textTransform="uppercase">Attendance Rate</Text>
            <Text fontSize={{ base: "18px", md: "22px" }} fontWeight="900" color="#4338CA">{attendanceRate}%</Text>
          </Box>
        </SimpleGrid>

        {/* ========================================================
            VIEW 1: MOBILE CARD LIST (Visible on phone screens: < md)
           ======================================================== */}
        <Box display={{ base: "block", md: "none" }} mb={6}>
          {loading ? (
            <Box p={8} textAlign="center" bg="white" borderRadius="2xl" border="1px solid #E2E8F0" color="#64748B">
              Loading class roster...
            </Box>
          ) : filteredRoster.length ? (
            <Flex direction="column" gap={3}>
              {filteredRoster.map((student, idx) => {
                const mStatus = student.morningStatus || "present";
                const aStatus = student.afternoonStatus || "present";

                return (
                  <Box
                    key={student.studentId}
                    bg="white"
                    p={4}
                    borderRadius="2xl"
                    border="1px solid #E2E8F0"
                    boxShadow="0 2px 6px rgba(0,0,0,0.02)"
                  >
                    {/* Student Info Header */}
                    <Flex justify="space-between" align="flex-start" mb={3}>
                      <Box>
                        <Flex align="center" gap={1.5}>
                          <Text fontSize="11px" fontWeight="800" color="#94A3B8">
                            #{idx + 1}
                          </Text>
                          <Text fontSize="14px" fontWeight="900" color="#0F172A">
                            {student.name}
                          </Text>
                        </Flex>
                        <Flex align="center" gap={2} mt={0.5}>
                          <Text fontSize="11px" fontWeight="700" color="#4338CA">
                            {student.studentCode || "No Code"}
                          </Text>
                          {student.gender && (
                            <Text fontSize="11px" color="#64748B" textTransform="capitalize">
                              &bull; {student.gender}
                            </Text>
                          )}
                        </Flex>
                      </Box>

                      {/* Quick Sync Button if in Full Day Mode */}
                      {selectedSession === "both" && (
                        <Button
                          size="xs"
                          variant="outline"
                          borderColor="#CBD5E1"
                          color="#4338CA"
                          fontWeight="700"
                          fontSize="10px"
                          h="26px"
                          px={2}
                          onClick={() => handleSyncStudentToAfternoon(student.studentId)}
                        >
                          Sync to PM
                        </Button>
                      )}
                    </Flex>

                    {/* Attendance Buttons based on Mode */}
                    {selectedSession === "both" ? (
                      <Box mb={3}>
                        {/* Morning Row */}
                        <Box mb={2.5}>
                          <Flex justify="space-between" align="center" mb={1}>
                            <Text fontSize="11px" fontWeight="800" color="#D97706">
                              ☀️ MORNING (AM)
                            </Text>
                            <Badge
                              fontSize="10px"
                              fontWeight="800"
                              bg={mStatus === "present" ? "#ECFDF5" : mStatus === "absent" ? "#FEF2F2" : "#FFFBEB"}
                              color={mStatus === "present" ? "#065F46" : mStatus === "absent" ? "#991B1B" : "#B45309"}
                              borderRadius="md"
                              px={1.5}
                            >
                              {mStatus.toUpperCase()}
                            </Badge>
                          </Flex>
                          <Flex gap={1.5}>
                            {renderMobileBtn("Present", "P", mStatus, "present", "#10B981", "white", () =>
                              handleMorningStatusChange(student.studentId, "present")
                            )}
                            {renderMobileBtn("Absent", "A", mStatus, "absent", "#EF4444", "white", () =>
                              handleMorningStatusChange(student.studentId, "absent")
                            )}
                            {renderMobileBtn("Late", "L", mStatus, "late", "#F59E0B", "white", () =>
                              handleMorningStatusChange(student.studentId, "late")
                            )}
                            {renderMobileBtn("Excused", "E", mStatus, "excused", "#3B82F6", "white", () =>
                              handleMorningStatusChange(student.studentId, "excused")
                            )}
                          </Flex>
                        </Box>

                        {/* Afternoon Row */}
                        <Box>
                          <Flex justify="space-between" align="center" mb={1}>
                            <Text fontSize="11px" fontWeight="800" color="#2563EB">
                              🌤️ AFTERNOON (PM)
                            </Text>
                            <Badge
                              fontSize="10px"
                              fontWeight="800"
                              bg={aStatus === "present" ? "#ECFDF5" : aStatus === "absent" ? "#FEF2F2" : "#FFFBEB"}
                              color={aStatus === "present" ? "#065F46" : aStatus === "absent" ? "#991B1B" : "#B45309"}
                              borderRadius="md"
                              px={1.5}
                            >
                              {aStatus.toUpperCase()}
                            </Badge>
                          </Flex>
                          <Flex gap={1.5}>
                            {renderMobileBtn("Present", "P", aStatus, "present", "#10B981", "white", () =>
                              handleAfternoonStatusChange(student.studentId, "present")
                            )}
                            {renderMobileBtn("Absent", "A", aStatus, "absent", "#EF4444", "white", () =>
                              handleAfternoonStatusChange(student.studentId, "absent")
                            )}
                            {renderMobileBtn("Late", "L", aStatus, "late", "#F59E0B", "white", () =>
                              handleAfternoonStatusChange(student.studentId, "late")
                            )}
                            {renderMobileBtn("Excused", "E", aStatus, "excused", "#3B82F6", "white", () =>
                              handleAfternoonStatusChange(student.studentId, "excused")
                            )}
                          </Flex>
                        </Box>
                      </Box>
                    ) : selectedSession === "morning" ? (
                      <Box mb={3}>
                        <Flex justify="space-between" align="center" mb={1.5}>
                          <Text fontSize="11px" fontWeight="800" color="#D97706">
                            ☀️ MORNING (AM) STATUS
                          </Text>
                          <Badge
                            fontSize="11px"
                            fontWeight="800"
                            bg={mStatus === "present" ? "#ECFDF5" : mStatus === "absent" ? "#FEF2F2" : "#FFFBEB"}
                            color={mStatus === "present" ? "#065F46" : mStatus === "absent" ? "#991B1B" : "#B45309"}
                            borderRadius="md"
                            px={2}
                            py={0.5}
                          >
                            {mStatus.toUpperCase()}
                          </Badge>
                        </Flex>
                        <Flex gap={1.5}>
                          {renderMobileBtn("Present", "Present", mStatus, "present", "#10B981", "white", () =>
                            handleMorningStatusChange(student.studentId, "present")
                          )}
                          {renderMobileBtn("Absent", "Absent", mStatus, "absent", "#EF4444", "white", () =>
                            handleMorningStatusChange(student.studentId, "absent")
                          )}
                          {renderMobileBtn("Late", "Late", mStatus, "late", "#F59E0B", "white", () =>
                            handleMorningStatusChange(student.studentId, "late")
                          )}
                          {renderMobileBtn("Excused", "Excused", mStatus, "excused", "#3B82F6", "white", () =>
                            handleMorningStatusChange(student.studentId, "excused")
                          )}
                        </Flex>
                      </Box>
                    ) : (
                      <Box mb={3}>
                        <Flex justify="space-between" align="center" mb={1.5}>
                          <Text fontSize="11px" fontWeight="800" color="#2563EB">
                            🌤️ AFTERNOON (PM) STATUS
                          </Text>
                          <Badge
                            fontSize="11px"
                            fontWeight="800"
                            bg={aStatus === "present" ? "#ECFDF5" : aStatus === "absent" ? "#FEF2F2" : "#FFFBEB"}
                            color={aStatus === "present" ? "#065F46" : aStatus === "absent" ? "#991B1B" : "#B45309"}
                            borderRadius="md"
                            px={2}
                            py={0.5}
                          >
                            {aStatus.toUpperCase()}
                          </Badge>
                        </Flex>
                        <Flex gap={1.5}>
                          {renderMobileBtn("Present", "Present", aStatus, "present", "#10B981", "white", () =>
                            handleAfternoonStatusChange(student.studentId, "present")
                          )}
                          {renderMobileBtn("Absent", "Absent", aStatus, "absent", "#EF4444", "white", () =>
                            handleAfternoonStatusChange(student.studentId, "absent")
                          )}
                          {renderMobileBtn("Late", "Late", aStatus, "late", "#F59E0B", "white", () =>
                            handleAfternoonStatusChange(student.studentId, "late")
                          )}
                          {renderMobileBtn("Excused", "Excused", aStatus, "excused", "#3B82F6", "white", () =>
                            handleAfternoonStatusChange(student.studentId, "excused")
                          )}
                        </Flex>
                      </Box>
                    )}

                    {/* Remark Input */}
                    <Input
                      placeholder="Optional remark..."
                      value={
                        selectedSession === "morning"
                          ? student.morningRemark || ""
                          : selectedSession === "afternoon"
                          ? student.afternoonRemark || ""
                          : student.morningRemark || student.remark || ""
                      }
                      onChange={(e) =>
                        handleRemarkChange(student.studentId, e.target.value, selectedSession)
                      }
                      h="32px"
                      fontSize="12px"
                      borderRadius="lg"
                      bg="#F8FAFC"
                      border="1px solid #E2E8F0"
                    />
                  </Box>
                );
              })}
            </Flex>
          ) : (
            <Box p={8} textAlign="center" bg="white" borderRadius="2xl" border="1px solid #E2E8F0" color="#94A3B8">
              {searchQuery ? `No students matching "${searchQuery}"` : "No students enrolled in this class yet."}
            </Box>
          )}

          {/* Mobile Bottom Save Button */}
          {filteredRoster.length > 0 && (
            <Box mt={4}>
              <Button
                w="100%"
                h="44px"
                bg="linear-gradient(135deg, #10B981 0%, #059669 100%)"
                color="white"
                borderRadius="xl"
                fontWeight="800"
                fontSize="14px"
                boxShadow="0 4px 14px rgba(16, 185, 129, 0.3)"
                onClick={handleSaveAttendance}
                loading={saving}
              >
                <Icon as={FaSave} mr={2} boxSize={4} />
                Save Attendance ({selectedSession === "both" ? "Full Day" : selectedSession === "morning" ? "Morning" : "Afternoon"})
              </Button>
            </Box>
          )}
        </Box>

        {/* ========================================================
            VIEW 2: DESKTOP TABLE (Visible on desktop screens: >= md)
           ======================================================== */}
        <Box
          display={{ base: "none", md: "block" }}
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
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#64748B", width: "50px" }}>
                    S/N
                  </th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#64748B" }}>
                    STUDENT NAME
                  </th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#64748B" }}>
                    STUDENT CODE
                  </th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#64748B", width: "90px" }}>
                    GENDER
                  </th>

                  {/* Dynamic Column Headers */}
                  {selectedSession === "both" ? (
                    <>
                      <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#D97706", textAlign: "center", background: "#FFFBEB" }}>
                        ☀️ MORNING (AM)
                      </th>
                      <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#2563EB", textAlign: "center", background: "#EFF6FF" }}>
                        🌤️ AFTERNOON (PM)
                      </th>
                      <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#64748B", textAlign: "center", width: "110px" }}>
                        SYNC
                      </th>
                    </>
                  ) : selectedSession === "morning" ? (
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#D97706", textAlign: "center", background: "#FFFBEB" }}>
                      ☀️ MORNING (AM) STATUS
                    </th>
                  ) : (
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#2563EB", textAlign: "center", background: "#EFF6FF" }}>
                      🌤️ AFTERNOON (PM) STATUS
                    </th>
                  )}

                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#64748B", width: "160px" }}>
                    REMARK
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={selectedSession === "both" ? 8 : 6}
                      style={{ padding: "40px", textAlign: "center", color: "#64748B" }}
                    >
                      Loading class roster...
                    </td>
                  </tr>
                ) : filteredRoster.length ? (
                  filteredRoster.map((student, idx) => {
                    const mStatus = student.morningStatus || "present";
                    const aStatus = student.afternoonStatus || "present";

                    return (
                      <tr
                        key={student.studentId}
                        style={{
                          borderBottom: "1px solid #F1F5F9",
                          background: idx % 2 === 0 ? "white" : "#FAFAFA",
                        }}
                      >
                        <td style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B", fontWeight: "600" }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <Text fontWeight="800" color="#0F172A" fontSize="13px">
                            {student.name}
                          </Text>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "12px", color: "#4338CA", fontWeight: "700" }}>
                          {student.studentCode || "-"}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B", textTransform: "capitalize" }}>
                          {student.gender || "-"}
                        </td>

                        {/* Session Status Selectors */}
                        {selectedSession === "both" ? (
                          <>
                            {/* Morning Session Buttons */}
                            <td style={{ padding: "10px 14px", textAlign: "center", background: "#FFFDF5" }}>
                              <Flex justify="center" gap={1}>
                                {renderDesktopBtn("P", mStatus, "present", "#10B981", "white", () =>
                                  handleMorningStatusChange(student.studentId, "present")
                                )}
                                {renderDesktopBtn("A", mStatus, "absent", "#EF4444", "white", () =>
                                  handleMorningStatusChange(student.studentId, "absent")
                                )}
                                {renderDesktopBtn("L", mStatus, "late", "#F59E0B", "white", () =>
                                  handleMorningStatusChange(student.studentId, "late")
                                )}
                                {renderDesktopBtn("E", mStatus, "excused", "#3B82F6", "white", () =>
                                  handleMorningStatusChange(student.studentId, "excused")
                                )}
                              </Flex>
                            </td>

                            {/* Afternoon Session Buttons */}
                            <td style={{ padding: "10px 14px", textAlign: "center", background: "#F8FAFF" }}>
                              <Flex justify="center" gap={1}>
                                {renderDesktopBtn("P", aStatus, "present", "#10B981", "white", () =>
                                  handleAfternoonStatusChange(student.studentId, "present")
                                )}
                                {renderDesktopBtn("A", aStatus, "absent", "#EF4444", "white", () =>
                                  handleAfternoonStatusChange(student.studentId, "absent")
                                )}
                                {renderDesktopBtn("L", aStatus, "late", "#F59E0B", "white", () =>
                                  handleAfternoonStatusChange(student.studentId, "late")
                                )}
                                {renderDesktopBtn("E", aStatus, "excused", "#3B82F6", "white", () =>
                                  handleAfternoonStatusChange(student.studentId, "excused")
                                )}
                              </Flex>
                            </td>

                            {/* Quick Sync Button */}
                            <td style={{ padding: "10px 14px", textAlign: "center" }}>
                              <Button
                                size="xs"
                                variant="ghost"
                                color="#6366F1"
                                fontSize="11px"
                                fontWeight="700"
                                h="24px"
                                onClick={() => handleSyncStudentToAfternoon(student.studentId)}
                                title="Copy Morning Status to Afternoon"
                              >
                                Sync to PM
                              </Button>
                            </td>
                          </>
                        ) : selectedSession === "morning" ? (
                          <td style={{ padding: "10px 14px", textAlign: "center", background: "#FFFDF5" }}>
                            <Flex justify="center" gap={1.5}>
                              {renderDesktopBtn("Present", mStatus, "present", "#10B981", "white", () =>
                                handleMorningStatusChange(student.studentId, "present")
                              )}
                              {renderDesktopBtn("Absent", mStatus, "absent", "#EF4444", "white", () =>
                                handleMorningStatusChange(student.studentId, "absent")
                              )}
                              {renderDesktopBtn("Late", mStatus, "late", "#F59E0B", "white", () =>
                                handleMorningStatusChange(student.studentId, "late")
                              )}
                              {renderDesktopBtn("Excused", mStatus, "excused", "#3B82F6", "white", () =>
                                handleMorningStatusChange(student.studentId, "excused")
                              )}
                            </Flex>
                          </td>
                        ) : (
                          <td style={{ padding: "10px 14px", textAlign: "center", background: "#F8FAFF" }}>
                            <Flex justify="center" gap={1.5} align="center">
                              {renderDesktopBtn("Present", aStatus, "present", "#10B981", "white", () =>
                                handleAfternoonStatusChange(student.studentId, "present")
                              )}
                              {renderDesktopBtn("Absent", aStatus, "absent", "#EF4444", "white", () =>
                                handleAfternoonStatusChange(student.studentId, "absent")
                              )}
                              {renderDesktopBtn("Late", aStatus, "late", "#F59E0B", "white", () =>
                                handleAfternoonStatusChange(student.studentId, "late")
                              )}
                              {renderDesktopBtn("Excused", aStatus, "excused", "#3B82F6", "white", () =>
                                handleAfternoonStatusChange(student.studentId, "excused")
                              )}
                              <Badge
                                fontSize="10px"
                                bg="#F1F5F9"
                                color="#64748B"
                                px={1.5}
                                py={0.5}
                                borderRadius="sm"
                                title={`Morning was: ${mStatus.toUpperCase()}`}
                              >
                                AM: {mStatus[0].toUpperCase()}
                              </Badge>
                            </Flex>
                          </td>
                        )}

                        {/* Remark Field */}
                        <td style={{ padding: "8px 14px" }}>
                          <Input
                            placeholder="Remark..."
                            value={
                              selectedSession === "morning"
                                ? student.morningRemark || ""
                                : selectedSession === "afternoon"
                                ? student.afternoonRemark || ""
                                : student.morningRemark || student.remark || ""
                            }
                            onChange={(e) =>
                              handleRemarkChange(student.studentId, e.target.value, selectedSession)
                            }
                            h="30px"
                            fontSize="11px"
                            borderRadius="lg"
                            bg="white"
                            border="1px solid #E2E8F0"
                          />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={selectedSession === "both" ? 8 : 6}
                      style={{ padding: "36px", textAlign: "center", color: "#94A3B8" }}
                    >
                      {searchQuery
                        ? `No students matching "${searchQuery}" in this class.`
                        : "No students enrolled in this class yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>

          {/* Table Bottom Footer Summary */}
          {filteredRoster.length > 0 && (
            <Flex
              p={3}
              bg="#F8FAFC"
              borderTop="1px solid #E2E8F0"
              justify="space-between"
              align="center"
              flexWrap="wrap"
              gap={2}
            >
              <Text fontSize="12px" color="#64748B" fontWeight="600">
                P = Present &bull; A = Absent &bull; L = Late &bull; E = Excused
              </Text>
              <Button
                size="sm"
                bg="linear-gradient(135deg, #10B981 0%, #059669 100%)"
                color="white"
                borderRadius="xl"
                px={5}
                h="36px"
                fontWeight="800"
                fontSize="13px"
                onClick={handleSaveAttendance}
                loading={saving}
              >
                <Icon as={FaSave} mr={1.5} boxSize={3.5} />
                Save Attendance ({selectedSession === "both" ? "Full Day" : selectedSession === "morning" ? "Morning" : "Afternoon"})
              </Button>
            </Flex>
          )}
        </Box>
      </Box>
    </DashboardLayout>
  );
}
