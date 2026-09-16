import { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Input,
  Badge,
} from "@chakra-ui/react";
import {
  FaGraduationCap,
  FaImage,
  FaSave,
  FaUserPlus,
  FaBuilding,
  FaCloudUploadAlt,
  FaCamera,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import {
  getInstitutionProfileApi,
  updateInstitutionBrandingApi,
  uploadInstitutionLogoApi,
  enrollStaffApi,
  getStaffListApi,
} from "../../api-endpoint/sms/smsEndpoints";
import { useAuth } from "../../libs/AuthProvider";
import { toaster } from "../../components/ui/toaster";
import DashboardLayout from "../../constants/dashboardlayout";
import imageCompression from "browser-image-compression";

export default function InstitutionSettings() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    subdomain: "",
    logoUrl: "",
    motto: "",
    address: "",
    phone: "",
    currentTerm: "First Term",
    academicSession: "2025/2026",
    resultCheckerFee: 500,
    schoolStartTime: "08:00",
    schoolClosingTime: "16:00",
  });

  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    designation: "Subject Teacher",
  });

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef(null);

  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toaster.create({ title: "Please select a valid image file (PNG, JPG)", type: "warning" });
      return;
    }

    setLogoUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.35,
        maxWidthOrHeight: 600,
        useWebWorker: true,
      });

      const fd = new FormData();
      fd.append("logo", compressed);
      const res = await uploadInstitutionLogoApi(fd);
      if (res.success && res.logoUrl) {
        setForm((prev) => ({ ...prev, logoUrl: res.logoUrl }));
        toaster.create({
          title: "School crest uploaded successfully!",
          description: "Your official school crest is now live across report cards and exam portals.",
          type: "success",
        });
      }
    } catch (err) {
      toaster.create({
        title: "Failed to upload crest",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setLogoUploading(false);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profRes, staffRes] = await Promise.all([
          getInstitutionProfileApi(),
          getStaffListApi().catch(() => ({ data: [] })),
        ]);

        if (profRes.success) {
          const d = profRes.data;
          setForm({
            name: d.name || "",
            subdomain: d.subdomain || "",
            logoUrl: d.logoUrl || "",
            motto: d.motto || "",
            address: d.address || "",
            phone: d.phone || "",
            currentTerm: d.currentTerm || "First Term",
            academicSession: d.academicSession || "2025/2026",
            resultCheckerFee: d.resultCheckerFee || 500,
            schoolStartTime: d.schoolStartTime || "",
            schoolClosingTime: d.schoolClosingTime || "",
          });
        }

        if (staffRes.success) {
          setStaffList(staffRes.data);
        }
      } catch (err) {
        console.error("Load settings error:", err);
      }
    };
    loadProfile();
  }, []);

  const handleSaveBranding = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateInstitutionBrandingApi(form);
      if (res.success) {
        toaster.create({
          title: "School Branding Saved!",
          description: "Your logo and portal information have been updated.",
          type: "success",
        });
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Failed to save settings",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollStaff = async (e) => {
    e.preventDefault();
    setEnrolling(true);
    try {
      const res = await enrollStaffApi(staffForm);
      if (res.success) {
        toaster.create({
          title: "Staff Enrolled Successfully!",
          description: `Assigned Staff ID: ${res.data.staffIdNumber}`,
          type: "success",
        });
        setStaffForm({
          name: "",
          email: "",
          password: "",
          phoneNumber: "",
          designation: "Subject Teacher",
        });
        const staffRes = await getStaffListApi();
        if (staffRes.success) setStaffList(staffRes.data);
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Failed to enroll staff member",
        type: "error",
      });
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <DashboardLayout>
      <Box
        p={{ base: 4, md: 8 }}
        pt={{ base: "84px", md: "88px" }}
        pl={{ base: 4, lg: "260px" }}
        maxW="1100px"
        mx="auto"
      >
        <Box mb={8}>
          <Text fontSize="24px" fontWeight="900" color="#0F172A" letterSpacing="-0.5px">
            Institution Profile & White-Label Branding
          </Text>
          <Text fontSize="13px" color="#64748B">
            Configure school logo, crest, contact info, and staff enrollment credentials
          </Text>
        </Box>

        <Flex direction={{ base: "column", lg: "row" }} gap={8}>
          {/* Left Form: Branding & Academic Settings */}
          <Box flex={1} bg="white" p={6} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex align="center" gap={3} mb={5}>
              <Flex w="40px" h="40px" borderRadius="xl" bg="#EEF2FF" color="#4338CA" align="center" justify="center">
                <Icon as={FaBuilding} boxSize={5} />
              </Flex>
              <Text fontSize="16px" fontWeight="800" color="#0F172A">
                School Identity & Logo
              </Text>
            </Flex>

            <form onSubmit={handleSaveBranding}>
              <Flex direction="column" gap={4}>
                {/* School Crest / Logo File Upload Section */}
                <Box
                  p={4}
                  borderRadius="2xl"
                  border="1.5px dashed #CBD5E1"
                  bg={form.logoUrl ? "#FAF5FF" : "#F8FAFC"}
                  transition="all 0.2s ease"
                  _hover={{ borderColor: "#7C3AED" }}
                >
                  <Flex justify="space-between" align="center" mb={2.5}>
                    <Text fontSize="12px" fontWeight="800" color="#334155" letterSpacing="0.5px">
                      OFFICIAL SCHOOL CREST / LOGO
                    </Text>
                    {form.logoUrl && (
                      <Badge bg="#ECFDF5" color="#059669" fontSize="10px" px={2} py={0.5} borderRadius="full">
                        <Icon as={FaCheckCircle} mr={1} /> Crest Active
                      </Badge>
                    )}
                  </Flex>

                  <Flex direction={{ base: "column", sm: "row" }} gap={4} align="center">
                    {/* Crest Preview Box */}
                    <Box
                      w="80px"
                      h="80px"
                      borderRadius="2xl"
                      bg="white"
                      border="2px solid #E2E8F0"
                      p={1.5}
                      boxShadow="0 4px 12px rgba(0,0,0,0.04)"
                      flexShrink={0}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      overflow="hidden"
                    >
                      {form.logoUrl ? (
                        <img
                          src={form.logoUrl}
                          alt="School Crest"
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      ) : (
                        <Flex direction="column" align="center" color="#94A3B8">
                          <Icon as={FaImage} boxSize={6} mb={0.5} />
                          <Text fontSize="9px" fontWeight="700">NO CREST</Text>
                        </Flex>
                      )}
                    </Box>

                    {/* Upload Actions */}
                    <Flex direction="column" flex={1} w="100%" gap={2}>
                      <Text fontSize="12px" color="#64748B">
                        Upload your school's official badge or crest. It displays on student result sheets, receipts, and custom portals.
                      </Text>

                      <Flex gap={2} flexWrap="wrap" align="center">
                        <input
                          type="file"
                          ref={logoInputRef}
                          accept="image/png, image/jpeg, image/jpg"
                          style={{ display: "none" }}
                          onChange={handleLogoFileChange}
                        />

                        <Button
                          size="sm"
                          bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
                          color="white"
                          borderRadius="xl"
                          fontSize="12px"
                          fontWeight="700"
                          px={4}
                          onClick={() => logoInputRef.current?.click()}
                          loading={logoUploading}
                          loadingText="Uploading Crest..."
                          _hover={{ opacity: 0.92, transform: "translateY(-1px)" }}
                        >
                          <Icon as={FaCloudUploadAlt} mr={1.5} boxSize={3.5} />
                          {form.logoUrl ? "Replace Crest Image" : "Upload School Crest"}
                        </Button>

                        {form.logoUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            borderColor="#CBD5E1"
                            fontSize="11px"
                            borderRadius="xl"
                            color="#64748B"
                            onClick={() => setForm({ ...form, logoUrl: "" })}
                          >
                            Remove
                          </Button>
                        )}
                      </Flex>
                      <Text fontSize="10px" color="#94A3B8">
                        Recommended: Transparent PNG or crisp high-resolution JPG (under 5MB).
                      </Text>
                    </Flex>
                  </Flex>
                </Box>

                {/* Dedicated School Domain Card */}
                <Box p={4} borderRadius="xl" bg="#F1F5F9" border="1px solid #CBD5E1">
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                    DEDICATED SCHOOL DOMAIN
                  </Text>
                  <Flex align="center" gap={2} mb={2}>
                    <Text fontSize="14px" fontWeight="900" color="#4338CA" fontFamily="monospace">
                      https://{form.subdomain || "school"}.acesmart.site
                    </Text>
                  </Flex>
                  <Flex gap={2}>
                    <Input
                      placeholder="e.g. grace"
                      value={form.subdomain}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                        })
                      }
                      h="38px"
                      borderRadius="lg"
                      fontSize="13px"
                      bg="white"
                    />
                    <Button
                      size="sm"
                      h="38px"
                      variant="outline"
                      borderRadius="lg"
                      onClick={() => {
                        const url = `https://${form.subdomain || "school"}.acesmart.site`;
                        navigator.clipboard.writeText(url);
                        toaster.create({ title: "Copied school URL to clipboard!", type: "success" });
                      }}
                    >
                      Copy Link
                    </Button>
                  </Flex>
                  <Text fontSize="11px" color="#64748B" mt={1}>
                    Parents, teachers, and students can visit this custom link directly.
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                    SCHOOL NAME
                  </Text>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    h="42px"
                    borderRadius="xl"
                    fontSize="14px"
                    fontWeight="600"
                    required
                  />
                </Box>

                <Box>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                    SCHOOL MOTTO
                  </Text>
                  <Input
                    value={form.motto}
                    onChange={(e) => setForm({ ...form, motto: e.target.value })}
                    h="42px"
                    borderRadius="xl"
                    fontSize="13px"
                  />
                </Box>

                <Box>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                    CAMPUS ADDRESS
                  </Text>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    h="42px"
                    borderRadius="xl"
                    fontSize="13px"
                  />
                </Box>

                <Flex gap={4}>
                  <Box flex={1}>
                    <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                      ACADEMIC SESSION
                    </Text>
                    <Input
                      value={form.academicSession}
                      onChange={(e) => setForm({ ...form, academicSession: e.target.value })}
                      h="42px"
                      borderRadius="xl"
                      fontSize="13px"
                    />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                      ACTIVE TERM
                    </Text>
                    <select
                      value={form.currentTerm}
                      onChange={(e) => setForm({ ...form, currentTerm: e.target.value })}
                      style={{
                        width: "100%",
                        height: "42px",
                        padding: "0 12px",
                        borderRadius: "12px",
                        border: "1px solid #CBD5E1",
                        fontSize: "13px",
                        fontWeight: "600",
                        background: "#F8FAFC",
                      }}
                    >
                      <option value="First Term">First Term</option>
                      <option value="Second Term">Second Term</option>
                      <option value="Third Term">Third Term</option>
                    </select>
                  </Box>
                </Flex>

                {/* Staff Attendance Window */}
                <Box p={4} borderRadius="xl" bg="#F8FAFC" border="1px solid #E2E8F0">
                  <Flex align="center" gap={2} mb={1}>
                    <Icon as={FaClock} color="#4338CA" boxSize={3.5} />
                    <Text fontSize="12px" fontWeight="800" color="#334155" letterSpacing="0.5px">
                      STAFF ATTENDANCE WINDOW
                    </Text>
                  </Flex>
                  <Text fontSize="11px" color="#64748B" mb={3}>
                    Staff clock in and clock out once per day. Arrivals after the start time are flagged Late; clock-outs are logged for every staff member.
                  </Text>

                  <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                    <Box flex={1}>
                      <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                        SCHOOL START TIME
                      </Text>
                      <input
                        type="time"
                        value={form.schoolStartTime || ""}
                        onChange={(e) => setForm({ ...form, schoolStartTime: e.target.value })}
                        style={{
                          width: "100%",
                          height: "42px",
                          padding: "0 12px",
                          borderRadius: "12px",
                          border: "1px solid #CBD5E1",
                          fontSize: "13px",
                          fontWeight: "600",
                          background: "white",
                        }}
                      />
                    </Box>
                    <Box flex={1}>
                      <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                        SCHOOL CLOSING TIME
                      </Text>
                      <input
                        type="time"
                        value={form.schoolClosingTime || ""}
                        onChange={(e) => setForm({ ...form, schoolClosingTime: e.target.value })}
                        style={{
                          width: "100%",
                          height: "42px",
                          padding: "0 12px",
                          borderRadius: "12px",
                          border: "1px solid #CBD5E1",
                          fontSize: "13px",
                          fontWeight: "600",
                          background: "white",
                        }}
                      />
                    </Box>
                  </Flex>

                  <Flex justify="space-between" align="center" mt={2} gap={2}>
                    <Text fontSize="11px" color="#64748B">
                      Leave the start time blank to record arrivals without a Late flag.
                    </Text>
                    <Button
                      size="xs"
                      variant="outline"
                      borderRadius="lg"
                      borderColor="#CBD5E1"
                      fontSize="11px"
                      color="#64748B"
                      flexShrink={0}
                      onClick={() =>
                        setForm({
                          ...form,
                          schoolStartTime: form.schoolStartTime ? "" : "08:00",
                        })
                      }
                    >
                      {form.schoolStartTime ? "Disable Late Flag" : "Enable Late Flag"}
                    </Button>
                  </Flex>
                </Box>

                <Box>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                    RESULT CHECKER TOKEN FEE (₦)
                  </Text>
                  <Input
                    type="number"
                    value={form.resultCheckerFee}
                    onChange={(e) => setForm({ ...form, resultCheckerFee: e.target.value })}
                    h="42px"
                    borderRadius="xl"
                    fontSize="13px"
                    fontWeight="700"
                  />
                  <Text fontSize="11px" color="#64748B" mt={1}>
                    Standard fee charged to parents/students before viewing official report cards (Default: ₦500).
                  </Text>
                </Box>

                <Button
                  mt={2}
                  type="submit"
                  h="44px"
                  bg="#4338CA"
                  color="white"
                  borderRadius="xl"
                  fontWeight="700"
                  loading={loading}
                >
                  <Icon as={FaSave} mr={2} boxSize={3.5} />
                  Save Changes
                </Button>
              </Flex>
            </form>
          </Box>

          {/* Right Form: Staff Enrollment */}
          <Box flex={1} bg="white" p={6} borderRadius="2xl" border="1px solid #E2E8F0">
            <Flex align="center" gap={3} mb={5}>
              <Flex w="40px" h="40px" borderRadius="xl" bg="#ECFDF5" color="#10B981" align="center" justify="center">
                <Icon as={FaUserPlus} boxSize={5} />
              </Flex>
              <Text fontSize="16px" fontWeight="800" color="#0F172A">
                Enroll Teacher / Staff Member
              </Text>
            </Flex>

            <form onSubmit={handleEnrollStaff}>
              <Flex direction="column" gap={4}>
                <Box>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                    STAFF FULL NAME
                  </Text>
                  <Input
                    placeholder="e.g. Mrs. Ngozi Adeleke"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    h="42px"
                    borderRadius="xl"
                    fontSize="13px"
                    required
                  />
                </Box>

                <Box>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                    EMAIL ADDRESS
                  </Text>
                  <Input
                    type="email"
                    placeholder="teacher@school.edu"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    h="42px"
                    borderRadius="xl"
                    fontSize="13px"
                    required
                  />
                </Box>

                <Box>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                    DESIGNATION / SUBJECT
                  </Text>
                  <Input
                    placeholder="e.g. Mathematics Teacher / Vice Principal"
                    value={staffForm.designation}
                    onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })}
                    h="42px"
                    borderRadius="xl"
                    fontSize="13px"
                  />
                </Box>

                <Box>
                  <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                    LOGIN PASSWORD
                  </Text>
                  <Input
                    type="password"
                    placeholder="Initial password for teacher"
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    h="42px"
                    borderRadius="xl"
                    fontSize="13px"
                    required
                  />
                </Box>

                <Button
                  mt={2}
                  type="submit"
                  h="44px"
                  bg="#10B981"
                  color="white"
                  borderRadius="xl"
                  fontWeight="700"
                  loading={enrolling}
                >
                  <Icon as={FaUserPlus} mr={2} boxSize={3.5} />
                  Provision Staff Account
                </Button>
              </Flex>
            </form>

            {/* Enrolled Staff Count */}
            <Box mt={6} p={4} borderRadius="xl" bg="#F8FAFC" border="1px solid #E2E8F0">
              <Text fontSize="13px" fontWeight="700" color="#0F172A">
                Enrolled Faculty ({staffList.length})
              </Text>
              <Text fontSize="11px" color="#64748B" mt={0.5}>
                All enrolled staff can scan the morning barcode to clock in.
              </Text>
            </Box>
          </Box>
        </Flex>
      </Box>
    </DashboardLayout>
  );
}
