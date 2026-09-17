import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
  Input,
  Textarea,
  Checkbox,
  Spinner,
} from "@chakra-ui/react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaUserGraduate,
  FaSignature,
  FaStamp,
  FaSyncAlt,
} from "react-icons/fa";
import {
  getClassArmsApi,
  getApprovalQueueApi,
  approveReportCardApi,
  rejectReportCardApi,
  bulkApproveReportCardsApi,
  getRemarkTemplatesApi,
} from "../../api-endpoint/sms/smsEndpoints";
import { useAuth } from "../../libs/AuthProvider";
import { toaster } from "../../components/ui/toaster";
import DashboardLayout from "../../constants/dashboardlayout";

const STATUS_STYLES = {
  approved: { bg: "#ECFDF5", color: "#065F46", label: "Approved" },
  pending: { bg: "#FFFBEB", color: "#92400E", label: "Pending" },
  rejected: { bg: "#FEF2F2", color: "#991B1B", label: "Returned" },
};

export default function PrincipalApprovals() {
  const { user } = useAuth();
  const institution = user?.institution;

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ hasSignature: false, hasStamp: false, principalName: "" });
  const [loading, setLoading] = useState(false);

  const [templates, setTemplates] = useState([]);
  const [remarks, setRemarks] = useState({}); // { [studentId]: text }
  const [selected, setSelected] = useState([]);
  const [bulkRemark, setBulkRemark] = useState("");
  const [nextTermResumption, setNextTermResumption] = useState("");
  const [working, setWorking] = useState(false);

  const term = institution?.currentTerm || "First Term";
  const session = institution?.academicSession || "2025/2026";

  useEffect(() => {
    const init = async () => {
      try {
        const [classRes, tplRes] = await Promise.all([
          getClassArmsApi().catch(() => ({ data: [] })),
          getRemarkTemplatesApi("principal").catch(() => ({ data: [] })),
        ]);
        if (classRes.success) {
          setClasses(classRes.data);
          if (classRes.data.length > 0) setSelectedClassId(classRes.data[0].id);
        }
        if (tplRes.success) setTemplates(tplRes.data);
      } catch (e) {
        console.error("Init approvals error:", e);
      }
    };
    init();
  }, []);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getApprovalQueueApi({
        classArmId: selectedClassId,
        status: statusFilter,
        search,
        term,
        session,
      });
      if (res.success) {
        setRows(res.data.students);
        setMeta({
          hasSignature: res.data.hasSignature,
          hasStamp: res.data.hasStamp,
          principalName: res.data.principalName,
        });
        setRemarks((prev) => {
          const next = { ...prev };
          res.data.students.forEach((s) => {
            if (next[s.studentId] === undefined) next[s.studentId] = s.principalRemark || "";
          });
          return next;
        });
      }
    } catch (e) {
      toaster.create({
        title: e.response?.data?.message || "Failed to load approval queue",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, statusFilter, search, term, session]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const suggestTemplate = (averageScore) => {
    if (averageScore === null || averageScore === undefined || averageScore === "") return "";
    const score = Number(averageScore);
    if (Number.isNaN(score)) return "";
    const match = templates.find((t) => score >= t.minScore && score <= t.maxScore);
    return match?.text || "";
  };

  const setRemarkFor = (studentId, value) =>
    setRemarks((prev) => ({ ...prev, [studentId]: value }));

  const toggleSelected = (studentId) =>
    setSelected((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );

  const allSelected = rows.length > 0 && selected.length === rows.length;
  const toggleAll = () => setSelected(allSelected ? [] : rows.map((r) => r.studentId));

  const selectedRows = useMemo(
    () => rows.filter((r) => selected.includes(r.studentId)),
    [rows, selected]
  );

  const handleApprove = async (row) => {
    setWorking(true);
    try {
      const res = await approveReportCardApi(row.studentId, {
        term,
        session,
        principalRemark: remarks[row.studentId] || suggestTemplate(row.averageScore),
        nextTermResumption,
      });
      if (res.success) {
        toaster.create({ title: `Approved: ${row.name}`, type: "success" });
        await loadQueue();
      }
    } catch (e) {
      toaster.create({
        title: e.response?.data?.message || "Failed to approve report card",
        type: "error",
      });
    } finally {
      setWorking(false);
    }
  };

  const handleReject = async (row) => {
    const reason = window.prompt(`Reason for returning ${row.name}'s result?`, "Scores need correction");
    if (reason === null) return;
    setWorking(true);
    try {
      const res = await rejectReportCardApi(row.studentId, { term, session, reason });
      if (res.success) {
        toaster.create({ title: `Returned: ${row.name}`, type: "info" });
        await loadQueue();
      }
    } catch (e) {
      toaster.create({
        title: e.response?.data?.message || "Failed to return report card",
        type: "error",
      });
    } finally {
      setWorking(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selected.length === 0) {
      toaster.create({ title: "Select at least one student", type: "warning" });
      return;
    }
    setWorking(true);
    try {
      const res = await bulkApproveReportCardsApi({
        studentIds: selected,
        term,
        session,
        principalRemark: bulkRemark,
        nextTermResumption,
      });
      if (res.success) {
        toaster.create({ title: res.message, type: "success" });
        setSelected([]);
        setBulkRemark("");
        await loadQueue();
      }
    } catch (e) {
      toaster.create({
        title: e.response?.data?.message || "Failed to bulk approve",
        type: "error",
      });
    } finally {
      setWorking(false);
    }
  };

  const applyBulkRemarkToSelected = () => {
    if (!bulkRemark.trim()) return;
    setRemarks((prev) => {
      const next = { ...prev };
      selected.forEach((id) => {
        next[id] = bulkRemark;
      });
      return next;
    });
    toaster.create({ title: "Remark applied to selected students", type: "success" });
  };

  return (
    <DashboardLayout>
      <Box
        p={{ base: 4, md: 8 }}
        pt={{ base: "84px", md: "88px" }}
        pl={{ base: 4, lg: "260px" }}
        maxW="1300px"
        mx="auto"
      >
        <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3}>
          <Box>
            <Text fontSize="24px" fontWeight="900" color="#0F172A" letterSpacing="-0.5px">
              Result Approval & Principal Remarks
            </Text>
            <Text fontSize="13px" color="#64748B">
              {institution?.name || "Institution"} • {term} • {session}
            </Text>
          </Box>
          <Button
            size="sm"
            variant="outline"
            borderColor="#CBD5E1"
            borderRadius="xl"
            fontWeight="700"
            onClick={loadQueue}
            loading={loading}
          >
            <Icon as={FaSyncAlt} mr={2} boxSize={3} />
            Refresh
          </Button>
        </Flex>

        {(!meta.hasSignature || !meta.hasStamp) && (
          <Flex
            bg="#FFFBEB"
            border="1px solid #FDE68A"
            borderRadius="xl"
            p={4}
            mb={5}
            gap={3}
            align="center"
          >
            <Icon as={FaSignature} color="#B45309" />
            <Text fontSize="13px" color="#92400E">
              {!meta.hasSignature && "No principal signature on file. "}
              {!meta.hasStamp && "No school stamp on file. "}
              Upload them under <strong>School Settings</strong> so approved report cards carry your
              signature and stamp.
            </Text>
          </Flex>
        )}

        {/* Filters */}
        <Flex
          bg="white"
          p={5}
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          gap={4}
          flexWrap="wrap"
          align="flex-end"
          mb={5}
        >
          <Box>
            <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>CLASS ARM</Text>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              style={{ height: "40px", padding: "0 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px", fontWeight: "600", background: "#F8FAFC" }}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Box>

          <Box>
            <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>STATUS</Text>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ height: "40px", padding: "0 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13px", fontWeight: "600", background: "#F8FAFC" }}
            >
              <option value="pending">Pending approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Returned</option>
              <option value="all">All results</option>
            </select>
          </Box>

          <Box flex={1} minW="200px">
            <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>SEARCH STUDENT</Text>
            <Input
              size="sm"
              h="40px"
              borderRadius="10px"
              placeholder="Name or student code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>

          <Box flex={1} minW="220px">
            <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>NEXT TERM RESUMES</Text>
            <Input
              size="sm"
              h="40px"
              borderRadius="10px"
              placeholder="e.g. January 12, 2027"
              value={nextTermResumption}
              onChange={(e) => setNextTermResumption(e.target.value)}
            />
          </Box>
        </Flex>

        {/* Bulk bar */}
        <Flex
          bg="#EEF2FF"
          border="1px solid #C7D2FE"
          borderRadius="2xl"
          p={4}
          gap={3}
          align="center"
          mb={5}
          wrap="wrap"
        >
          <Checkbox.Root checked={allSelected} onCheckedChange={toggleAll} colorPalette="purple">
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>
              <Text fontSize="13px" fontWeight="700" color="#3730A3">
                Select all ({selected.length}/{rows.length})
              </Text>
            </Checkbox.Label>
          </Checkbox.Root>
          <Input
            size="sm"
            flex={1}
            minW="220px"
            h="38px"
            bg="white"
            borderRadius="10px"
            placeholder="Bulk principal remark (optional — auto-banded per student if blank)"
            value={bulkRemark}
            onChange={(e) => setBulkRemark(e.target.value)}
          />
          <Button size="sm" variant="outline" borderRadius="xl" onClick={applyBulkRemarkToSelected}>
            Apply to selected
          </Button>
          <Button
            size="sm"
            bg="linear-gradient(135deg, #10B981 0%, #059669 100%)"
            color="white"
            borderRadius="xl"
            fontWeight="700"
            onClick={handleBulkApprove}
            loading={working}
            disabled={selected.length === 0}
          >
            <Icon as={FaCheckCircle} mr={2} boxSize={3.5} />
            Approve & Publish Selected
          </Button>
        </Flex>

        {/* Queue table */}
        <Box bg="white" borderRadius="2xl" border="1px solid #E2E8F0" overflow="hidden">
          <Box overflowX="auto">
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  <th style={{ padding: "12px 16px", width: "40px" }} />
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>STUDENT</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>AVERAGE</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>RANK</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>STATUS</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B", minWidth: "280px" }}>PRINCIPAL REMARK</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "40px", textAlign: "center" }}>
                      <Spinner color="#4338CA" />
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#94A3B8", fontSize: "13px" }}>
                      <Icon as={FaUserGraduate} boxSize={6} mb={2} />
                      <Text>No students match this filter.</Text>
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const style = STATUS_STYLES[row.status] || STATUS_STYLES.pending;
                    return (
                      <tr key={row.studentId} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <Checkbox.Root
                            checked={selected.includes(row.studentId)}
                            onCheckedChange={() => toggleSelected(row.studentId)}
                            colorPalette="purple"
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                          </Checkbox.Root>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <Text fontSize="14px" fontWeight="700" color="#0F172A">{row.name}</Text>
                          <Text fontSize="12px" color="#4338CA" fontWeight="600">{row.studentCode}</Text>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "800", color: "#0F172A" }}>
                          {row.averageScore !== null ? `${row.averageScore}%` : "—"}
                          <Text as="span" fontSize="11px" color="#94A3B8" fontWeight="600">
                            {" "}({row.totalSubjects} subj.)
                          </Text>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "700", color: "#475569" }}>
                          {row.rank ? `#${row.rank}` : "—"}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <Badge bg={style.bg} color={style.color} px={2} py={0.5} borderRadius="md" fontWeight="800">
                            {style.label}
                          </Badge>
                        </td>
                        <td style={{ padding: "12px 16px", minWidth: "280px" }}>
                          <select
                            value=""
                            onChange={(e) => {
                              const tpl = templates.find(
                                (t) => String(t.id ?? t.label) === e.target.value
                              );
                              if (tpl) setRemarkFor(row.studentId, tpl.text);
                            }}
                            style={{
                              width: "100%",
                              height: "32px",
                              borderRadius: "8px",
                              border: "1px solid #CBD5E1",
                              fontSize: "12px",
                              background: "#F8FAFC",
                              marginBottom: "6px",
                            }}
                          >
                            <option value="">
                              {row.averageScore !== null
                                ? `Suggest for ${row.averageScore}%…`
                                : "Pick a preset remark…"}
                            </option>
                            {templates.map((t) => (
                              <option key={t.id ?? t.label} value={String(t.id ?? t.label)}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                          <Textarea
                            size="sm"
                            rows={2}
                            fontSize="12px"
                            placeholder={suggestTemplate(row.averageScore) || "Write a remark…"}
                            value={remarks[row.studentId] ?? ""}
                            onChange={(e) => setRemarkFor(row.studentId, e.target.value)}
                          />
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <Flex gap={2}>
                            <Button
                              size="xs"
                              bg="#10B981"
                              color="white"
                              borderRadius="lg"
                              fontWeight="700"
                              onClick={() => handleApprove(row)}
                              loading={working}
                            >
                              <Icon as={FaCheckCircle} mr={1} /> Approve
                            </Button>
                            {row.status !== "rejected" && (
                              <Button
                                size="xs"
                                variant="outline"
                                borderColor="#FCA5A5"
                                color="#B91C1C"
                                borderRadius="lg"
                                fontWeight="700"
                                onClick={() => handleReject(row)}
                                disabled={working}
                              >
                                <Icon as={FaTimesCircle} mr={1} /> Return
                              </Button>
                            )}
                          </Flex>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Box>
        </Box>

        {selectedRows.length > 0 && !meta.hasSignature && (
          <Flex mt={4} gap={2} align="center" color="#B45309">
            <Icon as={FaStamp} boxSize={3.5} />
            <Text fontSize="12px">
              Selected cards will be published without a signature image until one is uploaded.
            </Text>
          </Flex>
        )}
      </Box>
    </DashboardLayout>
  );
}
