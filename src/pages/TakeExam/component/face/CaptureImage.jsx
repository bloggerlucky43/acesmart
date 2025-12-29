import { Button, Box, Text, Flex, Spinner } from "@chakra-ui/react";
import * as faceapi from "face-api.js";
import { useEffect, useState, useRef } from "react";
import api from "../../../../libs/axios";
import { toaster } from "../../../../components/ui/toaster";

const FACE_MATCH_THRESHOLD = 0.37;

export default function FaceVerificationModal({
  isOpen,
  onClose,
  studentId,
  onSuccess,
}) {
  const videoRef = useRef(null);
  const [loadingModels, setLoadingModels] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [storedDescriptor, setStoredDescriptor] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const descriptorsRef = useRef([]);
  const blinkCounterRef = useRef(0);

  const detectorOptions = new faceapi.TinyFaceDetectorOptions({
    inputSize: 416,
    scoreThreshold: 0.5, // easier to detect faces
  });

  //load models
  useEffect(() => {
    if (!isOpen) return;

    const loadModels = async () => {
      try {
        await faceapi.tf.setBackend("webgl");
        await faceapi.tf.ready();
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models/weights"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models/weights"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models/weights"),
        ]);
        console.log("Models loaded successfully");

        setLoadingModels(false);
      } catch (error) {
        console.error("Failed to load models:", error);
        toaster.create({
          type: "error",
          title: "Failed to load face models",
        });
      }
    };
    loadModels();
  }, [isOpen]);

  // load stored faces
  useEffect(() => {
    if (!isOpen || !studentId || loadingModels) return;

    const loadStoredFace = async () => {
      try {
        const res = await api.get(`/student/face/${studentId}`);
        const img = await faceapi.fetchImage(res.data.faceImageUrl);

        console.log("Detecting stored face descriptor...");
        const detection = await faceapi
          .detectSingleFace(img, detectorOptions)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection) {
          toaster.error({ title: "Stored face not detectable" });
          return;
        }
        console.log("Stored face descriptor loaded");
        setStoredDescriptor(detection.descriptor);
      } catch (error) {
        console.error("Failed to load reference face:", error);
        toaster.error({ title: "Failed to load reference face" });
      }
    };

    loadStoredFace();
  }, [isOpen, studentId, loadingModels]);

  // start camera
  useEffect(() => {
    if (!isOpen || loadingModels || cameraReady) return;
    console.log("trying to log videoref", videoRef.current);

    if (!videoRef.current) return;

    console.log("Trying to start camera");

    let stream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });

        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current.play();

            console.log("Camera started");
            setCameraReady(true);
          } catch (error) {
            console.error(error);
          }
        };
      } catch (err) {
        console.error("Camera error:", err);
        toaster.error({ title: "Unable to access camera" });
      }
    };

    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      setCameraReady(false);
      setBlinkDetected(false);
      descriptorsRef.current = [];
      console.log("Camera stopped, cleanup done");
    };
  }, [isOpen, loadingModels]);

  // Blink liveness
  useEffect(() => {
    if (!cameraReady || blinkDetected) return;

    let rafId;

    const runDetection = async () => {
      if (!videoRef.current) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, detectorOptions)
        .withFaceLandmarks();

      // console.log("Face detection", detection);

      if (detection) {
        const leftEye = detection.landmarks.getLeftEye();
        const rightEye = detection.landmarks.getRightEye();

        const eyeAspectRatio = (eye) => {
          const vertical = Math.abs(eye[1].y - eye[5].y);
          const horizontal = Math.abs(eye[0].x - eye[3].x);
          return vertical / horizontal;
        };

        const EAR_THRESHOLD = 0.27;

        if (
          eyeAspectRatio(leftEye) < EAR_THRESHOLD ||
          eyeAspectRatio(rightEye) < EAR_THRESHOLD
        ) {
          blinkCounterRef.current += 1;
        } else {
          if (blinkCounterRef.current > 2) {
            setBlinkDetected(true);
          }
          blinkCounterRef.current = 0;
        }
      }

      rafId = requestAnimationFrame(runDetection);
    };

    runDetection();

    return () => cancelAnimationFrame(rafId);
  }, [cameraReady, blinkDetected]);

  useEffect(() => {
    if (!cameraReady) return;

    let rafId;

    const runFaceCollection = async () => {
      if (!videoRef.current) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, detectorOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        descriptorsRef.current.push(detection.descriptor);

        if (descriptorsRef.current.length > 10) descriptorsRef.current.shift();
      }

      rafId = requestAnimationFrame(runFaceCollection);
    };

    runFaceCollection();

    return () => cancelAnimationFrame(rafId);
  }, [cameraReady]);

  //verify face
  const verifyFace = async () => {
    if (!storedDescriptor || descriptorsRef.current.length === 0) {
      toaster.error({ title: "Face not ready for verification" });
      return;
    }

    setVerifying(true);
    console.log("Starting face verification...");

    try {
      const matcher = new faceapi.FaceMatcher(
        [new faceapi.LabeledFaceDescriptors("user", [storedDescriptor])],
        FACE_MATCH_THRESHOLD
      );

      const avgDescriptor = new Float32Array(128).fill(0);
      descriptorsRef.current.forEach((d) => {
        for (let i = 0; i < 128; i++) avgDescriptor[i] += d[i];
      });

      for (let i = 0; i < 128; i++)
        avgDescriptor[i] /= descriptorsRef.current.length;

      const bestMatches = matcher.findBestMatch(avgDescriptor);

      // console.log("FaceMatcher result:", bestMatches);
      // console.log("Distance:", bestMatches.distance);
      if (bestMatches.label === "unknown") {
        toaster.error({ title: "Face does not match" });
      } else {
        toaster.success({ title: "Face verified sucessfullly" });
        onSuccess();
      }
    } catch (err) {
      // console.error("Verification failed:", err);
      toaster.error({ title: "Verification failed" });
    } finally {
      setVerifying(false);
    }
  };

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
      <Box bg="white" borderRadius="md" p={6} w={["90%", "400px"]}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Face Verification
        </Text>

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

        {/* Spinner overlay */}
        {!cameraReady && (
          <Flex align="center" justify="center" h="200px">
            <Spinner />
          </Flex>
        )}

        {cameraReady && (
          <>
            <Text mt={3} textAlign="center">
              {blinkDetected
                ? "Blink detected ✔"
                : "Please blink to confirm liveness"}
            </Text>

            <Flex justify="flex-end" mt={4} gap={2}>
              <Button
                bg="primary"
                disabled={!blinkDetected || verifying}
                loading={verifying}
                onClick={verifyFace}
              >
                Verify & Continue
              </Button>

              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </Flex>
          </>
        )}
      </Box>
    </Box>
  );
}
