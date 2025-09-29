import { Box } from "@chakra-ui/react";
import Navbar from "../components/student/navbar";
import Sidebar from "../components/student/sidebar";
const StudentLayout = ({ children }) => {
  return (
    <Box>
      <Box>
        <Sidebar />
        <Navbar />
      </Box>
      <Box>{children}</Box>
    </Box>
  );
};

export default StudentLayout;
