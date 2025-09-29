import {
  Box,
  Flex,
  Text,
  Icon,
  Button,
  useBreakpointValue,
} from "@chakra-ui/react";

import { FaBrain, FaBars, FaTimes } from "react-icons/fa";

const Navbar = ({
  onNavClick,
  refs,
  onLoginOpen,
  onDrawerOpen,
  onMenuOpen,
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex
      bg="gray.200"
      position="fixed"
      w="100%"
      top={0}
      justifyContent={isMobile ? "space-between" : "space-around"}
      align="center"
      p={4}
      zIndex={10}
      boxShadow="md"
      color="gray.900">
      <Flex gap={2} align="center">
        <Icon
          as={FaBrain}
          boxSize={10}
          bg="primary"
          color="white"
          p={2}
          borderRadius="md"
        />
        <Text fontSize="2xl">
          Ace<span style={{ color: "#6A1B9A" }}>Smart</span>
        </Text>
      </Flex>
      <Flex gap={6} display={isMobile ? "none" : "flex"}>
        <Text
          cursor="pointer"
          onClick={(e) => onNavClick(refs.home, e)}
          _hover={{ color: "primary" }}>
          Home
        </Text>
        <Text
          cursor="pointer"
          onClick={(e) => onNavClick(refs.about, e)}
          _hover={{ color: "primary" }}>
          Features
        </Text>
        <Text cursor="pointer" _hover={{ color: "primary" }}>
          Pricing
        </Text>
        <Text
          cursor="pointer"
          onClick={(e) => onNavClick(refs.testimonials, e)}
          _hover={{ color: "primary" }}>
          Testimonial
        </Text>
        <Text cursor="pointer" _hover={{ color: "primary" }}>
          Contact
        </Text>
      </Flex>
      {isMobile ? (
        <Box>
          <Icon
            as={FaBars}
            boxSize={10}
            p={2}
            color="primary"
            onClick={onMenuOpen}
          />
        </Box>
      ) : (
        <Flex gap={4}>
          <Button
            borderColor="primary"
            borderRadius="sm"
            bg="none"
            _hover={{
              bg: "secondary",
              border: "none",
              color: "white",
            }}
            color="primary"
            onClick={onLoginOpen}>
            Login
          </Button>
          <Button
            bg="primary"
            borderRadius="md"
            color="text"
            _hover={{ transform: "scale(1.1)" }}
            onClick={onDrawerOpen}>
            Get Started
          </Button>
        </Flex>
      )}
    </Flex>
  );
};
export default Navbar;
