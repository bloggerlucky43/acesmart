import api from "../../libs/axios";

export const getSuperAdminOverviewApi = async () => {
  const { data } = await api.get("/superadmin/overview", { withCredentials: true });
  return data;
};

export const getSuperAdminInstitutionsApi = async (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ).toString();
  const { data } = await api.get(`/superadmin/institutions${query ? `?${query}` : ""}`, {
    withCredentials: true,
  });
  return data;
};

export const getSuperAdminInstitutionDetailsApi = async (id) => {
  const { data } = await api.get(`/superadmin/institutions/${id}`, { withCredentials: true });
  return data;
};

export const updateSuperAdminInstitutionApi = async (id, payload) => {
  const { data } = await api.put(`/superadmin/institutions/${id}`, payload, { withCredentials: true });
  return data;
};

export const impersonateInstitutionAdminApi = async (institutionId, adminPin) => {
  const { data } = await api.post(
    `/superadmin/impersonate/${institutionId}`,
    { adminPin },
    {
      withCredentials: true,
      headers: adminPin ? { "x-admin-pin": adminPin } : {},
    }
  );
  return data;
};

export const getAdminPinStatusApi = async () => {
  const { data } = await api.get("/superadmin/pin-status", { withCredentials: true });
  return data;
};

export const setupAdminPinApi = async (payload) => {
  const { data } = await api.post("/superadmin/setup-pin", payload, { withCredentials: true });
  return data;
};

export const verifyAdminPinApi = async (pin) => {
  const { data } = await api.post("/superadmin/verify-pin", { pin }, { withCredentials: true });
  return data;
};

export const upgradeInstitutionTierApi = async (institutionId, payload) => {
  const { data } = await api.post(
    `/superadmin/institutions/${institutionId}/upgrade-tier`,
    payload,
    {
      withCredentials: true,
      headers: payload?.adminPin ? { "x-admin-pin": payload.adminPin } : {},
    }
  );
  return data;
};

export const getSuperAdminTransactionsApi = async (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ).toString();
  const { data } = await api.get(`/superadmin/transactions${query ? `?${query}` : ""}`, {
    withCredentials: true,
  });
  return data;
};

export const getSuperAdminUsersApi = async (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ).toString();
  const { data } = await api.get(`/superadmin/users${query ? `?${query}` : ""}`, {
    withCredentials: true,
  });
  return data;
};

export const toggleSuperAdminUserStatusApi = async (id) => {
  const { data } = await api.patch(`/superadmin/users/${id}/toggle-status`, {}, { withCredentials: true });
  return data;
};
