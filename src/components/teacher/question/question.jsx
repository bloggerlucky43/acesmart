import {
  Box,
  Fieldset,
  Field,
  Input,
  NativeSelect,
  Flex,
  Text,
  Button,
  VStack,
  IconButton,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { Tooltip } from "../../ui/tooltip";

const Question = () => {
  const [subject, setSubject] = useState("");
  const [questions, setQuestions] = useState([
    { type: "multiple", question: "", options: ["", "", "", ""], answer: "" },
  ]);

  //handle mcq option changes
  const handleQuestionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex][oIndex] = value;
    setQuestions(updated);
  };
  console.log(questions);

  //handle type change (reset options accordingly)
  const handleTypeChange = (index, value) => {
    const updated = [...questions];
    updated[index].type = value;
    updated[index].options =
      value === "boolean" ? ["True", "False"] : ["", "", "", ""];
    updated[index].answer = "";
    setQuestions(updated);
  };

  //add new question(max10)
  const addQuestion = () => {
    if (questions.length < 10) {
      setQuestions([
        ...questions,
        {
          type: "multiple",
          question: "",
          options: ["", "", "", ""],
          answer: "",
        },
      ]);
    }
  };

  //remove a question
  const removeQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  //submit all
  const handleSubmit = () => {
    const payload = {
      subject,
      questions,
    };
    console.log("Submitted:", payload);
  };

  return (
    <Box
      bg="gray.200"
      boxShadow="lg"
      mt="12vh"
      borderRadius="md"
      ml="18vw"
      w="50%"
      justifySelf="center"
      p={4}
    >
      <Box p={2} mx="auto">
        <Box bg="white" boxShadow="md" borderRadius="md" py={6} px={3}>
          <Field.Root display="flex" flexDir={"row"} required>
            <Input
              type="text"
              variant="flushed"
              borderColor="gray.900"
              w="100%"
              placeholder="Enter subject or course"
              value={subject}
              _focus={{ borderColor: "primary" }}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </Field.Root>
        </Box>

        <VStack align="stretch">
          {questions.map((q, index) => (
            <Box
              key={index}
              mt={4}
              p={4}
              borderRadius="lg"
              boxShadow="md"
              bg="white"
            >
              <Flex align="center" gap={2} mb={4}>
                <Field.Root required>
                  <Input
                    type="text"
                    variant="flushed"
                    bg="gray.200"
                    px={2}
                    borderColor="gray.900"
                    placeholder="Question"
                    value={q.question}
                    _focus={{ borderColor: "primary" }}
                    onChange={(e) =>
                      handleQuestionChange(index, "question", e.target.value)
                    }
                  />
                </Field.Root>

                <Field.Root w="30%" required>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      value={q.type}
                      onChange={(e) => handleTypeChange(index, e.target.value)}
                      borderColor="gray.800"
                    >
                      <option value="multiple">Multiple Choice</option>
                      <option value="boolean">True / False</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Field.Root>
              </Flex>

              {/* options */}
              {q.type === "multiple" ? (
                <VStack spacing={2} align="stretch">
                  {q.options.map((opt, oIndex) => (
                    <Input
                      key={oIndex}
                      variant="flushed"
                      _focus={{ borderColor: "primary" }}
                      placeholder={`Option ${oIndex + 1}`}
                      value={opt}
                      onChange={(e) =>
                        handleQuestionChange(index, oIndex, e.target.value)
                      }
                    />
                  ))}
                </VStack>
              ) : (
                <Text>Options: True / False</Text>
              )}

              {/* correct answer */}
              <Field.Root required>
                <Input
                  variant="flushed"
                  mt={2}
                  borderColor="secondary"
                  placeholder="Enter correct answer"
                  value={q.answer}
                  onChange={(e) =>
                    handleQuestionChange(index, "answer", e.target.value)
                  }
                />
              </Field.Root>

              <Flex mt={4} align="center" justify="right">
                {questions.length < 10 && (
                  <Box>
                    <Tooltip
                      label="Add Question"
                      content="Add a new question"
                      placement="top"
                    >
                      <IconButton
                        variant="ghost"
                        color="secondary"
                        onClick={addQuestion}
                      >
                        <FaPlusCircle size={24} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}

                {/* remove question if more than 1 */}
                {questions.length > 1 && (
                  <Box>
                    <Tooltip
                      label="Remove Question"
                      content="Remove this question"
                      placement="top"
                    >
                      <IconButton
                        variant="ghost"
                        onClick={() => removeQuestion(index)}
                      >
                        <FiTrash2 size={20} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Flex>
            </Box>
          ))}
        </VStack>

        <Flex justify="right" mt={4}>
          <Button type="submit" size="md" bg="secondary">
            Submit All
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default Question;
