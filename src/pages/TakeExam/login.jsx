import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
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
import { examLogin } from "../../api-endpoint/exam/exams";
// import FaceVerificationModal from "./component/face/CaptureImage";

const ExamLoginPage = () => {
  const [examDetail, setExamDetail] = useState({
    studentId: "",
    firstName: "",
  });
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [error, setError] = useState("");
  const [examStudent, setExamStudent] = useState(null);
  // const [showFaceModal, setShowFaceModal] = useState(false);
  console.log(examDetail, id);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (window.innerWidth < 768) {
      toaster.warning({ title: "Exam not allowed on small devices" });
      return;
    }

    if (!examDetail.firstName && !examDetail.studentId && !id) {
      toaster.error({ title: "Exam key or student ID is invalid" });
      return;
    }
    setLoading(true);

    try {
      const res = await examLogin(examDetail);
      if (res.success) {
        toaster.create({
          title: res.message,
          type: "success",
        });

        console.log(res);

        setExamStudent(res.student);
        localStorage.setItem("examStudent", JSON.stringify(res.student));
        navigate(`/ex/${id}`);
        // setShowFaceModal(true);
      }
    } catch (error) {
      setError("Invalid credentials. Please check your details");
    } finally {
      setLoading(false);
    }
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
                      value={examDetail.firstName}
                      onChange={(e) =>
                        setExamDetail({
                          ...examDetail,
                          firstName: e.target.value,
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

      {/* {showFaceModal && (
        <FaceVerificationModal
          isOpen={showFaceModal}
          studentId={examDetail.studentId}
          onClose={() => setShowFaceModal(false)}
          onSuccess={() => {
            localStorage.setItem("examStudent", JSON.stringify(examStudent));
            navigate(`/ex/${id}`);
          }}
        />
      )} */}
    </Box>
  );
};

export default ExamLoginPage;
