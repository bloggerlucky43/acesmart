import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { parse } from "espree";
import { Linter } from "eslint";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import { reportClassAssignments, reportClassId } from "../src/pages/teacher/sms/reportClassSelector.js";
import { academicSessionOptions, defaultAcademicSession, assignedSubjectNames, scoreRowEditable } from "../src/pages/institution/reportScope.js";

const session = "2026/2027";
const classA = { id: "class-a", name: "JSS 1 A" };
const classB = { id: "class-b", name: "JSS 2 B" };
const classC = { id: "class-c", name: "SSS 1 C" };
const catalog = [
  { id: "subject-math", name: "Mathematics", isActive: true, isGlobal: true },
  { _id: "subject-bio", name: "Biology", isActive: true, isGlobal: true },
  { id: "subject-local", name: "School Studies", isActive: true, isGlobal: false, institutionId: "school-a" },
];
const subjectAssignment = (classArm = classA, overrides = {}) => ({
  classArmId: reportClassId(classArm), ClassArm: classArm, Subject: { name: "Mathematics" }, session, ...overrides,
});
const assignments = (classes = [classA, classB], subjects = [subjectAssignment()], activeCatalog = catalog) => ({
  success: true, data: { classes, subjectAssignments: subjects, subjects: activeCatalog, institutionId: "school-a", session },
});

test("two class-teacher classes survive independent of a one-class subject assignment", () => {
  const result = reportClassAssignments(assignments(), session);
  assert.deepEqual(result.formClassIds, ["class-a", "class-b"]);
  assert.deepEqual(result.classes.map((row) => row.id), ["class-a", "class-b"]);
  assert.deepEqual(assignedSubjectNames(result.subjectAssignments, "class-b", session), []);
  assert.deepEqual(result.formSubjects, ["Biology", "Mathematics", "School Studies"]);
});

test("legacy _id shape, duplicate IDs and duplicate names never collapse distinct classes", () => {
  const a = { _id: "class-a", name: "Same class name" };
  const b = { _id: "class-b", name: "Same class name" };
  const result = reportClassAssignments(assignments([a, b, { ...a, id: "class-a" }], [
    subjectAssignment({ id: "class-a", name: "Stale subject association" }),
  ]), session);
  assert.deepEqual(result.classes.map((row) => row.id), ["class-a", "class-b"]);
  assert.deepEqual(result.formClassIds, ["class-a", "class-b"]);
  assert.equal(result.classes[0].name, "Same class name");
  assert.equal(reportClassId(42), "42");
  assert.equal(reportClassId({ id: null, _id: "legacy" }), "legacy");
});

test("subject-only classes join score choices but never become full-card assignments", () => {
  const result = reportClassAssignments(assignments([classA, classB], [subjectAssignment(classC)]), session);
  assert.deepEqual(result.classes.map((row) => row.id), ["class-a", "class-b", "class-c"]);
  assert.deepEqual(result.formClassIds, ["class-a", "class-b"]);
  assert.deepEqual(assignedSubjectNames(result.subjectAssignments, "class-c", session), ["Mathematics"]);
});

test("wrong-session, missing-session and inconsistent class associations do not grant subject scope", () => {
  const result = reportClassAssignments(assignments([classA, classB, { name: "Invalid" }], [
    subjectAssignment(classA, { session: "2025/2026" }),
    subjectAssignment(classA, { session: undefined }),
    subjectAssignment(classA, { ClassArm: classC }),
    subjectAssignment(classA, { classArmId: { _id: "class-a" } }),
  ]), session);
  assert.equal(result.subjectAssignments.length, 1);
  assert.equal(result.subjectAssignments[0].classArmId, "class-a");
  assert.deepEqual(result.classes.map((row) => row.id), ["class-a", "class-b"]);
});

test("form-class subjects come only from identified active global or own-school API catalog records", () => {
  const invalid = [
    { id: "foreign", name: "Foreign Subject", isActive: true, isGlobal: false, institutionId: "other-school" },
    { id: "retired", name: "Retired Subject", isActive: false, isGlobal: true },
    { id: "unknown", name: "Unknown Active State", isGlobal: true },
    { name: "Unidentified Subject", isActive: true, isGlobal: true },
    "Free-text Subject", null,
  ];
  assert.deepEqual(reportClassAssignments(assignments([classA, classB], [], [...catalog, ...invalid]), session).formSubjects,
    ["Biology", "Mathematics", "School Studies"]);
  const missing = assignments();
  delete missing.data.subjects;
  assert.deepEqual(reportClassAssignments(missing, session).formSubjects, []);
  assert.deepEqual(reportClassAssignments(assignments([], [subjectAssignment(classC)]), session).formSubjects, []);
});

const managerUrl = new URL("../src/pages/teacher/sms/ResultAndReportCardManager.jsx", import.meta.url);
const source = readFileSync(managerUrl, "utf8");
const tree = parse(source, { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true }, range: true });
const require = createRequire(import.meta.url);
process.env.ESBUILD_WORKER_THREADS = "0";
const { transformSync } = require("esbuild");
// Strip every application import before evaluating JSX: no API/config/DB module can load.
const isolated = tree.body.filter((node) => node.type !== "ImportDeclaration").map((node) =>
  source.slice(...node.range).replace(/^export default /, "")).join("\n");
const compiled = transformSync(isolated, { loader: "jsx", jsxFactory: "jsx", jsxFragment: "Fragment", target: "es2022" }).code;
const nodes = (value) => Array.isArray(value) ? value.flatMap(nodes) : !value || typeof value !== "object"
  ? [] : [value, ...nodes(value.props?.children)];
const text = (value) => Array.isArray(value) ? value.map(text).join("") : value && typeof value === "object"
  ? text(value.props?.children) : value == null || value === false ? "" : String(value);
const sameDeps = (a, b) => a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index]));

function harness(initialAssignments = assignments()) {
  const state = { assignmentResponse: initialAssignments, scoreResponse: { success: true, data: [] } };
  const calls = { assignments: [], roster: [], report: [], scores: [], writes: [] };
  const hooks = [];
  const listeners = new Map();
  const document = { visibilityState: "visible", addEventListener: (type, fn) => listeners.set(`document:${type}`, fn),
    removeEventListener: (type) => listeners.delete(`document:${type}`) };
  const window = { addEventListener: (type, fn) => listeners.set(`window:${type}`, fn),
    removeEventListener: (type) => listeners.delete(`window:${type}`) };
  const user = { _id: "offline-teacher", role: "teacher", institution: { academicSession: session, currentTerm: "First Term" } };
  let cursor = 0;
  let dirty = true;
  let effects = [];
  let rendered;
  const context = {
    jsx: (type, props, ...children) => ({ type, props: { ...props, children } }), Fragment: "Fragment",
    useState(initial) {
      const index = cursor++;
      if (!hooks[index]) hooks[index] = { value: typeof initial === "function" ? initial() : initial };
      return [hooks[index].value, (next) => {
        const value = typeof next === "function" ? next(hooks[index].value) : next;
        if (!Object.is(value, hooks[index].value)) { hooks[index].value = value; dirty = true; }
      }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!hooks[index]) hooks[index] = { current: initial };
      return hooks[index];
    },
    useEffect(callback, deps) {
      const index = cursor++;
      if (!sameDeps(hooks[index]?.deps, deps)) {
        const cleanup = hooks[index]?.cleanup;
        hooks[index] = { deps };
        effects.push(() => { cleanup?.(); hooks[index].cleanup = callback(); });
      }
    },
    useCallback(callback, deps) {
      const index = cursor++;
      if (!sameDeps(hooks[index]?.deps, deps)) hooks[index] = { deps, callback };
      return hooks[index].callback;
    },
    useAuth: () => ({ user, loading: false }), useNavigate: () => () => {},
    reportClassAssignments, academicSessionOptions, defaultAcademicSession, assignedSubjectNames, scoreRowEditable,
    getFormattedStudentName: (student) => student.name || "Offline Student",
    toaster: { create() {} }, console: { error() {} }, document, window,
    getInstitutionProfileApi: async () => ({ success: true, data: user.institution }),
    getMyTeachingAssignmentsApi: async (params) => { calls.assignments.push(params); return state.assignmentResponse; },
    getClassArmsApi: async () => { assert.fail("Teacher must not load school-wide class options"); },
    fetchExams: async () => ({ data: [{ id: "exam-bio", title: "Offline Biology CBT", subject: "Biology" }] }),
    fetchSubjectsApi: async () => ({ success: true, data: [{ name: "Chemistry" }] }),
    getTeacherSignatureApi: async () => ({ success: false }),
    getClassReportRosterApi: async (params) => {
      calls.roster.push(params);
      if (state.rosterLoader) return state.rosterLoader(params);
      return { success: true, data: { roster: [{ id: `student-${params.classArmId}`, studentId: `student-${params.classArmId}`, name: `Student ${params.classArmId}` }] } };
    },
    getStudentReportCardApi: async (studentId, params) => {
      calls.report.push({ studentId, ...params });
      if (state.reportLoader) return state.reportLoader(studentId, params);
      return { success: true, data: { student: { studentId }, scope: params } };
    },
    getSubjectScoresApi: async (params) => {
      calls.scores.push(params);
      if (state.scoreLoader) return state.scoreLoader(params);
      if (state.scoreResponse instanceof Error) throw state.scoreResponse;
      return state.scoreResponse;
    },
    uploadSubjectScoresApi: async (payload) => { calls.writes.push(payload); return { success: true }; },
    syncCbtScoresApi: async (payload) => { calls.writes.push(payload); return { success: true }; },
    uploadTeacherSignatureApi: async () => { assert.fail("Signature writes are outside selector tests"); },
  };
  for (const node of tree.body.filter((node) => node.type === "ImportDeclaration")) {
    for (const specifier of node.specifiers) {
      const name = specifier.local.name;
      if (!(name in context)) context[name] = name;
    }
  }
  const Component = new Function(...Object.keys(context), `${compiled}\nreturn ResultAndReportCardManager;`)(...Object.values(context));
  const render = () => {
    cursor = 0; dirty = false; rendered = Component();
    const pending = effects; effects = []; pending.forEach((effect) => effect());
  };
  return {
    state, calls, document,
    async flush() {
      for (let attempt = 0; attempt < 40; attempt++) {
        if (dirty) render();
        await new Promise(setImmediate);
        if (!dirty && effects.length === 0) return;
      }
      assert.fail("Selector state did not settle");
    },
    render,
    find(predicate) { const found = nodes(rendered).find(predicate); assert.ok(found, "Expected selector element"); return found; },
    button(label) { return this.find((node) => node.type === "Button" && text(node).trim() === label); },
    selector() { return this.find((node) => node.type === "select" && node.props["aria-label"] === "Assigned class"); },
    options() { return nodes(this.selector().props.children).filter((node) => node.type === "option").map((node) => ({ id: node.props.value, label: text(node) })); },
    subjectSelector() { return this.find((node) => node.type === "select" && nodes(node.props.children).some((child) => child.type === "option" && child.props.value === "Mathematics")); },
    subjects() { return nodes(this.subjectSelector().props.children).filter((node) => node.type === "option").map((node) => node.props.value); },
    save() { return this.find((node) => node.type === "Button" && text(node).includes("Save Scores (")); },
    card() { return nodes(rendered).find((node) => node.type === "StudentReportCardSheet"); },
    event(target, type) { listeners.get(`${target}:${type}`)?.(); },
  };
}

test("actual manager opens full report tab with both form classes, no subject-score fetch", async () => {
  const h = harness();
  await h.flush();
  assert.deepEqual(h.options().map((row) => row.id), ["class-a", "class-b"]);
  assert.equal(h.selector().props.value, "class-a");
  assert.equal(h.calls.scores.length, 0);
  assert.deepEqual(h.calls.roster.at(-1), { classArmId: "class-a", session, term: "First Term" });
  assert.equal(h.card().props.reportCard.scope.classArmId, "class-a");
  h.selector().props.onChange({ target: { value: "class-b" } });
  h.render();
  assert.equal(h.card(), undefined, "Old class preview must disappear before new response");
  await h.flush();
  assert.deepEqual(h.calls.report.at(-1), { studentId: "student-class-b", classArmId: "class-b", session, term: "First Term" });
  assert.equal(h.card().props.reportCard.scope.classArmId, "class-b");
  assert.equal(typeof h.card().props.onEditScores, "function");
  assert.equal(h.calls.scores.length, 0);
  h.button("Score Sheet").props.onClick();
  await h.flush();
  assert.deepEqual(h.options().map((row) => row.id), ["class-a", "class-b"]);
  assert.equal(h.calls.scores.at(-1).classArmId, "class-b");
  assert.equal(h.calls.scores.at(-1).subject, "Biology");
  h.button("Report Card Preview").props.onClick();
  await h.flush();
  assert.deepEqual(h.options().map((row) => row.id), ["class-a", "class-b"]);
});

test("_id-only and equal-name classes render as distinct selectable options", async () => {
  const h = harness(assignments([{ _id: "class-a", name: "Same" }, { _id: "class-b", name: "Same" }], []));
  await h.flush();
  assert.deepEqual(h.options(), [{ id: "class-a", label: "Same (class-a)" }, { id: "class-b", label: "Same (class-b)" }]);
  h.selector().props.onChange({ target: { value: "class-b" } });
  await h.flush();
  assert.equal(h.card().props.reportCard.scope.classArmId, "class-b");
});

test("subject-only class can edit its exact subject but cannot preview a full card", async () => {
  const h = harness(assignments([], [subjectAssignment(classC)]));
  await h.flush();
  assert.deepEqual(h.options().map((row) => row.id), ["class-c"]);
  assert.equal(h.button("Report Card Preview").props.disabled, true);
  assert.equal(h.calls.report.length, 0);
  assert.deepEqual(h.calls.scores.at(-1), { classArmId: "class-c", subject: "Mathematics", session, term: "First Term" });
});

test("manual and focus refresh discover admin changes and preserve active report tab/selection", async () => {
  const h = harness(assignments([classA]));
  await h.flush();
  h.state.assignmentResponse = assignments();
  h.button("Refresh Assignments").props.onClick();
  await h.flush();
  assert.deepEqual(h.options().map((row) => row.id), ["class-a", "class-b"]);
  h.selector().props.onChange({ target: { value: "class-b" } });
  await h.flush();
  const before = h.calls.assignments.length;
  h.event("window", "focus");
  await h.flush();
  assert.equal(h.calls.assignments.length, before + 1);
  assert.equal(h.selector().props.value, "class-b");
  assert.equal(h.card().props.reportCard.scope.classArmId, "class-b");
  h.state.assignmentResponse = assignments([classA]);
  h.event("document", "visibilitychange");
  await h.flush();
  assert.deepEqual(h.options().map((row) => row.id), ["class-a"]);
  assert.equal(h.selector().props.value, "class-a");
  assert.equal(h.card().props.reportCard.scope.classArmId, "class-a");
  h.document.visibilityState = "hidden";
  const count = h.calls.assignments.length;
  h.event("document", "visibilitychange");
  await h.flush();
  assert.equal(h.calls.assignments.length, count);
});

test("term/session switches keep both full-card classes and refresh the exact scoped roster", async () => {
  const h = harness();
  await h.flush();
  h.selector().props.onChange({ target: { value: "class-b" } });
  await h.flush();
  h.find((node) => node.type === "input" && node.props.placeholder === "Search student or code...").props.onChange({ target: { value: "old search" } });
  await h.flush();
  h.selector().props.onChange({ target: { value: "class-a" } });
  await h.flush();
  assert.equal(h.find((node) => node.type === "input" && node.props.placeholder === "Search student or code...").props.value, "");
  h.find((node) => node.type === "select" && node.props.value === "First Term").props.onChange({ target: { value: "Second Term" } });
  await h.flush();
  assert.deepEqual(h.calls.report.at(-1), { studentId: "student-class-a", classArmId: "class-a", session, term: "Second Term" });
  h.find((node) => node.type === "select" && node.props.value === session).props.onChange({ target: { value: "2025/2026" } });
  await h.flush();
  assert.deepEqual(h.options().map((row) => row.id), ["class-a", "class-b"]);
  assert.deepEqual(h.calls.roster.at(-1), { classArmId: "class-a", session: "2025/2026", term: "Second Term" });
  assert.equal(typeof h.card().props.onEditScores, "function", "Current form-class authority can edit active subjects for the selected session");
});

test("both form classes can upload any active catalog subject without matching subject-teacher assignments", async () => {
  const h = harness();
  await h.flush();
  h.button("Score Sheet").props.onClick();
  await h.flush();
  for (const classId of ["class-a", "class-b"]) {
    h.selector().props.onChange({ target: { value: classId } });
    await h.flush();
    assert.deepEqual(h.subjects(), ["Biology", "Mathematics", "School Studies"]);
    for (const subject of ["Biology", "School Studies", "Mathematics"]) {
      h.subjectSelector().props.onChange({ target: { value: subject } });
      await h.flush();
      assert.deepEqual(h.calls.scores.at(-1), { classArmId: classId, subject, session, term: "First Term" });
      h.find((node) => node.type === "Input" && node.props.max === 70).props.onChange({ target: { value: "65" } });
      await h.flush();
      assert.equal(h.save().props.disabled, false);
      await h.save().props.onClick();
      await h.flush();
      assert.deepEqual(h.calls.writes.at(-1), { classArmId: classId, subject, session, term: "First Term",
        scores: [{ studentId: `student-${classId}`, caScore1: 0, caScore2: 0, assignmentScore: 0, examScore: 65 }] });
    }
  }
  assert.equal(h.calls.writes.length, 6);
});

test("CBT selectors and synchronization support all catalog subjects in either form class", async () => {
  const h = harness();
  await h.flush();
  for (const classId of ["class-a", "class-b"]) {
    h.selector().props.onChange({ target: { value: classId } });
    await h.flush();
    h.button("Sync from CBT").props.onClick();
    await h.flush();
    assert.deepEqual(h.options().map((row) => row.id), ["class-a", "class-b"]);
    assert.deepEqual(h.subjects(), ["Biology", "Mathematics", "School Studies"]);
    h.subjectSelector().props.onChange({ target: { value: "Biology" } });
    await h.flush();
    assert.equal(h.button("Pull & Synchronize CBT Scores").props.disabled, false);
    await h.button("Pull & Synchronize CBT Scores").props.onClick();
    await h.flush();
    assert.deepEqual(h.calls.writes.at(-1), { classArmId: classId, subject: "Biology", session, term: "First Term",
      examId: "exam-bio", targetColumn: "examScore", scaleMode: "smart" });
  }
});

test("mixed-role teacher gets all subjects only in form classes and exact subject/session in other classes", async () => {
  const h = harness(assignments([classA, classB], [subjectAssignment(classA), subjectAssignment(classC)]));
  await h.flush();
  assert.deepEqual(h.options().map((row) => row.id), ["class-a", "class-b"]);
  h.button("Score Sheet").props.onClick();
  await h.flush();
  assert.deepEqual(h.options().map((row) => row.id), ["class-a", "class-b", "class-c"]);
  h.selector().props.onChange({ target: { value: "class-c" } });
  await h.flush();
  assert.deepEqual(h.subjects(), ["Mathematics"]);
  const reads = h.calls.scores.length;
  h.subjectSelector().props.onChange({ target: { value: "Biology" } });
  await h.flush();
  assert.equal(h.calls.scores.length, reads);
  assert.equal(h.save().props.disabled, true);
  await h.save().props.onClick();
  assert.equal(h.calls.writes.length, 0);
  h.button("Report Card Preview").props.onClick();
  await h.flush();
  assert.deepEqual(h.options().map((row) => row.id), ["class-a", "class-b"]);
  assert.equal(h.calls.report.some((call) => call.classArmId === "class-c"), false);
  h.find((node) => node.type === "select" && node.props.value === session).props.onChange({ target: { value: "2025/2026" } });
  await h.flush();
  h.button("Score Sheet").props.onClick();
  await h.flush();
  assert.deepEqual(h.options().map((row) => row.id), ["class-a", "class-b"]);
});

test("missing or empty form catalog never grants fallback, exam or generic catalog subject permissions", async () => {
  for (const missing of [false, true]) {
    const response = assignments([classA, classB], [subjectAssignment(classA)], []);
    if (missing) delete response.data.subjects;
    const h = harness(response);
    await h.flush();
    assert.equal(h.card().props.onEditScores, undefined);
    h.button("Score Sheet").props.onClick();
    await h.flush();
    assert.deepEqual(h.options().map((row) => row.id), ["class-a", "class-b"]);
    assert.equal(h.calls.scores.length, 0);
    assert.equal(h.save().props.disabled, true);
    await h.save().props.onClick();
    assert.equal(h.calls.writes.length, 0);
  }
  const h = harness();
  await h.flush();
  h.button("Score Sheet").props.onClick();
  await h.flush();
  assert.equal(h.subjects().includes("Chemistry"), false);
  h.subjectSelector().props.onChange({ target: { value: "Chemistry" } });
  await h.flush();
  assert.equal(h.save().props.disabled, true);
  await h.save().props.onClick();
  assert.equal(h.calls.writes.length, 0);
});

test("new catalog subject load must succeed before editing and late subject responses remain scoped", async () => {
  const h = harness();
  await h.flush();
  h.button("Score Sheet").props.onClick();
  await h.flush();
  h.subjectSelector().props.onChange({ target: { value: "Mathematics" } });
  await h.flush();
  let release;
  h.state.scoreLoader = (params) => params.subject === "Biology" ? new Promise((resolve) => { release = resolve; })
    : Promise.resolve({ success: true, data: [{ studentId: "student-class-a", examScore: 70 }] });
  h.subjectSelector().props.onChange({ target: { value: "Biology" } });
  await h.flush();
  assert.equal(h.save().props.disabled, true);
  await h.save().props.onClick();
  assert.equal(h.calls.writes.length, 0);
  h.subjectSelector().props.onChange({ target: { value: "Mathematics" } });
  await h.flush();
  release({ success: true, data: [{ studentId: "student-class-a", examScore: 5 }] });
  await h.flush();
  assert.equal(h.find((node) => node.type === "Input" && node.props.max === 70).props.value, 70);
  assert.equal(h.save().props.disabled, false);
});

test("focus refresh does not discard a loaded subject score sheet", async () => {
  const h = harness();
  await h.flush();
  h.button("Score Sheet").props.onClick();
  await h.flush();
  const before = h.calls.assignments.length;
  h.event("window", "focus");
  await h.flush();
  assert.equal(h.calls.assignments.length, before);
});

test("failed assignment refresh hides stale full cards and leaves a retry available", async () => {
  const h = harness();
  await h.flush();
  h.state.assignmentResponse = { success: false, message: "Offline assignment failure" };
  h.button("Refresh Assignments").props.onClick();
  await h.flush();
  assert.equal(h.card(), undefined);
  assert.equal(h.button("Report Card Preview").props.disabled, true);
  assert.equal(h.button("Refresh Assignments").props.disabled, false);
  h.state.assignmentResponse = assignments();
  h.button("Refresh Assignments").props.onClick();
  await h.flush();
  assert.deepEqual(h.options().map((row) => row.id), ["class-a", "class-b"]);
});

test("late prior-class roster/report responses cannot replace a switched class", async () => {
  const h = harness();
  await h.flush();
  let release;
  h.state.reportLoader = (studentId, params) => params.classArmId === "class-b"
    ? new Promise((resolve) => { release = resolve; })
    : Promise.resolve({ success: true, data: { student: { studentId }, scope: params } });
  h.selector().props.onChange({ target: { value: "class-b" } });
  await h.flush();
  assert.ok(release);
  h.selector().props.onChange({ target: { value: "class-a" } });
  await h.flush();
  release({ success: true, data: { scope: { classArmId: "class-b" } } });
  await h.flush();
  assert.equal(h.card().props.reportCard.scope.classArmId, "class-a");
  h.state.rosterLoader = (params) => params.classArmId === "class-b"
    ? new Promise((resolve) => { release = resolve; })
    : Promise.resolve({ success: true, data: { roster: [{ studentId: "student-class-a", name: "Student A" }] } });
  h.selector().props.onChange({ target: { value: "class-b" } });
  await h.flush();
  h.selector().props.onChange({ target: { value: "class-a" } });
  await h.flush();
  release({ success: true, data: { roster: [{ studentId: "stale-b", name: "Stale B" }] } });
  await h.flush();
  assert.equal(h.card().props.reportCard.scope.classArmId, "class-a");
  assert.equal(h.calls.report.some((call) => call.studentId === "stale-b"), false);
});

test("failed score-load safety gate survives selector changes, successful empty response remains allowed", async () => {
  const h = harness();
  await h.flush();
  h.state.scoreResponse = new Error("Offline score read failed");
  h.button("Score Sheet").props.onClick();
  await h.flush();
  const save = () => h.find((node) => node.type === "Button" && text(node).includes("Save Scores ("));
  assert.equal(save().props.disabled, true);
  await save().props.onClick();
  assert.equal(h.calls.writes.length, 0);
  h.state.scoreResponse = { success: true, data: [] };
  h.button("Refresh").props.onClick();
  await h.flush();
  assert.equal(save().props.disabled, false);
});

test("selector helper and manager pass focused lint including hook dependencies", () => {
  const linter = new Linter();
  for (const url of [managerUrl, new URL("../src/pages/teacher/sms/reportClassSelector.js", import.meta.url)]) {
    const messages = linter.verify(readFileSync(url, "utf8"), [{ files: ["**/*.{js,jsx}"], languageOptions: {
      ecmaVersion: "latest", sourceType: "module", globals: globals.browser, parserOptions: { ecmaFeatures: { jsx: true } },
    }, plugins: { "react-hooks": reactHooks }, rules: { "no-undef": "error", "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      "react-hooks/rules-of-hooks": "error", "react-hooks/exhaustive-deps": "warn" } }], { filename: fileURLToPath(url) });
    assert.deepEqual(messages, [], url.pathname);
  }
});
