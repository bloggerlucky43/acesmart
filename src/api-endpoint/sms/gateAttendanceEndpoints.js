import api from "../../libs/axios";

export const getGateSettingsApi = async () => {
  const { data } = await api.get("/gate/settings");
  return data;
};

export const updateGateSettingsApi = async (settings) => {
  const { data } = await api.put("/gate/settings", {
    gateCheckInEnabled: settings.gateCheckInEnabled,
    gateAttendanceSyncEnabled: settings.gateAttendanceSyncEnabled,
    gateNotificationsEnabled: settings.gateNotificationsEnabled,
  });
  return data;
};

export const getGateArrivalsApi = async (date) => {
  const { data } = await api.get("/gate/arrivals", { params: { date } });
  return data;
};

export const recordGateArrivalApi = async ({ studentCode, source }) => {
  const { data } = await api.post("/gate/arrivals", { studentCode, source });
  return data;
};

export const generateGuardianAccessApi = async (studentId) => {
  const { data } = await api.post(
    `/gate/students/${encodeURIComponent(studentId)}/guardian-access`
  );
  return data;
};
