import DashboardLayout from "../../../../constants/dashboardlayout";
import ResultDetails from "./component/resultDetails";
import { Box, useBreakpointValue } from "@chakra-ui/react";
import MobileLayout from "../../../../mobile/constant/mobilelayout";
import { MResultPage } from "./MResultPage";
export const ResultPage = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });

  return (
    <Box>
      {isMobile ? (
        <MobileLayout>
          <MResultPage />
        </MobileLayout>
      ) : (
        <DashboardLayout>
          <ResultDetails />
        </DashboardLayout>
      )}
    </Box>
  );
};
