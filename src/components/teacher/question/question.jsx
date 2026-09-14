import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  VStack,
  Icon,
  Badge,
  NativeSelect,
  HStack,
  SimpleGrid,
  Textarea,
} from "@chakra-ui/react";
import {
  FaBookOpen,
  FaPlusCircle,
  FaTrash,
  FaCheckCircle,
  FaBrain,
  FaSearch,
  FaCamera,
  FaFileAlt,
  FaCloudUploadAlt,
  FaLightbulb,
  FaDownload,
  FaEye,
  FaEyeSlash,
  FaLayerGroup,
  FaPen,
  FaCheck,
  FaTimes,
  FaFilePdf,
  FaFileWord,
} from "react-icons/fa";
import { toaster } from "../../ui/toaster";
import {
  fetchQuestions,
  createSingleQuestion,
  bulkSaveQuestions,
  deleteQuestionById,
  parseDocumentQuestions,
  parseBulkTextWithAI,
} from "../../../api-endpoint/questions/questions";
import { TableSkeleton, CardGridSkeleton } from "../../ui/skeletons";

const SUBJECTS_LIST = [
  "All",
  "Mathematics",
  "English",
  "Biology",
  "Physics",
  "Chemistry",
  "Economics",
  "Government",
  "Agricultural Science",
  "Literature",
  "Commerce",
  "Accounting",
  "Yoruba",
  "Geography",
  "Civic Education",
  "CRK",
  "IRK",
];

export default function QuestionBankHub() {
  const [activeTab, setActiveTab] = useState("explorer"); // 'explorer' | 'ocr' | 'bulk' | 'single'

  // -------------------------------------------------------------
  // TAB 1: QUESTION BANK EXPLORER STATE (DUAL-SOURCING & AI HEALTH)
  // -------------------------------------------------------------
  const [explorerQuestions, setExplorerQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("all"); // 'all' | 'teacher' | 'api'
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [cognitiveFilter, setCognitiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedExplanations, setExpandedExplanations] = useState({});

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await fetchQuestions({
        source: sourceFilter,
        subject: subjectFilter === "All" ? "" : subjectFilter.toLowerCase(),
        difficulty: difficultyFilter === "all" ? "" : difficultyFilter,
        cognitiveLevel: cognitiveFilter === "all" ? "" : cognitiveFilter,
        search: searchTerm,
        page,
        limit: 12,
      });

      setExplorerQuestions(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.warn("Error loading questions:", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (activeTab === "explorer") {
      loadQuestions();
    }
  }, [activeTab, sourceFilter, subjectFilter, difficultyFilter, cognitiveFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadQuestions();
  };

  const toggleExplanation = (id) => {
    setExpandedExplanations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteQuestionById(id);
      toaster.create({
        title: "Question deleted successfully",
        type: "success",
      });
      loadQuestions();
    } catch (err) {
      toaster.create({
        title: "Failed to delete question",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    }
  };

  // -------------------------------------------------------------
  // TAB 2: AI DOCUMENT & PAPER SCANNER (PDF, DOCX, IMAGES) STATE
  // -------------------------------------------------------------
  const fileInputRef = useRef(null);
  const [selectedFileBase64, setSelectedFileBase64] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFileType, setSelectedFileType] = useState(""); // 'pdf' | 'doc' | 'image'
  const [selectedFileSize, setSelectedFileSize] = useState("");
  const [docSubject, setDocSubject] = useState("Mathematics");
  const [docLoading, setDocLoading] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState([]);
  const [savingQuestions, setSavingQuestions] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf" || lowerName.endsWith(".pdf");
    const isDoc =
      lowerName.endsWith(".docx") ||
      lowerName.endsWith(".doc") ||
      file.type.includes("wordprocessingml") ||
      file.type.includes("msword");

    if (!isImage && !isPdf && !isDoc) {
      toaster.create({
        title: "Unsupported file format",
        description: "Please select a PDF (.pdf), Word Document (.docx, .doc), or Image (.png, .jpg, .webp).",
        type: "warning",
      });
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toaster.create({
        title: "File exceeds 25MB limit",
        description: "Please upload an exam document or test sheet under 25MB.",
        type: "warning",
      });
      return;
    }

    setSelectedFileName(file.name);
    setSelectedFileType(isPdf ? "pdf" : isDoc ? "doc" : "image");
    setSelectedFileSize(
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(file.size / 1024)} KB`
    );

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (isImage) {
        // Compress large photo images in-browser to optimize payload
        const img = new Image();
        img.onload = () => {
          const maxDim = 1920;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.85);
          setSelectedFileBase64(compressed);
        };
        img.onerror = () => setSelectedFileBase64(result);
        img.src = result;
      } else {
        setSelectedFileBase64(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunExtraction = async () => {
    if (!selectedFileBase64) {
      toaster.create({
        title: "Please select a PDF, Word document, or image first",
        type: "warning",
      });
      return;
    }

    setDocLoading(true);
    try {
      const results = await parseDocumentQuestions({
        fileBase64: selectedFileBase64,
        mimeType:
          selectedFileType === "pdf"
            ? "application/pdf"
            : selectedFileType === "doc"
            ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            : "image/png",
        fileName: selectedFileName,
        defaultSubject: docSubject,
      });

      if (Array.isArray(results) && results.length > 0) {
        setExtractedQuestions(results);
        toaster.create({
          title: `AI successfully parsed and auto-solved ${results.length} question(s)!`,
          description: "All questions have been auto-categorized into curriculum topics and Bloom's taxonomy.",
          type: "success",
        });
      } else {
        toaster.create({
          title: "No questions detected in the uploaded file",
          description: "Ensure the document contains recognizable question statements and options.",
          type: "info",
        });
      }
    } catch (err) {
      toaster.create({
        title: "Document Extraction Notice",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setDocLoading(false);
    }
  };

  const handleSaveQuestions = async () => {
    if (!extractedQuestions.length) return;
    setSavingQuestions(true);
    try {
      const res = await bulkSaveQuestions({
        questions: extractedQuestions,
        defaultSubject: docSubject,
      });

      toaster.create({
        title: res.message || `Saved ${extractedQuestions.length} questions to Question Bank!`,
        type: "success",
      });
      setExtractedQuestions([]);
      setSelectedFileBase64("");
      setSelectedFileName("");
      setSelectedFileType("");
      setSelectedFileSize("");
      setActiveTab("explorer");
    } catch (err) {
      toaster.create({
        title: "Failed to save questions",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setSavingQuestions(false);
    }
  };

  // -------------------------------------------------------------
  // TAB 3: BULK TEXT & CSV UPLOAD STATE
  // -------------------------------------------------------------
  const [bulkRawText, setBulkRawText] = useState("");
  const [bulkSubject, setBulkSubject] = useState("Mathematics");
  const [bulkParsing, setBulkParsing] = useState(false);
  const [parsedBulkQuestions, setParsedBulkQuestions] = useState([]);
  const [savingBulk, setSavingBulk] = useState(false);
  const csvInputRef = useRef(null);

  const handleParseBulkText = async () => {
    if (!bulkRawText.trim()) {
      toaster.create({
        title: "Please paste your questions into the text area",
        type: "warning",
      });
      return;
    }

    setBulkParsing(true);
    try {
      const parsed = await parseBulkTextWithAI({
        rawText: bulkRawText,
        defaultSubject: bulkSubject,
      });

      if (Array.isArray(parsed) && parsed.length > 0) {
        setParsedBulkQuestions(parsed);
        toaster.create({
          title: `AI converted and auto-solved ${parsed.length} questions!`,
          type: "success",
        });
      } else {
        toaster.create({
          title: "Could not parse questions from the provided text",
          type: "warning",
        });
      }
    } catch (err) {
      toaster.create({
        title: "Bulk parse error",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setBulkParsing(false);
    }
  };

  const handleSaveBulkQuestions = async () => {
    if (!parsedBulkQuestions.length) return;
    setSavingBulk(true);
    try {
      const res = await bulkSaveQuestions({
        questions: parsedBulkQuestions,
        defaultSubject: bulkSubject,
      });

      toaster.create({
        title: res.message || `Saved ${parsedBulkQuestions.length} questions to Question Bank!`,
        type: "success",
      });
      setParsedBulkQuestions([]);
      setBulkRawText("");
      setActiveTab("explorer");
    } catch (err) {
      toaster.create({
        title: "Failed to save questions",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setSavingBulk(false);
    }
  };

  const handleDownloadCsvTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer,Explanation,Subject,Topic,Difficulty\n" +
      '"What is 15% of 200?","20","30","40","50","b","15% of 200 is 0.15 * 200 = 30","mathematics","Percentages","easy"\n' +
      '"Which organelle synthesizes ATP?","Ribosome","Mitochondria","Nucleus","Chloroplast","b","Mitochondria are the powerhouses of the cell producing ATP.","biology","Cell Biology","easy"';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "acesmart_question_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCsvFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== "string") return;

      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        toaster.create({ title: "CSV file is empty or missing data rows", type: "warning" });
        return;
      }

      const rows = lines.slice(1);
      const parsed = [];

      rows.forEach((row) => {
        // Basic CSV regex split
        const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        const clean = matches.map((m) => m.replace(/^"|"$/g, "").trim());

        if (clean.length >= 6) {
          parsed.push({
            questionText: clean[0],
            options: {
              a: clean[1] || "",
              b: clean[2] || "",
              c: clean[3] || "",
              d: clean[4] || "",
            },
            correctAnswer: (clean[5] || "a").toLowerCase(),
            explanation: clean[6] || "Standard curriculum explanation.",
            subject: clean[7] || bulkSubject,
            topic: clean[8] || "General Concepts",
            difficulty: clean[9] || "medium",
          });
        }
      });

      if (parsed.length > 0) {
        setParsedBulkQuestions(parsed);
        toaster.create({
          title: `Imported ${parsed.length} questions from CSV!`,
          type: "success",
        });
      } else {
        toaster.create({ title: "No valid rows found in CSV", type: "warning" });
      }
    };
    reader.readAsText(file);
  };

  // -------------------------------------------------------------
  // TAB 4: SINGLE QUESTION STATE
  // -------------------------------------------------------------
  const [singleQ, setSingleQ] = useState({
    questionText: "",
    options: { a: "", b: "", c: "", d: "" },
    correctAnswer: "a",
    explanation: "",
    subject: "Mathematics",
    topic: "",
    difficulty: "medium",
  });
  const [savingSingle, setSavingSingle] = useState(false);

  const handleSaveSingleQuestion = async (e) => {
    e.preventDefault();
    if (!singleQ.questionText.trim() || !singleQ.options.a || !singleQ.options.b) {
      toaster.create({
        title: "Please provide question text and at least options A and B",
        type: "warning",
      });
      return;
    }

    setSavingSingle(true);
    try {
      await createSingleQuestion(singleQ);
      toaster.create({
        title: "Question saved to Question Bank successfully!",
        type: "success",
      });
      setSingleQ({
        questionText: "",
        options: { a: "", b: "", c: "", d: "" },
        correctAnswer: "a",
        explanation: "",
        subject: singleQ.subject,
        topic: "",
        difficulty: "medium",
      });
      setActiveTab("explorer");
    } catch (err) {
      toaster.create({
        title: "Failed to save question",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setSavingSingle(false);
    }
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
        {/* Header Title */}
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
                w="42px"
                h="42px"
                borderRadius="xl"
                bg="purple.50"
                color="#6A1B9A"
                align="center"
                justify="center"
              >
                <Icon as={FaBookOpen} boxSize={5} />
              </Flex>
              <Text
                fontSize={{ base: "22px", md: "28px" }}
                fontWeight="800"
                color="#0F172A"
                fontFamily="'Outfit', sans-serif"
              >
                Question Bank Hub
              </Text>
            </Flex>
            <Text fontSize="14px" color="#64748B">
              Browse platform questions, extract from PDF/Word exam papers with AI, or upload bulk batches.
            </Text>
          </Box>

          <Flex gap={2} flexWrap="wrap">
            <Button
              size="sm"
              variant={activeTab === "explorer" ? "solid" : "outline"}
              bg={activeTab === "explorer" ? "#6A1B9A" : "white"}
              color={activeTab === "explorer" ? "white" : "#6A1B9A"}
              borderColor="#6A1B9A"
              borderRadius="xl"
              onClick={() => setActiveTab("explorer")}
            >
              <Icon as={FaLayerGroup} mr={1.5} />
              Question Bank ({totalCount})
            </Button>

            <Button
              size="sm"
              variant={activeTab === "ocr" ? "solid" : "outline"}
              bg={activeTab === "ocr" ? "#6A1B9A" : "white"}
              color={activeTab === "ocr" ? "white" : "#6A1B9A"}
              borderColor="#6A1B9A"
              borderRadius="xl"
              onClick={() => setActiveTab("ocr")}
            >
              <Icon as={FaFileAlt} mr={1.5} />
              AI Document & Paper Scanner (PDF, DOCX, Images)
            </Button>

            <Button
              size="sm"
              variant={activeTab === "bulk" ? "solid" : "outline"}
              bg={activeTab === "bulk" ? "#6A1B9A" : "white"}
              color={activeTab === "bulk" ? "white" : "#6A1B9A"}
              borderColor="#6A1B9A"
              borderRadius="xl"
              onClick={() => setActiveTab("bulk")}
            >
              <Icon as={FaCloudUploadAlt} mr={1.5} />
              Bulk Upload
            </Button>

            <Button
              size="sm"
              variant={activeTab === "single" ? "solid" : "outline"}
              bg={activeTab === "single" ? "#6A1B9A" : "white"}
              color={activeTab === "single" ? "white" : "#6A1B9A"}
              borderColor="#6A1B9A"
              borderRadius="xl"
              onClick={() => setActiveTab("single")}
            >
              <Icon as={FaPlusCircle} mr={1.5} />
              Add Single
            </Button>
          </Flex>
        </Flex>

        {/* ============================================================== */}
        {/* TAB 1: QUESTION BANK EXPLORER (DUAL SOURCING)                  */}
        {/* ============================================================== */}
        {activeTab === "explorer" && (
          <Box>

            {/* Filter & Search Toolbar */}
            <Box
              bg="white"
              p={{ base: 4, md: 5 }}
              borderRadius="2xl"
              border="1px solid"
              borderColor="gray.200"
              boxShadow="sm"
              mb={6}
            >
              <Flex
                direction={{ base: "column", xl: "row" }}
                gap={4}
                align={{ base: "stretch", xl: "center" }}
                justify="space-between"
              >
                {/* Source Segmented Control */}
                <HStack
                  bg="#F1F5F9"
                  p="3px"
                  borderRadius="xl"
                  w={{ base: "100%", xl: "auto" }}
                >
                  <Button
                    size="xs"
                    borderRadius="lg"
                    px={3}
                    py={2}
                    bg={sourceFilter === "all" ? "white" : "transparent"}
                    color={sourceFilter === "all" ? "#6A1B9A" : "#64748B"}
                    fontWeight={sourceFilter === "all" ? "700" : "500"}
                    boxShadow={sourceFilter === "all" ? "xs" : "none"}
                    onClick={() => {
                      setSourceFilter("all");
                      setPage(1);
                    }}
                  >
                    All Questions
                  </Button>
                  <Button
                    size="xs"
                    borderRadius="lg"
                    px={3}
                    py={2}
                    bg={sourceFilter === "teacher" ? "white" : "transparent"}
                    color={sourceFilter === "teacher" ? "#6A1B9A" : "#64748B"}
                    fontWeight={sourceFilter === "teacher" ? "700" : "500"}
                    boxShadow={sourceFilter === "teacher" ? "xs" : "none"}
                    onClick={() => {
                      setSourceFilter("teacher");
                      setPage(1);
                    }}
                  >
                    Teacher Uploaded
                  </Button>
                  <Button
                    size="xs"
                    borderRadius="lg"
                    px={3}
                    py={2}
                    bg={sourceFilter === "api" ? "white" : "transparent"}
                    color={sourceFilter === "api" ? "#6A1B9A" : "#64748B"}
                    fontWeight={sourceFilter === "api" ? "700" : "500"}
                    boxShadow={sourceFilter === "api" ? "xs" : "none"}
                    onClick={() => {
                      setSourceFilter("api");
                      setPage(1);
                    }}
                  >
                    Platform General Bank
                  </Button>
                </HStack>

                {/* Filter Controls & Search Box */}
                <Flex
                  gap={2.5}
                  direction={{ base: "column", md: "row" }}
                  flex={1}
                  flexWrap="wrap"
                >
                  {/* Subject */}
                  <Box minW="150px" flex={1}>
                    <NativeSelect.Root size="sm">
                      <NativeSelect.Field
                        value={subjectFilter}
                        onChange={(e) => {
                          setSubjectFilter(e.target.value);
                          setPage(1);
                        }}
                        borderRadius="xl"
                        borderColor="gray.200"
                        fontWeight="600"
                        color="#334155"
                      >
                        {SUBJECTS_LIST.map((s) => (
                          <option key={s} value={s}>
                            {s === "All" ? "All Subjects" : s}
                          </option>
                        ))}
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>

                  {/* Difficulty */}
                  <Box minW="130px">
                    <NativeSelect.Root size="sm">
                      <NativeSelect.Field
                        value={difficultyFilter}
                        onChange={(e) => {
                          setDifficultyFilter(e.target.value);
                          setPage(1);
                        }}
                        borderRadius="xl"
                        borderColor="gray.200"
                        fontWeight="600"
                        color="#334155"
                      >
                        <option value="all">All Difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>

                  {/* Cognitive Level */}
                  <Box minW="150px">
                    <NativeSelect.Root size="sm">
                      <NativeSelect.Field
                        value={cognitiveFilter}
                        onChange={(e) => {
                          setCognitiveFilter(e.target.value);
                          setPage(1);
                        }}
                        borderRadius="xl"
                        borderColor="gray.200"
                        fontWeight="600"
                        color="#334155"
                      >
                        <option value="all">All Bloom Levels</option>
                        <option value="Recall">Recall</option>
                        <option value="Comprehension">Comprehension</option>
                        <option value="Application">Application</option>
                        <option value="Analysis">Analysis</option>
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>

                  {/* Search */}
                  <form onSubmit={handleSearchSubmit} style={{ flex: 2, display: "flex", gap: "8px", minWidth: "180px" }}>
                    <Input
                      size="sm"
                      placeholder="Search question or topic..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      borderRadius="xl"
                      borderColor="gray.200"
                      bg="white"
                    />
                    <Button
                      size="sm"
                      type="submit"
                      bg="#6A1B9A"
                      color="white"
                      borderRadius="xl"
                      px={4}
                      _hover={{ bg: "#581c87" }}
                    >
                      <Icon as={FaSearch} />
                    </Button>
                  </form>
                </Flex>
              </Flex>
            </Box>

            {/* Questions Grid / Loading State */}
            {loadingQuestions ? (
              <CardGridSkeleton count={6} />
            ) : explorerQuestions.length === 0 ? (
              <Box
                bg="white"
                borderRadius="2xl"
                p={12}
                textAlign="center"
                border="1px solid"
                borderColor="gray.200"
              >
                <Icon as={FaBookOpen} boxSize={12} color="#CBD5E1" mb={3} />
                <Text fontSize="18px" fontWeight="700" color="#1E293B">
                  No questions found in this category
                </Text>
                <Text fontSize="14px" color="#64748B" maxW="450px" mx="auto" mt={1} mb={5}>
                  {sourceFilter === "teacher"
                    ? "You haven't uploaded any custom questions yet. Use AI Handwritten OCR or Bulk Upload to add your first batch!"
                    : "Try adjusting your subject filter or search keyword."}
                </Text>
                <Button
                  size="sm"
                  bg="#6A1B9A"
                  color="white"
                  borderRadius="xl"
                  onClick={() => setActiveTab("ocr")}
                >
                  <Icon as={FaCamera} mr={2} />
                  Scan Questions with AI
                </Button>
              </Box>
            ) : (
              <VStack gap={4} align="stretch">
                {explorerQuestions.map((q, idx) => {
                  const isExpanded = !!expandedExplanations[q.id];
                  const isTeacher = q.source === "teacher";
                  const opts = q.options || {};
                  const optionsEntries = Object.entries(opts);

                  return (
                    <Box
                      key={q.id || idx}
                      bg="white"
                      borderRadius="2xl"
                      p={{ base: 4, md: 5 }}
                      border="1px solid"
                      borderColor="gray.200"
                      boxShadow="xs"
                      transition="all 0.2s"
                      _hover={{ borderColor: "purple.300", boxShadow: "sm" }}
                    >
                      {/* Top Badges */}
                      <Flex justify="space-between" align="center" mb={3} flexWrap="wrap" gap={2}>
                        <HStack gap={2} flexWrap="wrap">
                          <Badge
                            bg={isTeacher ? "purple.50" : "blue.50"}
                            color={isTeacher ? "#6A1B9A" : "blue.700"}
                            border="1px solid"
                            borderColor={isTeacher ? "purple.200" : "blue.200"}
                            borderRadius="lg"
                            px={2.5}
                            py={0.5}
                            fontSize="11px"
                            fontWeight="700"
                          >
                            {isTeacher ? "Teacher Uploaded" : "Platform Bank"}
                          </Badge>

                          <Badge
                            bg="gray.100"
                            color="gray.700"
                            borderRadius="lg"
                            px={2}
                            py={0.5}
                            fontSize="11px"
                          >
                            {q.subject?.toUpperCase() || "GENERAL"}
                          </Badge>

                          {q.topic && (
                            <Badge
                              bg="purple.50"
                              color="#6A1B9A"
                              borderRadius="lg"
                              px={2}
                              py={0.5}
                              fontSize="11px"
                            >
                              {q.topic}
                            </Badge>
                          )}

                          <Badge
                            bg={
                              q.difficulty === "hard"
                                ? "red.50"
                                : q.difficulty === "easy"
                                ? "green.50"
                                : "amber.50"
                            }
                            color={
                              q.difficulty === "hard"
                                ? "red.700"
                                : q.difficulty === "easy"
                                ? "green.700"
                                : "amber.700"
                            }
                            borderRadius="lg"
                            px={2}
                            py={0.5}
                            fontSize="11px"
                          >
                            {q.difficulty || "medium"}
                          </Badge>

                          {q.cognitiveLevel && (
                            <Badge
                              bg="cyan.50"
                              color="cyan.800"
                              border="1px solid"
                              borderColor="cyan.200"
                              borderRadius="lg"
                              px={2}
                              py={0.5}
                              fontSize="11px"
                              fontWeight="600"
                            >
                              Bloom: {q.cognitiveLevel}
                            </Badge>
                          )}
                        </HStack>

                        {isTeacher && (
                          <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            color="red.600"
                            onClick={() => handleDeleteQuestion(q.id)}
                          >
                            <Icon as={FaTrash} mr={1} />
                            Delete
                          </Button>
                        )}
                      </Flex>

                      {/* Question Text */}
                      <Text
                        fontSize={{ base: "15px", md: "16px" }}
                        fontWeight="700"
                        color="#0F172A"
                        mb={4}
                        lineHeight="1.5"
                      >
                        {q.questionText || q.question}
                      </Text>

                      {/* Options Grid */}
                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={2.5} mb={3}>
                        {optionsEntries.map(([key, val]) => {
                          const isCorrect =
                            String(q.correctAnswer || "").toLowerCase() === String(key).toLowerCase();
                          return (
                            <Flex
                              key={key}
                              align="center"
                              gap={3}
                              p={2.5}
                              borderRadius="xl"
                              border="1px solid"
                              borderColor={isCorrect ? "green.300" : "gray.200"}
                              bg={isCorrect ? "green.50" : "#F8FAFC"}
                            >
                              <Flex
                                w="24px"
                                h="24px"
                                borderRadius="full"
                                bg={isCorrect ? "green.600" : "gray.200"}
                                color={isCorrect ? "white" : "gray.700"}
                                fontSize="12px"
                                fontWeight="800"
                                align="center"
                                justify="center"
                              >
                                {key.toUpperCase()}
                              </Flex>
                              <Text
                                fontSize="13px"
                                fontWeight={isCorrect ? "700" : "500"}
                                color={isCorrect ? "green.900" : "#334155"}
                                flex={1}
                              >
                                {val}
                              </Text>
                              {isCorrect && (
                                <Icon as={FaCheckCircle} color="green.600" boxSize={3.5} />
                              )}
                            </Flex>
                          );
                        })}
                      </SimpleGrid>

                      {/* AI Explanation Toggle & Content */}
                      <Box mt={3} pt={2.5} borderTop="1px dashed" borderColor="gray.200">
                        <Button
                          size="xs"
                          variant="ghost"
                          color="#6A1B9A"
                          fontWeight="700"
                          p={0}
                          onClick={() => toggleExplanation(q.id || idx)}
                        >
                          <Icon as={FaLightbulb} mr={1.5} color="amber.500" />
                          {isExpanded ? "Hide AI Explanation" : "View AI Explanation & Solution"}
                          <Icon as={isExpanded ? FaEyeSlash : FaEye} ml={1.5} />
                        </Button>

                        {isExpanded && (
                          <Box
                            mt={2.5}
                            p={3.5}
                            borderRadius="xl"
                            bg="purple.50"
                            border="1px solid"
                            borderColor="purple.200"
                          >
                            <Text fontSize="12px" fontWeight="700" color="#6A1B9A" mb={1}>
                              Pedagogical Explanation:
                            </Text>
                            <Text fontSize="13px" color="#334155" lineHeight="1.6">
                              {q.explanation ||
                                "Detailed pedagogical step-by-step solution derived from core curriculum taxonomy."}
                            </Text>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })}

                {/* Pagination Bar */}
                <Flex justify="space-between" align="center" mt={4} px={2}>
                  <Text fontSize="13px" color="#64748B">
                    Showing page {page} of {totalPages} ({totalCount} total)
                  </Text>
                  <HStack gap={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="xl"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="xl"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </HStack>
                </Flex>
              </VStack>
            )}
          </Box>
        )}

        {/* ============================================================== */}
        {/* TAB 2: AI DOCUMENT & PAPER SCANNER (PDF, DOCX, IMAGES)         */}
        {/* ============================================================== */}
        {activeTab === "ocr" && (
          <Box>
            <Box
              bg="white"
              p={{ base: 5, md: 6 }}
              borderRadius="2xl"
              border="1px solid"
              borderColor="gray.200"
              boxShadow="sm"
              mb={6}
            >
              <Flex align="center" gap={3} mb={3}>
                <Flex
                  w="42px"
                  h="42px"
                  borderRadius="xl"
                  bg="purple.50"
                  color="#6A1B9A"
                  align="center"
                  justify="center"
                >
                  <Icon as={FaFileAlt} boxSize={5} />
                </Flex>
                <Box>
                  <Text fontSize="17px" fontWeight="800" color="#0F172A">
                    AI Document & Paper Scanner (PDF, Word DOCX, & Images)
                  </Text>
                  <Text fontSize="13px" color="#64748B">
                    Upload digital exam papers (.pdf, .docx, .doc) or snap photos of handwritten test sheets. Gemini AI parses questions, solves correct answers, generates step-by-step explanations, and classifies them into the West African curriculum taxonomy.
                  </Text>
                </Box>
              </Flex>

              {/* Subject selector & File Dropzone */}
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} my={4}>
                <Box>
                  <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                    Target Subject / Course
                  </Text>
                  <NativeSelect.Root size="md">
                    <NativeSelect.Field
                      value={docSubject}
                      onChange={(e) => setDocSubject(e.target.value)}
                      borderRadius="xl"
                    >
                      {SUBJECTS_LIST.filter((s) => s !== "All").map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Box>

                <Box>
                  <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                    Select Exam Document or Test Sheet
                  </Text>
                  <input
                    type="file"
                    accept="application/pdf, .pdf, .docx, .doc, image/*, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                  />
                  <Button
                    w="100%"
                    variant="outline"
                    borderRadius="xl"
                    borderColor="purple.300"
                    color="#6A1B9A"
                    onClick={() => fileInputRef.current?.click()}
                    h="42px"
                  >
                    <Icon
                      as={
                        selectedFileType === "pdf"
                          ? FaFilePdf
                          : selectedFileType === "doc"
                          ? FaFileWord
                          : selectedFileType === "image"
                          ? FaCamera
                          : FaCloudUploadAlt
                      }
                      mr={2}
                      color={
                        selectedFileType === "pdf"
                          ? "red.500"
                          : selectedFileType === "doc"
                          ? "blue.500"
                          : "#6A1B9A"
                      }
                    />
                    {selectedFileName ? (
                      <Text as="span" isTruncated maxW="240px">
                        {selectedFileName}
                      </Text>
                    ) : (
                      "Choose PDF, Word (.docx), or Image"
                    )}
                  </Button>
                </Box>
              </SimpleGrid>

              {/* Document / Image Preview & Extraction Action */}
              {selectedFileBase64 && (
                <Box mt={4} p={4} borderRadius="xl" bg="#F8FAFC" border="1px solid" borderColor="gray.200">
                  <Flex justify="space-between" align="center" mb={3}>
                    <HStack gap={2}>
                      {selectedFileType === "pdf" && (
                        <Badge bg="red.50" color="red.700" px={2.5} py={1} borderRadius="md" fontWeight="700">
                          <Icon as={FaFilePdf} mr={1} /> PDF Document
                        </Badge>
                      )}
                      {selectedFileType === "doc" && (
                        <Badge bg="blue.50" color="blue.700" px={2.5} py={1} borderRadius="md" fontWeight="700">
                          <Icon as={FaFileWord} mr={1} /> Word Document
                        </Badge>
                      )}
                      {selectedFileType === "image" && (
                        <Badge bg="purple.50" color="purple.700" px={2.5} py={1} borderRadius="md" fontWeight="700">
                          <Icon as={FaCamera} mr={1} /> Exam Photo
                        </Badge>
                      )}
                      <Text fontSize="13px" fontWeight="700" color="#0F172A">
                        {selectedFileName} ({selectedFileSize})
                      </Text>
                    </HStack>
                    <Button
                      size="xs"
                      variant="ghost"
                      color="red.600"
                      onClick={() => {
                        setSelectedFileBase64("");
                        setSelectedFileName("");
                        setSelectedFileType("");
                        setSelectedFileSize("");
                      }}
                    >
                      <Icon as={FaTimes} mr={1} />
                      Remove
                    </Button>
                  </Flex>

                  {/* Format-specific preview box */}
                  {selectedFileType === "image" ? (
                    <Box maxH="260px" overflow="hidden" borderRadius="lg" mb={4} textAlign="center">
                      <img
                        src={selectedFileBase64}
                        alt="Uploaded Exam Sheet"
                        style={{ maxHeight: "250px", margin: "0 auto", borderRadius: "8px", objectFit: "contain" }}
                      />
                    </Box>
                  ) : selectedFileType === "pdf" ? (
                    <Box
                      p={5}
                      borderRadius="xl"
                      bg="red.50"
                      border="1px dashed"
                      borderColor="red.300"
                      mb={4}
                      textAlign="center"
                    >
                      <Icon as={FaFilePdf} boxSize={10} color="red.600" mb={2} />
                      <Text fontSize="14px" fontWeight="800" color="red.800">
                        {selectedFileName}
                      </Text>
                      <Text fontSize="12px" color="red.600" mt={1}>
                        Gemini native visual PDF engine will parse diagrams, formulas, equations, and multi-choice questions directly from the document.
                      </Text>
                    </Box>
                  ) : (
                    <Box
                      p={5}
                      borderRadius="xl"
                      bg="blue.50"
                      border="1px dashed"
                      borderColor="blue.300"
                      mb={4}
                      textAlign="center"
                    >
                      <Icon as={FaFileWord} boxSize={10} color="blue.600" mb={2} />
                      <Text fontSize="14px" fontWeight="800" color="blue.800">
                        {selectedFileName}
                      </Text>
                      <Text fontSize="12px" color="blue.600" mt={1}>
                        OpenXML decompression will extract clean text, tables, and question statements for AI solving and curriculum categorization.
                      </Text>
                    </Box>
                  )}

                  <Button
                    w="100%"
                    bg="#6A1B9A"
                    color="white"
                    borderRadius="xl"
                    h="46px"
                    fontWeight="700"
                    onClick={handleRunExtraction}
                    loading={docLoading}
                    loadingText="Gemini AI is parsing document, solving & auto-classifying..."
                    _hover={{ bg: "#53127a" }}
                  >
                    <Icon as={FaBrain} mr={2} />
                    Parse Document & Auto-Solve Questions
                  </Button>
                </Box>
              )}
            </Box>

            {/* Extracted Questions Review & Save Workspace */}
            {extractedQuestions.length > 0 && (
              <Box>
                <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={3}>
                  <Box>
                    <Text fontSize="18px" fontWeight="800" color="#0F172A">
                      Extracted & Auto-Solved Questions ({extractedQuestions.length})
                    </Text>
                    <Text fontSize="12px" color="#64748B">
                      Review answers, topics, and explanations before saving to your Question Bank.
                    </Text>
                  </Box>
                  <Button
                    bg="#6A1B9A"
                    color="white"
                    borderRadius="xl"
                    px={5}
                    fontWeight="700"
                    onClick={handleSaveQuestions}
                    loading={savingQuestions}
                    loadingText="Saving to Question Bank..."
                  >
                    <Icon as={FaCheck} mr={2} />
                    Save All to Question Bank
                  </Button>
                </Flex>

                <VStack gap={4} align="stretch">
                  {extractedQuestions.map((q, idx) => (
                    <Box
                      key={idx}
                      bg="white"
                      borderRadius="2xl"
                      p={5}
                      border="1px solid"
                      borderColor="purple.200"
                      boxShadow="xs"
                    >
                      <Flex justify="space-between" align="center" mb={3} flexWrap="wrap" gap={2}>
                        <HStack gap={2} flexWrap="wrap">
                          <Badge bg="purple.50" color="#6A1B9A" borderRadius="md" px={2} py={0.5} fontWeight="700">
                            Question {idx + 1}
                          </Badge>
                          {q.topic && (
                            <Badge bg="blue.50" color="blue.700" borderRadius="md" px={2} py={0.5}>
                              Topic: {q.topic}
                            </Badge>
                          )}
                          <Badge
                            bg={
                              q.difficulty === "easy"
                                ? "green.50"
                                : q.difficulty === "hard"
                                ? "red.50"
                                : "yellow.50"
                            }
                            color={
                              q.difficulty === "easy"
                                ? "green.700"
                                : q.difficulty === "hard"
                                ? "red.700"
                                : "yellow.800"
                            }
                            borderRadius="md"
                            px={2}
                            py={0.5}
                          >
                            {q.difficulty || "medium"}
                          </Badge>
                          <Badge bg="cyan.50" color="cyan.800" borderRadius="md" px={2} py={0.5}>
                            {q.cognitiveLevel || "Application"}
                          </Badge>
                          <Badge bg="green.50" color="green.700" borderRadius="md" px={2.5} py={0.5} fontWeight="700">
                            Solved Answer: Option {q.correctAnswer?.toUpperCase()}
                          </Badge>
                        </HStack>

                        <Button
                          size="xs"
                          variant="ghost"
                          color="red.600"
                          onClick={() => {
                            const updated = extractedQuestions.filter((_, i) => i !== idx);
                            setExtractedQuestions(updated);
                          }}
                        >
                          <Icon as={FaTrash} mr={1} />
                          Remove
                        </Button>
                      </Flex>

                      <Textarea
                        value={q.questionText}
                        onChange={(e) => {
                          const updated = [...extractedQuestions];
                          updated[idx].questionText = e.target.value;
                          setExtractedQuestions(updated);
                        }}
                        size="sm"
                        borderRadius="xl"
                        mb={3}
                        rows={2}
                      />

                      {/* Taxonomy fields: Topic, Difficulty, Cognitive Level */}
                      <SimpleGrid columns={{ base: 1, md: 3 }} gap={2} mb={3}>
                        <Box>
                          <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
                            Curriculum Topic
                          </Text>
                          <Input
                            size="xs"
                            borderRadius="lg"
                            value={q.topic || ""}
                            placeholder="e.g. Photosynthesis"
                            onChange={(e) => {
                              const updated = [...extractedQuestions];
                              updated[idx].topic = e.target.value;
                              setExtractedQuestions(updated);
                            }}
                          />
                        </Box>
                        <Box>
                          <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
                            Difficulty
                          </Text>
                          <NativeSelect.Root size="xs">
                            <NativeSelect.Field
                              value={q.difficulty || "medium"}
                              borderRadius="lg"
                              onChange={(e) => {
                                const updated = [...extractedQuestions];
                                updated[idx].difficulty = e.target.value;
                                setExtractedQuestions(updated);
                              }}
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </NativeSelect.Field>
                          </NativeSelect.Root>
                        </Box>
                        <Box>
                          <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
                            Bloom Cognitive Level
                          </Text>
                          <NativeSelect.Root size="xs">
                            <NativeSelect.Field
                              value={q.cognitiveLevel || "Application"}
                              borderRadius="lg"
                              onChange={(e) => {
                                const updated = [...extractedQuestions];
                                updated[idx].cognitiveLevel = e.target.value;
                                setExtractedQuestions(updated);
                              }}
                            >
                              <option value="Recall">Recall</option>
                              <option value="Comprehension">Comprehension</option>
                              <option value="Application">Application</option>
                              <option value="Analysis">Analysis</option>
                            </NativeSelect.Field>
                          </NativeSelect.Root>
                        </Box>
                      </SimpleGrid>

                      {/* Options A - D */}
                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={2} mb={3}>
                        {["a", "b", "c", "d"].map((optKey) => (
                          <Flex key={optKey} align="center" gap={2}>
                            <Button
                              size="xs"
                              w="28px"
                              h="28px"
                              minW="28px"
                              borderRadius="full"
                              p={0}
                              bg={q.correctAnswer === optKey ? "green.600" : "gray.200"}
                              color={q.correctAnswer === optKey ? "white" : "gray.700"}
                              _hover={{ bg: q.correctAnswer === optKey ? "green.700" : "gray.300" }}
                              title="Click to mark as correct answer"
                              onClick={() => {
                                const updated = [...extractedQuestions];
                                updated[idx].correctAnswer = optKey;
                                setExtractedQuestions(updated);
                              }}
                            >
                              {optKey.toUpperCase()}
                            </Button>
                            <Input
                              size="xs"
                              borderRadius="lg"
                              value={q.options?.[optKey] || ""}
                              onChange={(e) => {
                                const updated = [...extractedQuestions];
                                if (!updated[idx].options) updated[idx].options = {};
                                updated[idx].options[optKey] = e.target.value;
                                setExtractedQuestions(updated);
                              }}
                            />
                          </Flex>
                        ))}
                      </SimpleGrid>

                      {/* Step-by-Step Explanation */}
                      <Box bg="purple.50" p={3} borderRadius="xl" border="1px solid" borderColor="purple.200">
                        <Text fontSize="12px" fontWeight="700" color="#6A1B9A" mb={1}>
                          AI Step-by-Step Pedagogical Explanation:
                        </Text>
                        <Textarea
                          value={q.explanation || ""}
                          onChange={(e) => {
                            const updated = [...extractedQuestions];
                            updated[idx].explanation = e.target.value;
                            setExtractedQuestions(updated);
                          }}
                          size="xs"
                          borderRadius="lg"
                          bg="white"
                          rows={2}
                        />
                      </Box>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}
          </Box>
        )}

        {/* ============================================================== */}
        {/* TAB 3: BULK TEXT & CSV UPLOAD                                  */}
        {/* ============================================================== */}
        {activeTab === "bulk" && (
          <Box>
            <Box
              bg="white"
              p={{ base: 5, md: 6 }}
              borderRadius="2xl"
              border="1px solid"
              borderColor="gray.200"
              boxShadow="sm"
              mb={6}
            >
              <Flex align="center" justify="space-between" mb={4} flexWrap="wrap" gap={3}>
                <Flex align="center" gap={3}>
                  <Flex
                    w="36px"
                    h="36px"
                    borderRadius="xl"
                    bg="purple.50"
                    color="#6A1B9A"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FaCloudUploadAlt} boxSize={5} />
                  </Flex>
                  <Box>
                    <Text fontSize="17px" fontWeight="800" color="#0F172A">
                      Bulk Question Batch Upload
                    </Text>
                    <Text fontSize="13px" color="#64748B">
                      Paste dozens of questions at once or upload a CSV spreadsheet.
                    </Text>
                  </Box>
                </Flex>

                <HStack gap={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    borderRadius="xl"
                    onClick={handleDownloadCsvTemplate}
                  >
                    <Icon as={FaDownload} mr={1.5} />
                    Download CSV Template
                  </Button>

                  <input
                    type="file"
                    accept=".csv"
                    ref={csvInputRef}
                    style={{ display: "none" }}
                    onChange={handleCsvFileUpload}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="purple.300"
                    color="#6A1B9A"
                    borderRadius="xl"
                    onClick={() => csvInputRef.current?.click()}
                  >
                    <Icon as={FaFileAlt} mr={1.5} />
                    Import CSV File
                  </Button>
                </HStack>
              </Flex>

              <Box mb={4}>
                <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                  Default Subject
                </Text>
                <NativeSelect.Root size="sm" maxW="280px">
                  <NativeSelect.Field
                    value={bulkSubject}
                    onChange={(e) => setBulkSubject(e.target.value)}
                    borderRadius="xl"
                  >
                    {SUBJECTS_LIST.filter((s) => s !== "All").map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Box>

              <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                Paste Questions in Any Format (Text, Word, or Past Papers):
              </Text>
              <Textarea
                rows={7}
                placeholder={`Example:
1. What is the derivative of x^3?
A) 3x^2
B) x^2
C) 3x
D) 2x
Ans: A
Exp: By the power rule, d/dx(x^n) = n*x^(n-1).

2. What is the SI unit of electric current?
A) Volt
B) Ampere
C) Ohm
D) Joule
(No answer needed - AI will solve it automatically!)`}
                value={bulkRawText}
                onChange={(e) => setBulkRawText(e.target.value)}
                borderRadius="xl"
                fontSize="13px"
                fontFamily="monospace"
                mb={4}
              />

              <Button
                bg="#6A1B9A"
                color="white"
                borderRadius="xl"
                h="44px"
                fontWeight="700"
                onClick={handleParseBulkText}
                loading={bulkParsing}
                loadingText="AI is parsing, solving, and generating explanations..."
                _hover={{ bg: "#53127a" }}
              >
                <Icon as={FaBrain} mr={2} />
                AI Parse & Auto-Solve Questions
              </Button>
            </Box>

            {/* Parsed Questions Preview */}
            {parsedBulkQuestions.length > 0 && (
              <Box>
                <Flex justify="space-between" align="center" mb={4}>
                  <Text fontSize="18px" fontWeight="800" color="#0F172A">
                    Ready to Save ({parsedBulkQuestions.length} Questions)
                  </Text>
                  <Button
                    bg="#6A1B9A"
                    color="white"
                    borderRadius="xl"
                    px={5}
                    fontWeight="700"
                    onClick={handleSaveBulkQuestions}
                    loading={savingBulk}
                    loadingText="Saving to DB..."
                  >
                    <Icon as={FaCheck} mr={2} />
                    Save All to Question Bank
                  </Button>
                </Flex>

                <VStack gap={4} align="stretch">
                  {parsedBulkQuestions.map((q, idx) => (
                    <Box
                      key={idx}
                      bg="white"
                      borderRadius="2xl"
                      p={5}
                      border="1px solid"
                      borderColor="gray.200"
                    >
                      <Flex justify="space-between" align="center" mb={2}>
                        <Badge bg="purple.50" color="#6A1B9A" borderRadius="md" px={2} py={0.5}>
                          Question {idx + 1}
                        </Badge>
                        <Badge bg="green.50" color="green.700" borderRadius="md" px={2} py={0.5}>
                          Correct Answer: Option {q.correctAnswer?.toUpperCase()}
                        </Badge>
                      </Flex>

                      <Text fontSize="15px" fontWeight="700" color="#0F172A" mb={3}>
                        {q.questionText}
                      </Text>

                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={2} mb={3}>
                        {Object.entries(q.options || {}).map(([optKey, val]) => (
                          <Flex
                            key={optKey}
                            align="center"
                            gap={2.5}
                            p={2}
                            borderRadius="lg"
                            bg={q.correctAnswer === optKey ? "green.50" : "#F8FAFC"}
                            border="1px solid"
                            borderColor={q.correctAnswer === optKey ? "green.300" : "gray.200"}
                          >
                            <Flex
                              w="22px"
                              h="22px"
                              borderRadius="full"
                              bg={q.correctAnswer === optKey ? "green.600" : "gray.200"}
                              color={q.correctAnswer === optKey ? "white" : "gray.700"}
                              fontSize="11px"
                              fontWeight="800"
                              align="center"
                              justify="center"
                            >
                              {optKey.toUpperCase()}
                            </Flex>
                            <Text fontSize="13px">{val}</Text>
                          </Flex>
                        ))}
                      </SimpleGrid>

                      <Box bg="purple.50" p={3} borderRadius="xl" border="1px solid" borderColor="purple.200">
                        <Text fontSize="12px" fontWeight="700" color="#6A1B9A" mb={1}>
                          AI Explanation:
                        </Text>
                        <Text fontSize="13px" color="#334155">
                          {q.explanation}
                        </Text>
                      </Box>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}
          </Box>
        )}

        {/* ============================================================== */}
        {/* TAB 4: SINGLE QUESTION AUTHORING                               */}
        {/* ============================================================== */}
        {activeTab === "single" && (
          <Box
            as="form"
            onSubmit={handleSaveSingleQuestion}
            bg="white"
            p={{ base: 5, md: 7 }}
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.200"
            boxShadow="sm"
          >
            <Text fontSize="18px" fontWeight="800" color="#0F172A" mb={4}>
              Author a Custom Single Question
            </Text>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={4}>
              <Box>
                <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                  Subject
                </Text>
                <NativeSelect.Root size="sm">
                  <NativeSelect.Field
                    value={singleQ.subject}
                    onChange={(e) => setSingleQ({ ...singleQ, subject: e.target.value })}
                    borderRadius="xl"
                  >
                    {SUBJECTS_LIST.filter((s) => s !== "All").map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Box>

              <Box>
                <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                  Topic / Subtopic
                </Text>
                <Input
                  size="sm"
                  placeholder="e.g. Organic Chemistry"
                  value={singleQ.topic}
                  onChange={(e) => setSingleQ({ ...singleQ, topic: e.target.value })}
                  borderRadius="xl"
                />
              </Box>

              <Box>
                <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                  Difficulty Level
                </Text>
                <NativeSelect.Root size="sm">
                  <NativeSelect.Field
                    value={singleQ.difficulty}
                    onChange={(e) => setSingleQ({ ...singleQ, difficulty: e.target.value })}
                    borderRadius="xl"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Box>
            </SimpleGrid>

            <Box mb={4}>
              <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                Question Statement
              </Text>
              <Textarea
                rows={3}
                placeholder="Enter question text here..."
                value={singleQ.questionText}
                onChange={(e) => setSingleQ({ ...singleQ, questionText: e.target.value })}
                borderRadius="xl"
              />
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} mb={4}>
              {["a", "b", "c", "d"].map((optKey) => (
                <Box key={optKey}>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                    Option {optKey.toUpperCase()}
                  </Text>
                  <Input
                    size="sm"
                    placeholder={`Option ${optKey.toUpperCase()}`}
                    value={singleQ.options[optKey]}
                    onChange={(e) =>
                      setSingleQ({
                        ...singleQ,
                        options: { ...singleQ.options, [optKey]: e.target.value },
                      })
                    }
                    borderRadius="xl"
                  />
                </Box>
              ))}
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={5}>
              <Box>
                <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                  Correct Answer Option
                </Text>
                <NativeSelect.Root size="sm">
                  <NativeSelect.Field
                    value={singleQ.correctAnswer}
                    onChange={(e) => setSingleQ({ ...singleQ, correctAnswer: e.target.value })}
                    borderRadius="xl"
                  >
                    <option value="a">Option A</option>
                    <option value="b">Option B</option>
                    <option value="c">Option C</option>
                    <option value="d">Option D</option>
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Box>

              <Box>
                <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                  Explanation & Educational Solution
                </Text>
                <Textarea
                  size="sm"
                  rows={2}
                  placeholder="Explain why the answer is correct for candidates to review..."
                  value={singleQ.explanation}
                  onChange={(e) => setSingleQ({ ...singleQ, explanation: e.target.value })}
                  borderRadius="xl"
                />
              </Box>
            </SimpleGrid>

            <Button
              type="submit"
              bg="#6A1B9A"
              color="white"
              borderRadius="xl"
              px={6}
              h="42px"
              fontWeight="700"
              loading={savingSingle}
              loadingText="Saving..."
              _hover={{ bg: "#53127a" }}
            >
              <Icon as={FaCheck} mr={2} />
              Save Question to Bank
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
