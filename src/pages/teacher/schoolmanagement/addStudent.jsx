import DashboardLayout from "../../../constants/dashboardlayout";
import NewStudent from "../../../components/auth/newStudent";
import MobileLayout from "../../../mobile/constant/mobilelayout";
import { Box, useBreakpointValue } from "@chakra-ui/react";
import MNewStudent from "../../../mobile/pages/teacher/schoolmanagment/MNewStudent";
const AddStudent = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  return (
    <Box>
      {isMobile ? (
        <MobileLayout>
          <MNewStudent />
        </MobileLayout>
      ) : (
        <DashboardLayout>
          <NewStudent />
        </DashboardLayout>
      )}
    </Box>
  );
};

export default AddStudent;
