import { Box } from "@chakra-ui/react";

const StudentLayout = ({ children }) => {
  return (
    <Box bg="#0F172A" minH="100vh" w="100%" overflowX="hidden">
      <Box as="main" w="100%" minH="100vh">
        {children}
      </Box>
    </Box>
  );
};

export default StudentLayout;
