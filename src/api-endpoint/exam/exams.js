import { toaster } from "../../components/ui/toaster";
import api from "../../libs/axios";

export const getQuestions = async (
  subjectOrOptions,
  legacyYear,
  legacySource = "all",
  legacyLimit = 100,
) => {
  try {
    const params = new URLSearchParams();

    if (typeof subjectOrOptions === "object" && subjectOrOptions !== null) {
      const {
        subject,
        year,
        source = "all",
        limit = 100,
        search,
        topic,
        difficulty,
      } = subjectOrOptions;
      if (subject && subject !== "All")
        params.append("subject", subject.toLowerCase().trim());
      if (year && String(year).trim())
        params.append("year", String(year).trim());
      if (source && source !== "all") params.append("source", source);
      if (limit) params.append("limit", limit);
      if (search) params.append("search", search.trim());
      if (topic && topic !== "All") params.append("topic", topic.trim());
      if (difficulty && difficulty !== "all")
        params.append("difficulty", difficulty.trim());
    } else {
      const subject = subjectOrOptions;
      const year = legacyYear;
      const source = legacySource;
      const limit = legacyLimit;
      if (subject && subject !== "All")
        params.append("subject", String(subject).toLowerCase().trim());
      if (year && String(year).trim())
        params.append("year", String(year).trim());
      if (source && source !== "all") params.append("source", source);
      if (limit) params.append("limit", limit);
    }

    const response = await api.get(`/questions?${params.toString()}`, {
      withCredentials: true,
    });

    const data = response.data;
    if (!data.success) {
      toaster.create({
        title: data.message,
        type: "error",
      });
    }
    return data;
  } catch (error) {
    toaster.create({
      title: error?.response?.data?.error || "Question fetch failed",
      type: "error",
    });
    return { success: false, data: [] };
  }
};

export const getTopicsBySubject = async (subject = "") => {
  try {
    const params = new URLSearchParams();
    if (subject && subject !== "All" && subject !== "all") {
      params.append("subject", String(subject).toLowerCase().trim());
    }
    const response = await api.get(`/questions/topics?${params.toString()}`, {
      withCredentials: true,
    });
    return response.data?.data || [];
  } catch (error) {
    console.warn("getTopicsBySubject notice:", error?.response?.data?.message || error.message);
    return [];
  }
};

export const formatSubjectTitle = (rawSubject) => {
  if (!rawSubject) return "";
  const sub = String(rawSubject).toLowerCase().trim();
  const map = {
    englishlit: "Literature",
    literature: "Literature",
    "literature in english": "Literature",
    civiledu: "Civic Education",
    "civic education": "Civic Education",
    crk: "CRK",
    crs: "CRK",
    irk: "IRK",
    irs: "IRK",
    maths: "Mathematics",
    mathematics: "Mathematics",
    currentaffairs: "Current Affairs",
    agric: "Agricultural Science",
    "agricultural science": "Agricultural Science",
  };
  if (map[sub]) return map[sub];
  return sub.charAt(0).toUpperCase() + sub.slice(1);
};

export const updateExam = async (examId, finalExam) => {
  try {
    console.log("At the updating exam", examId);
    console.log("At the updating exam", finalExam);
    const response = await api.put(`/exams/${examId}`, finalExam);

    return response.data;
  } catch (error) {
    console.error("Update exam error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update exam",
    };
  }
};
export const createExam = async (examDetails) => {
  try {
    console.log("At create exam", examDetails);

    const response = await api.post(`/exams`, examDetails, {
      withCredentials: true,
    });
    const data = response.data;

    console.log(data);

    if (!data.success) {
      toaster.create({
        title: data.message,
        type: "error",
      });
    }
    return data;
  } catch (error) {
    console.error("Create exam failed:", error);
    toaster.create({
      title: error?.response?.data?.error || "Question fetch failed",
      type: "error",
    });
  }
};
export const fetchExams = async () => {
  try {
    const response = await api.get(`/exams`, {
      withCredentials: true,
    });
    const data = response.data;
    console.log("the response from fetchexams", data);
    if (!data.success) {
      toaster.create({
        title: data.message,
        type: "error",
      });
    }
    console.log("at fetch exams", data);

    return data;
  } catch (error) {
    console.error("Fetch Exam Failed", error);
    toaster.create({
      title: error?.response?.data?.error || "Question fetch failed",
      type: "error",
    });
  }
};

export const examLogin = async (payload) => {
  try {
    const studentId = payload?.studentId || payload?.examDetail?.studentId;
    const firstName = payload?.firstName || payload?.examDetail?.firstName;
    const examId = payload?.examId || payload?.id;

    const response = await api.post(`/exams/login`, {
      studentId: studentId ? String(studentId).trim() : "",
      firstName: firstName ? String(firstName).trim() : "",
      examId,
    });
    const data = response.data;

    if (!data.success) {
      toaster.create({
        title: data.message || "Authentication failed",
        type: "error",
      });
    }

    return data;
  } catch (error) {
    console.error("Exam login failed:", error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Exam login failed. Please verify credentials.";
    toaster.create({
      title: errorMessage,
      type: "error",
    });
    return {
      success: false,
      message: errorMessage,
    };
  }
};

export const fetchLiveExam = async ({ studentId, examId }) => {
  try {
    const response = await api.get(`/exams/live-exam/${examId}`, {
      params: { studentId },
    });

    const data = response.data;
    console.log("the response from fetch live exams", data);
    if (!data.exam) {
      toaster.create({
        title: data.message || "Failed to load examination",
        type: "error",
      });
    }
    return data;
  } catch (error) {
    console.error("Error fetching live exam:", error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Failed to load exam questions. Please verify access.";
    toaster.create({
      title: errorMessage,
      type: "error",
    });
    return {
      success: false,
      message: errorMessage,
    };
  }
};
export const getExamById = async (examId) => {
  try {
    const response = await api.get(`/exams/${examId}`);

    const data = response.data;
    console.log("Response at endpoint:", data);

    if (!data.exam) {
      toaster.create({
        title: data.message,
        type: "error",
      });
    }

    return data;
  } catch (error) {
    console.error("Error fetching exam by id", error);
  }
};

export const fetchExamResults = async (examId) => {
  try {
    const res = await api.get(`/results/${examId}/all`, {
      withCredentials: true,
    });

    console.log("the result is res", res.data, res);

    return res.data;
  } catch (error) {
    console.error("Error fetching exam results", error);
    if (error?.response?.status === 404) {
      return { success: true, data: [] };
    }
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch exam results",
    );
  }
};
export const checkResultExisting = async ({ studentId, examId }) => {
  try {
    const response = await api.get(`/exams/result-status/${examId}`, {
      params: { studentId },
      withCredentials: true,
    });

    const data = response.data;
    console.log("checkResultExisting data:", data);

    return data;
  } catch (error) {
    console.error("Error checking result existence", error);
    return { success: false, exists: false };
  }
};

export const saveExamResult = async (resultData) => {
  try {
    console.log("result data are", resultData);

    const response = await api.post(`/exams/save-result`, { resultData });

    const data = response.data;
    console.log("Response from backend ", response);

    if (!data.exam) {
      toaster.create({
        title: data.message,
        type: "error",
      });
    }
    return data;
  } catch (error) {
    console.error("Error saving result", error);
  }
};
