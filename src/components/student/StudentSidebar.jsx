import { Box, Flex, Text, Icon, Badge, Avatar } from "@chakra-ui/react";
import { FaGraduationCap, FaSignOutAlt, FaBookOpen } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { STUDENT_NAV } from "../../constants/studentNav";
import { useStudentPortal } from "../../libs/StudentPortalProvider";

const StudentSidebar = ({ isMobile = false, onNavigate }) => {
  const navigate = useNavigate();
  const { student, institution, logout } = useStudentPortal();

  const schoolName = institution?.name;
  const schoolLogo = institution?.logoUrl;
  const studentName = student?.name || student?.fullName || "Student";
  const classArm = student?.classArm || "Unassigned";

  const handleLogout = () => {
    logout();
    onNavigate?.();
  };

  return (
    <Box
      as="aside"
      w="260px"
      h="100vh"
      position={isMobile ? "relative" : "fixed"}
      top={0}
      left={0}
      bg="#0F172A"
      color="white"
      zIndex={isMobile ? 61 : 30}
      display={isMobile ? "flex" : { base: "none", lg: "flex" }}
      flexDirection="column"
      justifyContent="space-between"
      borderRight="1px solid"
      borderColor="#1E293B"
      boxShadow="4px 0 24px rgba(0, 0, 0, 0.15)"
    >
      <Box p={4} borderBottom="1px solid" borderColor="#1E293B">
        <Flex
          align="center"
          gap={3}
          cursor="pointer"
          onClick={() => {
            navigate("/student");
            onNavigate?.();
          }}
        >
          {schoolLogo ? (
            <Box
              w="42px"
              h="42px"
              borderRadius="xl"
              bg="white"
              p={1}
              flexShrink={0}
              boxShadow="0 2px 8px rgba(0,0,0,0.2)"
            >
              <img
                src={schoolLogo}
                alt="School Crest"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Box>
          ) : (
            <Flex
              w="42px"
              h="42px"
              borderRadius="xl"
              bg="linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)"
              align="center"
              justify="center"
              boxShadow="0 4px 14px rgba(67, 56, 202, 0.4)"
              flexShrink={0}
            >
              <Icon as={FaGraduationCap} boxSize={5} color="white" />
            </Flex>
          )}

          <Box minW={0}>
            <Flex align="center" gap={1.5}>
              <Text
                fontSize="15px"
                fontWeight="800"
                fontFamily="'Outfit', sans-serif"
                letterSpacing="-0.3px"
                lineHeight="1.2"
                isTruncated
                maxW="130px"
              >
                {schoolName || "AceSmart"}
              </Text>
              <Badge
                bg="#312E81"
                color="#DDD6FE"
                fontSize="9px"
                px={1.5}
                py={0.5}
                borderRadius="full"
                border="1px solid #4338CA"
              >
                PORTAL
              </Badge>
            </Flex>
            <Text fontSize="11px" color="#94A3B8" fontWeight="500" isTruncated>
              Student & Parent Access
            </Text>
          </Box>
        </Flex>
      </Box>

      <Box
        flex={1}
        py={4}
        px={3}
        overflowY="auto"
        css={{
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            background: "#1E293B",
            borderRadius: "2px",
          },
        }}
      >
        {STUDENT_NAV.map((group) => (
          <Box key={group.title} mb={5}>
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
                  end={link.end}
                  style={{ textDecoration: "none" }}
                  onClick={() => onNavigate?.()}
                >
                  {({ isActive }) => (
                    <Flex
                      align="center"
                      gap={3}
                      px={3}
                      py={2.5}
                      borderRadius="xl"
                      cursor="pointer"
                      fontSize="13px"
                      fontWeight={isActive ? "700" : "500"}
                      color={isActive ? "#FFFFFF" : "#94A3B8"}
                      bg={
                        isActive
                          ? "linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)"
                          : "transparent"
                      }
                      boxShadow={
                        isActive ? "0 4px 14px rgba(67, 56, 202, 0.35)" : "none"
                      }
                      _hover={{
                        color: "#FFFFFF",
                        bg: isActive
                          ? "linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)"
                          : "#1E293B",
                        transform: "translateX(2px)",
                      }}
                      transition="all 0.15s ease"
                    >
                      <Icon
                        as={link.icon}
                        boxSize={3.5}
                        color={isActive ? "#FFFFFF" : "#94A3B8"}
                      />
                      <Text flex={1} isTruncated>
                        {link.name}
                      </Text>
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

        <Flex
          align="center"
          gap={2}
          px={3}
          py={2.5}
          mt={4}
          borderRadius="xl"
          bg="#0B1120"
          border="1px solid #1E293B"
          color="#94A3B8"
          fontSize="11px"
        >
          <Icon as={FaBookOpen} boxSize={3} />
          <Text>Contact the school bursary for fee or code issues.</Text>
        </Flex>
      </Box>

      <Box p={3} borderTop="1px solid" borderColor="#1E293B" bg="#0B1120">
        <Flex
          align="center"
          justify="space-between"
          p={2.5}
          borderRadius="xl"
          bg="#1E293B"
        >
          <Flex align="center" gap={2.5} minW={0}>
            <Avatar.Root size="sm" bg="#4338CA" color="white">
              <Avatar.Fallback name={studentName} />
            </Avatar.Root>
            <Box minW={0}>
              <Text
                fontSize="13px"
                fontWeight="700"
                color="white"
                isTruncated
                maxW="120px"
              >
                {studentName}
              </Text>
              <Text fontSize="10px" color="#A855F7" fontWeight="600" isTruncated>
                {classArm}
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
            title="Sign out"
          >
            <Icon as={FaSignOutAlt} boxSize={3.5} />
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

export default StudentSidebar;
