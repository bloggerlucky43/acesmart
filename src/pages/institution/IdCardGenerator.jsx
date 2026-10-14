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
  FaDownload,
  FaUsers,
  FaGraduationCap,
  FaQrcode,
  FaFilter,
  FaSearch,
  FaSyncAlt,
  FaCheckSquare,
  FaSquare,
  FaShieldAlt,
  FaUndo,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
} from "react-icons/fa";
import DashboardLayout from "../../constants/dashboardlayout";
import {
  getInstitutionProfileApi,
  getStaffListApi,
  getClassArmsApi,
} from "../../api-endpoint/sms/smsEndpoints";
import { fetchStudent } from "../../api-endpoint/student/students";
import { useAuth } from "../../libs/AuthProvider";
import { toaster } from "../../components/ui/toaster";

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

  // QR Code Cache: Map<id, qrDataUrl>
  const [qrCache, setQrCache] = useState({});

  // Active inspect card for preview
  const [inspectIndex, setInspectIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Load Institution Profile, Classes, Students, and Staff
  const loadData = async () => {
    setLoading(true);
    try {
      const [profRes, classRes, studRes, staffRes] = await Promise.all([
        getInstitutionProfileApi().catch(() => null),
        getClassArmsApi().catch(() => null),
        fetchStudent().catch(() => null),
        getStaffListApi().catch(() => null),
      ]);

      if (profRes?.success) setProfile(profRes.data);
      if (classRes?.success) setClassArms(classRes.data || []);
      if (studRes?.students) setStudents(studRes.students || []);
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
  const schoolMotto = school.motto || "Excellence & Integrity";
  const schoolAddress = school.address || "12 Campus Drive, Academic City";
  const schoolPhone = school.phone || "+234 800 000 0000";
  const schoolEmail = school.email || "info@school.edu.ng";
  const principalName = school.principalName || "The Principal";
  const principalTitle = school.principalTitle || "Principal / Director";
  const principalSignature = school.principalSignatureUrl;
  const principalStamp = school.principalStampUrl;
  const academicSession = school.academicSession || "2025/2026";

  // Filtered List based on Card Type & Filters
  const currentItems = useMemo(() => {
    if (cardType === "student") {
      return students.filter((s) => {
        const matchesClass =
          selectedClassArm === "all" ||
          String(s.classArmId) === String(selectedClassArm);
        const nameStr = `${s.firstName || ""} ${s.lastName || ""} ${s.studentId || ""}`.toLowerCase();
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
            /* Hide all navigation, sidebars, headers, and UI controls */
            nav, header, aside, .no-print, button, input, select {
              display: none !important;
            }
            .print-only-container {
              display: block !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            /* Precise A4 Grid Layout */
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
                    PVC CR80 READY
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
          {/* Row 1: Type & Orientation Switchers */}
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
                Student ID Cards ({students.length})
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
                Staff Faculty Cards ({staffList.length})
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

          {/* Row 2: Filters, Search & Theme Selector */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} alignItems="center">
            {/* Search Input */}
            <Box>
              <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1} textTransform="uppercase">
                Search Name or ID:
              </Text>
              <Flex
                align="center"
                bg="#F8FAFC"
                border="1px solid #E2E8F0"
                borderRadius="xl"
                px={3}
                h="40px"
              >
                <Icon as={FaSearch} color="#94A3B8" mr={2} boxSize={3.5} />
                <Input
                  variant="unstyled"
                  placeholder={cardType === "student" ? "Filter by name, ID code..." : "Filter staff name, ID..."}
                  fontSize="13px"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Flex>
            </Box>

            {/* Class Arm Selector (Only for Students) */}
            {cardType === "student" ? (
              <Box>
                <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1} textTransform="uppercase">
                  Class Arm:
                </Text>
                <select
                  style={{
                    width: "100%",
                    height: "40px",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    background: "#F8FAFC",
                    padding: "0 12px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#0F172A",
                    outline: "none",
                  }}
                  value={selectedClassArm}
                  onChange={(e) => setSelectedClassArm(e.target.value)}
                >
                  <option value="all">All Class Arms ({students.length} Total)</option>
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
                    LIVE CR80 CARD INSPECTOR
                  </Badge>
                  <Text fontSize="12px" color="#64748B">
                    Card {inspectIndex + 1} of {currentItems.length}
                  </Text>
                </HStack>
                <Text fontSize="20px" fontWeight="900" color="#0F172A" mb={1}>
                  {cardType === "student"
                    ? `${activeInspectItem.firstName} ${activeInspectItem.lastName}`
                    : activeInspectItem.name}
                </Text>
                <Text fontSize="13px" color="#64748B" mb={4}>
                  Unique Code: <strong>{cardType === "student" ? activeInspectItem.studentId : activeInspectItem.staffIdNumber || "N/A"}</strong> • Orientation: <strong>{orientation}</strong>
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
                title="Click to flip front/back"
              >
                <IdCardElement
                  item={activeInspectItem}
                  school={school}
                  cardType={cardType}
                  orientation={orientation}
                  theme={theme}
                  showBack={isFlipped}
                  qrDataUrl={qrCache[cardType === "student" ? activeInspectItem.studentId : activeInspectItem.staffIdNumber || activeInspectItem.id]}
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
                const qrUrl = qrCache[code];

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
                            {cardType === "student"
                              ? `${item.firstName} ${item.lastName}`
                              : item.name}
                          </Text>
                          <Text fontSize="11px" color="#64748B" fontWeight="600">
                            {code}
                          </Text>
                          <Text fontSize="11px" color="#2563EB" fontWeight="bold">
                            {cardType === "student"
                              ? item.ClassArm?.name || "No Class"
                              : item.designation || "Faculty Staff"}
                          </Text>
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
  isPrint = false,
}) {
  const isPortrait = orientation === "portrait";

  // Standard CR80 Card Dimensions (in mm converted to screen px or print mm)
  // Portrait: 54mm width × 85.6mm height
  // Landscape: 85.6mm width × 54mm height
  const cardWidth = isPrint
    ? isPortrait
      ? "54mm"
      : "85.6mm"
    : isPortrait
    ? "260px"
    : "380px";

  const cardHeight = isPrint
    ? isPortrait
      ? "85.6mm"
      : "54mm"
    : isPortrait
    ? "390px"
    : "240px";

  const schoolName = school.name || "Institutional Academy";
  const schoolLogo = school.logoUrl;
  const schoolMotto = school.motto || "Excellence & Integrity";
  const schoolAddress = school.address || "12 Campus Drive, Academic City";
  const schoolPhone = school.phone || "+234 800 000 0000";
  const principalTitle = school.principalTitle || "Principal";
  const principalSignature = school.principalSignatureUrl;
  const principalStamp = school.principalStampUrl;
  const academicSession = school.academicSession || "2025/2026";

  const fullName =
    cardType === "student"
      ? `${item.firstName || ""} ${item.lastName || ""}`
      : item.name || "Staff Member";

  const code = cardType === "student" ? item.studentId : item.staffIdNumber || item.id;
  const roleLabel =
    cardType === "student"
      ? item.isPrefect
        ? item.prefectRole || "PREFECT"
        : "STUDENT"
      : item.designation?.toUpperCase() || "FACULTY STAFF";

  const subInfo =
    cardType === "student"
      ? item.ClassArm?.name || "General Roster"
      : item.email || school.email;

  const emergencyPhone =
    cardType === "student"
      ? item.parentPhone || schoolPhone
      : item.phoneNumber || schoolPhone;

  // ----------------------------------------------------
  // CARD BACK
  // ----------------------------------------------------
  if (showBack) {
    return (
      <Box
        w={cardWidth}
        h={cardHeight}
        borderRadius={isPrint ? "3mm" : "16px"}
        bg={theme.lightBg}
        border={`1.5px solid ${theme.primary}`}
        p={isPrint ? "3.5mm" : "14px"}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        position="relative"
        overflow="hidden"
        boxShadow={isPrint ? "none" : "0 8px 24px rgba(0,0,0,0.12)"}
        fontFamily="'Outfit', sans-serif"
      >
        {/* Subtle Top Watermark / Banner */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h={isPrint ? "2.5mm" : "5px"}
          bg={theme.primary}
        />

        {/* Back Header */}
        <Box textAlign="center" pt={1}>
          <Text
            fontSize={isPrint ? "8pt" : "11px"}
            fontWeight="900"
            color={theme.primary}
            letterSpacing="0.3px"
            textTransform="uppercase"
            isTruncated
          >
            {schoolName}
          </Text>
          <HStack justify="center" spacing={1} mt={0.5}>
            <Icon as={FaMapMarkerAlt} boxSize={isPrint ? "6pt" : "8px"} color="#64748B" />
            <Text fontSize={isPrint ? "5.5pt" : "8px"} color="#64748B" isTruncated>
              {schoolAddress}
            </Text>
          </HStack>
        </Box>

        {/* Official Terms & Loss Clause */}
        <Box
          bg="white"
          p={isPrint ? "2mm" : "8px"}
          borderRadius={isPrint ? "1.5mm" : "8px"}
          border="1px solid #E2E8F0"
        >
          <Text
            fontSize={isPrint ? "5pt" : "7.5px"}
            color="#334155"
            lineHeight="1.25"
            textAlign="center"
          >
            This card is the property of <strong>{schoolName}</strong> and must be produced upon demand.
            If lost and found, please return to the school administration or call <strong>{schoolPhone}</strong>.
          </Text>
        </Box>

        {/* Signatures & Stamps Row */}
        <Flex justify="space-between" align="flex-end" px={1}>
          {/* Stamp Block */}
          <Box textAlign="center">
            {principalStamp ? (
              <img
                src={principalStamp}
                alt="Stamp"
                style={{
                  height: isPrint ? "8mm" : "30px",
                  objectFit: "contain",
                  margin: "0 auto",
                }}
              />
            ) : (
              <Box
                w={isPrint ? "8mm" : "28px"}
                h={isPrint ? "8mm" : "28px"}
                borderRadius="full"
                border="1px dashed #94A3B8"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FaShieldAlt} color="#94A3B8" boxSize={isPrint ? "4pt" : "12px"} />
              </Box>
            )}
            <Text fontSize={isPrint ? "5pt" : "7px"} color="#64748B" fontWeight="bold">
              Official Stamp
            </Text>
          </Box>

          {/* Signature Block */}
          <Box textAlign="center">
            {principalSignature ? (
              <img
                src={principalSignature}
                alt="Signature"
                style={{
                  height: isPrint ? "8mm" : "30px",
                  objectFit: "contain",
                  margin: "0 auto",
                }}
              />
            ) : (
              <Box h={isPrint ? "8mm" : "30px"} borderBottom="1px solid #94A3B8" w={isPrint ? "18mm" : "60px"} />
            )}
            <Text fontSize={isPrint ? "5.5pt" : "7.5px"} color="#0F172A" fontWeight="800">
              {principalTitle}
            </Text>
          </Box>
        </Flex>

        {/* Simulated Code128 Barcode at Bottom */}
        <Box textAlign="center" pt={1} borderTop="1px solid #E2E8F0">
          <BarcodeSimulation code={code} isPrint={isPrint} />
          <Text fontSize={isPrint ? "5.5pt" : "8px"} fontWeight="900" color="#0F172A" letterSpacing="1px">
            {code}
          </Text>
        </Box>
      </Box>
    );
  }

  // ----------------------------------------------------
  // CARD FRONT
  // ----------------------------------------------------
  return (
    <Box
      w={cardWidth}
      h={cardHeight}
      borderRadius={isPrint ? "3mm" : "16px"}
      bg="white"
      border={`1.5px solid ${theme.primary}`}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      position="relative"
      overflow="hidden"
      boxShadow={isPrint ? "none" : "0 8px 24px rgba(0,0,0,0.12)"}
      fontFamily="'Outfit', sans-serif"
    >
      {/* Institutional Top Header Banner */}
      <Box bg={theme.primary} color="white" p={isPrint ? "2.5mm 3.5mm" : "10px 14px"}>
        <Flex align="center" justify="space-between" gap={2}>
          {schoolLogo ? (
            <Box
              w={isPrint ? "7mm" : "28px"}
              h={isPrint ? "7mm" : "28px"}
              borderRadius="md"
              bg="white"
              p={0.5}
              flexShrink={0}
            >
              <img
                src={schoolLogo}
                alt="Logo"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Box>
          ) : (
            <Icon as={FaGraduationCap} color="#38BDF8" boxSize={isPrint ? "8pt" : "16px"} />
          )}

          <Box textAlign="right" overflow="hidden">
            <Text
              fontSize={isPrint ? "7.5pt" : "11px"}
              fontWeight="900"
              color="white"
              letterSpacing="0.2px"
              lineHeight="1.15"
              isTruncated
            >
              {schoolName}
            </Text>
            <Text
              fontSize={isPrint ? "4.5pt" : "6.5px"}
              color="#CBD5E1"
              fontStyle="italic"
              isTruncated
            >
              "{schoolMotto}"
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* Role Ribbon Strip */}
      <Box bg={theme.accent} py={isPrint ? "0.8mm" : "2px"} px={3} textAlign="center">
        <Text
          fontSize={isPrint ? "5.5pt" : "8px"}
          fontWeight="900"
          color="#0F172A"
          letterSpacing="1px"
        >
          {roleLabel} IDENTITY CARD
        </Text>
      </Box>

      {/* Card Body (Photo, Credentials & QR) */}
      <Box p={isPrint ? "2mm 3.5mm" : "8px 14px"} flex="1" display="flex" flexDirection="column" justifyContent="space-around">
        {isPortrait ? (
          /* PORTRAIT LAYOUT */
          <VStack spacing={isPrint ? "1.5mm" : 2} align="center" textAlign="center">
            {/* Passport Photo */}
            <Box
              w={isPrint ? "16mm" : "68px"}
              h={isPrint ? "18mm" : "78px"}
              borderRadius={isPrint ? "2mm" : "10px"}
              overflow="hidden"
              border={`2px solid ${theme.primary}`}
              boxShadow="0 2px 6px rgba(0,0,0,0.15)"
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
                  fontSize="20px"
                >
                  {item.firstName?.[0] || item.name?.[0] || "U"}
                </Flex>
              )}
            </Box>

            {/* Name & ID */}
            <Box>
              <Text
                fontSize={isPrint ? "8.5pt" : "13px"}
                fontWeight="900"
                color="#0F172A"
                lineHeight="1.2"
                isTruncated
                maxW={isPrint ? "46mm" : "220px"}
              >
                {fullName}
              </Text>
              <Text
                fontSize={isPrint ? "7pt" : "10px"}
                fontWeight="800"
                color={theme.primary}
                letterSpacing="0.5px"
                mt={0.5}
              >
                ID: {code}
              </Text>
              <Text fontSize={isPrint ? "6pt" : "9px"} color="#64748B" fontWeight="700">
                {subInfo}
              </Text>
            </Box>
          </VStack>
        ) : (
          /* LANDSCAPE LAYOUT */
          <Flex align="center" justify="space-between" gap={3}>
            {/* Photo */}
            <Box
              w={isPrint ? "18mm" : "74px"}
              h={isPrint ? "22mm" : "86px"}
              borderRadius="8px"
              overflow="hidden"
              border={`2px solid ${theme.primary}`}
              flexShrink={0}
            >
              {item.faceImageUrl ? (
                <img
                  src={item.faceImageUrl}
                  alt={fullName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Flex w="100%" h="100%" bg={theme.lightBg} color={theme.primary} align="center" justify="center" fontWeight="900" fontSize="22px">
                  {item.firstName?.[0] || item.name?.[0] || "U"}
                </Flex>
              )}
            </Box>

            {/* Info Columns */}
            <Box flex="1" overflow="hidden">
              <Text fontSize={isPrint ? "8.5pt" : "12.5px"} fontWeight="900" color="#0F172A" isTruncated>
                {fullName}
              </Text>
              <Text fontSize={isPrint ? "7pt" : "10px"} fontWeight="800" color={theme.primary}>
                ID: {code}
              </Text>
              <Text fontSize={isPrint ? "6pt" : "9px"} color="#64748B" fontWeight="bold">
                {subInfo}
              </Text>
              <Text fontSize={isPrint ? "5.5pt" : "8px"} color="#94A3B8" mt={1}>
                Emergency: {emergencyPhone}
              </Text>
            </Box>

            {/* QR Code */}
            {qrDataUrl && (
              <Box w={isPrint ? "14mm" : "55px"} h={isPrint ? "14mm" : "55px"} flexShrink={0}>
                <img src={qrDataUrl} alt="QR Code" style={{ width: "100%", height: "100%" }} />
              </Box>
            )}
          </Flex>
        )}

        {/* Portrait QR & Emergency Details */}
        {isPortrait && (
          <Flex justify="space-between" align="center" mt={isPrint ? "1.5mm" : 1} px={1}>
            <Box textAlign="left">
              <Text fontSize={isPrint ? "5pt" : "7.5px"} color="#64748B" fontWeight="600">
                Emergency:
              </Text>
              <Text fontSize={isPrint ? "5.5pt" : "8.5px"} fontWeight="800" color="#0F172A">
                {emergencyPhone}
              </Text>
              <Text fontSize={isPrint ? "5pt" : "7px"} color="#94A3B8">
                Session: {academicSession}
              </Text>
            </Box>

            {qrDataUrl && (
              <Box
                w={isPrint ? "12mm" : "48px"}
                h={isPrint ? "12mm" : "48px"}
                p={0.5}
                border="1px solid #E2E8F0"
                borderRadius="md"
              >
                <img src={qrDataUrl} alt="QR" style={{ width: "100%", height: "100%" }} />
              </Box>
            )}
          </Flex>
        )}
      </Box>

      {/* Card Bottom Strip */}
      <Box
        bg={theme.primary}
        color="white"
        py={isPrint ? "1mm" : "3px"}
        px={3}
        textAlign="center"
      >
        <Text fontSize={isPrint ? "4.5pt" : "7px"} fontWeight="bold" letterSpacing="0.5px">
          OFFICIAL INSTITUTIONAL PASS • ACESMART
        </Text>
      </Box>
    </Box>
  );
}

// Visual Barcode Simulation Component
function BarcodeSimulation({ isPrint = false }) {
  // Realistic barcode line weights pattern
  const bars = [2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1, 2];

  return (
    <Flex
      justify="center"
      align="center"
      h={isPrint ? "5mm" : "18px"}
      gap={isPrint ? "0.4mm" : "1.5px"}
      overflow="hidden"
      my={0.5}
    >
      {bars.map((w, i) => (
        <Box
          key={i}
          w={`${w * (isPrint ? 0.35 : 1.2)}px`}
          h="100%"
          bg="#0F172A"
        />
      ))}
    </Flex>
  );
}
