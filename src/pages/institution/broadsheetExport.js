import { annualRowComplete, promotionLabel } from "./reportScope.js";

const TERM_KEYS = { "First Term": "term1", "Second Term": "term2", "Third Term": "term3" };
const SUBJECT_MARKS = ["CA", "Exam", "Total"];

export function subjectDisplayValue(value) {
  if (value == null || value === 0 ||
      (typeof value === "string" && (!value.trim() || Number(value) === 0))) return "-";
  return value;
}

export function subjectScoreLabels(annual) {
  return annual ? SUBJECT_MARKS.map((label) => `${label} Avg`) : SUBJECT_MARKS;
}

export function subjectScoreValues(grades, term) {
  if (term !== "all") {
    const marks = grades?.[TERM_KEYS[term]];
    return [marks?.ca, marks?.exam, marks?.total].map(subjectDisplayValue);
  }

  const scoredTerms = Object.values(TERM_KEYS).map((key) => grades?.[key]).filter((marks) => marks?.total != null);
  const average = (key) => {
    const values = scoredTerms.map((marks) => marks[key]).filter(Number.isFinite);
    return values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)) : null;
  };
  return [average("ca"), average("exam"), grades?.annualAverage].map(subjectDisplayValue);
}

export function buildBroadsheetExport({ rows, subjects, className, academicSession, term, schoolName, hasUnsavedChanges, formatName = (name) => name }) {
  const annual = term === "all";
  const scopeLabel = annual ? "Annual 3-Term Cumulative" : term;
  const columns = [
    { label: "S/N", width: 12 },
    { label: annual ? "Annual Rank" : `${term} Rank`, width: 18 },
    { label: "Student Name", width: 48, align: "left" },
    { label: "Student ID", width: 30, align: "left" },
    ...(annual ? [1, 2, 3].map((number) => ({ label: `Term ${number} Avg (%)`, width: 22 })) : []),
    ...subjects.flatMap((subject) => subjectScoreLabels(annual).map((label) => ({ label: `${subject} ${label}`, width: 24, subject }))),
    { label: annual ? "Cumulative Annual Avg (%)" : `${term} Avg (%)`, width: 28 },
    ...(annual ? [
      { label: "Promotion Status", width: 38 },
      { label: "Principal Remark", width: 50, align: "left" },
    ] : []),
  ];
  const body = rows.map((row, index) => [
    index + 1,
    row.annualRank ?? "-",
    formatName(row.student.name) || "-",
    row.student.studentId || "-",
    ...(annual ? [row.term1Average, row.term2Average, row.term3Average].map((value) => value ?? "-") : []),
    ...subjects.flatMap((subject) => subjectScoreValues(row.subjectGrades?.[subject], term)),
    row.cumulativeAverage ?? "-",
    ...(annual ? [promotionLabel(row, true), row.principalRemark || "-"] : []),
  ]);
  const notes = [
    `${body.length} student(s) in the current filter. All subjects included. Subject cells use - for zero, unrecorded, or non-offered subjects; stored scores and overall calculations are unchanged.`,
    ...(annual ? ["Subject averages use recorded marks from terms with a recorded total."] : []),
    ...(annual && rows.some((row) => !annualRowComplete(row)) ? ["Incomplete annual records show partial averages only; no promotion decision applies."] : []),
    ...(annual && hasUnsavedChanges ? ["Pending local promotion decisions/remarks are included and have not been saved."] : []),
  ];
  const safePart = (value, fallback) => String(value || "").normalize("NFKD")
    .replace(/[\\/]+/g, "-").replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^[._-]+|[._-]+$/g, "").slice(0, 64) || fallback;
  const safeClass = safePart(className, "Class");
  return {
    schoolName: schoolName || "School",
    title: annual ? "Annual Master Broadsheet" : `${term} Master Broadsheet`,
    scopeLine: `Class: ${className} | Academic Session: ${academicSession} | Scope: ${scopeLabel}`,
    notes,
    columns,
    body,
    filename: `${safeClass}_Master_Broadsheet_${safePart(academicSession, "Session")}_${safePart(annual ? "Annual" : term, "Term")}`,
    sheetName: `${safeClass} Broadsheet`.slice(0, 31),
  };
}

export function broadsheetPrintPanels(columns) {
  const indices = columns.map((_, index) => index);
  const first = columns.findIndex((column) => column.subject !== undefined);
  if (first === -1) return [indices];
  const markColumnCount = columns.filter((column) => column.subject !== undefined).length;
  const end = first + markColumnCount;
  const panelSize = SUBJECT_MARKS.length * 4;
  const panels = [];
  // Keep each subject's three marks together and repeat student and summary columns.
  for (let start = first; start < end; start += panelSize) {
    panels.push([...indices.slice(0, first), ...indices.slice(start, Math.min(start + panelSize, end)), ...indices.slice(end)]);
  }
  return panels;
}

export function downloadBroadsheetExcel(report, XLSX, isCurrent) {
  if (!report?.body.length || !isCurrent()) return false;
  const metadata = [[report.schoolName], [report.title], [report.scopeLine], ...report.notes.map((note) => [note]), []];
  const worksheet = XLSX.utils.aoa_to_sheet([
    ...metadata,
    report.columns.map((column) => column.label),
    ...report.body,
  ]);
  worksheet["!cols"] = report.columns.map((column) => ({
    wch: column.subject === undefined ? Math.round(column.width / 2) : Math.min(48, column.label.length + 2),
  }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, report.sheetName);
  if (!isCurrent()) return false;
  XLSX.writeFile(workbook, `${report.filename}.xlsx`);
  return true;
}
