import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Icon,
} from "@chakra-ui/react";
import {
  FaShieldAlt,
  FaKey,
  FaTimes,
  FaCheck,
  FaLock,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  getAdminPinStatusApi,
  verifyAdminPinApi,
  setupAdminPinApi,
} from "../../api-endpoint/sms/superAdminEndpoints";
import { toaster } from "../ui/toaster";

/**
 * Reusable SuperAdmin Master PIN Verification & Setup Modal
 * Ensures every critical change (Ghost Login, Tier Upgrade, System Configuration)
 * is safeguarded by the SuperAdmin's secret 4-6 digit numeric PIN.
 */
export default function AdminPinPromptModal({
  isOpen,
  onClose,
  onSuccess,
  actionTitle = "Confirm Critical Action",
  actionDescription = "Please enter your Master Security PIN to authorize this change.",
}) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasPin, setHasPin] = useState(null);
  const [isSetupMode, setIsSetupMode] = useState(false);

  // Setup form state
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [settingUp, setSettingUp] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setNewPin("");
      setConfirmPin("");
      checkPinStatus();
    }
  }, [isOpen]);

  const checkPinStatus = async () => {
    try {
      const res = await getAdminPinStatusApi();
      if (res.success) {
        setHasPin(res.hasPin);
        if (!res.hasPin) {
          setIsSetupMode(true);
        } else {
          setIsSetupMode(false);
        }
      }
    } catch (err) {
      console.error("Check PIN status error:", err);
      // Default to asking for PIN
      setHasPin(true);
      setIsSetupMode(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      toaster.create({ title: "PIN must be at least 4 digits", type: "warning" });
      return;
    }

    setLoading(true);
    try {
      const res = await verifyAdminPinApi(pin);
      if (res.success) {
        toaster.create({ title: "PIN Authorized!", type: "success" });
        onClose();
        if (onSuccess) onSuccess(pin);
      }
    } catch (err) {
      toaster.create({
        title: "PIN Verification Failed",
        description: err.response?.data?.message || "Incorrect Master PIN",
        type: "error",
      });
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    if (!newPin || newPin.length < 4 || newPin.length > 6 || !/^\d+$/.test(newPin)) {
      toaster.create({ title: "PIN must be 4 to 6 numbers", type: "warning" });
      return;
    }
    if (newPin !== confirmPin) {
      toaster.create({ title: "PINs do not match", type: "warning" });
      return;
    }

    setSettingUp(true);
    try {
      const res = await setupAdminPinApi({ pin: newPin });
      if (res.success) {
        toaster.create({
          title: "Master Security PIN Created!",
          description: "Your PIN is now active for all critical operations.",
          type: "success",
        });
        setHasPin(true);
        setIsSetupMode(false);
        onClose();
        if (onSuccess) onSuccess(newPin);
      }
    } catch (err) {
      toaster.create({
        title: "Setup Failed",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setSettingUp(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.85)"
      backdropFilter="blur(8px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={2000}
      p={4}
    >
      <Box
        bg="#111827"
        border="1px solid #374151"
        borderRadius="24px"
        w="100%"
        maxW="440px"
        p={6}
        boxShadow="0 25px 60px rgba(0, 0, 0, 0.6)"
      >
        {/* Header */}
        <Flex justify="space-between" align="center" mb={4} pb={3} borderBottom="1px solid #1F2937">
          <Flex align="center" gap={3}>
            <Box
              w="38px"
              h="38px"
              borderRadius="xl"
              bg={isSetupMode ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)"}
              display="flex"
              alignItems="center"
              justifyContent="center"
              color={isSetupMode ? "#F59E0B" : "#10B981"}
            >
              <Icon as={isSetupMode ? FaLock : FaShieldAlt} boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="16px" fontWeight="900" color="white">
                {isSetupMode ? "Set Up Master Security PIN" : actionTitle}
              </Text>
              <Text fontSize="11px" color="#94A3B8">
                AceSmart SuperAdmin Zero-Trust Authorization
              </Text>
            </Box>
          </Flex>
          <Button
            size="xs"
            variant="ghost"
            color="#94A3B8"
            p={1}
            onClick={onClose}
          >
            <Icon as={FaTimes} boxSize={3.5} />
          </Button>
        </Flex>

        {isSetupMode ? (
          /* Initial PIN Setup Form */
          <form onSubmit={handleSetupSubmit}>
            <Box
              bg="rgba(245, 158, 11, 0.08)"
              border="1px solid rgba(245, 158, 11, 0.2)"
              borderRadius="xl"
              p={3}
              mb={4}
            >
              <Flex gap={2}>
                <Icon as={FaExclamationTriangle} color="#F59E0B" mt={0.5} boxSize={4} />
                <Text fontSize="12px" color="#FDE68A">
                  You have not set up a Security PIN yet. Create a 4–6 digit numeric PIN to safeguard all critical actions.
                </Text>
              </Flex>
            </Box>

            <Box mb={3}>
              <Text fontSize="12px" fontWeight="700" color="#94A3B8" mb={1}>
                New Security PIN (4–6 Digits)
              </Text>
              <Input
                type="password"
                maxLength={6}
                placeholder="Enter 4 to 6 numbers"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                bg="#1E293B"
                border="1px solid #374151"
                color="white"
                borderRadius="xl"
                h="44px"
                fontSize="18px"
                letterSpacing="4px"
                textAlign="center"
                autoFocus
                required
              />
            </Box>

            <Box mb={5}>
              <Text fontSize="12px" fontWeight="700" color="#94A3B8" mb={1}>
                Confirm Security PIN
              </Text>
              <Input
                type="password"
                maxLength={6}
                placeholder="Re-enter PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                bg="#1E293B"
                border="1px solid #374151"
                color="white"
                borderRadius="xl"
                h="44px"
                fontSize="18px"
                letterSpacing="4px"
                textAlign="center"
                required
              />
            </Box>

            <Flex justify="flex-end" gap={2}>
              <Button
                variant="ghost"
                color="#94A3B8"
                borderRadius="xl"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                bg="#F59E0B"
                color="#000"
                borderRadius="xl"
                size="sm"
                px={5}
                fontWeight="800"
                loading={settingUp}
                _hover={{ bg: "#D97706" }}
              >
                Save & Proceed
              </Button>
            </Flex>
          </form>
        ) : (
          /* PIN Verification Form */
          <form onSubmit={handleVerifySubmit}>
            <Text fontSize="13px" color="#94A3B8" mb={4}>
              {actionDescription}
            </Text>

            <Box mb={5}>
              <Flex justify="center" mb={2}>
                <Input
                  type="password"
                  maxLength={6}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  bg="#1E293B"
                  border="2px solid #374151"
                  _focus={{ borderColor: "#10B981", boxShadow: "0 0 0 2px rgba(16,185,129,0.3)" }}
                  color="#10B981"
                  borderRadius="2xl"
                  h="56px"
                  maxW="220px"
                  fontSize="28px"
                  letterSpacing="8px"
                  textAlign="center"
                  fontWeight="900"
                  autoFocus
                  required
                />
              </Flex>
              <Text fontSize="11px" color="#64748B" textAlign="center">
                Enter your 4–6 digit Master Security PIN
              </Text>
            </Box>

            <Flex justify="space-between" align="center" mt={4} pt={3} borderTop="1px solid #1F2937">
              <Button
                size="xs"
                variant="ghost"
                color="#38BDF8"
                onClick={() => setIsSetupMode(true)}
              >
                Change / Reset PIN
              </Button>

              <Flex gap={2}>
                <Button
                  variant="ghost"
                  color="#94A3B8"
                  borderRadius="xl"
                  size="sm"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  bg="#10B981"
                  color="white"
                  borderRadius="xl"
                  size="sm"
                  px={5}
                  fontWeight="800"
                  loading={loading}
                  _hover={{ bg: "#059669" }}
                  disabled={!pin || pin.length < 4}
                >
                  Authorize
                </Button>
              </Flex>
            </Flex>
          </form>
        )}
      </Box>
    </Box>
  );
}
