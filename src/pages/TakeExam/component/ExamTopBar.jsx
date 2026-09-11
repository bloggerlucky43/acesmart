import { Box, Flex, Text, Icon, Button, HStack, Badge, Avatar } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  FaClock,
  FaUserGraduate,
  FaCalculator,
  FaCompress,
  FaExpand,
  FaBrain,
  FaCheckCircle,
} from "react-icons/fa";
import SubmitModal from "./SubmitModal";
import { useExam } from "./ExamContext";
import { toaster } from "../../../components/ui/toaster";
import Calculator from "./calculator/calculator";

export default function ExamTopBar() {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const { formatTime, timeLeft, examData } = useExam();
  const [examUserDetails, setExamUserDetails] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(
    !!document.fullscreenElement
  );
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    const examUser = localStorage.getItem("examStudent");
    if (examUser) {
      try {
        setExamUserDetails(JSON.parse(examUser));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      try {
        document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        toaster.create({
          title: "Fullscreen mode blocked by browser",
          type: "warning",
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const candidateName = `${examUserDetails?.firstName ?? ""} ${examUserDetails?.lastName ?? ""}`.trim() || "Candidate";
  const studentId = examUserDetails?.studentId || "CBT-001";
  const isUrgent = typeof timeLeft === "number" && timeLeft <= 300; // <= 5 minutes

  return (
    <>
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex={50}
        bg="#0F172A"
        borderBottom="1px solid rgba(255, 255, 255, 0.1)"
        px={{ base: 3, md: 6 }}
        py={2.5}
        boxShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
      >
        <Flex justify="space-between" align="center">
          {/* Left: Branding & Candidate Profile */}
          <HStack spacing={{ base: 2, md: 4 }}>
            <Flex
              w="36px"
              h="36px"
              borderRadius="10px"
              bg="#2563EB"
              align="center"
              justify="center"
              display={{ base: "none", sm: "flex" }}
            >
              <Icon as={FaBrain} boxSize={4} color="white" />
            </Flex>

            <Box>
              <HStack spacing={2}>
                <Text
                  fontSize="13px"
                  fontWeight="800"
                  color="white"
                  fontFamily="'Outfit', sans-serif"
                  lineHeight="1.2"
                >
                  {examData?.title || "Live CBT Examination"}
                </Text>
                <Badge
                  bg="rgba(59, 130, 246, 0.15)"
                  color="#93C5FD"
                  border="1px solid rgba(59, 130, 246, 0.3)"
                  fontSize="9px"
                  borderRadius="full"
                  px={2}
                >
                  PROCTORED
                </Badge>
              </HStack>

              <HStack spacing={2} mt={0.5}>
                <Text fontSize="11px" color="#94A3B8" fontWeight="medium">
                  {candidateName}
                </Text>
                <Text fontSize="10px" color="#64748B">•</Text>
                <Badge
                  bg="#1E293B"
                  color="#CBD5E1"
                  fontSize="9px"
                  borderRadius="md"
                  px={1.5}
                >
                  {studentId}
                </Badge>
              </HStack>
            </Box>
          </HStack>

          {/* Center: Live Digital Countdown Clock */}
          <Flex
            align="center"
            gap={2.5}
            bg={isUrgent ? "rgba(239, 68, 68, 0.2)" : "rgba(30, 41, 59, 0.9)"}
            border="1px solid"
            borderColor={isUrgent ? "#EF4444" : "rgba(255, 255, 255, 0.12)"}
            px={{ base: 3, md: 5 }}
            py={1.5}
            borderRadius="full"
            boxShadow="0 2px 10px rgba(0, 0, 0, 0.2)"
          >
            <Icon
              as={FaClock}
              color={isUrgent ? "#EF4444" : "#818CF8"}
              boxSize={4}
            />
            <Box textAlign="center">
              <Text fontSize="9px" color="#94A3B8" textTransform="uppercase" letterSpacing="0.5px">
                Time Remaining
              </Text>
              <Text
                fontSize={{ base: "15px", md: "17px" }}
                fontWeight="800"
                fontFamily="monospace"
                color={isUrgent ? "#F87171" : "white"}
                lineHeight="1.1"
              >
                {formatTime()}
              </Text>
            </Box>
          </Flex>

          {/* Right: Tools & Submit Action */}
          <HStack spacing={2}>
            {/* Calculator Toggle */}
            <Button
              size="sm"
              variant={showCalculator ? "solid" : "outline"}
              bg={showCalculator ? "#6366F1" : "transparent"}
              borderColor="rgba(255, 255, 255, 0.2)"
              color="white"
              _hover={{ bg: showCalculator ? "#4F46E5" : "rgba(255, 255, 255, 0.08)" }}
              borderRadius="lg"
              h="36px"
              fontSize="12px"
              onClick={() => setShowCalculator((prev) => !prev)}
              leftIcon={<Icon as={FaCalculator} />}
            >
              <Text display={{ base: "none", md: "inline" }}>Calculator</Text>
            </Button>

            {/* Fullscreen Toggle */}
            <Button
              size="sm"
              variant="outline"
              borderColor="rgba(255, 255, 255, 0.2)"
              color="white"
              _hover={{ bg: "rgba(255, 255, 255, 0.08)" }}
              borderRadius="lg"
              h="36px"
              fontSize="12px"
              onClick={toggleFullscreen}
              px={2.5}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              <Icon as={isFullscreen ? FaCompress : FaExpand} />
            </Button>

            {/* Submit Action */}
            <Button
              size="sm"
              bg="linear-gradient(135deg, #059669 0%, #10B981 100%)"
              color="white"
              borderRadius="lg"
              h="36px"
              px={{ base: 3, md: 4 }}
              fontWeight="700"
              fontSize="12px"
              boxShadow="0 2px 10px rgba(16, 185, 129, 0.3)"
              _hover={{
                transform: "translateY(-1px)",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
              }}
              onClick={() => setIsSubmitModalOpen(true)}
              leftIcon={<Icon as={FaCheckCircle} />}
            >
              Submit Test
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Floating Calculator Overlay */}
      {showCalculator && (
        <Calculator onClose={() => setShowCalculator(false)} />
      )}

      {/* Submit Confirmation Dialog */}
      {isSubmitModalOpen && (
        <SubmitModal onClose={() => setIsSubmitModalOpen(false)} />
      )}
    </>
  );
}
