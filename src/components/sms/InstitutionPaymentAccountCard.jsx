import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
  Input,
  Spinner,
} from "@chakra-ui/react";
import {
  FaUniversity,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShieldAlt,
} from "react-icons/fa";
import {
  getInstitutionPaymentAccountApi,
  saveInstitutionPaymentAccountApi,
  disableInstitutionPaymentAccountApi,
  getPaymentBanksApi,
} from "../../api-endpoint/sms/smsEndpoints";
import { toaster } from "../ui/toaster";

/**
 * Enables online payments for this institution by registering its settlement
 * bank account. The backend creates/updates the Paystack subaccount; once a
 * subaccount code exists, student/parent checkout becomes available.
 *
 * Bank codes come from Paystack's own bank list (proxied server-side).
 */
export default function InstitutionPaymentAccountCard() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [banks, setBanks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [businessName, setBusinessName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [accountRes, banksRes] = await Promise.all([
        getInstitutionPaymentAccountApi(),
        getPaymentBanksApi().catch(() => null),
      ]);
      if (accountRes?.success) {
        setAccount(accountRes.data);
        setBusinessName(accountRes.data?.businessName || accountRes.data?.name || "");
        setBankCode(accountRes.data?.bankCode || "");
      }
      if (banksRes?.success) setBanks(banksRes.data || []);
    } catch (err) {
      setLoadError(err.response?.data?.message || err.message || "Failed to load payment account");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!businessName.trim()) {
      toaster.create({ title: "Enter the account/business name", type: "warning" });
      return;
    }
    if (!bankCode) {
      toaster.create({ title: "Select the settlement bank", type: "warning" });
      return;
    }
    if (!/^\d{10}$/.test(accountNumber.replace(/\s+/g, ""))) {
      toaster.create({ title: "Account number must be 10 digits", type: "warning" });
      return;
    }

    setSaving(true);
    try {
      const res = await saveInstitutionPaymentAccountApi({
        businessName: businessName.trim(),
        bankCode,
        accountNumber: accountNumber.replace(/\s+/g, ""),
      });
      if (res?.success) {
        setAccount(res.data);
        setAccountNumber("");
        toaster.create({
          title: "Online payments enabled",
          description: "Your settlement account was saved and verified with Paystack.",
          type: "success",
        });
      } else {
        throw new Error(res?.message || "Failed to save account");
      }
    } catch (err) {
      toaster.create({
        title: "Could not save settlement account",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async () => {
    setDisabling(true);
    try {
      const res = await disableInstitutionPaymentAccountApi();
      if (res?.success) {
        setAccount(res.data);
        setAccountNumber("");
        toaster.create({ title: "Online payments disabled", type: "success" });
      } else {
        throw new Error(res?.message || "Failed to disable");
      }
    } catch (err) {
      toaster.create({
        title: "Could not disable online payments",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setDisabling(false);
    }
  };

  const enabled = Boolean(account?.enabled);
  const masked = account?.accountNumberMasked;
  const selectedBankName = banks.find((b) => b.code === bankCode)?.name;

  return (
    <Box bg="white" p={6} borderRadius="2xl" border="1px solid #E2E8F0" mb={8}>
      <Flex align="center" justify="space-between" gap={3} mb={5} wrap="wrap">
        <Flex align="center" gap={3}>
          <Flex w="40px" h="40px" borderRadius="xl" bg="#ECFDF5" color="#059669" align="center" justify="center">
            <Icon as={FaUniversity} boxSize={5} />
          </Flex>
          <Box>
            <Text fontSize="16px" fontWeight="800" color="#0F172A">
              Online Payments & Settlement
            </Text>
            <Text fontSize="12px" color="#64748B">
              Where this school's fee collections are paid out
            </Text>
          </Box>
        </Flex>

        {!loading && (
          <Badge
            bg={enabled ? "#ECFDF5" : "#FEF3C7"}
            color={enabled ? "#065F46" : "#92400E"}
            px={3}
            py={1}
            borderRadius="full"
            fontWeight="800"
            fontSize="11px"
          >
            <Icon as={enabled ? FaCheckCircle : FaExclamationTriangle} mr={1} boxSize={2.5} />
            {enabled ? "ONLINE PAYMENTS ENABLED" : "NOT ENABLED"}
          </Badge>
        )}
      </Flex>

      {loading ? (
        <Flex py={8} justify="center" align="center" gap={3}>
          <Spinner color="#4338CA" />
          <Text fontSize="13px" color="#64748B">
            Loading settlement account…
          </Text>
        </Flex>
      ) : loadError ? (
        <Box bg="#FEF2F2" border="1px solid #FECACA" color="#991B1B" p={4} borderRadius="xl" fontSize="13px">
          {loadError}
        </Box>
      ) : (
        <>
          {enabled && (
            <Box bg="#F8FAFC" border="1px solid #E2E8F0" borderRadius="xl" p={4} mb={5} fontSize="13px">
              <Flex justify="space-between" py={1}>
                <Text color="#64748B">Account name</Text>
                <Text fontWeight="700" color="#0F172A">
                  {account?.businessName || "—"}
                </Text>
              </Flex>
              <Flex justify="space-between" py={1}>
                <Text color="#64748B">Settlement account</Text>
                <Text fontWeight="700" color="#0F172A">
                  {masked || "••••"}
                </Text>
              </Flex>
              <Flex justify="space-between" py={1}>
                <Text color="#64748B">Bank</Text>
                <Text fontWeight="700" color="#0F172A">
                  {selectedBankName || account?.bankCode || "—"}
                </Text>
              </Flex>
              <Flex justify="space-between" py={1}>
                <Text color="#64748B">Paystack subaccount</Text>
                <Text fontWeight="700" color="#4338CA" fontFamily="monospace" fontSize="12px">
                  {account?.subaccountCode || "—"}
                </Text>
              </Flex>
            </Box>
          )}

          <form onSubmit={handleSave}>
            <Flex direction="column" gap={4}>
              <Box>
                <Text fontSize="11px" fontWeight="800" color="#334155" mb={1} letterSpacing="0.4px">
                  ACCOUNT / BUSINESS NAME
                </Text>
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Grace Academy Ltd"
                  h="42px"
                  borderRadius="10px"
                  border="1px solid #CBD5E1"
                  bg="#F8FAFC"
                  fontSize="13px"
                />
              </Box>

              <Flex direction={{ base: "column", sm: "row" }} gap={4}>
                <Box flex={1}>
                  <Text fontSize="11px" fontWeight="800" color="#334155" mb={1} letterSpacing="0.4px">
                    SETTLEMENT BANK
                  </Text>
                  <select
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    style={{
                      width: "100%",
                      height: 42,
                      padding: "0 12px",
                      borderRadius: 10,
                      border: "1px solid #CBD5E1",
                      fontSize: 13,
                      fontWeight: 600,
                      background: "#F8FAFC",
                    }}
                  >
                    <option value="">Select a bank…</option>
                    {banks.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  {!banks.length && (
                    <Text fontSize="11px" color="#B45309" mt={1}>
                      Bank list unavailable — check the Paystack secret key, then reload.
                    </Text>
                  )}
                </Box>

                <Box flex={1}>
                  <Text fontSize="11px" fontWeight="800" color="#334155" mb={1} letterSpacing="0.4px">
                    ACCOUNT NUMBER (10 DIGITS)
                  </Text>
                  <Input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/[^\d]/g, ""))}
                    placeholder="0123456789"
                    maxLength={10}
                    inputMode="numeric"
                    h="42px"
                    borderRadius="10px"
                    border="1px solid #CBD5E1"
                    bg="#F8FAFC"
                    fontSize="13px"
                    fontFamily="monospace"
                  />
                </Box>
              </Flex>
            </Flex>

            <Flex align="flex-start" gap={2} mt={4} p={3} borderRadius="xl" bg="#EEF2FF" color="#3730A3" fontSize="11px">
              <Icon as={FaShieldAlt} boxSize={3.5} mt={0.5} flexShrink={0} />
              <Text lineHeight="1.6">
                Saving creates or updates this school's Paystack subaccount and turns on parent
                online payments. Each payment settles directly to this bank account; the platform's
                service fee is applied per the institution's agreed terms.
              </Text>
            </Flex>

            <Flex gap={3} mt={5} wrap="wrap">
              <Button
                type="submit"
                bg="#059669"
                color="white"
                borderRadius="xl"
                fontWeight="700"
                h="44px"
                loading={saving}
                loadingText="Saving…"
                _hover={{ bg: "#047857" }}
              >
                <Icon as={FaUniversity} mr={2} boxSize={3.5} />
                {enabled ? "Update Settlement Account" : "Enable Online Payments"}
              </Button>

              {enabled && (
                <Button
                  variant="outline"
                  borderColor="#FCA5A5"
                  color="#B91C1C"
                  borderRadius="xl"
                  fontWeight="700"
                  h="44px"
                  onClick={handleDisable}
                  loading={disabling}
                  _hover={{ bg: "#FEF2F2" }}
                >
                  Disable Online Payments
                </Button>
              )}
            </Flex>
          </form>
        </>
      )}
    </Box>
  );
}
