import { Box } from "@chakra-ui/react";
import MobileNavBar from "../component/MobileNavbar";

const MobileLayout = ({ children }) => {
  return (
    <Box minH="100vh" bg="#F8FAFC">
      <MobileNavBar />
      <Box as="main" pt="58px" p={4} minH="calc(100vh - 58px)" bg="#F8FAFC">
        {children}
      </Box>
    </Box>
  );
};

export default MobileLayout;
