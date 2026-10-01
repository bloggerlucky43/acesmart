import { useState, useRef, useEffect } from "react";
import { Flex, Text, Icon, Box, Badge, Avatar, Button } from "@chakra-ui/react";
import {
  FaBars,
  FaBell,
  FaLaptopCode,
  FaUserGraduate,
  FaSignOutAlt,
  FaCog,
  FaCommentDots,
  FaAward,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useStudentPortal } from "../../libs/StudentPortalProvider";
import FeedbackModal from "../ui/FeedbackModal";

const StudentTopbar = ({ onOpenMobileNav }) => {
  const navigate = useNavigate();
  const { student, institution, logout } = useStudentPortal();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const menuRef = useRef(null);

  const studentName = student?.name || student?.fullName || "Student";
  const firstName = studentName.split(" ")[0] || "Student";
  const classArm = student?.classArm || "Class";
  const currentTerm = institution?.currentTerm || "Current Term";
  const academicSession = institution?.academicSession;

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuOpen]);

  return (
    <Flex
      as="header"
      position="fixed"
      top={0}
      right={0}
      w={{ base: "100%", lg: "calc(100% - 260px)" }}
      h="64px"
      bg="rgba(255, 255, 255, 0.88)"
      backdropFilter="blur(20px)"
      borderBottom="1px solid"
      borderColor="rgba(226, 232, 240, 0.8)"
      px={{ base: 3.5, sm: 5, md: 7 }}
      justify="space-between"
      align="center"
      zIndex={30}
      boxShadow="0 4px 20px -2px rgba(15, 23, 42, 0.03)"
      transition="all 0.2s ease"
    >
      {/* Left: Hamburger (Mobile) + Clean Adaptive Greeting */}
      <Flex align="center" gap={{ base: 2.5, sm: 3 }} minW={0}>
        <Flex
          as="button"
          display={{ base: "flex", lg: "none" }}
          w="38px"
          h="38px"
          borderRadius="xl"
          bg="#F8FAFC"
          border="1px solid #E2E8F0"
          color="#0F172A"
          align="center"
          justify="center"
          cursor="pointer"
          _hover={{ bg: "#EEF2FF", color: "#4338CA", borderColor: "#C7D2FE" }}
          onClick={onOpenMobileNav}
          title="Open Navigation"
          flexShrink={0}
          transition="all 0.15s ease"
        >
          <Icon as={FaBars} boxSize={3.5} color="#4338CA" />
        </Flex>

        <Box minW={0}>
          <Flex align="center" gap={2}>
            <Text
              fontSize={{ base: "15px", sm: "16px", md: "17px" }}
              fontWeight="800"
              color="#0F172A"
              fontFamily="'Outfit', sans-serif"
              letterSpacing="-0.3px"
              lineHeight="1.2"
              isTruncated
            >
              Hi, {firstName} <span style={{ display: "inline-block" }}>👋</span>
            </Text>

            <Box
              w="7px"
              h="7px"
              borderRadius="full"
              bg="#10B981"
              boxShadow="0 0 6px rgba(16, 185, 129, 0.6)"
              title="Portal Active"
              flexShrink={0}
              display={{ base: "none", sm: "block" }}
            />
          </Flex>

          {/* Subtitle Badges (Desktop) */}
          <Flex align="center" gap={1.5} mt={0.5} wrap="nowrap">
            <Badge
              bg="#EEF2FF"
              color="#4338CA"
              px={2}
              py={0.2}
              borderRadius="md"
              fontSize="10.5px"
              fontWeight="700"
              border="1px solid rgba(67, 56, 202, 0.15)"
              isTruncated
            >
              {classArm}
            </Badge>

            <Text
              fontSize="11px"
              color="#94A3B8"
              fontWeight="600"
              display={{ base: "none", md: "inline" }}
            >
              • {currentTerm}
              {academicSession ? ` (${academicSession})` : ""}
            </Text>
          </Flex>
        </Box>
      </Flex>

      {/* Right: Quick CBT Action + Notifications + Profile Avatar Dropdown */}
      <Flex gap={{ base: 2, sm: 2.5 }} align="center" position="relative" ref={menuRef}>
        {/* Quick Prefect Duty Button (If Appointed) */}
        {student?.isPrefect && (
          <Button
            size="xs"
            h="34px"
            px={3}
            borderRadius="xl"
            bg="linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)"
            color="#FDE047"
            fontWeight="800"
            fontSize="11.5px"
            border="1px solid #4338CA"
            boxShadow="0 3px 10px rgba(49, 46, 129, 0.25)"
            _hover={{ opacity: 0.92, transform: "translateY(-1px)" }}
            transition="all 0.15s ease"
            onClick={() => navigate("/student/prefect")}
            title="Prefect Duty Sign-In"
          >
            <Icon as={FaAward} mr={{ base: 0, md: 1.5 }} boxSize={3.5} color="#FDE047" />
            <Text display={{ base: "none", md: "inline" }}>Prefect Duty</Text>
          </Button>
        )}

        {/* Quick CBT Button */}
        <Button
          size="xs"
          h="34px"
          px={3.5}
          borderRadius="xl"
          bg="linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)"
          color="white"
          fontWeight="800"
          fontSize="11.5px"
          boxShadow="0 3px 10px rgba(67, 56, 202, 0.25)"
          _hover={{ opacity: 0.92, transform: "translateY(-1px)" }}
          transition="all 0.15s ease"
          onClick={() => {
            if (student?.studentCode) {
              navigate(`/take_exam?code=${student.studentCode}`);
            } else {
              navigate("/student/exams");
            }
          }}
          display={{ base: "none", sm: "inline-flex" }}
        >
          <Icon as={FaLaptopCode} mr={1.5} boxSize={3.5} />
          Take CBT
        </Button>

        {/* Notifications Bell */}
        <Flex
          as="button"
          align="center"
          justify="center"
          w="36px"
          h="36px"
          borderRadius="xl"
          bg="#F8FAFC"
          border="1px solid #E2E8F0"
          color="#64748B"
          position="relative"
          cursor="pointer"
          _hover={{ bg: "#EEF2FF", color: "#4338CA", borderColor: "#C7D2FE" }}
          transition="all 0.15s ease"
          onClick={() => navigate("/student/announcements")}
          title="Announcements & Notices"
        >
          <Icon as={FaBell} boxSize={3.5} />
          <Box
            position="absolute"
            top="7px"
            right="7px"
            w="6.5px"
            h="6.5px"
            borderRadius="full"
            bg="#EF4444"
            border="1.5px solid white"
          />
        </Flex>

        {/* Student Profile Avatar Pill */}
        <Flex
          as="button"
          align="center"
          gap={2}
          p={1}
          pr={{ base: 1, md: 2.5 }}
          borderRadius="full"
          bg="#F8FAFC"
          border="1px solid"
          borderColor={profileMenuOpen ? "#4338CA" : "#E2E8F0"}
          cursor="pointer"
          _hover={{ borderColor: "#CBD5E1", bg: "#F1F5F9" }}
          transition="all 0.15s ease"
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          title="Account Menu"
        >
          <Avatar.Root size="xs" bg="#4338CA" color="white">
            <Avatar.Fallback name={studentName} />
          </Avatar.Root>
          <Text
            fontSize="12.5px"
            fontWeight="700"
            color="#1E293B"
            display={{ base: "none", md: "block" }}
            maxW="110px"
            isTruncated
          >
            {firstName}
          </Text>
        </Flex>

        {/* Profile Dropdown Menu */}
        {profileMenuOpen && (
          <Box
            position="absolute"
            top="46px"
            right={0}
            w="230px"
            bg="white"
            borderRadius="2xl"
            border="1px solid #E2E8F0"
            boxShadow="0 14px 34px -4px rgba(15, 23, 42, 0.12)"
            p={2}
            zIndex={50}
            animation="fadeIn 0.15s ease"
          >
            {/* Header info in dropdown */}
            <Box px={3} py={2.5} borderBottom="1px solid #F1F5F9" mb={1}>
              <Text fontSize="13px" fontWeight="800" color="#0F172A" isTruncated>
                {studentName}
              </Text>
              <Text fontSize="11px" color="#64748B" fontWeight="600">
                {student?.studentId || "Student Account"}
              </Text>
              <Flex align="center" gap={1.5} wrap="wrap" mt={1}>
                <Badge bg="#EEF2FF" color="#4338CA" fontSize="10px" fontWeight="700">
                  {classArm}
                </Badge>
                {student?.isPrefect && (
                  <Badge bg="#FEF08A" color="#854D0E" fontSize="9.5px" fontWeight="800">
                    ★ {student.prefectRole || "Prefect"}
                  </Badge>
                )}
              </Flex>
            </Box>

            {/* If Prefect, show link at top of menu */}
            {student?.isPrefect && (
              <Flex
                as="button"
                w="100%"
                align="center"
                gap={2.5}
                px={3}
                py={2}
                borderRadius="xl"
                fontSize="12.5px"
                fontWeight="700"
                color="#854D0E"
                bg="#FEF9C3"
                _hover={{ bg: "#FEF08A" }}
                onClick={() => {
                  setProfileMenuOpen(false);
                  navigate("/student/prefect");
                }}
                mb={1}
              >
                <Icon as={FaAward} boxSize={3.5} color="#CA8A04" />
                <Text>Prefect Duty Sign-In</Text>
              </Flex>
            )}

            {/* Menu Links */}
            <Flex
              as="button"
              w="100%"
              align="center"
              gap={2.5}
              px={3}
              py={2}
              borderRadius="xl"
              fontSize="12.5px"
              fontWeight="600"
              color="#334155"
              _hover={{ bg: "#F8FAFC", color: "#4338CA" }}
              onClick={() => {
                setProfileMenuOpen(false);
                navigate("/student/profile");
              }}
            >
              <Icon as={FaUserGraduate} boxSize={3.5} color="#64748B" />
              <Text>My Profile</Text>
            </Flex>

            <Flex
              as="button"
              w="100%"
              align="center"
              gap={2.5}
              px={3}
              py={2}
              borderRadius="xl"
              fontSize="12.5px"
              fontWeight="600"
              color="#334155"
              _hover={{ bg: "#F8FAFC", color: "#4338CA" }}
              onClick={() => {
                setProfileMenuOpen(false);
                navigate("/student/settings");
              }}
            >
              <Icon as={FaCog} boxSize={3.5} color="#64748B" />
              <Text>Settings & PIN</Text>
            </Flex>

            <Flex
              as="button"
              w="100%"
              align="center"
              gap={2.5}
              px={3}
              py={2}
              borderRadius="xl"
              fontSize="12.5px"
              fontWeight="600"
              color="#334155"
              _hover={{ bg: "#F8FAFC", color: "#6D28D9" }}
              onClick={() => {
                setProfileMenuOpen(false);
                setFeedbackOpen(true);
              }}
            >
              <Icon as={FaCommentDots} boxSize={3.5} color="#8B5CF6" />
              <Text>Send Feedback</Text>
            </Flex>

            {/* Sign Out Action */}
            <Box pt={1} mt={1} borderTop="1px solid #F1F5F9">
              <Flex
                as="button"
                w="100%"
                align="center"
                gap={2.5}
                px={3}
                py={2}
                borderRadius="xl"
                fontSize="12.5px"
                fontWeight="700"
                color="#EF4444"
                _hover={{ bg: "rgba(239, 68, 68, 0.08)" }}
                onClick={() => {
                  setProfileMenuOpen(false);
                  logout();
                }}
              >
                <Icon as={FaSignOutAlt} boxSize={3.5} />
                <Text>Sign Out</Text>
              </Flex>
            </Box>
          </Box>
        )}
      </Flex>

      {/* Floating Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        studentId={student?.id}
      />
    </Flex>
  );
};

export default StudentTopbar;
