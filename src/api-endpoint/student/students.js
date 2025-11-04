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
export const addStudent = async (form) => {
  try {
    const response = await api.post("/student", form, {
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
