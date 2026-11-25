import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire, registerHooks } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
// Avoid esbuild worker-thread startup hangs in the offline Windows test runner.
process.env.ESBUILD_WORKER_THREADS = "0";
const { transformSync } = require("esbuild");
const sheetUrl = new URL("../src/components/student/StudentReportCardSheet.jsx", import.meta.url).href;
const sheetSource = transformSync(readFileSync(fileURLToPath(sheetUrl), "utf8"),
  { loader: "jsx", jsx: "automatic", format: "esm" }).code;
const virtual = (name) => new URL(`report-sheet-mock-${name}`, import.meta.url).href;
const chakra = ["Box", "Flex", "Text", "Button", "Icon", "Badge", "SimpleGrid"];
const icons = ["FaPrint", "FaGraduationCap", "FaCheckCircle", "FaClock", "FaExclamationTriangle",
  "FaCalendarAlt", "FaUserCheck", "FaPencilAlt", "FaSyncAlt", "FaShieldAlt"];
const sources = new Map([
  [virtual("chakra"), chakra.map((name) => `export const ${name} = '${name}';`).join("\n")],
  [virtual("icons"), icons.map((name) => `export const ${name} = '${name}';`).join("\n")],
  [virtual("helper"), "export const formatStudentName = (name) => name;"],
  [virtual("jsx"), "export const jsx = (type, props) => typeof type === 'function' ? type(props) : ({ type, props }); export const jsxs = jsx; export const Fragment = 'Fragment';"],
]);
const modules = new Map([["@chakra-ui/react", "chakra"], ["react-icons/fa", "icons"],
  ["react/jsx-runtime", "jsx"], ["../../libs/helper", "helper"]]);
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL === sheetUrl) {
      if (modules.has(specifier)) return { url: virtual(modules.get(specifier)), shortCircuit: true };
      if (specifier === "../../libs/reportCardDisplay") {
        return { url: new URL("../src/libs/reportCardDisplay.js", import.meta.url).href, shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (sources.has(url)) return { format: "module", source: sources.get(url), shortCircuit: true };
    if (url === sheetUrl) return { format: "module", shortCircuit: true, source: sheetSource };
    if (/\/(?:config|models|dotenv)\/|\/libs\/axios\.js$/.test(url)) {
      throw new Error("Live transports/configuration must not load in report sheet tests");
    }
    return nextLoad(url, context);
  },
});
let StudentReportCardSheet;
try {
  ({ default: StudentReportCardSheet } = await import(sheetUrl));
} finally {
  hooks.deregister();
}

const nodes = (tree) => Array.isArray(tree) ? tree.flatMap(nodes) : !tree || typeof tree !== "object"
  ? [] : [tree, ...nodes(tree.props?.children)];
const text = (tree) => Array.isArray(tree) ? tree.map(text).join("") : tree && typeof tree === "object"
  ? text(tree.props?.children) : tree == null || tree === false ? "" : String(tree);
const find = (tree, predicate) => { const node = nodes(tree).find(predicate); assert.ok(node, "Expected rendered element"); return node; };
const tileValue = (tree, label) => text(find(tree, (node) => node.type === "Box" &&
  Array.isArray(node.props.children) && text(node.props.children[0]) === label).props.children[1]);
const marks = { caScore1: 0, caScore2: 0, assignmentScore: 0, examScore: 0, totalScore: 0 };
const makeCard = (results) => Object.freeze({
  student: Object.freeze({ name: "Offline Student", studentCode: "OFFLINE-1" }),
  institution: Object.freeze({ name: "Offline School" }), term: "First Term", session: "2026/2027",
  results: Object.freeze(results.map(Object.freeze)),
  summary: Object.freeze({ totalSubjects: 99, totalScore: 999, averageScore: 9,
    teacherComment: "Stored teacher comment", principalRemark: "Stored principal comment",
    attendance: Object.freeze({ timesSchoolOpened: 10, timesPresent: 8, timesAbsent: 2, attendancePercentage: 80 }),
    nextTermResumption: "Stored resumption" }),
  signature: Object.freeze({ signatureUrl: "offline:principal-signature", teacherSignatureUrl: "offline:teacher-signature",
    stampUrl: "offline:stamp", teacherName: "Stored Teacher", principalName: "Stored Principal" }),
  approval: Object.freeze({ status: "approved", approvedAt: "2026-11-24", publishedAt: "2026-11-25" }),
});

for (const showDetailedCa of [true, false]) {
  test(`${showDetailedCa ? "detailed teacher preview" : "student sheet"}: visible rows and print summary use the same filtered data`, () => {
    const card = makeCard([{ subject: "Biology", ...marks }, { subject: "Commerce", totalScore: "75" },
      { subject: "English", ...marks, examScore: 55, totalScore: 55 }]);
    let prints = 0;
    const tree = StudentReportCardSheet({ reportCard: card, showDetailedCa, onPrint: () => { prints++; } });
    const table = find(tree, (node) => node.type === "table");
    assert.doesNotMatch(text(table), /Biology/);
    assert.match(text(table), /Commerce/);
    assert.match(text(table), /English/);
    assert.match(text(table), /SUBJECT \(2\)/);
    assert.match(text(table), /OUT OF 200/);
    assert.match(text(table), /AVERAGE: 65%/);
    assert.equal(tileValue(tree, "Total Subjects"), "2");
    assert.equal(tileValue(tree, "Cumulative Marks"), "130");
    assert.equal(tileValue(tree, "Terminal Average"), "65%");
    assert.equal(tree.props.id, "student-report-sheet");
    assert.match(text(find(tree, (node) => node.type === "style")), /@media print/);
    find(tree, (node) => node.type === "Button" && text(node).includes("Print Official Report Card")).props.onClick();
    assert.equal(prints, 1);
    assert.match(text(tree), /Stored teacher comment/);
    assert.match(text(tree), /Stored principal comment/);
    assert.match(text(tree), /Stored resumption/);
    assert.match(text(tree), /Opened: 10/);
    for (const src of ["offline:principal-signature", "offline:teacher-signature", "offline:stamp"]) {
      assert.ok(nodes(tree).some((node) => node.type === "img" && node.props.src === src));
    }
    assert.match(text(tree), /APPROVED/);
    assert.equal(card.results.length, 3);
    assert.equal(card.summary.totalSubjects, 99);
    assert.equal(card.approval.approvedAt, "2026-11-24");
  });
}

test("all-zero rows produce an honest empty display and zero visible summary without deleting input", () => {
  const card = makeCard([{ subject: "Biology", ...marks, totalScore: "0.00" }]);
  const tree = StudentReportCardSheet({ reportCard: card });
  const table = find(tree, (node) => node.type === "table");
  assert.doesNotMatch(text(table), /Biology/);
  assert.match(text(table), /No Subject Marks To Display/);
  assert.match(text(table), /Subjects with only zero or empty marks are omitted/);
  assert.equal(tileValue(tree, "Total Subjects"), "0");
  assert.equal(tileValue(tree, "Cumulative Marks"), "0");
  assert.equal(tileValue(tree, "Terminal Average"), "0%");
  assert.equal(nodes(tree).some((node) => node.type === "tfoot"), false);
  assert.equal(card.results.length, 1);
});

test("malformed total stays visibly malformed and aggregate marks are unavailable rather than zero", () => {
  const card = makeCard([{ subject: "Biology", ...marks, totalScore: "invalid" }]);
  const tree = StudentReportCardSheet({ reportCard: card });
  const table = find(tree, (node) => node.type === "table");
  assert.match(text(table), /Biology/);
  assert.match(text(table), /invalid/);
  assert.match(text(table), /AVERAGE: -/);
  assert.equal(tileValue(tree, "Total Subjects"), "1");
  assert.equal(tileValue(tree, "Cumulative Marks"), "-");
  assert.equal(tileValue(tree, "Terminal Average"), "-");
  assert.equal(tileValue(tree, "Academic Standing"), "Unavailable");
});

test("a component mark keeps the subject even when its stored total is zero", () => {
  const card = makeCard([{ subject: "Biology", ...marks, assignmentScore: "5" }]);
  const tree = StudentReportCardSheet({ reportCard: card });
  assert.match(text(find(tree, (node) => node.type === "table")), /Biology/);
  assert.equal(tileValue(tree, "Total Subjects"), "1");
  assert.equal(tileValue(tree, "Cumulative Marks"), "0");
  assert.equal(card.results[0].totalScore, 0);
});

test("missing report card renders nothing", () => {
  assert.equal(StudentReportCardSheet({ reportCard: null }), null);
});

test("report sheet and pure helper pass focused undefined/unused checks without running a build", () => {
  const { Linter } = require("eslint");
  const globals = require("globals");
  const linter = new Linter();
  for (const path of [sheetUrl, new URL("../src/libs/reportCardDisplay.js", import.meta.url).href]) {
    const source = readFileSync(fileURLToPath(path), "utf8");
    const messages = linter.verify(source, [{ files: ["**/*.{js,jsx}"], languageOptions: {
      ecmaVersion: "latest", sourceType: "module", globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    }, rules: { "no-undef": "error", "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }] } }],
    { filename: fileURLToPath(path) });
    assert.deepEqual(messages, [], path);
  }
});
