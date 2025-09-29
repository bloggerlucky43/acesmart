import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Box, Text, Flex } from "@chakra-ui/react";

const data = [
  { name: "Pass", value: 75 },
  { name: "Fail", value: 25 },
];

const COLORS = ["#00C49F", "#FF8042"];

const Piechart = () => {
  return (
    <Box bg="white" borderRadius="lg" p={4} boxShadow="md" w="25%">
      <Text>Pass or Fail analysis</Text>
      <Flex h="35vh" justify="center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              outerRadius={80}
              fill="#8884d8"
              label>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Flex>
    </Box>
  );
};

export default Piechart;
