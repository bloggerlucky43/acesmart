import { toaster } from "../../components/ui/toaster";
import api from "../../libs/axios";

export const getQuestions = async (subject, year) => {
  try {
    const response = await api.get(
      `/questions?subject=${subject}&year=${year}`,
      { withCredentials: true }
    );

    const data = response.data;
    console.log("Response at get questions", data);

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

export const examLogin = async (examDetails) => {
  try {
    const response = await api.post(`/exams/login`, {
      studentId: examDetails?.studentId,
      firstName: examDetails?.firstName,
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
    console.error("Exam login failed:", error);
    toaster.create({
      title: error?.response?.data?.error || "Exam login failed",
      type: "error",
    });
  }
};

export const fetchLiveExam = async ({ studentId, examId }) => {
  try {
    const response = await api.get(`/exams/${studentId}/${examId}`);

    const data = response.data;
    console.log("the response from fetch live exams", data);
    if (!data.exam) {
      toaster.create({
        title: data.message,
        type: "error",
      });
    }
    return data;
  } catch (error) {
    console.error("Error fetching exam", error);
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
  }
};
export const checkResultExisting = async ({ studentId, examId }) => {
  try {
    const response = await api.get(`/exams/result/${studentId}/${examId}`, {
      withCredentials: true,
    });

    const data = response.data;
    console.log(data);

    return data;
    // if()
  } catch (error) {
    console.error("Error checking result existence", error);
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
