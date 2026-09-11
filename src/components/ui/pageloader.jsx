import { Box, Flex, SimpleGrid } from "@chakra-ui/react";
import { FaBrain } from "react-icons/fa";
import { ShimmerBox } from "./skeletons";

export default function PageLoader() {
  return (
    <Box
      bg="#fafafa"
      minH="100vh"
      w="100%"
      position="fixed"
      top={0}
      left={0}
      zIndex={9999}
      p={{ base: 4, md: 8 }}
      display="flex"
      flexDirection="column"
    >
      {/* Top Navbar Skeleton */}
      <Flex
        justify="space-between"
        align="center"
        pb={6}
        borderBottom="1px solid"
        borderColor="gray.100"
        maxW="1400px"
        w="100%"
        mx="auto"
      >
        <Flex align="center" gap={3}>
          <Flex
            w="40px"
            h="40px"
            borderRadius="xl"
            bg="purple.50"
            color="#6A1B9A"
            align="center"
            justify="center"
            className="glow-ambient"
          >
            <FaBrain size={20} />
          </Flex>
          <ShimmerBox w="140px" h="24px" borderRadius="md" />
        </Flex>
        <Flex gap={3} align="center">
          <ShimmerBox w="80px" h="36px" borderRadius="xl" />
          <ShimmerBox w="120px" h="36px" borderRadius="xl" />
        </Flex>
      </Flex>

      {/* Main Content Skeleton */}
      <Box maxW="1400px" w="100%" mx="auto" pt={8} flex="1">
        {/* Metric Overview Row */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={4} mb={8}>
          <ShimmerBox h="95px" borderRadius="2xl" />
          <ShimmerBox h="95px" borderRadius="2xl" />
          <ShimmerBox h="95px" borderRadius="2xl" />
          <ShimmerBox h="95px" borderRadius="2xl" />
        </SimpleGrid>

        {/* Action / Banner Skeleton */}
        <ShimmerBox h="160px" borderRadius="2xl" mb={8} />

        {/* Content Table / Cards Skeleton */}
        <Box
          bg="white"
          borderRadius="2xl"
          p={6}
          border="1px solid"
          borderColor="gray.100"
        >
          <Flex justify="space-between" align="center" mb={6}>
            <ShimmerBox w="240px" h="28px" borderRadius="md" />
            <ShimmerBox w="140px" h="36px" borderRadius="xl" />
          </Flex>
          <Flex direction="column" gap={4}>
            <ShimmerBox h="42px" borderRadius="lg" />
            <ShimmerBox h="42px" borderRadius="lg" />
            <ShimmerBox h="42px" borderRadius="lg" />
            <ShimmerBox h="42px" borderRadius="lg" />
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}
