import { Box, useBreakpointValue } from "@chakra-ui/react";
import EditPage from "../../../components/teacher/exam/EditPage";
import DashboardLayout from "../../../constants/dashboardlayout";
import MobileLayout from "../../../mobile/constant/mobilelayout";
import MobileEditExamDetails from "../../../mobile/component/exammanagement/EditExamDetails";

const ExamSettings = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });

  return (
    <Box>
      {isMobile ? (
        <MobileLayout>
          <MobileEditExamDetails />
        </MobileLayout>
      ) : (
        <DashboardLayout>
          <EditPage />
        </DashboardLayout>
      )}
    </Box>
  );
};

export default ExamSettings;
