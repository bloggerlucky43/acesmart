import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { parse } from "espree";
import { Linter } from "eslint";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import * as cache from "../src/libs/studentEditorCache.js";

const { transformSync } = createRequire(import.meta.url)("esbuild");
const pages = [
  ["desktop", "../src/components/teacher/studentEditor.jsx", "StudentEditor"],
  ["mobile", "../src/mobile/pages/teacher/schoolmanagment/StudentEditor.jsx", "MStudentEditor"],
];
const classRows = [
  { id: "a", name: "Class A", institutionId: "school", formTeacherId: "owner" },
  { id: "b", name: "Class B", institutionId: "school", formTeacherId: "owner" },
  { id: "subject", name: "Subject only", institutionId: "school", formTeacherId: "other" },
  { id: "foreign", name: "Foreign", institutionId: "foreign", formTeacherId: "owner" },
  { id: "unassigned", name: "Unassigned", institutionId: "school", formTeacherId: null },
];
const nodes = (value) => Array.isArray(value) ? value.flatMap(nodes) : !value || typeof value !== "object"
  ? [] : [value, ...nodes(value.props?.children)];
const text = (value) => Array.isArray(value) ? value.map(text).join("") : value && typeof value === "object"
  ? text(value.props?.children) : value == null || value === false ? "" : String(value);

function harness(source, name, user = { _id: "owner", role: "teacher", institutionId: "school" }) {
  const tree = parse(source, { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true }, range: true });
  // Application imports are stripped; only injected fixture APIs may be called.
  const isolated = tree.body.filter((node) => !["ImportDeclaration", "ExportDefaultDeclaration"].includes(node.type))
    .map((node) => source.slice(...node.range).replace(/^export /, "")).join("\n");
  const compiled = transformSync(isolated, { loader: "jsx", jsxFactory: "jsx", target: "es2022" }).code;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const state = { user, loading: false, classRows, classError: false, loader: null };
  const calls = { students: [], classes: 0 };
  const hooks = [];
  let cursor = 0;
  let rendered;
  let dirty = true;
  let effects = [];
  const context = {
    ...cache,
    jsx: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useAuth: () => ({ user: state.user, loading: state.loading }),
    useState(initial) {
      const index = cursor++;
      if (!hooks[index]) hooks[index] = { value: initial };
      return [hooks[index].value, (next) => { hooks[index].value = typeof next === "function" ? next(hooks[index].value) : next; dirty = true; }];
    },
    useEffect(callback, deps) {
      const index = cursor++;
      if (!hooks[index]?.deps || deps.some((value, i) => !Object.is(value, hooks[index].deps[i]))) {
        hooks[index] = { deps };
        effects.push(callback);
      }
    },
    useQuery(options) {
      const index = cursor++;
      if (!hooks[index]) {
        const observer = new QueryObserver(client, options);
        hooks[index] = { observer, unsubscribe: observer.subscribe(() => { dirty = true; }) };
      } else hooks[index].observer.setOptions(options);
      return hooks[index].observer.getOptimisticResult(options);
    },
    useQueryClient: () => client,
    useMutation: (options) => ({
      mutate(id) { void Promise.resolve(options.onMutate?.()).then((scope) => options.onSuccess?.({ success: true }, id, scope)); },
      isPending: false, isLoading: false,
    }),
    getClassArmsApi: async () => {
      calls.classes++;
      if (state.classError) throw new Error("fixture class error");
      return { success: true, data: state.classRows };
    },
    fetchStudent: async (params) => {
      calls.students.push(params);
      if (state.loader) return state.loader(params);
      return { success: true, count: 30, totalPages: 2, students: [{ id: params.classArmId || "standalone", firstName: `Student ${params.classArmId || "standalone"}`, lastName: "Fixture", studentId: "FIX/1", active: true }] };
    },
    formatStudentFullName: (first, last) => `${first} ${last}`,
    formatStudentName: (first) => first,
    toaster: { create() {} }, DOMException,
  };
  for (const node of tree.body.filter((node) => node.type === "ImportDeclaration")) {
    for (const specifier of node.specifiers) if (!(specifier.local.name in context)) context[specifier.local.name] = specifier.local.name;
  }
  context.Table = { ScrollArea: "ScrollArea", Root: "Root", Header: "Header", Row: "Row", ColumnHeader: "ColumnHeader", Body: "Body", Cell: "Cell" };
  const Component = new Function(...Object.keys(context), `${compiled}\nreturn ${name};`)(...Object.values(context));
  const render = () => { cursor = 0; dirty = false; rendered = Component(); const pending = effects; effects = []; pending.forEach((effect) => effect()); };
  return {
    state, calls, client,
    render,
    async flush() {
      for (let attempt = 0; attempt < 12; attempt++) {
        if (dirty) render();
        await new Promise((resolve) => setTimeout(resolve, 1));
      }
      if (dirty) render();
    },
    select(value) { this.find((node) => node.props?.["aria-label"] === "Select class").props.onChange({ target: { value } }); },
    search(value) { this.find((node) => node.type === "Input").props.onChange({ target: { value } }); },
    find(predicate) { return nodes(rendered).find(predicate); },
    text() { return text(rendered); },
    options() { return nodes(rendered).filter((node) => node.type === "option").map((node) => node.props.value); },
    close() { hooks.forEach((hook) => hook.unsubscribe?.()); client.clear(); },
  };
}

for (const [label, path, name] of pages) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  test(`${label}: JSX parses and has no undefined names or hook-rule violations`, () => {
    const messages = new Linter().verify(source, [{ languageOptions: {
      ecmaVersion: "latest", sourceType: "module", parserOptions: { ecmaFeatures: { jsx: true } }, globals: globals.browser,
    }, plugins: { "react-hooks": reactHooks }, rules: { "no-undef": "error", "react-hooks/rules-of-hooks": "error" } }]);
    assert.deepEqual(messages.filter((message) => message.severity === 2), []);
  });

  test(`${label}: no initial student fetch; only owned form classes are selectable`, async (t) => {
    const h = harness(source, name); t.after(() => h.close());
    await h.flush();
    assert.equal(h.calls.students.length, 0);
    assert.deepEqual(h.options(), ["", "a", "b"]);
    assert.match(h.text(), /Select a class to load students/);
    h.select("a"); await h.flush();
    assert.deepEqual(h.calls.students[0], { classArmId: "a", editingOnly: true, search: "", page: 1, limit: 25 });
    assert.match(h.text(), /Student a/);
    assert.match(h.text(), /30 Records/);
    assert.ok(h.find((node) => node.type === "EditStudentModal"), "shared edit/photo modal preserved");
  });

  test(`${label}: class/search/page changes clear the roster and refetch scoped data`, async (t) => {
    const h = harness(source, name); t.after(() => h.close());
    await h.flush(); h.select("a"); await h.flush();
    h.find((node) => node.type === "Button" && text(node) === "Next").props.onClick();
    await h.flush();
    assert.equal(h.calls.students.at(-1).page, 2);
    h.search("alice"); h.render();
    assert.doesNotMatch(h.text(), /Student a/);
    await h.flush();
    assert.equal(h.calls.students.at(-1).search, "alice");
    assert.equal(h.calls.students.at(-1).page, 1);
    h.select("b"); h.render();
    assert.doesNotMatch(h.text(), /Student a/);
    await h.flush();
    assert.deepEqual(h.calls.students.at(-1), { classArmId: "b", editingOnly: true, search: "", page: 1, limit: 25 });
    assert.match(h.text(), /Student b/);
    h.select(""); await h.flush();
    assert.doesNotMatch(h.text(), /Student b/);
    assert.equal(h.calls.students.length, 4);
  });

  test(`${label}: a late old-class response cannot replace the selected class`, async (t) => {
    const h = harness(source, name); t.after(() => h.close());
    let resolveOld;
    h.state.loader = (params) => params.classArmId === "a" ? new Promise((resolve) => { resolveOld = resolve; })
      : Promise.resolve({ success: true, count: 1, totalPages: 1, students: [{ id: "b", firstName: "Current B", active: true }] });
    await h.flush(); h.select("a"); await h.flush();
    h.select("b"); await h.flush();
    assert.match(h.text(), /Current B/);
    resolveOld({ success: true, count: 500, students: [{ id: "a", firstName: "Stale A" }] });
    await h.flush();
    assert.match(h.text(), /Current B/);
    assert.doesNotMatch(h.text(), /Stale A|500 Records/);
  });

  test(`${label}: own-school admins see school classes, never foreign classes`, async (t) => {
    const h = harness(source, name, { id: "admin", role: "institution_admin", institutionId: "school" }); t.after(() => h.close());
    await h.flush();
    assert.deepEqual(h.options(), ["", "a", "b", "subject", "unassigned"]);
    assert.equal(h.calls.students.length, 0);
    h.select("subject"); await h.flush();
    assert.equal(h.calls.students[0].classArmId, "subject");
  });

  test(`${label}: subject-only, empty-class and failed-class responses never trigger all-student fallback`, async (t) => {
    const h = harness(source, name); t.after(() => h.close());
    h.state.classRows = classRows.filter((row) => row.formTeacherId !== "owner");
    await h.flush();
    assert.deepEqual(h.options(), [""]);
    assert.equal(h.calls.students.length, 0);
    assert.match(h.text(), /No authorized classes/);
    const failed = harness(source, name); t.after(() => failed.close());
    failed.state.classError = true;
    await failed.flush();
    assert.equal(failed.calls.students.length, 0);
    assert.match(failed.text(), /Unable to load classes/);
  });

  test(`${label}: standalone teachers fetch owned editing list without school/class API or params`, async (t) => {
    const h = harness(source, name, { _id: "owner", role: "teacher" }); t.after(() => h.close());
    await h.flush();
    assert.equal(h.calls.classes, 0);
    assert.deepEqual(h.calls.students[0], { editingOnly: true, search: "", page: 1, limit: 25 });
    assert.deepEqual(h.options(), []);
    assert.match(h.text(), /Student standalone/);
  });

  test(`${label}: auth loading blocks requests and changing tenants clears old data`, async (t) => {
    const h = harness(source, name); t.after(() => h.close());
    h.state.loading = true;
    await h.flush();
    assert.equal(h.calls.classes, 0);
    assert.equal(h.calls.students.length, 0);
    h.state.loading = false; h.render(); await h.flush();
    h.select("a"); await h.flush();
    h.state.user = { _id: "other", role: "teacher", institutionId: "foreign" };
    h.render(); await h.flush();
    assert.doesNotMatch(h.text(), /Student a/);
    assert.equal(h.calls.students.length, 1);
  });

  test(`${label}: revisiting class, search and page serves the same scope instantly for two minutes`, async (t) => {
    const h = harness(source, name); t.after(() => h.close());
    await h.flush(); h.select("a"); await h.flush();
    h.select("b"); await h.flush();
    h.select("a"); h.render();
    assert.match(h.text(), /Student a/);
    await h.flush();
    assert.equal(h.calls.students.length, 2);
    h.search("alice"); await h.flush();
    h.search(""); h.render();
    assert.match(h.text(), /Student a/);
    await h.flush();
    assert.equal(h.calls.students.length, 3);
    h.find((node) => node.type === "Button" && text(node) === "Next").props.onClick(); await h.flush();
    h.find((node) => node.type === "Button" && text(node) === "Previous").props.onClick(); await h.flush();
    assert.equal(h.calls.students.length, 4);
    assert.equal(h.calls.classes, 1);
    const key = ["students", "editing", "owner", "school", "teacher", "a", "", 1, 25, true];
    const query = h.client.getQueryCache().find({ queryKey: key, exact: true });
    assert.equal(query.options.staleTime, 120000);
    assert.equal(query.options.gcTime, 120000);
    query.setState({ dataUpdatedAt: Date.now() - 120001 });
    h.select("b"); await h.flush(); h.select("a"); await h.flush();
    assert.equal(h.calls.students.length, 5, "expired scope refetches");
  });

  test(`${label}: returned photo patches instantly without a roster reload; status invalidates other scopes`, async (t) => {
    const h = harness(source, name); t.after(() => h.close());
    await h.flush(); h.select("b"); await h.flush(); h.select("a"); await h.flush();
    h.find((node) => node.type === "EditStudentModal").props.onUpdated({ id: "a", faceImageUrl: "fixture-new-photo" });
    await h.flush();
    const key = ["students", "editing", "owner", "school", "teacher", "a", "", 1, 25, true];
    assert.equal(h.client.getQueryData(key).students[0].faceImageUrl, "fixture-new-photo");
    assert.equal(h.client.getQueryData(key).count, 30);
    assert.equal(h.calls.students.length, 2);
    h.find((node) => node.type === "Button" && ["Deactivate", "Suspend"].includes(text(node))).props.onClick();
    await h.flush();
    assert.equal(h.client.getQueryData(key).students[0].active, false);
    const other = h.client.getQueryCache().find({ queryKey: [...key.slice(0, 5), "b", "", 1, 25, true], exact: true });
    assert.equal(other.state.isInvalidated, true);
    assert.equal(h.calls.students.length, 2);
    h.select("b"); await h.flush();
    assert.equal(h.calls.students.length, 3);
  });
}
