import api from "../../libs/axios";
import { toaster } from "../../components/ui/toaster";

/**
 * Submit user or student feedback
 */
export const submitFeedbackApi = async (payload) => {
  try {
    const { data } = await api.post("/feedback", payload, {
      withCredentials: true,
    });
    if (data.success) {
      toaster.create({
        title: "Feedback Submitted",
        description: data.message || "Thank you for helping us improve AceSmart!",
        type: "success",
      });
    }
    return data;
  } catch (error) {
    console.error("submitFeedbackApi error:", error);
    toaster.create({
      title: "Failed to submit feedback",
      description: error.response?.data?.message || error.message,
      type: "error",
    });
    return { success: false };
  }
};

/**
 * Fetch feedbacks (SuperAdmin or Institution Admin)
 */
export const getFeedbacksApi = async (params = {}) => {
  try {
    const { data } = await api.get("/feedback", {
      params,
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("getFeedbacksApi error:", error);
    return { success: false, data: [], metrics: {} };
  }
};

/**
 * Update feedback status or response
 */
export const updateFeedbackStatusApi = async (id, payload) => {
  try {
    const { data } = await api.patch(`/feedback/${id}`, payload, {
      withCredentials: true,
    });
    if (data.success) {
      toaster.create({
        title: "Feedback Updated",
        description: data.message || "Status updated successfully.",
        type: "success",
      });
    }
    return data;
  } catch (error) {
    console.error("updateFeedbackStatusApi error:", error);
    toaster.create({
      title: "Update Failed",
      description: error.response?.data?.message || error.message,
      type: "error",
    });
    return { success: false };
  }
};

/**
 * Delete feedback (SuperAdmin)
 */
export const deleteFeedbackApi = async (id) => {
  try {
    const { data } = await api.delete(`/feedback/${id}`, {
      withCredentials: true,
    });
    if (data.success) {
      toaster.create({
        title: "Feedback Deleted",
        type: "success",
      });
    }
    return data;
  } catch (error) {
    console.error("deleteFeedbackApi error:", error);
    toaster.create({
      title: "Delete Failed",
      description: error.response?.data?.message || error.message,
      type: "error",
    });
    return { success: false };
  }
};
