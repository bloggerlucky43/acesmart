import { Box } from "@chakra-ui/react";

import Sidebar from "../components/student/sidebar";
const StudentLayout = ({ children }) => {
  return (
    <Box bg="gray.200" minH="100vh">
      <Box>{/* <Sidebar /> */}</Box>
      <Box>{children}</Box>
    </Box>
  );
};

export default StudentLayout;
