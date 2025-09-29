import { Box, useBreakpointValue } from "@chakra-ui/react";
import AddExam from "../../../components/teacher/exam/addExam";
import DashboardLayout from "../../../constants/dashboardlayout";
import MobileLayout from "../../../mobile/constant/mobilelayout";
import MobileAddExam from "../../../mobile/component/exammanagement/MobileAddExam";

const CreateExam = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  return (
    <Box>
      {isMobile ? (
        <MobileLayout>
          <MobileAddExam />
        </MobileLayout>
      ) : (
        <DashboardLayout>
          <AddExam />
        </DashboardLayout>
      )}
    </Box>
  );
};
export default CreateExam;
