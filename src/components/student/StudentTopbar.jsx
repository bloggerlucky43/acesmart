import { Flex, Text, Icon, Box, Badge, Avatar } from "@chakra-ui/react";
import {
  FaBars,
  FaBell,
  FaCalendarAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { useStudentPortal } from "../../libs/StudentPortalProvider";

const StudentTopbar = ({ onOpenMobileNav }) => {
  const { student, institution, logout } = useStudentPortal();

  const studentName = student?.name || student?.fullName || "Student";
  const classArm = student?.classArm;
  const currentTerm = institution?.currentTerm || "Current Term";
  const academicSession = institution?.academicSession;
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Flex
      as="header"
      position="fixed"
      top={0}
      right={0}
      w={{ base: "100%", lg: "calc(100% - 260px)" }}
      h="72px"
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
      <Flex align="center" gap={3} minW={0}>
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
          onClick={onOpenMobileNav}
          title="Open menu"
        >
          <Icon as={FaBars} boxSize={4} color="#4338CA" />
        </Flex>

        <Box minW={0}>
          <Flex align="center" gap={2}>
            {institution?.logoUrl && (
              <Box
                w="28px"
                h="28px"
                borderRadius="md"
                bg="white"
                p={0.5}
                border="1px solid #E2E8F0"
                flexShrink={0}
              >
                <img
                  src={institution.logoUrl}
                  alt="Crest"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </Box>
            )}
            <Text
              fontSize={{ base: "15px", md: "18px" }}
              fontWeight="800"
              color="#0F172A"
              fontFamily="'Outfit', sans-serif"
              isTruncated
            >
              Welcome back, {studentName}
            </Text>
            <Box
              w="8px"
              h="8px"
              borderRadius="full"
              bg="#10B981"
              boxShadow="0 0 6px #10B981"
              title="Portal active"
              flexShrink={0}
            />
          </Flex>
          <Flex align="center" gap={1.5} color="#64748B" fontSize="12px">
            <Icon as={FaCalendarAlt} boxSize={3} />
            <Text isTruncated>
              {today}
              {classArm ? ` • ${classArm}` : ""}
              {institution?.name ? ` • ${institution.name}` : ""}
            </Text>
          </Flex>
        </Box>
      </Flex>

      <Flex gap={3} align="center">
        <Badge
          bg="#EEF2FF"
          color="#4338CA"
          px={3}
          py={1.5}
          borderRadius="full"
          fontWeight="800"
          fontSize="11px"
          display={{ base: "none", md: "block" }}
        >
          {currentTerm}
          {academicSession ? ` • ${academicSession}` : ""}
        </Badge>

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
          _hover={{ bg: "#E2E8F0", color: "#4338CA" }}
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

        <Flex
          align="center"
          gap={2.5}
          p={1}
          pr={3}
          borderRadius="full"
          bg="#F8FAFC"
          border="1px solid #E2E8F0"
        >
          <Avatar.Root size="xs" bg="#4338CA" color="white">
            <Avatar.Fallback name={studentName} />
          </Avatar.Root>
          <Text
            fontSize="13px"
            fontWeight="700"
            color="#1E293B"
            display={{ base: "none", md: "block" }}
          >
            {studentName}
          </Text>
        </Flex>

        <Flex
          as="button"
          align="center"
          justify="center"
          w="38px"
          h="38px"
          borderRadius="xl"
          bg="rgba(239, 68, 68, 0.1)"
          color="#EF4444"
          cursor="pointer"
          _hover={{ bg: "#EF4444", color: "white" }}
          transition="all 0.2s ease"
          onClick={logout}
          title="Sign out"
        >
          <Icon as={FaSignOutAlt} boxSize={3.5} />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default StudentTopbar;
