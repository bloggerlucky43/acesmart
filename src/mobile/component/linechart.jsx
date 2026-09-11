import { Box, Text, Flex } from "@chakra-ui/react";
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
  { month: "Jan", candidates: 120, completed: 110 },
  { month: "Feb", candidates: 180, completed: 165 },
  { month: "Mar", candidates: 240, completed: 220 },
  { month: "Apr", candidates: 210, completed: 195 },
  { month: "May", candidates: 320, completed: 305 },
  { month: "Jun", candidates: 410, completed: 390 },
];

const Linechart = () => {
  return (
    <Box
      w="100%"
      bg="white"
      p={4}
      borderRadius="2xl"
      border="1px solid"
      borderColor="#E2E8F0"
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.02)"
    >
      <Flex justify="space-between" align="center" mb={3}>
        <Text fontSize="14px" fontWeight="800" color="#0F172A" fontFamily="'Outfit', sans-serif">
          Assessment Volume & Completion
        </Text>
        <Text fontSize="11px" color="#64748B">
          Last 6 Months
        </Text>
      </Flex>

      <Box h="220px">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                color: "#FFFFFF",
                borderRadius: "12px",
                border: "none",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
            <Line
              type="monotone"
              dataKey="candidates"
              name="Candidates"
              stroke="#6A1B9A"
              strokeWidth={2.5}
              dot={{ fill: "#6A1B9A", r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              name="Completed"
              stroke="#10B981"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ fill: "#10B981", r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default Linechart;
