import { Box, Flex, Text } from "@chakra-ui/react";
import Barchart from "./barchart";
import Piechart from "./piechart";
import Linechart from "./linechart";

const MPerformance = () => {
  return (
    <Box w="100%">
      <Text fontSize="16px" fontWeight="800" color="#0F172A" mb={3} fontFamily="'Outfit', sans-serif">
        Analytics & Performance
      </Text>
      <Flex direction="column" gap={4}>
        <Barchart />
        <Piechart />
        <Linechart />
      </Flex>
    </Box>
  );
};

export default MPerformance;
