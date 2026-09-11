import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Icon,
  SimpleGrid,
} from "@chakra-ui/react";
import { useState } from "react";
import ScoreModal from "./ScoreModal";
import { useExam } from "./ExamContext";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaFlag,
  FaArrowLeft,
  FaCheck,
} from "react-icons/fa";

const SubmitModal = ({ onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const { examData, answers, flaggedQuestions, submitExam } = useExam();

  const handleSubmit = () => {
    setSubmitted(true);
    submitExam();
  };

  // Total questions across sections
  const totalQuestions =
    examData?.sections?.reduce(
      (sum, section) => sum + (section.questions?.length || 0),
      0
    ) || 0;

  // Answered count
  const answeredCount = Object.keys(answers || {}).length;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  // Flagged count
  const flaggedCount = Object.values(flaggedQuestions || {}).filter(Boolean).length;

  return (
    <>
      <Box
        position="fixed"
        inset={0}
        zIndex={1000}
        bg="rgba(15, 23, 42, 0.75)"
        backdropFilter="blur(8px)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Box
          bg="#1E293B"
          borderRadius="20px"
          border="1px solid #334155"
          p={{ base: 6, sm: 7 }}
          maxW="480px"
          w="100%"
          boxShadow="0 25px 50px rgba(0, 0, 0, 0.5)"
          animation="fadeIn 0.2s ease-out"
        >
          {/* Header Icon & Title */}
          <VStack spacing={3} align="center" textAlign="center" mb={5}>
            <Flex
              w="52px"
              h="52px"
              borderRadius="16px"
              bg={unansweredCount > 0 ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)"}
              color={unansweredCount > 0 ? "#F59E0B" : "#10B981"}
              align="center"
              justify="center"
            >
              <Icon as={unansweredCount > 0 ? FaExclamationTriangle : FaCheckCircle} boxSize={6} />
            </Flex>

            <Box>
              <Text fontSize="20px" fontWeight="800" color="white" fontFamily="'Outfit', sans-serif">
                Submit Examination?
              </Text>
              <Text fontSize="13px" color="#94A3B8" mt={1}>
                Review your response summary before final assessment lock-in.
              </Text>
            </Box>
          </VStack>

          {/* Quick Stats Grid */}
          <SimpleGrid columns={3} gap={2.5} mb={5}>
            <Box
              bg="#0F172A"
              p={3}
              borderRadius="12px"
              border="1px solid #334155"
              textAlign="center"
            >
              <Text fontSize="11px" color="#94A3B8" fontWeight="medium">
                Total
              </Text>
              <Text fontSize="18px" fontWeight="800" color="white" mt={0.5}>
                {totalQuestions}
              </Text>
            </Box>

            <Box
              bg="#0F172A"
              p={3}
              borderRadius="12px"
              border="1px solid #334155"
              textAlign="center"
            >
              <Text fontSize="11px" color="#34D399" fontWeight="medium">
                Answered
              </Text>
              <Text fontSize="18px" fontWeight="800" color="#34D399" mt={0.5}>
                {answeredCount}
              </Text>
            </Box>

            <Box
              bg="#0F172A"
              p={3}
              borderRadius="12px"
              border="1px solid #334155"
              textAlign="center"
            >
              <Text fontSize="11px" color={unansweredCount > 0 ? "#F87171" : "#94A3B8"} fontWeight="medium">
                Unanswered
              </Text>
              <Text fontSize="18px" fontWeight="800" color={unansweredCount > 0 ? "#F87171" : "white"} mt={0.5}>
                {unansweredCount}
              </Text>
            </Box>
          </SimpleGrid>

          {/* Flagged notice if any */}
          {flaggedCount > 0 && (
            <Box
              bg="rgba(245, 158, 11, 0.1)"
              border="1px solid rgba(245, 158, 11, 0.25)"
              borderRadius="12px"
              p={3}
              mb={4}
            >
              <HStack spacing={2}>
                <Icon as={FaFlag} color="#F59E0B" boxSize={3.5} />
                <Text fontSize="12px" color="#FDE68A">
                  You have <b>{flaggedCount}</b> questions marked for review.
                </Text>
              </HStack>
            </Box>
          )}

          {/* Final Notice */}
          <Box
            bg="#0F172A"
            borderRadius="12px"
            border="1px solid #334155"
            p={3}
            mb={5}
          >
            <Text fontSize="11px" color="#94A3B8" lineHeight="1.4" textAlign="center">
              Once submitted, your responses are securely transmitted to the grading server and cannot be edited.
            </Text>
          </Box>

          {/* Action Buttons */}
          <Flex gap={3}>
            <Button
              flex={1}
              size="md"
              variant="outline"
              borderColor="#334155"
              color="#CBD5E1"
              _hover={{ bg: "#0F172A", color: "white" }}
              borderRadius="12px"
              fontSize="13px"
              fontWeight="bold"
              onClick={onClose}
              leftIcon={<Icon as={FaArrowLeft} />}
            >
              Review Questions
            </Button>

            <Button
              flex={1}
              size="md"
              bg="#059669"
              color="white"
              _hover={{ bg: "#047857" }}
              borderRadius="12px"
              fontSize="13px"
              fontWeight="bold"
              onClick={handleSubmit}
              rightIcon={<Icon as={FaCheck} />}
            >
              Yes, Submit Exam
            </Button>
          </Flex>
        </Box>
      </Box>

      {submitted && <ScoreModal onClose={() => setSubmitted(false)} />}
    </>
  );
};

export default SubmitModal;
