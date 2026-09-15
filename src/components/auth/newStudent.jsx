import {
  Box,
  Text,
  Image,
  Input,
  Button,
  Flex,
  Badge,
  Icon,
  SimpleGrid,
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { addStudent } from "../../api-endpoint/student/students";
import { getClassArmsApi } from "../../api-endpoint/sms/smsEndpoints";
import { toaster } from "../ui/toaster";
import imageCompression from "browser-image-compression";
import CropModal from "../CropModal";
import { getCroppedImg } from "../CropImage";
import {
  FaUserPlus,
  FaCamera,
  FaEnvelope,
  FaUser,
  FaCheckCircle,
  FaShieldAlt,
  FaGraduationCap,
} from "react-icons/fa";

const NewStudent = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    studentemail: "",
    classArmId: "",
    parentPhone: "",
  });
  const [classArms, setClassArms] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rawImage, setRawImage] = useState(null);
  const [showCrop, setShowCrop] = useState(false);

  useEffect(() => {
    getClassArmsApi()
      .then((res) => {
        if (res.success && res.data) {
          setClassArms(res.data);
        }
      })
      .catch(() => setClassArms([]));
  }, []);

  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toaster.warning({ title: "Please select an image file" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (pixelCrop) => {
    try {
      if (!rawImage || !pixelCrop) return;

      const croppedFile = await getCroppedImg(rawImage, pixelCrop);

      const compressed = await imageCompression(croppedFile, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });

      setImage(compressed);
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(URL.createObjectURL(compressed));

      setShowCrop(false);
      setRawImage(null);
    } catch (err) {
      toaster.error({ title: "Image processing failed" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.firstName || !form.lastName || !form.studentemail) {
      toaster.warning({ title: "All fields are required" });
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("firstName", form.firstName);
      formData.append("lastName", form.lastName);
      formData.append("studentEmail", form.studentemail);

      if (form.classArmId) {
        formData.append("classArmId", form.classArmId);
      }
      if (form.parentPhone) {
        formData.append("parentPhone", form.parentPhone);
      }

      if (image) {
        formData.append("face", image);
      }

      setLoading(true);
      const res = await addStudent(formData);

      if (res?.success && res?.message === "Student Added Successfully") {
        toaster.create({
          title: "Student enrolled successfully",
          description: res.studentId ? `Assigned ID: ${res.studentId}` : undefined,
          type: "success",
        });

        setForm({
          firstName: "",
          lastName: "",
          studentemail: "",
          classArmId: "",
          parentPhone: "",
        });
        setImage(null);
        setPreview(null);
      }
    } catch (error) {
      console.error("Error querying server", error);
      toaster.create({
        title: error?.response?.data?.message || "Failed to add student",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      mt="84px"
      ml={{ base: 0, lg: "240px" }}
      w={{ base: "100%", lg: "calc(100% - 240px)" }}
      p={{ base: 4, md: 8 }}
      minH="calc(100vh - 84px)"
      bg="#F8FAFC"
    >
      <Box maxW="1000px" mx="auto">
        {/* Page Header */}
        <Box mb={8}>
          <Flex align="center" gap={2.5} mb={1}>
            <Flex
              w="38px"
              h="38px"
              borderRadius="xl"
              bg="purple.50"
              color="#6A1B9A"
              align="center"
              justify="center"
            >
              <Icon as={FaUserPlus} boxSize={5} />
            </Flex>
            <Text
              fontSize={{ base: "22px", md: "26px" }}
              fontWeight="800"
              color="#0F172A"
              fontFamily="'Outfit', sans-serif"
            >
              Enroll Candidate
            </Text>
          </Flex>
          <Text fontSize="14px" color="#64748B">
            Register student biometric face profile and credentials for proctored CBT examination access.
          </Text>
        </Box>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <SimpleGrid columns={{ base: 1, md: 12 }} gap={8}>
            
            {/* Left Column: Biometric Photo Uploader */}
            <Box
              gridColumn={{ md: "span 4" }}
              bg="white"
              borderRadius="24px"
              p={6}
              border="1px solid"
              borderColor="#E2E8F0"
              boxShadow="0 2px 12px rgba(0,0,0,0.03)"
              textAlign="center"
            >
              <Text fontSize="15px" fontWeight="700" color="#0F172A" mb={1}>
                Biometric Photo
              </Text>
              <Text fontSize="12px" color="#64748B" mb={5}>
                Used for AI face proctoring verification
              </Text>

              {/* Upload Drop Zone */}
              <Box
                w="180px"
                h="180px"
                mx="auto"
                border="2px dashed"
                borderColor={preview ? "#10B981" : "#CBD5E1"}
                borderRadius="24px"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                bg={preview ? "transparent" : "#F8FAFC"}
                _hover={{ borderColor: "#6A1B9A", bg: "#FAF5FF" }}
                onClick={() => fileInputRef.current.click()}
                overflow="hidden"
                position="relative"
                transition="all 0.2s ease"
              >
                {preview ? (
                  <Image
                    src={preview}
                    alt="Student Face Preview"
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />
                ) : (
                  <Flex direction="column" align="center" gap={2} p={4}>
                    <Flex
                      w="46px"
                      h="46px"
                      borderRadius="full"
                      bg="purple.50"
                      color="#6A1B9A"
                      align="center"
                      justify="center"
                    >
                      <Icon as={FaCamera} boxSize={5} />
                    </Flex>
                    <Text fontSize="12px" fontWeight="700" color="#475569">
                      Upload Headshot
                    </Text>
                    <Text fontSize="10px" color="#94A3B8">
                      JPG or PNG under 5MB
                    </Text>
                  </Flex>
                )}
              </Box>

              <Input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                display="none"
                onChange={handleImageChange}
              />

              <Button
                size="sm"
                variant="outline"
                borderColor="#E2E8F0"
                mt={4}
                w="100%"
                borderRadius="xl"
                fontSize="12px"
                fontWeight="600"
                onClick={() => fileInputRef.current.click()}
              >
                {preview ? "Change Photo" : "Browse Image"}
              </Button>

              <Flex align="center" justify="center" gap={1.5} color="#059669" fontSize="11px" fontWeight="600" mt={4}>
                <Icon as={FaShieldAlt} />
                <Text>Auto-compressed with AI crop</Text>
              </Flex>
            </Box>

            {/* Right Column: Candidate Profile Details */}
            <Box
              gridColumn={{ md: "span 8" }}
              bg="white"
              borderRadius="24px"
              p={{ base: 6, md: 8 }}
              border="1px solid"
              borderColor="#E2E8F0"
              boxShadow="0 2px 12px rgba(0,0,0,0.03)"
            >
              <Text fontSize="17px" fontWeight="800" color="#0F172A" mb={6}>
                Candidate Credentials
              </Text>

              <SimpleGrid columns={{ base: 1, sm: 2 }} gap={5} mb={5}>
                <Box>
                  <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                    First Name *
                  </Text>
                  <Input
                    placeholder="e.g. Babatunde"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    borderRadius="xl"
                    h="48px"
                    fontSize="14px"
                    borderColor="#CBD5E1"
                    _focus={{ borderColor: "#6A1B9A", boxShadow: "0 0 0 1px #6A1B9A" }}
                    required
                  />
                </Box>

                <Box>
                  <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                    Surname / Last Name *
                  </Text>
                  <Input
                    placeholder="e.g. Adeleke"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    borderRadius="xl"
                    h="48px"
                    fontSize="14px"
                    borderColor="#CBD5E1"
                    _focus={{ borderColor: "#6A1B9A", boxShadow: "0 0 0 1px #6A1B9A" }}
                    required
                  />
                </Box>
              </SimpleGrid>

              <Box mb={6}>
                <Text fontSize="13px" fontWeight="700" color="#334155" mb={1.5}>
                  Student Email Address *
                </Text>
                <Input
                  type="email"
                  placeholder="e.g. b.adeleke@school.edu.ng"
                  value={form.studentemail}
                  onChange={(e) => setForm({ ...form, studentemail: e.target.value })}
                  borderRadius="xl"
                  h="48px"
                  fontSize="14px"
                  borderColor="#CBD5E1"
                  _focus={{ borderColor: "#6A1B9A", boxShadow: "0 0 0 1px #6A1B9A" }}
                  required
                />
                <Text fontSize="11px" color="#94A3B8" mt={1}>
                  Exam invitation codes and test schedules will be dispatched to this email.
                </Text>
              </Box>

              {/* Optional Class Arm & Parent Phone */}
              <SimpleGrid columns={{ base: 1, sm: 2 }} gap={5} mb={6}>
                <Box>
                  <Flex justify="space-between" align="center" mb={1.5}>
                    <Text fontSize="13px" fontWeight="700" color="#334155">
                      Class Arm / Level
                    </Text>
                    <Badge bg="#F1F5F9" color="#64748B" fontSize="10px" px={2} py={0.5} borderRadius="full">
                      Optional
                    </Badge>
                  </Flex>
                  <select
                    value={form.classArmId}
                    onChange={(e) => setForm({ ...form, classArmId: e.target.value })}
                    style={{
                      width: "100%",
                      height: "48px",
                      borderRadius: "12px",
                      border: "1px solid #CBD5E1",
                      padding: "0 12px",
                      fontSize: "14px",
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
                  <Text fontSize="11px" color="#94A3B8" mt={1}>
                    Optional: Select class for school fee billing and attendance.
                  </Text>
                </Box>

                <Box>
                  <Flex justify="space-between" align="center" mb={1.5}>
                    <Text fontSize="13px" fontWeight="700" color="#334155">
                      Parent / Guardian Phone
                    </Text>
                    <Badge bg="#F1F5F9" color="#64748B" fontSize="10px" px={2} py={0.5} borderRadius="full">
                      Optional
                    </Badge>
                  </Flex>
                  <Input
                    placeholder="e.g. 08012345678"
                    value={form.parentPhone}
                    onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                    borderRadius="xl"
                    h="48px"
                    fontSize="14px"
                    borderColor="#CBD5E1"
                    _focus={{ borderColor: "#6A1B9A", boxShadow: "0 0 0 1px #6A1B9A" }}
                  />
                  <Text fontSize="11px" color="#94A3B8" mt={1}>
                    For WhatsApp / SMS fee reminders & report updates.
                  </Text>
                </Box>
              </SimpleGrid>

              <Button
                type="submit"
                w="100%"
                h="50px"
                bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
                color="white"
                borderRadius="xl"
                fontSize="15px"
                fontWeight="700"
                boxShadow="0 4px 14px rgba(106, 27, 154, 0.3)"
                _hover={{ opacity: 0.95, transform: "translateY(-1px)" }}
                loading={loading}
                loadingText="Registering Candidate..."
              >
                <Icon as={FaCheckCircle} mr={2} boxSize={4} />
                Complete Enrollment
              </Button>
            </Box>
          </SimpleGrid>
        </form>
      </Box>

      {showCrop && (
        <CropModal
          image={rawImage}
          onComplete={handleCropComplete}
          onClose={() => setShowCrop(false)}
        />
      )}
    </Box>
  );
};

export default NewStudent;
