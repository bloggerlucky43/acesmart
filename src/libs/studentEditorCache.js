export const STUDENT_EDITOR_CACHE_MS = 120000;
export const STUDENT_EDITOR_PAGE_SIZE = 25;
export const STUDENT_EDITOR_CACHE_LIMIT = 40;

export function trimStudentEditorCache(client, now = Date.now()) {
  const queries = client.getQueryCache().findAll({ predicate: (query) =>
    query.queryKey[0] === "student-editor-classes" ||
    (query.queryKey[0] === "students" && query.queryKey[1] === "editing") });
  let remaining = queries.length;
  for (const query of queries.sort((a, b) => a.state.dataUpdatedAt - b.state.dataUpdatedAt)) {
    if (query.getObserversCount() || query.state.fetchStatus === "fetching") continue;
    if (remaining > STUDENT_EDITOR_CACHE_LIMIT || now - query.state.dataUpdatedAt >= STUDENT_EDITOR_CACHE_MS) {
      client.removeQueries({ queryKey: query.queryKey, exact: true });
      remaining--;
    }
  }
}

export function updateStudentEditorCache(client, prefix, queryKey, student, deleted = false) {
  // Cancel old reads before patching so a late roster cannot undo a successful write.
  void client.cancelQueries({ queryKey: prefix });
  void client.invalidateQueries({ queryKey: prefix, refetchType: "none" });
  const current = client.getQueryData(queryKey);
  const previous = current?.students?.find((row) => row.id === student?.id);
  if (!previous) return;
  const merged = { ...previous, ...student };
  const moved = merged.classArmId !== previous.classArmId;
  const renamed = ["firstName", "lastName", "studentId"].some((field) => merged[field] !== previous[field]);
  const needsRoster = deleted || moved || (renamed && Boolean(queryKey[6]?.trim()));
  const remove = deleted || (moved && Boolean(queryKey[3]));
  const count = Math.max(0, current.count - (remove ? 1 : 0));
  const totalPages = Math.ceil(count / queryKey[8]);
  client.setQueryData(queryKey, {
    ...current, count, totalPages,
    students: remove ? current.students.filter((row) => row.id !== student.id)
      : current.students.map((row) => row.id === student.id ? merged : row),
  });
  if (needsRoster) {
    // Moves, deletes and search membership changes need a server count/page refill.
    void client.invalidateQueries({ queryKey, exact: true });
  }
  trimStudentEditorCache(client);
  return remove ? Math.max(1, Math.min(queryKey[7], totalPages || 1)) : queryKey[7];
}
