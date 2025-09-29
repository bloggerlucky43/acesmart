import { Box } from "@chakra-ui/react";
import MobileNavBar from "../component/MobileNavbar";
const MobileLayout = ({ children }) => {
  return (
    <Box>
      <Box>
        <MobileNavBar />
        <Box bg="gray.200">{children}</Box>
      </Box>
    </Box>
  );
};

export default MobileLayout;
