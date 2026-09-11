import {
  Box,
  Button,
  Flex,
  Grid,
  Text,
  Icon,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaCalculator, FaTimes, FaBackspace } from "react-icons/fa";

const Calculator = ({ onClose }) => {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");

  const handleInput = (val) => {
    setExpression((prev) => prev + val);
  };

  const handleClear = () => {
    setExpression("");
    setResult("");
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const calculate = () => {
    if (!expression.trim()) return;
    try {
      // sanitize and replace display symbols
      const sanitized = expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/[^0-9+\-*/().]/g, "");

      // eslint-disable-next-line no-eval
      const evalResult = Function(`'use strict'; return (${sanitized})`)();
      const formatted = Number.isInteger(evalResult)
        ? evalResult.toString()
        : Number(evalResult.toFixed(4)).toString();

      setResult(formatted);
    } catch (err) {
      setResult("Error");
    }
  };

  return (
    <Box
      position="fixed"
      top="76px"
      right={{ base: "12px", md: "36px" }}
      bg="#1E293B"
      border="1px solid #334155"
      borderRadius="18px"
      p={4}
      boxShadow="0 20px 40px rgba(0, 0, 0, 0.5)"
      zIndex={1000}
      w="260px"
      color="white"
      animation="fadeIn 0.15s ease-out"
    >
      {/* Title Bar */}
      <Flex justify="space-between" align="center" mb={3} pb={2} borderBottom="1px solid #334155">
        <HStack spacing={2}>
          <Icon as={FaCalculator} color="#60A5FA" boxSize={3.5} />
          <Text fontSize="12px" fontWeight="bold" color="#CBD5E1">
            CBT Calculator
          </Text>
        </HStack>
        <IconButton
          size="xs"
          variant="ghost"
          color="#94A3B8"
          _hover={{ color: "white", bg: "#0F172A" }}
          onClick={onClose}
          aria-label="Close calculator"
        >
          <Icon as={FaTimes} boxSize={3} />
        </IconButton>
      </Flex>

      {/* LCD Display */}
      <Box
        bg="#0F172A"
        border="1px solid #334155"
        borderRadius="10px"
        p={2.5}
        mb={3}
        textAlign="right"
      >
        <Text fontSize="12px" color="#94A3B8" minH="18px" fontFamily="monospace" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
          {expression || "0"}
        </Text>
        <Text fontSize="20px" fontWeight="bold" color={result === "Error" ? "#F87171" : "white"} fontFamily="monospace" lineHeight="1.2">
          {result || "0"}
        </Text>
      </Box>

      {/* Keypad */}
      <Grid templateColumns="repeat(4, 1fr)" gap={1.5}>
        <Button size="sm" h="38px" bg="#334155" color="#F87171" fontWeight="bold" borderRadius="8px" onClick={handleClear} _hover={{ bg: "#475569" }}>
          C
        </Button>
        <Button size="sm" h="38px" bg="#334155" color="#CBD5E1" borderRadius="8px" onClick={handleBackspace} _hover={{ bg: "#475569" }}>
          <Icon as={FaBackspace} boxSize={3} />
        </Button>
        <Button size="sm" h="38px" bg="#334155" color="#60A5FA" fontWeight="bold" borderRadius="8px" onClick={() => handleInput("%")} _hover={{ bg: "#475569" }}>
          %
        </Button>
        <Button size="sm" h="38px" bg="#2563EB" color="white" fontWeight="bold" borderRadius="8px" onClick={() => handleInput("÷")} _hover={{ bg: "#1D4ED8" }}>
          ÷
        </Button>

        {["7", "8", "9"].map((num) => (
          <Button key={num} size="sm" h="38px" bg="#0F172A" border="1px solid #334155" color="white" borderRadius="8px" onClick={() => handleInput(num)} _hover={{ bg: "#334155" }}>
            {num}
          </Button>
        ))}
        <Button size="sm" h="38px" bg="#2563EB" color="white" fontWeight="bold" borderRadius="8px" onClick={() => handleInput("×")} _hover={{ bg: "#1D4ED8" }}>
          ×
        </Button>

        {["4", "5", "6"].map((num) => (
          <Button key={num} size="sm" h="38px" bg="#0F172A" border="1px solid #334155" color="white" borderRadius="8px" onClick={() => handleInput(num)} _hover={{ bg: "#334155" }}>
            {num}
          </Button>
        ))}
        <Button size="sm" h="38px" bg="#2563EB" color="white" fontWeight="bold" borderRadius="8px" onClick={() => handleInput("-")} _hover={{ bg: "#1D4ED8" }}>
          -
        </Button>

        {["1", "2", "3"].map((num) => (
          <Button key={num} size="sm" h="38px" bg="#0F172A" border="1px solid #334155" color="white" borderRadius="8px" onClick={() => handleInput(num)} _hover={{ bg: "#334155" }}>
            {num}
          </Button>
        ))}
        <Button size="sm" h="38px" bg="#2563EB" color="white" fontWeight="bold" borderRadius="8px" onClick={() => handleInput("+")} _hover={{ bg: "#1D4ED8" }}>
          +
        </Button>

        <Button size="sm" h="38px" bg="#0F172A" border="1px solid #334155" color="white" borderRadius="8px" onClick={() => handleInput("0")} _hover={{ bg: "#334155" }}>
          0
        </Button>
        <Button size="sm" h="38px" bg="#0F172A" border="1px solid #334155" color="white" borderRadius="8px" onClick={() => handleInput(".")} _hover={{ bg: "#334155" }}>
          .
        </Button>
        <Button size="sm" h="38px" bg="#059669" color="white" fontWeight="bold" borderRadius="8px" gridColumn="span 2" onClick={calculate} _hover={{ bg: "#047857" }}>
          =
        </Button>
      </Grid>
    </Box>
  );
};

export default Calculator;
