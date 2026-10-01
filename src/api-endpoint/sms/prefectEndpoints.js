import api from "../../libs/axios";
import { toaster } from "../../components/ui/toaster";

/**
 * Fetch all appointed prefects in institution
 */
export const getPrefectsApi = async () => {
  try {
    const { data } = await api.get("/institution/prefects", {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("getPrefectsApi error:", error);
    return { success: false, data: [] };
  }
};

/**
 * Appoint or relieve a student of a prefect position
 */
export const assignPrefectApi = async (payload) => {
  try {
    const { data } = await api.post("/institution/prefects/assign", payload, {
      withCredentials: true,
    });
    if (data.success) {
      toaster.create({
        title: "Prefect Position Updated",
        description: data.message,
        type: "success",
      });
    }
    return data;
  } catch (error) {
    console.error("assignPrefectApi error:", error);
    toaster.create({
      title: "Failed to update prefect role",
      description: error.response?.data?.message || error.message,
      type: "error",
    });
    return { success: false };
  }
};

/**
 * Institution admin retrieves today's released Prefect Attendance Code
 */
export const getPrefectDailyCodeApi = async () => {
  try {
    const { data } = await api.get("/institution/prefects/code", {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("getPrefectDailyCodeApi error:", error);
    return { success: false, data: null };
  }
};

/**
 * Get daily prefect attendance roster board
 */
export const getDailyPrefectAttendanceApi = async (date) => {
  try {
    const { data } = await api.get("/institution/prefects/daily", {
      params: date ? { date } : {},
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("getDailyPrefectAttendanceApi error:", error);
    return { success: false, data: null };
  }
};

/**
 * Prefect signs in from their Student Portal using the school's active code
 */
export const studentPrefectClockInApi = async (payload) => {
  try {
    const { data } = await api.post("/portal/student/prefect-clockin", payload, {
      withCredentials: true,
    });
    if (data.success) {
      toaster.create({
        title: "Prefect Sign-In Recorded",
        description: data.message,
        type: "success",
      });
    }
    return data;
  } catch (error) {
    console.error("studentPrefectClockInApi error:", error);
    toaster.create({
      title: "Sign-In Failed",
      description: error.response?.data?.message || error.message,
      type: "error",
    });
    return { success: false, message: error.response?.data?.message };
  }
};

/**
 * Fetch a student's prefect role, today's attendance record, and duty history
 */
export const getStudentPrefectStatusApi = async (studentId) => {
  try {
    const { data } = await api.get(`/portal/student/${studentId}/prefect-status`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("getStudentPrefectStatusApi error:", error);
    return { success: false, data: null };
  }
};

