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
  Spinner,
} from "@chakra-ui/react";
import { useState } from "react";
import { fetchStudent } from "../../api-endpoint/student/students";
import { useQuery } from "@tanstack/react-query";
import {
  FaUsers,
  FaSearch,
  FaFilePdf,
  FaUserGraduate,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ListOfStudent = () => {
  const [searchTerm, setSearchTerm] = useState("");

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
    doc.setFontSize(18);
    doc.text("AceSmart CBT - Enrolled Students Directory", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Total: ${students.length} Candidates`, 14, 28);

    const tableData = filteredStudents.map((s) => [
      s.studentId || "N/A",
      s.firstName || "-",
      s.lastName || "-",
      s.department || "General",
    ]);

    autoTable(doc, {
      startY: 34,
      head: [["Student ID", "First Name", "Last Name", "Department"]],
      body: tableData,
      headStyles: { fillColor: [106, 27, 154] },
      styles: { fontSize: 9 },
    });

    doc.save("AceSmart_Students_Roster.pdf");
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
                {students.length} Total
              </Badge>
            </Flex>
            <Text fontSize="14px" color="#64748B">
              View and manage registered candidates, departmental affiliations, and examination IDs.
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
            disabled={!students.length}
          >
            <Icon as={FaFilePdf} mr={2} boxSize={4} />
            Export Roster (PDF)
          </Button>
        </Flex>

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
              align="center"
              gap={3}
              bg="#F8FAFC"
              px={4}
              py={2}
              borderRadius="xl"
              border="1px solid #E2E8F0"
              maxW="400px"
            >
              <Icon as={FaSearch} color="#94A3B8" />
              <Input
                variant="unstyled"
                placeholder="Search by student name, ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fontSize="13px"
              />
            </Flex>
          </Box>

          {/* Table Content */}
          {isLoading ? (
            <Flex h="240px" justify="center" align="center">
              <Spinner size="xl" color="#6A1B9A" />
            </Flex>
          ) : isError ? (
            <Flex h="200px" justify="center" align="center" color="red.500">
              <Text>Failed to load student directory. Please try again.</Text>
            </Flex>
          ) : filteredStudents.length === 0 ? (
            <Flex h="240px" direction="column" justify="center" align="center" color="#64748B">
              <Icon as={FaUserGraduate} boxSize={8} color="#CBD5E1" mb={2} />
              <Text fontSize="15px" fontWeight="600">
                No students found
              </Text>
              <Text fontSize="13px">
                {searchTerm ? "Try adjusting your search query." : "No candidates have been registered yet."}
              </Text>
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
                      Full Name
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="white" py={3.5} px={6} fontSize="12px" fontWeight="700">
                      Department / Class
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="white" py={3.5} px={6} fontSize="12px" fontWeight="700" textAlign="right">
                      Status
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredStudents.map((s, idx) => {
                    const fullName = `${s.firstName || ""} ${s.lastName || ""}`.trim() || "Candidate";
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
                                {s.email || "Registered Student"}
                              </Text>
                            </Box>
                          </Flex>
                        </Table.Cell>

                        <Table.Cell py={3.5} px={6}>
                          <Badge
                            bg="#F1F5F9"
                            color="#334155"
                            px={2.5}
                            py={1}
                            borderRadius="md"
                            fontSize="11px"
                            fontWeight="600"
                          >
                            {s.department || "General Science"}
                          </Badge>
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
