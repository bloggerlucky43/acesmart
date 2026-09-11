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
import { useState } from "react";
import { fetchStudent } from "../../../../api-endpoint/student/students";
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
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MListOfStudent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudent,
  });

  const students = data?.students || [];

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${s?.firstName ?? ""} ${s?.lastName ?? ""}`.toLowerCase();
    const studentId = String(s?.studentId ?? "").toLowerCase();
    const department = String(s?.department ?? "").toLowerCase();
    return fullName.includes(term) || studentId.includes(term) || department.includes(term);
  });

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("AceSmart CBT - Enrolled Students Directory", 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Total: ${students.length} Candidates`, 14, 26);

    const tableData = filteredStudents.map((s) => [
      s.studentId || "N/A",
      s.firstName || "-",
      s.lastName || "-",
      s.department || "General",
    ]);

    autoTable(doc, {
      startY: 32,
      head: [["Student ID", "First Name", "Last Name", "Department"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [106, 27, 154] },
    });

    doc.save(`Student_Roster_${Date.now()}.pdf`);
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
            {students.length} Candidates Enrolled
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
            disabled={!students.length}
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
            placeholder="Search candidate name or ID..."
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
            {searchTerm ? "No matching students" : "No candidates enrolled yet"}
          </Text>
          <Text fontSize="12px" color="#64748B" mb={4}>
            {searchTerm ? "Try searching by a different name or registration code." : "Import student list or register candidates."}
          </Text>
          {!searchTerm && (
            <Button
              size="sm"
              bg="#6A1B9A"
              color="white"
              borderRadius="xl"
              onClick={() => navigate("/teacher/add_student")}
            >
              Add First Student
            </Button>
          )}
        </Box>
      ) : (
        /* Card-based Mobile Student Directory */
        <VStack gap={3} align="stretch">
          {filteredStudents.map((s, i) => {
            const fullName = `${s.firstName || ""} ${s.lastName || ""}`.trim() || "Candidate";
            const initials = `${s.firstName?.[0] || ""}${s.lastName?.[0] || ""}`.toUpperCase() || "S";

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
                      <Flex align="center" gap={2} mt={0.5}>
                        <Badge bg="#F1F5F9" color="#475569" fontSize="10px" px={1.5} py={0.5} borderRadius="md">
                          {s.studentId || "No ID"}
                        </Badge>
                        {s.department && (
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
