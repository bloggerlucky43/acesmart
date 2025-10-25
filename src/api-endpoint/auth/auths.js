import api from "../../libs/axios";
import { toaster } from "../../components/ui/toaster";

export const registerUser = async (form) => {
  try {
    const response = await api.post("/auth/register", form);
    const data = response.data;

    console.log("data at register", data);

    if (!data.success) {
      toaster.create({
        title: data.message || "Registration failed",
        type: "error",
      });
    }
    return data;
  } catch (error) {
    toaster.create({
      title:
        error.response?.data?.message ||
        "An error occurred during registration",
      type: "error",
    });
    throw new Error(error.response?.data?.error);
  }
};

export const loginUser = async (form) => {
  try {
    const response = await api.post("/auth/login", form);
    const data = response.data;
    console.log("At login function", data);

    if (!data.success) {
      toaster.create({
        title: data.message || "Login failed",
        type: "error",
      });
    }
    return data;
  } catch (error) {
    console.error(error);
    toaster.create({
      title: `${error?.message} || "Registration failed"`,
      type: "error",
    });
  }
};

export const getSingleUser = async () => {
  try {
    const response = await api.get("/auth/me", { withCredentials: true });
    const data = response.data;
    console.log("Response at single user", data);
    if (!data.success) {
      toaster.create({
        title: `${data.message}`,
        type: "error",
      });
    }
    return data;
  } catch (error) {
    console.error("Error validating user", error);
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post(
      "/auth/logout",
      {},
      { withCredentials: true }
    );
    toaster.success({ title: "Logged out successfully" });
  } catch (error) {
    console.error(error);
  }
};
