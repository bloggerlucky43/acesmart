import {
  Box,
  Flex,
  Text,
  Link,
  Stack,
  Icon,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
} from "react-icons/fa";

const Footer = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box bg="primary" color="white" py={2} px={isMobile ? 4 : 20}>
      <Flex
        direction={isMobile ? "column" : "row"}
        justify="space-between"
        align={isMobile ? "flex-start" : "center"}
        maxW="1200px"
        mx="auto"
        gap={8}
      ></Flex>
      <Text textAlign="center" fontSize="sm" mt={2} color="gray.200">
        &copy; {new Date().getFullYear()} AceSmart. All rights reserved.
      </Text>
    </Box>
  );
};

export default Footer;
