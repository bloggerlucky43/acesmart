import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  Textarea,
  Button,
  Icon,
  HStack,
  Badge,
} from "@chakra-ui/react";
import {
  FaStar,
  FaTimes,
  FaPaperPlane,
  FaCommentDots,
  FaCheckCircle,
} from "react-icons/fa";
import { submitFeedbackApi } from "../../api-endpoint/feedback/feedbackEndpoints";
import { useAuth } from "../../libs/AuthProvider";

const CATEGORIES = [
  "General Feedback",
  "Bug Report",
  "Feature Request",
  "Question Bank / Content",
  "Exam / CBT Issue",
];

export default function FeedbackModal({ isOpen, onClose, studentId = null }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("General Feedback");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    const res = await submitFeedbackApi({
      rating,
      category,
      subject: subject.trim(),
      message: message.trim(),
      studentId: studentId || null,
      name: user?.name,
      email: user?.email,
      role: user?.role || (studentId ? "student" : "guest"),
    });

    setSubmitting(false);
    if (res?.success) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSubject("");
        setMessage("");
        setRating(5);
        onClose();
      }, 1800);
    }
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      bg="rgba(15, 23, 42, 0.65)"
      backdropFilter="blur(6px)"
      zIndex={9999}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        bg="white"
        w="100%"
        maxW="520px"
        borderRadius="28px"
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        overflow="hidden"
        border="1px solid #E2E8F0"
        animation="fadeIn 0.2s ease-out"
      >
        {/* Header */}
        <Flex
          bg="linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)"
          color="white"
          p={6}
          align="center"
          justify="space-between"
        >
          <Flex align="center" gap={3}>
            <Flex
              w="40px"
              h="40px"
              borderRadius="xl"
              bg="rgba(255, 255, 255, 0.15)"
              align="center"
              justify="center"
            >
              <Icon as={FaCommentDots} boxSize={5} color="#A5B4FC" />
            </Flex>
            <Box>
              <Text fontSize="18px" fontWeight="900" letterSpacing="-0.3px">
                Share Your Feedback
              </Text>
              <Text fontSize="12px" color="#C7D2FE">
                Help us make AceSmart better for your institution
              </Text>
            </Box>
          </Flex>

          <Button
            size="sm"
            variant="ghost"
            color="white"
            borderRadius="full"
            p={1}
            minW="32px"
            h="32px"
            _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
            onClick={onClose}
          >
            <Icon as={FaTimes} boxSize={4} />
          </Button>
        </Flex>

        {submitted ? (
          <Box p={8} textAlign="center">
            <Flex
              w="64px"
              h="64px"
              borderRadius="full"
              bg="#ECFDF5"
              color="#059669"
              align="center"
              justify="center"
              mx="auto"
              mb={4}
            >
              <Icon as={FaCheckCircle} boxSize={8} />
            </Flex>
            <Text fontSize="18px" fontWeight="800" color="#0F172A" mb={1}>
              Thank You!
            </Text>
            <Text fontSize="13px" color="#64748B">
              Your feedback has been logged. Our development & academic teams review every note.
            </Text>
          </Box>
        ) : (
          <Box as="form" onSubmit={handleSubmit} p={6}>
            {/* Rating Stars */}
            <Box mb={5} textAlign="center">
              <Text fontSize="12px" fontWeight="700" color="#475569" mb={2}>
                HOW WOULD YOU RATE YOUR EXPERIENCE?
              </Text>
              <HStack justify="center" gap={2}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = (hoverRating || rating) >= star;
                  return (
                    <Box
                      key={star}
                      as="button"
                      type="button"
                      cursor="pointer"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      transition="transform 0.15s ease"
                      _hover={{ transform: "scale(1.2)" }}
                    >
                      <Icon
                        as={FaStar}
                        boxSize={6}
                        color={filled ? "#F59E0B" : "#E2E8F0"}
                      />
                    </Box>
                  );
                })}
              </HStack>
            </Box>

            {/* Category Selector Pills */}
            <Box mb={4}>
              <Text fontSize="12px" fontWeight="700" color="#334155" mb={2}>
                CATEGORY
              </Text>
              <Flex wrap="wrap" gap={1.5}>
                {CATEGORIES.map((cat) => {
                  const selected = category === cat;
                  return (
                    <Badge
                      key={cat}
                      as="button"
                      type="button"
                      px={3}
                      py={1.5}
                      borderRadius="full"
                      fontSize="11px"
                      fontWeight="700"
                      cursor="pointer"
                      bg={selected ? "#4338CA" : "#F1F5F9"}
                      color={selected ? "white" : "#475569"}
                      border="1px solid"
                      borderColor={selected ? "#4338CA" : "#E2E8F0"}
                      onClick={() => setCategory(cat)}
                      _hover={{ bg: selected ? "#4338CA" : "#E2E8F0" }}
                      transition="all 0.15s ease"
                    >
                      {cat}
                    </Badge>
                  );
                })}
              </Flex>
            </Box>

            {/* Subject Input */}
            <Box mb={4}>
              <Text fontSize="12px" fontWeight="700" color="#334155" mb={1.5}>
                SUBJECT / SUMMARY *
              </Text>
              <Input
                placeholder="e.g. Issue generating question explanations..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                borderRadius="xl"
                h="42px"
                fontSize="13px"
                fontWeight="600"
                borderColor="#CBD5E1"
                _focus={{ borderColor: "#4338CA" }}
              />
            </Box>

            {/* Detailed Message */}
            <Box mb={5}>
              <Text fontSize="12px" fontWeight="700" color="#334155" mb={1.5}>
                WHAT CAN WE IMPROVE OR FIX? *
              </Text>
              <Textarea
                rows={4}
                placeholder="Please describe in detail what happened, what you liked, or what you would love to see added..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                borderRadius="xl"
                fontSize="13px"
                borderColor="#CBD5E1"
                _focus={{ borderColor: "#4338CA" }}
              />
            </Box>

            {/* Submit Button */}
            <Flex justify="flex-end" gap={2}>
              <Button
                variant="outline"
                borderRadius="xl"
                h="40px"
                fontSize="13px"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                bg="#4338CA"
                color="white"
                borderRadius="xl"
                h="40px"
                px={5}
                fontSize="13px"
                fontWeight="700"
                loading={submitting}
                loadingText="Sending..."
                _hover={{ bg: "#3730A3" }}
              >
                <Icon as={FaPaperPlane} mr={2} boxSize={3.5} />
                Send Feedback
              </Button>
            </Flex>
          </Box>
        )}
      </Box>
    </Box>
  );
}
