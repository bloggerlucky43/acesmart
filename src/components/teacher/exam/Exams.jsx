import {
  Box,
  Text,
  Flex,
  Table,
  Input,
  Button,
  Fieldset,
} from "@chakra-ui/react";
import { AllExamsData } from "./dummyData";
import { useNavigate } from "react-router-dom";
export default function Exams() {
  const navigate = useNavigate();

  const handleEdit = (examId) => navigate(`/teacher/exams/edit?exam=${examId}`);
  return (
    <Box bg="gray.200" p={4} w="50%" justifySelf="center" mt="12vh">
      <Flex mb={4} justify="space-between" align="center">
        <Text>All Exams</Text>
      </Flex>
      <Box align="start">
        <Table.ScrollArea borderWidth="1px" rounded="md">
          <Table.Root size="md" stickyHeader>
            <Table.Header>
              <Table.Row bg="primary">
                <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                  Exam Title
                </Table.ColumnHeader>
                <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                  Subject/Exam Type
                </Table.ColumnHeader>
                <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                  Duration
                </Table.ColumnHeader>
                <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                  Status
                </Table.ColumnHeader>
                <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                  Start Date
                </Table.ColumnHeader>
                <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                  End Date
                </Table.ColumnHeader>
                <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                  Actions
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {AllExamsData.map((exam) => (
                <Table.Row bg="white" key={exam.id}>
                  <Table.Cell textAlign="center">{exam.title}</Table.Cell>
                  <Table.Cell textAlign="center">{exam.subject}</Table.Cell>
                  <Table.Cell textAlign="center">{exam.duration}</Table.Cell>
                  <Table.Cell textAlign="center">{exam.status}</Table.Cell>
                  <Table.Cell textAlign="center">{exam.startDate}</Table.Cell>
                  <Table.Cell textAlign="center">{exam.endDate}</Table.Cell>
                  <Table.Cell textAlign="center">
                    <Flex justify="center" align="center" gap={2}>
                      <Button
                        bg="secondary"
                        _hover={{ transform: "scale(1.05)" }}
                        onClick={() => handleEdit(exam.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        bg="danger"
                        color="gray.900"
                        _hover={{ transform: "scale(1.05)" }}
                      >
                        Delete
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      </Box>
    </Box>
  );
}
