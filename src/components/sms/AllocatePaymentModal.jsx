import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Icon,
  Badge,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import {
  FaMoneyBillWave,
  FaTimes,
  FaCheckCircle,
  FaPrint,
  FaUserGraduate,
  FaReceipt,
  FaUniversity,
  FaExchangeAlt,
  FaFilter,
  FaSearch,
  FaLayerGroup,
} from "react-icons/fa";
import { recordFeePaymentApi, getClassArmsApi } from "../../api-endpoint/sms/smsEndpoints";
import { fetchStudent } from "../../api-endpoint/student/students";
import { toaster } from "../ui/toaster";
import { useAuth } from "../../libs/AuthProvider";

const AllocatePaymentModal = ({
  isOpen,
  onClose,
  initialStudent = null,
  initialInvoice = null,
  onPaymentSuccess,
}) => {
  const { user } = useAuth();

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [payAmount, setPayAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash at Bursary");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Load students & class arms if not already pre-selected
  useEffect(() => {
    if (isOpen && !initialStudent) {
      setLoadingStudents(true);
      setSelectedClassId("all");
      setSearchQuery("");

      Promise.allSettled([fetchStudent(), getClassArmsApi()])
        .then(([studentRes, classRes]) => {
          if (studentRes.status === "fulfilled" && studentRes.value?.students) {
            setStudents(studentRes.value.students);
          }
          if (classRes.status === "fulfilled" && classRes.value?.data) {
            setClasses(classRes.value.data);
          }
        })
        .finally(() => setLoadingStudents(false));
    }
  }, [isOpen, initialStudent]);

  // Set initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      setReceiptData(null);
      if (initialStudent) {
        setSelectedStudent(initialStudent);
        setSelectedStudentId(initialStudent.id);
        const due = initialInvoice?.balanceDue ?? initialStudent.balanceDue ?? 50000;
        setPayAmount(due > 0 ? String(due) : "");
      } else {
        setSelectedStudent(null);
        setSelectedStudentId("");
        setPayAmount("");
      }
      setPaymentMethod("Cash at Bursary");
      setReference(`BURSARY-${Date.now().toString().slice(-6)}`);
      setNotes("");
    }
  }, [isOpen, initialStudent, initialInvoice]);

  // Merge classes from API with any unique classes in students
  const displayClasses = useMemo(() => {
    const list = [...classes];
    students.forEach((s) => {
      if (s.ClassArm && !list.some((c) => c.id === s.ClassArm.id)) {
        list.push(s.ClassArm);
      }
    });
    return list;
  }, [classes, students]);

  // Filter students by selected class arm and search query
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesClass =
        selectedClassId === "all" ||
        !selectedClassId ||
        s.classArmId === selectedClassId ||
        s.ClassArm?.id === selectedClassId;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        (s.studentId && s.studentId.toLowerCase().includes(q));

      return matchesClass && matchesSearch;
    });
  }, [students, selectedClassId, searchQuery]);

  // When student selection changes in dropdown
  const handleSelectStudent = (id) => {
    setSelectedStudentId(id);
    const found = students.find((s) => s.id === id);
    setSelectedStudent(found || null);
    if (found) {
      const latestInv = found.FeeInvoices?.[0];
      const due = latestInv?.balanceDue ?? found.balanceDue;
      if (due !== undefined && Number(due) > 0) {
        setPayAmount(String(due));
      } else {
        setPayAmount("");
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmitPayment = async (e) => {
    e.preventDefault();

    const targetStudentId = selectedStudent?.id || selectedStudentId;
    if (!targetStudentId && !initialInvoice?.invoiceId) {
      toaster.create({ title: "Please select a student", type: "warning" });
      return;
    }

    if (!payAmount || Number(payAmount) <= 0) {
      toaster.create({ title: "Please enter a valid payment amount", type: "warning" });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        studentId: targetStudentId,
        invoiceId: initialInvoice?.invoiceId || initialInvoice?.id || undefined,
        amount: Number(payAmount),
        paymentMethod,
        reference: reference || `BURSARY-CASH-${Date.now()}`,
        notes,
      };

      const res = await recordFeePaymentApi(payload);

      if (res.success) {
        toaster.create({
          title: "Payment Allocated Successfully!",
          description: `₦${Number(payAmount).toLocaleString()} credited to student account.`,
          type: "success",
        });

        setReceiptData({
          receiptNo: res.data?.paymentReference || reference,
          date: new Date().toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          studentName: `${res.student?.firstName || selectedStudent?.firstName || "Student"} ${res.student?.lastName || selectedStudent?.lastName || ""}`,
          studentId: res.student?.studentId || selectedStudent?.studentId || "N/A",
          classArm: res.student?.ClassArm?.name || selectedStudent?.ClassArm?.name || "General",
          amountPaid: Number(payAmount),
          totalBilled: Number(res.data?.totalAmount || payAmount),
          balanceDue: Number(res.data?.balanceDue || 0),
          paymentMethod,
          schoolName: user?.institution?.name || "School Bursary Department",
          schoolLogo: user?.institution?.logoUrl,
        });

        if (onPaymentSuccess) {
          onPaymentSuccess(res.data);
        }
      }
    } catch (err) {
      toaster.create({
        title: "Failed to allocate payment",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      bg="rgba(15, 23, 42, 0.65)"
      backdropFilter="blur(6px)"
      zIndex={1500}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        bg="white"
        w="100%"
        maxW={receiptData ? "580px" : "560px"}
        maxH="92vh"
        display="flex"
        flexDirection="column"
        borderRadius="28px"
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        overflow="hidden"
        border="1px solid #E2E8F0"
        animation="fadeIn 0.2s ease"
      >
        {/* Modal Header */}
        <Flex
          justify="space-between"
          align="center"
          px={6}
          py={5}
          borderBottom="1px solid #F1F5F9"
          bg="#FAF5FF"
          flexShrink={0}
        >
          <Flex align="center" gap={3}>
            <Flex
              w="42px"
              h="42px"
              borderRadius="xl"
              bg="#EDE9FE"
              color="#6A1B9A"
              align="center"
              justify="center"
            >
              <Icon as={receiptData ? FaReceipt : FaMoneyBillWave} boxSize={5} />
            </Flex>
            <Box>
              <Text fontSize="16px" fontWeight="800" color="#0F172A">
                {receiptData ? "Official Bursary Receipt" : "Allocate Manual Fee Payment"}
              </Text>
              <Text fontSize="12px" color="#64748B">
                {receiptData ? "Payment verified and credited" : "Record manual cash, transfer, or POS payment"}
              </Text>
            </Box>
          </Flex>

          <Button
            size="sm"
            variant="ghost"
            borderRadius="full"
            w="34px"
            h="34px"
            p={0}
            onClick={onClose}
            _hover={{ bg: "#F3E8FF" }}
          >
            <Icon as={FaTimes} color="#64748B" />
          </Button>
        </Flex>

        {/* Modal Body */}
        {receiptData ? (
          /* Official Printable Bursary Receipt */
          <Box p={6} overflowY="auto">
            <Box
              p={6}
              borderRadius="2xl"
              border="2px dashed #CBD5E1"
              bg="#FAF5FF"
              position="relative"
            >
              {/* Receipt Header */}
              <Flex justify="space-between" align="center" borderBottom="1.5px solid #E2E8F0" pb={4} mb={4}>
                <Flex align="center" gap={3}>
                  {receiptData.schoolLogo ? (
                    <img
                      src={receiptData.schoolLogo}
                      alt="Crest"
                      style={{ width: "45px", height: "45px", objectFit: "contain", borderRadius: "8px" }}
                    />
                  ) : (
                    <Flex w="45px" h="45px" borderRadius="xl" bg="#6A1B9A" color="white" align="center" justify="center">
                      <Icon as={FaUniversity} boxSize={5} />
                    </Flex>
                  )}
                  <Box>
                    <Text fontSize="15px" fontWeight="900" color="#0F172A">
                      {receiptData.schoolName}
                    </Text>
                    <Text fontSize="11px" color="#6A1B9A" fontWeight="700">
                      OFFICIAL PAYMENT ACKNOWLEDGEMENT
                    </Text>
                  </Box>
                </Flex>
                <Badge bg="#ECFDF5" color="#059669" border="1px solid #A7F3D0" px={2.5} py={1} borderRadius="full" fontSize="11px" fontWeight="800">
                  <Icon as={FaCheckCircle} mr={1} /> PAID
                </Badge>
              </Flex>

              {/* Receipt Details Grid */}
              <SimpleGrid columns={2} gap={3} mb={4} fontSize="12px">
                <Box>
                  <Text color="#64748B" fontWeight="600">Receipt Ref:</Text>
                  <Text fontWeight="800" color="#1E293B">{receiptData.receiptNo}</Text>
                </Box>
                <Box>
                  <Text color="#64748B" fontWeight="600">Date & Time:</Text>
                  <Text fontWeight="800" color="#1E293B">{receiptData.date}</Text>
                </Box>
                <Box>
                  <Text color="#64748B" fontWeight="600">Candidate Name:</Text>
                  <Text fontWeight="800" color="#1E293B">{receiptData.studentName}</Text>
                </Box>
                <Box>
                  <Text color="#64748B" fontWeight="600">Student ID:</Text>
                  <Text fontWeight="800" color="#6A1B9A">{receiptData.studentId}</Text>
                </Box>
                <Box>
                  <Text color="#64748B" fontWeight="600">Class / Level:</Text>
                  <Text fontWeight="800" color="#1E293B">{receiptData.classArm}</Text>
                </Box>
                <Box>
                  <Text color="#64748B" fontWeight="600">Payment Channel:</Text>
                  <Text fontWeight="800" color="#1E293B">{receiptData.paymentMethod}</Text>
                </Box>
              </SimpleGrid>

              {/* Amount Cleared Highlight Box */}
              <Box p={3.5} borderRadius="xl" bg="white" border="1px solid #E2E8F0" mb={4}>
                <Flex justify="space-between" align="center" mb={1.5}>
                  <Text fontSize="13px" fontWeight="700" color="#334155">Amount Paid (Credited):</Text>
                  <Text fontSize="18px" fontWeight="900" color="#059669">
                    ₦{receiptData.amountPaid.toLocaleString()}
                  </Text>
                </Flex>
                <Flex justify="space-between" align="center" fontSize="11px" color="#64748B">
                  <Text>Remaining Balance Due:</Text>
                  <Text fontWeight="800" color={receiptData.balanceDue > 0 ? "#DC2626" : "#059669"}>
                    {receiptData.balanceDue > 0 ? `₦${receiptData.balanceDue.toLocaleString()}` : "₦0.00 (Fully Cleared)"}
                  </Text>
                </Flex>
              </Box>

              <Text fontSize="10px" color="#94A3B8" textAlign="center">
                System generated official Bursary receipt. Valid without signature. Powered by AceSmart.
              </Text>
            </Box>

            {/* Receipt Action Buttons */}
            <Flex justify="flex-end" gap={3} mt={5}>
              <Button
                size="sm"
                variant="outline"
                borderColor="#CBD5E1"
                borderRadius="xl"
                onClick={onClose}
              >
                Close
              </Button>
              <Button
                size="sm"
                bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
                color="white"
                borderRadius="xl"
                fontWeight="700"
                onClick={handlePrintReceipt}
                _hover={{ opacity: 0.92 }}
              >
                <Icon as={FaPrint} mr={1.5} /> Print Receipt
              </Button>
            </Flex>
          </Box>
        ) : (
          /* Payment Allocation Input Form */
          <form onSubmit={handleSubmitPayment} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            <Box p={6} overflowY="auto" flex={1}>
              {/* Student Identification */}
              <Box mb={4}>
                <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                  Candidate / Student *
                </Text>

                {initialStudent ? (
                  <Box p={3.5} borderRadius="xl" bg="#FAF5FF" border="1px solid #E9D5FF">
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text fontSize="14px" fontWeight="800" color="#1E293B">
                          {initialStudent.firstName} {initialStudent.lastName}
                        </Text>
                        <Text fontSize="11px" color="#6B21A8" fontWeight="700">
                          {initialStudent.studentId || `STU-${initialStudent.id}`} &bull; {initialStudent.ClassArm?.name || "General"}
                        </Text>
                      </Box>
                      <Badge bg="#EDE9FE" color="#6B21A8" fontSize="11px" px={2.5} py={1} borderRadius="lg" fontWeight="700">
                        {initialInvoice?.balanceDue !== undefined
                          ? `Due: ₦${Number(initialInvoice.balanceDue).toLocaleString()}`
                          : "Selected"}
                      </Badge>
                    </Flex>
                  </Box>
                ) : (
                  <Box p={3.5} borderRadius="2xl" bg="#F8FAFC" border="1px solid #E2E8F0">
                    <Flex justify="space-between" align="center" mb={2.5}>
                      <Flex align="center" gap={1.5}>
                        <Icon as={FaFilter} color="#6A1B9A" boxSize={3} />
                        <Text fontSize="11px" fontWeight="800" color="#475569" textTransform="uppercase" letterSpacing="0.4px">
                          Filter Candidate
                        </Text>
                      </Flex>
                      <Badge bg="#EDE9FE" color="#6B21A8" borderRadius="full" px={2} py={0.5} fontSize="10px" fontWeight="700">
                        {filteredStudents.length} candidate{filteredStudents.length === 1 ? "" : "s"}
                      </Badge>
                    </Flex>

                    {/* Filter Controls: Class Arm Select & Search Input */}
                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap={2.5} mb={3}>
                      <Box>
                        <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
                          Class / Level
                        </Text>
                        <select
                          value={selectedClassId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedClassId(val);
                            if (selectedStudent && val !== "all") {
                              const matches =
                                selectedStudent.classArmId === val ||
                                selectedStudent.ClassArm?.id === val;
                              if (!matches) {
                                setSelectedStudent(null);
                                setSelectedStudentId("");
                                setPayAmount("");
                              }
                            }
                          }}
                          style={{
                            width: "100%",
                            height: "40px",
                            borderRadius: "10px",
                            border: "1px solid #CBD5E1",
                            padding: "0 10px",
                            fontSize: "12px",
                            background: "white",
                            color: "#1E293B",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          <option value="all">All Classes ({students.length})</option>
                          {displayClasses.map((c) => {
                            const count = students.filter(
                              (s) => s.classArmId === c.id || s.ClassArm?.id === c.id
                            ).length;
                            return (
                              <option key={c.id} value={c.id}>
                                {c.name} ({count})
                              </option>
                            );
                          })}
                        </select>
                      </Box>

                      <Box>
                        <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
                          Search by Name or ID
                        </Text>
                        <Input
                          placeholder="e.g. David or STU-001..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          h="40px"
                          borderRadius="10px"
                          fontSize="12px"
                          bg="white"
                          borderColor="#CBD5E1"
                          _focus={{ borderColor: "#6A1B9A" }}
                        />
                      </Box>
                    </SimpleGrid>

                    {/* Filtered Candidate Selector */}
                    <Box>
                      <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
                        Select Student *
                      </Text>
                      {loadingStudents ? (
                        <Flex align="center" gap={2} p={2.5} bg="white" borderRadius="10px" border="1px solid #E2E8F0">
                          <Spinner size="xs" color="#6A1B9A" />
                          <Text fontSize="12px" color="#64748B">Loading enrolled students...</Text>
                        </Flex>
                      ) : (
                        <select
                          value={selectedStudentId}
                          onChange={(e) => handleSelectStudent(e.target.value)}
                          style={{
                            width: "100%",
                            height: "44px",
                            borderRadius: "10px",
                            border: "1.5px solid #CBD5E1",
                            padding: "0 12px",
                            fontSize: "13px",
                            background: "white",
                            color: "#1E293B",
                            fontWeight: selectedStudentId ? "700" : "normal",
                            cursor: "pointer",
                          }}
                          required
                        >
                          <option value="">
                            {filteredStudents.length > 0
                              ? `-- Select Candidate (${filteredStudents.length} available) --`
                              : "-- No students found in this class --"}
                          </option>
                          {filteredStudents.map((s) => {
                            const latestInv = s.FeeInvoices?.[0];
                            const due =
                              latestInv?.balanceDue !== undefined
                                ? ` • Due: ₦${Number(latestInv.balanceDue).toLocaleString()}`
                                : "";
                            return (
                              <option key={s.id} value={s.id}>
                                {s.firstName} {s.lastName} ({s.studentId || "No ID"}) — {s.ClassArm?.name || "General"}{due}
                              </option>
                            );
                          })}
                        </select>
                      )}
                    </Box>

                    {/* Selected Student Preview Card */}
                    {selectedStudent && (
                      <Box
                        mt={3}
                        p={3}
                        borderRadius="xl"
                        bg="#FAF5FF"
                        border="1px solid #E9D5FF"
                      >
                        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                          <Flex align="center" gap={2.5}>
                            {selectedStudent.faceImageUrl ? (
                              <img
                                src={selectedStudent.faceImageUrl}
                                alt="Student"
                                style={{
                                  width: "38px",
                                  height: "38px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: "1.5px solid #9333EA",
                                }}
                              />
                            ) : (
                              <Flex
                                w="38px"
                                h="38px"
                                borderRadius="full"
                                bg="#8E24AA"
                                color="white"
                                align="center"
                                justify="center"
                                fontWeight="800"
                                fontSize="14px"
                              >
                                {selectedStudent.firstName?.[0]?.toUpperCase()}
                              </Flex>
                            )}
                            <Box>
                              <Text fontSize="13px" fontWeight="800" color="#1E293B">
                                {selectedStudent.firstName} {selectedStudent.lastName}
                              </Text>
                              <Text fontSize="11px" color="#6B21A8" fontWeight="600">
                                {selectedStudent.studentId || "No ID"} &bull; {selectedStudent.ClassArm?.name || "General"}
                                {selectedStudent.parentPhone ? ` &bull; 📞 ${selectedStudent.parentPhone}` : ""}
                              </Text>
                            </Box>
                          </Flex>

                          <Flex align="center" gap={2}>
                            {selectedStudent.FeeInvoices?.[0]?.balanceDue !== undefined && (
                              <Badge
                                bg={selectedStudent.FeeInvoices[0].balanceDue > 0 ? "#FEE2E2" : "#DCFCE7"}
                                color={selectedStudent.FeeInvoices[0].balanceDue > 0 ? "#DC2626" : "#15803D"}
                                fontSize="11px"
                                px={2.5}
                                py={1}
                                borderRadius="lg"
                                fontWeight="800"
                              >
                                {selectedStudent.FeeInvoices[0].balanceDue > 0
                                  ? `Due: ₦${Number(selectedStudent.FeeInvoices[0].balanceDue).toLocaleString()}`
                                  : "Cleared"}
                              </Badge>
                            )}
                            <Button
                              size="xs"
                              variant="ghost"
                              color="#6B21A8"
                              onClick={() => {
                                setSelectedStudent(null);
                                setSelectedStudentId("");
                                setPayAmount("");
                              }}
                            >
                              Clear
                            </Button>
                          </Flex>
                        </Flex>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>

              {/* Amount Paid Input */}
              <Box mb={4}>
                <Flex justify="space-between" align="center" mb={1}>
                  <Text fontSize="12px" fontWeight="700" color="#334155">
                    Amount Paid (₦) *
                  </Text>
                  {(initialInvoice?.balanceDue > 0 || (selectedStudent?.FeeInvoices?.[0]?.balanceDue && selectedStudent.FeeInvoices[0].balanceDue > 0)) && (
                    <Text
                      fontSize="11px"
                      color="#6A1B9A"
                      fontWeight="700"
                      cursor="pointer"
                      onClick={() => {
                        const due = initialInvoice?.balanceDue || selectedStudent?.FeeInvoices?.[0]?.balanceDue;
                        if (due) setPayAmount(String(due));
                      }}
                    >
                      Fill Total Balance (₦{Number(initialInvoice?.balanceDue || selectedStudent?.FeeInvoices?.[0]?.balanceDue).toLocaleString()})
                    </Text>
                  )}
                </Flex>
                <Input
                  type="number"
                  placeholder="e.g. 35000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  h="46px"
                  borderRadius="xl"
                  fontSize="14px"
                  fontWeight="700"
                  borderColor="#CBD5E1"
                  _focus={{ borderColor: "#6A1B9A" }}
                  required
                />
              </Box>

              {/* Payment Method & Reference Grid */}
              <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4} mb={4}>
                <Box>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                    Payment Channel *
                  </Text>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{
                      width: "100%",
                      height: "46px",
                      borderRadius: "12px",
                      border: "1px solid #CBD5E1",
                      padding: "0 12px",
                      fontSize: "13px",
                      background: "white",
                      color: "#1E293B",
                    }}
                  >
                    <option value="Cash at Bursary">Cash at Bursary</option>
                    <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                    <option value="POS Machine">POS Machine / Card</option>
                    <option value="Bank Draft / Cheque">Bank Draft / Cheque</option>
                  </select>
                </Box>

                <Box>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                    Teller / Receipt Ref
                  </Text>
                  <Input
                    placeholder="e.g. BURSARY-0042"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    h="46px"
                    borderRadius="xl"
                    fontSize="13px"
                    borderColor="#CBD5E1"
                    _focus={{ borderColor: "#6A1B9A" }}
                  />
                </Box>
              </SimpleGrid>

              {/* Optional Notes */}
              <Box mb={2}>
                <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                  Bursary Officer Notes (Optional)
                </Text>
                <Input
                  placeholder="e.g. Paid cash in full by student mother at bursary desk"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  h="42px"
                  borderRadius="xl"
                  fontSize="13px"
                  borderColor="#CBD5E1"
                  _focus={{ borderColor: "#6A1B9A" }}
                />
              </Box>
            </Box>

            {/* Modal Footer */}
            <Flex justify="flex-end" gap={3} px={6} py={4} borderTop="1px solid #F1F5F9" bg="#F8FAFC">
              <Button
                size="sm"
                variant="outline"
                borderColor="#CBD5E1"
                borderRadius="xl"
                px={4}
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
                color="white"
                borderRadius="xl"
                px={5}
                fontWeight="700"
                loading={submitting}
                loadingText="Allocating Payment..."
                _hover={{ opacity: 0.95 }}
              >
                Allocate & Credit Account
              </Button>
            </Flex>
          </form>
        )}
      </Box>
    </Box>
  );
};

export default AllocatePaymentModal;
