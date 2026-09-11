import { Box, Text, Flex, Icon } from "@chakra-ui/react";
import { FaChartBar } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const data = [
  { subject: "Mathematics", score: 78, average: 65 },
  { subject: "English", score: 85, average: 70 },
  { subject: "Physics", score: 65, average: 58 },
  { subject: "Chemistry", score: 72, average: 62 },
  { subject: "Biology", score: 80, average: 68 },
  { subject: "Economics", score: 88, average: 74 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        bg="#0F172A"
        color="white"
        p={3}
        borderRadius="xl"
        boxShadow="0 8px 20px rgba(0,0,0,0.2)"
        fontSize="12px"
      >
        <Text fontWeight="700" color="#C084FC" mb={1}>
          {label}
        </Text>
        <Text color="white">Class Average: {payload[0].value}%</Text>
      </Box>
    );
  }
  return null;
};

const Barchart = () => {
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
      <Flex justify="space-between" align="center" mb={4}>
        <Box>
          <Flex align="center" gap={2} mb={1}>
            <Icon as={FaChartBar} color="#7C3AED" boxSize={4} />
            <Text fontSize="16px" fontWeight="800" color="#0F172A" fontFamily="'Outfit', sans-serif">
              Subject Score Performance
            </Text>
          </Flex>
          <Text fontSize="12px" color="#64748B">
            Average test scores across key subjects
          </Text>
        </Box>

        <Box px={2.5} py={1} borderRadius="full" bg="purple.50" border="1px solid #E9D5FF">
          <Text fontSize="11px" fontWeight="700" color="#7C3AED">
            Term Average: 78.5%
          </Text>
        </Box>
      </Flex>

      <Box h="260px" w="100%">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="subject"
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
              tick={{ fontSize: 11, fill: "#64748B" }}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
              tick={{ fontSize: 11, fill: "#64748B" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="score"
              fill="url(#colorScore)"
              radius={[8, 8, 0, 0]}
              maxBarSize={42}
            />
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity={1} />
                <stop offset="100%" stopColor="#A855F7" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default Barchart;
