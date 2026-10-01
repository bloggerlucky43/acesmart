import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
  SimpleGrid,
  Input,
  Textarea,
  NativeSelect,
  HStack,
  VStack,
} from "@chakra-ui/react";
import {
  FaBook,
  FaPlus,
  FaTrash,
  FaFileAlt,
  FaPlayCircle,
  FaQuestionCircle,
  FaLink,
  FaExternalLinkAlt,
  FaSyncAlt,
  FaSearch,
  FaGraduationCap,
  FaCheck,
  FaTimes,
  FaDownload,
} from "react-icons/fa";
import DashboardLayout from "../../../constants/dashboardlayout";
import SearchableSubjectSelect from "../../../components/ui/SearchableSubjectSelect";
import { getClassArmsApi } from "../../../api-endpoint/sms/smsEndpoints";
import {
  getInstitutionResourcesApi,
  saveInstitutionResourceApi,
  deleteInstitutionResourceApi,
} from "../../../api-endpoint/sms/portalEndpoints";
import { toaster } from "../../../components/ui/toaster";

const TYPE_CONFIG = {
  document: { icon: FaFileAlt, label: "Document / Notes", color: "#4338CA", bg: "#EEF2FF" },
  past_questions: { icon: FaQuestionCircle, label: "Past Questions", color: "#B45309", bg: "#FEF3C7" },
  video: { icon: FaPlayCircle, label: "Video Lecture", color: "#B91C1C", bg: "#FEF2F2" },
  link: { icon: FaLink, label: "Web Link / Reading", color: "#047857", bg: "#ECFDF5" },
};

const initialForm = {
  id: null,
  title: "",
  description: "",
  subject: "General",
  type: "document",
  classArmId: "",
  url: "",
};

export default function TeacherResources() {
  const [resources, setResources] = useState([]);
  const [classArms, setClassArms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resData, armsData] = await Promise.all([
        getInstitutionResourcesApi(),
        getClassArmsApi(),
      ]);

      if (resData?.success) setResources(resData.data || []);
      if (armsData?.success) setClassArms(armsData.data || []);
    } catch (err) {
      console.error("TeacherResources load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) {
      toaster.create({
        title: "Title and Resource URL / File link are required",
        type: "warning",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await saveInstitutionResourceApi({
        ...formData,
        classArmId: formData.classArmId || null,
      });

      if (res?.success) {
        toaster.create({
          title: "Resource published successfully for students!",
          type: "success",
        });
        setIsFormOpen(false);
        setFormData(initialForm);
        loadData();
      }
    } catch (err) {
      toaster.create({
        title: "Failed to save resource",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this study resource?")) return;
    try {
      const res = await deleteInstitutionResourceApi(id);
      if (res?.success) {
        toaster.create({ title: "Resource deleted", type: "success" });
        loadData();
      }
    } catch (err) {
      toaster.create({
        title: "Failed to delete resource",
        description: err.message,
        type: "error",
      });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to local object preview URL or data URI
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        url: reader.result,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
      }));
      toaster.create({
        title: `File "${file.name}" attached successfully`,
        type: "success",
      });
    };
    reader.readAsDataURL(file);
  };

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchesSearch =
        !search.trim() ||
        r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.subject?.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase());

      const matchesClass =
        classFilter === "all" ||
        (classFilter === "global" && !r.classArmId) ||
        r.classArmId === classFilter;

      const matchesType = typeFilter === "all" || r.type === typeFilter;

      return matchesSearch && matchesClass && matchesType;
    });
  }, [resources, search, classFilter, typeFilter]);

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
                bg="linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)"
                color="#4338CA"
                align="center"
                justify="center"
                boxShadow="0 4px 12px rgba(67, 56, 202, 0.15)"
                flexShrink={0}
              >
                <Icon as={FaBook} boxSize={{ base: 4, md: 5 }} />
              </Flex>
              <Box>
                <Flex align="center" gap={2} wrap="wrap">
                  <Text fontSize={{ base: "20px", md: "24px" }} fontWeight="900" color="#0F172A" letterSpacing="-0.5px">
                    Class Study Materials & Notes
                  </Text>
                  <Badge bg="#EEF2FF" color="#4338CA" px={2} py={0.5} borderRadius="full" fontSize="10px" fontWeight="800">
                    CLASSROOM
                  </Badge>
                </Flex>
                <Text fontSize={{ base: "12px", md: "13px" }} color="#64748B">
                  Publish lesson notes, reading materials, past questions, and documents targeted to specific classes or the entire school.
                </Text>
              </Box>
            </Flex>
          </Box>

          <Flex gap={2.5} align="center" w={{ base: "100%", sm: "auto" }}>
            <Button
              size="sm"
              variant="outline"
              borderRadius="xl"
              onClick={loadData}
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
              onClick={() => setIsFormOpen(!isFormOpen)}
              _hover={{ opacity: 0.95 }}
              boxShadow="0 4px 12px rgba(67, 56, 202, 0.35)"
              flex={{ base: 2, sm: "none" }}
              h="38px"
              fontWeight="700"
              fontSize="12px"
            >
              <Icon as={isFormOpen ? FaTimes : FaPlus} mr={1.5} />
              {isFormOpen ? "Cancel Upload" : "Upload Study Material"}
            </Button>
          </Flex>
        </Flex>

        {/* Collapsible Upload Form Card */}
        {isFormOpen && (
          <Box
            bg="white"
            p={{ base: 4, sm: 6 }}
            borderRadius="24px"
            border="1px solid #C7D2FE"
            boxShadow="0 10px 25px -5px rgba(67, 56, 202, 0.08)"
            mb={{ base: 6, md: 8 }}
          >
            <Text fontSize={{ base: "16px", md: "18px" }} fontWeight="800" color="#0F172A" mb={4}>
              Upload New Class Material
            </Text>

            <Box as="form" onSubmit={handleSave}>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={4} mb={4}>
                {/* Class Arm Target */}
                <Box>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1.5}>
                    TARGET CLASS / ARM *
                  </Text>
                  <NativeSelect.Root size="md">
                    <NativeSelect.Field
                      value={formData.classArmId}
                      onChange={(e) => setFormData({ ...formData, classArmId: e.target.value })}
                      borderRadius="xl"
                      fontSize="13px"
                    >
                      <option value="">All Classes (General School Material)</option>
                      {classArms.map((arm) => (
                        <option key={arm.id} value={arm.id}>
                          {arm.name}
                        </option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                  <Text fontSize="11px" color="#64748B" mt={1}>
                    Only students in this class will see the material
                  </Text>
                </Box>

                {/* Subject */}
                <Box>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1.5}>
                    SUBJECT / COURSE *
                  </Text>
                  <SearchableSubjectSelect
                    value={formData.subject}
                    onChange={(val) => setFormData({ ...formData, subject: val })}
                    placeholder="Search subject (e.g. Mathematics, English, Biology)..."
                  />
                </Box>

                {/* Resource Type */}
                <Box>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1.5}>
                    MATERIAL TYPE
                  </Text>
                  <NativeSelect.Root size="md">
                    <NativeSelect.Field
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      borderRadius="xl"
                      fontSize="13px"
                    >
                      <option value="document">Document / PDF Notes</option>
                      <option value="past_questions">Past Questions</option>
                      <option value="video">Video Lecture (YouTube/Drive)</option>
                      <option value="link">Web Reference / Link</option>
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Box>
              </SimpleGrid>

              {/* Title & URL / File */}
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={4}>
                <Box>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1.5}>
                    RESOURCE TITLE *
                  </Text>
                  <Input
                    placeholder="e.g. Week 4: Photosynthesis & Light Reactions Notes"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    borderRadius="xl"
                    h="42px"
                    fontSize="13px"
                  />
                </Box>

                <Box>
                  <Flex justify="space-between" align="center" mb={1.5}>
                    <Text fontSize="12px" fontWeight="700" color="#334155">
                      RESOURCE URL OR ATTACH FILE *
                    </Text>
                    <label style={{ cursor: "pointer", fontSize: "11px", color: "#4338CA", fontWeight: "700" }}>
                      [📁 Attach Local File]
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
                        style={{ display: "none" }}
                        onChange={handleFileUpload}
                      />
                    </label>
                  </Flex>
                  <Input
                    placeholder="https://... or paste link, or click 'Attach Local File'"
                    value={formData.url.startsWith("data:") ? "[File Attached: Ready to Upload]" : formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    required
                    borderRadius="xl"
                    h="42px"
                    fontSize="13px"
                  />
                </Box>
              </SimpleGrid>

              {/* Description */}
              <Box mb={5}>
                <Text fontSize="12px" fontWeight="700" color="#334155" mb={1.5}>
                  INSTRUCTIONS / SUMMARY FOR STUDENTS (OPTIONAL)
                </Text>
                <Textarea
                  rows={3}
                  placeholder="e.g. Read through pages 12-25 before our Thursday class. Download and solve the 10 practice questions at the end."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  borderRadius="xl"
                  fontSize="13px"
                />
              </Box>

              <Flex justify="flex-end" gap={2} direction={{ base: "column-reverse", sm: "row" }}>
                <Button variant="outline" borderRadius="xl" onClick={() => setIsFormOpen(false)} h="40px">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  bg="linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)"
                  color="white"
                  borderRadius="xl"
                  loading={saving}
                  _hover={{ opacity: 0.95 }}
                  h="40px"
                  fontWeight="700"
                >
                  <Icon as={FaCheck} mr={1.5} />
                  Publish for Class
                </Button>
              </Flex>
            </Box>
          </Box>
        )}

        {/* Filter Bar */}
        <Box bg="white" p={{ base: 3.5, sm: 4 }} borderRadius="2xl" border="1px solid #E2E8F0" mb={{ base: 5, md: 6 }}>
          <Flex wrap="wrap" gap={3} align="center">
            <Box minW={{ base: "100%", md: "260px" }} flex={1}>
              <Input
                placeholder="Search resources by title, subject, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                h="40px"
                borderRadius="xl"
                fontSize="13px"
              />
            </Box>

            <NativeSelect.Root size="sm" w={{ base: "100%", sm: "48%", md: "200px" }}>
              <NativeSelect.Field
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                borderRadius="xl"
                h="40px"
                fontSize="12.5px"
              >
                <option value="all">All Classes</option>
                <option value="global">All School (General)</option>
                {classArms.map((arm) => (
                  <option key={arm.id} value={arm.id}>
                    {arm.name}
                  </option>
                ))}
              </NativeSelect.Field>
            </NativeSelect.Root>

            <NativeSelect.Root size="sm" w={{ base: "100%", sm: "48%", md: "180px" }}>
              <NativeSelect.Field
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                borderRadius="xl"
                h="40px"
                fontSize="12.5px"
              >
                <option value="all">All Material Types</option>
                <option value="document">Documents / Notes</option>
                <option value="past_questions">Past Questions</option>
                <option value="video">Video Lectures</option>
                <option value="link">Web Links</option>
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Flex>
        </Box>

        {/* Resources Grid */}
        {loading ? (
          <Flex justify="center" align="center" h="200px" color="#64748B">
            Loading materials...
          </Flex>
        ) : filteredResources.length === 0 ? (
          <Box bg="white" p={12} borderRadius="2xl" textAlign="center" border="1px solid #E2E8F0">
            <Icon as={FaBook} boxSize={8} color="#94A3B8" mb={3} />
            <Text fontSize="16px" fontWeight="800" color="#0F172A">
              No Learning Materials Found
            </Text>
            <Text fontSize="13px" color="#64748B" mb={4}>
              Click &quot;Upload Study Material&quot; to share lecture slides, past exams, or notes with your classes.
            </Text>
            <Button
              size="sm"
              bg="#4338CA"
              color="white"
              borderRadius="xl"
              onClick={() => setIsFormOpen(true)}
            >
              <Icon as={FaPlus} mr={1.5} />
              Upload First Material
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            {filteredResources.map((item) => {
              const typeMeta = TYPE_CONFIG[item.type] || TYPE_CONFIG.document;
              const classArmName = item.ClassArm ? item.ClassArm.name : "All School (General)";

              return (
                <Box
                  key={item.id}
                  bg="white"
                  p={5}
                  borderRadius="2xl"
                  border="1px solid #E2E8F0"
                  display="flex"
                  flexDirection="column"
                  boxShadow="0 2px 10px rgba(0, 0, 0, 0.02)"
                  _hover={{ boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)", transform: "translateY(-2px)" }}
                  transition="all 0.2s ease"
                >
                  <Flex justify="space-between" align="flex-start" mb={3}>
                    <Flex
                      w="40px"
                      h="40px"
                      borderRadius="xl"
                      bg={typeMeta.bg}
                      color={typeMeta.color}
                      align="center"
                      justify="center"
                    >
                      <Icon as={typeMeta.icon} boxSize={4} />
                    </Flex>

                    <Button
                      size="xs"
                      variant="ghost"
                      color="#DC2626"
                      borderRadius="lg"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Icon as={FaTrash} boxSize={3} />
                    </Button>
                  </Flex>

                  <Text fontSize="15px" fontWeight="800" color="#0F172A" mb={1} lineClamp={2}>
                    {item.title}
                  </Text>

                  <HStack gap={1.5} wrap="wrap" mb={2.5}>
                    <Badge
                      bg={typeMeta.bg}
                      color={typeMeta.color}
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      fontSize="10px"
                      fontWeight="800"
                    >
                      {typeMeta.label}
                    </Badge>
                    <Badge
                      bg="#F1F5F9"
                      color="#475569"
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      fontSize="10px"
                      fontWeight="700"
                    >
                      {item.subject || "General"}
                    </Badge>
                    <Badge
                      bg={item.classArmId ? "#EEF2FF" : "#ECFDF5"}
                      color={item.classArmId ? "#4338CA" : "#065F46"}
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      fontSize="10px"
                      fontWeight="700"
                    >
                      {classArmName}
                    </Badge>
                  </HStack>

                  {item.description && (
                    <Text fontSize="12px" color="#64748B" mb={4} flex={1} lineClamp={3}>
                      {item.description}
                    </Text>
                  )}

                  <Flex gap={2} mt="auto" pt={3} borderTop="1px solid #F1F5F9" direction={{ base: "column", sm: "row" }}>
                    <Button
                      as="a"
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="sm"
                      flex={1}
                      h="36px"
                      bg="linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)"
                      color="white"
                      borderRadius="xl"
                      fontSize="12px"
                      fontWeight="700"
                      _hover={{ opacity: 0.95 }}
                      w={{ base: "100%", sm: "auto" }}
                    >
                      <Icon as={FaExternalLinkAlt} mr={1.5} boxSize={3} />
                      Open Resource
                    </Button>
                    <Button
                      as="a"
                      href={item.url}
                      download={item.title || "study-material"}
                      size="sm"
                      variant="outline"
                      h="36px"
                      borderRadius="xl"
                      fontSize="12px"
                      fontWeight="700"
                      w={{ base: "100%", sm: "auto" }}
                    >
                      <Icon as={FaDownload} mr={1} boxSize={3} />
                      Download
                    </Button>
                  </Flex>
                </Box>
              );
            })}
          </SimpleGrid>
        )}
      </Box>
    </DashboardLayout>
  );
}
