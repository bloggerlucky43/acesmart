import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Box, Text, Flex, Icon } from "@chakra-ui/react";
import { FaCheckCircle, FaTimesCircle, FaChartPie } from "react-icons/fa";

const data = [
  { name: "Pass", value: 75, color: "#10B981" },
  { name: "Fail", value: 25, color: "#EF4444" },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <Box
        bg="#0F172A"
        color="white"
        p={2.5}
        borderRadius="xl"
        fontSize="12px"
        boxShadow="0 4px 12px rgba(0,0,0,0.2)"
      >
        <Text fontWeight="700">{item.name}: {item.value}%</Text>
      </Box>
    );
  }
  return null;
};

const Piechart = () => {
  return (
    <Box
      p={6}
      borderRadius="24px"
      bg="white"
      border="1px solid"
      borderColor="#E2E8F0"
      boxShadow="0 2px 12px rgba(0, 0, 0, 0.03)"
      w="100%"
      h="100%"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <Flex justify="space-between" align="center" mb={2}>
        <Box>
          <Flex align="center" gap={2} mb={1}>
            <Icon as={FaChartPie} color="#10B981" boxSize={4} />
            <Text fontSize="16px" fontWeight="800" color="#0F172A" fontFamily="'Outfit', sans-serif">
              Pass / Fail Ratio
            </Text>
          </Flex>
          <Text fontSize="12px" color="#64748B">
            Overall student benchmark completion
          </Text>
        </Box>
      </Flex>

      <Box position="relative" h="200px" w="100%">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Metric */}
        <Flex
          position="absolute"
          inset={0}
          direction="column"
          align="center"
          justify="center"
          pointerEvents="none"
        >
          <Text fontSize="22px" fontWeight="800" color="#0F172A" lineHeight="1">
            75%
          </Text>
          <Text fontSize="11px" fontWeight="600" color="#64748B">
            Passed
          </Text>
        </Flex>
      </Box>

      {/* Legend Badges */}
      <Flex justify="center" gap={6} pt={2} borderTop="1px solid" borderColor="#F1F5F9">
        <Flex align="center" gap={2}>
          <Icon as={FaCheckCircle} color="#10B981" boxSize={3.5} />
          <Text fontSize="13px" fontWeight="700" color="#334155">
            Passed (75%)
          </Text>
        </Flex>
        <Flex align="center" gap={2}>
          <Icon as={FaTimesCircle} color="#EF4444" boxSize={3.5} />
          <Text fontSize="13px" fontWeight="700" color="#334155">
            Needs Review (25%)
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Piechart;
