import { Box, Flex, Text, Icon, Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaClock, FaPen, FaUser, FaCalculator } from "react-icons/fa";
import SubmitModal from "./SubmitModal";
import { useExam } from "./ExamContext";
import { toaster } from "../../../components/ui/toaster";
import Calculator from "./calculator/calculator";

export default function ExamTopBar() {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const { formatTime } = useExam();
  const [examUserDetails, setExamUserDetails] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(
    !!document.fullscreenElement
  );
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    const examUser = localStorage.getItem("examStudent");
    if (examUser) {
      setExamUserDetails(JSON.parse(examUser));
    }
  }, []);

  useEffect(() => {
    const enforceFullScreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (error) {
        console.warn("Fullscreen request failed:", error);
      }
    };

    enforceFullScreen();

    const handleFullScreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);

      if (!isFs) {
        toaster.create({
          title: "You exited fullscreen! Click the button to return.",
          type: "warning",
        });
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  return (
    <>
      <Flex
        justify="space-between"
        boxShadow={"md"}
        align="center"
        bg="white"
        p={4}
      >
        {/* left side */}
        <Box>
          <Flex gap={2}>
            <Flex gap={2} align="center">
              <Icon as={FaPen} boxSize={6} />
              <Text>EXAMINATION:</Text>
            </Flex>
            <Text>CBT TEST</Text>
          </Flex>
          <Flex gap={2}>
            <Flex gap={2} align="center">
              <Icon as={FaUser} boxSize={6} />
              <Text>CANDIDATE:</Text>
            </Flex>
            <Text>
              {examUserDetails?.firstName?.toUpperCase()}
              {""}-{examUserDetails?.lastName?.toUpperCase()}
            </Text>
          </Flex>
        </Box>

        <Flex direction="column" align="center">
          <Flex gap={2}>
            <Icon as={FaClock} boxSize={6} />
            <Text>Remaining Time</Text>
          </Flex>
          <Text color="danger" fontSize="2xl">
            {formatTime()}
          </Text>
          <Flex mt={2} gap={2}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCalculator((prev) => !prev)}
            >
              <Icon as={FaCalculator} boxSize={5} />
              <Text>Calculator</Text>
            </Button>
            <Button
              size="sm"
              bg="primary"
              onClick={() => setIsSubmitModalOpen(true)}
            >
              Submit
            </Button>
            {!isFullscreen && (
              <Button
                size="sm"
                bg="blue.600"
                onClick={async () => {
                  try {
                    await document.documentElement.requestFullscreen();
                    setIsFullscreen(true);
                  } catch (err) {
                    console.warn("Fullscreen request failed", err);
                  }
                }}
              >
                Fullscreen
              </Button>
            )}
          </Flex>
        </Flex>
      </Flex>

      {showCalculator && (
        <Calculator onClose={() => setShowCalculator(false)} />
      )}

      {isSubmitModalOpen && (
        <Flex>
          <SubmitModal onClose={() => setIsSubmitModalOpen(false)} />
        </Flex>
      )}
    </>
  );
}
