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
  const [cameraReady, setCameraReady] = useState(false);
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [storedDescriptor, setStoredDescriptor] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [modelReady, setModelsReady] = useState(false);
  const descriptorsRef = useRef([]);
  const blinkCounterRef = useRef(0);
  const streamRef = useRef(null);

  const detectorOptions = new faceapi.TinyFaceDetectorOptions({
    inputSize: 160,
    scoreThreshold: 0.6,
  });

  // start camera
  useEffect(() => {
    if (!isOpen) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        streamRef.current = stream;
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
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCameraReady(false);
      setBlinkDetected(false);
      descriptorsRef.current = [];
      console.log("Camera stopped, cleanup done");
    };
  }, [isOpen]);

  //load light models
  useEffect(() => {
    if (!cameraReady) return;

    const loadModels = async () => {
      try {
        await faceapi.tf.setBackend("cpu");
        await faceapi.tf.ready();

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models/weights"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models/weights"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models/weights"),
        ]);
        console.log("Models loaded successfully");
        setModelsReady(true);
        // setLoadingModels(false);
      } catch (error) {
        console.error("Failed to load models:", error);
        toaster.create({
          type: "error",
          title: "Failed to load face models",
        });
      }
    };
    loadModels();
  }, [cameraReady]);

  // load stored faces
  useEffect(() => {
    if (!modelReady || !studentId) return;

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
  }, [studentId, modelReady]);

  // Blink liveness
  useEffect(() => {
    if (!modelReady || blinkDetected) return;

    const interval = setInterval(async () => {
      if (!videoRef.current) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, detectorOptions)
        .withFaceLandmarks();

      if (!detection) return;

      const leftEye = detection.landmarks.getLeftEye();
      const rightEye = detection.landmarks.getRightEye();

      const ear = (eye) =>
        Math.abs(eye[1].y - eye[5].y) / Math.abs(eye[0].x - eye[3].x);

      if (ear(leftEye) < 0.42 || ear(rightEye) < 0.42) {
        blinkCounterRef.current += 1;
      } else {
        if (blinkCounterRef.current >= 1) setBlinkDetected(true);
        blinkCounterRef.current = 0;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [modelReady, blinkDetected]);

  //Face collection
  useEffect(() => {
    if (!modelReady) return;

    const interval = setInterval(async () => {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, detectorOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        descriptorsRef.current.push(detection.descriptor);
        if (descriptorsRef.current.length > 8) descriptorsRef.current.shift();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [modelReady]);

  //verify face
  const verifyFace = async () => {
    if (!storedDescriptor || descriptorsRef.current.length === 0) {
      toaster.error({ title: "Face not ready for verification" });
      return;
    }

    setVerifying(true);
    console.log("Starting face verification...");

    try {
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models/weights");
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

      if (bestMatches.label === "unknown") {
        toaster.error({ title: "Face does not match" });
      } else {
        toaster.success({ title: "Face verified sucessfullly" });
        onSuccess();
      }
    } catch (err) {
      console.error("Verification failed:", err);
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
