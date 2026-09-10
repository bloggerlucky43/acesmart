import { Box, Text, SimpleGrid, Flex, Icon } from "@chakra-ui/react";
import {
  FaBookOpen,
  FaUserGraduate,
  FaSchool,
  FaBolt,
} from "react-icons/fa";

const stats = [
  {
    icon: FaBookOpen,
    value: "50,000+",
    label: "Questions in Bank",
    detail: "JAMB, WAEC, NECO & Custom School Curricula",
    color: "#6A1B9A",
    bg: "purple.50",
  },
  {
    icon: FaUserGraduate,
    value: "10,000+",
    label: "Active Students",
    detail: "Trained under real timed CBT conditions",
    color: "#10B981",
    bg: "green.50",
  },
  {
    icon: FaSchool,
    value: "120+",
    label: "Schools & Academies",
    detail: "Conducting continuous assessments effortlessly",
    color: "#3B82F6",
    bg: "blue.50",
  },
  {
    icon: FaBolt,
    value: "< 1 Sec",
    label: "Instant Auto-Grading",
    detail: "Zero manual marking with automated score sheets",
    color: "#F59E0B",
    bg: "orange.50",
  },
];

const Numbers = ({ numberRef }) => {
  return (
    <Box
      ref={numberRef}
      py={16}
      bg="white"
      borderTop="1px solid"
      borderBottom="1px solid"
      borderColor="gray.100"
    >
      <Box maxW="1320px" mx="auto" px={{ base: 4, md: 8 }}>
        <Box textAlign="center" maxW="700px" mx="auto" mb={12}>
          <Text
            fontSize="12px"
            fontWeight="800"
            color="#6A1B9A"
            letterSpacing="1px"
            textTransform="uppercase"
            mb={2}
          >
            Proven Track Record
          </Text>
          <Text
            fontSize={{ base: "26px", md: "36px" }}
            fontWeight="800"
            color="gray.900"
            fontFamily="'Outfit', sans-serif"
            letterSpacing="-0.5px"
          >
            The Numbers Behind Our Examination Excellence
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={6}>
          {stats.map((item, idx) => (
            <Box
              key={idx}
              p={7}
              bg="white"
              borderRadius="2xl"
              border="1px solid"
              borderColor="gray.200"
              boxShadow="0 4px 16px rgba(0,0,0,0.03)"
              _hover={{
                transform: "translateY(-6px)",
                boxShadow: "0 16px 32px rgba(106, 27, 154, 0.08)",
                borderColor: item.color,
              }}
              transition="all 0.25s ease"
            >
              <Flex
                w="52px"
                h="52px"
                borderRadius="xl"
                bg={item.bg}
                color={item.color}
                align="center"
                justify="center"
                mb={5}
              >
                <Icon as={item.icon} boxSize={6} />
              </Flex>
              <Text
                fontSize="36px"
                fontWeight="800"
                color="gray.900"
                lineHeight="1.1"
                fontFamily="'Outfit', sans-serif"
                mb={1}
              >
                {item.value}
              </Text>
              <Text fontSize="16px" fontWeight="700" color="gray.800" mb={1}>
                {item.label}
              </Text>
              <Text fontSize="13px" color="gray.500" lineHeight="1.5">
                {item.detail}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default Numbers;
