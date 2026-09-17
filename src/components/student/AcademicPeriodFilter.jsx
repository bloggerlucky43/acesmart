import { useMemo } from "react";
import { Box, Flex, Text, Icon } from "@chakra-ui/react";
import { FaCalendarAlt } from "react-icons/fa";

const TERM_ORDER = { "First Term": 1, "Second Term": 2, "Third Term": 3 };

const sessionStartYear = (session) => {
  const match = String(session || "").match(/(\d{4})/);
  return match ? Number(match[1]) : 0;
};

const selectStyle = {
  width: "100%",
  height: "42px",
  padding: "0 12px",
  borderRadius: "12px",
  border: "1px solid #CBD5E1",
  fontSize: "13px",
  fontWeight: "600",
  background: "#F8FAFC",
  color: "#0F172A",
};

/**
 * Term + session picker shared by the student result screens. Options come from
 * the student's own records (see /api/portal/student/:id/academic-terms), so a
 * student can filter, unlock and check results for any term, not just the
 * institution's active one.
 */
const AcademicPeriodFilter = ({
  options = [],
  value,
  onChange,
  loading = false,
  disabled = false,
}) => {
  const sessions = useMemo(() => {
    const unique = [...new Set(options.map((o) => o.session).filter(Boolean))];
    return unique.sort((a, b) => sessionStartYear(b) - sessionStartYear(a));
  }, [options]);

  const activeSession = value?.session || sessions[0] || "";

  const terms = useMemo(
    () =>
      options
        .filter((o) => o.session === activeSession && o.term)
        .map((o) => o.term)
        .filter((term, index, list) => list.indexOf(term) === index)
        .sort((a, b) => (TERM_ORDER[a] || 0) - (TERM_ORDER[b] || 0)),
    [options, activeSession],
  );

  const activeTerm = terms.includes(value?.term) ? value.term : terms[0] || "";

  const handleSessionChange = (event) => {
    const nextSession = event.target.value;
    const nextTerms = options
      .filter((o) => o.session === nextSession && o.term)
      .map((o) => o.term)
      .filter((term, index, list) => list.indexOf(term) === index)
      .sort((a, b) => (TERM_ORDER[a] || 0) - (TERM_ORDER[b] || 0));
    const nextTerm = nextTerms.includes(value?.term) ? value.term : nextTerms[0];
    if (nextTerm) onChange?.(nextTerm, nextSession);
  };

  const handleTermChange = (event) => {
    if (event.target.value) onChange?.(event.target.value, activeSession);
  };

  const isEmpty = !loading && options.length === 0;

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      border="1px solid #E2E8F0"
      boxShadow="0 4px 16px rgba(0,0,0,0.02)"
      p={{ base: 4, md: 5 }}
      mb={6}
    >
      <Flex align="center" gap={2} mb={3}>
        <Icon as={FaCalendarAlt} boxSize={3.5} color="#4338CA" />
        <Text fontSize="12px" fontWeight="800" color="#334155" letterSpacing="0.5px">
          SELECT TERM &amp; SESSION
        </Text>
      </Flex>

      <Flex gap={4} direction={{ base: "column", sm: "row" }}>
        <Box flex={1}>
          <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
            ACADEMIC SESSION
          </Text>
          <select
            value={activeSession}
            onChange={handleSessionChange}
            disabled={disabled || loading || sessions.length === 0}
            style={selectStyle}
          >
            {sessions.length === 0 && <option value="">No sessions</option>}
            {sessions.map((session) => (
              <option key={session} value={session}>
                {session}
              </option>
            ))}
          </select>
        </Box>

        <Box flex={1}>
          <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
            TERM
          </Text>
          <select
            value={activeTerm}
            onChange={handleTermChange}
            disabled={disabled || loading || terms.length === 0}
            style={selectStyle}
          >
            {terms.length === 0 && <option value="">No terms</option>}
            {terms.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>
        </Box>
      </Flex>

      {isEmpty && (
        <Text fontSize="11px" color="#94A3B8" mt={3}>
          No published academic periods yet. Your current term will appear here
          once it is set by the school.
        </Text>
      )}
    </Box>
  );
};

export default AcademicPeriodFilter;
