import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
  Spinner,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FaFileInvoice,
  FaLock,
  FaCheckCircle,
  FaSyncAlt,
  FaShieldAlt,
} from "react-icons/fa";
import StudentPageHeading from "../../components/student/StudentPageHeading";
import StudentReportCardSheet from "../../components/student/StudentReportCardSheet";
import ResultCheckerModal from "../../components/sms/ResultCheckerModal";
import { useStudentPortal } from "../../libs/StudentPortalProvider";

const INCLUDED = [
  "Continuous assessment, assignment, and exam scores",
  "Grade, remark, and average score per subject",
  "Class teacher and principal remarks",
  "Printable, school-stamped official sheet",
];

const StudentResults = () => {
  const {
    student,
    institution,
    isUnlocked,
    reportCardData,
    loadReportCard,
    checkUnlockStatus,
  } = useStudentPortal();

  const [modalOpen, setModalOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const autoLoadedRef = useRef(false);

  const tokenFee = institution?.resultCheckerFee || 500;

  const handleView = useCallback(async () => {
    setFetching(true);
    const result = await loadReportCard();
    setFetching(false);
    if (result?.paywall) setModalOpen(true);
  }, [loadReportCard]);

  useEffect(() => {
    if (isUnlocked && !autoLoadedRef.current) {
      autoLoadedRef.current = true;
      handleView();
    }
  }, [isUnlocked, handleView]);

  const handleUnlockSuccess = async () => {
    autoLoadedRef.current = true;
    await checkUnlockStatus(student?.id);
    handleView();
  };

  return (
    <Box>
      <StudentPageHeading
        title="Report Cards"
        description="Official terminal results, grades, and remarks for the current term."
        icon={FaFileInvoice}
        action={
          <Badge
            bg={isUnlocked ? "#ECFDF5" : "#FEF3C7"}
            color={isUnlocked ? "#065F46" : "#92400E"}
            px={3}
            py={1.5}
            borderRadius="full"
            fontWeight="800"
            fontSize="11px"
          >
            {isUnlocked ? "UNLOCKED" : "TOKEN REQUIRED"}
          </Badge>
        }
      />

      {!isUnlocked && (
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
          <Box
            bg="white"
            borderRadius="2xl"
            border="1px solid #E2E8F0"
            boxShadow="0 4px 16px rgba(0,0,0,0.02)"
            p={{ base: 6, md: 7 }}
          >
            <Flex
              w="56px"
              h="56px"
              mb={4}
              borderRadius="2xl"
              bg="#FEF3C7"
              color="#B45309"
              align="center"
              justify="center"
            >
              <Icon as={FaLock} boxSize={6} />
            </Flex>
            <Text fontSize="18px" fontWeight="900" color="#0F172A">
              Your report card is locked
            </Text>
            <Text fontSize="13px" color="#64748B" mt={2} lineHeight="1.6">
              A one-time result checker token of{" "}
              <strong>₦{tokenFee.toLocaleString()}</strong> unlocks the full
              terminal report card for{" "}
              <strong>
                {institution?.currentTerm || "this term"}{" "}
                {institution?.academicSession
                  ? `(${institution.academicSession})`
                  : ""}
              </strong>
              . It stays unlocked for the rest of the term.
            </Text>

            <Button
              mt={5}
              w="100%"
              h="46px"
              bg="linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)"
              color="white"
              borderRadius="xl"
              fontWeight="800"
              boxShadow="0 4px 14px rgba(67, 56, 202, 0.35)"
              _hover={{ opacity: 0.95 }}
              onClick={() => setModalOpen(true)}
            >
              <Icon as={FaLock} mr={2} boxSize={3.5} />
              Unlock Report Card (₦{tokenFee.toLocaleString()})
            </Button>

            <Flex
              justify="center"
              align="center"
              gap={2}
              mt={4}
              color="#94A3B8"
              fontSize="11px"
            >
              <Icon as={FaShieldAlt} boxSize={3} color="#10B981" />
              <Text>Secured by AceSmart Institutional Vault &amp; Paystack</Text>
            </Flex>
          </Box>

          <Box
            bg="white"
            borderRadius="2xl"
            border="1px solid #E2E8F0"
            boxShadow="0 4px 16px rgba(0,0,0,0.02)"
            p={{ base: 6, md: 7 }}
          >
            <Text fontSize="16px" fontWeight="800" color="#0F172A" mb={4}>
              What the token gives you
            </Text>
            {INCLUDED.map((item) => (
              <Flex key={item} align="flex-start" gap={2.5} mb={3}>
                <Icon
                  as={FaCheckCircle}
                  color="#10B981"
                  boxSize={3.5}
                  mt={0.5}
                  flexShrink={0}
                />
                <Text fontSize="13px" color="#334155" lineHeight="1.5">
                  {item}
                </Text>
              </Flex>
            ))}

            <Box
              mt={4}
              p={4}
              borderRadius="xl"
              bg="#F8FAFC"
              border="1px solid #E2E8F0"
              fontSize="12px"
              color="#64748B"
              lineHeight="1.6"
            >
              Already paid for this term? Allow a minute for the payment to
              reconcile, then refresh this page.
            </Box>

            <Button
              mt={4}
              w="100%"
              variant="outline"
              borderColor="#CBD5E1"
              borderRadius="xl"
              fontWeight="700"
              fontSize="13px"
              loading={fetching}
              onClick={async () => {
                const unlocked = await checkUnlockStatus(student?.id);
                if (unlocked) {
                  autoLoadedRef.current = true;
                  handleView();
                }
              }}
            >
              <Icon as={FaSyncAlt} mr={2} boxSize={3} />
              I have paid — recheck my token
            </Button>
          </Box>
        </SimpleGrid>
      )}

      {isUnlocked && (
        <>
          <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
            <Text fontSize="13px" color="#64748B">
              Term: <strong>{institution?.currentTerm || "—"}</strong>
              {institution?.academicSession
                ? ` • Session: ${institution.academicSession}`
                : ""}
            </Text>
            <Button
              size="sm"
              variant="outline"
              borderColor="#CBD5E1"
              borderRadius="xl"
              fontWeight="700"
              fontSize="12px"
              loading={fetching}
              onClick={handleView}
            >
              <Icon as={FaSyncAlt} mr={2} boxSize={3} />
              Refresh Result
            </Button>
          </Flex>

          {fetching && !reportCardData ? (
            <Flex
              bg="white"
              borderRadius="2xl"
              border="1px solid #E2E8F0"
              minH="240px"
              align="center"
              justify="center"
              direction="column"
              gap={3}
            >
              <Spinner color="#4338CA" />
              <Text fontSize="13px" color="#64748B">
                Loading your official report card...
              </Text>
            </Flex>
          ) : reportCardData ? (
            <StudentReportCardSheet reportCard={reportCardData} />
          ) : (
            <Box
              bg="white"
              borderRadius="2xl"
              border="1px solid #E2E8F0"
              p={{ base: 6, md: 8 }}
              textAlign="center"
            >
              <Text fontSize="15px" fontWeight="800" color="#0F172A">
                No published result for this term yet
              </Text>
              <Text fontSize="13px" color="#64748B" mt={1} mb={5}>
                Your token is active. The report card will appear here as soon
                as your teachers publish the term scores.
              </Text>
              <Button
                bg="#4338CA"
                color="white"
                borderRadius="xl"
                fontWeight="700"
                onClick={handleView}
              >
                <Icon as={FaSyncAlt} mr={2} boxSize={3} />
                Try Again
              </Button>
            </Box>
          )}
        </>
      )}

      <ResultCheckerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        student={student}
        institution={institution}
        onSuccess={handleUnlockSuccess}
      />
    </Box>
  );
};

export default StudentResults;
