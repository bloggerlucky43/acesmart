import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "espree";
import { Linter } from "eslint";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import * as XLSX from "xlsx";
import { buildBroadsheetExport, broadsheetPrintPanels, downloadBroadsheetExcel, subjectDisplayValue } from "./broadsheetExport.js";
import { downloadBroadsheetPdf } from "./broadsheetPdf.js";

const source = await readFile(new URL("./MasterBroadsheet.jsx", import.meta.url), "utf8");
const tree = parse(source, { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true }, range: true });
const component = tree.body.find((node) => node.type === "ExportDefaultDeclaration").declaration;
const initializer = (name) => component.body.body.find((node) => node.type === "VariableDeclaration" && node.declarations[0].id.name === name).declarations[0].init;
const evaluate = (node, context) => new Function(...Object.keys(context), `return ${source.slice(...node.range)};`)(...Object.values(context));
const row = (overrides = {}) => ({
  student: { id: "synthetic-a", studentId: "DEMO-001", name: "Demo Student", email: "PII_SENTINEL", phone: "PII_SENTINEL", address: "PII_SENTINEL" },
  annualRank: null, term1Average: 0, term2Average: null, term3Average: undefined,
  cumulativeAverage: 0, annualComplete: false, promotionStatus: "promoted", principalRemark: "",
  subjectGrades: { Mathematics: { annualAverage: 0 }, English: { annualAverage: null } },
  ...overrides,
});
const input = (overrides = {}) => ({
  rows: [row()], subjects: ["Mathematics", "English", "Unrecorded"],
  className: "Demo Class", academicSession: "2032/2033", term: "all", schoolName: "Demo School",
  ...overrides,
});
const report = (overrides) => buildBroadsheetExport(input(overrides));

function excelTransport(onAppend = () => {}) {
  const calls = { saves: [], sheets: [] };
  return {
    calls,
    utils: {
      aoa_to_sheet: (data) => ({ data }),
      book_new: () => ({}),
      book_append_sheet: (book, sheet, name) => { calls.sheets.push({ book, sheet, name }); onAppend(); },
    },
    writeFile: (book, filename) => calls.saves.push({ book, filename }),
  };
}

function pdfTransport() {
  const calls = { saves: [], texts: [], pages: [], tables: [], constructed: 0 };
  class Pdf {
    constructor(options) {
      calls.constructed += 1;
      calls.options = options;
      this.internal = { pageSize: { getWidth: () => 297, getHeight: () => 210 } };
    }
    setFont() {}
    setFontSize() {}
    setTextColor() {}
    splitTextToSize(text) { return [text]; }
    text(text, x, y) { calls.texts.push({ text, x, y }); }
    getNumberOfPages() { return 3; }
    setPage(page) { calls.pages.push(page); }
    save(filename) { calls.saves.push(filename); }
  }
  const table = (doc, options) => {
    calls.tables.push(options);
    for (let page = 1; page <= 3; page += 1) options.willDrawPage({ doc, pageNumber: page });
  };
  return { Pdf, table, calls };
}

function handlerContext(overrides = {}) {
  const snapshot = report();
  const state = { exporting: "", notices: [], loaded: 0 };
  const transport = excelTransport();
  const pdf = pdfTransport();
  const context = {
    dataReady: true, exportReport: snapshot, exportReportRef: { current: snapshot },
    exportMounted: { current: true }, exportInFlight: { current: false }, requestId: { current: 7 },
    setExporting: (value) => { state.exporting = value; },
    toaster: { create: (notice) => state.notices.push(notice) },
    XLSX: transport, downloadBroadsheetExcel,
    loadPdf: async () => {
      state.loaded += 1;
      return { downloadBroadsheetPdf: (data, isCurrent) => downloadBroadsheetPdf(data, isCurrent, pdf) };
    },
    ...overrides,
  };
  const handlerSource = source.slice(...initializer("handleDownload").range).replace('import("./broadsheetPdf")', "loadPdf()");
  const run = new Function(...Object.keys(context), `return ${handlerSource};`)(...Object.values(context));
  return { run, context, state, transport, pdf };
}

test("shared annual snapshot dashes zero subject cells but preserves overall zero and honest decisions", () => {
  const data = report({ hasUnsavedChanges: true });
  const cells = Object.fromEntries(data.columns.map((column, index) => [column.label, data.body[0][index]]));
  assert.equal(cells["Annual Rank"], "-");
  assert.equal(cells["Term 1 Avg (%)"], 0);
  assert.equal(cells["Term 2 Avg (%)"], "-");
  assert.equal(cells["Term 3 Avg (%)"], "-");
  assert.equal(cells["Mathematics Total Avg"], "-");
  assert.equal(cells["English Total Avg"], "-");
  assert.equal(cells["Unrecorded Total Avg"], "-");
  assert.equal(cells["Cumulative Annual Avg (%)"], 0);
  assert.equal(cells["Promotion Status"], "INCOMPLETE");
  assert.equal(cells["Principal Remark"], "-");
  assert.match(data.notes.join(" "), /partial averages/);
  assert.match(data.notes.join(" "), /have not been saved/);
  assert.ok(!JSON.stringify(data).includes("PII_SENTINEL"));
  const complete = report({ rows: [row({ annualComplete: true, promotionStatus: null })] });
  assert.equal(complete.body[0][complete.columns.findIndex((column) => column.label === "Promotion Status")], "-");
});

test("each single-term report uses selected term values and has no annual/promotion columns or labels", () => {
  const subjectGrades = { Mathematics: {
    term1: { ca: 18, exam: 40, total: 58 }, term2: { ca: 22, exam: 49, total: 71 },
    term3: { ca: 0, exam: 55, total: 55 }, annualAverage: 61.3,
  } };
  const terms = [["First Term", [18, 40, 58]], ["Second Term", [22, 49, 71]], ["Third Term", ["-", 55, 55]]];
  for (const [term, expected] of terms) {
    const data = report({ term, rows: [row({ subjectGrades, annualRank: 2, cumulativeAverage: 0, principalRemark: "ANNUAL_ONLY", promotionStatus: "promoted" })] });
    assert.equal(data.title, `${term} Master Broadsheet`);
    assert.match(data.scopeLine, new RegExp(`Scope: ${term}$`));
    assert.equal(data.columns[1].label, `${term} Rank`);
    assert.equal(data.body[0][1], 2);
    assert.deepEqual(data.columns.slice(4, 7).map((column) => column.label), ["Mathematics CA", "Mathematics Exam", "Mathematics Total"]);
    assert.deepEqual(data.body[0].slice(4, 7), expected);
    assert.deepEqual(data.body[0].slice(7, 10), ["-", "-", "-"]);
    assert.equal(data.body[0].at(-1), 0);
    assert.equal(data.columns.at(-1).label, `${term} Avg (%)`);
    assert.ok(!JSON.stringify(data).match(/Annual|Promotion|Principal|ANNUAL_ONLY|Term [123] Avg/));
  }
});

test("annual subject averages exclude unscored terms and keep the official total average", () => {
  const subjectGrades = { Mathematics: {
    term1: { ca: 21, exam: 39, total: 60 }, term2: { ca: 36, exam: 50, total: null },
    term3: { ca: 26, exam: 63, total: 89 }, annualAverage: 74.5,
  } };
  const data = report({ rows: [row({ subjectGrades })] });
  assert.deepEqual(data.columns.slice(7, 10).map((column) => column.label), ["Mathematics CA Avg", "Mathematics Exam Avg", "Mathematics Total Avg"]);
  assert.deepEqual(data.body[0].slice(7, 10), [23.5, 51, 74.5]);
  assert.deepEqual(data.body[0].slice(10, 13), ["-", "-", "-"]);
  assert.equal(subjectGrades.Mathematics.term2.ca, 36);
});

test("print panels keep all three marks together and repeat student and summary columns", () => {
  const data = report({ subjects: Array.from({ length: 9 }, (_, index) => `Subject ${index + 1}`) });
  const columns = data.columns;
  const panels = broadsheetPrintPanels(columns);
  assert.deepEqual(panels.map((panel) => panel.length), [22, 22, 13]);
  for (const panel of panels) {
    assert.deepEqual(panel.slice(0, 7), [0, 1, 2, 3, 4, 5, 6]);
    assert.deepEqual(panel.slice(-3), [34, 35, 36]);
    const subjectColumns = panel.slice(7, -3);
    for (let index = 0; index < subjectColumns.length; index += 3) {
      assert.equal(new Set(subjectColumns.slice(index, index + 3).map((column) => columns[column].subject)).size, 1);
    }
  }
  assert.equal(new Set(panels.flat()).size, columns.length);
});

test("export cells are a detached ordered snapshot and only supplied filtered rows are exported", () => {
  const rows = [row(), row({ student: { id: "synthetic-b", studentId: "DEMO-002", name: "Other Demo" } })];
  const data = report({ rows: rows.slice(1) });
  assert.equal(data.body.length, 1);
  assert.equal(data.body[0][0], 1);
  assert.equal(data.body[0][2], "Other Demo");
  rows[1].subjectGrades.Mathematics.annualAverage = 99;
  rows[1].student.name = "Changed";
  assert.equal(data.body[0][2], "Other Demo");
  assert.equal(data.body[0][7], "-");
  assert.ok(!JSON.stringify(data).includes("DEMO-001"));
});

test("filenames are bounded ASCII and safe for Windows paths and Excel sheet names", () => {
  for (const className of ['../Demo:Class*?<>|"\\\u0000', ".".repeat(200), "A".repeat(300), "", "\u00e9cole / 2"]) {
    const data = report({ className, academicSession: "2032/2033/2034" });
    assert.match(data.filename, /^[a-zA-Z0-9._-]+$/);
    assert.ok(data.filename.length < 220);
    assert.ok(!/^[._-]/.test(data.filename));
    assert.ok(data.sheetName.length > 0 && data.sheetName.length <= 31);
    assert.ok(!/[\\/?:*\[\]]/.test(data.sheetName));
    assert.match(data.filename, /2032-2033-2034_Annual$/);
  }
});

test("Excel transport saves exactly shared metadata/headers/body, and rechecks scope before writeFile", () => {
  const data = report();
  const transport = excelTransport();
  assert.equal(downloadBroadsheetExcel(data, transport, () => true), true);
  assert.equal(transport.calls.saves.length, 1);
  assert.equal(transport.calls.saves[0].filename, `${data.filename}.xlsx`);
  assert.deepEqual(transport.calls.sheets[0].sheet.data.slice(-2), [data.columns.map((column) => column.label), ...data.body]);
  assert.equal(downloadBroadsheetExcel(data, transport, () => false), false);
  assert.equal(downloadBroadsheetExcel(report({ rows: [] }), transport, () => true), false);
  assert.equal(transport.calls.saves.length, 1);
  let current = true;
  const changed = excelTransport(() => { current = false; });
  assert.equal(downloadBroadsheetExcel(data, changed, () => current), false);
  assert.equal(changed.calls.saves.length, 0);
});

test("installed XLSX encodes overall zero numerically and zero subject cells as dash text", () => {
  const data = report({ rows: [row({ student: { name: "=1+1", studentId: "DEMO-001" } })] });
  let workbook;
  assert.equal(downloadBroadsheetExcel(data, { ...XLSX, writeFile: (value) => { workbook = value; } }, () => true), true);
  const sheet = workbook.Sheets[data.sheetName];
  const start = 5 + data.notes.length;
  assert.equal(sheet[XLSX.utils.encode_cell({ r: start, c: 4 })].v, 0);
  assert.equal(sheet[XLSX.utils.encode_cell({ r: start, c: 5 })].v, "-");
  const zeroSubject = sheet[XLSX.utils.encode_cell({ r: start, c: 7 })];
  assert.equal(zeroSubject.v, "-");
  assert.equal(zeroSubject.t, "s");
  const name = sheet[XLSX.utils.encode_cell({ r: start, c: 2 })];
  assert.equal(name.t, "s");
  assert.equal(name.f, undefined);
  assert.equal(name.v, "=1+1");
});

test("zero and missing subject marks use dashes while nonzero values and source records remain intact", () => {
  for (const value of [0, -0, "0", "0.0", " 0.00 ", null, undefined, ""]) {
    assert.equal(subjectDisplayValue(value), "-");
  }
  for (const value of [45, 72.5, "63", "invalid"]) assert.equal(subjectDisplayValue(value), value);
  const original = row({ subjectGrades: { Mathematics: { annualAverage: 0 }, English: { annualAverage: 63 } } });
  const data = report({ rows: [original] });
  const cells = Object.fromEntries(data.columns.map((column, index) => [column.label, data.body[0][index]]));
  assert.equal(cells["Mathematics Total Avg"], "-");
  assert.equal(cells["English Total Avg"], 63);
  assert.equal(original.subjectGrades.Mathematics.annualAverage, 0);
  assert.equal(original.cumulativeAverage, 0);
  assert.match(data.notes.join(" "), /Subject cells use - for zero/);
});

test("screen subject cells use the same breakdown as print, Excel and PDF snapshots", () => {
  assert.match(source, /subjectScoreValues\(r\.subjectGrades\?\.\[subject\], termFilter\)/);
  assert.match(source, /colSpan=\{subjectLabels\.length\}/);
  assert.match(source, /const showSummary = annual && viewMode === "cumulative"/);
  assert.match(source, /color: shown === "-" \? "#94A3B8"/);
  assert.match(source, /\{shown\}/);
  assert.match(source, /exportReport\.body\.map/);
});

test("PDF mocked transport uses landscape, fixed readable widths, repeated headers/identities and scope on every page", async () => {
  const data = report();
  const transport = pdfTransport();
  assert.equal(await downloadBroadsheetPdf(data, () => true, transport), true);
  assert.deepEqual(transport.calls.options, { orientation: "landscape", unit: "mm", format: "a4" });
  const options = transport.calls.tables[0];
  assert.deepEqual(options.body, data.body);
  assert.deepEqual(options.head[0], data.columns.map((column) => column.label));
  assert.equal(options.showHead, "everyPage");
  assert.equal(options.horizontalPageBreak, true);
  assert.deepEqual(options.horizontalPageBreakRepeat, [0, 1, 2, 3]);
  assert.equal(options.rowPageBreak, "avoid");
  assert.equal(options.styles.fontSize, 9);
  assert.equal(transport.calls.texts.filter((item) => item.text[0] === data.scopeLine).length, 3);
  assert.deepEqual(transport.calls.pages, [1, 2, 3]);
  assert.deepEqual(transport.calls.saves, [`${data.filename}.pdf`]);
});

test("PDF never generates or saves revoked/empty data and rechecks after async generation", async () => {
  const data = report();
  const transport = pdfTransport();
  assert.equal(await downloadBroadsheetPdf(data, () => false, transport), false);
  assert.equal(await downloadBroadsheetPdf(report({ rows: [] }), () => true, transport), false);
  assert.equal(transport.calls.constructed, 0);
  let current = true;
  const pending = downloadBroadsheetPdf(data, () => current, transport);
  current = false;
  assert.equal(await pending, false);
  assert.equal(transport.calls.constructed, 0);
  current = true;
  const changed = pdfTransport();
  const table = changed.table;
  changed.table = (doc, options) => { table(doc, options); current = false; };
  assert.equal(await downloadBroadsheetPdf(data, () => current, changed), false);
  assert.equal(changed.calls.constructed, 1);
  assert.equal(changed.calls.saves.length, 0);
});

test("real offline PDF paginates many subjects and students with every cell inside landscape margins", async () => {
  const subjects = Array.from({ length: 18 }, (_, index) => `Demonstration Subject ${index + 1}`);
  const rows = Array.from({ length: 73 }, (_, index) => row({
    student: { id: `synthetic-${index}`, name: `Demo Student ${index + 1}`, studentId: `DEMO-${index + 1}` },
    annualRank: index + 1, annualComplete: true, promotionStatus: null,
    principalRemark: index === 0 ? "A longer demonstration remark which wraps without being clipped." : "-",
    subjectGrades: Object.fromEntries(subjects.map((subject) => [subject, { annualAverage: index === 0 ? 0 : 63 }])),
  }));
  const data = report({ subjects, rows });
  const pages = new Map();
  const seen = new Set();
  let saved = 0;
  let document;
  function Pdf(options) {
    document = new jsPDF(options);
    document.save = (filename) => { saved += 1; assert.equal(filename, `${data.filename}.pdf`); };
    return document;
  }
  const table = (doc, options) => autoTable(doc, {
    ...options,
    willDrawPage: (event) => {
      const page = doc.internal.getCurrentPageInfo().pageNumber;
      pages.set(page, { headers: new Set(), rows: new Set(), scope: false });
      const text = doc.text;
      doc.text = (...args) => {
        if (Array.isArray(args[0]) && args[0].join(" ").includes("Scope: Annual 3-Term Cumulative")) pages.get(page).scope = true;
        return text.apply(doc, args);
      };
      options.willDrawPage(event);
      doc.text = text;
    },
    didDrawCell: (event) => {
      const page = pages.get(doc.internal.getCurrentPageInfo().pageNumber);
      if (event.section === "head") page.headers.add(event.column.index);
      else {
        page.rows.add(event.row.index);
        seen.add(`${event.row.index}:${event.column.index}`);
      }
      assert.ok(event.cell.x >= options.margin.left - 0.01);
      assert.ok(event.cell.x + event.cell.width <= doc.internal.pageSize.getWidth() - options.margin.right + 0.01);
      assert.ok(event.cell.y >= options.margin.top - 0.01);
      assert.ok(event.cell.y + event.cell.height <= doc.internal.pageSize.getHeight() - options.margin.bottom + 0.01);
    },
  });
  assert.equal(await downloadBroadsheetPdf(data, () => true, { Pdf, table }), true);
  assert.equal(saved, 1);
  assert.ok(document.getNumberOfPages() > 4);
  assert.equal(pages.size, document.getNumberOfPages());
  for (const page of pages.values()) {
    assert.equal(page.scope, true);
    for (const identity of [0, 1, 2, 3]) assert.ok(page.headers.has(identity));
    assert.ok(page.rows.size > 0);
  }
  for (let student = 0; student < rows.length; student += 1) {
    for (let column = 0; column < data.columns.length; column += 1) assert.ok(seen.has(`${student}:${column}`), `Missing cell ${student}:${column}`);
  }
  assert.equal(Buffer.from(document.output("arraybuffer")).subarray(0, 5).toString(), "%PDF-");
});

test("actual page readiness and snapshot builder reject auth hydration, wrong scope and unassigned classes", () => {
  const auth = { mounted: true, authLoading: false, user: { _id: "demo-teacher", role: "teacher" } };
  assert.equal(evaluate(initializer("authReady"), auth), true);
  for (const overrides of [{ mounted: false }, { authLoading: true }, { user: null }, { user: { _id: "demo-student", role: "student" } }]) {
    assert.equal(evaluate(initializer("authReady"), { ...auth, ...overrides }), false);
  }
  const ready = { authReady: true, profileReady: true, classesScope: "demo-teacher:2032/2033", classScope: "demo-teacher:2032/2033", loadedScope: "class-a:all", scope: "class-a:all", loading: false };
  assert.equal(evaluate(initializer("dataReady"), ready), true);
  for (const overrides of [{ authReady: false }, { profileReady: false }, { classesScope: "old-user" }, { loadedScope: "class-b:all" }, { scope: "class-a:First Term" }, { loading: true }]) {
    assert.equal(evaluate(initializer("dataReady"), { ...ready, ...overrides }), false);
  }
  const context = {
    dataReady: true, classArms: [{ id: "class-a" }], selectedClassArm: "class-a",
    filteredRows: [row()], subjects: ["Mathematics"], currentClassName: "Demo Class", academicSession: "2032/2033", termFilter: "all",
    school: { name: "Demo School" }, hasUnsavedChanges: false, formatStudentName: (name) => name, buildBroadsheetExport,
  };
  const builder = initializer("exportReport").arguments[0];
  assert.equal(evaluate(builder, context)().body.length, 1);
  assert.equal(evaluate(builder, { ...context, selectedClassArm: "unassigned" })(), null);
  assert.equal(evaluate(builder, { ...context, dataReady: false })(), null);
  assert.match(source, /canManage \? getClassArmsApi\(\) : getMyTeachingAssignmentsApi\(\{ session: academicSession \}\)/);
  assert.match(source, /exportReportRef\.current = exportReport/);
  assert.match(source, /return \(\) => \{ exportReportRef\.current = null; \}/);
});

test("actual page filtering limits name/ID matches and never filters zero-score students out", () => {
  const rows = [row(), row({ student: { name: "Other Demo", studentId: "DEMO-002" } })];
  const filter = initializer("filteredRows").arguments[0];
  assert.deepEqual(evaluate(filter, { rows, dataReady: true, searchQuery: "  demo-002 " })(), [rows[1]]);
  assert.deepEqual(evaluate(filter, { rows, dataReady: true, searchQuery: "STUDENT" })(), [rows[0]]);
  assert.deepEqual(evaluate(filter, { rows, dataReady: true, searchQuery: "" })(), rows);
  assert.deepEqual(evaluate(filter, { rows, dataReady: false, searchQuery: "" })(), []);
});

test("actual download handler saves both formats only with the current authorized filtered snapshot", async () => {
  for (const format of ["excel", "pdf"]) {
    const harness = handlerContext();
    await harness.run(format);
    assert.equal(harness.transport.calls.saves.length, format === "excel" ? 1 : 0);
    assert.equal(harness.pdf.calls.saves.length, format === "pdf" ? 1 : 0);
    assert.equal(harness.state.notices[0].type, "success");
    assert.equal(harness.state.exporting, "");
    assert.equal(harness.context.exportInFlight.current, false);
  }
  for (const overrides of [{ dataReady: false }, { exportReport: null }, { exportReport: report({ rows: [] }) }, { exportMounted: { current: false } }, { exportReportRef: { current: null } }, { exportInFlight: { current: true } }]) {
    const harness = handlerContext(overrides);
    await harness.run("excel");
    await harness.run("pdf");
    assert.equal(harness.transport.calls.saves.length, 0);
    assert.equal(harness.pdf.calls.saves.length, 0);
    assert.equal(harness.state.loaded, 0);
  }
});

test("lazy import cannot save after class/session/term/filter/data/auth/refresh changes or unmount", async () => {
  for (const change of [
    (context) => { context.exportReportRef.current = report({ className: "Other Class" }); },
    (context) => { context.exportReportRef.current = report({ academicSession: "2033/2034" }); },
    (context) => { context.exportReportRef.current = report({ term: "First Term" }); },
    (context) => { context.exportReportRef.current = report({ rows: [] }); },
    (context) => { context.exportReportRef.current = report({ rows: [row({ cumulativeAverage: 75 })] }); },
    (context) => { context.exportReportRef.current = null; },
    (context) => { context.requestId.current += 1; },
    (context) => { context.exportMounted.current = false; },
  ]) {
    let resolve;
    const harness = handlerContext({ loadPdf: () => new Promise((done) => { resolve = done; }) });
    const pending = harness.run("pdf");
    assert.equal(harness.state.exporting, "pdf");
    change(harness.context);
    resolve({ downloadBroadsheetPdf: () => assert.fail("stale import must never invoke generator") });
    await pending;
    assert.equal(harness.pdf.calls.saves.length, 0);
    assert.ok(!harness.state.notices.some((notice) => notice.type === "success"));
    assert.equal(harness.context.exportInFlight.current, false);
  }
});

test("handler prevents duplicate clicks and handles import/generation/Excel failures with retryable state", async () => {
  for (const failure of ["import", "generation", "excel"]) {
    const harness = handlerContext({
      loadPdf: async () => {
        if (failure === "import") throw new Error("synthetic failure");
        return { downloadBroadsheetPdf: async () => { throw new Error("synthetic failure"); } };
      },
      ...(failure === "excel" ? { downloadBroadsheetExcel: () => { throw new Error("synthetic failure"); } } : {}),
    });
    await harness.run(failure === "excel" ? "excel" : "pdf");
    assert.equal(harness.state.notices[0].type, "error");
    assert.equal(harness.state.exporting, "");
    assert.equal(harness.context.exportInFlight.current, false);
    assert.equal(harness.pdf.calls.saves.length + harness.transport.calls.saves.length, 0);
  }
  let resolve;
  const harness = handlerContext({ loadPdf: () => new Promise((done) => { resolve = done; }) });
  const pending = harness.run("pdf");
  await harness.run("excel");
  assert.equal(harness.transport.calls.saves.length, 0);
  resolve({ downloadBroadsheetPdf: (data, current) => downloadBroadsheetPdf(data, current, harness.pdf) });
  await pending;
  assert.equal(harness.pdf.calls.saves.length, 1);
});

test("owned JSX is valid, both actions are discoverable/responsive, and print shares export cells", () => {
  assert.match(source, /Download Excel/);
  assert.match(source, /Download PDF/);
  assert.ok(!source.includes("Export Excel"));
  assert.match(source, /<SimpleGrid columns=\{\{ base: 1, sm: 2 \}\} gap=\{3\}>/);
  assert.match(source, /broadsheetPrintPanels\(exportReport\.columns\)\.map/);
  assert.match(source, /exportReport\.body\.map/);
  assert.match(source, /aria-busy=\{exporting === "pdf"\}/);
  assert.match(source, /await import\("\.\/broadsheetPdf"\)/);
  assert.ok(!tree.body.some((node) => node.type === "ImportDeclaration" && /jspdf|broadsheetPdf/.test(node.source.value)));
});

test("targeted owned-source lint passes undefined/unused checks plus React hooks and dependencies", async () => {
  const linter = new Linter();
  for (const filename of ["MasterBroadsheet.jsx", "broadsheetExport.js", "broadsheetPdf.js"]) {
    const content = await readFile(new URL(`./${filename}`, import.meta.url), "utf8");
    const messages = linter.verify(content, [{
      files: ["**/*.{js,jsx}"],
      languageOptions: { ecmaVersion: "latest", sourceType: "module", globals: globals.browser, parserOptions: { ecmaFeatures: { jsx: true } } },
      plugins: { "react-hooks": reactHooks },
      rules: {
        "no-undef": "error",
        "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    }], { filename });
    assert.deepEqual(messages, [], `${filename}: ${messages.map((message) => `${message.line}:${message.column} ${message.message}`).join("; ")}`);
  }
});
