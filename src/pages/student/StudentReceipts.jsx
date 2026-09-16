import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FaReceipt,
  FaPrint,
  FaSyncAlt,
  FaMoneyBillWave,
  FaUniversity,
} from "react-icons/fa";
import StudentPageHeading from "../../components/student/StudentPageHeading";
import {
  PortalCard,
  PortalLoader,
  PortalEmpty,
} from "../../components/student/StudentPortalPrimitives";
import { useStudentPortal } from "../../libs/StudentPortalProvider";
import { getStudentReceiptsApi } from "../../api-endpoint/sms/portalEndpoints";

const money = (value) => `₦${Number(value || 0).toLocaleString()}`;

const StudentReceipts = () => {
  const { student } = useStudentPortal();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentId = student?.id;

  const load = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await getStudentReceiptsApi(studentId);
      if (res?.success) setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  const receipts = data?.receipts || [];

  return (
    <Box>
      <StudentPageHeading
        title="Payment History & Receipts"
        description="A record of every fee payment made on your account."
        icon={FaReceipt}
        action={
          <Button
            size="sm"
            variant="outline"
            borderColor="#CBD5E1"
            borderRadius="xl"
            fontWeight="700"
            fontSize="12px"
            loading={loading}
            onClick={load}
          >
            <Icon as={FaSyncAlt} mr={2} boxSize={3} />
            Refresh
          </Button>
        }
      />

      {loading && !data ? (
        <PortalLoader label="Loading your payment history..." />
      ) : receipts.length === 0 ? (
        <PortalEmpty
          icon={FaReceipt}
          title="No payments recorded yet"
          description="Once a fee payment is recorded by the school bursary or paid online, your receipt will appear here."
        />
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4} mb={6}>
            <PortalCard>
              <Text fontSize="12px" fontWeight="700" color="#64748B">
                TOTAL PAID
              </Text>
              <Text fontSize="22px" fontWeight="900" color="#10B981" mt={1}>
                {money(data?.totalPaid)}
              </Text>
            </PortalCard>
            <PortalCard>
              <Text fontSize="12px" fontWeight="700" color="#64748B">
                RECEIPTS ISSUED
              </Text>
              <Text fontSize="22px" fontWeight="900" color="#0F172A" mt={1}>
                {data?.count || 0}
              </Text>
            </PortalCard>
            <PortalCard>
              <Text fontSize="12px" fontWeight="700" color="#64748B">
                STUDENT
              </Text>
              <Text fontSize="15px" fontWeight="800" color="#0F172A" mt={1} isTruncated>
                {data?.student?.name}
              </Text>
              <Text fontSize="12px" color="#4338CA" fontWeight="700">
                {data?.student?.studentCode}
              </Text>
            </PortalCard>
          </SimpleGrid>

          <Flex justify="flex-end" mb={3}>
            <Button
              size="sm"
              variant="outline"
              borderColor="#CBD5E1"
              borderRadius="xl"
              fontWeight="700"
              fontSize="12px"
              onClick={() => window.print()}
            >
              <Icon as={FaPrint} mr={2} boxSize={3} />
              Print All
            </Button>
          </Flex>

          <Flex direction="column" gap={3}>
            {receipts.map((receipt) => (
              <PortalCard key={receipt.id} p={{ base: 4, md: 5 }}>
                <Flex
                  justify="space-between"
                  align={{ base: "flex-start", md: "center" }}
                  direction={{ base: "column", md: "row" }}
                  gap={3}
                >
                  <Flex align="center" gap={3} minW={0}>
                    <Flex
                      w="42px"
                      h="42px"
                      borderRadius="xl"
                      bg="#ECFDF5"
                      color="#10B981"
                      align="center"
                      justify="center"
                      flexShrink={0}
                    >
                      <Icon as={FaMoneyBillWave} boxSize={4} />
                    </Flex>
                    <Box minW={0}>
                      <Text fontSize="15px" fontWeight="800" color="#0F172A">
                        {money(receipt.amount)}
                      </Text>
                      <Text fontSize="12px" color="#64748B" isTruncated>
                        {receipt.receiptNumber} •{" "}
                        {receipt.paidAt
                          ? new Date(receipt.paidAt).toLocaleDateString()
                          : "—"}
                      </Text>
                    </Box>
                  </Flex>

                  <Flex align="center" gap={3} wrap="wrap">
                    <Badge
                      bg="#EEF2FF"
                      color="#4338CA"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontWeight="800"
                      fontSize="11px"
                      textTransform="uppercase"
                    >
                      {String(receipt.paymentMethod || "manual").replace("_", " ")}
                    </Badge>
                    <Box textAlign={{ base: "left", md: "right" }}>
                      <Text fontSize="12px" color="#64748B">
                        {receipt.term} {receipt.session ? `• ${receipt.session}` : ""}
                      </Text>
                      <Flex align="center" gap={1.5} color="#94A3B8">
                        <Icon as={FaUniversity} boxSize={2.5} />
                        <Text fontSize="11px">Ref: {receipt.reference}</Text>
                      </Flex>
                    </Box>
                  </Flex>
                </Flex>
              </PortalCard>
            ))}
          </Flex>
        </>
      )}
    </Box>
  );
};

export default StudentReceipts;
