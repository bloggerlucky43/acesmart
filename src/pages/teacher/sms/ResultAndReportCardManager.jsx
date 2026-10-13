import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  FaTimes,
  FaHistory,
  FaCalendarAlt,
  FaSignature,
  FaTrash,
} from "react-icons/fa";
import {
  getClassArmsApi,
  getClassAttendanceByDateApi,
  getSubjectScoresApi,
  uploadSubjectScoresApi,
  syncCbtScoresApi,
  getStudentReportCardApi,
  getTeacherSignatureApi,
  uploadTeacherSignatureApi,
} from "../../../api-endpoint/sms/smsEndpoints";
import { fetchExams } from "../../../api-endpoint/exam/exams";
import { fetchSubjectsApi } from "../../../api-endpoint/subjects/subjectEndpoints";
import { fetchStudent } from "../../../api-endpoint/student/students";
import {
  formatStudentName,
  getFormattedStudentName,
} from "../../../libs/helper";
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

function TeacherSignatureCanvas({ onSave, saving }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDraw = (e) => {
    isDrawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    if (e.cancelable && e.type.startsWith("touch")) e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDraw = () => {
    isDrawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0F172A";
  }, []);

  return (
    <Box>
      <Box
        border="2px dashed #CBD5E1"
        borderRadius="xl"
        bg="#FAFAFA"
        p={1}
        position="relative"
        overflow="hidden"
      >
        <canvas
          ref={canvasRef}
          width={440}
          height={160}
          style={{
            width: "100%",
            height: "160px",
            touchAction: "none",
            cursor: "crosshair",
            background: "transparent",
          }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {!hasDrawn && (
          <Text
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            fontSize="12px"
            color="#94A3B8"
            pointerEvents="none"
          >
            ✍️ Draw your signature here
          </Text>
        )}
      </Box>
      <Flex mt={3} justify="space-between" align="center">
        <Button
          size="sm"
          variant="ghost"
          color="#64748B"
          onClick={clear}
          disabled={!hasDrawn}
        >
          Clear
        </Button>
        <Button
          size="sm"
          bg="#4338CA"
          color="white"
          borderRadius="xl"
          fontWeight="700"
          loading={saving}
          disabled={!hasDrawn}
          onClick={() => {
            if (!canvasRef.current) return;
            const dataUrl = canvasRef.current.toDataURL("image/png");
            onSave(dataUrl);
          }}
        >
          Save Signature
        </Button>
      </Flex>
    </Box>
  );
}

function TeacherSignatureUploader({ onSave, saving }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  return (
    <Box>
      <Box
        border="2px dashed #CBD5E1"
        borderRadius="xl"
        bg="#FAFAFA"
        p={6}
        textAlign="center"
      >
        {preview ? (
          <Box>
            <img
              src={preview}
              alt="Preview"
              style={{
                maxHeight: "80px",
                maxWidth: "240px",
                margin: "0 auto",
                objectFit: "contain",
              }}
            />
            <Text fontSize="12px" color="#64748B" mt={2}>
              {file?.name}
            </Text>
          </Box>
        ) : (
          <Box>
            <Icon as={FaFileInvoice} boxSize={8} color="#94A3B8" mb={2} />
            <Text fontSize="13px" fontWeight="700" color="#334155">
              Select signature image file
            </Text>
            <Text fontSize="11px" color="#94A3B8" mt={0.5}>
              Transparent PNG or JPEG recommended
            </Text>
          </Box>
        )}
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          style={{ marginTop: "12px", fontSize: "12px" }}
        />
      </Box>
      {file && (
        <Flex mt={3} justify="flex-end">
          <Button
            size="sm"
            bg="#4338CA"
            color="white"
            borderRadius="xl"
            fontWeight="700"
            loading={saving}
            onClick={() => onSave(file)}
          >
            Upload & Save Signature
          </Button>
        </Flex>
      )}
    </Box>
  );
}

export default function ResultAndReportCardManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("scores"); // "scores" | "cbt-sync" | "report-card"
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [availableSubjects, setAvailableSubjects] = useState(
    DEFAULT_FALLBACK_SUBJECTS,
  );
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

  const [selectedTerm, setSelectedTerm] = useState(currentTerm);
  const [selectedSession, setSelectedSession] = useState(currentSession);

  // Sync state if institution details arrive asynchronously
  useEffect(() => {
    if (institution?.currentTerm && !selectedTerm) {
      setSelectedTerm(institution.currentTerm);
    }
    if (institution?.academicSession && !selectedSession) {
      setSelectedSession(institution.academicSession);
    }
  }, [institution?.currentTerm, institution?.academicSession]);

  const availableTerms = ["First Term", "Second Term", "Third Term"];
  const availableSessions = useMemo(() => {
    const set = new Set();
    if (currentSession) set.add(currentSession);
    if (selectedSession) set.add(selectedSession);
    const match = String(currentSession).match(/^(\d{4})\/(\d{4})$/);
    const baseYear = match ? parseInt(match[1], 10) : new Date().getFullYear();
    for (let y = baseYear - 4; y <= baseYear + 2; y++) {
      set.add(`${y}/${y + 1}`);
    }
    return Array.from(set).sort().reverse();
  }, [currentSession, selectedSession]);

  const isPreviousPeriod =
    selectedTerm !== currentTerm || selectedSession !== currentSession;

  // Teacher Signature state
  const [teacherSignatureUrl, setTeacherSignatureUrl] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureMode, setSignatureMode] = useState("draw"); // "draw" | "upload"
  const [savingSignature, setSavingSignature] = useState(false);

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
          new Set([
            ...backendSubjects,
            ...examSubjects,
            ...DEFAULT_FALLBACK_SUBJECTS,
          ]),
        ).sort((a, b) => a.localeCompare(b));

        setAvailableSubjects(unified);
        if (unified.length > 0 && !unified.includes(subject)) {
          setSubject(unified[0]);
        }

        getTeacherSignatureApi()
          .then((sigRes) => {
            if (sigRes?.success && sigRes.signatureUrl) {
              setTeacherSignatureUrl(sigRes.signatureUrl);
            }
          })
          .catch(() => {});
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
        term: selectedTerm,
        session: selectedSession,
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
  }, [selectedClassId, subject, selectedTerm, selectedSession]);

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
        term: selectedTerm,
        session: selectedSession,
        scores: formattedScores,
      });

      if (res.success) {
        toaster.create({
          title: "Scores Saved Successfully!",
          description: `Updated scores for ${roster.length} students in ${subject} (${selectedSession} • ${selectedTerm})`,
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
      toaster.create({
        title: "Please select a CBT exam to synchronize",
        type: "error",
      });
      return;
    }

    setSyncing(true);
    try {
      const res = await syncCbtScoresApi({
        examId: selectedExamId,
        subject,
        targetColumn,
        term: selectedTerm,
        session: selectedSession,
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
        term: selectedTerm,
        session: selectedSession,
        bypassTokenCheck: "true", // Staff view bypasses token check
      });
      if (res.success) {
        setReportCardData(res.data);
      }
    } catch (error) {
      console.error("Fetch report card error:", error);
      toaster.create({
        title:
          error.response?.data?.message || "Failed to load report card preview",
        type: "error",
      });
    } finally {
      setLoadingReportCard(false);
    }
  };

  // Re-fetch report card if the teacher switches term or session while inspecting
  useEffect(() => {
    if (activeTab === "report-card" && selectedStudentForCard) {
      handleFetchReportCard(selectedStudentForCard);
    }
  }, [selectedTerm, selectedSession, activeTab]);

  const handleSaveSignature = async (signatureData) => {
    setSavingSignature(true);
    try {
      let payload;
      if (typeof signatureData === "string") {
        payload = { signature: signatureData };
      } else if (signatureData instanceof FormData) {
        payload = signatureData;
      } else if (signatureData === null) {
        payload = { remove: true };
      }
      const res = await uploadTeacherSignatureApi(payload);
      if (res?.success) {
        setTeacherSignatureUrl(res.signatureUrl || null);
        toaster.create({
          title:
            signatureData === null
              ? "Signature removed"
              : "Signature saved successfully",
          description: "Your signature will reflect on student report cards.",
          type: "success",
        });
        setShowSignatureModal(false);
        if (selectedStudentForCard) {
          handleFetchReportCard(selectedStudentForCard);
        }
      }
    } catch (e) {
      toaster.create({
        title: e.response?.data?.message || "Failed to save signature",
        type: "error",
      });
    } finally {
      setSavingSignature(false);
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
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          gap={4}
          mb={6}
        >
          <Flex
            justify="space-between"
            align="center"
            wrap="wrap"
            gap={3}
            w={{ base: "100%", md: "auto" }}
          >
            <Flex align="center" gap={3}>
              {institutionLogo && (
                <Box
                  w={{ base: "38px", sm: "44px" }}
                  h={{ base: "38px", sm: "44px" }}
                  borderRadius="xl"
                  bg="white"
                  p={1}
                  border="1px solid #E2E8F0"
                  flexShrink={0}
                >
                  <img
                    src={institutionLogo}
                    alt="Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              )}
              <Box>
                <Text
                  fontSize={{ base: "20px", sm: "24px" }}
                  fontWeight="900"
                  color="#0F172A"
                  letterSpacing="-0.5px"
                >
                  Terminal Report Cards
                </Text>
                <Text fontSize="12px" color="#64748B">
                  Official Broadsheets & Digital Endorsements
                </Text>
              </Box>
            </Flex>

            {/* Teacher Signature Button in Header */}
            <Button
              size="sm"
              borderRadius="xl"
              bg={teacherSignatureUrl ? "#ECFDF5" : "#EEF2FF"}
              color={teacherSignatureUrl ? "#065F46" : "#4338CA"}
              border="1px solid"
              borderColor={teacherSignatureUrl ? "#A7F3D0" : "#C7D2FE"}
              fontWeight="800"
              fontSize="12px"
              h="38px"
              onClick={() => setShowSignatureModal(true)}
              _hover={{ opacity: 0.9 }}
              flexShrink={0}
            >
              <Icon as={FaSignature} mr={1.5} boxSize={3.5} />
              {teacherSignatureUrl ? "My Signature ✓" : "Add Signature"}
            </Button>
          </Flex>

          {/* Tab Switcher */}
          <Flex
            bg="#F1F5F9"
            p={1}
            borderRadius="xl"
            gap={1}
            overflowX="auto"
            maxW="100%"
            py={1}
          >
            <Button
              size="sm"
              borderRadius="lg"
              bg={activeTab === "scores" ? "white" : "transparent"}
              color={activeTab === "scores" ? "#0F172A" : "#64748B"}
              fontWeight="700"
              boxShadow={
                activeTab === "scores" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"
              }
              onClick={() => setActiveTab("scores")}
              flexShrink={0}
            >
              <Icon as={FaTable} mr={1.5} boxSize={3.5} />
              Score Sheet
            </Button>
            <Button
              size="sm"
              borderRadius="lg"
              bg={activeTab === "cbt-sync" ? "white" : "transparent"}
              color={activeTab === "cbt-sync" ? "#0F172A" : "#64748B"}
              fontWeight="700"
              boxShadow={
                activeTab === "cbt-sync" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"
              }
              onClick={() => setActiveTab("cbt-sync")}
              flexShrink={0}
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
              boxShadow={
                activeTab === "report-card"
                  ? "0 2px 6px rgba(0,0,0,0.06)"
                  : "none"
              }
              onClick={() => {
                setActiveTab("report-card");
                const target = selectedStudentForCard || roster[0];
                if (target) handleFetchReportCard(target);
              }}
              flexShrink={0}
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
              mb={isPreviousPeriod ? 3 : 6}
            >
              <Flex gap={3} flexWrap="wrap" align="center">
                {/* Academic Session */}
                <Box>
                  <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
                    ACADEMIC SESSION
                  </Text>
                  <select
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                    style={{
                      height: "40px",
                      padding: "0 12px",
                      borderRadius: "10px",
                      border: "1px solid #CBD5E1",
                      fontSize: "13px",
                      fontWeight: "700",
                      background: selectedSession !== currentSession ? "#FFFBEB" : "#F8FAFC",
                      color: selectedSession !== currentSession ? "#92400E" : "#0F172A",
                    }}
                  >
                    {availableSessions.map((sess) => (
                      <option key={sess} value={sess}>
                        {sess} {sess === currentSession ? "(Active)" : ""}
                      </option>
                    ))}
                  </select>
                </Box>

                {/* Term */}
                <Box>
                  <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
                    TERM
                  </Text>
                  <select
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    style={{
                      height: "40px",
                      padding: "0 12px",
                      borderRadius: "10px",
                      border: "1px solid #CBD5E1",
                      fontSize: "13px",
                      fontWeight: "700",
                      background: selectedTerm !== currentTerm ? "#FFFBEB" : "#F8FAFC",
                      color: selectedTerm !== currentTerm ? "#92400E" : "#0F172A",
                    }}
                  >
                    {availableTerms.map((t) => (
                      <option key={t} value={t}>
                        {t} {t === currentTerm && selectedSession === currentSession ? "(Active)" : ""}
                      </option>
                    ))}
                  </select>
                </Box>

                {/* Class Arm */}
                <Box>
                  <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
                    CLASS ARM
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
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </Box>

                {/* Subject */}
                <Box>
                  <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
                    SUBJECT
                  </Text>
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
                      minWidth: "160px",
                    }}
                  >
                    {availableSubjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    {Boolean(
                      subject && !availableSubjects.includes(subject),
                    ) && (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    )}
                  </select>
                </Box>
              </Flex>

              <Flex
                direction={{ base: "column", md: "row" }}
                align={{ base: "stretch", md: "center" }}
                justify="space-between"
                gap={3}
                w="100%"
                mt={2}
                pt={2}
                borderTop="1px solid #F1F5F9"
              >
                <Flex align="center" gap={2} flexWrap="wrap">
                  <Badge
                    bg={
                      enteredCount >= roster.length && roster.length > 0
                        ? "#ECFDF5"
                        : "#FEF3C7"
                    }
                    color={
                      enteredCount >= roster.length && roster.length > 0
                        ? "#065F46"
                        : "#92400E"
                    }
                    px={3}
                    py={1.5}
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
                  fontWeight="800"
                  fontSize="13px"
                  px={5}
                  h="42px"
                  boxShadow="0 4px 14px rgba(16, 185, 129, 0.3)"
                  _hover={{ opacity: 0.95 }}
                  onClick={handleSaveScores}
                  loading={saving}
                  loadingText="Saving Scores..."
                  w={{ base: "100%", md: "auto" }}
                >
                  <Icon as={FaSave} mr={2} boxSize={3.5} />
                  Save Scores ({selectedSession} • {selectedTerm})
                </Button>
              </Flex>
            </Flex>

            {/* Past/Custom Period Indicator Banner */}
            {isPreviousPeriod && (
              <Flex
                align="center"
                justify="space-between"
                bg="#FFFBEB"
                border="1px solid #FDE68A"
                p={3.5}
                borderRadius="xl"
                mb={5}
                wrap="wrap"
                gap={2}
              >
                <Flex align="center" gap={2.5}>
                  <Icon as={FaHistory} color="#B45309" boxSize={4} />
                  <Text fontSize="13px" fontWeight="700" color="#92400E">
                    Recording scores for past / custom session: <strong>{selectedSession}</strong> ({selectedTerm}).
                    Scores and report cards will be securely stored for this period without altering current active records.
                  </Text>
                </Flex>
                <Button
                  size="xs"
                  bg="#FEF3C7"
                  color="#92400E"
                  border="1px solid #FCD34D"
                  fontWeight="800"
                  _hover={{ bg: "#FDE68A" }}
                  onClick={() => {
                    setSelectedTerm(currentTerm);
                    setSelectedSession(currentSession);
                  }}
                >
                  Reset to Current Active Term ({currentSession} • {currentTerm})
                </Button>
              </Flex>
            )}

            {/* Score Entry Spreadsheet */}
            <Box
              bg="white"
              borderRadius="2xl"
              border="1px solid #E2E8F0"
              overflow="hidden"
              boxShadow="0 4px 16px rgba(0,0,0,0.02)"
            >
              <Box overflowX="auto">
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#F8FAFC",
                        borderBottom: "1px solid #E2E8F0",
                      }}
                    >
                      <th
                        style={{
                          padding: "12px 16px",
                          fontSize: "12px",
                          color: "#64748B",
                        }}
                      >
                        S/N
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          fontSize: "12px",
                          color: "#64748B",
                        }}
                      >
                        STUDENT NAME
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          fontSize: "12px",
                          color: "#64748B",
                        }}
                      >
                        STUDENT CODE
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          fontSize: "12px",
                          color: "#64748B",
                          width: "90px",
                        }}
                      >
                        CA 1 (10)
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          fontSize: "12px",
                          color: "#64748B",
                          width: "90px",
                        }}
                      >
                        CA 2 (10)
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          fontSize: "12px",
                          color: "#64748B",
                          width: "100px",
                        }}
                      >
                        ASSIGN (10)
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          fontSize: "12px",
                          color: "#64748B",
                          width: "90px",
                        }}
                      >
                        EXAM (70)
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          fontSize: "12px",
                          color: "#64748B",
                          width: "90px",
                        }}
                      >
                        TOTAL (100)
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          fontSize: "12px",
                          color: "#64748B",
                          width: "80px",
                        }}
                      >
                        GRADE
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((student, idx) => {
                      const total = calculateRowTotal(student.studentId);
                      const { grade } = getRowGrade(total);
                      const s = scores[student.studentId] || {};
                      const saved = existingScores[student.studentId];

                      return (
                        <tr
                          key={student.studentId}
                          style={{
                            borderBottom: "1px solid #F1F5F9",
                            background: saved ? "#F0FDF4" : "transparent",
                          }}
                        >
                          <td
                            style={{
                              padding: "12px 16px",
                              fontSize: "13px",
                              color: "#64748B",
                            }}
                          >
                            {idx + 1}
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              fontWeight: "700",
                              color: "#0F172A",
                              fontSize: "14px",
                            }}
                          >
                            <Flex align="center" gap={2}>
                              {getFormattedStudentName(student)}
                              {saved && (
                                <Badge
                                  bg={saved.cbtExamId ? "#EDE9FE" : "#DCFCE7"}
                                  color={
                                    saved.cbtExamId ? "#5B21B6" : "#166534"
                                  }
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
                          <td
                            style={{
                              padding: "12px 16px",
                              fontSize: "13px",
                              color: "#4338CA",
                              fontWeight: "600",
                            }}
                          >
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
                              onChange={(e) =>
                                handleScoreChange(
                                  student.studentId,
                                  "ca1",
                                  e.target.value,
                                )
                              }
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
                              onChange={(e) =>
                                handleScoreChange(
                                  student.studentId,
                                  "ca2",
                                  e.target.value,
                                )
                              }
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
                              onChange={(e) =>
                                handleScoreChange(
                                  student.studentId,
                                  "assignment",
                                  e.target.value,
                                )
                              }
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
                              onChange={(e) =>
                                handleScoreChange(
                                  student.studentId,
                                  "exam",
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              fontWeight: "900",
                              fontSize: "15px",
                              color: "#0F172A",
                            }}
                          >
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
        {activeTab === "cbt-sync" &&
          (() => {
            const selectedExam = exams.find(
              (e) => (e._id || e.id) === selectedExamId,
            );
            const currentClassObj = classes.find(
              (c) => c.id === selectedClassId,
            );

            return (
              <Box
                maxW="740px"
                mx="auto"
                bg="white"
                p={{ base: 6, md: 8 }}
                borderRadius="2xl"
                border="1px solid #E2E8F0"
                boxShadow="0 4px 20px rgba(0,0,0,0.04)"
              >
                <Flex align="center" gap={3} mb={3}>
                  <Flex
                    w="48px"
                    h="48px"
                    borderRadius="xl"
                    bg="#EDE9FE"
                    color="#6D28D9"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FaBrain} boxSize={6} />
                  </Flex>
                  <Box>
                    <Text fontSize="18px" fontWeight="900" color="#0F172A">
                      Synchronize CBT Scores into Report Card
                    </Text>
                    <Text fontSize="13px" color="#64748B">
                      Automatically pull candidate exam scores into academic
                      continuous assessment or exam columns
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
                      Target Class:{" "}
                      <strong>
                        {currentClassObj?.name || "Selected Class Arm"}
                      </strong>{" "}
                      • Enrolled: <strong>{roster.length} Candidates</strong>
                    </Text>
                  </Flex>
                  <Badge
                    bg={isPreviousPeriod ? "#B45309" : "#4338CA"}
                    color="white"
                    px={2.5}
                    py={0.5}
                    borderRadius="md"
                    fontSize="11px"
                    fontWeight="800"
                  >
                    Target: {selectedSession} • {selectedTerm}
                  </Badge>
                </Flex>

                <Flex direction="column" gap={5}>
                  {/* Target Session & Term */}
                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                    <Box>
                      <Text
                        fontSize="13px"
                        fontWeight="700"
                        color="#334155"
                        mb={1.5}
                      >
                        Target Academic Session
                      </Text>
                      <select
                        value={selectedSession}
                        onChange={(e) => setSelectedSession(e.target.value)}
                        style={{
                          width: "100%",
                          height: "46px",
                          padding: "0 14px",
                          borderRadius: "12px",
                          border: "1px solid #CBD5E1",
                          fontSize: "14px",
                          fontWeight: "700",
                          background: selectedSession !== currentSession ? "#FFFBEB" : "#F8FAFC",
                          color: selectedSession !== currentSession ? "#92400E" : "#0F172A",
                        }}
                      >
                        {availableSessions.map((sess) => (
                          <option key={sess} value={sess}>
                            {sess} {sess === currentSession ? "(Active)" : ""}
                          </option>
                        ))}
                      </select>
                    </Box>
                    <Box>
                      <Text
                        fontSize="13px"
                        fontWeight="700"
                        color="#334155"
                        mb={1.5}
                      >
                        Target Term
                      </Text>
                      <select
                        value={selectedTerm}
                        onChange={(e) => setSelectedTerm(e.target.value)}
                        style={{
                          width: "100%",
                          height: "46px",
                          padding: "0 14px",
                          borderRadius: "12px",
                          border: "1px solid #CBD5E1",
                          fontSize: "14px",
                          fontWeight: "700",
                          background: selectedTerm !== currentTerm ? "#FFFBEB" : "#F8FAFC",
                          color: selectedTerm !== currentTerm ? "#92400E" : "#0F172A",
                        }}
                      >
                        {availableTerms.map((t) => (
                          <option key={t} value={t}>
                            {t} {t === currentTerm && selectedSession === currentSession ? "(Active)" : ""}
                          </option>
                        ))}
                      </select>
                    </Box>
                  </SimpleGrid>

                  {/* 1. Exam Selection */}
                  <Box>
                    <Text
                      fontSize="13px"
                      fontWeight="700"
                      color="#334155"
                      mb={1.5}
                    >
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
                          <option
                            key={exam._id || exam.id}
                            value={exam._id || exam.id}
                          >
                            {exam.examName || exam.title || "Examination"} (
                            {exam.subject || "General"}) —{" "}
                            {exam.totalMarks || 100} Marks
                          </option>
                        ))
                      )}
                    </select>
                  </Box>

                  {/* Exam Details Card */}
                  {selectedExam && (
                    <Box
                      bg="#F8FAFC"
                      border="1px solid #E2E8F0"
                      p={3.5}
                      borderRadius="xl"
                    >
                      <SimpleGrid
                        columns={{ base: 2, sm: 4 }}
                        gap={2}
                        fontSize="12px"
                      >
                        <Box>
                          <Text
                            fontSize="10px"
                            color="#64748B"
                            fontWeight="700"
                            textTransform="uppercase"
                          >
                            Exam Title
                          </Text>
                          <Text fontWeight="800" color="#0F172A" noOfLines={1}>
                            {selectedExam.examName ||
                              selectedExam.title ||
                              "CBT Exam"}
                          </Text>
                        </Box>
                        <Box>
                          <Text
                            fontSize="10px"
                            color="#64748B"
                            fontWeight="700"
                            textTransform="uppercase"
                          >
                            Exam Subject
                          </Text>
                          <Text fontWeight="800" color="#4338CA">
                            {selectedExam.subject || "General"}
                          </Text>
                        </Box>
                        <Box>
                          <Text
                            fontSize="10px"
                            color="#64748B"
                            fontWeight="700"
                            textTransform="uppercase"
                          >
                            Total Marks
                          </Text>
                          <Text fontWeight="800" color="#059669">
                            {selectedExam.totalMarks || 100} Pts
                          </Text>
                        </Box>
                        <Box>
                          <Text
                            fontSize="10px"
                            color="#64748B"
                            fontWeight="700"
                            textTransform="uppercase"
                          >
                            Duration
                          </Text>
                          <Text fontWeight="800" color="#0F172A">
                            {selectedExam.duration || 60} mins
                          </Text>
                        </Box>
                      </SimpleGrid>
                    </Box>
                  )}

                  {/* 2. Map to Report Card Subject */}
                  <Box>
                    <Text
                      fontSize="13px"
                      fontWeight="700"
                      color="#334155"
                      mb={1.5}
                    >
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
                      {Boolean(
                        subject && !availableSubjects.includes(subject),
                      ) && (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      )}
                    </select>
                  </Box>

                  {/* 3. Destination Score Column */}
                  <Box>
                    <Text
                      fontSize="13px"
                      fontWeight="700"
                      color="#334155"
                      mb={1.5}
                    >
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
                      <option value="examScore">
                        Terminal Exam (70% Max Weight)
                      </option>
                      <option value="caScore1">
                        Continuous Assessment 1 (10% Max Weight)
                      </option>
                      <option value="caScore2">
                        Continuous Assessment 2 (10% Max Weight)
                      </option>
                      <option value="assignmentScore">
                        Assignment / Continuous Assessment 3 (10% Max Weight)
                      </option>
                    </select>
                  </Box>

                  {/* 4. Score Scaling Mode */}
                  <Box>
                    <Text
                      fontSize="13px"
                      fontWeight="700"
                      color="#334155"
                      mb={1.5}
                    >
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
                        Smart Weight Scaling (Recommended: e.g. scales 80% on
                        70% exam to 56.0, or 80% on 10% CA to 8.0)
                      </option>
                      <option value="raw">
                        Raw CBT Points (Record candidate's exact raw total score
                        directly)
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
        {activeTab === "report-card" &&
          (() => {
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
              (s) =>
                (s.studentId || s.id) ===
                (selectedStudentForCard?.studentId ||
                  selectedStudentForCard?.id),
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
                <Box
                  bg="white"
                  p={4}
                  borderRadius="2xl"
                  border="1px solid #E2E8F0"
                  mb={6}
                  className="no-print"
                >
                  <Flex
                    justify="space-between"
                    align="center"
                    wrap="wrap"
                    gap={3}
                    mb={3}
                  >
                    <Flex align="center" gap={3} flexWrap="wrap">
                      <Flex
                        align="center"
                        bg="#F8FAFC"
                        border="1px solid #CBD5E1"
                        borderRadius="xl"
                        px={3}
                        h="40px"
                        w={{ base: "100%", md: "240px" }}
                      >
                        <Icon
                          as={FaSearch}
                          color="#94A3B8"
                          mr={2}
                          boxSize={3.5}
                        />
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

                      {/* Academic Session Selector */}
                      <select
                        value={selectedSession}
                        onChange={(e) => setSelectedSession(e.target.value)}
                        style={{
                          height: "40px",
                          padding: "0 10px",
                          borderRadius: "10px",
                          border: "1px solid #CBD5E1",
                          fontSize: "12.5px",
                          fontWeight: "700",
                          background: selectedSession !== currentSession ? "#FFFBEB" : "#F8FAFC",
                          color: selectedSession !== currentSession ? "#92400E" : "#0F172A",
                        }}
                      >
                        {availableSessions.map((sess) => (
                          <option key={sess} value={sess}>
                            {sess} {sess === currentSession ? "(Active)" : ""}
                          </option>
                        ))}
                      </select>

                      {/* Term Selector */}
                      <select
                        value={selectedTerm}
                        onChange={(e) => setSelectedTerm(e.target.value)}
                        style={{
                          height: "40px",
                          padding: "0 10px",
                          borderRadius: "10px",
                          border: "1px solid #CBD5E1",
                          fontSize: "12.5px",
                          fontWeight: "700",
                          background: selectedTerm !== currentTerm ? "#FFFBEB" : "#F8FAFC",
                          color: selectedTerm !== currentTerm ? "#92400E" : "#0F172A",
                        }}
                      >
                        {availableTerms.map((t) => (
                          <option key={t} value={t}>
                            {t} {t === currentTerm && selectedSession === currentSession ? "(Active)" : ""}
                          </option>
                        ))}
                      </select>

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
                      <Badge
                        bg="#EEF2FF"
                        color="#4338CA"
                        px={2.5}
                        py={1}
                        borderRadius="md"
                        fontWeight="800"
                        fontSize="11px"
                      >
                        {filteredRoster.length > 0
                          ? `${safeIndex + 1} / ${filteredRoster.length}`
                          : "0"}
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
                  <Flex gap={2} overflowX="auto" pb={1} align="center">
                    {filteredRoster.map((s) => {
                      const isSelected =
                        (selectedStudentForCard?.studentId ||
                          selectedStudentForCard?.id) === (s.studentId || s.id);
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
                            bg={
                              hasScores
                                ? isSelected
                                  ? "#86EFAC"
                                  : "#10B981"
                                : isSelected
                                  ? "#CBD5E1"
                                  : "#94A3B8"
                            }
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
                    <Text
                      fontWeight="800"
                      fontSize="16px"
                      color="#0F172A"
                      mt={4}
                    >
                      Generating Official Terminal Report Card...
                    </Text>
                    <Text fontSize="13px" color="#64748B" mt={1}>
                      Retrieving academic records, attendance logs,
                      and institution endorsements
                    </Text>
                  </Flex>
                ) : reportCardData ? (
                  <Box overflowX="auto" pb={4} w="100%">
                    <StudentReportCardSheet
                      reportCard={reportCardData}
                      onPrint={() => window.print()}
                      showDetailedCa={true}
                      onEditScores={() => setActiveTab("scores")}
                      onSyncCbt={() => setActiveTab("cbt-sync")}
                    />
                  </Box>
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
                    <Flex
                      w="64px"
                      h="64px"
                      borderRadius="2xl"
                      bg="#EDE9FE"
                      color="#6D28D9"
                      align="center"
                      justify="center"
                      mx="auto"
                      mb={4}
                    >
                      <Icon as={FaUserGraduate} boxSize={7} />
                    </Flex>
                    <Text fontSize="18px" fontWeight="900" color="#0F172A">
                      Select a Student to View Report Card
                    </Text>
                    <Text
                      fontSize="14px"
                      color="#64748B"
                      maxW="460px"
                      mx="auto"
                      mt={2}
                      mb={6}
                    >
                      Click any student above to preview their official terminal
                      report card sheet, verify scores, or print an A4 document.
                    </Text>
                    {roster.length > 0 && (
                      <Button
                        bg="#4338CA"
                        color="white"
                        borderRadius="xl"
                        fontWeight="700"
                        onClick={() => handleFetchReportCard(roster[0])}
                      >
                        Preview {getFormattedStudentName(roster[0])}'s Report
                        Card
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            );
          })()}
      </Box>

      {/* Modal: Form Teacher Signature */}
      {showSignatureModal && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(15, 23, 42, 0.65)"
          backdropFilter="blur(4px)"
          zIndex={9999}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <Box
            bg="white"
            borderRadius="24px"
            boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            w="100%"
            maxW="540px"
            maxH="90vh"
            display="flex"
            flexDirection="column"
            overflow="hidden"
            border="1px solid #E2E8F0"
          >
            {/* Header */}
            <Flex
              p={5}
              borderBottom="1px solid #F1F5F9"
              justify="space-between"
              align="center"
              bg="#F8FAFC"
            >
              <Box>
                <Flex align="center" gap={2}>
                  <Icon as={FaSignature} color="#4338CA" boxSize={5} />
                  <Text fontSize="16px" fontWeight="900" color="#0F172A">
                    Form Teacher's Digital Signature
                  </Text>
                </Flex>
                <Text fontSize="12px" color="#64748B" mt={0.5}>
                  Will appear on student terminal report card endorsements
                </Text>
              </Box>
              <Button
                size="sm"
                variant="ghost"
                borderRadius="full"
                onClick={() => setShowSignatureModal(false)}
              >
                <Icon as={FaTimes} color="#64748B" boxSize={4} />
              </Button>
            </Flex>

            {/* Body */}
            <Box p={5} overflowY="auto">
              {teacherSignatureUrl && (
                <Box
                  mb={4}
                  p={3.5}
                  bg="#F0FDF4"
                  border="1px solid #BBF7D0"
                  borderRadius="xl"
                >
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontSize="12px" fontWeight="800" color="#166534">
                      CURRENT ACTIVE SIGNATURE
                    </Text>
                    <Button
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                      color="#DC2626"
                      onClick={() => handleSaveSignature(null)}
                      loading={savingSignature}
                    >
                      Remove Signature
                    </Button>
                  </Flex>
                  <Box
                    bg="white"
                    p={2}
                    borderRadius="lg"
                    border="1px solid #DCFCE7"
                    display="inline-block"
                  >
                    <img
                      src={teacherSignatureUrl}
                      alt="Current Signature"
                      style={{
                        maxHeight: "60px",
                        maxWidth: "180px",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                </Box>
              )}

              {/* Mode switch */}
              <Flex bg="#F1F5F9" p={1} borderRadius="xl" mb={4} gap={1}>
                <Button
                  size="sm"
                  flex="1"
                  borderRadius="lg"
                  fontWeight="800"
                  fontSize="12px"
                  bg={signatureMode === "draw" ? "white" : "transparent"}
                  color={signatureMode === "draw" ? "#4338CA" : "#64748B"}
                  boxShadow={
                    signatureMode === "draw"
                      ? "0 1px 3px rgba(0,0,0,0.1)"
                      : "none"
                  }
                  onClick={() => setSignatureMode("draw")}
                >
                  Draw Signature
                </Button>
                <Button
                  size="sm"
                  flex="1"
                  borderRadius="lg"
                  fontWeight="800"
                  fontSize="12px"
                  bg={signatureMode === "upload" ? "white" : "transparent"}
                  color={signatureMode === "upload" ? "#4338CA" : "#64748B"}
                  boxShadow={
                    signatureMode === "upload"
                      ? "0 1px 3px rgba(0,0,0,0.1)"
                      : "none"
                  }
                  onClick={() => setSignatureMode("upload")}
                >
                  Upload Image
                </Button>
              </Flex>

              {signatureMode === "draw" ? (
                <TeacherSignatureCanvas
                  onSave={handleSaveSignature}
                  saving={savingSignature}
                />
              ) : (
                <TeacherSignatureUploader
                  onSave={handleSaveSignature}
                  saving={savingSignature}
                />
              )}
            </Box>

            {/* Footer */}
            <Flex
              p={3.5}
              borderTop="1px solid #F1F5F9"
              justify="flex-end"
              bg="#F8FAFC"
            >
              <Button
                size="sm"
                variant="outline"
                borderColor="#CBD5E1"
                borderRadius="lg"
                onClick={() => setShowSignatureModal(false)}
              >
                Close
              </Button>
            </Flex>
          </Box>
        </Box>
      )}
    </DashboardLayout>
  );
}
