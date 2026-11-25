import api from "../../libs/axios";

export const getMyTeachingAssignmentsApi = async (params = {}) => {
  const { data } = await api.get("/institution/teaching-assignments/me", { params });
  return data;
};

export const getStaffTeachingAssignmentsApi = async (staffId) => {
  const { data } = await api.get(
    `/institution/staff/${encodeURIComponent(staffId)}/teaching-assignments`,
  );
  return data;
};

export const saveStaffTeachingAssignmentsApi = async (staffId, payload) => {
  const { data } = await api.put(
    `/institution/staff/${encodeURIComponent(staffId)}/teaching-assignments`,
    payload,
  );
  return data;
};
