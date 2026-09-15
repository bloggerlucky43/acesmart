import { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
  Input,
  Spinner,
} from "@chakra-ui/react";
import {
  FaQrcode,
  FaCheckCircle,
  FaClock,
  FaShieldAlt,
  FaCamera,
  FaKey,
  FaStopCircle,
  FaPlay,
  FaExclamationCircle,
} from "react-icons/fa";
import { Html5Qrcode } from "html5-qrcode";
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

  // Live Camera Scanner States
  const [scannerStarted, setScannerStarted] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [startingCamera, setStartingCamera] = useState(false);
  const scannerRef = useRef(null);

  const institutionName = user?.institution?.name || "Institution";
  const institutionLogo = user?.institution?.logoUrl;
  const staffIdNumber = user?.staffIdNumber || "STAFF";

  // Stop camera when unmounting or switching to PIN mode
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn("Error stopping scanner:", err);
      }
      scannerRef.current = null;
    }
    setScannerStarted(false);
    setStartingCamera(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  useEffect(() => {
    if (clockInMode !== "scan") {
      stopScanner();
    }
  }, [clockInMode]);

  const handleProcessQrCode = async (decodedText) => {
    await stopScanner();
    setLoading(true);
    try {
      const res = await staffClockInApi({ qrPayload: decodedText });
      if (res.success) {
        setClockInResult(res.data);
        toaster.create({
          title: "Attendance Logged via QR Code!",
          description: res.message,
          type: "success",
        });
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Invalid or expired school attendance code",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    setCameraError("");
    setStartingCamera(true);

    try {
      await stopScanner();

      const qrScanner = new Html5Qrcode("staff-qr-reader");
      scannerRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleProcessQrCode(decodedText);
        },
        () => {
          // ignore transient frame decode failures
        }
      );

      setScannerStarted(true);
    } catch (err) {
      console.error("Camera scanner start failed:", err);
      // Fallback: try default camera if environment camera fails
      try {
        const qrScanner = new Html5Qrcode("staff-qr-reader");
        scannerRef.current = qrScanner;
        await qrScanner.start(
          { facingMode: "user" },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            handleProcessQrCode(decodedText);
          },
          () => {}
        );
        setScannerStarted(true);
      } catch (fallbackErr) {
        setCameraError(
          fallbackErr.message ||
            "Could not access camera. Please allow camera permissions or enter the 6-digit PIN."
        );
      }
    } finally {
      setStartingCamera(false);
    }
  };

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
                  minH="290px"
                  borderRadius="2xl"
                  bg="#0F172A"
                  overflow="hidden"
                  border="2px solid"
                  borderColor={scannerStarted ? "#10B981" : "#4338CA"}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  p={2}
                >
                  {/* The actual video element rendered by html5-qrcode */}
                  <div
                    id="staff-qr-reader"
                    style={{
                      width: "100%",
                      maxWidth: "340px",
                      display: scannerStarted ? "block" : "none",
                      borderRadius: "14px",
                      overflow: "hidden",
                    }}
                  />

                  {/* Fallback/Idle overlay when camera is not scanning */}
                  {!scannerStarted && (
                    <Flex
                      direction="column"
                      align="center"
                      justify="center"
                      p={6}
                      textAlign="center"
                    >
                      <Flex
                        w="56px"
                        h="56px"
                        borderRadius="2xl"
                        bg="#1E1B4B"
                        color="#818CF8"
                        align="center"
                        justify="center"
                        mb={3}
                      >
                        <Icon as={FaCamera} boxSize={6} />
                      </Flex>
                      <Text fontSize="15px" fontWeight="800" color="white">
                        Live Attendance Barcode Scanner
                      </Text>
                      <Text fontSize="12px" color="#94A3B8" mt={1} maxW="280px">
                        Click below to start your device camera and scan the school daily QR code terminal.
                      </Text>

                      {cameraError && (
                        <Box mt={3} p={3} borderRadius="xl" bg="#7F1D1D" color="#FCA5A5" fontSize="12px">
                          <Flex align="center" gap={1.5} justify="center">
                            <Icon as={FaExclamationCircle} />
                            <Text fontWeight="700">Camera Access Notice</Text>
                          </Flex>
                          <Text mt={1}>{cameraError}</Text>
                        </Box>
                      )}
                    </Flex>
                  )}

                  {/* Scanner Active indicator */}
                  {scannerStarted && (
                    <Badge
                      position="absolute"
                      top="12px"
                      bg="#065F46"
                      color="#34D399"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="11px"
                      fontWeight="700"
                      zIndex={10}
                    >
                      ● Camera Active &bull; Point at School Barcode
                    </Badge>
                  )}
                </Box>

                {/* Camera Control Action Buttons */}
                <Flex gap={3} mt={4}>
                  {!scannerStarted ? (
                    <Button
                      flex={1}
                      h="48px"
                      bg="linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)"
                      color="white"
                      borderRadius="xl"
                      fontSize="14px"
                      fontWeight="700"
                      boxShadow="0 4px 14px rgba(67, 56, 202, 0.35)"
                      _hover={{ opacity: 0.95 }}
                      onClick={startScanner}
                      loading={startingCamera || loading}
                      loadingText="Starting Camera..."
                    >
                      <Icon as={FaPlay} mr={2} boxSize={3.5} />
                      Start Camera & Scan
                    </Button>
                  ) : (
                    <Button
                      flex={1}
                      h="48px"
                      bg="#EF4444"
                      color="white"
                      borderRadius="xl"
                      fontSize="14px"
                      fontWeight="700"
                      boxShadow="0 4px 14px rgba(239, 68, 68, 0.3)"
                      _hover={{ bg: "#DC2626" }}
                      onClick={stopScanner}
                    >
                      <Icon as={FaStopCircle} mr={2} boxSize={4} />
                      Stop Camera
                    </Button>
                  )}
                </Flex>

                {cameraError && (
                  <Button
                    mt={3}
                    variant="ghost"
                    size="sm"
                    color="#6366F1"
                    onClick={() => setClockInMode("pin")}
                  >
                    Use Daily PIN instead &rarr;
                  </Button>
                )}
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
