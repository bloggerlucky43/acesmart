import {
  Box,
  Flex,
  Text,
  Button,
  Input,
  Icon,
  Badge,
  VStack,
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { fetchStudent } from "../../../../api-endpoint/student/students";
import { getClassArmsApi } from "../../../../api-endpoint/sms/smsEndpoints";
import { useQuery } from "@tanstack/react-query";
import { CardGridSkeleton } from "../../../../components/ui/skeletons";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaSearch,
  FaFilePdf,
  FaUserPlus,
  FaUserGraduate,
  FaBuilding,
  FaLayerGroup,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MListOfStudent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassArm, setSelectedClassArm] = useState("all");
  const navigate = useNavigate();

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
      if (selectedClassArm !== "all") {
        const studentArmId = s.classArmId || s.ClassArm?.id;
        if (selectedClassArm === "unassigned") {
          if (studentArmId) return false;
        } else {
          if (studentArmId !== selectedClassArm) return false;
        }
      }

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

  const activeClassLabel = useMemo(() => {
    if (selectedClassArm === "all") return "All Students";
    if (selectedClassArm === "unassigned") return "Unassigned (CBT Only)";
    const found = classArms.find((a) => a.id === selectedClassArm);
    return found ? `${found.name}` : "Selected Class";
  }, [selectedClassArm, classArms]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("AceSmart CBT - Enrolled Students Directory", 14, 18);
    doc.setFontSize(10);
    doc.text(
      `Filter: ${activeClassLabel} | Generated: ${new Date().toLocaleDateString()} | Total: ${filteredStudents.length} Candidates`,
      14,
      26
    );

    const tableData = filteredStudents.map((s) => [
      s.studentId || "N/A",
      s.firstName || "-",
      s.lastName || "-",
      s.ClassArm?.name || s.department || "Unassigned (CBT Only)",
    ]);

    autoTable(doc, {
      startY: 32,
      head: [["Student ID", "First Name", "Last Name", "Class / Department"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [106, 27, 154] },
    });

    doc.save(`Student_Roster_${activeClassLabel.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
  };

  return (
    <Box pb={6} className="animate-scale-in">
      {/* Top Header */}
      <Flex justify="space-between" align="center" mb={4}>
        <Box>
          <Text fontSize="18px" fontWeight="800" color="#0F172A" fontFamily="'Outfit', sans-serif">
            Student Roster
          </Text>
          <Text fontSize="12px" color="#64748B">
            {filteredStudents.length} of {students.length} Candidates Enrolled
          </Text>
        </Box>
        <Flex gap={2}>
          <Button
            size="xs"
            bg="#059669"
            color="white"
            borderRadius="lg"
            h="32px"
            onClick={handleExportPDF}
            disabled={!filteredStudents.length}
          >
            <Icon as={FaFilePdf} mr={1} boxSize={3} />
            PDF
          </Button>
          <Button
            size="xs"
            bg="#6A1B9A"
            color="white"
            borderRadius="lg"
            h="32px"
            onClick={() => navigate("/teacher/add_student")}
          >
            <Icon as={FaUserPlus} mr={1} boxSize={3} />
            Add
          </Button>
        </Flex>
      </Flex>

      {/* Class Arm Horizontal Filter Chips (If institution has classes or unassigned students) */}
      {classArms.length > 0 && (
        <Box mb={3} overflowX="auto" pb={1} css={{ "&::-webkit-scrollbar": { display: "none" } }}>
          <Flex gap={2} minW="max-content">
            <Button
              size="xs"
              h="28px"
              px={3}
              borderRadius="full"
              fontSize="11px"
              fontWeight="700"
              bg={selectedClassArm === "all" ? "#6A1B9A" : "white"}
              color={selectedClassArm === "all" ? "white" : "#475569"}
              border="1px solid"
              borderColor={selectedClassArm === "all" ? "#6A1B9A" : "#E2E8F0"}
              onClick={() => setSelectedClassArm("all")}
            >
              All ({countsByArm.all})
            </Button>
            {classArms.map((arm) => (
              <Button
                key={arm.id}
                size="xs"
                h="28px"
                px={3}
                borderRadius="full"
                fontSize="11px"
                fontWeight="700"
                bg={selectedClassArm === arm.id ? "#0EA5E9" : "white"}
                color={selectedClassArm === arm.id ? "white" : "#475569"}
                border="1px solid"
                borderColor={selectedClassArm === arm.id ? "#0EA5E9" : "#E2E8F0"}
                onClick={() => setSelectedClassArm(arm.id)}
              >
                {arm.name} ({countsByArm[arm.id] || 0})
              </Button>
            ))}
            {(countsByArm.unassigned > 0 || classArms.length > 0) && (
              <Button
                size="xs"
                h="28px"
                px={3}
                borderRadius="full"
                fontSize="11px"
                fontWeight="700"
                bg={selectedClassArm === "unassigned" ? "#F59E0B" : "white"}
                color={selectedClassArm === "unassigned" ? "white" : "#B45309"}
                border="1px solid"
                borderColor={selectedClassArm === "unassigned" ? "#F59E0B" : "#FDE68A"}
                onClick={() => setSelectedClassArm("unassigned")}
              >
                Unassigned CBT ({countsByArm.unassigned})
              </Button>
            )}
          </Flex>
        </Box>
      )}

      {/* Search Input */}
      <Box mb={4}>
        <Flex
          align="center"
          gap={2.5}
          bg="white"
          px={3.5}
          py={2}
          borderRadius="xl"
          border="1px solid"
          borderColor="#E2E8F0"
        >
          <Icon as={FaSearch} color="#94A3B8" boxSize={3.5} />
          <Input
            variant="unstyled"
            placeholder={`Search ${activeClassLabel}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fontSize="13px"
          />
        </Flex>
      </Box>

      {/* Loading Skeleton */}
      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : isError ? (
        <Box bg="white" p={6} borderRadius="2xl" textAlign="center" color="red.500" fontSize="13px">
          Failed to load students. Please verify your connection.
        </Box>
      ) : filteredStudents.length === 0 ? (
        <Box
          bg="white"
          borderRadius="2xl"
          p={8}
          border="1px dashed #CBD5E1"
          textAlign="center"
        >
          <Icon as={FaUsers} boxSize={8} color="#CBD5E1" mb={2} />
          <Text fontSize="14px" fontWeight="700" color="#334155" mb={1}>
            {searchTerm ? "No matching students" : `No candidates in ${activeClassLabel}`}
          </Text>
          <Text fontSize="12px" color="#64748B" mb={4}>
            {searchTerm
              ? "Try searching by a different name or registration code."
              : "Import student list or register candidates into this class."}
          </Text>
          {selectedClassArm !== "all" && (
            <Button
              size="xs"
              variant="outline"
              color="#6A1B9A"
              borderColor="#E9D5FF"
              onClick={() => setSelectedClassArm("all")}
            >
              View All Students ({students.length})
            </Button>
          )}
        </Box>
      ) : (
        /* Card-based Mobile Student Directory */
        <VStack gap={3} align="stretch">
          {filteredStudents.map((s, i) => {
            const fullName = `${s.firstName || ""} ${s.lastName || ""}`.trim() || "Candidate";
            const initials = `${s.firstName?.[0] || ""}${s.lastName?.[0] || ""}`.toUpperCase() || "S";
            const hasClassArm = Boolean(s.ClassArm?.name);

            return (
              <Box
                key={s.id || i}
                bg="white"
                borderRadius="2xl"
                p={3.5}
                border="1px solid"
                borderColor="#E2E8F0"
                boxShadow="0 2px 6px rgba(0,0,0,0.02)"
              >
                <Flex justify="space-between" align="center">
                  <Flex align="center" gap={3}>
                    <Flex
                      w="38px"
                      h="38px"
                      borderRadius="xl"
                      bg="purple.50"
                      color="#6A1B9A"
                      align="center"
                      justify="center"
                      fontSize="13px"
                      fontWeight="800"
                    >
                      {initials}
                    </Flex>
                    <Box>
                      <Text fontSize="14px" fontWeight="700" color="#0F172A" lineHeight="1.2">
                        {fullName}
                      </Text>
                      <Flex wrap="wrap" align="center" gap={1.5} mt={1}>
                        <Badge bg="#F1F5F9" color="#475569" fontSize="10px" px={1.5} py={0.5} borderRadius="md">
                          {s.studentId || "No ID"}
                        </Badge>
                        {hasClassArm ? (
                          <Badge bg="#EFF6FF" color="#1D4ED8" fontSize="10px" px={1.5} py={0.5} borderRadius="md">
                            {s.ClassArm.name}
                          </Badge>
                        ) : (
                          <Badge bg="#FFFBEB" color="#B45309" fontSize="10px" px={1.5} py={0.5} borderRadius="md">
                            Unassigned CBT
                          </Badge>
                        )}
                        {s.department && !hasClassArm && (
                          <Flex align="center" gap={1} fontSize="11px" color="#64748B">
                            <Icon as={FaBuilding} boxSize={2.5} />
                            <Text>{s.department}</Text>
                          </Flex>
                        )}
                      </Flex>
                    </Box>
                  </Flex>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      )}
    </Box>
  );
};

export default MListOfStudent;
