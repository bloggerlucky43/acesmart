import { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
  Table,
} from "@chakra-ui/react";
import {
  FaQrcode,
  FaCheckCircle,
  FaClock,
  FaPrint,
  FaSyncAlt,
  FaGraduationCap,
  FaUsers,
} from "react-icons/fa";
import { getAttendanceQrApi, getDailyStaffAttendanceApi } from "../../api-endpoint/sms/smsEndpoints";
import { useAuth } from "../../libs/AuthProvider";
import { toaster } from "../../components/ui/toaster";
import DashboardLayout from "../../constants/dashboardlayout";

export default function StaffQrGenerator() {
  const { user } = useAuth();
  const [qrData, setQrData] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [dailyBoard, setDailyBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  const institutionName = user?.institution?.name || "Institution";
  const institutionLogo = user?.institution?.logoUrl;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qrRes, boardRes] = await Promise.all([
        getAttendanceQrApi(),
        getDailyStaffAttendanceApi(),
      ]);

      if (qrRes.success) setQrData(qrRes.data);
      if (boardRes.success) setDailyBoard(boardRes.data);
    } catch (error) {
      console.error("Fetch QR data error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (qrData?.qrPayload) {
      const payloadStr =
        typeof qrData.qrPayload === "object"
          ? JSON.stringify(qrData.qrPayload)
          : String(qrData.qrPayload);

      QRCode.toDataURL(payloadStr, {
        width: 320,
        margin: 1,
        color: {
          dark: "#312E81",
          light: "#FFFFFF",
        },
      })
        .then(setQrDataUrl)
        .catch((err) => console.error("QR render error:", err));
    }
  }, [qrData]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <Box
        p={{ base: 4, md: 8 }}
        pt={{ base: "84px", md: "88px" }}
        pl={{ base: 4, lg: "260px" }}
        maxW="1300px"
        mx="auto"
      >
        {/* Header */}
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
                  Staff Attendance Barcode Terminal
                </Text>
                <Text fontSize="13px" color="#64748B">
                  {institutionName} • Display at staff room or security gate for daily clock-in
                </Text>
              </Box>
            </Flex>
          </Box>

          <Flex gap={3}>
            <Button
              variant="outline"
              size="sm"
              borderRadius="xl"
              onClick={fetchData}
              loading={loading}
            >
              <Icon as={FaSyncAlt} mr={2} boxSize={3} />
              Refresh
            </Button>
            <Button
              bg="#4338CA"
              color="white"
              size="sm"
              borderRadius="xl"
              onClick={handlePrint}
            >
              <Icon as={FaPrint} mr={2} boxSize={3} />
              Print QR Poster
            </Button>
          </Flex>
        </Flex>

        {/* Grid: QR Poster on Left, Live Attendance Board on Right */}
        <Flex direction={{ base: "column", lg: "row" }} gap={8}>
          {/* QR Terminal Poster */}
          <Box
            flex={{ base: "1", lg: "0 0 440px" }}
            bg="white"
            borderRadius="2xl"
            p={8}
            border="2px solid #E2E8F0"
            boxShadow="0 10px 30px rgba(0,0,0,0.05)"
            textAlign="center"
          >
            {/* School Crest Badge */}
            {institutionLogo ? (
              <Flex
                w="72px"
                h="72px"
                mx="auto"
                mb={3}
                borderRadius="2xl"
                bg="white"
                p={1.5}
                border="2px solid #4338CA"
                boxShadow="0 4px 14px rgba(67, 56, 202, 0.15)"
                align="center"
                justify="center"
              >
                <img
                  src={institutionLogo}
                  alt="School Crest"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </Flex>
            ) : (
              <Flex
                w="64px"
                h="64px"
                mx="auto"
                mb={3}
                borderRadius="2xl"
                bg="#EEF2FF"
                color="#4338CA"
                align="center"
                justify="center"
              >
                <Icon as={FaGraduationCap} boxSize={8} />
              </Flex>
            )}

            <Text fontSize="18px" fontWeight="900" color="#0F172A">
              {institutionName}
            </Text>
            <Text fontSize="12px" color="#64748B" fontWeight="600" mb={6}>
              Official Daily Staff Attendance Terminal
            </Text>

            {/* Generated QR Code Graphic */}
            <Box
              mx="auto"
              w="240px"
              h="240px"
              bg="#FAF5FF"
              borderRadius="2xl"
              border="3px solid #6D28D9"
              p={4}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 8px 24px rgba(109, 40, 217, 0.12)"
              position="relative"
            >
              {/* Real Cryptographic QR Code Graphic */}
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Daily Attendance Barcode"
                  style={{
                    width: "208px",
                    height: "208px",
                    borderRadius: "12px",
                    objectFit: "contain",
                    background: "white",
                  }}
                />
              ) : (
                <Flex align="center" justify="center" h="208px" direction="column" gap={2}>
                  <Icon as={FaQrcode} boxSize={8} color="#6D28D9" />
                  <Text fontSize="12px" color="#64748B">Generating Daily Barcode...</Text>
                </Flex>
              )}

              <Badge
                position="absolute"
                bottom="-12px"
                bg="#4338CA"
                color="white"
                px={3}
                py={0.5}
                borderRadius="full"
                fontSize="10px"
                fontWeight="700"
              >
                ACTIVE BARCODE
              </Badge>
            </Box>

            {/* Daily PIN Code Alternative */}
            <Box mt={6} p={4} borderRadius="xl" bg="#F8FAFC" border="1px solid #E2E8F0">
              <Text fontSize="11px" color="#64748B" fontWeight="700" letterSpacing="0.5px">
                TODAY'S 6-DIGIT CLOCK-IN PIN
              </Text>
              <Text fontSize="28px" fontWeight="900" color="#0F172A" letterSpacing="4px" mt={1}>
                {qrData?.dailyPin || "847291"}
              </Text>
              <Text fontSize="11px" color="#94A3B8" mt={1}>
                Valid for {qrData?.date || new Date().toISOString().split("T")[0]}
              </Text>
            </Box>
          </Box>

          {/* Live Staff Attendance Monitor */}
          <Box flex={1}>
            {/* Stats Overview */}
            <Flex gap={4} mb={6} flexWrap="wrap">
              <Box
                flex="1"
                minW="140px"
                bg="white"
                p={4}
                borderRadius="2xl"
                border="1px solid #E2E8F0"
              >
                <Text fontSize="12px" color="#64748B" fontWeight="600">
                  Total Staff
                </Text>
                <Text fontSize="24px" fontWeight="900" color="#0F172A">
                  {dailyBoard?.totalStaff || 0}
                </Text>
              </Box>

              <Box
                flex="1"
                minW="140px"
                bg="white"
                p={4}
                borderRadius="2xl"
                border="1px solid #E2E8F0"
              >
                <Text fontSize="12px" color="#10B981" fontWeight="600">
                  Clocked In
                </Text>
                <Text fontSize="24px" fontWeight="900" color="#10B981">
                  {dailyBoard?.clockedInCount || 0}
                </Text>
              </Box>

              <Box
                flex="1"
                minW="140px"
                bg="white"
                p={4}
                borderRadius="2xl"
                border="1px solid #E2E8F0"
              >
                <Text fontSize="12px" color="#F59E0B" fontWeight="600">
                  Late Arrivals
                </Text>
                <Text fontSize="24px" fontWeight="900" color="#F59E0B">
                  {dailyBoard?.lateCount || 0}
                </Text>
              </Box>

              <Box
                flex="1"
                minW="140px"
                bg="white"
                p={4}
                borderRadius="2xl"
                border="1px solid #E2E8F0"
              >
                <Text fontSize="12px" color="#64748B" fontWeight="600">
                  Turnout Rate
                </Text>
                <Text fontSize="24px" fontWeight="900" color="#4338CA">
                  {dailyBoard?.attendanceRate || 0}%
                </Text>
              </Box>
            </Flex>

            {/* Attendance Roster Table */}
            <Box
              bg="white"
              borderRadius="2xl"
              border="1px solid #E2E8F0"
              overflow="hidden"
              boxShadow="0 4px 16px rgba(0,0,0,0.02)"
            >
              <Box p={5} borderBottom="1px solid #E2E8F0">
                <Text fontSize="16px" fontWeight="800" color="#0F172A">
                  Live Staff Clock-In Board
                </Text>
                <Text fontSize="12px" color="#64748B">
                  Updated in real-time as teachers scan their barcode upon arrival
                </Text>
              </Box>

              <Box overflowX="auto">
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                      <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>STAFF NAME</th>
                      <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>STAFF ID</th>
                      <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>CLOCK-IN TIME</th>
                      <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>STATUS</th>
                      <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>METHOD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyBoard?.board?.length ? (
                      dailyBoard.board.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9" }}>
                          <td style={{ padding: "14px 16px", fontWeight: "700", color: "#0F172A", fontSize: "13px" }}>
                            {item.name}
                            <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "normal" }}>
                              {item.designation}
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "13px", color: "#64748B" }}>
                            {item.staffIdNumber}
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: "600" }}>
                            {item.clockInTime}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "3px 10px",
                                borderRadius: "999px",
                                fontSize: "11px",
                                fontWeight: "700",
                                background:
                                  item.status === "on_time"
                                    ? "#ECFDF5"
                                    : item.status === "late"
                                    ? "#FEF3C7"
                                    : "#F1F5F9",
                                color:
                                  item.status === "on_time"
                                    ? "#065F46"
                                    : item.status === "late"
                                    ? "#92400E"
                                    : "#64748B",
                              }}
                            >
                              {item.status === "on_time"
                                ? "On Time"
                                : item.status === "late"
                                ? "Late"
                                : "Absent"}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "12px", color: "#64748B" }}>
                            {item.method === "qr_scan" ? "QR Scan" : item.method === "manual_pin" ? "PIN Code" : "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "#94A3B8" }}>
                          No staff members enrolled yet. Enroll teachers from the admin panel to monitor attendance.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Box>
            </Box>
          </Box>
        </Flex>
      </Box>
    </DashboardLayout>
  );
}
