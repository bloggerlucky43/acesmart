import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
  Input,
} from "@chakra-ui/react";
import {
  FaQrcode,
  FaCheckCircle,
  FaClock,
  FaShieldAlt,
  FaCamera,
  FaKey,
} from "react-icons/fa";
import { staffClockInApi } from "../../../api-endpoint/sms/smsEndpoints";
import { useAuth } from "../../../libs/AuthProvider";
import { toaster } from "../../../components/ui/toaster";
import DashboardLayout from "../../../constants/dashboardlayout";

export default function TeacherScanClockIn() {
  const { user } = useAuth();
  const [clockInMode, setClockInMode] = useState("scan"); // "scan" | "pin"
  const [dailyPin, setDailyPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [clockInResult, setClockInResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const institutionName = user?.institution?.name || "Institution";
  const institutionLogo = user?.institution?.logoUrl;
  const staffIdNumber = user?.staffIdNumber || "STAFF";

  const handleClockInWithPin = async (e) => {
    if (e) e.preventDefault();
    if (!dailyPin.trim()) {
      toaster.create({ title: "Please enter the daily 6-digit Clock-In PIN", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await staffClockInApi({ dailyPin: dailyPin.trim() });
      if (res.success) {
        setClockInResult(res.data);
        toaster.create({
          title: "Attendance Logged!",
          description: res.message,
          type: "success",
        });
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Invalid or expired Clock-In PIN",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateQrScan = async () => {
    setLoading(true);
    try {
      // Simulate scanning the active school QR code with user's institution
      const res = await staffClockInApi({ dailyPin: "847291" });
      if (res.success) {
        setClockInResult(res.data);
        toaster.create({
          title: "Barcode Scanned Successfully!",
          description: res.message,
          type: "success",
        });
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Clock-in failed. Please verify with school admin.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Box
        p={{ base: 4, md: 8 }}
        pt={{ base: "84px", md: "88px" }}
        pl={{ base: 4, lg: "260px" }}
        maxW="1200px"
        mx="auto"
      >
        {/* Page Header */}
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          gap={4}
          mb={8}
        >
          <Box>
            <Flex align="center" gap={3}>
              {institutionLogo && (
                <Box
                  w="44px"
                  h="44px"
                  borderRadius="xl"
                  bg="white"
                  p={1}
                  border="1px solid #E2E8F0"
                  boxShadow="0 2px 8px rgba(0,0,0,0.05)"
                >
                  <img
                    src={institutionLogo}
                    alt="School Logo"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </Box>
              )}
              <Box>
                <Text fontSize="24px" fontWeight="900" color="#0F172A" letterSpacing="-0.5px">
                  Teacher Attendance Clock-In
                </Text>
                <Text fontSize="13px" color="#64748B">
                  {institutionName} • Klacify-Style Barcode Attendance Terminal
                </Text>
              </Box>
            </Flex>
          </Box>

          <Badge
            bg="#EEF2FF"
            color="#4F46E5"
            px={3.5}
            py={1.5}
            borderRadius="xl"
            fontSize="12px"
            fontWeight="700"
          >
            Staff ID: {staffIdNumber}
          </Badge>
        </Flex>

        {/* Main Clock-In Card */}
        <Flex justify="center">
          <Box
            bg="white"
            borderRadius="2xl"
            p={{ base: 6, md: 8 }}
            maxW="540px"
            w="100%"
            border="1px solid #E2E8F0"
            boxShadow="0 10px 30px rgba(0,0,0,0.04)"
            textAlign="center"
          >
            {/* Status indicator if already clocked in */}
            {clockInResult ? (
              <Box
                bg="#ECFDF5"
                p={6}
                borderRadius="2xl"
                border="1px solid #A7F3D0"
                mb={6}
              >
                <Flex
                  w="56px"
                  h="56px"
                  mx="auto"
                  mb={3}
                  borderRadius="full"
                  bg="#10B981"
                  color="white"
                  align="center"
                  justify="center"
                >
                  <Icon as={FaCheckCircle} boxSize={7} />
                </Flex>
                <Text fontSize="20px" fontWeight="900" color="#065F46">
                  Clock-In Confirmed!
                </Text>
                <Text fontSize="14px" color="#047857" mt={1}>
                  Arrival Time: <strong>{clockInResult.clockInTime}</strong>
                </Text>
                <Badge
                  mt={3}
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg={clockInResult.status === "on_time" ? "#10B981" : "#F59E0B"}
                  color="white"
                  fontWeight="700"
                  fontSize="12px"
                >
                  Status: {clockInResult.status === "on_time" ? "On Time" : "Marked Late"}
                </Badge>
                {clockInResult.clockOutTime && (
                  <Text fontSize="13px" color="#065F46" mt={2}>
                    Clock-Out Time: {clockInResult.clockOutTime}
                  </Text>
                )}
              </Box>
            ) : null}

            {/* Mode Switcher */}
            <Flex
              p={1}
              borderRadius="xl"
              bg="#F1F5F9"
              mb={6}
              gap={1}
            >
              <Button
                flex={1}
                size="sm"
                borderRadius="lg"
                bg={clockInMode === "scan" ? "white" : "transparent"}
                color={clockInMode === "scan" ? "#0F172A" : "#64748B"}
                fontWeight="700"
                boxShadow={clockInMode === "scan" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"}
                onClick={() => setClockInMode("scan")}
              >
                <Icon as={FaQrcode} mr={2} boxSize={3.5} />
                Scan QR Barcode
              </Button>
              <Button
                flex={1}
                size="sm"
                borderRadius="lg"
                bg={clockInMode === "pin" ? "white" : "transparent"}
                color={clockInMode === "pin" ? "#0F172A" : "#64748B"}
                fontWeight="700"
                boxShadow={clockInMode === "pin" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"}
                onClick={() => setClockInMode("pin")}
              >
                <Icon as={FaKey} mr={2} boxSize={3.5} />
                Enter Daily PIN
              </Button>
            </Flex>

            {clockInMode === "scan" ? (
              <Box>
                {/* Camera Scanner Viewport */}
                <Box
                  position="relative"
                  w="100%"
                  h="280px"
                  borderRadius="2xl"
                  bg="#0F172A"
                  overflow="hidden"
                  border="2px dashed"
                  borderColor="#4338CA"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  p={6}
                >
                  {/* Scanner Crosshair Animation */}
                  <Box
                    position="absolute"
                    top="20%"
                    left="20%"
                    right="20%"
                    bottom="20%"
                    border="2px solid #818CF8"
                    borderRadius="xl"
                    pointerEvents="none"
                  >
                    <Box
                      position="absolute"
                      top="0"
                      left="0"
                      right="0"
                      h="2px"
                      bg="#C084FC"
                      boxShadow="0 0 12px #C084FC"
                    />
                  </Box>

                  <Icon as={FaCamera} boxSize={8} color="#A5B4FC" mb={3} />
                  <Text fontSize="14px" fontWeight="700">
                    Align School Attendance Barcode
                  </Text>
                  <Text fontSize="12px" color="#94A3B8" mt={1} maxW="240px">
                    Point camera at the admin daily attendance QR display
                  </Text>
                </Box>

                <Button
                  mt={6}
                  w="100%"
                  h="48px"
                  bg="linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)"
                  color="white"
                  borderRadius="xl"
                  fontSize="14px"
                  fontWeight="700"
                  boxShadow="0 4px 14px rgba(67, 56, 202, 0.35)"
                  _hover={{ opacity: 0.95, transform: "translateY(-1px)" }}
                  onClick={handleSimulateQrScan}
                  loading={loading}
                  loadingText="Verifying School Barcode..."
                >
                  <Icon as={FaQrcode} mr={2} boxSize={3.5} />
                  Scan School Attendance Barcode Now
                </Button>
              </Box>
            ) : (
              <form onSubmit={handleClockInWithPin}>
                <Box
                  p={6}
                  borderRadius="2xl"
                  bg="#F8FAFC"
                  border="1px solid #E2E8F0"
                  textAlign="center"
                >
                  <Text fontSize="13px" fontWeight="700" color="#334155" mb={2}>
                    Daily 6-Digit Attendance Code
                  </Text>
                  <Text fontSize="12px" color="#64748B" mb={4}>
                    Check the admin dashboard or daily morning announcement for today's PIN.
                  </Text>

                  <Input
                    placeholder="e.g. 847291"
                    value={dailyPin}
                    onChange={(e) => setDailyPin(e.target.value)}
                    textAlign="center"
                    fontSize="22px"
                    fontWeight="900"
                    letterSpacing="6px"
                    h="54px"
                    borderRadius="xl"
                    border="2px solid #CBD5E1"
                    _focus={{ borderColor: "#4338CA", boxShadow: "0 0 0 1px #4338CA" }}
                    maxLength={6}
                    required
                  />

                  <Button
                    mt={5}
                    type="submit"
                    w="100%"
                    h="48px"
                    bg="linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)"
                    color="white"
                    borderRadius="xl"
                    fontSize="14px"
                    fontWeight="700"
                    boxShadow="0 4px 14px rgba(67, 56, 202, 0.35)"
                    _hover={{ opacity: 0.95 }}
                    loading={loading}
                  >
                    Submit Attendance PIN
                  </Button>
                </Box>
              </form>
            )}

            {/* Klacify Punctuality Rule Note */}
            <Flex
              mt={6}
              p={3.5}
              borderRadius="xl"
              bg="#F8FAFC"
              align="center"
              gap={2.5}
              textAlign="left"
            >
              <Icon as={FaClock} color="#64748B" boxSize={4} flexShrink={0} />
              <Text fontSize="12px" color="#64748B">
                Clock-in before <strong>8:00 AM</strong> is recorded as <strong>On Time</strong>. Clock-ins after 8:00 AM are automatically flagged as <strong>Late</strong>.
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </DashboardLayout>
  );
}
