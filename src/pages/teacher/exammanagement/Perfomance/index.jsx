import DashboardLayout from "../../../../constants/dashboardlayout";
import MobileLayout from "../../../../mobile/constant/mobilelayout";

import { Box, useBreakpointValue } from "@chakra-ui/react";
import Results from "./component/results";

const Performance = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  return (
    <Box>
      {isMobile ? (
        <MobileLayout></MobileLayout>
      ) : (
        <DashboardLayout>
          <Results />
        </DashboardLayout>
      )}
    </Box>
  );
};

export default Performance;
