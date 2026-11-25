import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Linter } from "eslint";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import { isCurrentPortalSessionError, setStudentPortalToken, studentPortalHeaders } from "./studentPortalSession.js";

test("portal token is scoped to portal, report, and feedback requests and cleared at logout", () => {
  setStudentPortalToken("offline-token");
  for (const path of ["/portal/student/a/performance", "/sms-results/report-card/a", "/feedback"]) {
    assert.deepEqual(studentPortalHeaders(path), { "X-Student-Portal-Token": "offline-token" });
  }
  for (const path of ["/institution/staff", "/subjects", "/feedback/other", "https://other.test/portal/"]) {
    assert.deepEqual(studentPortalHeaders(path), {});
  }
  setStudentPortalToken("");
  assert.deepEqual(studentPortalHeaders("/portal/student/a/performance"), {});
});

test("expiry affects only the active portal session, not staff or stale requests", () => {
  const error = (token, status = 401) => ({ response: { status }, config: { headers: { "X-Student-Portal-Token": token } } });
  setStudentPortalToken("session-one");
  assert.equal(isCurrentPortalSessionError(error("session-one")), true);
  assert.equal(isCurrentPortalSessionError(error(undefined)), false);
  assert.equal(isCurrentPortalSessionError(error("session-one", 403)), false);
  setStudentPortalToken("session-two");
  assert.equal(isCurrentPortalSessionError(error("session-one")), false);
  assert.equal(isCurrentPortalSessionError(error("session-two")), true);
  setStudentPortalToken("");
  assert.equal(isCurrentPortalSessionError(error("session-two")), false);
});

test("portal transport and provider pass targeted syntax, identifier, and hook checks offline", async () => {
  const linter = new Linter();
  for (const page of ["./axios.js", "./StudentPortalProvider.jsx", "./studentPortalSession.js"]) {
    const source = await readFile(new URL(page, import.meta.url), "utf8");
    const messages = linter.verify(source, [{
      files: ["**/*.{js,jsx}"],
      languageOptions: { ecmaVersion: "latest", sourceType: "module", globals: globals.browser,
        parserOptions: { ecmaFeatures: { jsx: true } } },
      plugins: { "react-hooks": reactHooks },
      rules: {
        "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
        "no-undef": "error", "react-hooks/rules-of-hooks": "error", "react-hooks/exhaustive-deps": "warn",
      },
    }], { filename: page.slice(2) });
    assert.deepEqual(messages, [], page);
  }
});
