import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
  Input,
} from "@chakra-ui/react";
import {
  FaUserPlus,
  FaUsers,
  FaSearch,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaKey,
  FaTimes,
  FaCheckCircle,
  FaUserSlash,
} from "react-icons/fa";
import {
  getStaffListApi,
  enrollStaffApi,
  unenrollStaffApi,
} from "../../api-endpoint/sms/smsEndpoints";
import { useAuth } from "../../libs/AuthProvider";
import { toaster } from "../../components/ui/toaster";
import DashboardLayout from "../../constants/dashboardlayout";

export default function StaffManager() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [confirmUnenroll, setConfirmUnenroll] = useState(null);
  const [unenrolling, setUnenrolling] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    designation: "Subject Teacher",
    role: "teacher",
  });

  const institutionName = user?.institution?.name || "Institution";

  const fetchStaff = async () => {
    try {
      const res = await getStaffListApi();
      if (res.success) {
        setStaffList(res.data);
      }
    } catch (error) {
      console.error("Fetch staff error:", error);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toaster.create({ title: "Please fill all required fields", type: "error" });
      return;
    }

    setEnrolling(true);
    try {
      const res = await enrollStaffApi(form);
      if (res.success) {
        toaster.create({
          title:
            res.data.role === "institution_admin"
              ? "Administrator Enrolled Successfully!"
              : "Teacher Enrolled Successfully!",
          description: `${form.name} assigned Staff ID: ${res.data.staffIdNumber}`,
          type: "success",
        });
        setForm({
          name: "",
          email: "",
          password: "",
          phoneNumber: "",
          designation: "Subject Teacher",
          role: "teacher",
        });
        setIsModalOpen(false);
        fetchStaff();
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Failed to enroll teacher",
        type: "error",
      });
    } finally {
      setEnrolling(false);
    }
  };

  const currentUserId = user?._id;

  const handleUnenroll = async () => {
    if (!confirmUnenroll) return;

    setUnenrolling(true);
    try {
      const res = await unenrollStaffApi(confirmUnenroll.id);
      if (res.success) {
        toaster.create({
          title: "Staff Unenrolled",
          description: `${confirmUnenroll.name} (${confirmUnenroll.staffIdNumber}) can no longer sign in or clock in. Their record has been kept.`,
          type: "success",
        });
        setConfirmUnenroll(null);
        fetchStaff();
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Failed to unenroll staff",
        type: "error",
      });
    } finally {
      setUnenrolling(false);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.staffIdNumber?.toLowerCase().includes(q) ||
      s.designation?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

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
              <Flex
                w="44px"
                h="44px"
                borderRadius="xl"
                bg="#EEF2FF"
                color="#4338CA"
                align="center"
                justify="center"
              >
                <Icon as={FaUsers} boxSize={5} />
              </Flex>
              <Box>
                <Text fontSize="24px" fontWeight="900" color="#0F172A" letterSpacing="-0.5px">
                  Faculty & Teacher Directory
                </Text>
                <Text fontSize="13px" color="#64748B">
                  {institutionName} • Enroll teachers & admins, issue Staff IDs, and manage portal access
                </Text>
              </Box>
            </Flex>
          </Box>

          <Button
            bg="linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)"
            color="white"
            borderRadius="xl"
            px={5}
            h="44px"
            fontWeight="700"
            boxShadow="0 4px 14px rgba(67, 56, 202, 0.35)"
            _hover={{ opacity: 0.95, transform: "translateY(-1px)" }}
            onClick={() => setIsModalOpen(true)}
          >
            <Icon as={FaUserPlus} mr={2} boxSize={3.5} />
            Enroll Staff / Admin
          </Button>
        </Flex>

        {/* Filter and Metrics Strip */}
        <Flex
          bg="white"
          p={5}
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          justify="space-between"
          align="center"
          gap={4}
          flexWrap="wrap"
          mb={6}
        >
          <Flex gap={3} align="center" flex="1" maxW="420px">
            <Input
              placeholder="Search by teacher name, staff ID, or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              h="42px"
              borderRadius="xl"
              bg="#F8FAFC"
              fontSize="13px"
            />
          </Flex>

          <Flex gap={3} align="center">
            <Badge bg="#EEF2FF" color="#4338CA" px={3.5} py={1.5} borderRadius="xl" fontSize="12px" fontWeight="700">
              {staffList.length} Faculty Members Enrolled
            </Badge>
          </Flex>
        </Flex>

        {/* Staff Table */}
        <Box
          bg="white"
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          overflow="hidden"
          boxShadow="0 4px 16px rgba(0,0,0,0.02)"
        >
          <Box overflowX="auto">
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>S/N</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>STAFF NAME</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>STAFF ID</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>DESIGNATION / ROLE</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>EMAIL ADDRESS</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>PHONE NUMBER</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B", textAlign: "center" }}>STATUS</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B", textAlign: "center" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length ? (
                  filteredStaff.map((staff, idx) => (
                    <tr key={staff.id || idx} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#64748B" }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <Text fontWeight="800" fontSize="14px" color="#0F172A">
                          {staff.name}
                        </Text>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <Badge bg="#EEF2FF" color="#4338CA" fontWeight="800" fontSize="12px" px={2.5} py={0.5} borderRadius="md">
                          {staff.staffIdNumber}
                        </Badge>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#334155", fontWeight: "600" }}>
                        {staff.designation || "Subject Teacher"}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#64748B" }}>
                        {staff.email}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#64748B" }}>
                        {staff.phoneNumber || "N/A"}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        {staff.role === "institution_admin" ? (
                          <Badge bg="#EEF2FF" color="#4338CA" fontWeight="700" px={2.5} py={0.5} borderRadius="full">
                            Institution Admin
                          </Badge>
                        ) : (
                          <Badge bg="#ECFDF5" color="#065F46" fontWeight="700" px={2.5} py={0.5} borderRadius="full">
                            Active Faculty
                          </Badge>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        {staff.id === currentUserId ? (
                          <Text fontSize="12px" color="#94A3B8" fontWeight="700">
                            You
                          </Text>
                        ) : (
                          <Button
                            h="32px"
                            px={3}
                            borderRadius="lg"
                            bg="#FEF2F2"
                            color="#B91C1C"
                            fontWeight="700"
                            fontSize="12px"
                            _hover={{ bg: "#FEE2E2" }}
                            onClick={() => setConfirmUnenroll(staff)}
                          >
                            <Icon as={FaUserSlash} mr={1.5} boxSize={3} />
                            Unenroll
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>
                      No staff enrolled yet. Click <strong>"Enroll Staff / Admin"</strong> to add faculty members or a co-administrator.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </Box>

        {/* Enroll Teacher Modal */}
        {isModalOpen && (
          <Flex
            position="fixed"
            top={0}
            left={0}
            w="100vw"
            h="100vh"
            bg="rgba(15, 23, 42, 0.7)"
            backdropFilter="blur(6px)"
            zIndex={1000}
            align="center"
            justify="center"
            p={4}
          >
            <Box
              bg="white"
              borderRadius="2xl"
              maxW="480px"
              w="100%"
              overflow="hidden"
              boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              border="1px solid #E2E8F0"
            >
              {/* Modal Header */}
              <Flex
                p={5}
                bg="linear-gradient(135deg, #1E1B4B 0%, #4338CA 100%)"
                color="white"
                justify="space-between"
                align="center"
              >
                <Flex align="center" gap={3}>
                  <Flex w="36px" h="36px" borderRadius="lg" bg="rgba(255,255,255,0.15)" align="center" justify="center">
                    <Icon as={FaUserPlus} boxSize={4} />
                  </Flex>
                  <Box>
                    <Text fontSize="16px" fontWeight="800">
                      Enroll New Staff
                    </Text>
                    <Text fontSize="11px" color="#C7D2FE">
                      Auto-generates official Staff ID for clock-in & portal
                    </Text>
                  </Box>
                </Flex>
                <Flex
                  as="button"
                  w="28px"
                  h="28px"
                  borderRadius="full"
                  bg="rgba(255,255,255,0.15)"
                  align="center"
                  justify="center"
                  cursor="pointer"
                  onClick={() => setIsModalOpen(false)}
                >
                  <Icon as={FaTimes} boxSize={3} />
                </Flex>
              </Flex>

              {/* Form Body */}
              <form onSubmit={handleEnrollSubmit}>
                <Box p={6}>
                  <Flex direction="column" gap={4}>
                    <Box>
                      <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                        FULL NAME *
                      </Text>
                      <Input
                        placeholder="e.g. Mrs. Ngozi Adeleke"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        h="44px"
                        borderRadius="xl"
                        fontSize="14px"
                        required
                      />
                    </Box>

                    <Box>
                      <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                        EMAIL ADDRESS *
                      </Text>
                      <Input
                        type="email"
                        placeholder="teacher@school.edu"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        h="44px"
                        borderRadius="xl"
                        fontSize="14px"
                        required
                      />
                    </Box>

                    <Box>
                      <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                        ACCOUNT ROLE *
                      </Text>
                      <select
                        value={form.role}
                        onChange={(e) => {
                          const role = e.target.value;
                          setForm({
                            ...form,
                            role,
                            designation:
                              role === "institution_admin"
                                ? "Co-Administrator"
                                : form.designation === "Co-Administrator"
                                  ? "Subject Teacher"
                                  : form.designation,
                          });
                        }}
                        style={{
                          width: "100%",
                          height: "44px",
                          padding: "0 12px",
                          borderRadius: "12px",
                          border: "1px solid #CBD5E1",
                          fontSize: "14px",
                          fontWeight: "600",
                          background: "#F8FAFC",
                        }}
                      >
                        <option value="teacher">Teacher</option>
                        <option value="institution_admin">
                          Institution Admin (full admin privileges)
                        </option>
                      </select>
                      <Text fontSize="11px" color="#64748B" mt={1}>
                        Institution admins share your full portal privileges for this school.
                      </Text>
                    </Box>

                    <Box>
                      <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                        DESIGNATION / SUBJECT
                      </Text>
                      <Input
                        placeholder="e.g. Mathematics Teacher / Vice Principal"
                        value={form.designation}
                        onChange={(e) => setForm({ ...form, designation: e.target.value })}
                        h="44px"
                        borderRadius="xl"
                        fontSize="14px"
                      />
                    </Box>

                    <Box>
                      <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                        PHONE NUMBER
                      </Text>
                      <Input
                        placeholder="080XXXXXXXX"
                        value={form.phoneNumber}
                        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                        h="44px"
                        borderRadius="xl"
                        fontSize="14px"
                      />
                    </Box>

                    <Box>
                      <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                        TEMPORARY LOGIN PASSWORD *
                      </Text>
                      <Input
                        type="password"
                        placeholder="Enter account password for teacher"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        h="44px"
                        borderRadius="xl"
                        fontSize="14px"
                        required
                      />
                      <Text fontSize="11px" color="#64748B" mt={1}>
                        Teacher can change this password after signing in.
                      </Text>
                    </Box>

                    <Flex gap={3} mt={4}>
                      <Button
                        flex={1}
                        variant="ghost"
                        h="44px"
                        borderRadius="xl"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        flex={1}
                        type="submit"
                        h="44px"
                        bg="#4338CA"
                        color="white"
                        borderRadius="xl"
                        fontWeight="700"
                        loading={enrolling}
                        loadingText="Enrolling..."
                      >
                        Enroll Account
                      </Button>
                    </Flex>
                  </Flex>
                </Box>
              </form>
            </Box>
          </Flex>
        )}

        {/* Unenroll Confirmation Modal */}
        {confirmUnenroll && (
          <Flex
            position="fixed"
            top={0}
            left={0}
            w="100vw"
            h="100vh"
            bg="rgba(15, 23, 42, 0.7)"
            backdropFilter="blur(6px)"
            zIndex={1000}
            align="center"
            justify="center"
            p={4}
          >
            <Box
              bg="white"
              borderRadius="2xl"
              maxW="440px"
              w="100%"
              p={6}
              boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              border="1px solid #E2E8F0"
            >
              <Flex align="center" gap={3} mb={4}>
                <Flex
                  w="42px"
                  h="42px"
                  borderRadius="full"
                  bg="#FEF2F2"
                  color="#B91C1C"
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  <Icon as={FaUserSlash} boxSize={4} />
                </Flex>
                <Box>
                  <Text fontSize="16px" fontWeight="800" color="#0F172A">
                    Unenroll Staff Member?
                  </Text>
                  <Text fontSize="12px" color="#64748B">
                    Their portal access and clock-in will be revoked.
                  </Text>
                </Box>
              </Flex>

              <Box bg="#F8FAFC" border="1px solid #E2E8F0" borderRadius="xl" p={3.5} mb={4}>
                <Text fontSize="14px" fontWeight="800" color="#0F172A">
                  {confirmUnenroll.name}
                </Text>
                <Text fontSize="12px" color="#64748B" mt={0.5}>
                  {confirmUnenroll.staffIdNumber} • {confirmUnenroll.email}
                </Text>
              </Box>

              <Text fontSize="12px" color="#64748B" mb={5}>
                The staff record and attendance history are kept — nothing is deleted. You can
                re-enroll this email address later if needed.
              </Text>

              <Flex gap={3}>
                <Button
                  flex={1}
                  variant="ghost"
                  h="44px"
                  borderRadius="xl"
                  disabled={unenrolling}
                  onClick={() => setConfirmUnenroll(null)}
                >
                  Cancel
                </Button>
                <Button
                  flex={1}
                  h="44px"
                  bg="#DC2626"
                  color="white"
                  borderRadius="xl"
                  fontWeight="700"
                  _hover={{ bg: "#B91C1C" }}
                  loading={unenrolling}
                  loadingText="Unenrolling..."
                  onClick={handleUnenroll}
                >
                  Yes, Unenroll
                </Button>
              </Flex>
            </Box>
          </Flex>
        )}
      </Box>
    </DashboardLayout>
  );
}
