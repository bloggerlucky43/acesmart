import StudentLayout from "../../../constants/studentLayout";
import { Box, Text } from "@chakra-ui/react";
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
