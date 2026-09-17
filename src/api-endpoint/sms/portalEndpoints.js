import api from "../../libs/axios";

/* ------------------------- Student Portal (reads) ------------------------- */

export const getStudentPortalOverviewApi = async (studentId) => {
  const { data } = await api.get(`/portal/student/${studentId}/overview`);
  return data;
};

export const getStudentAcademicTermsApi = async (studentId) => {
  const { data } = await api.get(`/portal/student/${studentId}/academic-terms`);
  return data;
};

export const getStudentReceiptsApi = async (studentId) => {
  const { data } = await api.get(`/portal/student/${studentId}/receipts`);
  return data;
};

export const getStudentPerformanceApi = async (studentId, params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();
  const { data } = await api.get(
    `/portal/student/${studentId}/performance${query ? `?${query}` : ""}`
  );
  return data;
};

export const getStudentAttendanceApi = async (studentId, params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();
  const { data } = await api.get(
    `/portal/student/${studentId}/attendance${query ? `?${query}` : ""}`
  );
  return data;
};

export const getStudentAnnouncementsApi = async (studentId, params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();
  const { data } = await api.get(
    `/portal/student/${studentId}/announcements${query ? `?${query}` : ""}`
  );
  return data;
};

export const getStudentTimetableApi = async (studentId) => {
  const { data } = await api.get(`/portal/student/${studentId}/timetable`);
  return data;
};

export const getStudentResourcesApi = async (studentId, params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();
  const { data } = await api.get(
    `/portal/student/${studentId}/resources${query ? `?${query}` : ""}`
  );
  return data;
};

/* ------------------------------- Support desk ----------------------------- */

export const getStudentSupportTicketsApi = async (studentId) => {
  const { data } = await api.get(`/portal/support/${studentId}`);
  return data;
};

export const createStudentSupportTicketApi = async (payload) => {
  const { data } = await api.post("/portal/support", payload);
  return data;
};

/* ------------------------------- Settings --------------------------------- */

export const getStudentPortalSettingsApi = async (studentId) => {
  const { data } = await api.get(`/portal/settings/${studentId}`);
  return data;
};

export const updateStudentPortalSettingsApi = async (studentId, payload) => {
  const { data } = await api.put(`/portal/settings/${studentId}`, payload);
  return data;
};

export const setStudentPortalPinApi = async (studentId, payload) => {
  const { data } = await api.post(`/portal/settings/${studentId}/pin`, payload);
  return data;
};

/* --------------------- Institution authoring (admin) ---------------------- */

export const getInstitutionAnnouncementsApi = async () => {
  const { data } = await api.get("/institution/announcements", {
    withCredentials: true,
  });
  return data;
};

export const saveInstitutionAnnouncementApi = async (payload) => {
  const { data } = await api.post("/institution/announcements", payload, {
    withCredentials: true,
  });
  return data;
};

export const deleteInstitutionAnnouncementApi = async (id) => {
  const { data } = await api.delete(`/institution/announcements/${id}`, {
    withCredentials: true,
  });
  return data;
};

export const getInstitutionTimetableApi = async () => {
  const { data } = await api.get("/institution/timetable", {
    withCredentials: true,
  });
  return data;
};

export const saveInstitutionTimetableEntryApi = async (payload) => {
  const { data } = await api.post("/institution/timetable", payload, {
    withCredentials: true,
  });
  return data;
};

export const deleteInstitutionTimetableEntryApi = async (id) => {
  const { data } = await api.delete(`/institution/timetable/${id}`, {
    withCredentials: true,
  });
  return data;
};

export const getInstitutionResourcesApi = async () => {
  const { data } = await api.get("/institution/resources", {
    withCredentials: true,
  });
  return data;
};

export const saveInstitutionResourceApi = async (payload) => {
  const { data } = await api.post("/institution/resources", payload, {
    withCredentials: true,
  });
  return data;
};

export const deleteInstitutionResourceApi = async (id) => {
  const { data } = await api.delete(`/institution/resources/${id}`, {
    withCredentials: true,
  });
  return data;
};

export const getInstitutionSupportTicketsApi = async (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();
  const { data } = await api.get(
    `/institution/support-tickets${query ? `?${query}` : ""}`,
    { withCredentials: true }
  );
  return data;
};

export const updateInstitutionSupportTicketApi = async (id, payload) => {
  const { data } = await api.put(`/institution/support-tickets/${id}`, payload, {
    withCredentials: true,
  });
  return data;
};
