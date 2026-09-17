import { Box, Flex, Text, Icon, Spinner } from "@chakra-ui/react";
import { FaInbox } from "react-icons/fa";

export const PortalCard = ({ children, ...rest }) => (
  <Box
    bg="white"
    borderRadius="2xl"
    border="1px solid #E2E8F0"
    boxShadow="0 4px 16px rgba(0,0,0,0.02)"
    p={{ base: 5, md: 6 }}
    {...rest}
  >
    {children}
  </Box>
);

export const PortalLoader = ({ label = "Loading..." }) => (
  <Flex
    bg="white"
    borderRadius="2xl"
    border="1px solid #E2E8F0"
    minH="220px"
    align="center"
    justify="center"
    direction="column"
    gap={3}
  >
    <Spinner color="#4338CA" />
    <Text fontSize="13px" color="#64748B">
      {label}
    </Text>
  </Flex>
);

export const PortalEmpty = ({ icon, title, description, action }) => (
  <PortalCard textAlign="center" py={{ base: 8, md: 10 }}>
    <Flex
      w="58px"
      h="58px"
      mx="auto"
      mb={4}
      borderRadius="2xl"
      bg="#F1F5F9"
      color="#64748B"
      align="center"
      justify="center"
    >
      <Icon as={icon || FaInbox} boxSize={6} />
    </Flex>
    <Text fontSize="16px" fontWeight="800" color="#0F172A">
      {title}
    </Text>
    {description && (
      <Text fontSize="13px" color="#64748B" mt={1} maxW="440px" mx="auto" lineHeight="1.6">
        {description}
      </Text>
    )}
    {action}
  </PortalCard>
);

export const PortalToggle = ({ checked, onChange, onLabel = "Enabled", offLabel = "Disabled" }) => (
  <Flex
    as="button"
    type="button"
    onClick={() => onChange(!checked)}
    align="center"
    gap={2}
    px={3}
    py={1.5}
    borderRadius="full"
    border="1px solid"
    borderColor={checked ? "#A7F3D0" : "#E2E8F0"}
    bg={checked ? "#ECFDF5" : "#F8FAFC"}
    color={checked ? "#065F46" : "#64748B"}
    fontSize="12px"
    fontWeight="800"
    cursor="pointer"
    transition="all 0.15s ease"
  >
    <Box
      w="34px"
      h="18px"
      borderRadius="full"
      bg={checked ? "#10B981" : "#CBD5E1"}
      position="relative"
      transition="all 0.15s ease"
      flexShrink={0}
    >
      <Box
        position="absolute"
        top="2px"
        left={checked ? "18px" : "2px"}
        w="14px"
        h="14px"
        borderRadius="full"
        bg="white"
        boxShadow="0 1px 3px rgba(0,0,0,0.2)"
        transition="all 0.15s ease"
      />
    </Box>
    {checked ? onLabel : offLabel}
  </Flex>
);

