import { useEffect, useState } from "react";
import { Box, Flex, Text, Button, Badge, Spinner } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../constants/dashboardlayout";
import {
  getGateSettingsApi,
  updateGateSettingsApi,
} from "../../api-endpoint/sms/gateAttendanceEndpoints";

const defaultFlags = {
  gateCheckInEnabled: false,
  gateAttendanceSyncEnabled: false,
  gateNotificationsEnabled: false,
};

const options = [
  {
    key: "gateCheckInEnabled",
    title: "Enable student gate arrivals",
    description: "Allow school staff to scan student ID cards or enter a student code at the gate. Records the first arrival each school day, never a checkout.",
  },
  {
    key: "gateAttendanceSyncEnabled",
    title: "Sync arrivals to the morning (AM) register",
    description: "Separate opt-in: sync a saved gate arrival to that student's AM attendance only. No afternoon attendance or whole-class marking. The existing manual register remains available.",
  },
  {
    key: "gateNotificationsEnabled",
    title: "Create parent arrival notifications",
    description: "Separate opt-in: create an in-app arrival notice in the private parent inbox. Browser push requires parent activation, permission, and a supported device. No SMS is sent.",
  },
];

export default function GateCheckInSettings() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(defaultFlags);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    getGateSettingsApi()
      .then((response) => {
        if (!response?.success || !response.data || !Object.keys(defaultFlags).every((key) => typeof response.data[key] === "boolean")) {
          throw new Error(response?.message || "Could not load gate settings.");
        }
        if (!active) return;
        setSettings(response.data);
        setForm(Object.fromEntries(Object.keys(defaultFlags).map((key) => [key, response.data[key] === true])));
      })
      .catch((error) => {
        if (active) setLoadError(error.response?.data?.message || error.message || "Could not load gate settings.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]);

  const dirty = settings && Object.keys(defaultFlags).some((key) => form[key] !== (settings[key] === true));

  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const saveSettings = async (event) => {
    event.preventDefault();
    if (saving || !dirty) return;
    setSaving(true);
    setSaveError("");
    setSaved(false);
    try {
      const response = await updateGateSettingsApi(form);
      if (!response?.success || !response.data || !Object.keys(defaultFlags).every((key) => typeof response.data[key] === "boolean")) {
        throw new Error(response?.message || "Settings were not saved.");
      }
      setSettings(response.data);
      setForm(Object.fromEntries(Object.keys(defaultFlags).map((key) => [key, response.data[key] === true])));
      setSaved(true);
    } catch (error) {
      setSaveError(error.response?.data?.message || error.message || "Settings were not saved. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <Box p={{ base: 3, sm: 4, md: 8 }} pt={{ base: "84px", md: "88px" }} pl={{ base: 3, sm: 4, lg: "260px" }} maxW="1200px" mx="auto" minW={0} overflowWrap="anywhere">
        <Flex direction={{ base: "column", md: "row" }} justify="space-between" gap={4} mb={6}>
          <Box>
            <Text as="h1" fontSize={{ base: "22px", md: "24px" }} fontWeight="900" color="#0F172A">Gate Check-In Settings</Text>
            <Text fontSize="13px" color="#64748B" mt={1}>{settings?.institutionName || "Your school"} | Optional arrival tracking</Text>
          </Box>
          <Button asChild variant="outline" borderRadius="xl" color="#4338CA">
            <Link to="/teacher/gate-check-in">Scan Arrivals</Link>
          </Button>
        </Flex>

        <Box bg="#EEF2FF" border="1px solid #C7D2FE" p={4} borderRadius="xl" mb={5}>
          <Text fontWeight="800" fontSize="14px" color="#312E81">All gate features are OFF initially</Text>
          <Text fontSize="13px" color="#4338CA" mt={1}>Turn on only the features your school needs. Gate tracking is separate from the current manual attendance process; disabling it does not remove the register or change how teachers mark attendance.</Text>
        </Box>

        {loading ? (
          <Flex gap={3} align="center" p={6} bg="white" borderRadius="2xl"><Spinner size="sm" /><Text>Loading school settings...</Text></Flex>
        ) : loadError ? (
          <Box role="alert" bg="#FEF2F2" color="#991B1B" p={5} borderRadius="xl">
            <Text>{loadError}</Text>
            <Button mt={3} variant="outline" onClick={() => setReload((value) => value + 1)}>Retry</Button>
          </Box>
        ) : (
          <Box as="form" onSubmit={saveSettings} bg="white" border="1px solid #E2E8F0" borderRadius="2xl" p={{ base: 4, md: 6 }}>
            <Flex justify="space-between" align="center" gap={3} mb={5} flexWrap="wrap">
              <Text fontWeight="800" color="#0F172A">School-wide controls</Text>
              <Badge bg={dirty ? "#FEF3C7" : "#F1F5F9"} color={dirty ? "#92400E" : "#475569"} px={3} py={1} borderRadius="full">{dirty ? "Unsaved changes" : "Saved settings"}</Badge>
            </Flex>
            <Flex direction="column" gap={4}>
              {options.map((option) => (
                <Box key={option.key} as="label" display="block" p={4} border="1px solid #E2E8F0" borderRadius="xl" bg="#F8FAFC" cursor={saving ? "default" : "pointer"}>
                  <Flex gap={3} align="flex-start">
                    <input
                      type="checkbox"
                      checked={form[option.key]}
                      disabled={saving}
                      onChange={(event) => {
                        setForm((previous) => ({ ...previous, [option.key]: event.target.checked }));
                        setSaved(false);
                        setSaveError("");
                      }}
                      style={{ width: 20, height: 20, marginTop: 3, flexShrink: 0, accentColor: "#4338CA" }}
                    />
                    <Box minW={0}>
                      <Text fontWeight="800" fontSize="14px" color="#0F172A">{option.title}</Text>
                      <Text fontSize="13px" color="#64748B" mt={1}>{option.description}</Text>
                      {option.key !== "gateCheckInEnabled" && !form.gateCheckInEnabled && (
                        <Text fontSize="12px" color="#92400E" mt={2}>Inactive while gate arrivals are OFF. This preference is independent and only takes effect for new arrivals when gate check-in is enabled.</Text>
                      )}
                    </Box>
                  </Flex>
                </Box>
              ))}
            </Flex>
            <Box bg="#F8FAFC" p={4} borderRadius="xl" mt={5}>
              <Text fontSize="13px" color="#475569">Late flags use the school's start time ({settings?.schoolStartTime || "not set"}) in West Africa Time (WAT). Change the start time in the existing institution settings.</Text>
              <Text fontSize="13px" color="#475569" mt={2}>No paid SMS is required. Browser push has no per-message SMS charge, but delivery is not guaranteed. Parent permissions, connectivity, browser support, and device settings affect delivery. A created inbox notice is not confirmation of delivered push.</Text>
              <Text fontSize="13px" color="#475569" mt={2}>Staff can generate a private parent activation code for a scanned or recent student. Parents first activate their inbox at /student/notifications using the student code and private access code. Distribute access codes privately, never on a student QR card.</Text>
            </Box>
            {saveError && <Text role="alert" color="#991B1B" mt={4}>{saveError}</Text>}
            {saved && <Text role="status" color="#047857" mt={4}>Gate settings saved successfully.</Text>}
            <Flex mt={5} gap={3} direction={{ base: "column", sm: "row" }} flexWrap="wrap">
              <Button type="submit" bg="#4338CA" color="white" borderRadius="xl" loading={saving} disabled={!dirty || saving}>Save Gate Settings</Button>
              <Button type="button" variant="outline" borderRadius="xl" disabled={!dirty || saving} onClick={() => {
                setForm(Object.fromEntries(Object.keys(defaultFlags).map((key) => [key, settings[key] === true])));
                setSaveError("");
                setSaved(false);
              }}>Discard Changes</Button>
              <Button asChild variant="ghost" color="#4338CA" borderRadius="xl"><Link to="/institution/settings">Institution Settings</Link></Button>
            </Flex>
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}
