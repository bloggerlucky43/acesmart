import { Box, Text } from "@chakra-ui/react";
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
  { month: "Jan", students: 30, revenue: 400 },
  { month: "Feb", students: 45, revenue: 300 },
  { month: "Mar", students: 60, revenue: 500 },
  { month: "Apr", students: 50, revenue: 450 },
  { month: "May", students: 70, revenue: 600 },
  { month: "Jun", students: 90, revenue: 700 },
];

const Linechart = () => {
  return (
    <Box w="100%" mt={2} bg="white" p={2} borderRadius="lg" boxShadow="md">
      <Text fontSize="md" mb={4}>
        Student Growth & Trend
      </Text>
      <Box h="38vh">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />

            {/* student growth line */}
            <Line
              type="monotone"
              dataKey="students"
              stroke="#8884d8"
              strokeWidth={2}
            />

            {/* revenue line */}
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#82ca9d"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default Linechart;
