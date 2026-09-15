import { useState, useEffect, useRef } from "react";
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
  FaUserEdit,
  FaCamera,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaGraduationCap,
} from "react-icons/fa";
import { updateStudentApi } from "../../api-endpoint/student/students";
import { getClassArmsApi } from "../../api-endpoint/sms/smsEndpoints";
import { toaster } from "../ui/toaster";
import imageCompression from "browser-image-compression";

const EditStudentModal = ({ isOpen, onClose, student, onUpdated }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    studentEmail: "",
    classArmId: "",
    parentPhone: "",
  });

  const [classArms, setClassArms] = useState([]);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (student) {
      setForm({
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        studentEmail: student.studentEmail || "",
        classArmId: student.classArmId || student.ClassArm?.id || "",
        parentPhone: student.parentPhone || "",
      });
      setPreview(student.faceImageUrl || null);
      setSelectedFile(null);
    }
  }, [student]);

  useEffect(() => {
    getClassArmsApi()
      .then((res) => {
        if (res.success) setClassArms(res.data || []);
      })
      .catch(() => setClassArms([]));
  }, []);

  if (!isOpen || !student) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toaster.create({ title: "Please select an image file (JPG or PNG)", type: "warning" });
      return;
    }

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });

      setSelectedFile(compressed);
      setPreview(URL.createObjectURL(compressed));
    } catch (err) {
      toaster.create({ title: "Image processing failed", type: "error" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("firstName", form.firstName);
      formData.append("lastName", form.lastName);
      formData.append("studentEmail", form.studentEmail);
      formData.append("classArmId", form.classArmId || "");
      formData.append("parentPhone", form.parentPhone || "");

      if (selectedFile) {
        formData.append("face", selectedFile);
      }

      const res = await updateStudentApi(student.id, formData);

      if (res.success) {
        toaster.create({
          title: "Student profile updated!",
          description: selectedFile
            ? "Student details and biometric face photo were successfully updated."
            : "Student details have been saved.",
          type: "success",
        });

        if (onUpdated) {
          onUpdated(res.student);
        }
        onClose();
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Failed to update student",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasFace = Boolean(preview || student.faceImageUrl);

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      bg="rgba(15, 23, 42, 0.65)"
      backdropFilter="blur(6px)"
      zIndex={1400}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        bg="white"
        w="100%"
        maxW="600px"
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
              <Icon as={FaUserEdit} boxSize={5} />
            </Flex>
            <Box>
              <Text fontSize="16px" fontWeight="800" color="#0F172A">
                Edit Candidate Profile
              </Text>
              <Text fontSize="12px" color="#6B21A8" fontWeight="700">
                {student.studentId || `STU-${student.id}`}
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

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit}>
          <Box p={6} maxH="75vh" overflowY="auto">
            {/* Biometric Photo Upload Section */}
            <Box
              p={4}
              borderRadius="2xl"
              border="2px dashed"
              borderColor={hasFace ? "#10B981" : "#F59E0B"}
              bg={hasFace ? "#F0FDF4" : "#FFFBEB"}
              mb={6}
            >
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="12px" fontWeight="800" color="#334155" letterSpacing="0.5px">
                  BIOMETRIC HEADSHOT (AI CBT PROCTORING)
                </Text>
                <Badge
                  bg={hasFace ? "#DCFCE7" : "#FEF3C7"}
                  color={hasFace ? "#15803D" : "#B45309"}
                  fontSize="10px"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                >
                  <Icon as={hasFace ? FaCheckCircle : FaExclamationTriangle} mr={1} />
                  {hasFace ? "Face Registered" : "Face Missing"}
                </Badge>
              </Flex>

              <Flex direction={{ base: "column", sm: "row" }} align="center" gap={4}>
                {/* Photo Preview Box */}
                <Box
                  w="84px"
                  h="84px"
                  borderRadius="2xl"
                  bg="white"
                  border="2px solid #E2E8F0"
                  p={1}
                  boxShadow="0 4px 10px rgba(0,0,0,0.05)"
                  flexShrink={0}
                  overflow="hidden"
                  position="relative"
                  cursor="pointer"
                  onClick={() => fileInputRef.current?.click()}
                  _hover={{ opacity: 0.9 }}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Student Face"
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }}
                    />
                  ) : (
                    <Flex
                      w="100%"
                      h="100%"
                      borderRadius="12px"
                      bg="#F1F5F9"
                      direction="column"
                      align="center"
                      justify="center"
                      color="#94A3B8"
                    >
                      <Icon as={FaCamera} boxSize={5} mb={1} />
                      <Text fontSize="9px" fontWeight="700">NO PHOTO</Text>
                    </Flex>
                  )}
                </Box>

                {/* File Picker Controls */}
                <Box flex={1}>
                  <Text fontSize="12px" color="#475569" mb={2}>
                    {hasFace
                      ? "Biometric headshot is registered for exam authentication. You can replace it anytime."
                      : "No headshot was uploaded during initial enrollment. Upload one now to enable face proctoring for CBT exams."}
                  </Text>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/jpg"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />

                  <Flex gap={2} align="center">
                    <Button
                      size="sm"
                      bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
                      color="white"
                      borderRadius="xl"
                      fontSize="12px"
                      fontWeight="700"
                      px={3.5}
                      onClick={() => fileInputRef.current?.click()}
                      _hover={{ opacity: 0.92 }}
                    >
                      <Icon as={FaCamera} mr={1.5} boxSize={3.5} />
                      {hasFace ? "Change Face Photo" : "Upload Face Photo"}
                    </Button>

                    {selectedFile && (
                      <Badge bg="#EDE9FE" color="#6B21A8" fontSize="10px" px={2} py={1} borderRadius="lg">
                        New photo selected
                      </Badge>
                    )}
                  </Flex>
                </Box>
              </Flex>
            </Box>

            {/* Form Fields Grid */}
            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4} mb={4}>
              <Box>
                <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                  First Name *
                </Text>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  borderRadius="xl"
                  h="44px"
                  fontSize="13px"
                  borderColor="#CBD5E1"
                  _focus={{ borderColor: "#6A1B9A" }}
                  required
                />
              </Box>

              <Box>
                <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                  Surname / Last Name *
                </Text>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  borderRadius="xl"
                  h="44px"
                  fontSize="13px"
                  borderColor="#CBD5E1"
                  _focus={{ borderColor: "#6A1B9A" }}
                  required
                />
              </Box>
            </SimpleGrid>

            <Box mb={4}>
              <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                Student Email Address *
              </Text>
              <Input
                type="email"
                value={form.studentEmail}
                onChange={(e) => setForm({ ...form, studentEmail: e.target.value })}
                borderRadius="xl"
                h="44px"
                fontSize="13px"
                borderColor="#CBD5E1"
                _focus={{ borderColor: "#6A1B9A" }}
                required
              />
            </Box>

            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4} mb={2}>
              <Box>
                <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                  Class Arm / Level
                </Text>
                <select
                  value={form.classArmId}
                  onChange={(e) => setForm({ ...form, classArmId: e.target.value })}
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "12px",
                    border: "1px solid #CBD5E1",
                    padding: "0 10px",
                    fontSize: "13px",
                    background: "white",
                    color: "#1E293B",
                  }}
                >
                  <option value="">None (General / CBT Candidate)</option>
                  {classArms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.level ? `(${c.level})` : ""}
                    </option>
                  ))}
                </select>
              </Box>

              <Box>
                <Text fontSize="12px" fontWeight="700" color="#334155" mb={1}>
                  Parent / Guardian Phone
                </Text>
                <Input
                  placeholder="e.g. 08012345678"
                  value={form.parentPhone}
                  onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                  borderRadius="xl"
                  h="44px"
                  fontSize="13px"
                  borderColor="#CBD5E1"
                  _focus={{ borderColor: "#6A1B9A" }}
                />
              </Box>
            </SimpleGrid>
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
              disabled={loading}
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
              loading={loading}
              loadingText="Saving Changes..."
              _hover={{ opacity: 0.95 }}
            >
              Save Changes
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default EditStudentModal;
