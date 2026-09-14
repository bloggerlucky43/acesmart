import {
  Box,
  Flex,
  Text,
  Heading,
  Button,
  Input,
  Select,
  Table,
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
} from "react-icons/fa";
import {
  getFeeStructuresApi,
  saveFeeStructureApi,
  deleteFeeStructureApi,
  batchGenerateInvoicesApi,
  getClassArmsApi,
} from "../../api-endpoint/sms/smsEndpoints";
import { toaster } from "../../components/ui/toaster";
import { useAuth } from "../../libs/AuthProvider";

const AdminFeeBillingManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [structures, setStructures] = useState([]);
  const [classArms, setClassArms] = useState([]);
  const [activeTab, setActiveTab] = useState("schedules"); // "schedules" | "billing"

  // Modal / Form state for fee schedule
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    classArmId: "",
    title: "Standard Termly School Fee",
    term: "First Term",
    session: "2025/2026",
    tuitionFee: 35000,
    ictLevy: 5000,
    developmentLevy: 5000,
    examLevy: 3000,
    uniformAndBooks: 2000,
  });

  // Batch Billing Form State
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

  const handleSaveStructure = async (e) => {
    e.preventDefault();
    try {
      const res = await saveFeeStructureApi({
        id: editingId,
        ...formData,
        classArmId: formData.classArmId || null,
        totalAmount: totalCalculated,
      });

      if (res.success) {
        toaster.create({
          title: "Fee Package Saved",
          description: `Total configured: ₦${totalCalculated.toLocaleString()}`,
          type: "success",
        });
        setShowModal(false);
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this fee structure?")) return;
    try {
      await deleteFeeStructureApi(id);
      toaster.create({ title: "Fee package deleted", type: "info" });
      loadData();
    } catch (err) {
      toaster.create({ title: "Delete failed", description: err.message, type: "error" });
    }
  };

  const handleBatchBilling = async () => {
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
        title: "Billing Generation Failed",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setBillingLoading(false);
    }
  };

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1350px" mx="auto" fontFamily="'Outfit', sans-serif">
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
              School Fees & Billing Setup
            </Heading>
            <Badge bg="#F3E8FF" color="#6A1B9A" px={3} py={1} borderRadius="full" fontWeight="700">
              Bursary Suite
            </Badge>
          </Flex>
          <Text fontSize="14px" color="#64748B">
            Configure termly tuition and fees by class arm, and run 1-click batch billing invoices for students.
          </Text>
        </Box>

        <Flex gap={3} wrap="wrap">
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
            bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
            color="white"
            borderRadius="xl"
            boxShadow="0 4px 14px rgba(106, 27, 154, 0.3)"
            _hover={{ opacity: 0.95 }}
            onClick={() => {
              setEditingId(null);
              setFormData({
                classArmId: "",
                title: "Standard Termly School Fee",
                term: "First Term",
                session: "2025/2026",
                tuitionFee: 35000,
                ictLevy: 5000,
                developmentLevy: 5000,
                examLevy: 3000,
                uniformAndBooks: 2000,
              });
              setShowModal(true);
            }}
          >
            <Icon as={FaPlus} mr={2} />
            New Fee Package
          </Button>
        </Flex>
      </Flex>

      {/* Tabs */}
      <Flex gap={2} mb={6} borderBottom="2px solid #E2E8F0" pb={1}>
        <Button
          variant="ghost"
          fontSize="14px"
          fontWeight="700"
          color={activeTab === "schedules" ? "#6A1B9A" : "#64748B"}
          borderBottom={activeTab === "schedules" ? "3px solid #6A1B9A" : "none"}
          borderRadius="none"
          pb={3}
          onClick={() => setActiveTab("schedules")}
        >
          <Icon as={FaCalculator} mr={2} />
          Fee Schedules by Class ({structures.length})
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
          Batch Class Invoicing Engine
        </Button>
      </Flex>

      {/* TAB 1: Fee Schedules */}
      {activeTab === "schedules" && (
        <Box>
          {loading ? (
            <Flex justify="center" p={12}>
              <Spinner size="xl" color="#6A1B9A" />
            </Flex>
          ) : structures.length === 0 ? (
            <Box
              p={10}
              bg="#F8FAFC"
              borderRadius="2xl"
              border="2px dashed #CBD5E1"
              textAlign="center"
            >
              <Icon as={FaCalculator} boxSize={10} color="#94A3B8" mb={3} />
              <Heading fontSize="18px" color="#334155" mb={2}>
                No Fee Structures Configured Yet
              </Heading>
              <Text fontSize="14px" color="#64748B" mb={4}>
                Click below to set up tuition, ICT levies, and development fees for your classes.
              </Text>
              <Button
                bg="#6A1B9A"
                color="white"
                borderRadius="xl"
                onClick={() => setShowModal(true)}
              >
                <Icon as={FaPlus} mr={2} />
                Create First Fee Package
              </Button>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
              {structures.map((s) => (
                <Box
                  key={s.id}
                  bg="white"
                  p={5}
                  borderRadius="2xl"
                  border="1px solid #E2E8F0"
                  boxShadow="0 4px 16px rgba(0,0,0,0.03)"
                  position="relative"
                  transition="all 0.2s ease"
                  _hover={{ borderColor: "#6A1B9A", transform: "translateY(-2px)" }}
                >
                  <Flex justify="space-between" align="flex-start" mb={3}>
                    <Box>
                      <Badge
                        bg="#EFF6FF"
                        color="#2563EB"
                        px={2.5}
                        py={0.5}
                        borderRadius="md"
                        fontSize="11px"
                        fontWeight="700"
                        mb={1}
                      >
                        {s.ClassArm ? s.ClassArm.name : "All Classes (Global)"}
                      </Badge>
                      <Heading fontSize="17px" color="#0F172A" fontWeight="800">
                        {s.title}
                      </Heading>
                      <Text fontSize="12px" color="#64748B">
                        {s.term} • {s.session}
                      </Text>
                    </Box>

                    <Button
                      size="xs"
                      variant="ghost"
                      color="#EF4444"
                      _hover={{ bg: "#FEE2E2" }}
                      onClick={() => handleDelete(s.id)}
                    >
                      <Icon as={FaTrash} boxSize={3} />
                    </Button>
                  </Flex>

                  {/* Breakdown Table */}
                  <Box bg="#F8FAFC" p={3.5} borderRadius="xl" mb={4} fontSize="13px">
                    <Flex justify="space-between" py={1} borderBottom="1px solid #E2E8F0">
                      <Text color="#64748B">Tuition:</Text>
                      <Text fontWeight="600" color="#1E293B">₦{Number(s.tuitionFee).toLocaleString()}</Text>
                    </Flex>
                    <Flex justify="space-between" py={1} borderBottom="1px solid #E2E8F0">
                      <Text color="#64748B">ICT / Computer Levy:</Text>
                      <Text fontWeight="600" color="#1E293B">₦{Number(s.ictLevy).toLocaleString()}</Text>
                    </Flex>
                    <Flex justify="space-between" py={1} borderBottom="1px solid #E2E8F0">
                      <Text color="#64748B">Development Levy:</Text>
                      <Text fontWeight="600" color="#1E293B">₦{Number(s.developmentLevy).toLocaleString()}</Text>
                    </Flex>
                    <Flex justify="space-between" py={1} borderBottom="1px solid #E2E8F0">
                      <Text color="#64748B">Exam / Assessment:</Text>
                      <Text fontWeight="600" color="#1E293B">₦{Number(s.examLevy).toLocaleString()}</Text>
                    </Flex>
                    <Flex justify="space-between" py={1}>
                      <Text color="#64748B">Uniform & Books:</Text>
                      <Text fontWeight="600" color="#1E293B">₦{Number(s.uniformAndBooks).toLocaleString()}</Text>
                    </Flex>
                  </Box>

                  {/* Total Tag */}
                  <Flex justify="space-between" align="center" pt={1}>
                    <Text fontSize="13px" fontWeight="700" color="#475569">
                      Total Fee Amount:
                    </Text>
                    <Text fontSize="19px" fontWeight="900" color="#6A1B9A">
                      ₦{Number(s.totalAmount).toLocaleString()}
                    </Text>
                  </Flex>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>
      )}

      {/* TAB 2: Batch Billing Generator */}
      {activeTab === "billing" && (
        <Box maxW="800px" bg="white" p={{ base: 5, md: 8 }} borderRadius="2xl" border="1px solid #E2E8F0" boxShadow="sm">
          <Flex align="center" gap={3} mb={3}>
            <Icon as={FaFileInvoiceDollar} boxSize={6} color="#6A1B9A" />
            <Heading fontSize="20px" fontWeight="800" color="#0F172A">
              Batch Class Invoice Generator
            </Heading>
          </Flex>
          <Text fontSize="14px" color="#64748B" mb={6}>
            Instantly create or sync termly billing invoices for all students in a class arm based on your configured fee package.
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
                }}
              >
                <option value="">All Classes (School-wide)</option>
                {classArms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
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
                  How Batch Invoicing Works:
                </Text>
                <Text>
                  1. Any student enrolled in the target class will receive a formal invoice for <strong>{billingTerm} ({billingSession})</strong>.
                </Text>
                <Text>
                  2. If a student was already billed and made partial payments, their payment record is preserved and only the outstanding balance is adjusted.
                </Text>
                <Text>
                  3. Students and parents will instantly see their active invoice on their <strong>Student Portal</strong>.
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
            onClick={handleBatchBilling}
          >
            <Icon as={FaCheckCircle} mr={2} />
            Generate & Bill Invoices Now
          </Button>

          {billingResult && (
            <Box mt={6} p={5} bg="#F0FDF4" border="1px solid #86EFAC" borderRadius="xl">
              <Flex align="center" gap={3} mb={2}>
                <Icon as={FaCheckCircle} color="#16A34A" boxSize={5} />
                <Heading fontSize="16px" color="#166534" fontWeight="800">
                  Billing Completed Successfully!
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
                View Debtors & Defaulters Tracker <Icon as={FaArrowRight} ml={1.5} boxSize={3} />
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* CREATE / EDIT FEE PACKAGE MODAL */}
      {showModal && (
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
              <Heading fontSize="20px" fontWeight="800" color="#0F172A">
                {editingId ? "Edit Fee Package" : "Create Class Fee Package"}
              </Heading>
              <Button size="xs" variant="ghost" onClick={() => setShowModal(false)}>
                ✕
              </Button>
            </Flex>

            <form onSubmit={handleSaveStructure}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={4}>
                <Box>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                    Applicable Class Arm:
                  </Text>
                  <select
                    value={formData.classArmId}
                    onChange={(e) => setFormData({ ...formData, classArmId: e.target.value })}
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
                    <option value="">All Classes (Global Default)</option>
                    {classArms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Box>

                <Box>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                    Package Title:
                  </Text>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Senior Secondary Termly Fee"
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
                  Fee Components (₦):
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
                    <Text fontSize="12px" color="#64748B" mb={1}>ICT Levy (₦)</Text>
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

                {/* Total Preview */}
                <Flex justify="space-between" align="center" mt={4} pt={3} borderTop="1.5px solid #CBD5E1">
                  <Text fontSize="14px" fontWeight="800" color="#1E293B">
                    Computed Total Amount:
                  </Text>
                  <Text fontSize="20px" fontWeight="900" color="#6A1B9A">
                    ₦{totalCalculated.toLocaleString()}
                  </Text>
                </Flex>
              </Box>

              <Flex justify="flex-end" gap={3}>
                <Button variant="ghost" onClick={() => setShowModal(false)} borderRadius="xl">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
                  color="white"
                  borderRadius="xl"
                  px={6}
                >
                  Save Fee Package
                </Button>
              </Flex>
            </form>
          </Box>
        </Flex>
      )}
    </Box>
  );
};

export default AdminFeeBillingManager;
