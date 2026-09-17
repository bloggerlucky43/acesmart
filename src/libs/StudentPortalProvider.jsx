import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  studentCodeLoginApi,
  checkResultTokenStatusApi,
  getStudentReportCardApi,
} from "../api-endpoint/sms/smsEndpoints";
import { getStudentAcademicTermsApi } from "../api-endpoint/sms/portalEndpoints";
import { toaster } from "../components/ui/toaster";
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

  // The surname is the portal password, so it is kept in memory only and
  // never written to localStorage.
  const credentialsRef = useRef({ code: "", lastName: "" });

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
      try {
        const tokenRes = await checkResultTokenStatusApi(
          studentId,
          periodParams(period),
        );
        const unlocked = Boolean(tokenRes.success && tokenRes.isUnlocked);
        setIsUnlocked(unlocked);
        return unlocked;
      } catch {
        setIsUnlocked(false);
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

      setLoading(true);
      try {
        const res = await studentCodeLoginApi(trimmedCode, trimmedLastName);
        if (!res.success) return false;

        credentialsRef.current = {
          code: trimmedCode,
          lastName: trimmedLastName,
        };
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
    const { code, lastName } = credentialsRef.current;
    if (!code || !lastName) return false;
    return login(code, lastName, { silent: true });
  }, [login]);

  const logout = useCallback(() => {
    credentialsRef.current = { code: "", lastName: "" };
    clearSavedStudentCode();
    setActiveData(null);
    setReportCardData(null);
    setApprovalPending(false);
    setIsUnlocked(false);
    setTermOptions([]);
    setSelectedPeriod(null);
  }, []);

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
