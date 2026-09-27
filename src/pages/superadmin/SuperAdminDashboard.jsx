import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FaUniversity,
  FaUserGraduate,
  FaMoneyBillWave,
  FaChartPie,
  FaFileAlt,
  FaCheckCircle,
  FaArrowRight,
  FaSignInAlt,
  FaCreditCard,
  FaShieldAlt,
} from "react-icons/fa";
import SuperAdminLayout from "./SuperAdminLayout";
import {
  getSuperAdminOverviewApi,
  impersonateInstitutionAdminApi,
} from "../../api-endpoint/sms/superAdminEndpoints";
import { toaster } from "../../components/ui/toaster";
import AdminPinPromptModal from "../../components/superadmin/AdminPinPromptModal";
import { useAuth } from "../../libs/AuthProvider";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user: currentSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [impersonatingId, setImpersonatingId] = useState(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingGhostSchool, setPendingGhostSchool] = useState(null);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await getSuperAdminOverviewApi();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Super Admin overview load error:", err);
      toaster.create({
        title: "Failed to load overview data",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const handleGhostLoginClick = (inst) => {
    setPendingGhostSchool(inst);
    setPinModalOpen(true);
  };

  const executeGhostLogin = async (school, pin) => {
    setImpersonatingId(school.id);
    try {
      const res = await impersonateInstitutionAdminApi(school.id, pin);
      if (res.success) {
        toaster.create({
          title: `Ghost Session Active: ${school.name}`,
          description: "Opening administrator dashboard...",
          type: "success",
        });

        // Backup superadmin credentials
        const originalUser = localStorage.getItem("USER_KEY");
        const originalToken = localStorage.getItem("token");
        localStorage.setItem(
          "GHOST_MODE_ORIGINAL",
          JSON.stringify({
            user: originalUser ? JSON.parse(originalUser) : currentSuperAdmin,
            token: originalToken,
          })
        );

        // Set impersonated credentials
        if (res.data?.token) {
          localStorage.setItem("token", res.data.token);
        }
        if (res.data?.user) {
          localStorage.setItem("USER_KEY", JSON.stringify(res.data.user));
        }

        // Open school dashboard
        setTimeout(() => {
          window.location.href = res.data?.redirectUrl || "/institution/dashboard";
        }, 600);
      }
    } catch (err) {
      console.error("Ghost login error:", err);
      toaster.create({
        title: "Impersonation Failed",
        description: err.response?.data?.message || "Could not log into school",
        type: "error",
      });
    } finally {
      setImpersonatingId(null);
      setPendingGhostSchool(null);
    }
  };

  const kpi = data?.kpi || {
    totalInstitutions: 0,
    totalStudents: 0,
    totalStaff: 0,
    totalExams: 0,
    totalQuestions: 0,
    totalGmv: 0,
    totalPlatformRevenue: 0,
    resultTokensUnlocked: 0,
    resultTokensRevenue: 0,
    platformResultCheckerEarnings: 0,
  };

  return (
    <SuperAdminLayout>
      {/* Top Banner */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        gap={4}
        mb={8}
      >
        <Box>
          <Flex align="center" gap={2}>
            <Text fontSize={{ base: "20px", sm: "24px", md: "28px" }} fontWeight="900" color="white" letterSpacing="-0.5px">
              Platform Mission Control
            </Text>
            <Badge bg="#064E3B" color="#6EE7B7" fontSize="10px" fontWeight="800" px={2} py={0.5} borderRadius="full">
              Live
            </Badge>
          </Flex>
          <Text fontSize="13px" color="#94A3B8" mt={1}>
            Real-time oversight across all schools, student populations, CBT exams, and revenue splits.
          </Text>
        </Box>

        <Flex gap={2}>
          <Button
            size="sm"
            bg="#1E293B"
            color="white"
            border="1px solid #374151"
            borderRadius="xl"
            fontWeight="700"
            fontSize="12px"
            h="38px"
            px={4}
            _hover={{ bg: "#334155" }}
            onClick={loadOverview}
            loading={loading}
          >
            Refresh Metrics
          </Button>

          <Link to="/superadmin/institutions">
            <Button
              size="sm"
              bg="linear-gradient(135deg, #10B981 0%, #059669 100%)"
              color="white"
              borderRadius="xl"
              fontWeight="800"
              fontSize="12px"
              h="38px"
              px={4}
              boxShadow="0 4px 14px rgba(16, 185, 129, 0.35)"
              _hover={{ opacity: 0.92 }}
            >
              Manage Schools <Icon as={FaArrowRight} ml={2} boxSize={3} />
            </Button>
          </Link>
        </Flex>
      </Flex>

      {/* KPI Cards Grid */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 6 }} gap={3} mb={8}>
        {/* Total Institutions */}
        <Box bg="#111827" p={4} borderRadius="2xl" border="1px solid #1F2937">
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontSize="11px" fontWeight="800" color="#94A3B8" textTransform="uppercase">
              Registered Schools
            </Text>
            <Icon as={FaUniversity} color="#10B981" boxSize={4} />
          </Flex>
          <Text fontSize="26px" fontWeight="900" color="white">
            {kpi.totalInstitutions}
          </Text>
          <Text fontSize="11px" color="#10B981" fontWeight="700" mt={1}>
            Multi-tenant active
          </Text>
        </Box>

        {/* Total Enrolled Students */}
        <Box bg="#111827" p={4} borderRadius="2xl" border="1px solid #1F2937">
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontSize="11px" fontWeight="800" color="#94A3B8" textTransform="uppercase">
              School Enrolled
            </Text>
            <Icon as={FaUserGraduate} color="#6366F1" boxSize={4} />
          </Flex>
          <Text fontSize="26px" fontWeight="900" color="white">
            {(kpi.enrolledStudents || 0).toLocaleString()}
          </Text>
          <Text fontSize="11px" color="#6366F1" fontWeight="700" mt={1}>
            {kpi.unassignedCandidates || 0} CBT Mock Candidates
          </Text>
        </Box>

        {/* Gross Volume Processed */}
        <Box bg="#111827" p={4} borderRadius="2xl" border="1px solid #1F2937">
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontSize="11px" fontWeight="800" color="#94A3B8" textTransform="uppercase">
              Total GMV Processed
            </Text>
            <Icon as={FaMoneyBillWave} color="#10B981" boxSize={4} />
          </Flex>
          <Text fontSize="24px" fontWeight="900" color="#10B981">
            ₦{kpi.totalGmv.toLocaleString()}
          </Text>
          <Text fontSize="11px" color="#94A3B8" fontWeight="600" mt={1}>
            Online bursary collections
          </Text>
        </Box>

        {/* AceSmart Net Platform Cuts */}
        <Box bg="#111827" p={4} borderRadius="2xl" border="1px solid #1F2937">
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontSize="11px" fontWeight="800" color="#F59E0B" textTransform="uppercase">
              Platform Cuts
            </Text>
            <Icon as={FaChartPie} color="#F59E0B" boxSize={4} />
          </Flex>
          <Text fontSize="24px" fontWeight="900" color="#F59E0B">
            ₦{kpi.totalPlatformRevenue.toLocaleString()}
          </Text>
          <Text fontSize="11px" color="#F59E0B" fontWeight="700" mt={1}>
            Paystack split earnings
          </Text>
        </Box>

        {/* Result Checker Tokens Unlocked */}
        <Box bg="#111827" p={4} borderRadius="2xl" border="1px solid #1F2937">
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontSize="11px" fontWeight="800" color="#94A3B8" textTransform="uppercase">
              Result Unlocks
            </Text>
            <Icon as={FaFileAlt} color="#38BDF8" boxSize={4} />
          </Flex>
          <Text fontSize="26px" fontWeight="900" color="white">
            {kpi.resultTokensUnlocked}
          </Text>
          <Text fontSize="11px" color="#38BDF8" fontWeight="700" mt={1}>
            10% Platform cut applied
          </Text>
        </Box>

        {/* CBT Exams Held */}
        <Box bg="#111827" p={4} borderRadius="2xl" border="1px solid #1F2937">
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontSize="11px" fontWeight="800" color="#94A3B8" textTransform="uppercase">
              CBT Exams
            </Text>
            <Icon as={FaCheckCircle} color="#A855F7" boxSize={4} />
          </Flex>
          <Text fontSize="26px" fontWeight="900" color="white">
            {kpi.totalExams}
          </Text>
          <Text fontSize="11px" color="#A855F7" fontWeight="700" mt={1}>
            {kpi.totalQuestions.toLocaleString()} questions bank
          </Text>
        </Box>
      </SimpleGrid>

      {/* Main Grid: Top Schools & Recent Activity */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6} mb={8}>
        {/* Left Column: Top Institutions (Span 2) */}
        <Box
          bg="#111827"
          borderRadius="2xl"
          border="1px solid #1F2937"
          overflow="hidden"
          gridColumn={{ base: "span 1", lg: "span 2" }}
        >
          <Flex p={5} justify="space-between" align="center" borderBottom="1px solid #1F2937">
            <Box>
              <Text fontSize="15px" fontWeight="900" color="white">
                Active Institutions & Ghost Login
              </Text>
              <Text fontSize="12px" color="#94A3B8">
                Click "Login as School" to enter their dashboard directly without asking for passwords.
              </Text>
            </Box>
            <Link to="/superadmin/institutions">
              <Button size="xs" variant="ghost" color="#10B981" fontWeight="800">
                View All Schools
              </Button>
            </Link>
          </Flex>

          <Box overflowX="auto">
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#1F2937", borderBottom: "1px solid #374151" }}>
                  <th style={{ padding: "10px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>School</th>
                  <th style={{ padding: "10px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>Subdomain</th>
                  <th style={{ padding: "10px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", textAlign: "center" }}>Students</th>
                  <th style={{ padding: "10px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", textAlign: "center" }}>Staff</th>
                  <th style={{ padding: "10px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", textAlign: "center" }}>Paystack</th>
                  <th style={{ padding: "10px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", textAlign: "right" }}>Ghost Login</th>
                </tr>
              </thead>
              <tbody>
                {data?.topSchools?.length ? (
                  data.topSchools.map((inst) => (
                    <tr
                      key={inst.id}
                      style={{ borderBottom: "1px solid #1F2937", transition: "background 0.15s ease" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#1E293B")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <Text fontSize="13px" fontWeight="800" color="white">
                          {inst.name}
                        </Text>
                        <Text fontSize="11px" color="#94A3B8">
                          Code: {inst.code} &bull; {inst.subscriptionPlan}
                        </Text>
                      </td>

                      <td style={{ padding: "12px 16px" }}>
                        <Text fontSize="12px" color="#38BDF8" fontWeight="700">
                          {inst.subdomain ? `${inst.subdomain}.acesmart.site` : "-"}
                        </Text>
                      </td>

                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <Badge bg="#1E293B" color="#6366F1" border="1px solid #374151" px={2} py={0.5} borderRadius="md" fontWeight="800">
                          {inst.studentCount}
                        </Badge>
                      </td>

                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <Text fontSize="12px" color="#94A3B8" fontWeight="700">
                          {inst.staffCount}
                        </Text>
                      </td>

                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        {inst.hasPaystack ? (
                          <Badge bg="#064E3B" color="#6EE7B7" fontSize="10px" fontWeight="800" borderRadius="full" px={2}>
                            Active
                          </Badge>
                        ) : (
                          <Badge bg="#451A03" color="#FCD34D" fontSize="10px" fontWeight="800" borderRadius="full" px={2}>
                            Pending
                          </Badge>
                        )}
                      </td>

                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <Button
                          size="xs"
                          bg="#10B981"
                          color="white"
                          borderRadius="lg"
                          fontWeight="800"
                          fontSize="11px"
                          h="28px"
                          px={3}
                          _hover={{ bg: "#059669" }}
                          onClick={() => handleGhostLoginClick(inst)}
                          loading={impersonatingId === inst.id}
                        >
                          <Icon as={FaSignInAlt} mr={1} boxSize={2.5} />
                          Ghost Login
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#64748B" }}>
                      No schools registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </Box>

        {/* Right Column: Recent Transactions Feed */}
        <Box bg="#111827" borderRadius="2xl" border="1px solid #1F2937" p={5}>
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Text fontSize="15px" fontWeight="900" color="white">
                Live Transaction Feed
              </Text>
              <Text fontSize="11px" color="#94A3B8">
                Recent Paystack payments across all schools
              </Text>
            </Box>
            <Link to="/superadmin/transactions">
              <Button size="xs" variant="ghost" color="#10B981" fontWeight="800">
                View All
              </Button>
            </Link>
          </Flex>

          <Flex direction="column" gap={3}>
            {data?.recentTransactions?.length ? (
              data.recentTransactions.slice(0, 6).map((tx) => (
                <Box
                  key={tx.id}
                  bg="#1E293B"
                  p={3}
                  borderRadius="xl"
                  border="1px solid #334155"
                >
                  <Flex justify="space-between" align="flex-start">
                    <Box>
                      <Text fontSize="12px" fontWeight="800" color="white">
                        {tx.schoolName}
                      </Text>
                      <Text fontSize="10px" color="#94A3B8">
                        {tx.reference} &bull; {tx.purpose}
                      </Text>
                    </Box>
                    <Box textAlign="right">
                      <Text fontSize="13px" fontWeight="900" color={tx.status === "success" ? "#10B981" : "#F59E0B"}>
                        ₦{Number(tx.grossAmount || 0).toLocaleString()}
                      </Text>
                      {tx.platformFee > 0 && (
                        <Text fontSize="10px" color="#F59E0B" fontWeight="700">
                          Cut: ₦{Number(tx.platformFee).toLocaleString()}
                        </Text>
                      )}
                    </Box>
                  </Flex>
                </Box>
              ))
            ) : (
              <Box p={6} textAlign="center" color="#64748B" fontSize="12px">
                No recent transactions recorded.
              </Box>
            )}
          </Flex>
        </Box>
      </SimpleGrid>

      {/* Admin Master PIN Prompt Modal */}
      <AdminPinPromptModal
        isOpen={pinModalOpen}
        onClose={() => {
          setPinModalOpen(false);
          setPendingGhostSchool(null);
        }}
        onSuccess={(pin) => {
          setPinModalOpen(false);
          if (pendingGhostSchool) {
            executeGhostLogin(pendingGhostSchool, pin);
          }
        }}
        actionTitle={`Authorize Ghost Login: ${pendingGhostSchool?.name || "School"}`}
        actionDescription={`Please enter your Master Security PIN to authorize impersonation into ${pendingGhostSchool?.name || "this institution"}.`}
      />
    </SuperAdminLayout>
  );
}
