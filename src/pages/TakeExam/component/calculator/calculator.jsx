import { Box, Button, Input, Flex, Grid } from "@chakra-ui/react";
import { useState } from "react";

const Calculator = ({ onClose }) => {
  const [value, setValue] = useState("");

  const handleClick = (val) => {
    setValue((prev) => prev + val);
  };

  const calculate = () => {
    try {
      setValue(String(eval(value)));
    } catch (error) {
      setValue("Error");
    }
  };

  const clear = () => setValue("");
  return (
    <Box
      top="70px"
      right="20px"
      bg="white"
      position="absolute"
      boxShadow="lg"
      borderRadius="md"
      zIndex={1000}
      w="220px"
    >
      <Input value={value} mb={2} readOnly />

      <Grid templateColumns="repeat(4,1fr)" gap={2}>
        {[
          "7",
          "8",
          "9",
          "/",
          "4",
          "5",
          "6",
          "*",
          "1",
          "2",
          "3",
          "-",
          "0",
          ".",
          "=",
          "+",
        ].map((btn) =>
          btn === "=" ? (
            <Button key={btn} bg="orange.500" onClick={calculate}>
              =
            </Button>
          ) : (
            <Button
              key={btn}
              color="orange.400"
              onClick={() => handleClick(btn)}
            >
              {btn}
            </Button>
          )
        )}
      </Grid>

      <Flex mt={2} gap={2}>
        <Button size="sm" color="orange.400" w="full" onClick={clear}>
          AC
        </Button>
        <Button size="sm" w="full" variant="outline" onClick={onClose}>
          Close
        </Button>
      </Flex>
    </Box>
  );
};

export default Calculator;
