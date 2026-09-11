import { Box } from "@chakra-ui/react";
import Sidebar from "../components/teacher/sidebar";
import Navbar from "../components/teacher/navbar";

const DashboardLayout = ({ children }) => {
  return (
    <Box minH="100vh" bg="#F8FAFC">
      <Sidebar />
      <Navbar />
      <Box minH="100vh" bg="#F8FAFC" overflowX="hidden">
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
