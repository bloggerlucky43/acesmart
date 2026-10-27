import { Box, Text, Icon, Flex, Portal } from "@chakra-ui/react";
import { useState } from "react";
import { FaBars, FaSignOutAlt, FaBrain, FaQrcode } from "react-icons/fa";
import { Link } from "react-router-dom";
import MobileSideBar from "./MobileSidebar";
import { useAuth } from "../../libs/AuthProvider";

export default function MobileNavBar() {
  const [openSideBar, setOpenSideBar] = useState(false);
  const { user, logout } = useAuth();

  return (
    <Box
      bg="rgba(15, 23, 42, 0.95)"
      backdropFilter="blur(12px)"
      borderBottom="1px solid #1E293B"
      position="fixed"
      top={0}
      w="100%"
      zIndex={40}
      color="white"
      px={{ base: 3, sm: 4 }}
      py={2.5}
      boxShadow="0 2px 10px rgba(0, 0, 0, 0.15)"
    >
      <Flex justify="space-between" align="center">
        <Flex gap={{ base: 2, sm: 3 }} align="center" minW={0}>
          <Flex
            as="button"
            w="44px"
            h="44px"
            flexShrink={0}
            aria-label="Open school navigation"
            aria-expanded={openSideBar}
            borderRadius="lg"
            bg="#1E293B"
            color="white"
            align="center"
            justify="center"
            onClick={() => setOpenSideBar(true)}
            cursor="pointer"
          >
            <Icon as={FaBars} boxSize={4} color="#C084FC" />
          </Flex>

          <Flex align="center" gap={2} minW={0}>
            <Flex
              w="28px"
              h="28px"
              borderRadius="md"
              bg="#6A1B9A"
              align="center"
              justify="center"
              display={{ base: "none", sm: "flex" }}
            >
              <Icon as={FaBrain} boxSize={3.5} color="white" />
            </Flex>
            <Box>
              <Text fontSize="15px" fontWeight="800" fontFamily="'Outfit', sans-serif" lineHeight="1.1" whiteSpace="nowrap">
                Ace<span style={{ color: "#C084FC" }}>Smart</span>
              </Text>
            </Box>
          </Flex>
        </Flex>

        <Flex gap={2} align="center" flexShrink={0}>
          {user?.institutionId && (
            <Flex asChild minH="44px" px={3} align="center" gap={1.5} bg="#4338CA" color="white" borderRadius="lg" fontSize="12px" fontWeight="700">
              <Link to="/teacher/gate-check-in" aria-label="Scan student gate arrivals">
                <Icon as={FaQrcode} boxSize={4} /><Text>Gate</Text>
              </Link>
            </Flex>
          )}
          <Flex
            as="button"
            align="center"
            gap={1.5}
            px={3}
            py={1.5}
            borderRadius="lg"
            bg="rgba(239, 68, 68, 0.15)"
            color="#EF4444"
            fontSize="12px"
            fontWeight="700"
            cursor="pointer"
            onClick={logout}
            aria-label="Sign out"
            minH="44px"
          >
            <Icon as={FaSignOutAlt} boxSize={3.5} />
            <Text display={{ base: "none", sm: "block" }}>Exit</Text>
          </Flex>
        </Flex>
      </Flex>

      {openSideBar && (
        <Portal>
          <MobileSideBar onClose={() => setOpenSideBar(false)} />
        </Portal>
      )}
    </Box>
  );
}
