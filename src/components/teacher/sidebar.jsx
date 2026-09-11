import {
  Box,
  Flex,
  Text,
  Icon,
  Avatar,
  Badge,
} from "@chakra-ui/react";
import {
  FaBrain,
  FaTachometerAlt,
  FaPlusCircle,
  FaFileAlt,
  FaChartLine,
  FaQuestionCircle,
  FaUserPlus,
  FaUsers,
  FaUserEdit,
  FaSignOutAlt,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../../api-endpoint/auth/auths";
import { useAuth } from "../../libs/AuthProvider";

const navGroups = [
  {
    title: "OVERVIEW",
    links: [
      { name: "Dashboard", path: "/teacher_dashboard", icon: FaTachometerAlt },
    ],
  },
  {
    title: "EXAMINATIONS",
    links: [
      { name: "Create Exam", path: "/teacher/create_exam", icon: FaPlusCircle },
      { name: "All Exams", path: "/teacher/exams", icon: FaFileAlt },
      { name: "Results & Analytics", path: "/teacher/exam_result", icon: FaChartLine },
    ],
  },
  {
    title: "QUESTION BANK",
    links: [
      { name: "Add Questions", path: "/teacher/add_questions", icon: FaQuestionCircle },
    ],
  },
  {
    title: "STUDENTS",
    links: [
      { name: "Add Student", path: "/teacher/add_student", icon: FaUserPlus },
      { name: "Student Directory", path: "/teacher/view", icon: FaUsers },
      { name: "Edit Student", path: "/teacher/edit", icon: FaUserEdit },
    ],
  },
];

const Sidebar = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Backend logout failed:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("USER_KEY");
      navigate("/");
    }
  };

  const displayName = user?.name || user?.username || "Educator";
  const displayRole = user?.role ? user.role.toUpperCase() : "TEACHER";

  return (
    <Box
      as="aside"
      w="240px"
      h="100vh"
      position="fixed"
      top={0}
      left={0}
      bg="#0F172A"
      color="white"
      zIndex={30}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      borderRight="1px solid"
      borderColor="#1E293B"
      boxShadow="4px 0 24px rgba(0, 0, 0, 0.15)"
    >
      {/* Brand Header */}
      <Box p={5} borderBottom="1px solid" borderColor="#1E293B">
        <Flex align="center" gap={3} cursor="pointer" onClick={() => navigate("/teacher_dashboard")}>
          <Flex
            w="40px"
            h="40px"
            borderRadius="xl"
            bg="linear-gradient(135deg, #6A1B9A 0%, #9C27B0 100%)"
            align="center"
            justify="center"
            boxShadow="0 4px 14px rgba(106, 27, 154, 0.4)"
          >
            <Icon as={FaBrain} boxSize={5} color="white" />
          </Flex>
          <Box>
            <Flex align="center" gap={1.5}>
              <Text
                fontSize="18px"
                fontWeight="800"
                fontFamily="'Outfit', sans-serif"
                letterSpacing="-0.3px"
                lineHeight="1.1"
              >
                Ace<span style={{ color: "#C084FC" }}>Smart</span>
              </Text>
              <Badge
                bg="#3B0764"
                color="#E9D5FF"
                fontSize="9px"
                px={1.5}
                py={0.5}
                borderRadius="full"
                border="1px solid #581C87"
              >
                PRO
              </Badge>
            </Flex>
            <Text fontSize="11px" color="#94A3B8" fontWeight="500">
              Teacher Portal
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* Navigation Sections */}
      <Box
        flex={1}
        py={4}
        px={3}
        overflowY="auto"
        css={{
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { background: "#1E293B", borderRadius: "2px" },
        }}
      >
        {navGroups.map((group, gIdx) => (
          <Box key={gIdx} mb={5}>
            <Text
              fontSize="10px"
              fontWeight="800"
              color="#64748B"
              letterSpacing="1px"
              px={3}
              mb={2}
            >
              {group.title}
            </Text>
            <Flex direction="column" gap={1}>
              {group.links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === "/teacher_dashboard"}
                  style={{ textDecoration: "none" }}
                >
                  {({ isActive }) => (
                    <Flex
                      align="center"
                      gap={3}
                      px={3}
                      py={2.5}
                      borderRadius="xl"
                      cursor="pointer"
                      fontSize="13.5px"
                      fontWeight={isActive ? "700" : "500"}
                      color={isActive ? "#FFFFFF" : "#94A3B8"}
                      bg={isActive ? "linear-gradient(135deg, #6A1B9A 0%, #7E22CE 100%)" : "transparent"}
                      boxShadow={isActive ? "0 4px 14px rgba(106, 27, 154, 0.35)" : "none"}
                      _hover={{
                        color: "#FFFFFF",
                        bg: isActive ? "linear-gradient(135deg, #6A1B9A 0%, #7E22CE 100%)" : "#1E293B",
                        transform: "translateX(2px)",
                      }}
                      transition="all 0.15s ease"
                    >
                      <Icon
                        as={link.icon}
                        boxSize={4}
                        color={isActive ? "#FFFFFF" : "#94A3B8"}
                      />
                      <Text flex={1}>{link.name}</Text>
                      {isActive && (
                        <Box
                          w="6px"
                          h="6px"
                          borderRadius="full"
                          bg="#A855F7"
                          boxShadow="0 0 8px #C084FC"
                        />
                      )}
                    </Flex>
                  )}
                </NavLink>
              ))}
            </Flex>
          </Box>
        ))}
      </Box>

      {/* User Profile & Logout Footer */}
      <Box p={3} borderTop="1px solid" borderColor="#1E293B" bg="#0B1120">
        <Flex
          align="center"
          justify="space-between"
          p={2.5}
          borderRadius="xl"
          bg="#1E293B"
        >
          <Flex align="center" gap={2.5} minW={0}>
            <Avatar.Root size="sm" bg="#6A1B9A" color="white">
              <Avatar.Fallback name={displayName} />
            </Avatar.Root>
            <Box minW={0}>
              <Text
                fontSize="13px"
                fontWeight="700"
                color="white"
                isTruncated
                maxW="110px"
              >
                {displayName}
              </Text>
              <Text fontSize="10px" color="#A855F7" fontWeight="600">
                {displayRole}
              </Text>
            </Box>
          </Flex>

          <Flex
            as="button"
            align="center"
            justify="center"
            w="32px"
            h="32px"
            borderRadius="lg"
            bg="rgba(239, 68, 68, 0.12)"
            color="#EF4444"
            cursor="pointer"
            _hover={{ bg: "#EF4444", color: "white" }}
            transition="all 0.2s ease"
            onClick={handleLogout}
            title="Sign out of teacher account"
          >
            <Icon as={FaSignOutAlt} boxSize={3.5} />
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

export default Sidebar;
