import api from "../../libs/axios";
import { toaster } from "../../components/ui/toaster";

/**
 * Fetch unified subjects list (Global curriculum + School custom subjects)
 */
export const fetchSubjectsApi = async (params = {}) => {
  try {
    const { data } = await api.get("/subjects", {
      params,
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("fetchSubjectsApi error:", error);
    return { success: false, data: [] };
  }
};

/**
 * Institution Liberty: Teacher or School Admin registers a custom school subject
 */
export const createInstitutionSubjectApi = async (payload) => {
  try {
    const { data } = await api.post("/subjects/custom", payload, {
      withCredentials: true,
    });
    if (data.success) {
      toaster.create({
        title: "Subject Created",
        description: data.message || `Subject "${payload.name}" is now available.`,
        type: "success",
      });
    }
    return data;
  } catch (error) {
    console.error("createInstitutionSubjectApi error:", error);
    toaster.create({
      title: "Failed to create subject",
      description: error.response?.data?.message || "An unexpected error occurred.",
      type: "error",
    });
    return { success: false };
  }
};

/**
 * SuperAdmin: Register new Global Master Subject
 */
export const createGlobalSubjectApi = async (payload) => {
  try {
    const { data } = await api.post("/subjects/global", payload, {
      withCredentials: true,
    });
    if (data.success) {
      toaster.create({
        title: "Global Subject Registered",
        description: data.message || `Subject "${payload.name}" added to national catalog.`,
        type: "success",
      });
    }
    return data;
  } catch (error) {
    console.error("createGlobalSubjectApi error:", error);
    toaster.create({
      title: "Failed to register global subject",
      description: error.response?.data?.message || "An unexpected error occurred.",
      type: "error",
    });
    return { success: false };
  }
};

/**
 * SuperAdmin / Admin: Update subject
 */
export const updateSubjectApi = async (id, payload) => {
  try {
    const { data } = await api.put(`/subjects/${id}`, payload, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("updateSubjectApi error:", error);
    return { success: false };
  }
};

/**
 * SuperAdmin: Deactivate subject
 */
export const deleteSubjectApi = async (id) => {
  try {
    const { data } = await api.delete(`/subjects/${id}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("deleteSubjectApi error:", error);
    return { success: false };
  }
};
