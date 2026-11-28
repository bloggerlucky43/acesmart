import { useState, useEffect, useRef, useId } from "react";
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
  Portal,
} from "@chakra-ui/react";
import {
  FaUserEdit,
  FaCamera,
  FaUpload,
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
import StudentAcademicSection from "./StudentAcademicSection";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../libs/AuthProvider";
import { STUDENT_EDITOR_CACHE_MS } from "../../libs/studentEditorCache";

function stopPhotoCamera(cameraRef) {
  const camera = cameraRef.current;
  if (!camera) return;
  cameraRef.current = null;
  camera.stream?.getTracks().forEach((track) => track.stop());
  if (camera.video.srcObject === camera.stream) camera.video.srcObject = null;
}

const EditStudentModal = ({ isOpen, onClose, student, onUpdated }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    studentEmail: "",
    classArmId: "",
    parentPhone: "",
  });

  const { user, loading: authLoading } = useAuth();
  const userId = user?._id || user?.id;
  const institutionId = user?.institutionId;
  const isSchoolAdmin = ["institution", "institution_admin", "admin"].includes(user?.role);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [cameraStatus, setCameraStatus] = useState("");
  const fileInputRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const objectUrlRef = useRef(null);
  const processingRef = useRef(null);
  const savingRef = useRef(null);
  const operationRef = useRef(0);
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const titleId = useId();
  const modalOpen = Boolean(isOpen && student);

  const { data: classData } = useQuery({
    queryKey: ["student-editor-classes", userId, institutionId, user?.role],
    queryFn: async () => {
      const response = await getClassArmsApi();
      if (!response?.success) throw new Error("Unable to load classes");
      return response;
    },
    enabled: isOpen && !authLoading && Boolean(userId && institutionId) && (user?.role === "teacher" || isSchoolAdmin),
    staleTime: STUDENT_EDITOR_CACHE_MS,
    gcTime: STUDENT_EDITOR_CACHE_MS,
    retry: false,
  });
  const classArms = (classData?.data || []).filter((arm) =>
    arm.institutionId === institutionId && (isSchoolAdmin || arm.formTeacherId === userId));

  useEffect(() => {
    const operations = operationRef;
    const camera = cameraRef;
    operations.current++;
    processingRef.current = null;
    savingRef.current = null;
    setIsProcessing(false);
    setLoading(false);
    setUploadProgress(null);
    setSelectedFile(null);
    setCameraStatus("");
    if (isOpen && student) {
      setForm({
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        studentEmail: student.studentEmail || "",
        classArmId: student.classArmId || student.ClassArm?.id || "",
        parentPhone: student.parentPhone || "",
      });
      setPreview(student.faceImageUrl || null);
    }
    return () => {
      operations.current++;
      stopPhotoCamera(camera);
      processingRef.current?.abort();
      savingRef.current?.abort();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    };
  }, [isOpen, student, userId, institutionId, user?.role]);

  useEffect(() => {
    if (!modalOpen) return;
    const body = document.body;
    const root = document.documentElement;
    const previousFocus = document.activeElement;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const previousStyle = {
      position: body.style.position, top: body.style.top, left: body.style.left,
      width: body.style.width, overflow: body.style.overflow, paddingRight: body.style.paddingRight,
    };
    const previousScrollBehavior = root.style.scrollBehavior;
    const scrollbarWidth = Math.max(0, window.innerWidth - root.clientWidth);
    const paddingRight = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
    // Fixed body preserves the visible page position, including on mobile Safari.
    Object.assign(body.style, {
      position: "fixed", top: `-${scrollY}px`, left: `-${scrollX}px`, width: "100%",
      overflow: "hidden", paddingRight: `${paddingRight + scrollbarWidth}px`,
    });
    root.style.scrollBehavior = "auto";
    dialogRef.current?.focus({ preventScroll: true });
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!savingRef.current) closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first) { event.preventDefault(); dialog.focus({ preventScroll: true }); return; }
      if (event.shiftKey ? document.activeElement === first || !focusable.includes(document.activeElement)
        : document.activeElement === last || !focusable.includes(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus({ preventScroll: true });
      }
    };
    const handleFocus = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        dialogRef.current.focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("focusin", handleFocus);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("focusin", handleFocus);
      Object.assign(body.style, previousStyle);
      window.scrollTo(scrollX, scrollY);
      root.style.scrollBehavior = previousScrollBehavior;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [modalOpen]);

  if (!isOpen || !student) return null;

  const preparePhoto = async (file) => {
    if (!file || savingRef.current) return;

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      toaster.create({ title: "Please select an image file (JPG or PNG)", type: "warning" });
      return;
    }

    stopPhotoCamera(cameraRef);
    setCameraStatus("");
    processingRef.current?.abort();
    const controller = new AbortController();
    processingRef.current = controller;
    const operation = ++operationRef.current;
    setIsProcessing(true);
    setSelectedFile(null);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setPreview(student.faceImageUrl || null);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.25,
        maxWidthOrHeight: 600,
        initialQuality: 0.85,
        fileType: "image/jpeg",
        useWebWorker: true,
        signal: controller.signal,
      });
      if (operation !== operationRef.current || controller.signal.aborted) return;
      const photo = new File([compressed], `${file.name.replace(/\.[^.]+$/, "") || "student-face"}.jpg`, { type: "image/jpeg" });
      setSelectedFile(photo);
      objectUrlRef.current = URL.createObjectURL(photo);
      setPreview(objectUrlRef.current);
    } catch {
      if (operation === operationRef.current && !controller.signal.aborted) {
        toaster.create({ title: "Image processing failed", type: "error" });
      }
    } finally {
      if (operation === operationRef.current) {
        processingRef.current = null;
        setIsProcessing(false);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    return preparePhoto(file);
  };

  const closeCamera = () => {
    stopPhotoCamera(cameraRef);
    setCameraStatus("");
  };

  const openCamera = async () => {
    if (cameraRef.current || savingRef.current || !videoRef.current) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      toaster.create({ title: "Camera unavailable", description: "Open the site over HTTPS in a supported browser, or upload a photo instead.", type: "warning" });
      return;
    }

    const camera = { video: videoRef.current, stream: null, capturing: false };
    cameraRef.current = camera;
    setCameraStatus("opening");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      if (cameraRef.current !== camera) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      camera.stream = stream;
      camera.video.srcObject = stream;
      await camera.video.play();
      if (cameraRef.current === camera) setCameraStatus("ready");
    } catch (error) {
      if (cameraRef.current !== camera) return;
      closeCamera();
      toaster.create({
        title: error.name === "NotAllowedError" ? "Camera access was denied" : "Could not start the camera",
        description: "Check your camera and browser permissions, or upload a photo instead.",
        type: "warning",
      });
    }
  };

  const capturePhoto = async () => {
    const camera = cameraRef.current;
    if (!camera || camera.capturing || cameraStatus !== "ready") return;
    const { video } = camera;
    camera.capturing = true;
    setCameraStatus("capturing");
    try {
      if (!video.videoWidth || !video.videoHeight) throw new Error("Camera frame unavailable");
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 600 / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
      canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      if (cameraRef.current !== camera) return;
      if (!blob) throw new Error("Camera frame could not be encoded");
      await preparePhoto(new File([blob], "student-face.jpg", { type: "image/jpeg" }));
    } catch {
      if (cameraRef.current !== camera) return;
      closeCamera();
      toaster.create({ title: "Could not capture a photo", description: "Try the camera again or upload a photo instead.", type: "error" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cameraRef.current || processingRef.current || savingRef.current) return;
    const controller = new AbortController();
    savingRef.current = controller;
    const operation = operationRef.current;
    setLoading(true);
    setUploadProgress(null);

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

      const res = await updateStudentApi(student.id, formData, {
        signal: controller.signal,
        onUploadProgress: ({ loaded, total }) => {
          if (operation === operationRef.current && total > 0) {
            setUploadProgress(Math.min(100, Math.floor(loaded / total * 100)));
          }
        },
      });
      if (operation !== operationRef.current || controller.signal.aborted) return;
      if (!res?.success) throw new Error(res?.message || "Failed to update student");

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
      if (operation === operationRef.current && !controller.signal.aborted) {
        toaster.create({
          title: error.response?.data?.message || error.message || "Failed to update student",
          type: "error",
        });
      }
    } finally {
      if (operation === operationRef.current) {
        savingRef.current = null;
        setLoading(false);
      }
    }
  };

  const hasFace = Boolean(preview || student.faceImageUrl);

  return (
    <Portal>
    <Box
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100dvh"
      maxH="100dvh"
      bg="rgba(15, 23, 42, 0.65)"
      backdropFilter="blur(6px)"
      zIndex={1400}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      onClick={(event) => {
        if (event.target === event.currentTarget && !savingRef.current) onClose();
      }}
    >
      <Box
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        bg="white"
        w="100%"
        maxW="600px"
        borderRadius="28px"
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        maxH="calc(100dvh - 32px)"
        display="flex"
        flexDirection="column"
        minH={0}
        overflow="hidden"
        outline="none"
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
              <Icon as={FaUserEdit} boxSize={5} />
            </Flex>
            <Box>
              <Text id={titleId} fontSize="16px" fontWeight="800" color="#0F172A">
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
            disabled={loading}
            aria-label="Close student editor"
            _hover={{ bg: "#F3E8FF" }}
          >
            <Icon as={FaTimes} color="#64748B" />
          </Button>
        </Flex>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0, overflow: "hidden" }}>
          <Box p={{ base: 4, sm: 6 }} flex="1" minH={0} overflowY="auto" overscrollBehavior="contain">
            {/* Biometric Photo Section */}
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
                  {selectedFile ? "Photo Pending" : hasFace ? "Face Registered" : "Face Missing"}
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
                  onClick={() => { if (!savingRef.current) fileInputRef.current?.click(); }}
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
                    {selectedFile ? "Review the new photo, then save to apply it."
                      : hasFace
                      ? "Biometric headshot is registered for exam authentication. You can replace it anytime."
                      : "Take or upload a headshot to enable face proctoring for CBT exams."}
                  </Text>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/jpg"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    disabled={loading}
                  />

                  <Flex gap={2} align="center" wrap="wrap">
                    <Button
                      type="button"
                      size="sm"
                      bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
                      color="white"
                      borderRadius="xl"
                      fontSize="12px"
                      fontWeight="700"
                      px={3.5}
                      onClick={openCamera}
                      disabled={loading || isProcessing || Boolean(cameraStatus)}
                      _hover={{ opacity: 0.92 }}
                    >
                      <Icon as={FaCamera} mr={1.5} boxSize={3.5} />
                      {selectedFile ? "Retake Photo" : "Take Photo"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      borderColor="#CBD5E1"
                      borderRadius="xl"
                      fontSize="12px"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                    >
                      <Icon as={FaUpload} mr={1.5} boxSize={3.5} />
                      Upload Photo
                    </Button>
                  </Flex>
                  {isProcessing && <Text role="status" fontSize="12px" mt={2}>Preparing photo...</Text>}
                  {loading && selectedFile && (
                    <Text role="status" fontSize="12px" mt={2}>
                      {uploadProgress === 100 ? "Upload sent. Saving changes..." : uploadProgress === null
                        ? "Uploading photo..." : `Uploading photo: ${uploadProgress}%`}
                    </Text>
                  )}
                </Box>
              </Flex>
              <Box hidden={!cameraStatus} mt={4}>
                {cameraStatus === "opening" && <Text role="status" fontSize="12px" mb={2}>Opening camera. Allow access if prompted.</Text>}
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  aria-label="Live camera preview"
                  style={{ width: "100%", maxHeight: "240px", borderRadius: "12px", background: "#0F172A" }}
                />
                <Flex gap={2} mt={2} wrap="wrap">
                  <Button type="button" size="sm" colorPalette="purple" onClick={capturePhoto} disabled={cameraStatus !== "ready"}>
                    {cameraStatus === "capturing" ? "Capturing..." : "Capture Photo"}
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={closeCamera}>Cancel Camera</Button>
                </Flex>
              </Box>
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
            {student?.institutionId && <StudentAcademicSection key={student.id || student._id} student={student} />}
          </Box>

          {/* Modal Footer */}
          <Flex justify="flex-end" gap={3} px={{ base: 4, sm: 6 }} py={4} borderTop="1px solid #F1F5F9" bg="#F8FAFC" flexShrink={0} wrap="wrap">
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
              disabled={isProcessing || loading || Boolean(cameraStatus)}
              loading={loading || isProcessing}
              loadingText={isProcessing ? "Preparing photo..." : selectedFile && uploadProgress !== 100 ? "Uploading photo..." : "Saving Changes..."}
              _hover={{ opacity: 0.95 }}
            >
              Save Changes
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
    </Portal>
  );
};

export default EditStudentModal;
