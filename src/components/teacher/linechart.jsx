import { Box, Text, Flex, Icon } from "@chakra-ui/react";
import { FaChartLine } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", candidates: 45, averageScore: 68 },
  { month: "Feb", candidates: 65, averageScore: 72 },
  { month: "Mar", candidates: 120, averageScore: 75 },
  { month: "Apr", candidates: 180, averageScore: 78 },
  { month: "May", candidates: 250, averageScore: 82 },
  { month: "Jun", candidates: 340, averageScore: 85 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        bg="#0F172A"
        color="white"
        p={3}
        borderRadius="xl"
        fontSize="12px"
        boxShadow="0 8px 20px rgba(0,0,0,0.2)"
      >
        <Text fontWeight="800" color="#C084FC" mb={1.5}>
          {label} Session
        </Text>
        <Text color="#A7F3D0">Candidates Tested: {payload[0]?.value}</Text>
        <Text color="#BAE6FD">Average Score: {payload[1]?.value}%</Text>
      </Box>
    );
  }
  return null;
};

const Linechart = () => {
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
            <Icon as={FaChartLine} color="#2563EB" boxSize={4} />
            <Text fontSize="16px" fontWeight="800" color="#0F172A" fontFamily="'Outfit', sans-serif">
              Candidate Testing & Score Trends
            </Text>
          </Flex>
          <Text fontSize="12px" color="#64748B">
            Monthly participation growth & overall grade progression
          </Text>
        </Box>

        <Box px={2.5} py={1} borderRadius="full" bg="blue.50" border="1px solid #BFDBFE">
          <Text fontSize="11px" fontWeight="700" color="#2563EB">
            +18% Monthly Growth
          </Text>
        </Box>
      </Flex>

      <Box h="260px" w="100%">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
              tick={{ fontSize: 11, fill: "#64748B" }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
              tick={{ fontSize: 11, fill: "#64748B" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            <Line
              type="monotone"
              name="Candidates Tested"
              dataKey="candidates"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ r: 4, fill: "#10B981" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              name="Avg Score (%)"
              dataKey="averageScore"
              stroke="#6A1B9A"
              strokeWidth={3}
              dot={{ r: 4, fill: "#6A1B9A" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default Linechart;
