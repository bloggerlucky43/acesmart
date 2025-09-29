import ListOfStudent from "../../../components/teacher/listofstudent";
import DashboardLayout from "../../../constants/dashboardlayout";
import { Box, useBreakpointValue } from "@chakra-ui/react";
import MobileLayout from "../../../mobile/constant/mobilelayout";
import MListOfStudent from "../../../mobile/pages/teacher/schoolmanagment/MViewStudent";
const ViewStudent = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  return (
    <Box>
      {isMobile ? (
        <MobileLayout>
          <MListOfStudent />
        </MobileLayout>
      ) : (
        <DashboardLayout>
          <ListOfStudent />
        </DashboardLayout>
      )}
    </Box>
  );
};

export default ViewStudent;
