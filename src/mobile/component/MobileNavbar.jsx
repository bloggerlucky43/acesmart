import { Box, Text, Icon, Flex, Avatar } from "@chakra-ui/react";
import { useState } from "react";
import { FaBars, FaSignOutAlt, FaBrain } from "react-icons/fa";
import MobileSideBar from "./MobileSidebar";
import { useAuth } from "../../libs/AuthProvider";

export default function MobileNavBar() {
  const [openSideBar, setOpenSideBar] = useState(false);
  const { logout } = useAuth();

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
      px={4}
      py={2.5}
      boxShadow="0 2px 10px rgba(0, 0, 0, 0.15)"
    >
      <Flex justify="space-between" align="center">
        <Flex gap={3} align="center">
          <Flex
            as="button"
            w="36px"
            h="36px"
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

          <Flex align="center" gap={2}>
            <Flex
              w="28px"
              h="28px"
              borderRadius="md"
              bg="#6A1B9A"
              align="center"
              justify="center"
            >
              <Icon as={FaBrain} boxSize={3.5} color="white" />
            </Flex>
            <Box>
              <Text fontSize="15px" fontWeight="800" fontFamily="'Outfit', sans-serif" lineHeight="1.1">
                Ace<span style={{ color: "#C084FC" }}>Smart</span>
              </Text>
            </Box>
          </Flex>
        </Flex>

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
        >
          <Icon as={FaSignOutAlt} boxSize={3.5} />
          <Text>Exit</Text>
        </Flex>
      </Flex>

      {openSideBar && <MobileSideBar onClose={() => setOpenSideBar(false)} />}
    </Box>
  );
}
