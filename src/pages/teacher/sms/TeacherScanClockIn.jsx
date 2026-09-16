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
  FaSignOutAlt,
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
  const [serverWindow, setServerWindow] = useState(null);

  // Live Camera Scanner States
  const [scannerStarted, setScannerStarted] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [startingCamera, setStartingCamera] = useState(false);
  const scannerRef = useRef(null);

  const institutionName = user?.institution?.name || "Institution";
  const institutionLogo = user?.institution?.logoUrl;
  const staffIdNumber = user?.staffIdNumber || "STAFF";

  const schoolStartTime = user?.institution?.schoolStartTime || null;
  const schoolClosingTime = user?.institution?.schoolClosingTime || null;

  // Prefer the window the server enforced on the last request over the cached login snapshot
  const attendanceWindow = serverWindow || {
    punctualityEnabled: Boolean(schoolStartTime),
    schoolStartTime,
    schoolClosingTime,
  };

  const applyWindowMeta = (data) => {
    if (data?.punctualityEnabled === undefined) return;
    setServerWindow({
      punctualityEnabled: data.punctualityEnabled,
      schoolStartTime: data.schoolStartTime || null,
      schoolClosingTime: data.schoolClosingTime || null,
    });
  };

  const formatTimeLabel = (value) => {
    if (!value) return null;
    const match = String(value).trim().match(/^(\d{1,2}):(\d{2})/);
    if (!match) return String(value);

    const hours24 = parseInt(match[1], 10);
    const minutes = match[2];
    const meridiem = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    return `${hours12}:${minutes} ${meridiem}`;
  };

  const punctualityEnabled = attendanceWindow.punctualityEnabled;
  const startTimeLabel = formatTimeLabel(attendanceWindow.schoolStartTime);
  const closingTimeLabel = formatTimeLabel(attendanceWindow.schoolClosingTime);

  const isClockOut = Boolean(clockInResult?.clockOutTime);

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

  // Defensive: some browsers leave the injected <video> without a usable size
  // (which shows up as a fully black viewport). Force it visible and playing.
  useEffect(() => {
    if (!scannerStarted) return;
    const video = document.querySelector("#staff-qr-reader video");
    if (!video) return;
    video.setAttribute("playsinline", "true");
    video.style.width = "100%";
    video.style.height = "auto";
    video.style.maxHeight = "360px";
    video.style.objectFit = "cover";
    video.style.background = "#000";
    const playPromise = video.play();
    if (playPromise?.catch) playPromise.catch(() => {});
  }, [scannerStarted]);

  const handleProcessQrCode = async (decodedText) => {
    await stopScanner();
    setLoading(true);
    try {
      const res = await staffClockInApi({ qrPayload: decodedText });
      if (res.success) {
        setClockInResult(res.data);
        applyWindowMeta(res.data);
        toaster.create({
          title: "Attendance Logged via QR Code!",
          description: res.message,
          type: "success",
        });
      }
    } catch (error) {
      const payload = error.response?.data;
      if (payload?.data?.clockOutTime) {
        setClockInResult(payload.data);
      }
      applyWindowMeta(payload?.data);
      toaster.create({
        title: payload?.message || "Invalid or expired school attendance code",
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
          disableFlip: false,
          videoConstraints: {
            facingMode: "environment",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
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
            disableFlip: true,
            videoConstraints: {
              facingMode: "user",
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
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
        applyWindowMeta(res.data);
        toaster.create({
          title: "Attendance Logged!",
          description: res.message,
          type: "success",
        });
      }
    } catch (error) {
      const payload = error.response?.data;
      if (payload?.data?.clockOutTime) {
        setClockInResult(payload.data);
      }
      applyWindowMeta(payload?.data);
      toaster.create({
        title: payload?.message || "Invalid or expired Clock-In PIN",
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
                bg={isClockOut ? "#EEF2FF" : "#ECFDF5"}
                p={6}
                borderRadius="2xl"
                border="1px solid"
                borderColor={isClockOut ? "#C7D2FE" : "#A7F3D0"}
                mb={6}
              >
                <Flex
                  w="56px"
                  h="56px"
                  mx="auto"
                  mb={3}
                  borderRadius="full"
                  bg={isClockOut ? "#4338CA" : "#10B981"}
                  color="white"
                  align="center"
                  justify="center"
                >
                  <Icon as={isClockOut ? FaSignOutAlt : FaCheckCircle} boxSize={7} />
                </Flex>
                <Text fontSize="20px" fontWeight="900" color={isClockOut ? "#312E81" : "#065F46"}>
                  {isClockOut ? "Clock-Out Confirmed!" : "Clock-In Confirmed!"}
                </Text>
                <Text fontSize="14px" color={isClockOut ? "#3730A3" : "#047857"} mt={1}>
                  {isClockOut ? "Sign-Out Time: " : "Arrival Time: "}
                  <strong>{isClockOut ? clockInResult.clockOutTime : clockInResult.clockInTime}</strong>
                </Text>

                {isClockOut ? (
                  <Text fontSize="13px" color="#4338CA" mt={2}>
                    Signed in at <strong>{clockInResult.clockInTime}</strong>. Your attendance for today is complete
                    and the terminal is closed for you until tomorrow.
                  </Text>
                ) : (
                  <>
                    <Badge
                      mt={3}
                      px={3}
                      py={1}
                      borderRadius="full"
                      bg={
                        !punctualityEnabled
                          ? "#4338CA"
                          : clockInResult.status === "on_time"
                          ? "#10B981"
                          : "#F59E0B"
                      }
                      color="white"
                      fontWeight="700"
                      fontSize="12px"
                    >
                      Status:{" "}
                      {!punctualityEnabled
                        ? "Signed In"
                        : clockInResult.status === "on_time"
                        ? "On Time"
                        : "Marked Late"}
                    </Badge>
                    <Text fontSize="12px" color="#047857" mt={3}>
                      Scan again when leaving to record your clock-out time for today.
                    </Text>
                  </>
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
                  {/* The actual video element rendered by html5-qrcode.
                      NOTE: this container must stay visible (never display:none) while
                      qrScanner.start() runs, otherwise html5-qrcode measures a 0px width
                      and renders a black/dead video. */}
                  <div
                    id="staff-qr-reader"
                    style={{
                      width: "100%",
                      maxWidth: "340px",
                      minHeight: scannerStarted ? undefined : "260px",
                      borderRadius: "14px",
                      overflow: "hidden",
                    }}
                  />

                  {/* Idle overlay when camera is not scanning (layered on top, does not hide the container) */}
                  {!scannerStarted && (
                    <Flex
                      position="absolute"
                      inset={0}
                      bg="#0F172A"
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

            {/* Institution Attendance Window Note */}
            <Flex
              mt={6}
              p={3.5}
              borderRadius="xl"
              bg="#F8FAFC"
              align="flex-start"
              gap={2.5}
              textAlign="left"
            >
              <Icon as={FaClock} color="#64748B" boxSize={4} flexShrink={0} mt={0.5} />
              <Box>
                {punctualityEnabled ? (
                  <Text fontSize="12px" color="#64748B">
                    Clock-ins after <strong>{startTimeLabel}</strong> are flagged <strong>Late</strong>. You can clock
                    in and clock out once per day.
                  </Text>
                ) : (
                  <Text fontSize="12px" color="#64748B">
                    You can clock in and clock out once per day. Arrival times are recorded without a Late flag.
                  </Text>
                )}
                {closingTimeLabel && (
                  <Text fontSize="12px" color="#64748B" mt={1}>
                    Expected closing time: <strong>{closingTimeLabel}</strong>.
                  </Text>
                )}
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </DashboardLayout>
  );
}
