import { useState, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Input,
  Badge,
  Table,
  Icon,
  Select,
} from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaBookOpen,
  FaSearch,
  FaPlus,
  FaFilter,
  FaGraduationCap,
  FaDatabase,
  FaGlobeAfrica,
  FaSchool,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";
import SuperAdminLayout from "./SuperAdminLayout";
import {
  fetchSubjectsApi,
  createGlobalSubjectApi,
  updateSubjectApi,
  deleteSubjectApi,
} from "../../api-endpoint/subjects/subjectEndpoints";
import { SUBJECT_CATEGORIES } from "../../constants/subjectsData";
import { TableSkeleton } from "../../components/ui/skeletons";
import AdminPinPromptModal from "../../components/superadmin/AdminPinPromptModal";

export default function SuperAdminSubjects() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for adding a global subject
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Sciences");
  const [formLevel, setFormLevel] = useState("Senior Secondary");
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [pinModalOpen, setPinModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["superadmin-subjects"],
    queryFn: () => fetchSubjectsApi({ includeQuestionCount: "true" }),
  });

  const subjects = data?.data || [];

  const addSubjectMutation = useMutation({
    mutationFn: createGlobalSubjectApi,
    onSuccess: (res) => {
      if (res.success) {
        setIsAddModalOpen(false);
        setFormName("");
        setFormCode("");
        setFormDescription("");
        queryClient.invalidateQueries({ queryKey: ["superadmin-subjects"] });
      }
    },
  });

  // Calculate high level metrics
  const metrics = useMemo(() => {
    let totalQuestions = 0;
    let globalCount = 0;
    let customCount = 0;

    for (const s of subjects) {
      totalQuestions += Number(s.questionCount || 0);
      if (s.isGlobal) globalCount++;
      else customCount++;
    }

    return {
      totalSubjects: subjects.length,
      globalCount,
      customCount,
      totalQuestions,
    };
  }, [subjects]);

  // Filter subjects based on search query and category
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchCat =
        selectedCategory === "All" || s.category === selectedCategory;
      if (!matchCat) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const sName = (s.name || "").toLowerCase();
      const sCode = (s.code || "").toLowerCase();
      const sLevel = (s.level || "").toLowerCase();
      return (
        sName.includes(term) || sCode.includes(term) || sLevel.includes(term)
      );
    });
  }, [subjects, selectedCategory, searchTerm]);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setPinModalOpen(true);
  };

  const executeAddSubject = (pin) => {
    addSubjectMutation.mutate({
      name: formName.trim(),
      category: formCategory,
      level: formLevel,
      code: formCode.trim() || undefined,
      description: formDescription.trim() || undefined,
      adminPin: pin,
    });
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case "Sciences":
        return { bg: "rgba(59, 130, 246, 0.15)", text: "#60A5FA", border: "rgba(59, 130, 246, 0.3)" };
      case "Commercial":
        return { bg: "rgba(16, 185, 129, 0.15)", text: "#34D399", border: "rgba(16, 185, 129, 0.3)" };
      case "Arts & Humanities":
        return { bg: "rgba(168, 85, 247, 0.15)", text: "#C084FC", border: "rgba(168, 85, 247, 0.3)" };
      case "Junior Secondary (BECE)":
        return { bg: "rgba(249, 115, 22, 0.15)", text: "#FB923C", border: "rgba(249, 115, 22, 0.3)" };
      case "Trade & Vocational":
        return { bg: "rgba(245, 158, 11, 0.15)", text: "#FBBF24", border: "rgba(245, 158, 11, 0.3)" };
      default:
        return { bg: "rgba(148, 163, 184, 0.15)", text: "#94A3B8", border: "rgba(148, 163, 184, 0.3)" };
    }
  };

  return (
    <SuperAdminLayout>
      <Box p={{ base: 4, md: 8 }}>
        {/* Top Header */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          gap={4}
          mb={8}
        >
          <Box>
            <Flex align="center" gap={3} mb={1}>
              <Box
                w="42px"
                h="42px"
                borderRadius="xl"
                bg="linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 4px 14px rgba(99, 102, 241, 0.4)"
              >
                <Icon as={FaBookOpen} color="white" boxSize={5} />
              </Box>
              <Box>
                <Text
                  fontSize={{ base: "22px", md: "26px" }}
                  fontWeight="900"
                  color="white"
                  letterSpacing="-0.5px"
                  fontFamily="'Outfit', sans-serif"
                >
                  Curriculum & Master Subjects
                </Text>
                <Text fontSize="13px" color="#94A3B8">
                  SuperAdmin National Curriculum Registry & Universal Question Bank Relationships
                </Text>
              </Box>
            </Flex>
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
            onClick={() => setIsAddModalOpen(true)}
          >
            <Icon as={FaPlus} mr={2} boxSize={3.5} />
            Add Global Curriculum Subject
          </Button>
        </Flex>

        {/* 4 Metric Cards */}
        <Flex wrap="wrap" gap={4} mb={8}>
          <Box
            flex="1"
            minW="220px"
            bg="#111827"
            p={5}
            borderRadius="2xl"
            border="1px solid #1F2937"
          >
            <Flex align="center" justify="space-between" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#94A3B8" textTransform="uppercase">
                Master Subjects
              </Text>
              <Icon as={FaGlobeAfrica} color="#60A5FA" boxSize={4} />
            </Flex>
            <Text fontSize="28px" fontWeight="900" color="white">
              {metrics.totalSubjects}
            </Text>
            <Text fontSize="11px" color="#64748B" mt={1}>
              {metrics.globalCount} National WAEC/NECO/BECE
            </Text>
          </Box>

          <Box
            flex="1"
            minW="220px"
            bg="#111827"
            p={5}
            borderRadius="2xl"
            border="1px solid #1F2937"
          >
            <Flex align="center" justify="space-between" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#94A3B8" textTransform="uppercase">
                Question Bank Banked
              </Text>
              <Icon as={FaDatabase} color="#34D399" boxSize={4} />
            </Flex>
            <Text fontSize="28px" fontWeight="900" color="#10B981">
              {metrics.totalQuestions.toLocaleString()}
            </Text>
            <Text fontSize="11px" color="#64748B" mt={1}>
              Active questions mapped to subjects
            </Text>
          </Box>

          <Box
            flex="1"
            minW="220px"
            bg="#111827"
            p={5}
            borderRadius="2xl"
            border="1px solid #1F2937"
          >
            <Flex align="center" justify="space-between" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#94A3B8" textTransform="uppercase">
                Institution Custom
              </Text>
              <Icon as={FaSchool} color="#FBBF24" boxSize={4} />
            </Flex>
            <Text fontSize="28px" fontWeight="900" color="#F59E0B">
              {metrics.customCount}
            </Text>
            <Text fontSize="11px" color="#64748B" mt={1}>
              School liberty subjects registered
            </Text>
          </Box>

          <Box
            flex="1"
            minW="220px"
            bg="#111827"
            p={5}
            borderRadius="2xl"
            border="1px solid #1F2937"
          >
            <Flex align="center" justify="space-between" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#94A3B8" textTransform="uppercase">
                Curriculum Tracks
              </Text>
              <Icon as={FaGraduationCap} color="#A78BFA" boxSize={4} />
            </Flex>
            <Text fontSize="28px" fontWeight="900" color="#8B5CF6">
              {SUBJECT_CATEGORIES.length - 1}
            </Text>
            <Text fontSize="11px" color="#64748B" mt={1}>
              Sciences, Commercial, Arts, BECE, Trade
            </Text>
          </Box>
        </Flex>

        {/* Filter Toolbar */}
        <Box
          bg="#111827"
          p={4}
          borderRadius="2xl"
          border="1px solid #1F2937"
          mb={6}
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            gap={4}
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
          >
            <Flex
              align="center"
              gap={3}
              bg="#1E293B"
              px={4}
              py={2}
              borderRadius="xl"
              border="1px solid #334155"
              maxW={{ base: "100%", md: "400px" }}
              flex="1"
            >
              <Icon as={FaSearch} color="#94A3B8" />
              <Input
                variant="unstyled"
                placeholder="Search subject name, code, or level..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fontSize="13px"
                color="white"
              />
              {searchTerm && (
                <Button
                  size="xs"
                  variant="ghost"
                  color="#94A3B8"
                  onClick={() => setSearchTerm("")}
                >
                  <Icon as={FaTimes} boxSize={3} />
                </Button>
              )}
            </Flex>

            {/* Category Filter Pills */}
            <Flex wrap="wrap" gap={2} align="center">
              {SUBJECT_CATEGORIES.slice(0, 6).map((cat) => (
                <Button
                  key={cat}
                  size="xs"
                  h="32px"
                  px={3}
                  borderRadius="xl"
                  fontSize="11px"
                  fontWeight="700"
                  bg={selectedCategory === cat ? "#6366F1" : "#1E293B"}
                  color={selectedCategory === cat ? "white" : "#94A3B8"}
                  border="1px solid"
                  borderColor={selectedCategory === cat ? "#6366F1" : "#334155"}
                  _hover={{ bg: selectedCategory === cat ? "#4F46E5" : "#334155" }}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </Flex>
          </Flex>
        </Box>

        {/* Main Subjects Table Card */}
        <Box
          bg="#111827"
          borderRadius="24px"
          border="1px solid #1F2937"
          overflow="hidden"
          boxShadow="0 4px 20px rgba(0, 0, 0, 0.2)"
        >
          {isLoading ? (
            <Box p={6}>
              <TableSkeleton rows={8} columns={5} />
            </Box>
          ) : isError ? (
            <Flex h="200px" justify="center" align="center" color="#EF4444">
              <Text>Failed to retrieve subject catalog.</Text>
            </Flex>
          ) : filteredSubjects.length === 0 ? (
            <Flex h="240px" direction="column" justify="center" align="center" color="#64748B">
              <Icon as={FaBookOpen} boxSize={8} color="#334155" mb={2} />
              <Text fontSize="15px" fontWeight="700" color="#E2E8F0">
                No subjects matched your filter
              </Text>
              <Text fontSize="13px" mt={1}>
                Try adjusting your search keywords or category selector.
              </Text>
            </Flex>
          ) : (
            <Box overflowX="auto" maxH="68vh">
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", background: "#111827" }}>
                <thead>
                  <tr style={{ background: "#0B0F19", borderBottom: "1px solid #1F2937", position: "sticky", top: 0, zIndex: 10 }}>
                    <th style={{ padding: "14px 20px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>
                      Subject Name & Code
                    </th>
                    <th style={{ padding: "14px 20px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>
                      Curriculum Track
                    </th>
                    <th style={{ padding: "14px 20px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>
                      Education Level
                    </th>
                    <th style={{ padding: "14px 20px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>
                      Scope
                    </th>
                    <th style={{ padding: "14px 20px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", textAlign: "right" }}>
                      Banked Questions
                    </th>
                  </tr>
                </thead>
                <tbody style={{ background: "#111827" }}>
                  {filteredSubjects.map((sub, idx) => {
                    const catStyle = getCategoryColor(sub.category);
                    return (
                      <tr
                        key={sub.id || idx}
                        style={{ borderBottom: "1px solid #1F2937", transition: "background 0.15s ease", background: "#111827" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#1E293B")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#111827")}
                      >
                        <td style={{ padding: "14px 20px" }}>
                          <Flex align="center" gap={3}>
                            <Box
                              w="34px"
                              h="34px"
                              borderRadius="lg"
                              bg="#1E293B"
                              border="1px solid #374151"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              color="#60A5FA"
                              fontWeight="800"
                              fontSize="11px"
                            >
                              {sub.code || sub.name.substring(0, 3).toUpperCase()}
                            </Box>
                            <Box>
                              <Text fontSize="14px" fontWeight="700" color="#F8FAFC">
                                {sub.name}
                              </Text>
                              {sub.code && (
                                <Text fontSize="11px" color="#94A3B8">
                                  Code: {sub.code}
                                </Text>
                              )}
                            </Box>
                          </Flex>
                        </td>

                        <td style={{ padding: "14px 20px" }}>
                          <Badge
                            bg={catStyle.bg}
                            color={catStyle.text}
                            border="1px solid"
                            borderColor={catStyle.border}
                            px={2.5}
                            py={0.8}
                            borderRadius="md"
                            fontSize="11px"
                            fontWeight="700"
                          >
                            {sub.category || "General"}
                          </Badge>
                        </td>

                        <td style={{ padding: "14px 20px" }}>
                          <Text fontSize="12px" color="#CBD5E1" fontWeight="600">
                            {sub.level || "Senior Secondary"}
                          </Text>
                        </td>

                        <td style={{ padding: "14px 20px" }}>
                          {sub.isGlobal ? (
                            <Badge
                              bg="rgba(16, 185, 129, 0.15)"
                              color="#34D399"
                              border="1px solid rgba(16, 185, 129, 0.3)"
                              px={2.5}
                              py={0.6}
                              borderRadius="full"
                              fontSize="10px"
                              fontWeight="800"
                            >
                              GLOBAL MASTER
                            </Badge>
                          ) : (
                            <Badge
                              bg="rgba(245, 158, 11, 0.15)"
                              color="#FBBF24"
                              border="1px solid rgba(245, 158, 11, 0.3)"
                              px={2.5}
                              py={0.6}
                              borderRadius="full"
                              fontSize="10px"
                              fontWeight="800"
                            >
                              SCHOOL CUSTOM
                            </Badge>
                          )}
                        </td>

                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <Badge
                            bg={sub.questionCount > 0 ? "rgba(99, 102, 241, 0.2)" : "#1E293B"}
                            color={sub.questionCount > 0 ? "#A5B4FC" : "#94A3B8"}
                            border="1px solid"
                            borderColor={sub.questionCount > 0 ? "rgba(99, 102, 241, 0.4)" : "#374151"}
                            px={2.5}
                            py={0.8}
                            borderRadius="lg"
                            fontSize="12px"
                            fontWeight="800"
                          >
                            {sub.questionCount || 0} Questions
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>
          )}
        </Box>

        {/* Modal: Add Global Subject */}
        {isAddModalOpen && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0, 0, 0, 0.75)"
            backdropFilter="blur(4px)"
            zIndex={200}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
          >
            <Box
              bg="#111827"
              border="1px solid #1F2937"
              borderRadius="24px"
              w="100%"
              maxW="520px"
              p={6}
              boxShadow="0 20px 50px rgba(0, 0, 0, 0.5)"
              className="animate-scale-in"
            >
              <Flex justify="space-between" align="center" mb={5} pb={3} borderBottom="1px solid #1F2937">
                <Flex align="center" gap={2.5}>
                  <Box
                    w="32px"
                    h="32px"
                    borderRadius="lg"
                    bg="rgba(16, 185, 129, 0.2)"
                    color="#10B981"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={FaBookOpen} boxSize={4} />
                  </Box>
                  <Text fontSize="17px" fontWeight="800" color="white">
                    Add Global Curriculum Subject
                  </Text>
                </Flex>
                <Button
                  size="xs"
                  variant="ghost"
                  color="#94A3B8"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  <Icon as={FaTimes} boxSize={4} />
                </Button>
              </Flex>

              <form onSubmit={handleCreateSubmit}>
                <Box mb={4}>
                  <Text fontSize="12px" fontWeight="700" color="#94A3B8" mb={1.5}>
                    Subject Name *
                  </Text>
                  <Input
                    placeholder="e.g. Robotics & Artificial Intelligence, Diction"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    bg="#1E293B"
                    border="1px solid #334155"
                    color="white"
                    borderRadius="xl"
                    h="42px"
                    fontSize="13px"
                    required
                  />
                </Box>

                <Flex gap={3} mb={4}>
                  <Box flex="1">
                    <Text fontSize="12px" fontWeight="700" color="#94A3B8" mb={1.5}>
                      Curriculum Track
                    </Text>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      style={{
                        width: "100%",
                        height: "42px",
                        background: "#1E293B",
                        border: "1px solid #334155",
                        color: "white",
                        borderRadius: "12px",
                        padding: "0 12px",
                        fontSize: "13px",
                      }}
                    >
                      <option value="Sciences">Sciences</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Arts & Humanities">Arts & Humanities</option>
                      <option value="Junior Secondary (BECE)">Junior Secondary (BECE)</option>
                      <option value="Primary Education">Primary Education</option>
                      <option value="Trade & Vocational">Trade & Vocational</option>
                      <option value="Nigerian Languages">Nigerian Languages</option>
                    </select>
                  </Box>

                  <Box flex="1">
                    <Text fontSize="12px" fontWeight="700" color="#94A3B8" mb={1.5}>
                      Education Level
                    </Text>
                    <select
                      value={formLevel}
                      onChange={(e) => setFormLevel(e.target.value)}
                      style={{
                        width: "100%",
                        height: "42px",
                        background: "#1E293B",
                        border: "1px solid #334155",
                        color: "white",
                        borderRadius: "12px",
                        padding: "0 12px",
                        fontSize: "13px",
                      }}
                    >
                      <option value="Senior Secondary">Senior Secondary</option>
                      <option value="Junior Secondary">Junior Secondary</option>
                      <option value="Primary">Primary</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </Box>
                </Flex>

                <Box mb={5}>
                  <Text fontSize="12px" fontWeight="700" color="#94A3B8" mb={1.5}>
                    Subject Code (Optional)
                  </Text>
                  <Input
                    placeholder="e.g. ROB, ENG, MTH"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    bg="#1E293B"
                    border="1px solid #334155"
                    color="white"
                    borderRadius="xl"
                    h="42px"
                    fontSize="13px"
                    textTransform="uppercase"
                  />
                </Box>

                <Flex justify="flex-end" gap={3}>
                  <Button
                    variant="ghost"
                    color="#94A3B8"
                    borderRadius="xl"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    bg="#10B981"
                    color="white"
                    borderRadius="xl"
                    px={5}
                    fontWeight="700"
                    _hover={{ bg: "#059669" }}
                    disabled={addSubjectMutation.isPending || !formName.trim()}
                  >
                    {addSubjectMutation.isPending ? "Creating..." : "Save Global Subject"}
                  </Button>
                </Flex>
              </form>
            </Box>
          </Box>
        )}

        {/* Admin PIN Verification Modal for adding global subjects */}
        <AdminPinPromptModal
          isOpen={pinModalOpen}
          onClose={() => setPinModalOpen(false)}
          onSuccess={(pin) => {
            setPinModalOpen(false);
            executeAddSubject(pin);
          }}
          actionTitle="Authorize Global Curriculum Subject"
          actionDescription={`Please enter your Master Security PIN to register "${formName}" into the Universal Question Bank and National Curriculum Catalog.`}
        />
      </Box>
    </SuperAdminLayout>
  );
}
