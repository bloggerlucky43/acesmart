const MARK_FIELDS = ["caScore1", "caScore2", "assignmentScore", "examScore", "totalScore"];

const markNumber = (value) => {
  if (value == null || (typeof value === "string" && !value.trim())) return 0;
  if (typeof value === "string") {
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim())) return NaN;
  } else if (typeof value !== "number") {
    return NaN;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
};

// Display-only: never mutate results or reuse this for grading/approval writes.
export const getReportCardDisplay = (results = [], summary = {}) => {
  const visibleResults = results.filter((result) =>
    !MARK_FIELDS.every((field) => markNumber(result[field]) === 0));
  const total = visibleResults.reduce((sum, result) => sum + markNumber(result.totalScore), 0);
  const totalScore = Number.isFinite(total) ? total : null;
  return {
    results: visibleResults,
    summary: {
      ...summary,
      totalSubjects: visibleResults.length,
      totalScore,
      averageScore: totalScore === null ? null : visibleResults.length
        ? Number((totalScore / visibleResults.length).toFixed(1)) : 0,
    },
  };
};
