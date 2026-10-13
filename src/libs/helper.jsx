import { saveExamResult } from "../api-endpoint/exam/exams";

export const getStorageKey = (examId, userId) =>
  `exam_${examId}_user_${userId}`;

export const STORAGE_KEY = "EXAM_DRAFT";

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

/**
 * Format student name for frontend rendering so the first letter of each name is uppercase.
 * Note: Only for frontend display/rendering; does not alter backend payloads.
 * Example: "john doe" -> "John Doe", "emeka obi" -> "Emeka Obi".
 */
export const formatStudentName = (name) => {
  if (!name || typeof name !== "string") return "";
  return name
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (!word) return "";
      return word
        .split("-")
        .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ""))
        .join("-");
    })
    .join(" ");
};

export const formatStudentFullName = (firstName, lastName) => {
  return formatStudentName(`${firstName || ""} ${lastName || ""}`);
};

export const getFormattedStudentName = (student, fallback = "Student") => {
  if (!student) return fallback;
  if (typeof student === "string") return formatStudentName(student) || fallback;
  const name =
    student.name ||
    student.fullName ||
    student.studentName ||
    `${student.firstName || ""} ${student.lastName || ""}`.trim();
  return formatStudentName(name) || fallback;
};
