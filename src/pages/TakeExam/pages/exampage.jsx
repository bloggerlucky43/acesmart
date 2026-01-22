import StudentLayout from "../../../constants/studentLayout";
import { Box } from "@chakra-ui/react";
import ExamTopBar from "../component/ExamTopBar";
import ExamBody from "../component/ExamBody";

const Dashboard = () => {
  return (
    <StudentLayout>
      <Box>
        <ExamTopBar />
        <ExamBody />
      </Box>
    </StudentLayout>
  );
};

export default Dashboard;
