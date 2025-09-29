import { Box } from "@chakra-ui/react";
import Sidebar from "../components/teacher/sidebar";
import Navbar from "../components/teacher/navbar";

const DashboardLayout = ({ children }) => {
  return (
    <Box bg="gray.200">
      <Box>
        <Sidebar />
        <Navbar />
        <Box>{children}</Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
