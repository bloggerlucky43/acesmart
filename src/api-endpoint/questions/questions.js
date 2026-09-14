import api from "../../libs/axios";

/**
 * Fetch questions with dual sourcing (teacher vs platform API bank), search, and filters
 */
export const fetchQuestions = async ({
  subject = "",
  topic = "",
  difficulty = "",
  cognitiveLevel = "",
  year = "",
  source = "all", // "all" | "teacher" | "api"
  search = "",
  page = 1,
  limit = 20,
} = {}) => {
  try {
    const params = new URLSearchParams();
    if (subject && subject !== "all") params.append("subject", subject);
    if (topic && topic !== "all") params.append("topic", topic);
    if (difficulty && difficulty !== "all") params.append("difficulty", difficulty);
    if (cognitiveLevel && cognitiveLevel !== "all") params.append("cognitiveLevel", cognitiveLevel);
    if (year) params.append("year", year);
    if (source) params.append("source", source);
    if (search) params.append("search", search);
    params.append("page", page);
    params.append("limit", limit);

    const res = await api.get(`/questions?${params.toString()}`);
    return res.data;
  } catch (error) {
    console.warn("fetchQuestions notice:", error?.response?.data?.message || error.message);
    return {
      success: false,
      total: 0,
      data: [],
      totalPages: 1,
    };
  }
};

/**
 * Create a single teacher question
 */
export const createSingleQuestion = async (questionData) => {
  const res = await api.post("/questions", questionData);
  return res.data;
};

/**
 * Bulk save multiple questions at once to Question Bank
 */
export const bulkSaveQuestions = async ({ questions, defaultSubject = "General" }) => {
  const res = await api.post("/questions/bulk", {
    questions,
    defaultSubject,
  });
  return res.data;
};

/**
 * Delete a question by ID
 */
export const deleteQuestionById = async (id) => {
  const res = await api.delete(`/questions/${id}`);
  return res.data;
};

/**
 * AI Document & Paper Scanner: Extract, transcribe, auto-solve, and explain questions from PDF, DOCX, DOC, or Images
 */
export const parseDocumentQuestions = async ({
  fileBase64,
  imageBase64,
  mimeType = "application/pdf",
  fileName = "",
  defaultSubject = "General",
}) => {
  const payload = fileBase64 || imageBase64;
  const res = await api.post(
    "/ai/parse-document-questions",
    {
      fileBase64: payload,
      imageBase64: payload,
      mimeType,
      fileName,
      defaultSubject,
    },
    {
      timeout: 180000, // 3 minutes timeout for multimodal document extraction
    }
  );
  return res.data?.data || [];
};

// Backward compatibility alias
export const ocrHandwrittenImage = parseDocumentQuestions;

/**
 * AI Bulk Text Parser: Convert unformatted multi-question text blocks into solved questions
 */
export const parseBulkTextWithAI = async ({ rawText, defaultSubject = "General" }) => {
  const res = await api.post("/ai/parse-bulk-text", {
    rawText,
    defaultSubject,
  });
  return res.data?.data || [];
};
