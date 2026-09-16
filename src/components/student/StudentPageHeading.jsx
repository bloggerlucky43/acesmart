import { Box, Flex, Text, Icon } from "@chakra-ui/react";

const StudentPageHeading = ({ title, description, icon, action }) => {
  return (
    <Flex
      justify="space-between"
      align={{ base: "flex-start", md: "center" }}
      direction={{ base: "column", md: "row" }}
      gap={4}
      mb={6}
    >
      <Flex align="center" gap={3} minW={0}>
        {icon && (
          <Flex
            w="44px"
            h="44px"
            borderRadius="xl"
            bg="#EEF2FF"
            color="#4338CA"
            align="center"
            justify="center"
            flexShrink={0}
          >
            <Icon as={icon} boxSize={5} />
          </Flex>
        )}
        <Box minW={0}>
          <Text
            fontSize={{ base: "20px", md: "23px" }}
            fontWeight="900"
            color="#0F172A"
            letterSpacing="-0.5px"
            lineHeight="1.2"
          >
            {title}
          </Text>
          {description && (
            <Text fontSize="13px" color="#64748B" mt={0.5}>
              {description}
            </Text>
          )}
        </Box>
      </Flex>
      {action}
    </Flex>
  );
};

export default StudentPageHeading;
