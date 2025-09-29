import StudentEditor from "../../../components/teacher/studentEditor";
import DashboardLayout from "../../../constants/dashboardlayout";
import { Box, useBreakpointValue } from "@chakra-ui/react";
import { MStudentEditor } from "../../../mobile/pages/teacher/schoolmanagment/StudentEditor";
import MobileLayout from "../../../mobile/constant/mobilelayout";
const EditStudent = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  return (
    <Box>
      {isMobile ? (
        <MobileLayout>
          <MStudentEditor />
        </MobileLayout>
      ) : (
        <DashboardLayout>
          <StudentEditor />
        </DashboardLayout>
      )}
    </Box>
  );
};

export default EditStudent;
