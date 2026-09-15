import {
  Box,
  Flex,
  Text,
  Heading,
  Button,
  Input,
  Badge,
  Icon,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMoneyBillWave,
  FaPlus,
  FaFileInvoiceDollar,
  FaTrash,
  FaCheckCircle,
  FaCalculator,
  FaExclamationTriangle,
  FaUsers,
  FaArrowRight,
  FaLayerGroup,
  FaGraduationCap,
  FaEdit,
} from "react-icons/fa";
import {
  getFeeStructuresApi,
  saveFeeStructureApi,
  deleteFeeStructureApi,
  batchGenerateInvoicesApi,
  getClassArmsApi,
  createClassArmApi,
} from "../../api-endpoint/sms/smsEndpoints";
import { toaster } from "../../components/ui/toaster";
import { useAuth } from "../../libs/AuthProvider";
import DashboardLayout from "../../constants/dashboardlayout";
import AllocatePaymentModal from "../../components/sms/AllocatePaymentModal";

const AdminFeeBillingManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [structures, setStructures] = useState([]);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [classArms, setClassArms] = useState([]);
  const [activeTab, setActiveTab] = useState("classes"); // "classes" | "billing" | "all_schedules"

  // Class Arm Creation Modal
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassLevel, setNewClassLevel] = useState("Junior Secondary");
  const [seedingClasses, setSeedingClasses] = useState(false);

  // Fee Schedule Modal
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [targetClassName, setTargetClassName] = useState("");
  const [formData, setFormData] = useState({
    classArmId: "",
    title: "Termly Class Fee Package",
    term: "First Term",
    session: "2025/2026",
    tuitionFee: 35000,
    ictLevy: 5000,
    developmentLevy: 5000,
    examLevy: 3000,
    uniformAndBooks: 2000,
  });

  // Batch Billing State
  const [billingClassArmId, setBillingClassArmId] = useState("");
  const [billingTerm, setBillingTerm] = useState("First Term");
  const [billingSession, setBillingSession] = useState("2025/2026");
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingResult, setBillingResult] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [structRes, classRes] = await Promise.all([
        getFeeStructuresApi().catch(() => ({ success: false, data: [] })),
        getClassArmsApi().catch(() => ({ success: false, data: [] })),
      ]);

      if (structRes.success) setStructures(structRes.data || []);
      if (classRes.success) setClassArms(classRes.data || []);
    } catch (err) {
      toaster.create({
        title: "Failed to load fee configuration",
        description: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalCalculated =
    Number(formData.tuitionFee || 0) +
    Number(formData.ictLevy || 0) +
    Number(formData.developmentLevy || 0) +
    Number(formData.examLevy || 0) +
    Number(formData.uniformAndBooks || 0);

  const handleCreateClassArm = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    try {
      const res = await createClassArmApi({
        name: newClassName.trim(),
        level: newClassLevel,
      });

      if (res.success) {
        toaster.create({ title: `Class arm "${newClassName}" created!`, type: "success" });
        setNewClassName("");
        setShowAddClassModal(false);
        loadData();
      }
    } catch (err) {
      toaster.create({
        title: "Failed to create class arm",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    }
  };

  const handleQuickSeedClasses = async () => {
    setSeedingClasses(true);
    const standard = [
      { name: "JSS 1", level: "Junior Secondary" },
      { name: "JSS 2", level: "Junior Secondary" },
      { name: "JSS 3", level: "Junior Secondary" },
      { name: "SS 1", level: "Senior Secondary" },
      { name: "SS 2", level: "Senior Secondary" },
      { name: "SS 3", level: "Senior Secondary" },
    ];

    try {
      for (const c of standard) {
        await createClassArmApi(c).catch(() => null);
      }
      toaster.create({ title: "Standard classes (JSS 1 to SS 3) added successfully!", type: "success" });
      loadData();
    } catch (err) {
      toaster.create({ title: "Failed to seed classes", type: "error" });
    } finally {
      setSeedingClasses(false);
    }
  };

  const handleOpenFeeModalForClass = (classItem) => {
    // Check if fee structure already exists for this class
    const existing = structures.find((s) => s.classArmId === classItem.id);
    if (existing) {
      setEditingId(existing.id);
      setFormData({
        classArmId: classItem.id,
        title: existing.title || `${classItem.name} Fee Package`,
        term: existing.term || "First Term",
        session: existing.session || "2025/2026",
        tuitionFee: existing.tuitionFee || 0,
        ictLevy: existing.ictLevy || 0,
        developmentLevy: existing.developmentLevy || 0,
        examLevy: existing.examLevy || 0,
        uniformAndBooks: existing.uniformAndBooks || 0,
      });
    } else {
      setEditingId(null);
      setFormData({
        classArmId: classItem.id,
        title: `${classItem.name} Standard Termly Fee`,
        term: "First Term",
        session: "2025/2026",
        tuitionFee: 35000,
        ictLevy: 5000,
        developmentLevy: 5000,
        examLevy: 3000,
        uniformAndBooks: 2000,
      });
    }
    setTargetClassName(classItem.name);
    setShowFeeModal(true);
  };

  const handleSaveStructure = async (e) => {
    e.preventDefault();
    try {
      const res = await saveFeeStructureApi({
        id: editingId,
        ...formData,
        totalAmount: totalCalculated,
      });

      if (res.success) {
        toaster.create({
          title: "Fee Package Configured",
          description: `Total for ${targetClassName || "Class"}: ₦${totalCalculated.toLocaleString()}`,
          type: "success",
        });
        setShowFeeModal(false);
        setEditingId(null);
        loadData();
      }
    } catch (err) {
      toaster.create({
        title: "Save Failed",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    }
  };

  const handleDeleteStructure = async (id) => {
    if (!window.confirm("Are you sure you want to remove this fee package?")) return;
    try {
      await deleteFeeStructureApi(id);
      toaster.create({ title: "Fee package removed", type: "info" });
      loadData();
    } catch (err) {
      toaster.create({ title: "Delete failed", description: err.message, type: "error" });
    }
  };

  const handleDirectClassBilling = (classItem) => {
    setBillingClassArmId(classItem.id);
    setActiveTab("billing");
  };

  const handleBatchBillingSubmit = async () => {
    setBillingLoading(true);
    setBillingResult(null);
    try {
      const res = await batchGenerateInvoicesApi({
        classArmId: billingClassArmId || undefined,
        term: billingTerm,
        session: billingSession,
      });

      if (res.success) {
        setBillingResult(res.data);
        toaster.create({
          title: "Billing Invoices Generated!",
          description: res.message,
          type: "success",
        });
      }
    } catch (err) {
      toaster.create({
        title: "Billing Failed",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setBillingLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Box
        p={{ base: 4, md: 8 }}
        pt={{ base: "84px", md: "88px" }}
        pl={{ base: 4, lg: "260px" }}
        maxW="1350px"
        mx="auto"
        fontFamily="'Outfit', sans-serif"
      >
        {/* Header */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          gap={4}
          mb={8}
        >
          <Box>
            <Flex align="center" gap={3} mb={1}>
              <Heading fontSize={{ base: "22px", md: "28px" }} fontWeight="800" color="#0F172A">
                Class School Fees & Billing
              </Heading>
              <Badge bg="#F3E8FF" color="#6A1B9A" px={3} py={1} borderRadius="full" fontWeight="700">
                Class-Arm Architecture
              </Badge>
            </Flex>
            <Text fontSize="14px" color="#64748B">
              Create class arms (e.g. JSS 1, SS 2), set specific school fees per class, and bill enrolled students with 1-click invoices.
            </Text>
          </Box>

          <Flex gap={3} wrap="wrap">
            <Button
              size="md"
              bg="#10B981"
              color="white"
              borderRadius="xl"
              fontWeight="700"
              _hover={{ bg: "#059669", transform: "translateY(-1px)" }}
              onClick={() => setShowAllocateModal(true)}
            >
              <Icon as={FaMoneyBillWave} mr={2} />
              Allocate Manual Payment
            </Button>

            <Button
              size="md"
              variant="outline"
              borderColor="#CBD5E1"
              color="#334155"
              borderRadius="xl"
              onClick={() => navigate("/institution/debtors")}
            >
              <Icon as={FaFileInvoiceDollar} mr={2} color="#EF4444" />
              Debtors & Defaulters
            </Button>

            <Button
              size="md"
              variant="outline"
              borderColor="#6A1B9A"
              color="#6A1B9A"
              borderRadius="xl"
              _hover={{ bg: "#F3E8FF" }}
              onClick={() => setShowAddClassModal(true)}
          >
            <Icon as={FaLayerGroup} mr={2} />
            + Add Class Arm
          </Button>

          {classArms.length === 0 && (
            <Button
              size="md"
              bg="#10B981"
              color="white"
              borderRadius="xl"
              loading={seedingClasses}
              onClick={handleQuickSeedClasses}
            >
              ⚡ Auto-Seed (JSS 1 - SS 3)
            </Button>
          )}
        </Flex>
      </Flex>

      {/* Navigation Tabs */}
      <Flex gap={2} mb={6} borderBottom="2px solid #E2E8F0" pb={1} overflowX="auto">
        <Button
          variant="ghost"
          fontSize="14px"
          fontWeight="700"
          color={activeTab === "classes" ? "#6A1B9A" : "#64748B"}
          borderBottom={activeTab === "classes" ? "3px solid #6A1B9A" : "none"}
          borderRadius="none"
          pb={3}
          onClick={() => setActiveTab("classes")}
        >
          <Icon as={FaGraduationCap} mr={2} />
          Class Arms & Fee Schedules ({classArms.length} Classes)
        </Button>

        <Button
          variant="ghost"
          fontSize="14px"
          fontWeight="700"
          color={activeTab === "billing" ? "#6A1B9A" : "#64748B"}
          borderBottom={activeTab === "billing" ? "3px solid #6A1B9A" : "none"}
          borderRadius="none"
          pb={3}
          onClick={() => setActiveTab("billing")}
        >
          <Icon as={FaMoneyBillWave} mr={2} />
          1-Click Batch Invoicing Engine
        </Button>
      </Flex>

      {/* TAB 1: Classes & Assigned Fee Schedules */}
      {activeTab === "classes" && (
        <Box>
          {loading ? (
            <Flex justify="center" p={12}>
              <Spinner size="xl" color="#6A1B9A" />
            </Flex>
          ) : classArms.length === 0 ? (
            <Box
              p={10}
              bg="#F8FAFC"
              borderRadius="2xl"
              border="2px dashed #CBD5E1"
              textAlign="center"
            >
              <Icon as={FaLayerGroup} boxSize={12} color="#94A3B8" mb={3} />
              <Heading fontSize="19px" color="#334155" mb={2}>
                No Class Arms Created Yet
              </Heading>
              <Text fontSize="14px" color="#64748B" maxW="480px" mx="auto" mb={5}>
                Add your school classes (e.g. JSS 1, JSS 2, SS 1 Science) so you can assign customized termly school fees to each category.
              </Text>
              <Flex justify="center" gap={3} wrap="wrap">
                <Button
                  bg="#6A1B9A"
                  color="white"
                  borderRadius="xl"
                  onClick={() => setShowAddClassModal(true)}
                >
                  <Icon as={FaPlus} mr={2} />
                  Add Custom Class
                </Button>
                <Button
                  variant="outline"
                  borderColor="#10B981"
                  color="#10B981"
                  borderRadius="xl"
                  loading={seedingClasses}
                  onClick={handleQuickSeedClasses}
                >
                  ⚡ Auto-Add JSS 1 to SS 3
                </Button>
              </Flex>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
              {classArms.map((cls) => {
                const assignedFee = structures.find((s) => s.classArmId === cls.id);
                return (
                  <Box
                    key={cls.id}
                    bg="white"
                    p={5}
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={assignedFee ? "#E2E8F0" : "#FDE68A"}
                    boxShadow="0 4px 16px rgba(0,0,0,0.03)"
                    position="relative"
                    transition="all 0.2s ease"
                    _hover={{ borderColor: "#6A1B9A", transform: "translateY(-2px)" }}
                  >
                    {/* Card Top */}
                    <Flex justify="space-between" align="flex-start" mb={3}>
                      <Box>
                        <Badge
                          bg="#F3E8FF"
                          color="#6A1B9A"
                          px={2.5}
                          py={0.5}
                          borderRadius="md"
                          fontSize="11px"
                          fontWeight="800"
                          mb={1}
                        >
                          {cls.level || "Class Arm"}
                        </Badge>
                        <Heading fontSize="19px" color="#0F172A" fontWeight="900">
                          {cls.name}
                        </Heading>
                      </Box>

                      {assignedFee ? (
                        <Badge bg="#DCFCE7" color="#166534" px={2.5} py={1} borderRadius="full" fontSize="11px" fontWeight="700">
                          Fee Assigned
                        </Badge>
                      ) : (
                        <Badge bg="#FEF3C7" color="#92400E" px={2.5} py={1} borderRadius="full" fontSize="11px" fontWeight="700">
                          No Fee Set
                        </Badge>
                      )}
                    </Flex>

                    {/* Breakdown or Empty state */}
                    {assignedFee ? (
                      <Box bg="#F8FAFC" p={3.5} borderRadius="xl" mb={4} fontSize="13px">
                        <Flex justify="space-between" py={0.8} borderBottom="1px solid #E2E8F0">
                          <Text color="#64748B">Tuition:</Text>
                          <Text fontWeight="600" color="#1E293B">₦{Number(assignedFee.tuitionFee).toLocaleString()}</Text>
                        </Flex>
                        <Flex justify="space-between" py={0.8} borderBottom="1px solid #E2E8F0">
                          <Text color="#64748B">ICT Levy:</Text>
                          <Text fontWeight="600" color="#1E293B">₦{Number(assignedFee.ictLevy).toLocaleString()}</Text>
                        </Flex>
                        <Flex justify="space-between" py={0.8} borderBottom="1px solid #E2E8F0">
                          <Text color="#64748B">Development:</Text>
                          <Text fontWeight="600" color="#1E293B">₦{Number(assignedFee.developmentLevy).toLocaleString()}</Text>
                        </Flex>
                        <Flex justify="space-between" py={0.8} borderBottom="1px solid #E2E8F0">
                          <Text color="#64748B">Exam / Assessment:</Text>
                          <Text fontWeight="600" color="#1E293B">₦{Number(assignedFee.examLevy).toLocaleString()}</Text>
                        </Flex>
                        <Flex justify="space-between" py={0.8}>
                          <Text color="#64748B">Books / Uniform:</Text>
                          <Text fontWeight="600" color="#1E293B">₦{Number(assignedFee.uniformAndBooks).toLocaleString()}</Text>
                        </Flex>

                        <Flex justify="space-between" align="center" pt={2} mt={1} borderTop="1.5px solid #CBD5E1">
                          <Text fontWeight="800" color="#0F172A">Total Fee:</Text>
                          <Text fontWeight="900" fontSize="17px" color="#6A1B9A">
                            ₦{Number(assignedFee.totalAmount).toLocaleString()}
                          </Text>
                        </Flex>
                      </Box>
                    ) : (
                      <Box bg="#FFFBEB" p={4} borderRadius="xl" mb={4} textAlign="center" border="1px solid #FDE68A">
                        <Text fontSize="13px" color="#B45309" fontWeight="600">
                          No fees configured for {cls.name} yet.
                        </Text>
                        <Text fontSize="11px" color="#92400E" mt={1}>
                          Students enrolled in this class will not receive invoices until fees are assigned.
                        </Text>
                      </Box>
                    )}

                    {/* Action Buttons */}
                    <Flex gap={2}>
                      <Button
                        flex={1}
                        size="sm"
                        variant="outline"
                        borderColor="#CBD5E1"
                        borderRadius="xl"
                        fontSize="12px"
                        fontWeight="700"
                        onClick={() => handleOpenFeeModalForClass(cls)}
                      >
                        <Icon as={FaEdit} mr={1.5} />
                        {assignedFee ? "Edit Fees" : "Assign Fees"}
                      </Button>

                      {assignedFee && (
                        <Button
                          flex={1}
                          size="sm"
                          bg="linear-gradient(135deg, #10B981 0%, #059669 100%)"
                          color="white"
                          borderRadius="xl"
                          fontSize="12px"
                          fontWeight="700"
                          _hover={{ opacity: 0.95 }}
                          onClick={() => handleDirectClassBilling(cls)}
                        >
                          ⚡ Bill Class
                        </Button>
                      )}
                    </Flex>
                  </Box>
                );
              })}
            </SimpleGrid>
          )}
        </Box>
      )}

      {/* TAB 2: 1-Click Batch Invoicing Engine */}
      {activeTab === "billing" && (
        <Box maxW="800px" bg="white" p={{ base: 5, md: 8 }} borderRadius="2xl" border="1px solid #E2E8F0" boxShadow="sm">
          <Flex align="center" gap={3} mb={3}>
            <Icon as={FaFileInvoiceDollar} boxSize={6} color="#6A1B9A" />
            <Heading fontSize="20px" fontWeight="800" color="#0F172A">
              Class Batch Invoicing Engine
            </Heading>
          </Flex>
          <Text fontSize="14px" color="#64748B" mb={6}>
            Select a target class arm to invoice students based on their specific class fee schedule.
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={5}>
            <Box>
              <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                Target Class Arm:
              </Text>
              <select
                value={billingClassArmId}
                onChange={(e) => setBillingClassArmId(e.target.value)}
                style={{
                  width: "100%",
                  height: "44px",
                  borderRadius: "12px",
                  border: "1px solid #CBD5E1",
                  padding: "0 12px",
                  fontSize: "14px",
                  background: "white",
                  color: "#0F172A",
                }}
              >
                <option value="">All Classes (School-wide)</option>
                {classArms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.level || "Arm"})
                  </option>
                ))}
              </select>
            </Box>

            <Box>
              <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                Academic Term:
              </Text>
              <select
                value={billingTerm}
                onChange={(e) => setBillingTerm(e.target.value)}
                style={{
                  width: "100%",
                  height: "44px",
                  borderRadius: "12px",
                  border: "1px solid #CBD5E1",
                  padding: "0 12px",
                  fontSize: "14px",
                  background: "white",
                  color: "#0F172A",
                }}
              >
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Third Term">Third Term</option>
              </select>
            </Box>

            <Box>
              <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                Academic Session:
              </Text>
              <Input
                value={billingSession}
                onChange={(e) => setBillingSession(e.target.value)}
                borderRadius="xl"
                h="44px"
              />
            </Box>
          </SimpleGrid>

          <Box bg="#EFF6FF" p={4} borderRadius="xl" border="1px solid #BFDBFE" mb={6}>
            <Flex align="flex-start" gap={3}>
              <Icon as={FaExclamationTriangle} color="#2563EB" boxSize={4} mt={1} />
              <Box fontSize="13px" color="#1E3A8A">
                <Text fontWeight="700" mb={1}>
                  Smart Class Invoicing Logic:
                </Text>
                <Text>
                  • Each student in this class is billed the exact fee package configured for their class arm.
                </Text>
                <Text>
                  • If students have made partial payments, their existing balance is preserved and adjusted.
                </Text>
                <Text>
                  • Students and parents immediately see their active invoice on their <strong>Student Portal</strong>.
                </Text>
              </Box>
            </Flex>
          </Box>

          <Button
            w="100%"
            h="48px"
            bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
            color="white"
            borderRadius="xl"
            fontSize="15px"
            fontWeight="700"
            boxShadow="0 4px 14px rgba(106, 27, 154, 0.3)"
            _hover={{ opacity: 0.95 }}
            loading={billingLoading}
            onClick={handleBatchBillingSubmit}
          >
            <Icon as={FaCheckCircle} mr={2} />
            Generate Invoices for Selected Class
          </Button>

          {billingResult && (
            <Box mt={6} p={5} bg="#F0FDF4" border="1px solid #86EFAC" borderRadius="xl">
              <Flex align="center" gap={3} mb={2}>
                <Icon as={FaCheckCircle} color="#16A34A" boxSize={5} />
                <Heading fontSize="16px" color="#166534" fontWeight="800">
                  Billing Invoices Successfully Generated!
                </Heading>
              </Flex>
              <Text fontSize="13px" color="#15803D" mb={3}>
                Invoiced <strong>{billingResult.totalStudentsBilled} students</strong> at{" "}
                <strong>₦{Number(billingResult.billingAmount).toLocaleString()}</strong> each.
              </Text>
              <Button
                size="sm"
                bg="#16A34A"
                color="white"
                borderRadius="lg"
                onClick={() => navigate("/institution/debtors")}
              >
                Open Debtors Defaulter Tracker <Icon as={FaArrowRight} ml={1.5} boxSize={3} />
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* MODAL 1: ADD NEW CLASS ARM */}
      {showAddClassModal && (
        <Flex
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg="rgba(15, 23, 42, 0.7)"
          backdropFilter="blur(6px)"
          zIndex={9999}
          align="center"
          justify="center"
          p={4}
        >
          <Box bg="white" w="100%" maxW="480px" borderRadius="2xl" boxShadow="2xl" p={6}>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading fontSize="18px" fontWeight="800" color="#0F172A">
                Add New Class Arm
              </Heading>
              <Button size="xs" variant="ghost" onClick={() => setShowAddClassModal(false)}>✕</Button>
            </Flex>

            <form onSubmit={handleCreateClassArm}>
              <Box mb={4}>
                <Text fontSize="13px" fontWeight="700" color="#334155" mb={1}>
                  Class Name * (e.g. JSS 1, SS 2 Science)
                </Text>
                <Input
                  placeholder="e.g. JSS 1 Gold or SS 3"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  borderRadius="xl"
                  h="44px"
                  required
                />
              </Box>

              <Box mb={6}>
                <Text fontSize="13px" fontWeight="700" color="#334155" mb={1}>
                  Category / Level
                </Text>
                <select
                  value={newClassLevel}
                  onChange={(e) => setNewClassLevel(e.target.value)}
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "12px",
                    border: "1px solid #CBD5E1",
                    padding: "0 12px",
                    fontSize: "14px",
                    background: "white",
                  }}
                >
                  <option value="Junior Secondary">Junior Secondary (JSS)</option>
                  <option value="Senior Secondary">Senior Secondary (SSS)</option>
                  <option value="Primary / Basic">Primary / Basic</option>
                  <option value="Nursery / Early Years">Nursery / Early Years</option>
                </select>
              </Box>

              <Flex justify="flex-end" gap={3}>
                <Button variant="ghost" onClick={() => setShowAddClassModal(false)} borderRadius="xl">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  bg="#6A1B9A"
                  color="white"
                  borderRadius="xl"
                  px={6}
                >
                  Save Class Arm
                </Button>
              </Flex>
            </form>
          </Box>
        </Flex>
      )}

      {/* MODAL 2: CONFIGURE FEE SCHEDULE FOR CLASS */}
      {showFeeModal && (
        <Flex
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg="rgba(15, 23, 42, 0.7)"
          backdropFilter="blur(6px)"
          zIndex={9999}
          align="center"
          justify="center"
          p={4}
        >
          <Box
            bg="white"
            w="100%"
            maxW="560px"
            borderRadius="2xl"
            boxShadow="2xl"
            p={{ base: 5, md: 7 }}
            maxH="90vh"
            overflowY="auto"
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Box>
                <Badge bg="#F3E8FF" color="#6A1B9A" px={2.5} py={0.5} borderRadius="md" fontSize="11px" fontWeight="800">
                  {targetClassName || "Class Arm"}
                </Badge>
                <Heading fontSize="20px" fontWeight="800" color="#0F172A" mt={1}>
                  Configure School Fees for {targetClassName}
                </Heading>
              </Box>
              <Button size="xs" variant="ghost" onClick={() => setShowFeeModal(false)}>✕</Button>
            </Flex>

            <form onSubmit={handleSaveStructure}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={4}>
                <Box>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                    Package Title:
                  </Text>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Standard Termly Fee"
                    borderRadius="lg"
                    h="40px"
                    fontSize="13px"
                  />
                </Box>

                <Box>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                    Term:
                  </Text>
                  <select
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    style={{
                      width: "100%",
                      height: "40px",
                      borderRadius: "10px",
                      border: "1px solid #CBD5E1",
                      padding: "0 10px",
                      fontSize: "13px",
                      background: "white",
                    }}
                  >
                    <option value="First Term">First Term</option>
                    <option value="Second Term">Second Term</option>
                    <option value="Third Term">Third Term</option>
                  </select>
                </Box>

                <Box>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                    Session:
                  </Text>
                  <Input
                    value={formData.session}
                    onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                    borderRadius="lg"
                    h="40px"
                    fontSize="13px"
                  />
                </Box>
              </SimpleGrid>

              {/* Fee Breakdown Inputs */}
              <Box bg="#F8FAFC" p={4} borderRadius="xl" border="1px solid #E2E8F0" mb={4}>
                <Heading fontSize="14px" fontWeight="800" color="#334155" mb={3}>
                  Fee Breakdown Items (₦):
                </Heading>

                <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
                  <Box>
                    <Text fontSize="12px" color="#64748B" mb={1}>Tuition Fee (₦)</Text>
                    <Input
                      type="number"
                      value={formData.tuitionFee}
                      onChange={(e) => setFormData({ ...formData, tuitionFee: e.target.value })}
                      borderRadius="lg"
                      bg="white"
                      h="38px"
                      fontSize="13px"
                    />
                  </Box>

                  <Box>
                    <Text fontSize="12px" color="#64748B" mb={1}>ICT / Computer Levy (₦)</Text>
                    <Input
                      type="number"
                      value={formData.ictLevy}
                      onChange={(e) => setFormData({ ...formData, ictLevy: e.target.value })}
                      borderRadius="lg"
                      bg="white"
                      h="38px"
                      fontSize="13px"
                    />
                  </Box>

                  <Box>
                    <Text fontSize="12px" color="#64748B" mb={1}>Development Levy (₦)</Text>
                    <Input
                      type="number"
                      value={formData.developmentLevy}
                      onChange={(e) => setFormData({ ...formData, developmentLevy: e.target.value })}
                      borderRadius="lg"
                      bg="white"
                      h="38px"
                      fontSize="13px"
                    />
                  </Box>

                  <Box>
                    <Text fontSize="12px" color="#64748B" mb={1}>Exam / Assessment (₦)</Text>
                    <Input
                      type="number"
                      value={formData.examLevy}
                      onChange={(e) => setFormData({ ...formData, examLevy: e.target.value })}
                      borderRadius="lg"
                      bg="white"
                      h="38px"
                      fontSize="13px"
                    />
                  </Box>

                  <Box>
                    <Text fontSize="12px" color="#64748B" mb={1}>Uniforms & Books (₦)</Text>
                    <Input
                      type="number"
                      value={formData.uniformAndBooks}
                      onChange={(e) => setFormData({ ...formData, uniformAndBooks: e.target.value })}
                      borderRadius="lg"
                      bg="white"
                      h="38px"
                      fontSize="13px"
                    />
                  </Box>
                </SimpleGrid>

                {/* Computed Total */}
                <Flex justify="space-between" align="center" mt={4} pt={3} borderTop="1.5px solid #CBD5E1">
                  <Text fontSize="14px" fontWeight="800" color="#1E293B">
                    Total for {targetClassName}:
                  </Text>
                  <Text fontSize="20px" fontWeight="900" color="#6A1B9A">
                    ₦{totalCalculated.toLocaleString()}
                  </Text>
                </Flex>
              </Box>

              <Flex justify="space-between" align="center">
                {editingId ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    color="#EF4444"
                    onClick={() => {
                      handleDeleteStructure(editingId);
                      setShowFeeModal(false);
                    }}
                  >
                    <Icon as={FaTrash} mr={1} /> Delete Package
                  </Button>
                ) : <Box />}

                <Flex gap={3}>
                  <Button variant="ghost" onClick={() => setShowFeeModal(false)} borderRadius="xl">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
                    color="white"
                    borderRadius="xl"
                    px={6}
                  >
                    Save {targetClassName} Fees
                  </Button>
                </Flex>
              </Flex>
            </form>
          </Box>
        </Flex>
      )}
      </Box>

      {/* Allocate Manual Payment Modal */}
      <AllocatePaymentModal
        isOpen={showAllocateModal}
        onClose={() => setShowAllocateModal(false)}
        onPaymentSuccess={() => loadData()}
      />
    </DashboardLayout>
  );
};

export default AdminFeeBillingManager;
