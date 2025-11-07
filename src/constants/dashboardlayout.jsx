import { Box } from "@chakra-ui/react";
import Sidebar from "../components/teacher/sidebar";
import Navbar from "../components/teacher/navbar";

const DashboardLayout = ({ children }) => {
  return (
    <Box>
      <Box>
        <Sidebar />
        <Navbar />
        <Box overflow={"hidden"}>{children}</Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
