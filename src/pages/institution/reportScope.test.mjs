import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "espree";
import { Linter } from "eslint";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import { academicSessionOptions, defaultAcademicSession, displayScore, annualRowComplete, promotionLabel, assignedSubjectNames, savedPromotionEligible, scoreRowEditable } from "./reportScope.js";

test("session options retain institution defaults outside the old hardcoded years", () => {
  const options = academicSessionOptions("2032/2033", "2020/2021");
  assert.ok(options.includes("2032/2033"));
  assert.ok(options.includes("2020/2021"));
  assert.ok(options.includes("2034/2035"));
  assert.match(defaultAcademicSession(), /^\d{4}\/\d{4}$/);
});

test("zero is a recorded score while null and undefined remain missing", () => {
  assert.equal(displayScore(0), "0");
  assert.equal(displayScore(0, "%"), "0%");
  assert.equal(displayScore(null, "%"), "-");
  assert.equal(displayScore(undefined), "-");
});

test("only authoritative complete annual rows display promotion decisions", () => {
  const incomplete = { annualComplete: false, promotionStatus: "promoted" };
  const complete = { annualComplete: true, promotionStatus: "promoted_on_trial" };
  assert.equal(annualRowComplete(incomplete), false);
  assert.equal(annualRowComplete({ term1Average: 90, term2Average: 90, term3Average: 90 }), false);
  assert.equal(promotionLabel(incomplete, true), "INCOMPLETE");
  assert.equal(promotionLabel(complete, true), "PROMOTED ON TRIAL");
  assert.equal(promotionLabel(complete, false), "-");
  assert.equal(promotionLabel({ annualComplete: true }, true), "-");
});

test("subject permission is class/session specific and never falls back to catalog", () => {
  const assignments = [
    { classArmId: "class-a", session: "2032/2033", Subject: { name: "Livestock Farming" } },
    { classArmId: "class-a", session: "2031/2032", Subject: { name: "Citizenship Education" } },
    { classArmId: "class-b", session: "2032/2033", Subject: { name: "Mathematics" } },
    { classArmId: "class-a", Subject: { name: "English Language" } },
  ];
  assert.deepEqual(assignedSubjectNames(assignments, "class-a", "2032/2033"), ["Livestock Farming", "English Language"]);
  assert.deepEqual(assignedSubjectNames(assignments, "class-c", "2032/2033"), []);
});

test("rollover requires persisted complete eligible decisions, not recommendations", () => {
  const eligible = { annualComplete: true, hasSavedPromotion: true, promotionStatus: "promoted", isRolledOver: false };
  assert.equal(savedPromotionEligible(eligible), true);
  assert.equal(savedPromotionEligible({ ...eligible, promotionStatus: "promoted_on_trial" }), true);
  assert.equal(savedPromotionEligible({ ...eligible, hasSavedPromotion: false }), false);
  assert.equal(savedPromotionEligible({ ...eligible, hasSavedPromotion: undefined }), false);
  assert.equal(savedPromotionEligible({ ...eligible, annualComplete: false }), false);
  assert.equal(savedPromotionEligible({ ...eligible, isRolledOver: true }), false);
  assert.equal(savedPromotionEligible({ ...eligible, promotionStatus: "repeat" }), false);
});

test("archived score rows remain in the roster but not in editable upload rows", () => {
  const roster = [
    { studentId: "current", canEditScores: true, examScore: 0 },
    { studentId: "archived", canEditScores: false, examScore: 68 },
  ];
  assert.equal(scoreRowEditable(roster[0]), true);
  assert.equal(scoreRowEditable(roster[1]), false);
  assert.deepEqual(roster.filter(scoreRowEditable).map((student) => student.studentId), ["current"]);
  assert.equal(roster.length, 2);
  assert.equal(roster[1].examScore, 68);
  assert.equal([roster[1]].filter(scoreRowEditable).length, 0);
});

test("score source guards archived input and upload without hiding historical rows", async () => {
  const source = await readFile(new URL("../teacher/sms/ResultAndReportCardManager.jsx", import.meta.url), "utf8");
  assert.match(source, /const editableRoster = roster\.filter\(scoreRowEditable\)/);
  assert.match(source, /if \(!editableRoster\.some\(\(student\) => student\.studentId === studentId\)\) return/);
  assert.match(source, /const formattedScores = editableRoster\.map\(/);
  assert.match(source, /disabled=\{[^}]*editableRoster\.length === 0\}/);
  assert.equal((source.match(/disabled=\{[^}]*!scoreRowEditable\(student\)\}/g) || []).length, 4);
  assert.match(source, /\(rosterReady && canEditSubject \? roster : \[\]\)\.map\(/);
  assert.match(source, /ARCHIVED \/ READ ONLY/);
  assert.match(source, /getStudentReportCardApi\(idToFetch, \{\s*classArmId: selectedClassId/);
});

test("rollover source shares saved eligibility for payload, counts and buttons", async () => {
  const source = await readFile(new URL("./MasterBroadsheet.jsx", import.meta.url), "utf8");
  assert.match(source, /const rolloverRows = annual && dataReady && !hasUnsavedChanges \? rows\.filter\(savedPromotionEligible\) : \[\]/);
  assert.match(source, /const eligibleStudentIds = rolloverRows\.map\(\(r\) => r\.student\.id\)/);
  assert.match(source, /\{rolloverRows\.length\} Students/);
  assert.equal((source.match(/disabled=\{[^}]*rolloverRows\.length === 0\}/g) || []).length, 2);
  assert.match(source, /Save Decisions to confirm promotion recommendations before batch rollover/);
  assert.match(source, /const decisions = rows\.filter\(\(r\) => annualRowComplete\(r\) && !r\.isRolledOver && r\.promotionStatus\)/);
  assert.match(source, /await fetchBroadsheet\(\)/);
});

test("failed score reads preserve previous values and never mark the sheet writable", async () => {
  const source = await readFile(new URL("../teacher/sms/ResultAndReportCardManager.jsx", import.meta.url), "utf8");
  const tree = parse(source, { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true }, range: true });
  const component = tree.body.find((node) => node.type === "ExportDefaultDeclaration").declaration;
  const declaration = component.body.body.find((node) => node.type === "VariableDeclaration" && node.declarations[0].id.name === "loadExistingScores");
  const callback = declaration.declarations[0].init.arguments[0];
  const roster = [{ studentId: "current", canEditScores: true }, { studentId: "archived", canEditScores: false }];
  for (const response of ["reject", { success: false, message: "Unavailable" }, { success: true, data: [] }]) {
    const previousScores = { archived: { exam: 68 } };
    const previousRecords = { archived: { examScore: 68 } };
    const state = { scores: previousScores, records: previousRecords, scope: null, error: "", loading: false };
    const context = {
      scoreRequestId: { current: 0 }, rosterReady: true, activeTab: "scores", canEditSubject: true,
      subject: "Mathematics", selectedClassId: "class-a", selectedTerm: "First Term", selectedSession: "2032/2033",
      rosterKey: "class-a:2032/2033:First Term:Mathematics", roster,
      getSubjectScoresApi: async () => { if (response === "reject") throw new Error("Unavailable"); return response; },
      setExistingScores: (value) => { state.records = value; },
      setScores: (value) => { state.scores = value; },
      setLoadingExisting: (value) => { state.loading = value; },
      setScoreLoadScope: (value) => { state.scope = value; },
      setScoreLoadError: (value) => { state.error = value; },
    };
    const load = new Function(...Object.keys(context), `return ${source.slice(...callback.range)};`)(...Object.values(context));
    await load();
    assert.equal(state.loading, false);
    if (response?.success) {
      assert.deepEqual(state.scores, {});
      assert.deepEqual(state.scope, { key: context.rosterKey, roster });
      assert.equal(state.error, "");
    } else {
      assert.equal(state.scores, previousScores);
      assert.equal(state.records, previousRecords);
      assert.equal(state.scope, null);
      assert.ok(state.error);
    }
  }
  assert.match(source, /scoreLoadScope\?\.key === rosterKey && scoreLoadScope\?\.roster === roster/);
  assert.match(source, /if \(!canEditSubject \|\| !scoreDataReady \|\| editableRoster\.length === 0/);
});

test("owned JSX pages parse offline without initializing app or API modules", async () => {
  for (const page of ["./MasterBroadsheet.jsx", "../teacher/sms/ResultAndReportCardManager.jsx"]) {
    const source = await readFile(new URL(page, import.meta.url), "utf8");
    assert.doesNotThrow(() => parse(source, {
      ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true },
    }), page);
  }
});

test("targeted report source lint has no errors or hook dependency warnings", async () => {
  const linter = new Linter();
  for (const page of ["./MasterBroadsheet.jsx", "../teacher/sms/ResultAndReportCardManager.jsx", "./reportScope.js"]) {
    const source = await readFile(new URL(page, import.meta.url), "utf8");
    const messages = linter.verify(source, [{
      files: ["**/*.{js,jsx}"],
      languageOptions: { ecmaVersion: "latest", sourceType: "module", globals: globals.browser, parserOptions: { ecmaFeatures: { jsx: true } } },
      plugins: { "react-hooks": reactHooks },
      rules: {
        "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
        "no-undef": "error",
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    }], { filename: page.split("/").pop() });
    assert.deepEqual(messages, [], `${page}: ${messages.map((message) => `${message.line}:${message.column} ${message.message}`).join("; ")}`);
  }
});
