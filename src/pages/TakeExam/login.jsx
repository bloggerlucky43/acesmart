import { useParams } from "react-router-dom";
import {
  Box,
  Heading,
  Fieldset,
  Field,
  Flex,
  Button,
  Text,
  Input,
  Icon,
  useBreakpointValue,
} from "@chakra-ui/react";
import { PasswordInput } from "../../components/ui/password-input";
import { FaBrain } from "react-icons/fa";
import { useState } from "react";
import { toaster } from "../../components/ui/toaster";
const ExamLoginPage = () => {
  const [examDetail, setExamDetail] = useState({ studentId: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  console.log(examDetail);
  const handleSubmit = (e) => {
    e.preventDefault();

    if (window.innerWidth < 768) {
      toaster.warning({ title: "Exam not allowed on small devices" });
      return;
    }

    if (!examDetail.password && !examDetail.studentId && !id) {
      toaster.error({ title: "Exam key or student ID is invalid" });
      return;
    }
    setLoading(true);
  };

  return (
    <Box bg="gray.200" h="100vh" w="100%">
      <Flex
        direction="column"
        w={isMobile ? "100%" : "50%"}
        h="100vh"
        align="center"
        justify="center"
        justifySelf="center"
      >
        <Flex
          direction="column"
          justify="center"
          align="center"
          bg="white"
          h="50vh"
          w="80%"
          p={2}
          borderRadius="lg"
          boxShadow="2xl"
        >
          <Flex align="center" gap={2}>
            <Icon
              as={FaBrain}
              boxSize={10}
              color="white"
              p={2}
              borderRadius="md"
              bg="primary"
            />
            <Text fontSize="xl" fontWeight={"bold"}>
              Ace<span style={{ color: "#6A1B9A" }}>Smart</span>
            </Text>
          </Flex>

          <Fieldset.Root>
            <form style={{ width: "100%" }} onSubmit={handleSubmit}>
              <Box mt={8} w="100%" p={2}>
                <Fieldset.Content>
                  <Field.Root required>
                    <Field.Label>
                      Registration Number <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      type="text"
                      borderColor="gray.600"
                      _focus={{
                        outline: "none",
                        borderColor: "primary",
                      }}
                      value={examDetail.studentId}
                      onChange={(e) =>
                        setExamDetail({
                          ...examDetail,
                          studentId: e.target.value,
                        })
                      }
                      placeholder="Enter your registration number"
                      required
                    />
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label>
                      Password
                      <Field.RequiredIndicator />
                    </Field.Label>

                    <PasswordInput
                      borderColor="gray.600"
                      _focus={{ outline: "none", borderColor: "primary" }}
                      value={examDetail.password}
                      onChange={(e) =>
                        setExamDetail({
                          ...examDetail,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </Field.Root>
                </Fieldset.Content>
                <Button
                  type="submit"
                  bg="primary"
                  w="full"
                  mt={4}
                  borderRadius="md"
                  loading={loading}
                  loadingText="Authenticating..."
                  spinnerPlacement="start"
                >
                  Login
                </Button>
              </Box>
            </form>
          </Fieldset.Root>
        </Flex>
      </Flex>
    </Box>
  );
};

export default ExamLoginPage;
