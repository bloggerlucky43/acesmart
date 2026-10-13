import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
  Input,
  Spinner,
  SimpleGrid,
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
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaInfoCircle,
  FaPencilAlt,
  FaUserGraduate,
  FaShieldAlt,
} from "react-icons/fa";
import {
  getClassArmsApi,
  getClassAttendanceByDateApi,
  getSubjectScoresApi,
  uploadSubjectScoresApi,
  syncCbtScoresApi,
  getStudentReportCardApi,
} from "../../../api-endpoint/sms/smsEndpoints";
import { fetchExams } from "../../../api-endpoint/exam/exams";
import { fetchSubjectsApi } from "../../../api-endpoint/subjects/subjectEndpoints";
import { formatStudentName, getFormattedStudentName } from "../../../libs/helper";
import { useAuth } from "../../../libs/AuthProvider";
import { toaster } from "../../../components/ui/toaster";
import DashboardLayout from "../../../constants/dashboardlayout";
import StudentReportCardSheet from "../../../components/student/StudentReportCardSheet";

const DEFAULT_FALLBACK_SUBJECTS = [
  "Mathematics",
  "English Language",
  "Biology",
  "Chemistry",
  "Physics",
  "Civic Education",
  "Economics",
  "Agricultural Science",
  "Government",
  "Commerce",
  "Financial Accounting",
  "Literature in English",
  "Geography",
  "Christian Religious Studies (CRS)",
  "Islamic Religious Studies (IRS)",
  "Computer Studies",
  "Data Processing",
  "Further Mathematics",
  "Technical Drawing",
  "Visual Arts",
  "Music",
  "French",
  "Yoruba",
  "Igbo",
  "Hausa",
  "History",
  "Physical Education",
  "Basic Science",
  "Basic Technology",
  "Social Studies",
  "Business Studies",
  "Home Economics",
  "Food and Nutrition",
  "Book Keeping",
  "Marketing",
];

export default function ResultAndReportCardManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("scores"); // "scores" | "cbt-sync" | "report-card"
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [availableSubjects, setAvailableSubjects] = useState(DEFAULT_FALLBACK_SUBJECTS);
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [targetColumn, setTargetColumn] = useState("examScore"); // "examScore" | "caScore1" | "caScore2" | "assignmentScore"
  const [scaleMode, setScaleMode] = useState("smart"); // "smart" | "raw"

  // Score spreadsheet state
  const [roster, setRoster] = useState([]);
  const [scores, setScores] = useState({}); // { [studentId]: { ca1, ca2, assignment, exam } }
  const [existingScores, setExistingScores] = useState({}); // { [studentId]: saved record }
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Report Card preview state
  const [selectedStudentForCard, setSelectedStudentForCard] = useState(null);
  const [reportCardData, setReportCardData] = useState(null);
  const [loadingReportCard, setLoadingReportCard] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

  const institution = user?.institution;
  const institutionName = institution?.name || "Institution";
  const institutionLogo = institution?.logoUrl;
  const currentTerm = institution?.currentTerm || "First Term";
  const currentSession = institution?.academicSession || "2025/2026";

  useEffect(() => {
    const initData = async () => {
      try {
        const [classRes, examRes, subjectRes] = await Promise.all([
          getClassArmsApi(),
          fetchExams().catch(() => ({ data: [] })),
          fetchSubjectsApi().catch(() => ({ success: false, data: [] })),
        ]);

        if (classRes.success && classRes.data.length > 0) {
          setClasses(classRes.data);
          setSelectedClassId(classRes.data[0].id);
        }

        const examList = examRes?.data || [];
        setExams(examList);
        if (examList.length > 0) {
          setSelectedExamId(examList[0]._id || examList[0].id);
        }

        const backendSubjects = (subjectRes?.data || [])
          .map((s) => (typeof s === "string" ? s : s.name))
          .filter(Boolean);
        const examSubjects = examList.map((e) => e.subject).filter(Boolean);

        const unified = Array.from(
          new Set([...backendSubjects, ...examSubjects, ...DEFAULT_FALLBACK_SUBJECTS])
        ).sort((a, b) => a.localeCompare(b));

        setAvailableSubjects(unified);
        if (unified.length > 0 && !unified.includes(subject)) {
          setSubject(unified[0]);
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

  const loadExistingScores = useCallback(async () => {
    if (!selectedClassId || !subject) return;
    setLoadingExisting(true);
    try {
      const res = await getSubjectScoresApi({
        subject,
        classArmId: selectedClassId,
        term: currentTerm,
        session: currentSession,
      });

      if (res.success) {
        const recordMap = {};
        const prefilledScores = {};
        res.data.forEach((r) => {
          recordMap[r.studentId] = r;
          prefilledScores[r.studentId] = {
            ca1: r.caScore1,
            ca2: r.caScore2,
            assignment: r.assignmentScore,
            exam: r.examScore,
          };
        });
        setExistingScores(recordMap);
        setScores(prefilledScores);
      }
    } catch (e) {
      console.error("Load existing scores error:", e);
    } finally {
      setLoadingExisting(false);
    }
  }, [selectedClassId, subject, currentTerm, currentSession]);

  useEffect(() => {
    loadExistingScores();
  }, [loadExistingScores]);

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
    if (total >= 70) return { grade: "A", remark: "Excellent" };
    if (total >= 60) return { grade: "B", remark: "Very Good" };
    if (total >= 50) return { grade: "C", remark: "Credit" };
    if (total >= 40) return { grade: "D", remark: "Pass" };
    if (total >= 30) return { grade: "E", remark: "Fair" };
    return { grade: "F", remark: "Fail" };
  };

  const enteredCount = roster.filter((s) => existingScores[s.studentId]).length;

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
        term: currentTerm,
        session: currentSession,
        scores: formattedScores,
      });

      if (res.success) {
        toaster.create({
          title: "Scores Saved Successfully!",
          description: `Updated scores for ${roster.length} students in ${subject}`,
          type: "success",
        });
        await loadExistingScores();
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

  const handleExamChange = (e) => {
    const examId = e.target.value;
    setSelectedExamId(examId);
    const chosen = exams.find((x) => (x._id || x.id) === examId);
    if (chosen?.subject) {
      setSubject(chosen.subject);
      setAvailableSubjects((prev) => {
        if (!prev.includes(chosen.subject)) {
          return [...prev, chosen.subject].sort((a, b) => a.localeCompare(b));
        }
        return prev;
      });
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
        term: currentTerm,
        session: currentSession,
        classArmId: selectedClassId,
        scaleMode,
      });

      if (res.success) {
        toaster.create({
          title: "CBT Sync Complete!",
          description: res.message,
          type: "success",
        });
        await loadExistingScores();
        if (selectedStudentForCard) {
          await handleFetchReportCard(selectedStudentForCard);
        }
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
    if (!student) return;
    setSelectedStudentForCard(student);
    setLoadingReportCard(true);
    setReportCardData(null);
    try {
      const idToFetch = student.studentId || student.id || student.studentCode;
      const res = await getStudentReportCardApi(idToFetch, {
        term: currentTerm,
        session: currentSession,
        bypassTokenCheck: "true", // Staff view bypasses token check
      });
      if (res.success) {
        setReportCardData(res.data);
      }
    } catch (error) {
      console.error("Fetch report card error:", error);
      toaster.create({
        title: error.response?.data?.message || "Failed to load report card preview",
        type: "error",
      });
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
                const target = selectedStudentForCard || roster[0];
                if (target) handleFetchReportCard(target);
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
                      minWidth: "180px",
                    }}
                  >
                    {availableSubjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    {Boolean(subject && !availableSubjects.includes(subject)) && (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    )}
                  </select>
                </Box>
              </Flex>

              <Flex direction="column" align="flex-end" gap={2}>
                <Flex align="center" gap={2}>
                  <Badge
                    bg={enteredCount >= roster.length && roster.length > 0 ? "#ECFDF5" : "#FEF3C7"}
                    color={enteredCount >= roster.length && roster.length > 0 ? "#065F46" : "#92400E"}
                    px={3}
                    py={1}
                    borderRadius="lg"
                    fontSize="11px"
                    fontWeight="800"
                  >
                    {loadingExisting
                      ? "Checking saved scores..."
                      : roster.length > 0
                      ? `${enteredCount} of ${roster.length} already entered`
                      : "No students in this class"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="#CBD5E1"
                    color="#334155"
                    borderRadius="lg"
                    fontWeight="700"
                    onClick={loadExistingScores}
                    loading={loadingExisting}
                  >
                    <Icon as={FaSyncAlt} mr={1.5} boxSize={3} />
                    Refresh
                  </Button>
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
                      const saved = existingScores[student.studentId];

                      return (
                        <tr key={student.studentId} style={{ borderBottom: "1px solid #F1F5F9", background: saved ? "#F0FDF4" : "transparent" }}>
                          <td style={{ padding: "12px 16px", fontSize: "13px", color: "#64748B" }}>{idx + 1}</td>
                          <td style={{ padding: "12px 16px", fontWeight: "700", color: "#0F172A", fontSize: "14px" }}>
                            <Flex align="center" gap={2}>
                              {getFormattedStudentName(student)}
                              {saved && (
                                <Badge
                                  bg={saved.cbtExamId ? "#EDE9FE" : "#DCFCE7"}
                                  color={saved.cbtExamId ? "#5B21B6" : "#166534"}
                                  fontSize="9px"
                                  fontWeight="800"
                                  px={1.5}
                                  py={0.5}
                                  borderRadius="md"
                                >
                                  {saved.cbtExamId ? "CBT SYNCED" : "ENTERED"}
                                </Badge>
                              )}
                            </Flex>
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
                              bg={
                                total >= 70
                                  ? "#EDE9FE"
                                  : total >= 60
                                  ? "#EEF2FF"
                                  : total >= 50
                                  ? "#ECFDF5"
                                  : total >= 40
                                  ? "#FFFBEB"
                                  : total >= 30
                                  ? "#FFF7ED"
                                  : "#FEF2F2"
                              }
                              color={
                                total >= 70
                                  ? "#6D28D9"
                                  : total >= 60
                                  ? "#4338CA"
                                  : total >= 50
                                  ? "#065F46"
                                  : total >= 40
                                  ? "#B45309"
                                  : total >= 30
                                  ? "#C2410C"
                                  : "#991B1B"
                              }
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
        {activeTab === "cbt-sync" && (() => {
          const selectedExam = exams.find((e) => (e._id || e.id) === selectedExamId);
          const currentClassObj = classes.find((c) => c.id === selectedClassId);

          return (
            <Box maxW="740px" mx="auto" bg="white" p={{ base: 6, md: 8 }} borderRadius="2xl" border="1px solid #E2E8F0" boxShadow="0 4px 20px rgba(0,0,0,0.04)">
              <Flex align="center" gap={3} mb={3}>
                <Flex w="48px" h="48px" borderRadius="xl" bg="#EDE9FE" color="#6D28D9" align="center" justify="center">
                  <Icon as={FaBrain} boxSize={6} />
                </Flex>
                <Box>
                  <Text fontSize="18px" fontWeight="900" color="#0F172A">
                    Synchronize CBT Scores into Report Card
                  </Text>
                  <Text fontSize="13px" color="#64748B">
                    Automatically pull candidate exam scores into academic continuous assessment or exam columns
                  </Text>
                </Box>
              </Flex>

              {/* Context Alert Banner */}
              <Flex
                bg="#EEF2FF"
                border="1px solid #C7D2FE"
                p={3.5}
                borderRadius="xl"
                mb={5}
                align="center"
                justify="space-between"
                wrap="wrap"
                gap={2}
              >
                <Flex align="center" gap={2}>
                  <Icon as={FaInfoCircle} color="#4338CA" boxSize={4} />
                  <Text fontSize="12px" color="#312E81">
                    Target Class: <strong>{currentClassObj?.name || "Selected Class Arm"}</strong> • Enrolled: <strong>{roster.length} Candidates</strong>
                  </Text>
                </Flex>
                <Badge bg="#4338CA" color="white" px={2.5} py={0.5} borderRadius="md" fontSize="10px" fontWeight="800">
                  {currentTerm} • {currentSession}
                </Badge>
              </Flex>

              <Flex direction="column" gap={5}>
                {/* 1. Exam Selection */}
                <Box>
                  <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                    1. Select Completed CBT Exam
                  </Text>
                  <select
                    value={selectedExamId}
                    onChange={handleExamChange}
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
                    {exams.length === 0 ? (
                      <option value="">No CBT examinations found</option>
                    ) : (
                      exams.map((exam) => (
                        <option key={exam._id || exam.id} value={exam._id || exam.id}>
                          {exam.examName || exam.title || "Examination"} ({exam.subject || "General"}) — {exam.totalMarks || 100} Marks
                        </option>
                      ))
                    )}
                  </select>
                </Box>

                {/* Exam Details Card */}
                {selectedExam && (
                  <Box bg="#F8FAFC" border="1px solid #E2E8F0" p={3.5} borderRadius="xl">
                    <SimpleGrid columns={{ base: 2, sm: 4 }} gap={2} fontSize="12px">
                      <Box>
                        <Text fontSize="10px" color="#64748B" fontWeight="700" textTransform="uppercase">Exam Title</Text>
                        <Text fontWeight="800" color="#0F172A" noOfLines={1}>{selectedExam.examName || selectedExam.title || "CBT Exam"}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="10px" color="#64748B" fontWeight="700" textTransform="uppercase">Exam Subject</Text>
                        <Text fontWeight="800" color="#4338CA">{selectedExam.subject || "General"}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="10px" color="#64748B" fontWeight="700" textTransform="uppercase">Total Marks</Text>
                        <Text fontWeight="800" color="#059669">{selectedExam.totalMarks || 100} Pts</Text>
                      </Box>
                      <Box>
                        <Text fontSize="10px" color="#64748B" fontWeight="700" textTransform="uppercase">Duration</Text>
                        <Text fontWeight="800" color="#0F172A">{selectedExam.duration || 60} mins</Text>
                      </Box>
                    </SimpleGrid>
                  </Box>
                )}

                {/* 2. Map to Report Card Subject */}
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
                    {availableSubjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    {Boolean(subject && !availableSubjects.includes(subject)) && (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    )}
                  </select>
                </Box>

                {/* 3. Destination Score Column */}
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
                    <option value="examScore">Terminal Exam (70% Max Weight)</option>
                    <option value="caScore1">Continuous Assessment 1 (10% Max Weight)</option>
                    <option value="caScore2">Continuous Assessment 2 (10% Max Weight)</option>
                    <option value="assignmentScore">Assignment / Continuous Assessment 3 (10% Max Weight)</option>
                  </select>
                </Box>

                {/* 4. Score Scaling Mode */}
                <Box>
                  <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                    4. Score Scaling & Mapping Rule
                  </Text>
                  <select
                    value={scaleMode}
                    onChange={(e) => setScaleMode(e.target.value)}
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
                    <option value="smart">
                      Smart Weight Scaling (Recommended: e.g. scales 80% on 70% exam to 56.0, or 80% on 10% CA to 8.0)
                    </option>
                    <option value="raw">
                      Raw CBT Points (Record candidate's exact raw total score directly)
                    </option>
                  </select>
                  <Text fontSize="11px" color="#64748B" mt={1}>
                    {scaleMode === "smart"
                      ? "Candidate percentage is converted proportionally to fit the column limit (e.g. out of 70 for exams, or out of 10 for CA)."
                      : "Candidate raw total points will be recorded as-is without proportional scaling."}
                  </Text>
                </Box>

                <Button
                  mt={2}
                  h="50px"
                  bg="linear-gradient(135deg, #6D28D9 0%, #4338CA 100%)"
                  color="white"
                  borderRadius="xl"
                  fontSize="15px"
                  fontWeight="700"
                  onClick={handleSyncCbt}
                  loading={syncing}
                  loadingText="Pulling & Synchronizing Candidate Scores..."
                  _hover={{ opacity: 0.95 }}
                >
                  <Icon as={FaSyncAlt} mr={2} boxSize={3.5} />
                  Pull & Synchronize CBT Scores
                </Button>
              </Flex>
            </Box>
          );
        })()}

        {/* TAB 3: REPORT CARD PREVIEW & PRINT */}
        {activeTab === "report-card" && (() => {
          const filteredRoster = roster.filter((s) => {
            if (!studentSearch.trim()) return true;
            const q = studentSearch.toLowerCase();
            const formatted = getFormattedStudentName(s).toLowerCase();
            return (
              formatted.includes(q) ||
              s.name?.toLowerCase().includes(q) ||
              s.studentCode?.toLowerCase().includes(q)
            );
          });

          const currentIndex = filteredRoster.findIndex(
            (s) => (s.studentId || s.id) === (selectedStudentForCard?.studentId || selectedStudentForCard?.id)
          );
          const safeIndex = currentIndex >= 0 ? currentIndex : 0;

          const handlePrevStudent = () => {
            if (safeIndex > 0) {
              handleFetchReportCard(filteredRoster[safeIndex - 1]);
            }
          };

          const handleNextStudent = () => {
            if (safeIndex < filteredRoster.length - 1) {
              handleFetchReportCard(filteredRoster[safeIndex + 1]);
            }
          };

          return (
            <Box>
              {/* Student Picker Toolbar */}
              <Box bg="white" p={4} borderRadius="2xl" border="1px solid #E2E8F0" mb={6} className="no-print">
                <Flex justify="space-between" align="center" wrap="wrap" gap={3} mb={3}>
                  <Flex align="center" gap={3} flex="1" minW="260px">
                    <Flex
                      align="center"
                      bg="#F8FAFC"
                      border="1px solid #CBD5E1"
                      borderRadius="xl"
                      px={3}
                      h="40px"
                      w={{ base: "100%", md: "280px" }}
                    >
                      <Icon as={FaSearch} color="#94A3B8" mr={2} boxSize={3.5} />
                      <input
                        placeholder="Search student or code..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        style={{
                          border: "none",
                          background: "transparent",
                          fontSize: "13px",
                          outline: "none",
                          width: "100%",
                        }}
                      />
                    </Flex>
                    <Text fontSize="12px" color="#64748B" fontWeight="600">
                      {filteredRoster.length} of {roster.length} students
                    </Text>
                  </Flex>

                  <Flex align="center" gap={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      borderColor="#CBD5E1"
                      borderRadius="lg"
                      onClick={handlePrevStudent}
                      disabled={safeIndex <= 0}
                    >
                      <Icon as={FaChevronLeft} boxSize={3} mr={1} /> Prev
                    </Button>
                    <Badge bg="#EEF2FF" color="#4338CA" px={2.5} py={1} borderRadius="md" fontWeight="800" fontSize="11px">
                      {filteredRoster.length > 0 ? `${safeIndex + 1} / ${filteredRoster.length}` : "0"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      borderColor="#CBD5E1"
                      borderRadius="lg"
                      onClick={handleNextStudent}
                      disabled={safeIndex >= filteredRoster.length - 1}
                    >
                      Next <Icon as={FaChevronRight} boxSize={3} ml={1} />
                    </Button>
                  </Flex>
                </Flex>

                {/* Candidate Pills */}
                <Flex gap={2} overflowX="auto" pb={1}>
                  {filteredRoster.map((s) => {
                    const isSelected =
                      (selectedStudentForCard?.studentId || selectedStudentForCard?.id) === (s.studentId || s.id);
                    const hasScores = Boolean(existingScores[s.studentId]);
                    return (
                      <Button
                        key={s.studentId || s.id}
                        size="sm"
                        borderRadius="xl"
                        bg={isSelected ? "#4338CA" : "white"}
                        color={isSelected ? "white" : "#0F172A"}
                        border="1px solid"
                        borderColor={isSelected ? "#4338CA" : "#E2E8F0"}
                        fontWeight="700"
                        fontSize="12px"
                        flexShrink={0}
                        onClick={() => handleFetchReportCard(s)}
                        _hover={{ bg: isSelected ? "#3730A3" : "#F8FAFC" }}
                      >
                        <Box
                          w="7px"
                          h="7px"
                          borderRadius="full"
                          bg={hasScores ? (isSelected ? "#86EFAC" : "#10B981") : (isSelected ? "#CBD5E1" : "#94A3B8")}
                          mr={2}
                        />
                        {getFormattedStudentName(s)}
                      </Button>
                    );
                  })}
                </Flex>
              </Box>

              {/* Document Container */}
              {loadingReportCard ? (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  minH="380px"
                  bg="white"
                  borderRadius="2xl"
                  border="2px solid #CBD5E1"
                  p={10}
                  boxShadow="0 10px 30px rgba(0,0,0,0.06)"
                  maxW="920px"
                  mx="auto"
                >
                  <Spinner size="xl" color="#4338CA" thickness="3px" />
                  <Text fontWeight="800" fontSize="16px" color="#0F172A" mt={4}>
                    Generating Official Terminal Report Card...
                  </Text>
                  <Text fontSize="13px" color="#64748B" mt={1}>
                    Retrieving academic broadsheet records, attendance logs, and institution endorsements
                  </Text>
                </Flex>
              ) : reportCardData ? (
                <StudentReportCardSheet
                  reportCard={reportCardData}
                  onPrint={() => window.print()}
                  showDetailedCa={true}
                  onEditScores={() => setActiveTab("scores")}
                  onSyncCbt={() => setActiveTab("cbt-sync")}
                />
              ) : (
                <Box
                  bg="white"
                  borderRadius="2xl"
                  border="2px dashed #CBD5E1"
                  p={{ base: 8, md: 12 }}
                  textAlign="center"
                  maxW="920px"
                  mx="auto"
                >
                  <Flex w="64px" h="64px" borderRadius="2xl" bg="#EDE9FE" color="#6D28D9" align="center" justify="center" mx="auto" mb={4}>
                    <Icon as={FaUserGraduate} boxSize={7} />
                  </Flex>
                  <Text fontSize="18px" fontWeight="900" color="#0F172A">
                    Select a Student to View Report Card
                  </Text>
                  <Text fontSize="14px" color="#64748B" maxW="460px" mx="auto" mt={2} mb={6}>
                    Click any student above to preview their official terminal report card sheet, verify scores, or print an A4 document.
                  </Text>
                  {roster.length > 0 && (
                    <Button
                      bg="#4338CA"
                      color="white"
                      borderRadius="xl"
                      fontWeight="700"
                      onClick={() => handleFetchReportCard(roster[0])}
                    >
                      Preview {getFormattedStudentName(roster[0])}'s Report Card
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          );
        })()}
      </Box>
    </DashboardLayout>
  );
}
