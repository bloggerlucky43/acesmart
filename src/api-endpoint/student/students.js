import api from "../../libs/axios";
import { toaster } from "../../components/ui/toaster";

export const fetchStudent = async () => {
  try {
    const response = await api.get("/student", { withCredentials: true });

    const data = response.data;
    if (!data.success || !data.count) {
      toaster.create({
        title: "Fetch not successful",
        type: "error",
      });
    }

    return data;
  } catch (error) {
    console.error("Fetch student failed", error);
  }
};
export const addStudent = async (formData) => {
  try {
    const response = await api.post("/student", formData, {
      withCredentials: true,
    });

    const data = response.data;
    if (!data.success) {
      toaster.create({
        title: data.message,
        type: "error",
      });
    }

    return data;
  } catch (error) {
    console.error("Add student failed:", error);
  }
};

export const activateStudent = async (studentId) => {
  console.log("At activate student,", studentId);

  const { data } = await api.put(
    `/student/${studentId}/activate`,
    {},
    { withCredentials: true }
  );
  return data;
};

export const deactivateStudent = async (studentId) => {
  console.log("At deactivate", studentId);

  const { data } = await api.put(
    `/student/${studentId}/deactivate`,
    {},
    { withCredentials: true }
  );

  return data;
};

export const deleteStudent = async (studentId) => {
  console.log("At delete student", studentId);

  const { data } = await api.delete(`/student/${studentId}`, {
    withCredentials: true,
  });
  return data;
};
