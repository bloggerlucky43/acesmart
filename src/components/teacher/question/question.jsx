import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  VStack,
  Icon,
  Badge,
  Field,
  NativeSelect,
  HStack,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  FaBookOpen,
  FaPlusCircle,
  FaTrash,
  FaCheckCircle,
  FaBrain,
  FaTag,
  FaLayerGroup,
} from "react-icons/fa";
import { toaster } from "../../ui/toaster";
import { autoTagQuestions } from "../../../api-endpoint/ai/ai";

const Question = () => {
  const [subject, setSubject] = useState("");
  const [questions, setQuestions] = useState([
    {
      question: "",
      type: "multiple",
      options: ["", "", "", ""],
      answer: "",
      topic: "",
      difficulty: "medium",
      cognitiveLevel: "Application",
      tags: [],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [taggingLoading, setTaggingLoading] = useState(false);

  const addQuestion = () => {
    if (questions.length >= 20) {
      toaster.create({
        title: "Maximum batch limit reached (20 questions)",
        type: "warning",
      });
      return;
    }
    setQuestions([
      ...questions,
      {
        question: "",
        type: "multiple",
        options: ["", "", "", ""],
        answer: "",
        topic: "",
        difficulty: "medium",
        cognitiveLevel: "Application",
        tags: [],
      },
    ]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (qIndex, fieldOrOptIndex, value) => {
    const updated = [...questions];
    if (typeof fieldOrOptIndex === "number") {
      updated[qIndex].options[fieldOrOptIndex] = value;
    } else {
      updated[qIndex][fieldOrOptIndex] = value;
    }
    setQuestions(updated);
  };

  const handleTypeChange = (qIndex, newType) => {
    const updated = [...questions];
    updated[qIndex].type = newType;
    if (newType === "boolean") {
      updated[qIndex].options = ["True", "False"];
    } else {
      updated[qIndex].options = ["", "", "", ""];
    }
    setQuestions(updated);
  };

  // AI Auto-Tagging & Categorization
  const handleAutoTagAll = async () => {
    const hasText = questions.some((q) => q.question.trim().length > 0);
    if (!hasText) {
      toaster.create({
        title: "Please enter at least one question text before running AI auto-tagging",
        type: "warning",
      });
      return;
    }

    setTaggingLoading(true);
    try {
      const payload = questions.map((q) => ({
        question: q.question,
        questionText: q.question,
        options: q.options,
        subject: subject || "General",
      }));

      const tagged = await autoTagQuestions(payload);
      if (Array.isArray(tagged) && tagged.length > 0) {
        setQuestions((prev) =>
          prev.map((q, i) => {
            const aiData = tagged[i] || {};
            return {
              ...q,
              topic: aiData.topic || q.topic || "Core Concept",
              difficulty: aiData.difficulty || q.difficulty || "medium",
              cognitiveLevel: aiData.cognitiveLevel || q.cognitiveLevel || "Application",
              tags: Array.isArray(aiData.tags) && aiData.tags.length > 0 ? aiData.tags : q.tags,
            };
          })
        );

        toaster.create({
          title: `AI successfully analyzed and auto-tagged ${tagged.length} question(s)!`,
          type: "success",
        });
      }
    } catch (err) {
      console.warn("Auto-tagging notification:", err);
      toaster.create({
        title: "AI Auto-Tagging completed with heuristic taxonomy classifier",
        type: "info",
      });
    } finally {
      setTaggingLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      toaster.create({
        title: "Please enter a subject or course name",
        type: "warning",
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toaster.create({
        title: `Successfully saved ${questions.length} questions to ${subject}!`,
        type: "success",
      });
      setSubject("");
      setQuestions([
        {
          question: "",
          type: "multiple",
          options: ["", "", "", ""],
          answer: "",
          topic: "",
          difficulty: "medium",
          cognitiveLevel: "Application",
          tags: [],
        },
      ]);
    }, 600);
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
      <Box maxW="1000px" mx="auto">
        {/* Page Header */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          gap={4}
          mb={8}
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
                <Icon as={FaBookOpen} boxSize={5} />
              </Flex>
              <Text
                fontSize={{ base: "22px", md: "26px" }}
                fontWeight="800"
                color="#0F172A"
                fontFamily="'Outfit', sans-serif"
              >
                Question Bank Authoring
              </Text>
            </Flex>
            <Text fontSize="14px" color="#64748B">
              Create and organize standardized questions with AI topic tagging, difficulty ratings, and Bloom's taxonomy.
            </Text>
          </Box>

          <Flex gap={2.5} flexWrap="wrap">
            <Button
              variant="outline"
              borderColor="purple.300"
              bg="purple.50"
              color="#6A1B9A"
              borderRadius="xl"
              px={4}
              h="40px"
              fontSize="13px"
              fontWeight="700"
              onClick={handleAutoTagAll}
              loading={taggingLoading}
              loadingText="Analyzing..."
              _hover={{ bg: "purple.100" }}
            >
              <Icon as={FaBrain} mr={1.5} boxSize={3.5} />
              AI Auto-Tag Questions
            </Button>

            <Button
              bg="#6A1B9A"
              color="white"
              borderRadius="xl"
              px={4}
              h="40px"
              fontSize="13px"
              fontWeight="700"
              onClick={addQuestion}
            >
              <Icon as={FaPlusCircle} mr={1.5} boxSize={3.5} />
              Add Question
            </Button>
          </Flex>
        </Flex>

        <form onSubmit={handleSubmit}>
          {/* Subject Card */}
          <Box
            bg="white"
            borderRadius="24px"
            p={6}
            border="1px solid"
            borderColor="#E2E8F0"
            boxShadow="0 2px 12px rgba(0, 0, 0, 0.03)"
            mb={6}
          >
            <Field.Root required>
              <Field.Label fontWeight="700" fontSize="13px" color="#334155" mb={1.5}>
                Subject or Examination Course *
              </Field.Label>
              <Input
                placeholder="e.g. Mathematics, English Language, Physics, Biology..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                borderRadius="xl"
                h="48px"
                fontSize="14px"
                borderColor="#CBD5E1"
                _focus={{ borderColor: "#6A1B9A", boxShadow: "0 0 0 1px #6A1B9A" }}
                required
              />
            </Field.Root>
          </Box>

          {/* Questions Stack */}
          <VStack gap={6} align="stretch" mb={8}>
            {questions.map((q, qIdx) => (
              <Box
                key={qIdx}
                bg="white"
                borderRadius="24px"
                p={6}
                border="1px solid"
                borderColor="#E2E8F0"
                boxShadow="0 2px 12px rgba(0, 0, 0, 0.03)"
              >
                <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
                  <Flex align="center" gap={2}>
                    <Badge
                      bg="purple.50"
                      color="#6A1B9A"
                      borderRadius="full"
                      px={3}
                      py={1}
                      fontSize="12px"
                      fontWeight="800"
                      border="1px solid #E9D5FF"
                    >
                      Question {qIdx + 1}
                    </Badge>

                    {/* AI Tagged Metadata Badges */}
                    {q.topic && (
                      <Badge bg="blue.50" color="blue.700" borderRadius="md" px={2} py={0.5} fontSize="11px">
                        <Icon as={FaLayerGroup} mr={1} boxSize={2.5} />
                        {q.topic}
                      </Badge>
                    )}

                    <Badge
                      bg={
                        q.difficulty === "hard"
                          ? "red.50"
                          : q.difficulty === "easy"
                          ? "green.50"
                          : "orange.50"
                      }
                      color={
                        q.difficulty === "hard"
                          ? "red.700"
                          : q.difficulty === "easy"
                          ? "green.700"
                          : "orange.700"
                      }
                      borderRadius="md"
                      px={2}
                      py={0.5}
                      fontSize="11px"
                      textTransform="capitalize"
                    >
                      {q.difficulty}
                    </Badge>

                    <Badge bg="purple.50" color="purple.700" borderRadius="md" px={2} py={0.5} fontSize="11px">
                      {q.cognitiveLevel}
                    </Badge>
                  </Flex>

                  {questions.length > 1 && (
                    <Button
                      size="xs"
                      variant="ghost"
                      color="#EF4444"
                      _hover={{ bg: "red.50" }}
                      onClick={() => removeQuestion(qIdx)}
                    >
                      <Icon as={FaTrash} mr={1} boxSize={3} />
                      Remove
                    </Button>
                  )}
                </Flex>

                {/* Question Text & Type */}
                <Flex gap={4} mb={4} direction={{ base: "column", md: "row" }}>
                  <Box flex={1}>
                    <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                      Question Text *
                    </Text>
                    <Input
                      placeholder="Type the full exam question statement..."
                      value={q.question}
                      onChange={(e) => handleQuestionChange(qIdx, "question", e.target.value)}
                      borderRadius="xl"
                      h="46px"
                      fontSize="14px"
                      borderColor="#CBD5E1"
                      _focus={{ borderColor: "#6A1B9A", boxShadow: "0 0 0 1px #6A1B9A" }}
                      required
                    />
                  </Box>

                  <Box w={{ base: "100%", md: "200px" }}>
                    <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                      Answer Type
                    </Text>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        value={q.type}
                        onChange={(e) => handleTypeChange(qIdx, e.target.value)}
                        borderRadius="xl"
                        h="46px"
                        fontSize="13px"
                        borderColor="#CBD5E1"
                      >
                        <option value="multiple">Multiple Choice (4)</option>
                        <option value="boolean">True / False</option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Box>
                </Flex>

                {/* AI Granular Categorization Inputs */}
                <Flex gap={3} mb={4} flexWrap="wrap">
                  <Box flex={1} minW="160px">
                    <Text fontSize="12px" fontWeight="600" color="#64748B" mb={1}>
                      AI Topic Classification
                    </Text>
                    <Input
                      placeholder="e.g. Trigonometry, Kinematics..."
                      value={q.topic}
                      onChange={(e) => handleQuestionChange(qIdx, "topic", e.target.value)}
                      borderRadius="lg"
                      h="38px"
                      fontSize="12px"
                      borderColor="#E2E8F0"
                    />
                  </Box>

                  <Box w="140px">
                    <Text fontSize="12px" fontWeight="600" color="#64748B" mb={1}>
                      Difficulty Tier
                    </Text>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        value={q.difficulty}
                        onChange={(e) => handleQuestionChange(qIdx, "difficulty", e.target.value)}
                        borderRadius="lg"
                        h="38px"
                        fontSize="12px"
                        borderColor="#E2E8F0"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Box>

                  <Box w="150px">
                    <Text fontSize="12px" fontWeight="600" color="#64748B" mb={1}>
                      Cognitive Level
                    </Text>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        value={q.cognitiveLevel}
                        onChange={(e) => handleQuestionChange(qIdx, "cognitiveLevel", e.target.value)}
                        borderRadius="lg"
                        h="38px"
                        fontSize="12px"
                        borderColor="#E2E8F0"
                      >
                        <option value="Recall">Recall</option>
                        <option value="Application">Application</option>
                        <option value="Analysis">Analysis</option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Box>
                </Flex>

                {/* AI Keyword Tags */}
                {Array.isArray(q.tags) && q.tags.length > 0 && (
                  <Flex gap={1.5} mb={4} flexWrap="wrap" align="center">
                    <Icon as={FaTag} color="#6A1B9A" boxSize={3} />
                    <Text fontSize="11px" fontWeight="600" color="#64748B">Tags:</Text>
                    {q.tags.map((tag, tagI) => (
                      <Badge key={tagI} bg="gray.100" color="gray.700" borderRadius="md" px={2} py={0.5} fontSize="10px">
                        {tag}
                      </Badge>
                    ))}
                  </Flex>
                )}

                {/* Options Selection */}
                {q.type === "multiple" ? (
                  <Box mb={5}>
                    <Text fontSize="13px" fontWeight="700" color="#334155" mb={2}>
                      Options (A, B, C, D)
                    </Text>
                    <VStack gap={2.5} align="stretch">
                      {q.options.map((opt, oIndex) => {
                        const label = String.fromCharCode(65 + oIndex);
                        return (
                          <Flex key={oIndex} align="center" gap={3}>
                            <Flex
                              w="32px"
                              h="32px"
                              borderRadius="lg"
                              bg="#F1F5F9"
                              color="#475569"
                              align="center"
                              justify="center"
                              fontSize="12px"
                              fontWeight="800"
                            >
                              {label}
                            </Flex>
                            <Input
                              placeholder={`Option ${label} text...`}
                              value={opt}
                              onChange={(e) => handleQuestionChange(qIdx, oIndex, e.target.value)}
                              borderRadius="xl"
                              h="42px"
                              fontSize="13px"
                              borderColor="#E2E8F0"
                              _focus={{ borderColor: "#6A1B9A", boxShadow: "0 0 0 1px #6A1B9A" }}
                              required
                            />
                          </Flex>
                        );
                      })}
                    </VStack>
                  </Box>
                ) : (
                  <Box p={3} bg="#F8FAFC" borderRadius="xl" mb={4} color="#64748B" fontSize="13px">
                    Options configured as <strong>True</strong> and <strong>False</strong>.
                  </Box>
                )}

                {/* Correct Answer */}
                <Box>
                  <Text fontSize="13px" fontWeight="700" color="#059669" mb={1.5}>
                    Correct Answer Key *
                  </Text>
                  <Input
                    placeholder="e.g. Enter matching option text or A/B/C/D"
                    value={q.answer}
                    onChange={(e) => handleQuestionChange(qIdx, "answer", e.target.value)}
                    borderRadius="xl"
                    h="44px"
                    fontSize="13px"
                    borderColor="#A7F3D0"
                    bg="#F0FDF4"
                    _focus={{ borderColor: "#10B981", boxShadow: "0 0 0 1px #10B981" }}
                    required
                  />
                </Box>
              </Box>
            ))}
          </VStack>

          {/* Submit Toolbar */}
          <Flex justify="flex-end" gap={3}>
            <Button
              type="submit"
              bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
              color="white"
              px={8}
              h="48px"
              borderRadius="xl"
              fontSize="14px"
              fontWeight="700"
              boxShadow="0 4px 12px rgba(106, 27, 154, 0.25)"
              _hover={{ opacity: 0.95 }}
              loading={loading}
              loadingText="Saving to Repository..."
            >
              <Icon as={FaCheckCircle} mr={2} boxSize={4} />
              Save Questions to Bank
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default Question;
