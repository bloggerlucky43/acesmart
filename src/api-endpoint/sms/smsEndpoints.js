import api from "../../libs/axios";

// Institution & School Profile
export const registerInstitutionApi = async (formData) => {
  const { data } = await api.post("/institution/register", formData);
  return data;
};

export const getInstitutionProfileApi = async () => {
  const { data } = await api.get("/institution/profile", { withCredentials: true });
  return data;
};

export const getInstitutionBySubdomainApi = async (subdomain) => {
  const { data } = await api.get(`/institution/subdomain/${subdomain}`);
  return data;
};

export const updateInstitutionBrandingApi = async (formData) => {
  const { data } = await api.put("/institution/branding", formData, { withCredentials: true });
  return data;
};

export const uploadInstitutionLogoApi = async (formData) => {
  const { data } = await api.post("/institution/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
  return data;
};

export const getAttendanceQrApi = async () => {
  const { data } = await api.get("/institution/attendance-qr", { withCredentials: true });
  return data;
};

export const enrollStaffApi = async (staffData) => {
  const { data } = await api.post("/institution/staff/enroll", staffData, { withCredentials: true });
  return data;
};

export const getStaffListApi = async () => {
  const { data } = await api.get("/institution/staff", { withCredentials: true });
  return data;
};

export const getClassArmsApi = async () => {
  const { data } = await api.get("/institution/classes", { withCredentials: true });
  return data;
};

export const createClassArmApi = async (classData) => {
  const { data } = await api.post("/institution/classes", classData, { withCredentials: true });
  return data;
};

export const enrollInstitutionalStudentApi = async (studentData) => {
  const { data } = await api.post("/institution/students/enroll", studentData, { withCredentials: true });
  return data;
};

// Staff & Student Attendance
export const staffClockInApi = async (clockInData) => {
  const { data } = await api.post("/attendance/staff/clock-in", clockInData, { withCredentials: true });
  return data;
};

export const getDailyStaffAttendanceApi = async (date) => {
  const { data } = await api.get(`/attendance/staff/daily${date ? `?date=${date}` : ""}`, { withCredentials: true });
  return data;
};

export const getStaffAttendanceHistoryApi = async (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ).toString();
  const { data } = await api.get(`/attendance/staff/history${query ? `?${query}` : ""}`, { withCredentials: true });
  return data;
};

export const markStudentAttendanceBatchApi = async (payload) => {
  const { data } = await api.post("/attendance/student/batch", payload, { withCredentials: true });
  return data;
};

export const getClassAttendanceByDateApi = async (classArmId, date) => {
  const { data } = await api.get(`/attendance/student/class/${classArmId}${date ? `?date=${date}` : ""}`, { withCredentials: true });
  return data;
};

// Fee & Debtor Management
export const getInstitutionFeeOverviewApi = async () => {
  const { data } = await api.get("/fees/institution/overview", { withCredentials: true });
  return data;
};

export const getDebtorListApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const { data } = await api.get(`/fees/institution/debtors${query ? `?${query}` : ""}`, { withCredentials: true });
  return data;
};

export const getInstitutionPaymentHistoryApi = async (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ).toString();
  const { data } = await api.get(`/fees/institution/payments${query ? `?${query}` : ""}`, { withCredentials: true });
  return data;
};

export const getStudentFeeByCodeApi = async (studentCode) => {
  const { data } = await api.get(`/fees/student/${studentCode}`);
  return data;
};

export const recordFeePaymentApi = async (paymentData) => {
  const { data } = await api.post("/fees/pay", paymentData);
  return data;
};

export const getFeeStructuresApi = async () => {
  const { data } = await api.get("/fees/structures", { withCredentials: true });
  return data;
};

export const saveFeeStructureApi = async (structureData) => {
  const { data } = await api.post("/fees/structures", structureData, { withCredentials: true });
  return data;
};

export const deleteFeeStructureApi = async (id) => {
  const { data } = await api.delete(`/fees/structures/${id}`, { withCredentials: true });
  return data;
};

export const batchGenerateInvoicesApi = async (billingPayload) => {
  const { data } = await api.post("/fees/generate-invoices", billingPayload, { withCredentials: true });
  return data;
};

// ₦500 Result Checker Paywall
export const payResultCheckerTokenApi = async (payload) => {
  const { data } = await api.post("/fees/result-checker/pay", payload);
  return data;
};

export const checkResultTokenStatusApi = async (studentId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const { data } = await api.get(`/fees/result-checker/status/${studentId}${query ? `?${query}` : ""}`);
  return data;
};

// Report Cards & Broadsheets
export const uploadSubjectScoresApi = async (scoreData) => {
  const { data } = await api.post("/sms-results/upload-scores", scoreData, { withCredentials: true });
  return data;
};

export const syncCbtScoresApi = async (syncData) => {
  const { data } = await api.post("/sms-results/sync-cbt", syncData, { withCredentials: true });
  return data;
};

export const getStudentReportCardApi = async (studentId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const { data } = await api.get(`/sms-results/report-card/${studentId}${query ? `?${query}` : ""}`, { withCredentials: true });
  return data;
};

// Student Code Portal Login
export const studentCodeLoginApi = async (studentCode, lastName) => {
  const { data } = await api.post("/auth/student-login", {
    studentCode,
    lastName,
  });
  return data;
};
