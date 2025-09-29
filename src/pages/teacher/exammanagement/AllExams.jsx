import Exams from "../../../components/teacher/exam/Exams";
import DashboardLayout from "../../../constants/dashboardlayout";
import { Box, useBreakpointValue } from "@chakra-ui/react";
import MobileExams from "../../../mobile/component/exammanagement/MobileExams";
import MobileLayout from "../../../mobile/constant/mobilelayout";
const AllExams = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  return (
    <Box>
      {isMobile ? (
        <MobileLayout>
          <MobileExams />
        </MobileLayout>
      ) : (
        <DashboardLayout>
          <Exams />
        </DashboardLayout>
      )}
    </Box>
  );
};

export default AllExams;
