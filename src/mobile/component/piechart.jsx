import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Box, Text, Flex, HStack, Badge } from "@chakra-ui/react";

const data = [
  { name: "Passed", value: 78 },
  { name: "Review Needed", value: 22 },
];

const COLORS = ["#10B981", "#F43F5E"];

const Piechart = () => {
  return (
    <Box
      bg="white"
      borderRadius="2xl"
      p={4}
      border="1px solid"
      borderColor="#E2E8F0"
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.02)"
      w="100%"
    >
      <Flex justify="space-between" align="center" mb={2}>
        <Text fontSize="14px" fontWeight="800" color="#0F172A" fontFamily="'Outfit', sans-serif">
          Pass vs. Review Distribution
        </Text>
        <Badge bg="green.50" color="green.700" borderRadius="full" px={2} py={0.5} fontSize="10px">
          78% Benchmark Pass
        </Badge>
      </Flex>

      <Flex h="200px" justify="center" align="center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              outerRadius={75}
              innerRadius={45}
              paddingAngle={4}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                color: "#FFFFFF",
                borderRadius: "12px",
                border: "none",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Flex>

      <HStack justify="center" spacing={6} pt={2} borderTop="1px solid #F1F5F9">
        <HStack spacing={1.5}>
          <Box w="10px" h="10px" borderRadius="full" bg="#10B981" />
          <Text fontSize="12px" color="#64748B" fontWeight="600">Passed (78%)</Text>
        </HStack>
        <HStack spacing={1.5}>
          <Box w="10px" h="10px" borderRadius="full" bg="#F43F5E" />
          <Text fontSize="12px" color="#64748B" fontWeight="600">Needs Review (22%)</Text>
        </HStack>
      </HStack>
    </Box>
  );
};

export default Piechart;
