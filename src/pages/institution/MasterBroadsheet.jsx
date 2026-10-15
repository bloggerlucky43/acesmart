import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
  Input,
  SimpleGrid,
  HStack,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import {
  FaTable,
  FaPrint,
  FaFileExcel,
  FaUsers,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaShareSquare,
  FaSyncAlt,
  FaSave,
  FaSearch,
  FaArrowRight,
  FaGraduationCap,
  FaFilter,
} from "react-icons/fa";
import DashboardLayout from "../../constants/dashboardlayout";
import {
  getInstitutionProfileApi,
  getClassArmsApi,
  getBroadsheetDataApi,
  savePromotionDecisionsApi,
  rolloverPromotedStudentsApi,
} from "../../api-endpoint/sms/smsEndpoints";
import { useAuth } from "../../libs/AuthProvider";
import { toaster } from "../../components/ui/toaster";
import { formatStudentName } from "../../libs/helper";

export default function MasterBroadsheet() {
  const { user } = useAuth();

  // Core Data
  const [profile, setProfile] = useState(null);
  const [classArms, setClassArms] = useState([]);
  const [selectedClassArm, setSelectedClassArm] = useState("");
  const [academicSession, setAcademicSession] = useState("2025/2026");
  const [termFilter, setTermFilter] = useState("all"); // "all" | "First Term" | "Second Term" | "Third Term"

  // Broadsheet State
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ totalStudents: 0, promoted: 0, trial: 0, repeat: 0, rolledOver: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("cumulative"); // "cumulative" | "breakdown"

  // Mutation State
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [rolloverModalOpen, setRolloverModalOpen] = useState(false);
  const [targetClassArmId, setTargetClassArmId] = useState("");
  const [rollingOver, setRollingOver] = useState(false);

  // Load Classes & Profile on Mount
  useEffect(() => {
    const init = async () => {
      try {
        const [profRes, classRes] = await Promise.all([
          getInstitutionProfileApi().catch(() => null),
          getClassArmsApi().catch(() => null),
        ]);

        if (profRes?.success) {
          setProfile(profRes.data);
          if (profRes.data.academicSession) {
            setAcademicSession(profRes.data.academicSession);
          }
        }
        if (classRes?.success && classRes.data?.length > 0) {
          setClassArms(classRes.data);
          setSelectedClassArm(classRes.data[0].id);
        }
      } catch (err) {
        console.error("Init broadsheet error:", err);
      }
    };
    init();
  }, []);

  // Fetch Broadsheet Data whenever classArm, session, or term changes
  const fetchBroadsheet = async () => {
    if (!selectedClassArm) return;
    setLoading(true);
    try {
      const res = await getBroadsheetDataApi({
        classArmId: selectedClassArm,
        academicSession,
        term: termFilter,
      });

      if (res?.success) {
        setSubjects(res.subjects || []);
        setRows(res.broadsheet || []);
        setSummary(res.summary || { totalStudents: 0, promoted: 0, trial: 0, repeat: 0, rolledOver: 0 });
        setHasUnsavedChanges(false);
      } else {
        toaster.create({
          title: "Failed to fetch broadsheet",
          description: res?.message || "Check your network connection",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Fetch broadsheet error:", err);
      toaster.create({
        title: "Broadsheet error",
        description: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassArm) {
      fetchBroadsheet();
    }
  }, [selectedClassArm, academicSession, termFilter]);

  const school = profile || user?.institution || {};
  const currentClassName = classArms.find((c) => String(c.id) === String(selectedClassArm))?.name || "Class Arm";

  // Filtered rows by search
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase().trim();
    return rows.filter((r) =>
      (r.student.name || "").toLowerCase().includes(q) ||
      (r.student.studentId || "").toLowerCase().includes(q)
    );
  }, [rows, searchQuery]);

  // Handle local status change
  const handleStatusChange = (studentId, newStatus) => {
    setRows((prev) =>
      prev.map((r) => (r.student.id === studentId ? { ...r, promotionStatus: newStatus } : r))
    );
    setHasUnsavedChanges(true);
  };

  // Handle local remark change
  const handleRemarkChange = (studentId, newRemark) => {
    setRows((prev) =>
      prev.map((r) => (r.student.id === studentId ? { ...r, principalRemark: newRemark } : r))
    );
    setHasUnsavedChanges(true);
  };

  // Save All Promotion Decisions to Server
  const handleSaveDecisions = async () => {
    setSaving(true);
    try {
      const decisions = rows.map((r) => ({
        studentId: r.student.id,
        term1Average: r.term1Average,
        term2Average: r.term2Average,
        term3Average: r.term3Average,
        cumulativeAverage: r.cumulativeAverage,
        annualRank: r.annualRank,
        promotionStatus: r.promotionStatus,
        targetClassArmId: r.targetClassArmId,
        principalRemark: r.principalRemark,
      }));

      const res = await savePromotionDecisionsApi({
        classArmId: selectedClassArm,
        academicSession,
        decisions,
      });

      if (res?.success) {
        toaster.create({
          title: "Promotion decisions saved",
          description: res.message || "All student records updated successfully",
          type: "success",
        });
        setHasUnsavedChanges(false);
      } else {
        toaster.create({
          title: "Save failed",
          description: res?.message,
          type: "error",
        });
      }
    } catch (err) {
      console.error("Save promotion decisions error:", err);
      toaster.create({
        title: "Save failed",
        description: err.message,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Execute Batch Rollover to next class
  const handleExecuteRollover = async () => {
    if (!targetClassArmId) {
      toaster.create({
        title: "Destination class required",
        description: "Please choose which class arm students should be promoted to.",
        type: "warning",
      });
      return;
    }

    setRollingOver(true);
    try {
      const eligibleStudentIds = rows
        .filter((r) => (r.promotionStatus === "promoted" || r.promotionStatus === "promoted_on_trial") && !r.isRolledOver)
        .map((r) => r.student.id);

      if (eligibleStudentIds.length === 0) {
        toaster.create({
          title: "No eligible students",
          description: "There are no pending promoted students to rollover.",
          type: "warning",
        });
        setRolloverModalOpen(false);
        return;
      }

      const res = await rolloverPromotedStudentsApi({
        classArmId: selectedClassArm,
        academicSession,
        targetClassArmId,
        studentIds: eligibleStudentIds,
      });

      if (res?.success) {
        toaster.create({
          title: "Batch rollover completed!",
          description: res.message,
          type: "success",
        });
        setRolloverModalOpen(false);
        fetchBroadsheet();
      } else {
        toaster.create({
          title: "Rollover error",
          description: res?.message,
          type: "error",
        });
      }
    } catch (err) {
      console.error("Rollover error:", err);
      toaster.create({
        title: "Rollover failed",
        description: err.message,
        type: "error",
      });
    } finally {
      setRollingOver(false);
    }
  };

  // Export to Excel Sheet (.xlsx)
  const handleExportExcel = () => {
    if (rows.length === 0) return;

    const data = rows.map((r) => {
      const rowObj = {
        "Annual Rank": r.annualRank,
        "Student Name": r.student.name,
        "Student ID": r.student.studentId,
        "Gender": r.student.gender || "N/A",
        "Term 1 Avg": r.term1Average,
        "Term 2 Avg": r.term2Average,
        "Term 3 Avg": r.term3Average,
        "Cumulative Annual Avg (%)": r.cumulativeAverage,
        "Promotion Status": r.promotionStatus.toUpperCase(),
        "Rolled Over": r.isRolledOver ? "YES" : "NO",
        "Principal Remark": r.principalRemark || "",
      };

      // Append subject columns
      subjects.forEach((subj) => {
        const item = r.subjectGrades?.[subj];
        rowObj[`${subj} (Avg)`] = item?.annualAverage !== null ? item?.annualAverage : "N/A";
      });

      return rowObj;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${currentClassName.slice(0, 25)} Broadsheet`);
    XLSX.writeFile(workbook, `${currentClassName.replace(/\s+/g, "_")}_Master_Broadsheet_${academicSession.replace("/", "-")}.xlsx`);

    toaster.create({
      title: "Excel downloaded",
      description: "Broadsheet spreadsheet saved to your downloads",
      type: "success",
    });
  };

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <Box
        p={{ base: 3, md: 6, lg: 8 }}
        pt={{ base: "84px", md: "88px" }}
        pl={{ base: 3, lg: "260px" }}
        maxW="1600px"
        mx="auto"
      >
        {/* ========================================================
            PRINT STYLESHEET: Optimized A3/A4 Landscape Table
           ======================================================== */}
        <style>{`
          @media print {
            body, html {
              background: #FFFFFF !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
              font-size: 8pt !important;
            }
            nav, header, aside, .no-print, button, input, select {
              display: none !important;
            }
            .print-broadsheet-container {
              display: block !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            @page {
              size: A4 landscape;
              margin: 8mm 6mm;
            }
            table {
              width: 100% !important;
              border-collapse: collapse !important;
            }
            th, td {
              border: 1px solid #64748B !important;
              padding: 3px 5px !important;
              text-align: center !important;
              font-size: 7.5pt !important;
            }
            th {
              background-color: #F1F5F9 !important;
              font-weight: bold !important;
            }
          }
          @media screen {
            .print-broadsheet-container {
              display: none;
            }
          }
        `}</style>

        {/* ========================================================
            HERO HEADER
           ======================================================== */}
        <Box
          className="no-print"
          borderRadius="2xl"
          bg="linear-gradient(135deg, #0F172A 0%, #1E293B 100%)"
          color="white"
          p={{ base: 5, md: 7 }}
          mb={6}
          boxShadow="0 10px 25px rgba(15, 23, 42, 0.25)"
          border="1px solid #334155"
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            gap={4}
          >
            <Flex align="center" gap={4}>
              <Flex
                w="60px"
                h="60px"
                borderRadius="xl"
                bg="rgba(56, 189, 248, 0.15)"
                border="1px solid rgba(56, 189, 248, 0.3)"
                align="center"
                justify="center"
                color="#38BDF8"
                flexShrink={0}
              >
                <Icon as={FaTable} boxSize={7} />
              </Flex>

              <Box>
                <HStack spacing={2} mb={1}>
                  <Text fontSize={{ base: "20px", md: "24px" }} fontWeight="900" letterSpacing="-0.5px">
                    Master Broadsheet & Cumulative Promotion
                  </Text>
                  <Badge bg="#10B981" color="white" fontSize="10px" px={2} py={0.5} borderRadius="full">
                    3-TERM AGGREGATOR
                  </Badge>
                </HStack>
                <Text fontSize="13px" color="#94A3B8">
                  {school.name || "School"} • <strong>{currentClassName}</strong> • Academic Session: <strong>{academicSession}</strong>
                </Text>
              </Box>
            </Flex>

            {/* Quick Action Buttons */}
            <HStack spacing={3} flexWrap="wrap">
              <Button
                size="sm"
                bg="#334155"
                color="white"
                borderRadius="xl"
                _hover={{ bg: "#475569" }}
                onClick={fetchBroadsheet}
                disabled={loading}
              >
                <Icon as={FaSyncAlt} mr={1.5} boxSize={3} />
                Refresh
              </Button>

              <Button
                size="sm"
                bg="#15803D"
                color="white"
                borderRadius="xl"
                _hover={{ bg: "#166534" }}
                onClick={handleExportExcel}
                disabled={rows.length === 0}
              >
                <Icon as={FaFileExcel} mr={1.5} boxSize={3.5} />
                Export Excel
              </Button>

              <Button
                size="sm"
                variant="outline"
                borderColor="#475569"
                color="white"
                borderRadius="xl"
                _hover={{ bg: "rgba(255,255,255,0.1)" }}
                onClick={handlePrint}
                disabled={rows.length === 0}
              >
                <Icon as={FaPrint} mr={1.5} boxSize={3.5} />
                Print A4 Sheet
              </Button>

              <Button
                size="sm"
                bg="linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)"
                color="white"
                borderRadius="xl"
                boxShadow="0 4px 14px rgba(37, 99, 235, 0.4)"
                _hover={{ opacity: 0.95 }}
                onClick={handleSaveDecisions}
                disabled={saving || rows.length === 0}
              >
                <Icon as={FaSave} mr={1.5} boxSize={3.5} />
                {saving ? "Saving..." : hasUnsavedChanges ? "Save Decisions (Pending)" : "Save Decisions"}
              </Button>
            </HStack>
          </Flex>
        </Box>

        {/* ========================================================
            SUMMARY STAT CARDS
           ======================================================== */}
        <SimpleGrid columns={{ base: 2, sm: 2, md: 5 }} gap={4} mb={6} className="no-print">
          <Box bg="white" p={4} borderRadius="2xl" border="1px solid #E2E8F0" boxShadow="0 2px 8px rgba(0,0,0,0.02)">
            <Text fontSize="11px" fontWeight="700" color="#64748B" textTransform="uppercase">
              Class Roster
            </Text>
            <Text fontSize="24px" fontWeight="900" color="#0F172A" mt={1}>
              {summary.totalStudents}
            </Text>
            <Text fontSize="11px" color="#94A3B8" mt={0.5}>
              Enrolled students
            </Text>
          </Box>

          <Box bg="white" p={4} borderRadius="2xl" border="1px solid #DCFCE7" boxShadow="0 2px 8px rgba(0,0,0,0.02)">
            <Text fontSize="11px" fontWeight="700" color="#166534" textTransform="uppercase">
              Promoted
            </Text>
            <Text fontSize="24px" fontWeight="900" color="#16A34A" mt={1}>
              {summary.promoted}
            </Text>
            <Text fontSize="11px" color="#15803D" mt={0.5}>
              Cumulative Avg &ge; 50%
            </Text>
          </Box>

          <Box bg="white" p={4} borderRadius="2xl" border="1px solid #FEF3C7" boxShadow="0 2px 8px rgba(0,0,0,0.02)">
            <Text fontSize="11px" fontWeight="700" color="#B45309" textTransform="uppercase">
              Promoted on Trial
            </Text>
            <Text fontSize="24px" fontWeight="900" color="#D97706" mt={1}>
              {summary.trial}
            </Text>
            <Text fontSize="11px" color="#B45309" mt={0.5}>
              Borderline 42% - 49%
            </Text>
          </Box>

          <Box bg="white" p={4} borderRadius="2xl" border="1px solid #FEE2E2" boxShadow="0 2px 8px rgba(0,0,0,0.02)">
            <Text fontSize="11px" fontWeight="700" color="#991B1B" textTransform="uppercase">
              Repeat Class
            </Text>
            <Text fontSize="24px" fontWeight="900" color="#DC2626" mt={1}>
              {summary.repeat}
            </Text>
            <Text fontSize="11px" color="#991B1B" mt={0.5}>
              Under Benchmark
            </Text>
          </Box>

          <Box bg="white" p={4} borderRadius="2xl" border="1px solid #DBEAFE" boxShadow="0 2px 8px rgba(0,0,0,0.02)">
            <Text fontSize="11px" fontWeight="700" color="#1E40AF" textTransform="uppercase">
              Rolled Over
            </Text>
            <Text fontSize="24px" fontWeight="900" color="#2563EB" mt={1}>
              {summary.rolledOver}
            </Text>
            <Button
              size="xs"
              colorScheme="blue"
              variant="link"
              mt={0.5}
              fontSize="11px"
              fontWeight="bold"
              onClick={() => setRolloverModalOpen(true)}
            >
              Batch Rollover &rarr;
            </Button>
          </Box>
        </SimpleGrid>

        {/* ========================================================
            FILTER & CONTROLS TOOLBAR
           ======================================================== */}
        <Box
          className="no-print"
          bg="white"
          borderRadius="2xl"
          p={{ base: 4, md: 5 }}
          mb={6}
          border="1px solid #E2E8F0"
        >
          <Flex
            direction={{ base: "column", lg: "row" }}
            justify="space-between"
            align={{ base: "stretch", lg: "center" }}
            gap={4}
          >
            {/* Class Arm & Session Selectors */}
            <Flex wrap="wrap" gap={3} align="center">
              <Box minW="200px">
                <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1} textTransform="uppercase">
                  Class Arm:
                </Text>
                <select
                  style={{
                    width: "100%",
                    height: "38px",
                    borderRadius: "10px",
                    border: "1px solid #CBD5E1",
                    background: "#FFFFFF",
                    padding: "0 12px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#0F172A",
                    outline: "none",
                  }}
                  value={selectedClassArm}
                  onChange={(e) => setSelectedClassArm(e.target.value)}
                >
                  {classArms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Box>

              <Box minW="140px">
                <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1} textTransform="uppercase">
                  Session:
                </Text>
                <select
                  style={{
                    width: "100%",
                    height: "38px",
                    borderRadius: "10px",
                    border: "1px solid #CBD5E1",
                    background: "#FFFFFF",
                    padding: "0 12px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#0F172A",
                    outline: "none",
                  }}
                  value={academicSession}
                  onChange={(e) => setAcademicSession(e.target.value)}
                >
                  <option value="2025/2026">2025/2026</option>
                  <option value="2026/2027">2026/2027</option>
                  <option value="2024/2025">2024/2025</option>
                </select>
              </Box>

              <Box minW="150px">
                <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1} textTransform="uppercase">
                  Term Scope:
                </Text>
                <select
                  style={{
                    width: "100%",
                    height: "38px",
                    borderRadius: "10px",
                    border: "1px solid #CBD5E1",
                    background: "#FFFFFF",
                    padding: "0 12px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#0F172A",
                    outline: "none",
                  }}
                  value={termFilter}
                  onChange={(e) => setTermFilter(e.target.value)}
                >
                  <option value="all">Annual 3-Term Cumulative</option>
                  <option value="First Term">First Term Only</option>
                  <option value="Second Term">Second Term Only</option>
                  <option value="Third Term">Third Term Only</option>
                </select>
              </Box>
            </Flex>

            {/* View Mode & Search */}
            <Flex wrap="wrap" gap={3} align="center">
              {/* View Switcher */}
              <HStack bg="#FFFFFF" border="1px solid #CBD5E1" p="3px" borderRadius="xl">
                <Button
                  size="xs"
                  borderRadius="lg"
                  px={3}
                  h="30px"
                  fontWeight="bold"
                  bg={viewMode === "cumulative" ? "#0F172A" : "transparent"}
                  color={viewMode === "cumulative" ? "white" : "#64748B"}
                  _hover={{ bg: viewMode === "cumulative" ? "#0F172A" : "#F8FAFC" }}
                  onClick={() => setViewMode("cumulative")}
                >
                  Cumulative Matrix
                </Button>
                <Button
                  size="xs"
                  borderRadius="lg"
                  px={3}
                  h="30px"
                  fontWeight="bold"
                  bg={viewMode === "breakdown" ? "#0F172A" : "transparent"}
                  color={viewMode === "breakdown" ? "white" : "#64748B"}
                  _hover={{ bg: viewMode === "breakdown" ? "#0F172A" : "#F8FAFC" }}
                  onClick={() => setViewMode("breakdown")}
                >
                  All Subjects Breakdown
                </Button>
              </HStack>

              {/* Student Search */}
              <Flex
                align="center"
                bg="#FFFFFF"
                border="1px solid #CBD5E1"
                borderRadius="xl"
                px={3}
                h="38px"
                minW="240px"
                _focusWithin={{ borderColor: "#4F46E5", boxShadow: "0 0 0 2px rgba(79, 70, 229, 0.15)" }}
                transition="all 0.2s"
              >
                <Icon as={FaSearch} color="#94A3B8" mr={2.5} boxSize={3.5} />
                <Input
                  variant="unstyled"
                  placeholder="Filter student name or ID..."
                  fontSize="13px"
                  color="#0F172A"
                  bg="transparent"
                  border="none"
                  outline="none"
                  _focus={{ border: "none", outline: "none", boxShadow: "none" }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Flex>
            </Flex>
          </Flex>
        </Box>

        {/* ========================================================
            MASTER BROADSHEET TABLE (RESPONSIVE SCROLL MATRIX)
           ======================================================== */}
        <Box
          className="no-print"
          bg="white"
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          boxShadow="0 4px 15px rgba(0,0,0,0.03)"
          overflow="hidden"
          mb={8}
        >
          {loading ? (
            <Flex justify="center" align="center" p={16} direction="column" gap={3}>
              <Spinner size="xl" color="#2563EB" />
              <Text fontSize="14px" fontWeight="bold" color="#64748B">
                Aggregating 3-term scores and student positions...
              </Text>
            </Flex>
          ) : filteredRows.length === 0 ? (
            <Box p={12} textAlign="center">
              <Icon as={FaTable} boxSize={12} color="#CBD5E1" mb={3} />
              <Text fontSize="16px" fontWeight="bold" color="#0F172A">
                No broadsheet records found
              </Text>
              <Text fontSize="13px" color="#64748B" mt={1}>
                No student results have been recorded for {currentClassName} in session {academicSession}.
              </Text>
            </Box>
          ) : (
            <Box overflowX="auto" maxW="100%">
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                <thead>
                  <tr style={{ background: "#0F172A", color: "#F8FAFC", textAlign: "left", fontSize: "11px", letterSpacing: "0.5px" }}>
                    <th style={{ padding: "12px 14px", width: "60px", textAlign: "center" }}>RANK</th>
                    <th style={{ padding: "12px 14px", minWidth: "180px" }}>STUDENT NAME</th>
                    <th style={{ padding: "12px 14px", width: "110px" }}>STUDENT ID</th>

                    {/* View Mode: Cumulative vs Breakdown */}
                    {viewMode === "cumulative" ? (
                      <>
                        <th style={{ padding: "12px 10px", textAlign: "center", width: "90px" }}>TERM 1 (%)</th>
                        <th style={{ padding: "12px 10px", textAlign: "center", width: "90px" }}>TERM 2 (%)</th>
                        <th style={{ padding: "12px 10px", textAlign: "center", width: "90px" }}>TERM 3 (%)</th>
                        <th style={{ padding: "12px 10px", textAlign: "center", width: "110px", background: "#1E293B" }}>CUMULATIVE AVG</th>
                        <th style={{ padding: "12px 14px", minWidth: "160px" }}>PROMOTION STATUS</th>
                        <th style={{ padding: "12px 14px", minWidth: "200px" }}>PRINCIPAL REMARK</th>
                      </>
                    ) : (
                      <>
                        {subjects.map((subj) => (
                          <th key={subj} style={{ padding: "12px 10px", textAlign: "center", minWidth: "85px" }}>
                            {subj.toUpperCase()}
                          </th>
                        ))}
                        <th style={{ padding: "12px 10px", textAlign: "center", minWidth: "100px", background: "#1E293B" }}>
                          CUMULATIVE (%)
                        </th>
                        <th style={{ padding: "12px 14px", minWidth: "150px" }}>PROMOTION</th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((r, idx) => {
                    const isEven = idx % 2 === 0;
                    return (
                      <tr
                        key={r.student.id}
                        style={{
                          background: isEven ? "#FFFFFF" : "#F8FAFC",
                          borderBottom: "1px solid #E2E8F0",
                          fontSize: "12.5px",
                        }}
                      >
                        {/* Rank */}
                        <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: "900", color: "#0F172A" }}>
                          <Flex
                            w="28px"
                            h="28px"
                            borderRadius="full"
                            bg={r.annualRank <= 3 ? "#FEF3C7" : "#F1F5F9"}
                            color={r.annualRank <= 3 ? "#B45309" : "#475569"}
                            align="center"
                            justify="center"
                            mx="auto"
                            fontSize="11.5px"
                            fontWeight="900"
                          >
                            {r.annualRank}
                          </Flex>
                        </td>

                        {/* Student Name */}
                        <td style={{ padding: "10px 14px" }}>
                          <Flex align="center" gap={2.5}>
                            <Box>
                              <Text fontWeight="800" color="#0F172A">
                                {formatStudentName(r.student.name)}
                              </Text>
                              <HStack spacing={1}>
                                <Text fontSize="10.5px" color="#64748B">
                                  {r.student.gender || "Student"}
                                </Text>
                                {r.isRolledOver && (
                                  <Badge bg="#EFF6FF" color="#1E40AF" fontSize="9px" px={1} py={0}>
                                    ROLLED OVER
                                  </Badge>
                                )}
                              </HStack>
                            </Box>
                          </Flex>
                        </td>

                        {/* Student ID */}
                        <td style={{ padding: "10px 14px", color: "#64748B", fontWeight: "600", fontSize: "11px" }}>
                          {r.student.studentId}
                        </td>

                        {/* View Mode columns */}
                        {viewMode === "cumulative" ? (
                          <>
                            {/* Term 1 */}
                            <td style={{ padding: "10px 10px", textAlign: "center", fontWeight: "700", color: r.term1Average >= 50 ? "#166534" : "#991B1B" }}>
                              {r.term1Average > 0 ? `${r.term1Average}%` : "-"}
                            </td>

                            {/* Term 2 */}
                            <td style={{ padding: "10px 10px", textAlign: "center", fontWeight: "700", color: r.term2Average >= 50 ? "#166534" : "#991B1B" }}>
                              {r.term2Average > 0 ? `${r.term2Average}%` : "-"}
                            </td>

                            {/* Term 3 */}
                            <td style={{ padding: "10px 10px", textAlign: "center", fontWeight: "700", color: r.term3Average >= 50 ? "#166534" : "#991B1B" }}>
                              {r.term3Average > 0 ? `${r.term3Average}%` : "-"}
                            </td>

                            {/* Cumulative Average */}
                            <td style={{ padding: "10px 10px", textAlign: "center", background: "#F1F5F9" }}>
                              <Badge
                                bg={r.cumulativeAverage >= 50 ? "#DCFCE7" : r.cumulativeAverage >= 42 ? "#FEF3C7" : "#FEE2E2"}
                                color={r.cumulativeAverage >= 50 ? "#166534" : r.cumulativeAverage >= 42 ? "#B45309" : "#991B1B"}
                                fontSize="12px"
                                fontWeight="900"
                                px={2}
                                py={0.5}
                                borderRadius="md"
                              >
                                {r.cumulativeAverage}%
                              </Badge>
                            </td>

                            {/* Promotion Status Selector */}
                            <td style={{ padding: "10px 14px" }}>
                              <select
                                style={{
                                  width: "100%",
                                  height: "32px",
                                  borderRadius: "8px",
                                  border: "1px solid #CBD5E1",
                                  background: r.promotionStatus === "promoted" ? "#F0FDF4" : r.promotionStatus === "promoted_on_trial" ? "#FFFBEB" : "#FEF2F2",
                                  color: r.promotionStatus === "promoted" ? "#166534" : r.promotionStatus === "promoted_on_trial" ? "#B45309" : "#991B1B",
                                  padding: "0 8px",
                                  fontSize: "11.5px",
                                  fontWeight: "800",
                                  outline: "none",
                                }}
                                value={r.promotionStatus}
                                onChange={(e) => handleStatusChange(r.student.id, e.target.value)}
                              >
                                <option value="promoted">🟢 PROMOTED</option>
                                <option value="promoted_on_trial">🟡 PROMOTED ON TRIAL</option>
                                <option value="repeat">🔴 REPEAT CLASS</option>
                                <option value="withdrawn">⚫ WITHDRAWN</option>
                              </select>
                            </td>

                            {/* Principal Remark Input */}
                            <td style={{ padding: "10px 14px" }}>
                              <Input
                                size="xs"
                                borderRadius="md"
                                bg="white"
                                border="1px solid #CBD5E1"
                                _focus={{ borderColor: "#4F46E5", bg: "white" }}
                                placeholder="Endorsement remark..."
                                fontSize="11.5px"
                                value={r.principalRemark}
                                onChange={(e) => handleRemarkChange(r.student.id, e.target.value)}
                              />
                            </td>
                          </>
                        ) : (
                          <>
                            {/* Subject Marks Breakdown */}
                            {subjects.map((subj) => {
                              const item = r.subjectGrades?.[subj];
                              const score = item?.annualAverage;
                              return (
                                <td
                                  key={subj}
                                  style={{
                                    padding: "10px 8px",
                                    textAlign: "center",
                                    fontWeight: "700",
                                    fontSize: "11px",
                                    color: score === null ? "#94A3B8" : score >= 50 ? "#166534" : "#DC2626",
                                  }}
                                >
                                  {score !== null && score !== undefined ? score : "-"}
                                </td>
                              );
                            })}

                            {/* Cumulative Score */}
                            <td style={{ padding: "10px 10px", textAlign: "center", background: "#F1F5F9", fontWeight: "900" }}>
                              {r.cumulativeAverage}%
                            </td>

                            {/* Promotion Badge */}
                            <td style={{ padding: "10px 14px" }}>
                              <Badge
                                bg={r.promotionStatus === "promoted" ? "#DCFCE7" : r.promotionStatus === "promoted_on_trial" ? "#FEF3C7" : "#FEE2E2"}
                                color={r.promotionStatus === "promoted" ? "#166534" : r.promotionStatus === "promoted_on_trial" ? "#B45309" : "#991B1B"}
                                fontSize="10.5px"
                                fontWeight="800"
                                px={2}
                                py={0.5}
                                borderRadius="md"
                              >
                                {r.promotionStatus.replace(/_/g, " ").toUpperCase()}
                              </Badge>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>
          )}
        </Box>

        {/* ========================================================
            BATCH ROLLOVER MODAL DIALOG
           ======================================================== */}
        {rolloverModalOpen && (
          <Box
            position="fixed"
            inset={0}
            bg="rgba(15, 23, 42, 0.6)"
            backdropFilter="blur(4px)"
            zIndex={1000}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
          >
            <Box bg="white" borderRadius="2xl" maxW="520px" w="100%" p={6} boxShadow="0 20px 40px rgba(0,0,0,0.2)">
              <Flex align="center" gap={3} mb={3}>
                <Flex w="44px" h="44px" borderRadius="xl" bg="#EFF6FF" color="#2563EB" align="center" justify="center">
                  <Icon as={FaShareSquare} boxSize={5} />
                </Flex>
                <Box>
                  <Text fontSize="18px" fontWeight="900" color="#0F172A">
                    Batch Session Promotion Rollover
                  </Text>
                  <Text fontSize="12px" color="#64748B">
                    From <strong>{currentClassName}</strong> &rarr; Next Academic Level
                  </Text>
                </Box>
              </Flex>

              <Text fontSize="13px" color="#334155" mb={4} lineHeight="1.5">
                This will automatically advance all students marked as <strong>PROMOTED</strong> or <strong>PROMOTED ON TRIAL</strong> into their destination class arm for the new academic session.
              </Text>

              <Box bg="#F8FAFC" p={3.5} borderRadius="xl" border="1px solid #E2E8F0" mb={4}>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="12px" color="#64748B">
                    Eligible for Promotion:
                  </Text>
                  <Badge bg="#10B981" color="white" borderRadius="full" px={2} py={0.5}>
                    {summary.promoted + summary.trial} Students
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="12px" color="#64748B">
                    Retained in Current Class (Repeat):
                  </Text>
                  <Badge bg="#EF4444" color="white" borderRadius="full" px={2} py={0.5}>
                    {summary.repeat} Students
                  </Badge>
                </HStack>
              </Box>

              <Box mb={5}>
                <Text fontSize="12px" fontWeight="700" color="#0F172A" mb={1}>
                  Select Destination Class Arm:
                </Text>
                <select
                  style={{
                    width: "100%",
                    height: "42px",
                    borderRadius: "12px",
                    border: "1px solid #CBD5E1",
                    background: "white",
                    padding: "0 12px",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#0F172A",
                    outline: "none",
                  }}
                  value={targetClassArmId}
                  onChange={(e) => setTargetClassArmId(e.target.value)}
                >
                  <option value="">-- Choose Target Class (e.g., JSS 2 Alpha) --</option>
                  {classArms
                    .filter((c) => String(c.id) !== String(selectedClassArm))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </Box>

              <Flex justify="flex-end" gap={3}>
                <Button
                  size="sm"
                  variant="outline"
                  borderRadius="xl"
                  onClick={() => setRolloverModalOpen(false)}
                  disabled={rollingOver}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  bg="#2563EB"
                  color="white"
                  borderRadius="xl"
                  _hover={{ bg: "#1D4ED8" }}
                  onClick={handleExecuteRollover}
                  disabled={rollingOver || !targetClassArmId}
                >
                  {rollingOver ? "Rolling over..." : "Confirm & Execute Rollover"}
                </Button>
              </Flex>
            </Box>
          </Box>
        )}

        {/* ========================================================
            PRINT ONLY VIEW: Official Landscape Master Broadsheet
           ======================================================== */}
        <Box className="print-broadsheet-container">
          {/* School Header */}
          <Box textAlign="center" mb={4}>
            <Text fontSize="16pt" fontWeight="900" textTransform="uppercase">
              {school.name || "INSTITUTIONAL ACADEMY"}
            </Text>
            <Text fontSize="9pt" color="#334155" fontStyle="italic">
              "{school.motto || "Excellence and Integrity"}" • {school.address || "Campus Address"}
            </Text>
            <Text fontSize="11pt" fontWeight="800" mt={1}>
              ANNUAL MASTER BROADSHEET & 3-TERM CUMULATIVE PROMOTION ROSTER
            </Text>
            <Text fontSize="9pt" fontWeight="bold">
              Class: {currentClassName} • Academic Session: {academicSession}
            </Text>
          </Box>

          {/* Broadsheet Table */}
          <table>
            <thead>
              <tr>
                <th style={{ width: "35px" }}>S/N</th>
                <th style={{ width: "40px" }}>RANK</th>
                <th style={{ textAlign: "left", width: "160px" }}>STUDENT NAME</th>
                <th style={{ width: "80px" }}>ID</th>
                <th style={{ width: "45px" }}>T1 (%)</th>
                <th style={{ width: "45px" }}>T2 (%)</th>
                <th style={{ width: "45px" }}>T3 (%)</th>
                <th style={{ width: "55px", fontWeight: "bold" }}>CUMULATIVE</th>
                <th style={{ width: "95px" }}>DECISION</th>
                <th style={{ textAlign: "left" }}>PRINCIPAL ENDORSEMENT</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.student.id}>
                  <td>{idx + 1}</td>
                  <td><strong>{r.annualRank}</strong></td>
                  <td style={{ textAlign: "left", fontWeight: "bold" }}>{formatStudentName(r.student.name)}</td>
                  <td>{r.student.studentId}</td>
                  <td>{r.term1Average > 0 ? r.term1Average : "-"}</td>
                  <td>{r.term2Average > 0 ? r.term2Average : "-"}</td>
                  <td>{r.term3Average > 0 ? r.term3Average : "-"}</td>
                  <td><strong>{r.cumulativeAverage}%</strong></td>
                  <td><strong>{r.promotionStatus.replace(/_/g, " ").toUpperCase()}</strong></td>
                  <td style={{ textAlign: "left", fontStyle: "italic" }}>{r.principalRemark || "Promoted"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Endorsement & Signature Footer */}
          <Flex justify="space-between" align="flex-end" mt={8} pt={4}>
            <Box textAlign="center" w="180px">
              <Box borderBottom="1px solid #000" h="40px" mb={1} />
              <Text fontSize="8pt" fontWeight="bold">Class Teacher Signature</Text>
            </Box>

            <Box textAlign="center" w="180px">
              <Box borderBottom="1px solid #000" h="40px" mb={1} />
              <Text fontSize="8pt" fontWeight="bold">Principal / Director Signature & Date</Text>
            </Box>
          </Flex>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
