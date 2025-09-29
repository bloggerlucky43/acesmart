import { Box, Text, SimpleGrid } from "@chakra-ui/react";

const Numbers = ({ numberRef }) => {
  return (
    <Box ref={numberRef} bg="gray.400" mt={8} p={10}>
      <SimpleGrid columns={[1, 2, 3]} gap={6}>
        <Box
          bg="off"
          p={12}
          boxShadow="lg"
          _hover={{ boxShadow: "xl", transform: "translateY(-10px)" }}
          justifyItems="center"
          alignItems="center"
          borderRadius="lg">
          <Text color="primary" fontWeight="bold" fontSize="x-large">
            5000+
          </Text>
          <Text color="gray.800"> Excited Students</Text>
        </Box>
        <Box
          bg="off"
          p={12}
          justifyItems="center"
          alignItems="center"
          boxShadow="lg"
          _hover={{ boxShadow: "xl", transform: "translateY(-10px)" }}
          borderRadius="lg">
          <Text color="secondary" fontWeight="bold" fontSize="x-large">
            120+
          </Text>
          <Text color="gray.800">Happy Institutions</Text>
        </Box>
        <Box
          bg="off"
          p={12}
          justifyItems="center"
          boxShadow="lg"
          _hover={{ boxShadow: "xl", transform: "translateY(-10px)" }}
          alignItems="center"
          borderRadius="lg">
          <Text color="accent" fontWeight="bold" fontSize="x-large">
            10+
          </Text>
          <Text color="gray.800">Subjects</Text>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default Numbers;
