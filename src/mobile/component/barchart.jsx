import { Box, Text, Flex } from "@chakra-ui/react";
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
  { subject: "Math", score: 78 },
  { subject: "English", score: 85 },
  { subject: "Physics", score: 65 },
  { subject: "Chemistry", score: 72 },
  { subject: "Biology", score: 80 },
];

const Barchart = () => {
  return (
    <Box
      p={4}
      borderRadius="2xl"
      bg="white"
      w="100%"
      border="1px solid"
      borderColor="#E2E8F0"
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.02)"
    >
      <Flex justify="space-between" align="center" mb={3}>
        <Text fontSize="14px" fontWeight="800" color="#0F172A" fontFamily="'Outfit', sans-serif">
          Subject Performance Overview
        </Text>
        <Text fontSize="11px" color="#64748B">
          Cohort Averages
        </Text>
      </Flex>

      <Box h="220px">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="subject" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                color: "#FFFFFF",
                borderRadius: "12px",
                border: "none",
                fontSize: "12px",
              }}
              cursor={{ fill: "rgba(106, 27, 154, 0.06)" }}
            />
            <Bar
              dataKey="score"
              fill="#6A1B9A"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default Barchart;
