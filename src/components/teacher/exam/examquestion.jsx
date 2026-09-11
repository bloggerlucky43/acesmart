import { Box, Text, Button, Table, Flex } from "@chakra-ui/react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function ExamQuestion() {
  const [examQuestions, setExamQuestions] = useState([]);

  const [searchParams] = useSearchParams();
  const examId = searchParams.get("exam_question");

  return (
    <Box
      mt="68px"
      ml={{ base: 0, lg: "240px" }}
      w={{ base: "100%", lg: "calc(100% - 240px)" }}
      minH="calc(100vh - 68px)"
      p={{ base: 4, md: 8 }}
      bg="#F8FAFC"
    >
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
