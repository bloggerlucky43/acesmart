import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  studentCodeLoginApi,
  checkResultTokenStatusApi,
  getStudentReportCardApi,
} from "../api-endpoint/sms/smsEndpoints";
import { getStudentAcademicTermsApi, getStudentPortalOverviewApi } from "../api-endpoint/sms/portalEndpoints";
import { toaster } from "../components/ui/toaster";
import { resetGateNotificationSession } from "./gateNotifications";
import { setStudentPortalToken } from "./studentPortalSession";
import {
  STUDENT_CODE_KEY,
  clearSavedStudentCode,
} from "./studentPortalStorage";

const StudentPortalContext = createContext(null);

export const StudentPortalProvider = ({ children }) => {
  const [activeData, setActiveData] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [reportCardData, setReportCardData] = useState(null);
  const [approvalPending, setApprovalPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [termOptions, setTermOptions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [loadingTerms, setLoadingTerms] = useState(false);

  const activeStudentIdRef = useRef(null);
  const sessionVersionRef = useRef(0);

  useEffect(() => () => {
    sessionVersionRef.current += 1;
    activeStudentIdRef.current = null;
    setStudentPortalToken("");
    void resetGateNotificationSession();
  }, []);

  const periodParams = useCallback(
    (period) => {
      const target = period || selectedPeriod;
      const params = {};
      if (target?.term) params.term = target.term;
      if (target?.session) params.session = target.session;
      return params;
    },
    [selectedPeriod],
  );

  const checkUnlockStatus = useCallback(
    async (studentId, period) => {
      if (!studentId) return false;
      const sessionVersion = sessionVersionRef.current;
      try {
        const tokenRes = await checkResultTokenStatusApi(
          studentId,
          periodParams(period),
        );
        if (activeStudentIdRef.current !== studentId || sessionVersionRef.current !== sessionVersion) return false;
        const unlocked = Boolean(tokenRes.success && tokenRes.isUnlocked);
        setIsUnlocked(unlocked);
        return unlocked;
      } catch {
        if (activeStudentIdRef.current === studentId && sessionVersionRef.current === sessionVersion) setIsUnlocked(false);
        return false;
      }
    },
    [periodParams],
  );

  const loadAcademicTerms = useCallback(async (studentId) => {
    if (!studentId) return [];
    setLoadingTerms(true);
    try {
      const res = await getStudentAcademicTermsApi(studentId);
      const options = res?.success ? res.data?.options || [] : [];
      setTermOptions(options);
      setSelectedPeriod((prev) => {
        if (
          prev &&
          options.some((o) => o.term === prev.term && o.session === prev.session)
        ) {
          return prev;
        }
        const fallback = options.find((o) => o.isCurrent) || options[0];
        return fallback
          ? { term: fallback.term, session: fallback.session }
          : null;
      });
      return options;
    } catch {
      setTermOptions([]);
      return [];
    } finally {
      setLoadingTerms(false);
    }
  }, []);

  const selectPeriod = useCallback((term, session) => {
    if (!term || !session) return;
    setSelectedPeriod({ term, session });
  }, []);

  const resolveDefaultPeriod = useCallback((options, data) => {
    const fromOptions = options.find((o) => o.isCurrent) || options[0];
    if (fromOptions) {
      return { term: fromOptions.term, session: fromOptions.session };
    }
    const institution = data?.institution;
    if (institution?.currentTerm && institution?.academicSession) {
      return {
        term: institution.currentTerm,
        session: institution.academicSession,
      };
    }
    return null;
  }, []);

  const login = useCallback(
    async (code, lastName, { silent = false } = {}) => {
      const trimmedCode = code?.trim();
      const trimmedLastName = lastName?.trim();
      if (!trimmedCode || !trimmedLastName) return false;

      const sessionVersion = ++sessionVersionRef.current;
      setLoading(true);
      try {
        const res = await studentCodeLoginApi(trimmedCode, trimmedLastName);
        if (sessionVersionRef.current !== sessionVersion) return false;
        if (!res.success) return false;
        setStudentPortalToken(res.data.portalToken);

        if (
          activeStudentIdRef.current !== res.data.student?.id ||
          res.data.institution?.gateNotificationsEnabled === false
        ) {
          void resetGateNotificationSession({
            unsubscribe: activeStudentIdRef.current != null
              || res.data.institution?.gateNotificationsEnabled === false,
          });
          activeStudentIdRef.current = res.data.student?.id;
        }
        setActiveData(res.data);
        setReportCardData(null);
        setApprovalPending(false);
        localStorage.setItem(STUDENT_CODE_KEY, trimmedCode);

        const studentId = res.data.student?.id;
        const options = await loadAcademicTerms(studentId);
        const period = resolveDefaultPeriod(options, res.data);
        setSelectedPeriod(period);
        if (period) {
          await checkUnlockStatus(studentId, period);
        } else {
          setIsUnlocked(false);
        }
        return true;
      } catch (error) {
        if (!silent) {
          toaster.create({
            title:
              error.response?.data?.message ||
              "Unable to access the student portal",
            type: "error",
          });
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [checkUnlockStatus, loadAcademicTerms, resolveDefaultPeriod],
  );

  const refresh = useCallback(async () => {
    const studentId = activeStudentIdRef.current;
    const sessionVersion = sessionVersionRef.current;
    if (!studentId) return false;
    try {
      const res = await getStudentPortalOverviewApi(studentId);
      if (!res?.success || res.data?.student?.id !== studentId ||
          activeStudentIdRef.current !== studentId ||
          sessionVersionRef.current !== sessionVersion) return false;
      setActiveData((prev) => {
        if (prev?.student?.id !== studentId || sessionVersionRef.current !== sessionVersion) return prev;
        return {
          ...prev,
          student: { ...prev.student, ...res.data.student, faceImageUrl: res.data.student.faceImageUrl || null },
          institution: res.data.institution ? { ...prev.institution, ...res.data.institution } : prev.institution,
          invoice: res.data.fees?.latestInvoice ?? null,
          feeInvoice: res.data.fees?.latestInvoice ?? null,
        };
      });
      await checkUnlockStatus(studentId);
      return true;
    } catch {
      return false;
    }
  }, [checkUnlockStatus]);

  const logout = useCallback(() => {
    sessionVersionRef.current += 1;
    setStudentPortalToken("");
    void resetGateNotificationSession({ unsubscribe: true });
    activeStudentIdRef.current = null;
    clearSavedStudentCode();
    setActiveData(null);
    setReportCardData(null);
    setApprovalPending(false);
    setIsUnlocked(false);
    setTermOptions([]);
    setSelectedPeriod(null);
  }, []);

  useEffect(() => {
    const expire = () => {
      logout();
      toaster.create({ title: "Your student portal session expired. Please sign in again.", type: "info" });
    };
    window.addEventListener("student-portal-expired", expire);
    return () => window.removeEventListener("student-portal-expired", expire);
  }, [logout]);

  const loadReportCard = useCallback(
    async (period) => {
      const studentId = activeData?.student?.id;
      if (!studentId) return { ok: false, paywall: true };

      try {
        const res = await getStudentReportCardApi(studentId, periodParams(period));
        if (res.success) {
          setReportCardData(res.data);
          setApprovalPending(false);
          return { ok: true, data: res.data };
        }
        return { ok: false };
      } catch (error) {
        if (error.response?.status === 401) return { ok: false, reauthRequired: true };
        if (error.response?.data?.paywallRequired) {
          setIsUnlocked(false);
          return { ok: false, paywall: true };
        }
        if (error.response?.data?.pendingApproval) {
          setReportCardData(null);
          setApprovalPending(true);
          return {
            ok: false,
            pendingApproval: true,
            approvalStatus: error.response?.data?.approvalStatus || "pending",
          };
        }
        setReportCardData(null);
        toaster.create({ title: "Failed to load report card", type: "error" });
        return { ok: false };
      }
    },
    [activeData?.student?.id, periodParams],
  );

  const student = activeData?.student || null;
  const institution = activeData?.institution || null;
  const invoice = activeData?.invoice || activeData?.feeInvoice || null;

  const value = useMemo(
    () => ({
      activeData,
      student,
      institution,
      invoice,
      isAuthenticated: Boolean(activeData?.student),
      isUnlocked,
      loading,
      reportCardData,
      approvalPending,
      termOptions,
      selectedPeriod,
      loadingTerms,
      login,
      logout,
      refresh,
      checkUnlockStatus,
      loadReportCard,
      loadAcademicTerms,
      selectPeriod,
    }),
    [
      activeData,
      student,
      institution,
      invoice,
      isUnlocked,
      loading,
      reportCardData,
      approvalPending,
      termOptions,
      selectedPeriod,
      loadingTerms,
      login,
      logout,
      refresh,
      checkUnlockStatus,
      loadReportCard,
      loadAcademicTerms,
      selectPeriod,
    ],
  );

  return (
    <StudentPortalContext.Provider value={value}>
      {children}
    </StudentPortalContext.Provider>
  );
};

export const useStudentPortal = () => {
  const context = useContext(StudentPortalContext);
  if (!context) {
    throw new Error("useStudentPortal must be used inside StudentPortalProvider");
  }
  return context;
};

export default StudentPortalProvider;
