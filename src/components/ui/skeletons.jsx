import React from "react";
import { Box, Flex, SimpleGrid } from "@chakra-ui/react";

/**
 * Base shimmer block
 */
export const ShimmerBox = ({ w = "100%", h = "20px", borderRadius = "md", ...props }) => (
  <Box
    w={w}
    h={h}
    borderRadius={borderRadius}
    className="animate-shimmer"
    {...props}
  />
);

/**
 * Skeleton for data tables (e.g. MResultPage, student lists)
 */
export const TableSkeleton = ({ rows = 5, columns = 6 }) => {
  return (
    <Box
      w="100%"
      bg="white"
      borderRadius="2xl"
      p={6}
      border="1px solid"
      borderColor="gray.100"
      boxShadow="sm"
    >
      {/* Header bar skeleton */}
      <Flex justify="space-between" align="center" mb={6}>
        <ShimmerBox w="220px" h="32px" borderRadius="lg" />
        <Flex gap={3}>
          <ShimmerBox w="120px" h="36px" borderRadius="xl" />
          <ShimmerBox w="140px" h="36px" borderRadius="xl" />
        </Flex>
      </Flex>

      {/* Table header row */}
      <Flex
        gap={4}
        pb={3}
        mb={4}
        borderBottom="2px solid"
        borderColor="gray.100"
      >
        {Array.from({ length: columns }).map((_, i) => (
          <ShimmerBox
            key={`th-${i}`}
            w={`${100 / columns}%`}
            h="16px"
            borderRadius="sm"
          />
        ))}
      </Flex>

      {/* Table body rows */}
      <Flex direction="column" gap={3}>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <Flex
            key={`tr-${rowIdx}`}
            gap={4}
            py={3}
            borderBottom="1px solid"
            borderColor="gray.50"
            align="center"
          >
            {Array.from({ length: columns }).map((_, colIdx) => (
              <ShimmerBox
                key={`td-${rowIdx}-${colIdx}`}
                w={colIdx === 0 ? "80%" : colIdx === 1 ? "60%" : "90%"}
                h="18px"
                borderRadius="md"
              />
            ))}
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};

/**
 * Skeleton for grid of exam cards or analytics tiles
 */
export const CardGridSkeleton = ({ count = 6 }) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} w="100%">
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          bg="white"
          p={6}
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="sm"
          display="flex"
          flexDirection="column"
          gap={4}
        >
          <Flex justify="space-between" align="center">
            <ShimmerBox w="60%" h="22px" borderRadius="md" />
            <ShimmerBox w="50px" h="20px" borderRadius="full" />
          </Flex>
          <ShimmerBox w="90%" h="14px" />
          <ShimmerBox w="75%" h="14px" />
          <Flex justify="space-between" align="center" pt={4} borderTop="1px solid" borderColor="gray.50">
            <ShimmerBox w="80px" h="16px" />
            <ShimmerBox w="90px" h="32px" borderRadius="xl" />
          </Flex>
        </Box>
      ))}
    </SimpleGrid>
  );
};

/**
 * Metric cards skeleton for dashboard overview
 */
export const MetricCardsSkeleton = ({ count = 4 }) => {
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: count }} gap={4} w="100%">
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          bg="white"
          p={5}
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="sm"
        >
          <Flex justify="space-between" align="center" mb={3}>
            <ShimmerBox w="50%" h="14px" />
            <ShimmerBox w="36px" h="36px" borderRadius="xl" />
          </Flex>
          <ShimmerBox w="40%" h="28px" mb={2} />
          <ShimmerBox w="70%" h="12px" />
        </Box>
      ))}
    </SimpleGrid>
  );
};

/**
 * Skeleton for AI Summary / Insights Banner
 */
export const AISummarySkeleton = () => {
  return (
    <Box
      w="100%"
      p={6}
      borderRadius="2xl"
      bg="linear-gradient(135deg, rgba(106, 27, 154, 0.04) 0%, rgba(142, 36, 170, 0.08) 100%)"
      border="1px solid"
      borderColor="purple.100"
    >
      <Flex align="center" gap={3} mb={4}>
        <ShimmerBox w="32px" h="32px" borderRadius="lg" />
        <ShimmerBox w="240px" h="24px" borderRadius="md" />
        <ShimmerBox w="100px" h="22px" borderRadius="full" />
      </Flex>
      <ShimmerBox w="95%" h="16px" mb={2} />
      <ShimmerBox w="85%" h="16px" mb={5} />
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <ShimmerBox h="60px" borderRadius="xl" />
        <ShimmerBox h="60px" borderRadius="xl" />
        <ShimmerBox h="60px" borderRadius="xl" />
      </SimpleGrid>
    </Box>
  );
};

export default {
  ShimmerBox,
  TableSkeleton,
  CardGridSkeleton,
  MetricCardsSkeleton,
  AISummarySkeleton,
};
