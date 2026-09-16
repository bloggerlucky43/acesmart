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
  const [loading, setLoading] = useState(false);

  // The surname is the portal password, so it is kept in memory only and
  // never written to localStorage.
  const credentialsRef = useRef({ code: "", lastName: "" });

  const checkUnlockStatus = useCallback(async (studentId) => {
    if (!studentId) return false;
    try {
      const tokenRes = await checkResultTokenStatusApi(studentId);
      const unlocked = Boolean(tokenRes.success && tokenRes.isUnlocked);
      setIsUnlocked(unlocked);
      return unlocked;
    } catch {
      setIsUnlocked(false);
      return false;
    }
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
        localStorage.setItem(STUDENT_CODE_KEY, trimmedCode);
        await checkUnlockStatus(res.data.student?.id);
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
    [checkUnlockStatus],
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
    setIsUnlocked(false);
  }, []);

  const loadReportCard = useCallback(async () => {
    const studentId = activeData?.student?.id;
    if (!studentId) return { ok: false, paywall: true };

    try {
      const res = await getStudentReportCardApi(studentId);
      if (res.success) {
        setReportCardData(res.data);
        return { ok: true, data: res.data };
      }
      return { ok: false };
    } catch (error) {
      if (error.response?.data?.paywallRequired) {
        setIsUnlocked(false);
        return { ok: false, paywall: true };
      }
      toaster.create({ title: "Failed to load report card", type: "error" });
      return { ok: false };
    }
  }, [activeData?.student?.id]);

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
      login,
      logout,
      refresh,
      checkUnlockStatus,
      loadReportCard,
    }),
    [
      activeData,
      student,
      institution,
      invoice,
      isUnlocked,
      loading,
      reportCardData,
      login,
      logout,
      refresh,
      checkUnlockStatus,
      loadReportCard,
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
