import React, { useState, useRef, useEffect, useMemo } from "react";
import { Box, Flex, Text, Icon, Badge, Button } from "@chakra-ui/react";
import {
  FaSearch,
  FaChevronDown,
  FaCheck,
  FaTimes,
  FaLayerGroup,
  FaGraduationCap,
  FaGlobe,
} from "react-icons/fa";

/**
 * Modern Searchable Class Select (Combobox)
 * Allows teachers to type to search classes in real time and pick directly.
 */
export default function ClassSearchSelect({
  classArms = [],
  value = "",
  onChange,
  placeholder = "Select or search class...",
  includeAll = true,
  includeUnassigned = true,
  size = "md",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Resolve current active label and level badge
  const selectedDetails = useMemo(() => {
    if (value === "all") {
      return {
        label: "All Classes",
        level: "Institution Wide",
        icon: FaGlobe,
        badgeBg: "#EDE9FE",
        badgeColor: "#6D28D9",
      };
    }
    if (value === "unassigned") {
      return {
        label: "Unassigned Candidates",
        level: "CBT Mock Only",
        icon: FaGraduationCap,
        badgeBg: "#FEF3C7",
        badgeColor: "#B45309",
      };
    }
    const found = classArms.find((c) => c.id === value);
    if (found) {
      return {
        label: found.name,
        level: found.level || "Class Arm",
        icon: FaLayerGroup,
        badgeBg: "#E0F2FE",
        badgeColor: "#0369A1",
      };
    }
    return {
      label: placeholder,
      level: null,
      icon: FaLayerGroup,
      badgeBg: "#F1F5F9",
      badgeColor: "#64748B",
    };
  }, [value, classArms, placeholder]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const result = [];

    if (includeAll) {
      if (!q || "all classes".includes(q) || "entire school".includes(q)) {
        result.push({
          id: "all",
          name: "All Classes",
          level: "Full Roster",
          isSpecial: true,
          icon: FaGlobe,
        });
      }
    }

    classArms.forEach((arm) => {
      const name = (arm.name || "").toLowerCase();
      const level = (arm.level || "").toLowerCase();
      if (!q || name.includes(q) || level.includes(q)) {
        result.push({
          id: arm.id,
          name: arm.name,
          level: arm.level || "Class",
          isSpecial: false,
          icon: FaLayerGroup,
        });
      }
    });

    if (includeUnassigned) {
      if (!q || "unassigned".includes(q) || "cbt".includes(q) || "mock".includes(q)) {
        result.push({
          id: "unassigned",
          name: "Unassigned (CBT Only)",
          level: "Mock Exam",
          isSpecial: true,
          icon: FaGraduationCap,
        });
      }
    }

    return result;
  }, [classArms, searchQuery, includeAll, includeUnassigned]);

  const handleSelect = (optionId) => {
    onChange?.(optionId);
    setIsOpen(false);
  };

  const isSmall = size === "sm";

  return (
    <Box position="relative" ref={containerRef} minW={{ base: "100%", sm: "240px" }}>
      {/* Trigger Button */}
      <Flex
        as="button"
        type="button"
        align="center"
        justify="space-between"
        w="100%"
        h={isSmall ? "36px" : "42px"}
        px={3}
        bg="white"
        border="1px solid"
        borderColor={isOpen ? "#4338CA" : "#CBD5E1"}
        borderRadius="xl"
        boxShadow={isOpen ? "0 0 0 2px rgba(67, 56, 202, 0.15)" : "0 1px 2px rgba(0,0,0,0.04)"}
        cursor="pointer"
        onClick={() => setIsOpen(!isOpen)}
        _hover={{ borderColor: "#4338CA", bg: "#F8FAFC" }}
        transition="all 0.15s ease"
        textAlign="left"
      >
        <Flex align="center" gap={2} overflow="hidden">
          <Flex
            align="center"
            justify="center"
            w={isSmall ? "24px" : "28px"}
            h={isSmall ? "24px" : "28px"}
            borderRadius="lg"
            bg="#EEF2FF"
            color="#4338CA"
            flexShrink={0}
          >
            <Icon as={selectedDetails.icon} boxSize={isSmall ? 3 : 3.5} />
          </Flex>
          <Box overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
            <Text
              fontSize={isSmall ? "12px" : "13px"}
              fontWeight="700"
              color="#0F172A"
              lineHeight="1.2"
              isTruncated
            >
              {selectedDetails.label}
            </Text>
            {selectedDetails.level && (
              <Text fontSize="10px" color="#64748B" fontWeight="600" isTruncated>
                {selectedDetails.level}
              </Text>
            )}
          </Box>
        </Flex>

        <Icon
          as={FaChevronDown}
          boxSize={3}
          color="#94A3B8"
          transform={isOpen ? "rotate(180deg)" : "rotate(0)"}
          transition="transform 0.2s ease"
          flexShrink={0}
          ml={2}
        />
      </Flex>

      {/* Floating Dropdown */}
      {isOpen && (
        <Box
          position="absolute"
          top="calc(100% + 6px)"
          left="0"
          right="0"
          minW={{ base: "100%", sm: "280px" }}
          bg="white"
          borderRadius="20px"
          border="1px solid #E2E8F0"
          boxShadow="0 18px 40px -8px rgba(15, 23, 42, 0.2)"
          zIndex={1050}
          overflow="hidden"
          animation="fadeInDown 0.15s ease-out"
        >
          {/* Top Search Input */}
          <Box p={2.5} borderBottom="1px solid #F1F5F9" bg="#F8FAFC">
            <Flex
              align="center"
              bg="white"
              border="1px solid #CBD5E1"
              borderRadius="xl"
              px={2.5}
              h="36px"
              _focusWithin={{ borderColor: "#4338CA", boxShadow: "0 0 0 1px #4338CA" }}
            >
              <Icon as={FaSearch} color="#94A3B8" mr={2} boxSize={3} flexShrink={0} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type class (e.g. SSS 2, JSS 1)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsOpen(false);
                  } else if (e.key === "Enter" && filteredOptions.length > 0) {
                    handleSelect(filteredOptions[0].id);
                  }
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#0F172A",
                }}
              />
              {searchQuery && (
                <Button
                  size="xs"
                  variant="ghost"
                  p={0}
                  h="auto"
                  minW="auto"
                  color="#94A3B8"
                  onClick={() => setSearchQuery("")}
                >
                  <Icon as={FaTimes} boxSize={2.5} />
                </Button>
              )}
            </Flex>
          </Box>

          {/* Options List */}
          <Box maxH="240px" overflowY="auto" p={1.5}>
            {filteredOptions.length === 0 ? (
              <Box py={6} px={3} textAlign="center">
                <Text fontSize="12px" fontWeight="700" color="#64748B">
                  No matching classes found
                </Text>
                <Text fontSize="11px" color="#94A3B8" mt={0.5}>
                  Try typing a different name or arm
                </Text>
              </Box>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = value === opt.id;
                return (
                  <Flex
                    key={opt.id}
                    as="button"
                    type="button"
                    w="100%"
                    align="center"
                    justify="space-between"
                    p={2}
                    px={3}
                    borderRadius="lg"
                    bg={isSelected ? "#EEF2FF" : "transparent"}
                    color={isSelected ? "#4338CA" : "#0F172A"}
                    _hover={{ bg: isSelected ? "#EEF2FF" : "#F8FAFC" }}
                    onClick={() => handleSelect(opt.id)}
                    transition="all 0.1s ease"
                    textAlign="left"
                    mb={0.5}
                  >
                    <Flex align="center" gap={2.5}>
                      <Flex
                        w="26px"
                        h="26px"
                        borderRadius="md"
                        bg={isSelected ? "#E0E7FF" : "#F1F5F9"}
                        color={isSelected ? "#4338CA" : "#64748B"}
                        align="center"
                        justify="center"
                        flexShrink={0}
                      >
                        <Icon as={opt.icon} boxSize={3} />
                      </Flex>
                      <Box>
                        <Text
                          fontSize="12.5px"
                          fontWeight={isSelected ? "800" : "600"}
                          color={isSelected ? "#4338CA" : "#0F172A"}
                          lineHeight="1.2"
                        >
                          {opt.name}
                        </Text>
                        <Text fontSize="10px" color="#64748B" fontWeight="500">
                          {opt.level}
                        </Text>
                      </Box>
                    </Flex>

                    {isSelected && (
                      <Badge
                        bg="#4338CA"
                        color="white"
                        borderRadius="full"
                        px={1.5}
                        py={0.5}
                        fontSize="9px"
                        fontWeight="800"
                        display="flex"
                        alignItems="center"
                        gap={1}
                      >
                        <Icon as={FaCheck} boxSize={2} /> SELECTED
                      </Badge>
                    )}
                  </Flex>
                );
              })
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
