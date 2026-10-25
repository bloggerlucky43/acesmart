import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Flex, Text, Button, Badge, Input, Spinner } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import DashboardLayout from "../../../constants/dashboardlayout";
import { useAuth } from "../../../libs/AuthProvider";
import {
  getGateSettingsApi,
  getGateArrivalsApi,
  recordGateArrivalApi,
  generateGuardianAccessApi,
} from "../../../api-endpoint/sms/gateAttendanceEndpoints";

const readerId = "student-gate-qr-reader";
const cooldownMs = 5000;
const scannerReaders = new WeakMap();

function watDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const value = (type) => parts.find((part) => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function arrivalTime(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "Time unavailable";
  return `${new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).format(date)} WAT`;
}

function isSavedArrival(row) {
  const arrival = row?.arrival;
  const timestamp = new Date(arrival?.arrivedAt);
  return Boolean(arrival?.id && row?.student?.id && row.student.studentCode
    && /^\d{4}-\d{2}-\d{2}$/.test(arrival.date)
    && typeof arrival.arrivedAt === "string" && /(?:Z|[+-]\d{2}:\d{2})$/.test(arrival.arrivedAt)
    && Number.isFinite(timestamp.getTime()) && watDate(timestamp) === arrival.date);
}

async function disposeScanner(scanner) {
  if (!scanner) return;
  // Retain the reader while mounted so detached video tracks can still be stopped.
  const reader = scannerReaders.get(scanner) || document.getElementById(readerId);
  const tracks = [...(reader?.querySelectorAll("video") || [])]
    .flatMap((video) => video.srcObject?.getTracks?.() || []);
  try {
    if (scanner.isScanning) await scanner.stop();
  } catch {
    // Stop any remaining tracks even if the library's teardown fails.
  } finally {
    tracks.forEach((track) => track.stop());
    try { await scanner.clear(); } catch { /* A removed reader is already cleared. */ }
    scannerReaders.delete(scanner);
  }
}

function StudentPhoto({ student, size = "64px" }) {
  const [failed, setFailed] = useState(false);
  return (
    <Flex w={size} h={size} flexShrink={0} borderRadius="xl" bg="#EEF2FF" color="#4338CA" align="center" justify="center" overflow="hidden" fontWeight="900" fontSize="22px">
      {student?.faceImageUrl && !failed ? (
        <img src={student.faceImageUrl} alt={`${student.fullName || "Student"} photo`} onError={() => setFailed(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (student?.fullName || "?").slice(0, 1)}
    </Flex>
  );
}

export default function StudentGateCheckIn() {
  const { user } = useAuth();
  const isAdmin = ["institution_admin", "institution", "admin"].includes(user?.role);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reload, setReload] = useState(0);
  const [date, setDate] = useState(watDate);
  const [arrivals, setArrivals] = useState([]);
  const [totalCount, setTotalCount] = useState(null);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [cameraStatus, setCameraStatus] = useState("idle");
  const [cameraError, setCameraError] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [selected, setSelected] = useState(null);
  const [guardian, setGuardian] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [guardianError, setGuardianError] = useState("");
  const mountedRef = useRef(false);
  const lifetimeRef = useRef(0);
  const settingsRef = useRef(null);
  const scannerRef = useRef(null);
  const cameraGenerationRef = useRef(0);
  const cameraStatusRef = useRef("idle");
  const cameraOperationRef = useRef(Promise.resolve());
  const inFlightRef = useRef(false);
  const cooldownRef = useRef(new Map());
  const guardianRef = useRef(false);
  const listRevisionRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      lifetimeRef.current += 1;
      cameraGenerationRef.current += 1;
      cameraOperationRef.current = cameraOperationRef.current.then(async () => {
        const scanner = scannerRef.current;
        await disposeScanner(scanner);
        if (scannerRef.current === scanner) scannerRef.current = null;
      });
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    getGateSettingsApi()
      .then((response) => {
        if (!response?.success || !response.data) throw new Error(response?.message || "Could not load gate settings.");
        if (!active) return;
        settingsRef.current = response.data;
        setSettings(response.data);
      })
      .catch((error) => {
        if (active) setLoadError(error.response?.data?.message || error.message || "Could not load gate settings.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]);

  const enabled = settings?.gateCheckInEnabled === true;

  useEffect(() => {
    if (!enabled || !date) return;
    let active = true;
    const revision = ++listRevisionRef.current;
    setListLoading(true);
    setListError("");
    getGateArrivalsApi(date)
      .then((response) => {
        if (!response?.success || !Array.isArray(response.data?.arrivals) || !response.data.arrivals.every(isSavedArrival)) throw new Error(response?.message || "Could not load recent arrivals.");
        if (!active || revision !== listRevisionRef.current) return;
        setArrivals(response.data.arrivals);
        setTotalCount(Number.isInteger(response.data.totalCount) ? response.data.totalCount : null);
      })
      .catch((error) => {
        if (!active || revision !== listRevisionRef.current) return;
        setListError(error.response?.data?.message || error.message || "Could not load recent arrivals.");
        if (error.response?.data?.code === "GATE_CHECK_IN_DISABLED") {
          settingsRef.current = { ...settingsRef.current, gateCheckInEnabled: false };
          setSettings((previous) => ({ ...previous, gateCheckInEnabled: false }));
        }
      })
      .finally(() => { if (active && revision === listRevisionRef.current) setListLoading(false); });
    return () => { active = false; };
  }, [date, enabled, refresh]);

  const stopCamera = useCallback(() => {
    if (cameraStatusRef.current === "idle" || cameraStatusRef.current === "stopping") return cameraOperationRef.current;
    const generation = ++cameraGenerationRef.current;
    cameraStatusRef.current = "stopping";
    if (mountedRef.current) setCameraStatus("stopping");
    cameraOperationRef.current = cameraOperationRef.current.then(async () => {
      const scanner = scannerRef.current;
      await disposeScanner(scanner);
      if (scannerRef.current === scanner) scannerRef.current = null;
      if (mountedRef.current && generation === cameraGenerationRef.current) {
        cameraStatusRef.current = "idle";
        setCameraStatus("idle");
      }
    });
    return cameraOperationRef.current;
  }, []);

  useEffect(() => {
    if (!enabled || document.visibilityState === "hidden") {
      if (cameraStatusRef.current === "starting" || cameraStatusRef.current === "scanning") void stopCamera();
      return;
    }
    const onHidden = () => {
      if (document.visibilityState === "hidden") void stopCamera();
    };
    const onPageHide = () => { void stopCamera(); };
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [enabled, stopCamera]);

  const processCode = async (text, source) => {
    if (!mountedRef.current || !settingsRef.current?.gateCheckInEnabled || inFlightRef.current || guardianRef.current) return;
    const studentCode = String(text || "").trim();
    if (!studentCode) return;
    const now = Date.now();
    if (source === "qr" && (cooldownRef.current.get(studentCode) || 0) > now) return;
    // Both guards are synchronous, before dispatch: repeated camera frames cannot queue POSTs.
    inFlightRef.current = true;
    for (const [code, expires] of cooldownRef.current) {
      if (expires <= now) cooldownRef.current.delete(code);
    }
    cooldownRef.current.set(studentCode, now + cooldownMs);
    const lifetime = lifetimeRef.current;
    setProcessing(true);
    setFeedback({ type: "pending", title: "Checking with the server...", message: "Do not assume the arrival is saved until confirmed." });
    setSelected(null);
    setGuardian(null);
    setGuardianError("");
    try {
      const response = await recordGateArrivalApi({ studentCode, source });
      if (!response?.success || !isSavedArrival(response.data) || response.data.student.studentCode !== studentCode) {
        throw new Error(response?.message || "The server did not confirm a saved arrival.");
      }
      if (!mountedRef.current || lifetime !== lifetimeRef.current) return;
      const row = response.data;
      setSelected(row);
      setFeedback({
        type: response.duplicate ? "duplicate" : "success",
        title: response.duplicate ? "Already checked in today" : "Arrival saved",
        message: response.duplicate ? "The original arrival time is unchanged. No second arrival or new notification was created by this scan." : "Server confirmed. Verify the student's photo and details, then scan the next student.",
      });
      setManualCode("");
      listRevisionRef.current += 1;
      setDate(row.arrival.date);
      setRefresh((value) => value + 1);
    } catch (error) {
      if (!mountedRef.current || lifetime !== lifetimeRef.current) return;
      const payload = error.response?.data;
      setFeedback({
        type: "error",
        title: "Arrival not confirmed saved",
        message: `${payload?.message || error.message || "Could not save this arrival."} Do not mark this scan as saved. Check recent arrivals and retry if needed.`,
      });
      if (payload?.code === "GATE_CHECK_IN_DISABLED") {
        stopCamera();
        settingsRef.current = { ...settingsRef.current, gateCheckInEnabled: false };
        setSettings((previous) => ({ ...previous, gateCheckInEnabled: false }));
      }
    } finally {
      cooldownRef.current.set(studentCode, Date.now() + cooldownMs);
      inFlightRef.current = false;
      if (mountedRef.current && lifetime === lifetimeRef.current) setProcessing(false);
    }
  };

  const startCamera = () => {
    if (!enabled || guardianRef.current || cameraStatusRef.current !== "idle") return;
    const generation = ++cameraGenerationRef.current;
    const valid = () => mountedRef.current && generation === cameraGenerationRef.current;
    cameraStatusRef.current = "starting";
    setCameraStatus("starting");
    setCameraError("");
    cameraOperationRef.current = cameraOperationRef.current.then(async () => {
      if (!valid()) return;
      for (const facingMode of ["environment", "user"]) {
        let scanner;
        try {
          scanner = new Html5Qrcode(readerId, false);
          scannerReaders.set(scanner, document.getElementById(readerId));
          scannerRef.current = scanner;
          await scanner.start(
            { facingMode: facingMode === "environment" ? { exact: "environment" } : "user" },
            { fps: 10, qrbox: (width, height) => ({ width: Math.min(240, width * 0.8, height * 0.8), height: Math.min(240, width * 0.8, height * 0.8) }), disableFlip: facingMode === "environment" },
            (decodedText) => {
              if (valid() && scannerRef.current === scanner && cameraStatusRef.current === "scanning") {
                void processCode(decodedText, "qr");
              }
            },
            () => {}
          );
          if (!valid()) {
            await disposeScanner(scanner);
            if (scannerRef.current === scanner) scannerRef.current = null;
            return;
          }
          const video = document.getElementById(readerId)?.querySelector("video");
          if (video) {
            video.setAttribute("playsinline", "true");
            Object.assign(video.style, { width: "100%", height: "auto", maxHeight: "360px", objectFit: "cover" });
            video.play()?.catch(() => {});
            for (const track of video.srcObject?.getTracks?.() || []) {
              track.addEventListener("ended", () => {
                if (!valid() || scannerRef.current !== scanner) return;
                setCameraError("The camera connection ended. Start the camera again or enter the student code below.");
                void stopCamera();
              }, { once: true });
            }
          }
          cameraStatusRef.current = "scanning";
          setCameraStatus("scanning");
          return;
        } catch (error) {
          await disposeScanner(scanner);
          if (scannerRef.current === scanner) scannerRef.current = null;
          if (!valid()) return;
          if (facingMode === "user") {
            const detail = typeof error === "string" ? error : error?.message;
            setCameraError(`Could not access a camera. Allow camera permission in your browser and use HTTPS (or localhost). You can enter the student code below instead.${detail ? ` Camera: ${detail}` : ""}`);
          }
        }
      }
      if (valid()) {
        cameraStatusRef.current = "idle";
        setCameraStatus("idle");
      }
    });
  };

  const openGuardian = () => {
    if (!selected?.student?.id || inFlightRef.current || guardianRef.current) return;
    guardianRef.current = true;
    void stopCamera();
    setGuardian({ student: selected.student, accessCode: null });
    setGuardianError("");
  };

  const closeGuardian = () => {
    if (generating) return;
    guardianRef.current = false;
    setGuardian(null);
    setGuardianError("");
  };

  const generateAccess = async () => {
    if (!guardian?.student?.id || generating) return;
    const lifetime = lifetimeRef.current;
    const student = guardian.student;
    setGenerating(true);
    setGuardianError("");
    try {
      const response = await generateGuardianAccessApi(student.id);
      if (!response?.success || !response.data?.accessCode || response.data.studentCode !== student.studentCode) {
        throw new Error(response?.message || "The server did not confirm the private activation code.");
      }
      if (!mountedRef.current || lifetime !== lifetimeRef.current) return;
      setGuardian({ student, accessCode: response.data.accessCode });
    } catch (error) {
      if (mountedRef.current && lifetime === lifetimeRef.current) {
        setGuardianError(`${error.response?.data?.message || error.message || "Code generation was not confirmed."} Do not distribute an unconfirmed code. A retry will replace any previously issued code and revoke existing access.`);
      }
    } finally {
      if (mountedRef.current && lifetime === lifetimeRef.current) setGenerating(false);
    }
  };

  const feedbackColors = feedback?.type === "error" ? ["#FEF2F2", "#991B1B"] : feedback?.type === "success" ? ["#ECFDF5", "#065F46"] : ["#EEF2FF", "#3730A3"];

  return (
    <DashboardLayout>
      <Box p={{ base: 4, md: 8 }} pt={{ base: "84px", md: "88px" }} pl={{ base: 4, lg: "260px" }} maxW="1350px" mx="auto">
        <Flex direction={{ base: "column", md: "row" }} justify="space-between" gap={4} mb={6}>
          <Box>
            <Text as="h1" fontSize={{ base: "22px", md: "24px" }} fontWeight="900" color="#0F172A">Student Gate Arrivals</Text>
            <Text fontSize="13px" color="#64748B" mt={1}>{settings?.institutionName || "Your school"} | Arrival only, no checkout</Text>
          </Box>
          <Flex gap={2} flexWrap="wrap">
            <Button asChild variant="outline" borderRadius="xl" color="#4338CA"><Link to="/teacher/attendance">Manual Attendance Register</Link></Button>
            {isAdmin && <Button asChild variant="ghost" borderRadius="xl" color="#4338CA"><Link to="/institution/gate-check-in">Gate Settings</Link></Button>}
          </Flex>
        </Flex>

        {loading ? (
          <Flex p={6} gap={3} align="center"><Spinner size="sm" /><Text>Loading gate settings...</Text></Flex>
        ) : loadError ? (
          <Box role="alert" p={5} bg="#FEF2F2" color="#991B1B" borderRadius="xl"><Text>{loadError}</Text><Button mt={3} variant="outline" onClick={() => setReload((value) => value + 1)}>Retry Settings</Button></Box>
        ) : !enabled ? (
          <Box bg="white" p={{ base: 5, md: 8 }} border="1px solid #E2E8F0" borderRadius="2xl">
            <Badge bg="#F1F5F9" color="#475569" borderRadius="full" px={3} py={1}>Gate check-in OFF</Badge>
            <Text fontSize="18px" fontWeight="800" color="#0F172A" mt={4}>Optional gate arrivals are disabled for this school</Text>
            <Text fontSize="14px" color="#64748B" mt={2}>No camera will start. Continue using the existing manual attendance register. A school administrator can enable gate arrivals, AM sync, and parent notifications independently.</Text>
            {isAdmin ? <Button asChild mt={4} bg="#4338CA" color="white" borderRadius="xl"><Link to="/institution/gate-check-in">Open Gate Settings</Link></Button> : <Text mt={4} fontSize="13px" color="#4338CA">Ask your school administrator to review Gate Check-In Settings.</Text>}
            {feedback?.type === "error" && <Text role="alert" mt={4} color="#991B1B">{feedback.message}</Text>}
          </Box>
        ) : (
          <>
            <Flex gap={3} flexWrap="wrap" mb={5}>
              <Badge bg="#ECFDF5" color="#065F46" px={3} py={2} borderRadius="xl">Gate arrivals ON</Badge>
              <Badge bg={settings.gateAttendanceSyncEnabled ? "#EEF2FF" : "#F1F5F9"} color="#475569" px={3} py={2} borderRadius="xl">AM sync {settings.gateAttendanceSyncEnabled ? "ON" : "OFF (manual register unchanged)"}</Badge>
              <Badge bg={settings.gateNotificationsEnabled ? "#EEF2FF" : "#F1F5F9"} color="#475569" px={3} py={2} borderRadius="xl">Parent inbox notices {settings.gateNotificationsEnabled ? "ON" : "OFF"}</Badge>
            </Flex>
            <Flex direction={{ base: "column", xl: "row" }} gap={5} align="stretch">
              <Box flex="1" minW={0} bg="white" border="1px solid #E2E8F0" p={{ base: 4, md: 5 }} borderRadius="2xl">
                <Text fontWeight="800" fontSize="16px" color="#0F172A">Scan student ID cards</Text>
                <Text fontSize="13px" color="#64748B" mt={1} mb={4}>Use the printed student QR code, not the school's staff clock-in code. Check the student's photo. A copied QR is not proof of identity.</Text>
                <Box position="relative" minH="280px" bg="#0F172A" borderRadius="xl" overflow="hidden" p={2}>
                  {/* Keep the reader mounted and measurable through start/stop, never display:none. */}
                  <div id={readerId} style={{ width: "100%", maxWidth: "420px", minHeight: "260px", margin: "0 auto", overflow: "hidden" }} />
                  {cameraStatus !== "scanning" && (
                    <Flex position="absolute" inset={0} direction="column" align="center" justify="center" p={5} textAlign="center" pointerEvents="none" bg="#0F172A">
                      <Text color="white" fontWeight="800">{cameraStatus === "starting" ? "Starting camera..." : cameraStatus === "stopping" ? "Stopping camera..." : "Camera stopped"}</Text>
                      <Text fontSize="13px" color="#94A3B8" mt={2}>Rear camera preferred, front camera fallback. No QR image uploads.</Text>
                    </Flex>
                  )}
                  {cameraStatus === "scanning" && <Badge position="absolute" top={3} left={3} bg="#065F46" color="white" px={3} py={1} borderRadius="full">{processing ? "Saving, hold next card" : "Ready for next student"}</Badge>}
                </Box>
                <Flex gap={3} mt={4}>
                  <Button flex={1} bg="#4338CA" color="white" borderRadius="xl" disabled={cameraStatus !== "idle" || Boolean(guardian)} onClick={startCamera}>Start Camera</Button>
                  <Button flex={1} variant="outline" color="#991B1B" borderRadius="xl" disabled={cameraStatus === "idle" || cameraStatus === "stopping"} onClick={() => { void stopCamera(); }}>Stop Camera</Button>
                </Flex>
                {cameraError && <Text role="alert" color="#991B1B" fontSize="13px" mt={3}>{cameraError}</Text>}
                <Box as="form" onSubmit={(event) => { event.preventDefault(); void processCode(manualCode, "manual"); }} mt={5} pt={4} borderTop="1px solid #E2E8F0">
                  <Text as="label" htmlFor="gate-manual-code" fontSize="13px" fontWeight="800" color="#334155">Enter student code instead</Text>
                  <Flex gap={2} mt={2} direction={{ base: "column", sm: "row" }}>
                    <Input id="gate-manual-code" value={manualCode} onChange={(event) => setManualCode(event.target.value)} placeholder="Student code from ID card" autoComplete="off" spellCheck={false} required disabled={processing || Boolean(guardian)} borderRadius="xl" />
                    <Button type="submit" bg="#4338CA" color="white" borderRadius="xl" loading={processing} disabled={!manualCode.trim() || Boolean(guardian)}>Record Arrival</Button>
                  </Flex>
                </Box>
                <Text fontSize="12px" color="#64748B" mt={4}>The camera stays on after a confirmed scan. Remove each card before scanning the next. Repeat reads are held for 5 seconds and the server keeps only the first arrival per student each day.</Text>
                <Text fontSize="12px" color="#64748B" mt={2}>School start: {settings.schoolStartTime || "not set"} WAT. Late status and arrival date are confirmed by the server. Only today's arrival is recorded; selecting a past date below does not backdate scans. No paid SMS is required.</Text>
              </Box>

              <Box flex="1" minW={0}>
                {feedback && <Box role={feedback.type === "error" ? "alert" : "status"} aria-live="polite" p={4} bg={feedbackColors[0]} color={feedbackColors[1]} borderRadius="xl" mb={4}><Text fontWeight="800">{feedback.title}</Text><Text fontSize="13px" mt={1}>{feedback.message}</Text></Box>}
                {selected ? (
                  <Box p={5} bg="white" border="1px solid #E2E8F0" borderRadius="2xl">
                    <Text fontSize="12px" fontWeight="800" color="#64748B" mb={3}>SELECTED STUDENT'S SAVED ARRIVAL</Text>
                    <Flex gap={3} align="center">
                      <StudentPhoto key={selected.student.id} student={selected.student} size="80px" />
                      <Box minW={0}><Text fontSize="18px" fontWeight="900" color="#0F172A" overflowWrap="anywhere">{selected.student.fullName}</Text><Text fontSize="13px" color="#64748B">{selected.student.className || "Class not assigned"}</Text><Text fontSize="12px" color="#4338CA" overflowWrap="anywhere">{selected.student.studentCode}</Text></Box>
                    </Flex>
                    <Flex gap={2} mt={4} flexWrap="wrap" align="center">
                      <Text fontWeight="800" fontSize="14px" color="#0F172A">{selected.arrival.date} | {arrivalTime(selected.arrival.arrivedAt)}</Text>
                      <Badge bg={selected.arrival.isLate ? "#FEF3C7" : "#ECFDF5"} color={selected.arrival.isLate ? "#92400E" : "#065F46"} px={2} py={1} borderRadius="full">{selected.arrival.isLate ? "Late" : settings.schoolStartTime ? "On time" : "Arrived"}</Badge>
                    </Flex>
                    <Box bg="#F8FAFC" borderRadius="xl" p={3} mt={4}>
                      <Text fontSize="13px" color="#475569">AM sync: {selected.attendanceSynced ? "synced when this arrival was recorded" : "not synced by this arrival; use the manual register if needed"}. Afternoon unchanged.</Text>
                      <Text fontSize="13px" color="#475569" mt={2}>Parent inbox: {selected.notificationCreated ? "in-app notice created for this arrival, not confirmation of delivered push" : "no in-app notice created by this arrival"}. No SMS.</Text>
                    </Box>
                    <Button mt={4} variant="outline" color="#4338CA" borderRadius="xl" disabled={processing || Boolean(guardian) || !settings.gateNotificationsEnabled} onClick={openGuardian}>Private Parent Activation Code</Button>
                    {!settings.gateNotificationsEnabled && <Text fontSize="12px" color="#64748B" mt={2}>A school administrator must enable parent notifications before generating an access code.</Text>}
                  </Box>
                ) : <Box p={6} bg="white" border="1px solid #E2E8F0" borderRadius="2xl" color="#64748B">Scan a student or select a recent arrival to verify their photo and saved details.</Box>}

                {guardian && (
                  <Box role="region" aria-label="Private parent activation" p={5} bg="#FFFBEB" border="1px solid #FDE68A" borderRadius="2xl" mt={4}>
                    <Text fontWeight="900" color="#78350F">Private access for {guardian.student.fullName}</Text>
                    <Text fontSize="13px" color="#92400E" mt={2}>Generating a new access code revokes the old code, existing parent sessions, and old browser subscriptions for this student. Confirm the guardian's identity and distribute the new code privately. Never put it on a QR card or in an in-app/push notification.</Text>
                    {guardian.accessCode ? (
                      <>
                        <Text fontSize="13px" color="#78350F" mt={4}>Private access code (shown only here):</Text>
                        <Input aria-label="Private guardian access code" value={guardian.accessCode} readOnly autoComplete="off" fontFamily="monospace" fontWeight="800" bg="white" mt={2} />
                        <Text fontSize="13px" color="#78350F" mt={3}>Student code: <strong>{guardian.student.studentCode}</strong>. Parent first activation: open /student/notifications and enter both codes. The old subscriptions are revoked; parents must activate and enable browser notifications again.</Text>
                        <Text fontSize="12px" color="#92400E" mt={2}>This code is not stored in this browser. Closing this panel removes it from the screen.</Text>
                        <Button asChild mt={3} variant="outline" borderRadius="xl"><Link to="/student/notifications" target="_blank" rel="noopener noreferrer">Parent Inbox</Link></Button>
                      </>
                    ) : <Button mt={4} bg="#92400E" color="white" borderRadius="xl" loading={generating} onClick={generateAccess}>Confirm and Generate New Code</Button>}
                    {guardianError && <Text role="alert" color="#991B1B" fontSize="13px" mt={3}>{guardianError}</Text>}
                    <Button mt={3} ml={2} variant="outline" borderRadius="xl" disabled={generating} onClick={closeGuardian}>{guardian.accessCode ? "Hide Private Code" : "Cancel"}</Button>
                    <Text fontSize="12px" color="#92400E" mt={3}>Camera stopped for private setup. Close this panel and start the camera again to continue scanning.</Text>
                  </Box>
                )}
              </Box>
            </Flex>

            <Box mt={6} p={{ base: 4, md: 5 }} bg="white" border="1px solid #E2E8F0" borderRadius="2xl">
              <Flex justify="space-between" direction={{ base: "column", sm: "row" }} gap={3} align={{ base: "stretch", sm: "center" }}>
                <Box><Text fontSize="17px" fontWeight="900" color="#0F172A">Recent Arrivals</Text><Text fontSize="13px" color="#64748B">{listLoading ? "Refreshing saved arrivals..." : listError ? "Count unavailable until refresh succeeds" : totalCount !== null ? `${totalCount} arrivals on ${date}` : `${arrivals.length} recent arrivals on ${date}`} | WAT school date</Text></Box>
                <Flex gap={2} align="center">
                  <Input type="date" aria-label="Arrival history date in WAT" value={date} onChange={(event) => {
                    if (!event.target.value) return;
                    listRevisionRef.current += 1;
                    setDate(event.target.value);
                    setArrivals([]);
                    setTotalCount(null);
                  }} max={watDate()} w="170px" borderRadius="xl" />
                  <Button variant="outline" borderRadius="xl" onClick={() => setRefresh((value) => value + 1)}>Refresh</Button>
                </Flex>
              </Flex>
              {listError && <Text role="alert" color="#991B1B" fontSize="13px" mt={3}>{listError} The history may be stale; this does not undo a server-confirmed arrival.</Text>}
              <Text fontSize="12px" color="#64748B" mt={2}>Showing up to 100 most recent arrivals. Select a student for their saved details and private parent setup.</Text>
              {!arrivals.length && !listLoading && !listError && <Text py={5} color="#64748B">No saved arrivals for this date.</Text>}
              <Flex direction="column" gap={2} mt={4}>
                {arrivals.map((row) => (
                  <Box key={row.arrival.id} as="button" type="button" textAlign="left" p={3} border="1px solid" borderColor={selected?.arrival.id === row.arrival.id ? "#A5B4FC" : "#E2E8F0"} borderRadius="xl" bg={selected?.arrival.id === row.arrival.id ? "#EEF2FF" : "#F8FAFC"} disabled={processing || Boolean(guardian)} onClick={() => { setSelected(row); setFeedback(null); }} _hover={{ borderColor: "#A5B4FC" }} _focusVisible={{ outline: "2px solid #4338CA", outlineOffset: "2px" }}>
                    <Flex gap={3} align="center" flexWrap="wrap">
                      <StudentPhoto student={row.student} size="44px" />
                      <Box flex={1} minW="120px"><Text fontWeight="800" fontSize="14px" color="#0F172A">{row.student.fullName}</Text><Text fontSize="12px" color="#64748B">{row.student.className || "Class not assigned"} | {row.student.studentCode}</Text></Box>
                      <Box><Text fontSize="13px" fontWeight="700" color="#334155">{arrivalTime(row.arrival.arrivedAt)}</Text><Flex gap={2} mt={1}><Badge bg={row.arrival.isLate ? "#FEF3C7" : "#ECFDF5"} color={row.arrival.isLate ? "#92400E" : "#065F46"} borderRadius="full">{row.arrival.isLate ? "Late" : "Arrived"}</Badge><Text fontSize="11px" color="#64748B">{row.arrival.source === "manual" ? "Manual code" : "QR scan"}</Text></Flex></Box>
                    </Flex>
                  </Box>
                ))}
              </Flex>
            </Box>
          </>
        )}
      </Box>
    </DashboardLayout>
  );
}
