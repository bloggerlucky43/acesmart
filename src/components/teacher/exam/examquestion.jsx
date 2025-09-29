import { Box, Text, Button, Table, Flex } from "@chakra-ui/react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function ExamQuestion() {
  const [examQuestions, setExamQuestions] = useState([]);

  const [searchParams] = useSearchParams();
  const examId = searchParams.get("exam_question");
  return (
    <Box mt="9vh" minH="100vh" p={6} w="50%" justifySelf="center">
      <Flex mb={4}>
        <Text>Exam Questions</Text>
      </Flex>
      <Box align="start">
        <Table.ScrollArea borderWidth="1px" rounded="md">
          <Table.Root size="md" stickyHeader>
            <Table.Header>
              <Table.Row bg="primary">
                <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                  Questions
                </Table.ColumnHeader>
                <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                  Options
                </Table.ColumnHeader>
                <Table.ColumnHeader color="whiteAlpha.950" textAlign="center">
                  Actions
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {examQuestions.map((q) => (
                <Table.Row bg="white" key={q.id}>
                  <Table.Cell textAlign="center">{q.question}</Table.Cell>
                  <Table.Cell textAlign="center">{q.options}</Table.Cell>
                  <Table.Cell textAlign="center">
                    <Button size="sm" colorScheme="red">
                      Delete
                    </Button>
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
