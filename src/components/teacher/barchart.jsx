import { Box, Text } from "@chakra-ui/react";
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
];

const Barchart = () => {
  return (
    <Box p={4} borderRadius="md" bg="white" w="35%" boxShadow="md">
      <Text mb={4}>Student Analytics</Text>
      <Box justify="center" align="center" h="35vh">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis />
            <Tooltip
              contentStyle={{ backgroundColor: "white", border: "none" }}
              cursor={{ fill: "rgba(255,127,80,0.2)" }}
            />
            <Bar
              dataKey="score"
              fill="coral"
              radius={[10, 10, 0, 0]}
              activeBar={{ fill: "coral" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default Barchart;
