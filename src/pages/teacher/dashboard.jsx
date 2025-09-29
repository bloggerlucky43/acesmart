import Cards from "../../components/teacher/cards";
import Performance from "../../components/teacher/performance";
import DashboardLayout from "../../constants/dashboardlayout";
import MCards from "../../mobile/component/cards";
import MPerformance from "../../mobile/component/performance";
import MobileLayout from "../../mobile/constant/mobilelayout";

import { Box, useBreakpointValue } from "@chakra-ui/react";
const Teacher = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  return (
    <Box>
      {isMobile ? (
        <MobileLayout>
          <MCards />
          <MPerformance />
        </MobileLayout>
      ) : (
        <DashboardLayout>
          <Performance />
          <Cards />
        </DashboardLayout>
      )}
    </Box>
  );
};

export default Teacher;
