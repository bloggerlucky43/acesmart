import { Box, Flex, Text, Icon, Collapsible, VStack } from "@chakra-ui/react";
import { useState } from "react";
import {
  FaBrain,
  FaAngleDown,
  FaTachometerAlt,
  FaUserPlus,
  FaUserEdit,
  FaUsers,
  FaCog,
  FaSchool,
  FaBook,
  FaPlusSquare,
  FaFileImport,
  FaEdit,
  FaClipboardList,
  FaFileAlt,
  FaChartBar,
  FaPoll,
  FaFileExport,
  FaChartLine,
  FaCogs,
  FaAngleUp,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };
  return (
    <Box
      bg="gray.200"
      p={2}
      position="fixed"
      minH="100vh"
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

        <Collapsible.Root open={openSection === "school"}>
          <Collapsible.Trigger onClick={() => toggleSection("school")}>
            <Flex align="center" justify="space-between" py={2} w="100%">
              <Flex align="center" gap={2}>
                <Icon as={FaSchool} boxSize={4} />
                <Text> School Management</Text>
              </Flex>
              <Icon as={openSection === "school" ? FaAngleUp : FaAngleDown} />
            </Flex>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <VStack align="start" pl={6} mt={2} spacing={2}>
              <NavLink
                to="/teacher/add_student"
                style={{ textDecoration: "none" }}
              >
                {({ isActive }) => (
                  <Flex
                    gap={2}
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

              <NavLink
                to="/teacher/student_settings"
                style={{ textDecoration: "none" }}
              >
                {({ isActive }) => (
                  <Flex
                    gap={2}
                    align="center"
                    cursor="pointer"
                    color={isActive ? "primary" : "black"}
                    _hover={{ color: "purple.400" }}
                  >
                    <Icon as={FaCog} boxSize={4} />
                    <Text>Settings</Text>
                  </Flex>
                )}
              </NavLink>
            </VStack>
          </Collapsible.Content>
        </Collapsible.Root>

        <Collapsible.Root open={openSection === "questions"}>
          <Collapsible.Trigger onClick={() => toggleSection("questions")}>
            <Flex align="center" justify="space-between" py={2} w="100%">
              <Flex align="center" gap={2}>
                <Icon as={FaBook} boxSize={4} />
                <Text> Question Bank</Text>
              </Flex>
              <Icon
                as={openSection === "questions" ? FaAngleUp : FaAngleDown}
                boxSize={4}
              />
            </Flex>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <VStack align="start" pl={6} mt={2} spacing={2}>
              <NavLink to="/teacher/edit" style={{ textDecoration: "none" }}>
                {({ isActive }) => (
                  <Flex
                    gap={2}
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

              <NavLink to="/teacher/edit" style={{ textDecoration: "none" }}>
                {({ isActive }) => (
                  <Flex
                    gap={2}
                    align="center"
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
            </VStack>
          </Collapsible.Content>
        </Collapsible.Root>

        <Collapsible.Root open={openSection === "exam"}>
          <Collapsible.Trigger onClick={() => toggleSection("exam")}>
            <Flex align="center" justify="space-between" py={2} w="100%">
              <Flex align="center" gap={2}>
                <Icon as={FaClipboardList} boxSize={4} />
                <Text> Exam Management</Text>
              </Flex>
              <Icon
                as={openSection === "exam" ? FaAngleUp : FaAngleDown}
                boxSize={4}
              />
            </Flex>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <VStack align="start" pl={6} mt={2} spacing={2}>
              <NavLink to="/teacher/edit" style={{ textDecoration: "none" }}>
                {({ isActive }) => (
                  <Flex
                    gap={2}
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

              <NavLink to="/teacher/edit" style={{ textDecoration: "none" }}>
                {({ isActive }) => (
                  <Flex
                    gap={2}
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

              <NavLink to="/teacher/edit" style={{ textDecoration: "none" }}>
                {({ isActive }) => (
                  <Flex
                    gap={2}
                    align="center"
                    cursor="pointer"
                    color={isActive ? "primary" : "black"}
                    _hover={{ color: "purple.400" }}
                  >
                    <Icon as={FaCog} boxSize={4} /> <Text>Exam settings</Text>
                  </Flex>
                )}
              </NavLink>
            </VStack>
          </Collapsible.Content>
        </Collapsible.Root>

        <Collapsible.Root open={openSection === "results"}>
          <Collapsible.Trigger onClick={() => toggleSection("results")}>
            <Flex align="center" justify="space-between" py={2} w="100%">
              <Flex align="center" gap={2}>
                <Icon as={FaChartBar} boxSize={4} />
                <Text> Results & Reports</Text>
              </Flex>
              <Icon as={openSection === "results" ? FaAngleUp : FaAngleDown} />
            </Flex>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <VStack align="start" pl={6} mt={2} spacing={2}>
              <NavLink to="/teacher/edit" style={{ textDecoration: "none" }}>
                {({ isActive }) => (
                  <Flex
                    gap={2}
                    align="center"
                    cursor="pointer"
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
                    cursor="pointer"
                    color={isActive ? "primary" : "black"}
                    _hover={{ color: "purple.400" }}
                  >
                    <Icon as={FaChartLine} boxSize={4} />
                    <Text>Student Performance</Text>
                  </Flex>
                )}
              </NavLink>
            </VStack>
          </Collapsible.Content>
        </Collapsible.Root>

        <NavLink to="/teacher/edit" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              gap={2}
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
