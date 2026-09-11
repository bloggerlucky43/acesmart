import DashboardLayout from "../../../../constants/dashboardlayout";
import { Box, useBreakpointValue } from "@chakra-ui/react";
import MobileLayout from "../../../../mobile/constant/mobilelayout";
import { MResultPage } from "./MResultPage";

const ResultPage = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });

  return (
    <Box>
      {isMobile ? (
        <MobileLayout>
          <MResultPage />
        </MobileLayout>
      ) : (
        <DashboardLayout>
          <Box
            ml={{ base: 0, lg: "240px" }}
            w={{ base: "100%", lg: "calc(100% - 240px)" }}
            pt={{ base: "84px", lg: "88px" }}
            px={{ base: 4, md: 6, lg: 8 }}
            pb={{ base: 6, md: 8 }}
            maxW="1600px"
          >
            <MResultPage />
          </Box>
        </DashboardLayout>
      )}
    </Box>
  );
};

export default ResultPage;
