import { useState, useEffect, useMemo, useRef } from "react";
import QRCode from "qrcode";
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
} from "@chakra-ui/react";
import {
  FaIdCard,
  FaPrint,
  FaUsers,
  FaGraduationCap,
  FaSearch,
  FaSyncAlt,
  FaCheckSquare,
  FaSquare,
  FaShieldAlt,
  FaUndo,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaWifi,
  FaSlidersH,
  FaStar,
  FaAward,
} from "react-icons/fa";
import DashboardLayout from "../../constants/dashboardlayout";
import {
  getInstitutionProfileApi,
  getStaffListApi,
  getClassArmsApi,
} from "../../api-endpoint/sms/smsEndpoints";
import { fetchStudent } from "../../api-endpoint/student/students";
import { getPrefectsApi } from "../../api-endpoint/sms/prefectEndpoints";
import { useAuth } from "../../libs/AuthProvider";
import { toaster } from "../../components/ui/toaster";
import { formatStudentName } from "../../libs/helper";

// Preset Color Schemes for Institutional Branding
const COLOR_THEMES = [
  { id: "navy", name: "Royal Navy & Gold", primary: "#0F172A", accent: "#F59E0B", lightBg: "#F8FAFC" },
  { id: "blue", name: "Classic Cobalt Blue", primary: "#1E40AF", accent: "#38BDF8", lightBg: "#EFF6FF" },
  { id: "emerald", name: "Emerald & Forest", primary: "#064E3B", accent: "#34D399", lightBg: "#ECFDF5" },
  { id: "burgundy", name: "Imperial Burgundy", primary: "#881337", accent: "#FB7185", lightBg: "#FFF1F2" },
  { id: "purple", name: "Academic Purple", primary: "#581C87", accent: "#C084FC", lightBg: "#FAF5FF" },
  { id: "black", name: "Executive Onyx", primary: "#18181B", accent: "#A1A1AA", lightBg: "#F4F4F5" },
];

export default function IdCardGenerator() {
  const { user } = useAuth();
  const printAreaRef = useRef(null);

  // Core Data State
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [classArms, setClassArms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Mode State
  const [cardType, setCardType] = useState("student"); // "student" | "staff"
  const [orientation, setOrientation] = useState("portrait"); // "portrait" | "landscape"
  const [sideMode, setSideMode] = useState("both"); // "both" | "front" | "back"
  const [selectedClassArm, setSelectedClassArm] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [theme, setTheme] = useState(COLOR_THEMES[0]);

  // Aesthetic Security Features (Customizable by Institution)
  const [showWatermark, setShowWatermark] = useState(true);
  const [showGuilloche, setShowGuilloche] = useState(true);
  const [showSmartChip, setShowSmartChip] = useState(true);
  const [showHologram, setShowHologram] = useState(true);
  const [showLanyardSlot, setShowLanyardSlot] = useState(true);

  // QR Code Cache: Map<id, qrDataUrl>
  const [qrCache, setQrCache] = useState({});

  // Active inspect card for preview
  const [inspectIndex, setInspectIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Load Institution Profile, Classes, Students, and Staff
  const loadData = async () => {
    setLoading(true);
    try {
      const [profRes, classRes, studRes, staffRes, prefectRes] = await Promise.all([
        getInstitutionProfileApi().catch(() => null),
        getClassArmsApi().catch(() => null),
        fetchStudent().catch(() => null),
        getStaffListApi().catch(() => null),
        getPrefectsApi().catch(() => null),
      ]);

      if (profRes?.success) setProfile(profRes.data);
      if (classRes?.success) setClassArms(classRes.data || []);

      const rawStudents = studRes?.students || [];
      const prefectList = prefectRes?.data || [];
      const prefectMap = new Map();
      prefectList.forEach((p) => {
        if (p.isPrefect) {
          prefectMap.set(p.id, p.prefectRole || "Prefect");
        }
      });

      const mergedStudents = rawStudents.map((s) => {
        const roleFromPrefects = prefectMap.get(s.id);
        const isPrefect = Boolean(s.isPrefect || roleFromPrefects);
        const prefectRole = s.prefectRole || roleFromPrefects || (isPrefect ? "Prefect" : null);
        return {
          ...s,
          isPrefect,
          prefectRole,
        };
      });

      setStudents(mergedStudents);
      if (staffRes?.success) setStaffList(staffRes.data || []);
    } catch (err) {
      console.error("Load ID Card data error:", err);
      toaster.create({
        title: "Failed to load ID card records",
        description: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const school = profile || user?.institution || {};
  const schoolName = school.name || "Institutional Academy";
  const schoolLogo = school.logoUrl;
  const academicSession = school.academicSession || "2025/2026";

  // Filtered List based on Card Type & Filters
  const currentItems = useMemo(() => {
    if (cardType === "student") {
      return students.filter((s) => {
        const matchesClass =
          selectedClassArm === "all" ||
          (selectedClassArm === "prefects" && s.isPrefect) ||
          String(s.classArmId) === String(selectedClassArm);
        const nameStr = `${s.firstName || ""} ${s.lastName || ""} ${s.studentId || ""} ${s.prefectRole || ""}`.toLowerCase();
        const matchesSearch = !searchQuery.trim() || nameStr.includes(searchQuery.toLowerCase().trim());
        return matchesClass && matchesSearch;
      });
    } else {
      return staffList.filter((stf) => {
        const nameStr = `${stf.name || ""} ${stf.staffIdNumber || ""} ${stf.designation || ""}`.toLowerCase();
        return !searchQuery.trim() || nameStr.includes(searchQuery.toLowerCase().trim());
      });
    }
  }, [cardType, students, staffList, selectedClassArm, searchQuery]);

  // Pre-generate QR Codes for current items
  useEffect(() => {
    const generateQRs = async () => {
      const newCache = { ...qrCache };
      let changed = false;

      for (const item of currentItems) {
        const code = cardType === "student" ? item.studentId : item.staffIdNumber || item.id;
        if (code && !newCache[code]) {
          try {
            const dataUrl = await QRCode.toDataURL(code, {
              width: 140,
              margin: 1,
              color: { dark: "#0F172A", light: "#FFFFFF" },
            });
            newCache[code] = dataUrl;
            changed = true;
          } catch (e) {
            console.error("QR generation error:", e);
          }
        }
      }

      if (changed) {
        setQrCache(newCache);
      }
    };

    if (currentItems.length > 0) {
      generateQRs();
    }
  }, [currentItems, cardType]);

  // Batch Selection Handlers
  const handleToggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === currentItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(currentItems.map((item) => item.id)));
    }
  };

  // Cards ready to print
  const printableItems = useMemo(() => {
    if (selectedIds.size === 0) return currentItems;
    return currentItems.filter((item) => selectedIds.has(item.id));
  }, [currentItems, selectedIds]);

  const activeInspectItem = currentItems[inspectIndex] || currentItems[0] || null;

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
        maxW="1440px"
        mx="auto"
      >
        {/* ========================================================
            PRINT STYLESHEET: Injected @media print
           ======================================================== */}
        <style>{`
          @media print {
            body, html {
              background: #FFFFFF !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            nav, header, aside, .no-print, button, input, select {
              display: none !important;
            }
            .print-only-container {
              display: block !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            @page {
              size: A4 portrait;
              margin: 8mm 6mm;
            }
            .a4-print-sheet {
              display: grid !important;
              grid-template-columns: repeat(2, 86mm);
              column-gap: 8mm;
              row-gap: 8mm;
              justify-content: center;
              page-break-inside: avoid;
            }
            .print-card-unit {
              page-break-inside: avoid;
              break-inside: avoid;
              box-shadow: none !important;
              border: 1px dashed #CBD5E1 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
          @media screen {
            .print-only-container {
              display: none;
            }
          }
        `}</style>

        {/* ========================================================
            PAGE HEADER & HERO
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
              {schoolLogo ? (
                <Box
                  w="64px"
                  h="64px"
                  borderRadius="xl"
                  bg="white"
                  p={1.5}
                  boxShadow="0 4px 12px rgba(0,0,0,0.3)"
                  flexShrink={0}
                >
                  <img
                    src={schoolLogo}
                    alt="School Crest"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </Box>
              ) : (
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
                  <Icon as={FaIdCard} boxSize={7} />
                </Flex>
              )}

              <Box>
                <HStack spacing={2} mb={1}>
                  <Text fontSize={{ base: "20px", md: "24px" }} fontWeight="900" letterSpacing="-0.5px">
                    Institutional ID Card Generator
                  </Text>
                  <Badge bg="#10B981" color="white" fontSize="10px" px={2} py={0.5} borderRadius="full">
                    PVC CR80 SMART CARD
                  </Badge>
                </HStack>
                <Text fontSize="13px" color="#94A3B8">
                  {schoolName} • Session: <strong>{academicSession}</strong> • Term: <strong>{school.currentTerm || "First Term"}</strong>
                </Text>
              </Box>
            </Flex>

            {/* Quick Actions */}
            <HStack spacing={3} flexWrap="wrap">
              <Button
                size="sm"
                bg="#334155"
                color="white"
                borderRadius="xl"
                _hover={{ bg: "#475569" }}
                onClick={loadData}
                disabled={loading}
              >
                <Icon as={FaSyncAlt} mr={1.5} boxSize={3} />
                Refresh Data
              </Button>
              <Button
                size="sm"
                bg="linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)"
                color="white"
                borderRadius="xl"
                boxShadow="0 4px 14px rgba(37, 99, 235, 0.4)"
                _hover={{ opacity: 0.95 }}
                onClick={handlePrint}
                disabled={printableItems.length === 0}
              >
                <Icon as={FaPrint} mr={2} boxSize={3.5} />
                Print A4 Batch ({printableItems.length} Cards)
              </Button>
            </HStack>
          </Flex>
        </Box>

        {/* ========================================================
            CONTROLS & CONFIGURATION PANEL
           ======================================================== */}
        <Box
          className="no-print"
          bg="white"
          borderRadius="2xl"
          p={{ base: 4, md: 6 }}
          mb={6}
          border="1px solid #E2E8F0"
          boxShadow="0 2px 10px rgba(0,0,0,0.03)"
        >
          {/* Row 1: Type, Orientation & Side Switchers */}
          <Flex
            direction={{ base: "column", lg: "row" }}
            justify="space-between"
            align={{ base: "stretch", lg: "center" }}
            gap={4}
            mb={5}
            pb={5}
            borderBottom="1px solid #F1F5F9"
          >
            {/* Card Type (Student vs Staff) */}
            <HStack bg="#F1F5F9" p={1} borderRadius="xl">
              <Button
                size="sm"
                borderRadius="lg"
                px={4}
                fontWeight="bold"
                fontSize="12px"
                bg={cardType === "student" ? "#2563EB" : "transparent"}
                color={cardType === "student" ? "white" : "#64748B"}
                onClick={() => {
                  setCardType("student");
                  setSelectedIds(new Set());
                  setInspectIndex(0);
                }}
              >
                <Icon as={FaGraduationCap} mr={1.5} />
                Student Cards ({students.length})
              </Button>
              <Button
                size="sm"
                borderRadius="lg"
                px={4}
                fontWeight="bold"
                fontSize="12px"
                bg={cardType === "staff" ? "#2563EB" : "transparent"}
                color={cardType === "staff" ? "white" : "#64748B"}
                onClick={() => {
                  setCardType("staff");
                  setSelectedIds(new Set());
                  setInspectIndex(0);
                }}
              >
                <Icon as={FaUsers} mr={1.5} />
                Staff Faculty ({staffList.length})
              </Button>
            </HStack>

            {/* Orientation & Sides */}
            <HStack spacing={3} flexWrap="wrap">
              {/* Orientation */}
              <HStack bg="#F8FAFC" p={1} borderRadius="lg" border="1px solid #E2E8F0">
                <Button
                  size="xs"
                  borderRadius="md"
                  px={3}
                  bg={orientation === "portrait" ? "#0F172A" : "transparent"}
                  color={orientation === "portrait" ? "white" : "#64748B"}
                  onClick={() => setOrientation("portrait")}
                >
                  Portrait (Vertical)
                </Button>
                <Button
                  size="xs"
                  borderRadius="md"
                  px={3}
                  bg={orientation === "landscape" ? "#0F172A" : "transparent"}
                  color={orientation === "landscape" ? "white" : "#64748B"}
                  onClick={() => setOrientation("landscape")}
                >
                  Landscape (Horizontal)
                </Button>
              </HStack>

              {/* Side View */}
              <HStack bg="#F8FAFC" p={1} borderRadius="lg" border="1px solid #E2E8F0">
                <Button
                  size="xs"
                  borderRadius="md"
                  px={2.5}
                  bg={sideMode === "both" ? "#0F172A" : "transparent"}
                  color={sideMode === "both" ? "white" : "#64748B"}
                  onClick={() => setSideMode("both")}
                >
                  Front & Back
                </Button>
                <Button
                  size="xs"
                  borderRadius="md"
                  px={2.5}
                  bg={sideMode === "front" ? "#0F172A" : "transparent"}
                  color={sideMode === "front" ? "white" : "#64748B"}
                  onClick={() => setSideMode("front")}
                >
                  Front Only
                </Button>
                <Button
                  size="xs"
                  borderRadius="md"
                  px={2.5}
                  bg={sideMode === "back" ? "#0F172A" : "transparent"}
                  color={sideMode === "back" ? "white" : "#64748B"}
                  onClick={() => setSideMode("back")}
                >
                  Back Only
                </Button>
              </HStack>
            </HStack>
          </Flex>

          {/* Row 2: Security & Aesthetic Feature Toggles */}
          <Box mb={5} pb={5} borderBottom="1px solid #F1F5F9">
            <Flex align="center" gap={2} mb={2.5}>
              <Icon as={FaSlidersH} color="#2563EB" boxSize={3.5} />
              <Text fontSize="12px" fontWeight="800" color="#0F172A" textTransform="uppercase" letterSpacing="0.5px">
                Aesthetics:
              </Text>
            </Flex>
            <Flex wrap="wrap" gap={2.5}>
              <Button
                size="xs"
                borderRadius="full"
                variant={showWatermark ? "solid" : "outline"}
                bg={showWatermark ? "#2563EB" : "transparent"}
                color={showWatermark ? "white" : "#64748B"}
                borderColor="#CBD5E1"
                onClick={() => setShowWatermark(!showWatermark)}
              >
                <Icon as={FaShieldAlt} mr={1} boxSize={3} />
                Faint Logo Crest Watermark 
              </Button>

              <Button
                size="xs"
                borderRadius="full"
                variant={showGuilloche ? "solid" : "outline"}
                bg={showGuilloche ? "#0F172A" : "transparent"}
                color={showGuilloche ? "white" : "#64748B"}
                borderColor="#384657"
                onClick={() => setShowGuilloche(!showGuilloche)}
              >
                Guilloche Waves 
              </Button>

              <Button
                size="xs"
                borderRadius="full"
                variant={showSmartChip ? "solid" : "outline"}
                bg={showSmartChip ? "#D97706" : "transparent"}
                color={showSmartChip ? "white" : "#64748B"}
                borderColor="#CBD5E1"
                onClick={() => setShowSmartChip(!showSmartChip)}
              >
                <Icon as={FaWifi} mr={1} boxSize={3} />
                Gold Smart Chip 
              </Button>

              <Button
                size="xs"
                borderRadius="full"
                variant={showHologram ? "solid" : "outline"}
                bg={showHologram ? "#7C3AED" : "transparent"}
                color={showHologram ? "white" : "#64748B"}
                borderColor="#CBD5E1"
                onClick={() => setShowHologram(!showHologram)}
              >
                Hologram Foil Seal
              </Button>

              <Button
                size="xs"
                borderRadius="full"
                variant={showLanyardSlot ? "solid" : "outline"}
                bg={showLanyardSlot ? "#0D9488" : "transparent"}
                color={showLanyardSlot ? "white" : "#64748B"}
                borderColor="#CBD5E1"
                onClick={() => setShowLanyardSlot(!showLanyardSlot)}
              >
                Lanyard Hole Slot 
              </Button>
            </Flex>
          </Box>

          {/* Row 3: Filters, Search & Theme Selector */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} alignItems="center">
            {/* Search Input - Clean White Unified Style */}
            <Box>
              <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1} textTransform="uppercase">
                Search Name, Role, or ID:
              </Text>
              <Flex
                align="center"
                bg="#FFFFFF"
                border="1px solid #CBD5E1"
                borderRadius="xl"
                px={3}
                h="40px"
                boxShadow="0 1px 2px rgba(0,0,0,0.03)"
                _focusWithin={{ borderColor: "#2563EB", boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.15)" }}
              >
                <Icon as={FaSearch} color="#94A3B8" mr={2} boxSize={3.5} />
                <Input
                  variant="unstyled"
                  placeholder={cardType === "student" ? "Filter name, ID, or prefect role..." : "Filter staff name, ID..."}
                  fontSize="13px"
                  bg="transparent"
                  border="none"
                  outline="none"
                  _focus={{ outline: "none", boxShadow: "none" }}
                  color="#0F172A"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Flex>
            </Box>

            {/* Class Arm Selector (Only for Students) */}
            {cardType === "student" ? (
              <Box>
                <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1} textTransform="uppercase">
                  Class Arm / Prefects Filter:
                </Text>
                <select
                  style={{
                    width: "100%",
                    height: "40px",
                    borderRadius: "12px",
                    border: "1px solid #CBD5E1",
                    background: "#FFFFFF",
                    padding: "0 12px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#0F172A",
                    outline: "none",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                  }}
                  value={selectedClassArm}
                  onChange={(e) => setSelectedClassArm(e.target.value)}
                >
                  <option value="all">All Class Arms ({students.length} Total)</option>
                  <option value="prefects">Appointed Prefects Only ({students.filter((s) => s.isPrefect).length})</option>
                  {classArms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Box>
            ) : (
              <Box>
                <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1} textTransform="uppercase">
                  Staff Role:
                </Text>
                <Badge bg="#EFF6FF" color="#1E40AF" p={2} borderRadius="lg" fontSize="12px" fontWeight="bold">
                  All Institutional Staff & Educators
                </Badge>
              </Box>
            )}

            {/* Color Palette Theme */}
            <Box>
              <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1} textTransform="uppercase">
                Institutional Theme Color:
              </Text>
              <HStack spacing={2}>
                {COLOR_THEMES.map((th) => (
                  <Box
                    key={th.id}
                    w="28px"
                    h="28px"
                    borderRadius="full"
                    bg={th.primary}
                    border={theme.id === th.id ? "3px solid #38BDF8" : "2px solid #CBD5E1"}
                    cursor="pointer"
                    title={th.name}
                    onClick={() => setTheme(th)}
                    transform={theme.id === th.id ? "scale(1.15)" : "scale(1)"}
                    transition="all 0.15s ease"
                  />
                ))}
              </HStack>
            </Box>

            {/* Select All Toggle */}
            <Box textAlign={{ base: "left", lg: "right" }} pt={{ lg: 4 }}>
              <Button
                size="sm"
                variant="outline"
                borderColor="#CBD5E1"
                borderRadius="xl"
                fontSize="12px"
                fontWeight="700"
                color="#0F172A"
                onClick={handleSelectAll}
              >
                <Icon
                  as={selectedIds.size === currentItems.length && currentItems.length > 0 ? FaCheckSquare : FaSquare}
                  mr={1.5}
                  color={selectedIds.size > 0 ? "#2563EB" : "#94A3B8"}
                />
                {selectedIds.size === currentItems.length && currentItems.length > 0
                  ? "Deselect All"
                  : `Select All (${currentItems.length})`}
              </Button>
            </Box>
          </SimpleGrid>
        </Box>

        {/* ========================================================
            INTERACTIVE LIVE FLIP-CARD INSPECTOR (SCREEN PREVIEW)
           ======================================================== */}
        {activeInspectItem && (
          <Box
            className="no-print"
            bg="white"
            borderRadius="2xl"
            p={{ base: 4, md: 6 }}
            mb={8}
            border="1px solid #E2E8F0"
          >
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align="center"
              gap={6}
            >
              <Box maxW="480px">
                <HStack spacing={2} mb={2}>
                  <Badge bg="#EEF2FF" color="#4338CA" borderRadius="md" px={2} py={0.5} fontSize="11px" fontWeight="bold">
                    PREVIEW & QUALITY INSPECTOR
                  </Badge>
                  <Text fontSize="12px" color="#64748B">
                    Card {inspectIndex + 1} of {currentItems.length}
                  </Text>
                </HStack>
                <Text fontSize="22px" fontWeight="900" color="#0F172A" mb={1}>
                  {formatStudentName(
                    cardType === "student"
                      ? `${activeInspectItem.firstName || ""} ${activeInspectItem.lastName || ""}`
                      : activeInspectItem.name || ""
                  )}
                </Text>
                <Text fontSize="13px" color="#64748B" mb={4}>
                  ID Code: <strong>{cardType === "student" ? activeInspectItem.studentId : activeInspectItem.staffIdNumber || "N/A"}</strong> • Orientation: <strong>{orientation}</strong>
                </Text>

                <HStack spacing={3}>
                  <Button
                    size="sm"
                    bg="#0F172A"
                    color="white"
                    borderRadius="xl"
                    _hover={{ bg: "#1E293B" }}
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <Icon as={FaUndo} mr={2} boxSize={3.5} />
                    {isFlipped ? "Flip to Front" : "Flip to Back"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="#CBD5E1"
                    borderRadius="xl"
                    fontSize="12px"
                    onClick={() => {
                      setSelectedIds(new Set([activeInspectItem.id]));
                      setTimeout(() => window.print(), 100);
                    }}
                  >
                    <Icon as={FaPrint} mr={1.5} boxSize={3} />
                    Print This Single Card
                  </Button>
                </HStack>
              </Box>

              {/* 3D / Flip Card Preview Container */}
              <Box
                perspective="1000px"
                cursor="pointer"
                onClick={() => setIsFlipped(!isFlipped)}
                title="Click anywhere to flip front/back"
              >
                <IdCardElement
                  item={activeInspectItem}
                  school={school}
                  cardType={cardType}
                  orientation={orientation}
                  theme={theme}
                  showBack={isFlipped}
                  qrDataUrl={qrCache[cardType === "student" ? activeInspectItem.studentId : activeInspectItem.staffIdNumber || activeInspectItem.id]}
                  showWatermark={showWatermark}
                  showGuilloche={showGuilloche}
                  showSmartChip={showSmartChip}
                  showHologram={showHologram}
                  showLanyardSlot={showLanyardSlot}
                />
              </Box>
            </Flex>
          </Box>
        )}

        {/* ========================================================
            CARDS ROSTER GRID (SCREEN VIEW WITH QUICK SELECTION)
           ======================================================== */}
        <Box className="no-print" mb={8}>
          <Flex justify="space-between" align="center" mb={4}>
            <HStack spacing={2}>
              <Text fontSize="16px" fontWeight="800" color="#0F172A">
                Card Generation Queue ({currentItems.length} Records)
              </Text>
              {selectedIds.size > 0 && (
                <Badge bg="#2563EB" color="white" borderRadius="full" px={2.5} py={0.5} fontSize="11px">
                  {selectedIds.size} Selected for Batch Print
                </Badge>
              )}
            </HStack>
            <Text fontSize="12px" color="#64748B">
              Tip: Click any card thumbnail to inspect in live 3D preview
            </Text>
          </Flex>

          {currentItems.length === 0 ? (
            <Box bg="white" p={10} borderRadius="2xl" textAlign="center" border="1px dashed #CBD5E1">
              <Icon as={FaIdCard} boxSize={10} color="#94A3B8" mb={3} />
              <Text fontSize="16px" fontWeight="bold" color="#1E293B">
                No matching records found
              </Text>
              <Text fontSize="13px" color="#64748B" mt={1}>
                Try adjusting your search query or class filter to view student or staff records.
              </Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, xl: 4 }} gap={4}>
              {currentItems.map((item, idx) => {
                const isSelected = selectedIds.has(item.id);
                const code = cardType === "student" ? item.studentId : item.staffIdNumber || item.id;

                return (
                  <Box
                    key={item.id}
                    bg="white"
                    borderRadius="xl"
                    p={3.5}
                    border={isSelected ? "2px solid #2563EB" : "1px solid #E2E8F0"}
                    boxShadow={isSelected ? "0 4px 14px rgba(37, 99, 235, 0.15)" : "0 2px 6px rgba(0,0,0,0.03)"}
                    position="relative"
                    transition="all 0.15s ease"
                    _hover={{ borderColor: "#2563EB" }}
                  >
                    {/* Checkbox select */}
                    <Box
                      position="absolute"
                      top="10px"
                      right="10px"
                      zIndex={2}
                      cursor="pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelect(item.id);
                      }}
                    >
                      <Icon
                        as={isSelected ? FaCheckSquare : FaSquare}
                        color={isSelected ? "#2563EB" : "#CBD5E1"}
                        boxSize={5}
                      />
                    </Box>

                    {/* Miniature Card Preview Wrapper */}
                    <Box
                      cursor="pointer"
                      onClick={() => {
                        setInspectIndex(idx);
                        setIsFlipped(false);
                      }}
                    >
                      <Flex align="center" gap={3} mb={2}>
                        {/* Avatar */}
                        {item.faceImageUrl ? (
                          <Box
                            w="44px"
                            h="44px"
                            borderRadius="lg"
                            overflow="hidden"
                            border="1px solid #E2E8F0"
                            flexShrink={0}
                          >
                            <img
                              src={item.faceImageUrl}
                              alt="Passport"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </Box>
                        ) : (
                          <Flex
                            w="44px"
                            h="44px"
                            borderRadius="lg"
                            bg={theme.lightBg}
                            color={theme.primary}
                            align="center"
                            justify="center"
                            fontWeight="900"
                            fontSize="14px"
                            flexShrink={0}
                          >
                            {cardType === "student"
                              ? `${item.firstName?.[0] || ""}${item.lastName?.[0] || ""}`
                              : item.name?.[0] || "S"}
                          </Flex>
                        )}

                        <Box overflow="hidden">
                          <Text fontSize="13px" fontWeight="800" color="#0F172A" isTruncated>
                            {formatStudentName(
                              cardType === "student"
                                ? `${item.firstName || ""} ${item.lastName || ""}`
                                : item.name || ""
                            )}
                          </Text>
                          <Text fontSize="11px" color="#64748B" fontWeight="600">
                            {code}
                          </Text>
                          <Text fontSize="11px" color="#2563EB" fontWeight="bold">
                            {cardType === "student"
                              ? item.ClassArm?.name || "No Class"
                              : item.designation || "Faculty Staff"}
                          </Text>
                          {item.isPrefect && (
                            <Badge
                              mt={1}
                              display="inline-block"
                              fontSize="9.5px"
                              bg="#FEF08A"
                              color="#854D0E"
                              border="1px solid #CA8A04"
                              fontWeight="bold"
                              px={1.5}
                              py={0.2}
                              borderRadius="md"
                            >
                              ★ {item.prefectRole || "School Prefect"}
                            </Badge>
                          )}
                        </Box>
                      </Flex>

                      {/* Bottom Quick Row */}
                      <Flex justify="space-between" align="center" pt={2} borderTop="1px solid #F1F5F9">
                        <Badge fontSize="10px" bg="#F1F5F9" color="#475569">
                          {cardType === "student" ? "STUDENT" : "STAFF"}
                        </Badge>
                        <Text fontSize="11px" color="#3B82F6" fontWeight="bold">
                          Inspect &rarr;
                        </Text>
                      </Flex>
                    </Box>
                  </Box>
                );
              })}
            </SimpleGrid>
          )}
        </Box>

        {/* ========================================================
            PRINT CONTAINER: High-Resolution A4 Sheet Grid
            Only visible when triggering window.print()
           ======================================================== */}
        <Box className="print-only-container" ref={printAreaRef}>
          <Box className="a4-print-sheet">
            {printableItems.map((item) => {
              const code = cardType === "student" ? item.studentId : item.staffIdNumber || item.id;
              const qrUrl = qrCache[code];

              return (
                <Box key={item.id} className="print-card-unit" mb="6mm">
                  {/* If sideMode is both, render Front AND Back */}
                  {(sideMode === "both" || sideMode === "front") && (
                    <Box mb={sideMode === "both" ? "4mm" : "0"}>
                      <IdCardElement
                        item={item}
                        school={school}
                        cardType={cardType}
                        orientation={orientation}
                        theme={theme}
                        showBack={false}
                        qrDataUrl={qrUrl}
                        showWatermark={showWatermark}
                        showGuilloche={showGuilloche}
                        showSmartChip={showSmartChip}
                        showHologram={showHologram}
                        showLanyardSlot={showLanyardSlot}
                        isPrint
                      />
                    </Box>
                  )}

                  {(sideMode === "both" || sideMode === "back") && (
                    <Box>
                      <IdCardElement
                        item={item}
                        school={school}
                        cardType={cardType}
                        orientation={orientation}
                        theme={theme}
                        showBack={true}
                        qrDataUrl={qrUrl}
                        showWatermark={showWatermark}
                        showGuilloche={showGuilloche}
                        showSmartChip={showSmartChip}
                        showHologram={showHologram}
                        showLanyardSlot={showLanyardSlot}
                        isPrint
                      />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}

// ========================================================
// CORE ID CARD ELEMENT: Standard CR80 Card Component
// Dimensions: 85.6mm × 53.98mm (standard ATM/driver's card)
// ========================================================
function IdCardElement({
  item,
  school,
  cardType,
  orientation = "portrait",
  theme,
  showBack = false,
  qrDataUrl,
  showWatermark = true,
  showGuilloche = true,
  showSmartChip = true,
  showHologram = true,
  showLanyardSlot = true,
  isPrint = false,
}) {
  const isPortrait = orientation === "portrait";

  // Standard CR80 Dimensions
  const cardWidth = isPrint
    ? isPortrait
      ? "54mm"
      : "85.6mm"
    : isPortrait
    ? "264px"
    : "386px";

  const cardHeight = isPrint
    ? isPortrait
      ? "85.6mm"
      : "54mm"
    : isPortrait
    ? "412px"
    : "248px";

  const schoolName = school.name || "Institutional Academy";
  const schoolLogo = school.logoUrl;
  const schoolMotto = school.motto || "Excellence & Integrity";
  const schoolAddress = school.address || "12 Campus Drive, Academic City";
  const schoolPhone = school.phone || "+234 800 000 0000";
  const principalTitle = school.principalTitle || "Principal";
  const principalSignature = school.principalSignatureUrl;
  const principalStamp = school.principalStampUrl;
  const academicSession = school.academicSession || "2025/2026";

  const rawFullName =
    cardType === "student"
      ? `${item.firstName || ""} ${item.lastName || ""}`
      : item.name || "Staff Member";
  const fullName = formatStudentName(rawFullName) || (cardType === "student" ? "Student" : "Staff Member");

  const code = cardType === "student" ? item.studentId : item.staffIdNumber || item.id;
  const isPrefect = cardType === "student" && Boolean(item.isPrefect);
  const prefectRoleTitle = item.prefectRole ? item.prefectRole.toUpperCase() : "SCHOOL PREFECT";

  const roleLabel =
    cardType === "student"
      ? isPrefect
        ? prefectRoleTitle
        : "STUDENT"
      : item.designation?.toUpperCase() || "FACULTY STAFF";

  const subInfo =
    cardType === "student"
      ? item.ClassArm?.name || "CBT Student"
      : item.email || school.email;

  const emergencyPhone =
    cardType === "student"
      ? item.parentPhone || schoolPhone
      : item.phoneNumber || schoolPhone;

  const expiryYear = "2026";

  // Background style: Guilloche security curves pattern
  const cardBgStyle = showGuilloche
    ? {
        backgroundColor: "#FFFFFF",
        backgroundImage: `
          repeating-linear-gradient(45deg, rgba(15, 23, 42, 0.025) 0px, rgba(15, 23, 42, 0.025) 1.5px, transparent 1.5px, transparent 9px),
          repeating-linear-gradient(-45deg, rgba(15, 23, 42, 0.02) 0px, rgba(15, 23, 42, 0.02) 1.5px, transparent 1.5px, transparent 9px)
        `,
      }
    : {
        backgroundColor: "#FFFFFF",
      };

  // ----------------------------------------------------
  // CARD BACK (REVERSE SIDE)
  // ----------------------------------------------------
  if (showBack) {
    return (
      <Box
        w={cardWidth}
        h={cardHeight}
        borderRadius={isPrint ? "3.2mm" : "18px"}
        border={`1.5px solid ${theme.primary}`}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        position="relative"
        overflow="hidden"
        boxShadow={isPrint ? "none" : "0 10px 25px rgba(0,0,0,0.14)"}
        fontFamily="'Outfit', sans-serif"
        style={cardBgStyle}
      >
        {/* Faint School Crest Watermark in Background */}
        {showWatermark && (
          <Box
            position="absolute"
            top="52%"
            left="50%"
            transform="translate(-50%, -50%)"
            w="65%"
            h="65%"
            opacity={0.065}
            pointerEvents="none"
            zIndex={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {schoolLogo ? (
              <img
                src={schoolLogo}
                alt="Watermark Crest"
                style={{ width: "100%", height: "100%", objectFit: "contain", filter: "grayscale(100%)" }}
              />
            ) : (
              <Icon as={FaShieldAlt} boxSize="100%" color="#0F172A" />
            )}
          </Box>
        )}

        {/* Top Magnetic Stripe */}
        <Box
          h={isPrint ? "8.5mm" : "32px"}
          w="100%"
          bg="linear-gradient(180deg, #090D16 0%, #1E293B 50%, #0F172A 100%)"
          borderBottom="1px solid #000"
          position="relative"
          zIndex={2}
        />

        {/* Lanyard Hole Indicator */}
        {showLanyardSlot && (
          <Box
            position="absolute"
            top={isPrint ? "1.5mm" : "6px"}
            left="50%"
            transform="translateX(-50%)"
            w={isPrint ? "10mm" : "36px"}
            h={isPrint ? "1.8mm" : "5px"}
            borderRadius="full"
            bg="rgba(255, 255, 255, 0.4)"
            border="1px solid rgba(0,0,0,0.4)"
            zIndex={3}
          />
        )}

        {/* Content Body */}
        <Box p={isPrint ? "2.5mm 3.5mm" : "8px 12px"} flex="1" display="flex" flexDirection="column" justifyContent="space-between" position="relative" zIndex={2}>
          {/* Header Info */}
          <Box textAlign="center">
            <Text
              fontSize={isPrint ? "7.5pt" : "10px"}
              fontWeight="900"
              color={theme.primary}
              letterSpacing="0.4px"
              textTransform="uppercase"
              isTruncated
            >
              {schoolName}
            </Text>
            <HStack justify="center" spacing={1} mt={0.5}>
              <Icon as={FaMapMarkerAlt} boxSize={isPrint ? "5.5pt" : "7.5px"} color="#64748B" />
              <Text fontSize={isPrint ? "5pt" : "7.5px"} color="#64748B" isTruncated>
                {schoolAddress}
              </Text>
            </HStack>
          </Box>

          {/* Official Property & Return Disclaimer */}
          <Box
            bg="rgba(248, 250, 252, 0.85)"
            p={isPrint ? "1.5mm" : "6px"}
            borderRadius={isPrint ? "1.5mm" : "6px"}
            border="1px solid #E2E8F0"
          >
            <Text
              fontSize={isPrint ? "4.5pt" : "6.8px"}
              color="#334155"
              lineHeight="1.25"
              textAlign="center"
            >
              This credential is the property of <strong>{schoolName}</strong> and must be produced upon authorized request. If found, please return to the school administration office or contact: <strong>{schoolPhone}</strong>.
            </Text>
          </Box>

          {/* Realistic Authorized Signature Strip */}
          <Box>
            <Flex justify="space-between" align="center" mb={0.5} px={0.5}>
              <Text fontSize={isPrint ? "4.5pt" : "6.5px"} color="#64748B" fontWeight="800" letterSpacing="0.3px">
                AUTHORIZED SIGNATURE
              </Text>
              <Text fontSize={isPrint ? "4pt" : "6px"} color="#94A3B8" fontStyle="italic">
                NOT VALID UNLESS SIGNED
              </Text>
            </Flex>
            <Box
              h={isPrint ? "6mm" : "24px"}
              bg="#FFFFFF"
              borderRadius="4px"
              border="1px dashed #94A3B8"
              position="relative"
              display="flex"
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
            >
              <Box
                position="absolute"
                inset={0}
                opacity={0.06}
                backgroundImage="repeating-linear-gradient(45deg, #000 0px, #000 1px, transparent 1px, transparent 6px)"
              />
              {principalSignature ? (
                <img
                  src={principalSignature}
                  alt="Principal Signature"
                  style={{ maxHeight: "100%", objectFit: "contain", position: "relative", zIndex: 2 }}
                />
              ) : (
                <Text fontSize={isPrint ? "5.5pt" : "8px"} color="#94A3B8" fontStyle="italic">
                  {principalTitle} Endorsement
                </Text>
              )}
            </Box>
          </Box>

          {/* Stamps & Code128 Barcode Row */}
          <Flex justify="space-between" align="center" pt={1} borderTop="1px solid #E2E8F0">
            {/* Principal Stamp */}
            <Box textAlign="center" flexShrink={0}>
              {principalStamp ? (
                <img
                  src={principalStamp}
                  alt="Stamp"
                  style={{
                    height: isPrint ? "7mm" : "24px",
                    objectFit: "contain",
                    margin: "0 auto",
                  }}
                />
              ) : (
                <Box
                  w={isPrint ? "6.5mm" : "22px"}
                  h={isPrint ? "6.5mm" : "22px"}
                  borderRadius="full"
                  border="1px dashed #94A3B8"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mx="auto"
                >
                  <Icon as={FaShieldAlt} color="#94A3B8" boxSize={isPrint ? "3.5pt" : "10px"} />
                </Box>
              )}
              <Text fontSize={isPrint ? "4.5pt" : "6px"} color="#64748B" fontWeight="bold">
                SEAL
              </Text>
            </Box>

            {/* Barcode Strip */}
            <Box flex="1" textAlign="center" px={2}>
              <BarcodeSimulation code={code} isPrint={isPrint} />
              <Text fontSize={isPrint ? "5pt" : "7.5px"} fontWeight="900" color="#0F172A" letterSpacing="1px">
                {code}
              </Text>
            </Box>
          </Flex>
        </Box>
      </Box>
    );
  }

  // ----------------------------------------------------
  // CARD FRONT (PREMIUM SMART CARD DESIGN)
  // ----------------------------------------------------
  return (
    <Box
      w={cardWidth}
      h={cardHeight}
      borderRadius={isPrint ? "3.2mm" : "18px"}
      border={`1.5px solid ${theme.primary}`}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      position="relative"
      overflow="hidden"
      boxShadow={isPrint ? "none" : "0 10px 25px rgba(0,0,0,0.14)"}
      fontFamily="'Outfit', sans-serif"
      style={cardBgStyle}
    >
      {/* 1. FAINT SCHOOL CREST WATERMARK IN BACKGROUND */}
      {showWatermark && (
        <Box
          position="absolute"
          top="54%"
          left="50%"
          transform="translate(-50%, -50%)"
          w="68%"
          h="68%"
          opacity={0.075}
          pointerEvents="none"
          zIndex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {schoolLogo ? (
            <img
              src={schoolLogo}
              alt="Watermark Crest"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter: "grayscale(100%)",
              }}
            />
          ) : (
            <Icon as={FaShieldAlt} boxSize="100%" color={theme.primary} />
          )}
        </Box>
      )}

      {/* 2. LANYARD PUNCH HOLE INDICATOR (TOP CENTER) */}
      {showLanyardSlot && (
        <Box
          position="absolute"
          top={isPrint ? "1.5mm" : "5px"}
          left="50%"
          transform="translateX(-50%)"
          w={isPrint ? "10mm" : "36px"}
          h={isPrint ? "1.6mm" : "5px"}
          borderRadius="full"
          bg="rgba(255, 255, 255, 0.3)"
          border="1px solid rgba(0, 0, 0, 0.3)"
          zIndex={5}
        />
      )}

      {/* 3. INSTITUTIONAL HEADER BANNER WITH GOLD/ACCENT ACCENT LINE */}
      <Box position="relative" zIndex={2}>
        <Box bg={theme.primary} color="white" p={isPrint ? "2.5mm 3.5mm" : "9px 12px"}>
          <Flex align="center" justify="space-between" gap={2}>
            {schoolLogo ? (
              <Box
                w={isPrint ? "7.5mm" : "28px"}
                h={isPrint ? "7.5mm" : "28px"}
                borderRadius="md"
                bg="white"
                p={0.5}
                flexShrink={0}
                boxShadow="0 2px 4px rgba(0,0,0,0.2)"
              >
                <img
                  src={schoolLogo}
                  alt="Logo"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </Box>
            ) : (
              <Flex
                w={isPrint ? "7.5mm" : "28px"}
                h={isPrint ? "7.5mm" : "28px"}
                borderRadius="md"
                bg="rgba(255,255,255,0.15)"
                align="center"
                justify="center"
                color={theme.accent}
                flexShrink={0}
              >
                <Icon as={FaGraduationCap} boxSize={isPrint ? "5.5pt" : "14px"} />
              </Flex>
            )}

            <Box textAlign="right" overflow="hidden">
              <Text
                fontSize={isPrint ? "7.5pt" : "11px"}
                fontWeight="900"
                color="white"
                letterSpacing="0.3px"
                lineHeight="1.15"
                isTruncated
              >
                {schoolName}
              </Text>
              <Text
                fontSize={isPrint ? "4.5pt" : "6.5px"}
                color={theme.accent}
                fontWeight="600"
                fontStyle="italic"
                isTruncated
              >
                "{schoolMotto}"
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Role Ribbon Strip with Gold Pinstripe */}
        <Flex
          bg={isPrefect ? "linear-gradient(90deg, #D97706 0%, #F59E0B 50%, #D97706 100%)" : theme.accent}
          py={isPrint ? "0.8mm" : "2.5px"}
          px={3}
          justify="space-between"
          align="center"
          borderBottom={`1.5px solid ${theme.primary}`}
        >
          <Text
            fontSize={isPrint ? "5.5pt" : "8px"}
            fontWeight="900"
            color={isPrefect ? "white" : "#0F172A"}
            letterSpacing="1px"
          >
            {isPrefect ? `★ ${prefectRoleTitle}` : `${roleLabel} IDENTITY CARD`}
          </Text>
          <Text
            fontSize={isPrint ? "4.5pt" : "7px"}
            fontWeight="800"
            color={isPrefect ? "#FEF08A" : "#0F172A"}
          >
            {academicSession}
          </Text>
        </Flex>
      </Box>

      {/* 4. MAIN CARD BODY */}
      <Box
        p={isPrint ? "2mm 3.5mm" : "8px 12px"}
        flex="1"
        display="flex"
        flexDirection="column"
        justifyContent="space-around"
        position="relative"
        zIndex={2}
      >
        {isPortrait ? (
          /* ========================================================
             PORTRAIT VIEW
             ======================================================== */
          <VStack spacing={isPrint ? "1.5mm" : 2} align="center" textAlign="center">
            {/* Passport Photo with Dual-Layer Security Frame */}
            <Box position="relative" mt={isPrint ? "1mm" : 1}>
              <Box
                w={isPrint ? "17mm" : "72px"}
                h={isPrint ? "20mm" : "84px"}
                borderRadius={isPrint ? "2mm" : "10px"}
                overflow="hidden"
                border={`2px solid ${theme.primary}`}
                outline={`1.5px solid ${theme.accent}`}
                boxShadow="0 4px 10px rgba(0,0,0,0.18)"
                bg="#F1F5F9"
              >
                {item.faceImageUrl ? (
                  <img
                    src={item.faceImageUrl}
                    alt={fullName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Flex
                    w="100%"
                    h="100%"
                    bg={theme.lightBg}
                    color={theme.primary}
                    align="center"
                    justify="center"
                    fontWeight="900"
                    fontSize="22px"
                  >
                    {item.firstName?.[0] || item.name?.[0] || "U"}
                  </Flex>
                )}
              </Box>

              {/* Verified Mini Badge on Photo */}
              <Box
                position="absolute"
                bottom="-4px"
                right="-4px"
                bg="#10B981"
                color="white"
                borderRadius="full"
                p={0.5}
                boxShadow="0 1px 3px rgba(0,0,0,0.3)"
              >
                <Icon as={FaCheckCircle} boxSize={isPrint ? "3.5pt" : "10px"} />
              </Box>

              {/* Prefect Star Pin on Photo */}
              {isPrefect && (
                <Box
                  position="absolute"
                  top="-4px"
                  left="-4px"
                  bg="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
                  color="#FFFFFF"
                  borderRadius="full"
                  w={isPrint ? "4mm" : "18px"}
                  h={isPrint ? "4mm" : "18px"}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize={isPrint ? "4pt" : "9px"}
                  fontWeight="900"
                  boxShadow="0 2px 4px rgba(0,0,0,0.3)"
                  border="1.5px solid #FFFFFF"
                  zIndex={4}
                  title={`Prefect: ${prefectRoleTitle}`}
                >
                  ★
                </Box>
              )}
            </Box>

            {/* Name, Identification & Class Arm */}
            <Box maxW={isPrint ? "48mm" : "230px"}>
              <Text
                fontSize={isPrint ? "8.5pt" : "13.5px"}
                fontWeight="900"
                color="#0F172A"
                lineHeight="1.2"
                textTransform="capitalize"
                isTruncated
              >
                {fullName}
              </Text>

              {/* Prominent Prefect Role Badge under Name */}
              {isPrefect && (
                <Box my={0.5}>
                  <Badge
                    bg="linear-gradient(135deg, #FEF08A 0%, #FDE047 100%)"
                    color="#854D0E"
                    border="1px solid #CA8A04"
                    fontSize={isPrint ? "5.5pt" : "8px"}
                    fontWeight="900"
                    px={1.5}
                    py={0.2}
                    borderRadius="md"
                    letterSpacing="0.4px"
                    boxShadow="0 1px 3px rgba(0,0,0,0.08)"
                  >
                    ★ {prefectRoleTitle}
                  </Badge>
                </Box>
              )}

              <HStack justify="center" spacing={1.5} mt={0.5}>
                <Badge
                  bg="#0F172A"
                  color="#F8FAFC"
                  fontSize={isPrint ? "5pt" : "8px"}
                  fontWeight="900"
                  px={1.5}
                  py={0.2}
                  borderRadius="sm"
                  letterSpacing="0.8px"
                >
                  ID: {code}
                </Badge>
              </HStack>
              <Text
                fontSize={isPrint ? "6.5pt" : "9.5px"}
                color={theme.primary}
                fontWeight="800"
                mt={0.5}
                isTruncated
              >
                {subInfo}
              </Text>
            </Box>
          </VStack>
        ) : (
          /* ========================================================
             LANDSCAPE VIEW
             ======================================================== */
          <Flex align="center" justify="space-between" gap={3}>
            {/* Photo & Verified Badge */}
            <Box position="relative" flexShrink={0}>
              <Box
                w={isPrint ? "19mm" : "78px"}
                h={isPrint ? "23mm" : "92px"}
                borderRadius="8px"
                overflow="hidden"
                border={`2px solid ${theme.primary}`}
                outline={`1.5px solid ${theme.accent}`}
                boxShadow="0 4px 10px rgba(0,0,0,0.15)"
              >
                {item.faceImageUrl ? (
                  <img
                    src={item.faceImageUrl}
                    alt={fullName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Flex
                    w="100%"
                    h="100%"
                    bg={theme.lightBg}
                    color={theme.primary}
                    align="center"
                    justify="center"
                    fontWeight="900"
                    fontSize="24px"
                  >
                    {item.firstName?.[0] || item.name?.[0] || "U"}
                  </Flex>
                )}
              </Box>
              <Box
                position="absolute"
                bottom="-3px"
                right="-3px"
                bg="#10B981"
                color="white"
                borderRadius="full"
                p={0.5}
              >
                <Icon as={FaCheckCircle} boxSize={isPrint ? "3.5pt" : "10px"} />
              </Box>

              {/* Prefect Star Pin on Photo (Landscape) */}
              {isPrefect && (
                <Box
                  position="absolute"
                  top="-4px"
                  left="-4px"
                  bg="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
                  color="#FFFFFF"
                  borderRadius="full"
                  w={isPrint ? "4mm" : "18px"}
                  h={isPrint ? "4mm" : "18px"}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize={isPrint ? "4pt" : "9px"}
                  fontWeight="900"
                  boxShadow="0 2px 4px rgba(0,0,0,0.3)"
                  border="1.5px solid #FFFFFF"
                  zIndex={4}
                  title={`Prefect: ${prefectRoleTitle}`}
                >
                  ★
                </Box>
              )}
            </Box>

            {/* Info Columns */}
            <Box flex="1" overflow="hidden">
              <Text
                fontSize={isPrint ? "9pt" : "13.5px"}
                fontWeight="900"
                color="#0F172A"
                textTransform="capitalize"
                isTruncated
              >
                {fullName}
              </Text>

              {/* Prominent Prefect Role Badge under Name (Landscape) */}
              {isPrefect && (
                <Box my={0.5}>
                  <Badge
                    bg="linear-gradient(135deg, #FEF08A 0%, #FDE047 100%)"
                    color="#854D0E"
                    border="1px solid #CA8A04"
                    fontSize={isPrint ? "5.5pt" : "8px"}
                    fontWeight="900"
                    px={1.5}
                    py={0.2}
                    borderRadius="md"
                    letterSpacing="0.4px"
                    boxShadow="0 1px 3px rgba(0,0,0,0.08)"
                  >
                    ★ {prefectRoleTitle}
                  </Badge>
                </Box>
              )}
              <HStack spacing={1.5} my={1}>
                <Badge bg="#0F172A" color="white" fontSize={isPrint ? "5pt" : "8px"} fontWeight="900" px={1.5}>
                  {code}
                </Badge>
              </HStack>
              <Text fontSize={isPrint ? "6.5pt" : "10px"} color={theme.primary} fontWeight="bold" isTruncated>
                {subInfo}
              </Text>
              <Text fontSize={isPrint ? "5.5pt" : "8px"} color="#64748B" mt={1}>
                Emergency: <strong>{emergencyPhone}</strong>
              </Text>
            </Box>

            {/* Right Column: Security Module (Gold Chip + Hologram) directly ABOVE QR Code */}
            <VStack spacing={isPrint ? "0.8mm" : 1.5} align="center" flexShrink={0}>
              {(showSmartChip || showHologram) && (
                <HStack spacing={1} justify="center">
                  {showSmartChip && <SmartChipEmv isPrint={isPrint} />}
                  {showHologram && <HologramSeal isPrint={isPrint} theme={theme} />}
                </HStack>
              )}

              {qrDataUrl && (
                <Box
                  w={isPrint ? "14mm" : "54px"}
                  h={isPrint ? "14mm" : "54px"}
                  p={0.5}
                  border="1px solid #E2E8F0"
                  borderRadius="md"
                  bg="white"
                  boxShadow="0 1px 3px rgba(0,0,0,0.08)"
                >
                  <img src={qrDataUrl} alt="QR Code" style={{ width: "100%", height: "100%" }} />
                </Box>
              )}
            </VStack>
          </Flex>
        )}

        {/* Portrait Bottom Row: QR & Security Module directly ABOVE QR Code */}
        {isPortrait && (
          <Flex justify="space-between" align="flex-end" mt={isPrint ? "1mm" : 1} px={1}>
            <Box textAlign="left">
              <Text fontSize={isPrint ? "4.5pt" : "7px"} color="#64748B" fontWeight="600">
                EMERGENCY CONTACT:
              </Text>
              <Text fontSize={isPrint ? "5.5pt" : "8.5px"} fontWeight="900" color="#0F172A">
                {emergencyPhone}
              </Text>
              <Text fontSize={isPrint ? "4.5pt" : "6.8px"} color="#94A3B8">
                VALID THRU: 07/{expiryYear}
              </Text>
            </Box>

            {/* Security Stack: Smart Chip & Hologram directly ABOVE QR Code */}
            <VStack spacing={isPrint ? "0.6mm" : 1} align="center">
              {(showSmartChip || showHologram) && (
                <HStack spacing={1} justify="center">
                  {showSmartChip && <SmartChipEmv isPrint={isPrint} />}
                  {showHologram && <HologramSeal isPrint={isPrint} theme={theme} />}
                </HStack>
              )}

              {qrDataUrl && (
                <Box
                  w={isPrint ? "12mm" : "46px"}
                  h={isPrint ? "12mm" : "46px"}
                  p={0.5}
                  border="1px solid #E2E8F0"
                  borderRadius="md"
                  bg="white"
                  boxShadow="0 1px 3px rgba(0,0,0,0.08)"
                >
                  <img src={qrDataUrl} alt="QR" style={{ width: "100%", height: "100%" }} />
                </Box>
              )}
            </VStack>
          </Flex>
        )}
      </Box>

      {/* 5. METALLIC BOTTOM SECURITY FOOTER STRIP */}
      <Box
        bg={theme.primary}
        color="white"
        py={isPrint ? "1mm" : "3.5px"}
        px={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        position="relative"
        zIndex={2}
      >
        <Text fontSize={isPrint ? "4.5pt" : "7px"} fontWeight="900" letterSpacing="0.6px">
          ACESMART • SECURE PVC PASS
        </Text>
        <HStack spacing={1}>
          <Box w={isPrint ? "1mm" : "4px"} h={isPrint ? "1mm" : "4px"} borderRadius="full" bg="#10B981" />
          <Text fontSize={isPrint ? "4pt" : "6.5px"} color="#94A3B8" fontWeight="bold">
            CHIP VERIFIED
          </Text>
        </HStack>
      </Box>
    </Box>
  );
}

// ========================================================
// REALISTIC METALLIC GOLD EMV SMART CHIP COMPONENT
// ========================================================
function SmartChipEmv({ isPrint = false }) {
  return (
    <Box
      w={isPrint ? "7mm" : "28px"}
      h={isPrint ? "5.5mm" : "21px"}
      borderRadius={isPrint ? "1mm" : "3.5px"}
      bg="linear-gradient(135deg, #E6CA65 0%, #FFF2B2 45%, #D4AF37 75%, #AA820A 100%)"
      border="1px solid #8A6D1C"
      position="relative"
      boxShadow="0 1px 2px rgba(0,0,0,0.2)"
      overflow="hidden"
      flexShrink={0}
    >
      {/* Micro-Circuit Lines */}
      <Box
        position="absolute"
        top="50%"
        left={0}
        right={0}
        h="0.5px"
        bg="#8A6D1C"
        opacity={0.7}
      />
      <Box
        position="absolute"
        left="50%"
        top={0}
        bottom={0}
        w="0.5px"
        bg="#8A6D1C"
        opacity={0.7}
      />
      <Box
        position="absolute"
        top="25%"
        left="20%"
        right="20%"
        bottom="25%"
        borderRadius="1.5px"
        border="0.5px solid #8A6D1C"
        opacity={0.7}
      />
    </Box>
  );
}

// ========================================================
// HOLOGRAPHIC SECURITY SEAL COMPONENT
// ========================================================
function HologramSeal({ isPrint = false, theme }) {
  return (
    <Box
      w={isPrint ? "6.5mm" : "24px"}
      h={isPrint ? "6.5mm" : "24px"}
      borderRadius="full"
      bg="conic-gradient(from 180deg at 50% 50%, #FFD700, #FF8C00, #FF0080, #00BFFF, #00FF7F, #FFD700)"
      p={isPrint ? "0.3mm" : "1.5px"}
      boxShadow="0 1px 4px rgba(0,0,0,0.2)"
      flexShrink={0}
    >
      <Flex
        w="100%"
        h="100%"
        borderRadius="full"
        bg="linear-gradient(135deg, #0F172A 0%, #1E293B 100%)"
        align="center"
        justify="center"
        color="#FDE047"
      >
        <Icon as={FaShieldAlt} boxSize={isPrint ? "3.2pt" : "10px"} />
      </Flex>
    </Box>
  );
}

// ========================================================
// VISUAL BARCODE SIMULATION COMPONENT (Code 128)
// ========================================================
function BarcodeSimulation({ code, isPrint = false }) {
  const bars = [2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1, 2];

  return (
    <Flex
      justify="center"
      align="center"
      h={isPrint ? "5mm" : "18px"}
      gap={isPrint ? "0.35mm" : "1.2px"}
      overflow="hidden"
      my={0.5}
    >
      {bars.map((w, i) => (
        <Box
          key={i}
          w={`${w * (isPrint ? 0.35 : 1.1)}px`}
          h="100%"
          bg="#0F172A"
        />
      ))}
    </Flex>
  );
}
