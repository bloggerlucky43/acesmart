import { Box, Flex, Text, SimpleGrid, Icon } from "@chakra-ui/react";
import {
  FaUsers,
  FaBook,
  FaChartBar,
  FaTrophy,
  FaPlusSquare,
} from "react-icons/fa";
const MCards = () => {
  return (
    <Box
      p={4}
      justifySelf="center"
      bg="gray.100"
      borderRadius="lg"
      mt="6vh"
      w="90%"
      overflow="hidden"
    >
      <SimpleGrid columns={[1, 2, 3, 4]} gap={8}>
        <Box
          as="button"
          boxShadow="lg"
          borderRadius="md"
          p={4}
          mt={4}
          bg="purple.300"
          align="center"
          _hover={{
            transform: "scale(1.05)",
            boxShadow: "md",
            borderRadius: "md",
          }}
        >
          <Icon as={FaUsers} boxSize={8} color="purple.900" />
          <Text mt={4}>Total Students</Text>
          <Text mt={2}>90</Text>
        </Box>
        <Box
          as="button"
          bg="green.300"
          justify="center"
          boxShadow="md"
          borderRadius="md"
          p={4}
          _hover={{
            transform: "scale(1.05)",
            boxShadow: "xl",
            borderRadius: "md",
          }}
        >
          <Icon as={FaBook} boxSize={8} color="green.900" />
          <Text mt={4}>Questions Uploaded</Text>
          <Text mt={2}>240</Text>
        </Box>
        <Box
          as="button"
          bg="pink.300"
          justify="center"
          boxShadow="md"
          borderRadius="md"
          p={4}
          _hover={{
            transform: "scale(1.05)",
            boxShadow: "xl",
            borderRadius: "md",
          }}
        >
          <Icon as={FaChartBar} boxSize={8} color="pink.900" />
          <Text mt={4}>Tests Conducted</Text>
          <Text mt={2}>4</Text>
        </Box>
        <Box
          as="button"
          bg="energy"
          justify="center"
          boxShadow="md"
          borderRadius="md"
          _hover={{
            transform: "scale(1.05)",
            boxShadow: "xl",
            borderRadius: "md",
          }}
          p={4}
        >
          <Icon as={FaTrophy} boxSize={8} />
          <Text mt={4}>Average Pass Rate</Text>
          <Text mt={2}>4</Text>
        </Box>
        <Box
          as="button"
          bg="green.300"
          justify="center"
          boxShadow="md"
          borderRadius="md"
          _hover={{
            transform: "scale(1.05)",
            boxShadow: "xl",
            borderRadius: "md",
          }}
          p={4}
        >
          <Icon as={FaPlusSquare} boxSize={8} color="green.900" />
          <Text mt={4}>Add Exam</Text>
        </Box>

        <Box
          as="button"
          bg="purple.300"
          justify="center"
          boxShadow="md"
          borderRadius="md"
          _hover={{
            transform: "scale(1.05)",
            boxShadow: "xl",
            borderRadius: "md",
          }}
          p={4}
        >
          <Icon as={FaChartBar} boxSize={8} color="purple.900" />
          <Text mt={4}>View Results</Text>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default MCards;
