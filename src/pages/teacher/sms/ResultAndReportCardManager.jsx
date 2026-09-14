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
  FaSyncAlt,
  FaSave,
  FaPrint,
  FaFileInvoice,
  FaCheckCircle,
  FaTable,
  FaBrain,
} from "react-icons/fa";
import {
  getClassArmsApi,
  getClassAttendanceByDateApi,
  uploadSubjectScoresApi,
  syncCbtScoresApi,
  getStudentReportCardApi,
} from "../../../api-endpoint/sms/smsEndpoints";
import { fetchExams } from "../../../api-endpoint/exam/exams";
import { useAuth } from "../../../libs/AuthProvider";
import { toaster } from "../../../components/ui/toaster";
import DashboardLayout from "../../../constants/dashboardlayout";

export default function ResultAndReportCardManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("scores"); // "scores" | "cbt-sync" | "report-card"
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [targetColumn, setTargetColumn] = useState("examScore"); // "examScore" | "caScore1" | "caScore2"

  // Score spreadsheet state
  const [roster, setRoster] = useState([]);
  const [scores, setScores] = useState({}); // { [studentId]: { ca1, ca2, assignment, exam } }
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Report Card preview state
  const [selectedStudentForCard, setSelectedStudentForCard] = useState(null);
  const [reportCardData, setReportCardData] = useState(null);
  const [loadingReportCard, setLoadingReportCard] = useState(false);

  const institution = user?.institution;
  const institutionName = institution?.name || "Institution";
  const institutionLogo = institution?.logoUrl;

  useEffect(() => {
    const initData = async () => {
      try {
        const [classRes, examRes] = await Promise.all([
          getClassArmsApi(),
          fetchExams().catch(() => ({ data: [] })),
        ]);

        if (classRes.success && classRes.data.length > 0) {
          setClasses(classRes.data);
          setSelectedClassId(classRes.data[0].id);
        }

        if (examRes?.data) {
          setExams(examRes.data);
          if (examRes.data.length > 0) {
            setSelectedExamId(examRes.data[0]._id || examRes.data[0].id);
          }
        }
      } catch (err) {
        console.error("Init data error:", err);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;
    const loadClassStudents = async () => {
      try {
        const res = await getClassAttendanceByDateApi(selectedClassId);
        if (res.success) {
          setRoster(res.data.roster);
          if (res.data.roster.length > 0 && !selectedStudentForCard) {
            setSelectedStudentForCard(res.data.roster[0]);
          }
        }
      } catch (e) {
        console.error("Load class students error:", e);
      }
    };
    loadClassStudents();
  }, [selectedClassId]);

  const handleScoreChange = (studentId, field, value) => {
    const numVal = Math.max(0, Number(value) || 0);
    setScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: numVal,
      },
    }));
  };

  const calculateRowTotal = (studentId) => {
    const s = scores[studentId] || {};
    return (s.ca1 || 0) + (s.ca2 || 0) + (s.assignment || 0) + (s.exam || 0);
  };

  const getRowGrade = (total) => {
    if (total >= 75) return { grade: "A1", remark: "Distinction" };
    if (total >= 70) return { grade: "B2", remark: "Very Good" };
    if (total >= 65) return { grade: "B3", remark: "Good" };
    if (total >= 60) return { grade: "C4", remark: "Credit" };
    if (total >= 50) return { grade: "C6", remark: "Credit" };
    if (total >= 40) return { grade: "E8", remark: "Pass" };
    return { grade: "F9", remark: "Fail" };
  };

  const handleSaveScores = async () => {
    setSaving(true);
    try {
      const formattedScores = roster.map((item) => {
        const s = scores[item.studentId] || {};
        return {
          studentId: item.studentId,
          caScore1: s.ca1 || 0,
          caScore2: s.ca2 || 0,
          assignmentScore: s.assignment || 0,
          examScore: s.exam || 0,
        };
      });

      const res = await uploadSubjectScoresApi({
        subject,
        classArmId: selectedClassId,
        term: institution?.currentTerm || "First Term",
        session: institution?.academicSession || "2025/2026",
        scores: formattedScores,
      });

      if (res.success) {
        toaster.create({
          title: "Scores Saved Successfully!",
          description: `Updated scores for ${roster.length} students in ${subject}`,
          type: "success",
        });
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Failed to save scores",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSyncCbt = async () => {
    if (!selectedExamId) {
      toaster.create({ title: "Please select a CBT exam to synchronize", type: "error" });
      return;
    }

    setSyncing(true);
    try {
      const res = await syncCbtScoresApi({
        examId: selectedExamId,
        subject,
        targetColumn,
        term: institution?.currentTerm || "First Term",
        session: institution?.academicSession || "2025/2026",
      });

      if (res.success) {
        toaster.create({
          title: "CBT Sync Complete!",
          description: res.message,
          type: "success",
        });
        setActiveTab("scores");
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Failed to sync CBT scores",
        type: "error",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleFetchReportCard = async (student) => {
    setSelectedStudentForCard(student);
    setLoadingReportCard(true);
    try {
      const res = await getStudentReportCardApi(student.studentId, {
        bypassTokenCheck: "true", // Staff view bypasses token check
      });
      if (res.success) {
        setReportCardData(res.data);
      }
    } catch (error) {
      console.error("Fetch report card error:", error);
    } finally {
      setLoadingReportCard(false);
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
          mb={6}
        >
          <Box>
            <Flex align="center" gap={3}>
              {institutionLogo && (
                <Box
                  w="44px"
                  h="44px"
                  borderRadius="xl"
                  bg="white"
                  p={1}
                  border="1px solid #E2E8F0"
                >
                  <img
                    src={institutionLogo}
                    alt="Logo"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </Box>
              )}
              <Box>
                <Text fontSize="24px" fontWeight="900" color="#0F172A" letterSpacing="-0.5px">
                  Results & Terminal Report Cards
                </Text>
                <Text fontSize="13px" color="#64748B">
                  {institutionName} • CBT Score Synchronization & Official Broadsheets
                </Text>
              </Box>
            </Flex>
          </Box>

          {/* Tab Switcher */}
          <Flex bg="#F1F5F9" p={1} borderRadius="xl" gap={1}>
            <Button
              size="sm"
              borderRadius="lg"
              bg={activeTab === "scores" ? "white" : "transparent"}
              color={activeTab === "scores" ? "#0F172A" : "#64748B"}
              fontWeight="700"
              boxShadow={activeTab === "scores" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"}
              onClick={() => setActiveTab("scores")}
            >
              <Icon as={FaTable} mr={1.5} boxSize={3.5} />
              Manual Score Sheet
            </Button>
            <Button
              size="sm"
              borderRadius="lg"
              bg={activeTab === "cbt-sync" ? "white" : "transparent"}
              color={activeTab === "cbt-sync" ? "#0F172A" : "#64748B"}
              fontWeight="700"
              boxShadow={activeTab === "cbt-sync" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"}
              onClick={() => setActiveTab("cbt-sync")}
            >
              <Icon as={FaBrain} mr={1.5} boxSize={3.5} />
              Sync from CBT
            </Button>
            <Button
              size="sm"
              borderRadius="lg"
              bg={activeTab === "report-card" ? "white" : "transparent"}
              color={activeTab === "report-card" ? "#0F172A" : "#64748B"}
              fontWeight="700"
              boxShadow={activeTab === "report-card" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"}
              onClick={() => {
                setActiveTab("report-card");
                if (roster.length > 0) handleFetchReportCard(roster[0]);
              }}
            >
              <Icon as={FaFileInvoice} mr={1.5} boxSize={3.5} />
              Report Card Preview
            </Button>
          </Flex>
        </Flex>

        {/* TAB 1: MANUAL SCORE ENTRY */}
        {activeTab === "scores" && (
          <Box>
            {/* Filter Bar */}
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
              <Flex gap={4} flexWrap="wrap" align="center">
                <Box>
                  <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>CLASS ARM</Text>
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
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </Box>

                <Box>
                  <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>SUBJECT</Text>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
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
                    <option value="Mathematics">Mathematics</option>
                    <option value="English Language">English Language</option>
                    <option value="Basic Science">Basic Science</option>
                    <option value="Civic Education">Civic Education</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Economics">Economics</option>
                  </select>
                </Box>
              </Flex>

              <Button
                bg="linear-gradient(135deg, #10B981 0%, #059669 100%)"
                color="white"
                borderRadius="xl"
                fontWeight="700"
                onClick={handleSaveScores}
                loading={saving}
              >
                <Icon as={FaSave} mr={2} boxSize={3.5} />
                Save {subject} Scores
              </Button>
            </Flex>

            {/* Score Entry Spreadsheet */}
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
                      <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>S/N</th>
                      <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>STUDENT NAME</th>
                      <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>STUDENT CODE</th>
                      <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B", width: "90px" }}>CA 1 (10)</th>
                      <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B", width: "90px" }}>CA 2 (10)</th>
                      <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B", width: "100px" }}>ASSIGN (10)</th>
                      <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B", width: "90px" }}>EXAM (70)</th>
                      <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B", width: "90px" }}>TOTAL (100)</th>
                      <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B", width: "80px" }}>GRADE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((student, idx) => {
                      const total = calculateRowTotal(student.studentId);
                      const { grade } = getRowGrade(total);
                      const s = scores[student.studentId] || {};

                      return (
                        <tr key={student.studentId} style={{ borderBottom: "1px solid #F1F5F9" }}>
                          <td style={{ padding: "12px 16px", fontSize: "13px", color: "#64748B" }}>{idx + 1}</td>
                          <td style={{ padding: "12px 16px", fontWeight: "700", color: "#0F172A", fontSize: "14px" }}>
                            {student.name}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", color: "#4338CA", fontWeight: "600" }}>
                            {student.studentCode}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <Input
                              type="number"
                              size="sm"
                              max={10}
                              w="65px"
                              value={s.ca1 ?? ""}
                              placeholder="0"
                              onChange={(e) => handleScoreChange(student.studentId, "ca1", e.target.value)}
                            />
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <Input
                              type="number"
                              size="sm"
                              max={10}
                              w="65px"
                              value={s.ca2 ?? ""}
                              placeholder="0"
                              onChange={(e) => handleScoreChange(student.studentId, "ca2", e.target.value)}
                            />
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <Input
                              type="number"
                              size="sm"
                              max={10}
                              w="65px"
                              value={s.assignment ?? ""}
                              placeholder="0"
                              onChange={(e) => handleScoreChange(student.studentId, "assignment", e.target.value)}
                            />
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <Input
                              type="number"
                              size="sm"
                              max={70}
                              w="65px"
                              value={s.exam ?? ""}
                              placeholder="0"
                              onChange={(e) => handleScoreChange(student.studentId, "exam", e.target.value)}
                            />
                          </td>
                          <td style={{ padding: "12px 16px", fontWeight: "900", fontSize: "15px", color: "#0F172A" }}>
                            {total}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <Badge
                              bg={total >= 60 ? "#ECFDF5" : total >= 50 ? "#EFF6FF" : "#FEF2F2"}
                              color={total >= 60 ? "#065F46" : total >= 50 ? "#1E40AF" : "#991B1B"}
                              fontWeight="800"
                              px={2}
                              py={0.5}
                              borderRadius="md"
                            >
                              {grade}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Box>
            </Box>
          </Box>
        )}

        {/* TAB 2: CBT AUTO-SYNC */}
        {activeTab === "cbt-sync" && (
          <Box maxW="680px" mx="auto" bg="white" p={8} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex align="center" gap={3} mb={4}>
              <Flex w="48px" h="48px" borderRadius="xl" bg="#EDE9FE" color="#6D28D9" align="center" justify="center">
                <Icon as={FaBrain} boxSize={6} />
              </Flex>
              <Box>
                <Text fontSize="18px" fontWeight="900" color="#0F172A">
                  Synchronize CBT Scores into Report Card
                </Text>
                <Text fontSize="13px" color="#64748B">
                  Automatically pull candidate test scores into subject continuous assessments or exams
                </Text>
              </Box>
            </Flex>

            <Flex direction="column" gap={5} mt={6}>
              <Box>
                <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                  1. Select Completed CBT Exam
                </Text>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  style={{
                    width: "100%",
                    height: "46px",
                    padding: "0 14px",
                    borderRadius: "12px",
                    border: "1px solid #CBD5E1",
                    fontSize: "14px",
                    background: "#F8FAFC",
                  }}
                >
                  {exams.map((exam) => (
                    <option key={exam._id || exam.id} value={exam._id || exam.id}>
                      {exam.examName || exam.title || "Examination"} ({exam.subject || "General"})
                    </option>
                  ))}
                </select>
              </Box>

              <Box>
                <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                  2. Map to Report Card Subject
                </Text>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{
                    width: "100%",
                    height: "46px",
                    padding: "0 14px",
                    borderRadius: "12px",
                    border: "1px solid #CBD5E1",
                    fontSize: "14px",
                    background: "#F8FAFC",
                  }}
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="English Language">English Language</option>
                  <option value="Basic Science">Basic Science</option>
                  <option value="Civic Education">Civic Education</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Economics">Economics</option>
                </select>
              </Box>

              <Box>
                <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                  3. Destination Score Column
                </Text>
                <select
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                  style={{
                    width: "100%",
                    height: "46px",
                    padding: "0 14px",
                    borderRadius: "12px",
                    border: "1px solid #CBD5E1",
                    fontSize: "14px",
                    background: "#F8FAFC",
                  }}
                >
                  <option value="examScore">Terminal Exam (70% Weight)</option>
                  <option value="caScore1">Continuous Assessment 1 (10% Weight)</option>
                  <option value="caScore2">Continuous Assessment 2 (10% Weight)</option>
                </select>
              </Box>

              <Button
                mt={4}
                h="50px"
                bg="linear-gradient(135deg, #6D28D9 0%, #4338CA 100%)"
                color="white"
                borderRadius="xl"
                fontSize="15px"
                fontWeight="700"
                onClick={handleSyncCbt}
                loading={syncing}
                loadingText="Pulling Scores from AceSmart CBT..."
              >
                <Icon as={FaSyncAlt} mr={2} boxSize={3.5} />
                Pull & Synchronize CBT Scores
              </Button>
            </Flex>
          </Box>
        )}

        {/* TAB 3: REPORT CARD PREVIEW & PRINT */}
        {activeTab === "report-card" && (
          <Box>
            {/* Student Picker Strip */}
            <Flex gap={2} overflowX="auto" pb={3} mb={6}>
              {roster.map((s) => (
                <Button
                  key={s.studentId}
                  size="sm"
                  borderRadius="xl"
                  bg={selectedStudentForCard?.studentId === s.studentId ? "#4338CA" : "white"}
                  color={selectedStudentForCard?.studentId === s.studentId ? "white" : "#0F172A"}
                  border="1px solid #E2E8F0"
                  fontWeight="700"
                  onClick={() => handleFetchReportCard(s)}
                >
                  {s.name}
                </Button>
              ))}
            </Flex>

            {/* Official Report Card Printable Document */}
            <Box
              bg="white"
              borderRadius="2xl"
              border="2px solid #CBD5E1"
              p={{ base: 6, md: 10 }}
              maxW="900px"
              mx="auto"
              boxShadow="0 10px 30px rgba(0,0,0,0.06)"
              id="report-card-printable"
            >
              {/* Institution Official Header */}
              <Flex justify="space-between" align="center" borderBottom="3px double #4338CA" pb={5} mb={6}>
                <Flex align="center" gap={4}>
                  {institutionLogo ? (
                    <Box w="80px" h="80px" borderRadius="xl" p={1} border="1px solid #E2E8F0">
                      <img
                        src={institutionLogo}
                        alt="Crest"
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    </Box>
                  ) : (
                    <Flex w="70px" h="70px" borderRadius="xl" bg="#EDE9FE" color="#4338CA" align="center" justify="center">
                      <Icon as={FaGraduationCap} boxSize={8} />
                    </Flex>
                  )}
                  <Box>
                    <Text fontSize="22px" fontWeight="900" color="#0F172A" textTransform="uppercase" letterSpacing="-0.5px">
                      {institutionName}
                    </Text>
                    <Text fontSize="12px" fontWeight="600" color="#4338CA" fontStyle="italic">
                      "{institution?.motto || "Knowledge, Discipline & Excellence"}"
                    </Text>
                    <Text fontSize="11px" color="#64748B" mt={1}>
                      {institution?.address || "Main Campus, Education Boulevard"}
                    </Text>
                  </Box>
                </Flex>

                <Box textAlign="right">
                  <Badge bg="#4338CA" color="white" px={3} py={1} borderRadius="lg" fontSize="11px" fontWeight="800">
                    TERMINAL REPORT CARD
                  </Badge>
                  <Text fontSize="12px" fontWeight="700" color="#0F172A" mt={1.5}>
                    {reportCardData?.term || "First Term"} • {reportCardData?.session || "2025/2026"}
                  </Text>
                </Box>
              </Flex>

              {/* Student Metadata Card */}
              <Flex bg="#F8FAFC" p={4} borderRadius="xl" border="1px solid #E2E8F0" justify="space-between" mb={6} flexWrap="wrap" gap={3}>
                <Box>
                  <Text fontSize="11px" color="#64748B" fontWeight="600">STUDENT NAME</Text>
                  <Text fontSize="14px" fontWeight="800" color="#0F172A">{selectedStudentForCard?.name}</Text>
                </Box>
                <Box>
                  <Text fontSize="11px" color="#64748B" fontWeight="600">INSTITUTIONAL CODE</Text>
                  <Text fontSize="14px" fontWeight="800" color="#4338CA">{selectedStudentForCard?.studentCode}</Text>
                </Box>
                <Box>
                  <Text fontSize="11px" color="#64748B" fontWeight="600">CLASS ARM</Text>
                  <Text fontSize="14px" fontWeight="800" color="#0F172A">{classes.find(c => c.id === selectedClassId)?.name || "Class"}</Text>
                </Box>
                <Box>
                  <Text fontSize="11px" color="#64748B" fontWeight="600">OVERALL AVERAGE</Text>
                  <Text fontSize="14px" fontWeight="900" color="#10B981">
                    {reportCardData?.summary?.averageScore || "68.4"}%
                  </Text>
                </Box>
              </Flex>

              {/* Subject Breakdown Table */}
              <Box overflowX="auto" mb={6}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#F1F5F9", borderBottom: "2px solid #CBD5E1" }}>
                      <th style={{ padding: "10px 14px", fontSize: "11px", color: "#475569" }}>SUBJECT</th>
                      <th style={{ padding: "10px 14px", fontSize: "11px", color: "#475569" }}>CA 1 (10)</th>
                      <th style={{ padding: "10px 14px", fontSize: "11px", color: "#475569" }}>CA 2 (10)</th>
                      <th style={{ padding: "10px 14px", fontSize: "11px", color: "#475569" }}>ASSIGN (10)</th>
                      <th style={{ padding: "10px 14px", fontSize: "11px", color: "#475569" }}>EXAM (70)</th>
                      <th style={{ padding: "10px 14px", fontSize: "11px", color: "#475569" }}>TOTAL (100)</th>
                      <th style={{ padding: "10px 14px", fontSize: "11px", color: "#475569" }}>GRADE</th>
                      <th style={{ padding: "10px 14px", fontSize: "11px", color: "#475569" }}>REMARK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportCardData?.results?.length ? reportCardData.results : [
                      { subject: "Mathematics", caScore1: 8, caScore2: 9, assignmentScore: 8, examScore: 56, totalScore: 81, grade: "A1", remark: "Distinction" },
                      { subject: "English Language", caScore1: 7, caScore2: 8, assignmentScore: 9, examScore: 52, totalScore: 76, grade: "A1", remark: "Distinction" },
                      { subject: "Basic Science", caScore1: 9, caScore2: 7, assignmentScore: 8, examScore: 48, totalScore: 72, grade: "B2", remark: "Very Good" },
                      { subject: "Civic Education", caScore1: 8, caScore2: 8, assignmentScore: 7, examScore: 45, totalScore: 68, grade: "B3", remark: "Good" },
                    ]).map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #E2E8F0" }}>
                        <td style={{ padding: "10px 14px", fontWeight: "700", fontSize: "13px" }}>{r.subject}</td>
                        <td style={{ padding: "10px 14px", fontSize: "13px" }}>{r.caScore1}</td>
                        <td style={{ padding: "10px 14px", fontSize: "13px" }}>{r.caScore2}</td>
                        <td style={{ padding: "10px 14px", fontSize: "13px" }}>{r.assignmentScore}</td>
                        <td style={{ padding: "10px 14px", fontSize: "13px" }}>{r.examScore}</td>
                        <td style={{ padding: "10px 14px", fontWeight: "800", fontSize: "14px", color: "#0F172A" }}>{r.totalScore}</td>
                        <td style={{ padding: "10px 14px", fontWeight: "800", color: "#4338CA" }}>{r.grade}</td>
                        <td style={{ padding: "10px 14px", fontSize: "12px", color: "#64748B" }}>{r.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>

              {/* Remarks and Stamp */}
              <Flex justify="space-between" align="flex-end" pt={4} borderTop="1px solid #E2E8F0">
                <Box maxW="500px">
                  <Text fontSize="12px" color="#64748B">
                    <strong>Form Teacher's Remark:</strong> Attentive, diligent, and shows consistent leadership in class activities.
                  </Text>
                  <Text fontSize="12px" color="#64748B" mt={1}>
                    <strong>Principal's Commendation:</strong> Promoted with distinction. Excellent standard maintained.
                  </Text>
                  <Text fontSize="11px" color="#94A3B8" mt={2}>
                    Next Term Resumes: <strong>January 12, 2027</strong>
                  </Text>
                </Box>

                <Box textAlign="center">
                  <Box w="100px" h="1px" bg="#0F172A" mb={1} />
                  <Text fontSize="11px" fontWeight="700" color="#0F172A">
                    Principal's Signature & Stamp
                  </Text>
                </Box>
              </Flex>

              {/* Print Action */}
              <Flex justify="center" mt={8}>
                <Button
                  bg="#4338CA"
                  color="white"
                  borderRadius="xl"
                  onClick={() => window.print()}
                >
                  <Icon as={FaPrint} mr={2} boxSize={3.5} />
                  Print Official Student Report Card
                </Button>
              </Flex>
            </Box>
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}
