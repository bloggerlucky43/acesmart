import { Box, SimpleGrid } from "@chakra-ui/react";
import Barchart from "./barchart";
import Piechart from "./piechart";
import Linechart from "./linechart";

const Performance = () => {
  return (
    <Box mb={8}>
      {/* Top Charts Grid */}
      <SimpleGrid columns={{ base: 1, lg: 12 }} gap={6} mb={6}>
        <Box gridColumn={{ lg: "span 7" }}>
          <Barchart />
        </Box>
        <Box gridColumn={{ lg: "span 5" }}>
          <Piechart />
        </Box>
      </SimpleGrid>

      {/* Bottom Full-Width Progression Chart */}
      <Box>
        <Linechart />
      </Box>
    </Box>
  );
};

export default Performance;
