import { Box, Text, Icon, Flex } from "@chakra-ui/react";
import { useState } from "react";
import { FaBars, FaSignOutAlt } from "react-icons/fa";
import MobileSideBar from "./MobileSidebar";
import { useAuth } from "../../libs/AuthProvider";

export default function MobileNavBar() {
  const [openSideBar, setOpenSideBar] = useState(false);
  const { user, logout } = useAuth();
  const isOpenSideBar = () => setOpenSideBar(true);
  return (
    <Box
      bg="gray.200"
      borderBottom="solid 1px"
      borderBottomColor="primary"
      position="fixed"
      top={0}
      w="100%"
      zIndex={9}
    >
      <Flex justify="space-between" align="center">
        <Flex p={2} gap={2} align="center">
          <Icon as={FaBars} boxSize={4} onClick={isOpenSideBar} />
          <Flex direction="column">
            <Text fontSize="sm">Welcome back, {user?.username}</Text>
            <Text fontSize="sm">{new Date().toDateString()}</Text>
          </Flex>
        </Flex>

        <Flex direction={"column"} p={2} align="center" mr={2} onClick={logout}>
          <Icon as={FaSignOutAlt} boxSize={6} />
          <Text>Logout</Text>
        </Flex>
      </Flex>

      {openSideBar && <MobileSideBar onClose={() => setOpenSideBar(false)} />}
    </Box>
  );
}
