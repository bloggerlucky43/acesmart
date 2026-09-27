import { useEffect, useState } from "react";
import { Box, Flex, Text, Button, Icon, Badge } from "@chakra-ui/react";
import { FaUserSecret, FaSignOutAlt, FaShieldAlt } from "react-icons/fa";

/**
 * Floating Banner displayed whenever a SuperAdmin is in Ghost Mode
 * (impersonating a school/institution admin).
 * Provides a 1-click "Exit Ghost Mode" button to restore original SuperAdmin session.
 */
export default function GhostModeBanner() {
  const [ghostData, setGhostData] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("GHOST_MODE_ORIGINAL");
      if (stored) {
        setGhostData(JSON.parse(stored));
      }
    } catch (_) {}
  }, []);

  if (!ghostData) return null;

  const handleExitGhostMode = () => {
    try {
      // Restore SuperAdmin credentials
      if (ghostData.token) {
        localStorage.setItem("token", ghostData.token);
      }
      if (ghostData.user) {
        localStorage.setItem("USER_KEY", JSON.stringify(ghostData.user));
      }
      localStorage.removeItem("GHOST_MODE_ORIGINAL");

      // Redirect back to SuperAdmin portal
      window.location.href = "/superadmin/institutions";
    } catch (err) {
      console.error("Exit ghost mode error:", err);
      localStorage.removeItem("GHOST_MODE_ORIGINAL");
      window.location.href = "/superadmin/dashboard";
    }
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={9999}
      bg="linear-gradient(90deg, #7C2D12 0%, #B45309 50%, #7C2D12 100%)"
      color="white"
      py={2}
      px={4}
      boxShadow="0 4px 14px rgba(0, 0, 0, 0.4)"
      borderBottom="2px solid #F59E0B"
    >
      <Flex
        maxW="1300px"
        mx="auto"
        align="center"
        justify="space-between"
        flexWrap="wrap"
        gap={2}
      >
        <Flex align="center" gap={3}>
          <Box
            w="28px"
            h="28px"
            borderRadius="full"
            bg="rgba(0, 0, 0, 0.3)"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={FaUserSecret} color="#FDE68A" boxSize={4} />
          </Box>
          <Box>
            <Flex align="center" gap={2}>
              <Text fontSize="12px" fontWeight="900" letterSpacing="0.3px">
                SUPERADMIN GHOST MODE ACTIVE
              </Text>
              <Badge bg="#FEF3C7" color="#92400E" fontSize="10px" fontWeight="800" px={1.5} borderRadius="sm">
                Auditing Institution
              </Badge>
            </Flex>
            <Text fontSize="11px" color="#FEF3C7">
              You are impersonating this school. Any changes made will affect live institutional data.
            </Text>
          </Box>
        </Flex>

        <Button
          size="xs"
          bg="#FFFFFF"
          color="#92400E"
          fontWeight="900"
          fontSize="11px"
          h="28px"
          px={3}
          borderRadius="lg"
          _hover={{ bg: "#FEF3C7" }}
          onClick={handleExitGhostMode}
        >
          <Icon as={FaSignOutAlt} mr={1.5} boxSize={3} />
          Exit Ghost Mode & Return
        </Button>
      </Flex>
    </Box>
  );
}
