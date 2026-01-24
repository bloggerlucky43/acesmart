import { saveExamResult } from "../api-endpoint/exam/exams";

export const getStorageKey = (examId, userId) =>
  `exam_${examId}_user_${userId}`;

export const saveWithRetry = async (payload, retries = 3) => {
  let attempt = 0;
  let lastError;

  while (attempt < retries) {
    try {
      return await saveExamResult(payload);
    } catch (error) {
      lastError = error;
      attempt++;
      console.warn(`Save attempt ${attempt} failed`);
    }
  }
  throw lastError;
};
