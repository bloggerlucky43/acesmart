import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { parse } from "espree";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { STUDENT_EDITOR_CACHE_MS } from "../src/libs/studentEditorCache.js";

const { transformSync } = createRequire(import.meta.url)("esbuild");
const source = readFileSync(new URL("../src/components/sms/EditStudentModal.jsx", import.meta.url), "utf8");
const tree = parse(source, { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true }, range: true });
const isolated = tree.body.filter((node) => !["ImportDeclaration", "ExportDefaultDeclaration"].includes(node.type))
  .map((node) => source.slice(...node.range)).join("\n");
const compiled = transformSync(isolated, { loader: "jsx", jsxFactory: "jsx", target: "es2022" }).code;
const nodes = (value) => Array.isArray(value) ? value.flatMap(nodes) : !value || typeof value !== "object" ? [] : [value, ...nodes(value.props?.children)];
const text = (value) => Array.isArray(value) ? value.map(text).join("") : value && typeof value === "object"
  ? text(value.props?.children) : value == null || value === false ? "" : String(value);
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };

function harness(t) {
  const client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity, retry: false } } });
  const user = { id: "owner", role: "teacher", institutionId: "school" };
  const classKey = ["student-editor-classes", "owner", "school", "teacher"];
  client.setQueryData(classKey, { success: true, data: [{ id: "a", institutionId: "school", formTeacherId: "owner", name: "Class A" }] });
  const state = { user, compression: null, upload: null };
  const calls = { compress: [], save: [], updated: [], closed: 0, created: [], revoked: [], toast: [], classes: 0 };
  const props = { isOpen: true, student: { id: "s1", studentId: "SCH/1", classArmId: "a", institutionId: "school", firstName: "Alice", faceImageUrl: "original-photo" },
    onClose: () => { calls.closed++; }, onUpdated: (student) => calls.updated.push(student) };
  const hooks = [];
  let cursor = 0, dirty = true, rendered, effects = [];
  const context = {
    jsx: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useState(initial) {
      const index = cursor++;
      if (!hooks[index]) hooks[index] = { value: initial };
      return [hooks[index].value, (next) => { hooks[index].value = typeof next === "function" ? next(hooks[index].value) : next; dirty = true; }];
    },
    useRef(initial) { const index = cursor++; if (!hooks[index]) hooks[index] = { current: initial }; return hooks[index]; },
    useEffect(callback, deps) {
      const index = cursor++;
      if (!hooks[index]?.deps || deps.some((value, i) => !Object.is(value, hooks[index].deps[i]))) {
        const cleanup = hooks[index]?.cleanup;
        hooks[index] = { deps };
        effects.push(() => { cleanup?.(); hooks[index].cleanup = callback(); });
      }
    },
    useQuery(options) {
      const index = cursor++;
      if (!hooks[index]) { const observer = new QueryObserver(client, options); hooks[index] = { observer, unsubscribe: observer.subscribe(() => { dirty = true; }) }; }
      else hooks[index].observer.setOptions(options);
      return hooks[index].observer.getOptimisticResult(options);
    },
    useAuth: () => ({ user: state.user, loading: false }), STUDENT_EDITOR_CACHE_MS,
    getClassArmsApi: async () => { calls.classes++; assert.fail("Fresh scoped editor classes must be reused by the modal"); },
    imageCompression: async (file, options) => { calls.compress.push({ file, options }); return state.compression ? state.compression.promise : new Blob(["fixture-jpeg"], { type: "image/jpeg" }); },
    updateStudentApi: async (id, formData, options) => { calls.save.push({ id, formData, options }); return state.upload ? state.upload.promise : { success: true, student: { ...props.student, faceImageUrl: "stored-photo" } }; },
    toaster: { create: (value) => calls.toast.push(value) }, File, Blob, FormData, AbortController,
    URL: { createObjectURL: (file) => { const url = `blob:fixture-${calls.created.length}`; calls.created.push({ file, url }); return url; }, revokeObjectURL: (url) => calls.revoked.push(url) },
  };
  for (const node of tree.body.filter((node) => node.type === "ImportDeclaration")) {
    for (const specifier of node.specifiers) if (!(specifier.local.name in context)) context[specifier.local.name] = specifier.local.name;
  }
  const Component = new Function(...Object.keys(context), `${compiled}\nreturn EditStudentModal;`)(...Object.values(context));
  const render = () => { cursor = 0; dirty = false; rendered = Component(props); const pending = effects; effects = []; pending.forEach((fn) => fn()); };
  const h = {
    state, calls, props, render,
    find(predicate) { return nodes(rendered).find(predicate); },
    text() { return text(rendered); },
    async flush() { for (let i = 0; i < 5; i++) { if (dirty) render(); await new Promise(setImmediate); } if (dirty) render(); },
    file(file = new File(["fixture-png"], "headshot.png", { type: "image/png" })) {
      return this.find((node) => node.type === "input" && node.props.type === "file").props.onChange({ target: { files: [file], value: "fixture" } });
    },
    submit() { return this.find((node) => node.type === "form").props.onSubmit({ preventDefault() {} }); },
    preview() { return this.find((node) => node.type === "img")?.props.src; },
  };
  t.after(() => { hooks.forEach((hook) => { hook.cleanup?.(); hook.unsubscribe?.(); }); client.clear(); });
  return h;
}

test("Save is disabled and guarded synchronously until bounded JPEG processing finishes", async (t) => {
  const h = harness(t); await h.flush();
  h.state.compression = deferred();
  const processing = h.file();
  await h.submit();
  assert.equal(h.calls.save.length, 0, "Enter/submit during processing cannot omit the selected photo");
  await h.flush();
  assert.equal(h.find((node) => node.type === "Button" && node.props.type === "submit").props.disabled, true);
  assert.match(h.text(), /Preparing photo/);
  const options = h.calls.compress[0].options;
  assert.equal(options.maxSizeMB, 0.25);
  assert.equal(options.maxWidthOrHeight, 600);
  assert.equal(options.fileType, "image/jpeg");
  assert.equal(options.useWebWorker, true);
  h.state.compression.resolve(new Blob(["fixture-jpeg"], { type: "image/jpeg" })); await processing; await h.flush();
  assert.equal(h.find((node) => node.type === "Button" && node.props.type === "submit").props.disabled, false);
  await h.submit(); await h.flush();
  const photo = h.calls.save[0].formData.get("face");
  assert.equal(photo.type, "image/jpeg"); assert.equal(photo.name, "headshot.jpg");
  assert.equal(h.calls.updated[0].faceImageUrl, "stored-photo");
  assert.equal(h.calls.closed, 1);
  assert.equal(h.calls.classes, 0);
  assert.ok(h.find((node) => node.type === "StudentAcademicSection"), "academic section remains intact");
});

test("replacement, student switching, closing and unmounting discard late compression and clean URLs", async (t) => {
  const h = harness(t); await h.flush();
  await h.file(); await h.flush(); const first = h.preview();
  const old = deferred(); h.state.compression = old;
  const processing = h.file(); await h.flush();
  assert.ok(h.calls.revoked.includes(first));
  h.props.student = { ...h.props.student, id: "s2", faceImageUrl: "student-two" }; h.render(); await h.flush();
  assert.equal(h.calls.compress.at(-1).options.signal.aborted, true);
  old.resolve(new Blob(["old"], { type: "image/jpeg" })); await processing; await h.flush();
  assert.equal(h.preview(), "student-two");
  const closed = deferred(); h.state.compression = closed;
  const pending = h.file(); h.props.isOpen = false; h.render(); await h.flush();
  closed.resolve(new Blob(["late"], { type: "image/jpeg" })); await pending; await h.flush();
  assert.equal(h.calls.created.length, 1);
  assert.equal(h.calls.toast.length, 0);
});

test("latest file selection wins even when earlier compression resolves last", async (t) => {
  const h = harness(t); await h.flush();
  const old = deferred(); h.state.compression = old; const first = h.file();
  const current = deferred(); h.state.compression = current; const second = h.file(new File(["new"], "new.jpg", { type: "image/jpeg" }));
  assert.equal(h.calls.compress[0].options.signal.aborted, true);
  current.resolve(new Blob(["current"], { type: "image/jpeg" })); await second; await h.flush();
  old.resolve(new Blob(["stale"], { type: "image/jpeg" })); await first; await h.flush();
  await h.submit();
  assert.equal(h.calls.save[0].formData.get("face").name, "new.jpg");
});

test("actual upload progress distinguishes sent bytes from server saving, and duplicate saves are blocked", async (t) => {
  const h = harness(t); await h.flush(); await h.file(); await h.flush();
  h.state.upload = deferred(); const saving = h.submit(); await h.submit(); await h.flush();
  assert.equal(h.calls.save.length, 1);
  const { onUploadProgress } = h.calls.save[0].options;
  assert.match(h.text(), /Uploading photo\.\.\./);
  onUploadProgress({ loaded: 0.999, total: 1 }); await h.flush();
  assert.match(h.text(), /99%/); assert.doesNotMatch(h.text(), /Upload sent/);
  onUploadProgress({ loaded: 1, total: 1 }); await h.flush();
  assert.match(h.text(), /Upload sent\. Saving changes/);
  assert.equal(h.calls.closed, 0);
  h.state.upload.resolve({ success: true, student: { ...h.props.student, faceImageUrl: "returned-photo" } }); await saving;
  assert.equal(h.calls.updated[0].faceImageUrl, "returned-photo");
  assert.equal(h.calls.closed, 1);
});

test("late save responses and progress never affect a switched actor/student", async (t) => {
  const h = harness(t); await h.flush(); await h.file(); await h.flush();
  h.state.upload = deferred(); const saving = h.submit(); await h.flush();
  h.state.user = { ...h.state.user, id: "other" }; h.render(); await h.flush();
  assert.equal(h.calls.save[0].options.signal.aborted, true);
  h.calls.save[0].options.onUploadProgress({ loaded: 1, total: 1 }); await h.flush();
  h.state.upload.resolve({ success: true, student: { id: "s1", faceImageUrl: "stale-photo" } }); await saving; await h.flush();
  assert.equal(h.calls.updated.length, 0); assert.equal(h.calls.closed, 0);
  assert.doesNotMatch(h.text(), /Upload sent/);
});

test("unsupported files and processing failures leave Save usable without sending a bad upload", async (t) => {
  const h = harness(t); await h.flush();
  await h.file(new File(["gif"], "photo.gif", { type: "image/gif" }));
  assert.equal(h.calls.compress.length, 0);
  const failed = deferred(); h.state.compression = failed; const processing = h.file(); failed.reject(new Error("fixture failure"));
  await processing; await h.flush();
  assert.equal(h.find((node) => node.type === "Button" && node.props.type === "submit").props.disabled, false);
  assert.equal(h.calls.save.length, 0);
  assert.match(h.calls.toast.at(-1).title, /processing failed/);
});

test("student API helper passes upload progress and abort signals without loading real API modules", async () => {
  const apiSource = readFileSync(new URL("../src/api-endpoint/student/students.js", import.meta.url), "utf8");
  const body = apiSource.replace(/^import .*;\r?\n/gm, "").replace(/^export /gm, "");
  const calls = [];
  const api = Object.fromEntries(["get", "put", "post"].map((method) => [method, async (...args) => { calls.push({ method, args }); return { data: { success: true } }; }]));
  const { fetchStudent, updateStudentApi, uploadStudentFaceApi } = new Function("api", "toaster", `${body}\nreturn { fetchStudent, updateStudentApi, uploadStudentFaceApi };`)(api, { create() {} });
  const signal = new AbortController().signal, onUploadProgress = () => {};
  await fetchStudent({ classArmId: "a" }, { signal });
  await updateStudentApi("s1", "fixture-form", { signal, onUploadProgress });
  await uploadStudentFaceApi("s1", "fixture-form", { signal, onUploadProgress });
  assert.equal(calls[0].args[1].signal, signal);
  for (const call of calls.slice(1)) {
    assert.equal(call.args[2].signal, signal); assert.equal(call.args[2].onUploadProgress, onUploadProgress);
    assert.equal(call.args[2].withCredentials, true);
  }
  await updateStudentApi("s1", "fixture-form");
  assert.equal(calls.at(-1).args[2].onUploadProgress, undefined, "existing callers remain supported");
});
