import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
} from "@chakra-ui/react";
import {
  FaGraduationCap,
  FaUsers,
  FaQrcode,
  FaMoneyBillWave,
  FaChartLine,
  FaUserPlus,
  FaCog,
  FaFileAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getInstitutionProfileApi,
  getInstitutionFeeOverviewApi,
  getDailyStaffAttendanceApi,
} from "../../api-endpoint/sms/smsEndpoints";
import { useAuth } from "../../libs/AuthProvider";
import DashboardLayout from "../../constants/dashboardlayout";

export default function SchoolAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [feeOverview, setFeeOverview] = useState(null);
  const [attendanceOverview, setAttendanceOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [profRes, feeRes, attRes] = await Promise.all([
          getInstitutionProfileApi().catch(() => null),
          getInstitutionFeeOverviewApi().catch(() => null),
          getDailyStaffAttendanceApi().catch(() => null),
        ]);

        if (profRes?.success) setProfile(profRes.data);
        if (feeRes?.success) setFeeOverview(feeRes.data);
        if (attRes?.success) setAttendanceOverview(attRes.data);
      } catch (err) {
        console.error("Load dashboard data error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const school = profile || user?.institution;
  const schoolName = school?.name || "Institution";
  const schoolLogo = school?.logoUrl;
  const schoolMotto = school?.motto || "Knowledge & Integrity";
  const currentTerm = school?.currentTerm || "First Term";
  const academicSession = school?.academicSession || "2025/2026";

  return (
    <DashboardLayout>
      <Box
        p={{ base: 4, md: 8 }}
        pt={{ base: "84px", md: "88px" }}
        pl={{ base: 4, lg: "260px" }}
        maxW="1300px"
        mx="auto"
      >
        {/* School Branding Banner Header */}
        <Box
          borderRadius="3xl"
          bg="linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #31104B 100%)"
          color="white"
          p={{ base: 6, md: 8 }}
          mb={8}
          boxShadow="0 10px 30px rgba(15, 23, 42, 0.2)"
          position="relative"
          overflow="hidden"
        >
          {/* Subtle Ambient Glows */}
          <Box
            position="absolute"
            top="-20%"
            right="-10%"
            w="350px"
            h="350px"
            borderRadius="full"
            bg="radial-gradient(circle, rgba(126, 34, 206, 0.3) 0%, rgba(0,0,0,0) 70%)"
            pointerEvents="none"
          />

          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            gap={5}
            position="relative"
            zIndex={2}
          >
            <Flex align="center" gap={5}>
              {schoolLogo ? (
                <Box
                  w="72px"
                  h="72px"
                  borderRadius="2xl"
                  bg="white"
                  p={1.5}
                  boxShadow="0 4px 16px rgba(0,0,0,0.2)"
                  flexShrink={0}
                >
                  <img
                    src={schoolLogo}
                    alt="School Crest"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </Box>
              ) : (
                <Flex
                  w="68px"
                  h="68px"
                  borderRadius="2xl"
                  bg="rgba(255,255,255,0.12)"
                  backdropFilter="blur(8px)"
                  align="center"
                  justify="center"
                  color="#DDD6FE"
                  flexShrink={0}
                >
                  <Icon as={FaGraduationCap} boxSize={8} />
                </Flex>
              )}

              <Box>
                <Flex align="center" gap={2} flexWrap="wrap">
                  <Text fontSize={{ base: "20px", md: "26px" }} fontWeight="900" letterSpacing="-0.5px">
                    {schoolName}
                  </Text>
                  <Badge bg="#4338CA" color="#E0E7FF" px={2.5} py={0.5} borderRadius="full" fontSize="10px" fontWeight="800">
                    INSTITUTION ERP
                  </Badge>
                </Flex>
                <Text fontSize="13px" color="#CBD5E1" fontStyle="italic" mt={0.5}>
                  "{schoolMotto}"
                </Text>
                <Text fontSize="12px" color="#94A3B8" mt={1}>
                  Academic Session: <strong>{academicSession}</strong> • Term: <strong>{currentTerm}</strong>
                </Text>
              </Box>
            </Flex>

            <Flex gap={3} flexWrap="wrap">
              <Button
                size="sm"
                bg="rgba(255,255,255,0.15)"
                color="white"
                border="1px solid rgba(255,255,255,0.2)"
                backdropFilter="blur(8px)"
                borderRadius="xl"
                _hover={{ bg: "rgba(255,255,255,0.25)" }}
                onClick={() => navigate("/institution/settings")}
              >
                <Icon as={FaCog} mr={2} boxSize={3.5} />
                School Branding
              </Button>
              <Button
                size="sm"
                bg="linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)"
                color="white"
                borderRadius="xl"
                boxShadow="0 4px 14px rgba(67, 56, 202, 0.4)"
                _hover={{ opacity: 0.95 }}
                onClick={() => navigate("/institution/staff-qr")}
              >
                <Icon as={FaQrcode} mr={2} boxSize={3.5} />
                Launch Staff Clock-In QR
              </Button>
            </Flex>
          </Flex>
        </Box>

        {/* 4 Top KPI Cards */}
        <Flex gap={4} mb={8} flexWrap="wrap">
          {/* Card 1: Today's Staff Attendance */}
          <Box flex="1" minW="220px" bg="white" p={5} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#64748B">STAFF TURNOUT TODAY</Text>
              <Flex w="32px" h="32px" borderRadius="lg" bg="#EEF2FF" color="#4338CA" align="center" justify="center">
                <Icon as={FaUsers} boxSize={3.5} />
              </Flex>
            </Flex>
            <Text fontSize="26px" fontWeight="900" color="#0F172A">
              {attendanceOverview?.attendanceRate || 0}%
            </Text>
            <Text fontSize="12px" color="#10B981" mt={1}>
              {attendanceOverview?.clockedInCount || 0} of {attendanceOverview?.totalStaff || 0} teachers clocked in
            </Text>
          </Box>

          {/* Card 2: Term Fees Collected */}
          <Box flex="1" minW="220px" bg="white" p={5} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#10B981">FEES COLLECTED</Text>
              <Flex w="32px" h="32px" borderRadius="lg" bg="#ECFDF5" color="#10B981" align="center" justify="center">
                <Icon as={FaCheckCircle} boxSize={3.5} />
              </Flex>
            </Flex>
            <Text fontSize="26px" fontWeight="900" color="#10B981">
              ₦{feeOverview?.totalCollected?.toLocaleString() || "0"}
            </Text>
            <Text fontSize="12px" color="#059669" mt={1}>
              {feeOverview?.collectionRate || 0}% collection efficiency
            </Text>
            <Text
              fontSize="12px"
              color="#4338CA"
              fontWeight="700"
              mt={1}
              cursor="pointer"
              onClick={() => navigate("/institution/payments")}
            >
              View payment history &rarr;
            </Text>
          </Box>

          {/* Card 3: Outstanding Debt */}
          <Box flex="1" minW="220px" bg="white" p={5} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#EF4444">OUTSTANDING DEBT</Text>
              <Flex w="32px" h="32px" borderRadius="lg" bg="#FEF2F2" color="#EF4444" align="center" justify="center">
                <Icon as={FaMoneyBillWave} boxSize={3.5} />
              </Flex>
            </Flex>
            <Text fontSize="26px" fontWeight="900" color="#EF4444">
              ₦{feeOverview?.totalOutstanding?.toLocaleString() || "0"}
            </Text>
            <Text fontSize="12px" color="#B91C1C" mt={1} cursor="pointer" onClick={() => navigate("/institution/debtors")}>
              View {feeOverview?.owingCount || 0} defaulters &rarr;
            </Text>
          </Box>

          {/* Card 4: Result Checker Revenue */}
          <Box flex="1" minW="220px" bg="white" p={5} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#6D28D9">₦500 RESULT TOKENS</Text>
              <Flex w="32px" h="32px" borderRadius="lg" bg="#F3E8FF" color="#6D28D9" align="center" justify="center">
                <Icon as={FaChartLine} boxSize={3.5} />
              </Flex>
            </Flex>
            <Text fontSize="26px" fontWeight="900" color="#6D28D9">
              ₦{feeOverview?.resultCheckerRevenue?.toLocaleString() || "0"}
            </Text>
            <Text fontSize="12px" color="#7C3AED" mt={1}>
              {feeOverview?.resultCheckerTokensCount || 0} cards unlocked online
            </Text>
          </Box>
        </Flex>

        {/* Quick Hub Navigation Cards */}
        <Text fontSize="16px" fontWeight="800" color="#0F172A" mb={4}>
          School Management Command Center
        </Text>

        <Flex gap={4} flexWrap="wrap">
          {/* Action 1: QR Clock-In Terminal */}
          <Box
            flex="1"
            minW="240px"
            bg="white"
            p={6}
            borderRadius="2xl"
            border="1px solid #E2E8F0"
            cursor="pointer"
            _hover={{ transform: "translateY(-3px)", boxShadow: "0 10px 24px rgba(0,0,0,0.06)" }}
            transition="all 0.2s"
            onClick={() => navigate("/institution/staff-qr")}
          >
            <Flex w="48px" h="48px" borderRadius="xl" bg="#EDE9FE" color="#6D28D9" align="center" justify="center" mb={4}>
              <Icon as={FaQrcode} boxSize={6} />
            </Flex>
            <Text fontSize="16px" fontWeight="800" color="#0F172A">
              Staff Attendance Terminal
            </Text>
            <Text fontSize="13px" color="#64748B" mt={1}>
              Display today's barcode QR code and daily PIN for teacher check-in.
            </Text>
          </Box>

          {/* Action 2: Defaulters & Debtor Suite */}
          <Box
            flex="1"
            minW="240px"
            bg="white"
            p={6}
            borderRadius="2xl"
            border="1px solid #E2E8F0"
            cursor="pointer"
            _hover={{ transform: "translateY(-3px)", boxShadow: "0 10px 24px rgba(0,0,0,0.06)" }}
            transition="all 0.2s"
            onClick={() => navigate("/institution/debtors")}
          >
            <Flex w="48px" h="48px" borderRadius="xl" bg="#FEF2F2" color="#EF4444" align="center" justify="center" mb={4}>
              <Icon as={FaMoneyBillWave} boxSize={6} />
            </Flex>
            <Text fontSize="16px" fontWeight="800" color="#0F172A">
              Debtor Defaulters List
            </Text>
            <Text fontSize="13px" color="#64748B" mt={1}>
              Review unpaid school fee balances and send 1-click WhatsApp reminders.
            </Text>
          </Box>

          {/* Action 3: Classroom Attendance */}
          <Box
            flex="1"
            minW="240px"
            bg="white"
            p={6}
            borderRadius="2xl"
            border="1px solid #E2E8F0"
            cursor="pointer"
            _hover={{ transform: "translateY(-3px)", boxShadow: "0 10px 24px rgba(0,0,0,0.06)" }}
            transition="all 0.2s"
            onClick={() => navigate("/teacher/attendance")}
          >
            <Flex w="48px" h="48px" borderRadius="xl" bg="#ECFDF5" color="#10B981" align="center" justify="center" mb={4}>
              <Icon as={FaUsers} boxSize={6} />
            </Flex>
            <Text fontSize="16px" fontWeight="800" color="#0F172A">
              Classroom Attendance
            </Text>
            <Text fontSize="13px" color="#64748B" mt={1}>
              Track daily student attendance and class roll call with one click.
            </Text>
          </Box>

          {/* Action 4: Results & CBT Broadsheet */}
          <Box
            flex="1"
            minW="240px"
            bg="white"
            p={6}
            borderRadius="2xl"
            border="1px solid #E2E8F0"
            cursor="pointer"
            _hover={{ transform: "translateY(-3px)", boxShadow: "0 10px 24px rgba(0,0,0,0.06)" }}
            transition="all 0.2s"
            onClick={() => navigate("/teacher/report-cards")}
          >
            <Flex w="48px" h="48px" borderRadius="xl" bg="#EEF2FF" color="#4338CA" align="center" justify="center" mb={4}>
              <Icon as={FaFileAlt} boxSize={6} />
            </Flex>
            <Text fontSize="16px" fontWeight="800" color="#0F172A">
              Report Cards & CBT Sync
            </Text>
            <Text fontSize="13px" color="#64748B" mt={1}>
              Sync CBT test scores, enter grades, and print official stamped report cards.
            </Text>
          </Box>
        </Flex>
      </Box>
    </DashboardLayout>
  );
}
