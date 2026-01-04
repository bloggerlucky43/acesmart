import { Box, Text, Flex, Icon } from "@chakra-ui/react";
import {
  FaBrain,
  FaTachometerAlt,
  FaUserPlus,
  FaUserEdit,
  FaPlusSquare,
  FaEdit,
  FaFileAlt,
  FaChartLine,
  FaTimes,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

const MobileSideBar = ({ onClose }) => {
  return (
    <Box
      minH="100vh"
      zIndex={10}
      top={0}
      w="80%"
      position="fixed"
      bg="gray.200"
    >
      <Flex justify="end" p={2}>
        <Icon as={FaTimes} boxSize={6} color="gray.800" onClick={onClose} />
      </Flex>
      <Flex gap={2} align="center" p={4}>
        <Icon
          as={FaBrain}
          bg="primary"
          borderRadius="md"
          color="white"
          boxSize={12}
          p={2}
        />
        <Text fontSize="xl">
          Ace<span style={{ color: "#6A1B9A" }}>Smart</span>
        </Text>
      </Flex>

      <Flex direction="column" mt={4} p={4}>
        <NavLink to="/teacher_dashboard" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              align="center"
              cursor="pointer"
              mb={2}
              color={isActive ? "primary" : "black"}
            >
              <Icon as={FaTachometerAlt} boxSize={5} />
              <Text>Dashboard</Text>
            </Flex>
          )}
        </NavLink>

        <NavLink to="/teacher/add_student" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              align="center"
              cursor="pointer"
              mb={2}
              color={isActive ? "primary" : "black"}
              _hover={{ color: "purple.400" }}
            >
              <Icon as={FaUserPlus} boxSize={5} />
              <Text>Add Students</Text>
            </Flex>
          )}
        </NavLink>

        <NavLink to="/teacher/edit" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              align="center"
              cursor="pointer"
              mb={2}
              color={isActive ? "primary" : "black"}
              _hover={{ color: "purple.400" }}
            >
              <Icon as={FaUserEdit} boxSize={5} />
              <Text>View Student</Text>
            </Flex>
          )}
        </NavLink>

        {/* <NavLink to="/teacher/add_questions" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              align="center"
              cursor="pointer"
              mb={2}
              color={isActive ? "primary" : "black"}
              _hover={{ color: "purple.400" }}
            >
              <Icon as={FaPlusSquare} boxSize={5} />
              <Text>Add Questions</Text>
            </Flex>
          )}
        </NavLink> */}

        <NavLink to="/teacher/create_exam" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              align="center"
              cursor="pointer"
              mb={2}
              color={isActive ? "primary" : "black"}
              _hover={{ color: "purple.400" }}
            >
              <Icon as={FaFileAlt} boxSize={5} />
              <Text>Create new exams</Text>
            </Flex>
          )}
        </NavLink>

        <NavLink to="/teacher/exams" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              align="center"
              cursor="pointer"
              mb={2}
              color={isActive ? "primary" : "black"}
              _hover={{ color: "purple.400" }}
            >
              <Icon as={FaFileAlt} boxSize={5} />
              <Text>All exams</Text>
            </Flex>
          )}
        </NavLink>

        {/* <NavLink to="/teacher/edit" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              align="center"
              cursor="pointer"
              mb={2}
              color={isActive ? "primary" : "black"}
              _hover={{ color: "purple.400" }}
            >
              <Icon as={FaPoll} boxSize={5} />
              <Text>View exam results</Text>
            </Flex>
          )}
        </NavLink> */}

        <NavLink to="/teacher/exam_result" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              align="center"
              cursor="pointer"
              mb={2}
              color={isActive ? "primary" : "black"}
              _hover={{ color: "purple.400" }}
            >
              <Icon as={FaChartLine} boxSize={5} />
              <Text>Performance</Text>
            </Flex>
          )}
        </NavLink>
      </Flex>
    </Box>
  );
};

export default MobileSideBar;
