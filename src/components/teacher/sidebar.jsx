import { Box, Flex, Text, Icon, Collapsible, VStack } from "@chakra-ui/react";
import { useState } from "react";
import {
  FaBrain,
  FaTachometerAlt,
  FaUserPlus,
  FaUserEdit,
  FaUsers,
  FaCog,
  FaPlusSquare,
  FaFileImport,
  FaEdit,
  FaFileAlt,
  FaPoll,
  FaFileExport,
  FaChartLine,
  FaCogs,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <Box
      bg="gray.200"
      p={2}
      position="fixed"
      h="100vh"
      top={0}
      left={0}
      borderRight="solid 2px"
      borderColor="primary"
      w="20%"
    >
      <Flex gap={2} align="center" justify="center" mt={2}>
        <Icon
          as={FaBrain}
          boxSize={10}
          color="white"
          p={2}
          bg="primary"
          borderRadius="md"
        />
        <Text fontSize="2xl">
          Ace<span style={{ color: "#6A1B9A" }}>Smart</span>
        </Text>
      </Flex>

      <Box mt={8} p={4}>
        <NavLink to="/teacher_dashboard" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              align="center"
              cursor="pointer"
              color={isActive ? "primary" : "black"}
              _hover={{ color: "purple.400" }}
            >
              <Icon as={FaTachometerAlt} boxSize={4} />
              <Text>Dashboard</Text>
            </Flex>
          )}
        </NavLink>

        <NavLink to="/teacher/add_student" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              mt={2}
              align="center"
              cursor="pointer"
              color={isActive ? "primary" : "black"}
              _hover={{ color: "purple.400" }}
            >
              <Icon as={FaUserPlus} boxSize={4} />
              <Text>Add Students</Text>
            </Flex>
          )}
        </NavLink>

        <NavLink to="/teacher/edit" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              mt={2}
              align="center"
              cursor="pointer"
              color={isActive ? "primary" : "black"}
              _hover={{ color: "purple.400" }}
            >
              <Icon as={FaUserEdit} boxSize={4} />
              <Text>Edit Student</Text>
            </Flex>
          )}
        </NavLink>

        <NavLink to="/teacher/view" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              mt={2}
              align="center"
              cursor="pointer"
              color={isActive ? "primary" : "black"}
              _hover={{ color: "purple.400" }}
            >
              <Icon as={FaUsers} boxSize={4} />
              <Text>View Students</Text>
            </Flex>
          )}
        </NavLink>
        <NavLink to="/teacher/add_questions" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              mt={2}
              align="center"
              cursor="pointer"
              color={isActive ? "primary" : "black"}
              _hover={{ color: "purple.400" }}
            >
              <Icon as={FaPlusSquare} boxSize={4} />
              <Text>Add Questions</Text>
            </Flex>
          )}
        </NavLink>

        <NavLink to="/teacher/ed" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              align="center"
              mt={2}
              cursor="pointer"
              color={isActive ? "primary" : "black"}
              _hover={{ color: "purple.400" }}
            >
              <Icon as={FaFileImport} boxSize={4} />
              <Text>Import questions from Excel/CSV</Text>
            </Flex>
          )}
        </NavLink>

        <NavLink to="/teacher/edit" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              mt={2}
              align="center"
              cursor="pointer"
              color={isActive ? "primary" : "black"}
              _hover={{ color: "purple.400" }}
            >
              <Icon as={FaEdit} boxSize={4} />
              <Text>Preview and edit questions</Text>
            </Flex>
          )}
        </NavLink>

        <NavLink to="/teacher/create_exam" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              mt={2}
              align="center"
              cursor="pointer"
              color={isActive ? "primary" : "black"}
              _hover={{ color: "purple.400" }}
            >
              <Icon as={FaFileAlt} boxSize={4} />
              <Text>Create new exams</Text>
            </Flex>
          )}
        </NavLink>

        <NavLink to="/teacher/exams" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              mt={2}
              align="center"
              cursor="pointer"
              color={isActive ? "primary" : "black"}
              _hover={{ color: "purple.400" }}
            >
              <Icon as={FaFileAlt} boxSize={4} />
              <Text>All exams</Text>
            </Flex>
          )}
        </NavLink>

        <NavLink to="/teacher/edit" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              align="center"
              mt={2}
              cursor="pointer"
              color={isActive ? "primary" : "black"}
              _hover={{ color: "purple.400" }}
            >
              <Icon as={FaCog} boxSize={4} /> <Text>Exam settings</Text>
            </Flex>
          )}
        </NavLink>

        <NavLink to="/teacher/edit" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              align="center"
              cursor="pointer"
              mt={2}
              color={isActive ? "primary" : "black"}
              _hover={{ color: "purple.400" }}
            >
              <Icon as={FaPoll} boxSize={4} />
              <Text>View exam results</Text>
            </Flex>
          )}
        </NavLink>

        <NavLink to="/teacher/edit" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              mt={2}
              align="center"
              cursor="pointer"
              color={isActive ? "primary" : "black"}
              _hover={{ color: "purple.400" }}
            >
              <Icon as={FaFileExport} boxSize={4} />
              <Text>Export results</Text>
            </Flex>
          )}
        </NavLink>

        <NavLink to="/teacher/edit" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              align="center"
              mt={2}
              cursor="pointer"
              color={isActive ? "primary" : "black"}
              _hover={{ color: "purple.400" }}
            >
              <Icon as={FaChartLine} boxSize={4} />
              <Text>Student Performance</Text>
            </Flex>
          )}
        </NavLink>

        <NavLink to="/teacher/edit" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
              mt={2}
              align="center"
              cursor="pointer"
              color={isActive ? "primary" : "black"}
              _hover={{ color: "purple.400" }}
            >
              <Icon as={FaCogs} boxSize={4} />
              <Text>Settings</Text>
            </Flex>
          )}
        </NavLink>
      </Box>
    </Box>
  );
};

export default Sidebar;
