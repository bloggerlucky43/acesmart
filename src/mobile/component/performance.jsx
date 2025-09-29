import { Flex, Box } from "@chakra-ui/react";
import Barchart from "./barchart";
import Piechart from "./piechart";
import Linechart from "./linechart";
const MPerformance = () => {
  return (
    <Box
      p={4}
      boxShadow="md"
      w="90%"
      mt="4vh"
      justifySelf="center"
      justify="space-around"
    >
      <Barchart />
      <Piechart />
      <Linechart />
    </Box>
  );
};

export default MPerformance;
