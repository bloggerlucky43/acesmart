import { useState, useRef, useEffect, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  Icon,
  Badge,
  Button,
} from "@chakra-ui/react";
import {
  FaSearch,
  FaTimes,
  FaCheck,
  FaPlus,
  FaBookOpen,
  FaGraduationCap,
} from "react-icons/fa";
import { MASTER_NIGERIAN_SUBJECTS } from "../../constants/subjectsData";
import { fetchSubjectsApi } from "../../api-endpoint/subjects/subjectEndpoints";

/**
 * Modern Searchable Typeahead Combobox for Subject Selection
 * Features:
 * - Real-time filtering by subject name, abbreviation code, or track category
 * - Dynamic live synchronization with backend database (Global & Custom Subjects)
 * - Category track badging (Sciences, Commercial, Arts, BECE, Vocational, Custom)
 * - Full keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
 * - Inline addition of custom institution-specific subjects
 */
export default function SearchableSubjectSelect({
  value = "",
  onChange,
  placeholder = "Search or select subject (e.g. Mathematics, Civic, Biology)...",
  allowCustom = true,
  customSubjects = [],
  isDisabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [apiSubjects, setApiSubjects] = useState([]);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch live global and custom subjects from backend database
  useEffect(() => {
    let isMounted = true;
    fetchSubjectsApi()
      .then((res) => {
        if (isMounted && res?.data && Array.isArray(res.data)) {
          setApiSubjects(res.data);
        }
      })
      .catch((err) => console.warn("Failed to fetch live subjects:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Combine live database subjects (global + institution custom), built-in Nigerian master catalog, and prop custom subjects
  const allSubjects = useMemo(() => {
    const list = [];
    const seenNames = new Set();

    // 1. Live API subjects (highest precedence: includes newly created SuperAdmin global subjects and institution subjects)
    for (const sub of apiSubjects) {
      if (sub?.name && !seenNames.has(sub.name.toLowerCase().trim())) {
        seenNames.add(sub.name.toLowerCase().trim());
        list.push({
          name: sub.name,
          category: sub.category || (sub.isGlobal ? "General" : "Custom School Subject"),
          level: sub.level || "Senior Secondary",
          code: sub.code || (sub.isGlobal ? "GLB" : "CST"),
          isGlobal: sub.isGlobal ?? true,
        });
      }
    }

    // 2. Built-in Nigerian master catalog (fallback/default seed)
    for (const sub of MASTER_NIGERIAN_SUBJECTS) {
      if (sub?.name && !seenNames.has(sub.name.toLowerCase().trim())) {
        seenNames.add(sub.name.toLowerCase().trim());
        list.push(sub);
      }
    }

    // 3. Custom subjects passed via props
    for (const s of customSubjects || []) {
      const name = typeof s === "string" ? s : s?.name;
      if (name && !seenNames.has(name.toLowerCase().trim())) {
        seenNames.add(name.toLowerCase().trim());
        list.push(
          typeof s === "string"
            ? { name, category: "Custom School Subject", level: "Custom", code: "CST" }
            : {
                ...s,
                category: s.category || "Custom School Subject",
                level: s.level || "Custom",
              }
        );
      }
    }

    return list;
  }, [apiSubjects, customSubjects]);

  // Filter subjects based on query
  const filteredList = useMemo(() => {
    if (!query.trim()) return allSubjects.slice(0, 30); // show top 30 initially
    const q = query.trim().toLowerCase();
    return allSubjects.filter((s) => {
      const nameMatch = s.name.toLowerCase().includes(q);
      const codeMatch = s.code ? s.code.toLowerCase().includes(q) : false;
      const catMatch = s.category ? s.category.toLowerCase().includes(q) : false;
      return nameMatch || codeMatch || catMatch;
    });
  }, [allSubjects, query]);

  // Check if current query is already in the list
  const isExactMatch = useMemo(() => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return allSubjects.some((s) => s.name.toLowerCase() === q);
  }, [allSubjects, query]);

  // Outside click listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlighted index when filtered list changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredList]);

  const handleSelect = (subjectName) => {
    if (onChange) onChange(subjectName);
    setQuery("");
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) onChange("");
    setQuery("");
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    const totalItems = filteredList.length + (!isExactMatch && allowCustom ? 1 : 0);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % Math.max(totalItems, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + totalItems) % Math.max(totalItems, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!isExactMatch && allowCustom && highlightedIndex === filteredList.length) {
        handleSelect(query.trim());
      } else if (filteredList[highlightedIndex]) {
        handleSelect(filteredList[highlightedIndex].name);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Helper for category badge styling
  const getCategoryBadge = (category) => {
    switch (category) {
      case "Sciences":
        return { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" };
      case "Commercial":
        return { bg: "#ECFDF5", color: "#047857", border: "#A7F3D0" };
      case "Arts & Humanities":
        return { bg: "#FAF5FF", color: "#7E22CE", border: "#E9D5FF" };
      case "Junior Secondary (BECE)":
        return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" };
      case "Primary Education":
        return { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" };
      case "Trade & Vocational":
        return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
      default:
        return { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1" };
    }
  };

  return (
    <Box ref={wrapperRef} position="relative" w="100%">
      {/* Selected Value Display OR Search Input */}
      {value && !isOpen ? (
        <Flex
          align="center"
          justify="space-between"
          bg="white"
          border="1.5px solid #6366F1"
          borderRadius="xl"
          px={3.5}
          h="44px"
          cursor="pointer"
          onClick={() => {
            if (!isDisabled) {
              setIsOpen(true);
              setQuery("");
            }
          }}
          transition="all 0.15s ease"
          boxShadow="0 1px 3px rgba(99, 102, 241, 0.15)"
        >
          <Flex align="center" gap={2.5}>
            <Flex
              w="26px"
              h="26px"
              borderRadius="md"
              bg="#EEF2FF"
              color="#6366F1"
              align="center"
              justify="center"
            >
              <Icon as={FaBookOpen} boxSize={3.5} />
            </Flex>
            <Text fontSize="13px" fontWeight="700" color="#1E293B">
              {value}
            </Text>
            {allSubjects.find((s) => s.name.toLowerCase() === value.toLowerCase())?.category && (
              <Badge
                bg={getCategoryBadge(allSubjects.find((s) => s.name.toLowerCase() === value.toLowerCase())?.category).bg}
                color={getCategoryBadge(allSubjects.find((s) => s.name.toLowerCase() === value.toLowerCase())?.category).color}
                border="1px solid"
                borderColor={getCategoryBadge(allSubjects.find((s) => s.name.toLowerCase() === value.toLowerCase())?.category).border}
                fontSize="10px"
                px={1.5}
                py={0.2}
                borderRadius="md"
              >
                {allSubjects.find((s) => s.name.toLowerCase() === value.toLowerCase())?.category}
              </Badge>
            )}
          </Flex>

          <Flex align="center" gap={1.5}>
            <Button
              size="xs"
              variant="ghost"
              color="#94A3B8"
              p={1}
              minW="auto"
              h="auto"
              _hover={{ color: "#EF4444" }}
              onClick={handleClear}
              title="Remove selected subject"
            >
              <Icon as={FaTimes} boxSize={3} />
            </Button>
            <Text fontSize="11px" color="#6366F1" fontWeight="600">
              Change
            </Text>
          </Flex>
        </Flex>
      ) : (
        <Flex
          align="center"
          gap={2.5}
          bg="white"
          border="1.5px solid"
          borderColor={isOpen ? "#6366F1" : "#CBD5E1"}
          borderRadius="xl"
          px={3.5}
          h="44px"
          boxShadow={isOpen ? "0 0 0 3px rgba(99, 102, 241, 0.15)" : "none"}
          transition="all 0.15s ease"
        >
          <Icon as={FaSearch} color="#94A3B8" boxSize={3.5} />
          <Input
            ref={inputRef}
            variant="unstyled"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            fontSize="13px"
            color="#1E293B"
            autoComplete="off"
          />
          {query && (
            <Button
              size="xs"
              variant="ghost"
              color="#94A3B8"
              p={1}
              minW="auto"
              h="auto"
              _hover={{ color: "#EF4444" }}
              onClick={() => setQuery("")}
            >
              <Icon as={FaTimes} boxSize={3} />
            </Button>
          )}
        </Flex>
      )}

      {/* Floating Typeahead Dropdown */}
      {isOpen && (
        <Box
          position="absolute"
          top="calc(100% + 6px)"
          left={0}
          right={0}
          zIndex={1000}
          bg="white"
          borderRadius="xl"
          border="1px solid #E2E8F0"
          boxShadow="0 12px 30px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.04)"
          overflow="hidden"
          maxH="320px"
          display="flex"
          flexDirection="column"
        >
          {/* Header indicator */}
          <Flex
            justify="space-between"
            align="center"
            px={3.5}
            py={2}
            bg="#F8FAFC"
            borderBottom="1px solid #F1F5F9"
          >
            <Text fontSize="11px" fontWeight="700" color="#64748B" textTransform="uppercase" letterSpacing="0.4px">
              {query ? `Matching Subjects (${filteredList.length})` : "Standard Nigerian Curriculum Subjects"}
            </Text>
            <Text fontSize="10px" color="#94A3B8">
              Press Enter or click to pick
            </Text>
          </Flex>

          {/* List options */}
          <Box overflowY="auto" flex="1" py={1}>
            {filteredList.map((subject, index) => {
              const isSelected = value.toLowerCase() === subject.name.toLowerCase();
              const isHighlighted = highlightedIndex === index;
              const badgeStyle = getCategoryBadge(subject.category);

              return (
                <Flex
                  key={subject.name}
                  align="center"
                  justify="space-between"
                  px={3.5}
                  py={2.5}
                  cursor="pointer"
                  bg={isHighlighted ? "#EEF2FF" : isSelected ? "#F8FAFC" : "transparent"}
                  _hover={{ bg: "#EEF2FF" }}
                  onClick={() => handleSelect(subject.name)}
                  transition="background 0.1s ease"
                >
                  <Flex align="center" gap={2.5}>
                    <Text
                      fontSize="13px"
                      fontWeight={isSelected ? "800" : "600"}
                      color={isSelected ? "#6366F1" : "#1E293B"}
                    >
                      {subject.name}
                    </Text>
                    {subject.code && (
                      <Text fontSize="11px" color="#94A3B8" fontWeight="600">
                        ({subject.code})
                      </Text>
                    )}
                  </Flex>

                  <Flex align="center" gap={2}>
                    <Badge
                      bg={badgeStyle.bg}
                      color={badgeStyle.color}
                      border="1px solid"
                      borderColor={badgeStyle.border}
                      fontSize="10px"
                      fontWeight="700"
                      px={2}
                      py={0.5}
                      borderRadius="md"
                    >
                      {subject.category}
                    </Badge>
                    {isSelected && <Icon as={FaCheck} color="#6366F1" boxSize={3} />}
                  </Flex>
                </Flex>
              );
            })}

            {/* Custom Subject Option when typed query does not match exactly */}
            {query.trim() && !isExactMatch && allowCustom && (
              <Box
                borderTop="1px solid #F1F5F9"
                bg={highlightedIndex === filteredList.length ? "#FEF3C7" : "#FFFBEB"}
                p={2.5}
                px={3.5}
                cursor="pointer"
                _hover={{ bg: "#FEF3C7" }}
                onClick={() => handleSelect(query.trim())}
                transition="background 0.1s ease"
              >
                <Flex align="center" justify="space-between">
                  <Flex align="center" gap={2}>
                    <Flex
                      w="24px"
                      h="24px"
                      borderRadius="md"
                      bg="#FDE68A"
                      color="#B45309"
                      align="center"
                      justify="center"
                    >
                      <Icon as={FaPlus} boxSize={2.5} />
                    </Flex>
                    <Box>
                      <Text fontSize="13px" fontWeight="800" color="#92400E">
                        Add &quot;{query.trim()}&quot; as custom subject
                      </Text>
                      <Text fontSize="11px" color="#B45309">
                        Institution-specific subject (e.g. Diction, Robotics, Catering)
                      </Text>
                    </Box>
                  </Flex>
                  <Badge bg="#FDE68A" color="#92400E" fontSize="10px" px={2} py={0.5} borderRadius="md">
                    Custom Subject ↵
                  </Badge>
                </Flex>
              </Box>
            )}

            {filteredList.length === 0 && !query.trim() && (
              <Flex h="80px" justify="center" align="center" color="#94A3B8" fontSize="13px">
                No subjects found
              </Flex>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
