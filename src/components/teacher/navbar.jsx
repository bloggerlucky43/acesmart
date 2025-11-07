import { Flex, Text, Avatar, Icon } from "@chakra-ui/react";
import { FaBell } from "react-icons/fa";
import { useAuth } from "../../libs/AuthProvider";
const Navbar = () => {
  const { user } = useAuth();
  return (
    <Flex
      bg="gray.200"
      p={4}
      w={"80%"}
      // w="calc(100%-10px)"
      justify="space-between"
      right={0}
      position="fixed"
      zIndex={10}
      borderBottom="solid 2px"
      borderColor="primary"
      top={0}
      // ml={"20%"}
    >
      <Flex align="center">
        <Text fontSize="xl">Welcome back,{user.username}</Text>
      </Flex>
      <Flex gap={3} align="center">
        <Icon as={FaBell} boxSize={6} />
        <Avatar.Root bg="primary" color="white">
          <Avatar.Fallback name={user.name} />
          <Avatar.Image src="" />
        </Avatar.Root>
        <Text>{user.name}</Text>
      </Flex>
    </Flex>
  );
};

export default Navbar;
