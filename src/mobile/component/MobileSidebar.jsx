import { Box, Text, Flex, Icon, Badge } from "@chakra-ui/react";
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
  FaTimes,
  FaSignOutAlt,
  FaCreditCard,
  FaQrcode,
  FaCalendarCheck,
  FaGraduationCap,
  FaMoneyBillWave,
  FaUniversity,
  FaCog,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../libs/AuthProvider";

const navGroups = [
  {
    title: "OVERVIEW",
    links: [
      { name: "CBT Dashboard", path: "/teacher_dashboard", icon: FaTachometerAlt },
    ],
  },
  {
    title: "INSTITUTION SUITE (ERP)",
    links: [
      { name: "School Overview", path: "/institution/dashboard", icon: FaUniversity },
      { name: "Faculty Directory", path: "/institution/staff", icon: FaUsers },
      { name: "Staff Attendance QR", path: "/institution/staff-qr", icon: FaQrcode },
      { name: "Debtor Defaulters", path: "/institution/debtors", icon: FaMoneyBillWave },
      { name: "School Settings", path: "/institution/settings", icon: FaCog },
    ],
  },
  {
    title: "SCHOOL MANAGEMENT (SMS)",
    links: [
      { name: "Staff Clock-In (QR)", path: "/teacher/scan-clockin", icon: FaQrcode },
      { name: "Student Attendance", path: "/teacher/attendance", icon: FaCalendarCheck },
      { name: "Report Cards & Broadsheets", path: "/teacher/report-cards", icon: FaGraduationCap },
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
      { name: "Question Bank & OCR", path: "/teacher/add_questions", icon: FaQuestionCircle },
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
  {
    title: "SUBSCRIPTION & BILLING",
    links: [
      { name: "Billing & Plans", path: "/teacher/billing", icon: FaCreditCard },
    ],
  },
];

const MobileSideBar = ({ onClose }) => {
  const { logout } = useAuth();

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={150}
      bg="rgba(15, 23, 42, 0.65)"
      backdropFilter="blur(6px)"
      onClick={onClose}
    >
      <Box
        position="fixed"
        top={0}
        left={0}
        w={{ base: "82%", sm: "300px" }}
        h="100vh"
        bg="#0F172A"
        color="white"
        p={5}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        onClick={(e) => e.stopPropagation()}
        boxShadow="4px 0 24px rgba(0, 0, 0, 0.3)"
      >
        <Box>
          {/* Header */}
          <Flex justify="space-between" align="center" pb={4} borderBottom="1px solid #1E293B" mb={4}>
            <Flex align="center" gap={2.5}>
              <Flex
                w="36px"
                h="36px"
                borderRadius="xl"
                bg="#6A1B9A"
                align="center"
                justify="center"
              >
                <Icon as={FaBrain} boxSize={4} color="white" />
              </Flex>
              <Text fontSize="17px" fontWeight="800" fontFamily="'Outfit', sans-serif">
                Ace<span style={{ color: "#C084FC" }}>Smart</span>
              </Text>
            </Flex>

            <Flex
              as="button"
              p={1.5}
              borderRadius="lg"
              bg="#1E293B"
              color="#94A3B8"
              _hover={{ color: "white" }}
              onClick={onClose}
            >
              <Icon as={FaTimes} boxSize={4} />
            </Flex>
          </Flex>

          {/* Navigation Links */}
          <Box maxH="calc(100vh - 160px)" overflowY="auto">
            {navGroups.map((group, gIdx) => (
              <Box key={gIdx} mb={4}>
                <Text
                  fontSize="9px"
                  fontWeight="800"
                  color="#64748B"
                  letterSpacing="1px"
                  px={2}
                  mb={1.5}
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
                      onClick={onClose}
                    >
                      {({ isActive }) => (
                        <Flex
                          align="center"
                          gap={3}
                          px={3}
                          py={2}
                          borderRadius="xl"
                          fontSize="13px"
                          fontWeight={isActive ? "700" : "500"}
                          color={isActive ? "#FFFFFF" : "#94A3B8"}
                          bg={isActive ? "linear-gradient(135deg, #6A1B9A 0%, #7E22CE 100%)" : "transparent"}
                        >
                          <Icon as={link.icon} boxSize={3.5} />
                          <Text flex={1}>{link.name}</Text>
                        </Flex>
                      )}
                    </NavLink>
                  ))}
                </Flex>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Footer Logout */}
        <Box pt={4} borderTop="1px solid #1E293B">
          <Flex
            as="button"
            w="100%"
            align="center"
            justify="center"
            gap={2}
            py={2.5}
            borderRadius="xl"
            bg="rgba(239, 68, 68, 0.15)"
            color="#EF4444"
            fontSize="13px"
            fontWeight="700"
            cursor="pointer"
            onClick={logout}
          >
            <Icon as={FaSignOutAlt} boxSize={3.5} />
            <Text>Sign Out</Text>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default MobileSideBar;
