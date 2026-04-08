import { Button, Box, Text, Flex, Spinner } from "@chakra-ui/react";
import * as faceapi from "face-api.js";
import { useEffect, useState, useRef } from "react";
import api from "../../../../libs/axios";
import { toaster } from "../../../../components/ui/toaster";
import { loadFaceModels } from "../../login";
const FACE_MATCH_THRESHOLD = 0.68;
const MAX_CAPTURE = 2;
const VERIFY_TIMEOUT = 120000; // 2 min

export default function FaceVerificationModal({
  isOpen,
  onClose,
  studentId,
  onSuccess,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const descriptorsRef = useRef([]);
  const collectedRef = useRef(0);
  const verifyingRef = useRef(false);

  const [cameraReady, setCameraReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [storedDescriptor, setStoredDescriptor] = useState(null);

  const detectorOptions = new faceapi.TinyFaceDetectorOptions({
    inputSize: 160,
    scoreThreshold: 0.35,
  });

  // ================= DEVICE CAPABILITY CHECK =================
  const isFaceCapable = () => {
    try {
      const canvas = document.createElement("canvas");
      return !!window.WebGLRenderingContext && !!canvas.getContext("webgl");
    } catch {
      return false;
    }
  };

  // ================= CAMERA CLEANUP =================
  const stopCamera = () => {
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraReady(false);
    setModelReady(false);
    setStoredDescriptor(null);
    descriptorsRef.current = [];
    collectedRef.current = 0;
    verifyingRef.current = false;
  };

  // ================= START CAMERA =================
  useEffect(() => {
    if (!isOpen) return;

    if (!isFaceCapable()) {
      toaster.warning({
        title: "Face verification skipped",
        description: "Device not compatible",
      });
      onSuccess(); // only skip if device not capable
      return;
    }

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 320 },
            height: { ideal: 240 },
          },
        });
        console.log("Camera stream obtained:", stream);

        streamRef.current = stream;
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current.play();
          console.log("Video metadata loaded,camera is ready");
          setCameraReady(true);
        };
      } catch (err) {
        console.error("Camera error:", err);
        toaster.error({ title: "Unable to access camera" });
        stopCamera();
        onClose();
      }
    };

    startCamera();

    return () => stopCamera();
  }, [isOpen]);

  // ================= LOAD FACE MODELS =================
  useEffect(() => {
    if (!cameraReady) return;

    const loadModels = async () => {
      try {
        await loadFaceModels();
        setModelReady(true);
      } catch (err) {
        console.error("Model load error:", err);
        toaster.error({ title: "Failed to load face models" });
        stopCamera();
        onClose();
      }
    };

    loadModels();
  }, [cameraReady]);

  // ================= LOAD STORED FACE =================
  useEffect(() => {
    if (!modelReady || !studentId) return;

    const loadStoredFace = async () => {
      try {
        const res = await api.get(`/student/face/${studentId}`);
        console.log("Stored face API response:", res.data);
        const img = await faceapi.fetchImage(res.data.faceImageUrl);

        const detection = await faceapi
          .detectSingleFace(img, detectorOptions)
          .withFaceLandmarks()
          .withFaceDescriptor();

        console.log("Stored face detection:", detection);
        if (!detection) {
          toaster.warning({ title: "Stored face not detectable" });
          stopCamera();
          onClose();
          return;
        }

        setStoredDescriptor(detection.descriptor);
      } catch (err) {
        console.error("Stored face load error:", err);
        toaster.error({ title: "Failed to load reference face" });
        stopCamera();
        onClose();
      }
    };

    loadStoredFace();
  }, [modelReady, studentId]);

  // ================= COLLECT LIVE FACE =================
  useEffect(() => {
    if (!modelReady || !cameraReady || !storedDescriptor) return;

    descriptorsRef.current = [];
    collectedRef.current = 0;

    const interval = setInterval(async () => {
      if (
        verifyingRef.current ||
        !videoRef.current ||
        videoRef.current.readyState !== 4
      )
        return;

      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        detectorOptions,
      );
      console.log("Live face detection:", detection);

      const now = Date.now();

      let lastFullCompute = 0;

      if (detection && detection.score > 0.55 && now - lastFullCompute > 800) {
        lastFullCompute = now;
        //Only now compute heavy stuff
        const fullDetection = await faceapi
          .detectSingleFace(videoRef.current, detectorOptions)
          .withFaceLandmarks()
          .withFaceDescriptor();

        descriptorsRef.current.push(fullDetection.descriptor);
        collectedRef.current++;

        console.log("Collected:", collectedRef.current);

        if (collectedRef.current >= MAX_CAPTURE) {
          clearInterval(interval);
          verifyFace();
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [modelReady, cameraReady, storedDescriptor]);

  // ================= VERIFY FACE =================
  const verifyFace = async () => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;

    try {
      const matcher = new faceapi.FaceMatcher(
        [new faceapi.LabeledFaceDescriptors("user", [storedDescriptor])],
        FACE_MATCH_THRESHOLD,
      );

      // Count how many captures match
      let successCount = 0;
      descriptorsRef.current.forEach((d, i) => {
        const result = matcher.findBestMatch(d);
        console.log(`Capture #${i + 1} match result:`, result.toString());
        if (result.label !== "unknown") successCount++;
      });

      console.log("Total successful matches:", successCount);
      // Require at least 2/3 samples to match
      if (successCount >= Math.ceil(MAX_CAPTURE * 0.66)) {
        toaster.success({ title: "Face verified successfully" });
        console.log("Face verified ✅");
        stopCamera();
        onSuccess();
      } else {
        console.log("Face does not match ❌");
        toaster.error({ title: "Face does not match" });
        stopCamera();
      }
    } catch (err) {
      console.error("Face verification error:", err);
      toaster.error({ title: "Face verification failed" });
      stopCamera();
    }
  };

  // ================= SAFETY TIMEOUT =================
  useEffect(() => {
    if (!isOpen) return;

    const timeout = setTimeout(() => {
      toaster.warning({
        title: "Face verification skipped",
        description: "Verification timeout",
      });
      stopCamera();
      onClose();
    }, VERIFY_TIMEOUT);

    return () => clearTimeout(timeout);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      inset={0}
      bg="rgba(0,0,0,0.5)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={9999}
    >
      <Box bg="white" borderRadius="md" p={6} w={["90%", "420px"]}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Face Verification
        </Text>

        {!cameraReady && (
          <Flex align="center" justify="center" h="220px">
            <Spinner />
          </Flex>
        )}

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width="100%"
          style={{
            borderRadius: "8px",
            display: cameraReady ? "block" : "none",
          }}
        />

        {cameraReady && (
          <Text mt={3} textAlign="center">
            Hold still while we verify your face
          </Text>
        )}

        <Flex justify="flex-end" mt={4}>
          <Button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            variant="ghost"
          >
            Cancel
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
