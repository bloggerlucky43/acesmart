import { useCallback, useEffect, useState } from "react";
import { Box, Flex, Text, Icon, Button, SimpleGrid } from "@chakra-ui/react";
import { FaCog, FaBell, FaSms, FaEnvelope, FaLock, FaSave } from "react-icons/fa";
import StudentPageHeading from "../../components/student/StudentPageHeading";
import {
  PortalCard,
  PortalLoader,
  PortalToggle,
} from "../../components/student/StudentPortalPrimitives";
import { useStudentPortal } from "../../libs/StudentPortalProvider";
import {
  getStudentPortalSettingsApi,
  updateStudentPortalSettingsApi,
  setStudentPortalPinApi,
} from "../../api-endpoint/sms/portalEndpoints";
import { toaster } from "../../components/ui/toaster";

const fieldStyle = {
  width: "100%",
  height: "44px",
  padding: "0 14px",
  borderRadius: "12px",
  border: "1px solid #CBD5E1",
  fontSize: "14px",
  fontWeight: "600",
  background: "white",
};

const StudentSettings = () => {
  const { student } = useStudentPortal();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingPin, setSavingPin] = useState(false);

  const [notifySms, setNotifySms] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const studentId = student?.id;

  const load = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await getStudentPortalSettingsApi(studentId);
      if (res?.success) {
        setSettings(res.data);
        setNotifySms(res.data.notifySms !== false);
        setNotifyEmail(res.data.notifyEmail !== false);
      }
    } catch {
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  const savePreferences = async () => {
    setSavingPrefs(true);
    try {
      const res = await updateStudentPortalSettingsApi(studentId, {
        notifySms,
        notifyEmail,
      });
      if (res?.success) {
        toaster.create({ title: "Notification preferences saved", type: "success" });
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Failed to save preferences",
        type: "error",
      });
    } finally {
      setSavingPrefs(false);
    }
  };

  const savePin = async () => {
    if (newPin && newPin !== confirmPin) {
      toaster.create({ title: "New PIN and confirmation do not match", type: "warning" });
      return;
    }
    if (newPin && !/^\d{4,6}$/.test(newPin)) {
      toaster.create({ title: "PIN must be 4 to 6 digits", type: "warning" });
      return;
    }

    setSavingPin(true);
    try {
      const res = await setStudentPortalPinApi(studentId, { currentPin, newPin });
      if (res?.success) {
        toaster.create({ title: res.message || "Portal PIN saved", type: "success" });
        setCurrentPin("");
        setNewPin("");
        setConfirmPin("");
        await load();
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Failed to update PIN",
        type: "error",
      });
    } finally {
      setSavingPin(false);
    }
  };

  return (
    <Box>
      <StudentPageHeading
        title="Account Settings"
        description="Manage your notification channels and portal access PIN."
        icon={FaCog}
      />

      {loading && !settings ? (
        <PortalLoader label="Loading your settings..." />
      ) : (
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
          <PortalCard>
            <Flex align="center" gap={2.5} mb={4}>
              <Icon as={FaBell} color="#4338CA" boxSize={4} />
              <Text fontSize="16px" fontWeight="800" color="#0F172A">
                Notification Preferences
              </Text>
            </Flex>
            <Text fontSize="13px" color="#64748B" mb={5} lineHeight="1.6">
              Choose how the school reaches you about fee deadlines, results, and
              important notices.
            </Text>

            <Flex
              align="center"
              justify="space-between"
              p={4}
              borderRadius="xl"
              bg="#F8FAFC"
              border="1px solid #E2E8F0"
              mb={3}
              gap={3}
            >
              <Flex align="center" gap={3}>
                <Icon as={FaSms} color="#4338CA" boxSize={4} />
                <Box>
                  <Text fontSize="13px" fontWeight="800" color="#0F172A">
                    SMS Alerts
                  </Text>
                  <Text fontSize="11px" color="#64748B">
                    Text messages to the registered guardian phone
                  </Text>
                </Box>
              </Flex>
              <PortalToggle
                checked={notifySms}
                onChange={setNotifySms}
                onLabel="On"
                offLabel="Off"
              />
            </Flex>

            <Flex
              align="center"
              justify="space-between"
              p={4}
              borderRadius="xl"
              bg="#F8FAFC"
              border="1px solid #E2E8F0"
              gap={3}
            >
              <Flex align="center" gap={3}>
                <Icon as={FaEnvelope} color="#4338CA" boxSize={4} />
                <Box>
                  <Text fontSize="13px" fontWeight="800" color="#0F172A">
                    Email Alerts
                  </Text>
                  <Text fontSize="11px" color="#64748B">
                    Notices sent to your registered email address
                  </Text>
                </Box>
              </Flex>
              <PortalToggle
                checked={notifyEmail}
                onChange={setNotifyEmail}
                onLabel="On"
                offLabel="Off"
              />
            </Flex>

            <Button
              mt={5}
              w="100%"
              h="44px"
              bg="#4338CA"
              color="white"
              borderRadius="xl"
              fontWeight="700"
              loading={savingPrefs}
              onClick={savePreferences}
            >
              <Icon as={FaSave} mr={2} boxSize={3.5} />
              Save Preferences
            </Button>
          </PortalCard>

          <PortalCard>
            <Flex align="center" gap={2.5} mb={4}>
              <Icon as={FaLock} color="#4338CA" boxSize={4} />
              <Text fontSize="16px" fontWeight="800" color="#0F172A">
                Portal Access PIN
              </Text>
            </Flex>
            <Text fontSize="13px" color="#64748B" mb={5} lineHeight="1.6">
              An optional PIN adds an extra layer of privacy to your portal access.
              {settings?.hasPin
                ? " A PIN is currently active."
                : " No PIN is currently set."}
            </Text>

            <Flex direction="column" gap={4}>
              {settings?.hasPin && (
                <Box>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                    CURRENT PIN
                  </Text>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
                    style={fieldStyle}
                    placeholder="Enter current PIN"
                  />
                </Box>
              )}

              <Box>
                <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                  NEW PIN (4-6 DIGITS)
                </Text>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  style={fieldStyle}
                  placeholder="Leave blank to remove PIN"
                />
              </Box>

              <Box>
                <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                  CONFIRM NEW PIN
                </Text>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  style={fieldStyle}
                  placeholder="Re-enter new PIN"
                />
              </Box>

              <Button
                h="44px"
                bg="#10B981"
                color="white"
                borderRadius="xl"
                fontWeight="700"
                loading={savingPin}
                onClick={savePin}
              >
                <Icon as={FaSave} mr={2} boxSize={3.5} />
                {newPin ? "Save PIN" : settings?.hasPin ? "Remove PIN" : "Set PIN"}
              </Button>
            </Flex>

            <Box
              mt={5}
              p={4}
              borderRadius="xl"
              bg="#EEF2FF"
              color="#3730A3"
              fontSize="12px"
              lineHeight="1.6"
            >
              Keep your PIN private. The school registry can help you reset it if
              you forget it.
            </Box>
          </PortalCard>
        </SimpleGrid>
      )}
    </Box>
  );
};

export default StudentSettings;
