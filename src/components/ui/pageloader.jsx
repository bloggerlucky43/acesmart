import { Flex, Spinner } from "@chakra-ui/react";

export default function PageLoader() {
  return (
    <Flex
      bg="gray.200"
      zIndex={9999}
      minH="100vh"
      justify="center"
      align="center"
      position="fixed"
      top={0}
      left={0}
      width="100%"
    >
      <Spinner size="md" color="primary" />
    </Flex>
  );
}
