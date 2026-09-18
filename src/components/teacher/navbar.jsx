import {
  Flex,
  Text,
  Avatar,
  Icon,
  Button,
  Box,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaBell, FaPlus, FaCalendarAlt, FaBars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../libs/AuthProvider";
import MobileSideBar from "../../mobile/component/MobileSidebar";
import MobileNavBar from "../../mobile/component/MobileNavbar";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useBreakpointValue({ base: true, lg: false });

  const teacherName = user?.name || user?.username || "Educator";
  const firstName = teacherName.trim().split(/\s+/)[0];
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (isMobile) {
    return <MobileNavBar />;
  }

  return (
    <>
      {mobileMenuOpen && <MobileSideBar onClose={() => setMobileMenuOpen(false)} />}
      <Flex
      as="header"
      position="fixed"
      top={0}
      right={0}
      w={{ base: "100%", lg: "calc(100% - 240px)" }}
      ml={{ base: 0, lg: "240px" }}
      h="68px"
      bg="rgba(255, 255, 255, 0.92)"
      backdropFilter="blur(16px)"
      borderBottom="1px solid"
      borderColor="#E2E8F0"
      px={{ base: 4, md: 6 }}
      justify="space-between"
      align="center"
      zIndex={20}
      boxShadow="0 1px 12px rgba(0, 0, 0, 0.03)"
    >
      {/* Left Greeting & Context */}
      <Flex align="center" gap={3}>
        {/* Mobile Hamburger Button */}
        <Flex
          as="button"
          display={{ base: "flex", lg: "none" }}
          w="38px"
          h="38px"
          borderRadius="xl"
          bg="#F1F5F9"
          color="#0F172A"
          align="center"
          justify="center"
          cursor="pointer"
          _hover={{ bg: "#E2E8F0" }}
          onClick={() => setMobileMenuOpen(true)}
        >
          <Icon as={FaBars} boxSize={4} color="#6A1B9A" />
        </Flex>

        <Box>
          <Flex align="center" gap={2}>
            {user?.institution?.logoUrl && (
              <Box w="28px" h="28px" borderRadius="md" bg="white" p={0.5} border="1px solid #E2E8F0">
                <img
                  src={user.institution.logoUrl}
                  alt="Crest"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </Box>
            )}
          <Text
            fontSize={{ base: "16px", md: "18px" }}
            fontWeight="800"
            color="#0F172A"
            fontFamily="'Outfit', sans-serif"
            isTruncated
          >
            Welcome back, {firstName}
          </Text>
          <Box
            w="8px"
            h="8px"
            borderRadius="full"
            bg="#10B981"
            boxShadow="0 0 6px #10B981"
            title="Online"
          />
        </Flex>
        <Flex align="center" gap={1.5} color="#64748B" fontSize="12px">
          <Icon as={FaCalendarAlt} boxSize={3} />
          <Text>
            {today} • {user?.institution?.name || "CBT Center Management"}
          </Text>
        </Flex>
      </Box>
    </Flex>

      {/* Right Controls */}
      <Flex gap={3.5} align="center">
        {/* Quick New Exam Action */}
        <Button
          size="sm"
          bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
          color="white"
          borderRadius="xl"
          px={3.5}
          h="38px"
          fontSize="13px"
          fontWeight="700"
          boxShadow="0 4px 12px rgba(106, 27, 154, 0.25)"
          _hover={{
            opacity: 0.95,
            transform: "translateY(-1px)",
          }}
          onClick={() => navigate("/teacher/create_exam")}
          display={{ base: "none", sm: "flex" }}
        >
          <Icon as={FaPlus} mr={1.5} boxSize={3} />
          New Exam
        </Button>

        {/* Notifications Bell */}
        <Flex
          as="button"
          align="center"
          justify="center"
          w="38px"
          h="38px"
          borderRadius="xl"
          bg="#F1F5F9"
          color="#475569"
          position="relative"
          cursor="pointer"
          _hover={{ bg: "#E2E8F0", color: "#6A1B9A" }}
          transition="all 0.2s ease"
          title="Notifications"
        >
          <Icon as={FaBell} boxSize={4} />
          <Box
            position="absolute"
            top="8px"
            right="8px"
            w="8px"
            h="8px"
            borderRadius="full"
            bg="#EF4444"
            border="1.5px solid white"
          />
        </Flex>

        {/* User Avatar Badge */}
        <Flex
          align="center"
          justify="center"
          p={1}
          borderRadius="full"
          bg="#F8FAFC"
          border="1px solid #E2E8F0"
          title={teacherName}
        >
          <Avatar.Root size="xs" bg="#6A1B9A" color="white">
            <Avatar.Fallback name={teacherName} />
          </Avatar.Root>
        </Flex>
      </Flex>
    </Flex>
  </>
);
};

export default Navbar;
