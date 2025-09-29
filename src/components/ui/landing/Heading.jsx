import {
  Box,
  Button,
  Flex,
  Text,
  Avatar,
  Icon,
  useBreakpointValue,
} from "@chakra-ui/react";
import exam from "../../../assets/exam.jpg";
import { FaStar } from "react-icons/fa";

const Heading = ({ homeRef }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  return (
    <Box
      ref={homeRef}
      h="70vh"
      mt={isMobile ? "8vh" : "10vh"}
      left={0}
      right={0}
      bgImage={`url(${exam})`}
      bgPos="center"
      bgSize="cover"
      bgRepeat="no-repeat">
      <Box
        position="relative"
        p={8}
        justifyItems="center"
        alignItems="center"
        bg="purple.900"
        textAlign="center"
        minH="70vh"
        opacity={0.8}>
        <Text
          color="white"
          mt={8}
          fontSize={isMobile ? "2xl" : "5xl"}
          fontFamily={"cursive"}>
          Ace Your Exams with Confidence
        </Text>
        <Text color="whiteAlpha.800" fontSize={"lg"} mt={4} mb={8}>
          Access thousands of past questions, prepare with personalized tests,
          and track your progress.
        </Text>

        <Flex gap={4} mt={4}>
          <Button
            bg="white"
            color="primary"
            size="lg"
            _hover={{ transform: "scale(1.1)" }}>
            Get Started
          </Button>
          <Button
            bg="none"
            size="lg"
            borderColor="white"
            _hover={{ bg: "whiteAlpha.200" }}>
            Learn More
          </Button>
        </Flex>

        <Flex mt={8} alignItems="center" gap={2}>
          <Box>
            <Avatar.Root>
              <Avatar.Fallback name="chioma uckeni" />
              <Avatar.Image src="" />
            </Avatar.Root>
            <Avatar.Root>
              <Avatar.Fallback name="chioma uckeni" />
              <Avatar.Image src="" />
            </Avatar.Root>
          </Box>

          <Flex flexDirection="column">
            <Text mt={4} color="white">
              Trusted by 10,000+ students and institutions across Nigeria
            </Text>
            <Flex gap={2} align="center">
              <Flex>
                <Icon as={FaStar} color="yellow" />
                <Icon as={FaStar} color="yellow" />
                <Icon as={FaStar} color="yellow" />
                <Icon as={FaStar} color="yellow" />
                <Icon as={FaStar} color="yellow" />
              </Flex>
              <Text color="white">5.0(2,000+) reviews</Text>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

export default Heading;
