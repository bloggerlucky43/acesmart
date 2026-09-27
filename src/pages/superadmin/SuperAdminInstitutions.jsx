import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
  Input,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FaUniversity,
  FaSearch,
  FaTimes,
  FaSignInAlt,
  FaEdit,
  FaExternalLinkAlt,
  FaCheck,
  FaSave,
  FaCrown,
  FaShieldAlt,
  FaRocket,
  FaGem,
} from "react-icons/fa";
import SuperAdminLayout from "./SuperAdminLayout";
import {
  getSuperAdminInstitutionsApi,
  updateSuperAdminInstitutionApi,
  impersonateInstitutionAdminApi,
  upgradeInstitutionTierApi,
} from "../../api-endpoint/sms/superAdminEndpoints";
import { toaster } from "../../components/ui/toaster";
import AdminPinPromptModal from "../../components/superadmin/AdminPinPromptModal";
import { useAuth } from "../../libs/AuthProvider";

export default function SuperAdminInstitutions() {
  const { user: currentSuperAdmin } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("all");
  const [impersonatingId, setImpersonatingId] = useState(null);

  // Edit Modal State
  const [editingSchool, setEditingSchool] = useState(null);
  const [saving, setSaving] = useState(false);

  // Tier Upgrade Modal State
  const [upgradingSchool, setUpgradingSchool] = useState(null);
  const [selectedTier, setSelectedTier] = useState("standard");
  const [tierTermCount, setTierTermCount] = useState(1);
  const [savingTier, setSavingTier] = useState(false);

  // Master Security PIN State
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { type: 'ghost' | 'tier', school: any, ... }
  const [editForm, setEditForm] = useState({
    name: "",
    code: "",
    subdomain: "",
    subscriptionPlan: "Starter",
    resultCheckerFee: 500,
    currentTerm: "First Term",
    academicSession: "2025/2026",
    email: "",
    phone: "",
  });

  const loadInstitutions = async () => {
    setLoading(true);
    try {
      const res = await getSuperAdminInstitutionsApi({
        search: searchQuery,
        plan: selectedPlan,
        limit: 100,
      });
      if (res.success) {
        setInstitutions(res.data.institutions || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error("Load institutions error:", err);
      toaster.create({
        title: "Failed to load institutions",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutions();
  }, [selectedPlan]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadInstitutions();
  };

  // Trigger Ghost Login with PIN requirement
  const handleGhostLoginClick = (school) => {
    setPendingAction({ type: "ghost", school });
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

        // Backup original superadmin credentials
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
      setPendingAction(null);
    }
  };

  // Tier Upgrade Flow
  const openUpgradeModal = (school) => {
    setUpgradingSchool(school);
    const current = (school.subscriptionPlan || "standard").toLowerCase();
    setSelectedTier(current === "premier" ? "premier" : current === "enterprise" ? "enterprise" : current === "starter" ? "starter" : "standard");
    setTierTermCount(1);
  };

  const triggerTierUpgrade = () => {
    if (!upgradingSchool) return;
    setPendingAction({
      type: "tier",
      school: upgradingSchool,
      planId: selectedTier,
      termCount: tierTermCount,
    });
    setPinModalOpen(true);
  };

  const executeTierUpgrade = async (pin) => {
    if (!pendingAction?.school) return;
    setSavingTier(true);
    try {
      const res = await upgradeInstitutionTierApi(pendingAction.school.id, {
        planId: pendingAction.planId,
        termCount: pendingAction.termCount,
        adminPin: pin,
      });
      if (res.success) {
        toaster.create({
          title: "Tier Upgraded Successfully!",
          description: res.message || `${pendingAction.school.name} upgraded to ${pendingAction.planId.toUpperCase()}`,
          type: "success",
        });
        setUpgradingSchool(null);
        loadInstitutions();
      }
    } catch (err) {
      toaster.create({
        title: "Tier Upgrade Failed",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setSavingTier(false);
      setPendingAction(null);
    }
  };

  const openEditModal = (school) => {
    setEditingSchool(school);
    setEditForm({
      name: school.name || "",
      code: school.code || "",
      subdomain: school.subdomain || "",
      subscriptionPlan: school.subscriptionPlan || "Starter",
      resultCheckerFee: school.resultCheckerFee || 500,
      currentTerm: school.currentTerm || "First Term",
      academicSession: school.academicSession || "2025/2026",
      email: school.email || "",
      phone: school.phone || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingSchool) return;
    setSaving(true);
    try {
      const res = await updateSuperAdminInstitutionApi(editingSchool.id, editForm);
      if (res.success) {
        toaster.create({
          title: "School Updated Successfully!",
          type: "success",
        });
        setEditingSchool(null);
        loadInstitutions();
      }
    } catch (err) {
      toaster.create({
        title: "Failed to update school",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SuperAdminLayout>
      {/* Header */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "stretch", sm: "center" }}
        gap={4}
        mb={6}
      >
        <Box>
          <Flex align="center" gap={2}>
            <Text fontSize="24px" fontWeight="900" color="white" letterSpacing="-0.5px">
              Institutions & Schools Directory
            </Text>
            <Badge bg="#1E293B" color="#6EE7B7" fontSize="11px" fontWeight="800" px={2.5} py={0.5} borderRadius="full">
              {total} Total
            </Badge>
          </Flex>
          <Text fontSize="13px" color="#94A3B8" mt={0.5}>
            Manage schools, adjust per-student subscription tiers, result-checker fees, and ghost-login.
          </Text>
        </Box>
      </Flex>

      {/* Filter Bar */}
      <Box
        bg="#111827"
        p={4}
        borderRadius="2xl"
        border="1px solid #1F2937"
        mb={6}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={3}
          align="center"
          justify="space-between"
        >
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} style={{ flex: 1, width: "100%" }}>
            <Flex
              bg="#1E293B"
              border="1px solid #374151"
              borderRadius="xl"
              px={3}
              h="40px"
              align="center"
              gap={2}
            >
              <Icon as={FaSearch} color="#94A3B8" boxSize={3.5} />
              <Input
                placeholder="Search by school name, code, subdomain, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="unstyled"
                fontSize="13px"
                color="white"
                _placeholder={{ color: "#64748B" }}
              />
              {searchQuery && (
                <Button
                  size="xs"
                  variant="ghost"
                  color="#94A3B8"
                  p={0}
                  onClick={() => {
                    setSearchQuery("");
                    loadInstitutions();
                  }}
                >
                  <Icon as={FaTimes} boxSize={2.5} />
                </Button>
              )}
              <Button
                size="xs"
                bg="#10B981"
                color="white"
                px={3}
                h="28px"
                borderRadius="lg"
                fontWeight="800"
                type="submit"
              >
                Search
              </Button>
            </Flex>
          </form>

          {/* Subscription Plan Filter */}
          <Flex align="center" gap={2} w={{ base: "100%", md: "auto" }}>
            <Text fontSize="12px" fontWeight="700" color="#94A3B8" whiteSpace="nowrap">
              Tier Plan:
            </Text>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              style={{
                height: "40px",
                padding: "0 12px",
                borderRadius: "12px",
                background: "#1E293B",
                border: "1px solid #374151",
                color: "white",
                fontSize: "13px",
                fontWeight: "700",
                outline: "none",
              }}
            >
              <option value="all">All Plans</option>
              <option value="Starter">Starter (₦500/student)</option>
              <option value="Standard">Standard (₦450/student)</option>
              <option value="Premier">Premier (₦400/student)</option>
              <option value="Mega">Mega (₦300/student)</option>
            </select>
          </Flex>
        </Flex>
      </Box>

      {/* Institutions Table */}
      <Box
        bg="#111827"
        borderRadius="2xl"
        border="1px solid #1F2937"
        overflow="hidden"
        boxShadow="0 4px 16px rgba(0,0,0,0.2)"
        mb={8}
      >
        <Box overflowX="auto">
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#1F2937", borderBottom: "1px solid #374151" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>School</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>Subdomain</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", textAlign: "center" }}>Students</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", textAlign: "center" }}>Tier Plan</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", textAlign: "center" }}>Result Paywall</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", textAlign: "center" }}>Settlement</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>
                    Loading schools directory...
                  </td>
                </tr>
              ) : institutions.length ? (
                institutions.map((inst) => {
                  const cut = Math.round(Number(inst.resultCheckerFee || 500) * 0.10);
                  return (
                    <tr
                      key={inst.id}
                      style={{ borderBottom: "1px solid #1F2937", transition: "background 0.15s ease" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#1E293B")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* School Name & Code */}
                      <td style={{ padding: "14px 16px" }}>
                        <Text fontSize="14px" fontWeight="800" color="white">
                          {inst.name}
                        </Text>
                        <Text fontSize="11px" color="#94A3B8">
                          Code: <b style={{ color: "#10B981" }}>{inst.code}</b> &bull; {inst.phone || inst.email || "No contact"}
                        </Text>
                      </td>

                      {/* Subdomain */}
                      <td style={{ padding: "14px 16px" }}>
                        {inst.subdomain ? (
                          <a
                            href={`https://${inst.subdomain}.acesmart.site`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#38BDF8", fontSize: "12px", fontWeight: "700", textDecoration: "none" }}
                          >
                            {inst.subdomain}.acesmart.site <Icon as={FaExternalLinkAlt} boxSize={2.5} ml={1} />
                          </a>
                        ) : (
                          <Text fontSize="11px" color="#64748B">Not set</Text>
                        )}
                      </td>

                      {/* Students Count */}
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <Badge bg="#1E293B" color="#6EE7B7" border="1px solid #374151" px={2.5} py={0.5} borderRadius="md" fontWeight="800">
                          {inst.studentCount} students
                        </Badge>
                      </td>

                      {/* Subscription Plan */}
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <Badge
                          bg={inst.subscriptionPlan === "Premier" ? "#312E81" : "#1E293B"}
                          color={inst.subscriptionPlan === "Premier" ? "#A5B4FC" : "#E2E8F0"}
                          border="1px solid #374151"
                          px={2}
                          py={0.5}
                          borderRadius="md"
                          fontWeight="800"
                          fontSize="11px"
                        >
                          {inst.subscriptionPlan || "Starter"}
                        </Badge>
                      </td>

                      {/* Result Checker Fee & 10% Cut */}
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <Text fontSize="12px" fontWeight="800" color="white">
                          ₦{(inst.resultCheckerFee || 500).toLocaleString()}
                        </Text>
                        <Text fontSize="10px" color="#F59E0B" fontWeight="700">
                          10% cut = ₦{cut}
                        </Text>
                      </td>

                      {/* Settlement Paystack status */}
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        {inst.hasPaystack ? (
                          <Badge bg="#064E3B" color="#6EE7B7" fontSize="10px" fontWeight="800" borderRadius="full" px={2.5} py={0.5}>
                            Connected
                          </Badge>
                        ) : (
                          <Badge bg="#451A03" color="#FCD34D" fontSize="10px" fontWeight="800" borderRadius="full" px={2.5} py={0.5}>
                            Missing
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <Flex justify="flex-end" gap={2}>
                          <Button
                            size="xs"
                            bg="linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)"
                            color="white"
                            borderRadius="lg"
                            fontWeight="800"
                            fontSize="11px"
                            h="28px"
                            px={2.5}
                            _hover={{ opacity: 0.9 }}
                            onClick={() => openUpgradeModal(inst)}
                          >
                            <Icon as={FaCrown} mr={1} boxSize={2.5} />
                            Tier
                          </Button>

                          <Button
                            size="xs"
                            bg="#1E293B"
                            color="#94A3B8"
                            border="1px solid #374151"
                            borderRadius="lg"
                            fontWeight="700"
                            h="28px"
                            px={2.5}
                            _hover={{ bg: "#334155", color: "white" }}
                            onClick={() => openEditModal(inst)}
                          >
                            <Icon as={FaEdit} mr={1} boxSize={2.5} />
                            Edit
                          </Button>
                        </Flex>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: "36px", textAlign: "center", color: "#64748B" }}>
                    No institutions matching the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      </Box>

      {/* Edit School Modal */}
      {editingSchool && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0,0,0,0.75)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1000}
          p={4}
        >
          <Box
            bg="#111827"
            p={6}
            borderRadius="2xl"
            border="1px solid #374151"
            w="100%"
            maxW="560px"
            boxShadow="0 8px 32px rgba(0,0,0,0.5)"
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Box>
                <Text fontSize="18px" fontWeight="900" color="white">
                  Edit {editingSchool.name}
                </Text>
                <Text fontSize="12px" color="#94A3B8">
                  Update subscription tier, custom result-checker fee, or subdomain.
                </Text>
              </Box>
              <Button size="xs" variant="ghost" color="#94A3B8" onClick={() => setEditingSchool(null)}>
                <Icon as={FaTimes} boxSize={3.5} />
              </Button>
            </Flex>

            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3} mb={4}>
              <Box>
                <Text fontSize="11px" fontWeight="800" color="#94A3B8" mb={1}>
                  SCHOOL NAME
                </Text>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  bg="#1E293B"
                  border="1px solid #374151"
                  color="white"
                  fontSize="13px"
                  borderRadius="xl"
                />
              </Box>

              <Box>
                <Text fontSize="11px" fontWeight="800" color="#94A3B8" mb={1}>
                  INSTITUTION CODE
                </Text>
                <Input
                  value={editForm.code}
                  onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                  bg="#1E293B"
                  border="1px solid #374151"
                  color="white"
                  fontSize="13px"
                  borderRadius="xl"
                />
              </Box>

              <Box>
                <Text fontSize="11px" fontWeight="800" color="#94A3B8" mb={1}>
                  SUBDOMAIN (.acesmart.site)
                </Text>
                <Input
                  value={editForm.subdomain}
                  onChange={(e) => setEditForm({ ...editForm, subdomain: e.target.value })}
                  bg="#1E293B"
                  border="1px solid #374151"
                  color="white"
                  fontSize="13px"
                  borderRadius="xl"
                />
              </Box>

              <Box>
                <Text fontSize="11px" fontWeight="800" color="#94A3B8" mb={1}>
                  SUBSCRIPTION TIER
                </Text>
                <select
                  value={editForm.subscriptionPlan}
                  onChange={(e) => setEditForm({ ...editForm, subscriptionPlan: e.target.value })}
                  style={{
                    height: "40px",
                    width: "100%",
                    padding: "0 10px",
                    borderRadius: "12px",
                    background: "#1E293B",
                    border: "1px solid #374151",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: "700",
                    outline: "none",
                  }}
                >
                  <option value="Starter">Starter (₦500/student)</option>
                  <option value="Standard">Standard (₦450/student)</option>
                  <option value="Premier">Premier (₦400/student)</option>
                  <option value="Mega">Mega (₦300/student)</option>
                </select>
              </Box>

              <Box>
                <Text fontSize="11px" fontWeight="800" color="#F59E0B" mb={1}>
                  RESULT CHECKER FEE (₦)
                </Text>
                <Input
                  type="number"
                  value={editForm.resultCheckerFee}
                  onChange={(e) => setEditForm({ ...editForm, resultCheckerFee: e.target.value })}
                  bg="#1E293B"
                  border="1px solid #374151"
                  color="white"
                  fontSize="13px"
                  borderRadius="xl"
                />
                <Text fontSize="10px" color="#94A3B8" mt={0.5}>
                  AceSmart platform takes 10% (₦{Math.round(Number(editForm.resultCheckerFee || 0) * 0.10)})
                </Text>
              </Box>

              <Box>
                <Text fontSize="11px" fontWeight="800" color="#94A3B8" mb={1}>
                  CURRENT TERM
                </Text>
                <Input
                  value={editForm.currentTerm}
                  onChange={(e) => setEditForm({ ...editForm, currentTerm: e.target.value })}
                  bg="#1E293B"
                  border="1px solid #374151"
                  color="white"
                  fontSize="13px"
                  borderRadius="xl"
                />
              </Box>
            </SimpleGrid>

            <Flex justify="flex-end" gap={2} pt={3} borderTop="1px solid #1F2937">
              <Button
                size="sm"
                bg="#1E293B"
                color="white"
                borderRadius="xl"
                onClick={() => setEditingSchool(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                bg="#10B981"
                color="white"
                borderRadius="xl"
                fontWeight="800"
                onClick={handleSaveEdit}
                loading={saving}
              >
                <Icon as={FaSave} mr={1.5} boxSize={3} />
                Save Changes
              </Button>
            </Flex>
          </Box>
        </Box>
      )}

      {/* Tier Upgrade Modal */}
      {upgradingSchool && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0,0,0,0.8)"
          backdropFilter="blur(8px)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1000}
          p={4}
        >
          <Box
            bg="#111827"
            border="1px solid #374151"
            borderRadius="24px"
            w="100%"
            maxW="560px"
            p={6}
            boxShadow="0 25px 60px rgba(0, 0, 0, 0.6)"
          >
            <Flex justify="space-between" align="center" mb={4} pb={3} borderBottom="1px solid #1F2937">
              <Flex align="center" gap={3}>
                <Box
                  w="36px"
                  h="36px"
                  borderRadius="xl"
                  bg="linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                >
                  <Icon as={FaCrown} boxSize={4.5} />
                </Box>
                <Box>
                  <Text fontSize="16px" fontWeight="900" color="white">
                    Upgrade School Tier: {upgradingSchool.name}
                  </Text>
                  <Text fontSize="11px" color="#94A3B8">
                    Direct SuperAdmin Subscription Override & Provisioning
                  </Text>
                </Box>
              </Flex>
              <Button
                size="xs"
                variant="ghost"
                color="#94A3B8"
                onClick={() => setUpgradingSchool(null)}
              >
                <Icon as={FaTimes} boxSize={3.5} />
              </Button>
            </Flex>

            {/* Plan selection cards */}
            <Text fontSize="12px" fontWeight="700" color="#94A3B8" mb={2}>
              Select Target Subscription Tier:
            </Text>
            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={2.5} mb={4}>
              {[
                { id: "free", label: "Free Demo / Pilot", students: "5 Students", price: "₦0" },
                { id: "starter", label: "Starter School", students: "Up to 70 Students", price: "₦25,000 / term" },
                { id: "standard", label: "Standard Academy", students: "Up to 250 Students", price: "₦125,000 / term" },
                { id: "premier", label: "Premier School", students: "Up to 700 Students", price: "₦315,000 / term" },
                { id: "enterprise", label: "Enterprise Group", students: "Unlimited Students", price: "₦400,000 / term" },
              ].map((tier) => {
                const isSelected = selectedTier === tier.id;
                return (
                  <Box
                    key={tier.id}
                    p={3}
                    borderRadius="xl"
                    border="2px solid"
                    borderColor={isSelected ? "#6366F1" : "#1F2937"}
                    bg={isSelected ? "rgba(99, 102, 241, 0.12)" : "#1E293B"}
                    cursor="pointer"
                    transition="all 0.15s ease"
                    onClick={() => setSelectedTier(tier.id)}
                  >
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="13px" fontWeight="800" color={isSelected ? "#818CF8" : "white"}>
                        {tier.label}
                      </Text>
                      {isSelected && <Icon as={FaCheck} color="#6366F1" boxSize={3} />}
                    </Flex>
                    <Text fontSize="11px" color="#94A3B8">
                      {tier.students} &bull; <Text as="span" color="#10B981" fontWeight="700">{tier.price}</Text>
                    </Text>
                  </Box>
                );
              })}
            </SimpleGrid>

            {/* Duration */}
            <Box mb={5}>
              <Text fontSize="12px" fontWeight="700" color="#94A3B8" mb={1.5}>
                Subscription Validity Duration:
              </Text>
              <select
                value={tierTermCount}
                onChange={(e) => setTierTermCount(Number(e.target.value))}
                style={{
                  width: "100%",
                  height: "40px",
                  background: "#1E293B",
                  border: "1px solid #374151",
                  color: "white",
                  borderRadius: "12px",
                  padding: "0 12px",
                  fontSize: "13px",
                  fontWeight: "700",
                }}
              >
                <option value={1}>1 Academic Term (4 Months)</option>
                <option value={2}>2 Academic Terms (8 Months)</option>
                <option value={3}>1 Full Academic Year (12 Months - 3 Terms)</option>
                <option value={6}>2 Full Academic Years (24 Months)</option>
              </select>
            </Box>

            <Flex justify="flex-end" gap={2}>
              <Button
                variant="ghost"
                color="#94A3B8"
                borderRadius="xl"
                size="sm"
                onClick={() => setUpgradingSchool(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                bg="linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)"
                color="white"
                borderRadius="xl"
                fontWeight="800"
                px={5}
                onClick={triggerTierUpgrade}
                loading={savingTier}
              >
                <Icon as={FaShieldAlt} mr={1.5} boxSize={3} />
                Authorize with PIN
              </Button>
            </Flex>
          </Box>
        </Box>
      )}

      {/* Admin Master Security PIN Prompt Modal */}
      <AdminPinPromptModal
        isOpen={pinModalOpen}
        onClose={() => {
          setPinModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={(pin) => {
          setPinModalOpen(false);
          if (pendingAction?.type === "tier") {
            executeTierUpgrade(pin);
          }
        }}
        actionTitle={`Authorize Tier Upgrade: ${pendingAction?.school?.name || ""}`}
        actionDescription={`Please enter your Master Security PIN to upgrade ${pendingAction?.school?.name || "institution"} to the ${String(pendingAction?.planId || "").toUpperCase()} tier.`}
      />
    </SuperAdminLayout>
  );
}
