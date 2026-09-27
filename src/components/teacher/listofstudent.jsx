import {
  Box,
  Flex,
  Text,
  Table,
  Button,
  Input,
  Icon,
  Avatar,
  Badge,
  NativeSelect,
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { fetchStudent } from "../../api-endpoint/student/students";
import { getClassArmsApi } from "../../api-endpoint/sms/smsEndpoints";
import { useQuery } from "@tanstack/react-query";
import { TableSkeleton } from "../ui/skeletons";
import {
  FaUsers,
  FaSearch,
  FaFilePdf,
  FaUserGraduate,
  FaLayerGroup,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ListOfStudent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassArm, setSelectedClassArm] = useState(() => {
    return localStorage.getItem("acesmart_pref_class_arm") || "all";
  });

  const handleSelectArm = (armId) => {
    setSelectedClassArm(armId);
    try {
      localStorage.setItem("acesmart_pref_class_arm", armId);
    } catch (_) {}
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudent,
  });

  const { data: classArmsData } = useQuery({
    queryKey: ["classArms"],
    queryFn: getClassArmsApi,
    staleTime: 5 * 60 * 1000,
  });

  const students = data?.students || [];
  const classArms = classArmsData?.data || [];

  // Compute student counts per class arm
  const countsByArm = useMemo(() => {
    const counts = { all: students.length, unassigned: 0 };
    for (const s of students) {
      const armId = s.classArmId || s.ClassArm?.id;
      if (armId) {
        counts[armId] = (counts[armId] || 0) + 1;
      } else {
        counts.unassigned += 1;
      }
    }
    return counts;
  }, [students]);

  // Filter students based on selected class arm and search query
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // 1. Class Arm filter
      if (selectedClassArm !== "all") {
        const studentArmId = s.classArmId || s.ClassArm?.id;
        if (selectedClassArm === "unassigned") {
          if (studentArmId) return false;
        } else {
          if (studentArmId !== selectedClassArm) return false;
        }
      }

      // 2. Keyword Search
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const fullName = `${s?.firstName ?? ""} ${s?.lastName ?? ""}`.toLowerCase();
      const studentId = String(s?.studentId ?? "").toLowerCase();
      const armName = String(s?.ClassArm?.name ?? "").toLowerCase();
      const department = String(s?.department ?? "").toLowerCase();
      return (
        fullName.includes(term) ||
        studentId.includes(term) ||
        armName.includes(term) ||
        department.includes(term)
      );
    });
  }, [students, selectedClassArm, searchTerm]);

  // Resolve current active class title for display and PDF export
  const activeClassLabel = useMemo(() => {
    if (selectedClassArm === "all") return "All Students";
    if (selectedClassArm === "unassigned") return "Unassigned (CBT Only)";
    const found = classArms.find((a) => a.id === selectedClassArm);
    return found ? `${found.name} (${found.level || "Class"})` : "Selected Class";
  }, [selectedClassArm, classArms]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("AceSmart CBT - Enrolled Students Directory", 14, 20);
    doc.setFontSize(10);
    doc.text(
      `Filter: ${activeClassLabel} | Generated: ${new Date().toLocaleDateString()} | Count: ${filteredStudents.length} Candidates`,
      14,
      28
    );

    const tableData = filteredStudents.map((s) => [
      s.studentId || "N/A",
      `${s.firstName || ""} ${s.lastName || ""}`.trim() || "-",
      s.ClassArm?.name || s.department || "Unassigned (CBT Only)",
      s.status || "ACTIVE",
    ]);

    autoTable(doc, {
      startY: 34,
      head: [["Student ID", "Full Name", "Class Arm / Department", "Status"]],
      body: tableData,
      headStyles: { fillColor: [106, 27, 154] },
      styles: { fontSize: 9 },
    });

    doc.save(`AceSmart_Students_${activeClassLabel.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
  };

  return (
    <Box
      mt="84px"
      ml={{ base: 0, lg: "240px" }}
      w={{ base: "100%", lg: "calc(100% - 240px)" }}
      p={{ base: 4, md: 8 }}
      minH="calc(100vh - 84px)"
      bg="#F8FAFC"
    >
      <Box maxW="1200px" mx="auto">
        {/* Header Bar */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          gap={4}
          mb={6}
        >
          <Box>
            <Flex align="center" gap={2.5} mb={1}>
              <Flex
                w="38px"
                h="38px"
                borderRadius="xl"
                bg="purple.50"
                color="#6A1B9A"
                align="center"
                justify="center"
              >
                <Icon as={FaUsers} boxSize={5} />
              </Flex>
              <Text
                fontSize={{ base: "22px", md: "26px" }}
                fontWeight="800"
                color="#0F172A"
                fontFamily="'Outfit', sans-serif"
              >
                Student Directory
              </Text>
              <Badge
                bg="purple.50"
                color="#6A1B9A"
                border="1px solid #E9D5FF"
                borderRadius="full"
                px={2.5}
                py={0.5}
                fontSize="12px"
                fontWeight="700"
              >
                {filteredStudents.length} of {students.length} Total
              </Badge>
            </Flex>
            <Text fontSize="14px" color="#64748B">
              Filter by specific academic class arm or manage unassigned CBT mock candidates.
            </Text>
          </Box>

          <Button
            bg="#10B981"
            color="white"
            borderRadius="xl"
            px={5}
            h="44px"
            fontSize="13px"
            fontWeight="700"
            _hover={{ bg: "#059669" }}
            onClick={handleExportPDF}
            disabled={!filteredStudents.length}
          >
            <Icon as={FaFilePdf} mr={2} boxSize={4} />
            Export Roster ({filteredStudents.length})
          </Button>
        </Flex>

        {/* Class Arm Navigation Bar (Only displayed if school has arms configured or unassigned candidates exist) */}
        {classArms.length > 0 && (
          <Box
            bg="white"
            borderRadius="20px"
            p={3}
            mb={6}
            border="1px solid #E2E8F0"
            boxShadow="0 1px 3px rgba(0,0,0,0.02)"
          >
            <Flex
              direction={{ base: "column", sm: "row" }}
              justify="space-between"
              align={{ base: "flex-start", sm: "center" }}
              gap={3}
              mb={3}
              px={1}
            >
              <Flex align="center" gap={2}>
                <Icon as={FaLayerGroup} color="#6A1B9A" boxSize={3.5} />
                <Text fontSize="12px" fontWeight="800" color="#475569" textTransform="uppercase" letterSpacing="0.5px">
                  Class Arm Directory:
                </Text>
                <Text fontSize="12px" color="#94A3B8">
                  Showing: <Text as="span" fontWeight="700" color="#6A1B9A">{activeClassLabel}</Text>
                </Text>
              </Flex>

              {classArms.length > 3 && (
                <Box minW="220px">
                  <NativeSelect.Root size="sm">
                    <NativeSelect.Field
                      value={selectedClassArm}
                      onChange={(e) => handleSelectArm(e.target.value)}
                      borderRadius="xl"
                      borderColor="purple.200"
                      fontWeight="600"
                      color="#334155"
                      bg="#F8FAFC"
                    >
                      <option value="all">All Classes ({students.length})</option>
                      {classArms.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({countsByArm[a.id] || 0} students)
                        </option>
                      ))}
                      <option value="unassigned">
                        Unassigned / CBT Only ({countsByArm.unassigned || 0})
                      </option>
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Box>
              )}
            </Flex>

            <Flex wrap="wrap" gap={2} align="center">
              {/* All Students Tab */}
              <Button
                size="sm"
                variant={selectedClassArm === "all" ? "solid" : "outline"}
                bg={selectedClassArm === "all" ? "#6A1B9A" : "transparent"}
                color={selectedClassArm === "all" ? "white" : "#475569"}
                borderColor={selectedClassArm === "all" ? "#6A1B9A" : "#CBD5E1"}
                borderRadius="xl"
                fontSize="12px"
                fontWeight="700"
                h="34px"
                px={3.5}
                _hover={{
                  bg: selectedClassArm === "all" ? "#581382" : "#F8FAFC",
                  borderColor: "#6A1B9A",
                }}
                onClick={() => handleSelectArm("all")}
              >
                All Students
                <Badge
                  ml={2}
                  bg={selectedClassArm === "all" ? "whiteAlpha.300" : "purple.50"}
                  color={selectedClassArm === "all" ? "white" : "#6A1B9A"}
                  borderRadius="full"
                  px={1.5}
                  fontSize="11px"
                >
                  {countsByArm.all}
                </Badge>
              </Button>

              {/* Individual Class Arms */}
              {classArms.map((arm) => {
                const count = countsByArm[arm.id] || 0;
                const isSelected = selectedClassArm === arm.id;
                return (
                  <Button
                    key={arm.id}
                    size="sm"
                    variant={isSelected ? "solid" : "outline"}
                    bg={isSelected ? "#0EA5E9" : "transparent"}
                    color={isSelected ? "white" : "#334155"}
                    borderColor={isSelected ? "#0EA5E9" : "#E2E8F0"}
                    borderRadius="xl"
                    fontSize="12px"
                    fontWeight="700"
                    h="34px"
                    px={3.5}
                    _hover={{
                      bg: isSelected ? "#0284C7" : "#F0F9FF",
                      borderColor: "#0EA5E9",
                    }}
                    onClick={() => handleSelectArm(arm.id)}
                  >
                    {arm.name}
                    <Badge
                      ml={2}
                      bg={isSelected ? "whiteAlpha.300" : "#F1F5F9"}
                      color={isSelected ? "white" : "#0284C7"}
                      borderRadius="full"
                      px={1.5}
                      fontSize="11px"
                    >
                      {count}
                    </Badge>
                  </Button>
                );
              })}

              {/* Unassigned / CBT Mock Only Tab */}
              {(countsByArm.unassigned > 0 || classArms.length > 0) && (
                <Button
                  size="sm"
                  variant={selectedClassArm === "unassigned" ? "solid" : "outline"}
                  bg={selectedClassArm === "unassigned" ? "#F59E0B" : "transparent"}
                  color={selectedClassArm === "unassigned" ? "white" : "#B45309"}
                  borderColor={selectedClassArm === "unassigned" ? "#F59E0B" : "#FDE68A"}
                  borderRadius="xl"
                  fontSize="12px"
                  fontWeight="700"
                  h="34px"
                  px={3.5}
                  _hover={{
                    bg: selectedClassArm === "unassigned" ? "#D97706" : "#FFFBEB",
                    borderColor: "#F59E0B",
                  }}
                  onClick={() => handleSelectArm("unassigned")}
                >
                  Unassigned (CBT Only)
                  <Badge
                    ml={2}
                    bg={selectedClassArm === "unassigned" ? "whiteAlpha.300" : "#FEF3C7"}
                    color={selectedClassArm === "unassigned" ? "white" : "#B45309"}
                    borderRadius="full"
                    px={1.5}
                    fontSize="11px"
                  >
                    {countsByArm.unassigned}
                  </Badge>
                </Button>
              )}
            </Flex>
          </Box>
        )}

        {/* Main Table Card */}
        <Box
          bg="white"
          borderRadius="24px"
          border="1px solid"
          borderColor="#E2E8F0"
          boxShadow="0 2px 12px rgba(0, 0, 0, 0.03)"
          overflow="hidden"
        >
          {/* Search Toolbar */}
          <Box p={4} borderBottom="1px solid" borderColor="#F1F5F9">
            <Flex
              direction={{ base: "column", sm: "row" }}
              justify="space-between"
              align={{ base: "stretch", sm: "center" }}
              gap={3}
            >
              <Flex
                align="center"
                gap={3}
                bg="#F8FAFC"
                px={4}
                py={2}
                borderRadius="xl"
                border="1px solid #E2E8F0"
                maxW={{ base: "100%", sm: "420px" }}
                flex="1"
              >
                <Icon as={FaSearch} color="#94A3B8" />
                <Input
                  variant="unstyled"
                  placeholder={`Search ${activeClassLabel} by candidate name, ID...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fontSize="13px"
                />
              </Flex>

              {classArms.length > 0 && selectedClassArm !== "all" && (
                <Flex align="center" gap={2}>
                  <Badge bg="purple.50" color="#6A1B9A" px={2.5} py={1} borderRadius="lg" fontSize="12px" fontWeight="700">
                    Active Filter: {activeClassLabel}
                  </Badge>
                  <Button
                    size="xs"
                    variant="ghost"
                    color="#64748B"
                    _hover={{ color: "#EF4444" }}
                    onClick={() => setSelectedClassArm("all")}
                  >
                    Clear Filter
                  </Button>
                </Flex>
              )}
            </Flex>
          </Box>

          {/* Table Content */}
          {isLoading ? (
            <Box p={4}>
              <TableSkeleton rows={6} columns={4} />
            </Box>
          ) : isError ? (
            <Flex h="200px" justify="center" align="center" color="red.500">
              <Text>Failed to load student directory. Please try again.</Text>
            </Flex>
          ) : filteredStudents.length === 0 ? (
            <Flex h="260px" direction="column" justify="center" align="center" color="#64748B" p={6} textAlign="center">
              <Icon as={FaUserGraduate} boxSize={9} color="#CBD5E1" mb={3} />
              <Text fontSize="16px" fontWeight="700" color="#1E293B">
                No students found in {activeClassLabel}
              </Text>
              <Text fontSize="13px" color="#64748B" maxW="380px" mt={1}>
                {searchTerm
                  ? "No candidates matched your search criteria. Try a different query."
                  : selectedClassArm !== "all"
                  ? `There are currently no students enrolled in ${activeClassLabel}.`
                  : "No students have been registered in this institution yet."}
              </Text>
              {selectedClassArm !== "all" && (
                <Button
                  mt={4}
                  size="sm"
                  variant="outline"
                  borderRadius="xl"
                  color="#6A1B9A"
                  borderColor="#E9D5FF"
                  onClick={() => setSelectedClassArm("all")}
                >
                  View All Students ({students.length})
                </Button>
              )}
            </Flex>
          ) : (
            <Table.ScrollArea maxH="65vh">
              <Table.Root size="md" stickyHeader>
                <Table.Header>
                  <Table.Row bg="#0F172A">
                    <Table.ColumnHeader color="white" py={3.5} px={6} fontSize="12px" fontWeight="700">
                      Candidate ID
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="white" py={3.5} px={6} fontSize="12px" fontWeight="700">
                      Full Name & Details
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="white" py={3.5} px={6} fontSize="12px" fontWeight="700">
                      Assigned Class Arm
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="white" py={3.5} px={6} fontSize="12px" fontWeight="700" textAlign="right">
                      Status
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredStudents.map((s, idx) => {
                    const fullName = `${s.firstName || ""} ${s.lastName || ""}`.trim() || "Candidate";
                    const hasClassArm = Boolean(s.ClassArm?.name);

                    return (
                      <Table.Row
                        key={s.id || idx}
                        _hover={{ bg: "#FAF5FF" }}
                        transition="background 0.15s ease"
                      >
                        <Table.Cell py={3.5} px={6} fontWeight="700" color="#6A1B9A" fontSize="13px">
                          {s.studentId || `STU-${idx + 100}`}
                        </Table.Cell>

                        <Table.Cell py={3.5} px={6}>
                          <Flex align="center" gap={3}>
                            <Avatar.Root size="sm" bg="purple.100" color="#6A1B9A">
                              <Avatar.Fallback name={fullName} />
                            </Avatar.Root>
                            <Box>
                              <Text fontSize="14px" fontWeight="700" color="#1E293B">
                                {fullName}
                              </Text>
                              <Text fontSize="11px" color="#64748B">
                                {s.studentEmail || s.email || "Registered Student"}
                              </Text>
                            </Box>
                          </Flex>
                        </Table.Cell>

                        <Table.Cell py={3.5} px={6}>
                          {hasClassArm ? (
                            <Flex align="center" gap={1.5}>
                              <Badge
                                bg="#EFF6FF"
                                color="#1D4ED8"
                                border="1px solid #BFDBFE"
                                px={2.5}
                                py={0.8}
                                borderRadius="md"
                                fontSize="11px"
                                fontWeight="700"
                              >
                                {s.ClassArm.name}
                              </Badge>
                              {s.ClassArm.level && (
                                <Text fontSize="11px" color="#64748B">
                                  ({s.ClassArm.level})
                                </Text>
                              )}
                            </Flex>
                          ) : (
                            <Badge
                              bg="#FFFBEB"
                              color="#B45309"
                              border="1px dashed #FDE68A"
                              px={2.5}
                              py={0.8}
                              borderRadius="md"
                              fontSize="11px"
                              fontWeight="600"
                            >
                              Unassigned (CBT Only)
                            </Badge>
                          )}
                        </Table.Cell>

                        <Table.Cell py={3.5} px={6} textAlign="right">
                          <Badge
                            bg="green.50"
                            color="#059669"
                            border="1px solid #A7F3D0"
                            borderRadius="full"
                            px={2}
                            py={0.5}
                            fontSize="10px"
                            fontWeight="700"
                          >
                            ACTIVE
                          </Badge>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ListOfStudent;
