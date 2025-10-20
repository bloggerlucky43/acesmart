import { Box, Flex, Text, Icon, Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaClock, FaPen, FaUser } from "react-icons/fa";
import SubmitModal from "./SubmitModal";
import { useExam } from "./ExamContext";

export default function ExamTopBar() {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const { formatTime } = useExam();

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
              <Text>Examination:</Text>
            </Flex>
            <Text>JAMB CBT TEST</Text>
          </Flex>
          <Flex gap={2}>
            <Flex gap={2} align="center">
              <Icon as={FaUser} boxSize={6} />
              <Text>Candidate:</Text>
            </Flex>
            <Text>4757584848G- Feranmi Ayoola Jegede</Text>
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
            <Button size="sm" variant="outline">
              Instructions
            </Button>
            <Button
              size="sm"
              bg="primary"
              onClick={() => setIsSubmitModalOpen(true)}
            >
              Submit
            </Button>
          </Flex>
        </Flex>
      </Flex>

      {isSubmitModalOpen && (
        <Flex>
          <SubmitModal onClose={() => setIsSubmitModalOpen(false)} />
        </Flex>
      )}
    </>
  );
}
