import { Box, Text, Flex, Icon, SimpleGrid } from "@chakra-ui/react";
import { FaGamepad, FaQuestion } from "react-icons/fa";
import { FiBarChart2 } from "react-icons/fi";
import { BiGroup } from "react-icons/bi";
import { RiBookOpenLine } from "react-icons/ri";
import { MdOutlineSchool, MdSecurity } from "react-icons/md";

const Features = ({ aboutRef }) => {
  return (
    <Box bg="off" p={2} ref={aboutRef}>
      <Text mt={8} color="primary" textAlign="center" fontSize="lg" mb={4}>
        Why Choose Us?
      </Text>
      <Text textAlign="center" fontSize="x-large" mb={8}>
        Empowering Students & Institutions with Smart Learning Tools
      </Text>
      <SimpleGrid columns={[1, 2, 3]} gap={6}>
        <Box
          bg="off"
          p={6}
          boxShadow="lg"
          borderRadius="lg"
          _hover={{ boxShadow: "2xl", transform: "translateY(-10px)" }}
        >
          <Icon
            as={FaQuestion}
            boxSize={14}
            borderRadius="md"
            p={4}
            color="contrast"
            bg="purple.300"
          />
          <Text mt={8} fontSize="xl" fontWeight="bold">
            Extensive Question Bank
          </Text>
          <Text>Access past exam questions by subject and year</Text>
        </Box>
        <Box
          bg="off"
          p={6}
          boxShadow="lg"
          borderRadius="lg"
          _hover={{ boxShadow: "2xl", transform: "translateY(-10px)" }}
        >
          <Icon
            as={MdOutlineSchool}
            boxSize={14}
            borderRadius="md"
            p={4}
            color="cyan.900"
            bg="cyan.300"
          />
          <Text mt={8} fontSize="xl" fontWeight="bold">
            Personalized Learning Paths
          </Text>
          <Text>
            Track progress, set study goals, and access tailored learning
            resources to improve academic performance
          </Text>
        </Box>
        <Box
          bg="off"
          p={6}
          boxShadow="lg"
          borderRadius="lg"
          _hover={{ boxShadow: "2xl", transform: "translateY(-10px)" }}
        >
          <Icon
            as={RiBookOpenLine}
            boxSize={14}
            borderRadius="md"
            p={4}
            color="green"
            bg="green.200"
          />
          <Text mt={8} fontSize="xl" fontWeight="bold">
            Exam Preparation Tools
          </Text>
          <Text>
            Practice past questions, track GPA, and receive instant feedback to
            stay exam-ready.
          </Text>
        </Box>

        <Box
          bg="off"
          p={6}
          boxShadow="lg"
          borderRadius="lg"
          _hover={{ boxShadow: "2xl", transform: "translateY(-10px)" }}
        >
          <Icon
            as={FiBarChart2}
            boxSize={14}
            borderRadius="md"
            p={4}
            color="red"
            bg="red.200"
          />
          <Text mt={8} fontSize="xl" fontWeight="bold">
            Analytics & Insights
          </Text>
          <Text>
            Track academic performance trends across departments and make
            data-driven decisions.
          </Text>
        </Box>
        <Box
          bg="off"
          p={6}
          boxShadow="lg"
          borderRadius="lg"
          _hover={{ boxShadow: "2xl", transform: "translateY(-10px)" }}
        >
          <Icon
            as={BiGroup}
            boxSize={14}
            borderRadius="md"
            p={4}
            color="pink.900"
            bg="pink.200"
          />
          <Text mt={8} fontSize="xl" fontWeight="bold">
            Collaboration Hub
          </Text>
          <Text>
            Connect students, teachers, and administrators with a unified
            communication platform.
          </Text>
        </Box>
        <Box
          bg="off"
          p={6}
          boxShadow="lg"
          borderRadius="lg"
          _hover={{ boxShadow: "2xl", transform: "translateY(-10px)" }}
        >
          <Icon
            as={MdSecurity}
            boxSize={14}
            borderRadius="md"
            p={4}
            color="orange.900"
            bg="orange.200"
          />
          <Text mt={8} fontSize="xl" fontWeight="bold">
            Secure & Scalable Platform
          </Text>
          <Text>
            Built with modern security protocols to ensure student data privacy
            and scalability for growth.
          </Text>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default Features;
