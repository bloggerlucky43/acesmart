import { Box } from "@chakra-ui/react";
import MobileNavBar from "../component/MobileNavbar";

const MobileLayout = ({ children }) => {
  return (
    <Box minH="100vh" bg="#F8FAFC">
      <MobileNavBar />
      <Box
        as="main"
        pt="76px"
        px={{ base: 3, sm: 4 }}
        pb={8}
        minH="calc(100vh - 76px)"
        bg="#F8FAFC"
      >
        {children}
      </Box>
    </Box>
  );
};

export default MobileLayout;
