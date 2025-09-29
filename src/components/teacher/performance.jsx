import { Flex } from "@chakra-ui/react";
import Barchart from "./barchart";
import Piechart from "./piechart";
import Linechart from "./linechart";
const Performance = () => {
  return (
    <Flex
      ml="18vw"
      p={4}
      gap={2}
      bg="gray.100"
      borderRadius="2xl"
      boxShadow="2xl"
      w="75%"
      mt="12vh"
      justifySelf="center"
      justify="space-around"
    >
      <Barchart />
      <Piechart />
      <Linechart />
    </Flex>
  );
};

export default Performance;
