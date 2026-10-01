import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Icon,
  Badge,
  SimpleGrid,
  Table,
  HStack,
  VStack,
  NativeSelect,
} from "@chakra-ui/react";
import {
  FaAward,
  FaKey,
  FaClock,
  FaCheckCircle,
  FaPlus,
  FaTrash,
  FaSyncAlt,
  FaSearch,
  FaCopy,
  FaTimes,
  FaExclamationCircle,
  FaUserShield,
} from "react-icons/fa";
import DashboardLayout from "../../constants/dashboardlayout";
import {
  getPrefectsApi,
  assignPrefectApi,
  getPrefectDailyCodeApi,
  getDailyPrefectAttendanceApi,
} from "../../api-endpoint/sms/prefectEndpoints";
import api from "../../libs/axios";
import { toaster } from "../../components/ui/toaster";

const COMMON_PREFECT_ROLES = [
  "Head Boy",
  "Head Girl",
  "Assistant Head Boy",
  "Assistant Head Girl",
  "Sanitary Prefect",
  "Time Keeper",
  "Labor Prefect",
  "Library Prefect",
  "Sports Prefect",
  "Dining Hall Prefect",
  "Social & Protocol Prefect",
  "Assembly Prefect",
  "Hostel Prefect",
];

export default function PrefectManager() {
  const [dailyData, setDailyData] = useState(null);
  const [codeData, setCodeData] = useState(null);
  const [prefectsList, setPrefectsList] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedRole, setSelectedRole] = useState("Head Boy");
  const [customRole, setCustomRole] = useState("");
  const [savingPrefect, setSavingPrefect] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalStudentSearch, setModalStudentSearch] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [codeRes, dailyRes, prefRes, studentsRes] = await Promise.all([
        getPrefectDailyCodeApi(),
        getDailyPrefectAttendanceApi(),
        getPrefectsApi(),
        api.get("/student", { withCredentials: true }).catch((err) => {
          console.warn("Failed to fetch students in PrefectManager:", err);
          return { data: { students: [] } };
        }),
      ]);

      if (codeRes?.success) setCodeData(codeRes.data);
      if (dailyRes?.success) setDailyData(dailyRes.data);
      if (prefRes?.success) setPrefectsList(prefRes.data || []);
      
      const rawStudents =
        studentsRes?.data?.students ||
        studentsRes?.data?.data ||
        (Array.isArray(studentsRes?.data) ? studentsRes.data : []);
      setAllStudents(rawStudents);
    } catch (err) {
      console.error("PrefectManager load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleCopyCode = () => {
    if (codeData?.prefectCode) {
      navigator.clipboard.writeText(codeData.prefectCode);
      toaster.create({
        title: "Code Copied!",
        description: `Prefect Attendance Code (${codeData.prefectCode}) copied to clipboard.`,
        type: "success",
      });
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      toaster.create({ title: "Please choose a student to appoint", type: "warning" });
      return;
    }

    const finalRole = selectedRole === "Other / Custom Role" ? customRole.trim() : selectedRole;
    if (!finalRole) {
      toaster.create({ title: "Please provide a prefect title", type: "warning" });
      return;
    }

    setSavingPrefect(true);
    const res = await assignPrefectApi({
      studentId: selectedStudentId,
      isPrefect: true,
      prefectRole: finalRole,
    });
    setSavingPrefect(false);

    if (res?.success) {
      setIsModalOpen(false);
      setSelectedStudentId("");
      setCustomRole("");
      loadAll();
    }
  };

  const handleRemovePrefect = async (studentId, studentName) => {
    if (!window.confirm(`Relieve ${studentName} of their prefect office?`)) return;
    const res = await assignPrefectApi({
      studentId,
      isPrefect: false,
    });
    if (res?.success) {
      loadAll();
    }
  };

  const board = dailyData?.board || [];
  const filteredBoard = board.filter((p) =>
    !searchTerm.trim() ||
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.prefectRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.classArm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudentsForModal = useMemo(() => {
    if (!modalStudentSearch.trim()) return allStudents;
    const q = modalStudentSearch.toLowerCase().trim();
    return allStudents.filter(
      (s) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        (s.studentId && s.studentId.toLowerCase().includes(q)) ||
        (s.ClassArm?.name && s.ClassArm.name.toLowerCase().includes(q))
    );
  }, [allStudents, modalStudentSearch]);

  return (
    <DashboardLayout>
      <Box
        p={{ base: 4, sm: 6, md: 8 }}
        pt={{ base: "84px", md: "88px" }}
        pl={{ base: 4, lg: "260px" }}
        maxW="1400px"
        mx="auto"
        w="100%"
        minH="100vh"
        boxSizing="border-box"
      >
        {/* Header */}
        <Flex
          justify="space-between"
          align={{ base: "stretch", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          gap={4}
          mb={{ base: 5, md: 7 }}
        >
          <Box>
            <Flex align="center" gap={3} mb={1}>
              <Flex
                w={{ base: "38px", md: "46px" }}
                h={{ base: "38px", md: "46px" }}
                borderRadius="xl"
                bg="linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)"
                color="#B45309"
                align="center"
                justify="center"
                boxShadow="0 4px 12px rgba(245, 158, 11, 0.2)"
                flexShrink={0}
              >
                <Icon as={FaAward} boxSize={{ base: 4, md: 5 }} />
              </Flex>
              <Box>
                <Flex align="center" gap={2} wrap="wrap">
                  <Text fontSize={{ base: "20px", md: "24px" }} fontWeight="900" color="#0F172A" letterSpacing="-0.5px">
                    School Prefects & Codes
                  </Text>
                  <Badge bg="#EEF2FF" color="#4338CA" px={2} py={0.5} borderRadius="full" fontSize="10px" fontWeight="800">
                    ERP SUITE
                  </Badge>
                </Flex>
                <Text fontSize={{ base: "12px", md: "13px" }} color="#64748B">
                  Appoint student leaders, issue daily attendance code, and monitor sign-in roster.
                </Text>
              </Box>
            </Flex>
          </Box>

          <Flex gap={2.5} align="center" w={{ base: "100%", sm: "auto" }}>
            <Button
              size="sm"
              variant="outline"
              borderRadius="xl"
              onClick={loadAll}
              loading={loading}
              flex={{ base: 1, sm: "none" }}
              h="38px"
              fontWeight="700"
              fontSize="12px"
            >
              <Icon as={FaSyncAlt} mr={1.5} boxSize={3} />
              Refresh
            </Button>
            <Button
              size="sm"
              bg="linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)"
              color="white"
              borderRadius="xl"
              onClick={() => setIsModalOpen(true)}
              _hover={{ opacity: 0.95 }}
              boxShadow="0 4px 12px rgba(67, 56, 202, 0.35)"
              flex={{ base: 2, sm: "none" }}
              h="38px"
              fontWeight="700"
              fontSize="12px"
            >
              <Icon as={FaPlus} mr={1.5} />
              Appoint Prefect
            </Button>
          </Flex>
        </Flex>

        {/* Released Prefect Attendance Code Banner */}
        <Box
          bg="linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #312E81 100%)"
          color="white"
          p={{ base: 4, sm: 6 }}
          borderRadius="2xl"
          boxShadow="0 10px 30px rgba(15, 23, 42, 0.25)"
          mb={{ base: 6, md: 8 }}
          position="relative"
          overflow="hidden"
        >
          {/* Subtle Ambient Glow */}
          <Box
            position="absolute"
            top="-30%"
            right="-10%"
            w="250px"
            h="250px"
            borderRadius="full"
            bg="radial-gradient(circle, rgba(253, 224, 71, 0.15) 0%, rgba(0,0,0,0) 70%)"
            pointerEvents="none"
          />

          <Flex
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={4}
            position="relative"
            zIndex={2}
          >
            <Box>
              <Flex align="center" gap={2} mb={1}>
                <Flex w="24px" h="24px" borderRadius="md" bg="rgba(253, 224, 71, 0.2)" align="center" justify="center">
                  <Icon as={FaKey} color="#FDE047" boxSize={3} />
                </Flex>
                <Text fontSize="11px" fontWeight="900" color="#FDE047" letterSpacing="0.8px">
                  TODAY&apos;S ACTIVE PREFECT ATTENDANCE CODE
                </Text>
              </Flex>
              <Text fontSize={{ base: "12px", md: "13px" }} color="#C7D2FE" maxW="600px">
                Release this 6-digit PIN to appointed student prefects so they can sign into duty on their student portal each morning.
              </Text>
            </Box>

            <Flex
              align="center"
              gap={3}
              direction={{ base: "column", sm: "row" }}
              w={{ base: "100%", md: "auto" }}
            >
              <Box
                bg="rgba(15, 23, 42, 0.6)"
                border="1px solid rgba(253, 224, 71, 0.4)"
                px={{ base: 4, sm: 6 }}
                py={2.5}
                borderRadius="xl"
                textAlign="center"
                w={{ base: "100%", sm: "auto" }}
                boxShadow="inset 0 2px 4px rgba(0,0,0,0.3)"
              >
                <Text fontSize={{ base: "24px", md: "28px" }} fontWeight="900" letterSpacing="4px" color="#FDE047" fontFamily="monospace">
                  {codeData?.prefectCode || "------"}
                </Text>
              </Box>

              <Button
                bg="#FDE047"
                color="#0F172A"
                h={{ base: "42px", md: "48px" }}
                px={5}
                borderRadius="xl"
                fontWeight="900"
                fontSize="13px"
                onClick={handleCopyCode}
                _hover={{ bg: "#FEF08A" }}
                w={{ base: "100%", sm: "auto" }}
                boxShadow="0 4px 14px rgba(253, 224, 71, 0.3)"
              >
                <Icon as={FaCopy} mr={2} boxSize={3.5} />
                Copy & Share PIN
              </Button>
            </Flex>
          </Flex>
        </Box>

        {/* Metrics Grid */}
        <SimpleGrid columns={{ base: 2, sm: 2, lg: 4 }} gap={{ base: 3, md: 4 }} mb={{ base: 6, md: 8 }}>
          <Box bg="white" p={{ base: 4, md: 5 }} borderRadius="2xl" border="1px solid #E2E8F0" boxShadow="xs">
            <Flex justify="space-between" align="center" mb={1.5}>
              <Text fontSize={{ base: "10px", md: "11px" }} fontWeight="800" color="#64748B" letterSpacing="0.5px">
                TOTAL PREFECTS
              </Text>
              <Flex w="28px" h="28px" borderRadius="lg" bg="#EEF2FF" color="#4338CA" align="center" justify="center">
                <Icon as={FaUserShield} boxSize={3} />
              </Flex>
            </Flex>
            <Text fontSize={{ base: "20px", md: "26px" }} fontWeight="900" color="#0F172A">
              {dailyData?.totalPrefects || prefectsList.length}
            </Text>
            <Text fontSize="11px" color="#64748B" mt={0.5}>
              Appointed student leaders
            </Text>
          </Box>

          <Box bg="white" p={{ base: 4, md: 5 }} borderRadius="2xl" border="1px solid #E2E8F0" boxShadow="xs">
            <Flex justify="space-between" align="center" mb={1.5}>
              <Text fontSize={{ base: "10px", md: "11px" }} fontWeight="800" color="#059669" letterSpacing="0.5px">
                SIGNED IN TODAY
              </Text>
              <Flex w="28px" h="28px" borderRadius="lg" bg="#ECFDF5" color="#059669" align="center" justify="center">
                <Icon as={FaCheckCircle} boxSize={3} />
              </Flex>
            </Flex>
            <Text fontSize={{ base: "20px", md: "26px" }} fontWeight="900" color="#059669">
              {dailyData?.presentCount || 0}
            </Text>
            <Text fontSize="11px" color="#059669" mt={0.5}>
              Active on morning duty
            </Text>
          </Box>

          <Box bg="white" p={{ base: 4, md: 5 }} borderRadius="2xl" border="1px solid #E2E8F0" boxShadow="xs">
            <Flex justify="space-between" align="center" mb={1.5}>
              <Text fontSize={{ base: "10px", md: "11px" }} fontWeight="800" color="#3B82F6" letterSpacing="0.5px">
                ON TIME
              </Text>
              <Flex w="28px" h="28px" borderRadius="lg" bg="#EFF6FF" color="#3B82F6" align="center" justify="center">
                <Icon as={FaClock} boxSize={3} />
              </Flex>
            </Flex>
            <Text fontSize={{ base: "20px", md: "26px" }} fontWeight="900" color="#3B82F6">
              {dailyData?.onTimeCount || 0}
            </Text>
            <Text fontSize="11px" color="#64748B" mt={0.5}>
              Clocked in before bell
            </Text>
          </Box>

          <Box bg="white" p={{ base: 4, md: 5 }} borderRadius="2xl" border="1px solid #E2E8F0" boxShadow="xs">
            <Flex justify="space-between" align="center" mb={1.5}>
              <Text fontSize={{ base: "10px", md: "11px" }} fontWeight="800" color="#D97706" letterSpacing="0.5px">
                MARKED LATE
              </Text>
              <Flex w="28px" h="28px" borderRadius="lg" bg="#FEF3C7" color="#D97706" align="center" justify="center">
                <Icon as={FaExclamationCircle} boxSize={3} />
              </Flex>
            </Flex>
            <Text fontSize={{ base: "20px", md: "26px" }} fontWeight="900" color="#D97706">
              {dailyData?.lateCount || 0}
            </Text>
            <Text fontSize="11px" color="#64748B" mt={0.5}>
              Punctuality flagged
            </Text>
          </Box>
        </SimpleGrid>

        {/* Prefect Roster Card */}
        <Box bg="white" p={{ base: 4, sm: 6 }} borderRadius="24px" border="1px solid #E2E8F0" boxShadow="sm">
          <Flex
            justify="space-between"
            align={{ base: "stretch", sm: "center" }}
            direction={{ base: "column", sm: "row" }}
            mb={5}
            gap={3}
          >
            <Box>
              <Text fontSize={{ base: "16px", md: "18px" }} fontWeight="800" color="#0F172A">
                Prefect Roster & Duty Sign-In Board
              </Text>
              <Text fontSize="12px" color="#64748B">
                Showing {filteredBoard.length} appointed student leaders
              </Text>
            </Box>

            <Box maxW={{ base: "100%", sm: "320px" }} w="100%">
              <Flex
                align="center"
                bg="#F8FAFC"
                border="1px solid #CBD5E1"
                borderRadius="xl"
                px={3}
                h="40px"
              >
                <Icon as={FaSearch} color="#94A3B8" mr={2} boxSize={3.5} />
                <Input
                  placeholder="Search by name, role, class..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  border="none"
                  p={0}
                  fontSize="13px"
                  _focus={{ outline: "none", boxShadow: "none" }}
                />
              </Flex>
            </Box>
          </Flex>

          {loading ? (
            <Flex justify="center" align="center" h="180px" color="#64748B" direction="column" gap={2}>
              <Icon as={FaSyncAlt} boxSize={5} color="#4338CA" className="spin" />
              <Text fontSize="13px">Loading prefect attendance board...</Text>
            </Flex>
          ) : filteredBoard.length === 0 ? (
            <Box p={{ base: 6, md: 10 }} textAlign="center" bg="#F8FAFC" borderRadius="2xl" border="1px dashed #CBD5E1">
              <Flex w="52px" h="52px" borderRadius="2xl" bg="#FEF3C7" color="#B45309" align="center" justify="center" mx="auto" mb={3}>
                <Icon as={FaAward} boxSize={6} />
              </Flex>
              <Text fontSize="16px" fontWeight="800" color="#0F172A">
                No school prefects appointed yet
              </Text>
              <Text fontSize="13px" color="#64748B" maxW="400px" mx="auto" mt={1} mb={4}>
                Appoint your Head Boy, Head Girl, Sanitary Prefect, and other student leaders to activate daily duty attendance tracking.
              </Text>
              <Button
                size="sm"
                bg="linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)"
                color="white"
                borderRadius="xl"
                onClick={() => setIsModalOpen(true)}
                h="38px"
                px={5}
                fontWeight="700"
              >
                <Icon as={FaPlus} mr={1.5} />
                Appoint First Prefect
              </Button>
            </Box>
          ) : (
            <>
              {/* 1. Desktop Table View (visible on md and up) */}
              <Box display={{ base: "none", md: "block" }} overflowX="auto">
                <Table.Root size="sm">
                  <Table.Header>
                    <Table.Row bg="#F8FAFC">
                      <Table.ColumnHeader fontWeight="800" color="#475569" py={3.5}>PREFECT</Table.ColumnHeader>
                      <Table.ColumnHeader fontWeight="800" color="#475569">OFFICE / POSITION</Table.ColumnHeader>
                      <Table.ColumnHeader fontWeight="800" color="#475569">CLASS ARM</Table.ColumnHeader>
                      <Table.ColumnHeader fontWeight="800" color="#475569">CLOCK IN</Table.ColumnHeader>
                      <Table.ColumnHeader fontWeight="800" color="#475569">DUTY STATUS</Table.ColumnHeader>
                      <Table.ColumnHeader fontWeight="800" color="#475569" textAlign="right">ACTION</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredBoard.map((row) => {
                      const isPresent = row.status === "on_time" || row.status === "late";
                      const statusColor = row.status === "on_time" ? "#059669" : row.status === "late" ? "#D97706" : "#64748B";
                      const statusBg = row.status === "on_time" ? "#ECFDF5" : row.status === "late" ? "#FFFBEB" : "#F1F5F9";

                      return (
                        <Table.Row key={row.studentId} _hover={{ bg: "#F8FAFC" }} transition="background 0.15s">
                          <Table.Cell py={3}>
                            <Flex align="center" gap={3}>
                              <Flex
                                w="36px"
                                h="36px"
                                borderRadius="xl"
                                bg="#4338CA"
                                color="white"
                                align="center"
                                justify="center"
                                fontWeight="800"
                                fontSize="13px"
                                flexShrink={0}
                              >
                                {row.name?.charAt(0) || "P"}
                              </Flex>
                              <Box>
                                <Text fontWeight="800" color="#0F172A" fontSize="14px">
                                  {row.name}
                                </Text>
                                <Text fontSize="11px" color="#64748B" fontWeight="600">
                                  {row.studentIdNumber || "No ID"}
                                </Text>
                              </Box>
                            </Flex>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              bg="linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)"
                              color="#4338CA"
                              px={2.5}
                              py={1}
                              borderRadius="full"
                              fontWeight="800"
                              fontSize="11px"
                              border="1px solid rgba(67, 56, 202, 0.2)"
                            >
                              ★ {row.prefectRole}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge bg="#F1F5F9" color="#475569" px={2} py={0.5} borderRadius="md" fontWeight="700" fontSize="11px">
                              {row.classArm}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Text fontWeight="800" color={isPresent ? "#0F172A" : "#94A3B8"} fontSize="13px">
                              {row.clockInTime || "--:--"}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge bg={statusBg} color={statusColor} px={2.5} py={0.8} borderRadius="full" fontWeight="800" fontSize="10.5px">
                              {row.status === "on_time" ? "✓ ON TIME" : row.status === "late" ? "⚠ LATE" : "○ NOT SIGNED IN"}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell textAlign="right">
                            <Button
                              size="xs"
                              variant="ghost"
                              color="#DC2626"
                              borderRadius="lg"
                              _hover={{ bg: "#FEF2F2" }}
                              onClick={() => handleRemovePrefect(row.studentId, row.name)}
                            >
                              <Icon as={FaTrash} mr={1} boxSize={3} />
                              Relieve
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Root>
              </Box>

              {/* 2. Mobile Responsive Card List (visible on small screens) */}
              <VStack display={{ base: "flex", md: "none" }} gap={3} align="stretch">
                {filteredBoard.map((row) => {
                  const isPresent = row.status === "on_time" || row.status === "late";
                  const statusColor = row.status === "on_time" ? "#059669" : row.status === "late" ? "#D97706" : "#64748B";
                  const statusBg = row.status === "on_time" ? "#ECFDF5" : row.status === "late" ? "#FFFBEB" : "#F1F5F9";

                  return (
                    <Box
                      key={row.studentId}
                      p={4}
                      borderRadius="xl"
                      border="1px solid #E2E8F0"
                      bg="#FFFFFF"
                      boxShadow="xs"
                    >
                      <Flex justify="space-between" align="flex-start" mb={2.5}>
                        <Flex align="center" gap={2.5}>
                          <Flex
                            w="36px"
                            h="36px"
                            borderRadius="lg"
                            bg="#4338CA"
                            color="white"
                            align="center"
                            justify="center"
                            fontWeight="800"
                            fontSize="13px"
                            flexShrink={0}
                          >
                            {row.name?.charAt(0) || "P"}
                          </Flex>
                          <Box>
                            <Text fontWeight="800" color="#0F172A" fontSize="14px" lineHeight="1.2">
                              {row.name}
                            </Text>
                            <Text fontSize="11px" color="#64748B" fontWeight="600">
                              {row.studentIdNumber || "No ID"} • {row.classArm}
                            </Text>
                          </Box>
                        </Flex>

                        <Badge
                          bg={statusBg}
                          color={statusColor}
                          px={2}
                          py={0.5}
                          borderRadius="full"
                          fontWeight="800"
                          fontSize="10px"
                        >
                          {row.status === "on_time" ? "ON TIME" : row.status === "late" ? "LATE" : "PENDING"}
                        </Badge>
                      </Flex>

                      <Flex justify="space-between" align="center" wrap="wrap" gap={2} pt={2} borderTop="1px solid #F1F5F9">
                        <Badge
                          bg="#EEF2FF"
                          color="#4338CA"
                          px={2.5}
                          py={0.8}
                          borderRadius="full"
                          fontWeight="800"
                          fontSize="11px"
                        >
                          ★ {row.prefectRole}
                        </Badge>

                        <Flex align="center" gap={3}>
                          <Text fontSize="12px" fontWeight="700" color="#475569">
                            Clock-in: <strong>{row.clockInTime || "--:--"}</strong>
                          </Text>
                          <Button
                            size="xs"
                            variant="ghost"
                            color="#DC2626"
                            p={1}
                            h="28px"
                            borderRadius="md"
                            onClick={() => handleRemovePrefect(row.studentId, row.name)}
                          >
                            <Icon as={FaTrash} boxSize={3} mr={1} />
                            Relieve
                          </Button>
                        </Flex>
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>
            </>
          )}
        </Box>

        {/* Appoint Prefect Modal */}
        {isModalOpen && (
          <Box
            position="fixed"
            top={0}
            left={0}
            w="100vw"
            h="100vh"
            bg="rgba(15, 23, 42, 0.65)"
            backdropFilter="blur(5px)"
            zIndex={9999}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={{ base: 3, sm: 4 }}
          >
            <Box
              bg="white"
              w={{ base: "100%", sm: "480px" }}
              maxW="480px"
              maxH="90vh"
              overflowY="auto"
              borderRadius="24px"
              boxShadow="2xl"
            >
              <Flex bg="#1E1B4B" color="white" p={{ base: 4, sm: 5 }} justify="space-between" align="center">
                <Box>
                  <Text fontSize="16px" fontWeight="800">
                    Appoint School Prefect
                  </Text>
                  <Text fontSize="12px" color="#C7D2FE">
                    Assign a student leadership office position
                  </Text>
                </Box>
                <Button size="xs" variant="ghost" color="white" onClick={() => setIsModalOpen(false)}>
                  <Icon as={FaTimes} boxSize={4} />
                </Button>
              </Flex>

              <Box as="form" onSubmit={handleAssignSubmit} p={{ base: 4, sm: 6 }}>
                <Box mb={4}>
                  <Flex justify="space-between" align="center" mb={1.5}>
                    <Text fontSize="12px" fontWeight="800" color="#334155">
                      SELECT STUDENT *
                    </Text>
                    <Text fontSize="11px" color="#64748B" fontWeight="600">
                      {filteredStudentsForModal.length} of {allStudents.length} students
                    </Text>
                  </Flex>

                  {/* Fast search filter input for directory */}
                  <Input
                    placeholder="Search by student name, ID or class..."
                    size="sm"
                    value={modalStudentSearch}
                    onChange={(e) => setModalStudentSearch(e.target.value)}
                    borderRadius="xl"
                    mb={2}
                    fontSize="12.5px"
                    h="36px"
                    bg="#F8FAFC"
                  />

                  <NativeSelect.Root size="md">
                    <NativeSelect.Field
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      required
                      borderRadius="xl"
                      fontSize="13px"
                    >
                      <option value="">
                        {filteredStudentsForModal.length === 0
                          ? "-- No matching students found --"
                          : `-- Choose student (${filteredStudentsForModal.length} available) --`}
                      </option>
                      {filteredStudentsForModal.map((s) => {
                        const fullName = `${s.firstName || ""} ${s.lastName || ""}`.trim();
                        const idDisplay = s.studentId ? ` (${s.studentId})` : "";
                        const classDisplay = s.ClassArm?.name ? ` • ${s.ClassArm.name}` : "";
                        const prefectNotice = s.isPrefect ? ` [Appointed: ${s.prefectRole}]` : "";
                        return (
                          <option key={s.id} value={s.id}>
                            {fullName}{idDisplay}{classDisplay}{prefectNotice}
                          </option>
                        );
                      })}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Box>

                <Box mb={4}>
                  <Text fontSize="12px" fontWeight="800" color="#334155" mb={1.5}>
                    PREFECT OFFICE / POSITION *
                  </Text>
                  <NativeSelect.Root size="md">
                    <NativeSelect.Field
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      borderRadius="xl"
                      fontSize="13px"
                    >
                      {COMMON_PREFECT_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                      <option value="Other / Custom Role">Other / Custom Title</option>
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Box>

                {selectedRole === "Other / Custom Role" && (
                  <Box mb={4}>
                    <Text fontSize="12px" fontWeight="800" color="#334155" mb={1.5}>
                      CUSTOM POSITION TITLE *
                    </Text>
                    <Input
                      placeholder="e.g. ICT & Labs Prefect"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      required
                      borderRadius="xl"
                      fontSize="13px"
                    />
                  </Box>
                )}

                <Flex justify="flex-end" gap={2} mt={6}>
                  <Button variant="outline" borderRadius="xl" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    bg="linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)"
                    color="white"
                    borderRadius="xl"
                    loading={savingPrefect}
                    _hover={{ opacity: 0.95 }}
                  >
                    Confirm Appointment
                  </Button>
                </Flex>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}
