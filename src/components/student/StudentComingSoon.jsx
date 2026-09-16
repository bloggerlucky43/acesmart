import { Box, Flex, Text, Icon, Button, Badge, SimpleGrid } from "@chakra-ui/react";
import {
  FaClipboardList,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import StudentPageHeading from "./StudentPageHeading";
import { getStudentPageInfo } from "../../constants/studentNav";

const StudentComingSoon = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const info = getStudentPageInfo(pathname);

  const title = info?.title || "Coming Soon";
  const description =
    info?.description || "This section is being prepared for your school.";
  const planned = info?.planned || [];

  return (
    <Box>
      <StudentPageHeading
        title={title}
        description={description}
        icon={FaClipboardList}
        action={
          <Badge
            bg="#FEF3C7"
            color="#92400E"
            px={3}
            py={1.5}
            borderRadius="full"
            fontWeight="800"
            fontSize="11px"
          >
            IN DEVELOPMENT
          </Badge>
        }
      />

      <Box
        bg="white"
        borderRadius="2xl"
        border="1px solid #E2E8F0"
        boxShadow="0 4px 16px rgba(0,0,0,0.02)"
        p={{ base: 6, md: 8 }}
      >
        <Flex align="center" gap={4} mb={6} wrap="wrap">
          <Flex
            w="56px"
            h="56px"
            borderRadius="2xl"
            bg="#EEF2FF"
            color="#4338CA"
            align="center"
            justify="center"
            flexShrink={0}
          >
            <Icon as={FaClipboardList} boxSize={6} />
          </Flex>
          <Box>
            <Text fontSize="16px" fontWeight="800" color="#0F172A">
              This page is already routed and will switch on automatically
            </Text>
            <Text fontSize="13px" color="#64748B" mt={0.5}>
              Your school needs to publish the data for this section before it
              becomes available in the portal.
            </Text>
          </Box>
        </Flex>

        {planned.length > 0 && (
          <>
            <Text
              fontSize="11px"
              fontWeight="800"
              color="#64748B"
              letterSpacing="1px"
              mb={3}
            >
              WHAT WILL APPEAR HERE
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} mb={7}>
              {planned.map((item) => (
                <Flex
                  key={item}
                  align="center"
                  gap={2.5}
                  bg="#F8FAFC"
                  border="1px solid #E2E8F0"
                  borderRadius="xl"
                  px={4}
                  py={3}
                >
                  <Icon as={FaCheckCircle} color="#10B981" boxSize={3.5} />
                  <Text fontSize="13px" color="#334155" fontWeight="600">
                    {item}
                  </Text>
                </Flex>
              ))}
            </SimpleGrid>
          </>
        )}

        <Button
          bg="#4338CA"
          color="white"
          borderRadius="xl"
          fontWeight="700"
          _hover={{ opacity: 0.95 }}
          onClick={() => navigate("/student")}
        >
          <Icon as={FaArrowLeft} mr={2} boxSize={3} />
          Back to Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default StudentComingSoon;
