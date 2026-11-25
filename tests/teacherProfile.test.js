import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { transformSync } from "esbuild";
import { MASTER_NIGERIAN_SUBJECTS, filterSubjects } from "../src/constants/subjectsData.js";

const require = createRequire(import.meta.url);
const noop = () => {};

// Evaluate only the owned component, replacing every app/API dependency with an offline mock.
const loadComponent = (file, state = {}) => {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  const { code } = transformSync(source, { loader: "jsx", format: "cjs", jsx: "automatic" });
  const module = { exports: {} };
  const dependencies = new Map();
  const mockRequire = (specifier) => {
    if (specifier === "react/jsx-runtime") return require(specifier);
    if (specifier === "react") return {
      useState: (initial) => [initial === false ? Boolean(state.mounted) : initial, noop],
      useEffect: noop,
      Suspense: "Suspense",
    };
    if (specifier.endsWith("/libs/AuthProvider")) return {
      AuthProvider: "AuthProvider", useAuth: () => ({ user: state.user, loading: state.loading }),
    };
    if (specifier === "@tanstack/react-query") return {
      useQuery: (options) => {
        state.queryOptions = options;
        return { data: state.data, isPending: state.isPending, error: state.error, refetch: noop };
      },
    };
    if (specifier.endsWith("/institution/teachingAssignments")) return {
      getMyTeachingAssignmentsApi: async () => state.response,
    };
    if (specifier === "@chakra-ui/react") return {
      ...Object.fromEntries(["Box", "Button", "Flex", "Icon", "SimpleGrid", "Text", "Badge"].map((name) => [name, name])),
      useBreakpointValue: () => Boolean(state.mobile),
    };
    if (specifier === "react-router-dom") return {
      Routes: "Routes", Route: "Route", Navigate: "Navigate", NavLink: "NavLink", useNavigate: () => state.navigate || noop,
    };
    if (!dependencies.has(specifier)) dependencies.set(specifier, new Proxy({ __esModule: true, default: specifier }, {
      get: (target, name) => name in target ? target[name] : `${specifier}:${String(name)}`,
    }));
    return dependencies.get(specifier);
  };
  new Function("require", "module", "exports", code)(mockRequire, module, module.exports);
  return module.exports;
};

const elements = (tree) => {
  if (Array.isArray(tree)) return tree.flatMap(elements);
  if (!tree || typeof tree !== "object" || !tree.props) return [];
  return [tree, ...elements(tree.props.children)];
};
const text = (tree) => {
  if (Array.isArray(tree)) return tree.map(text).join(" ");
  if (tree == null || typeof tree === "boolean") return "";
  if (typeof tree !== "object") return String(tree);
  return text(tree.props?.children);
};
const teacher = { _id: "teacher-id", role: "teacher", institutionId: "school-id" };
const classAssignment = { id: "class-id", name: "JSS 1 A" };
const subjectAssignment = {
  classArmId: "class-id", subjectId: "subject-id",
  ClassArm: { name: "JSS 2 B" }, Subject: { name: "Livestock Farming" },
};

test("all three teacher routes wait for initial auth revalidation and ongoing loading", () => {
  for (const mounted of [false, true]) {
    const state = { mounted, loading: mounted, user: teacher };
    const { default: Home } = loadComponent("src/pages/Home.jsx", state);
    const routes = elements(Home()).filter((element) => ["/teacher/profile", "/teacher/report-cards", "/teacher/broadsheet"].includes(element.props.path));
    assert.equal(routes.length, 3);
    for (const route of routes) {
      const guard = route.props.element;
      assert.equal(guard.type(guard.props).type, "../components/ui/pageloader");
    }
  }
});

test("teacher guards deny unauthenticated/student/parent accounts and preserve existing admin roles", () => {
  for (const role of [undefined, "student", "parent", "teacher", "institution_admin", "institution", "admin", "superadmin", "platform_admin"]) {
    const state = { mounted: true, loading: false, user: role ? { role } : null };
    const { default: Home } = loadComponent("src/pages/Home.jsx", state);
    const routes = elements(Home()).filter((element) => ["/teacher/profile", "/teacher/report-cards", "/teacher/broadsheet"].includes(element.props.path));
    for (const route of routes) {
      const guard = route.props.element;
      const result = guard.type(guard.props);
      if (!role || ["student", "parent"].includes(role)) {
        assert.equal(result.type, "Navigate");
        assert.equal(result.props.to, "/login");
        assert.equal(result.props.replace, true);
      } else assert.equal(result, guard.props.children);
    }
  }
});

test("teaching status derives exclusively from actual class and class-subject assignments", () => {
  for (const [classes, subjectAssignments, status] of [
    [[], [], "Not Assigned"], [[classAssignment], [], "Class Teacher"],
    [[], [subjectAssignment], "Subject Teacher"], [[classAssignment], [subjectAssignment], "Both"],
  ]) {
    const state = { user: { ...teacher, designation: "Class Teacher", teachingRole: "Both" }, data: { session: "2026/2027", classes, subjectAssignments } };
    const { default: Assignments } = loadComponent("src/components/teacher/TeachingAssignments.jsx", state);
    const tree = Assignments();
    assert.ok(elements(tree).some((element) => element.type === "Badge" && text(element) === status));
    assert.match(text(tree), /Current Session:\s+2026\/2027/);
    if (subjectAssignments.length) assert.match(text(tree), /Livestock Farming.*JSS 2 B/);
    if (classes.length) assert.match(text(tree), /JSS 1 A/);
    assert.ok(!elements(tree).some((element) => ["form", "Input", "Select"].includes(element.type)));
  }
});

test("assignment loading and error are not incorrectly displayed as Not Assigned", () => {
  for (const extra of [{ isPending: true }, { loading: true }, { error: new Error("Offline mock failure") }]) {
    const state = { user: teacher, ...extra };
    const { default: Assignments } = loadComponent("src/components/teacher/TeachingAssignments.jsx", state);
    const tree = Assignments();
    assert.doesNotMatch(text(tree), /Not Assigned/);
    assert.ok(elements(tree).some((element) => element.props.role === (extra.error ? "alert" : "status")));
    if (extra.loading) assert.equal(state.queryOptions.enabled, false);
  }
});

test("unlinked teacher has an explicit admin-enrollment state and does not fetch assignments", () => {
  const state = { user: { role: "teacher" } };
  const { default: Assignments } = loadComponent("src/components/teacher/TeachingAssignments.jsx", state);
  assert.match(text(Assignments()), /Not Assigned.*not linked to a school/);
  assert.equal(state.queryOptions.enabled, false);
});

test("assignment query uses self-service read endpoint only and rejects failed responses", async () => {
  const state = { user: teacher, response: { success: true, data: { classes: [], subjectAssignments: [] } } };
  const { default: Assignments } = loadComponent("src/components/teacher/TeachingAssignments.jsx", state);
  Assignments();
  assert.deepEqual(state.queryOptions.queryKey, ["teaching-assignments", teacher._id, teacher.institutionId]);
  assert.equal(state.queryOptions.enabled, true);
  assert.equal(await state.queryOptions.queryFn(), state.response.data);
  state.response = { success: false, message: "Mock rejection" };
  await assert.rejects(state.queryOptions.queryFn(), /Mock rejection/);
});

test("profile uses safe field allowlist and both existing responsive layouts", () => {
  for (const mobile of [false, true]) {
    const state = { mobile, user: { ...teacher, name: "Mock Educator", email: "mock@example.invalid", token: "DO_NOT_RENDER_TOKEN", password: "DO_NOT_RENDER_PASSWORD", securityPin: "DO_NOT_RENDER_PIN" } };
    const { default: Profile } = loadComponent("src/pages/teacher/TeacherProfile.jsx", state);
    const tree = Profile();
    assert.equal(tree.type, mobile ? "../../mobile/constant/mobilelayout" : "../../constants/dashboardlayout");
    assert.match(text(tree), /Mock Educator/);
    assert.doesNotMatch(text(tree), /DO_NOT_RENDER/);
    assert.ok(elements(tree).some((element) => element.type === "../../components/teacher/TeachingAssignments"));
    assert.ok(!elements(tree).some((element) => ["form", "Input", "Select"].includes(element.type)));
  }
});

test("dashboard exposes profile on desktop and mobile and mobile navigation includes profile", () => {
  for (const mobile of [false, true]) {
    let destination;
    const state = { mobile, user: teacher, navigate: (path) => { destination = path; } };
    const { default: Dashboard } = loadComponent("src/pages/teacher/dashboard.jsx", state);
    const button = elements(Dashboard()).find((element) => element.type === "Button" && /My Profile/.test(text(element)));
    assert.ok(button);
    button.props.onClick();
    assert.equal(destination, "/teacher/profile");
  }
  const { default: Sidebar } = loadComponent("src/mobile/component/MobileSidebar.jsx", { user: teacher });
  assert.ok(elements(Sidebar({ onClose: noop })).some((element) => element.props.to === "/teacher/profile"));
});

test("both new subjects remain distinct from the existing subjects in shared and legacy catalogs", () => {
  const { SUBJECTS_LIST } = loadComponent("src/components/teacher/exam/addExam.jsx");
  for (const name of ["Citizenship Education", "Livestock Farming", "Civic Education", "Animal Husbandry"]) {
    assert.equal(MASTER_NIGERIAN_SUBJECTS.filter((subject) => subject.name === name).length, 1);
  }
  for (const [name, code] of [["Citizenship Education", "CTE"], ["Livestock Farming", "LVF"]]) {
    assert.ok(SUBJECTS_LIST.includes(name));
    assert.equal(filterSubjects(MASTER_NIGERIAN_SUBJECTS, code)[0].name, name);
  }
});
