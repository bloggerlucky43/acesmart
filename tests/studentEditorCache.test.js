import test from "node:test";
import assert from "node:assert/strict";
import { QueryClient } from "@tanstack/react-query";
import { STUDENT_EDITOR_CACHE_MS, STUDENT_EDITOR_CACHE_LIMIT, trimStudentEditorCache, updateStudentEditorCache } from "../src/libs/studentEditorCache.js";

const key = ["students", "editing", "owner", "school", "teacher", "class-a", "", 1, 25, true];
const fixture = () => ({ success: true, students: [{ id: "s1", classArmId: "class-a", firstName: "alice", active: true, faceImageUrl: "old" }], count: 26, page: 1, limit: 25, totalPages: 2 });
const clientFor = (t) => {
  const client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity, retry: false } } });
  t.after(() => client.clear());
  return client;
};

test("two-minute memory expiry removes only expired inactive editor cache entries", (t) => {
  const client = clientFor(t);
  const now = Date.now();
  client.setQueryData(key, fixture(), { updatedAt: now - STUDENT_EDITOR_CACHE_MS + 1 });
  trimStudentEditorCache(client, now);
  assert.ok(client.getQueryData(key));
  trimStudentEditorCache(client, now + 1);
  assert.equal(client.getQueryData(key), undefined);
});

test("editor cache is bounded without removing unrelated application queries", (t) => {
  const client = clientFor(t);
  const now = Date.now();
  client.setQueryData(["unrelated"], { keep: true });
  for (let page = 1; page <= 55; page++) client.setQueryData([...key.slice(0, 7), page, 25, true], fixture(), { updatedAt: now - 100 + page });
  trimStudentEditorCache(client, now);
  assert.equal(client.getQueryCache().findAll({ queryKey: ["students", "editing"] }).length, STUDENT_EDITOR_CACHE_LIMIT);
  assert.deepEqual(client.getQueryData(["unrelated"]), { keep: true });
});

test("actor, role, school, class, search, page, limit and editing flag remain isolated", (t) => {
  const client = clientFor(t);
  const others = [2, 3, 4, 5, 6, 7, 8, 9].map((index) => {
    const other = [...key]; other[index] = index >= 7 ? (index === 9 ? false : 2) : `other-${index}`; return other;
  });
  client.setQueryData(key, fixture());
  for (const other of others) { assert.equal(client.getQueryData(other), undefined); client.setQueryData(other, fixture()); }
  updateStudentEditorCache(client, key.slice(0, 5), key, { id: "s1", faceImageUrl: "new" });
  assert.equal(client.getQueryData(key).students[0].faceImageUrl, "new");
  assert.equal(client.getQueryData(key).count, 26);
  assert.equal(client.getQueryData(key).totalPages, 2);
  for (const other of others) {
    assert.equal(client.getQueryData(other).students[0].faceImageUrl, "old");
    if ([2, 3, 4].some((index) => other[index] !== key[index])) {
      assert.equal(client.getQueryState(other).isInvalidated, false);
    } else assert.equal(client.getQueryState(other).isInvalidated, true);
  }
});

test("deletes and moves adjust current count/page and invalidate source and target lists", (t) => {
  const client = clientFor(t);
  const page2 = [...key]; page2[7] = 2;
  client.setQueryData(page2, fixture());
  client.setQueryData(key, fixture());
  const target = [...key]; target[5] = "class-b"; client.setQueryData(target, fixture());
  const nextPage = updateStudentEditorCache(client, key.slice(0, 5), page2, { id: "s1", classArmId: "class-b" });
  assert.equal(nextPage, 1);
  assert.equal(client.getQueryData(page2).count, 25);
  assert.equal(client.getQueryData(page2).totalPages, 1);
  assert.deepEqual(client.getQueryData(page2).students, []);
  assert.equal(client.getQueryState(target).isInvalidated, true);
  assert.equal(client.getQueryState(page2).isInvalidated, true);
  updateStudentEditorCache(client, key.slice(0, 5), key, { id: "s1" }, true);
  assert.equal(client.getQueryData(key).count, 25);
  assert.deepEqual(client.getQueryData(key).students, []);
});

test("renaming within a search keeps server pagination/count authoritative", (t) => {
  const client = clientFor(t);
  const searchKey = [...key]; searchKey[6] = "alice";
  client.setQueryData(searchKey, fixture());
  updateStudentEditorCache(client, key.slice(0, 5), searchKey, { id: "s1", firstName: "bob" });
  assert.equal(client.getQueryState(searchKey).isInvalidated, true);
});
