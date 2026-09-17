import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Flex, Text, Spinner, Button, Icon } from "@chakra-ui/react";
import { FaCheckCircle, FaTimesCircle, FaLock } from "react-icons/fa";
import {
  pollPaymentStatus,
  clearPendingPayment,
  getPaymentReturnPath,
  getPendingReference,
} from "../libs/payment";
import { toaster } from "../components/ui/toaster";

export default function PaymentCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState("verifying");
  const [detail, setDetail] = useState(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const reference =
      params.get("reference") || params.get("trxref") || getPendingReference();

    let cancelled = false;

    (async () => {
      if (!reference) {
        setState("missing");
        return;
      }

      const data = await pollPaymentStatus(reference, { attempts: 15, intervalMs: 2500 });
      if (cancelled) return;

      setDetail(data);
      clearPendingPayment();

      if (data?.status === "success") {
        setState("success");
        toaster.create({
          title: "Payment confirmed",
          description: "Your payment was verified successfully.",
          type: "success",
        });
        const back = getPaymentReturnPath();
        setTimeout(() => navigate(back, { replace: true }), 1600);
      } else {
        setState(data?.status || "pending");
        toaster.create({
          title: "Payment not completed",
          description:
            data?.status === "failed"
              ? "Paystack reported this payment as failed."
              : "We could not confirm this payment yet. Check your email or try again.",
          type: "warning",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isSuccess = state === "success";
  const isFailure = state === "failed" || state === "abandoned" || state === "missing";

  return (
    <Flex minH="100vh" align="center" justify="center" bg="#F8FAFC" p={4}>
      <Box
        bg="white"
        borderRadius="2xl"
        border="1px solid #E2E8F0"
        boxShadow="0 10px 30px rgba(15,23,42,0.06)"
        p={{ base: 6, md: 9 }}
        maxW="460px"
        w="100%"
        textAlign="center"
      >
        {state === "verifying" ? (
          <Flex direction="column" align="center" gap={4}>
            <Spinner size="xl" color="#4338CA" thickness="3px" />
            <Text fontSize="16px" fontWeight="800" color="#0F172A">
              Verifying your payment…
            </Text>
            <Text fontSize="13px" color="#64748B">
              Please wait while we confirm this transaction with Paystack. Do not close this page.
            </Text>
          </Flex>
        ) : (
          <Flex direction="column" align="center" gap={3}>
            <Flex
              w="60px"
              h="60px"
              borderRadius="full"
              align="center"
              justify="center"
              bg={isSuccess ? "#ECFDF5" : isFailure ? "#FEF2F2" : "#FEF3C7"}
              color={isSuccess ? "#10B981" : isFailure ? "#EF4444" : "#B45309"}
            >
              <Icon as={isSuccess ? FaCheckCircle : isFailure ? FaTimesCircle : FaLock} boxSize={7} />
            </Flex>
            <Text fontSize="18px" fontWeight="900" color="#0F172A">
              {isSuccess
                ? "Payment Confirmed"
                : isFailure
                  ? "Payment Not Completed"
                  : "Awaiting Confirmation"}
            </Text>
            <Text fontSize="13px" color="#64748B">
              {isSuccess
                ? "Your payment has been verified. Redirecting you back…"
                : isFailure
                  ? "No charge was confirmed. You can retry the payment from the checkout page."
                  : "Paystack has not confirmed this payment yet. It may still complete shortly."}
            </Text>
            {detail?.reference && (
              <Text fontSize="12px" color="#94A3B8" fontFamily="monospace">
                {detail.reference}
              </Text>
            )}
            <Button
              mt={3}
              bg="#4338CA"
              color="white"
              borderRadius="xl"
              fontWeight="700"
              onClick={() => navigate(getPaymentReturnPath(), { replace: true })}
            >
              Return to portal
            </Button>
          </Flex>
        )}
      </Box>
    </Flex>
  );
}
