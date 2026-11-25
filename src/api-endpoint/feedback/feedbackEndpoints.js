import api from "../../libs/axios";
import { toaster } from "../../components/ui/toaster";

const feedbackError = (error, fallback) => {
  const message = error.response?.data?.message || error.response?.data?.error || error.message;
  return { success: false, message: typeof message === "string" ? message : fallback };
};

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
    const result = feedbackError(error, "Unable to submit feedback. Please try again.");
    toaster.create({
      title: "Failed to submit feedback",
      description: result.message,
      type: "error",
    });
    return result;
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
    return feedbackError(error, "Unable to load feedback. Please try again.");
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
    const result = feedbackError(error, "Unable to update feedback. Please try again.");
    toaster.create({
      title: "Update Failed",
      description: result.message,
      type: "error",
    });
    return result;
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
    const result = feedbackError(error, "Unable to delete feedback. Please try again.");
    toaster.create({
      title: "Delete Failed",
      description: result.message,
      type: "error",
    });
    return result;
  }
};
