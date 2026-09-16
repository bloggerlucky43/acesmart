// Storage helpers for the student portal entry code. The surname used as the
// portal password is intentionally never persisted.
export const STUDENT_CODE_KEY = "STUDENT_PORTAL_CODE";

export const getSavedStudentCode = () => {
  try {
    return localStorage.getItem(STUDENT_CODE_KEY) || "";
  } catch {
    return "";
  }
};

export const clearSavedStudentCode = () => {
  try {
    localStorage.removeItem(STUDENT_CODE_KEY);
  } catch {
    /* storage unavailable */
  }
};
